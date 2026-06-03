import type { APIRoute } from 'astro';
import { SESSION_COOKIE } from '@lib/auth';

export const prerender = false;

const handler: APIRoute = ({ cookies, redirect }) => {
  cookies.delete(SESSION_COOKIE, { path: '/' });
  return redirect('/admin/login/');
};

export const GET = handler;
export const POST = handler;
