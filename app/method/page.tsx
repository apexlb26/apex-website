import AP_PageStructuredData from "@/app/components/AP_PageStructuredData";
import AP_MethodScreen from "@/app/screens/AP_MethodScreen";
import { buildPageMetadata } from "@/shared/seo";

const description = "The APEX method: discover, architect, build, integrate, and evolve connected digital systems.";

export const metadata = buildPageMetadata({ title: "Method", description, path: "/method", arabicAlternate: true });

export default function Page() {
  return (
    <>
      <AP_PageStructuredData name="The APEX Method" description={description} path="/method" />
      <AP_MethodScreen />
    </>
  );
}

export const dynamic = "force-dynamic";
