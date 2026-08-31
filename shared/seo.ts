import type { Metadata } from "next";

export const SITE_NAME = "APEX";
export const SITE_URL = "https://apexlb.tech";
export const DEFAULT_OG_IMAGE = "/api/assets/hero/apex-stack-v2.jpg";

export type SeoPageType = "WebPage" | "CollectionPage";

export function absoluteUrl(path = "/") {
  return path === "/" ? SITE_URL : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function buildPageMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE, alt: "APEX intelligent systems" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [DEFAULT_OG_IMAGE],
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
