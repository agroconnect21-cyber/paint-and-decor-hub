import { createHmac, timingSafeEqual } from "node:crypto";

export const adminCookie = "paint_decor_admin";
const maxAge = 60 * 60 * 24 * 7;

function secret() {
  return process.env.ADMIN_PASSWORD || "";
}

function signature(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}

export function validPassword(password: string) {
  const configured = secret();
  if (!configured || password.length !== configured.length) return false;
  return timingSafeEqual(Buffer.from(password), Buffer.from(configured));
}

export function validAdminCookie(cookie: string | undefined) {
  if (!secret() || !cookie) return false;
  const [timestamp, received] = cookie.split(".");
  if (!timestamp || !received || Date.now() - Number(timestamp) > maxAge * 1000) return false;
  const expected = signature(timestamp);
  if (received.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

export function createAdminCookie() {
  const timestamp = String(Date.now());
  return `${timestamp}.${signature(timestamp)}`;
}
