import type { TrustContent } from "@/shared/types";
import AP_Icon from "@/app/components/AP_Icon";

/*
 * No media queries. Each group carries a minimum wide enough to hold its items
 * on a single line, so a cramped row moves the whole group to its own line
 * instead of orphaning its last item.
 */
const shell = "mx-auto w-[min(1640px,86%)]";
const STAT_ICONS = ["trend-up", "users", "building", "check-circle"] as const;

export default function AP_TrustStrip({ trust }: { trust?: TrustContent }) {
  if (!trust) return null;
  const { eyebrow, clients = [], stats = [] } = trust;

  return (
    <section className="bg-white pb-[clamp(1.5rem,3vw,2.5rem)]" aria-label={eyebrow}>
      <div className={shell}>
        <div className="rounded-2xl border border-hx-line bg-white px-[clamp(1rem,2.2vw,2rem)] py-[clamp(1rem,1.8vw,1.5rem)] shadow-[0_10px_30px_rgba(11,34,51,.05)]">
          {/* clients */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-4">
            <span className="min-w-[min(170px,100%)] max-w-[210px] flex-1 text-[11px] font-extrabold uppercase leading-[1.45] tracking-[0.12em] text-hx-cyanInk">
              {eyebrow}
            </span>
            <div className="flex min-w-[min(680px,100%)] flex-[3] flex-wrap items-center justify-around gap-y-3">
              {clients.map((client, index) => (
                <span
                  key={client}
                  className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap px-3 text-[14px] font-bold text-hx-ink ${index ? "border-l border-hx-line" : ""}`}
                >
                  <AP_Icon name="grid" className="h-[18px] w-[18px] shrink-0 text-hx-cyan" />{client}
                </span>
              ))}
            </div>
          </div>

          {stats.length > 0 && (
            <>
              <span aria-hidden="true" className="mt-[clamp(0.75rem,1.4vw,1.25rem)] block h-px w-full bg-hx-line" />
              <div className="flex flex-wrap gap-y-4 pt-[clamp(0.75rem,1.4vw,1.25rem)]">
                {stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`flex min-w-[min(200px,50%)] flex-1 basis-1/4 items-center gap-3 px-[clamp(0.5rem,1.5vw,1.25rem)] ${index ? "border-l border-hx-line" : ""}`}
                  >
                    <span className="grid h-[38px] w-[38px] shrink-0 place-items-center rounded-lg bg-hx-tint text-hx-cyanInk">
                      <AP_Icon name={STAT_ICONS[index % STAT_ICONS.length]} className="h-[19px] w-[19px]" />
                    </span>
                    <span className="min-w-0">
                      <strong className="block text-[22px] font-bold leading-none tracking-[-0.02em] text-hx-cyanInk">{stat.value}</strong>
                      <small className="mt-1 block whitespace-nowrap text-[11px] text-hx-copy">{stat.label}</small>
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
