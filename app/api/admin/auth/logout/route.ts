import { NextResponse } from "next/server";
import { clearAdminSession } from "@/shared/auth";
import type { AdminLogoutResponse } from "@/shared/types";

export async function POST() {
  await clearAdminSession();
  return NextResponse.json<AdminLogoutResponse>({ ok: true });
}
