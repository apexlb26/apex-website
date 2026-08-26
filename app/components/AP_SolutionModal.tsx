"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { AP_IconName, SolutionKey } from "@/shared/types";
import AP_Icon from "@/app/components/AP_Icon";

type UseCase = { icon: AP_IconName; title: string; body: string };
type Outcome = { icon: AP_IconName; value: string; title: string; body: string };
type ModalContent = {
  title: string;
  icon: AP_IconName;
  intro: string;
  includes: string[];
  useCases: UseCase[];
  outcomes: Outcome[];
};

const MODALS: Partial<Record<SolutionKey, ModalContent>> = {
  ai: {
    title: "AI & Intelligent Automation",
    icon: "brain",
    intro: "APEX applies intelligent automation, AI agents, and decision support to remove repetitive work, improve response quality, and accelerate operations across your organization.",
    includes: [
      "AI copilots for tasks and decisions",
      "Workflow automation for routine processes",
      "Smart routing and prioritization",
      "Knowledge retrieval and recommendations",
      "Reporting and insights with AI assistance",
    ],
    useCases: [
      { icon: "message", title: "Customer support automation", body: "Auto-resolve routine queries and escalate complex cases." },
      { icon: "users", title: "Lead qualification", body: "Score, route, and engage leads with AI assistance." },
      { icon: "sliders", title: "Internal operations", body: "Automate status updates, approvals, and notifications." },
      { icon: "grid", title: "Document processing", body: "Extract, classify, and route documents automatically." },
    ],
    outcomes: [
      { icon: "spark", value: "40–60%", title: "Faster response times", body: "Reduce cycle time and improve customer satisfaction." },
      { icon: "trend-up", value: "30–50%", title: "Lower manual workload", body: "Automate repetitive tasks and reduce manual effort." },
      { icon: "shield-check", value: "20–35%", title: "Higher operational consistency", body: "Standardize processes and reduce errors." },
    ],
  },
  legacy: {
    title: "Legacy Modernization",
    icon: "layers",
    intro: "APEX modernizes aging applications by upgrading architecture, preserving business-critical logic, and improving maintainability—reducing risk, cost, and technical debt.",
    includes: [
      "Application assessment and roadmap",
      "Re-architecture and refactoring",
      "API enablement and system upgrades",
      "UX and workflow modernization",
      "Security and performance improvements",
    ],
    useCases: [
      { icon: "grid", title: "Replacing fragile legacy tools", body: "Migrate from brittle, unsupported systems to stable, modern platforms." },
      { icon: "users", title: "Modernizing internal portals", body: "Improve usability, reliability, and speed for employees and stakeholders." },
      { icon: "sliders", title: "Upgrading mission-critical systems", body: "Enhance performance, scalability, and resilience without losing core logic." },
      { icon: "share", title: "Integrating old software with modern workflows", body: "Connect legacy systems with APIs and automation for end-to-end flow." },
    ],
    outcomes: [
      { icon: "spark", value: "35–55%", title: "Lower maintenance", body: "Overhead and reduced technical debt." },
      { icon: "trend-up", value: "25–40%", title: "Faster release cycles", body: "And improved time to market." },
      { icon: "shield-check", value: "20–30%", title: "Lower operational risk", body: "And higher system reliability." },
    ],
  },
  integration: {
    title: "System Integration",
    icon: "share",
    intro: "APEX connects software, teams, and data to create a single flow of information across the operation—enabling alignment, visibility, and speed at every step.",
    includes: [
      "API integrations and connectors",
      "Unified data flow design",
      "Middleware and orchestration",
      "Event and notification syncing",
      "Governance and monitoring",
    ],
    useCases: [
      { icon: "database", title: "CRM and ERP integration", body: "Unify customer, finance, and operations systems." },
      { icon: "flow", title: "Order-to-operations workflows", body: "Connect order intake, fulfillment, and delivery systems." },
      { icon: "users", title: "Cross-team data visibility", body: "Share accurate data across teams and departments." },
      { icon: "nodes", title: "Multi-platform process orchestration", body: "Coordinate processes across multiple platforms." },
    ],
    outcomes: [
      { icon: "spark", value: "40–60%", title: "Fewer manual handoffs", body: "Reduce rework and improve operational efficiency." },
      { icon: "trend-up", value: "30–45%", title: "Faster cross-system processing", body: "Accelerate throughput and shorten cycle times." },
      { icon: "shield-check", value: "25–35%", title: "Better data consistency", body: "Strengthen data accuracy and build trust across teams." },
    ],
  },
  data: {
    title: "Data Infrastructure",
    icon: "database",
    intro: "APEX builds dependable data foundations that power reporting, automation, advanced analytics, and AI-enabled operations.",
    includes: [
      "Data architecture and modeling",
      "Pipeline design and ETL",
      "Warehousing and storage",
      "Governance and quality controls",
      "Reporting-ready datasets",
    ],
    useCases: [
      { icon: "chart", title: "Executive dashboards", body: "Deliver trusted, real-time insights for leadership." },
      { icon: "grid", title: "Operational reporting", body: "Standardize reports across teams and functions." },
      { icon: "brain", title: "AI-ready data foundations", body: "Prepare clean, structured data for AI and ML models." },
      { icon: "database", title: "Multi-source data consolidation", body: "Unify data from systems, tools, and external sources." },
    ],
    outcomes: [
      { icon: "chart", value: "50–70%", title: "Faster reporting preparation", body: "Reduce time to build and prepare reports and datasets." },
      { icon: "shield-check", value: "30–45%", title: "Better data reliability", body: "Improve accuracy, consistency, and trust across data." },
      { icon: "trend-up", value: "20–35%", title: "Faster decision cycles", body: "Enable timely insights and quicker business actions." },
    ],
  },
  software: {
    title: "Custom Software",
    icon: "code",
    intro: "APEX designs and builds tailored software around the way your business actually works. We combine secure, scalable engineering with intuitive experiences your users love.",
    includes: [
      "Product and system discovery",
      "UX/UI design and prototyping",
      "Web and platform engineering",
      "Role-based admin tools",
      "Testing, deployment, and support",
    ],
    useCases: [
      { icon: "grid", title: "Custom portals", body: "Branded portals for customers, partners, or internal users." },
      { icon: "users", title: "Internal management platforms", body: "Streamline operations, tracking, and reporting in one place." },
      { icon: "users", title: "Client-facing products", body: "Build customer-centric apps and digital experiences." },
      { icon: "briefcase", title: "Operational software tools", body: "Purpose-built tools that solve unique business workflows." },
    ],
    outcomes: [
      { icon: "spark", value: "30–50%", title: "Higher process fit", body: "Software that adapts to your business—not the other way around." },
      { icon: "trend-up", value: "25–40%", title: "Faster execution", body: "Reduce cycle times and ship features with confidence." },
      { icon: "shield-check", value: "20–35%", title: "Stronger user adoption", body: "Built for real users, driving engagement and productivity." },
    ],
  },
  workflow: {
    title: "Workflow Automation",
    icon: "sitemap",
    intro: "APEX streamlines operational workflows by replacing manual approvals, follow-ups, handoffs, and repetitive tasks with reliable digital flows.",
    includes: [
      "Workflow mapping and redesign",
      "Approval flows and task routing",
      "Notifications and reminders",
      "Process dashboards and audit trails",
      "Human-in-the-loop controls",
    ],
    useCases: [
      { icon: "grid", title: "Request and approval workflows", body: "Automate requests, reviews, and approvals across teams." },
      { icon: "users", title: "Onboarding and service delivery", body: "Standardize onboarding, case handling, and service steps." },
      { icon: "flow", title: "Finance and operations coordination", body: "Synchronize tasks, validations, and handoffs across functions." },
      { icon: "share", title: "Recurring back-office processes", body: "Automate routine work such as reconciliations and reporting." },
    ],
    outcomes: [
      { icon: "spark", value: "45–65%", title: "Less manual follow-up", body: "Reduce time spent chasing updates and resolving bottlenecks." },
      { icon: "trend-up", value: "30–50%", title: "Faster turnaround time", body: "Complete work faster with automated routing and approvals." },
      { icon: "shield-check", value: "20–35%", title: "Fewer process errors", body: "Standardize steps and validations to improve accuracy." },
    ],
  },
};

export function AP_SolutionModalTrigger({
  solutionKey,
  children,
  className = "",
}: {
  solutionKey: SolutionKey;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const data = MODALS[solutionKey];

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
              <button type="button" className="ap-sol-modal-close" onClick={() => setOpen(false)} aria-label="Close dialog">
                <span aria-hidden="true">×</span>
              </button>
              <div className="ap-sol-modal-head-lines" aria-hidden="true"><i/><i/><i/><i/></div>
            </header>

            <div className="ap-sol-modal-body">
              <p className="ap-sol-modal-intro">{data.intro}</p>

              <div className="ap-sol-modal-details">
                <div className="ap-sol-modal-includes">
                  <h3>What it includes</h3>
                  <ul>
                    {data.includes.map((item) => (
                      <li key={item}><span className="ap-sol-check"><AP_Icon name="check" /></span><span>{item}</span></li>
                    ))}
                  </ul>
                </div>

                <div className="ap-sol-modal-cases">
                  <h3>Typical use cases</h3>
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
                <h3>Business outcomes</h3>
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
                <button type="button" className="ap-sol-modal-primary" onClick={talkToUs}>Talk to us <AP_Icon name="arrow-up-right" /></button>
                <a href="/#case-studies" className="ap-sol-modal-secondary" onClick={() => setOpen(false)}>View related case study <AP_Icon name="arrow-up-right" /></a>
              </footer>
            </div>
          </section>
        </div>,
        document.body
      ) : null}
    </>
  );
}
