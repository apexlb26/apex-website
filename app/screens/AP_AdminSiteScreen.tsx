import AP_ContentEditor from "@/app/components/AP_ContentEditor";
import { getContentWithVersion } from "@/shared/store";

const allowed = new Set(["meta", "hero", "about", "solutions", "industries", "caseStudy", "method", "social", "footer"]);

export default async function AP_AdminSiteScreen({ searchParams }: { searchParams: Promise<{ section?: string }> }) {
  const params = await searchParams;
  const initialSection = allowed.has(params.section || "") ? params.section as "meta" | "hero" | "about" | "solutions" | "industries" | "caseStudy" | "method" | "social" | "footer" : "hero";
  const [en, ar] = await Promise.all([getContentWithVersion("en"), getContentWithVersion("ar")]);
  return (
    <AP_ContentEditor
      initialEn={en.content}
      initialAr={ar.content}
      initialVersions={{ en: en.version, ar: ar.version }}
      mode="site"
      initialSection={initialSection}
    />
  );
}
