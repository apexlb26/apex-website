import type { Metadata } from "next";
import AP_Header from "@/app/components/AP_Header";
import AP_Footer from "@/app/components/AP_Footer";
import AP_Solutions from "@/app/components/AP_Solutions";
import AP_TrustStrip from "@/app/components/AP_TrustStrip";
import AP_CtaBand from "@/app/components/AP_CtaBand";
import AP_PageStructuredData from "@/app/components/AP_PageStructuredData";
import { getCmsContent } from "@/shared/content";
import { buildPageMetadata, localizeFooter, localizeNavigation } from "@/shared/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getCmsContent("ar");
  const page = data.meta.pages?.solutions;
  return buildPageMetadata({
    title: page?.title || data.solutions.pageTitle || data.solutions.title,
    description: page?.description || data.solutions.pageBody || data.solutions.body,
    path: "/solutions",
    locale: "ar",
    arabicAlternate: true,
  });
}

export default async function ArabicSolutionsPage() {
  const { data } = await getCmsContent("ar");
  const nav = localizeNavigation(data.nav, "ar");
  const footer = localizeFooter(data.footer, "ar");
  const name = data.meta.pages?.solutions?.title || data.solutions.pageTitle || data.solutions.title;
  const description = data.meta.pages?.solutions?.description || data.solutions.pageBody || data.solutions.body;
  return <>
    <AP_PageStructuredData name={name} description={description} path="/ar/solutions" type="CollectionPage" locale="ar" />
    <AP_Header labels={data.meta.labels} cta={data.meta.headerCta ?? ""} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} activePath="/ar/solutions" />
    <main><AP_Solutions content={data.solutions} standalone /><AP_TrustStrip trust={data.trust} /><AP_CtaBand mark={data.meta.logoMark} content={data.method} /></main>
    <AP_Footer labels={data.meta.labels} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} content={footer} social={data.social} />
  </>;
}

export const dynamic = "force-dynamic";
