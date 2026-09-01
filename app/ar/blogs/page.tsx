import type { Metadata } from "next";
import AP_Header from "@/app/components/AP_Header";
import AP_Footer from "@/app/components/AP_Footer";
import AP_BlogsSections from "@/app/components/AP_BlogsSections";
import AP_PageStructuredData from "@/app/components/AP_PageStructuredData";
import { getCmsContent } from "@/shared/content";
import { buildPageMetadata, localizeFooter, localizeNavigation } from "@/shared/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getCmsContent("ar");
  const page = data.meta.pages?.blogs;
  return buildPageMetadata({
    title: page?.title || data.blogs.title,
    description: page?.description || data.blogs.body,
    path: "/blogs",
    locale: "ar",
    arabicAlternate: true,
  });
}

export default async function ArabicBlogsPage() {
  const { data } = await getCmsContent("ar");
  const nav = localizeNavigation(data.nav, "ar");
  const footer = localizeFooter(data.footer, "ar");
  const name = data.meta.pages?.blogs?.title || data.blogs.title;
  const description = data.meta.pages?.blogs?.description || data.blogs.body;
  return <>
    <AP_PageStructuredData name={name} description={description} path="/ar/blogs" type="CollectionPage" locale="ar" />
    <AP_Header labels={data.meta.labels} cta={data.meta.headerCta ?? ""} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} activePath="/ar/blogs" />
    <AP_BlogsSections locale="ar" />
    <AP_Footer labels={data.meta.labels} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} content={footer} social={data.social} />
  </>;
}

export const dynamic = "force-dynamic";
