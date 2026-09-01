import AP_PageStructuredData from "@/app/components/AP_PageStructuredData";
import AP_SolutionsScreen from "@/app/screens/AP_SolutionsScreen";
import { buildPageMetadata } from "@/shared/seo";

const description = "AI, intelligent automation, legacy modernization, system integration, data infrastructure, custom software, and workflow automation from APEX.";

export const metadata = buildPageMetadata({ title: "Solutions", description, path: "/solutions", arabicAlternate: true });

export default function Page() {
  return (
    <>
      <AP_PageStructuredData name="APEX Solutions" description={description} path="/solutions" type="CollectionPage" />
      <AP_SolutionsScreen />
    </>
  );
}

export const dynamic = "force-dynamic";
