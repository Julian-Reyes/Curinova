# Decisions

Approved decisions and deviations from `docs/SPEC.md`. When this file and the spec disagree, this file wins. Each entry says what was decided, why, and who decided.

Legend: **Founder** = approved by the founder · **Agent** = implementation choice inside the approved plan (can be revisited any time).

---

## Pending — founder

These are open and **do not block** M1/M2. They must be settled before the public launch.

| #   | Decision                                                                                                                               | Spec     | Notes                                                                                                                                                                                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Final product name and trademark clearance                                                                                             | §0.1     | Check INPI (classes 9 and 41), USPTO, app stores, registro.br, .com/.app. Renaming is cheap by design (see "Renaming the product").                                                                                        |
| P2  | License all lesson text CC BY-SA 4.0?                                                                                                  | §5.6     | Until decided, drafts carry `contentLicense: "pending"`, and the validator blocks publishing anything "pending".                                                                                                           |
| P3  | LGPD legal basis for aggregate analytics (legitimate interest vs consent); is a formal _encarregado_ (data protection officer) needed? | §13, §14 | Analytics are M4.                                                                                                                                                                                                          |
| P4  | ECA Digital (Lei 15.211/2025) age policy                                                                                               | §14      | Needed before launch and before accounts (P1).                                                                                                                                                                             |
| P5  | Final domain → Capacitor appId / bundle ID                                                                                             | §9.4     | **TODO (M6+, Android):** the appId becomes permanent once published to the Play Store. Use a reverse-domain ID of the final domain with the codename, e.g. `<tld>.<domain>.lumen`. Never use the placeholder display name. |
| P6  | How should a long card fit small phones?                                                                                               | §3.2, D5 | **Measured in M2; decision needed.** See "P6 measurements" below. Today, cards that don't fit scroll inside the card with a fade cue (never clipped).                                                                      |
| P7  | How should the onboarding _purpose_ (explore / learn deeply / remember more) bias the feed?                                            | §3.1     | Collected and stored since M2, not yet used by ranking (B10).                                                                                                                                                              |

---

## Renaming the product

"CurioFeed" is a working title (§0.1). It is **only** a display name.

**Where the display name appears (change these to rename):**

1. `packages/domain/src/brand.ts` → `BRAND.name` and `BRAND.shortName`. This is the one-line rename. From it, the name flows into:
   - every UI string, through the i18n variable `{{appName}}` (`apps/web/app/i18n/index.ts`)
   - the HTML `<title>` and `apple-mobile-web-app-title` (`apps/web/app/root.tsx`)
   - the PWA manifest `name` / `short_name` (`apps/web/vite.config.ts`)
2. Documents that describe the rename: `docs/SPEC.md` (historical; leave it), this file and `WALKTHROUGH.md`.

`packages/domain/test/rename-guard.test.ts` fails if the name shows up anywhere else.

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

### P6 measurements (M2, 2026-10-25)

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

| #   | Choice                                                                                                                                                                                                                                                                                                                                                                                          | Why                                                                                                                                                                              |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | **Sample lessons are real drafts, not fixtures.** 20 concepts (5 topics × one 4-lesson trail) live in `content/lessons/` with `reviewStatus`/`publicationStatus: "draft"`, `contentLicense: "pending"`, **no claims or sources**, and `generation` metadata recording the drafting model. The app shows them with a "Prévia / Preview" chip, and the sources sheet explains they're unverified. | The founder wanted accurate, interesting sample content; the rule is never to fabricate sources. They can enter the M3 pipeline for sourcing and review.                         |
| B2  | **Content channel.** `LUMEN_PUBLIC_CONTENT_CHANNEL` = `preview` (default: published + drafts, labeled), `production` (published only: currently shows nothing, honestly) or `fixtures` (tests only). Content is bundled by a small Vite plugin into one lazy chunk; fixtures are only read in the fixtures channel. M3's `content:build` replaces the plugin.                                   | No unreviewed content can reach a production build by accident; fixtures can never reach any app build.                                                                          |
| B3  | **Dependencies added in M2:** Dexie + dexie-react-hooks (IndexedDB, §9.1), @radix-ui/react-dialog (accessible sheets, §9.1), zod in the web app, and test-only fake-indexeddb + Testing Library. **Not added:** TanStack Query (no server data yet), Zustand (React context suffices), any gesture or animation library.                                                                        | Smallest set the features need.                                                                                                                                                  |
| B4  | **The feed uses native CSS scroll snapping** (`snap-mandatory`, `snap-stop: always`), plus buttons and arrow/PageUp/PageDown/j/k keys. Only cards within 2 of the current one are fully rendered.                                                                                                                                                                                               | Native momentum and rubber-banding on iOS and Android; no gesture code to maintain.                                                                                              |
| B5  | **"Completed"** = the card stayed active for 40% of its reading time (at least 6 s), or its quiz was finished. **"Opened"** = it became the active card.                                                                                                                                                                                                                                        | §10.4 asks for a documented, conservative threshold.                                                                                                                             |
| B6  | **Review queue:** a lesson quiz's _first_ answer enters the queue whether right or wrong (wrong → retry tomorrow, per §3.4's wrong-answer rule); retries don't. Due-ness compares calendar dates in the learner's time zone. A correct answer before the due date is "practice" and doesn't advance the streak. "Mastered" = 3 consecutive correct reviews (1 → 3 → 7 days).                    | §3.4 says correct answers enter the queue; including wrong first answers gives them their next-day retry. Easy to change in `ProgressStore.answer`.                              |
| B7  | **Ranking (§6):** only the next unseen lesson of each trail is a candidate, so trails are always in order; every 4th slot goes to a topic outside the learner's interests; reasons shown are "Because you chose X", "Continues your trail" or "Something new". Interest and mute changes apply from the next session, so cards never jump mid-session (said in the UI).                         | Matches §6, with deterministic per-session order.                                                                                                                                |
| B8  | **Not on the card yet:** _Share_ and _More_ (sharing needs the prerendered lesson pages of M4), and _Report issue_ (no contact channel configured). _Export/import_ is shown in Settings as plain text ("coming soon", M5), not as a dead button.                                                                                                                                               | No dead controls (§0.5).                                                                                                                                                         |
| B9  | The **"show lessons in other language"** preference isn't exposed: every sample lesson exists in both languages, so the toggle would do nothing. The card still labels a lesson shown in the other language.                                                                                                                                                                                    | No controls without effect.                                                                                                                                                      |
| B10 | The onboarding **purpose** is stored but not yet used by ranking (P7).                                                                                                                                                                                                                                                                                                                          | Needs a product decision on what each purpose should change.                                                                                                                     |
| B11 | **Card layout:** the hero illustration flexes to fill whatever space the text doesn't need (46–200px; 320px on desktop) and hides itself when too short to draw. Type tightens slightly below 880px of height and again at 700px or less. Text that still doesn't fit scrolls inside the card with a fade cue, and at the end, scrolling continues to the next card.                            | Measured with Playwright across devices (see P6).                                                                                                                                |
| B12 | **Desktop (≥ 1024px):** a sidebar with the five tabs; the feed is centered at 500px with up/down buttons on its left; a side rail (≥ 1280px) shows the current trail with progress and related lessons. Sheets become centered dialogs.                                                                                                                                                         | §3.2 / §8 desktop layout.                                                                                                                                                        |
| B13 | **Original illustrations:** one SVG scene per lesson (20) in a shared flat style using the mint/aqua/teal palette plus topic accents; they're theme-aware. `heroMedia.license: "original"`.                                                                                                                                                                                                     | §8 visual direction; no third-party assets.                                                                                                                                      |
| B14 | **Progress dashboard:** shows counts only from real events, immediate vs delayed (≥ 3 days) accuracy with sample sizes, "active days in the last 7" instead of a streak (no guilt), and renders nothing until data has loaded, so it never flashes false zeros.                                                                                                                                 | §3.6 "no invented metrics".                                                                                                                                                      |
| B15 | **Storage failures** (blocked IndexedDB) keep the app usable with a banner saying progress won't be saved; an **offline** banner appears when the device goes offline.                                                                                                                                                                                                                          | §12 friendly states.                                                                                                                                                             |
| B16 | The feed sets `data-ready` once its swipe/keyboard handlers are attached; E2E tests wait for it instead of sleeping.                                                                                                                                                                                                                                                                            | Removed a flaky race found during testing.                                                                                                                                       |
| B17 | **Dedicated local ports:** dev server `5273`, preview `4273`, both `strictPort` (fail loudly if taken).                                                                                                                                                                                                                                                                                         | Vite's default 5173 was already used by another local project; on macOS, `localhost` resolved to that other app while ours listened on the same port number on other interfaces. |
