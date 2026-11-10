"use client";

import { useState } from "react";
import AP_Icon from "@/app/components/AP_Icon";
import AP_BlogCover from "@/app/components/AP_BlogCover";
import { sizedImage, imageSrcSet } from "@/shared/images";

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

const norm = (value: string) => value.trim().toLowerCase();

/*
 * The category tabs and the cards they filter. The first tab is the "show
 * everything" tab; every other tab shows the cards whose category matches it.
 * Tabs and cards both come from the CMS, so an editor adds a tab by naming it
 * and files a story under it by picking it in the story's category.
 *
 * State lives here rather than in the URL so a live CMS update (router.refresh)
 * swaps the cards without kicking a reader off the tab they chose.
 */
export default function AP_BlogFeed({
  categories,
  cards,
  emptyTitle,
  emptyBody,
  noMatchText,
}: {
  categories: string[];
  cards: BlogCard[];
  emptyTitle: string;
  emptyBody: string;
  noMatchText: string;
}) {
  const [active, setActive] = useState(0);
  // A tab removed in the CMS while it is selected falls back to "all".
  const current = active < categories.length ? active : 0;
  const visible = current === 0 ? cards : cards.filter((card) => norm(card.category) === norm(categories[current]));

  return (
    <>
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

      <div className="flex flex-wrap gap-4">
        {visible.length ? visible.map((card, index) => (
          <article key={`${card.href}-${index}`} className="flex min-w-[min(132px,100%)] flex-1 basis-[calc(20%-13px)] flex-col overflow-hidden rounded-xl border border-hx-line bg-white transition hover:-translate-y-0.5 hover:border-[#bcdff2] hover:shadow-[0_14px_30px_rgba(11,34,51,.08)]">
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
