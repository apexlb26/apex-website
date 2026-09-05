import type { IndustriesContent } from "@/shared/types";
import Link from "next/link";
import Image from "next/image";
import AP_Button from "@/app/components/AP_Button";
import AP_ContactLink from "@/app/components/AP_ContactLink";
import AP_Component from "@/app/components/AP_Component";
import AP_Icon from "@/app/components/AP_Icon";
import AP_IndustryVisual from "@/app/components/AP_IndustryVisual";
import AP_IndustriesGlobe from "@/app/components/AP_IndustriesGlobe";

const INDUSTRY_IMAGE_FALLBACKS: Record<string, string> = {
  education: "/api/assets/industries/education.png",
  service: "/api/assets/industries/service-operations.png",
  environment: "/api/assets/industries/public-environmental-systems.png",
};

export default function AP_Industries({ content, mark, standalone = false, embedded = false }: { content: IndustriesContent; mark?: string; standalone?: boolean; embedded?: boolean }) {
  const shell = "mx-auto w-[min(1640px,86%)]";
  const eyebrow = "block text-[10px] font-extrabold uppercase leading-tight tracking-[0.14em] text-hx-cyanInk";
  const ctaLink = "mt-2 inline-flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-hx-cyanInk transition-colors hover:text-[#00897E] [&_svg]:h-[13px] [&_svg]:w-[13px]";

  if (standalone) {
    const [first, second, ...wide] = content.items;
    const twoUp = [first, second].filter(Boolean);
    const explore = content.exploreLabel ?? content.learnMoreLabel ?? "";
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

    const photo = (item: typeof content.items[number], className: string) => {
      const image = item.image ?? INDUSTRY_IMAGE_FALLBACKS[item.key];
      return (
        <div className={`relative overflow-hidden rounded-[20px] border border-sx-line bg-white ${className}`}>
          <div className="absolute inset-0 bg-[linear-gradient(145deg,#f8fbfb,#eef8f6)]" aria-hidden="true" />
          <div className="relative h-full w-full [&>img]:h-full [&>img]:w-full [&>img]:object-contain [&>img]:object-center [&>svg]:h-full [&>svg]:w-full">
            {image
              ? <Image src={image} alt={item.title} fill loading="lazy" sizes="(max-width: 900px) 100vw, 50vw" className="object-contain object-center" />
              : <AP_IndustryVisual type={item.key} />}
          </div>
        </div>
      );
    };

    /* Wide environmental image treatment:
       - use a deliberately shallow panorama so this horizontal card does not become too tall;
       - keep the dashboard pills inside the crop;
       - no border or hard left edge, with only a short soft transition into the white card. */
    const widePhoto = (item: typeof content.items[number]) => {
      const image = item.image ?? INDUSTRY_IMAGE_FALLBACKS[item.key];
      return (
        <div className="relative ml-auto aspect-[3.15/1] w-full max-w-none overflow-visible">
          {image ? (
            <>
              {/* A tiny blurred copy exists only under the left transition. The mask prevents any square blur block. */}
              <Image
                src={image}
                alt=""
                aria-hidden="true"
                fill
                loading="lazy"
                sizes="(max-width: 900px) 100vw, 470px"
              className="pointer-events-none absolute inset-0 h-full w-full scale-[1.02] object-cover object-center blur-[14px] opacity-65 [mask-image:linear-gradient(90deg,#000_0%,rgba(0,0,0,.78)_2%,rgba(0,0,0,.24)_4.5%,transparent_7%,transparent_100%)]"
              />

              {/* The real image is untouched after the first few percent, so both white metric pills stay crisp and complete. */}
              <Image
                src={image}
                alt={item.title}
                fill
                loading="lazy"
                sizes="(max-width: 900px) 100vw, 48vw"
                className="absolute inset-0 h-full w-full rounded-r-[20px] object-cover object-center [mask-image:linear-gradient(90deg,transparent_0%,rgba(0,0,0,.28)_1.5%,rgba(0,0,0,.78)_3.5%,#000_6%,#000_100%)]"
              />
            </>
          ) : (
            <div className="relative h-full w-full [&>svg]:h-full [&>svg]:w-full">
              <AP_IndustryVisual type={item.key} />
            </div>
          )}
        </div>
      );
    };

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
            <div className="min-w-[min(320px,100%)] flex-1 basis-[44%]">
              {content.heroImage
                ? <Image src={content.heroImage} alt={content.heroImageAlt ?? ""} width={1448} height={1086} loading="lazy" sizes="(max-width: 900px) 100vw, 44vw" className="h-auto w-full rounded-[20px] object-cover" />
                : <AP_IndustriesGlobe mark={mark} />}
            </div>
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
                <div className="mt-4 grid flex-1 items-center gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.95fr)]">
                  <div className="flex min-w-0 gap-4">
                    {tile(item.icon)}
                    <div className="flex min-w-0 flex-1 flex-col">
                      <h2 className="text-[clamp(16px,1.35vw,20px)] font-bold leading-[1.2] tracking-[-0.01em] text-hx-ink [overflow-wrap:normal]">{item.title}</h2>
                      <p className="mt-2.5 text-[12px] leading-[1.6] text-hx-copy">{item.body}</p>
                      <span aria-hidden="true" className="my-4 block h-px w-full bg-sx-line" />
                      {checklist(item.bullets)}
                      <div className="mt-auto">{exploreLink}</div>
                    </div>
                  </div>
                  {photo(item, "aspect-[4/3] w-full self-center")}
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
              <div className="mt-4 grid items-center gap-6 lg:grid-cols-[84px_minmax(250px,1.1fr)_minmax(210px,0.82fr)_minmax(420px,1.45fr)]">
                {tile(item.icon)}
                <div className="min-w-0">
                  <h2 className="text-[clamp(16px,1.35vw,20px)] font-bold leading-[1.2] tracking-[-0.01em] text-hx-ink [overflow-wrap:normal]">{item.title}</h2>
                  <p className="mt-2.5 text-[12px] leading-[1.6] text-hx-copy">{item.body}</p>
                  {exploreLink}
                </div>
                <div className="min-w-0">{checklist(item.bullets)}</div>
                {widePhoto(item)}
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
              <div className="relative h-[132px] w-full shrink-0 overflow-hidden bg-hx-tint [&>svg]:h-full [&>svg]:w-full">
                {(item.image ?? INDUSTRY_IMAGE_FALLBACKS[item.key]) ? (
                  <Image src={item.image ?? INDUSTRY_IMAGE_FALLBACKS[item.key]} alt={item.title} fill loading="lazy" sizes="(max-width: 768px) 50vw, 25vw" className="object-cover object-center" />
                ) : <AP_IndustryVisual type={item.key} />}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <AP_Icon name={item.icon} className="h-[22px] w-[22px] shrink-0 text-hx-cyan" />
                <h3 className="mt-2.5 text-[15px] font-bold leading-tight text-hx-ink">{item.title}</h3>
                <p className="mt-2 text-[11.5px] leading-[1.55] text-hx-copy">{item.body}</p>
                <Link href="/industries" className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[10.5px] font-bold text-hx-cyanInk hover:text-[#00897E]">
                  <span>{item.learnMore ?? content.learnMoreLabel ?? ""}</span><AP_Icon name="arrow-right" className="h-3 w-3" />
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
