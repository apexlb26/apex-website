import type { SVGProps } from "react";

export type AP_AdminIconName =
  | "dashboard" | "site" | "case" | "products" | "blogs" | "media" | "settings"
  | "globe" | "edit" | "box" | "news" | "image" | "logout" | "menu" | "external"
  | "save" | "check" | "upload" | "link" | "layers" | "users" | "plus" | "x";

export function AP_AdminIcon({ name, ...props }: { name: AP_AdminIconName } & SVGProps<SVGSVGElement>) {
  const common = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, ...props };
  switch (name) {
    case "dashboard": return <svg {...common}><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="4" rx="1.5"/><rect x="14" y="11" width="7" height="10" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>;
    case "site": return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3.5 9h17M3.5 15h17M12 3c2.2 2.5 3.2 5.5 3.2 9S14.2 18.5 12 21M12 3C9.8 5.5 8.8 8.5 8.8 12s1 6.5 3.2 9"/></svg>;
    case "case": return <svg {...common}><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 5V3h8v2M4 10h16M9 14h6"/></svg>;
    case "products": return <svg {...common}><path d="m12 3 8 4.3v9.4L12 21l-8-4.3V7.3L12 3Z"/><path d="m4 7.3 8 4.4 8-4.4M12 11.7V21"/></svg>;
    case "blogs": return <svg {...common}><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>;
    case "media": return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-5-5L5 20"/></svg>;
    case "settings": return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.83 2.83-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.1V21h-4v-.09A1.7 1.7 0 0 0 8.6 19.4a1.7 1.7 0 0 0-1.88.34l-.06.06-2.83-2.83.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.1-.4H3v-4h.09A1.7 1.7 0 0 0 4.6 8.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.83-2.83.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.1V3h4v.09A1.7 1.7 0 0 0 15.4 4.6a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.83 2.83-.06.06A1.7 1.7 0 0 0 19.4 9c.14.37.36.7.66.96.3.27.68.41 1.08.41H21v4h-.09A1.7 1.7 0 0 0 19.4 15Z"/></svg>;
    case "globe": return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.4 2.5 3.5 5.5 3.5 9S14.4 18.5 12 21M12 3C9.6 5.5 8.5 8.5 8.5 12s1.1 6.5 3.5 9"/></svg>;
    case "edit": return <svg {...common}><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg>;
    case "box": return <svg {...common}><path d="m12 3 8 4-8 4-8-4 8-4Z"/><path d="m4 12 8 4 8-4M4 17l8 4 8-4"/></svg>;
    case "news": return <svg {...common}><path d="M6 3h12v18H6z"/><path d="M3 7h3v12H4a1 1 0 0 1-1-1V7ZM9 7h6M9 11h6M9 15h4"/></svg>;
    case "image": return <svg {...common}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 15-5-5L5 20"/></svg>;
    case "logout": return <svg {...common}><path d="M10 17l5-5-5-5M15 12H3M14 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"/></svg>;
    case "menu": return <svg {...common}><path d="M4 7h16M4 12h16M4 17h16"/></svg>;
    case "external": return <svg {...common}><path d="M14 3h7v7M10 14 21 3M21 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5"/></svg>;
    case "save": return <svg {...common}><path d="M5 4h12l2 2v14H5z"/><path d="M8 4v6h8V4M8 20v-6h8v6"/></svg>;
    case "check": return <svg {...common}><path d="m5 12 4 4L19 6"/></svg>;
    case "upload": return <svg {...common}><path d="M12 16V4M7 9l5-5 5 5M5 20h14"/></svg>;
    case "link": return <svg {...common}><path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/></svg>;
    case "layers": return <svg {...common}><path d="m12 3 8 4-8 4-8-4 8-4Z"/><path d="m4 12 8 4 8-4M4 17l8 4 8-4"/></svg>;
    case "users": return <svg {...common}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "plus": return <svg {...common}><path d="M12 5v14M5 12h14"/></svg>;
    case "x": return <svg {...common}><path d="m6 6 12 12M18 6 6 18"/></svg>;
  }
}
