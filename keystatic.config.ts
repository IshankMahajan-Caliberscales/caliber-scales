import { config, fields, collection, singleton } from '@keystatic/core';
import { createElement } from 'react';

/**
 * Keystatic editor (spec B1/B12.2), mounted at /keystatic.
 *
 * Storage:
 *   • Development (`npm run dev`)  → LOCAL: edits write straight to the working
 *     tree, no auth needed.
 *   • Production (deployed build)  → GITHUB: the admin panel authenticates via
 *     the Keystatic GitHub App and commits edits to this repo, which triggers a
 *     redeploy. This is what makes /keystatic a real, hosted admin panel for the
 *     team (spec B1: "read/write the same content collections via Git").
 *
 * To finish enabling GitHub mode on the live site you must (one-time):
 *   1. Run `npm run dev`, open http://localhost:4321/keystatic, and follow the
 *      "Set up GitHub" flow — it creates a GitHub App and writes the secrets to
 *      .env: KEYSTATIC_GITHUB_CLIENT_ID, KEYSTATIC_GITHUB_CLIENT_SECRET,
 *      KEYSTATIC_SECRET, PUBLIC_KEYSTATIC_GITHUB_APP_SLUG.
 *   2. Add those same four variables to your host (Vercel → Project → Settings →
 *      Environment Variables) and redeploy.
 *   3. In the GitHub App settings, set the callback/homepage URLs to your live
 *      domain.
 *
 * Each collection writes single MDX files whose filename = slug, matching the
 * Astro Content Layer globs in src/content.config.ts. Images are written into
 * /public so the stored path is a ready-to-use URL string.
 */

// GitHub repository that backs the hosted CMS.
const GITHUB_REPO = 'vardhan20066-tech/caliber-scales';

// Storage mode:
//   • Deployed build → always GitHub (the hosted admin panel).
//   • Local dev      → local by default (no auth, instant edits). To run the
//     one-time "Set up GitHub" wizard locally, start dev with
//     PUBLIC_KEYSTATIC_GITHUB=true so this resolves to GitHub mode.
const useGitHub =
  import.meta.env.PROD || import.meta.env.PUBLIC_KEYSTATIC_GITHUB === 'true';
const storage = useGitHub
  ? ({ kind: 'github', repo: GITHUB_REPO } as const)
  : ({ kind: 'local' } as const);

const slug = (label = 'Title') =>
  fields.slug({ name: { label, validation: { isRequired: true } } });

const text = (label: string) =>
  fields.text({ label, validation: { isRequired: true } });

const optionalText = (label: string) => fields.text({ label });

const multiline = (label: string) =>
  fields.text({ label, multiline: true, validation: { isRequired: true } });

/** SEO fields shared across collections (excludes the slug/title field). */
const seoFields = {
  metaTitle: fields.text({
    label: 'Meta title (optional override)',
    description: 'Defaults to "<title> | Caliber Scales India" if left blank.',
  }),
  metaDescription: multiline('Meta description'),
  ogImage: fields.image({
    label: 'OG / social image (optional)',
    directory: 'public/images/og',
    publicPath: '/images/og/',
  }),
  noindex: fields.checkbox({ label: 'Hide from search engines (noindex)', defaultValue: false }),
  draft: fields.checkbox({ label: 'Draft (excluded from production)', defaultValue: true }),
};

const heroImage = (dir: string) =>
  fields.image({
    label: 'Hero image',
    directory: `public/images/${dir}`,
    publicPath: `/images/${dir}/`,
  });

const galleryField = (dir: string) =>
  fields.array(
    fields.image({
      label: 'Image',
      directory: `public/images/${dir}`,
      publicPath: `/images/${dir}/`,
    }),
    { label: 'Gallery', itemLabel: (p) => p.value?.filename ?? 'Image' }
  );

const faqArray = fields.array(
  fields.object({
    q: text('Question'),
    a: multiline('Answer'),
  }),
  { label: 'FAQs', itemLabel: (p) => p.fields.q.value || 'FAQ' }
);

const stringList = (label: string, itemLabel = 'Item') =>
  fields.array(fields.text({ label: itemLabel }), {
    label,
    itemLabel: (p) => p.value || itemLabel,
  });

const productRelationships = (label: string) =>
  fields.array(fields.relationship({ label: 'Product', collection: 'products' }), {
    label,
    itemLabel: (p) => p.value ?? 'Product',
  });

const body = fields.mdx({ label: 'Body' });

export default config({
  storage,
  ui: {
    // Brand the editor with the Caliber logo. `mark` is the logo image; the
    // name reads "[logo] CMS" to avoid repeating the wordmark in the logo.
    brand: {
      name: 'CMS',
      mark: () =>
        createElement('img', {
          src: '/images/brand/caliber-logo.png',
          alt: 'Caliber Scales',
          height: 22,
          style: { display: 'block' },
        }),
    },
    // Group the sidebar into clear sections instead of one flat list.
    navigation: {
      Products: ['products'],
      'Industries & Services': ['industries', 'services'],
      Resources: ['blog', 'faqs'],
      Settings: ['homepage', 'clients', 'settings'],
    },
  },
  singletons: {
    clients: singleton({
      label: 'Client Logos',
      path: 'src/content/settings/clients',
      format: { data: 'json' },
      schema: {
        logos: fields.array(
          fields.object({
            name: fields.text({ label: 'Client name', validation: { isRequired: true } }),
            logo: fields.image({
              label: 'Logo',
              directory: 'public/images/clients',
              publicPath: '/images/clients/',
              validation: { isRequired: true },
            }),
          }),
          {
            label: 'Client logos',
            description: 'Shown in the "Trusted across India" strip on the homepage. Drag to reorder.',
            itemLabel: (p) => p.fields.name.value || 'Logo',
          }
        ),
      },
    }),
    homepage: singleton({
      label: 'Homepage',
      path: 'src/content/settings/homepage',
      format: { data: 'json' },
      schema: {
        heroEyebrow: fields.text({
          label: 'Hero — eyebrow',
          description: 'Small line above the headline.',
        }),
        heroTitle: fields.text({
          label: 'Hero — headline (H1)',
          validation: { isRequired: true },
        }),
        heroLede: fields.text({
          label: 'Hero — sub-text',
          multiline: true,
          validation: { isRequired: true },
        }),
        heroImage: fields.image({
          label: 'Hero — image',
          directory: 'public/images/home',
          publicPath: '/images/home/',
        }),
        heroImageAlt: fields.text({
          label: 'Hero — image alt text',
          description: 'Describes the image for accessibility and SEO.',
        }),
      },
    }),
    settings: singleton({
      label: 'Site Settings',
      path: 'src/content/settings/site',
      format: { data: 'json' },
      schema: {
        phone: fields.text({
          label: 'Phone — for tel: links',
          description: 'Full number with country code, e.g. +91-9811156814',
          validation: { isRequired: true },
        }),
        phoneDisplay: fields.text({
          label: 'Phone — display format',
          description: 'How the number is shown on the site, e.g. +91 98111 56814',
          validation: { isRequired: true },
        }),
        whatsapp: fields.text({
          label: 'WhatsApp number',
          description: 'Digits only with country code, no + or spaces, e.g. 919811156814',
          validation: { isRequired: true },
        }),
        email: fields.text({ label: 'Email', validation: { isRequired: true } }),
        addressStreet: fields.text({ label: 'Address — street', validation: { isRequired: true } }),
        addressLocality: fields.text({ label: 'Address — city', validation: { isRequired: true } }),
        addressRegion: fields.text({ label: 'Address — state / region', validation: { isRequired: true } }),
        addressPostalCode: fields.text({ label: 'Address — postal code', validation: { isRequired: true } }),
        mapsEmbedUrl: fields.text({
          label: 'Google Maps embed URL (optional)',
          description: 'The src URL from a Google Maps "Embed a map" iframe. Shown on the Contact page.',
        }),
        foundedYear: fields.text({ label: 'Founded year', validation: { isRequired: true } }),
        yearsInBusiness: fields.text({ label: 'Years in business', description: 'e.g. 25+' }),
        installations: fields.text({ label: 'Installations', description: 'e.g. 5,000+' }),
        clients: fields.text({ label: 'Satisfied clients', description: 'e.g. 1,000+' }),
        statesCovered: fields.text({ label: 'States & UTs covered', description: 'e.g. 25+' }),
        certification: fields.text({ label: 'Certification', description: 'e.g. ISO 9001:2015' }),
        compliance: fields.text({ label: 'Compliance line (trust banner)', description: 'e.g. ISO/OIML Compliant Designs' }),
      },
    }),
  },
  collections: {
    products: collection({
      label: 'Products',
      slugField: 'title',
      path: 'src/content/products/*',
      format: { contentField: 'body' },
      columns: ['title', 'category'],
      entryLayout: 'content',
      schema: {
        title: slug('Product name'),
        ...seoFields,
        category: fields.select({
          label: 'Category',
          options: [
            { label: 'Weighbridge', value: 'weighbridge' },
            { label: 'Scale', value: 'scale' },
            { label: 'System', value: 'system' },
          ],
          defaultValue: 'weighbridge',
        }),
        subType: optionalText('Sub-type (e.g. pitless)'),
        shortDescription: multiline('Short description'),
        heroImage: heroImage('products'),
        gallery: galleryField('products'),
        capacityRange: optionalText('Capacity range (e.g. 10–200 tonnes)'),
        specifications: fields.array(
          fields.object({ label: text('Label'), value: text('Value') }),
          { label: 'Specifications', itemLabel: (p) => p.fields.label.value || 'Spec' }
        ),
        applications: stringList('Applications', 'Application'),
        benefits: stringList('Benefits', 'Benefit'),
        relatedProducts: productRelationships('Related products'),
        faqs: faqArray,
        body,
      },
    }),

    industries: collection({
      label: 'Industries',
      slugField: 'title',
      path: 'src/content/industries/*',
      format: { contentField: 'body' },
      columns: ['title'],
      entryLayout: 'content',
      schema: {
        title: slug('Industry name'),
        ...seoFields,
        name: text('Display name'),
        intro: multiline('Intro'),
        heroImage: heroImage('industries'),
        painPoints: stringList('Pain points', 'Pain point'),
        recommendedProducts: productRelationships('Recommended products'),
        faqs: faqArray,
        body,
      },
    }),

    services: collection({
      label: 'Services',
      slugField: 'title',
      path: 'src/content/services/*',
      format: { contentField: 'body' },
      columns: ['title'],
      entryLayout: 'content',
      schema: {
        title: slug('Service name'),
        ...seoFields,
        name: text('Display name'),
        intro: multiline('Intro'),
        heroImage: heroImage('services'),
        process: fields.array(
          fields.object({ step: text('Step'), detail: multiline('Detail') }),
          { label: 'Process steps', itemLabel: (p) => p.fields.step.value || 'Step' }
        ),
        faqs: faqArray,
        body,
      },
    }),

    blog: collection({
      label: 'Blog',
      slugField: 'title',
      path: 'src/content/blog/*',
      format: { contentField: 'body' },
      columns: ['title', 'publishDate'],
      entryLayout: 'content',
      schema: {
        title: slug('Title'),
        ...seoFields,
        excerpt: multiline('Excerpt'),
        heroImage: heroImage('blog'),
        author: fields.text({ label: 'Author', defaultValue: 'Caliber Scales' }),
        publishDate: fields.date({ label: 'Publish date', validation: { isRequired: true } }),
        updatedDate: fields.date({ label: 'Updated date' }),
        tags: stringList('Tags', 'Tag'),
        relatedProducts: productRelationships('Related products'),
        body,
      },
    }),

    faqs: collection({
      label: 'FAQs',
      slugField: 'title',
      path: 'src/content/faqs/*',
      format: { contentField: 'body' },
      columns: ['title', 'category'],
      schema: {
        title: slug('Internal title'),
        ...seoFields,
        question: text('Question'),
        answer: multiline('Answer'),
        category: text('Category'),
        body,
      },
    }),
  },
});
