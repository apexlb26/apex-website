import type { SocialContent } from "@/shared/types";
import { whatsappHref } from "@/shared/whatsapp";

function Logo({ kind }: { kind: "linkedin" | "instagram" | "whatsapp" }) {
  if (kind === "linkedin") return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.5 8.2H3.2V19h3.3V8.2ZM4.85 3A1.93 1.93 0 1 0 4.85 6.86 1.93 1.93 0 0 0 4.85 3ZM19.8 12.8c0-3.25-1.73-4.76-4.05-4.76-1.86 0-2.7 1.03-3.17 1.75V8.2H9.3V19h3.28v-5.35c0-1.41.27-2.79 2.03-2.79 1.74 0 1.76 1.63 1.76 2.88V19h3.28l.15-6.2Z"/></svg>;
  if (kind === "instagram") return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3.5" y="3.5" width="17" height="17" rx="5" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8"/><circle cx="17.6" cy="6.7" r="1" fill="currentColor"/></svg>;
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 11.8a8 8 0 0 1-11.7 7.1L4 20l1.2-4.1A8 8 0 1 1 20 11.8Z" stroke="currentColor" strokeWidth="1.8"/><path d="M9 8.2c.4-.3.8-.1 1 .4l.6 1.4c.2.4.1.7-.2 1l-.5.5c.7 1.5 1.8 2.6 3.3 3.3l.5-.6c.3-.3.6-.4 1-.2l1.4.7c.5.2.7.6.4 1-.6 1-1.6 1.4-2.7 1.2-3.6-.8-6.8-4-7.6-7.6-.2-1.1.2-2.1 1.2-2.7Z" fill="currentColor"/></svg>;
}

export default function AP_SocialLinks({ social }: { social: SocialContent }) {
  const links = [
    ["linkedin", social.linkedin || "https://www.linkedin.com/", "LinkedIn"],
    ["instagram", social.instagram || "https://www.instagram.com/", "Instagram"],
    ["whatsapp", whatsappHref(social), "WhatsApp"],
  ] as const;
  return <div className="ap-social-row">{links.filter(([, href]) => href).map(([kind, href, label]) => <a className="ap-social-link" key={kind} href={href} target="_blank" rel="noreferrer" aria-label={label}><Logo kind={kind}/></a>)}</div>;
}
