# Accounts milestone: draft plan

**Status: not approved.** Drafted 2026-11-16 after M5 (D27 puts accounts next). The founder parked it until trail batch 3 is finished; nothing here is built. When work resumes, answer the open questions below, then approve or change the plan before any code (CLAUDE.md, "Plan first, then stop").

## Goal

Optional sign-in that keeps progress in sync across devices, plus the features that wait on the julianreyes.dev email (D26, D27): _Download my data_, the Privacy and Terms pages, _Report a problem_ and the More menu. Guests keep every feature and never need an account (§12).

## Architecture

**Supabase straight from the app, with no server of our own:** Supabase Auth, Postgres with row-level security (each user reads and writes only their own rows) and one Edge Function for account deletion. This fits the static host (D13) and the near-zero-cost rule (free tier). §9.3 allows Supabase in place of MongoDB.

Spec deviations to record in DECISIONS when approved:

- No Express API (§9.3, §11): the app talks to Supabase directly, protected by row-level security.
- Stats stay computed on the device from the synced events, not on a server (§11, "authoritative stats are computed server-side").
- Review schedules sync as rows, latest `lastReviewedAt` winning per lesson and question group, instead of being recomputed from merged events (§12). Today's `quiz_answered` events don't record whether the learner had reviews turned on, so a replay would rebuild the wrong schedule.

## Design

- **Guests download none of it.** `@supabase/supabase-js` (about 50 KB compressed, a new runtime dependency) loads only when someone signs in, keeping the size budget (277 of 320 KB on 2026-11-16) and first-visit speed (D28) unchanged.
- **Runs and tests without Supabase.** With `LUMEN_PUBLIC_SUPABASE_URL` / `LUMEN_PUBLIC_SUPABASE_ANON_KEY` unset, the sign-in option is hidden. Unit and E2E tests use an in-memory fake behind a small `SyncBackend` interface. The anon key is public by design; no secret goes in the bundle.
- **Sync rules (§12):**
  - Nothing is uploaded until the learner agrees ("Keep this device's progress in your account?").
  - Events merge by `eventId`, so nothing counts twice.
  - Bookmarks follow the latest explicit action.
  - Local data stays until the server confirms it; sync retries when the connection returns.
  - A small sync status shows in Settings.
- **Server tables:** progress events, bookmarks, review states and preferences, each keyed by user, with row-level security. A SQL migration lives in the repo; the project is in the São Paulo region. The founder creates the project by following a setup guide (added to DEPLOYMENT.md).
- **App changes:** a new IndexedDB version (3) to track what has synced; an Account section in Settings; a Content Security Policy that allows Supabase, which also closes the CSP gap in `docs/RELEASE_CHECKLIST.md`.
- **Deleting an account** erases the server data through the Edge Function, with an option to wipe this device too.

## Build order (one commit each)

1. _Download my data_: versioned JSON, works for guests, no backend.
2. The merge rules as pure, tested functions in `packages/domain`.
3. Supabase schema, row-level security and the setup guide.
4. Sign-in with an emailed one-time code, sign-out and the Account section, loaded only when needed.
5. The sync engine: consent prompt, upload and download, status, offline retry.
6. Account deletion (Edge Function) and the option to wipe this device.
7. Privacy and Terms pages in both languages, _Report a problem_ and the More menu.
8. E2E tests and docs.

## Open questions for the founder

1. **How people sign in:** an emailed 6-digit code only (recommended: it works inside the installed app, while magic links on iPhone open Safari instead), or also "Sign in with Google"?
2. **Email:** Supabase's built-in email sends only a few messages an hour. Suggested: Resend's free tier for sending, and Cloudflare Email Routing to forward hello@julianreyes.dev to the founder's Gmail; both free. Is Kit still wanted at this stage?
3. **Age policy (P4):** the ECA Digital legal review isn't done. Suggested: build everything but keep public sign-up switched off until it is. Alternative: a self-declared 18+ in the meantime.
4. **Free-tier pause:** Supabase pauses free projects after 7 days without traffic (Pro is $25 a month). Is the free tier acceptable for the beta?
5. **_Report a problem_:** a pre-filled email (simple), or saved to a Supabase table as the start of the §4B corrections ledger?
6. **Privacy and Terms** must name the data controller: the founder personally (which country) or a company? Which contact email should they give?
