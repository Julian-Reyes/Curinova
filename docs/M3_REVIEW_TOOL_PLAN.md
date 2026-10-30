# M3 session 3 — Review tool `/_review` (plan)

Status: **approved by the founder on 2026-10-30 (D20). Not built yet.** This is the plan a build session follows; [`CLAUDE.md`](../CLAUDE.md) still applies (stop and ask before a new dependency, a structural change or a spec deviation). Spec: §5.5 step 6, §9.5, §9.6, §20 M3. Earlier context: the M3 plan in D18.

## What it is

A page that exists only on the dev server (`pnpm dev`, `http://localhost:5273/_review`). It reads `content/drafts/` and writes reviewed lessons to `content/lessons/`. It never runs git; the founder commits the result.

### Queue screen

- Every trail in `content/drafts/clusters/` and every lesson with drafts, with: verifier verdict counts per locale, `check-drafts` errors, and each locale's state (waiting, approved, rejected).
- A lesson can be opened for review only once it passes the checks: no unsupported or pending verdicts and no `check-drafts` errors. Otherwise the queue says why.
- The median review minutes per variant (from the review log), next to the §5.5 target of 4.

### Lesson screen

- pt-BR and en side by side, each rendered with the app's real components: the Discover card (`LessonCard`), Go Deeper (`LessonSheets` content) and the quizzes (`QuizRunner`, answerable). Handlers that would touch guest progress are no-ops.
- Every claim highlighted in the text, listed with its excerpt(s), the verifier's `autoVerdict`, the source's title, publisher and link, and the surrounding text from the local snapshot (`content/sources/.snapshots/<id>.txt`, about 300 characters each side) when the snapshot exists; otherwise say it is missing and how to re-create it (`pnpm content:sources refetch`).
- The trail's verifier report (`content/drafts/verify/*-<cluster>*.md`, newest first) in a side panel as plain preformatted text (no Markdown dependency).

### Actions (keyboard first)

| Key       | Action                                                              |
| --------- | ------------------------------------------------------------------- |
| `j` / `k` | Next / previous claim                                               |
| `a`       | Approve the focused claim, or the locale when the locale is focused |
| `e`       | Edit                                                                |
| `r`       | Reject (a note is required)                                         |
| `n`       | Add a note                                                          |
| `[` / `]` | Previous / next lesson                                              |
| `?`       | Shortcut list                                                       |

Every action is also a visible button.

- **Approve a claim**: `humanVerdict: "approved"`.
- **Approve a locale** (needs every claim `approved` or `edited`): write `content/lessons/<key>/variant.<locale>.json` with `reviewStatus: "reviewed"`, `reviewedBy: "Julian"`, `reviewedAt` (now), `updatedAt`, `contentLicense: "all-rights-reserved"` (D21); write `quiz.<locale>.json` with `status: "reviewed"`; copy `concept.json`. `publicationStatus` stays `"draft"`. When both locales of a lesson are approved, delete the lesson's draft folder.
- **Edit**: the lesson's text (title, hook, summary, `cardText` if present, card paragraphs, takeaway, deep-dive blocks, quiz prompt, options, explanation, misconception) and claim wording. Excerpts, source IDs and IDs are not editable (excerpts must match the snapshot). Saving writes the draft, re-runs the checks, and sets the claims touched to `humanVerdict: "edited"`.
- **Reject**: set the variant's `reviewStatus: "rejected"`, keep it in drafts, and append the note (lesson, locale, claim if any, text) to `content/drafts/review/<YYYY-MM-DD>-<cluster>.md`. Add one line to `docs/content/WRITER.md` telling writer sessions to read and resolve those notes.
- **Publish**: a separate action per approved variant (`publicationStatus: "published"`, `publishedAt`). Refused, with the reason shown, for a variant that isn't reviewed or still has `contentLicense: "pending"` (the validator already blocks publishing `pending`).
- **The library must stay valid.** Before any write, run the content validator over the resulting library and the excerpt check over the drafts (`checkDrafts`); on any error write nothing and show the issues.
- **Trail files.** Approving a lesson of a trail writes or updates `content/clusters/<cluster>.json` from the draft, keeping only `conceptIds` already in the library (planned order kept) and only `links` to trails already in the library. When all the trail's lessons are in the library, the draft trail file is deleted.
- **Review log**: every action appends one JSON line to `content/review-log.jsonl` (committed): time, reviewer, conceptId, locale, action, claimId, note, milliseconds on the lesson screen.

### Not in this session

- Image accuracy review (`accuracyReviewedBy`) — later (founder, 2026-10-30).
- The trail-outline approval screen from the D18 plan: dropped, since outlines are approved in chat (see `docs/content/TRAILS_BATCH_2.md`).
- Re-review of published lessons (`content:due-review` already lists them).

## How it's built

- **UI:** `apps/web/app/dev/review/` (the folder §9.5 names). `routes.ts` adds `route('_review', …)` only when not building for production, so it is never in the production build; the service worker already denies `/_review`.
- **English only (founder, D20).** Founder-only tool: `apps/web/app/dev/**` is exempt from `i18next/no-literal-string` in `eslint.config.js`, and its strings are not in the locale files.
- **File access:** a dev-only Vite plugin (`configureServer`) serving JSON at `/__review/api/*`. It loads the review module with `server.ssrLoadModule`, because Vite's own config loader can't resolve the domain package's extensionless TypeScript imports (see `apps/web/content-plugin.ts`). Paths are fixed to the repository's `content/`; reject any path outside it.
- **Review operations:** pure, testable functions in `tools/content-pipeline/src/review/` (load queue, load lesson, approve claim/locale, edit, reject, publish, log), reusing `validateContent`, `checkDrafts` and the tree loader.
- **Reviewer name:** `Julian` (founder, D20), a constant in the review module.
- **No new dependencies.**

## Tests

- Review operations on temporary folders: approve writes the right files and fields and removes drafts when both locales are done; trail-file sync (partial trail, links to missing trails); a write that would break validation writes nothing; editing marks claims `edited`; reject notes and log lines are written; approve sets `contentLicense: "all-rights-reserved"`; publish is refused for an unreviewed or `pending` variant; paths outside `content/` are refused.
- Component test for the keyboard flow on the lesson screen.
- The production route list has no `/_review` (and `pnpm build` output has no review chunk).
- Dry run: a fixture trail goes from drafts to approved, and the library still validates.
- Before every commit: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm content:validate`, `pnpm build`; `pnpm test:e2e` (app code changes).

## Branch and build order

Build on `feature/m3-content-pipeline`, commit in small steps, then merge it into `content/c1-moon` so the tool can be used on the drafts. Push only with the founder's OK.

1. Review operations + tests
2. API middleware
3. Queue screen
4. Lesson screen (read-only)
5. Claim and locale actions
6. Editing
7. Docs: `docs/CONTENT_PIPELINE.md` (how to review), `docs/IMPLEMENTATION_STATUS.md`, `WALKTHROUGH.md`, and anything the build changed in D20

Stop after the build with results (test output, screenshots of both screens) for the founder.
