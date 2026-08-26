"use client";

import { FormEvent, useState } from "react";
import type { SubscribeRequest, SubscribeResponse } from "@/shared/types";
import { AP_TextBox } from "@/app/components/AP_TextBox";

export default function AP_SubscribeForm({ placeholder, cta, className = "" }: { placeholder?: string; cta?: string; className?: string } = {}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload: SubscribeRequest = { email: String(form.get("email") ?? "") };
    setState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as SubscribeResponse;
      if (!response.ok || !data.ok) throw new Error(data.ok ? "Could not subscribe." : data.error);
      setState("sent");
      setMessage(data.message);
      event.currentTarget.reset();
    } catch (reason) {
      setState("error");
      setMessage(reason instanceof Error ? reason.message : "Could not subscribe.");
    }
  }

  return (
    <form className={`subscribe-form ${className}`.trim()} onSubmit={submit}>
      <AP_TextBox type="email" name="email" required placeholder={placeholder ?? "Enter your work email"} aria-label="Work email" />
      <button className="button button-primary" disabled={state === "sending"}>{state === "sending" ? "Sending…" : (cta ?? "Subscribe")}</button>
      {message && <p className={`subscribe-status ${state}`}>{message}</p>}
    </form>
  );
}
