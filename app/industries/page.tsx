import AP_PageStructuredData from "@/app/components/AP_PageStructuredData";
import AP_IndustriesScreen from "@/app/screens/AP_IndustriesScreen";
import { buildPageMetadata } from "@/shared/seo";

const description = "APEX builds connected systems for education, service operations, and public and environmental workflows.";

export const metadata = buildPageMetadata({ title: "Industries", description, path: "/industries" });

export default function Page() {
  return (
    <>
      <AP_PageStructuredData name="Industries APEX serves" description={description} path="/industries" type="CollectionPage" />
      <AP_IndustriesScreen />
    </>
  );
}

export const dynamic = "force-dynamic";
