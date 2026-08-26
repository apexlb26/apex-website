import { getCmsContent } from "@/shared/content";
import AP_Header from "@/app/components/AP_Header";
import AP_Footer from "@/app/components/AP_Footer";
import AP_Solutions from "@/app/components/AP_Solutions";
import AP_TrustStrip from "@/app/components/AP_TrustStrip";
import AP_CtaBand from "@/app/components/AP_CtaBand";

export default async function AP_SolutionsScreen() {
  const { data } = await getCmsContent("en");
  return <><AP_Header nav={data.nav} activePath="/solutions"/><main><AP_Solutions content={data.solutions} standalone/><AP_TrustStrip trust={data.trust} /><AP_CtaBand content={data.method}/></main><AP_Footer nav={data.nav} content={data.footer} social={data.social}/></>;
}
