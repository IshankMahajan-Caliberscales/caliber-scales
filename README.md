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

## Admin panel / CMS (Keystatic)

The content editor lives at **`/keystatic`**. Content is stored as MDX in
`src/content/` (no database), so editors get a friendly UI and every change is
just a Git commit.

- **In development** (`npm run dev` → http://localhost:4321/keystatic) it runs in
  **local mode**: edits write straight to the working tree. No login required.
- **On the deployed site** it runs in **GitHub mode**: the team logs in with
  GitHub and edits are committed to this repo (`vardhan20066-tech/caliber-scales`),
  which triggers a redeploy.

### One-time setup to enable the hosted admin panel

1. Start dev in GitHub mode so the setup wizard appears:
   `PUBLIC_KEYSTATIC_GITHUB=true npm run dev` (PowerShell:
   `$env:PUBLIC_KEYSTATIC_GITHUB="true"; npm run dev`). Open `/keystatic` and
   complete the **"Set up GitHub"** flow. Keystatic creates a GitHub App and
   writes four secrets to `.env`: `KEYSTATIC_GITHUB_CLIENT_ID`,
   `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`,
   `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`. (Plain `npm run dev` stays in local mode.)
2. Add those same four variables in **Vercel → Project → Settings → Environment
   Variables**, then redeploy.
3. In the GitHub App's settings, set the homepage/callback URLs to your live
   domain.

After that, anyone you grant repo access can edit content at
`https://your-domain/keystatic`.

## Deploy (Vercel)

Connect the repo to Vercel; the `@astrojs/vercel` adapter is preconfigured.
Build command `npm run build`, output handled by the adapter. Set the custom
domain + SSL in the Vercel dashboard. Env vars go in Project Settings →
Environment Variables; see `.env.example`.
