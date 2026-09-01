import dynamic from "next/dynamic";
import { getCmsContent } from "@/shared/content";
import type { Locale } from "@/shared/types";
import { localizeFooter, localizeNavigation } from "@/shared/seo";
import AP_Header from "@/app/components/AP_Header";
import AP_Hero from "@/app/components/AP_Hero";
import AP_Footer from "@/app/components/AP_Footer";
import AP_CtaBand from "@/app/components/AP_CtaBand";

const AP_Solutions = dynamic(() => import("@/app/components/AP_Solutions"));
const AP_Industries = dynamic(() => import("@/app/components/AP_Industries"));
const AP_CaseStudy = dynamic(() => import("@/app/components/AP_CaseStudy"));
const AP_Method = dynamic(() => import("@/app/components/AP_Method"));

export default async function AP_HomeScreen({ locale = "en" }: { locale?: Locale } = {}) {
  const { data } = await getCmsContent(locale);
  const nav = localizeNavigation(data.nav, locale);
  const footer = localizeFooter(data.footer, locale);

  return (
    <>
      <AP_Header labels={data.meta.labels} cta={data.meta.headerCta ?? ""} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} />
      <main id="top">
        <AP_Hero hero={data.hero} />
        <AP_Solutions content={data.solutions} standalone embedded />
        <AP_Industries mark={data.meta.logoMark} content={data.industries} standalone embedded />
        <AP_CaseStudy content={data.caseStudy} />
        <AP_Method content={data.method} standalone />
        <AP_CtaBand content={data.method} />
      </main>
      <AP_Footer labels={data.meta.labels} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={nav} content={footer} social={data.social} />
    </>
  );
}
