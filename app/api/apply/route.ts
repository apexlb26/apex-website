import { NextResponse } from "next/server";
import { sendAdminEmail } from "@/shared/mailer";
import { recordSubmission } from "@/shared/store";

/*
 * Career applications. Posted as multipart so the CV travels with the form
 * and is attached to the notification email, rather than only its filename
 * being mentioned in the body.
 */
export const runtime = "nodejs";

const MAX_RESUME_BYTES = 10 * 1024 * 1024;   // matches the "Max 10MB" hint shown on the form
const ALLOWED_RESUME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const ALLOWED_EXTENSIONS = /\.(pdf|doc|docx)$/i;

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/** Keep the attachment name safe for a mail header. */
function safeFilename(name: string) {
  return name.replace(/[^\w.\-]+/g, "_").slice(-120) || "resume";
}

export async function POST(request: Request) {
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid application submission." }, { status: 400 });
  }

  const read = (key: string) => String(form.get(key) ?? "").trim();
  const name = read("name");
  const email = read("email");
  const role = read("role");
  const phone = read("phone");
  const location = read("location");
  const linkedin = read("linkedin");
  const cover = read("cover");

  if (name.length < 2 || name.length > 80) {
    return NextResponse.json({ ok: false, error: "Please enter a valid name." }, { status: 422 });
  }
  if (!isEmail(email) || email.length > 180) {
    return NextResponse.json({ ok: false, error: "Please enter a valid email address." }, { status: 422 });
  }

  const resume = form.get("resume");
  if (!(resume instanceof File) || resume.size === 0) {
    return NextResponse.json({ ok: false, error: "Please attach your resume." }, { status: 422 });
  }
  if (resume.size > MAX_RESUME_BYTES) {
    return NextResponse.json({ ok: false, error: "That file is larger than 10MB." }, { status: 422 });
  }
  // Browsers are inconsistent about the type they report, so accept either signal.
  if (!ALLOWED_RESUME_TYPES.has(resume.type) && !ALLOWED_EXTENSIONS.test(resume.name)) {
    return NextResponse.json({ ok: false, error: "Please attach a PDF or Word document." }, { status: 422 });
  }

  const filename = safeFilename(resume.name);
  const content = Buffer.from(await resume.arrayBuffer());
  const submittedAt = new Date().toISOString();
  const subject = `New job application - ${role || "General"} - ${name}`;

  /*
   * Stored before the email is attempted. Delivery used to be the only record
   * of an application, so a mail outage lost it outright; now the database has
   * it either way and `emailed` says whether the notification got through.
   */
  let emailed = false;

  const stored = { name, email, role, phone, location, linkedin, cover, resume: filename, resumeBase64: content.toString("base64"), resumeType: resume.type, submittedAt };

  try {
    const result = await sendAdminEmail({
      subject,
      replyTo: email,
      text: [
        subject,
        "",
        `Name:      ${name}`,
        `Email:     ${email}`,
        `Role:      ${role || "General application"}`,
        `Phone:     ${phone || "—"}`,
        `Location:  ${location || "—"}`,
        `LinkedIn:  ${linkedin || "—"}`,
        `Resume:    ${filename} (attached, ${(content.length / 1024).toFixed(0)} KB)`,
        `Submitted: ${submittedAt}`,
        "",
        cover || "(no cover note)",
      ].join("\n"),
      attachments: [{ filename, content, contentType: resume.type || "application/octet-stream" }],
    });
    emailed = result.delivered;
    if (!result.delivered) {
      console.error(
        `[mail:undelivered] application from ${email} stored but not emailed - no mail transport is configured. Intended recipients: ${result.recipients.join(", ") || "none"}.`,
      );
    }
  } catch (error) {
    /*
     * The application, CV included, is already in hand - so it is not lost and
     * the applicant is not asked to send it again. This used to return 502,
     * which invited a resubmission that stored the whole thing a second time.
     * The failure is reported as `delivered: false` and logged instead.
     */
    console.error(`[mail:undelivered] application from ${email} stored but the send failed:`, error);
  }

  await recordSubmission("application", stored, emailed);

  const webhookUrl = process.env.APEX_CONTACT_WEBHOOK_URL;
  if (webhookUrl) {
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind: "application", name, email, role, phone, location, linkedin, cover, resume: filename, submittedAt }),
      });
    } catch (error) {
      console.error("APEX application webhook failed", error);
    }
  }

  return NextResponse.json({ ok: true, delivered: emailed, message: "Application received." }, { status: 201 });
}
