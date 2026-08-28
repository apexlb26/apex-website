import { getCmsContent } from "@/shared/content";
import AP_Header from "@/app/components/AP_Header";
import AP_Footer from "@/app/components/AP_Footer";
import AP_Industries from "@/app/components/AP_Industries";
import AP_CtaBand from "@/app/components/AP_CtaBand";

export default async function AP_IndustriesScreen() {
  const { data } = await getCmsContent("en");
  return <><AP_Header labels={data.meta.labels} cta={data.meta.headerCta ?? ""} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={data.nav} activePath="/industries"/><main><AP_Industries mark={data.meta.logoMark} content={data.industries} standalone/><AP_CtaBand mark={data.meta.logoMark} content={data.method}/></main><AP_Footer labels={data.meta.labels} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={data.nav} content={data.footer} social={data.social}/></>;
}
