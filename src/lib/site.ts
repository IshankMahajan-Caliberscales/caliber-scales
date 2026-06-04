/**
 * Single source of truth for site-wide configuration.
 *
 * CONTACT and STATS are loaded from src/content/settings/site.json, which is
 * editable in the CMS (Keystatic → "Site Settings"). Everything else (brand
 * identity, navigation) stays in code. `s` below provides safe fallbacks so the
 * site builds even if a field is blank.
 */
import settings from '../content/settings/site.json';

const s = settings as Record<string, string>;

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
 * Contact details — edited via the CMS (Site Settings). The country code stays
 * fixed in code; everything else comes from site.json.
 */
export const CONTACT = {
  address: {
    streetAddress: s.addressStreet,
    addressLocality: s.addressLocality,
    addressRegion: s.addressRegion,
    postalCode: s.addressPostalCode,
    addressCountry: 'IN',
  },
  /** Used for tel: links + schema. */
  phone: s.phone,
  phoneDisplay: s.phoneDisplay,
  /** Digits only, country code, no +. */
  whatsapp: s.whatsapp,
  email: s.email,
  /** Optional Google Maps embed URL. */
  mapsEmbedUrl: s.mapsEmbedUrl ?? '',
};

/**
 * Trust / credibility stats shown in the TrustBar and Organization schema —
 * edited via the CMS (Site Settings).
 */
export const STATS = {
  foundedYear: s.foundedYear,
  yearsInBusiness: s.yearsInBusiness,
  installations: s.installations,
  clients: s.clients,
  statesCovered: s.statesCovered,
  certification: s.certification,
  /** Marketing compliance line for the trust banner (e.g. ISO/OIML). */
  compliance: s.compliance ?? 'ISO/OIML Compliant Designs',
};

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
      { label: 'Crane scales', href: '/products/crane-scales/' },
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
      { label: 'Construction & Infrastructure', href: '/industries/construction/' },
      { label: 'Mining & Minerals', href: '/industries/mining/' },
      { label: 'Steel & Metals', href: '/industries/steel/' },
      { label: 'Manufacturing', href: '/industries/manufacturing/' },
      { label: 'Cement & Building Materials', href: '/industries/cement/' },
      { label: 'Warehousing & Distribution', href: '/industries/warehousing/' },
      { label: 'Agriculture', href: '/industries/agriculture/' },
      { label: 'Waste Management & Recycling', href: '/industries/waste-management/' },
      { label: 'Pharma', href: '/industries/pharma/' },
      { label: 'Chemical', href: '/industries/chemical/' },
      { label: 'Logistics & Transport', href: '/industries/logistics/' },
      { label: 'Industrial Terminals & Hubs', href: '/industries/industrial-terminals/' },
    ],
  },
  {
    label: 'Services',
    href: '/services/',
    children: [
      { label: 'Installation', href: '/services/installation/' },
      { label: 'AMC services', href: '/services/amc/' },
      { label: 'Repair & Relocation', href: '/services/repair/' },
      { label: 'Software integration', href: '/services/software-integration/' },
    ],
  },
  {
    label: 'Resources',
    href: '/resources/',
    children: [
      { label: 'Blog', href: '/resources/blog/' },
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
