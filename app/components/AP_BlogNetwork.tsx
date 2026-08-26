/** Decorative network/globe artwork for the blog hero. */
export default function AP_BlogNetwork() {
  return (
    <svg viewBox="0 0 700 320" className="h-auto w-full" aria-hidden="true">
      <defs>
        <radialGradient id="bnGlow" cx="50%" cy="50%" r="50%"><stop stopColor="#16a9dd" stopOpacity=".18" /><stop offset="1" stopColor="#16a9dd" stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="440" cy="150" r="150" fill="url(#bnGlow)" />
      <g stroke="#9fd3ec" fill="none" strokeWidth="1">
        <circle cx="440" cy="150" r="96" />
        <ellipse cx="440" cy="150" rx="96" ry="40" />
        <ellipse cx="440" cy="150" rx="52" ry="96" />
        <path d="M344 150h192M440 54v192" />
      </g>
      <circle cx="440" cy="150" r="34" fill="#ffffff" stroke="#cfe6f4" />
      <text x="440" y="162" textAnchor="middle" fill="#0b2233" fontFamily="Segoe UI, Arial, sans-serif" fontSize="30" fontWeight="700">A</text>

      {/* trace lines out to satellite nodes */}
      <g stroke="#bfe0f2" fill="none" strokeWidth="1">
        <path d="M344 118H236v-46H170M344 182H250v54H186M536 118h74V78h58M536 182h96v52h48" />
        <path d="M104 150H60M820 150h-58" />
      </g>
      {[[170,72],[186,236],[668,78],[680,234],[300,44],[600,44],[260,286],[604,282]].map(([x,y],i)=>(
        <g key={i}>
          <rect x={x-15} y={y-13} width="30" height="26" rx="6" fill="#ffffff" stroke="#cfe6f4" />
          <rect x={x-7} y={y-5} width="14" height="10" rx="2" fill="#16a9dd" fillOpacity={0.25+(i%3)*0.16} />
        </g>
      ))}
      {[[120,110],[128,206],[560,300],[330,300]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="3.5" fill="#16a9dd" fillOpacity=".5" />)}
    </svg>
  );
}
