"use client";

import type { ReactNode } from "react";
import AP_Icon from "@/app/components/AP_Icon";
import { openAP_Contact } from "@/app/components/AP_ContactModal";

/** Text-style call to action that opens the contact modal. */
export default function AP_ContactLink({ children, className = "", icon = "arrow-right", leadingIcon }: { children: ReactNode; className?: string; icon?: "arrow-right" | "arrow-up-right" | "none"; leadingIcon?: "play" }) {
  return (
    <button type="button" className={className} onClick={openAP_Contact}>
      {leadingIcon ? <AP_Icon name={leadingIcon} /> : null}<span>{children}</span>{icon === "none" ? null : <AP_Icon name={icon} />}
    </button>
  );
}
