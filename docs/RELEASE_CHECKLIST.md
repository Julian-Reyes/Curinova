# Release checklist

What still stands between the prototype and the **public beta**: the P0 release gates from SPEC §16, checked against the repository on 2026-11-16 (end of M5, D28). Decisions in `docs/DECISIONS.md` override the spec, and this list follows them.

Status: ✅ done · 🟡 partly done · ⬜ not started. Owner: **Code** (a coding run), **Content** (C1 runs and human review), **Founder**, **Legal** (counsel).

## The gates

| #   | Gate (SPEC §16)                                                                                                               | Status | What remains                                                                                                                                                                              | Owner                |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| 1   | Installable PWA runs locally and on a deployment URL                                                                          | ✅     | Live at the D13 address; installability is covered by E2E.                                                                                                                                | —                    |
| 2   | **250 reviewed lessons per locale** across 5 topics, in trails, each with 2+ quiz questions, every claim sourced; no fixtures | 🟡     | **53 of 250** per locale (106 published variants, 6 topics, 10 trails). All have exactly 2 questions and pass `content:validate`. About 197 more lessons per locale to write and review.  | Content              |
| 3   | Full pt-BR and en UI; language detection and switching work                                                                   | ✅     | Completeness test plus E2E scenarios 1 and 2.                                                                                                                                             | —                    |
| 4   | No login, trial or payment for any core feature                                                                               | ✅     | Guest-first throughout; keep it so when accounts arrive.                                                                                                                                  | —                    |
| 5   | Trails, quizzes, source sheets, review scheduling, saves and settings persist through reload                                  | ✅     | E2E scenarios 1, 3 and 5.                                                                                                                                                                 | —                    |
| 6   | Prerendered lesson pages with working previews in WhatsApp and iMessage; sitemap and hreflang valid                           | 🟡     | Pages, preview images, sitemaps and hreflang are built and checked at build time (D26). **Still to do:** paste live links into WhatsApp and iMessage on real phones.                      | Founder              |
| 7   | TTS works where supported, with correct-language voices or a clear fallback                                                   | 🟡     | Built and unit-tested. **Still to do:** listen in both languages on a real iPhone and a real Android phone.                                                                               | Founder              |
| 8   | Offline and export/import work                                                                                                | 🟡     | Offline is done (D28, E2E 6). **Export** (_Download my data_) is in the accounts milestone; **import** is deferred until before any domain move (D27, a spec deviation).                  | Code                 |
| 9   | Aggregate analytics live, with opt-out and a privacy page that matches reality                                                | 🟡     | The adapter, allowlist and opt-out rules are built, but **no provider is connected** (D26). Needs a provider and the LGPD answer (P3), then the Settings toggle and privacy text.         | Founder, Legal, Code |
| 10  | Privacy, Terms and Credits pages in both locales; legal review of LGPD and ECA Digital posture                                | 🟡     | Credits is live. **Privacy and Terms** wait for the julianreyes.dev email (accounts milestone, D27). **Legal review** of LGPD (P3) and the ECA Digital age policy (P4) not started.       | Legal, Founder       |
| 11  | README, deploy guide, `.env.example`; unit, build-check and E2E tests pass                                                    | ✅     | `README.md`, `docs/DEPLOYMENT.md` and `.env.example` exist; CI runs every check on each push.                                                                                             | —                    |
| 12  | No copied branding, UI or content; final product name chosen and cleared                                                      | 🟡     | Original content and design. **Name clearance (P1)** is open: INPI classes 9 and 41, USPTO, app stores, registro.br, .com/.app. The domain contains the name (rename steps in DECISIONS). | Founder              |

## Remaining work by owner

**Content**

- [ ] About 197 more reviewed lessons per locale (gate 2). §5.2 also asks for about 6 trails of 6–8 lessons per topic; today each topic has 1 or 2 trails of 5–6.

**Legal (with the founder)**

- [ ] LGPD: legal basis for aggregate analytics, and whether a formal _encarregado_ is needed (P3, §13–§14).
- [ ] ECA Digital (Lei 15.211/2025) age policy, before launch and before accounts (P4, §14), including the endless feed's design (D17). Record the result in DECISIONS.
- [ ] Counsel review of the Privacy and Terms pages once written (D26: plain-language versions first, revised after counsel).
- [ ] If marketing in the UK or EU: re-check consent for analytics (§14).

**Founder**

- [ ] Final name and trademark clearance (P1, gate 12). Settle the domain before real users arrive: moving it resets on-device progress unless import exists (D13, D27).
- [ ] Choose an analytics provider once P3 is answered (gate 9).
- [ ] Set up the julianreyes.dev email: it unlocks Privacy, Terms, _Report a problem_ and the More menu (D27).
- [ ] Real-phone checks: link previews in WhatsApp and iMessage (gate 6), read-aloud in both languages (gate 7), installing to the Home Screen on iPhone and Android.

**Code (the accounts milestone, D27)**

- [ ] _Download my data_ export (gate 8).
- [ ] Privacy and Terms pages, _Report a problem_ and the More menu, once the email exists (gate 10).
- [ ] Analytics Settings toggle and privacy wording, once a provider is chosen (gate 9).

## Known gaps outside the gates

- **App first-visit speed:** 4.6 s to the largest paint on the throttled phone against §15's 2.5 s; every other timing target passes. Diagnosed and parked as possibly later (D28, Speed).
- **Security headers:** §14 asks for a strict Content Security Policy. GitHub Pages cannot send custom headers, and the app sets no CSP today. Decide before launch whether a `<meta>` CSP is enough or the host should change.

## Before every release

1. `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm content:validate` and `pnpm build` pass (the build also enforces the size budgets).
2. `pnpm test:e2e` passes after the build.
3. `pnpm perf` for the timing table (the first-visit miss above is expected).
4. Push to `main` with the founder's approval; the `deploy` job publishes only reviewed lessons (D22). Check the live site once it finishes ([DEPLOYMENT.md](DEPLOYMENT.md)).
