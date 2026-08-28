import type { Metadata } from "next";
import { getCmsContent } from "@/shared/content";
import AP_BlogsScreen from "@/app/screens/AP_BlogsScreen";

/* Tab title and search description come from the CMS. */
export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getCmsContent("en");
  const page = data.meta.pages?.["blogs"];
  return {
    title: page?.title,
    description: page?.description,
    alternates: { canonical: "/blogs" },
  };
}

export default function BlogsPage() { return <AP_BlogsScreen />; }

/* Rendered per request so CMS edits appear without a redeploy. */
export const dynamic = "force-dynamic";
