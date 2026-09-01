import type { Metadata } from "next";
import AP_PageStructuredData from "@/app/components/AP_PageStructuredData";
import AP_HomeScreen from "@/app/screens/AP_HomeScreen";
import { getCmsContent } from "@/shared/content";
import { buildPageMetadata } from "@/shared/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getCmsContent("ar");
  return buildPageMetadata({
    title: data.meta.title,
    description: data.meta.description,
    path: "/",
    locale: "ar",
    arabicAlternate: true,
  });
}

export default async function ArabicHomePage() {
  const { data } = await getCmsContent("ar");
  return (
    <>
      <AP_PageStructuredData
        name={data.meta.title}
        description={data.meta.description}
        path="/ar"
        locale="ar"
      />
      <AP_HomeScreen locale="ar" />
    </>
  );
}

export const dynamic = "force-dynamic";
