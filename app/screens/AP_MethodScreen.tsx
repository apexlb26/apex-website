import { getCmsContent } from "@/shared/content";
import AP_Header from "@/app/components/AP_Header";
import AP_Footer from "@/app/components/AP_Footer";
import AP_Method from "@/app/components/AP_Method";
import AP_Insights from "@/app/components/AP_Insights";
import AP_CtaBand from "@/app/components/AP_CtaBand";

export default async function AP_MethodScreen() {
  const { data } = await getCmsContent("en");
  return <><AP_Header nav={data.nav} activePath="/method"/><main><AP_Method content={data.method} standalone/><AP_Insights blogs={data.blogs} solutions={data.solutions} compact/><AP_CtaBand content={data.method}/></main><AP_Footer nav={data.nav} content={data.footer} social={data.social}/></>;
}
