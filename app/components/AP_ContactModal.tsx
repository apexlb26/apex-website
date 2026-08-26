"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { ContactContent, ContactRequest, ContactResponse } from "@/shared/types";
import AP_Icon from "@/app/components/AP_Icon";

const CONTACT_EVENT = "apex:open-contact";

export function openAP_Contact() {
  window.dispatchEvent(new CustomEvent(CONTACT_EVENT));
}

/* No media queries: the two panels are flex children that wrap. */
const field =
  "mt-1.5 w-full rounded-xl border border-sx-line bg-white px-3.5 py-2.5 text-[13px] text-hx-ink outline-none transition-colors placeholder:text-hx-muted focus:border-sx-teal focus:ring-2 focus:ring-sx-teal/25";
const label = "block text-[11px] font-bold uppercase tracking-[0.1em] text-hx-copy";

export default function AP_ContactModal({ content }: { content?: ContactContent }) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const show = () => { setStatus("idle"); setError(""); setOpen(true); };
    window.addEventListener(CONTACT_EVENT, show);
    return () => window.removeEventListener(CONTACT_EVENT, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prior = document.body.style.overflow;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    // send focus into the dialog so keyboard users are not left behind it
    firstFieldRef.current?.focus();
    return () => {
      document.body.style.overflow = prior;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, status]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setError("");

    const form = new FormData(event.currentTarget);
    const payload: ContactRequest = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      company: String(form.get("company") ?? ""),
      message: String(form.get("message") ?? ""),
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as ContactResponse;
      if (!response.ok || !data.ok) throw new Error(data.ok ? "Could not submit your request." : data.error);
      setStatus("sent");
    } catch (reason) {
      setStatus("error");
      setError(reason instanceof Error ? reason.message : "Could not submit your request.");
    }
  }

  if (!open || !content) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="contact-title">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-[#04231f]/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-label="Close"
      />

      <div className="relative flex max-h-[92vh] w-[min(1000px,96vw)] flex-wrap overflow-auto rounded-[26px] bg-white shadow-[0_40px_90px_rgba(1,32,29,.35)]">
        {/* sits over the white panel, so it needs its own contrast rather than
            the translucent white that works on the teal side */}
        <button
          className="absolute right-3.5 top-3.5 z-10 grid h-9 w-9 place-items-center rounded-full border border-sx-line bg-white text-hx-copy shadow-sm transition-colors hover:border-sx-teal hover:text-sx-teal"
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>

        {/* brand panel */}
        <aside className="relative min-w-[min(300px,100%)] flex-1 basis-[36%] overflow-hidden bg-[linear-gradient(150deg,#013641_0%,#025b5f_58%,#0a7a70_100%)] p-8 text-white">
          <svg aria-hidden="true" viewBox="0 0 400 520" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full opacity-70">
            <g fill="none" stroke="#8ff3e0" strokeOpacity=".18">
              <path d="M-40 470 C 120 380, 180 250, 430 120" />
              <path d="M-20 510 C 140 410, 210 280, 450 160" />
              <path d="M20 540 C 175 445, 245 315, 470 205" />
            </g>
            <g fill="#a8f7e6"><circle cx="300" cy="180" r="3" opacity=".8" /><circle cx="352" cy="248" r="2.2" opacity=".55" /></g>
          </svg>

          <div className="relative flex h-full flex-col">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#8ff3e0]">{content.eyebrow}</span>
            <h2 id="contact-title" className="mt-3 text-[clamp(21px,2vw,27px)] font-bold leading-[1.2] tracking-[-0.02em] [overflow-wrap:normal]">
              {content.title}
            </h2>
            <p className="mt-3.5 text-[12.5px] leading-[1.7] text-white/80">{content.body}</p>

            <ul className="mt-6 flex list-none flex-col gap-3 p-0">
              {content.points.map((point) => (
                <li key={point} className="flex items-start gap-2.5 text-[12px] leading-[1.5] text-white/90">
                  <AP_Icon name="check-circle" className="mt-px h-[15px] w-[15px] shrink-0 text-[#8ff3e0]" />
                  <span className="min-w-0">{point}</span>
                </li>
              ))}
            </ul>

            <p className="mt-auto flex items-center gap-2 pt-7 text-[11px] text-white/70">
              <AP_Icon name="spark" className="h-3.5 w-3.5 shrink-0 text-[#8ff3e0]" />{content.replyNote}
            </p>
          </div>
        </aside>

        {/* form panel */}
        <div className="min-w-[min(340px,100%)] flex-[1.5] basis-[56%] p-8">
          {status === "sent" ? (
            <div className="flex h-full flex-col items-center justify-center py-8 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-sx-mint text-sx-teal">
                <AP_Icon name="check-circle" className="h-8 w-8" />
              </span>
              <h3 className="mt-5 text-[20px] font-bold tracking-[-0.02em] text-hx-ink">{content.successTitle}</h3>
              <p className="mt-2.5 max-w-[380px] text-[12.5px] leading-[1.7] text-hx-copy">{content.successBody}</p>
              <button
                className="mt-6 inline-flex h-[38px] items-center gap-2 rounded-lg bg-sx-teal px-5 text-[11px] font-extrabold uppercase tracking-[0.08em] text-white transition-colors hover:bg-sx-tealDark"
                onClick={() => setOpen(false)}
              >{content.successCta}</button>
            </div>
          ) : (
            <form onSubmit={submit} className="flex flex-col" noValidate>
              <div className="flex flex-wrap gap-x-4 gap-y-4">
                <label className="min-w-[min(200px,100%)] flex-1 basis-[46%]">
                  <span className={label}>{content.nameLabel}</span>
                  <input ref={firstFieldRef} className={field} required name="name" minLength={2} maxLength={80} autoComplete="name" />
                </label>
                <label className="min-w-[min(200px,100%)] flex-1 basis-[46%]">
                  <span className={label}>{content.emailLabel}</span>
                  <input className={field} required type="email" name="email" autoComplete="email" />
                </label>
                <label className="min-w-[min(240px,100%)] flex-1 basis-full">
                  <span className={label}>{content.companyLabel}</span>
                  <input className={field} name="company" maxLength={120} autoComplete="organization" />
                </label>
                <label className="min-w-[min(240px,100%)] flex-1 basis-full">
                  <span className={label}>{content.messageLabel}</span>
                  <textarea className={`${field} resize-y`} required name="message" minLength={10} maxLength={2000} rows={5} placeholder={content.messagePlaceholder} />
                </label>
              </div>

              {status === "error" && (
                <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-[#fdeceb] px-3.5 py-2.5 text-[12px] leading-[1.5] text-[#a6332b]">
                  <AP_Icon name="shield" className="mt-px h-4 w-4 shrink-0" />{error}
                </p>
              )}

              <button
                className="mt-6 inline-flex h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-sx-teal text-[11.5px] font-extrabold uppercase tracking-[0.09em] text-white transition-colors hover:bg-sx-tealDark disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:h-[14px] [&_svg]:w-[14px]"
                type="submit"
                disabled={status === "sending"}
              >
                {status === "sending" ? content.sendingLabel : content.submitLabel}
                {status !== "sending" && <AP_Icon name="arrow-up-right" />}
              </button>

              <p className="mt-3.5 flex items-start gap-2 text-[10.5px] leading-[1.5] text-hx-muted">
                <AP_Icon name="lock" className="mt-px h-3.5 w-3.5 shrink-0 text-sx-teal" />{content.privacyNote}
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
