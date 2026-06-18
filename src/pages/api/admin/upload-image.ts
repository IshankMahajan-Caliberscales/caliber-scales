import type { APIRoute } from 'astro';
import sharp from 'sharp';
import { SESSION_COOKIE, verifySessionToken } from '@lib/auth';
import { GITHUB_TOKEN } from 'astro:env/server';

/**
 * /admin image uploader (auth-protected). Optimizes an uploaded image and
 * commits it OVER an existing image path via the GitHub Contents API — bypassing
 * Keystatic's broken image-replace (upstream bug #1269). Keeps the same path, so
 * no content/frontmatter changes are needed and the page picks up the new image
 * on the next deploy.
 */
export const prerender = false;

// Repo that backs the site (same as keystatic.config.ts GITHUB_REPO).
const REPO = 'IshankMahajan-Caliberscales/caliber-scales';
const GH = 'https://api.github.com';

// Only allow overwriting raster images under public/images, no path traversal.
const SAFE_PATH = /^public\/images\/[A-Za-z0-9][A-Za-z0-9._/-]*\.(jpe?g|png)$/;

function back(msg: string, ok: boolean) {
  const q = ok ? `ok=${encodeURIComponent(msg)}` : `err=${encodeURIComponent(msg)}`;
  return new Response(null, { status: 303, headers: { location: `/admin/images/?${q}` } });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const session = verifySessionToken(cookies.get(SESSION_COOKIE)?.value);
  if (!session) return new Response(null, { status: 303, headers: { location: '/admin/login/' } });

  if (!GITHUB_TOKEN) {
    return back('Image uploads are not configured yet — add GITHUB_TOKEN in Netlify.', false);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return back('Could not read the upload.', false);
  }

  const path = String(form.get('path') ?? '');
  const file = form.get('file');
  const label = String(form.get('label') ?? 'image');

  if (!SAFE_PATH.test(path) || path.includes('..')) {
    return back('Invalid image target.', false);
  }
  if (!(file instanceof File) || file.size === 0) {
    return back('Please choose an image file.', false);
  }
  if (!/^image\/(jpe?g|png)$/.test(file.type)) {
    return back('Please upload a JPG or PNG image.', false);
  }

  // Optimize: cap dimensions, recompress, keep the target's format/extension.
  let optimized: Buffer;
  try {
    const input = Buffer.from(await file.arrayBuffer());
    const isPng = path.toLowerCase().endsWith('.png');
    let pipe = sharp(input).rotate().resize({ width: 1800, withoutEnlargement: true });
    pipe = isPng ? pipe.png({ compressionLevel: 9 }) : pipe.jpeg({ quality: 82, mozjpeg: true });
    optimized = await pipe.toBuffer();
  } catch {
    return back('That file could not be processed as an image.', false);
  }

  const headers = {
    authorization: `Bearer ${GITHUB_TOKEN}`,
    accept: 'application/vnd.github+json',
    'user-agent': 'caliber-admin',
    'content-type': 'application/json',
  };

  try {
    // Get the current file's blob sha (required to update an existing file).
    const cur = await fetch(`${GH}/repos/${REPO}/contents/${path}?ref=main`, { headers });
    const sha = cur.ok ? ((await cur.json()) as { sha?: string }).sha : undefined;

    const put = await fetch(`${GH}/repos/${REPO}/contents/${path}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: `Update image: ${label}`,
        content: optimized.toString('base64'),
        branch: 'main',
        ...(sha ? { sha } : {}),
      }),
    });

    if (!put.ok) {
      const detail = await put.text().catch(() => '');
      console.error('[upload-image] github error', put.status, detail);
      return back(`Upload failed (GitHub ${put.status}). Check the token has Contents write access.`, false);
    }
  } catch (err) {
    console.error('[upload-image] error', err);
    return back('Upload failed due to a network error. Please try again.', false);
  }

  return back(`${label} updated — it’ll be live in 1–2 minutes.`, true);
};
