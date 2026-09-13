import { NextResponse } from "next/server";
import type { ContactRequest, ContactResponse } from "@/shared/types";
import { sendAdminEmail } from "@/shared/mailer";
import { recordSubmission } from "@/shared/store";

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: Partial<ContactRequest>;
  try {
    body = (await request.json()) as Partial<ContactRequest>;
  } catch {
    return NextResponse.json<ContactResponse>({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const name = String(body.name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const company = String(body.company ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (name.length < 2 || name.length > 80) return NextResponse.json<ContactResponse>({ ok: false, error: "Please enter a valid name." }, { status: 422 });
  if (!isEmail(email) || email.length > 180) return NextResponse.json<ContactResponse>({ ok: false, error: "Please enter a valid work email." }, { status: 422 });
  if (company.length > 120) return NextResponse.json<ContactResponse>({ ok: false, error: "Company name is too long." }, { status: 422 });
  if (message.length < 10 || message.length > 2000) return NextResponse.json<ContactResponse>({ ok: false, error: "Please provide a little more project context." }, { status: 422 });

  const lead: ContactRequest & { submittedAt: string } = { name, email, company, message, submittedAt: new Date().toISOString() };
  const webhookUrl = process.env.APEX_CONTACT_WEBHOOK_URL;

  /*
   * The careers form posts here too, passing the role as `company`. Label the
   * two so the inbox can tell an application from a project enquiry.
   */
  const isApplication = message.startsWith("Application for:");
  const subject = isApplication
    ? `New job application - ${company || "General"} - ${name}`
    : `New enquiry from ${name}${company ? ` (${company})` : ""}`;

  /*
   * Delivery must not cost the sender their submission: the enquiry is stored
   * either way, and a failed notification is reported back as `delivered:
   * false` rather than as a failed request. Telling someone to try again when
   * their message is already saved only produces duplicates.
   *
   * The operator's signal is the [mail:undelivered] line below plus the
   * `emailed` flag on the stored submission.
   */
  let emailed = false;
  try {
    const result = await sendAdminEmail({
      subject,
      replyTo: email,
      text: [
        subject,
        "",
        `Name:      ${name}`,
        `Email:     ${email}`,
        `${isApplication ? "Role:     " : "Company:  "} ${company || "—"}`,
        `Submitted: ${lead.submittedAt}`,
        "",
        message,
      ].join("\n"),
    });
    emailed = result.delivered;
    if (!result.delivered) {
      console.error(
        `[mail:undelivered] enquiry from ${email} stored but not emailed - no mail transport is configured. Intended recipients: ${result.recipients.join(", ") || "none"}.`,
      );
    }
  } catch (error) {
    console.error(`[mail:undelivered] enquiry from ${email} stored but the send failed:`, error);
  }

  // The enquiry is kept regardless of whether the notification was delivered.
  await recordSubmission(isApplication ? "application" : "contact", { ...lead }, emailed);

  if (webhookUrl) {
    try {
      const response = await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) });
      if (!response.ok) throw new Error(`Webhook returned ${response.status}`);
    } catch (error) {
      console.error("APEX contact webhook failed", error);
      return NextResponse.json<ContactResponse>({ ok: false, error: "We could not send your request right now. Please try again." }, { status: 502 });
    }
  } else {
    console.log("APEX contact lead (preview mode)", lead);
  }

  return NextResponse.json<ContactResponse>({ ok: true, delivered: emailed, message: "Request received." }, { status: 201 });
}
