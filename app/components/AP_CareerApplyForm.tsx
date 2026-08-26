"use client";

import { useEffect, useRef, useState } from "react";
import type { CareerFormLabels, CareerRole } from "@/shared/types";
import AP_Icon from "@/app/components/AP_Icon";

const COVER_LIMIT = 2000;
const RESUME_LIMIT = 10 * 1024 * 1024;
const RESUME_TYPES = [".pdf", ".doc", ".docx"];

/* Shared field utilities. Widths are flex-basis driven so fields reflow
   from four-up to one-up without a breakpoint for every step. */
const labelText = "mb-[7px] block text-[11px] font-bold text-cx-label";
const input = "w-full rounded-md border border-cx-field bg-white px-[11px] text-xs text-cx-ink placeholder:text-[#9aa6b4] focus-visible:border-cx-cyan2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-cx-cyan2/35";
const inputBox = `${input} h-[29px]`;
const selectBox = `${inputBox} appearance-none pr-[30px] invalid:text-[#9aa6b4]`;
const quarter = "min-w-[min(190px,100%)] flex-1 basis-[calc(25%-30px)]";

type Props = {
  roles: CareerRole[];
  locations: string[];
  note: string;
  labels: CareerFormLabels;
};

export default function AP_CareerApplyForm({ roles, locations, note, labels }: Props) {
  const [role, setRole] = useState("");
  const [cover, setCover] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  // Role cards link here — preselect whichever role the visitor clicked.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const trigger = (event.target as HTMLElement | null)?.closest?.("[data-apply-role]");
      if (trigger) setRole(trigger.getAttribute("data-apply-role") || "");
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  function acceptFile(file: File | undefined) {
    if (!file) return;
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (!RESUME_TYPES.includes(extension)) {
      setStatus({ tone: "error", text: labels.errorResumeType });
      return;
    }
    if (file.size > RESUME_LIMIT) {
      setStatus({ tone: "error", text: labels.errorResumeSize });
      return;
    }
    setStatus(null);
    setResume(file);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();

    if (!resume) {
      setStatus({ tone: "error", text: labels.errorResumeMissing });
      return;
    }

    // Multipart so the CV itself is uploaded, not just its name.
    const payload = new FormData();
    payload.set("name", name);
    payload.set("email", email);
    payload.set("role", role || labels.roleGeneralOption);
    payload.set("phone", String(form.get("phone") ?? "").trim());
    payload.set("location", String(form.get("location") ?? "").trim());
    payload.set("linkedin", String(form.get("linkedin") ?? "").trim());
    payload.set("cover", cover.trim().slice(0, COVER_LIMIT));
    payload.set("resume", resume, resume.name);

    setSending(true);
    setStatus(null);
    try {
      const response = await fetch("/api/apply", { method: "POST", body: payload });
      const result = (await response.json()) as { ok: boolean; error?: string };
      if (!result.ok) throw new Error(result.error || labels.errorGeneric);
      setStatus({ tone: "ok", text: labels.success });
      formEl.reset();
      setRole("");
      setCover("");
      setResume(null);
    } catch (error) {
      setStatus({ tone: "error", text: error instanceof Error ? error.message : labels.errorGeneric });
    } finally {
      setSending(false);
    }
  }

  return (
    <form id="apply" onSubmit={submit} className="rounded-[10px] border border-cx-line bg-white px-[clamp(1rem,1.6vw,22px)] py-[clamp(1rem,1.4vw,20px)]">
      <div className="flex flex-wrap gap-x-10 gap-y-4">
        <label className={quarter}>
          <span className={labelText}>{labels.nameLabel} <em className="not-italic text-cx-cyan2">*</em></span>
          <input className={inputBox} name="name" type="text" placeholder={labels.namePlaceholder} required minLength={2} maxLength={80} />
        </label>
        <label className={quarter}>
          <span className={labelText}>{labels.emailLabel} <em className="not-italic text-cx-cyan2">*</em></span>
          <input className={inputBox} name="email" type="email" placeholder={labels.emailPlaceholder} required maxLength={180} />
        </label>
        <label className={quarter}>
          <span className={labelText}>{labels.phoneLabel} <em className="not-italic text-cx-cyan2">*</em></span>
          <input className={inputBox} name="phone" type="tel" placeholder={labels.phonePlaceholder} required maxLength={40} />
        </label>
        <label className={`${quarter} relative`}>
          <span className={labelText}>{labels.locationLabel} <em className="not-italic text-cx-cyan2">*</em></span>
          <select className={selectBox} name="location" defaultValue="" required>
            <option value="" disabled>{labels.locationPlaceholder}</option>
            {locations.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <AP_Icon name="chevron-down" className="pointer-events-none absolute bottom-2 right-2.5 h-3.5 w-3.5 text-[#8fa0b0]" />
        </label>

        {/* rows 2–3: text fields flex on the left, the upload column sits beside them */}
        <div className="flex w-full flex-wrap gap-x-10 gap-y-4">
          <div className="flex min-w-[min(280px,100%)] flex-1 basis-[62%] flex-col gap-4">
            <div className="flex flex-wrap gap-x-10 gap-y-4">
              <label className="relative min-w-[min(200px,100%)] flex-1">
                <span className={labelText}>{labels.roleLabel} <em className="not-italic text-cx-cyan2">*</em></span>
                <select className={selectBox} name="role" value={role} onChange={(event) => setRole(event.target.value)} required>
                  <option value="" disabled>{labels.rolePlaceholder}</option>
                  {roles.map((item) => <option key={item.title} value={item.title}>{item.title}</option>)}
                  <option value={labels.roleGeneralOption}>{labels.roleGeneralOption}</option>
                </select>
                <AP_Icon name="chevron-down" className="pointer-events-none absolute bottom-2 right-2.5 h-3.5 w-3.5 text-[#8fa0b0]" />
              </label>
              <label className="min-w-[min(200px,100%)] flex-1">
                <span className={labelText}>{labels.linkedinLabel}</span>
                <input className={inputBox} name="linkedin" type="url" placeholder={labels.linkedinPlaceholder} maxLength={200} />
              </label>
            </div>

            <label className="block">
              <span className={labelText}>{labels.coverLabel} <em className="not-italic text-cx-cyan2">*</em></span>
              <span className="relative block">
                <textarea
                  className={`${input} h-[60px] resize-none py-[9px] leading-[1.55]`}
                  name="cover"
                  placeholder={labels.coverPlaceholder}
                  maxLength={COVER_LIMIT}
                  required
                  value={cover}
                  onChange={(event) => setCover(event.target.value)}
                />
                <span className="absolute bottom-[7px] right-2.5 text-[10px] text-[#a3aeba]">{cover.length} / {COVER_LIMIT}</span>
              </span>
            </label>
          </div>

          <div className="min-w-[min(260px,100%)] flex-1 basis-[31%]">
            <span className={labelText}>{labels.resumeLabel} <em className="not-italic text-cx-cyan2">*</em></span>
            <div
              role="button"
              tabIndex={0}
              data-drag={dragging}
              onClick={() => fileInput.current?.click()}
              onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); fileInput.current?.click(); } }}
              onDragOver={(event) => { event.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => { event.preventDefault(); setDragging(false); acceptFile(event.dataTransfer.files?.[0]); }}
              className="flex h-[108px] w-full cursor-pointer flex-col items-center justify-center gap-[3px] rounded-lg border border-dashed border-[#b9d9e6] bg-cx-tint p-2.5 text-center transition-colors hover:border-cx-cyan2 hover:bg-[#ecf6fb] data-[drag=true]:border-cx-cyan2 data-[drag=true]:bg-[#ecf6fb]"
            >
              <AP_Icon name="upload-cloud" className="mb-1 h-6 w-6 text-cx-cyan2" />
              <b className="max-w-full truncate px-2 text-[11px] font-bold text-cx-ink">{resume ? resume.name : labels.resumeDropTitle}</b>
              <u className="text-[11px] font-bold text-cx-cyanInk no-underline">{resume ? labels.resumeReplace : labels.resumeDropBrowse}</u>
              <small className="text-[10px] text-cx-muted">{labels.resumeHint}</small>
            </div>
            <input ref={fileInput} type="file" accept=".pdf,.doc,.docx" hidden onChange={(event) => acceptFile(event.target.files?.[0])} />
          </div>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3.5">
        <p className="flex min-w-[min(320px,100%)] flex-1 items-center gap-2.5 text-[11px] text-cx-copy">
          <AP_Icon name="shield-check" className="h-[15px] w-[15px] shrink-0 text-cx-cyan2" />{note}
        </p>
        <button
          type="submit"
          disabled={sending}
          className="inline-flex h-[34px] shrink-0 items-center justify-center gap-2 rounded bg-cx-cyan2 px-[18px] text-[10.5px] font-extrabold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#00695F] disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:h-[13px] [&_svg]:w-[13px]"
        >
          <span>{sending ? labels.submitting : labels.submit}</span>
          <AP_Icon name="arrow-right" />
        </button>
      </div>

      {status && (
        <p role="status" className={`mt-3 text-[11px] font-bold ${status.tone === "ok" ? "text-[#0d7f66]" : "text-[#b4453c]"}`}>
          {status.text}
        </p>
      )}
    </form>
  );
}
