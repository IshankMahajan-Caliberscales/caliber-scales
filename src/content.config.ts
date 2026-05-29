import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * Content model (spec B3). Six collections, all MDX, loaded via the Content
 * Layer glob loader. The filename = the URL slug for every entry (Keystatic's
 * slugField writes the same slug), so there is no separate `slug` frontmatter
 * field — `entry.id` is the slug.
 *
 * Image fields store a path string (e.g. "/images/products/foo.jpg"); this
 * keeps them interoperable with Keystatic's image field. Optimisation is
 * applied at render time in later phases.
 */

/** SEO fields shared by every collection (spec B3). */
const seo = {
  title: z.string(),
  metaTitle: z.string().optional(),
  metaDescription: z.string(),
  ogImage: z.string().optional(),
  noindex: z.boolean().default(false),
  /** Hide from production listings/sitemap until ready. */
  draft: z.boolean().default(false),
};

const labelValue = z.object({ label: z.string(), value: z.string() });
const qa = z.object({ q: z.string(), a: z.string() });

const products = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/products' }),
  schema: z.object({
    ...seo,
    category: z.enum(['weighbridge', 'scale', 'system']),
    subType: z.string().optional(),
    shortDescription: z.string(),
    heroImage: z.string().optional(),
    gallery: z.array(z.string()).default([]),
    specifications: z.array(labelValue).default([]),
    applications: z.array(z.string()).default([]),
    benefits: z.array(z.string()).default([]),
    capacityRange: z.string().optional(),
    relatedProducts: z.array(z.string()).default([]),
    faqs: z.array(qa).default([]),
  }),
});

const industries = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/industries' }),
  schema: z.object({
    ...seo,
    name: z.string(),
    intro: z.string(),
    heroImage: z.string().optional(),
    painPoints: z.array(z.string()).default([]),
    recommendedProducts: z.array(z.string()).default([]),
    relatedCaseStudies: z.array(z.string()).default([]),
    faqs: z.array(qa).default([]),
  }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/services' }),
  schema: z.object({
    ...seo,
    name: z.string(),
    intro: z.string(),
    heroImage: z.string().optional(),
    process: z.array(z.object({ step: z.string(), detail: z.string() })).default([]),
    faqs: z.array(qa).default([]),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    ...seo,
    /** Routes the entry under /resources/blog, /buying-guides, or /installation-guides. */
    type: z.enum(['article', 'buying-guide', 'installation-guide']).default('article'),
    excerpt: z.string(),
    heroImage: z.string().optional(),
    author: z.string().default('Caliber Scales'),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    relatedProducts: z.array(z.string()).default([]),
  }),
});

const caseStudies = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/caseStudies' }),
  schema: z.object({
    ...seo,
    clientName: z.string().default('Confidential'),
    industry: z.string(),
    location: z.string().optional(),
    productUsed: z.string().optional(),
    challenge: z.string(),
    solution: z.string(),
    result: z.string(),
    heroImage: z.string().optional(),
    gallery: z.array(z.string()).default([]),
  }),
});

const faqs = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/faqs' }),
  schema: z.object({
    ...seo,
    question: z.string(),
    answer: z.string(),
    category: z.string(),
  }),
});

export const collections = { products, industries, services, blog, caseStudies, faqs };
