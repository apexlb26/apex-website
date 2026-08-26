import type { Metadata } from "next";
import AP_SolutionsScreen from "@/app/screens/AP_SolutionsScreen";

export const metadata: Metadata = { title: "Solutions", description: "AI, automation, custom software, integration, data, and workflow systems from APEX.", alternates: { canonical: "/solutions" } };
export default function Page() { return <AP_SolutionsScreen />; }

/* Rendered per request so CMS edits appear without a redeploy. */
export const dynamic = "force-dynamic";
