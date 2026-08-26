import { getCmsContent } from "@/shared/content";
import type { BlogMilestone, BlogUpdate } from "@/shared/types";
import AP_Icon from "@/app/components/AP_Icon";
import AP_SubscribeForm from "@/app/components/AP_SubscribeForm";
import AP_BlogNetwork from "@/app/components/AP_BlogNetwork";
import AP_BlogCover from "@/app/components/AP_BlogCover";

/*
 * No media queries anywhere. Rows are `flex flex-wrap`; children carry a
 * flex-basis plus `min-w-[min(Npx,100%)]` so they wrap on their own and still
 * shrink when alone on a line. Spacing uses clamp().
 */
const shell = "mx-auto w-[min(1640px,86%)]";
const eyebrow = "block text-[10px] font-extrabold uppercase leading-tight tracking-[0.14em] text-hx-cyanInk";
const readMore = "mt-auto inline-flex items-center gap-1.5 pt-3 text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-hx-cyanInk hover:text-[#00897E]";

export default async function AP_BlogsSections({ embedded = false }: { embedded?: boolean }) {
  const { data } = await getCmsContent("en");
  const Wrapper = embedded ? "div" : "main";
  const Title = embedded ? "h2" : "h1";
  const page = data.blogs;
  const featured = page.featured;
  const updates: BlogUpdate[] = page.updates ?? [];
  const milestones: BlogMilestone[] = page.milestones ?? [];
  const categories = page.categories ?? [];

  return (
    <>
      <Wrapper className="bg-white text-hx-ink" id="blogs">
        {/* ---------- hero ---------- */}
        <section className="bg-[linear-gradient(180deg,#ffffff_0%,#f7fbfe_100%)]">
          <div className={`${shell} flex flex-wrap items-center gap-x-10 gap-y-8 py-[clamp(2rem,3.5vw,3rem)]`}>
            <div className="min-w-[min(420px,100%)] flex-1 basis-[46%]">
              <span className={eyebrow}>{page.eyebrow}</span>
              <Title className="mt-3 text-[clamp(30px,3.1vw,46px)] font-bold leading-[1.1] tracking-[-0.03em] text-hx-ink">
                {page.title}<br /><span className="text-hx-cyanInk">{page.highlight}</span>
              </Title>
              <p className="mt-4 max-w-[480px] text-[12.5px] leading-[1.7] text-hx-copy">{page.body}</p>
              <div className="mt-5 max-w-[420px]">
                <AP_SubscribeForm placeholder={page.subscribePlaceholder} cta={page.subscribeCta} />
              </div>
              <p className="mt-3 flex items-center gap-2 text-[10.5px] text-hx-muted">
                <AP_Icon name="shield-check" className="h-3.5 w-3.5 shrink-0 text-hx-cyan" />{page.privacyNote}
              </p>
            </div>
            <div className="min-w-[min(380px,100%)] flex-1 basis-[48%]"><AP_BlogNetwork /></div>
          </div>
        </section>

        {/* ---------- featured + sidebar ---------- */}
        <section className={`${shell} flex flex-wrap items-start gap-x-6 gap-y-6 pb-[clamp(1.5rem,3vw,2.5rem)]`}>
          <div className="flex min-w-[min(560px,100%)] flex-[2.6] basis-[68%] flex-col gap-5">
            {featured && (
              <article className="flex flex-wrap overflow-hidden rounded-xl border border-hx-line bg-white">
                <div className="flex min-w-[min(280px,100%)] flex-1 basis-[42%] flex-col justify-center p-5">
                  <span className={eyebrow}>{featured.label}</span>
                  <h2 className="mt-2.5 text-[clamp(18px,1.7vw,23px)] font-bold leading-[1.25] tracking-[-0.02em] text-hx-ink">{featured.title}</h2>
                  <p className="mt-2.5 max-w-[380px] text-[11px] leading-[1.55] text-hx-copy">{featured.body}</p>
                  <span className={`${readMore} mt-3`}>{featured.cta}<AP_Icon name="arrow-right" className="h-3 w-3" /></span>
                </div>
                <div className="relative min-h-[190px] min-w-[min(260px,100%)] flex-1 basis-[54%] self-stretch overflow-hidden bg-hx-tint">
                  <div className="absolute inset-0 [&>img]:h-full [&>img]:w-full [&>img]:object-cover [&>svg]:h-full [&>svg]:w-full">
                    {featured.image ? <img src={featured.image} alt={featured.title} /> : <AP_BlogCover variant="feature" />}
                  </div>
                  <div className="absolute inset-y-0 right-0 flex w-[52%] flex-col items-center justify-center gap-2 px-4 text-center">
                    <strong className="text-[clamp(24px,2.6vw,38px)] font-bold leading-none tracking-[-0.03em] text-hx-cyanInk">{featured.statValue}</strong>
                    <small className="text-[10px] font-bold uppercase tracking-[0.12em] text-hx-ink">{featured.statLabel}</small>
                    {featured.badge && <span className="mt-1 rounded-full bg-[#0b2233] px-3 py-1.5 text-[10px] font-semibold text-white">{featured.badge}</span>}
                  </div>
                </div>
              </article>
            )}

            {/* category filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <span
                  key={category}
                  className={index === 0
                    ? "rounded-md bg-hx-cyan2 px-3.5 py-2 text-[10.5px] font-bold text-white"
                    : "rounded-md border border-hx-line bg-white px-3.5 py-2 text-[10.5px] font-bold text-hx-copy"}
                >{category}</span>
              ))}
            </div>

            {/* update cards */}
            <div className="flex flex-wrap gap-4">
              {updates.length ? updates.map((update, index) => (
                <article key={update.title} className="flex min-w-[min(132px,100%)] flex-1 basis-[calc(20%-13px)] flex-col overflow-hidden rounded-xl border border-hx-line bg-white transition hover:-translate-y-0.5 hover:border-[#bcdff2] hover:shadow-[0_14px_30px_rgba(11,34,51,.08)]">
                  <div className="h-[84px] w-full shrink-0 overflow-hidden bg-hx-tint">
                    {update.image ? <img src={update.image} alt={update.title} className="h-full w-full object-cover" /> : <AP_BlogCover variant={index} />}
                  </div>
                  <div className="flex flex-1 flex-col p-3.5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-[0.1em] text-hx-cyanInk">{update.category}</span>
                      <span className="text-[10px] text-hx-muted">{update.date}</span>
                    </div>
                    <h3 className="mt-2 text-[12px] font-bold leading-[1.3] text-hx-ink">{update.title}</h3>
                    <p className="mt-1.5 text-[10px] leading-[1.5] text-hx-copy">{update.body}</p>
                    <span className={readMore}>{update.cta ?? ""}<AP_Icon name="arrow-right" className="h-3 w-3" /></span>
                  </div>
                </article>
              )) : (
                <div className="flex w-full flex-wrap items-center justify-center gap-4 rounded-xl border border-dashed border-[#bcdde6] bg-hx-band p-7">
                  <AP_Icon name="layers" className="h-8 w-8 shrink-0 text-hx-cyan" />
                  <div className="min-w-[min(280px,100%)]">
                    <strong className="block text-sm text-hx-ink">{page.emptyTitle}</strong>
                    <p className="mt-1 max-w-[540px] text-[11.5px] leading-[1.55] text-hx-copy">{page.emptyBody}</p>
                  </div>
                </div>
              )}
              {Array.from({ length: 4 }).map((_, ghost) => <span key={`ghost-${ghost}`} aria-hidden="true" className="h-0 min-w-[min(132px,100%)] flex-1 basis-[calc(20%-13px)]" />)}
            </div>
          </div>

          {/* sidebar */}
          <aside className="flex min-w-[min(280px,100%)] flex-1 basis-[28%] flex-col gap-5">
            <div className="rounded-xl border border-hx-line bg-white p-5">
              <span className={eyebrow}>{page.milestonesTitle}</span>
              <ol className="mt-4 flex list-none flex-col gap-4 p-0">
                {milestones.map((milestone, index) => (
                  <li key={milestone.title} className="relative flex gap-3 pl-0">
                    <span className="relative flex flex-col items-center">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-hx-tint text-hx-cyanInk">
                        <AP_Icon name={milestone.icon ?? "spark"} className="h-4 w-4" />
                      </span>
                      {index < milestones.length - 1 && <span aria-hidden="true" className="mt-1 w-px flex-1 bg-hx-line" />}
                    </span>
                    <div className="min-w-0 pb-1">
                      <span className="block text-[10px] font-extrabold uppercase tracking-[0.1em] text-hx-cyanInk">{milestone.date}</span>
                      <strong className="mt-1 block text-[11.5px] font-bold leading-[1.3] text-hx-ink">{milestone.title}</strong>
                      <p className="mt-1 text-[10px] leading-[1.45] text-hx-copy">{milestone.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <span className={`${readMore} mt-4`}>{page.milestonesCta}<AP_Icon name="arrow-right" className="h-3 w-3" /></span>
            </div>

            <div className="rounded-xl border border-hx-line bg-white p-5">
              <div className="flex items-start gap-3">
                <AP_Icon name="mail" className="mt-0.5 h-6 w-6 shrink-0 text-hx-cyan" />
                <div className="min-w-0">
                  <strong className="block text-[13px] font-bold text-hx-ink">{page.subscribeTitle}</strong>
                  <p className="mt-1.5 text-[10.5px] leading-[1.5] text-hx-copy">{page.subscribeBody}</p>
                </div>
              </div>
              <div className="mt-4"><AP_SubscribeForm placeholder={page.subscribePlaceholder} cta={page.subscribeCta} /></div>
              <p className="mt-2.5 flex items-center gap-2 text-[10px] text-hx-muted">
                <AP_Icon name="shield-check" className="h-3 w-3 shrink-0 text-hx-cyan" />{page.privacyNote}
              </p>
            </div>
          </aside>
        </section>

        {/* ---------- closing newsletter band ---------- */}
        <section className="border-t border-hx-line bg-[linear-gradient(180deg,#f2fafd,#e6f4fb)] py-[clamp(1.75rem,3.5vw,2.75rem)]">
          <div className={`${shell} flex flex-wrap items-center justify-center gap-x-10 gap-y-5 text-center`}>
            <div className="min-w-[min(320px,100%)] flex-1">
              <span className={eyebrow}>{page.bottomEyebrow}</span>
              <h2 className="mt-2 text-[clamp(19px,1.9vw,25px)] font-bold leading-[1.25] tracking-[-0.02em] text-hx-ink">{page.bottomTitle}</h2>
              <p className="mt-2 text-[11px] leading-[1.55] text-hx-copy">{page.bottomBody}</p>
            </div>
            <div className="min-w-[min(300px,100%)] flex-1">
              <AP_SubscribeForm placeholder={page.subscribePlaceholder} cta={page.subscribeCta} />
              <p className="mt-2.5 flex items-center justify-center gap-2 text-[10px] text-hx-muted">
                <AP_Icon name="shield-check" className="h-3 w-3 shrink-0 text-hx-cyan" />{page.privacyNote}
              </p>
            </div>
          </div>
        </section>
      </Wrapper>    </>
  );
}
