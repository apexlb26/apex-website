import AP_PageStructuredData from "@/app/components/AP_PageStructuredData";
import AP_HomeScreen from "@/app/screens/AP_HomeScreen";
import { getCmsContent } from "@/shared/content";

export default async function HomePage() {
  const { data } = await getCmsContent("en");
  return (
    <>
      <AP_PageStructuredData name={data.meta.title} description={data.meta.description} path="/" />
      <AP_HomeScreen locale="en" />
    </>
  );
}

export const dynamic = "force-dynamic";
