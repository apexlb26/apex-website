"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { AP_AdminIcon } from "@/app/components/AP_AdminIcons";
import type { AdminMediaItem, AdminMediaListResponse, AdminMediaResponse } from "@/shared/types";

/*
 * The media library. Every image is a MongoDB document holding the bytes as
 * base64; nothing is written to disk, so uploads survive a redeploy and work on
 * a read-only host.
 *
 * The listing endpoint omits the base64 payload, so opening this page costs a
 * few kilobytes of metadata rather than every image at once. The thumbnails
 * load from /api/media/<id> like any other image, and are cached.
 */

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default function AP_MediaManager({ referencedPaths }: { referencedPaths: string[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [items, setItems] = useState<AdminMediaItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");

  const referenced = new Set(referencedPaths);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/media", { cache: "no-store" });
      const body = (await response.json()) as AdminMediaListResponse;
      if (!body.ok) throw new Error(body.error);
      setItems(body.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the media library");
      setItems([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function upload() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: data });
      const body = (await response.json()) as AdminMediaResponse;
      if (!body.ok) throw new Error(body.error);
      setResult(body.path);
      setFile(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function remove(item: AdminMediaItem) {
    const warning = referenced.has(item.path)
      ? `${item.filename} is in use on the website. Deleting it will leave a broken image. Delete anyway?`
      : `Delete ${item.filename}? This cannot be undone.`;
    if (!window.confirm(warning)) return;

    setError("");
    try {
      const response = await fetch(`/api/admin/media?id=${encodeURIComponent(item.id)}`, { method: "DELETE" });
      const body = (await response.json()) as { ok: boolean; error?: string };
      if (!body.ok) throw new Error(body.error || "Delete failed");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
  }

  return (
    <div className="media-grid">
      <section className="panel">
        <div className="panel-head"><div><h2>Upload asset</h2><p>PNG, JPEG, WebP, GIF, or SVG · maximum 8 MB.</p></div></div>
        <div style={{ padding: 18 }}>
          <div className="upload-zone">
            <div className="metric-icon" style={{ margin: "0 auto 14px", width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: "#e9f7f5", color: "#078b81" }}><AP_AdminIcon name="upload" /></div>
            <strong style={{ display: "block", fontSize: 14, marginBottom: 7 }}>Add an approved website image</strong>
            <p style={{ margin: "0 0 18px", color: "#70838e", fontSize: 12, lineHeight: 1.55 }}>The file is stored in the database as base64 and served from <code>/api/media/&lt;id&gt;</code>. Nothing is written to disk.</p>
            <input type="file" accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml" onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} />
            <button className="ap-button ap-button-primary" style={{ marginTop: 16 }} disabled={!file || loading} onClick={upload}>{loading ? "Uploading…" : "Upload asset"}</button>
            {result ? <div style={{ marginTop: 16, padding: 12, background: "#ebfaf6", border: "1px solid #c7eadf", borderRadius: 10, fontSize: 11, overflowWrap: "anywhere" }}><strong>Public path</strong><br />{result}<br /><button className="ap-button ap-button-soft" style={{ marginTop: 9, minHeight: 34 }} onClick={() => copy(result)}>Copy path</button></div> : null}
            {error ? <div className="login-error" style={{ marginTop: 14 }}>{error}</div> : null}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head">
          <div><h2>Library</h2><p>{items === null ? "Loading…" : `${items.length} image${items.length === 1 ? "" : "s"} in the database. Images marked “in use” are referenced by the live site.`}</p></div>
          <button className="ap-button ap-button-soft" type="button" onClick={() => void load()}>Refresh</button>
        </div>
        {items === null ? (
          <p style={{ padding: 18, fontSize: 12, color: "#70838e" }}>Loading…</p>
        ) : items.length === 0 ? (
          <p style={{ padding: 18, fontSize: 12, color: "#70838e" }}>No images yet. Upload one to get started.</p>
        ) : (
          <div className="path-list">
            {items.map((item) => (
              <div className="path-item" key={item.id}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <div className="image-field-preview" style={{ width: 58, height: 46, flexShrink: 0 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element -- database-backed media, not a static asset */}
                    <img src={item.path} alt="" loading="lazy" />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: "block", fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.filename}</strong>
                    <code>{item.path}</code>
                    <small style={{ display: "block", color: "#8b9ba3", fontSize: 10 }}>
                      {formatSize(item.size)} · {new Date(item.uploadedAt).toLocaleDateString()}
                      {referenced.has(item.path) ? " · in use" : ""}
                    </small>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
                  <button className="ap-button ap-button-soft" style={{ minHeight: 34 }} onClick={() => copy(item.path)}><AP_AdminIcon name="link" /> Copy</button>
                  <button className="ap-button ap-button-soft" style={{ minHeight: 34 }} onClick={() => remove(item)}><AP_AdminIcon name="x" /> Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
