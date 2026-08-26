import Image from "next/image";
import Link from "next/link";
import type { FooterContent, NavItem, SocialContent } from "@/shared/types";
import AP_SocialLinks from "@/app/components/AP_SocialLinks";
import AP_SubscribeForm from "@/app/components/AP_SubscribeForm";

/* No media queries: one wrapping flex row of columns. */
const shell = "mx-auto w-[min(1640px,86%)]";

export default function AP_Footer({ nav, content, social }: { nav: NavItem[]; content: FooterContent; social: SocialContent }) {
  // Fall back to the primary nav if a stored payload predates the column model.
  const columns = content.columns?.length
    ? content.columns
    : [{ title: "Company", links: nav.map((item) => ({ label: item.label, href: item.href })) }];

  return (
    <footer className="border-t border-hx-line bg-[linear-gradient(180deg,#f7fafd_0%,#eef5fa_100%)] text-hx-ink">
      <div className={`${shell} flex flex-wrap gap-x-[clamp(1.25rem,2.5vw,3rem)] gap-y-10 pb-10 pt-[clamp(2.5rem,4.5vw,3.5rem)]`}>
        {/* brand */}
        <div className="min-w-[min(240px,100%)] flex-[1.5] basis-[23%]">
          <Link prefetch={false} href="/" aria-label="APEX home" className="inline-block">
            <Image src="/api/assets/logo/apex-logo.svg" alt="APEX" width={140} height={43} />
          </Link>
          {content.tagline && <p className="mt-4 text-[12px] font-bold tracking-[-0.01em] text-hx-cyanInk">{content.tagline}</p>}
          {content.body && <p className="mt-2.5 max-w-[300px] text-[11.5px] leading-[1.7] text-hx-copy">{content.body}</p>}
          <div className="ap-footer-social mt-6"><AP_SocialLinks social={social} /></div>
        </div>

        {/* link columns */}
        {columns.map((column) => (
          <nav key={column.title} className="min-w-[min(145px,100%)] flex-1 basis-[13%]" aria-label={column.title}>
            <strong className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-hx-ink/70">{column.title}</strong>
            <span aria-hidden="true" className="mt-3 block h-px w-8 bg-hx-cyan2/45" />
            <ul className="mt-4 flex list-none flex-col gap-2.5 p-0">
              {column.links.map((link) => (
                <li key={`${column.title}-${link.label}`}>
                  <Link
                    prefetch={false}
                    href={link.href}
                    className="inline-block text-[11.5px] leading-[1.45] text-hx-copy transition-colors duration-150 hover:text-hx-cyanInk"
                  >{link.label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {/* newsletter */}
        <div className="min-w-[min(250px,100%)] flex-[1.4] basis-[20%]">
          <strong className="block text-[10px] font-extrabold uppercase tracking-[0.15em] text-hx-ink/70">{content.newsletterTitle ?? ""}</strong>
          <span aria-hidden="true" className="mt-3 block h-px w-8 bg-hx-cyan2/45" />
          <p className="mt-4 max-w-[300px] text-[11.5px] leading-[1.6] text-hx-copy">{content.newsletterBody ?? ""}</p>
          <div className="ap-footer-subscribe mt-4 max-w-[320px]"><AP_SubscribeForm /></div>
        </div>
      </div>

      {/* bottom bar */}
      <div className="border-t border-hx-line/80">
        <div className={`${shell} flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5`}>
          <span className="text-[10.5px] text-hx-muted">© {new Date().getFullYear()} {content.legal}</span>
          <div className="flex flex-wrap gap-x-7 gap-y-2">
            {(content.legalLinks ?? []).map((link) => (
              <Link
                key={link.label}
                prefetch={false}
                href={link.href}
                className="text-[10.5px] text-hx-muted transition-colors duration-150 hover:text-hx-cyanInk"
              >{link.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
