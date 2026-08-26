import { getCmsContent } from "@/shared/content";
import AP_Header from "@/app/components/AP_Header";
import AP_Footer from "@/app/components/AP_Footer";
import AP_ProductsSections from "@/app/components/AP_ProductsSections";

export default async function AP_ProductsScreen() {
  const { data } = await getCmsContent("en");
  return (
    <>
      <AP_Header nav={data.nav} activePath="/products" />
      <AP_ProductsSections />
      <AP_Footer nav={data.nav} content={data.footer} social={data.social} />
    </>
  );
}
