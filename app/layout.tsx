import type { Metadata, Viewport } from "next";
import "@/shared/globals.css";
import { getCmsContent } from "@/shared/content";
import { DEFAULT_OG_IMAGE, SITE_URL } from "@/shared/seo";
import AP_PublicOverlays from "@/app/components/AP_PublicOverlays";
import AP_LiveContent from "@/app/components/AP_LiveContent";

export async function generateMetadata(): Promise<Metadata> {
  const { data: content } = await getCmsContent("en");

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: content.meta.title, template: "%s | APEX" },
    description: content.meta.description,
    applicationName: "APEX",
    creator: "APEX",
    publisher: "APEX",
    alternates: { canonical: "/" },
    /* SVG first for sharpness; the PNGs cover browsers that ignore SVG favicons. */
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
      url: SITE_URL,
      siteName: "APEX",
      type: "website",
      images: [{ url: DEFAULT_OG_IMAGE, alt: "APEX intelligent systems" }],
    },
    twitter: {
      card: "summary_large_image",
      title: content.meta.title,
      description: content.meta.description,
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
    category: "technology",
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: content } = await getCmsContent("en");
  const services = content.solutions.pageItems?.length ? content.solutions.pageItems : content.solutions.items;
  const sameAs = [content.social.linkedin, content.social.instagram].filter(
    (value): value is string => Boolean(value && /^https?:\/\//i.test(value)),
  );
  const knowsAbout = [
    ...services.map((service) => service.title),
    ...content.industries.items.map((industry) => industry.title),
  ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "APEX",
        url: SITE_URL,
        logo: `${SITE_URL}/api/assets/logo/apex-logo.svg`,
        description: content.meta.description,
        sameAs,
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
        inLanguage: "en",
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
          },
        })),
      },
      {
        "@type": "Service",
        "@id": `${SITE_URL}/#digital-systems`,
        name: "AI, software, data, and workflow systems",
        provider: { "@id": `${SITE_URL}/#organization` },
        areaServed: "Global",
        description: content.meta.description,
      },
    ],
  };

  return (
    <html lang={content.locale} dir={content.direction}>
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
