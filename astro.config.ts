// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import vercel from '@astrojs/vercel';

import { SITE } from './src/lib/site';
import { draftUrlPaths } from './src/lib/draft-urls';

// Full URLs of draft (noindex) pages — kept out of the sitemap.
const draftUrls = new Set(draftUrlPaths().map((p) => new URL(p, SITE.url).href));

// Static-first build. Only /api/lead opts into on-demand rendering
// (via `export const prerender = false` in that file), so the Vercel
// adapter is used purely for that serverless endpoint while every page
// ships as a prerendered static asset for top Core Web Vitals.
export default defineConfig({
  site: SITE.url,
  output: 'static',
  adapter: vercel(),
  // trailingSlash left at the default ('ignore'): both /about and /about/
  // resolve. We DON'T force 'always' because Keystatic's client calls
  // /api/keystatic/... without a trailing slash and 'always' would 404 it.
  // SEO consistency is handled by always emitting trailing-slash canonicals
  // (see SEOHead) plus trailing-slash internal links + sitemap.
  integrations: [
    // React + Keystatic power the visual editor at /keystatic (admin only).
    react(),
    keystatic(),
    mdx(),
    sitemap({
      // Keep the API route, Keystatic admin, and all draft/noindex pages out.
      filter: (page) =>
        !page.includes('/api/') && !page.includes('/keystatic') && !draftUrls.has(page),
    }),
  ],
  // Tailwind v4 is wired via PostCSS (postcss.config.mjs), not the Vite plugin.
  // 301 redirects from the legacy .php site (B14). Astro emits these through
  // the Vercel adapter as host-level redirects.
  redirects: {
    '/electronic-weighbridge.php': '/weighbridges/',
    '/customized-weighing-systems.php': '/products/tank-weighing-systems/',
    '/platform-scale.php': '/products/platform-scales/',
    '/hanging-scale.php': '/products/hanging-scales/',
    '/high-precision-analytical-balance.php': '/products/analytical-balances/',
    '/table-top-scale.php': '/products/table-top-scales/',
    '/logistics-scales-weight.php': '/products/logistics-scales/',
    '/about-us.php': '/about/',
    '/contact-us.php': '/contact/',
    '/contact.php': '/contact/',
    '/blog.php': '/resources/blog/',
    '/faqs.php': '/resources/faqs/',
    '/privacy.php': '/privacy/',
    '/terms-and-conditions.php': '/terms/',
  },
});
