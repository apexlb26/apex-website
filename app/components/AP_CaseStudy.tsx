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
        <div className="flex min-w-[min(320px,100%)] flex-1 basis-[42%] self-stretch flex-col justify-center py-[clamp(0.25rem,1vw,0.9rem)]">
          <span className="block text-[11px] font-extrabold uppercase leading-tight tracking-[0.14em] text-hx-cyanInk">{content.eyebrow}</span>
          <h2 className="mt-4 max-w-[620px] text-[clamp(30px,3vw,44px)] font-bold leading-[1.1] tracking-[-0.032em] text-hx-ink">{content.headline}</h2>
          <p className="mt-5 max-w-[590px] text-[clamp(13.5px,1.02vw,15.5px)] leading-[1.72] text-hx-copy">{content.body}</p>

          <div className="mt-8 flex flex-wrap gap-y-5">
            {content.facts.map((fact) => (
              <div key={fact.title} className="flex min-w-[min(175px,32%)] flex-1 basis-1/3 items-start gap-3 border-l border-hx-line px-4 first:border-l-0 first:pl-0">
                <AP_Icon name={fact.icon} className="mt-0.5 h-[23px] w-[23px] shrink-0 text-hx-cyan" />
                <div className="min-w-0">
                  <strong className="block text-[13.5px] font-bold text-hx-ink">{fact.title}</strong>
                  <small className="mt-1.5 block text-[12.25px] leading-[1.52] text-hx-copy">{fact.body}</small>
                </div>
              </div>
            ))}
          </div>

          <AP_CaseStudyButton className="mt-8 inline-flex items-center gap-2.5 text-[12px] font-extrabold uppercase tracking-[0.08em] text-hx-cyanInk transition-colors hover:text-[#00897E] [&_svg]:h-[14px] [&_svg]:w-[14px]">
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
