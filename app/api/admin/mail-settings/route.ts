import { NextResponse } from "next/server";
import { getAdminSession } from "@/shared/auth";
import {
  clearMailSettings,
  getMailSettingsAdminView,
  saveMailSettings,
  type MailSettingsInput,
} from "@/shared/mail-settings";
import { sendAdminEmail } from "@/shared/mailer";

export const runtime = "nodejs";

function unauthorized() {
  return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
}

function validPort(value: unknown) {
  if (value === null || value === undefined || value === "") return undefined;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("SMTP port must be between 1 and 65535.");
  return port;
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  try {
    return NextResponse.json({ ok: true, settings: await getMailSettingsAdminView() });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not load mail settings." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  try {
    const body = (await request.json()) as MailSettingsInput;
    await saveMailSettings(
      {
        host: String(body.host ?? "").trim(),
        port: validPort(body.port),
        secure: typeof body.secure === "boolean" ? body.secure : undefined,
        user: String(body.user ?? "").trim(),
        password: String(body.password ?? ""),
        from: String(body.from ?? "").trim(),
        recipients: String(body.recipients ?? "").trim(),
        clearPassword: Boolean(body.clearPassword),
      },
      session.email,
    );
    return NextResponse.json({ ok: true, settings: await getMailSettingsAdminView() });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not save mail settings." }, { status: 422 });
  }
}

export async function DELETE() {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  try {
    await clearMailSettings();
    return NextResponse.json({ ok: true, settings: await getMailSettingsAdminView() });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Could not clear mail settings." }, { status: 500 });
  }
}

export async function POST() {
  const session = await getAdminSession();
  if (!session) return unauthorized();
  try {
    const result = await sendAdminEmail({
      subject: "APEX website mail test",
      text: [
        "APEX website SMTP/CMS mail test",
        "",
        `Requested by: ${session.email}`,
        `Time: ${new Date().toISOString()}`,
        "",
        "If this message arrived, the active website mail configuration is working.",
      ].join("\n"),
    });
    return NextResponse.json({ ok: result.delivered, transport: result.transport });
  } catch (error) {
    return NextResponse.json({ ok: false, error: error instanceof Error ? error.message : "Mail test failed." }, { status: 502 });
  }
}
