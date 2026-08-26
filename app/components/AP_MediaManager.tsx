"use client";

import { useState, type ChangeEvent } from "react";
import { AP_AdminIcon } from "@/app/components/AP_AdminIcons";

export default function AP_MediaManager({ referencedPaths }: { referencedPaths: string[] }) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState("");

  async function upload() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult("");
    try {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body: data });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Upload failed");
      setResult(body.path);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
  }

  return (
    <div className="media-grid">
      <section className="panel">
        <div className="panel-head"><div><h2>Upload asset</h2><p>PNG, JPEG, or WebP · maximum 5 MB.</p></div></div>
        <div style={{ padding: 18 }}>
          <div className="upload-zone">
            <div className="metric-icon" style={{ margin: "0 auto 14px", width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", background: "#e9f7f5", color: "#078b81" }}><AP_AdminIcon name="upload" /></div>
            <strong style={{ display: "block", fontSize: 14, marginBottom: 7 }}>Add an approved website image</strong>
            <p style={{ margin: "0 0 18px", color: "#70838e", fontSize: 12, lineHeight: 1.55 }}>In GitHub mode, the asset is committed into the website repository. In local mode, it is saved under this portal&apos;s public/uploads folder.</p>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={(e: ChangeEvent<HTMLInputElement>) => setFile(e.target.files?.[0] || null)} />
            <button className="ap-button ap-button-primary" style={{ marginTop: 16 }} disabled={!file || loading} onClick={upload}>{loading ? "Uploading…" : "Upload asset"}</button>
            {result ? <div style={{ marginTop: 16, padding: 12, background: "#ebfaf6", border: "1px solid #c7eadf", borderRadius: 10, fontSize: 11, overflowWrap: "anywhere" }}><strong>Public path</strong><br />{result}<br /><button className="ap-button ap-button-soft" style={{ marginTop: 9, minHeight: 34 }} onClick={() => copy(result)}>Copy path</button></div> : null}
            {error ? <div className="login-error" style={{ marginTop: 14 }}>{error}</div> : null}
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-head"><div><h2>Assets referenced by content</h2><p>Paths currently used by the website JSON.</p></div></div>
        <div className="path-list">
          {referencedPaths.map((path) => <div className="path-item" key={path}><code>{path}</code><button className="ap-button ap-button-soft" style={{ minHeight: 34 }} onClick={() => copy(path)}><AP_AdminIcon name="link" /> Copy</button></div>)}
        </div>
      </section>
    </div>
  );
}
