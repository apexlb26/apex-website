import { NextResponse } from "next/server";
import { getMedia } from "@/shared/store";

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

  let media: Awaited<ReturnType<typeof getMedia>>;
  try {
    media = await getMedia(id);
  } catch (error) {
    console.error("Media read failed:", error);
    return NextResponse.json({ error: "Image is unavailable" }, { status: 503 });
  }
  if (!media) return NextResponse.json({ error: "Image not found" }, { status: 404 });

  /*
   * The bytes at a given id never change - replacing an image creates a new
   * document with a new id - so the ETag only needs the id, and the response
   * can be cached hard.
   */
  const etag = `"${id}"`;
  const cacheControl = "public, max-age=31536000, immutable";
  if (request.headers.get("if-none-match") === etag) {
    return new NextResponse(null, { status: 304, headers: { ETag: etag, "Cache-Control": cacheControl } });
  }

  const bytes = Buffer.from(media.base64, "base64");

  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": media.contentType,
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
