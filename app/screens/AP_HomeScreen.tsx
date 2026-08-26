import dynamic from "next/dynamic";
import { getCmsContent } from "@/shared/content";
import AP_Header from "@/app/components/AP_Header";
import AP_Hero from "@/app/components/AP_Hero";
import AP_Footer from "@/app/components/AP_Footer";
import AP_CtaBand from "@/app/components/AP_CtaBand";

/*
 * The home page is the whole site on one page: every section below renders the
 * same component its own route does, passed `embedded` so it contributes an
 * <h2> section rather than a second <h1>. Order follows the nav menu.
 */
const AP_Solutions = dynamic(() => import("@/app/components/AP_Solutions"));
const AP_Industries = dynamic(() => import("@/app/components/AP_Industries"));
const AP_CaseStudy = dynamic(() => import("@/app/components/AP_CaseStudy"));
const AP_Method = dynamic(() => import("@/app/components/AP_Method"));
const AP_Insights = dynamic(() => import("@/app/components/AP_Insights"));
const AP_ProductsSections = dynamic(() => import("@/app/components/AP_ProductsSections"));
const AP_BlogsSections = dynamic(() => import("@/app/components/AP_BlogsSections"));
const AP_CareersSections = dynamic(() => import("@/app/components/AP_CareersSections"));
const AP_AboutSection = dynamic(() => import("@/app/components/AP_AboutSection"));

export default async function AP_HomeScreen() {
  const { data } = await getCmsContent("en");
  return (
    <>
      <AP_Header nav={data.nav} />
      <main id="top">
        <AP_Hero hero={data.hero} />
        <AP_Solutions content={data.solutions} standalone embedded />
        <AP_Industries content={data.industries} standalone embedded />
        <AP_CaseStudy content={data.caseStudy} />
        <AP_Method content={data.method} standalone />
        <AP_Insights blogs={data.blogs} solutions={data.solutions} compact />
        <AP_ProductsSections embedded />
        <AP_BlogsSections embedded />
        <AP_CareersSections embedded />
        <AP_AboutSection content={data.about} />
        <AP_CtaBand content={data.method} />
      </main>
      <AP_Footer nav={data.nav} content={data.footer} social={data.social} />
    </>
  );
}
