// @ts-check
import { defineConfig, envField } from 'astro/config';
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
  // Typed env (astro:env). Server secrets power the custom /admin login; the
  // GA4 id is public (client). All optional so the build never fails when unset.
  env: {
    schema: {
      AUTH_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      ADMIN_PASSWORD_HASH: envField.string({ context: 'server', access: 'secret', optional: true }),
      PUBLIC_GA4_ID: envField.string({ context: 'client', access: 'public', optional: true }),
    },
  },
  // Allow temporary public preview tunnels (e.g. Cloudflare trycloudflare.com)
  // to reach the dev server when sharing a review link. Harmless for local dev.
  vite: {
    server: {
      allowedHosts: true,
    },
  },
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
    // Weighbridge category renames (kept names → new URLs).
    '/weighbridges/pitless/': '/weighbridges/surface-mounted/',
    '/weighbridges/pit-mounted/': '/weighbridges/pit-type/',
    // Removed in content revision → hubs.
    '/weighbridges/rcc/': '/weighbridges/',
    '/services/calibration/': '/services/',
    '/resources/case-studies/': '/resources/',
    '/resources/buying-guides/': '/resources/',
    '/resources/installation-guides/': '/resources/',
    // Legacy .php site (B14).
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
