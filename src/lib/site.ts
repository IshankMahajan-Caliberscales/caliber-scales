/**
 * Single source of truth for site-wide configuration.
 *
 * ⚠️  PLACEHOLDER VALUES BELOW are marked `TODO`. They must be replaced with
 *     real, client-confirmed data before launch. Nothing here is fabricated as
 *     a final claim — the figures are clearly flagged for confirmation (see the
 *     "Notes to confirm with the client" section of the build spec, and B13).
 */

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export const SITE = {
  /** Canonical production origin. Update if the final domain differs. */
  url: 'https://caliberscales.com',
  name: 'Caliber Scales India',
  legalName: 'Caliber Scales India Pvt. Ltd.',
  shortName: 'Caliber Scales',
  /** Default meta description; pages override per-page. */
  description:
    'Caliber Scales India is a manufacturer of industrial weighing solutions — weighbridges, platform scales, tank weighing systems and more. ISO 9001:2015 certified.',
  /** Default Open Graph image (1200x630, client-supplied brand banner). */
  defaultOgImage: '/og/default.jpg',
  locale: 'en_IN',
  themeColor: '#0C2D52',
} as const;

/**
 * Contact details. PLACEHOLDERS — confirm with client (A10 / B-notes).
 * The postal address is taken verbatim from the spec (B6) and is treated as real.
 */
export const CONTACT = {
  /** Real address from spec B6. */
  address: {
    streetAddress: '303, 3rd Floor, Satya Mansion, Ranjit Nagar Commercial Complex',
    addressLocality: 'New Delhi',
    addressRegion: 'Delhi',
    postalCode: '110008',
    addressCountry: 'IN',
  },
  /** Confirmed by client. Used for tel: links + schema. */
  phone: '+91-9811156814',
  phoneDisplay: '+91 98111 56814',
  /** Confirmed by client. Digits only, country code, no +. */
  whatsapp: '919811156814',
  /** Confirmed by client. */
  email: 'info@caliberscales.com',
  /** TODO: confirm/replace with the embed from the current site. */
  mapsEmbedUrl: '',
} as const;

/**
 * Trust / credibility stats shown in the TrustBar and Organization schema.
 * PLACEHOLDERS flagged where the spec itself flags a discrepancy (e.g. "21 years"
 * vs founded 2001). Confirm exact figures with the client before launch.
 */
export const STATS = {
  foundedYear: 2001, // from spec A1 ("manufacturer since 2001")
  /** Confirmed by client (matches brand banner). */
  yearsInBusiness: '25+',
  /** Confirmed by client. */
  installations: '5,000+',
  /** Confirmed by client (brand banner). */
  clients: '1,000+',
  /** Confirmed by client: 25+ states & Union Territories of India. */
  statesCovered: '25+',
  certification: 'ISO 9001:2015',
} as const;

export const SOCIAL: { label: string; href: string }[] = [
  // TODO: add real, confirmed social profile URLs (used in sameAs schema).
];

/** Primary navigation (mirrors the site map in A4 / route map in B4). */
export const NAV: NavItem[] = [
  {
    label: 'Products',
    href: '/products/',
    children: [
      { label: 'Weighbridges', href: '/weighbridges/' },
      { label: 'Platform scales', href: '/products/platform-scales/' },
      { label: 'Tank weighing systems', href: '/products/tank-weighing-systems/' },
      { label: 'Hanging scales', href: '/products/hanging-scales/' },
      { label: 'Analytical balances', href: '/products/analytical-balances/' },
      { label: 'Table-top scales', href: '/products/table-top-scales/' },
      { label: 'Logistics scales', href: '/products/logistics-scales/' },
    ],
  },
  {
    label: 'Industries',
    href: '/industries/',
    children: [
      { label: 'Logistics & transport', href: '/industries/logistics/' },
      { label: 'Warehousing', href: '/industries/warehousing/' },
      { label: 'Cement', href: '/industries/cement/' },
      { label: 'Mining', href: '/industries/mining/' },
      { label: 'Pharma', href: '/industries/pharma/' },
      { label: 'Steel', href: '/industries/steel/' },
      { label: 'Agriculture', href: '/industries/agriculture/' },
      { label: 'Manufacturing', href: '/industries/manufacturing/' },
      { label: 'Chemical', href: '/industries/chemical/' },
    ],
  },
  {
    label: 'Services',
    href: '/services/',
    children: [
      { label: 'Installation', href: '/services/installation/' },
      { label: 'Calibration', href: '/services/calibration/' },
      { label: 'AMC services', href: '/services/amc/' },
      { label: 'Repair & maintenance', href: '/services/repair/' },
      { label: 'Software integration', href: '/services/software-integration/' },
    ],
  },
  {
    label: 'Resources',
    href: '/resources/',
    children: [
      { label: 'Blog', href: '/resources/blog/' },
      { label: 'Case studies', href: '/resources/case-studies/' },
      { label: 'Buying guides', href: '/resources/buying-guides/' },
      { label: 'Installation guides', href: '/resources/installation-guides/' },
      { label: 'FAQs', href: '/resources/faqs/' },
    ],
  },
  { label: 'About', href: '/about/' },
  { label: 'Contact', href: '/contact/' },
];

/** Pre-filled WhatsApp deep link. */
export function whatsappLink(message = "Hi, I'd like to enquire about your weighing products."): string {
  return `https://wa.me/${CONTACT.whatsapp}?text=${encodeURIComponent(message)}`;
}

/** tel: link from the configured phone number. */
export function telLink(): string {
  return `tel:${CONTACT.phone.replace(/\s+/g, '')}`;
}
