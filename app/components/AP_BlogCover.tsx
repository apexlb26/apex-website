/** Abstract cover art used until a post image is set in the CMS. */
const PALETTES = [
  ["#e7f3fb", "#cfe6f6", "#1f8fce"],
  ["#eef6fb", "#dbecf7", "#38b6d8"],
  ["#e9f2f9", "#d3e6f4", "#2f7fb8"],
  ["#e6f1f8", "#cde3f2", "#1e6f9f"],
  ["#edf6fb", "#d8eaf6", "#33a2cc"],
];

export default function AP_BlogCover({ variant = 0 }: { variant?: number | "feature" }) {
  const index = variant === "feature" ? 0 : Number(variant) % PALETTES.length;
  const [from, to, ink] = PALETTES[index];
  const id = `cover-${String(variant)}`;
  return (
    <svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop stopColor={from} /><stop offset="1" stopColor={to} /></linearGradient>
      </defs>
      <rect width="400" height="200" fill={`url(#${id})`} />
      {/* skyline / structure motif */}
      <g fill="#ffffff" fillOpacity=".62">
        <rect x="40" y="96" width="52" height="104" rx="4" />
        <rect x="102" y="62" width="66" height="138" rx="4" />
        <rect x="178" y="112" width="44" height="88" rx="4" />
      </g>
      <g stroke={ink} strokeOpacity=".38" fill="none" strokeWidth="1.4">
        {Array.from({ length: 5 }).map((_, r) => <path key={r} d={`M108 ${78 + r * 22}h54`} />)}
        {Array.from({ length: 4 }).map((_, r) => <path key={`a-${r}`} d={`M46 ${112 + r * 20}h40`} />)}
      </g>
      <path d="M0 200 L400 200 L400 168 C 330 176, 260 150, 190 160 C 120 170, 60 154, 0 172 Z" fill="#ffffff" fillOpacity=".5" />
    </svg>
  );
}
