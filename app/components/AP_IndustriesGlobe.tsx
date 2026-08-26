import Image from "next/image";

/*
 * Dotted globe with orbit rings, as in the industries artwork.
 * Every dot is derived from a fixed lat/lon sweep - no randomness, so the
 * server and client markup always agree.
 */
const CX = 235;
const CY = 118;
const R = 96;

/** Coarse land mask: enough to read as continents at dot resolution. */
const LAND: [number, number, number, number][] = [
  [24, 70, -168, -52],   // North America
  [8, 26, -112, -60],    // Central America
  [-56, 12, -82, -34],   // South America
  [36, 71, -11, 40],     // Europe
  [-35, 37, -18, 52],    // Africa
  [8, 78, 40, 150],      // Asia
  [-11, 24, 92, 141],    // South-east Asia
  [-44, -10, 113, 154],  // Australia
];

const isLand = (lat: number, lon: number) =>
  LAND.some(([a, b, c, d]) => lat >= a && lat <= b && lon >= c && lon <= d);

type Dot = { x: number; y: number; o: number };
const land: Dot[] = [];
const sea: Dot[] = [];
for (let lat = -82; lat <= 82; lat += 4.5) {
  const rad = (lat * Math.PI) / 180;
  const ring = Math.cos(rad);
  const count = Math.max(12, Math.round(84 * ring));
  for (let i = 0; i < count; i += 1) {
    const lon = (i / count) * 360 - 180;
    const lr = (lon * Math.PI) / 180;
    const z = ring * Math.cos(lr);
    if (z <= 0.03) continue;
    const dot = {
      x: Math.round((CX + R * ring * Math.sin(lr)) * 10) / 10,
      y: Math.round((CY - R * Math.sin(rad)) * 10) / 10,
      o: Math.round((0.2 + z * 0.6) * 100) / 100,
    };
    (isLand(lat, lon) ? land : sea).push(dot);
  }
}

/** Dots that sit on the orbit rings. */
const beads = [
  { x: 78, y: 62 }, { x: 404, y: 92 }, { x: 60, y: 158 }, { x: 388, y: 178 },
];

export default function AP_IndustriesGlobe() {
  return (
    <div className="relative mx-auto w-full max-w-[470px]">
      <svg viewBox="0 0 470 236" className="h-auto w-full" aria-hidden="true">
        {/* orbit rings */}
        <g fill="none" stroke="#9fd8cf" strokeOpacity=".55">
          <ellipse cx={CX} cy={CY} rx="208" ry="60" transform={`rotate(-14 ${CX} ${CY})`} />
          <ellipse cx={CX} cy={CY} rx="196" ry="84" transform={`rotate(19 ${CX} ${CY})`} />
        </g>
        {/* sphere */}
        <circle cx={CX} cy={CY} r={R} fill="#ffffff" fillOpacity=".55" />
        {/* ocean dots give the sphere its edge, land dots read as continents */}
        <g fill="#c2d4d4">
          {sea.map((dot, index) => (
            <circle key={index} cx={dot.x} cy={dot.y} r="1.25" opacity={dot.o * 0.5} />
          ))}
        </g>
        <g fill="#6f8f92">
          {land.map((dot, index) => (
            <circle key={index} cx={dot.x} cy={dot.y} r="1.7" opacity={dot.o} />
          ))}
        </g>
        <g fill="#12b09c">
          {beads.map((bead, index) => (
            <circle key={index} cx={bead.x} cy={bead.y} r="4.5" opacity=".85" />
          ))}
        </g>
      </svg>

      <span className="absolute left-1/2 top-1/2 grid h-[78px] w-[78px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_10px_30px_rgba(1,54,65,.14)] ring-1 ring-sx-teal/35">
        <Image src="/api/assets/logo/apex-mark.svg" alt="" width={40} height={40} />
      </span>
    </div>
  );
}
