import type { Metadata } from "next";
import { getCmsContent } from "@/shared/content";
import AP_ProductsScreen from "@/app/screens/AP_ProductsScreen";

/* Tab title and search description come from the CMS. */
export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getCmsContent("en");
  const page = data.meta.pages?.["products"];
  return {
    title: page?.title,
    description: page?.description,
    alternates: { canonical: "/products" },
  };
}

export default function ProductsPage() { return <AP_ProductsScreen />; }

/* Rendered per request so CMS edits appear without a redeploy. */
export const dynamic = "force-dynamic";
