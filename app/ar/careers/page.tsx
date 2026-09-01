import type { Metadata } from "next";
import AP_Header from "@/app/components/AP_Header";
import AP_Footer from "@/app/components/AP_Footer";
import AP_CareersSections from "@/app/components/AP_CareersSections";
import AP_PageStructuredData from "@/app/components/AP_PageStructuredData";
import { getCmsContent } from "@/shared/content";
import { buildPageMetadata, localizeFooter, localizeNavigation } from "@/shared/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getCmsContent("ar");
  const page = data.meta.pages?.careers;
  return buildPageMetadata({
    title: page?.title || data.careers.title,
    description: page?.description || data.careers.body,
    path: "/careers",
    locale: "ar",
    arabicAlternate: true,
  });
}

export default async function ArabicCareersPage() {
  const { data } = await getCmsContent("ar");
  const nav = localizeNavigation(data.nav, "ar");
  const footer = localizeFooter(data.footer, "ar");
  const name = data.meta.pages?.careers?.title || data.careers.title;
  const description = data.meta.pages?.careers?.description || data.careers.body;
  return <>
    <AP_PageStructuredData name={name} description={description} path="/ar/careers" type="CollectionPage" locale="ar" />
    <AP_Header labels={data.meta.labels} cta={data.meta.headerCta ?? ""} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} activePath="/ar/careers" />
    <AP_CareersSections locale="ar" />
    <AP_Footer labels={data.meta.labels} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} content={footer} social={data.social} />
  </>;
}

export const dynamic = "force-dynamic";
