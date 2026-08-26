import type { Metadata, Viewport } from "next";
import "@/shared/globals.css";
import { getCmsContent } from "@/shared/content";
import AP_PublicOverlays from "@/app/components/AP_PublicOverlays";
import AP_LiveContent from "@/app/components/AP_LiveContent";

const siteUrl = "https://apexlb.tech";

export async function generateMetadata(): Promise<Metadata> {
  const { data: content } = await getCmsContent("en");
  return {
    metadataBase: new URL(siteUrl),
    title: { default: content.meta.title, template: "%s | APEX" },
    description: content.meta.description,
    applicationName: "APEX",
    alternates: { canonical: "/" },
    icons: { icon: "/api/assets/logo/icon.svg" },
    openGraph: {
      title: content.meta.title,
      description: content.meta.description,
      url: siteUrl,
      siteName: "APEX",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: content.meta.title,
      description: content.meta.description,
    },
    robots: { index: true, follow: true },
    category: "technology",
  };
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
  colorScheme: "light",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { data: content } = await getCmsContent("en");

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "APEX",
        url: siteUrl,
        logo: `${siteUrl}/api/assets/logo/apex-logo.svg`,
        description: content.meta.description,
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "APEX",
        publisher: { "@id": `${siteUrl}/#organization` },
        inLanguage: "en",
      },
      {
        "@type": "Service",
        "@id": `${siteUrl}/#digital-systems`,
        name: "AI, software, data, and workflow systems",
        provider: { "@id": `${siteUrl}/#organization` },
        areaServed: "Global",
        description: content.meta.description,
      },
    ],
  };

  return (
    <html lang={content.locale} dir={content.direction}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {children}
        <AP_PublicOverlays caseStudy={content.caseStudy} social={content.social} contact={content.contact} />
        <AP_LiveContent />
      </body>
    </html>
  );
}
