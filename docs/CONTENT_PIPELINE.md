# Content pipeline

How lessons go from idea to published (spec §5, D18). Two Claude Code sessions do the writing and the fact-checking; small tools do everything mechanical and checkable; the founder approves the plan and reviews every lesson. Nothing is published automatically.

```text
PLAN ──► SOURCES ──► WRITE ──► VERIFY ──► FOUNDER REVIEW ──► PUBLISH
outline   fetch &     drafts +   separate    /_review (M3       content/lessons/
approved  snapshot    claims     session     session 3)         + content:build
```

| Step                               | Who                              | Instructions / command                                                                      |
| ---------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------- |
| Plan a trail (5–8 lessons)         | Writer session, founder approves | [`content/WRITER.md`](content/WRITER.md) §1                                                 |
| Find and save sources              | Writer session                   | `pnpm content:sources refs <pt\|en> <Wikipedia title>`, `pnpm content:sources fetch <url>…` |
| Write both locales, extract claims | Writer session                   | [`content/WRITER.md`](content/WRITER.md) §3–4                                               |
| Fact-check every claim             | **A new** verifier session       | [`content/VERIFIER.md`](content/VERIFIER.md)                                                |
| Check drafts                       | Either session                   | `pnpm content:check-drafts`, `pnpm content:dedupe`                                          |
| Review and publish                 | Founder                          | `/_review` (M3 session 3)                                                                   |

## Where things live

- `content/drafts/`: drafts in the same layout as `content/` (`lessons/<key>/…`, `clusters/…`) and verifier reports in `content/drafts/verify/`. Committed on a content branch (e.g. `content/c1-moon`), never on `main`, so separate sessions (including cloud sessions) can hand work over. A draft replaces the library copy it shadows when checked; approved drafts move to `content/lessons/` and leave `content/drafts/`.
- `content/sources/<id>.json` (committed): each source's title, publisher, URL, language, access date and snapshot hash.
- `content/sources/.snapshots/<id>.txt` (**local only**, D18): the fetched article text that claims are checked against. The repository is public, so fetched text is never committed or republished. A session on another machine re-creates them by re-fetching every source: `for f in content/sources/*.json; do pnpm -s content:sources fetch "$(node -p "require('./$f').url")"; done` (a page that changed since will show up as excerpts that no longer match).

## Cloud sessions

Writer and verifier sessions often run in Claude Code cloud containers. Two things trip them up:

- **Node version.** The container's default `node` may be older than `.nvmrc`, and pnpm then refuses to run (`ERR_PNPM_UNSUPPORTED_ENGINE`). Install Node 24 with nvm and put it first on `PATH` in every shell command, since shell state does not carry over between commands: `export PATH="$(ls -d /opt/nvm/versions/node/v24*/bin):$PATH"` (after `nvm install 24` once).
- **Proxy.** Outbound HTTPS goes through a proxy that Node's built-in `fetch` ignores by default, so `content:sources` fails with `fetch failed` / `ENOTFOUND`. Set `NODE_USE_ENV_PROXY=1` for those commands. If the proxy answers 403, the environment's network policy blocks the host: the founder widens Network access in the environment settings (writer sessions need broad access, since sources come from many publishers).

## Commands

| Command                                      | What it does                                                                                                                                       |
| -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm content:sources refs <pt\|en> <title>` | Lists a Wikipedia article's external links (a pointer to real sources, §5.6).                                                                      |
| `pnpm content:sources fetch <url>…`          | Fetches pages (respecting robots.txt), keeps the readable text, saves the snapshot and the source record. Fails on non-https, paywalls and errors. |
| `pnpm content:check-drafts`                  | Validates drafts merged over the library and checks that every claim's excerpt appears in its source snapshot and none is marked unsupported.      |
| `pnpm content:dedupe`                        | Near-duplicate lessons per locale (local text similarity).                                                                                         |
| `pnpm content:check-links`                   | Re-checks every source URL (4xx/5xx, redirects to another host); results cached for 7 days in `.cache/`. `--fresh` ignores the cache.              |
| `pnpm content:validate`                      | Validates the library (CI).                                                                                                                        |
| `pnpm content:stats` / `content:due-review`  | Coverage and review backlog / published lessons past `reviewAfter`.                                                                                |
| `pnpm content:build`                         | The split content bundle the app loads (D16; runs automatically on build and in dev).                                                              |

Instruction versions: the writer records `generation.promptVersion: "write-v1"`, the verifier `verify-v1` in its report. Change the version when an instruction file changes meaningfully.
