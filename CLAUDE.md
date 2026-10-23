# Working on this repository

Conventions every coding run must follow. The product spec is `docs/SPEC.md`; "§" means a section of it.

## Before you start

1. Read `docs/SPEC.md` end to end, then `docs/DECISIONS.md` (approved decisions override the spec) and `docs/IMPLEMENTATION_STATUS.md`.
2. **Plan first, then stop.** For each milestone (§20), present a plan (structure, libraries, deviations, questions, build order) and wait for explicit approval before creating files, installing packages or committing.
3. **One milestone per run** unless the founder explicitly asks for more.
4. If something during the build would change the approved plan (a new dependency, a structural change, a spec deviation), stop and ask. Small implementation details inside the plan don't need approval.
5. Record every approved decision and deviation in `docs/DECISIONS.md`, and update `docs/IMPLEMENTATION_STATUS.md` and `WALKTHROUGH.md` as you go.

## The product name is a placeholder

- The display name lives **only** in `packages/domain/src/brand.ts`. UI strings use the `{{appName}}` i18n variable. A test (`packages/domain/test/rename-guard.test.ts`) fails if the name appears anywhere else (except `docs/SPEC.md`, `docs/DECISIONS.md`, `WALKTHROUGH.md`).
- Everything that is painful to rename uses the permanent codename **`lumen`**: package scope `@lumen/*`, the IndexedDB name, localStorage keys, service-worker cache IDs, env var prefix `LUMEN_PUBLIC_`, CI job names, and any future Capacitor appId or Docker image. See `apps/web/app/platform/storage-keys.ts`. **Never rename these**: doing so silently wipes guest progress.

## Non-negotiables

- **i18n from day one.** No hard-coded user-facing strings (ESLint `i18next/no-literal-string` enforces it in `apps/web/app`). pt-BR is the default; en must be complete. `apps/web/app/i18n/completeness.test.ts` fails the build on a missing key.
- **No fabricated content.** The coding agent never invents sources, citations, URLs or excerpts. Fixtures live in `content/fixtures/`, are marked `"fixture": true`, use `FIXTURE`-prefixed text and `.invalid` URLs, and never reach production. Sample lessons are unreviewed drafts with no sources until the content pipeline (M3) and human review add them.
- **Guest-first.** Every learning feature works with no account and no backend. Progress is keyed by `conceptId` / `questionGroupId`, never by locale variant.
- **Near-zero running cost.** No paid APIs or services are required to run, develop or test the app.
- **Keep it green.** `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm content:validate` and `pnpm build` must pass before every commit.
- **Production quality.** Real error handling; every visible control works, is intentionally disabled, or is clearly marked "not yet available". No TODOs pretending to be features.

## Commands

```bash
pnpm install            # Node 24 (see .nvmrc); pnpm comes from Corepack
pnpm dev                # app at http://localhost:5173 (also on your LAN)
pnpm typecheck && pnpm lint && pnpm test
pnpm content:validate   # add --verbose to list every warning
pnpm build && pnpm preview
pnpm test:e2e           # Playwright; needs a build first
```

## Git

- Local repository, `main` branch. Commit in small, logical steps with clear messages.
- **Never push or add a remote without the founder's approval.**
