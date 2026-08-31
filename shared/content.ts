import { cache } from "react";
import type { Locale, SiteContent, CmsEnvelope } from "@/shared/types";
import en from "./en.json";
import ar from "./ar.json";

/*
 * MongoDB is the source of truth. The JSON imported here is only a floor: if
 * the database is unreachable the public site keeps rendering the last shipped
 * snapshot instead of erroring. Nothing writes to these files any more.
 */
const fallbackContent: Record<Locale, SiteContent> = {
  en: en as unknown as SiteContent,
  ar: ar as unknown as SiteContent,
};

export function normalizeLocale(value?: string | null): Locale {
  return value?.toLowerCase() === "ar" ? "ar" : "en";
}

/** The bundled snapshot. Used as the fallback, never as the primary read. */
export function getContent(locale: Locale = "en"): SiteContent {
  return fallbackContent[locale] ?? fallbackContent.en;
}

/*
 * Read straight from MongoDB on every request so a published change is visible
 * at once - there is no TTL to wait out. React's `cache` collapses the repeated
 * calls within a single render (the layout and the screen both ask for it) into
 * one database round trip.
 */
/*
 * Repair nav links that point at a section which does not exist.
 *
 * The nav is CMS data, and it currently carries "/#products", "/#blogs" and
 * "/#careers". Those are standalone pages, not sections of the home page, so
 * the browser lands on "/" and appears to do nothing. Anything that IS a home
 * page section - solutions, industries, case-studies, method - is left alone,
 * so a genuine in-page link still scrolls.
 *
 * This is a shim over bad data. Correct the three Href values in the CMS and
 * it becomes a no-op that can be deleted.
 */
const HOME_SECTION_IDS = new Set(["hero", "top", "solutions", "industries", "case-studies", "method"]);
const STANDALONE_PAGES = new Set(["products", "blogs", "careers"]);

function repairNav<T extends SiteContent>(data: T): T {
  if (!Array.isArray(data?.nav)) return data;
  let changed = false;
  const nav = data.nav.map((item) => {
    const match = /^\/#([a-z0-9-]+)$/.exec(item.href ?? "");
    const slug = match?.[1];
    if (!slug || HOME_SECTION_IDS.has(slug) || !STANDALONE_PAGES.has(slug)) return item;
    changed = true;
    return { ...item, href: `/${slug}` };
  });
  return changed ? { ...data, nav } : data;
}

export const getCmsContent = cache(async (locale: Locale = "en"): Promise<CmsEnvelope<SiteContent>> => {
  try {
    // Imported lazily so the fallback path stays usable anywhere the Node
    // built-ins the driver needs are not available.
    const { getContent: readFromStore } = await import("@/shared/store");
    const data = await readFromStore(locale);
    return { data: repairNav(data), locale, source: "cms" };
  } catch (error) {
    console.error("Live content read failed; serving the bundled snapshot:", error);
    return { data: repairNav(getContent(locale)), locale, source: "fallback-json" };
  }
});
