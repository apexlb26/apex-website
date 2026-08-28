import { NextResponse } from "next/server";
import { getAdminSession } from "@/shared/auth";
import { listRevisions, restoreRevision } from "@/shared/store";
import { publishContentUpdate } from "@/shared/realtime";
import type { AdminRevisionsResponse, Locale } from "@/shared/types";

/*
 * Publish history. Under the old JSON/GitHub model every publish was a commit,
 * so history and rollback came free from git. Moving to a database would have
 * lost that, so each publish snapshots the locale here instead.
 *
 * A restore republishes the snapshot as a new version rather than rewinding the
 * counter, which keeps the history append-only and makes an unwanted restore
 * itself undoable.
 */

function parseLocale(value: unknown): Locale {
  return value === "ar" ? "ar" : "en";
}

function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status });
}

export async function GET(request: Request) {
  if (!(await getAdminSession())) return fail("Unauthorized", 401);
  const locale = parseLocale(new URL(request.url).searchParams.get("locale"));
  try {
    const revisions = await listRevisions(locale);
    return NextResponse.json<AdminRevisionsResponse>({ ok: true, revisions });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load the history", 500);
  }
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) return fail("Unauthorized", 401);
  try {
    const body = (await request.json()) as { id?: string; locale?: string };
    if (!body.id) return fail("A revision id is required.", 422);

    const result = await restoreRevision(body.id, session.email);
    await publishContentUpdate(parseLocale(body.locale), "restore");
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not restore that version", 500);
  }
}
