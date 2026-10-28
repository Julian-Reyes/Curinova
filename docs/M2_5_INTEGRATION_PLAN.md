# M2.5 — Integration plan: Concept E into the app

Status: **decisions approved (D15). All nine steps built on 2026-10-28; awaiting the founder's phone sign-off and approval to merge.** Results of the review pass are in §7. Nothing in `apps/`, `packages/` or `content/` changes until it is approved. Builds on `docs/M2_5_UX_OVERHAUL.md` (audit, §4 component table, §6 acceptance criteria) and D14 (Concept E chosen).

The prototype (`experiments/m2-5/concept-e.html`) is the visual and interaction reference. It is **not** ported as code: its state, storage, review schedule and copy are prototype shortcuts. The React app keeps its architecture and gets E's look and flows.

---

## 1. What stays exactly as it is

- Routes (`app/discover`, `app/trail/:slug`, `app/explore`, `app/topic/:slug`, `app/review`, `app/library`, `app/you`, `app/settings`, `app/welcome`).
- Data layer: `data/library.ts`, `data/progress.ts`, the IndexedDB database `lumen` and its schema, `STORAGE_KEYS` (`lumen.theme`, `lumen.locale`, `lumen.motion`). **No new storage keys; no prototype keys (`designlab.*`) ever reach the app.** Guest progress survives the update untouched.
- The review schedule in `packages/domain/src/review.ts` (§3.4: 1, 3, 7, 14, 30, 60 days; mastery from delayed reviews). The prototype's shorter 1/3/7 schedule and "reviewable immediately" shortcut are **not** ported.
- Ranking (`feed.ts`), D12 purpose bias, sessions and soft stop (§3.8), i18n setup, speech (`useSpeech`), the Radix dialogs and their focus handling.
- Lesson text. No lesson is rewritten or added in M2.5; the only addition is the approved Discover card text (`cardText`, D15/P8, `docs/M2_5_CARD_TEXT.md`).

## 2. Decisions (approved in D15; the founder's answers override the recommendations below)

| #   | Decision                                             | Options                                                                                                                                                                                                                                                      | Recommendation                                                                                                                                                                                                                                                                                                                               |
| --- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P8  | What the Discover card says (open since the audit)   | (a) `summary` only (14–24 words, the answer) under the title; (b) `hook` + `summary` (23–40 words); (c) a new authored `lead` field (30–60 words) in M3. The prototype's four hand-condensed texts are not in the content and can't be used.                 | **(a) now, (c) in M3.** E's card is title + answer; (a) matches it with no new writing, and fits every size without "Continue reading" (retires D11 for the feed). The full text, hook and takeaway move to Go Deeper.                                                                                                                       |
| P10 | Lesson images in the content format                  | Today a lesson has one `heroMedia`: an original SVG, or a third-party `image` that requires creator, license and a source URL (§5.6). Generated artwork has no source URL, and E needs three images per lesson (Discover 9:16, Go Deeper 12:7, Review 16:9). | Add an optional concept-level `media` block with `discover` / `deeper` / `review` slots and a new `artwork` kind (file, creator or tool, license, created date, accuracy reviewer), with alt text per locale in the variant. The SVG stays as the fallback and diagram. Validator checks every field. Spec deviation → record as a decision. |
| P11 | Image rights policy                                  | Every supplied image is currently "Rights to be confirmed".                                                                                                                                                                                                  | Only images with a recorded origin ship: generated (tool + account + date), owned/commissioned, or open-licensed with creator and source URL. Each passes an accuracy review (M3 human review). Credits page lists them (§14, M4).                                                                                                           |
| P12 | How Review asks                                      | (a) The app's way: answer the lesson's multiple-choice question (objective; feeds the schedule as today). (b) The prototype's way: think, reveal the answer, mark "remembered / not yet" (self-graded).                                                      | **(a) in E's layout**: question-first card with the review image, options below, then the answer and why. Keeps §3.4's "correctly answered questions" and the tested scheduling.                                                                                                                                                             |
| P13 | Fonts                                                | E uses Inter Tight for display type and Inter for text; the app has Fraunces + Inter (D10).                                                                                                                                                                  | Add `@fontsource-variable/inter-tight` (SIL OFL, Portuguese diacritics, self-hosted). Keep Fraunces only if a screen still uses it after the pass; otherwise remove it. **New dependency → approval.**                                                                                                                                       |
| P14 | Image processing tool                                | (a) `sharp` as a dev dependency (standard, fast, free). (b) Reuse the prototype's approach (Playwright + headless Chrome canvas), no new dependency.                                                                                                         | **(a) `sharp`**: deterministic, runs in CI, no browser needed. **New dev dependency → approval.**                                                                                                                                                                                                                                            |
| P15 | Offline images                                       | Images are WebP; the service worker precaches only `js, css, html, svg, png, ico, woff2, webmanifest`. Precaching all lesson images would add several MB to install.                                                                                         | Runtime cache (cache-first, capped, same `lumen` cache ID) for `/media/`; the diagram shows if an image isn't cached offline. Full offline packs stay in M5. This is a small, deliberate service-worker change.                                                                                                                              |
| —   | Completion rule (open from the audit, `tracking.ts`) | With a short card, "40% of the full text's reading time" no longer fits.                                                                                                                                                                                     | Completed = card on screen ≥ 6 s, **or** Go Deeper open ≥ 40% of its reading time, **or** quiz finished.                                                                                                                                                                                                                                     |

## 3. Screen by screen

| Area         | App files                                                                     | Change                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------ | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Foundations  | `styles/tokens.css`, `tokens.test.ts`, `components/icons.tsx`                 | E's tokens: always-dark Discover surface, light/dark "paper" for the tabs, topic accents (`--tc` on dark, `--tl` on light, `--tbg`), type scale, radii, shadows. Contrast tests for text over the image scrim and over every topic tint.                                                                                                                                                     |
| Lesson art   | new `components/LessonArt.tsx`; `Illustration.tsx` kept                       | One component per slot (`discover` / `deeper` / `review` / `thumb`): responsive `srcset`, lazy loading (current card eager, next one preloaded), alt text from the variant, credit button. Falls back to the lesson's diagram on a topic-tinted card (as in the prototype's trails).                                                                                                         |
| Discover     | `features/feed/LessonCard.tsx`, `FeedView.tsx`, `Slides.tsx`, `discover.tsx`  | Full-bleed art and scrim; header with wordmark and segmented session progress; topic chip + trail step; title; card text (P8: `cardText`, falling back to `summary`); white **Dive in**; right rail Save / Listen / Quiz; tap anywhere on the card opens Go Deeper (B18 kept). Overflow / "Continue reading" logic removed. Soft stop and end card restyled. `FeedView` mechanics unchanged. |
| Go Deeper    | `features/feed/LessonSheets.tsx` (`DeeperSheet`, `QuizSheet`, `SourcesSheet`) | E's sheet: hero image with credit, The big picture, tinted Key takeaways card, How it works with an expandable diagram, deep-dive sections, quiz at the end, sources (honest draft notice), related lessons, next in trail; sticky Review / Continue trail footer; drag to dismiss.                                                                                                          |
| Review       | `routes/review.tsx`, `components/QuizRunner.tsx`                              | E's question-first card (P12): `n / total`, topic, question, review image (or topic icon), options, answer and why. Due now / Recently learned / Mastered / Review 5 kept, restyled.                                                                                                                                                                                                         |
| Explore      | `routes/explore.tsx`, `routes/topic.tsx`, `components/LessonRow.tsx`          | Search; image topic tiles with progress; topic page with image hero, Follow, trails first, and tall Discover-style lesson cards (image across, title below).                                                                                                                                                                                                                                 |
| Trails       | `routes/trail.tsx`                                                            | Trail plays as Discover cards (the existing trail mode, restyled) with the trail-name pill and ×. Exit returns to where it was started: the topic page, or the same feed position (today's behaviour). End card: Review this trail / Back.                                                                                                                                                   |
| Library, You | `routes/library.tsx`, `routes/you.tsx`, `routes/settings.tsx`                 | E's paper styling; You gets the stat tiles, recall rate with sample size, 7-day activity and progress by topic (from `stats.ts`, real data only). Settings keeps every M2 option, restyled; You links to it.                                                                                                                                                                                 |
| Shell        | `components/BottomNav.tsx`, `tabs-layout.tsx`, `welcome.tsx`, `FeedRail.tsx`  | Dark nav over Discover, paper nav elsewhere, Review badge. Welcome shows a live E card. Desktop: centred phone-width feed with the rail restyled.                                                                                                                                                                                                                                            |
| Content      | `packages/domain` schemas, `tools/content-pipeline` validator, `content/`     | P10 `media` block and checks; images stored as processed WebP in `apps/web/public/media/<concept>/` (originals stay outside the repo); P14 script.                                                                                                                                                                                                                                           |
| i18n         | `i18n/locales/{pt-BR,en}.json`                                                | Every new string in both locales (Dive in, The big picture, Key takeaways, How it works, Reveal / answer labels, trail end card, image credit). Completeness test covers them.                                                                                                                                                                                                               |

## 4. Build order

Each step ends with `typecheck`, `lint`, `test`, `content:validate`, `build` and `test:e2e` passing, plus screenshots at 393×852, 375×667, 360×800 and desktop in both languages. One commit or more per step on `feature/m2-5-ux-overhaul`; nothing is merged or pushed without approval.

1. **Record decisions** (§2) in `docs/DECISIONS.md`; spec deviations noted.
2. **Foundations**: fonts (P13), tokens, icons, contrast tests.
3. **Media**: schema + validator (P10), processing script (P14), `LessonArt` with diagram fallback, service-worker rule (P15). The four lessons with approved images get them; the others use diagrams.
4. **Discover card + feed chrome** (P8, completion rule). E2E: card shows art, title and answer completely at every size; tap/Dive in opens Go Deeper; position kept.
5. **Go Deeper** sheet.
6. **Review** (P12).
7. **Explore, topic pages, trails.**
8. **Library, You, Settings, nav, welcome, desktop.**
9. **Review pass**: re-run the D11 measurement table, accessibility checklist (contrast, 44 px targets, labels, `lang`, reduced motion, screen-reader order), performance (image weight per card, first card in under ~150 KB on mobile), founder phone sign-off in Safari and installed. Update `IMPLEMENTATION_STATUS.md` and `WALKTHROUGH.md`.

Estimated size: steps 2–5 are one focused run; 6–9 a second.

## 5. Acceptance (in addition to `M2_5_UX_OVERHAUL.md` §6)

- [ ] An existing guest's progress, saves, history, reviews, theme and language are intact after the update (E2E seeds M2-era IndexedDB data and checks it).
- [ ] A lesson without images looks finished (diagram card), never broken or empty.
- [ ] Every shipped image has a complete `media` record that passes the validator (P10, P11), alt text in both languages, and appears in the image credit.
- [ ] Offline: a previously opened lesson still renders (image or diagram) with no errors.
- [ ] No prototype code, keys or copy in `apps/`; `experiments/m2-5/` stays discardable.

## 6. Out of scope

New or rewritten lessons; the M3 pipeline (sources, human review); generating images; Credits page and OG images (M4); offline packs and export (M5); merging to `main` (separate approval).

## 7. Review pass results (step 9, 2026-10-28)

**Discover card fit** (re-run of the D11 measurement, trail mode, which has the taller header): title, card text and Dive in fully on screen, text clear of the action rail, copy below the header.

| Screen                      | pt-BR | en    |
| --------------------------- | ----- | ----- |
| iPhone 13/14 (390×844)      | 20/20 | 20/20 |
| iPhone SE (375×667)         | 20/20 | 20/20 |
| Mid-range Android (360×800) | 20/20 | 20/20 |
| Desktop (1366×860)          | 20/20 | 20/20 |

Before M2.5, 3 of 20 pt-BR cards fitted on an iPhone SE (D11).

**Tap targets.** Every button and link on Welcome, Discover, Go Deeper, Explore, a topic page, a trail, Review, Library, You and Settings is at least 44×44 px, or has a 44 px tap area (the small Preview tags; each settings switch's whole row is its label). Fixed in the pass: the trail exit pill (40 px).

**Contrast.** `tokens.test.ts` checks every text colour on its background in both themes, each topic accent on the page and card, and ink, muted, right and wrong labels on each topic tint. Fixed in the pass: the success green on the Brain tint (4.48:1) and the settings switch knob in dark mode.

**Image weight.** The first Discover card loads one image: 68–141 KB at full size (phones at 3×), 41–85 KB at 2×. All under the ~150 KB budget. Lesson and topic images total 2.2 MB on disk and are cached only once seen (P15).

**Still open:** the founder's sign-off on a real phone (Safari, and installed to the home screen). Language attributes, reduced motion (no zoom or copy animation) and screen-reader order follow the existing patterns and were spot-checked, not audited with a tool; axe checks are M5.
