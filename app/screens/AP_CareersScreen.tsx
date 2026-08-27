import { getCmsContent } from "@/shared/content";
import AP_Header from "@/app/components/AP_Header";
import AP_Footer from "@/app/components/AP_Footer";
import AP_CareersSections from "@/app/components/AP_CareersSections";

export default async function AP_CareersScreen() {
  const { data } = await getCmsContent("en");
  return (
    <>
      <AP_Header cta={data.meta.headerCta ?? ""} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={data.nav} activePath="/careers" />
      <AP_CareersSections />
      <AP_Footer logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={data.nav} content={data.footer} social={data.social} />
    </>
  );
}
