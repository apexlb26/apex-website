import type { Locale, SiteContent, CmsEnvelope } from "@/shared/types";
import en from "./en.json";
import ar from "./ar.json";

/*
 * The JSON imported here is the build-time snapshot. It is only a fallback:
 * the public pages read through the same store the admin publishes to, so a
 * CMS change is visible without a redeploy. If that read fails for any
 * reason the snapshot keeps the site up rather than erroring.
 */
const fallbackContent: Record<Locale, SiteContent> = {
  en: en as unknown as SiteContent,
  ar: ar as unknown as SiteContent,
};

export function normalizeLocale(value?: string | null): Locale {
  return value?.toLowerCase() === "ar" ? "ar" : "en";
}

export function getContent(locale: Locale = "en"): SiteContent {
  return fallbackContent[locale] ?? fallbackContent.en;
}

/*
 * Pages render per request, and in GitHub mode every store read is an API
 * call - without this cache a busy page would exhaust the rate limit. The
 * cache key includes the content version, so publishing invalidates it
 * immediately; the TTL covers processes that did not receive the event
 * (separate serverless instances, for example).
 */
const CACHE_TTL_MS = 30_000;
type CacheEntry = { data: SiteContent; version: string; at: number };
const cache = new Map<Locale, CacheEntry>();

export async function getCmsContent(locale: Locale = "en"): Promise<CmsEnvelope<SiteContent>> {
  const { getContentVersion } = await import("@/shared/realtime");
  const version = getContentVersion();

  const hit = cache.get(locale);
  if (hit && hit.version === version && Date.now() - hit.at < CACHE_TTL_MS) {
    return { data: hit.data, locale, source: "cms" };
  }

  try {
    // Imported lazily so the fallback path stays usable anywhere the Node
    // built-ins the store needs are not available.
    const { getContent: readFromStore } = await import("@/shared/store");
    const data = await readFromStore(locale);
    cache.set(locale, { data, version, at: Date.now() });
    return { data, locale, source: "cms" };
  } catch (error) {
    console.error("Live content read failed; serving the bundled snapshot:", error);
    return { data: getContent(locale), locale, source: "fallback-json" };
  }
}
