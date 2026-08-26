import Image from "next/image";
import type { MethodContent } from "@/shared/types";
import AP_ContactLink from "@/app/components/AP_ContactLink";

/* No media queries: one wrapping flex row. */
const shell = "mx-auto w-[min(1640px,86%)]";

export default function AP_CtaBand({ content }: { content: MethodContent }) {
  return (
    <section className="bg-white py-[clamp(1.5rem,3vw,2.5rem)]">
      <div className={shell}>
        <div className="relative flex flex-wrap items-center gap-x-8 gap-y-5 overflow-hidden rounded-2xl bg-[linear-gradient(100deg,#eaf6fc_0%,#d7eefb_45%,#8fd3f0_100%)] px-[clamp(1.25rem,3vw,2.75rem)] py-[clamp(1.5rem,3vw,2.25rem)]">
          <span aria-hidden="true" className="ap-px-dots pointer-events-none absolute inset-y-0 left-[55%] right-0 opacity-40" />

          <span className="relative z-[1] grid h-[62px] w-[62px] shrink-0 place-items-center rounded-xl bg-white/70">
            <Image src="/api/assets/logo/apex-mark.svg" alt="" width={40} height={32} />
          </span>

          <h2 className="relative z-[1] min-w-[min(300px,100%)] flex-1 text-[clamp(20px,2vw,28px)] font-bold leading-[1.22] tracking-[-0.02em] text-hx-ink">
            {content.ctaTitle}<br />{content.ctaBodyLead ?? "your business can"} <span className="text-hx-cyanInk">{content.ctaHighlight}</span>
          </h2>

          <div className="relative z-[1] flex min-w-[min(280px,100%)] flex-1 flex-col items-start gap-3">
            <p className="max-w-[320px] text-[11.5px] leading-[1.55] text-hx-copy">{content.ctaBody}</p>
            <AP_ContactLink className="inline-flex h-[34px] items-center gap-2 rounded bg-hx-cyan2 px-[18px] text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#00695F] [&_svg]:h-[13px] [&_svg]:w-[13px]">
              {content.cta}
            </AP_ContactLink>
          </div>
        </div>
      </div>
    </section>
  );
}
