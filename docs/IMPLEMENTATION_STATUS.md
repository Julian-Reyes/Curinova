# Implementation status

Last updated: 2026-10-23.

| Milestone                            | Status              |
| ------------------------------------ | ------------------- |
| **M1 — Foundation**                  | ✅ Done (see below) |
| M2 — Guest MVP slice                 | In progress         |
| M3 — Content pipeline tooling        | Not started         |
| M4 — Public web and growth surface   | Not started         |
| M5 — Offline, polish, beta readiness | Not started         |

## M1 — Foundation

| Item (§20 M1)                                                           | Where                                                            | Status                                         |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------- |
| pnpm monorepo, strict TypeScript, Node 24                               | root `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json` | ✅                                             |
| Scripts: dev, typecheck, lint, test, build, content:validate, test:e2e  | root `package.json`                                              | ✅                                             |
| CI (install, typecheck, lint, test, content:validate, build, e2e smoke) | `.github/workflows/ci.yml`                                       | ✅ written; not yet run (no remote, D3)        |
| Zod schemas + types for all §10 entities                                | `packages/domain/src/schemas/`                                   | ✅                                             |
| `content:validate` with every §5.7 check                                | `tools/content-pipeline/src/validate/`                           | ✅ 45 unit tests, one or more per failure mode |
| Fixtures: 2 topics × 1 trail × 4 concepts, both locales                 | `content/fixtures/`                                              | ✅                                             |
| i18next pt-BR (default) + en, browser detection, completeness test      | `apps/web/app/i18n/`                                             | ✅                                             |
| Design tokens (light + dark), contrast test                             | `apps/web/app/styles/`                                           | ✅                                             |
| Fonts with Portuguese diacritics                                        | Fraunces + Inter via Fontsource                                  | ✅                                             |
| PWA shell (manifest, icons, service worker, update prompt)              | `apps/web`                                                       | ✅ installable (E2E-verified)                  |
| Rename guard for the placeholder name                                   | `packages/domain/test/rename-guard.test.ts`                      | ✅                                             |
| Playwright smoke at iPhone / Android / desktop sizes, both locales      | `apps/web/e2e/`                                                  | ✅ (local runs use Chrome; see A9)             |

### Known limitations (M1)

- CI has not run on GitHub yet (no remote by decision D3).
- Local E2E emulates iPhone in Chrome; real WebKit runs only in CI (A9).
- `content:check-links` is M3 (D9).
