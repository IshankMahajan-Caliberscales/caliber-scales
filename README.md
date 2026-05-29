# Caliber Scales — website

Industrial weighing manufacturer site. Built with **Astro + TypeScript +
Tailwind CSS v4**, static output with a single serverless lead endpoint,
deployed on **Vercel**. Full plan & spec: `caliber-scales-website-spec.md`.

## Commands

```bash
npm install        # install dependencies
npm run dev        # local dev server (http://localhost:4321)
npm run build      # type-check (astro check) + production build → dist/
npm run build:fast # build without type-check
npm run preview     # preview the production build locally
```

## Status

**Phase 1 (scaffold) — complete.** Design tokens, BaseLayout + Header / Nav /
Footer / Breadcrumbs, SEOHead + JsonLd, robots.txt, sitemap integration,
`/api/lead` stub, and a placeholder home. See the build spec B12 for the
remaining phases.

## Configuration

All site-wide values (contact details, stats, navigation) live in
[`src/lib/site.ts`](src/lib/site.ts). Values marked `TODO` are **placeholders
awaiting client confirmation** — replace before launch. Nothing is presented
as a finalised claim until confirmed.

## Deploy (Vercel)

Connect the repo to Vercel; the `@astrojs/vercel` adapter is preconfigured.
Build command `npm run build`, output handled by the adapter. Set the custom
domain + SSL in the Vercel dashboard. Env vars (later phases) go in Project
Settings → Environment Variables; see `.env.example`.
