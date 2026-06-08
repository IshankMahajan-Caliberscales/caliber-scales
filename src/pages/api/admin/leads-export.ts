import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';
import { SESSION_COOKIE, verifySessionToken } from '@lib/auth';

/**
 * Download all leads as a CSV (auth-protected). Linked from the /admin Leads
 * card. Runs as a Netlify function.
 */
export const prerender = false;

const COLUMNS = ['receivedAt', 'name', 'phone', 'company', 'requirement', 'source', 'status'] as const;

const cell = (v: unknown): string => {
  const s = v == null ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export const GET: APIRoute = async ({ cookies, redirect }) => {
  const session = verifySessionToken(cookies.get(SESSION_COOKIE)?.value);
  if (!session) return redirect('/admin/login/');

  const store = getStore('leads');
  const { blobs } = await store.list();
  const sorted = blobs.sort((a, b) => (a.key < b.key ? 1 : -1));
  const rows = (
    await Promise.all(sorted.map((b) => store.get(b.key, { type: 'json' })))
  ).filter(Boolean) as Record<string, unknown>[];

  const csv = [COLUMNS.join(',')]
    .concat(rows.map((r) => COLUMNS.map((c) => cell(r[c])).join(',')))
    .join('\r\n');

  return new Response(csv, {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': 'attachment; filename="caliber-leads.csv"',
    },
  });
};
