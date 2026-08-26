"use client";

import { useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";

export default function AP_LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Unable to sign in");
      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <div className="field">
        <label htmlFor="email">Email</label>
        <input id="email" className="ap-input" type="email" autoComplete="username" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="you@apex.ai" required />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input id="password" className="ap-input" type="password" autoComplete="current-password" value={password} onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} placeholder="••••••••••••" required />
      </div>
      {error ? <div className="login-error">{error}</div> : null}
      <button className="ap-button ap-button-primary" disabled={loading}>{loading ? "Signing in…" : "Sign in to APEX CMS"}</button>
    </form>
  );
}
