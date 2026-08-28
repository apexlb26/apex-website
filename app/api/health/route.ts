import { NextResponse } from "next/server";

/*
 * Liveness probe for the host (Render points its health check here).
 *
 * This deliberately touches nothing - no database, no content read. The site
 * is designed to keep serving the bundled JSON snapshot when MongoDB is
 * unreachable, so a health check that queried MongoDB would take the whole
 * service down for the one failure it is meant to survive: the probe would
 * block on the driver's server-selection timeout, the platform would mark the
 * instance unhealthy, and visitors would get 502s instead of the fallback
 * content that was sitting right there.
 *
 * Use /api/content/version if you want to know whether the database is
 * actually reachable.
 */
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    { ok: true, service: "apex-website", at: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
