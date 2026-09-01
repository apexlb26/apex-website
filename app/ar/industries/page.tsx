import type { Metadata } from "next";
import AP_Header from "@/app/components/AP_Header";
import AP_Footer from "@/app/components/AP_Footer";
import AP_Industries from "@/app/components/AP_Industries";
import AP_CtaBand from "@/app/components/AP_CtaBand";
import AP_PageStructuredData from "@/app/components/AP_PageStructuredData";
import { getCmsContent } from "@/shared/content";
import { buildPageMetadata, localizeFooter, localizeNavigation } from "@/shared/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getCmsContent("ar");
  const page = data.meta.pages?.industries;
  return buildPageMetadata({
    title: page?.title || data.industries.pageTitle || data.industries.title,
    description: page?.description || data.industries.pageBody || data.industries.body,
    path: "/industries",
    locale: "ar",
    arabicAlternate: true,
  });
}

export default async function ArabicIndustriesPage() {
  const { data } = await getCmsContent("ar");
  const nav = localizeNavigation(data.nav, "ar");
  const footer = localizeFooter(data.footer, "ar");
  const name = data.meta.pages?.industries?.title || data.industries.pageTitle || data.industries.title;
  const description = data.meta.pages?.industries?.description || data.industries.pageBody || data.industries.body;
  return <>
    <AP_PageStructuredData name={name} description={description} path="/ar/industries" type="CollectionPage" locale="ar" />
    <AP_Header labels={data.meta.labels} cta={data.meta.headerCta ?? ""} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} activePath="/ar/industries" />
    <main><AP_Industries mark={data.meta.logoMark} content={data.industries} standalone /><AP_CtaBand mark={data.meta.logoMark} content={data.method} /></main>
    <AP_Footer labels={data.meta.labels} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} content={footer} social={data.social} />
  </>;
}

export const dynamic = "force-dynamic";
