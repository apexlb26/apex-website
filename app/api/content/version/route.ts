import { NextResponse } from "next/server";
import { getContentVersion } from "@/shared/realtime";

/*
 * Fallback channel for hosts that cannot hold a WebSocket open (serverless).
 * Clients poll this only when the socket fails to connect.
 */
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    { version: getContentVersion() },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
