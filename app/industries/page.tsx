import type { Metadata } from "next";
import { getCmsContent } from "@/shared/content";
import AP_IndustriesScreen from "@/app/screens/AP_IndustriesScreen";

/* Tab title and search description come from the CMS. */
export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getCmsContent("en");
  const page = data.meta.pages?.["industries"];
  return {
    title: page?.title,
    description: page?.description,
    alternates: { canonical: "/industries" },
  };
}
export default function Page() { return <AP_IndustriesScreen />; }

/* Rendered per request so CMS edits appear without a redeploy. */
export const dynamic = "force-dynamic";
