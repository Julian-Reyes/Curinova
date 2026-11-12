# Deployment

The app is a static site (no server, no database). It is published to **GitHub Pages** at **https://curinova.julianreyes.dev** by the `deploy` job in `.github/workflows/ci.yml`. Hosting is free.

## How a deploy happens

1. Something is pushed to `main`.
2. `verify` (typecheck, lint, unit tests, content validation, build) and `e2e-smoke` (Playwright on phone and desktop sizes) must both pass.
3. `deploy` builds the app, copies the SPA fallback page to `404.html`, and publishes `apps/web/build/client` to GitHub Pages.

Pull requests run the checks but never deploy. If any check fails, nothing is published and the live site stays as it was.

**Why `404.html`:** GitHub Pages only knows about real files. App routes like `/app/review` aren't files, so Pages answers with `404.html`. That file is the app's SPA fallback page, which loads the app and shows the right screen, so reloading or opening a shared app link works.

## One-time setup (done in GitHub and DNS, not in code)

1. **DNS:** at the provider that manages `julianreyes.dev`, add a CNAME record: name `curinova`, value `julian-reyes.github.io`.
2. **Repo → Settings → Pages:**
   - Source: **GitHub Actions**
   - Custom domain: `curinova.julianreyes.dev` (GitHub checks the DNS record)
   - **Enforce HTTPS**: tick it once the certificate is ready (it can take a few minutes to an hour)

The custom domain lives in the repo settings. With Actions-based deploys, no `CNAME` file is needed in the build.

## Content shown on the live site

The deploy job builds with `LUMEN_PUBLIC_CONTENT_CHANNEL=production` (D22): the live site shows only lessons that were reviewed and published in `/_review`. Drafts stay off it until they are published. Local `pnpm dev`, `pnpm build` and the E2E job keep the default `preview` channel, which also shows drafts, labeled as such.

## Public pages, previews and sitemaps (M4, D26)

Every build also writes, into `apps/web/build/client`:

- a static HTML page for every published lesson, topic and trail, plus Credits, in both languages (`/pt/licao/<slug>/`, `/en/lesson/<slug>/`, …). Pages serves each as `<path>/index.html`; a link without the trailing slash is redirected to it;
- a 1200×630 link-preview JPEG for each of them, and a 1080×1920 story image for each lesson, under `/og/` (`pnpm content:og`; unchanged images are kept between local builds);
- `sitemap.xml` (an index of `sitemap-pt.xml` and `sitemap-en.xml`) and `robots.txt`.

The build fails if any public page is missing its title, description, canonical link, hreflang links, preview image or structured data. These addresses are public: once a lesson is live, its slug shouldn't change.

## Moving to a different domain later

1. Point the new domain's DNS at GitHub Pages (a CNAME for a subdomain, or GitHub's A/AAAA records for an apex domain).
2. Change the custom domain in Settings → Pages.
3. Change `SITE_URL` in `packages/domain/src/brand.ts`: canonical links, sitemaps and link previews use it.

The app itself runs at the root of whatever domain serves it.

**Important:** browsers tie on-device data to the domain. Learners' progress on `curinova.julianreyes.dev` will not appear on a new domain by itself. Before moving with real users, ship data export/import (planned for M5) and tell users how to carry their progress over.

## Checking a build locally the way Pages serves it

```bash
pnpm build
cp apps/web/build/client/__spa-fallback.html apps/web/build/client/404.html
pnpm preview   # http://localhost:4273
```
