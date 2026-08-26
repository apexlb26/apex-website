import AP_MediaManager from "@/app/components/AP_MediaManager";
import { getContent } from "@/shared/store";

export default async function AP_AdminMediaScreen() {
  const [en, ar] = await Promise.all([getContent("en"), getContent("ar")]);
  const paths = Array.from(new Set([
    en.caseStudy.clientLogo,
    en.caseStudy.screenshot,
    ar.caseStudy.clientLogo,
    ar.caseStudy.screenshot,
    "/api/assets/logo/apex-logo.svg",
    "/api/assets/logo/apex-mark.svg",
  ].filter(Boolean)));

  return <AP_MediaManager referencedPaths={paths} />;
}
