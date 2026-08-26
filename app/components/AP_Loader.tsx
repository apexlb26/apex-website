"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import AP_ArchitectureVisual from "@/app/components/AP_ArchitectureVisual";
import AP_DotField from "@/app/components/AP_DotField";
import AP_SplitFlapText from "@/app/components/AP_SplitFlapText";

export default function AP_Loader({ mode = "route" }: { mode?: "route" | "entry" }) {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (mode !== "entry") return;
    const exitTimer = window.setTimeout(() => setLeaving(true), 2650);
    const removeTimer = window.setTimeout(() => setVisible(false), 3150);
    return () => { window.clearTimeout(exitTimer); window.clearTimeout(removeTimer); };
  }, [mode]);

  if (!visible) return null;

  return (
    <div className={`ap-load ap-load-${mode} ${leaving ? "is-leaving" : ""}`.trim()} aria-label="Loading APEX systems" role="status">
      <div className="ap-load-dot-field"><AP_DotField dotSpacing={25} bulgeStrength={16} cursorRadius={300} glowRadius={180} /></div>
      <div className="ap-load-architecture"><AP_ArchitectureVisual compact /></div>
      <div className="ap-load-center">
        <Image className="ap-load-logo" src="/api/assets/logo/apex-logo.svg" alt="APEX" width={430} height={130} priority />
        <div className="ap-load-progress" aria-hidden="true"><span /></div>
        <AP_SplitFlapText
          words={["INITIALIZING", "SYNCING SYSTEMS", "APEX ONLINE"]}
          flipDuration={0.09}
          stagger={0.025}
          cycleDelay={540}
          flipsPerChar={4}
          tileColor="#171A1D"
          textColor="#F7F9FA"
          tileRadius={4}
          gap={2}
          fontSize={13}
          loop={false}
          padTo={15}
          className="ap-load-flap"
        />
      </div>
    </div>
  );
}
