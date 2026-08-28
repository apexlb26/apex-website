import { NextResponse } from "next/server";
import { getAdminSession } from "@/shared/auth";
import { clearDraft, getDraft, saveDraft } from "@/shared/store";
import type { AdminDraftResponse, Locale, SiteContent } from "@/shared/types";

/*
 * Drafts used to live in the editor's own browser (localStorage), so they were
 * lost on a cache clear and invisible to anyone else. They are database rows
 * now: one per locale, shared by whoever is editing.
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
    const draft = await getDraft(locale);
    return NextResponse.json<AdminDraftResponse>({ ok: true, draft });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not load the draft", 500);
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return fail("Unauthorized", 401);
  try {
    const body = (await request.json()) as { locale?: string; content?: SiteContent };
    if (!body.content) return fail("No content to save.", 422);
    const savedAt = await saveDraft(parseLocale(body.locale), body.content, session.email);
    return NextResponse.json({ ok: true, savedAt });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not save the draft", 500);
  }
}

export async function DELETE(request: Request) {
  if (!(await getAdminSession())) return fail("Unauthorized", 401);
  try {
    await clearDraft(parseLocale(new URL(request.url).searchParams.get("locale")));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Could not discard the draft", 500);
  }
}
