import type { Metadata } from "next";
import AP_Header from "@/app/components/AP_Header";
import AP_Footer from "@/app/components/AP_Footer";
import AP_ProductsSections from "@/app/components/AP_ProductsSections";
import AP_PageStructuredData from "@/app/components/AP_PageStructuredData";
import { getCmsContent } from "@/shared/content";
import { buildPageMetadata, localizeFooter, localizeNavigation } from "@/shared/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getCmsContent("ar");
  const page = data.meta.pages?.products;
  return buildPageMetadata({
    title: page?.title || data.products.title,
    description: page?.description || data.products.body,
    path: "/products",
    locale: "ar",
    arabicAlternate: true,
  });
}

export default async function ArabicProductsPage() {
  const { data } = await getCmsContent("ar");
  const nav = localizeNavigation(data.nav, "ar");
  const footer = localizeFooter(data.footer, "ar");
  const name = data.meta.pages?.products?.title || data.products.title;
  const description = data.meta.pages?.products?.description || data.products.body;
  return <>
    <AP_PageStructuredData name={name} description={description} path="/ar/products" type="CollectionPage" locale="ar" />
    <AP_Header labels={data.meta.labels} cta={data.meta.headerCta ?? ""} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} activePath="/ar/products" />
    <AP_ProductsSections locale="ar" />
    <AP_Footer labels={data.meta.labels} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} content={footer} social={data.social} />
  </>;
}

export const dynamic = "force-dynamic";
