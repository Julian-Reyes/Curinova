# Curinova

**Live prototype: https://curinova.julianreyes.dev**

**A free, ad-free microlearning app.** Swipe through short, verifiable ideas in Brazilian Portuguese and English, test yourself with one-tap quizzes, and keep what you learn with spaced review. _Scroll with curiosity. Leave with knowledge._

> **Status: prototype.** The app is fully usable, but its 20 sample lessons are **unreviewed drafts**. They stick to well-established facts, but have not yet been through source checking or human review, and they're labeled "Preview" in the app. "Curinova" is a working title.
>
> `lumen` is the permanent internal codename (package names, storage). See [Renaming the product](docs/DECISIONS.md#renaming-the-product).

## What it does

- **Swipe feed:** one idea per card, each under two minutes, with an original illustration and a one-line takeaway. Long cards offer "Continue reading".
- **Curiosity trails:** lessons come in connected trails (e.g. _How the Moon shapes Earth_), with "next in trail" and related ideas.
- **Quizzes and spaced review:** answers come back after 1, 3, 7, 14, 30 and 60 days. Progress tracks what you _remember days later_, not screen time.
- **Finite sessions:** a gentle pause after 5 cards (configurable). Never a paywall, quota or streak to lose.
- **Bilingual:** Portuguese (default) and English, auto-detected and switchable; progress carries across languages.
- **Private by design:** no account. Progress stays on your device (IndexedDB) and nothing is sent to a server.
- **Installable PWA:** works offline once loaded; read-aloud uses your device's voices; light and dark themes; reduced-motion support.

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

CI (`.github/workflows/ci.yml`) runs the typecheck, lint, tests, content validation, build and Playwright tests on every push and pull request. Pushes to `main` that pass everything are deployed to GitHub Pages ([docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)).

## Repository layout

```text
apps/web/                 React Router 7 app (PWA)
packages/domain/          schemas, types, pure logic (review schedule, feed ranking, stats)
tools/content-pipeline/   content tooling (content:validate)
content/                  topics, trails, lessons, sources; fixtures/ is test-only
docs/                     spec, decisions, implementation status
```

**Stack:** React 19, React Router 7, TypeScript (strict), Vite, Tailwind CSS 4, i18next, Zod, Dexie (IndexedDB), vite-plugin-pwa, Vitest, Playwright.

## Content and trust

Every factual claim in a published lesson must map to a real source excerpt, with high-stakes claims requiring two independent sources. `content:validate` enforces this. Nothing is published without human review. The sample lessons are drafts awaiting that process (milestone M3).

## Documentation

- [Product spec](docs/SPEC.md)
- [Decisions and deviations](docs/DECISIONS.md)
- [Implementation status](docs/IMPLEMENTATION_STATUS.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Plain-English walkthrough](WALKTHROUGH.md)
- [Rules for coding agents](CLAUDE.md)

## License

No license has been chosen yet, so all rights are reserved for now. The license for lesson text is a pending decision (see P2 in [DECISIONS.md](docs/DECISIONS.md)).
