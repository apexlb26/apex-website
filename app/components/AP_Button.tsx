"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import AP_Icon from "@/app/components/AP_Icon";
import { openAP_Contact } from "@/app/components/AP_ContactModal";

type Props = {
  children: ReactNode;
  className?: string;
  href?: string;
  variant?: "primary" | "secondary" | "light" | "plain";
  contact?: boolean;
};

export default function AP_Button({ children, className = "", href, variant = "primary", contact = false }: Props) {
  const classes = `button button-${variant} ${className}`.trim();

  if (href) {
    const body = <><span>{children}</span><AP_Icon name="arrow-up-right" /></>;
    if (href.startsWith("/") || href.startsWith("#")) {
      return <Link prefetch={false} className={classes} href={href}>{body}</Link>;
    }
    return <a className={classes} href={href} target="_blank" rel="noreferrer">{body}</a>;
  }

  return (
    <button type="button" className={classes} onClick={contact ? openAP_Contact : undefined}>
      <span>{children}</span><AP_Icon name="arrow-up-right" />
    </button>
  );
}
