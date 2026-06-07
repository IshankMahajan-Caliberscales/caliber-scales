# Caliber Scales — website

Industrial weighing manufacturer site. Built with **Astro + TypeScript +
Tailwind CSS v4**, static output with a single serverless lead endpoint,
deployed on **Netlify** (free tier). Full plan & spec: `caliber-scales-website-spec.md`.

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

## Custom admin panel (`/admin`)

A custom marketing panel with **email/password login** lives at **`/admin`**
(separate from the content editor). It's the home for the dashboard (leads,
traffic, Google Ads, search rankings) — the data sections light up once the site
is deployed and the Google accounts are connected.

**Configure the login** (server secrets — see `.env.example`):

- `AUTH_SECRET` — signs the session cookie (any long random string).
- `ADMIN_EMAIL` — the admin's email.
- `ADMIN_PASSWORD_HASH` — a scrypt hash, **never** the plain password. Generate:
  ```bash
  node -e "const c=require('crypto');const p='YOUR_PASSWORD';const s=c.randomBytes(16).toString('hex');console.log(s+':'+c.scryptSync(p,s,64).toString('hex'))"
  ```

Set these in `.env` locally and in the host's environment variables for
production. Auth is intentionally minimal (one admin, stateless signed-cookie
session, no database) — fine for a single marketing user; move to a proper auth
provider if you later need multiple users/roles.

## Content editor / CMS (Keystatic)

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
2. Add those same four variables in **Netlify → Site settings → Environment
   Variables**, then redeploy.
3. In the GitHub App's settings, set the homepage/callback URLs to your live
   domain.

After that, anyone you grant repo access can edit content at
`https://your-domain/keystatic`.

## Deploy (Netlify — free tier)

The `@astrojs/netlify` adapter is preconfigured (see `netlify.toml`), so the
serverless functions for `/api/lead`, `/admin/*`, and `/keystatic` run on
Netlify's Node runtime. To deploy:

1. Create a free Netlify account → **Add new site → Import from GitHub** → pick
   this repo. Netlify auto-detects the build (`npm run build`, publish `dist`).
2. Add the env secrets in **Site settings → Environment variables** (the `/admin`
   login secrets and, once set up, the Keystatic GitHub secrets — see
   `.env.example`).
3. Add your **custom domain** (e.g. from GoDaddy) under **Domain management** and
   enable the free SSL. Every `git push` then auto-deploys.

Netlify's free tier runs the full app (static pages + the Node functions) and is
fine for a site of this size.
