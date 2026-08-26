import { getCmsContent } from "@/shared/content";
import type { AP_IconName, ProductHighlight, ProductItem, ProductStat } from "@/shared/types";
import AP_Icon from "@/app/components/AP_Icon";
import AP_ProductConsole from "@/app/components/AP_ProductConsole";
import AP_ProductPreview from "@/app/components/AP_ProductPreview";
import AP_TrustStrip from "@/app/components/AP_TrustStrip";

const ITEM_ICONS: AP_IconName[] = ["flow", "chart", "sparkles", "layers"];

/*
 * Same layout contract as the careers page: no media queries anywhere.
 * Rows are `flex flex-wrap`; children carry a flex-basis plus
 * `min-w-[min(Npx,100%)]` so they wrap on their own and still shrink when
 * alone on a line. Zero-height ghost items close each wrapping row so a
 * partly filled last line keeps the column width of the rows above.
 */
const shell = "mx-auto w-[min(1640px,86%)]";
const eyebrow = "block text-[10px] font-extrabold uppercase leading-tight tracking-[0.14em] text-px-cyan2";
const button = "inline-flex h-[34px] items-center justify-center gap-2 rounded px-[18px] text-[10.5px] font-extrabold uppercase tracking-[0.08em] transition-colors [&_svg]:h-[13px] [&_svg]:w-[13px]";
const textLink = "inline-flex items-center gap-2 text-[10.5px] font-extrabold text-px-cyanInk transition-colors hover:text-[#00897E] [&_svg]:h-[13px] [&_svg]:w-[13px]";
const split = "flex flex-wrap gap-x-2.5 gap-y-5";
const splitLabel = "min-w-[min(16rem,100%)] shrink-0 grow-0 basis-64";
const splitBody = "min-w-[min(560px,100%)] flex-1";

export default async function AP_ProductsSections({ embedded = false }: { embedded?: boolean }) {
  const { data } = await getCmsContent("en");
  const Wrapper = embedded ? "div" : "main";
  const Title = embedded ? "h2" : "h1";
  const page = data.products;

  const items: ProductItem[] = page.items ?? [];
  const highlights: ProductHighlight[] = page.heroHighlights ?? [];
  const deployItems: ProductHighlight[] = page.deployItems ?? [];
  const stats: ProductStat[] = page.stats ?? [];
  const clients = page.clients ?? [];
  const outcome = page.flowOutcome ?? [];
  const flow = (page.flowOrder ?? items.map((item) => item.name))
    .map((name) => items.find((item) => item.name === name))
    .filter((item): item is ProductItem => Boolean(item));

  return (
    <>
      <Wrapper className="bg-white text-px-ink" id="products">
        {/* ---------- hero ---------- */}
        <section className="border-b border-px-line bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfe_100%)]">
          <div className={`${shell} flex flex-wrap items-center gap-x-10 gap-y-8 py-9`}>
            <div className="min-w-[min(460px,100%)] flex-1 basis-[44%]">
              <span className={eyebrow}>{page.eyebrow}</span>
              <Title className="mt-3.5 text-[clamp(34px,3.4vw,54px)] font-bold leading-[1.04] tracking-[-0.03em] text-px-ink">
                {page.title}<br /><span className="text-px-cyanInk">{page.highlight}</span>
              </Title>
              <p className="mt-4 max-w-[560px] text-sm leading-[1.75] text-px-copy">{page.body}</p>

              <div className="mt-7 flex flex-wrap gap-y-4">
                {highlights.map((highlight, index) => (
                  <div key={highlight.title} className="flex min-w-[min(160px,32%)] flex-1 basis-1/3 items-start gap-2.5 border-l border-px-line px-3 first:border-l-0 first:pl-0">
                    <AP_Icon name={highlight.icon ?? (["box", "sliders", "shield-check"] as AP_IconName[])[index % 3]} className="mt-0.5 h-[22px] w-[22px] shrink-0 text-px-cyan2" />
                    <div className="min-w-0">
                      <strong className="block text-xs font-bold text-px-ink">{highlight.title}</strong>
                      <p className="mt-1 text-[11px] leading-[1.45] text-px-copy">{highlight.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-[min(420px,100%)] flex-1 basis-[52%]">
              {page.heroImage
                ? <img src={page.heroImage} alt={page.heroImageAlt ?? ""} className="w-full rounded-xl border border-px-line object-cover shadow-[0_18px_44px_rgba(10,26,44,.12)]" />
                : <AP_ProductConsole />}
            </div>
          </div>
        </section>

        {/* ---------- product suite ---------- */}
        <section id="product-suite" className="border-b border-px-line bg-white py-7">
          <div className={shell}>
            <span className={eyebrow}>{page.suiteEyebrow}</span>
            <h2 className="mt-2 text-[22px] font-bold tracking-[-0.02em]">{page.suiteTitle}</h2>

            <div className="mt-5 flex flex-wrap gap-4">
              {items.length ? items.map((item, index) => (
                <article key={item.name} className="flex min-w-[min(260px,100%)] flex-1 basis-[calc(25%-12px)] flex-col rounded-xl border border-px-line bg-white p-4 shadow-[0_6px_20px_rgba(10,26,44,.04)] transition hover:-translate-y-0.5 hover:border-[#c6e0f0] hover:shadow-[0_14px_30px_rgba(10,26,44,.09)]">
                  <div className="flex flex-wrap items-start gap-3">
                    <span className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-lg bg-px-tint text-px-cyan2">
                      <AP_Icon name={item.icon ?? ITEM_ICONS[index % ITEM_ICONS.length]} className="h-[22px] w-[22px]" />
                    </span>
                    <div className="min-w-[min(140px,100%)] flex-1">
                      <strong className="block text-[15px] font-bold leading-tight text-px-ink">{item.name}</strong>
                      <small className="mt-0.5 block text-[11px] font-semibold text-px-copy">{item.category}</small>
                    </div>
                  </div>
                  <p className="mt-3 text-[11.5px] leading-[1.55] text-px-copy">{item.body}</p>
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {item.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-[11px] leading-[1.45] text-px-copy">
                        <AP_Icon name="check-circle" className="mt-[1px] h-3.5 w-3.5 shrink-0 text-px-cyan2" />{feature}
                      </li>
                    ))}
                  </ul>
                  <a href="#cta" className={`${textLink} mt-auto pt-4`}><span>{item.cta ?? `Explore ${item.name}`}</span><AP_Icon name="arrow-right" /></a>
                </article>
              )) : (
                <div className="flex min-h-[150px] w-full flex-wrap items-center justify-center gap-4 rounded-xl border border-dashed border-[#bcdde6] bg-px-band p-7">
                  <AP_Icon name="box" className="h-8 w-8 shrink-0 text-px-cyan2" />
                  <div className="min-w-[min(280px,100%)]">
                    <strong className="block text-sm text-px-ink">{page.emptyTitle}</strong>
                    <p className="mt-1 max-w-[540px] text-[11.5px] leading-[1.55] text-px-copy">{page.emptyBody}</p>
                  </div>
                </div>
              )}
              {Array.from({ length: 3 }).map((_, ghost) => <span key={`ghost-${ghost}`} aria-hidden="true" className="h-0 min-w-[min(260px,100%)] flex-1 basis-[calc(25%-12px)]" />)}
            </div>
          </div>
        </section>

        {/* ---------- how the products work together ---------- */}
        {flow.length > 0 && (
          <section className="border-b border-px-line bg-px-band2 py-6">
            <div className={shell}>
              <div className={`${split} items-center`}>
                <div className={splitLabel}>
                  <span className={eyebrow}>{page.flowEyebrow ?? "How our products work together"}</span>
                  <h2 className="mt-[7px] text-[19px] font-bold leading-[1.25] tracking-[-0.02em]">{page.flowTitle}</h2>
                </div>
                <div className={`${splitBody} flex flex-wrap items-stretch gap-y-3`}>
                  {flow.map((item, index) => (
                    <div key={`flow-${item.name}`} className="flex min-w-[min(160px,100%)] flex-1 items-stretch gap-2">
                      <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-px-line bg-white px-3 py-2.5">
                        <AP_Icon name={item.icon ?? ITEM_ICONS[index % ITEM_ICONS.length]} className="h-5 w-5 shrink-0 text-px-cyan2" />
                        <span className="min-w-0">
                          <strong className="block truncate text-[11.5px] font-bold text-px-ink">{item.name}</strong>
                          <small className="block truncate text-[10px] text-px-copy">{item.category}</small>
                        </span>
                      </div>
                      {/* only draw an arrow when something actually follows */}
                      {(index < flow.length - 1 || outcome.length > 0) && (
                        <AP_Icon name="arrow-right" className="h-3 w-3 shrink-0 self-center text-[#8dc0d3]" />
                      )}
                    </div>
                  ))}
                  {outcome.length > 0 && (
                    <div className="flex min-w-[min(160px,100%)] flex-1 items-center gap-2.5 rounded-lg border border-px-cyan2/40 bg-white px-3 py-2.5">
                      <AP_Icon name="users" className="h-6 w-6 shrink-0 text-px-cyan2" />
                      <span className="min-w-0">
                        {outcome.map((line) => <strong key={line} className="block truncate text-[10.5px] font-bold leading-[1.35] text-px-ink">{line}</strong>)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ---------- deploy your way ---------- */}
        <section className="border-b border-px-line bg-white py-7">
          <div className={`${shell} flex flex-wrap gap-x-8 gap-y-6`}>
            <div className="min-w-[min(280px,100%)] flex-1 basis-[22%]">
              <span className={eyebrow}>{page.deployEyebrow ?? "Deploy your way"}</span>
              <h2 className="mt-2 text-[22px] font-bold leading-[1.2] tracking-[-0.02em]">{page.deployTitle}</h2>
              <p className="mt-3 text-[11.5px] leading-[1.6] text-px-copy">{page.deployBody}</p>
            </div>

            <div className="flex min-w-[min(480px,100%)] flex-[2] basis-[52%] flex-wrap rounded-xl border border-px-line bg-px-band px-2 py-4">
              {deployItems.map((item, index) => (
                <div key={item.title} className="flex min-w-[min(150px,24%)] flex-1 basis-1/4 items-start gap-2 border-l border-px-line px-3 first:border-l-0 first:pl-0">
                  <AP_Icon name={item.icon ?? (["box", "lock", "rocket", "nodes"] as AP_IconName[])[index % 4]} className="mt-0.5 h-[18px] w-[18px] shrink-0 text-px-cyan2" />
                  <div className="min-w-0">
                    <strong className="block text-[11.5px] font-bold text-px-ink">{item.title}</strong>
                    <p className="mt-1 text-[10.5px] leading-[1.45] text-px-copy">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="min-w-[min(240px,100%)] flex-1 basis-[20%] rounded-xl border border-px-line bg-white p-4">
              <strong className="block text-[13px] font-bold text-px-ink">{page.deployCardTitle ?? "See it in your brand"}</strong>
              <p className="mt-2 text-[11px] leading-[1.55] text-px-copy">{page.deployCardBody}</p>
              <a href="#cta" className={`${button} mt-4 bg-px-cyan2 text-white hover:bg-[#00695F]`}>
                <span>{page.deployCardCta ?? "Book a demo"}</span><AP_Icon name="arrow-right" />
              </a>
            </div>
          </div>
        </section>

        {/* ---------- featured product ---------- */}
        {page.featuredName && (
          <section className="border-b border-px-line bg-px-band py-7">
            <div className={`${shell} flex flex-wrap gap-x-8 gap-y-6`}>
              <div className="min-w-[min(280px,100%)] flex-1 basis-[20%]">
                <span className={eyebrow}>{page.featuredEyebrow ?? "Featured product"}</span>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <AP_Icon name="flow" className="h-8 w-8 shrink-0 text-px-cyan2" />
                  <div className="min-w-0">
                    <strong className="block text-[22px] font-bold leading-tight tracking-[-0.02em] text-px-ink">{page.featuredName}</strong>
                    <small className="block text-[11.5px] font-semibold text-px-cyanInk">{page.featuredCategory}</small>
                  </div>
                </div>
                <p className="mt-3 text-[11.5px] leading-[1.6] text-px-copy">{page.featuredBody}</p>
              </div>

              <div className="min-w-[min(240px,100%)] flex-1 basis-[20%]">
                <strong className="block text-[11.5px] font-bold text-px-ink">{page.featuredCapabilitiesLabel ?? "Key capabilities"}</strong>
                <ul className="mt-3 flex flex-col gap-2">
                  {(page.featuredCapabilities ?? []).map((capability) => (
                    <li key={capability} className="flex items-start gap-2 text-[11px] leading-[1.45] text-px-copy">
                      <AP_Icon name="check-circle" className="mt-[1px] h-3.5 w-3.5 shrink-0 text-px-cyan2" />{capability}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="min-w-[min(420px,100%)] flex-[2] basis-[50%]">
                {page.featuredImage
                  ? <img src={page.featuredImage} alt={page.featuredImageAlt ?? ""} className="w-full rounded-xl border border-px-line object-cover shadow-[0_14px_34px_rgba(10,26,44,.09)]" />
                  : <AP_ProductPreview />}
              </div>
            </div>
          </section>
        )}

        {/* ---------- cta band ---------- */}
        <section id="cta" className="relative overflow-hidden bg-[linear-gradient(90deg,#00587e_0%,#00668f_55%,#01739f_100%)] text-white">
          <span aria-hidden="true" className="ap-px-dots pointer-events-none absolute inset-y-0 left-[40%] right-0" />
          <div className={`${shell} relative z-[1] flex flex-wrap items-center gap-x-8 gap-y-4 py-6`}>
            <div className="min-w-[min(340px,100%)] flex-1">
              <strong className="block text-[19px] font-bold tracking-[-0.01em]">{page.ctaTitle}</strong>
              <p className="mt-1.5 text-[12px] text-white/85">{page.ctaBody}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-3">
              <a href="/#contact" className={`${button} bg-white text-px-deep hover:bg-[#e8f4fa]`}><span>{page.ctaPrimary ?? "Book a demo"}</span><AP_Icon name="arrow-right" /></a>
              <a href="/#contact" className={`${button} border border-white/60 text-white hover:bg-white/10`}><span>{page.ctaSecondary ?? "Talk to an expert"}</span><AP_Icon name="arrow-right" /></a>
            </div>
          </div>
        </section>

        {/* ---------- trust strip: shared component, same as home and solutions ---------- */}
        {/* page-level chrome: the home page already ends with its own closing band */}
        {!embedded && <AP_TrustStrip trust={{ eyebrow: page.trustEyebrow ?? "", clients, stats }} />}
      </Wrapper>    </>
  );
}
