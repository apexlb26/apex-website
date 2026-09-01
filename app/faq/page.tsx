import type { Metadata } from "next";
import AP_Header from "@/app/components/AP_Header";
import AP_Footer from "@/app/components/AP_Footer";
import AP_PageStructuredData from "@/app/components/AP_PageStructuredData";
import { getCmsContent } from "@/shared/content";
import { buildPageMetadata } from "@/shared/seo";

const title = "Frequently Asked Questions";
const description = "Answers to common questions about APEX software, AI, automation, integration, data systems, industries, and delivery approach.";

export const metadata: Metadata = buildPageMetadata({ title, description, path: "/faq" });
export const dynamic = "force-dynamic";

export default async function FAQPage() {
  const { data } = await getCmsContent("en");
  const solutions = data.solutions.pageItems?.length ? data.solutions.pageItems : data.solutions.items;
  const industries = data.industries.items;
  const method = data.method.steps;
  const findSolution = (key: string) => solutions.find((item) => item.key === key);

  const faqs = [
    {
      question: "What does APEX build?",
      answer: data.meta.description,
    },
    {
      question: "Which industries does APEX work with?",
      answer: `APEX currently highlights work across ${industries.map((item) => item.title).join(", ")}. The team also evaluates other operational challenges where connected software, AI, data, or workflow systems can create measurable value.`,
    },
    {
      question: "Can APEX integrate with existing software and systems?",
      answer: findSolution("integration")?.body || "Yes. System integration is one of APEX's core capabilities, focused on connecting software, teams, and data so information moves cleanly through an operation.",
    },
    {
      question: "Can APEX modernize legacy systems?",
      answer: findSolution("legacy")?.body || "Yes. APEX modernizes aging applications and workflows while preserving business logic that still matters.",
    },
    {
      question: "Does APEX build AI and automation solutions?",
      answer: findSolution("ai")?.body || "Yes. APEX applies AI and automation where they can reduce repetitive work, improve response quality, and accelerate decisions.",
    },
    {
      question: "How does an APEX engagement work?",
      answer: `The APEX method follows five stages: ${method.map((step) => step.title).join(", ")}. The process starts by defining the business goal and architecture, then moves through delivery, integration, and ongoing evolution.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": "https://apexlb.tech/faq#faq",
    mainEntity: faqs.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <AP_PageStructuredData name={title} description={description} path="/faq" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema).replace(/</g, "\\u003c") }} />
      <AP_Header labels={data.meta.labels} cta={data.meta.headerCta ?? ""} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={data.nav} activePath="/faq" />
      <main className="bg-white text-hx-ink">
        <section className="mx-auto w-[min(980px,88%)] py-[clamp(3rem,8vw,7rem)]">
          <span className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-hx-cyanInk">APEX FAQ</span>
          <h1 className="mt-3 text-[clamp(36px,6vw,64px)] font-bold leading-[1.04] tracking-[-0.045em]">{title}</h1>
          <p className="mt-5 max-w-[760px] text-[clamp(15px,1.7vw,19px)] leading-[1.7] text-hx-copy">{description}</p>
          <div className="mt-10 divide-y divide-hx-line border-y border-hx-line">
            {faqs.map((item) => (
              <article key={item.question} className="py-7">
                <h2 className="text-[clamp(18px,2vw,23px)] font-bold leading-[1.3] tracking-[-0.02em]">{item.question}</h2>
                <p className="mt-3 max-w-[820px] text-[14px] leading-[1.75] text-hx-copy">{item.answer}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <AP_Footer labels={data.meta.labels} logo={data.meta.logo} logoAlt={data.meta.logoAlt} nav={data.nav} content={data.footer} social={data.social} />
    </>
  );
}
