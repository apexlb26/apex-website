import AP_PageStructuredData from "@/app/components/AP_PageStructuredData";
import AP_BlogsScreen from "@/app/screens/AP_BlogsScreen";
import { buildPageMetadata } from "@/shared/seo";

const description = "APEX news, collaborations, case-driven insights, and practical thinking on intelligent digital systems.";

export const metadata = buildPageMetadata({ title: "Blogs & News", description, path: "/blogs" });

export default function BlogsPage() {
  return (
    <>
      <AP_PageStructuredData name="APEX Blogs & News" description={description} path="/blogs" type="CollectionPage" />
      <AP_BlogsScreen />
    </>
  );
}

export const dynamic = "force-dynamic";
