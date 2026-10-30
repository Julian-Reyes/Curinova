# Content pipeline

How lessons go from idea to published (spec §5, D18). Two Claude Code sessions do the writing and the fact-checking; small tools do everything mechanical and checkable; the founder approves the plan and reviews every lesson. Nothing is published automatically.

```text
PLAN ──► SOURCES ──► WRITE ──► VERIFY ──► FOUNDER REVIEW ──► PUBLISH
outline   fetch &     drafts +   separate    /_review           content/lessons/
approved  snapshot    claims     session     (dev server)       + content:build
```

| Step                               | Who                              | Instructions / command                                                                      |
| ---------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------- |
| Plan a trail (5–8 lessons)         | Writer session, founder approves | [`content/WRITER.md`](content/WRITER.md) §1                                                 |
| Find and save sources              | Writer session                   | `pnpm content:sources refs <pt\|en> <Wikipedia title>`, `pnpm content:sources fetch <url>…` |
| Write both locales, extract claims | Writer session                   | [`content/WRITER.md`](content/WRITER.md) §3–4                                               |
| Fact-check every claim             | **A new** verifier session       | [`content/VERIFIER.md`](content/VERIFIER.md)                                                |
| Check drafts                       | Either session                   | `pnpm content:check-drafts`, `pnpm content:dedupe`                                          |
| Review and publish                 | Founder                          | `/_review` on `pnpm dev` ([below](#reviewing-with-_review))                                 |

After a verifier report, the writer repairs blockers and resets changed claims to `pending`. A fresh verifier session rechecks those claims and every passage, quiz and locale that depends on them. Repeat until the verifier reports zero blockers and `content:check-drafts` passes. Editorial notes do not hold up founder review.

## Where things live

- `content/drafts/`: drafts in the same layout as `content/` (`lessons/<key>/…`, `clusters/…`) and verifier reports in `content/drafts/verify/`. Committed on a content branch (e.g. `content/c1-moon`), never on `main`, so separate sessions (including cloud sessions) can hand work over. A draft replaces the library copy it shadows when checked; approved drafts move to `content/lessons/` and leave `content/drafts/`.
- **Branches.** Trail drafts, sources and verifier reports share one content branch, `content/c1-moon` (named after the first trail; it holds every trail in progress), created from `feature/m3-content-pipeline` (later `main`). Pipeline code and docs never live only on the content branch: fix them on the feature branch and merge it into the content branch. Drafts stay there until the founder reviews each trail; publishing moves a trail's files from `content/drafts/` to `content/lessons/`, and only published content is merged back.
- `content/sources/<id>.json` (committed): each source's title, publisher, URL, language, access date and snapshot hash.
- `content/sources/.snapshots/<id>.txt` (**local only**, D18): the fetched article text that claims are checked against. The repository is public, so fetched text is never committed or republished. A session on another machine re-creates them with `pnpm content:sources refetch`, which re-fetches every committed source and leaves the curated `publisher`, `type` and `license` alone. It reports any page whose text changed since it was recorded; those show up as excerpts that no longer match.

## Reviewing with `/_review`

Start the dev server (`pnpm dev`) on the content branch and open http://localhost:5273/_review. The page exists only on the dev server, never in a build (D20). It reads `content/drafts/` and writes `content/lessons/`; it never runs git, so commit the result yourself.

1. **Snapshots first.** Excerpts are shown and checked against the local snapshots. On a new machine run `pnpm content:sources refetch` once (cloud sessions: see below). A source that can't be fetched blocks the lessons that cite it.
2. **Queue.** Each trail lists its lessons, verifier verdicts per locale and the median review minutes per variant (target ≤ 4, §5.5). A lesson opens only with no `unsupported` or `pending` verdicts and no `check-drafts` errors; otherwise the queue says why.
3. **Lesson.** pt-BR and en side by side, rendered with the app's Discover card, Go Deeper and quiz (answers aren't saved). Claims are highlighted on the sentence that best matches them. They are listed with their excerpts, the source and about 300 characters of snapshot on each side. The trail's verifier reports are in the side panel, newest first.
4. **Decide.** Keys: `j`/`k` move between claims and locale headers, `a` approves the focused claim (or the locale on its header), `e` edits, `r` rejects (note required), `n` adds a note, `[`/`]` previous/next lesson, `?` lists them. Every action is also a button.
   - **Approve a claim** sets `humanVerdict: "approved"` in the draft.
   - **Approve a locale** needs every claim approved or edited. It writes `content/lessons/<key>/variant.<locale>.json` with `reviewStatus: "reviewed"`, `reviewedBy`, `reviewedAt` and `contentLicense: "all-rights-reserved"` (D21). It also writes the quiz with `status: "reviewed"` and `concept.json`, and updates `content/clusters/<trail>.json` from the draft trail. The library's copies list only what the library already has: its locales, its trail's concepts, links to its trails and related lessons. `publicationStatus` stays `"draft"`.
   - **Drafts leave** when both locales are approved: the lesson's draft folder is removed once its related lessons are in the library too (until then its draft `concept.json` keeps the links the library can't hold yet; the queue says which). The draft trail file goes when every lesson of the trail is in the library and none has drafts left.
   - **Edit** changes text only (title, hook, summary, card text, paragraphs, takeaway, Go Deeper, claim wording, quiz text). IDs, excerpts and sources can't change. Saving re-runs the checks, marks the claims touched as `"edited"` and sends the locale back for approval.
   - **Reject** sets the draft's `reviewStatus: "rejected"` (and the claim's `humanVerdict` when a claim is focused) and appends the note to `content/drafts/review/<date>-<trail>.md`, which writer sessions resolve (`content/WRITER.md`).
   - **Publish** (queue, “Approved, not published”) publishes both locales of a lesson together (D4, D20), once both are reviewed and licensed and no draft is open.
5. **Safety.** Before writing, every action runs the content validator over the resulting library and `check-drafts` over the drafts; if the change adds any error, nothing is written and the issues are shown. Errors that already exist in other drafts don't block. Every action is appended to `content/review-log.jsonl` (time, reviewer, lesson, locale, action, claim, note, milliseconds on the lesson screen); commit it with the content.

## Cloud sessions

Writer and verifier sessions often run in Claude Code cloud containers. Two things trip them up:

- **Node version.** The container's default `node` may be older than `.nvmrc`, and pnpm then refuses to run (`ERR_PNPM_UNSUPPORTED_ENGINE`). Install Node 24 with nvm and put it first on `PATH` in every shell command, since shell state does not carry over between commands: `export PATH="$(ls -d /opt/nvm/versions/node/v24*/bin):$PATH"` (after `nvm install 24` once).
- **Proxy.** Outbound HTTPS goes through a proxy that Node's built-in `fetch` ignores by default, so `content:sources` fails with `fetch failed` / `ENOTFOUND`. Set `NODE_USE_ENV_PROXY=1` for those commands. If the proxy answers 403, the environment's network policy blocks the host: the founder widens Network access in the environment settings (writer sessions need broad access, since sources come from many publishers).

## Commands

| Command                                      | What it does                                                                                                                                                                                                        |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm content:sources refs <pt\|en> <title>` | Lists a Wikipedia article's external links (a pointer to real sources, §5.6).                                                                                                                                       |
| `pnpm content:sources fetch <url>…`          | Fetches pages (respecting robots.txt), keeps the readable text, saves the snapshot and the source record (an existing record keeps its `publisher`, `type` and `license`). Fails on non-https, paywalls and errors. |
| `pnpm content:sources refetch`               | Re-creates the snapshot of every committed source (`content/sources/*.json`) and reports pages whose text changed.                                                                                                  |
| `pnpm content:check-drafts`                  | Validates drafts merged over the library and checks that every claim's excerpt appears in its source snapshot and none is marked unsupported.                                                                       |
| `pnpm content:dedupe`                        | Near-duplicate lessons per locale (local text similarity).                                                                                                                                                          |
| `pnpm content:check-links`                   | Re-checks every source URL (4xx/5xx, redirects to another host); results cached for 7 days in `.cache/`. `--fresh` ignores the cache.                                                                               |
| `pnpm content:validate`                      | Validates the library (CI).                                                                                                                                                                                         |
| `pnpm content:stats` / `content:due-review`  | Coverage and review backlog / published lessons past `reviewAfter`.                                                                                                                                                 |
| `pnpm content:build`                         | The split content bundle the app loads (D16; runs automatically on build and in dev).                                                                                                                               |

Instruction versions: the writer records `generation.promptVersion: "write-v1"`, the verifier `verify-v2` in new reports. Older `verify-v1` reports remain a record of their original checks. Change the version when an instruction file changes meaningfully.
