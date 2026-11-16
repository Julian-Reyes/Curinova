# Curinova

**Live prototype: https://curinova.julianreyes.dev**

**A free, ad-free microlearning app.** Swipe through short, verifiable ideas in Brazilian Portuguese and English, test yourself with one-tap quizzes, and keep what you learn with spaced review. _Scroll with curiosity. Leave with knowledge._

> **Status: pre-beta.** The app is complete for guests and live. It has **53 lessons in six topics**, each in both languages, all source-checked and human-reviewed. The public beta needs 250 lessons per language, a legal review and a cleared name. See the [release checklist](docs/RELEASE_CHECKLIST.md). "Curinova" is a working title.
>
> `lumen` is the permanent internal codename (package names, storage). See [Renaming the product](docs/DECISIONS.md#renaming-the-product).

## What it does

- **Swipe feed:** one idea per card, each under two minutes, with an original illustration and a one-line takeaway. Long cards offer "Continue reading".
- **Curiosity trails:** lessons come in connected trails (e.g. _How the Moon shapes Earth_), with "next in trail" and related ideas.
- **Sources one tap away:** every factual claim maps to a source; Go Deeper lists them with each photo's credit.
- **Quizzes and spaced review:** answers come back after 1, 3, 7, 14, 30 and 60 days. Progress tracks what you _remember days later_, not screen time.
- **No paywall, quota or streak to lose.** The feed never runs out; when reviews are due, a skippable _Time to remember_ card comes up every 20 lessons.
- **Bilingual:** Portuguese (default) and English, auto-detected and switchable; progress carries across languages.
- **Private by design:** no account. Progress stays on your device (IndexedDB) and nothing is sent to a server.
- **Installable PWA:** opens offline after one visit, with the first lessons' photos saved in the background (up to 3 MB); read-aloud uses your device's voices; light and dark themes; reduced-motion support.
- **Shareable lessons:** every published lesson has its own fast, plain web page in each language, with a link preview and a story image for Instagram and WhatsApp.

## Try it locally

Requirements: **Node 24.22.1 or newer** (`nvm use` reads `.nvmrc`) and **pnpm 10** via Corepack. No accounts, API keys or paid services are needed.

```bash
corepack enable
pnpm install
pnpm dev        # http://localhost:5273
```

**On your phone:** use the same Wi-Fi and open the "Network" address `pnpm dev` prints (e.g. `http://192.168.1.20:5273`). Offline mode and installing to the Home Screen need `localhost` or https.

## Commands

| Command                 | What it does                                                         |
| ----------------------- | -------------------------------------------------------------------- |
| `pnpm dev`              | Run the app with hot reload (port 5273)                              |
| `pnpm typecheck`        | TypeScript in every package                                          |
| `pnpm lint`             | ESLint + Prettier check                                              |
| `pnpm test`             | Unit and component tests (Vitest)                                    |
| `pnpm content:validate` | Check every content file (`--verbose` lists all warnings)            |
| `pnpm build`            | Production build (prerender + service worker)                        |
| `pnpm preview`          | Serve the production build (port 4273)                               |
| `pnpm test:e2e`         | Playwright tests at phone and desktop sizes (run `pnpm build` first) |
| `pnpm perf`             | Timing check on a throttled mid-range phone (run `pnpm build` first) |
| `pnpm content:stats`    | Lessons per topic and their review state                             |

The build fails if the app's code, stylesheets or a public page grow past their size budgets (`apps/web/budgets.ts`). The content tools (writing, checking and reviewing lessons) are described in [docs/CONTENT_PIPELINE.md](docs/CONTENT_PIPELINE.md).

CI (`.github/workflows/ci.yml`) runs the typecheck, lint, tests, content validation, build and Playwright tests on every push and pull request, and reports the timing check in the run summary without failing on it. Pushes to `main` that pass everything are deployed to GitHub Pages with only reviewed, published lessons ([docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)).

## Repository layout

```text
apps/web/                 React Router 7 app (PWA)
packages/domain/          schemas, types, pure logic (review schedule, feed ranking, stats)
tools/content-pipeline/   content tooling: validate, build, sources, review, images
content/                  topics, trails, lessons, sources; fixtures/ is test-only
docs/                     spec, decisions, implementation status
```

**Stack:** React 19, React Router 7, TypeScript (strict), Vite, Tailwind CSS 4, i18next, Zod, Dexie (IndexedDB), vite-plugin-pwa, Vitest, Playwright.

## Content and trust

Every factual claim in a published lesson must map to a real source excerpt, with high-stakes claims requiring two independent sources. `content:validate` enforces this. Nothing is published without human review in the dev-only review tool (`/_review`), and the live site shows only published lessons.

## Documentation

- [Product spec](docs/SPEC.md)
- [Decisions and deviations](docs/DECISIONS.md)
- [Implementation status](docs/IMPLEMENTATION_STATUS.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Release checklist](docs/RELEASE_CHECKLIST.md)
- [Content pipeline](docs/CONTENT_PIPELINE.md)
- [Plain-English walkthrough](WALKTHROUGH.md)
- [Rules for coding agents](CLAUDE.md)

## License

No license has been chosen for the code yet, so all rights are reserved for now. Lesson text is all rights reserved (D21 in [DECISIONS.md](docs/DECISIONS.md)).
