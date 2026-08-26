import { NextResponse } from "next/server";
import { getAdminSession } from "@/shared/auth";
import { getContent, saveContent } from "@/shared/store";
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
    const content = await getContent(locale);
    return NextResponse.json<AdminContentGetResponse>({ ok: true, locale, content });
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
    const result = await saveContent(locale, body.content);
    // Tell every open page to pull the new content in.
    publishContentUpdate(locale);
    return NextResponse.json<AdminContentUpdateResponse>({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json<AdminContentUpdateResponse>({ ok: false, error: error instanceof Error ? error.message : "Could not publish content" }, { status: 500 });
  }
}
