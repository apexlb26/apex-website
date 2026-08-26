import Link from "next/link";
import type { MethodContent } from "@/shared/types";
import AP_Icon from "@/app/components/AP_Icon";

/* No media queries: the step row is a wrapping flex line closed by ghost items. */
const shell = "mx-auto w-[min(1640px,86%)]";

export default function AP_Method({ content, standalone = false }: { content: MethodContent; standalone?: boolean }) {
  const steps = content.steps ?? [];

  return (
    <section id="method" className={`bg-white ${standalone ? "py-[clamp(2.5rem,5vw,4.5rem)]" : "py-[clamp(2rem,4vw,3.5rem)]"}`}>
      <div className={shell}>
        <div className="mx-auto max-w-[760px] text-center">
          <span className="block text-[10px] font-extrabold uppercase leading-tight tracking-[0.14em] text-hx-cyanInk">{content.eyebrow}</span>
          <h2 className="mt-3 text-[clamp(24px,2.2vw,30px)] font-bold leading-[1.2] tracking-[-0.02em] text-hx-ink">
            {content.title} <span className="text-hx-cyanInk">{content.highlight ?? ""}</span>
          </h2>
          <p className="mx-auto mt-3 max-w-[620px] text-[11.5px] leading-[1.6] text-hx-copy">{content.body}</p>
        </div>

        <ol className="mt-9 flex list-none flex-wrap justify-center gap-y-8 overflow-hidden p-0">
          {steps.map((step, index) => (
            <li key={step.number} className="relative flex min-w-[min(220px,100%)] flex-1 basis-1/5 flex-col items-center px-3 text-center">
              {/* badge + ring */}
              <span className="relative flex items-center justify-center">
                <span className="grid h-[62px] w-[62px] place-items-center rounded-full border border-hx-line bg-white text-hx-cyanInk">
                  <AP_Icon name={step.icon} className="h-[26px] w-[26px]" />
                </span>
                <span className="absolute left-0 top-1/2 grid h-[22px] w-[22px] -translate-x-[62%] -translate-y-1/2 place-items-center rounded-full bg-hx-cyan2 text-[10px] font-bold text-white ring-4 ring-white">{index + 1}</span>
              </span>

              {/* dotted connector to the next step */}
              {index < steps.length - 1 && (
                <span aria-hidden="true" className="pointer-events-none absolute left-[calc(50%+42px)] right-[calc(-50%+42px)] top-[31px] border-t border-dashed border-[#b6d9ea]" />
              )}

              <strong className="mt-4 block text-[14px] font-bold text-hx-ink">{step.title}</strong>
              <p className="mt-2 max-w-[210px] text-[11px] leading-[1.5] text-hx-copy">{step.body}</p>
              <Link href="/method" className="mt-3 inline-flex items-center gap-1.5 text-[10.5px] font-bold text-hx-cyanInk hover:text-[#00897E]">
                <span>{content.stepCta ?? "Learn more"}</span><AP_Icon name="arrow-right" className="h-3 w-3" />
              </Link>
            </li>
          ))}
          {Array.from({ length: 4 }).map((_, ghost) => <li key={`ghost-${ghost}`} aria-hidden="true" className="h-0 min-w-[min(220px,100%)] flex-1 basis-1/5" />)}
        </ol>
      </div>
    </section>
  );
}
