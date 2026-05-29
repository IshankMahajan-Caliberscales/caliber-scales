/**
 * Computes the URL paths of draft (noindex) content pages by scanning the
 * content collections' frontmatter at build time. Used by astro.config to
 * keep noindex pages out of the sitemap (they still render, but shouldn't be
 * advertised for indexing).
 *
 * This runs in Node at config load, so it uses fs directly rather than the
 * astro:content runtime (which isn't available there).
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const CONTENT = join(process.cwd(), 'src', 'content');

function frontmatter(file: string): Record<string, string> {
  const text = readFileSync(file, 'utf8');
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  const out: Record<string, string> = {};
  if (!m) return out;
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z0-9_]+):\s*(.+?)\s*$/);
    if (kv) out[kv[1]] = kv[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

function entries(collection: string): { slug: string; fm: Record<string, string> }[] {
  let files: string[] = [];
  try {
    files = readdirSync(join(CONTENT, collection)).filter((f) => /\.mdx?$/.test(f));
  } catch {
    return [];
  }
  return files.map((f) => ({
    slug: f.replace(/\.mdx?$/, ''),
    fm: frontmatter(join(CONTENT, collection, f)),
  }));
}

const isDraft = (fm: Record<string, string>) => fm.draft === 'true';

/** Site-relative paths of all draft content pages (with trailing slash). */
export function draftUrlPaths(): string[] {
  const paths: string[] = [];

  for (const { slug, fm } of entries('products')) {
    if (isDraft(fm)) {
      paths.push(fm.category === 'weighbridge' ? `/weighbridges/${slug}/` : `/products/${slug}/`);
    }
  }
  for (const { slug, fm } of entries('industries')) {
    if (isDraft(fm)) paths.push(`/industries/${slug}/`);
  }
  for (const { slug, fm } of entries('services')) {
    if (isDraft(fm)) paths.push(`/services/${slug}/`);
  }
  for (const { slug, fm } of entries('blog')) {
    if (!isDraft(fm)) continue;
    const type = fm.type || 'article';
    const base =
      type === 'buying-guide'
        ? '/resources/buying-guides/'
        : type === 'installation-guide'
          ? '/resources/installation-guides/'
          : '/resources/blog/';
    paths.push(`${base}${slug}/`);
  }
  for (const { slug, fm } of entries('caseStudies')) {
    if (isDraft(fm)) paths.push(`/resources/case-studies/${slug}/`);
  }

  return paths;
}
