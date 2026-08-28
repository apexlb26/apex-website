import type { Metadata } from "next";
import { getCmsContent } from "@/shared/content";
import AP_CareersScreen from "@/app/screens/AP_CareersScreen";

/* Tab title and search description come from the CMS. */
export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getCmsContent("en");
  const page = data.meta.pages?.["careers"];
  return {
    title: page?.title,
    description: page?.description,
    alternates: { canonical: "/careers" },
  };
}

export default function CareersPage() { return <AP_CareersScreen />; }

/* Rendered per request so CMS edits appear without a redeploy. */
export const dynamic = "force-dynamic";
