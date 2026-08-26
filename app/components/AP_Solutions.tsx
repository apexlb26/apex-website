import type { SolutionItem, SolutionsContent } from "@/shared/types";
import Link from "next/link";
import AP_Icon from "@/app/components/AP_Icon";

/*
 * No media queries. Rows are `flex flex-wrap`; children carry a flex-basis plus
 * `min-w-[min(Npx,100%)]` so they wrap on their own and still shrink when alone
 * on a line. Zero-height ghosts close a partly filled last row.
 */
const shell = "mx-auto w-[min(1640px,86%)]";
const eyebrow = "block text-[10px] font-extrabold uppercase leading-tight tracking-[0.14em] text-hx-cyanInk";
const exploreRow = "mt-auto flex items-center gap-3 pt-[clamp(8px,2.1vh,28px)] text-[clamp(11px,1.6vh,13px)] font-bold";
const arrowDisc = "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-transform group-hover:translate-x-0.5";

/**
 * Standalone /solutions page. This one section uses CSS grid (agreed with the
 * user) so the featured card can span two rows and cards 04-06 tuck in beside
 * it, as in the approved artwork. Columns come from auto-fit so the grid still
 * reflows without a media query. Teal here matches the artwork.
 */
function SolutionsPage({ content, embedded = false }: { content: SolutionsContent; embedded?: boolean }) {
  const items: SolutionItem[] = content.pageItems?.length ? content.pageItems : content.items;
  const [featured, ...rest] = items;
  const explore = content.exploreLabel ?? "Explore capability";
  const Title = embedded ? "h2" : "h1";
  /* row 1: 4 + 3 + 3 columns, row 2: the featured card's 4 plus 2 + 2 + 2 */
  /* 20-column placement, matching the artwork: 01 spans cols 1-8 and overhangs
     into row 2, where 04 overlaps its notched corner. */
  const places = [
    "col-[9/15] row-[1]",   // 02
    "col-[15/21] row-[1]",  // 03
    "col-[6/11] row-[2]",   // 04 - tucks into 01's notch
    "col-[11/16] row-[2]",  // 05
    "col-[16/21] row-[2]",  // 06
  ];

  return (
    <section id="solutions" className="bg-sx-page pb-[clamp(0.5rem,3.2vh,4.5rem)] pt-[clamp(0.6rem,1.8vh,2.5rem)]">
      <div className={shell}>
        <div className="mx-auto max-w-[820px] text-center">
          {embedded && content.eyebrow ? (
            <span className="mb-2 block text-[10px] font-extrabold uppercase leading-tight tracking-[0.16em] text-sx-teal">
              {content.eyebrow}
            </span>
          ) : null}
          <Title className="text-[clamp(26px,min(3.4vw,5.4vh),50px)] font-bold leading-[1.1] tracking-[-0.03em] text-hx-ink">
            {content.pageTitle}<br />{content.pageHighlight}{content.pageAccent ? <span className="text-sx-teal">{content.pageAccent}</span> : null}
          </Title>
          <p className="mx-auto mt-2 max-w-[700px] whitespace-pre-line text-[clamp(11.5px,1.7vh,13px)] leading-[1.7] text-hx-copy">{content.pageBody}</p>
        </div>

        <div className="ap-sol-grid mt-[clamp(1.25rem,2.4vw,2rem)] grid gap-5">
          {featured && (
            <article
              id={featured.key}
              className="group relative col-[1/9] row-[1/3] flex min-h-[clamp(230px,40vh,360px)] self-start flex-col overflow-hidden rounded-[28px] bg-[linear-gradient(145deg,#013641_0%,#025b5f_55%,#0a7a70_100%)] p-[clamp(12px,2.5vh,28px)] text-white shadow-[0_0_60px_rgba(10,122,112,.20)]"
            >
              {/* flowing light traces, as in the artwork */}
              <svg aria-hidden="true" viewBox="0 0 620 460" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
                <g fill="none" stroke="#8ff3e0" strokeOpacity=".22">
                  <path d="M250 470 C 360 360, 400 250, 640 120" />
                  <path d="M280 470 C 390 370, 430 260, 660 150" />
                  <path d="M312 470 C 420 380, 462 274, 680 182" />
                  <path d="M344 470 C 452 392, 494 290, 700 214" />
                </g>
                <g fill="#a8f7e6">
                  <circle cx="470" cy="196" r="3.4" opacity=".8" />
                  <circle cx="536" cy="252" r="2.6" opacity=".6" />
                  <circle cx="418" cy="286" r="2.2" opacity=".5" />
                </g>
              </svg>

              <span className="relative inline-flex w-fit rounded-xl bg-white/15 px-3 py-1.5 text-[13px] font-bold tracking-[0.06em]">{featured.number}</span>
              <span className="relative mt-[clamp(8px,1.8vh,20px)] grid h-[clamp(52px,8vh,80px)] w-[clamp(52px,8vh,80px)] place-items-center rounded-[22px] bg-[linear-gradient(150deg,#13b9a0_0%,#0a6f63_100%)] shadow-[0_0_40px_rgba(19,185,160,.45)] ring-1 ring-white/35">
                <AP_Icon name={featured.icon} className="h-9 w-9 text-white" />
              </span>
              <h2 className="ap-sol-copy relative mt-[clamp(8px,1.8vh,20px)] w-[min(300px,58%)] text-[clamp(18px,min(2.1vw,3.4vh),30px)] font-bold leading-[1.16] tracking-[-0.02em] [overflow-wrap:normal]">{featured.title}</h2>
              <p className="ap-sol-copy relative mt-3 w-[min(300px,58%)] text-[clamp(11px,1.6vh,13px)] leading-[1.6] text-white/85">{featured.body}</p>
              <Link href="/#contact" className={`${exploreRow} ap-sol-copy relative w-fit text-white`}>
                <span>{explore}</span>
                <span className={`${arrowDisc} bg-white/20`}><AP_Icon name="arrow-right" className="h-4 w-4" /></span>
              </Link>
            </article>
          )}

          {/* white mask in card 04's cell: carves the notch out of card 01 so 04
              can overlap it, and stays aligned because it shares 04's grid area */}
          <span aria-hidden="true" className="ap-sol-mask col-[6/11] row-[2] -mt-5 -ml-5 rounded-tl-[40px] bg-sx-page" />

          {rest.map((item, index) => (
            <article
              key={item.key}
              id={item.key}
              className={`group relative ${places[index] ?? "row-[2]"} flex flex-col rounded-[28px] border border-sx-line bg-white p-[clamp(12px,2.5vh,28px)] shadow-[0_14px_34px_rgba(1,54,65,.07),0_1px_4px_rgba(1,54,65,.06)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_44px_rgba(1,54,65,.12)]`}
            >
              <span className="inline-flex w-fit rounded-xl bg-sx-mint px-3 py-1.5 text-[13px] font-bold tracking-[0.06em] text-sx-teal">{item.number}</span>
              <div className="mt-5 flex items-start gap-4">
                <span className="grid h-[clamp(46px,6.6vh,68px)] w-[clamp(46px,6.6vh,68px)] shrink-0 place-items-center rounded-[20px] bg-[linear-gradient(150deg,#eaf7f5,#d6efeb)]">
                  <AP_Icon name={item.icon} className="h-8 w-8 text-sx-teal" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-[clamp(14px,min(1.2vw,2.5vh),21px)] font-bold leading-[1.2] tracking-[-0.01em] text-hx-ink [overflow-wrap:normal]">{item.title}</h2>
                  <p className="mt-2 text-[clamp(11px,1.6vh,12.5px)] leading-[1.5] text-hx-copy">{item.body}</p>
                </div>
              </div>
              <Link href="/#contact" className={`${exploreRow} text-sx-teal hover:text-sx-tealDark`}>
                <span>{explore}</span>
                <span className={`${arrowDisc} bg-sx-teal text-white`}><AP_Icon name="arrow-right" className="h-3.5 w-3.5" /></span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function AP_Solutions({ content, standalone = false, embedded = false }: { content: SolutionsContent; standalone?: boolean; embedded?: boolean }) {
  if (standalone) return <SolutionsPage content={content} embedded={embedded} />;

  /* Home: label column beside a 3-up card grid. */
  return (
    <section id="solutions" className="border-b border-hx-line bg-white py-[clamp(2rem,4vw,3.5rem)]">
      <div className={`${shell} flex flex-wrap gap-x-10 gap-y-8`}>
        <div className="min-w-[min(300px,100%)] flex-1 basis-[22%]">
          <span className={eyebrow}>{content.eyebrow}</span>
          <h2 className="mt-3 text-[clamp(26px,2.4vw,34px)] font-bold leading-[1.15] tracking-[-0.02em] text-hx-ink">{content.title}</h2>
          <p className="mt-4 max-w-[420px] text-[13px] leading-[1.7] text-hx-copy">{content.body}</p>
          <Link href="/solutions" className="mt-5 inline-flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-hx-cyanInk transition-colors hover:text-[#00897E]">
            <span>{content.cta}</span><AP_Icon name="arrow-right" className="h-[13px] w-[13px]" />
          </Link>
        </div>

        <div className="flex min-w-[min(560px,100%)] flex-[2.4] basis-[70%] flex-wrap gap-5">
          {content.items.map((item) => (
            <article
              key={item.key}
              id={item.key}
              className="flex min-w-[min(240px,100%)] flex-1 basis-[calc(33.333%-14px)] flex-col rounded-xl border border-hx-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#bcdff2] hover:shadow-[0_14px_30px_rgba(11,34,51,.08)]"
            >
              <div className="flex items-center gap-3.5">
                <AP_Icon name={item.icon} className="h-[30px] w-[30px] shrink-0 text-hx-cyan" />
                <h3 className="min-w-0 text-[17px] font-bold leading-tight text-hx-ink">{item.title}</h3>
              </div>
              <p className="mt-3 text-[12.5px] leading-[1.6] text-hx-copy">{item.body}</p>
              <span aria-hidden="true" className="mt-auto flex justify-end pt-5 text-hx-cyanInk">
                <AP_Icon name="arrow-right" className="h-[18px] w-[18px]" />
              </span>
            </article>
          ))}
          {Array.from({ length: 2 }).map((_, ghost) => (
            <span key={`h-ghost-${ghost}`} aria-hidden="true" className="h-0 min-w-[min(240px,100%)] flex-1 basis-[calc(33.333%-14px)]" />
          ))}
        </div>
      </div>
    </section>
  );
}
