"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { NavItem } from "@/shared/types";
import AP_Button from "@/app/components/AP_Button";
import AP_Icon from "@/app/components/AP_Icon";

export default function AP_Header({ nav, activePath = "" }: { nav: NavItem[]; activePath?: string }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  // Anchor links such as /#case-studies live on the home page, which passes no
  // activePath — so read the live hash and keep it in sync with navigation.
  useEffect(() => {
    const sync = () => setHash(window.location.hash);
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, [pathname]);

  const currentPath = activePath || pathname || "/";

  /*
   * Nav items point at pages, but the home page now carries most of those as
   * sections. Watch whichever of them are on this page and mark the one the
   * reader is actually in, falling back to path matching when none are.
   */
  const [activeId, setActiveId] = useState("");
  const navIds = nav
    .map((item) => {
      const [route, anchor] = item.href.split("#");
      return anchor || (route || "/").replace(/^\//, "");
    })
    .filter(Boolean);
  const navIdKey = navIds.join(",");

  useEffect(() => {
    const sections = navIdKey
      .split(",")
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (!sections.length) {
      setActiveId("");
      return;
    }

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });
        // several can straddle the band; take the first in document order
        const current = sections.find((section) => visible.has(section.id));
        if (current) setActiveId(current.id);
      },
      // a thin band near the top of the viewport marks the section being read
      { rootMargin: "-18% 0px -72% 0px", threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [navIdKey, pathname]);

  /*
   * A Next <Link href="/#case-studies"> is a route navigation: it refetches the
   * RSC payload and re-renders the page, which reads as a flicker. When the
   * anchor is on the page we are already on, scroll to it directly instead.
   */
  const scrollToAnchor = useCallback((event: React.MouseEvent, href: string) => {
    const [rawRoute, anchor] = href.split("#");
    if (!anchor || (rawRoute || "/") !== pathname) return;
    event.preventDefault();
    const target = document.getElementById(anchor);
    if (!target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    window.history.pushState(null, "", href);
    setHash(`#${anchor}`);
  }, [pathname]);

  const isActive = useCallback((href: string) => {
    const [rawRoute, anchor] = href.split("#");
    const route = rawRoute || "/";
    const id = anchor || route.replace(/^\//, "");

    // A section of this page is in view: it wins over the route.
    if (activeId) return id === activeId;
    if (anchor) return route === currentPath && hash === `#${anchor}`;
    return route === currentPath;
  }, [currentPath, hash, activeId]);

  return (
    <header className="topbar ap-ref-header">
      <div className="container nav-row ap-ref-nav-row">
        <Link prefetch={false} className="brand ap-ref-brand" href="/" aria-label="APEX home">
          <Image src="/api/assets/logo/apex-logo.svg" alt="APEX" width={170} height={52} priority />
        </Link>
        <nav className="nav-links ap-ref-nav-links" aria-label="Primary navigation">
          {nav.map((item) => (
            <Link
              prefetch={false}
              className={isActive(item.href) ? "active" : ""}
              aria-current={isActive(item.href) ? "page" : undefined}
              key={`${item.label}-${item.href}`}
              href={item.href}
              onClick={(event) => {
                scrollToAnchor(event, item.href);
                setHash(item.href.includes("#") ? `#${item.href.split("#")[1]}` : "");
              }}
            >{item.label}</Link>
          ))}
        </nav>
        <div className="nav-actions ap-ref-nav-actions">
          <AP_Button className="nav-button ap-ref-nav-cta" contact>Let&apos;s build together</AP_Button>
          <button className="mobile-menu-button" type="button" aria-expanded={open} aria-label="Toggle navigation" onClick={() => setOpen((value) => !value)}><AP_Icon name="menu" /></button>
        </div>
      </div>
      {open && (
        <nav className="mobile-nav ap-ref-mobile-nav" aria-label="Mobile navigation">
          {nav.map((item) => (
            <Link
              prefetch={false}
              className={isActive(item.href) ? "active" : ""}
              aria-current={isActive(item.href) ? "page" : undefined}
              key={`${item.label}-${item.href}`}
              href={item.href}
              onClick={(event) => {
                setOpen(false);
                scrollToAnchor(event, item.href);
                setHash(item.href.includes("#") ? `#${item.href.split("#")[1]}` : "");
              }}
            >{item.label}</Link>
          ))}
          <AP_Button className="mt-3" contact>Let&apos;s build together</AP_Button>
        </nav>
      )}
    </header>
  );
}
