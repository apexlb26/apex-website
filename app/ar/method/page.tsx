import type { Metadata } from "next";
import AP_Header from "@/app/components/AP_Header";
import AP_Footer from "@/app/components/AP_Footer";
import AP_Method from "@/app/components/AP_Method";
import AP_Insights from "@/app/components/AP_Insights";
import AP_CtaBand from "@/app/components/AP_CtaBand";
import AP_PageStructuredData from "@/app/components/AP_PageStructuredData";
import { getCmsContent } from "@/shared/content";
import { buildPageMetadata, localizeFooter, localizeNavigation } from "@/shared/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getCmsContent("ar");
  const page = data.meta.pages?.method;
  return buildPageMetadata({
    title: page?.title || data.method.title,
    description: page?.description || data.method.body,
    path: "/method",
    locale: "ar",
    arabicAlternate: true,
  });
}

export default async function ArabicMethodPage() {
  const { data } = await getCmsContent("ar");
  const nav = localizeNavigation(data.nav, "ar");
  const footer = localizeFooter(data.footer, "ar");
  const name = data.meta.pages?.method?.title || data.method.title;
  const description = data.meta.pages?.method?.description || data.method.body;
  return <>
    <AP_PageStructuredData name={name} description={description} path="/ar/method" locale="ar" />
    <AP_Header labels={data.meta.labels} cta={data.meta.headerCta ?? ""} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} activePath="/ar/method" />
    <main><AP_Method content={data.method} standalone /><AP_Insights blogs={data.blogs} solutions={data.solutions} compact /><AP_CtaBand mark={data.meta.logoMark} content={data.method} /></main>
    <AP_Footer labels={data.meta.labels} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} content={footer} social={data.social} />
  </>;
}

export const dynamic = "force-dynamic";
