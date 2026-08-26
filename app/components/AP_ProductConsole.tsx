/**
 * Decorative "APEX Command Center" console from the products reference.
 * Purely presentational — set `products.heroImage` in the CMS to replace it
 * with a real screenshot.
 */
const TILES = [
  { label: "System Health", value: "98%", tag: "Healthy" },
  { label: "Active Workflows", value: "1,248", tag: "+12%" },
  { label: "Automation Rate", value: "87%", tag: "+9%" },
  { label: "Data Processed", value: "2.4 TB", tag: "+18%" },
];

const CATEGORIES = [
  { label: "Operations", value: "45%", w: "45%" },
  { label: "Analytics", value: "28%", w: "28%" },
  { label: "AI Services", value: "17%", w: "17%" },
  { label: "Integration", value: "10%", w: "10%" },
];

const ACTIVITY = [
  { title: "Invoice Processing Workflow", meta: "Completed · 2 min ago", tone: "text-emerald-500" },
  { title: "Customer Onboarding Flow", meta: "Completed · 5 min ago", tone: "text-emerald-500" },
  { title: "Anomaly Detection Alert", meta: "High · 12 min ago", tone: "text-rose-500" },
];

export default function AP_ProductConsole() {
  return (
    <div aria-hidden="true" className="flex w-full min-w-0 overflow-hidden rounded-xl border border-px-line bg-white shadow-[0_18px_44px_rgba(10,26,44,.12)]">
      {/* rail */}
      <div className="flex w-9 shrink-0 flex-col items-center gap-3.5 bg-[#10232f] py-3">
        <span className="h-4 w-4 rounded bg-px-cyan2/70" />
        {Array.from({ length: 5 }).map((_, i) => <span key={i} className="h-3 w-3 rounded-sm bg-white/15" />)}
      </div>

      <div className="min-w-0 flex-1 p-2.5">
        <div className="mb-2 flex items-center justify-between">
          <strong className="truncate text-[9px] font-bold text-px-ink">APEX Command Center</strong>
          <span className="flex gap-1">{Array.from({ length: 3 }).map((_, i) => <i key={i} className="block h-1 w-1 rounded-full bg-px-line" />)}</span>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {TILES.map((tile) => (
            <div key={tile.label} className="min-w-[min(90px,100%)] flex-1 basis-[calc(25%-4.5px)] rounded-md border border-px-line px-2 py-1.5">
              <span className="block truncate text-[6px] text-px-muted">{tile.label}</span>
              <span className="mt-0.5 flex items-baseline gap-1">
                <b className="text-[13px] font-bold leading-none text-px-ink">{tile.value}</b>
                <i className="text-[5.5px] not-italic text-px-cyanInk">{tile.tag}</i>
              </span>
            </div>
          ))}
        </div>

        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {/* line chart */}
          <div className="min-w-[min(150px,100%)] flex-1 basis-[42%] rounded-md border border-px-line p-2">
            <span className="block text-[6.5px] font-bold text-px-ink">Workflow Activity</span>
            <svg viewBox="0 0 220 66" className="mt-1 w-full" preserveAspectRatio="none">
              <path d="M0 58 L28 50 L56 52 L84 36 L112 30 L140 20 L168 22 L196 12 L220 8" fill="none" stroke="#1f8fce" strokeWidth="2" />
              <path d="M0 58 L28 50 L56 52 L84 36 L112 30 L140 20 L168 22 L196 12 L220 8 V66 H0Z" fill="#1f8fce" fillOpacity=".08" />
            </svg>
            <div className="mt-1 flex gap-2.5 text-[5.5px] text-px-muted">
              <span className="flex items-center gap-1"><i className="block h-1 w-1 rounded-full bg-px-cyan2" />Completed</span>
              <span className="flex items-center gap-1"><i className="block h-1 w-1 rounded-full bg-px-line" />In Progress</span>
            </div>
          </div>

          {/* categories */}
          <div className="min-w-[min(130px,100%)] flex-1 basis-[30%] rounded-md border border-px-line p-2">
            <span className="block text-[6.5px] font-bold text-px-ink">Automation by Category</span>
            <ul className="mt-1.5 flex flex-col gap-1">
              {CATEGORIES.map((c) => (
                <li key={c.label} className="flex items-center gap-1.5 text-[5.5px] text-px-muted">
                  <span className="w-12 shrink-0 truncate">{c.label}</span>
                  <span className="h-1 flex-1 rounded-full bg-px-tint"><i className="block h-1 rounded-full bg-px-cyan2" style={{ width: c.w }} /></span>
                  <b className="shrink-0 font-semibold text-px-ink">{c.value}</b>
                </li>
              ))}
            </ul>
          </div>

          {/* activity */}
          <div className="min-w-[min(130px,100%)] flex-1 basis-[24%] rounded-md border border-px-line p-2">
            <span className="block text-[6.5px] font-bold text-px-ink">Recent Activity</span>
            <ul className="mt-1.5 flex flex-col gap-1.5">
              {ACTIVITY.map((a) => (
                <li key={a.title} className="flex gap-1">
                  <i className={`mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-current ${a.tone}`} />
                  <span className="min-w-0">
                    <b className="block truncate text-[5.5px] font-bold text-px-ink">{a.title}</b>
                    <small className="block truncate text-[5px] text-px-muted">{a.meta}</small>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
