import type { Metadata } from "next";
import { getCmsContent } from "@/shared/content";
import AP_MethodScreen from "@/app/screens/AP_MethodScreen";

/* Tab title and search description come from the CMS. */
export async function generateMetadata(): Promise<Metadata> {
  const { data } = await getCmsContent("en");
  const page = data.meta.pages?.["method"];
  return {
    title: page?.title,
    description: page?.description,
    alternates: { canonical: "/method" },
  };
}
export default function Page() { return <AP_MethodScreen />; }

/* Rendered per request so CMS edits appear without a redeploy. */
export const dynamic = "force-dynamic";
