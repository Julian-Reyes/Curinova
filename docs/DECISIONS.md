# Decisions

Approved decisions and deviations from `docs/SPEC.md`. When this file and the spec disagree, this file wins. Each entry says what was decided, why, and who decided.

Legend: **Founder** = approved by the founder · **Agent** = implementation choice inside the approved plan (can be revisited any time).

---

## Pending — founder

These are open and **do not block** M1/M2. They must be settled before the public launch.

| #       | Decision                                                                                                                               | Spec     | Notes                                                                                                                                                                                                                      |
| ------- | -------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1      | Final product name and trademark clearance                                                                                             | §0.1     | Working title is now **Curinova** (2026-10-26). Before launch, check INPI (classes 9 and 41), USPTO, app stores, registro.br, .com/.app. Renaming is cheap by design (see "Renaming the product").                         |
| P2      | License all lesson text CC BY-SA 4.0?                                                                                                  | §5.6     | Until decided, drafts carry `contentLicense: "pending"`, and the validator blocks publishing anything "pending".                                                                                                           |
| P3      | LGPD legal basis for aggregate analytics (legitimate interest vs consent); is a formal _encarregado_ (data protection officer) needed? | §13, §14 | Analytics are M4.                                                                                                                                                                                                          |
| P4      | ECA Digital (Lei 15.211/2025) age policy                                                                                               | §14      | Needed before launch and before accounts (P1).                                                                                                                                                                             |
| P5      | Final domain → Capacitor appId / bundle ID                                                                                             | §9.4     | **TODO (M6+, Android):** the appId becomes permanent once published to the Play Store. Use a reverse-domain ID of the final domain with the codename, e.g. `<tld>.<domain>.lumen`. Never use the placeholder display name. |
| ~~P6~~  | ~~How should a long card fit small phones?~~                                                                                           | §3.2, D5 | **Resolved 2026-10-26 → D11.**                                                                                                                                                                                             |
| ~~P7~~  | ~~How should the onboarding purpose bias the feed?~~                                                                                   | §3.1     | **Resolved 2026-10-26 → D12.**                                                                                                                                                                                             |
| ~~P8~~  | ~~M2.5: What should the feed card show?~~                                                                                              | —        | **Resolved 2026-10-28 → D15.**                                                                                                                                                                                             |
| ~~P9~~  | ~~M2.5: visual direction for the card~~                                                                                                | §8       | **Resolved 2026-10-27 → D14.**                                                                                                                                                                                             |
| ~~P10~~ | ~~M2.5: Lesson images in the content format~~                                                                                          | —        | **Resolved 2026-10-28 → D15.**                                                                                                                                                                                             |
| ~~P11~~ | ~~M2.5: Image rights policy~~                                                                                                          | —        | **Resolved 2026-10-28 → D15.**                                                                                                                                                                                             |
| ~~P12~~ | ~~M2.5: How Review asks~~                                                                                                              | —        | **Resolved 2026-10-28 → D15.**                                                                                                                                                                                             |
| ~~P13~~ | ~~M2.5: Fonts (add Inter Tight)~~                                                                                                      | —        | **Resolved 2026-10-28 → D15.**                                                                                                                                                                                             |
| ~~P14~~ | ~~M2.5: Image processing tool (`sharp`)~~                                                                                              | —        | **Resolved 2026-10-28 → D15.**                                                                                                                                                                                             |
| ~~P15~~ | ~~M2.5: Offline images~~                                                                                                               | —        | **Resolved 2026-10-28 → D15.**                                                                                                                                                                                             |

---

## Renaming the product

"Curinova" is the current working title (founder, 2026-10-26). It is **only** a display name, and final clearance is still pending (P1).

**History:** "CurioFeed" (the spec's working title) → "Curinova" (2026-10-26). Retired names are listed in `RETIRED_BRAND_NAMES` in `brand.ts`.

**Where the display name appears (change these to rename):**

1. `packages/domain/src/brand.ts` → `BRAND.name` and `BRAND.shortName`, plus adding the outgoing name to `RETIRED_BRAND_NAMES`. This is the one-line rename. From it, the name flows into:
   - every UI string, through the i18n variable `{{appName}}` (`apps/web/app/i18n/index.ts`)
   - the HTML `<title>` and `apple-mobile-web-app-title` (`apps/web/app/root.tsx`)
   - the PWA manifest `name` / `short_name` (`apps/web/vite.config.ts`)
2. Documents that name the product: `README.md`, this file and `WALKTHROUGH.md` (update these by hand). `docs/SPEC.md` is historical; leave it.
3. **The site's domain** (`curinova.julianreyes.dev`, D13) contains the name. If the rename should change it too: DNS record, repo → Settings → Pages → Custom domain, and `docs/DEPLOYMENT.md`. Remember that changing the domain resets learners' on-device progress (D13).

`packages/domain/test/rename-guard.test.ts` fails if the current name shows up anywhere else, or if a retired name shows up outside this file and `docs/SPEC.md`. The i18n completeness test also fails if either kind of name is typed into a translation instead of `{{appName}}`.

**What must NEVER change** (all use the internal codename `lumen`):

| Identifier                                                      | Where                                               | Why it is permanent                                                                    |
| --------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------------------------------------- |
| IndexedDB database name `lumen`                                 | `apps/web/app/platform/storage-keys.ts` (`DB_NAME`) | Renaming creates an empty database: every guest loses progress, bookmarks and reviews. |
| localStorage keys `lumen.theme`, `lumen.locale`, `lumen.motion` | same file (`STORAGE_KEYS`)                          | Same reason; also read by the pre-paint boot script.                                   |
| Service-worker cache ID `lumen`                                 | `apps/web/vite.config.ts` (`workbox.cacheId`)       | A new ID orphans caches and forces a full re-download.                                 |
| Package scope `@lumen/*`                                        | every `package.json`                                | Churn in every import; no user impact, but no reason to change.                        |
| Env var prefix `LUMEN_PUBLIC_`                                  | `apps/web/vite.config.ts` (`envPrefix`)             | Deployment configs depend on it.                                                       |
| CI workflow/job names `ci`, `verify`, `e2e-smoke`               | `.github/workflows/ci.yml`                          | Branch-protection rules reference job names.                                           |
| Future Capacitor appId / iOS bundle ID                          | not created yet (P5)                                | Permanent once published to a store.                                                   |
| Future Docker/image names                                       | none yet                                            | Use `lumen-*`.                                                                         |

The PWA manifest `id` is `/` (not the name), so installed apps survive a rename.

---

## Founder decisions (approved 2026-10-23)

### D1 · Routing and prerender: React Router 7 framework mode — Founder

`ssr: false` (static SPA) plus `prerender` for public pages. Chosen over "Vite SPA + prerender plugin" because §7.1's page-head tags, build-time data and hydration come built in instead of being custom code we maintain.

- **PWA integration (tested first, as agreed).** vite-plugin-pwa builds the service worker _before_ React Router prerenders HTML, so the first precache list misses `index.html` and `__spa-fallback.html`. **Fix:** React Router's `buildEnd` hook calls the PWA plugin's `generateSW()` again once everything is on disk (`apps/web/react-router.config.ts`). The manifest `<link>` is rendered by `root.tsx`, and registration uses `virtual:pwa-register/react`. Verified: all HTML is precached, and Chrome reports the app installable (E2E test).
- **Version:** React Router **7.18**, not 8.x, to match this decision. v8 future flags are enabled except `v8_viteEnvironmentApi`, which makes vite-plugin-pwa 2.0 emit no service worker. Upgrading to v8 is a separate decision.
- **Hydration and language:** app routes render a locale-neutral splash at build time and choose the language in the browser after hydration. Public pages (M4) carry the locale in the URL.

### D2 · Node 24 baseline (spec deviation) — Founder

The spec says Node 22. We use **Node 24** because Node 22 leaves LTS in April 2027: `.nvmrc` = `24`, `engines.node` = `>=24`, CI on Node 24. pnpm 10 is pinned via `packageManager` and Corepack.
_Note:_ jsdom 30 needs Node ≥ 24.15, and this machine has 24.14, so tests use jsdom 29. Updating local Node to the latest 24.x would allow jsdom 30.

**Security update (2026-10-25):** the minimum is now **Node 24.22.1** (`.nvmrc` = `24.22.1`, `engines.node` = `>=24.22.1`). That release fixes CVE-2026-111497, a Brotli decompression flaw in Node's bundled Brotli library, plus six other CVEs (http, dns, tls, permission model, crypto); see the 24.22.1 entry in Node's `CHANGELOG_V24.md`. Production is a static site with no Node server, so the exposure was our tooling (installs, dev server, builds, Playwright, CI). `engine-strict` now refuses to install on older Node. This also clears the jsdom 30 requirement (Node ≥ 24.15), but upgrading jsdom is a separate change.

### D3 · Git: local only — Founder

Local Git on `main`. The GitHub Actions workflow exists (`.github/workflows/ci.yml`), but no remote is configured and nothing is pushed. "Passes in CI" will be verified when GitHub is connected.

### D4 · Locales — Founder

- A variant with `publicationStatus: "published"` requires **both** pt-BR and en, both published (hard error).
- Drafts may exist in a single locale.
- Fixtures always have both locales.
- Topic and trail names are always bilingual (schema-enforced).

### D5 · Card word limits — Founder

- The card body (paragraph blocks) must be 80–150 words.
- The optional takeaway is **not** counted and has its own ≤ 25-word limit. At most one takeaway per card.
- The card must still fit a 375×667 screen with the takeaway included. This is measured with Playwright in M2; see P6 and the M2 notes.

### D6 · Independent sources — Founder

A high-stakes claim needs ≥ 2 sources with **different source IDs and different publishers** (case-insensitive). Different hosts are _not_ required, because independent papers often share PubMed, SciELO or doi.org.

### D7 · Slugs — Founder

Lowercase ASCII kebab-case (`por-que-a-lua-mostra-sempre-o-mesmo-lado`), at most 80 characters, unique per locale.

### D8 · M1 shell tabs — Founder

The five tabs are shown disabled with "Em breve / Soon" in the M1 shell. M2 enables them.

### D9 · `content:check-links` deferred to M3 — Founder

As §20 plans. The skip-fixtures rule is already in the shared selector `selectContent(lib, channel)` (`packages/domain/src/publishable.ts`), so the link checker will inherit it.

### D10 · Fonts — Founder

**Fraunces** (headlines) and **Inter** (body), both SIL OFL, self-hosted through Fontsource (`@fontsource-variable/*`). Their latin and latin-ext subsets cover every Portuguese diacritic; the browser downloads only the subsets a page uses.

### Approved spec deviations (DV1–DV7) — Founder

| #   | Deviation                                                                                                                                                                                                                                                          | Reason                                                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| DV1 | Only `apps/web`, `packages/domain` and `tools/content-pipeline` exist for now. `apps/api`, `apps/extension`, `apps/mobile`, `packages/content` and `packages/ui` are created in their own milestones. Design tokens live in `apps/web` until `packages/ui` exists. | No empty placeholder packages.                                                |
| DV2 | Commands use `pnpm`, not the `npm run …` list in §20.                                                                                                                                                                                                              | One package manager with workspaces (§9.5).                                   |
| DV3 | The spec moved from `curiofeed_product_build_spec_v2.md` to `docs/SPEC.md`; its text still mentions the old filename.                                                                                                                                              | The spec text is not edited.                                                  |
| DV4 | `readingTimeSeconds` is **derived** from the word count (`readingTimeSeconds()` in `packages/domain/src/words.ts`, 200 wpm, rounded up to 15 s) rather than authored.                                                                                              | A typed-in value can drift from the text. The schema keeps no authored field. |
| DV5 | `UserPreferences` gains `purpose` (explore / deep / remember), which §3.1 collects but §10.3 omits.                                                                                                                                                                | Onboarding needs somewhere to store it.                                       |
| DV6 | CI has an extra `e2e-smoke` Playwright job (Chromium + WebKit).                                                                                                                                                                                                    | Catches layout regressions; free on GitHub Actions.                           |
| DV7 | `content:check-links` is deferred to M3 (see D9).                                                                                                                                                                                                                  | Matches §20.                                                                  |

---

## Implementation choices (Agent, M1)

| #   | Choice                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Why                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| A1  | **Versions:** React 19.3, Vite 8, TypeScript **6.0** (not 7: typescript-eslint supports < 6.1), ESLint **9** (not 10: jsx-a11y supports ≤ 9), Vitest 5, Tailwind 4, Zod 4, i18next 26 / react-i18next 17, vite-plugin-pwa 2. Exact versions are in `pnpm-lock.yaml`.                                                                                                                                                                                                     | Latest majors that are mutually compatible.                           |
| A2  | `@lumen/domain` is consumed as TypeScript source (no build step). `vite.config.ts` imports `brand.ts` by relative path with a `.ts` extension, because Vite loads its config with Node.                                                                                                                                                                                                                                                                                  | Simple; no compile/watch step for internal packages.                  |
| A3  | Validator strictness by status: **published** content gets errors for missing claims, unsupported claims, missing second source on high-stakes claims, unapproved claims, unreviewed questions and a "pending" license. **Drafts** get warnings for the same things. Schema, word limits, quiz structure, references, slugs and fixture isolation are errors at every status.                                                                                            | Drafts are work in progress, but must never be published by accident. |
| A4  | Trails with fewer than 5 or more than 8 concepts give a **warning** (§5.3 recommends 5–8).                                                                                                                                                                                                                                                                                                                                                                               | The required fixture shape is 4 concepts per trail.                   |
| A5  | **Fixture guardrails enforced by the validator:** fixture IDs start with `fixture_`; titles, hooks, summaries, card text, prompts, topic/trail names and source titles/publishers start with `FIXTURE`; fixture source URLs must be on `.invalid`. Real content may not use the `fixture_` prefix, `"fixture": true`, or placeholder hosts (`.invalid`, `.test`, `.example`, `localhost`, `example.com/org/net`). Real and fixture content may not reference each other. | Makes "fake content leaking into production" impossible to miss.      |
| A6  | `contentLicense` is an enum: `CC-BY-SA-4.0`, `CC-BY-4.0`, `all-rights-reserved`, `pending` (drafts only), `fixture` (fixtures only).                                                                                                                                                                                                                                                                                                                                     | Pending founder decision P2.                                          |
| A7  | `ReviewState.firstLearnedAt` added.                                                                                                                                                                                                                                                                                                                                                                                                                                      | Needed to measure delayed recall (≥ 3 days after first learning, §1). |
| A8  | **Contrast fixes found by the token test:** `--surface-sunken` light changed from `#EEF4F1` to `#F2F7F4` (muted text was 4.48:1), and text on mint tints uses `--primary-strong` (`#087F75` on `#DDF8EC` is 4.35:1). The §8 brand colors are unchanged.                                                                                                                                                                                                                  | WCAG AA.                                                              |
| A9  | **Local E2E on macOS 13:** Playwright's bundled browsers don't support macOS 13, so locally every project runs in the installed Google Chrome (iPhone sizes are emulated: viewport, DPR, touch, UA). CI on Linux runs real WebKit for the iPhone projects.                                                                                                                                                                                                               | Tooling limitation of this machine.                                   |
| A10 | The installability E2E test ignores only Chrome's `in-incognito` error (Playwright contexts are incognito-like).                                                                                                                                                                                                                                                                                                                                                         | Every other installability check must pass.                           |
| A11 | `vite preview` gets a small middleware that serves `__spa-fallback.html` for `/app/*`, mirroring the rewrite rule a static host will need (documented in M5).                                                                                                                                                                                                                                                                                                            | Lets the production build be tested locally.                          |

---

## Stage 2 (M2) scope — Founder (2026-10-23)

The founder asked for M1 and then M2 in the same run (an exception to "one milestone per run"), with the goal of a working, polished, mobile-first prototype to try on a phone. In scope: the swipe feed, realistic bilingual sample lessons, topic discovery and interests, five working tabs, bookmarks, quizzes with feedback, a progress dashboard, profile and settings, light/dark, local persistence, desktop layouts, smooth native-feeling motion, and browser-automated visual review. Out of scope: backend, accounts, the AI content pipeline, and a large library.

### Security · Node 24.22.1 (2026-10-25)

See D2. Applied on `main` before M2 was finished.

### D11 · Cards never scroll; "Continue reading" instead — Founder (2026-10-26)

Resolves P6. A lesson card never scrolls internally. When the paragraphs don't fit, they end in a fade with a **"Continue reading" / "Continuar lendo"** button; the takeaway and the actions stay fully visible. "Continue reading" opens the Go deeper sheet starting with the card's full text, followed by the deep dive. The 80–150-word validator range is unchanged.

Also requested: **tapping a card opens Go deeper** (B18).

Measured after the change, every sample lesson in trail mode (the tightest case), both locales:

| Screen                                              | Cards cut off | Cards showing "Continue reading" |
| --------------------------------------------------- | ------------- | -------------------------------- |
| iPhone 13/14 full screen or installed app (390×844) | 0/20          | 0/20                             |
| iPhone 15 in a mobile browser (≈393×660 visible)    | 0/20          | 18–19/20                         |
| iPhone SE in a mobile browser (≈375×553 visible)    | 0/20          | 20/20                            |
| Same, with an offline/storage banner showing        | 0/20          | 20/20                            |

In a mobile browser, the address bar and toolbar take about 190px, so most cards use "Continue reading" there. Installed to the Home Screen, they show whole.

### D12 · Onboarding purpose shapes the feed — Founder (2026-10-26)

Resolves P7. Definitions:

- **Explore:** prioritize new, surprising topics and diversity across subjects.
- **Learn deeply:** prioritize connected lessons, learning trails and progression through a topic.
- **Remember more:** prioritize review opportunities, quizzes and previously encountered concepts.

Implementation (`PURPOSE_WEIGHTS` in `packages/domain/src/feed.ts`, tested): each purpose is a weight profile over the §6 score.

- **Explore** raises topic variety (4.0) and novelty (2.0), and lowers interest match (1.5) and trail continuation (1.0).
- **Learn deeply** raises trail continuation (6.0) and links between trails (3.0), and lowers variety (0.5).
- **Remember more** adds a bonus (3.0) for trails the learner had already started before the session. When reviews are due at session start, the feed shows an explicit, skippable **"Time to remember"** card after the first lesson, and the Quiz action is emphasized on every card.

The §6 hard rules still apply to every profile: trail order, never three same-topic cards in a row, about 25% exploration slots, and due reviews never disguised as lessons. No purpose means the §6 default weights.

### D13 · Hosting: GitHub Pages on curinova.julianreyes.dev — Founder (2026-10-26)

The app is published to GitHub Pages at **https://curinova.julianreyes.dev** by a `deploy` job that runs only for pushes to `main`, after `verify` and `e2e-smoke` pass. A subdomain was chosen over `julianreyes.dev/Curinova` because the app will need its own domain eventually: it runs at a domain root with no base-path configuration, so moving later is a DNS and settings change only. Moving domains does reset on-device progress (browsers tie storage to the domain), so data export/import (M5) should ship before a move with real users. Details: `docs/DEPLOYMENT.md`.

### D14 · M2.5 visual direction: Concept E — Founder (2026-10-27)

Resolves P9. The founder chose **Concept E** (Design Lab, `experiments/m2-5/concept-e.html`) over Concepts A–D: a cinematic full-screen Discover feed with an action rail and a `Dive in` button, an app-native Go Deeper sheet (the M2 pattern, polished), and a question-first Review. Tapping a card opens Go Deeper, as in the app (B18). Explore, Review, Library and You are being prototyped in the same language before anything is ported to the React app. Image rights for the supplied artwork are still to be confirmed (see `docs/M2_5_UX_OVERHAUL.md` §2c). P8 (what the feed card shows) remains open.

### D15 · M2.5 integration decisions — Founder (2026-10-28)

Resolves P8 and P10–P15 from `docs/M2_5_INTEGRATION_PLAN.md` §2.

- **P8 · Discover card text.** The card shows a short, purpose-written card text in Concept E's style under the title (one or two sentences, about 25–33 words, answering the title's question). It is a new optional `cardText` field in each lesson variant; a lesson without one falls back to its `summary`. The texts for all 20 sample lessons, in both languages, are in `docs/M2_5_CARD_TEXT.md` (4 written for the prototype, 16 new, all approved). They only restate facts already in each lesson and stay unverified drafts until M3 review. The full text, hook and takeaway move to Go Deeper; D11's "Continue reading" is retired for the feed. Deviation: this adds lesson text in M2.5, which the integration plan had ruled out.
- **P10 · Lesson images.** Each lesson can carry three images (Discover, Go Deeper, Review), as the prototype does, and the content format accepts generated artwork (no source URL). The lesson's diagram stays as the fallback. Spec deviation from §5.6's single `heroMedia`.
- **P11 · Image rights and credits.** Every shipped image has a recorded origin. **AI-generated images get no visible credit**; their origin (tool, date, accuracy check) is kept in the lesson file only. Pexels and Unsplash photos get a **minimal** credit (e.g. "Photo: Name, Pexels"). Images that require a credit, such as NASA/ESA/CSA, carry it.
- **P12 · Review.** Multiple choice (the app's questions and scheduling), presented in E's question-first layout.
- **P13 · Fonts.** Add Inter Tight (`@fontsource-variable/inter-tight`, SIL OFL, self-hosted) for display type, with Inter for text, as in Concept E. Fraunces is removed if no screen uses it after the pass. New dependency approved.
- **P14 · Image processing.** `sharp` as a dev dependency for the image script. Used only on development machines and in CI; never shipped to users.
- **P15 · Offline images.** Runtime cache (cache-first, capped) for lesson images; the diagram shows if an image isn't cached offline.
- **Completion rule (agent, inside the approved plan).** A lesson counts as completed after 6 s on the Discover card, 40% of its reading time in Go Deeper, or finishing its quiz (§10.4 adapted to the short card).
- **Topic pictures (agent, inside P10/P11).** Topics can carry one picture (`topics.json` → `image`), with the same origin, alt-text and file checks as lesson images, served from `/media/topics/<id>.webp`. Licensed topic pictures are credited at the foot of the topic page (the ESA/Webb image is CC BY 4.0 with a fixed credit line).
- **Review rows (agent).** Review lists one row per lesson (a lesson has a review state per question), showing its next due question's date.
- **Implementation notes (agent).** Images live in `apps/web/public/media/<lesson>/<slot>.webp` (+ `-sm`), declared in `concept.json` → `media`, URLs versioned by `addedAt`. Trails exit to the page they were started from (`?from=`), else Discover. The Discover card keeps the spec's reason line and the "Preview" chip (B1) inside E's topic line.

### P6 measurements (M2, 2026-10-25, before D11)

Measured with Playwright on all 20 sample lessons (86–105-word bodies plus the takeaway), counting cards whose text fits with no inner scrolling. "Discover" has about 52px more room than trail mode, which shows a trail header.

| Screen                      | pt-BR Discover | en Discover | pt-BR trail mode | en trail mode |
| --------------------------- | -------------- | ----------- | ---------------- | ------------- |
| iPhone 13/14 (390×844)      | 20/20          | 20/20       | 20/20            | 20/20         |
| Mid-range Android (360×800) | 20/20          | 19/20       | 9/20             | 14/20         |
| iPhone SE (375×667)         | 3/20           | 11/20       | 1/20             | 1/20          |

At 375×667, with legible type (14.5px), the bottom navigation and four labeled actions, a card holds roughly **60–75 words plus the takeaway**. The spec's 80–150-word range therefore cannot fully fit there, and a 150-word card cannot fit on any phone. Options for the founder:

1. **Lower the card range** to about 60–110 words (a validator change and a spec deviation); longer explanations move to "Go deeper".
2. **Keep 80–150** and accept in-card scrolling on small phones (what the prototype does now, with a fade cue).
3. **Hybrid:** keep the range for content, but on short screens show the first part with a "Continue reading" affordance that expands in place.

## Implementation choices (Agent, M2)

Each of these can be revisited at any time.

| #   | Choice                                                                                                                                                                                                                                                                                                                                                                                                            | Why                                                                                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | **Sample lessons are real drafts, not fixtures.** 20 concepts (5 topics × one 4-lesson trail) live in `content/lessons/` with `reviewStatus`/`publicationStatus: "draft"`, `contentLicense: "pending"`, **no claims or sources**, and `generation` metadata recording the drafting model. The app shows them with a "Prévia / Preview" chip, and the sources sheet explains they're unverified.                   | The founder wanted accurate, interesting sample content; the rule is never to fabricate sources. They can enter the M3 pipeline for sourcing and review.                         |
| B2  | **Content channel.** `LUMEN_PUBLIC_CONTENT_CHANNEL` = `preview` (default: published + drafts, labeled), `production` (published only: currently shows nothing, honestly) or `fixtures` (tests only). Content is bundled by a small Vite plugin into one lazy chunk; fixtures are only read in the fixtures channel. M3's `content:build` replaces the plugin.                                                     | No unreviewed content can reach a production build by accident; fixtures can never reach any app build.                                                                          |
| B3  | **Dependencies added in M2:** Dexie + dexie-react-hooks (IndexedDB, §9.1), @radix-ui/react-dialog (accessible sheets, §9.1), zod in the web app, and test-only fake-indexeddb + Testing Library. **Not added:** TanStack Query (no server data yet), Zustand (React context suffices), any gesture or animation library.                                                                                          | Smallest set the features need.                                                                                                                                                  |
| B4  | **The feed uses native CSS scroll snapping** (`snap-mandatory`, `snap-stop: always`), plus buttons and arrow/PageUp/PageDown/j/k keys. Only cards within 2 of the current one are fully rendered.                                                                                                                                                                                                                 | Native momentum and rubber-banding on iOS and Android; no gesture code to maintain.                                                                                              |
| B5  | **"Completed"** = the card stayed active for 40% of its reading time (at least 6 s), or its quiz was finished. **"Opened"** = it became the active card.                                                                                                                                                                                                                                                          | §10.4 asks for a documented, conservative threshold.                                                                                                                             |
| B6  | **Review queue:** a lesson quiz's _first_ answer enters the queue whether right or wrong (wrong → retry tomorrow, per §3.4's wrong-answer rule); retries don't. Due-ness compares calendar dates in the learner's time zone. A correct answer before the due date is "practice" and doesn't advance the streak. "Mastered" = 3 consecutive correct reviews (1 → 3 → 7 days).                                      | §3.4 says correct answers enter the queue; including wrong first answers gives them their next-day retry. Easy to change in `ProgressStore.answer`.                              |
| B7  | **Ranking (§6):** only the next unseen lesson of each trail is a candidate, so trails are always in order; every 4th slot goes to a topic outside the learner's interests; reasons shown are "Because you chose X", "Continues your trail" or "Something new". Interest and mute changes apply from the next session, so cards never jump mid-session (said in the UI).                                           | Matches §6, with deterministic per-session order.                                                                                                                                |
| B8  | **Not on the card yet:** _Share_ and _More_ (sharing needs the prerendered lesson pages of M4), and _Report issue_ (no contact channel configured). _Export/import_ is shown in Settings as plain text ("coming soon", M5), not as a dead button.                                                                                                                                                                 | No dead controls (§0.5).                                                                                                                                                         |
| B9  | The **"show lessons in other language"** preference isn't exposed: every sample lesson exists in both languages, so the toggle would do nothing. The card still labels a lesson shown in the other language.                                                                                                                                                                                                      | No controls without effect.                                                                                                                                                      |
| B10 | The onboarding **purpose** is stored but not yet used by ranking (P7).                                                                                                                                                                                                                                                                                                                                            | Needs a product decision on what each purpose should change.                                                                                                                     |
| B11 | _(Superseded by D11: no in-card scrolling.)_ **Card layout:** the hero illustration flexes to fill whatever space the text doesn't need (46–200px; 320px on desktop) and hides itself when too short to draw. Type tightens slightly below 880px of height and again at 700px or less. Text that still doesn't fit scrolls inside the card with a fade cue, and at the end, scrolling continues to the next card. | Measured with Playwright across devices (see P6).                                                                                                                                |
| B12 | **Desktop (≥ 1024px):** a sidebar with the five tabs; the feed is centered at 500px with up/down buttons on its left; a side rail (≥ 1280px) shows the current trail with progress and related lessons. Sheets become centered dialogs.                                                                                                                                                                           | §3.2 / §8 desktop layout.                                                                                                                                                        |
| B13 | **Original illustrations:** one SVG scene per lesson (20) in a shared flat style using the mint/aqua/teal palette plus topic accents; they're theme-aware. `heroMedia.license: "original"`.                                                                                                                                                                                                                       | §8 visual direction; no third-party assets.                                                                                                                                      |
| B14 | **Progress dashboard:** shows counts only from real events, immediate vs delayed (≥ 3 days) accuracy with sample sizes, "active days in the last 7" instead of a streak (no guilt), and renders nothing until data has loaded, so it never flashes false zeros.                                                                                                                                                   | §3.6 "no invented metrics".                                                                                                                                                      |
| B15 | **Storage failures** (blocked IndexedDB) keep the app usable with a banner saying progress won't be saved; an **offline** banner appears when the device goes offline.                                                                                                                                                                                                                                            | §12 friendly states.                                                                                                                                                             |
| B16 | The feed sets `data-ready` once its swipe/keyboard handlers are attached; E2E tests wait for it instead of sleeping.                                                                                                                                                                                                                                                                                              | Removed a flaky race found during testing.                                                                                                                                       |
| B17 | **Dedicated local ports:** dev server `5273`, preview `4273`, both `strictPort` (fail loudly if taken).                                                                                                                                                                                                                                                                                                           | Vite's default 5173 was already used by another local project; on macOS, `localhost` resolved to that other app while ours listened on the same port number on other interfaces. |
| B18 | **Tapping the card body opens Go deeper** (founder request). Taps on buttons and links inside the card, and text selections, are ignored. Keyboard and screen-reader users keep the explicit "Go deeper" button for the same action.                                                                                                                                                                              | Pointer shortcut without hiding the accessible path.                                                                                                                             |
| B19 | **Bug fix, plain-http IDs:** `crypto.randomUUID()` doesn't exist outside secure contexts, so on a phone opening the dev server over Wi-Fi (`http://192.168…`) every save failed and the feed couldn't start a session. IDs now come from `newId()` (`apps/web/app/platform/ids.ts`), which falls back to `crypto.getRandomValues()`.                                                                              | Found from the founder's phone screenshots (the "storage blocked" banner).                                                                                                       |
| B20 | **Bug fix, banners:** status banners (offline, storage) publish their height as `--banner-h`, and the full-height feed subtracts it, so a banner can no longer push the card under the bottom navigation.                                                                                                                                                                                                         | Same screenshots: the cards' bottoms were cut off.                                                                                                                               |
| B21 | **Bug fix, deep-dive event:** `deep_dive_opened` was never recorded (the sheet opened without going through the handler that logged it). Opening Go deeper now always records it.                                                                                                                                                                                                                                 | Found while wiring B18.                                                                                                                                                          |
| B22 | **CI E2E runs inside Playwright's official Docker image** (`mcr.microsoft.com/playwright:v1.64.1-noble`), and every job has a time limit (10/25/10 minutes). A test (`apps/web/app/ci-workflow.test.ts`) keeps the image tag equal to the installed Playwright version, and checks that deploy only runs from `main` after all checks pass.                                                                       | The first CI run hung for 14+ minutes downloading WebKit's 119 MB of Linux libraries; the image already contains them.                                                           |
| B23 | Workflow concurrency cancels superseded **pull-request** runs only; runs for `main` always finish.                                                                                                                                                                                                                                                                                                                | A newer push must never cut off a deploy halfway.                                                                                                                                |
