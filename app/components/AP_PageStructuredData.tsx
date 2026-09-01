import { absoluteUrl, SITE_URL, type SeoPageType } from "@/shared/seo";
import type { Locale } from "@/shared/types";

export default function AP_PageStructuredData({
  name,
  description,
  path,
  type = "WebPage",
  locale = "en",
}: {
  name: string;
  description: string;
  path: string;
  type?: SeoPageType;
  locale?: Locale;
}) {
  const url = absoluteUrl(path);
  const homeUrl = locale === "ar" ? `${SITE_URL}/ar` : SITE_URL;
  const homeName = locale === "ar" ? "الرئيسية" : "Home";
  const isHome = path === "/" || path === "/ar";

  const graph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": type,
        "@id": `${url}#webpage`,
        url,
        name,
        description,
        isPartOf: { "@id": `${SITE_URL}/#website` },
        about: { "@id": `${SITE_URL}/#organization` },
        inLanguage: locale,
        ...(isHome ? {} : { breadcrumb: { "@id": `${url}#breadcrumb` } }),
      },
      ...(!isHome
        ? [
            {
              "@type": "BreadcrumbList",
              "@id": `${url}#breadcrumb`,
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: homeName,
                  item: homeUrl,
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name,
                  item: url,
                },
              ],
            },
          ]
        : []),
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }}
    />
  );
}
