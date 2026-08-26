import { NextResponse } from "next/server";
import { getAdminSession } from "@/shared/auth";
import { uploadMedia } from "@/shared/store";
import type { AdminMediaResponse } from "@/shared/types";

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json<AdminMediaResponse>({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const data = await request.formData();
    const file = data.get("file");
    if (!(file instanceof File)) return NextResponse.json<AdminMediaResponse>({ ok: false, error: "No file was provided." }, { status: 400 });
    const result = await uploadMedia(file);
    return NextResponse.json<AdminMediaResponse>({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json<AdminMediaResponse>({ ok: false, error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
  }
}
