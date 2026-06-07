import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';
import { randomUUID } from 'node:crypto';

/**
 * Lead capture endpoint (spec B8).
 *   - Validates the payload server-side.
 *   - Rejects honeypot hits silently (returns success to fool bots).
 *   - Best-effort in-memory rate limiting by IP.
 *   - Persists each lead to Netlify Blobs (store "leads"), which the /admin
 *     dashboard reads to show recent enquiries. Email/CRM push can be layered
 *     on top later if desired.
 *
 * This route opts out of static prerendering so it runs as a serverless
 * function on Netlify.
 */
export const prerender = false;

interface LeadPayload {
  name?: unknown;
  company?: unknown;
  phone?: unknown;
  requirement?: unknown;
  /** Which page/section produced the lead (hidden field). */
  source?: unknown;
  /** Honeypot — must be empty. Bots tend to fill every field. */
  website?: unknown;
}

// NOTE: in-memory map resets on each cold start and is not shared across
// serverless instances. It throttles obvious floods but is not a substitute
// for a durable store (Upstash/Redis/KV) — swap in before relying on it.
const HITS = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string, now: number): boolean {
  const rec = HITS.get(ip);
  if (!rec || now - rec.first > WINDOW_MS) {
    HITS.set(ip, { count: 1, first: now });
    return false;
  }
  rec.count += 1;
  return rec.count > MAX_PER_WINDOW;
}

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === 'string' && v.trim().length > 0;

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // Best-effort timestamp: Date.now() is fine in the serverless runtime.
  const now = Date.now();
  const ip = clientAddress ?? 'unknown';

  if (rateLimited(ip, now)) {
    return json({ ok: false, error: 'Too many requests. Please try again shortly.' }, 429);
  }

  let data: LeadPayload;
  try {
    const ct = request.headers.get('content-type') ?? '';
    if (ct.includes('application/json')) {
      data = (await request.json()) as LeadPayload;
    } else {
      const form = await request.formData();
      data = Object.fromEntries(form.entries()) as LeadPayload;
    }
  } catch {
    return json({ ok: false, error: 'Invalid request body.' }, 400);
  }

  // Honeypot: pretend success so bots don't learn they were caught.
  if (isNonEmptyString(data.website)) {
    return json({ ok: true }, 200);
  }

  const errors: Record<string, string> = {};
  if (!isNonEmptyString(data.name)) errors.name = 'Name is required.';
  if (!isNonEmptyString(data.phone)) errors.phone = 'Phone is required.';
  if (!isNonEmptyString(data.requirement)) errors.requirement = 'Please tell us what you need.';

  if (Object.keys(errors).length > 0) {
    return json({ ok: false, errors }, 422);
  }

  const lead = {
    name: String(data.name).trim(),
    company: isNonEmptyString(data.company) ? String(data.company).trim() : '',
    phone: String(data.phone).trim(),
    requirement: String(data.requirement).trim(),
    source: isNonEmptyString(data.source) ? String(data.source).trim() : 'website',
    ip,
    receivedAt: new Date(now).toISOString(),
  };

  // Persist to Netlify Blobs so the lead shows in the /admin dashboard. The key
  // is epoch-prefixed (newest sorts last lexicographically) with a random
  // suffix so concurrent submissions never collide.
  try {
    const store = getStore('leads');
    await store.setJSON(`${now}-${randomUUID()}`, lead);
  } catch (err) {
    // Never fail the visitor's submission just because storage hiccuped.
    console.error('[lead] store failed', err);
  }
  console.log('[lead] received', lead);

  return json({ ok: true, message: 'Thank you — we will be in touch shortly.' }, 200);
};

// Any non-POST method (POST is routed to the handler above).
export const ALL: APIRoute = () =>
  json({ ok: false, error: 'Method not allowed.' }, 405);
