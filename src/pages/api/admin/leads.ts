import type { APIRoute } from 'astro';
import { getStore } from '@netlify/blobs';
import { SESSION_COOKIE, verifySessionToken } from '@lib/auth';

/**
 * Lead actions for the /admin dashboard (auth-protected): update a lead's status
 * (incl. "invalid") or delete it. Submitted as a normal form POST from the
 * dashboard, then redirects back so the table reflects the change. Runs as a
 * Netlify function.
 */
export const prerender = false;

export const LEAD_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost', 'invalid'] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];

export const POST: APIRoute = async ({ request, cookies, redirect }) => {
  const session = verifySessionToken(cookies.get(SESSION_COOKIE)?.value);
  if (!session) return redirect('/admin/login/');

  const form = await request.formData();
  const action = String(form.get('action') ?? '');
  const key = String(form.get('key') ?? '');
  if (!key) return redirect('/admin/');

  const store = getStore('leads');

  if (action === 'delete') {
    await store.delete(key);
  } else if (action === 'setStatus') {
    const status = String(form.get('status') ?? '') as LeadStatus;
    if ((LEAD_STATUSES as readonly string[]).includes(status)) {
      const lead = (await store.get(key, { type: 'json' })) as Record<string, unknown> | null;
      if (lead) {
        lead.status = status;
        await store.setJSON(key, lead);
      }
    }
  }

  return redirect('/admin/');
};
