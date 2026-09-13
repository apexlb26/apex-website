"use client";

import { useEffect, useState } from "react";

type View = {
  cms: {
    host: string;
    port: number | null;
    secure: boolean | null;
    user: string;
    from: string;
    recipients: string;
    passwordConfigured: boolean;
  };
  effective: {
    host: string;
    port: number | null;
    secure: boolean | null;
    user: string;
    from: string;
    recipients: string;
    passwordConfigured: boolean;
    source: string;
    transport: string;
  };
};

type FormState = {
  host: string;
  port: string;
  secure: boolean;
  user: string;
  password: string;
  from: string;
  recipients: string;
};

const blank: FormState = { host: "", port: "", secure: false, user: "", password: "", from: "", recipients: "" };

export default function AP_AdminMailSettings() {
  const [view, setView] = useState<View | null>(null);
  const [form, setForm] = useState<FormState>(blank);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const response = await fetch("/api/admin/mail-settings", { cache: "no-store" });
    const json = await response.json();
    if (!response.ok || !json.ok) throw new Error(json.error || "Could not load mail settings.");
    const next = json.settings as View;
    setView(next);
    setForm({
      host: next.cms.host || next.effective.host || "",
      port: String(next.cms.port ?? next.effective.port ?? ""),
      secure: next.cms.secure ?? next.effective.secure ?? false,
      user: next.cms.user || next.effective.user || "",
      password: "",
      from: next.cms.from || next.effective.from || "",
      recipients: next.cms.recipients || next.effective.recipients || "",
    });
  }

  useEffect(() => {
    load().catch((error) => setMessage(error instanceof Error ? error.message : "Could not load mail settings."));
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(clearPassword = false) {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/mail-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          port: form.port ? Number(form.port) : null,
          password: form.password,
          clearPassword,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || "Could not save mail settings.");
      setView(json.settings as View);
      setForm((current) => ({ ...current, password: "" }));
      setMessage(clearPassword ? "CMS SMTP password cleared. Environment fallback will be used." : "Mail settings saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save mail settings.");
    } finally {
      setBusy(false);
    }
  }

  async function clearOverrides() {
    if (!confirm("Clear all CMS mail overrides and return to environment fallback?")) return;
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/mail-settings", { method: "DELETE" });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || "Could not clear overrides.");
      await load();
      setMessage("CMS overrides cleared. Environment fallback is active.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not clear overrides.");
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/mail-settings", { method: "POST" });
      const json = await response.json();
      if (!response.ok || !json.ok) throw new Error(json.error || "Test email failed.");
      setMessage(`Test email sent using ${json.transport}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Test email failed.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass = "mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[#00B3A4] focus:ring-2 focus:ring-[#00B3A4]/15";
  const labelClass = "text-xs font-semibold text-slate-600";

  return (
    <section className="setting-card col-span-full">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3>Website mail / SMTP</h3>
          <p>CMS values override the server environment. Leave CMS overrides cleared to use the .env fallback.</p>
        </div>
        {view ? (
          <div className="text-right text-xs text-slate-500">
            <div>Transport: <strong className="text-slate-700">{view.effective.transport}</strong></div>
            <div>Source: <strong className="text-slate-700">{view.effective.source}</strong></div>
          </div>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className={labelClass}>SMTP host<input className={inputClass} value={form.host} onChange={(e) => update("host", e.target.value)} autoComplete="off" /></label>
        <label className={labelClass}>SMTP port<input className={inputClass} type="number" min="1" max="65535" value={form.port} onChange={(e) => update("port", e.target.value)} /></label>
        <label className={labelClass}>SMTP username<input className={inputClass} value={form.user} onChange={(e) => update("user", e.target.value)} autoComplete="off" /></label>
        <label className={labelClass}>SMTP password
          <input className={inputClass} type="password" value={form.password} onChange={(e) => update("password", e.target.value)} autoComplete="new-password" placeholder={view?.cms.passwordConfigured ? "Stored securely - leave blank to keep" : view?.effective.passwordConfigured ? "Environment fallback configured" : "Enter password"} />
        </label>
        <label className={labelClass}>From address<input className={inputClass} value={form.from} onChange={(e) => update("from", e.target.value)} autoComplete="off" /></label>
        <label className={labelClass}>Notification recipient(s)<input className={inputClass} value={form.recipients} onChange={(e) => update("recipients", e.target.value)} placeholder="Comma-separated email addresses" autoComplete="off" /></label>
      </div>

      <label className="mt-4 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <input type="checkbox" checked={form.secure} onChange={(e) => update("secure", e.target.checked)} className="h-4 w-4 accent-[#00B3A4]" />
        Use secure SMTP connection (implicit TLS/SSL)
      </label>

      <p className="mt-3 text-xs leading-5 text-slate-500">
        Passwords saved here are encrypted before being stored in the server-side CMS state collection. The API never returns the saved password to the browser.
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => save(false)} className="rounded-lg bg-[#00B3A4] px-4 py-2 text-xs font-bold text-white disabled:opacity-50">Save mail settings</button>
        <button type="button" disabled={busy} onClick={sendTest} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-50">Send test email</button>
        <button type="button" disabled={busy || !view?.cms.passwordConfigured} onClick={() => save(true)} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 disabled:opacity-40">Clear CMS password</button>
        <button type="button" disabled={busy} onClick={clearOverrides} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-500 disabled:opacity-50">Use environment fallback</button>
      </div>

      {message ? <p className="mt-4 text-sm font-semibold text-slate-700">{message}</p> : null}
    </section>
  );
}
