"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { SolutionDetail, SolutionKey, SolutionsContent } from "@/shared/types";
import AP_Icon from "@/app/components/AP_Icon";

/* Content now lives in the CMS (solutions.details), so every string in this
   dialog is editable without touching code. */


export function AP_SolutionModalTrigger({
  solutionKey,
  content,
  children,
  className = "",
}: {
  solutionKey: SolutionKey;
  content: SolutionsContent;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const data: SolutionDetail | undefined = content.details?.[solutionKey];

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const modalId = useMemo(() => `ap-solution-modal-${solutionKey}`, [solutionKey]);

  if (!data) return <>{children}</>;

  function talkToUs() {
    setOpen(false);
    window.setTimeout(() => window.dispatchEvent(new CustomEvent("apex:open-contact")), 40);
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className} aria-haspopup="dialog" aria-controls={modalId}>
        {children}
      </button>

      {open && typeof document !== "undefined" ? createPortal(
        <div className="ap-sol-modal-overlay" role="presentation" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}>
          <section id={modalId} className="ap-sol-modal" role="dialog" aria-modal="true" aria-labelledby={`${modalId}-title`}>
            <header className="ap-sol-modal-head">
              <div className="ap-sol-modal-title-wrap">
                <span className="ap-sol-modal-icon"><AP_Icon name={data.icon} /></span>
                <h2 id={`${modalId}-title`}>{data.title}</h2>
              </div>
              <button type="button" className="ap-sol-modal-close" onClick={() => setOpen(false)} aria-label={content.detailCloseLabel ?? ""}>
                <span aria-hidden="true">×</span>
              </button>
              <div className="ap-sol-modal-head-lines" aria-hidden="true"><i/><i/><i/><i/></div>
            </header>

            <div className="ap-sol-modal-body">
              <p className="ap-sol-modal-intro">{data.intro}</p>

              <div className="ap-sol-modal-details">
                <div className="ap-sol-modal-includes">
                  <h3>{content.detailIncludesLabel}</h3>
                  <ul>
                    {data.includes.map((item) => (
                      <li key={item}><span className="ap-sol-check"><AP_Icon name="check" /></span><span>{item}</span></li>
                    ))}
                  </ul>
                </div>

                <div className="ap-sol-modal-cases">
                  <h3>{content.detailUseCasesLabel}</h3>
                  <div className="ap-sol-modal-case-list">
                    {data.useCases.map((item) => (
                      <article key={item.title}>
                        <span className="ap-sol-case-icon"><AP_Icon name={item.icon} /></span>
                        <div><strong>{item.title}</strong><p>{item.body}</p></div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>

              <div className="ap-sol-modal-outcomes">
                <h3>{content.detailOutcomesLabel}</h3>
                <div className="ap-sol-modal-outcome-grid">
                  {data.outcomes.map((item) => (
                    <article key={item.value + item.title}>
                      <span className="ap-sol-outcome-icon"><AP_Icon name={item.icon} /></span>
                      <div><strong className="ap-sol-outcome-value">{item.value}</strong><b>{item.title}</b><p>{item.body}</p></div>
                    </article>
                  ))}
                </div>
              </div>

              <footer className="ap-sol-modal-actions">
                <button type="button" className="ap-sol-modal-primary" onClick={talkToUs}>{content.detailPrimaryCta} <AP_Icon name="arrow-up-right" /></button>
                <a href="/#case-studies" className="ap-sol-modal-secondary" onClick={() => setOpen(false)}>{content.detailSecondaryCta} <AP_Icon name="arrow-up-right" /></a>
              </footer>
            </div>
          </section>
        </div>,
        document.body
      ) : null}
    </>
  );
}
