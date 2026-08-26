import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import type { AdminSessionPayload } from "@/shared/types";

const COOKIE_NAME = "apex_admin_session";
const SESSION_HOURS = 12;

function getSecret() {
  const secret = process.env.APEX_ADMIN_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV !== "production") return "apex-local-dev-secret-change-me";
  throw new Error("APEX_ADMIN_SECRET is required in production");
}

function sign(value: string) {
  return createHmac("sha256", getSecret()).update(value).digest("base64url");
}

export function createSessionToken(email: string) {
  const payload: AdminSessionPayload = {
    email,
    exp: Date.now() + SESSION_HOURS * 60 * 60 * 1000,
  };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token?: string | null): AdminSessionPayload | null {
  if (!token) return null;
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = sign(encoded);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AdminSessionPayload;
    if (!payload.email || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE_NAME)?.value);
}

export async function setAdminSession(email: string) {
  const jar = await cookies();
  jar.set(COOKIE_NAME, createSessionToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_HOURS * 60 * 60,
  });
}

export async function clearAdminSession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

export function checkCredentials(email: string, password: string) {
  const configuredEmail = process.env.APEX_ADMIN_EMAIL;
  const configuredPassword = process.env.APEX_ADMIN_PASSWORD;

  if (configuredEmail && configuredPassword) {
    return email.trim().toLowerCase() === configuredEmail.trim().toLowerCase() && password === configuredPassword;
  }

  if (process.env.NODE_ENV !== "production") {
    return email.trim().toLowerCase() === "admin@apex.local" && password === "apex-dev";
  }

  return false;
}

export { COOKIE_NAME };
