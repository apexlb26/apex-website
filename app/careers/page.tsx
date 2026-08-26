import type { Metadata } from "next";
import AP_CareersScreen from "@/app/screens/AP_CareersScreen";

export const metadata: Metadata = {
  title: "Careers",
  description: "Build thoughtful software, AI, data, and workflow systems with APEX. Approved openings are published when available.",
  alternates: { canonical: "/careers" },
};

export default function CareersPage() { return <AP_CareersScreen />; }

/* Rendered per request so CMS edits appear without a redeploy. */
export const dynamic = "force-dynamic";
