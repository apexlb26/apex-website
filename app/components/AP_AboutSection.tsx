import type { AboutContent } from "@/shared/types";

/* No media queries: statement and supporting copy are wrapping flex children. */
const shell = "mx-auto w-[min(1640px,86%)]";

export default function AP_AboutSection({ content }: { content: AboutContent }) {
  return (
    <section id="about" className="border-t border-hx-line bg-white py-[clamp(2.25rem,4.5vw,3.75rem)]">
      <div className={`${shell} flex flex-wrap items-start gap-x-[clamp(2rem,5vw,5rem)] gap-y-6`}>
        <div className="min-w-[min(260px,100%)] flex-1 basis-[26%]">
          <span className="block text-[10px] font-extrabold uppercase leading-tight tracking-[0.16em] text-hx-cyanInk">
            {content.eyebrow}
          </span>
          <span aria-hidden="true" className="mt-3 block h-px w-10 bg-hx-cyan/50" />
        </div>
        <div className="min-w-[min(420px,100%)] flex-[2.4] basis-[62%]">
          <p className="text-[clamp(20px,2.1vw,30px)] font-bold leading-[1.3] tracking-[-0.02em] text-hx-ink [overflow-wrap:normal]">
            {content.statement}
          </p>
          {content.body ? (
            <p className="mt-5 max-w-[760px] text-[13px] leading-[1.75] text-hx-copy">{content.body}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
