/**
 * Decorative featured-product preview (workflow designer + execution summary)
 * from the products reference. Replaceable via `products.featuredImage`.
 */
const NAV = ["Triggers", "Tasks", "Decisions", "Integrations", "Notifications"];
const SUMMARY = [
  { label: "Total Runs", value: "342", tone: "text-px-cyanInk" },
  { label: "Completed", value: "321", tone: "text-emerald-500" },
  { label: "In Progress", value: "18", tone: "text-amber-500" },
  { label: "Failed", value: "3", tone: "text-rose-500" },
];

function Node({ label, className = "" }: { label: string; className?: string }) {
  return <span className={`inline-flex items-center gap-1 rounded-md border border-px-line bg-white px-1.5 py-1 text-[6px] font-semibold text-px-ink shadow-sm ${className}`}>{label}</span>;
}

export default function AP_ProductPreview() {
  return (
    <div aria-hidden="true" className="flex w-full min-w-0 flex-wrap gap-2.5">
      {/* designer */}
      <div className="flex min-w-[min(300px,100%)] flex-1 basis-[62%] overflow-hidden rounded-xl border border-px-line bg-white shadow-[0_14px_34px_rgba(10,26,44,.09)]">
        <div className="w-[68px] shrink-0 border-r border-px-line p-2">
          <strong className="block text-[7.5px] font-bold text-px-ink">APEX Flow</strong>
          <small className="block text-[5px] text-px-muted">Automation Suite</small>
          <ul className="mt-2 flex flex-col gap-1.5">
            {NAV.map((n) => <li key={n} className="truncate text-[5.5px] text-px-muted">{n}</li>)}
          </ul>
        </div>
        <div className="min-w-0 flex-1 p-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <strong className="text-[7.5px] font-bold text-px-ink">Invoice Approval Process</strong>
            <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[5px] font-bold text-emerald-600">Active</span>
            <span className="ml-auto flex gap-1">
              <i className="rounded border border-px-line px-1.5 py-0.5 text-[5px] not-italic text-px-muted">Save</i>
              <i className="rounded border border-px-line px-1.5 py-0.5 text-[5px] not-italic text-px-muted">Publish</i>
            </span>
          </div>
          <div className="mt-1 flex gap-2 border-b border-px-line pb-1 text-[5.5px] text-px-muted">
            <span className="border-b border-px-cyan pb-1 font-bold text-px-cyanInk">Designer</span><span>Versions</span><span>Settings</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 py-2.5">
            <span className="rounded-md bg-emerald-500 px-2 py-1 text-[6px] font-bold text-white">Start</span>
            <span className="block h-2 w-px bg-px-line" />
            <Node label="Validate Invoice" />
            <span className="block h-2 w-px bg-px-line" />
            <Node label="Amount &gt; $10,000?" />
            <span className="flex w-full items-start justify-center gap-6">
              <span className="flex flex-col items-center gap-1"><i className="block h-2 w-px bg-px-line" /><Node label="Auto Approve" /></span>
              <span className="flex flex-col items-center gap-1"><i className="block h-2 w-px bg-px-line" /><Node label="Manager Approval" /></span>
            </span>
          </div>
        </div>
      </div>

      {/* execution summary */}
      <div className="min-w-[min(200px,100%)] flex-1 basis-[34%] rounded-xl border border-px-line bg-white p-2.5 shadow-[0_14px_34px_rgba(10,26,44,.09)]">
        <div className="flex items-center justify-between">
          <strong className="text-[7.5px] font-bold text-px-ink">Execution Summary</strong>
          <span className="rounded border border-px-line px-1.5 py-0.5 text-[5px] text-px-muted">Today</span>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {SUMMARY.map((s) => (
            <div key={s.label} className="min-w-[min(64px,100%)] flex-1 basis-[calc(25%-4.5px)]">
              <small className="block truncate text-[5px] text-px-muted">{s.label}</small>
              <b className={`block text-[13px] font-bold leading-tight ${s.tone}`}>{s.value}</b>
              <i className={`mt-0.5 block h-0.5 w-4 rounded-full bg-current ${s.tone}`} />
            </div>
          ))}
        </div>
        <svg viewBox="0 0 220 54" className="mt-2 w-full" preserveAspectRatio="none">
          <path d="M0 44 L20 40 L40 46 L60 34 L80 38 L100 24 L120 32 L140 14 L160 30 L180 20 L200 26 L220 10" fill="none" stroke="#14b8a6" strokeWidth="1.6" />
        </svg>
        <div className="flex justify-between text-[5px] text-px-muted"><span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>12 AM</span></div>
      </div>
    </div>
  );
}
