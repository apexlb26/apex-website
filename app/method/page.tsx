import type { Metadata } from "next";
import AP_MethodScreen from "@/app/screens/AP_MethodScreen";

export const metadata: Metadata = { title: "Method", description: "The APEX method: discover, architect, build, integrate, and evolve connected digital systems.", alternates: { canonical: "/method" } };
export default function Page() { return <AP_MethodScreen />; }

/* Rendered per request so CMS edits appear without a redeploy. */
export const dynamic = "force-dynamic";
