import Link from "next/link";
import type { HeroContent } from "@/shared/types";
import AP_Icon from "@/app/components/AP_Icon";
import AP_ArchitectureVisual from "@/app/components/AP_ArchitectureVisual";
import AP_ContactLink from "@/app/components/AP_ContactLink";

/* No media queries: copy and visual are flex children that wrap. */
const shell = "mx-auto w-[min(1640px,86%)]";
const button = "inline-flex h-[36px] items-center justify-center gap-2 rounded px-[18px] text-[10.5px] font-extrabold uppercase tracking-[0.08em] transition-colors [&_svg]:h-[13px] [&_svg]:w-[13px]";

export default function AP_Hero({ hero }: { hero: HeroContent }) {
  return (
    <section className="border-b border-hx-line bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfe_100%)]">
      <div className={`${shell} flex flex-wrap items-center gap-x-10 gap-y-8 py-[clamp(2rem,3.5vw,3.25rem)]`}>
        <div className="min-w-[min(440px,100%)] flex-1 basis-[42%]">
          <span className="block text-[10px] font-extrabold uppercase leading-tight tracking-[0.14em] text-hx-cyanInk">{hero.eyebrow}</span>
          <h1 className="mt-3.5 text-[clamp(38px,3.9vw,62px)] font-bold leading-[1.08] tracking-[-0.035em] text-hx-ink">
            {hero.lines[0]}<br />{hero.lines[1]}{hero.lines[2] ? <><br />{hero.lines[2]}</> : null}
            {hero.highlight ? <span className="text-apex-coral">{hero.highlight}</span> : null}
          </h1>
          {hero.body ? <p className="mt-4 max-w-[560px] whitespace-pre-line text-[13.5px] leading-[1.75] text-hx-copy">{hero.body}</p> : null}

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link href="/solutions" className={`${button} bg-hx-cyan2 text-white hover:bg-[#00695F]`}>
              <span>{hero.primaryCta}</span><AP_Icon name="arrow-right" />
            </Link>
            <AP_ContactLink
              className={`${button} border border-hx-line bg-white text-hx-ink hover:border-hx-cyan hover:text-hx-cyanInk`}
              icon="arrow-up-right"
            >{hero.secondaryCta}</AP_ContactLink>
          </div>

          <span aria-hidden="true" className="mt-7 block h-px w-full bg-hx-line" />

          <div className="mt-5 flex flex-wrap gap-y-4">
            {hero.principles.map((item) => (
              <div key={item.title} className="flex min-w-[min(150px,32%)] flex-1 basis-1/3 items-start gap-2.5 border-l border-hx-line px-3 first:border-l-0 first:pl-0">
                <AP_Icon name={item.icon} className="mt-[1px] h-[17px] w-[17px] shrink-0 text-hx-cyan" />
                <div className="min-w-0">
                  <strong className="block text-[12px] font-bold leading-[1.35] text-hx-ink">{item.title}</strong>
                  <p className="mt-1 text-[11.5px] leading-[1.5] text-hx-copy">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-[min(420px,100%)] flex-1 basis-[54%]">
          {hero.image
            ? <img
                src={hero.image}
                alt={hero.imageAlt ?? ""}
                /* the artwork carries its own near-white ground; multiply plus a soft
                   edge mask keeps its bounding box from showing on the hero gradient */
                className="ap-hero-art mx-auto h-auto w-full max-w-[780px] mix-blend-multiply"
              />
            : <AP_ArchitectureVisual layers={hero.architecture} cards={hero.architectureCards} />}
        </div>
      </div>
    </section>
  );
}
