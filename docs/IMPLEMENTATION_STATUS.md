# Implementation status

Last updated: 2026-10-26.

| Milestone                            | Status              |
| ------------------------------------ | ------------------- |
| **M1 — Foundation**                  | ✅ Done (see below) |
| M2 — Guest MVP slice                 | In progress         |
| M3 — Content pipeline tooling        | Not started         |
| M4 — Public web and growth surface   | Not started         |
| M5 — Offline, polish, beta readiness | Not started         |

## M1 — Foundation

| Item (§20 M1)                                                                                    | Where                                                            | Status                                           |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------------------------ |
| pnpm monorepo, strict TypeScript, Node 24                                                        | root `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json` | ✅                                               |
| Scripts: dev, typecheck, lint, test, build, content:validate, test:e2e                           | root `package.json`                                              | ✅                                               |
| CI (install, typecheck, lint, test, content:validate, build, e2e smoke) + deploy to GitHub Pages | `.github/workflows/ci.yml`                                       | ✅ runs on GitHub; deploy added 2026-10-26 (D13) |
| Zod schemas + types for all §10 entities                                                         | `packages/domain/src/schemas/`                                   | ✅                                               |
| `content:validate` with every §5.7 check                                                         | `tools/content-pipeline/src/validate/`                           | ✅ 45 unit tests, one or more per failure mode   |
| Fixtures: 2 topics × 1 trail × 4 concepts, both locales                                          | `content/fixtures/`                                              | ✅                                               |
| i18next pt-BR (default) + en, browser detection, completeness test                               | `apps/web/app/i18n/`                                             | ✅                                               |
| Design tokens (light + dark), contrast test                                                      | `apps/web/app/styles/`                                           | ✅                                               |
| Fonts with Portuguese diacritics                                                                 | Fraunces + Inter via Fontsource                                  | ✅                                               |
| PWA shell (manifest, icons, service worker, update prompt)                                       | `apps/web`                                                       | ✅ installable (E2E-verified)                    |
| Rename guard for the placeholder name                                                            | `packages/domain/test/rename-guard.test.ts`                      | ✅                                               |
| Playwright smoke at iPhone / Android / desktop sizes, both locales                               | `apps/web/e2e/`                                                  | ✅ (local runs use Chrome; see A9)               |

### Known limitations (M1)

- CI runs on GitHub. The first run hung downloading WebKit libraries; E2E now runs in Playwright's Docker image (B22).
- Local E2E emulates iPhone in Chrome; real WebKit runs only in CI (A9).
- `content:check-links` is M3 (D9).

## M2 — Guest MVP slice (interactive prototype)

| Item (§20 M2 + founder's Stage 2 list)                                                                                                  | Where                                                | Status                                        |
| --------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------- |
| Onboarding: language, interests, purpose, session size, theme; skippable; no sign-up or permissions (§3.1)                              | `routes/welcome.tsx`                                 | ✅                                            |
| Vertical swipe feed with buttons and keyboard; lazy rendering; position kept across tabs and trails (§3.2)                              | `features/feed/FeedView.tsx`, `routes/discover.tsx`  | ✅                                            |
| Lesson card: topic, trail step, reason, reading time, session progress, illustration, takeaway, actions (§3.2)                          | `features/feed/LessonCard.tsx`                       | ✅ (Share/More/Report: B8)                    |
| Go deeper sheet with related lessons + reasons and "continue this trail"                                                                | `features/feed/LessonSheets.tsx`                     | ✅                                            |
| Sources sheet (honest draft notice; real sources when present)                                                                          | same                                                 | ✅                                            |
| Quizzes: shuffled options, one-tap answer, explanation + misconception, screen-reader announcements (§3.3)                              | `components/QuizRunner.tsx`                          | ✅                                            |
| Spaced review as a pure function; Review tab with Due now, Review 5, Recently learned, Mastered (§3.4)                                  | `packages/domain/src/review.ts`, `routes/review.tsx` | ✅                                            |
| Explore: accent-insensitive search, topic grid, topic pages with trails first, follow/mute, filters (§3.5)                              | `routes/explore.tsx`, `routes/topic.tsx`             | ✅ (no "Newest": drafts have no publish date) |
| Library: Saved / History / Completed (§3.5)                                                                                             | `routes/library.tsx`                                 | ✅                                            |
| Progress dashboard (§3.6)                                                                                                               | `routes/you.tsx`, `packages/domain/src/stats.ts`     | ✅                                            |
| Text-to-speech with locale-matched voices and honest fallback (§3.7)                                                                    | `hooks/useSpeech.ts`                                 | ✅                                            |
| Finite sessions with soft stop; unlimited always available (§3.8)                                                                       | `features/feed/Slides.tsx`, `session.tsx`            | ✅                                            |
| Trails-lite: trail mode with exit back to the same feed position (§3.9)                                                                 | `routes/trail.tsx`                                   | ✅                                            |
| Cluster-aware ranking as a tested pure function (§6)                                                                                    | `packages/domain/src/feed.ts`                        | ✅                                            |
| `StaticContentRepository` / `IndexedDbProgressRepository` equivalents (§9.7)                                                            | `data/library.ts`, `data/progress.ts`                | ✅                                            |
| Settings: language, theme, reduced motion, session size, interests, muted topics, audio speed, review opt-in, delete data, replay intro | `routes/settings.tsx`                                | ✅ (export/import: M5)                        |
| Light/dark, desktop layout, motion with reduced-motion support                                                                          | `styles/`, `routes/tabs-layout.tsx`                  | ✅                                            |
| 20 sample lessons, 5 topics, both locales (drafts, unverified, labeled)                                                                 | `content/`                                           | ✅ (B1)                                       |
| Unit, component and E2E tests                                                                                                           | see below                                            | ✅                                            |

### Tests (2026-10-26, Node 24.22.1)

- `pnpm test`: 165 passed. Domain (review intervals, time-zone/day-boundary cases, ranking, stats), validator (45), web (storage, library/search/locale fallback, voice matching, completion threshold, QuizRunner component, i18n completeness, every used key exists, WCAG contrast), placeholder-name guard.
- `pnpm test:e2e`: 45 passed, 10 skipped (device-specific checks on other devices), across iPhone 13, iPhone SE, mid-range Android and desktop. Covers §16 E2E scenarios 1, 2, 3, 4, 5, 8 and 9, installability, tap-to-expand, "Continue reading", banner layout, saving over plain http, and the "Remember more" review card.

### Known limitations and open items (M2)

- In a mobile _browser_ (not installed), most cards show "Continue reading" because the browser's toolbars take about 190px of height (see D11 measurements).
- Local E2E uses Chrome emulating iPhones (A9); real WebKit runs in CI.
- Deployment: the live site (domain and setup in docs/DEPLOYMENT.md) goes live once GitHub Pages and DNS are configured.
- Sample lessons are unverified drafts with no sources (B1); the production channel shows no lessons until M3 review publishes some.
- §16 E2E 6 (offline), 7 (prerendered pages), 10 (axe) belong to M4/M5.

### Deferred to later milestones

- M3: content pipeline, review tool, `content:check-links`, `content:build`, sourcing and reviewing the sample drafts.
- M4: prerendered lesson/topic/trail pages, OG images, sharing, legal pages, analytics.
- M5: starter-pack offline caching, export/import (needed before any domain move, D13), axe checks, performance budgets. Basic deployment is already live (D13).
