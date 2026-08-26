import type { Metadata } from "next";
import AP_IndustriesScreen from "@/app/screens/AP_IndustriesScreen";

export const metadata: Metadata = { title: "Industries", description: "APEX builds connected systems for education, service operations, and public and environmental workflows.", alternates: { canonical: "/industries" } };
export default function Page() { return <AP_IndustriesScreen />; }

/* Rendered per request so CMS edits appear without a redeploy. */
export const dynamic = "force-dynamic";
