import { getCmsContent } from "@/shared/content";
import AP_Header from "@/app/components/AP_Header";
import AP_Footer from "@/app/components/AP_Footer";
import AP_BlogsSections from "@/app/components/AP_BlogsSections";

export default async function AP_BlogsScreen() {
  const { data } = await getCmsContent("en");
  return (
    <>
      <AP_Header nav={data.nav} activePath="/blogs" />
      <AP_BlogsSections />
      <AP_Footer nav={data.nav} content={data.footer} social={data.social} />
    </>
  );
}
