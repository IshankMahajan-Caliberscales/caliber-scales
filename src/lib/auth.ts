/**
 * Minimal, dependency-free auth for the custom /admin panel.
 *
 * - One admin account, configured via env (ADMIN_EMAIL + ADMIN_PASSWORD_HASH).
 * - Password stored as a scrypt hash ("salt:hash" hex) — never in plain text.
 * - Sessions are stateless: an HMAC-signed token in an httpOnly cookie.
 *
 * This is intentionally small (no database, no library). It is solid for a
 * single-admin marketing panel; if you later need multiple users/roles, move to
 * a proper auth provider + datastore.
 */
import crypto from 'node:crypto';
import { AUTH_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD_HASH } from 'astro:env/server';

export const SESSION_COOKIE = 'cs_admin';
const SESSION_TTL_MS = 1000 * 60 * 60 * 8; // 8 hours

export interface Session {
  email: string;
  exp: number;
}

const secret = () => AUTH_SECRET ?? '';

/** True when admin credentials are configured (so we can show a helpful note). */
export function isConfigured(): boolean {
  return Boolean(AUTH_SECRET && ADMIN_EMAIL && ADMIN_PASSWORD_HASH);
}

/** scrypt hash in "salt:hash" hex form. Used by scripts/setup to generate hashes. */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = (stored ?? '').split(':');
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64).toString('hex');
  const a = Buffer.from(hash, 'hex');
  const b = Buffer.from(test, 'hex');
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

/** Check a login attempt against the configured admin credentials. */
export function checkCredentials(email: string, password: string): boolean {
  if (!isConfigured()) return false;
  if (email.trim().toLowerCase() !== ADMIN_EMAIL!.trim().toLowerCase()) return false;
  return verifyPassword(password, ADMIN_PASSWORD_HASH!);
}

export function createSessionToken(email: string): string {
  const payload: Session = { email, exp: Date.now() + SESSION_TTL_MS };
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifySessionToken(token?: string | null): Session | null {
  if (!token || !secret()) return null;
  const [data, sig] = token.split('.');
  if (!data || !sig) return null;
  const expected = crypto.createHmac('sha256', secret()).update(data).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as Session;
    if (typeof payload.exp !== 'number' || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: import.meta.env.PROD,
  maxAge: SESSION_TTL_MS / 1000,
};
