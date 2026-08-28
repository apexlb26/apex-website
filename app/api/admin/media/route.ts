import { NextResponse } from "next/server";
import { getAdminSession } from "@/shared/auth";
import { deleteMedia, listMedia, uploadMedia } from "@/shared/store";
import { publishContentUpdate } from "@/shared/realtime";
import type { AdminMediaListResponse, AdminMediaResponse } from "@/shared/types";

/*
 * The media library. Bytes go into MongoDB base64-encoded; this route never
 * touches the filesystem, so uploads survive a redeploy and work on a
 * read-only host.
 */

function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function GET() {
  if (!(await getAdminSession())) return fail("Unauthorized", 401);
  try {
    const items = await listMedia();
    return NextResponse.json<AdminMediaListResponse>({ ok: true, items });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load the media library", 500);
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json<AdminMediaResponse>({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File)) return NextResponse.json<AdminMediaResponse>({ ok: false, error: "No file was provided." }, { status: 400 });
    const result = await uploadMedia(file, session.email);
    return NextResponse.json<AdminMediaResponse>({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json<AdminMediaResponse>({ ok: false, error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await getAdminSession())) return fail("Unauthorized", 401);
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return fail("An image id is required.", 422);
  try {
    await deleteMedia(id);
    // Any page still pointing at the deleted image should re-render now.
    await publishContentUpdate("en", "media");
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not delete the image", 500);
  }
}
