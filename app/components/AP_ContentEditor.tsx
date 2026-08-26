"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import { AP_AdminIcon } from "@/app/components/AP_AdminIcons";
import type { AP_IconName, Locale, SiteContent } from "@/shared/types";

type EditorMode = "site" | "products" | "blogs" | "careers";
type SiteSection = "meta" | "hero" | "about" | "solutions" | "industries" | "caseStudy" | "method" | "contactModal" | "social" | "footer";

const siteSections: { key: SiteSection; label: string }[] = [
  { key: "meta", label: "Site & navigation" },
  { key: "hero", label: "Hero" },
  { key: "about", label: "About" },
  { key: "solutions", label: "Solutions" },
  { key: "industries", label: "Industries" },
  { key: "caseStudy", label: "Case study" },
  { key: "method", label: "Method" },
  { key: "contactModal", label: "Contact form" },
  { key: "social", label: "Social & contact" },
  { key: "footer", label: "Footer" },
];

const sectionDescriptions: Record<SiteSection, string> = {
  meta: "Page metadata and the primary navigation shown across the public website.",
  hero: "The first impression: headline, positioning, calls to action, and supporting principles.",
  about: "The short strategic statement that explains how APEX approaches operational technology.",
  solutions: "The six capabilities shown in the solutions section. Keep claims specific and credible.",
  industries: "Only active verticals belong here. The open-door row invites other operational challenges.",
  caseStudy: "The featured TutWithUs collaboration and the detailed case-study modal content.",
  method: "The APEX operating method, core principles, and final business-impact CTA.",
  contactModal: "Every label in the \u201cLet\u2019s build together\u201d dialog. Submissions are emailed to the address set in APEX_NOTIFY_EMAIL.",
  social: "WhatsApp, LinkedIn, Instagram, and the local guided assistant labels. Social URLs are editable here; when left blank, the public site uses the fallback values from the JSON content files.",
  footer: "Legal copy and footer-level static content.",
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function setPath(target: unknown, path: string, value: unknown) {
  const parts = path.split(".");
  let cursor = target as Record<string, unknown>;
  for (let i = 0; i < parts.length - 1; i += 1) {
    cursor = cursor[parts[i]] as Record<string, unknown>;
  }
  cursor[parts[parts.length - 1]] = value;
}

function getPath(target: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((value, key) => (value as Record<string, unknown>)?.[key], target);
}

function TextField({ label, value, onChange, hint }: { label: string; value: string; onChange: (value: string) => void; hint?: string }) {
  return <div className="field"><label>{label}</label><input className="ap-input" value={value} onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)} />{hint ? <small style={{ color: "#82949c", lineHeight: 1.45 }}>{hint}</small> : null}</div>;
}

function TextArea({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return <div className="field"><label>{label}</label><textarea className="ap-textarea" style={{ minHeight: rows * 28 }} value={value} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)} /></div>;
}

function SectionHead({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="editor-card-head"><div><div className="section-eyebrow">{eyebrow}</div><h2>{title}</h2><p>{description}</p></div></div>;
}

export default function AP_ContentEditor({
  initialEn,
  initialAr,
  mode,
  initialSection = "hero",
}: {
  initialEn: SiteContent;
  initialAr: SiteContent;
  mode: EditorMode;
  initialSection?: SiteSection;
}) {
  const [locale, setLocale] = useState<Locale>("en");
  const [contentMap, setContentMap] = useState<Record<Locale, SiteContent>>({ en: initialEn, ar: initialAr });
  const [section, setSection] = useState<SiteSection>(initialSection);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ text: string; error?: boolean } | null>(null);

  const content = contentMap[locale];
  const pageTitle = mode === "site" ? siteSections.find((item) => item.key === section)?.label || "Website" : mode === "products" ? "Products page" : mode === "blogs" ? "Blogs & news page" : "Careers page";

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function change(path: string, value: unknown) {
    setContentMap((current) => {
      const next = clone(current);
      setPath(next[locale], path, value);
      return next;
    });
    setDirty(true);
  }

  function value(path: string) {
    return String(getPath(content, path) ?? "");
  }

  async function publish() {
    setSaving(true);
    setToast(null);
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, content }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Publish failed");
      setDirty(false);
      localStorage.removeItem(`apex-cms-draft-${locale}`);
      setToast({ text: body.mode === "github" ? "Published to GitHub. Your website deployment can now rebuild from the updated content." : "Saved to the local JSON source successfully." });
    } catch (error) {
      setToast({ text: error instanceof Error ? error.message : "Publish failed", error: true });
    } finally {
      setSaving(false);
    }
  }

  function saveDraft() {
    localStorage.setItem(`apex-cms-draft-${locale}`, JSON.stringify(content));
    setToast({ text: `Draft saved in this browser for ${locale === "en" ? "English" : "Arabic"}. It has not been published.` });
  }

  async function reloadPublished() {
    if (dirty && !window.confirm("Discard unsaved changes for this language?")) return;
    try {
      const response = await fetch(`/api/admin/content?locale=${locale}`, { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not reload content");
      setContentMap((current) => ({ ...current, [locale]: body.content as SiteContent }));
      setDirty(false);
      setToast({ text: "Reloaded the currently published content." });
    } catch (error) {
      setToast({ text: error instanceof Error ? error.message : "Reload failed", error: true });
    }
  }

  function restoreDraft() {
    const raw = localStorage.getItem(`apex-cms-draft-${locale}`);
    if (!raw) return setToast({ text: "No browser draft exists for this language." });
    try {
      const draft = JSON.parse(raw) as SiteContent;
      setContentMap((current) => ({ ...current, [locale]: draft }));
      setDirty(true);
      setToast({ text: "Browser draft restored. Review it before publishing." });
    } catch {
      setToast({ text: "The saved browser draft could not be read.", error: true });
    }
  }

  return (
    <>
      <div className="editor-toolbar">
        <div className="editor-toolbar-left">
          <div className="locale-switch" aria-label="Language">
            <button data-active={locale === "en" ? "true" : "false"} onClick={() => setLocale("en")}>EN</button>
            <button data-active={locale === "ar" ? "true" : "false"} onClick={() => setLocale("ar")}>AR</button>
          </div>
          {dirty ? <span className="dirty-badge">Unsaved changes</span> : <span className="saved-badge">Published state</span>}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="ap-button ap-button-soft" onClick={restoreDraft}>Restore draft</button>
          <button className="ap-button ap-button-soft" onClick={reloadPublished}>Reset</button>
          <button className="ap-button ap-button-soft" onClick={saveDraft}><AP_AdminIcon name="save" /> Save draft</button>
          <button className="ap-button ap-button-primary" onClick={publish} disabled={saving}><AP_AdminIcon name="check" /> {saving ? "Publishing…" : "Publish changes"}</button>
        </div>
      </div>

      <div className={mode === "site" ? "editor-layout" : ""}>
        {mode === "site" ? <aside className="editor-sections">{siteSections.map((item) => <button key={item.key} className="editor-section-button" data-active={section === item.key ? "true" : "false"} onClick={() => setSection(item.key)}><span>{item.label}</span><span>›</span></button>)}</aside> : null}
        <section className="editor-panel">
          <div className="editor-card" dir={content.direction}>
            {mode === "site" ? renderSiteSection(section, content, change, value) : mode === "products" ? renderProducts(content, change, value) : mode === "blogs" ? renderBlogs(content, change, value) : renderCareers(content, change, value)}
          </div>
          <p style={{ color: "#7b909b", fontSize: 11, margin: "12px 4px 0" }}>Editing <strong>{pageTitle}</strong> · {locale === "en" ? "English" : "Arabic"}. Drafts stay in your browser; Publish writes to the configured CMS source.</p>
        </section>
      </div>
      {toast ? <div className={`toast${toast.error ? " error" : ""}`}>{toast.text}</div> : null}
    </>
  );
}

function renderSiteSection(section: SiteSection, content: SiteContent, change: (path: string, value: unknown) => void, value: (path: string) => string) {
  if (section === "meta") {
    return <><SectionHead eyebrow="WEBSITE" title="Site & navigation" description={sectionDescriptions.meta} /><div className="editor-card-body"><div className="field-grid"><TextField label="SEO title" value={value("meta.title")} onChange={(v) => change("meta.title", v)} /><TextArea label="SEO description" value={value("meta.description")} onChange={(v) => change("meta.description", v)} /></div><div className="form-divider" /><div className="array-stack">{content.nav.map((item, index) => <div className="subcard" key={`${item.href}-${index}`}><div className="subcard-head"><strong>Navigation item {index + 1}</strong><span>{item.href}</span></div><div className="field-grid"><TextField label="Label" value={item.label} onChange={(v) => change(`nav.${index}.label`, v)} /><TextField label="Href" value={item.href} onChange={(v) => change(`nav.${index}.href`, v)} /></div></div>)}</div></div></>;
  }

  if (section === "hero") {
    return <><SectionHead eyebrow="HOMEPAGE" title="Hero" description={sectionDescriptions.hero} /><div className="editor-card-body"><div className="field-grid"><TextField label="Eyebrow" value={value("hero.eyebrow")} onChange={(v) => change("hero.eyebrow", v)} /><TextField label="Headline line 1" value={value("hero.lines.0")} onChange={(v) => change("hero.lines.0", v)} /><TextField label="Headline line 2" value={value("hero.lines.1")} onChange={(v) => change("hero.lines.1", v)} /><TextField label="Headline line 3" value={value("hero.lines.2")} onChange={(v) => change("hero.lines.2", v)} /><div className="field full"><TextArea label="Body" value={value("hero.body")} onChange={(v) => change("hero.body", v)} /></div><TextField label="Primary CTA" value={value("hero.primaryCta")} onChange={(v) => change("hero.primaryCta", v)} /><TextField label="Secondary CTA" value={value("hero.secondaryCta")} onChange={(v) => change("hero.secondaryCta", v)} /></div><div className="form-divider" /><div className="array-stack">{content.hero.principles.map((item, index) => <div className="subcard" key={index}><div className="subcard-head"><strong>Principle {index + 1}</strong><span>{item.icon}</span></div><div className="field-grid"><TextField label="Title" value={item.title} onChange={(v) => change(`hero.principles.${index}.title`, v)} /><TextArea label="Body" value={item.body} onChange={(v) => change(`hero.principles.${index}.body`, v)} /></div></div>)}</div></div></>;
  }

  if (section === "about") {
    return <><SectionHead eyebrow="HOMEPAGE" title="About statement" description={sectionDescriptions.about} /><div className="editor-card-body"><div className="field-grid"><TextField label="Eyebrow" value={value("about.eyebrow")} onChange={(v) => change("about.eyebrow", v)} /><div className="field full"><TextArea label="Statement" value={value("about.statement")} onChange={(v) => change("about.statement", v)} rows={5} /></div><div className="field full"><TextArea label="Supporting body" value={value("about.body")} onChange={(v) => change("about.body", v)} /></div></div></div></>;
  }

  if (section === "solutions") {
    return <><SectionHead eyebrow="HOMEPAGE" title="Solutions" description={sectionDescriptions.solutions} /><div className="editor-card-body"><div className="field-grid"><TextField label="Eyebrow" value={value("solutions.eyebrow")} onChange={(v) => change("solutions.eyebrow", v)} /><TextField label="Section title" value={value("solutions.title")} onChange={(v) => change("solutions.title", v)} /><div className="field full"><TextArea label="Body" value={value("solutions.body")} onChange={(v) => change("solutions.body", v)} /></div><TextField label="Card CTA" value={value("solutions.cta")} onChange={(v) => change("solutions.cta", v)} /></div><div className="form-divider" /><div className="array-stack">{content.solutions.items.map((item, index) => <div className="subcard" key={item.key}><div className="subcard-head"><strong>{item.number} · {item.title}</strong><span>{item.key}</span></div><div className="field-grid"><TextField label="Title" value={item.title} onChange={(v) => change(`solutions.items.${index}.title`, v)} /><TextArea label="Body" value={item.body} onChange={(v) => change(`solutions.items.${index}.body`, v)} /></div></div>)}</div></div></>;
  }

  if (section === "industries") {
    return <><SectionHead eyebrow="HOMEPAGE" title="Industries" description={sectionDescriptions.industries} /><div className="editor-card-body"><div className="field-grid"><TextField label="Eyebrow" value={value("industries.eyebrow")} onChange={(v) => change("industries.eyebrow", v)} /><TextField label="Section title" value={value("industries.title")} onChange={(v) => change("industries.title", v)} /><div className="field full"><TextArea label="Body" value={value("industries.body")} onChange={(v) => change("industries.body", v)} /></div><TextField label="Card CTA" value={value("industries.cta")} onChange={(v) => change("industries.cta", v)} /></div><div className="form-divider" /><div className="array-stack">{content.industries.items.map((item, index) => <div className="subcard" key={item.key}><div className="subcard-head"><strong>{item.number} · {item.title}</strong><span>{item.key}</span></div><div className="field-grid"><TextField label="Title" value={item.title} onChange={(v) => change(`industries.items.${index}.title`, v)} /><TextArea label="Body" value={item.body} onChange={(v) => change(`industries.items.${index}.body`, v)} /><div className="field full"><TextField label="Bullets (separate with |)" value={item.bullets.join(" | ")} onChange={(v) => change(`industries.items.${index}.bullets`, v.split("|").map((s) => s.trim()).filter(Boolean))} /></div></div></div>)}</div><div className="subcard"><div className="subcard-head"><strong>Open-door row</strong><span>Different vertical</span></div><div className="field-grid"><TextField label="Title" value={value("industries.openDoorTitle")} onChange={(v) => change("industries.openDoorTitle", v)} /><TextField label="Body" value={value("industries.openDoorBody")} onChange={(v) => change("industries.openDoorBody", v)} /><TextField label="CTA" value={value("industries.openDoorCta")} onChange={(v) => change("industries.openDoorCta", v)} /></div></div></div></>;
  }

  if (section === "caseStudy") {
    return <><SectionHead eyebrow="HOMEPAGE" title="Case study" description={sectionDescriptions.caseStudy} /><div className="editor-card-body"><div className="field-grid"><TextField label="Eyebrow" value={value("caseStudy.eyebrow")} onChange={(v) => change("caseStudy.eyebrow", v)} /><TextField label="Section title" value={value("caseStudy.title")} onChange={(v) => change("caseStudy.title", v)} /><div className="field full"><TextArea label="Section intro" value={value("caseStudy.intro")} onChange={(v) => change("caseStudy.intro", v)} /></div><TextField label="Client" value={value("caseStudy.client")} onChange={(v) => change("caseStudy.client", v)} /><TextField label="Client logo path" value={value("caseStudy.clientLogo")} onChange={(v) => change("caseStudy.clientLogo", v)} /><TextField label="Screenshot path" value={value("caseStudy.screenshot")} onChange={(v) => change("caseStudy.screenshot", v)} /><TextField label="CTA" value={value("caseStudy.cta")} onChange={(v) => change("caseStudy.cta", v)} /><div className="field full"><TextField label="Headline" value={value("caseStudy.headline")} onChange={(v) => change("caseStudy.headline", v)} /></div><div className="field full"><TextArea label="Body" value={value("caseStudy.body")} onChange={(v) => change("caseStudy.body", v)} rows={5} /></div><div className="field full"><TextField label="Capabilities (separate with |)" value={content.caseStudy.capabilities.join(" | ")} onChange={(v) => change("caseStudy.capabilities", v.split("|").map((s) => s.trim()).filter(Boolean))} /></div></div><div className="form-divider" /><div className="array-stack">{content.caseStudy.facts.map((fact, index) => <div className="subcard" key={index}><div className="subcard-head"><strong>{fact.title}</strong><span>{fact.icon}</span></div><div className="field-grid"><TextField label="Title" value={fact.title} onChange={(v) => change(`caseStudy.facts.${index}.title`, v)} /><TextArea label="Body" value={fact.body} onChange={(v) => change(`caseStudy.facts.${index}.body`, v)} /></div></div>)}</div><div className="form-divider" /><div className="field-grid"><div className="field full"><TextField label="Modal title" value={value("caseStudy.modalTitle")} onChange={(v) => change("caseStudy.modalTitle", v)} /></div><div className="field full"><TextArea label="Modal intro" value={value("caseStudy.modalBody")} onChange={(v) => change("caseStudy.modalBody", v)} /></div><TextArea label="Project scope" value={value("caseStudy.projectScope")} onChange={(v) => change("caseStudy.projectScope", v)} /><TextArea label="Business need" value={value("caseStudy.businessNeed")} onChange={(v) => change("caseStudy.businessNeed", v)} /><TextArea label="What APEX delivered" value={value("caseStudy.delivered")} onChange={(v) => change("caseStudy.delivered", v)} /><TextArea label="Why it matters" value={value("caseStudy.whyItMatters")} onChange={(v) => change("caseStudy.whyItMatters", v)} /></div></div></>;
  }

  if (section === "method") {
    return <><SectionHead eyebrow="HOMEPAGE" title="APEX method" description={sectionDescriptions.method} /><div className="editor-card-body"><div className="field-grid"><TextField label="Eyebrow" value={value("method.eyebrow")} onChange={(v) => change("method.eyebrow", v)} /><TextField label="Title" value={value("method.title")} onChange={(v) => change("method.title", v)} /><div className="field full"><TextArea label="Body" value={value("method.body")} onChange={(v) => change("method.body", v)} /></div></div><div className="form-divider" /><div className="array-stack">{content.method.steps.map((step, index) => <div className="subcard" key={step.number}><div className="subcard-head"><strong>{step.number} · {step.title}</strong><span>{step.icon}</span></div><div className="field-grid"><TextField label="Title" value={step.title} onChange={(v) => change(`method.steps.${index}.title`, v)} /><TextArea label="Body" value={step.body} onChange={(v) => change(`method.steps.${index}.body`, v)} /></div></div>)}</div><div className="form-divider" /><div className="field-grid"><TextField label="CTA title" value={value("method.ctaTitle")} onChange={(v) => change("method.ctaTitle", v)} /><TextField label="Highlighted words" value={value("method.ctaHighlight")} onChange={(v) => change("method.ctaHighlight", v)} /><div className="field full"><TextArea label="CTA body" value={value("method.ctaBody")} onChange={(v) => change("method.ctaBody", v)} /></div><TextField label="CTA button" value={value("method.cta")} onChange={(v) => change("method.cta", v)} /></div></div></>;
  }

  if (section === "contactModal") {
    const c = content.contact;
    if (!c) return <><SectionHead eyebrow="CONTACT" title="Contact form" description={sectionDescriptions.contactModal} /><div className="editor-card-body"><p>No contact block in this content file yet.</p></div></>;
    return <><SectionHead eyebrow="CONTACT" title="Contact form" description={sectionDescriptions.contactModal} /><div className="editor-card-body"><div className="field-grid"><TextField label="Eyebrow" value={value("contact.eyebrow")} onChange={(v) => change("contact.eyebrow", v)} /><TextField label="Title" value={value("contact.title")} onChange={(v) => change("contact.title", v)} /><div className="field full"><TextArea label="Intro" value={value("contact.body")} onChange={(v) => change("contact.body", v)} /></div><div className="field full"><TextField label="Reassurance points (separate with |)" value={c.points.join(" | ")} onChange={(v) => change("contact.points", v.split("|").map((s) => s.trim()).filter(Boolean))} /></div><TextField label="Reply note" value={value("contact.replyNote")} onChange={(v) => change("contact.replyNote", v)} /></div><div className="form-divider" /><div className="field-grid"><TextField label="Name label" value={value("contact.nameLabel")} onChange={(v) => change("contact.nameLabel", v)} /><TextField label="Email label" value={value("contact.emailLabel")} onChange={(v) => change("contact.emailLabel", v)} /><TextField label="Company label" value={value("contact.companyLabel")} onChange={(v) => change("contact.companyLabel", v)} /><TextField label="Message label" value={value("contact.messageLabel")} onChange={(v) => change("contact.messageLabel", v)} /><TextField label="Message placeholder" value={value("contact.messagePlaceholder")} onChange={(v) => change("contact.messagePlaceholder", v)} /><TextField label="Submit button" value={value("contact.submitLabel")} onChange={(v) => change("contact.submitLabel", v)} /><TextField label="Sending label" value={value("contact.sendingLabel")} onChange={(v) => change("contact.sendingLabel", v)} /><div className="field full"><TextField label="Privacy note" value={value("contact.privacyNote")} onChange={(v) => change("contact.privacyNote", v)} /></div></div><div className="form-divider" /><div className="field-grid"><TextField label="Success title" value={value("contact.successTitle")} onChange={(v) => change("contact.successTitle", v)} /><TextField label="Success button" value={value("contact.successCta")} onChange={(v) => change("contact.successCta", v)} /><div className="field full"><TextArea label="Success body" value={value("contact.successBody")} onChange={(v) => change("contact.successBody", v)} /></div></div></div></>;
  }

  if (section === "social") {
    return <><SectionHead eyebrow="CONTACT" title="Social & contact" description={sectionDescriptions.social} /><div className="editor-card-body"><div className="field-grid"><TextField label="WhatsApp number" value={value("social.whatsappNumber")} onChange={(v) => change("social.whatsappNumber", v)} hint="The number the WhatsApp button opens, e.g. +961 79 453 181. Spaces, dashes and the + are ignored." /><TextField label="WhatsApp prefilled message" value={value("social.whatsappMessage")} onChange={(v) => change("social.whatsappMessage", v)} hint="Text placed in the WhatsApp composer when the chat opens." /><TextField label="WhatsApp URL override" value={value("social.whatsapp")} onChange={(v) => change("social.whatsapp", v)} hint="Optional. Leave blank to use the number above; set a full wa.me URL only to override it." /><TextField label="LinkedIn URL" value={value("social.linkedin")} onChange={(v) => change("social.linkedin", v)} /><TextField label="Instagram URL" value={value("social.instagram")} onChange={(v) => change("social.instagram", v)} /><TextField label="WhatsApp accessibility label" value={value("social.whatsappLabel")} onChange={(v) => change("social.whatsappLabel", v)} /><TextField label="AI assistant button label" value={value("social.chatbotLabel")} onChange={(v) => change("social.chatbotLabel", v)} /><TextField label="Assistant title" value={value("social.chatbotTitle")} onChange={(v) => change("social.chatbotTitle", v)} /><div className="field full"><TextField label="Assistant subtitle" value={value("social.chatbotSubtitle")} onChange={(v) => change("social.chatbotSubtitle", v)} /></div></div></div></>;
  }

  return <><SectionHead eyebrow="WEBSITE" title="Footer" description={sectionDescriptions.footer} /><div className="editor-card-body"><TextField label="Legal line" value={value("footer.legal")} onChange={(v) => change("footer.legal", v)} /></div></>;
}

const CAREER_FORM_FIELDS: [string, string][] = [
  ["nameLabel", "Name label"], ["namePlaceholder", "Name placeholder"],
  ["emailLabel", "Email label"], ["emailPlaceholder", "Email placeholder"],
  ["phoneLabel", "Phone label"], ["phonePlaceholder", "Phone placeholder"],
  ["locationLabel", "Location label"], ["locationPlaceholder", "Location placeholder"],
  ["roleLabel", "Role label"], ["rolePlaceholder", "Role placeholder"], ["roleGeneralOption", "General-interest option"],
  ["linkedinLabel", "LinkedIn label"], ["linkedinPlaceholder", "LinkedIn placeholder"],
  ["resumeLabel", "Resume label"], ["resumeDropTitle", "Upload title"], ["resumeDropBrowse", "Upload browse text"],
  ["resumeReplace", "Upload replace text"], ["resumeHint", "Upload hint"],
  ["coverLabel", "Cover letter label"], ["coverPlaceholder", "Cover letter placeholder"],
  ["submit", "Submit button"], ["submitting", "Submitting text"], ["success", "Success message"],
  ["errorResumeMissing", "Error: resume missing"], ["errorResumeType", "Error: wrong file type"],
  ["errorResumeSize", "Error: file too large"], ["errorGeneric", "Error: generic"],
];

const PRODUCT_ICON_CHOICES: AP_IconName[] = ["flow", "chart", "sparkles", "layers", "brain", "cloud", "database", "nodes", "grid", "box", "shield", "shield-check", "lock", "rocket", "sliders", "globe", "code", "trend-up", "compass", "spark"];

const ROLE_ICON_CHOICES: AP_IconName[] = ["code", "brain", "cloud", "chart", "trend-up", "database", "layers", "nodes", "flow", "briefcase", "shield", "globe", "grid", "compass", "spark", "graduation", "leaf", "box", "message", "search", "lock", "calendar", "mail"];
const STAT_ICON_CHOICES: AP_IconName[] = ["users", "globe", "chart", "spark", "shield", "grid", "nodes", "briefcase"];
const VALUE_ICON_CHOICES: AP_IconName[] = ["shield-check", "sparkles", "users", "bulb", "rocket", "shield", "spark", "compass", "graduation", "leaf", "check", "flow"];

function SelectField({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <div className="field">
      <label>{label}</label>
      <select className="ap-select" value={value} onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

/** Add / remove / reorder controls shared by every editable list on the careers page. */
function ListControls({ index, length, onMove, onRemove }: { index: number; length: number; onMove: (index: number, direction: number) => void; onRemove: (index: number) => void }) {
  return (
    <div style={{ display: "flex", gap: 6 }}>
      <button className="ap-button ap-button-soft" type="button" disabled={index === 0} onClick={() => onMove(index, -1)} aria-label="Move up">↑</button>
      <button className="ap-button ap-button-soft" type="button" disabled={index === length - 1} onClick={() => onMove(index, 1)} aria-label="Move down">↓</button>
      <button className="ap-button ap-button-soft" type="button" onClick={() => onRemove(index)}>Remove</button>
    </div>
  );
}

function listHelpers<T>(items: T[], commit: (next: T[]) => void) {
  return {
    add: (item: T) => commit([...items, item]),
    remove: (index: number) => commit(items.filter((_, position) => position !== index)),
    move: (index: number, direction: number) => {
      const next = [...items];
      const target = index + direction;
      if (target < 0 || target >= next.length) return;
      [next[index], next[target]] = [next[target], next[index]];
      commit(next);
    },
  };
}

function renderProducts(content: SiteContent, change: (path: string, value: unknown) => void, value: (path: string) => string) {
  const products = content.products;
  const items = products.items ?? [];
  const highlights = products.heroHighlights ?? [];
  const deployItems = products.deployItems ?? [];
  const stats = products.stats ?? [];
  const clients = products.clients ?? [];
  const flowOrder = products.flowOrder ?? [];
  const outcome = products.flowOutcome ?? [];
  const capabilities = products.featuredCapabilities ?? [];

  const itemList = listHelpers(items, (next) => change("products.items", next));
  const highlightList = listHelpers(highlights, (next) => change("products.heroHighlights", next));
  const deployList = listHelpers(deployItems, (next) => change("products.deployItems", next));
  const statList = listHelpers(stats, (next) => change("products.stats", next));
  const clientList = listHelpers(clients, (next) => change("products.clients", next));
  const flowList = listHelpers(flowOrder, (next) => change("products.flowOrder", next));
  const outcomeList = listHelpers(outcome, (next) => change("products.flowOutcome", next));
  const capabilityList = listHelpers(capabilities, (next) => change("products.featuredCapabilities", next));

  return (
    <>
      <SectionHead eyebrow="PRODUCTS" title="Products page" description="Every block, product, and label on the public products page is managed here. Clear the product list and the page falls back to its empty state." />
      <div className="editor-card-body">
        <div className="field-grid">
          <TextField label="Eyebrow" value={value("products.eyebrow")} onChange={(v) => change("products.eyebrow", v)} />
          <TextField label="Main title" value={value("products.title")} onChange={(v) => change("products.title", v)} />
          <TextField label="Highlighted second line" value={value("products.highlight")} onChange={(v) => change("products.highlight", v)} />
          <TextField label="Primary CTA" value={value("products.primaryCta")} onChange={(v) => change("products.primaryCta", v)} />
          <div className="field full"><TextArea label="Intro body" value={value("products.body")} onChange={(v) => change("products.body", v)} /></div>
          <TextField label="Hero image path" value={value("products.heroImage")} onChange={(v) => change("products.heroImage", v)} hint="Blank keeps the built-in console mockup." />
          <TextField label="Hero image alt text" value={value("products.heroImageAlt")} onChange={(v) => change("products.heroImageAlt", v)} />
        </div>

        <div className="subcard-head"><strong>Hero highlights</strong><button className="ap-button ap-button-soft" type="button" onClick={() => highlightList.add({ title: "New highlight", body: "", icon: "box" })}>Add highlight</button></div>
        <div className="array-stack">
          {highlights.map((item, index) => (
            <div className="subcard" key={`hl-${index}`}>
              <div className="subcard-head"><strong>{item.title || `Highlight ${index + 1}`}</strong><ListControls index={index} length={highlights.length} onMove={highlightList.move} onRemove={highlightList.remove} /></div>
              <div className="field-grid three">
                <TextField label="Title" value={item.title} onChange={(v) => change(`products.heroHighlights.${index}.title`, v)} />
                <TextField label="Body" value={item.body} onChange={(v) => change(`products.heroHighlights.${index}.body`, v)} />
                <SelectField label="Icon" value={item.icon ?? "box"} options={PRODUCT_ICON_CHOICES} onChange={(v) => change(`products.heroHighlights.${index}.icon`, v)} />
              </div>
            </div>
          ))}
        </div>

        <div className="form-divider" />
        <div className="field-grid">
          <TextField label="Suite eyebrow" value={value("products.suiteEyebrow")} onChange={(v) => change("products.suiteEyebrow", v)} />
          <TextField label="Suite title" value={value("products.suiteTitle")} onChange={(v) => change("products.suiteTitle", v)} />
          <TextField label="Empty-state title" value={value("products.emptyTitle")} onChange={(v) => change("products.emptyTitle", v)} />
          <div className="field full"><TextArea label="Empty-state body (shown when there are no products)" value={value("products.emptyBody")} onChange={(v) => change("products.emptyBody", v)} rows={2} /></div>
        </div>

        <div className="subcard-head">
          <div><strong>Products</strong><span style={{ display: "block" }}>{items.length ? `${items.length} published on the products page` : "None published — the public page shows the empty state."}</span></div>
          <button className="ap-button ap-button-primary" type="button" onClick={() => itemList.add({ name: "New product", category: "Category", body: "", features: [], icon: "layers", cta: "Explore" })}><AP_AdminIcon name="check" /> Add product</button>
        </div>
        {items.length ? (
          <div className="array-stack">
            {items.map((item, index) => {
              const featureList = listHelpers(item.features ?? [], (next) => change(`products.items.${index}.features`, next));
              return (
                <div className="subcard" key={`prod-${index}`}>
                  <div className="subcard-head"><strong>{item.name || `Product ${index + 1}`}</strong><ListControls index={index} length={items.length} onMove={itemList.move} onRemove={itemList.remove} /></div>
                  <div className="field-grid three">
                    <TextField label="Name" value={item.name} onChange={(v) => change(`products.items.${index}.name`, v)} />
                    <TextField label="Category" value={item.category} onChange={(v) => change(`products.items.${index}.category`, v)} />
                    <SelectField label="Icon" value={item.icon ?? "layers"} options={PRODUCT_ICON_CHOICES} onChange={(v) => change(`products.items.${index}.icon`, v)} />
                    <TextField label="Link label" value={item.cta ?? ""} onChange={(v) => change(`products.items.${index}.cta`, v)} />
                    <div className="field full"><TextArea label="Description" value={item.body} onChange={(v) => change(`products.items.${index}.body`, v)} rows={2} /></div>
                  </div>
                  <div className="subcard-head" style={{ marginTop: 12 }}><strong>Capabilities</strong><button className="ap-button ap-button-soft" type="button" onClick={() => featureList.add("New capability")}>Add capability</button></div>
                  <div className="field-grid">
                    {(item.features ?? []).map((feature, position) => (
                      <div className="field" key={`f-${index}-${position}`}>
                        <label>Capability {position + 1}</label>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input className="ap-input" value={feature} onChange={(e: ChangeEvent<HTMLInputElement>) => change(`products.items.${index}.features.${position}`, e.target.value)} />
                          <button className="ap-button ap-button-soft" type="button" onClick={() => featureList.remove(position)}>Remove</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="editor-empty">
            <div className="empty-icon"><AP_AdminIcon name="products" /></div>
            <h3>No products are published.</h3>
            <p>Use “Add product” when a product is ready. Until then the public page shows your empty-state message.</p>
          </div>
        )}

        <div className="form-divider" />
        <div className="field-grid">
          <TextField label="Flow eyebrow" value={value("products.flowEyebrow")} onChange={(v) => change("products.flowEyebrow", v)} />
          <TextField label="Flow title" value={value("products.flowTitle")} onChange={(v) => change("products.flowTitle", v)} />
        </div>
        <div className="subcard-head"><strong>Flow order</strong><button className="ap-button ap-button-soft" type="button" onClick={() => flowList.add(items[0]?.name ?? "")}>Add step</button></div>
        <div className="field-grid">
          {flowOrder.map((name, index) => (
            <div className="field" key={`flow-${index}`}>
              <label>Step {index + 1}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <select className="ap-select" value={name} onChange={(e: ChangeEvent<HTMLSelectElement>) => change(`products.flowOrder.${index}`, e.target.value)}>
                  {items.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                </select>
                <button className="ap-button ap-button-soft" type="button" onClick={() => flowList.remove(index)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="subcard-head"><strong>Flow outcome lines</strong><button className="ap-button ap-button-soft" type="button" onClick={() => outcomeList.add("New line")}>Add line</button></div>
        <div className="field-grid">
          {outcome.map((line, index) => (
            <div className="field" key={`out-${index}`}>
              <label>Line {index + 1}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="ap-input" value={line} onChange={(e: ChangeEvent<HTMLInputElement>) => change(`products.flowOutcome.${index}`, e.target.value)} />
                <button className="ap-button ap-button-soft" type="button" onClick={() => outcomeList.remove(index)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="form-divider" />
        <div className="field-grid">
          <TextField label="Deploy eyebrow" value={value("products.deployEyebrow")} onChange={(v) => change("products.deployEyebrow", v)} />
          <TextField label="Deploy title" value={value("products.deployTitle")} onChange={(v) => change("products.deployTitle", v)} />
          <div className="field full"><TextArea label="Deploy body" value={value("products.deployBody")} onChange={(v) => change("products.deployBody", v)} rows={2} /></div>
          <TextField label="Deploy card title" value={value("products.deployCardTitle")} onChange={(v) => change("products.deployCardTitle", v)} />
          <TextField label="Deploy card CTA" value={value("products.deployCardCta")} onChange={(v) => change("products.deployCardCta", v)} />
          <div className="field full"><TextArea label="Deploy card body" value={value("products.deployCardBody")} onChange={(v) => change("products.deployCardBody", v)} rows={2} /></div>
        </div>
        <div className="subcard-head"><strong>Deployment benefits</strong><button className="ap-button ap-button-soft" type="button" onClick={() => deployList.add({ title: "New benefit", body: "", icon: "box" })}>Add benefit</button></div>
        <div className="array-stack">
          {deployItems.map((item, index) => (
            <div className="subcard" key={`dep-${index}`}>
              <div className="subcard-head"><strong>{item.title || `Benefit ${index + 1}`}</strong><ListControls index={index} length={deployItems.length} onMove={deployList.move} onRemove={deployList.remove} /></div>
              <div className="field-grid three">
                <TextField label="Title" value={item.title} onChange={(v) => change(`products.deployItems.${index}.title`, v)} />
                <TextField label="Body" value={item.body} onChange={(v) => change(`products.deployItems.${index}.body`, v)} />
                <SelectField label="Icon" value={item.icon ?? "box"} options={PRODUCT_ICON_CHOICES} onChange={(v) => change(`products.deployItems.${index}.icon`, v)} />
              </div>
            </div>
          ))}
        </div>

        <div className="form-divider" />
        <div className="field-grid">
          <TextField label="Featured eyebrow" value={value("products.featuredEyebrow")} onChange={(v) => change("products.featuredEyebrow", v)} />
          <TextField label="Featured product name" value={value("products.featuredName")} onChange={(v) => change("products.featuredName", v)} hint="Leave blank to hide the featured section." />
          <TextField label="Featured category" value={value("products.featuredCategory")} onChange={(v) => change("products.featuredCategory", v)} />
          <TextField label="Capabilities heading" value={value("products.featuredCapabilitiesLabel")} onChange={(v) => change("products.featuredCapabilitiesLabel", v)} />
          <div className="field full"><TextArea label="Featured body" value={value("products.featuredBody")} onChange={(v) => change("products.featuredBody", v)} rows={2} /></div>
          <TextField label="Featured image path" value={value("products.featuredImage")} onChange={(v) => change("products.featuredImage", v)} hint="Blank keeps the built-in preview mockup." />
          <TextField label="Featured image alt text" value={value("products.featuredImageAlt")} onChange={(v) => change("products.featuredImageAlt", v)} />
        </div>
        <div className="subcard-head"><strong>Featured capabilities</strong><button className="ap-button ap-button-soft" type="button" onClick={() => capabilityList.add("New capability")}>Add capability</button></div>
        <div className="field-grid">
          {capabilities.map((capability, index) => (
            <div className="field" key={`cap-${index}`}>
              <label>Capability {index + 1}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="ap-input" value={capability} onChange={(e: ChangeEvent<HTMLInputElement>) => change(`products.featuredCapabilities.${index}`, e.target.value)} />
                <button className="ap-button ap-button-soft" type="button" onClick={() => capabilityList.remove(index)}>Remove</button>
              </div>
            </div>
          ))}
        </div>

        <div className="form-divider" />
        <div className="field-grid">
          <TextField label="CTA title" value={value("products.ctaTitle")} onChange={(v) => change("products.ctaTitle", v)} />
          <TextField label="CTA body" value={value("products.ctaBody")} onChange={(v) => change("products.ctaBody", v)} />
          <TextField label="CTA primary button" value={value("products.ctaPrimary")} onChange={(v) => change("products.ctaPrimary", v)} />
          <TextField label="CTA secondary button" value={value("products.ctaSecondary")} onChange={(v) => change("products.ctaSecondary", v)} />
        </div>

        <div className="form-divider" />
        <div className="field-grid">
          <TextField label="Trust strip eyebrow" value={value("products.trustEyebrow")} onChange={(v) => change("products.trustEyebrow", v)} />
        </div>
        <div className="subcard-head"><strong>Client names</strong><button className="ap-button ap-button-soft" type="button" onClick={() => clientList.add("New client")}>Add client</button></div>
        <div className="field-grid">
          {clients.map((client, index) => (
            <div className="field" key={`cl-${index}`}>
              <label>Client {index + 1}</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input className="ap-input" value={client} onChange={(e: ChangeEvent<HTMLInputElement>) => change(`products.clients.${index}`, e.target.value)} />
                <button className="ap-button ap-button-soft" type="button" onClick={() => clientList.remove(index)}>Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="subcard-head"><strong>Trust stats</strong><button className="ap-button ap-button-soft" type="button" onClick={() => statList.add({ value: "0+", label: "New stat" })}>Add stat</button></div>
        <div className="array-stack">
          {stats.map((stat, index) => (
            <div className="subcard" key={`st-${index}`}>
              <div className="subcard-head"><strong>Stat {index + 1}</strong><ListControls index={index} length={stats.length} onMove={statList.move} onRemove={statList.remove} /></div>
              <div className="field-grid">
                <TextField label="Figure" value={stat.value} onChange={(v) => change(`products.stats.${index}.value`, v)} />
                <TextField label="Label" value={stat.label} onChange={(v) => change(`products.stats.${index}.label`, v)} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

function renderBlogs(content: SiteContent, change: (path: string, value: unknown) => void, value: (path: string) => string) {
  return <><SectionHead eyebrow="BLOGS & NEWS" title="Newsroom layout" description="Prepare the page language and filtering structure now. Publish actual achievements, collaborations, and news only when they exist." /><div className="editor-card-body"><div className="field-grid"><TextField label="Eyebrow" value={value("blogs.eyebrow")} onChange={(v) => change("blogs.eyebrow", v)} /><TextField label="Main title" value={value("blogs.title")} onChange={(v) => change("blogs.title", v)} /><TextField label="Highlighted words" value={value("blogs.highlight")} onChange={(v) => change("blogs.highlight", v)} /><div className="field full"><TextArea label="Intro body" value={value("blogs.body")} onChange={(v) => change("blogs.body", v)} /></div><TextField label="Subscribe title" value={value("blogs.subscribeTitle")} onChange={(v) => change("blogs.subscribeTitle", v)} /><TextArea label="Subscribe body" value={value("blogs.subscribeBody")} onChange={(v) => change("blogs.subscribeBody", v)} /><TextField label="Featured label" value={value("blogs.featuredLabel")} onChange={(v) => change("blogs.featuredLabel", v)} /><TextField label="Empty-state title" value={value("blogs.emptyTitle")} onChange={(v) => change("blogs.emptyTitle", v)} /><div className="field full"><TextArea label="Empty-state body" value={value("blogs.emptyBody")} onChange={(v) => change("blogs.emptyBody", v)} /></div><div className="field full"><TextField label="Categories (separate with |)" value={content.blogs.categories.join(" | ")} onChange={(v) => change("blogs.categories", v.split("|").map((s) => s.trim()).filter(Boolean))} /></div></div><div className="editor-empty"><div className="empty-icon"><AP_AdminIcon name="blogs" /></div><h3>No articles are published.</h3><p>The public newsroom can stay visually complete without fake Series B rounds, vendor awards, or partnerships. Add real updates once they are approved.</p></div></div></>;
}


function renderCareers(content: SiteContent, change: (path: string, value: unknown) => void, value: (path: string) => string) {
  const careers = content.careers;
  const roles = careers.roles ?? [];
  const values = careers.values ?? [];
  const stats = careers.heroStats ?? [];
  const steps = careers.steps ?? [];

  const roleList = listHelpers(roles, (next) => change("careers.roles", next));
  const valueList = listHelpers(values, (next) => change("careers.values", next));
  const statList = listHelpers(stats, (next) => change("careers.heroStats", next));
  const stepList = listHelpers(steps, (next) => change("careers.steps", next));

  return (
    <>
      <SectionHead eyebrow="CAREERS" title="Careers page" description="Every block on the public careers page is managed here — hero, values, open roles, the application section, and the hiring process. Openings are published the moment you add them and the page falls back to its empty state when the list is cleared." />
      <div className="editor-card-body">
        <div className="field-grid">
          <TextField label="Eyebrow" value={value("careers.eyebrow")} onChange={(v) => change("careers.eyebrow", v)} />
          <TextField label="Main title" value={value("careers.title")} onChange={(v) => change("careers.title", v)} />
          <TextField label="Highlighted second line" value={value("careers.highlight")} onChange={(v) => change("careers.highlight", v)} />
          <div className="field full"><TextArea label="Intro body" value={value("careers.body")} onChange={(v) => change("careers.body", v)} /></div>
          <TextField label="Primary CTA" value={value("careers.primaryCta")} onChange={(v) => change("careers.primaryCta", v)} />
          <TextField label="Secondary link" value={value("careers.secondaryCta")} onChange={(v) => change("careers.secondaryCta", v)} />
          <div className="field full"><TextField label="Hero image path" hint="Leave blank to keep the illustrated placeholder. Point it at an uploaded file, e.g. /api/assets/team/careers.jpg" value={value("careers.heroImage")} onChange={(v) => change("careers.heroImage", v)} /></div>
        </div>

        <div className="form-divider" />
        <div className="subcard-head"><strong>Hero stat cards</strong><button className="ap-button ap-button-soft" type="button" onClick={() => statList.add({ value: "0+", label: "New stat", icon: "users" })}>Add stat</button></div>
        <div className="array-stack">
          {stats.map((item, index) => (
            <div className="subcard" key={`stat-${index}`}>
              <div className="subcard-head"><strong>Stat {index + 1}</strong><ListControls index={index} length={stats.length} onMove={statList.move} onRemove={statList.remove} /></div>
              <div className="field-grid three">
                <TextField label="Figure" value={item.value} onChange={(v) => change(`careers.heroStats.${index}.value`, v)} />
                <TextField label="Label" value={item.label} onChange={(v) => change(`careers.heroStats.${index}.label`, v)} />
                <SelectField label="Icon" value={item.icon ?? "users"} options={STAT_ICON_CHOICES} onChange={(v) => change(`careers.heroStats.${index}.icon`, v)} />
              </div>
            </div>
          ))}
        </div>

        <div className="form-divider" />
        <div className="field-grid">
          <TextField label="Values eyebrow" value={value("careers.valuesEyebrow")} onChange={(v) => change("careers.valuesEyebrow", v)} />
          <TextField label="Values title" value={value("careers.valuesTitle")} onChange={(v) => change("careers.valuesTitle", v)} />
        </div>
        <div className="subcard-head"><strong>Values</strong><button className="ap-button ap-button-soft" type="button" onClick={() => valueList.add({ title: "New value", body: "", icon: "spark" })}>Add value</button></div>
        <div className="array-stack">
          {values.map((item, index) => (
            <div className="subcard" key={`value-${index}`}>
              <div className="subcard-head"><strong>Value {index + 1}</strong><ListControls index={index} length={values.length} onMove={valueList.move} onRemove={valueList.remove} /></div>
              <div className="field-grid">
                <TextField label="Title" value={item.title} onChange={(v) => change(`careers.values.${index}.title`, v)} />
                <SelectField label="Icon" value={item.icon ?? "spark"} options={VALUE_ICON_CHOICES} onChange={(v) => change(`careers.values.${index}.icon`, v)} />
                <div className="field full"><TextArea label="Body" value={item.body} onChange={(v) => change(`careers.values.${index}.body`, v)} rows={2} /></div>
              </div>
            </div>
          ))}
        </div>

        <div className="form-divider" />
        <div className="field-grid">
          <TextField label="Roles eyebrow" value={value("careers.rolesEyebrow")} onChange={(v) => change("careers.rolesEyebrow", v)} />
          <TextField label="Roles title" value={value("careers.rolesTitle")} onChange={(v) => change("careers.rolesTitle", v)} />
          <TextField label="View-all link label" value={value("careers.viewAllLabel")} onChange={(v) => change("careers.viewAllLabel", v)} />
          <TextField label="Empty-state title" value={value("careers.emptyTitle")} onChange={(v) => change("careers.emptyTitle", v)} />
          <div className="field full"><TextArea label="Empty-state body (shown when there are no open roles)" value={value("careers.emptyBody")} onChange={(v) => change("careers.emptyBody", v)} rows={2} /></div>
        </div>

        <div className="subcard-head">
          <div><strong>Open roles</strong><span style={{ display: "block" }}>{roles.length ? `${roles.length} published on the careers page` : "None published — the public page shows the empty state."}</span></div>
          <button className="ap-button ap-button-primary" type="button" onClick={() => roleList.add({ title: "New role", type: "Engineering", location: "Remote", summary: "", icon: "code" })}><AP_AdminIcon name="check" /> Add role</button>
        </div>
        {roles.length ? (
          <div className="array-stack">
            {roles.map((role, index) => (
              <div className="subcard" key={`role-${index}`}>
                <div className="subcard-head"><strong>{role.title || `Role ${index + 1}`}</strong><ListControls index={index} length={roles.length} onMove={roleList.move} onRemove={roleList.remove} /></div>
                <div className="field-grid three">
                  <TextField label="Title" value={role.title} onChange={(v) => change(`careers.roles.${index}.title`, v)} />
                  <TextField label="Department" value={role.type} onChange={(v) => change(`careers.roles.${index}.type`, v)} />
                  <TextField label="Location" value={role.location} onChange={(v) => change(`careers.roles.${index}.location`, v)} />
                  <SelectField label="Icon" value={role.icon ?? "code"} options={ROLE_ICON_CHOICES} onChange={(v) => change(`careers.roles.${index}.icon`, v)} />
                  <div className="field full"><TextArea label="Summary" value={role.summary} onChange={(v) => change(`careers.roles.${index}.summary`, v)} rows={2} /></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="editor-empty">
            <div className="empty-icon"><AP_AdminIcon name="products" /></div>
            <h3>No public roles are published.</h3>
            <p>Use “Add role” when an opening is approved. Until then the careers page shows your empty-state message instead of inventing openings.</p>
          </div>
        )}

        <div className="form-divider" />
        <div className="field-grid">
          <TextField label="Apply eyebrow" value={value("careers.applyEyebrow")} onChange={(v) => change("careers.applyEyebrow", v)} />
          <TextField label="Apply title" value={value("careers.applyTitle")} onChange={(v) => change("careers.applyTitle", v)} />
          <div className="field full"><TextArea label="Apply intro" value={value("careers.applyBody")} onChange={(v) => change("careers.applyBody", v)} rows={2} /></div>
          <div className="field full"><TextArea label="Privacy note" value={value("careers.applyNote")} onChange={(v) => change("careers.applyNote", v)} rows={2} /></div>
        </div>

        <div className="form-divider" />
        <div className="field-grid">
          <TextField label="Process eyebrow" value={value("careers.processEyebrow")} onChange={(v) => change("careers.processEyebrow", v)} />
          <TextField label="Process title" value={value("careers.processTitle")} onChange={(v) => change("careers.processTitle", v)} />
        </div>
        <div className="subcard-head"><strong>Hiring steps</strong><button className="ap-button ap-button-soft" type="button" onClick={() => stepList.add({ title: "New step", body: "" })}>Add step</button></div>
        <div className="array-stack">
          {steps.map((step, index) => (
            <div className="subcard" key={`step-${index}`}>
              <div className="subcard-head"><strong>Step {index + 1}</strong><ListControls index={index} length={steps.length} onMove={stepList.move} onRemove={stepList.remove} /></div>
              <div className="field-grid">
                <TextField label="Title" value={step.title} onChange={(v) => change(`careers.steps.${index}.title`, v)} />
                <TextArea label="Body" value={step.body} onChange={(v) => change(`careers.steps.${index}.body`, v)} rows={2} />
              </div>
            </div>
          ))}
        </div>

        <div className="form-divider" />
        <div className="subcard-head"><div><strong>Application form labels</strong><span style={{ display: "block" }}>Every word on the public application form, including placeholders and messages.</span></div></div>
        <div className="field-grid">
          {CAREER_FORM_FIELDS.map(([key, label]) => (
            <TextField key={key} label={label} value={value(`careers.form.${key}`)} onChange={(v) => change(`careers.form.${key}`, v)} />
          ))}
          <TextField label="Role card link label" value={value("careers.viewRoleLabel")} onChange={(v) => change("careers.viewRoleLabel", v)} />
          <TextField label="Hero image alt text" value={value("careers.heroImageAlt")} onChange={(v) => change("careers.heroImageAlt", v)} />
        </div>

        <div className="form-divider" />
        <div className="field-grid">
          <TextField label="Closing title" value={value("careers.closingTitle")} onChange={(v) => change("careers.closingTitle", v)} />
          <TextField label="Closing CTA" value={value("careers.closingCta")} onChange={(v) => change("careers.closingCta", v)} />
          <div className="field full"><TextArea label="Closing body" value={value("careers.closingBody")} onChange={(v) => change("careers.closingBody", v)} rows={2} /></div>
        </div>
      </div>
    </>
  );
}
