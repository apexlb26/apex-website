"use client";

import { useState } from "react";
import AP_Icon from "@/app/components/AP_Icon";
import AP_BlogCover from "@/app/components/AP_BlogCover";
import { sizedImage, imageSrcSet } from "@/shared/images";

/** What the featured panel shows: the authored story, or a hovered card. */
export type FeaturedPanel = {
  label: string;
  title: string;
  body: string;
  cta: string;
  image?: string;
  statValue?: string;
  statLabel?: string;
  badge?: string;
  href: string;
};

export type BlogCard = {
  title: string;
  body: string;
  category: string;
  date: string;
  image?: string;
  href: string;
  cta: string;
};

const readMore = "mt-auto inline-flex items-center gap-1.5 pt-3 text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-hx-cyanInk hover:text-[#00897E]";
const eyebrow = "block text-[10px] font-extrabold uppercase leading-tight tracking-[0.14em] text-hx-cyanInk";

const norm = (value: string) => value.trim().toLowerCase();

/*
 * The category tabs and the cards they filter. The first tab is the "show
 * everything" tab; every other tab shows the cards whose category matches it.
 * Tabs and cards both come from the CMS, so an editor adds a tab by naming it
 * and files a story under it by picking it in the story's category.
 *
 * State lives here rather than in the URL so a live CMS update (router.refresh)
 * swaps the cards without kicking a reader off the tab they chose.
 *
 * The featured panel sits here too, because it previews whichever card the
 * reader is hovering and falls back to the authored featured story otherwise.
 * Every preview is rendered into a single grid cell with the inactive ones
 * hidden, so the panel is always as tall as the longest one: it never resizes,
 * and the cards below it never shift, as the pointer crosses the row. Nothing
 * is clipped and no height is hard-coded, so it still reflows by content.
 */
export default function AP_BlogFeed({
  categories,
  cards,
  featured,
  emptyTitle,
  emptyBody,
  noMatchText,
}: {
  categories: string[];
  cards: BlogCard[];
  featured?: FeaturedPanel;
  emptyTitle: string;
  emptyBody: string;
  noMatchText: string;
}) {
  const [active, setActive] = useState(0);
  // Which card the pointer is on, by href: stable while tabs filter the row.
  const [hovered, setHovered] = useState<string | null>(null);
  // A tab removed in the CMS while it is selected falls back to "all".
  const current = active < categories.length ? active : 0;
  const visible = current === 0 ? cards : cards.filter((card) => norm(card.category) === norm(categories[current]));

  /*
   * The authored story first, then one preview per card - built from every
   * card, not just the visible ones, so filtering a tab cannot change the
   * panel's height either.
   */
  const previews: FeaturedPanel[] = [
    ...(featured ? [featured] : []),
    ...cards.map((card) => ({
      label: card.category,
      title: card.title,
      body: card.body,
      cta: card.cta,
      image: card.image,
      href: card.href,
    })),
  ];
  const shown = previews.find((item) => item.href === hovered) ?? previews[0];

  return (
    <>
      {shown && (
        <article className="flex flex-wrap overflow-hidden rounded-xl border border-hx-line bg-white" aria-live="polite">
          <div className="grid min-w-[min(280px,100%)] flex-1 basis-[42%] p-5">
            {previews.map((item, index) => {
              const current = item === shown;
              return (
                <div
                  key={`${item.href}-${index}`}
                  aria-hidden={!current}
                  className={`col-start-1 row-start-1 flex flex-col justify-center transition-opacity duration-200 ${current ? "visible opacity-100" : "invisible opacity-0"}`}
                >
                  <span className={eyebrow}>{item.label}</span>
                  <h2 className="mt-2.5 text-[clamp(18px,1.7vw,23px)] font-bold leading-[1.25] tracking-[-0.02em] text-hx-ink">{item.title}</h2>
                  <p className="mt-2.5 max-w-[380px] text-[11px] leading-[1.55] text-hx-copy">{item.body}</p>
                  <a href={item.href} className={`${readMore} mt-3`}>{item.cta}<AP_Icon name="arrow-right" className="h-3 w-3" /></a>
                </div>
              );
            })}
          </div>
          <div className="relative min-h-[190px] min-w-[min(260px,100%)] flex-1 basis-[54%] self-stretch overflow-hidden bg-hx-tint">
            <div className="absolute inset-0 [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>svg]:h-full [&>svg]:w-full">
              {shown.image
                ? <img src={sizedImage(shown.image, 800)} srcSet={imageSrcSet(shown.image)} sizes="(min-width:1024px) 480px, 100vw" alt={shown.title} loading="lazy" decoding="async" />
                : <AP_BlogCover variant="feature" />}
            </div>
            {shown.statValue ? (
              <div className="absolute inset-y-0 right-0 flex w-[52%] flex-col items-center justify-center gap-2 px-4 text-center">
                <strong className="text-[clamp(24px,2.6vw,38px)] font-bold leading-none tracking-[-0.03em] text-hx-cyanInk">{shown.statValue}</strong>
                <small className="text-[10px] font-bold uppercase tracking-[0.12em] text-hx-ink">{shown.statLabel}</small>
                {shown.badge && <span className="mt-1 rounded-full bg-[#0b2233] px-3 py-1.5 text-[10px] font-semibold text-white">{shown.badge}</span>}
              </div>
            ) : null}
          </div>
        </article>
      )}

      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Categories">
          {categories.map((category, index) => (
            <button
              key={`${category}-${index}`}
              type="button"
              role="tab"
              aria-selected={index === current}
              onClick={() => setActive(index)}
              className={index === current
                ? "rounded-md bg-hx-cyan2 px-3.5 py-2 text-[10.5px] font-bold text-white"
                : "rounded-md border border-hx-line bg-white px-3.5 py-2 text-[10.5px] font-bold text-hx-copy transition hover:border-[#bcdff2] hover:text-hx-ink"}
            >{category}</button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-4" onMouseLeave={() => setHovered(null)}>
        {visible.length ? visible.map((card, index) => (
          <article
            key={`${card.href}-${index}`}
            onMouseEnter={() => setHovered(card.href)}
            onFocus={() => setHovered(card.href)}
            data-previewing={shown?.href === card.href ? "true" : "false"}
            className="flex min-w-[min(132px,100%)] flex-1 basis-[calc(20%-13px)] flex-col overflow-hidden rounded-xl border border-hx-line bg-white transition hover:-translate-y-0.5 hover:border-[#bcdff2] hover:shadow-[0_14px_30px_rgba(11,34,51,.08)] data-[previewing=true]:border-[#bcdff2] data-[previewing=true]:shadow-[0_14px_30px_rgba(11,34,51,.08)]">
            <div className="h-[84px] w-full shrink-0 overflow-hidden bg-hx-tint">
              {card.image
                ? <img src={sizedImage(card.image, 480)} srcSet={imageSrcSet(card.image, [480, 800])} sizes="240px" alt={card.title} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                : <AP_BlogCover variant={index} />}
            </div>
            <div className="flex flex-1 flex-col p-3.5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-hx-cyanInk">{card.category}</span>
                <span className="text-[10px] text-hx-muted">{card.date}</span>
              </div>
              <h3 className="mt-2 text-[12px] font-bold leading-[1.3] text-hx-ink">{card.title}</h3>
              <p className="mt-1.5 text-[10px] leading-[1.5] text-hx-copy">{card.body}</p>
              <a href={card.href} className={readMore}>{card.cta}<AP_Icon name="arrow-right" className="h-3 w-3" /></a>
            </div>
          </article>
        )) : (
          <div className="flex w-full flex-wrap items-center justify-center gap-4 rounded-xl border border-dashed border-[#bcdde6] bg-hx-band p-7">
            <AP_Icon name="layers" className="h-8 w-8 shrink-0 text-hx-cyan" />
            <div className="min-w-[min(280px,100%)]">
              <strong className="block text-sm text-hx-ink">{cards.length ? categories[current] : emptyTitle}</strong>
              <p className="mt-1 max-w-[540px] text-[11.5px] leading-[1.55] text-hx-copy">{cards.length ? noMatchText : emptyBody}</p>
            </div>
          </div>
        )}
        {Array.from({ length: 4 }).map((_, ghost) => <span key={`ghost-${ghost}`} aria-hidden="true" className="h-0 min-w-[min(132px,100%)] flex-1 basis-[calc(20%-13px)]" />)}
      </div>
    </>
  );
}
