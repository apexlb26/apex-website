import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

const MIME: Record<string, string> = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
};

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const root = path.resolve(process.cwd(), "shared", "assets");
  const requested = path.resolve(root, ...segments);

  if (requested !== root && !requested.startsWith(`${root}${path.sep}`)) {
    return NextResponse.json({ error: "Invalid asset path" }, { status: 400 });
  }

  try {
    const data = await fs.readFile(requested);
    const contentType = MIME[path.extname(requested).toLowerCase()] ?? "application/octet-stream";

    /*
     * Assets here keep their URL while their contents can be replaced, so
     * "immutable" would pin a stale copy in browsers for a year. Serve a short
     * cache with revalidation and answer conditional requests with 304 so the
     * bytes only travel when the file actually changed.
     */
    const stat = await fs.stat(requested);
    const etag = `W/"${stat.size}-${Math.floor(stat.mtimeMs)}"`;
    if (_request.headers.get("if-none-match") === etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag, "Cache-Control": "public, max-age=300, must-revalidate" } });
    }

    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300, must-revalidate",
        ETag: etag,
      },
    });
  } catch {
    return NextResponse.json({ error: "Asset not found" }, { status: 404 });
  }
}
