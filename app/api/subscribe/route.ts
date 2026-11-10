import { NextResponse } from "next/server";
import type { SubscribeRequest, SubscribeResponse } from "@/shared/types";
import { recordSubmission } from "@/shared/store";
import { sendAdminEmail } from "@/shared/mailer";

/** Where newsletter signups are announced. */
const SUBSCRIBE_NOTIFY_TO = process.env.APEX_SUBSCRIBE_NOTIFY_EMAIL?.trim() || "info@apexlb.tech";

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

  // Kept in the database whether or not a webhook is configured; previously a
  // signup with no webhook was only written to the server log.
  await recordSubmission("subscribe", signup, false);

  /*
   * Tell the team about the signup. The address is already stored, so a mail
   * failure is logged rather than reported to the visitor - telling them to
   * retry would only create duplicate signups.
   */
  try {
    const result = await sendAdminEmail({
      to: [SUBSCRIBE_NOTIFY_TO],
      replyTo: email,
      subject: `New newsletter subscriber - ${email}`,
      text: [`${email} has subscribed to the APEX newsletter.`, "", `Email:     ${email}`, `Subscribed: ${signup.submittedAt}`].join("\n"),
    });
    if (!result.delivered) {
      console.error(`[mail:undelivered] subscriber ${email} stored but not emailed - no mail transport is configured. Intended: ${result.recipients.join(", ")}.`);
    }
  } catch (error) {
    console.error("APEX subscribe notification failed", error);
  }

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
