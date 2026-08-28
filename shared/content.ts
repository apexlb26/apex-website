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
export const getCmsContent = cache(async (locale: Locale = "en"): Promise<CmsEnvelope<SiteContent>> => {
  try {
    // Imported lazily so the fallback path stays usable anywhere the Node
    // built-ins the driver needs are not available.
    const { getContent: readFromStore } = await import("@/shared/store");
    const data = await readFromStore(locale);
    return { data, locale, source: "cms" };
  } catch (error) {
    console.error("Live content read failed; serving the bundled snapshot:", error);
    return { data: getContent(locale), locale, source: "fallback-json" };
  }
});
