/**
 * Vector rebuild of the hero artwork: an isometric "AI operating system" stack
 * ringed by floating capability cards. Drawn as SVG so it stays sharp at any
 * size or zoom — the bitmap reference is a compressed 1600x900 export whose
 * illustration held only ~836px of real detail.
 *
 * Layer and card labels come from `hero.architecture` / `hero.architectureCards`.
 */
const DEFAULT_LAYERS = ["AI OPERATING SYSTEM", "WORKFLOW ENGINE", "DATA LAYER", "INTEGRATION LAYER"];
const DEFAULT_CARDS = ["AUTOMATION", "ANALYTICS", "DATA", "AI MODELS", "INTEGRATIONS"];

const CX = 520;
/* isometric projection of an axis-aligned square: 2:1 rhombus */
const ISO = "matrix(1,0.5,-1,0.5,0,0)";

type SlabProps = { cy: number; half: number; live?: boolean };

function Slab({ cy, half, live = false }: SlabProps) {
  const depth = live ? 20 : 18;
  return (
    <g>
      {/* contact shadow */}
      <ellipse cx={CX} cy={cy + depth + 16} rx={half * 1.9} ry={half * 0.86} fill="url(#axShadow)" opacity=".5" />
      {/* extruded side */}
      <g transform={`translate(${CX} ${cy + depth})`}>
        <rect x={-half} y={-half} width={half * 2} height={half * 2} rx={half * 0.17} transform={ISO} fill="url(#axEdge)" />
      </g>
      {/* bright rim on the live layer */}
      {live && (
        <g transform={`translate(${CX} ${cy + depth - 9})`}>
          <rect x={-half} y={-half} width={half * 2} height={half * 2} rx={half * 0.17} transform={ISO} fill="url(#axRim)" />
        </g>
      )}
      {/* top face */}
      <g transform={`translate(${CX} ${cy})`}>
        <rect
          x={-half} y={-half} width={half * 2} height={half * 2} rx={half * 0.17} transform={ISO}
          fill={live ? "url(#axLive)" : "url(#axGlass)"}
          stroke={live ? "#6fd0e4" : "#dceaf3"}
          strokeWidth={live ? 1.6 : 1.1}
        />
      </g>
    </g>
  );
}

function Card({
  x, y, w, h, label, children,
}: { x: number; y: number; w: number; h: number; label: string; children?: React.ReactNode }) {
  return (
    <g>
      <rect x={x + 4} y={y + 8} width={w} height={h} rx="18" fill="url(#axShadow)" opacity=".45" />
      <rect x={x} y={y} width={w} height={h} rx="18" fill="url(#axCard)" stroke="#dcecf5" strokeWidth="1.1" />
      <g transform={`translate(${x + 20} ${y + 20})`}>
        <rect width="20" height="20" rx="6" fill="#e9f7fb" stroke="#a5d9e9" strokeWidth="1.1" />
        <path d="M5 10.5 L8.5 14 L15 6.5" fill="none" stroke="#17a9c9" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <text
        x={x + 50} y={y + 34} fill="#5d7080"
        fontFamily="Segoe UI, Helvetica, Arial, sans-serif" fontSize="12.5" fontWeight="700" letterSpacing="1.3"
      >{label}</text>
      {children}
    </g>
  );
}

export default function AP_ArchitectureVisual({
  layers = DEFAULT_LAYERS,
  cards = DEFAULT_CARDS,
  compact = false,
}: { layers?: string[]; cards?: string[]; compact?: boolean }) {
  const names = layers.length ? layers : DEFAULT_LAYERS;
  const chips = cards.length ? cards : DEFAULT_CARDS;

  const slabs = [
    { cy: 330, half: 168, live: true },
    { cy: 430, half: 168 },
    { cy: 522, half: 168 },
    { cy: 614, half: 168 },
  ];

  return (
    <div className={compact ? "w-full max-w-[420px]" : "w-full"}>
      <svg viewBox="0 0 1040 900" className="h-auto w-full" role="img" aria-label={[...names, ...chips].join(", ")}>
        <defs>
          <linearGradient id="axGlass" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#ffffff" /><stop offset=".55" stopColor="#f5fbfe" /><stop offset="1" stopColor="#e4f1f8" />
          </linearGradient>
          <linearGradient id="axLive" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#ffffff" /><stop offset=".45" stopColor="#e8fafc" /><stop offset="1" stopColor="#c2ecf3" />
          </linearGradient>
          <linearGradient id="axEdge" x1="0" y1="0" x2="0" y2="1">
            <stop stopColor="#dfeef6" /><stop offset="1" stopColor="#c6dfec" />
          </linearGradient>
          <linearGradient id="axRim" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#5fd3df" /><stop offset="1" stopColor="#2bb8cf" />
          </linearGradient>
          <linearGradient id="axCard" x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#ffffff" /><stop offset="1" stopColor="#f2fafd" />
          </linearGradient>
          <radialGradient id="axShadow" cx="50%" cy="50%" r="50%">
            <stop stopColor="#9db8c9" stopOpacity=".38" /><stop offset="1" stopColor="#9db8c9" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="axGlow" cx="50%" cy="50%" r="50%">
            <stop stopColor="#3fc4dd" stopOpacity=".30" /><stop offset="1" stopColor="#3fc4dd" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ground plane */}
        <g stroke="#dceaf3" strokeDasharray="3 7" fill="none">
          <path d="M520 806 L960 782 M520 806 L80 782 M80 782 L520 830 L960 782" />
        </g>
        <ellipse cx={CX} cy="742" rx="330" ry="150" fill="url(#axGlow)" opacity=".55" />

        {/* connectors, drawn under the stack */}
        <g stroke="#c9e4f2" fill="none" strokeWidth="1.3">
          <path d="M300 247 L436 246" />
          <path d="M770 243 L604 246" />
          <path d="M212 428 L352 430" />
          <path d="M838 442 L688 430" />
          <path d="M760 651 L688 614" />
        </g>

        {/* base plate then the stack, bottom first */}
        <g>
          <ellipse cx={CX} cy="700" rx="330" ry="150" fill="url(#axShadow)" opacity=".45" />
          <g transform={`translate(${CX} 672)`}>
            <rect x="-196" y="-196" width="392" height="392" rx="34" transform={ISO} fill="url(#axGlass)" stroke="#dfedf5" strokeWidth="1.1" />
          </g>
        </g>
        {[...slabs].reverse().map((s) => <Slab key={s.cy} cy={s.cy} half={s.half} live={s.live} />)}

        {/* layer labels, after every slab so nothing occludes them */}
        {slabs.slice(1).map((s, i) => (
          <text
            key={`label-${s.cy}`} x={CX - 86} y={s.cy + 58} textAnchor="middle" fill="#93a5b4"
            fontFamily="Segoe UI, Helvetica, Arial, sans-serif" fontSize="12.5" fontWeight="600" letterSpacing="2"
            transform={`rotate(-26.5 ${CX - 86} ${s.cy + 58})`}
          >{names[i + 1] ?? ""}</text>
        ))}

        {/* APEX lockup on the live layer */}
        <g transform={`translate(${CX - 18} 326)`}>
          <g transform="rotate(-26.5)">
            <image href="/api/assets/logo/apex-mark.svg" x="-118" y="-32" width="52" height="42" preserveAspectRatio="xMidYMid meet" />
            <text x="-58" y="2" fill="#12303f" fontFamily="Segoe UI, Helvetica, Arial, sans-serif" fontSize="36" fontWeight="800" letterSpacing="1.5">APEX</text>
            <text x="0" y="32" textAnchor="middle" fill="#93a5b4" fontFamily="Segoe UI, Helvetica, Arial, sans-serif" fontSize="12.5" fontWeight="600" letterSpacing="2.4">{names[0] ?? ""}</text>
          </g>
        </g>

        {/* floating capability cards */}
        <Card x={100} y={172} w={200} h={150} label={chips[0] ?? ""}>
          <path d="M124 268 q26 -34 52 -8 t50 -30 t46 6" fill="none" stroke="#3fc4dd" strokeWidth="2.4" strokeLinecap="round" />
        </Card>

        <Card x={770} y={162} w={210} h={162} label={chips[1] ?? ""}>
          <path d="M794 288 L836 250 L878 266 L920 222 L958 240" fill="none" stroke="#17a9c9" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          {[[794, 288], [836, 250], [878, 266], [920, 222], [958, 240]].map(([cx, cy]) => (
            <circle key={cx} cx={cx} cy={cy} r="3.4" fill="#17a9c9" />
          ))}
        </Card>

        <Card x={40} y={344} w={172} h={168} label={chips[2] ?? ""}>
          <g fill="#4fc3d8">
            {Array.from({ length: 5 }).map((_, r) => Array.from({ length: 6 }).map((__, c) => (
              <circle key={`${r}-${c}`} cx={68 + c * 20} cy={410 + r * 17} r="3.4" opacity={0.3 + ((r + c) % 3) * 0.25} />
            )))}
          </g>
        </Card>

        <Card x={838} y={352} w={186} h={180} label={chips[3] ?? ""}>
          <g stroke="#17a9c9" fill="none" strokeWidth="1.3">
            <circle cx="931" cy="458" r="42" strokeOpacity=".4" />
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return <line key={deg} x1="931" y1="458" x2={931 + 42 * Math.cos(rad)} y2={458 + 42 * Math.sin(rad)} strokeOpacity=".45" />;
            })}
            {[0, 60, 120, 180, 240, 300].map((deg) => {
              const rad = (deg * Math.PI) / 180;
              return <circle key={`n${deg}`} cx={931 + 42 * Math.cos(rad)} cy={458 + 42 * Math.sin(rad)} r="5" fill="#17a9c9" stroke="none" />;
            })}
          </g>
          <circle cx="931" cy="458" r="8.5" fill="#17a9c9" />
        </Card>

        <Card x={760} y={572} w={210} h={158} label={chips[4] ?? ""}>
          {[0, 1, 2].map((d) => (
            <g key={d} transform={`translate(${790 + d * 56} 640)`}>
              <rect width="42" height="42" rx="12" fill="#f4fbfd" stroke="#cfe9f4" strokeWidth="1.1" />
              <circle cx="21" cy="21" r="9" fill="none" stroke="#17a9c9" strokeWidth="2.2" />
            </g>
          ))}
        </Card>

        {/* connector nodes */}
        {[[436, 246], [604, 246], [352, 430], [688, 430], [688, 614]].map(([cx, cy]) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4.5" fill="#17a9c9" />
        ))}
      </svg>
    </div>
  );
}
