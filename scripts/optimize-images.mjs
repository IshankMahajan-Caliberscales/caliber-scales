// Build-time image optimizer. Runs before `astro build`, so whatever editors
// upload through the CMS — however large — is automatically resized and
// recompressed for the live site. This means image *size is never a problem*:
// a 5 MB phone photo is served as a fast, web-sized image without anyone having
// to think about it.
//
// Safe + idempotent: only touches raster JP/PNG images that are oversized
// (> MAX_WIDTH px) or heavy (> SIZE_THRESHOLD bytes), keeps the same filename
// and format (so content references never break), and only rewrites a file when
// the result is actually smaller. SVG/GIF/WebP/AVIF are left untouched. A failure
// on any single image is logged and skipped — it never breaks the build.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const IMAGES_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'images');
const MAX_WIDTH = 1800; // cap the largest dimension shown anywhere on the site
const SIZE_THRESHOLD = 450 * 1024; // leave anything already <450 KB alone
const JPEG_QUALITY = 80;

async function* walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return; // dir doesn't exist (e.g. no images yet) — nothing to do
  }
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

const kb = (n) => Math.round(n / 1024);

let optimized = 0;
let savedBytes = 0;

for await (const file of walk(IMAGES_DIR)) {
  const ext = extname(file).toLowerCase();
  if (!['.jpg', '.jpeg', '.png'].includes(ext)) continue;

  try {
    const buf = await readFile(file);
    const meta = await sharp(buf).metadata();
    const tooWide = (meta.width ?? 0) > MAX_WIDTH;
    const tooBig = buf.length > SIZE_THRESHOLD;
    if (!tooWide && !tooBig) continue; // already web-friendly

    let pipe = sharp(buf).rotate(); // honour EXIF orientation
    if (tooWide) pipe = pipe.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    pipe =
      ext === '.png'
        ? pipe.png({ compressionLevel: 9, palette: false })
        : pipe.jpeg({ quality: JPEG_QUALITY, mozjpeg: true });

    const out = await pipe.toBuffer();
    if (out.length < buf.length) {
      await writeFile(file, out);
      savedBytes += buf.length - out.length;
      optimized++;
      console.log(`  optimized ${file.replace(IMAGES_DIR, 'images')}: ${kb(buf.length)}KB -> ${kb(out.length)}KB`);
    }
  } catch (err) {
    console.warn(`  skipped ${file} (optimize failed): ${err.message}`);
  }
}

console.log(
  optimized
    ? `[optimize-images] ${optimized} image(s) optimized, ${kb(savedBytes)}KB saved.`
    : '[optimize-images] all images already web-friendly — nothing to do.'
);
