import Image from "next/image";
import type { CaseStudyContent } from "@/shared/types";
import AP_Icon from "@/app/components/AP_Icon";
import { AP_CaseStudyButton } from "@/app/components/AP_CaseStudyModal";

/* No media queries: copy and device are flex children that wrap. */
const shell = "mx-auto w-[min(1640px,86%)]";

export default function AP_CaseStudy({ content }: { content: CaseStudyContent }) {
  return (
    <section id="case-studies" className="border-b border-hx-line bg-white py-[clamp(2rem,4vw,3.5rem)]">
      <div className={`${shell} flex flex-wrap items-center gap-x-[clamp(2rem,4vw,4rem)] gap-y-8`}>
        <div className="min-w-[min(320px,100%)] flex-1 basis-[42%]">
          <span className="block text-[10px] font-extrabold uppercase leading-tight tracking-[0.14em] text-hx-cyanInk">{content.eyebrow}</span>
          <h2 className="mt-3 text-[clamp(24px,2.3vw,32px)] font-bold leading-[1.18] tracking-[-0.02em] text-hx-ink">{content.headline}</h2>
          <p className="mt-4 max-w-[520px] text-[12.5px] leading-[1.7] text-hx-copy">{content.body}</p>

          <div className="mt-6 flex flex-wrap gap-y-4">
            {content.facts.map((fact) => (
              <div key={fact.title} className="flex min-w-[min(160px,32%)] flex-1 basis-1/3 items-start gap-2.5 border-l border-hx-line px-3 first:border-l-0 first:pl-0">
                <AP_Icon name={fact.icon} className="mt-0.5 h-[20px] w-[20px] shrink-0 text-hx-cyan" />
                <div className="min-w-0">
                  <strong className="block text-[12px] font-bold text-hx-ink">{fact.title}</strong>
                  <small className="mt-1 block text-[11px] leading-[1.45] text-hx-copy">{fact.body}</small>
                </div>
              </div>
            ))}
          </div>

          <AP_CaseStudyButton className="mt-6 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.08em] text-hx-cyanInk transition-colors hover:text-[#00897E] [&_svg]:h-[13px] [&_svg]:w-[13px]">
            {content.cta} <AP_Icon name="arrow-right" />
          </AP_CaseStudyButton>
        </div>

        <div className="min-w-[min(340px,100%)] flex-1 basis-[50%]">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <Image src={content.clientLogo} alt={content.client} width={104} height={40} />
            <span className="text-[11px] font-semibold text-hx-muted">{content.eyebrow}</span>
          </div>

          <div className="mt-4 overflow-hidden rounded-xl border border-hx-line bg-white shadow-[0_16px_38px_rgba(11,34,51,.10)]">
            <div className="flex items-center gap-1.5 border-b border-hx-line bg-hx-band px-3 py-2">
              {[0, 1, 2].map((dot) => <i key={dot} className="block h-2 w-2 rounded-full bg-[#cfe0ec]" />)}
            </div>
            <Image
              src={content.screenshot}
              alt={content.client}
              width={1440}
              height={900}
              loading="lazy"
              className="h-auto w-full"
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {content.capabilities.slice(0, 3).map((item) => (
              <span key={item} className="rounded-full border border-hx-line bg-hx-band px-3 py-1.5 text-[10.5px] font-semibold text-hx-copy">{item}</span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
