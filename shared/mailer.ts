import { getEffectiveMailSettings } from "@/shared/mail-settings";

/*
 * Outbound mail for website actions and form submissions.
 *
 * SMTP values are resolved at runtime from protected CMS mail settings first,
 * with environment variables as the fallback. Nothing provider-specific is
 * hardcoded here.
 *
 * Supported environment fallback:
 *   SMTP_URL
 *   SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS, SMTP_FROM
 *   APEX_NOTIFY_EMAIL
 *   RESEND_API_KEY
 */

/** Compatibility export used only in warning/log messages in existing routes. */
export const ADMIN_RECIPIENT =
  process.env.APEX_NOTIFY_EMAIL || process.env.SMTP_USER || "configured admin recipient";

export type MailAttachment = {
  filename: string;
  content: Buffer;
  contentType?: string;
};

export type MailMessage = {
  subject: string;
  text: string;
  replyTo?: string;
  attachments?: MailAttachment[];
};

export type MailResult = { delivered: boolean; transport: "smtp" | "resend" | "log" };

async function sendViaResend(message: MailMessage): Promise<void> {
  const settings = await getEffectiveMailSettings();
  if (!settings.resendApiKey) throw new Error("RESEND_API_KEY is not configured.");
  if (!settings.from) throw new Error("SMTP_FROM/APEX_MAIL_FROM is not configured.");
  if (!settings.recipients.length) throw new Error("No notification recipient is configured.");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${settings.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: settings.from,
      to: settings.recipients,
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
  const settings = await getEffectiveMailSettings();
  if (!settings.recipients.length) throw new Error("No notification recipient is configured.");
  if (!settings.from) throw new Error("SMTP_FROM/APEX_MAIL_FROM is not configured.");

  const { createTransport } = await import("nodemailer");
  const transport = settings.smtpUrl
    ? createTransport(settings.smtpUrl)
    : (() => {
        if (!settings.host) throw new Error("SMTP_HOST is not configured.");
        if (!settings.port) throw new Error("SMTP_PORT is not configured.");
        if (!settings.user) throw new Error("SMTP_USER is not configured.");
        if (!settings.password) throw new Error("SMTP_PASS is not configured.");
        return createTransport({
          host: settings.host,
          port: settings.port,
          secure: Boolean(settings.secure),
          auth: { user: settings.user, pass: settings.password },
        });
      })();

  await transport.sendMail({
    from: settings.from,
    to: settings.recipients,
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
  const settings = await getEffectiveMailSettings();

  if (settings.smtpUrl || settings.host) {
    await sendViaSmtp(message);
    return { delivered: true, transport: "smtp" };
  }

  if (settings.resendApiKey) {
    await sendViaResend(message);
    return { delivered: true, transport: "resend" };
  }

  const files = message.attachments?.map((f) => `${f.filename} (${f.content.length} bytes)`).join(", ");
  console.log(
    `[mail:not-configured] to=${settings.recipients.join(",") || "none"} subject=${message.subject}${files ? ` attachments=${files}` : ""}\n${message.text}`,
  );
  return { delivered: false, transport: "log" };
}
