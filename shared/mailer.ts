/*
 * Outbound mail for form submissions.
 *
 * Two transports are supported so the site works with either a mailbox on the
 * domain or a hosted API, and neither is required for the site to run:
 *
 *   SMTP    - set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS (or SMTP_URL)
 *   Resend  - set RESEND_API_KEY
 *
 * With neither configured the message is logged instead of sent, so preview
 * and local runs never fail a submission over missing credentials.
 */

/** Where submissions are delivered. Overridable, but this is the default. */
export const ADMIN_RECIPIENT = process.env.APEX_NOTIFY_EMAIL || "admin@apexlb.tech";

function fromAddress() {
  return process.env.APEX_MAIL_FROM || `APEX Website <${ADMIN_RECIPIENT}>`;
}

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export type MailMessage = {
  subject: string;
  text: string;
  /** Applicant address, so a reply in the inbox goes straight to them. */
  replyTo?: string;
  attachments?: MailAttachment[];
};

export type MailResult = { delivered: boolean; transport: "smtp" | "resend" | "log" };

async function sendViaResend(message: MailMessage): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [ADMIN_RECIPIENT],
      subject: message.subject,
      text: message.text,
      ...(message.replyTo ? { reply_to: message.replyTo } : {}),
      ...(message.attachments?.length
        ? {
            attachments: message.attachments.map((file) => ({
              filename: file.filename,
              content: file.content.toString("base64"),
            })),
          }
        : {}),
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend returned ${response.status}: ${(await response.text()).slice(0, 200)}`);
  }
}

async function sendViaSmtp(message: MailMessage): Promise<void> {
  const { createTransport } = await import("nodemailer");
  const transport = process.env.SMTP_URL
    ? createTransport(process.env.SMTP_URL)
    : createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        // 465 is implicit TLS; anything else upgrades with STARTTLS
        secure: Number(process.env.SMTP_PORT || 587) === 465,
        auth: process.env.SMTP_USER
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
      });

  await transport.sendMail({
    from: fromAddress(),
    to: ADMIN_RECIPIENT,
    subject: message.subject,
    text: message.text,
    replyTo: message.replyTo,
    attachments: message.attachments?.map((file) => ({
      filename: file.filename,
      content: file.content,
      contentType: file.contentType,
    })),
  });
}

export async function sendAdminEmail(message: MailMessage): Promise<MailResult> {
  if (process.env.SMTP_URL || process.env.SMTP_HOST) {
    await sendViaSmtp(message);
    return { delivered: true, transport: "smtp" };
  }
  if (process.env.RESEND_API_KEY) {
    await sendViaResend(message);
    return { delivered: true, transport: "resend" };
  }
  const files = message.attachments?.map((f) => `${f.filename} (${f.content.length} bytes)`).join(", ");
  console.log(`[mail:not-configured] to=${ADMIN_RECIPIENT} subject=${message.subject}${files ? ` attachments=${files}` : ""}\n${message.text}`);
  return { delivered: false, transport: "log" };
}
