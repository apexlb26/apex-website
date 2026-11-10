import { NextResponse } from "next/server";
import sharp from "sharp";
import { getMedia } from "@/shared/store";

/*
 * Images are stored full-size, so serving them as-is sends megabytes to show a
 * card thumbnail. Raster images are resized to the requested width and
 * re-encoded as WebP, and the result is kept in memory so the database is only
 * hit (and the image only processed) once per size per server process.
 */
const WIDTHS = [480, 800, 1200, 1600];
const CACHE_LIMIT_BYTES = 64 * 1024 * 1024;
const cache = new Map<string, { bytes: Buffer; contentType: string }>();
let cacheBytes = 0;

function remember(key: string, value: { bytes: Buffer; contentType: string }) {
  cache.set(key, value);
  cacheBytes += value.bytes.byteLength;
  for (const [oldKey, old] of cache) {
    if (cacheBytes <= CACHE_LIMIT_BYTES) break;
    cache.delete(oldKey);
    cacheBytes -= old.bytes.byteLength;
  }
}

/*
 * Images are stored in MongoDB as base64. This route decodes them back to
 * bytes and serves a normal image response.
 *
 * Serving here rather than inlining a data: URI into the page matters: the
 * browser caches this URL, revalidates it with an ETag, and the HTML stays
 * small. A data URI would re-send every image on every page render.
 */
export const dynamic = "force-dynamic";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const requested = Number(new URL(request.url).searchParams.get("w"));
  const width = WIDTHS.find((w) => w >= requested) ?? (requested ? WIDTHS[WIDTHS.length - 1] : 0);
  const key = `${id}:${width}`;

  /*
   * The bytes at a given id never change - replacing an image creates a new
   * document with a new id - so the ETag only needs the id, and the response
   * can be cached hard.
   */
  const etag = `"${key}"`;
  const cacheControl = "public, max-age=31536000, immutable";
  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag, "Cache-Control": cacheControl } });
  }

  let served = cache.get(key);
  if (served) {
    // Refresh recency so eviction drops the least recently used entry.
    cache.delete(key);
    cache.set(key, served);
  } else {
    let media: Awaited<ReturnType<typeof getMedia>>;
    try {
      media = await getMedia(id);
    } catch (error) {
      console.error("Media read failed:", error);
      return NextResponse.json({ error: "Image is unavailable" }, { status: 503 });
    }
    if (!media) return NextResponse.json({ error: "Image not found" }, { status: 404 });

    let bytes: Buffer = Buffer.from(media.base64, "base64");
    let contentType = media.contentType;
    const resizable = contentType !== "image/svg+xml" && contentType !== "image/gif";
    if (resizable) {
      try {
        bytes = await sharp(bytes)
          .rotate()
          .resize({ width: width || 1600, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toBuffer();
        contentType = "image/webp";
      } catch (error) {
        console.error("Image resize failed, serving original:", error);
      }
    }
    served = { bytes, contentType };
    remember(key, served);
  }

  const { bytes, contentType } = served;

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(bytes.byteLength),
      "Cache-Control": cacheControl,
      ETag: etag,
      /*
       * An SVG can carry script. These are admin-uploaded, but serving them
       * with an empty CSP and no sniffing means a malicious file cannot run
       * anything even if one is uploaded by mistake.
       */
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
