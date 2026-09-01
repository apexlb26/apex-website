import type { Metadata } from "next";
import type { FooterContent, Locale, NavItem } from "@/shared/types";

export const SITE_NAME = "APEX";
export const SITE_URL = "https://apexlb.tech";
export const DEFAULT_OG_IMAGE = "/api/assets/hero/apex-stack-v2.jpg";
export const BUSINESS_PHONE = "+961 79 453 181";
export const BUSINESS_COUNTRY = "LB";
export const BUSINESS_LOCALITY = process.env.APEX_ADDRESS_LOCALITY?.trim() || "Beirut";
export const BUSINESS_STREET = process.env.APEX_ADDRESS_STREET?.trim() || "";
export const BUSINESS_POSTAL_CODE = process.env.APEX_ADDRESS_POSTAL_CODE?.trim() || "";
export const BUSINESS_REGION = process.env.APEX_ADDRESS_REGION?.trim() || "";
export const BUSINESS_AREA_SERVED = ["LB", "AE", "SA"] as const;
export const BUSINESS_LANGUAGES = ["en", "ar"] as const;

export type SeoPageType = "WebPage" | "CollectionPage";

export function absoluteUrl(path = "/") {
  return path === "/" ? SITE_URL : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function slugifySeo(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function localizedPath(path: string, locale: Locale) {
  if (locale !== "ar") return path || "/";
  if (!path || path === "/") return "/ar";
  return `/ar${path.startsWith("/") ? path : `/${path}`}`;
}


export function localizedHref(href: string, locale: Locale) {
  if (locale !== "ar" || href.startsWith("/ar")) return href;
  if (href.startsWith("/#")) return `/ar${href.slice(1)}`;
  if (/^\/(solutions|industries|method|products|blogs|careers)(?:$|[#?])/.test(href)) return `/ar${href}`;
  return href;
}

export function localizeNavigation(nav: NavItem[], locale: Locale): NavItem[] {
  return nav.map((item) => ({ ...item, href: localizedHref(item.href, locale) }));
}

export function localizeFooter(content: FooterContent, locale: Locale): FooterContent {
  if (locale !== "ar") return content;
  return {
    ...content,
    columns: content.columns?.map((column) => ({
      ...column,
      links: column.links.map((link) => ({ ...link, href: localizedHref(link.href, locale) })),
    })),
    legalLinks: content.legalLinks?.map((link) => ({ ...link, href: localizedHref(link.href, locale) })),
  };
}

export function languageAlternates(path: string, options: { arabic?: boolean } = {}) {
  const english = path || "/";
  const languages: Record<string, string> = {
    en: english,
    "x-default": english,
  };
  if (options.arabic) languages.ar = localizedPath(english, "ar");
  return languages;
}

export function ogImageUrl(title: string, subtitle?: string) {
  const params = new URLSearchParams({ title });
  if (subtitle) params.set("subtitle", subtitle);
  return `/api/og?${params.toString()}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
  locale = "en",
  arabicAlternate = false,
  image,
}: {
  title: string;
  description: string;
  path: string;
  locale?: Locale;
  arabicAlternate?: boolean;
  image?: string;
}): Metadata {
  const canonical = localizedPath(path, locale);
  const url = absoluteUrl(canonical);
  const socialImage = image || ogImageUrl(title, description);

  return {
    title,
    description,
    alternates: {
      canonical,
      ...(arabicAlternate
        ? { languages: languageAlternates(path, { arabic: true }) }
        : {}),
    },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      locale: locale === "ar" ? "ar_LB" : "en_US",
      images: [{ url: socialImage, alt: `${SITE_NAME} - ${title}` }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [socialImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
  };
}

export function validEntityProfileUrl(value?: string | null) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol)) return null;
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = url.pathname.replace(/\/+$/, "");
    if ((host === "linkedin.com" || host === "instagram.com") && !path) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function businessAddressSchema() {
  const address: Record<string, string> = {
    "@type": "PostalAddress",
    addressLocality: BUSINESS_LOCALITY,
    addressCountry: BUSINESS_COUNTRY,
  };
  if (BUSINESS_STREET) address.streetAddress = BUSINESS_STREET;
  if (BUSINESS_REGION) address.addressRegion = BUSINESS_REGION;
  if (BUSINESS_POSTAL_CODE) address.postalCode = BUSINESS_POSTAL_CODE;
  return address;
}

export function businessGeoSchema() {
  const latitude = Number(process.env.APEX_GEO_LATITUDE);
  const longitude = Number(process.env.APEX_GEO_LONGITUDE);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return undefined;
  return { "@type": "GeoCoordinates", latitude, longitude };
}
