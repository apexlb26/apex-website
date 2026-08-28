"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import type { CaseStudyContent, ContactContent, SocialContent, UiLabels } from "@/shared/types";

const AP_ContactModal = dynamic(() => import("@/app/components/AP_ContactModal"), { ssr: false });
const AP_CaseStudyModal = dynamic(() => import("@/app/components/AP_CaseStudyModal"), { ssr: false });
const AP_FloatingActions = dynamic(() => import("@/app/components/AP_FloatingActions"), { ssr: false });

export default function AP_PublicOverlays({ caseStudy, social, contact, labels }: { caseStudy: CaseStudyContent; social: SocialContent; contact?: ContactContent; labels?: UiLabels }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <AP_CaseStudyModal content={caseStudy} />
      <AP_ContactModal content={contact} labels={labels} />
      <AP_FloatingActions social={social} labels={labels} />
    </>
  );
}
