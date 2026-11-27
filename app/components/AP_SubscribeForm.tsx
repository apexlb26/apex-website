"use client";

import { FormEvent, useState } from "react";
import type { SubscribeRequest, SubscribeResponse } from "@/shared/types";
import { AP_TextBox } from "@/app/components/AP_TextBox";

export default function AP_SubscribeForm({ placeholder, cta, sending, error, className = "" }: { placeholder?: string; cta?: string; sending?: string; error?: string; className?: string } = {}) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    /*
     * Hold the form element. React clears `event.currentTarget` once the
     * handler yields, so reading it after the await below threw - and the
     * catch then showed that raw "null is not an object" where the
     * confirmation belongs, on a signup the server had already accepted.
     */
    const formEl = event.currentTarget;
    const payload: SubscribeRequest = { email: String(new FormData(formEl).get("email") ?? "") };
    setState("sending");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as SubscribeResponse;
      if (!response.ok || !data.ok) throw new Error(data.ok ? (error ?? "") : data.error);
      setState("sent");
      setMessage(data.message);
      formEl.reset();
    } catch (reason) {
      setState("error");
      setMessage(reason instanceof Error ? reason.message : (error ?? ""));
    }
  }

  return (
    <form className={`subscribe-form ${className}`.trim()} onSubmit={submit}>
      <AP_TextBox type="email" name="email" required placeholder={placeholder ?? ""} aria-label={placeholder ?? ""} />
      <button className="button button-primary" disabled={state === "sending"}>{state === "sending" ? (sending ?? "") : (cta ?? "")}</button>
      {message && <p className={`subscribe-status ${state}`}>{message}</p>}
    </form>
  );
}
