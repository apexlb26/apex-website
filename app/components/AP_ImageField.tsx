"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { AP_AdminIcon } from "@/app/components/AP_AdminIcons";
import type { AdminMediaItem, AdminMediaListResponse, AdminMediaResponse } from "@/shared/types";

/*
 * An image slot in the CMS.
 *
 * Previously every image was a bare text input: upload on the Media page, copy
 * the path, come back, paste it. This shows the picture that is actually set,
 * and lets an editor swap it from the library or upload a replacement without
 * leaving the field. The value stored in the content is still just the path,
 * so nothing downstream changed.
 */

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function AP_ImageField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
}) {
  const [picking, setPicking] = useState(false);
  const [library, setLibrary] = useState<AdminMediaItem[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const loadLibrary = useCallback(async () => {
    setError("");
    try {
      const response = await fetch("/api/admin/media", { cache: "no-store" });
      const body = (await response.json()) as AdminMediaListResponse;
      if (!body.ok) throw new Error(body.error);
      setLibrary(body.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the media library");
      setLibrary([]);
    }
  }, []);

  useEffect(() => {
    if (picking && library === null) void loadLibrary();
  }, [picking, library, loadLibrary]);

  // Escape closes the picker, matching the other admin overlays.
  useEffect(() => {
    if (!picking) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPicking(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [picking]);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset immediately so re-picking the same file still fires a change.
    event.target.value = "";
    if (!file) return;

    setBusy(true);
    setError("");
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: data });
      const body = (await response.json()) as AdminMediaResponse;
      if (!body.ok) throw new Error(body.error);
      onChange(body.path);
      // The new image belongs at the top of the library next time it opens.
      setLibrary(null);
      setPicking(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  const inputId = `image-${label.replace(/\W+/g, "-").toLowerCase()}`;

  return (
    <div className="field full">
      <label htmlFor={inputId}>{label}</label>
      <div className="image-field">
        <div className="image-field-preview" data-empty={value ? "false" : "true"}>
          {value
            ? /* eslint-disable-next-line @next/next/no-img-element -- an arbitrary CMS path, not a known static asset */
              <img src={value} alt="" />
            : <span>No image</span>}
        </div>
        <div className="image-field-body">
          <input
            id={inputId}
            className="ap-input"
            value={value}
            placeholder="/api/media/…"
            onChange={(event) => onChange(event.target.value)}
          />
          <div className="image-field-actions">
            <button className="ap-button ap-button-soft" type="button" onClick={() => setPicking(true)}>
              <AP_AdminIcon name="media" /> Library
            </button>
            <label className="ap-button ap-button-soft" style={{ cursor: busy ? "wait" : "pointer" }}>
              <AP_AdminIcon name="upload" /> {busy ? "Uploading…" : "Upload"}
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" onChange={upload} disabled={busy} hidden />
            </label>
            {value ? (
              <button className="ap-button ap-button-soft" type="button" onClick={() => onChange("")}>
                Clear
              </button>
            ) : null}
          </div>
          {hint ? <small style={{ color: "#82949c", lineHeight: 1.45 }}>{hint}</small> : null}
          {error ? <small style={{ color: "#8f3636" }}>{error}</small> : null}
        </div>
      </div>

      {picking ? (
        <div className="image-picker" role="dialog" aria-modal="true" aria-label="Choose an image">
          <button className="image-picker-backdrop" type="button" aria-label="Close" onClick={() => setPicking(false)} />
          <div className="image-picker-card">
            <div className="panel-head">
              <div>
                <h2>Media library</h2>
                <p>Every image stored in the database. Choose one to use it here.</p>
              </div>
              <button className="ap-button ap-button-soft" type="button" onClick={() => setPicking(false)}>Close</button>
            </div>
            {library === null ? (
              <p style={{ padding: 22, fontSize: 12, color: "#70838e" }}>Loading…</p>
            ) : library.length === 0 ? (
              <p style={{ padding: 22, fontSize: 12, color: "#70838e" }}>
                No images yet. Use Upload above, or the Media page, to add one.
              </p>
            ) : (
              <div className="image-picker-grid">
                {library.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="image-picker-tile"
                    data-active={item.path === value ? "true" : "false"}
                    onClick={() => {
                      onChange(item.path);
                      setPicking(false);
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- database-backed media, not a static asset */}
                    <img src={item.path} alt="" loading="lazy" />
                    <span title={item.filename}>{item.filename}</span>
                    <small>{formatSize(item.size)}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
