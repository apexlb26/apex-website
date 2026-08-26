/**
 * Wide-format placeholder for the careers hero photograph.
 * Set `careers.heroImage` in the CMS to replace it with a real team photo —
 * the frame is a full-bleed cover slot, so any wide image drops straight in.
 */
export default function AP_TeamVisual() {
  return (
    <div className="relative h-full min-h-[240px] w-full overflow-hidden" aria-hidden="true">
      <svg viewBox="0 0 1040 340" preserveAspectRatio="xMidYMid slice" role="presentation" className="h-full w-full">
        <defs>
          <linearGradient id="teamRoom" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#F1F7F9" /><stop offset="1" stopColor="#DCE9ED" /></linearGradient>
          <linearGradient id="teamDesk" x1="0" y1="0" x2="1" y2="0"><stop stopColor="#E4EDF0" /><stop offset="1" stopColor="#C3D5DB" /></linearGradient>
          <linearGradient id="teamScreen" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#0E2534" /><stop offset="1" stopColor="#123B4E" /></linearGradient>
        </defs>

        <rect width="1040" height="340" fill="url(#teamRoom)" />

        {/* room structure */}
        <path d="M0 58h1040M150 0v340M470 0v58M760 0v58" stroke="#CFDFE3" strokeOpacity=".8" />
        <rect x="18" y="86" width="112" height="150" rx="4" fill="#E6F0F3" />
        <rect x="18" y="86" width="112" height="150" rx="4" fill="none" stroke="#D2E1E5" />
        <path d="M18 124h112M18 162h112M18 200h112" stroke="#D8E6E9" />

        {/* wall display */}
        <rect x="800" y="74" width="212" height="150" rx="8" fill="url(#teamScreen)" />
        <g stroke="#37C6E0" strokeOpacity=".55" fill="none">
          <path d="M836 176c22-30 46 6 68-28s44 10 70-26" />
          <circle cx="836" cy="176" r="4" /><circle cx="904" cy="148" r="4" /><circle cx="974" cy="122" r="4" />
          <rect x="836" y="98" width="34" height="24" rx="3" /><rect x="882" y="98" width="34" height="24" rx="3" />
        </g>
        <text x="906" y="204" textAnchor="middle" fill="#DCEFF5" fillOpacity=".8" fontFamily="Segoe UI, Arial, sans-serif" fontSize="19" fontWeight="700" letterSpacing="5">APEX</text>

        {/* background colleagues */}
        <g opacity=".35">
          <circle cx="716" cy="150" r="17" fill="#C6A48D" /><path d="M694 214c0-28 9-40 22-40s22 12 22 40" fill="#9FB9C2" />
          <circle cx="770" cy="158" r="15" fill="#DBB79C" /><path d="M751 214c0-25 8-36 19-36s19 11 19 36" fill="#8FAAB4" />
        </g>

        {/* desk */}
        <rect x="150" y="262" width="740" height="20" rx="7" fill="url(#teamDesk)" />
        <rect x="150" y="282" width="740" height="58" fill="#EDF4F6" />

        {/* team */}
        <g>
          <circle cx="286" cy="132" r="42" fill="#EABE9F" />
          <path d="M235 262c0-62 21-88 51-88s51 26 51 88Z" fill="#AFC9DA" />
          <path d="M247 124c4-48 71-52 79 0-22-12-56-11-79 0Z" fill="#2A3B44" />
          <path d="M247 124c-6 26 2 44 12 52-14-6-24-28-12-52Z" fill="#22323A" />
        </g>
        <g>
          <circle cx="424" cy="120" r="39" fill="#E3AE8C" />
          <path d="M377 262c0-58 20-82 47-82s47 24 47 82Z" fill="#1E2E38" />
          <path d="M386 112c6-42 60-47 76-4-19-8-52-8-76 4Z" fill="#141F26" />
        </g>
        <g>
          <circle cx="556" cy="112" r="41" fill="#9C6A4F" />
          <path d="M507 262c0-62 22-88 49-88s49 26 49 88Z" fill="#15384A" />
          <path d="M515 104c3-42 68-49 81-3-23-11-55-10-81 3Z" fill="#12262F" />
        </g>
        <g>
          <circle cx="690" cy="134" r="40" fill="#F2C6A8" />
          <path d="M642 262c0-60 21-85 48-85s48 25 48 85Z" fill="#DCE6E6" />
          <path d="M648 126c9-46 68-47 83-3-22-10-60-9-83 3Z" fill="#7E5745" />
        </g>

        {/* laptop, mug, plant */}
        <rect x="452" y="196" width="140" height="70" rx="7" fill="#FFFFFF" stroke="#C4D5DA" />
        <rect x="466" y="208" width="112" height="46" rx="4" fill="#0D2130" />
        <path d="M486 240c19-28 37 17 64-16" stroke="#2ECAD4" strokeWidth="3.5" fill="none" />
        <rect x="440" y="266" width="164" height="7" rx="3" fill="#DAE6EA" />
        <path d="M392 240h26v22a5 5 0 0 1-5 5h-16a5 5 0 0 1-5-5Z" fill="#FFFFFF" stroke="#CBDBE0" />
        <path d="M418 245h9a6 6 0 0 1 0 12h-9" fill="none" stroke="#CBDBE0" />
        <path d="M626 244h30l-4 23h-22Z" fill="#D8E3E6" />
        <path d="M641 244c-14-6-19-18-16-30 12 1 20 9 22 20 4-11 12-18 24-18 1 13-8 24-22 28Z" fill="#5FA98F" />

        {/* accents */}
        <circle cx="176" cy="86" r="5" fill="#00B3A4" opacity=".5" />
        <circle cx="778" cy="66" r="7" fill="#00B3A4" opacity=".45" />
      </svg>
    </div>
  );
}
