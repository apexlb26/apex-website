import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { getCollections } from "@/shared/db";

const STATE_ID = "mail-settings";

type StoredMailSettings = {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  from?: string;
  recipients?: string;
  passwordCiphertext?: string;
};

export type MailSettingsInput = {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  password?: string;
  from?: string;
  recipients?: string;
  clearPassword?: boolean;
};

export type EffectiveMailSettings = {
  smtpUrl?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  password?: string;
  from?: string;
  recipients: string[];
  resendApiKey?: string;
  source: "cms+env" | "env";
};

function clean(value?: string | null) {
  const normalized = String(value ?? "").trim();
  return normalized || undefined;
}

function parsePort(value?: string | null) {
  const raw = clean(value);
  if (!raw) return undefined;
  const port = Number(raw);
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : undefined;
}

function parseBoolean(value?: string | null) {
  const raw = clean(value)?.toLowerCase();
  if (!raw) return undefined;
  if (["1", "true", "yes", "on"].includes(raw)) return true;
  if (["0", "false", "no", "off"].includes(raw)) return false;
  return undefined;
}

function parseRecipients(value?: string | null): string[] {
  return Array.from(
    new Set(
      String(value ?? "")
        .split(/[;,]/)
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
}

function extractEmail(value?: string) {
  if (!value) return undefined;
  const angle = value.match(/<([^>]+)>/);
  const candidate = (angle?.[1] ?? value).trim();
  return candidate.includes("@") ? candidate : undefined;
}

function encryptionKey() {
  const secret = clean(process.env.APEX_MAIL_SETTINGS_KEY) || clean(process.env.APEX_ADMIN_SECRET);
  if (!secret) return null;
  return createHash("sha256").update(secret).digest();
}

function encryptPassword(value: string) {
  const key = encryptionKey();
  if (!key) {
    throw new Error(
      "Set APEX_MAIL_SETTINGS_KEY or APEX_ADMIN_SECRET before storing an SMTP password in CMS settings.",
    );
  }
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv, tag, encrypted].map((part) => part.toString("base64url")).join(".");
}

function decryptPassword(value?: string) {
  if (!value) return undefined;
  const key = encryptionKey();
  if (!key) return undefined;
  try {
    const [ivText, tagText, bodyText] = value.split(".");
    if (!ivText || !tagText || !bodyText) return undefined;
    const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivText, "base64url"));
    decipher.setAuthTag(Buffer.from(tagText, "base64url"));
    return Buffer.concat([
      decipher.update(Buffer.from(bodyText, "base64url")),
      decipher.final(),
    ]).toString("utf8");
  } catch {
    /*
     * Almost always the wrong key rather than corrupt data: APEX_ADMIN_SECRET
     * doubles as the encryption key and render.yaml generates a different one
     * per service, so a password saved by one deployment cannot be read by
     * another sharing the same database. Say so - the caller falls back to
     * SMTP_PASS, and silence here made that fallback look like a mail outage.
     */
    console.warn(
      "APEX mail settings: the stored SMTP password could not be decrypted (APEX_MAIL_SETTINGS_KEY/APEX_ADMIN_SECRET likely differs from the one that saved it); falling back to SMTP_PASS.",
    );
    return undefined;
  }
}

function environmentSettings() {
  const from = clean(process.env.SMTP_FROM) || clean(process.env.APEX_MAIL_FROM);
  const user = clean(process.env.SMTP_USER);
  const configuredRecipients = parseRecipients(process.env.APEX_NOTIFY_EMAIL);
  const recipients = configuredRecipients.length
    ? configuredRecipients
    : [user || extractEmail(from)].filter((item): item is string => Boolean(item));

  return {
    smtpUrl: clean(process.env.SMTP_URL),
    host: clean(process.env.SMTP_HOST),
    port: parsePort(process.env.SMTP_PORT),
    secure: parseBoolean(process.env.SMTP_SECURE),
    user,
    password: clean(process.env.SMTP_PASS),
    from: from || user,
    recipients,
    resendApiKey: clean(process.env.RESEND_API_KEY),
  };
}

async function readStored(): Promise<StoredMailSettings | null> {
  try {
    const collections = await getCollections();
    const doc = await collections.state.findOne({ _id: STATE_ID });
    if (!doc?.value) return null;
    const parsed = JSON.parse(doc.value) as StoredMailSettings;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    console.warn("APEX mail settings: CMS settings unavailable; using environment fallback.", error);
    return null;
  }
}

export async function getEffectiveMailSettings(): Promise<EffectiveMailSettings> {
  const env = environmentSettings();
  const stored = await readStored();
  if (!stored) return { ...env, source: "env" };

  const recipients = parseRecipients(stored.recipients);
  return {
    smtpUrl: stored.host ? undefined : env.smtpUrl,
    host: clean(stored.host) || env.host,
    port: stored.port ?? env.port,
    secure: stored.secure ?? env.secure,
    user: clean(stored.user) || env.user,
    password: decryptPassword(stored.passwordCiphertext) || env.password,
    from: clean(stored.from) || env.from,
    recipients: recipients.length ? recipients : env.recipients,
    resendApiKey: env.resendApiKey,
    source: "cms+env",
  };
}

export async function getMailSettingsAdminView() {
  const env = environmentSettings();
  const stored = await readStored();
  const effective = await getEffectiveMailSettings();
  return {
    cms: {
      host: stored?.host ?? "",
      port: stored?.port ?? null,
      secure: stored?.secure ?? null,
      user: stored?.user ?? "",
      from: stored?.from ?? "",
      recipients: stored?.recipients ?? "",
      passwordConfigured: Boolean(stored?.passwordCiphertext),
    },
    effective: {
      host: effective.host ?? "",
      port: effective.port ?? null,
      secure: effective.secure ?? null,
      user: effective.user ?? "",
      from: effective.from ?? "",
      recipients: effective.recipients.join(", "),
      passwordConfigured: Boolean(effective.password),
      source: effective.source,
      transport: effective.smtpUrl || effective.host ? "smtp" : effective.resendApiKey ? "resend" : "none",
    },
    environment: {
      hostConfigured: Boolean(env.host || env.smtpUrl),
      passwordConfigured: Boolean(env.password || env.smtpUrl),
      resendConfigured: Boolean(env.resendApiKey),
    },
  };
}

export async function saveMailSettings(input: MailSettingsInput, _updatedBy?: string) {
  const collections = await getCollections();
  const previousDoc = await collections.state.findOne({ _id: STATE_ID });
  let previous: StoredMailSettings = {};
  if (previousDoc?.value) {
    try {
      previous = JSON.parse(previousDoc.value) as StoredMailSettings;
    } catch {
      previous = {};
    }
  }

  const next: StoredMailSettings = {
    host: clean(input.host),
    port: input.port,
    secure: input.secure,
    user: clean(input.user),
    from: clean(input.from),
    recipients: clean(input.recipients),
    passwordCiphertext: input.clearPassword
      ? undefined
      : clean(input.password)
        ? encryptPassword(String(input.password))
        : previous.passwordCiphertext,
  };

  Object.keys(next).forEach((key) => {
    if (next[key as keyof StoredMailSettings] === undefined) delete next[key as keyof StoredMailSettings];
  });

  await collections.state.updateOne(
    { _id: STATE_ID },
    { $set: { value: JSON.stringify(next), at: new Date() } },
    { upsert: true },
  );
}

export async function clearMailSettings() {
  const collections = await getCollections();
  await collections.state.deleteOne({ _id: STATE_ID });
}
