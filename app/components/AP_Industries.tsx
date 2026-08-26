import type { IndustriesContent } from "@/shared/types";
import Link from "next/link";
import AP_Button from "@/app/components/AP_Button";
import AP_ContactLink from "@/app/components/AP_ContactLink";
import AP_Component from "@/app/components/AP_Component";
import AP_Icon from "@/app/components/AP_Icon";
import AP_IndustryVisual from "@/app/components/AP_IndustryVisual";
import AP_IndustriesGlobe from "@/app/components/AP_IndustriesGlobe";

export default function AP_Industries({ content, standalone = false, embedded = false }: { content: IndustriesContent; standalone?: boolean; embedded?: boolean }) {
  const shell = "mx-auto w-[min(1640px,86%)]";
  const eyebrow = "block text-[10px] font-extrabold uppercase leading-tight tracking-[0.14em] text-hx-cyanInk";
  const ctaLink = "mt-2 inline-flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-hx-cyanInk transition-colors hover:text-[#00897E] [&_svg]:h-[13px] [&_svg]:w-[13px]";

  if (standalone) {
    const [first, second, ...wide] = content.items;
    const twoUp = [first, second].filter(Boolean);
    const explore = content.exploreLabel ?? content.learnMoreLabel ?? "Explore this industry";
    const Title = embedded ? "h2" : "h1";

    /* Checklist shared by every card. */
    const checklist = (bullets: string[]) => (
      <ul className="flex list-none flex-col gap-2.5 p-0">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2.5 text-[12px] leading-[1.5] text-hx-copy">
            <AP_Icon name="check-circle" className="mt-px h-[15px] w-[15px] shrink-0 text-sx-teal" />
            <span className="min-w-0">{bullet}</span>
          </li>
        ))}
      </ul>
    );

    const exploreLink = (
      <AP_ContactLink
        icon="arrow-up-right"
        className="mt-5 inline-flex items-center gap-2 whitespace-nowrap text-[12px] font-bold text-sx-teal transition-colors hover:text-sx-tealDark [&_svg]:h-[13px] [&_svg]:w-[13px]"
      >{explore}</AP_ContactLink>
    );

    const chip = (n: string) => (
      <span className="inline-flex w-fit rounded-lg border border-sx-line bg-sx-mint px-2.5 py-1 text-[11px] font-bold tracking-[0.06em] text-sx-teal">{n}</span>
    );

    const tile = (icon: typeof content.items[number]["icon"]) => (
      <span className="grid h-[84px] w-[84px] shrink-0 place-items-center rounded-[22px] bg-[linear-gradient(150deg,#eaf7f5,#dbefeb)]">
        <AP_Icon name={icon} className="h-9 w-9 text-sx-teal" />
      </span>
    );

    const photo = (item: typeof content.items[number], className: string) => (
      <div className={`overflow-hidden rounded-[20px] bg-sx-mint ${className}`}>
        <div className="h-full w-full [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>svg]:h-full [&>svg]:w-full">
          {item.image ? <img src={item.image} alt={item.title} /> : <AP_IndustryVisual type={item.key} />}
        </div>
      </div>
    );

    return (
      <section id="industries" className="bg-sx-page pb-[clamp(2.5rem,5vw,4rem)] pt-[clamp(0.9rem,1.6vw,1.5rem)]">
        <div className={shell}>
          {/* ---------- hero: copy beside the globe ---------- */}
          <div className="flex flex-wrap items-center gap-x-[clamp(2rem,5vw,4rem)] gap-y-6">
            <div className="min-w-[min(360px,100%)] flex-1 basis-[46%]">
              <span className="block text-[10px] font-extrabold uppercase leading-tight tracking-[0.16em] text-sx-teal">
                {embedded ? content.eyebrow : (content.pageEyebrow ?? content.eyebrow)}
              </span>
              <Title className="mt-3 text-[clamp(30px,3.3vw,48px)] font-bold leading-[1.08] tracking-[-0.03em] text-hx-ink">
                {content.pageTitle}<br />{content.pageHighlight}
              </Title>
              <p className="mt-4 max-w-[430px] text-[13px] leading-[1.7] text-hx-copy">{content.pageBody}</p>
            </div>
            <div className="min-w-[min(320px,100%)] flex-1 basis-[44%]"><AP_IndustriesGlobe /></div>
          </div>

          {/* ---------- two-up industry cards ---------- */}
          <div className="mt-[clamp(0.5rem,1.2vw,1rem)] flex flex-wrap gap-5">
            {twoUp.map((item) => (
              <article
                key={item.key}
                id={item.key}
                className="flex min-w-[min(440px,100%)] flex-1 basis-[calc(50%-10px)] flex-col rounded-[24px] border border-sx-line bg-white p-6 shadow-[0_14px_34px_rgba(1,54,65,.06)]"
              >
                {chip(item.number)}
                <div className="mt-4 flex flex-1 flex-wrap items-stretch gap-5">
                  <div className="flex min-w-[min(280px,100%)] flex-[1.6] basis-[58%] gap-4">
                    {tile(item.icon)}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <h2 className="text-[clamp(16px,1.35vw,20px)] font-bold leading-[1.2] tracking-[-0.01em] text-hx-ink [overflow-wrap:normal]">{item.title}</h2>
                      <p className="mt-2.5 text-[12px] leading-[1.6] text-hx-copy">{item.body}</p>
                      <span aria-hidden="true" className="my-4 block h-px w-full bg-sx-line" />
                      {checklist(item.bullets)}
                      <div className="mt-auto">{exploreLink}</div>
                    </div>
                  </div>
                  {photo(item, "min-h-[190px] min-w-[min(170px,100%)] flex-1 basis-[32%]")}
                </div>
              </article>
            ))}
          </div>

          {/* ---------- wide industry cards ---------- */}
          {wide.map((item) => (
            <article
              key={item.key}
              id={item.key}
              className="mt-5 flex flex-col rounded-[24px] border border-sx-line bg-white p-6 shadow-[0_14px_34px_rgba(1,54,65,.06)]"
            >
              {chip(item.number)}
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-5">
                {tile(item.icon)}
                <div className="min-w-[min(260px,100%)] flex-[1.4] basis-[30%]">
                  <h2 className="text-[clamp(16px,1.35vw,20px)] font-bold leading-[1.2] tracking-[-0.01em] text-hx-ink [overflow-wrap:normal]">{item.title}</h2>
                  <p className="mt-2.5 text-[12px] leading-[1.6] text-hx-copy">{item.body}</p>
                  {exploreLink}
                </div>
                <div className="min-w-[min(210px,100%)] flex-1 basis-[20%]">{checklist(item.bullets)}</div>
                {photo(item, "min-h-[150px] min-w-[min(240px,100%)] flex-[1.2] basis-[30%]")}
              </div>
            </article>
          ))}

          {/* ---------- open-door strip ---------- */}
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-[24px] border border-sx-line bg-white px-6 py-5">
            <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-full bg-sx-mint">
              <AP_Icon name="message" className="h-5 w-5 text-sx-teal" />
            </span>
            <div className="min-w-[min(260px,100%)] flex-1">
              <strong className="block text-[14px] font-bold leading-[1.3] text-hx-ink">{content.pageOpenDoorTitle ?? content.openDoorTitle}</strong>
              <p className="mt-1 text-[12px] leading-[1.5] text-hx-copy">{content.pageOpenDoorBody ?? content.openDoorBody}</p>
            </div>
            <AP_ContactLink
              icon="arrow-up-right"
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap text-[12px] font-bold text-sx-teal transition-colors hover:text-sx-tealDark [&_svg]:h-[13px] [&_svg]:w-[13px]"
            >{content.pageOpenDoorCta ?? content.openDoorCta}</AP_ContactLink>
          </div>
        </div>
      </section>
    );
  }

  /* Home layout — no media queries; label column + wrapping card row. */
  return (
    <section id="industries" className="border-b border-hx-line bg-hx-band py-[clamp(2rem,4vw,3.5rem)]">
      <div className={`${shell} flex flex-wrap gap-x-10 gap-y-8`}>
        <div className="min-w-[min(280px,100%)] flex-1 basis-[20%]">
          <span className={eyebrow}>{content.eyebrow}</span>
          <h2 className="mt-3 text-[clamp(26px,2.4vw,34px)] font-bold leading-[1.15] tracking-[-0.02em] text-hx-ink">{content.title}</h2>
          <p className="mt-4 max-w-[380px] text-[13px] leading-[1.7] text-hx-copy">{content.body}</p>
          <Link href="/industries" className="mt-5 inline-flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-hx-cyanInk transition-colors hover:text-[#00897E]">
            <span>{content.cta}</span><AP_Icon name="arrow-right" className="h-[13px] w-[13px]" />
          </Link>
        </div>

        <div className="flex min-w-[min(560px,100%)] flex-[2.6] basis-[72%] flex-wrap gap-4">
          {content.items.map((item) => (
            <article key={item.key} className="flex min-w-[min(200px,100%)] flex-1 basis-[calc(25%-16px)] flex-col overflow-hidden rounded-xl border border-hx-line bg-white transition hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(11,34,51,.08)]">
              <div className="h-[132px] w-full shrink-0 overflow-hidden bg-hx-tint [&>svg]:h-full [&>svg]:w-full">
                {item.image ? <img src={item.image} alt={item.title} className="h-full w-full object-cover" /> : <AP_IndustryVisual type={item.key} />}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <AP_Icon name={item.icon} className="h-[22px] w-[22px] shrink-0 text-hx-cyan" />
                <h3 className="mt-2.5 text-[15px] font-bold leading-tight text-hx-ink">{item.title}</h3>
                <p className="mt-2 text-[11.5px] leading-[1.55] text-hx-copy">{item.body}</p>
                <Link href="/industries" className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[10.5px] font-bold text-hx-cyanInk hover:text-[#00897E]">
                  <span>{item.learnMore ?? content.learnMoreLabel ?? "Learn more"}</span><AP_Icon name="arrow-right" className="h-3 w-3" />
                </Link>
              </div>
            </article>
          ))}

          <article className="flex min-w-[min(175px,100%)] grow basis-[calc(18%-16px)] flex-col rounded-xl border border-hx-line bg-white p-4">
            <AP_Icon name="message" className="h-[22px] w-[22px] shrink-0 text-hx-cyan" />
            <h3 className="mt-2.5 text-[14px] font-bold leading-tight text-hx-ink">{content.openDoorTitle}</h3>
            <p className="mt-2 text-[11.5px] leading-[1.55] text-hx-copy">{content.openDoorBody}</p>
            <div className="mt-auto pt-4"><AP_Button variant="plain" contact>{content.openDoorCta}</AP_Button></div>
          </article>
        </div>
      </div>
    </section>
  );
}
