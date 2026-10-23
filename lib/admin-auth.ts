import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "pace_admin_session";
const SESSION_SECONDS = 60 * 60 * 8;
const signature = (payload: string, secret: string) => createHmac("sha256", secret).update(payload).digest("hex");

export function verifyPassword(input: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || expected.length < 12 || !input) return false;
  const a = createHmac("sha256", expected).update(input).digest();
  const b = createHmac("sha256", expected).update(expected).digest();
  return timingSafeEqual(a, b);
}
export function createAdminSession() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error("Admin session secret not configured");
  const expires = Math.floor(Date.now() / 1000) + SESSION_SECONDS;
  const payload = String(expires);
  return payload + "." + signature(payload, secret);
}
export async function isAdminAuthenticated() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!secret || !token) return false;
  const [payload, sig, extra] = token.split(".");
  if (!payload || !sig || extra || !/^\d{10}$/.test(payload) || Number(payload) <= Date.now() / 1000) return false;
  const expected = signature(payload, secret);
  return sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
}
export const adminCookieName = COOKIE_NAME;
export const adminSessionSeconds = SESSION_SECONDS;
