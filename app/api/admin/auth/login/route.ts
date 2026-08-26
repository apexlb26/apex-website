import { NextResponse } from "next/server";
import { checkCredentials, setAdminSession } from "@/shared/auth";
import type { AdminLoginRequest, AdminLoginResponse } from "@/shared/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<AdminLoginRequest>;
    if (!body.email || !body.password || !checkCredentials(body.email, body.password)) {
      return NextResponse.json<AdminLoginResponse>({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }
    await setAdminSession(body.email.trim().toLowerCase());
    return NextResponse.json<AdminLoginResponse>({ ok: true });
  } catch {
    return NextResponse.json<AdminLoginResponse>({ ok: false, error: "Invalid sign-in request." }, { status: 400 });
  }
}
