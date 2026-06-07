// Generates on-brand vector (SVG) cover graphics for industry & service pages.
// These are infinitely scalable — sharp on every screen, never pixelated, never
// cropped — and act as a clean, honest placeholder until real site photos exist.
// Re-run any time: `node scripts/generate-covers.mjs`. Edit the config below to
// tweak labels/icons; drop a real photo in and update the frontmatter to replace.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// --- brand ---------------------------------------------------------------
const NAVY = '#0c2d52';
const NAVY2 = '#16467f';
const ACCENT = '#2f86d4'; // brighter accent reads well on navy
const KICKER = '#9cc6f0';

// --- icon library (24x24 space, stroke inherited, fill:none) --------------
const ICONS = {
  wheat: '<path d="M12 21V10"/><path d="M12 13c-3 0-4.5-2-4.5-4 2 0 4.5 1.2 4.5 4z"/><path d="M12 13c3 0 4.5-2 4.5-4-2 0-4.5 1.2-4.5 4z"/><path d="M12 9c-2.4 0-3.6-1.6-3.6-3.4 1.7 0 3.6 1 3.6 3.4z"/><path d="M12 9c2.4 0 3.6-1.6 3.6-3.4-1.7 0-3.6 1-3.6 3.4z"/>',
  silo: '<path d="M7 21V8a5 5 0 0 1 10 0v13z"/><path d="M7 12h10"/><path d="M7 16h10"/><path d="M5 21h14"/>',
  flask: '<path d="M9 3h6"/><path d="M10 3v6L5 18a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><path d="M8.5 14h7"/>',
  crane: '<path d="M6 21h7"/><path d="M9 21V5"/><path d="M6 8 9 5l3 3"/><path d="M9 6h10"/><path d="M17 6v3.5"/>',
  containers: '<path d="M3 21V13h7v8"/><path d="M14 21V9h7v12"/><path d="M3 21h18"/><path d="M3 17h7"/><path d="M14 13h7"/>',
  truck: '<path d="M2 7h11v9H2z"/><path d="M13 10h4l3 3v3h-7z"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
  factory: '<path d="M3 21V12l6 3.5V12l6 3.5V8h6v13z"/><path d="M6.5 21v-3.5h3V21"/>',
  warehouse: '<path d="M3 21V10l9-5 9 5v11z"/><path d="M3 21h18"/><path d="M8 21v-6h8v6"/>',
  mountain: '<path d="M2 19 8 9l3.5 5L15 8l7 11z"/><path d="M8 9l1.6 2.5"/>',
  ibeam: '<path d="M5 5h14"/><path d="M5 19h14"/><path d="M12 5v14"/>',
  cross: '<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/>',
  bin: '<path d="M5 7h14"/><path d="M7 7l1 13h8l1-13"/><path d="M9.5 7V4h5v3"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  wrench: '<path d="M15.5 7.5a4 4 0 0 0-5.3 5.1L4 18.8 5.2 20l6.2-6.2a4 4 0 0 0 5.1-5.3l-2.4 2.4-2-2z"/>',
  shield: '<path d="M12 3l8 3v6c0 5-4 8-8 9-4-1-8-4-8-9V6z"/><path d="M8.5 12l2.2 2.2L15.5 9.5"/>',
  gear: '<path d="M19.4 13a7.6 7.6 0 0 0 0-2l2-1.6-2-3.5-2.4 1a7.5 7.5 0 0 0-1.7-1l-.4-2.6h-4l-.4 2.6a7.5 7.5 0 0 0-1.7 1l-2.4-1-2 3.5L4.6 11a7.6 7.6 0 0 0 0 2l-2 1.6 2 3.5 2.4-1a7.5 7.5 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7.5 7.5 0 0 0 1.7-1l2.4 1 2-3.5z"/><circle cx="12" cy="12" r="3"/>',
  monitor: '<path d="M3 5h18v11H3z"/><path d="M9 20h6"/><path d="M12 16v4"/><circle cx="8" cy="10" r="1.3"/><circle cx="16" cy="10" r="1.3"/><path d="M9.3 10h5.4"/>',
};

// --- page config ----------------------------------------------------------
const INDUSTRIES = [
  { slug: 'agriculture', lines: ['Agriculture'], icon: 'wheat' },
  { slug: 'cement', lines: ['Cement &', 'Building Materials'], icon: 'silo' },
  { slug: 'chemical', lines: ['Chemical'], icon: 'flask' },
  { slug: 'construction', lines: ['Construction &', 'Infrastructure'], icon: 'crane' },
  { slug: 'industrial-terminals', lines: ['Industrial Terminals', '& Hubs'], icon: 'containers' },
  { slug: 'logistics', lines: ['Logistics &', 'Transport'], icon: 'truck' },
  { slug: 'manufacturing', lines: ['Manufacturing'], icon: 'factory' },
  { slug: 'mining', lines: ['Mining &', 'Minerals'], icon: 'mountain' },
  { slug: 'pharma', lines: ['Pharma'], icon: 'cross' },
  { slug: 'steel', lines: ['Steel &', 'Metals'], icon: 'ibeam' },
  { slug: 'warehousing', lines: ['Warehousing &', 'Distribution'], icon: 'warehouse' },
  { slug: 'waste-management', lines: ['Waste Management', '& Recycling'], icon: 'bin' },
];
const SERVICES = [
  { slug: 'installation', lines: ['Installation &', 'Commissioning'], icon: 'wrench' },
  { slug: 'amc', lines: ['AMC &', 'Maintenance'], icon: 'shield' },
  { slug: 'repair', lines: ['Repair &', 'Relocation'], icon: 'gear' },
  { slug: 'software-integration', lines: ['Software', 'Integration'], icon: 'monitor' },
];

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function cover({ lines, icon, kicker }) {
  const W = 1200, H = 750;
  // background technical grid
  let grid = '';
  for (let x = 50; x < W; x += 50) grid += `<line x1="${x}" y1="0" x2="${x}" y2="${H}"/>`;
  for (let y = 50; y < H; y += 50) grid += `<line x1="0" y1="${y}" x2="${W}" y2="${y}"/>`;

  // headline block, vertically centred around y=395
  const fs = 64, lh = 78;
  const start = 395 - ((lines.length - 1) * lh) / 2 + fs / 3;
  const tspans = lines
    .map((t, i) => `<text x="84" y="${start + i * lh}" font-size="${fs}" font-weight="700" fill="#ffffff" letter-spacing="0.5">${esc(t)}</text>`)
    .join('');
  const underlineY = start + (lines.length - 1) * lh + 34;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" role="img" font-family="'Segoe UI', system-ui, -apple-system, Helvetica, Arial, sans-serif">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${NAVY}"/>
      <stop offset="1" stop-color="${NAVY2}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <g stroke="#ffffff" stroke-opacity="0.045" stroke-width="1">${grid}</g>
  <circle cx="${W}" cy="0" r="300" fill="${ACCENT}" fill-opacity="0.10"/>
  <circle cx="${W - 120}" cy="${H}" r="220" fill="${ACCENT}" fill-opacity="0.07"/>
  <g transform="translate(792 188) scale(15)" fill="none" stroke="#ffffff" stroke-opacity="0.13" stroke-width="0.9" stroke-linecap="round" stroke-linejoin="round">${ICONS[icon]}</g>
  <text x="86" y="150" font-size="23" font-weight="600" letter-spacing="6" fill="${KICKER}">${esc(kicker)}</text>
  ${tspans}
  <rect x="86" y="${underlineY}" width="104" height="6" rx="3" fill="${ACCENT}"/>
  <text x="86" y="694" font-size="22" font-weight="600" letter-spacing="3" fill="#ffffff" fill-opacity="0.62">CALIBER SCALES</text>
  <text x="86" y="722" font-size="17" font-weight="400" letter-spacing="1.5" fill="#ffffff" fill-opacity="0.42">Industrial Weighing Systems</text>
</svg>
`;
}

async function run() {
  const jobs = [
    ...INDUSTRIES.map((i) => ({ ...i, kicker: 'INDUSTRY', dir: 'industries' })),
    ...SERVICES.map((s) => ({ ...s, kicker: 'SERVICE', dir: 'services' })),
  ];
  for (const j of jobs) {
    const out = join(ROOT, 'public', 'images', j.dir, `${j.slug}.svg`);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, cover(j), 'utf8');
    console.log('wrote', `public/images/${j.dir}/${j.slug}.svg`);
  }
  console.log(`\n${jobs.length} covers generated.`);
}
run();
