"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { CaseStudyContent } from "@/shared/types";
import AP_Icon from "@/app/components/AP_Icon";
import { openAP_Contact } from "@/app/components/AP_ContactModal";

const CASE_EVENT = "apex:open-case-study";

export function openAP_CaseStudy() {
  window.dispatchEvent(new CustomEvent(CASE_EVENT));
}

export function AP_CaseStudyButton({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <button type="button" className={className} onClick={openAP_CaseStudy}>{children}</button>;
}

export default function AP_CaseStudyModal({ content }: { content: CaseStudyContent }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(CASE_EVENT, show);
    return () => window.removeEventListener(CASE_EVENT, show);
  }, []);

  useEffect(() => {
    if (!open) return;
    const prior = document.body.style.overflow;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prior;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;

  const startProject = () => {
    setOpen(false);
    window.setTimeout(openAP_Contact, 80);
  };

  return (
    <div className="modal-shell case-modal-shell" role="dialog" aria-modal="true" aria-labelledby="case-title">
      <button type="button" className="modal-backdrop" onClick={() => setOpen(false)} aria-label="Close case study" />
      <article className="case-modal">
        <button className="modal-close" type="button" onClick={() => setOpen(false)} aria-label="Close">×</button>
        <header className="case-modal-head">
          <Image src={content.clientLogo} alt={content.client} width={126} height={58} />
          <div><span className="eyebrow">{content.eyebrow}</span><h2 id="case-title">{content.modalTitle}</h2><p>{content.modalBody}</p></div>
        </header>
        <div className="case-modal-body">
          <div className="case-modal-visual">
            <div className="browser-frame browser-large"><div className="browser-dots"><i/><i/><i/></div><Image src={content.screenshot} alt={`${content.client} website`} width={1600} height={1000}/></div>
            <div className="case-outcomes">
              <div><AP_Icon name="search"/><strong>Clearer discovery</strong><span>Stronger information hierarchy for users.</span></div>
              <div><AP_Icon name="calendar"/><strong>Better booking flow</strong><span>Less friction across scheduling and sessions.</span></div>
              <div><AP_Icon name="message"/><strong>Stronger admin usability</strong><span>More centralized visibility and control.</span></div>
              <div><AP_Icon name="chart"/><strong>Scalable foundation</strong><span>Built to support future product growth.</span></div>
            </div>
          </div>
          <div className="case-modal-details">
            <Detail icon="search" title="Project scope">{content.projectScope}</Detail>
            <Detail icon="shield" title="Business need">{content.businessNeed}</Detail>
            <Detail icon="flow" title="What APEX delivered">{content.delivered}</Detail>
            <Detail icon="check" title="Why it matters">{content.whyItMatters}</Detail>
            <div className="client-reference"><span>CLIENT REFERENCE</span><strong>{content.client} Team</strong><p>Previous APEX collaboration</p></div>
          </div>
        </div>
        <footer className="case-modal-footer">
          <button className="button button-primary" type="button" onClick={startProject}>Start a Project <AP_Icon name="arrow-up-right"/></button>
          <button className="button button-secondary" type="button" onClick={() => setOpen(false)}>Close Case Study</button>
        </footer>
      </article>
    </div>
  );
}

function Detail({ icon, title, children }: { icon: "search" | "shield" | "flow" | "check"; title: string; children: React.ReactNode }) {
  return <div className="detail-row"><span className="detail-icon"><AP_Icon name={icon}/></span><div><strong>{title}</strong><p>{children}</p></div></div>;
}
