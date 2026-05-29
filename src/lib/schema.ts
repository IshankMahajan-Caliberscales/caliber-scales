/**
 * JSON-LD schema builders (spec B6).
 *
 * Each function returns a plain object that the <JsonLd> component serialises
 * into a <script type="application/ld+json"> tag. Builders intentionally omit
 * any claim that cannot be substantiated (e.g. AggregateRating) unless real
 * data is passed — never fabricate reviews, ratings, or certifications.
 */
import { SITE, CONTACT, STATS, SOCIAL } from './site';

type Json = Record<string, unknown>;

/** Absolute URL from a site-relative path. */
export function absUrl(path: string): string {
  return new URL(path, SITE.url).href;
}

const postalAddress = (): Json => ({
  '@type': 'PostalAddress',
  streetAddress: CONTACT.address.streetAddress,
  addressLocality: CONTACT.address.addressLocality,
  addressRegion: CONTACT.address.addressRegion,
  postalCode: CONTACT.address.postalCode,
  addressCountry: CONTACT.address.addressCountry,
});

/**
 * Sitewide Organization + LocalBusiness. Rendered in BaseLayout so every page
 * carries it. `hasCredential` reflects the real ISO 9001:2015 certification.
 */
export function organizationSchema(): Json {
  const sameAs = SOCIAL.map((s) => s.href);
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'LocalBusiness'],
    '@id': absUrl('/#organization'),
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    description: SITE.description,
    foundingDate: String(STATS.foundedYear),
    address: postalAddress(),
    telephone: CONTACT.phone,
    email: CONTACT.email,
    ...(sameAs.length ? { sameAs } : {}),
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'certification',
      name: STATS.certification,
    },
  };
}

export function webSiteSchema(): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': absUrl('/#website'),
    url: SITE.url,
    name: SITE.name,
    publisher: { '@id': absUrl('/#organization') },
  };
}

export interface Crumb {
  name: string;
  href: string;
}

export function breadcrumbSchema(crumbs: Crumb[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absUrl(c.href),
    })),
  };
}

export interface FaqItem {
  q: string;
  a: string;
}

export function faqSchema(faqs: FaqItem[]): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
}

export interface ProductSchemaInput {
  name: string;
  description: string;
  image?: string;
  category?: string;
  url: string;
}

export function productSchema(p: ProductSchemaInput): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    description: p.description,
    ...(p.image ? { image: absUrl(p.image) } : {}),
    ...(p.category ? { category: p.category } : {}),
    url: absUrl(p.url),
    brand: { '@type': 'Brand', name: SITE.name },
    manufacturer: { '@id': absUrl('/#organization') },
    // No offers/aggregateRating: pricing & reviews are not published — do not
    // fabricate. Add real Offer/Review data here when available.
  };
}

export interface ArticleSchemaInput {
  headline: string;
  description: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  author?: string;
  url: string;
}

export function articleSchema(a: ArticleSchemaInput): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.headline,
    description: a.description,
    ...(a.image ? { image: absUrl(a.image) } : {}),
    ...(a.datePublished ? { datePublished: a.datePublished } : {}),
    ...(a.dateModified ? { dateModified: a.dateModified } : {}),
    author: { '@type': 'Organization', name: a.author ?? SITE.name },
    publisher: { '@id': absUrl('/#organization') },
    mainEntityOfPage: absUrl(a.url),
    url: absUrl(a.url),
  };
}
