# lumen

A free, mobile-first, bite-sized learning feed: _scroll with curiosity, leave with knowledge_. Brazilian Portuguese first, English as a first-class second language.

> The public product name is a placeholder (see `packages/domain/src/brand.ts` and `docs/DECISIONS.md` → "Renaming the product"). `lumen` is the permanent internal codename.

- Product spec: [`docs/SPEC.md`](docs/SPEC.md)
- Decisions and deviations: [`docs/DECISIONS.md`](docs/DECISIONS.md)
- Status: [`docs/IMPLEMENTATION_STATUS.md`](docs/IMPLEMENTATION_STATUS.md)
- Plain-English walkthrough: [`WALKTHROUGH.md`](WALKTHROUGH.md)
- Rules for coding agents: [`CLAUDE.md`](CLAUDE.md)

## Requirements

- Node 24 (`nvm use` reads `.nvmrc`)
- pnpm 10 via Corepack: `corepack enable`

No accounts, API keys or paid services are needed.

## Setup

```bash
corepack enable
pnpm install
pnpm dev          # http://localhost:5173 (also printed: a LAN URL for your phone)
```

## Everyday commands

| Command                 | What it does                                                                   |
| ----------------------- | ------------------------------------------------------------------------------ |
| `pnpm dev`              | Run the app with hot reload                                                    |
| `pnpm typecheck`        | TypeScript in every package                                                    |
| `pnpm lint`             | ESLint + Prettier check                                                        |
| `pnpm test`             | All unit and component tests (Vitest)                                          |
| `pnpm content:validate` | Check every content file (`--verbose` lists all warnings)                      |
| `pnpm build`            | Production build of the web app (prerender + service worker)                   |
| `pnpm preview`          | Serve the production build at http://localhost:4173                            |
| `pnpm test:e2e`         | Playwright browser tests against the production build (run `pnpm build` first) |

## Repository layout

```text
apps/web/                 React Router 7 app (PWA)
packages/domain/          schemas, types, pure logic, brand constant
tools/content-pipeline/   content tooling (content:validate today)
content/                  lessons, trails, topics, sources (fixtures/ is dev-only)
docs/                     spec, decisions, status
```
