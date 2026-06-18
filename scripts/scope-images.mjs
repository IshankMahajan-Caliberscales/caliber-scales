// One-time: convert collection hero images from flat paths to Keystatic's
// per-entry subfolder structure (`/images/{collection}/{slug}/heroImage.ext`).
// Keystatic stores collection images this way; our dev-placed flat images didn't
// match, which broke Keystatic's image save/replace (upstream #1269 symptom).
// After this, image editing works directly in the CMS. Idempotent.
import { readdir, readFile, writeFile, mkdir, copyFile, access } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const COLLECTIONS = ['products', 'industries', 'services', 'blog'];

const exists = (p) => access(p).then(() => true).catch(() => false);

let moved = 0;
for (const coll of COLLECTIONS) {
  const dir = join(ROOT, 'src', 'content', coll);
  let files;
  try {
    files = (await readdir(dir)).filter((f) => f.endsWith('.mdx'));
  } catch {
    continue;
  }
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    const mdxPath = join(dir, file);
    let src = await readFile(mdxPath, 'utf8');
    const m = src.match(/^heroImage:\s*(\S+)\s*$/m);
    if (!m) continue;
    const value = m[1].replace(/^['"]|['"]$/g, '');
    const publicPrefix = `/images/${coll}/`;
    if (!value.startsWith(publicPrefix)) continue;
    // Already in a per-slug subfolder? skip.
    if (value.startsWith(`${publicPrefix}${slug}/`)) continue;

    const ext = extname(value); // includes the dot
    const newValue = `${publicPrefix}${slug}/heroImage${ext}`;
    const oldRepo = join(ROOT, 'public', value.replace(/^\//, ''));
    const newRepo = join(ROOT, 'public', newValue.replace(/^\//, ''));

    if (!(await exists(oldRepo))) {
      console.warn(`  ! ${coll}/${file}: source image missing (${value}) — skipped`);
      continue;
    }
    await mkdir(dirname(newRepo), { recursive: true });
    await copyFile(oldRepo, newRepo); // copy (leave original for any shared refs)
    src = src.replace(/^heroImage:\s*\S+\s*$/m, `heroImage: ${newValue}`);
    await writeFile(mdxPath, src, 'utf8');
    moved++;
    console.log(`  ${coll}/${slug}: ${value} -> ${newValue}`);
  }
}
console.log(`\n[scope-images] ${moved} hero image(s) moved into per-page subfolders.`);
