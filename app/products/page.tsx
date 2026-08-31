import AP_PageStructuredData from "@/app/components/AP_PageStructuredData";
import AP_ProductsScreen from "@/app/screens/AP_ProductsScreen";
import { buildPageMetadata } from "@/shared/seo";

const description = "Explore the APEX product ecosystem for connected operations, intelligent workflows, data, and automation.";

export const metadata = buildPageMetadata({ title: "Products", description, path: "/products" });

export default function ProductsPage() {
  return (
    <>
      <AP_PageStructuredData name="APEX Products" description={description} path="/products" type="CollectionPage" />
      <AP_ProductsScreen />
    </>
  );
}

export const dynamic = "force-dynamic";
