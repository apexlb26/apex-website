import { NextResponse } from "next/server";
import type { SubscribeRequest, SubscribeResponse } from "@/shared/types";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: Partial<SubscribeRequest>;
  try {
    body = (await request.json()) as Partial<SubscribeRequest>;
  } catch {
    return NextResponse.json<SubscribeResponse>({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim();
  if (!isEmail(email) || email.length > 180) return NextResponse.json<SubscribeResponse>({ ok: false, error: "Please enter a valid email." }, { status: 422 });

  const signup = { email, submittedAt: new Date().toISOString() };
  const webhookUrl = process.env.APEX_SUBSCRIBE_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(signup) });
      if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
    } catch (error) {
      console.error("APEX subscribe webhook failed", error);
      return NextResponse.json<SubscribeResponse>({ ok: false, error: "We could not save your subscription right now." }, { status: 502 });
    }
  } else {
    console.log("APEX subscription (preview mode)", signup);
  }

  return NextResponse.json<SubscribeResponse>({ ok: true, message: "You’re on the list." }, { status: 201 });
}
