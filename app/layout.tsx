import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "@/shared/globals.css";
import { getCmsContent } from "@/shared/content";
import {
  BUSINESS_AREA_SERVED,
  BUSINESS_LANGUAGES,
  BUSINESS_PHONE,
  SITE_URL,
  businessAddressSchema,
  businessGeoSchema,
  languageAlternates,
  ogImageUrl,
  validEntityProfileUrl,
} from "@/shared/seo";
import type { Locale } from "@/shared/types";
import AP_PublicOverlays from "@/app/components/AP_PublicOverlays";
import AP_LiveContent from "@/app/components/AP_LiveContent";

async function requestLocale(): Promise<Locale> {
  const requestHeaders = await headers();
  return requestHeaders.get("x-apex-locale") === "ar" ? "ar" : "en";
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await requestLocale();
  const { data: content } = await getCmsContent(locale);
  const canonical = locale === "ar" ? "/ar" : "/";
  const socialImage = ogImageUrl(content.meta.title, content.meta.description);

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: content.meta.title, template: "%s | APEX" },
    description: content.meta.description,
    applicationName: "APEX",
    creator: "APEX",
    publisher: "APEX",
    alternates: {
      canonical,
      languages: languageAlternates("/", { arabic: true }),
    },
    icons: {
      icon: [
        { url: "/api/assets/logo/icon.svg", type: "image/svg+xml" },
        { url: "/api/assets/logo/icon-32.png", type: "image/png", sizes: "32x32" },
      ],
      apple: { url: "/api/assets/logo/icon-180.png", sizes: "180x180" },
    },
    openGraph: {
      title: content.meta.title,
      description: content.meta.description,
      url: `${SITE_URL}${canonical === "/" ? "" : canonical}`,
      siteName: "APEX",
      type: "website",
      locale: locale === "ar" ? "ar_LB" : "en_US",
      images: [{ url: socialImage, alt: "APEX intelligent systems" }],
    },
    twitter: {
      card: "summary_large_image",
      title: content.meta.title,
      description: content.meta.description,
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
    category: "technology",
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await requestLocale();
  const { data: content } = await getCmsContent(locale);
  const services = content.solutions.pageItems?.length ? content.solutions.pageItems : content.solutions.items;
  const sameAs = [content.social.linkedin, content.social.instagram]
    .map(validEntityProfileUrl)
    .filter((value): value is string => Boolean(value));
  const knowsAbout = [
    ...services.map((service) => service.title),
    ...content.industries.items.map((industry) => industry.title),
  ];
  const geo = businessGeoSchema();

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "ProfessionalService"],
        "@id": `${SITE_URL}/#organization`,
        name: "APEX",
        url: SITE_URL,
        logo: `${SITE_URL}/api/assets/logo/apex-logo.svg`,
        description: content.meta.description,
        telephone: BUSINESS_PHONE,
        address: businessAddressSchema(),
        ...(geo ? { geo } : {}),
        areaServed: [...BUSINESS_AREA_SERVED],
        availableLanguage: [...BUSINESS_LANGUAGES],
        contactPoint: {
          "@type": "ContactPoint",
          telephone: BUSINESS_PHONE,
          contactType: "sales",
          areaServed: [...BUSINESS_AREA_SERVED],
          availableLanguage: [...BUSINESS_LANGUAGES],
        },
        ...(sameAs.length ? { sameAs } : {}),
        knowsAbout,
        hasOfferCatalog: { "@id": `${SITE_URL}/#services` },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: "APEX",
        description: content.meta.description,
        publisher: { "@id": `${SITE_URL}/#organization` },
        inLanguage: [...BUSINESS_LANGUAGES],
      },
      {
        "@type": "OfferCatalog",
        "@id": `${SITE_URL}/#services`,
        name: "APEX services",
        itemListElement: services.map((service) => ({
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.title,
            description: service.body,
            url: `${SITE_URL}/solutions#${service.key}`,
            provider: { "@id": `${SITE_URL}/#organization` },
            areaServed: [...BUSINESS_AREA_SERVED],
            availableLanguage: [...BUSINESS_LANGUAGES],
          },
        })),
      },
      {
        "@type": "Service",
        "@id": `${SITE_URL}/#digital-systems`,
        name: "AI, software, data, and workflow systems",
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: [...BUSINESS_AREA_SERVED],
        availableLanguage: [...BUSINESS_LANGUAGES],
        description: content.meta.description,
      },
    ],
  };

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }}
        />
        {children}
        <AP_PublicOverlays caseStudy={content.caseStudy} social={content.social} contact={content.contact} labels={content.meta.labels} />
        <AP_LiveContent />
      </body>
    </html>
  );
}
