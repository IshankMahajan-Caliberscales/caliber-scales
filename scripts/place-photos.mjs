// One-time: place the client's organized "Photos for new website" onto the site,
// optimized, into Keystatic's per-page subfolder structure so they stay editable
// in the CMS. Products keep heroImage.jpg (overwrite); industries/services switch
// from the vector cover (.svg) to a real photo (.jpg) and the frontmatter is
// updated to match. Run: node scripts/place-photos.mjs
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = 'C:/Users/Theballinsisters/Downloads/Photos for new website/Photos for new website';

// [collection, slug, source-image]  — best landscape/relevant shot per page.
const MAP = [
  // Products (heroImage.jpg already referenced — overwrite the file)
  ['products', 'analytical-balances', 'Products/Analytical and high precision scales/high precision analytical scale.png'],
  ['products', 'crane-scales', 'Products/Crane Scales/crane scale steel.png'],
  ['products', 'hanging-scales', 'Products/Hanging Scales/LPG hanging Scale 11.png'],
  ['products', 'logistics-scales', 'Products/Logistic Scales/Logistics Landscape mode.png'],
  ['products', 'platform-scales', 'Products/Platform Scales/platform scale landscape.png'],
  ['products', 'tank-weighing-systems', 'Products/Tank Weighing/tank weighing.png'],
  ['products', 'mobile', 'Products/Weighbridges/Full Deck Instant Mobile Weighbridge.jpg'],
  ['products', 'pit-type', 'Products/Weighbridges/pit mtd weighbridge at factory.png'],
  ['products', 'track', 'Products/Weighbridges/track weigher weighbridge.png'],
  ['products', 'unmanned', 'Products/Weighbridges/unmanned high res.png'],
  // (surface-mounted and table-top-scales intentionally skipped — already set in the CMS)

  // Industries (switch cover .svg -> photo .jpg, update frontmatter)
  ['industries', 'agriculture', 'Industries/Agriculture/agriculture weighbridge.png'],
  ['industries', 'cement', 'Industries/Cement and building material/Surface Mounted RCC plant WB.png'],
  ['industries', 'chemical', 'Industries/Chemicals/tank weighing in chemical.png'],
  ['industries', 'industrial-terminals', 'Industries/Industrial Terminal and Hubs/pitless indutrial hub.png'],
  ['industries', 'logistics', 'Industries/Logistics and Transport/logistics with background.png'],
  ['industries', 'manufacturing', 'Industries/Manufacturing/pit mtd weighbridge at factory.png'],
  ['industries', 'pharma', 'Industries/Pharma/pharma analytical balance.png'],
  ['industries', 'steel', 'Industries/Steel and Metals/crane scale steel.png'],
  ['industries', 'warehousing', 'Industries/Warehousing and distribution/Pitless Weighbridge Pic 2.jpg'],
  ['industries', 'waste-management', 'Industries/Waste management and Recycling/track weigher weighbridge.png'],
  ['industries', 'construction', 'Industries/construction and infra/construction pit weighbridge.png'],
  ['industries', 'mining', 'Industries/mining and minerals/Full Deck Instant Mobile Weighbridge.jpg'],

  // Services (switch cover .svg -> photo .jpg, update frontmatter)
  ['services', 'amc', 'Services/AMC/AMC.png'],
  ['services', 'installation', 'Services/Installation/WB installation.png'],
  ['services', 'repair', 'Services/Repair and Relocation/repairs.png'],
  ['services', 'software-integration', 'Services/Software Integration/weighbridge cctv data collection software.png'],
];

let placed = 0;
for (const [coll, slug, rel] of MAP) {
  const srcPath = join(SRC, rel);
  const outRel = `/images/${coll}/${slug}/heroImage.jpg`;
  const outPath = join(ROOT, 'public', outRel.replace(/^\//, ''));
  try {
    await mkdir(dirname(outPath), { recursive: true });
    const info = await sharp(srcPath)
      .rotate()
      .resize({ width: 1800, withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toFile(outPath);

    // Industries/services: point frontmatter at the new .jpg (was .svg).
    if (coll === 'industries' || coll === 'services') {
      const mdxPath = join(ROOT, 'src', 'content', coll, `${slug}.mdx`);
      let src = await readFile(mdxPath, 'utf8');
      src = src.replace(/^heroImage:\s*\S+\s*$/m, `heroImage: ${outRel}`);
      await writeFile(mdxPath, src, 'utf8');
    }
    placed++;
    console.log(`  ${coll}/${slug}: ${(info.size / 1024).toFixed(0)}KB  (${rel.split('/').pop()})`);
  } catch (err) {
    console.warn(`  ! ${coll}/${slug}: ${err.message}`);
  }
}
console.log(`\n[place-photos] ${placed}/${MAP.length} photos placed.`);
