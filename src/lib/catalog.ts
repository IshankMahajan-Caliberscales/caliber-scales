/**
 * Catalog metadata for hub grids and navigation cards.
 *
 * These are factual descriptions of product *categories* and industries — not
 * fabricated claims about specific products or clients. Per-product specs,
 * photos, and detailed copy live in the content collections (Keystatic) and
 * are filled in Phases 4–6.
 */

export interface CategoryCard {
  title: string;
  href: string;
  blurb: string;
}

/** Top-level product categories (Home ProductGrid + Products hub). */
export const PRODUCT_CATEGORIES: CategoryCard[] = [
  {
    title: 'Weighbridges',
    href: '/weighbridges/',
    blurb: 'Heavy-duty truck scales — pitless, pit-mounted, RCC, mobile, in-motion, and unmanned.',
  },
  {
    title: 'Platform scales',
    href: '/products/platform-scales/',
    blurb: 'Durable floor and platform scales for drums, sacks, pallets, and bulk goods.',
  },
  {
    title: 'Tank weighing systems',
    href: '/products/tank-weighing-systems/',
    blurb: 'Load-cell systems for tanks, hoppers, and silos, integrated with your process.',
  },
  {
    title: 'Hanging scales',
    href: '/products/hanging-scales/',
    blurb: 'Crane and hanging scales for weighing suspended and heavy loads.',
  },
  {
    title: 'Analytical balances',
    href: '/products/analytical-balances/',
    blurb: 'High-precision balances for laboratories and quality control.',
  },
  {
    title: 'Table-top scales',
    href: '/products/table-top-scales/',
    blurb: 'Compact bench and counter scales for shop-floor and retail weighing.',
  },
  {
    title: 'Logistics scales',
    href: '/products/logistics-scales/',
    blurb: 'Parcel, pallet, and dimensioning scales built for logistics throughput.',
  },
];

/** Weighbridge sub-types (Weighbridge hub grid). Detail pages built in Phase 4. */
export const WEIGHBRIDGE_TYPES: CategoryCard[] = [
  {
    title: 'Pitless weighbridge',
    href: '/weighbridges/pitless/',
    blurb: 'Above-ground design with ramps — no excavation, easy to clean and maintain.',
  },
  {
    title: 'Pit-mounted weighbridge',
    href: '/weighbridges/pit-mounted/',
    blurb: 'Flush, ground-level deck that saves yard space and needs no ramps.',
  },
  {
    title: 'RCC weighbridge',
    href: '/weighbridges/rcc/',
    blurb: 'Reinforced-concrete deck for heavy, continuous traffic and long service life.',
  },
  {
    title: 'Instant mobile weighbridge',
    href: '/weighbridges/mobile/',
    blurb: 'Relocatable weighbridge that installs in 4–6 hours with no foundation.',
  },
  {
    title: 'Track weighing weighbridge',
    href: '/weighbridges/track/',
    blurb: 'Lighter, lower-cost track-type weighbridge for four-wheeler vehicles.',
  },
  {
    title: 'Unmanned weighbridge',
    href: '/weighbridges/unmanned/',
    blurb: 'Automated, kiosk-driven weighing for round-the-clock unattended operation.',
  },
];

/** Industries served (Home IndustryGrid + Industries hub). Pages built in Phase 5. */
export const INDUSTRIES: CategoryCard[] = [
  { title: 'Logistics & transport', href: '/industries/logistics/', blurb: 'Fast, accurate vehicle weighing for yards and despatch.' },
  { title: 'Warehousing', href: '/industries/warehousing/', blurb: 'Inbound/outbound weighing for stock accuracy.' },
  { title: 'Cement', href: '/industries/cement/', blurb: 'High-capacity weighing built for dusty, heavy operations.' },
  { title: 'Mining', href: '/industries/mining/', blurb: 'Rugged weighbridges for abrasive, high-tonnage sites.' },
  { title: 'Pharma', href: '/industries/pharma/', blurb: 'Precise, hygienic weighing for regulated environments.' },
  { title: 'Steel', href: '/industries/steel/', blurb: 'Robust weighing for raw materials and finished goods.' },
  { title: 'Agriculture', href: '/industries/agriculture/', blurb: 'Reliable weighing for produce, grain, and inputs.' },
  { title: 'Manufacturing', href: '/industries/manufacturing/', blurb: 'Process and dispatch weighing across the plant.' },
  { title: 'Chemical', href: '/industries/chemical/', blurb: 'Accurate, safe weighing for chemical handling.' },
];

/** URL for a product entry, based on its category. Weighbridges live under
 *  /weighbridges/<slug>/, everything else under /products/<slug>/. */
export function productHref(category: string, id: string): string {
  return category === 'weighbridge' ? `/weighbridges/${id}/` : `/products/${id}/`;
}

export interface ClientLogo {
  name: string;
  /** Path under /public, e.g. /images/clients/acme.svg */
  src: string;
}

/**
 * Client logos for the home "trusted by" strip. EMPTY until the client supplies
 * real logos WITH permission to display (spec A10) — we never invent these.
 * The section is hidden while this is empty.
 */
export const CLIENTS: ClientLogo[] = [];

/** Services offered (Services hub + footer). Detail pages from the collection. */
export const SERVICES: CategoryCard[] = [
  { title: 'Installation', href: '/services/installation/', blurb: 'Site preparation, foundation, and commissioning of your weighing equipment.' },
  { title: 'Calibration', href: '/services/calibration/', blurb: 'Keep weighing accurate and compliant with documented calibration.' },
  { title: 'AMC services', href: '/services/amc/', blurb: 'Annual maintenance contracts for uptime and peace of mind.' },
  { title: 'Repair & maintenance', href: '/services/repair/', blurb: 'Diagnosis and repair to get equipment back in service fast.' },
  { title: 'Software integration', href: '/services/software-integration/', blurb: 'Connect weighing data to your ERP, automation, and reporting.' },
];

export interface Feature {
  title: string;
  detail: string;
}

/** "Why Caliber" feature list — grounded in confirmed facts/stats. */
export const WHY_CALIBER: Feature[] = [
  {
    title: 'A manufacturer, not a reseller',
    detail:
      'In-house manufacturing since 2001 means real engineering expertise and direct control over build quality.',
  },
  {
    title: 'ISO 9001:2015 certified',
    detail: 'A quality-management system certified to ISO 9001:2015.',
  },
  {
    title: 'End-to-end ownership',
    detail:
      'We design, manufacture, install, calibrate, and maintain — one accountable partner across the lifecycle.',
  },
  {
    title: 'Pan-India coverage',
    detail: 'Installations and service across 25+ states and Union Territories of India.',
  },
  {
    title: 'Proven at scale',
    detail: '5,000+ installations across logistics, cement, mining, pharma, steel, and more.',
  },
  {
    title: 'Custom-engineered systems',
    detail: 'Weighing systems configured and built around your application, capacity, and site.',
  },
];
