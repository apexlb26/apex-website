import type { Metadata } from "next";
import { getCmsContent } from "@/shared/content";
import AP_SolutionsScreen from "@/app/screens/AP_SolutionsScreen";

/* Tab title and search description come from the CMS. */
export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getCmsContent("en");
  const page = data.meta.pages?.["solutions"];
  return {
    title: page?.title,
    description: page?.description,
    alternates: { canonical: "/solutions" },
  };
}
export default function Page() { return <AP_SolutionsScreen />; }

/* Rendered per request so CMS edits appear without a redeploy. */
export const dynamic = "force-dynamic";
