/*
 * Sends one test message through whatever transport is configured, so mail
 * credentials can be verified without going through a form.
 *
 *   npm run mail:test
 *
 * Reads .env.local if present, otherwise uses the current environment.
 */
import { promises as fs } from "node:fs";
import path from "node:path";

async function loadEnvFile() {
  const file = path.join(process.cwd(), ".env.local");
  try {
    const text = await fs.readFile(file, "utf8");
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!(key in process.env)) process.env[key] = val;
    }
    return true;
  } catch {
    return false;
  }
}

const loaded = await loadEnvFile();
const to = process.env.APEX_NOTIFY_EMAIL || "admin@apexlb.tech";

console.log(`.env.local loaded : ${loaded ? "yes" : "no (using current environment)"}`);
console.log(`recipient         : ${to}`);
console.log(`SMTP_HOST         : ${process.env.SMTP_HOST || process.env.SMTP_URL || "(not set)"}`);
console.log(`RESEND_API_KEY    : ${process.env.RESEND_API_KEY ? "set" : "(not set)"}`);

if (!process.env.SMTP_HOST && !process.env.SMTP_URL && !process.env.RESEND_API_KEY) {
  console.error("\nNo transport configured, so nothing would be sent.");
  console.error("Add either the SMTP_* group or RESEND_API_KEY to .env.local, then run this again.");
  process.exit(1);
}

const { sendAdminEmail } = await import("../shared/mailer.ts").catch(async () => {
  // mailer.ts is TypeScript; fall back to sending directly when it cannot be imported
  return { sendAdminEmail: null };
});

const stamp = new Date().toISOString();
const message = {
  subject: `APEX test email - ${stamp}`,
  text: [
    "This is a test message from the APEX website.",
    "",
    "If you are reading this, form submissions will reach this inbox:",
    "  - contact enquiries from the “Let’s build together” dialog",
    "  - job applications, with the CV attached",
    "",
    `Sent: ${stamp}`,
  ].join("\n"),
};

if (sendAdminEmail) {
  const result = await sendAdminEmail(message);
  console.log(`\nsent via          : ${result.transport}`);
  console.log(result.delivered ? "Delivered. Check the inbox." : "Not delivered - see the log line above.");
  process.exit(result.delivered ? 0 : 1);
}

// direct SMTP path
const { createTransport } = await import("nodemailer");
const transport = process.env.SMTP_URL
  ? createTransport(process.env.SMTP_URL)
  : createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
await transport.sendMail({
  from: process.env.APEX_MAIL_FROM || `APEX Website <${to}>`,
  to,
  subject: message.subject,
  text: message.text,
});
console.log("\nsent via          : smtp");
console.log("Delivered. Check the inbox.");
