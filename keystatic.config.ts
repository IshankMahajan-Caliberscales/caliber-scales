import { config, fields, collection } from '@keystatic/core';

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

// Local in dev (no auth, instant edits); GitHub on the deployed site.
const storage = import.meta.env.DEV
  ? ({ kind: 'local' } as const)
  : ({ kind: 'github', repo: GITHUB_REPO } as const);

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
    brand: { name: 'Caliber Scales' },
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
        relatedCaseStudies: fields.array(
          fields.relationship({ label: 'Case study', collection: 'caseStudies' }),
          { label: 'Related case studies', itemLabel: (p) => p.value ?? 'Case study' }
        ),
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
        type: fields.select({
          label: 'Type',
          description: 'Where the entry is published.',
          options: [
            { label: 'Blog article', value: 'article' },
            { label: 'Buying guide', value: 'buying-guide' },
            { label: 'Installation guide', value: 'installation-guide' },
          ],
          defaultValue: 'article',
        }),
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

    caseStudies: collection({
      label: 'Case studies',
      slugField: 'title',
      path: 'src/content/caseStudies/*',
      format: { contentField: 'body' },
      columns: ['title', 'industry'],
      entryLayout: 'content',
      schema: {
        title: slug('Title'),
        ...seoFields,
        clientName: fields.text({ label: 'Client name', defaultValue: 'Confidential' }),
        industry: text('Industry'),
        location: optionalText('Location'),
        productUsed: optionalText('Product used'),
        challenge: multiline('Challenge'),
        solution: multiline('Solution'),
        result: multiline('Result'),
        heroImage: heroImage('case-studies'),
        gallery: galleryField('case-studies'),
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
