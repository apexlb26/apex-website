import AP_PageStructuredData from "@/app/components/AP_PageStructuredData";
import AP_CareersScreen from "@/app/screens/AP_CareersScreen";
import { buildPageMetadata } from "@/shared/seo";

const description = "Do meaningful work with great people at APEX, building thoughtful software, AI, data, and workflow systems.";

export const metadata = buildPageMetadata({ title: "Careers", description, path: "/careers", arabicAlternate: true });

export default function CareersPage() {
  return (
    <>
      <AP_PageStructuredData name="Careers at APEX" description={description} path="/careers" type="CollectionPage" />
      <AP_CareersScreen />
    </>
  );
}

export const dynamic = "force-dynamic";
