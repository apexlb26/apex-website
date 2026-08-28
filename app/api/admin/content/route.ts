import { NextResponse } from "next/server";
import { getAdminSession } from "@/shared/auth";
import { ContentConflictError, getContentWithVersion, saveContent } from "@/shared/store";
import { publishContentUpdate } from "@/shared/realtime";
import type {
  AdminContentGetResponse,
  AdminContentUpdateRequest,
  AdminContentUpdateResponse,
  Locale,
  SiteContent,
} from "@/shared/types";

function parseLocale(value: string | null): Locale {
  return value === "ar" ? "ar" : "en";
}

function looksLikeSiteContent(value: unknown): value is SiteContent {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<SiteContent>;
  return Boolean(item.meta && item.hero && item.solutions && item.industries && item.caseStudy && item.method && item.products && item.blogs);
}

export async function GET(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json<AdminContentGetResponse>({ ok: false, error: "Unauthorized" }, { status: 401 });
  const url = new URL(request.url);
  const locale = parseLocale(url.searchParams.get("locale"));
  try {
    const { content, version } = await getContentWithVersion(locale);
    return NextResponse.json<AdminContentGetResponse>({ ok: true, locale, content, version });
  } catch (error) {
    return NextResponse.json<AdminContentGetResponse>({ ok: false, error: error instanceof Error ? error.message : "Could not load content" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json<AdminContentUpdateResponse>({ ok: false, error: "Unauthorized" }, { status: 401 });
  try {
    const body = (await request.json()) as Partial<AdminContentUpdateRequest>;
    const locale = parseLocale(body.locale || "en");
    if (!looksLikeSiteContent(body.content)) {
      return NextResponse.json<AdminContentUpdateResponse>({ ok: false, error: "Content payload is incomplete." }, { status: 422 });
    }

    const result = await saveContent(locale, body.content, {
      expectedVersion: body.expectedVersion,
      updatedBy: session.email,
    });
    // Tell every open page to pull the new content in.
    await publishContentUpdate(locale, "content");
    return NextResponse.json<AdminContentUpdateResponse>({ ok: true, ...result });
  } catch (error) {
    /*
     * A conflict is not a server failure: someone else published while this
     * editor was working. 409 lets the editor offer "reload and reapply"
     * instead of silently overwriting the other person's work.
     */
    if (error instanceof ContentConflictError) {
      return NextResponse.json<AdminContentUpdateResponse>(
        { ok: false, error: error.message, conflictVersion: error.currentVersion },
        { status: 409 },
      );
    }
    return NextResponse.json<AdminContentUpdateResponse>({ ok: false, error: error instanceof Error ? error.message : "Could not publish content" }, { status: 500 });
  }
}
