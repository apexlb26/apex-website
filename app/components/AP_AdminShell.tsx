"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { AP_AdminIcon, type AP_AdminIconName } from "@/app/components/AP_AdminIcons";

const nav: { href: string; label: string; icon: AP_AdminIconName }[] = [
  { href: "/admin", label: "Dashboard", icon: "dashboard" },
  { href: "/admin/site", label: "Website", icon: "site" },
  { href: "/admin/site?section=caseStudy", label: "Case Studies", icon: "case" },
  { href: "/admin/products", label: "Products", icon: "products" },
  { href: "/admin/blogs", label: "Blogs & News", icon: "blogs" },
  { href: "/admin/careers", label: "Careers", icon: "products" },
  { href: "/admin/media", label: "Media", icon: "media" },
  { href: "/admin/settings", label: "Settings", icon: "settings" },
];

export default function AP_AdminShell({ children, email, mode }: { children: React.ReactNode; email: string; mode: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const title = pathname === "/admin" ? "Dashboard" :
    pathname.includes("/site") ? "Website content" :
    pathname.includes("/products") ? "Products" :
    pathname.includes("/blogs") ? "Blogs & news" :
    pathname.includes("/careers") ? "Careers" :
    pathname.includes("/media") ? "Media library" : "Settings";

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" data-open={open ? "true" : "false"}>
        <div className="admin-brand">
          <img src="/api/assets/logo/apex-logo.svg" alt="APEX" />
          <small>Content Management</small>
        </div>
        <nav className="admin-nav">
          <div className="admin-nav-label">Workspace</div>
          {nav.slice(0, 6).map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href.split("?")[0]);
            return <Link prefetch={false} key={item.href} href={item.href} data-active={active ? "true" : "false"} onClick={() => setOpen(false)}><span className="nav-icon"><AP_AdminIcon name={item.icon} /></span>{item.label}</Link>;
          })}
          <div className="admin-nav-label">System</div>
          {nav.slice(6).map((item) => {
            const active = pathname.startsWith(item.href);
            return <Link prefetch={false} key={item.href} href={item.href} data-active={active ? "true" : "false"} onClick={() => setOpen(false)}><span className="nav-icon"><AP_AdminIcon name={item.icon} /></span>{item.label}</Link>;
          })}
        </nav>
        <div className="admin-sidebar-foot">
          <div className="admin-user">{email}</div>
          <button className="ap-button ap-button-soft" style={{ width: "100%", background: "rgba(255,255,255,.04)", color: "#bcd0d7", borderColor: "rgba(255,255,255,.08)" }} onClick={logout}><AP_AdminIcon name="logout" /> Sign out</button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="ap-button ap-button-soft mobile-sidebar-toggle" onClick={() => setOpen((value) => !value)} aria-label="Open menu"><AP_AdminIcon name="menu" /></button>
            <div><h1>{title}</h1><p>Manage APEX content without touching the website code.</p></div>
          </div>
          <div className="top-actions">
            <span className="mode-badge"><span className="status-dot" /> {mode === "github" ? "GitHub publishing" : "Local JSON mode"}</span>
            <a className="ap-button ap-button-soft" href={process.env.NEXT_PUBLIC_APEX_SITE_URL || "/"} target="_blank" rel="noreferrer">Preview site <AP_AdminIcon name="external" /></a>
          </div>
        </header>
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
