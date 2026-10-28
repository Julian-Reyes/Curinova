# M2.5 — Product Experience Overhaul

Status: **audit and proposal, awaiting founder review** (2026-10-26). No production code has changed.
Branch: `feature/m2-5-ux-overhaul` (worktree `../learn-app-design-lab`). Nothing is merged into `main`.

M1 and M2 work. This milestone asks a different question: is the app _compelling_, something people come back to voluntarily? It sits between M2 and M3 because the card format decides what M3's content pipeline has to produce.

Contents: [Method](#method) · [Current UX weaknesses](#1-current-ux-weaknesses) · [Proposed visual directions](#2-proposed-visual-directions) · [Content presentation](#3-content-presentation-improvements) · [Component-level changes](#4-component-level-changes) · [Implementation sequence](#5-implementation-sequence) · [Acceptance criteria](#6-acceptance-criteria) · [Design Lab](#7-design-lab)

---

## Method

- Playwright screenshots of the running app (`localhost:5273`) at five sizes: iPhone SE in Safari (375×553 visible), iPhone 15 in Safari (393×660 visible), iPhone 15 full screen (393×852), mid-range Android (360×800), desktop (1366×860). Both locales for the iPhone 15 browser case. A selection is in `experiments/m2-5/audit/screenshots/`.
- Read all 20 sample lessons (title, hook, summary, card text, takeaway, deep dive, quizzes) with word counts.
- Read the feed code: `LessonCard.tsx`, `FeedView.tsx`, `LessonSheets.tsx`, `Slides.tsx`, `tracking.ts`, `Illustration.tsx`, `tokens.css`, `app.css`.
- Built three interactive prototypes (section 7) to test the proposals with real content instead of arguing in the abstract.

**The most important context:** the founder's phone is the _mobile browser_ case, and so is every first visit from a shared link. In that case (393×660), **18–19 of 20 cards show "Continue reading"** (D11), and on an iPhone SE all 20 do. The screenshots below are judged against that case, not the full-screen one.

---

## 1. Current UX weaknesses

Ordered by impact. "Evidence" points to a screenshot in `experiments/m2-5/audit/screenshots/`.

### 1.1 Visual engagement

| #   | Weakness                                                                                                                                                                                                                                                                                       | Evidence                                                         |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| V1  | **The picture disappears exactly where it matters.** The hero flexes between 46 and 200px and hides itself when there's no room (B11). In a mobile browser there is never room, so the card becomes a page of text: topic chip, title, 7–9 lines of body, fade, takeaway box, 4 buttons.       | `iphone15-browser-en-10-card1.png`, `se-browser-en-10-card1.png` |
| V2  | **Every card looks the same.** Each card is the same mint→aqua glow, white body, teal accents. The topic's own color appears only in a 20px circle behind its icon. Swiping from Space to History to Body feels like the same card with different words; there is no sense of place.           | `iphone15-full-en-10-card1.png` vs the next cards                |
| V3  | **Too much metadata above the headline.** Topic chip, reading time, session count, "Preview" chip, reason ("Something new"), and trail step ("Trail · 1 of 4") — six signals before the headline. Each is useful; together they compete with the one thing that should hook: the question.     | all card shots                                                   |
| V4  | **Illustrations read as clip art.** The 20 original scenes are drawn on a 320×160 canvas in a flat, thin-stroke style, shown small. They are pleasant on full screen but never the hero. They are also the only visual identity a card has.                                                    | `iphone15-full-en-10-card1.png`                                  |
| V5  | **The takeaway box is the loudest element.** A filled mint box with a teal bar, bold text, directly under a fade. It often repeats the paragraph above (and the lesson's summary) almost word for word, and it pulls the eye away from the headline.                                           | `iphone15-browser-en-10-card1.png`                               |
| V6  | **Chrome takes ~40% of the screen.** Four equal-weight action buttons (52px), a "Next in trail" row (44px), the bottom navigation (64px), plus the meta row: about 250px of 660px. Listen, Save, Quiz and Go deeper all have the same visual weight, so none of them is the obvious next step. | `iphone15-browser-en-10-card1.png`                               |
| V7  | **Type has no display moment.** Fraunces is a good choice for headlines, but at 22–26px on a crowded card it reads as a heading, not a hook. Body text drops to 14.5px at short heights.                                                                                                       | all card shots                                                   |
| V8  | **Motion is functional only.** The snap scroll and a small settle on the active card. No entrance for text, no feedback when saving, no transition into Go deeper beyond the sheet sliding up, and no reward moment after a quiz.                                                              | (interaction)                                                    |
| V9  | **Desktop is underused.** A 500px card floats in a wide canvas; the trail rail on the right is sparse. Fine as a fallback, not a reason to visit on a laptop.                                                                                                                                  | `desktop-en-10-card1.png`                                        |

### 1.2 Content engagement (the 20 sample lessons)

The writing itself is strong: accurate, specific, with good surprises (fallout carbon-14 dating neurons, fossil corals counting 400-day years, Tupi in "piranha" and "Ipanema"). The problems are in **what the card shows** and **where the payoff sits**.

| #   | Weakness                                                                                                                                                                                                                                                                                                                                                                             |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| C1  | **The best hooks are never shown.** Every lesson has a `hook` ("A whole onion barely smells. The tears are a weapon you switch on yourself."; "The answer starts with a line on a map, drawn six years before Cabral arrived."). The feed never renders it: it only appears in search and on the welcome preview.                                                                    |
| C2  | **The one-sentence answer is never shown either.** Every lesson has a `summary` that states the payoff in one sentence ("With less air pressure, water boils at lower temperatures: it boils sooner but cooks more slowly."). The feed shows the 86–105-word body instead, and in a mobile browser the fade often cuts it _before_ the payoff (Tordesillas, tides, red blood cells). |
| C3  | **A swipe is not a complete learning moment.** In a mobile browser, roughly the first 45–55 words are visible. For most lessons that is the setup, not the answer. Learners who don't tap "Continue reading" leave with a question and no answer, which is the opposite of what the product promises.                                                                                |
| C4  | **The takeaway repeats the summary.** For 20/20 lessons the takeaway and the summary say the same thing in slightly different words. On the card it reads as a second ending.                                                                                                                                                                                                        |
| C5  | **Bodies open with setup, not surprise.** Most cards start with context ("In 1494, six years before…", "In the 1880s, the German psychologist…") and reach the twist in sentence 3–5. That is good writing for a 60-second read; it is a weak first line for a 3-second scroll decision.                                                                                             |
| C6  | **Go deeper is excellent but presented as a utility sheet.** The deep dives (76–120 words, with headings like "Why nonsense syllables?" and "The far side isn't dark") are the most delightful part of the content, but they open in a plain sheet that looks like settings.                                                                                                         |

**Measured:** `hook + summary` is **23–40 words in English and 28–40 in Portuguese (median 32/35)** for all 20 lessons. That is already the founder's proposed "1–2 sentences of the main point", and it exists today without writing anything new.

### 1.3 Overall product polish

| #   | Area          | Finding                                                                                                                                                                                                                                                          |
| --- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| P1  | Onboarding    | Fast, skippable, honest (no sign-up). But the welcome "preview of a real card" is a small thumbnail with a tiny illustration, the interest step is plain chips, and the theme step is mostly empty space. It doesn't sell the experience in the first 5 seconds. |
| P2  | Navigation    | The bottom navigation is solid and consistent. Labels are 10–11px. Fine.                                                                                                                                                                                         |
| P3  | Gestures      | Vertical snap is native and smooth (B4, keep it). "Tap anywhere opens Go deeper" (B18) is invisible: nothing on the card suggests the card is tappable.                                                                                                          |
| P4  | Transitions   | Card → Go deeper is a generic bottom sheet. There is no spatial link between the card and its expanded content.                                                                                                                                                  |
| P5  | Feedback      | Save is a toast. Quiz feedback is clear and accessible (keep it) but has no moment of delight for a right answer.                                                                                                                                                |
| P6  | Mobile layout | The layout is correct (safe areas, banners measured, no overflow: verified), but optimized for "fit the text" rather than "make the idea land".                                                                                                                  |
| P7  | Accessibility | A good baseline: landmarks, labels, focus traps (Radix), reduced motion, contrast tests, `lang` per lesson. Watch-outs for the redesign: 11.5px uppercase chips, 12.5px muted meta, and text over imagery (needs a scrim and a contrast test).                   |
| P8  | Consistency   | Explore, Review, Library and You share the cream glow and serif headings and have good empty states. They will look dated next to a redesigned feed, so a light pass is needed after Discover.                                                                   |

---

## 2. Proposed visual directions

All three are built and interactive in the Design Lab (section 7). They are deliberately different, not variations. Each uses the same content: **headline + hook/summary on the card, full text and deep dive behind Go deeper**.

### A · Folio — premium editorial

> A beautifully set magazine page. Calm, trustworthy, made for people who like to read.

| Aspect            | Choice                                                                                                                                                                             |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typography        | Fraunces (soft, high optical size) for headlines; Newsreader for text; Inter for small caps labels. Serif-forward.                                                                 |
| Color             | Warm paper `#F3EEE4` / ink; topic colors used as muted inks for kickers and plate tints. Dark: warm charcoal, not black.                                                           |
| Image treatment   | The **existing illustrations**, framed as plates with a figure caption (using the lesson's alt text), on a topic-tinted ground, with paper grain.                                  |
| Layout            | A contained page with the next page peeking in from the right. Desktop: a two-page spread (plate left, text right).                                                                |
| Hierarchy         | Kicker (topic — trail · step) → headline → italic hook (dek) → one-sentence answer → quiet icon row + "Read the story ↗".                                                          |
| Interaction       | Horizontal page turns (native scroll snap) with a slight 3D tilt; tap the text to open the story.                                                                                  |
| Go deeper         | A full-page **article**: drop cap, pull quote for the takeaway, section heads from the deep dive, quiz inline, then "Next in this trail".                                          |
| Strengths / risks | Closest to the founder's sketch and the spec's "warm, editorial, premium, calm". Its weakness is that it relies on illustration quality, and today's art looks thin at plate size. |

### B · Aurora — immersive discovery

> Every idea is a world. Full-bleed art, big type, and a feed you want to keep swiping.

| Aspect            | Choice                                                                                                                                                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typography        | Bricolage Grotesque (condensed, heavy) for headlines; Inter for text.                                                                                                                                                       |
| Color             | Each topic is a color world: Space indigo, Body crimson, Brain violet, Everyday Science amber, History sepia. Glass chrome.                                                                                                 |
| Image treatment   | **Original generative art** per lesson (seeded, deterministic SVG): topic palette, a motif per illustration (the Moon, an eclipse corona, cells, a meridian line), film grain, slow drift.                                  |
| Layout            | Full screen. Text sits low over a scrim; a labeled **action rail** on the right (Save, Listen, Quiz); a white "Dive in" pill.                                                                                               |
| Hierarchy         | Topic chip → very large headline → one-sentence answer → Dive in.                                                                                                                                                           |
| Interaction       | Vertical snap (same as today); text rises in when a card settles; story-style session segments at the top.                                                                                                                  |
| Go deeper         | **Story panels**: tap through the full text, the takeaway as a big statement, each deep-dive paragraph, the quiz, then the next lesson, all over the blurred art.                                                           |
| Strengths / risks | The most "consumer app" feel and the strongest sense of place per topic. Risks: it borrows the social-video grammar the spec warns against cloning, art must scale to hundreds of lessons, and it reads less "trustworthy". |

### C · Clarity — minimal, question-first

> One number, one question. Think first, then reveal: curiosity as the interface.

| Aspect            | Choice                                                                                                                                                                                                                                             |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typography        | Instrument Serif for a huge **key figure** (88 °C, 1494, 120 d); Inter Tight for the question and answer.                                                                                                                                          |
| Color             | Near-white / near-black. The topic color appears once: in the figure and a hairline.                                                                                                                                                               |
| Image treatment   | The figure is the hero. The existing illustration sits above it in **monochrome and blooms into color when the answer is revealed**.                                                                                                               |
| Layout            | A physical **card stack**: the next two cards are visible behind the current one. Floating pill navigation.                                                                                                                                        |
| Hierarchy         | Figure + caption → question → "Think of an answer, then tap" → the answer (summary) → Explain.                                                                                                                                                     |
| Interaction       | **Flick** the top card up (custom gesture, velocity-aware); pull down to bring the last card back. Space reveals, Enter explains.                                                                                                                  |
| Go deeper         | The card **morphs** (FLIP) into a clean reading page: figure, title, the short version, the story, "In one line", deep dive, quiz, next in trail.                                                                                                  |
| Strengths / risks | Uses the pretesting effect the app itself teaches (trying to answer first improves memory); calm and very distinctive. Risks: one extra tap per card, it needs a reviewed key figure per lesson (a new content field), and it is the least "lush". |

### Recommendation

Lead with **A (Folio)'s structure and tone**, and take two ideas from the others:

1. From **C**: the **question-first reveal** as an _optional_ mode, or as the treatment for "Remember more" learners (D12). It is the most learning-specific idea of the three.
2. From **B**: **topic color worlds** and real motion (text entrance, morph into Go deeper). The single biggest visual gap today is that every card looks the same (V2).

The founder should decide after using the three prototypes on the phone. The plan below is written so that sections 4–5 apply to any of them.

---

## 3. Content presentation improvements

### 3.1 The feed card becomes one complete idea (≈25–60 words)

| Card slot            | Source today (no new writing)                                                   | Words   |
| -------------------- | ------------------------------------------------------------------------------- | ------- |
| Headline             | `title` (already a question)                                                    | 5–12    |
| Curiosity line       | `hook`                                                                          | 9–20    |
| The answer           | `summary`                                                                       | 14–24   |
| Visual               | `heroMedia` (always shown, never hidden)                                        | —       |
| Behind **Go deeper** | `cardBlocks` (full text) + `takeaway` + `deepDiveBlocks` + quiz + next in trail | 160–230 |

- Every swipe now ends on the **answer**, so it is a complete learning moment even if the learner never taps.
- **0/20** cards need "Continue reading" on any screen (measured in the prototypes at 375×553), so D11's fade-and-button mechanism can be retired for the feed card.
- The full 80–150-word text is kept, untouched, as the first section of Go deeper. Nothing written is lost.
- The takeaway moves to Go deeper ("In one line"), where it works as a recap rather than a second ending.

### 3.2 Card word limits (needs a founder decision — proposed P8)

The founder proposed **35–70 words** per feed card. Measured `hook + summary` is 23–40. Options:

1. **Use `hook` + `summary` as the feed card now (recommended for M2.5).** No schema or validator change; works for the 20 drafts immediately. Add a validator _warning_ if `hook + summary` exceeds 60 words.
2. **In M3, add an authored `lead` field (30–60 words)** written for the card, and keep `cardBlocks` (80–150) as "the story" in Go deeper. The validator enforces both. This gives writers control over the card's rhythm instead of gluing two fields together.
3. **Keep cardBlocks on the card and shorten them to 35–70 words.** Not recommended: it throws away good writing and makes Go deeper thinner.

Either way, **D5's 80–150 range still applies to the full text**; it simply stops being what the feed card shows. That is a spec deviation to record in `docs/DECISIONS.md` once approved.

### 3.3 Writing guidance for M3 (no lessons are written in M2.5)

- `hook`: one surprising, accurate line; no answer in it. (The current hooks already meet this; keep them.)
- `summary` / `lead`: state the answer in the first clause.
- `takeaway`: should add something (an implication), not restate the summary. Today 20/20 restate it.
- Optional key figure (only if direction C or its reveal mode is chosen): a number or term from the text plus a 3–8-word caption, reviewed like any other claim.

### 3.4 Go deeper as the reward

Order: the short version → the full story → "In one line" → deep-dive sections → **quiz** → **next in this trail**. Ending on the quiz turns reading into recall (testing effect), and ending on the trail turns one card into a session.

---

## 4. Specific component-level changes

What exists, and what happens to it. **No architecture changes**: routes, data repositories (`library.ts`, `progress.ts`), IndexedDB, ranking (`feed.ts`), review scheduling, i18n and the PWA stay as they are.

| Component / file                                               | Keep / change   | Change                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `features/feed/FeedView.tsx`                                   | **Keep**        | Native snap scrolling, keyboard, lazy rendering, `data-ready` all stay. Direction A would switch the axis to horizontal (CSS + keys only); B keeps vertical; C needs a gesture layer (see below).                                                                                                         |
| `features/feed/LessonCard.tsx`                                 | **Rework**      | Render `hook` + `summary` instead of paragraphs; the hero is never hidden; one meta line instead of six signals (topic · trail step; the reason and "Preview" move into a single quiet line or into Go deeper); a primary Go deeper action plus 3 icon actions. Remove the overflow/ResizeObserver logic. |
| `features/feed/LessonSheets.tsx` → `DeeperSheet`               | **Rework**      | Becomes a full-height reading view (A: article, B: panels, C: morph). Always starts with the full text (the `withFullText` path becomes the only path). Quiz moves to the end, followed by "Next in this trail". Radix Dialog stays (focus trap, a11y).                                                   |
| `features/feed/LessonSheets.tsx` → `QuizSheet`, `SourcesSheet` | Keep            | Restyle only.                                                                                                                                                                                                                                                                                             |
| `components/QuizRunner.tsx`                                    | **Keep**        | Logic, shuffling, announcements and tests stay; add a small success animation (respecting reduced motion). Reused inline at the end of Go deeper.                                                                                                                                                         |
| `features/feed/Slides.tsx` (soft stop, Time to remember)       | Keep            | Restyle to the chosen direction. Content and actions unchanged (§3.8).                                                                                                                                                                                                                                    |
| `features/feed/tracking.ts`                                    | **Change**      | "Completed" is 40% of reading time (≥ 6 s) of the _full_ text (B5). With a 30-word card that's too strict for the card and too loose for Go deeper. Proposal: completed = card active ≥ 6 s **or** Go deeper opened for ≥ 40% of its reading time **or** quiz finished. Needs a decision.                 |
| `components/Illustration.tsx`                                  | Keep, extend    | A: draw at a larger canvas (e.g. 320×240) with more detail; B: add a generative "world" layer per topic (prototype in `experiments/m2-5/b/art.js`); C: add a monochrome-to-color treatment (CSS only).                                                                                                    |
| `components/TopicIcon.tsx`, topic `accentColor`                | Keep            | Becomes much more visible: topic color worlds (backgrounds, kickers, figure color).                                                                                                                                                                                                                       |
| `styles/tokens.css`, `tokens.test.ts`                          | **Extend**      | Add per-topic surface tokens and the chosen direction's type scale; add text-over-image pairs to the contrast test.                                                                                                                                                                                       |
| Fonts (D10)                                                    | Change if A/B/C | A adds Newsreader; B adds Bricolage Grotesque; C adds Instrument Serif + Inter Tight. All SIL OFL, available on Fontsource, cover Portuguese diacritics. Self-host like D10 (the prototypes use Google Fonts only for speed). New dependency → needs approval.                                            |
| `components/BottomNav.tsx`                                     | Restyle         | A: hairline text tabs; B: glass; C: floating pill. Same routes and labels.                                                                                                                                                                                                                                |
| `features/feed/FeedRail.tsx` (desktop)                         | Restyle         | A: spread with trail list; C: question index. Same data.                                                                                                                                                                                                                                                  |
| `hooks/useSpeech.ts`                                           | Keep            | Listen on the card reads title + hook + summary; in Go deeper it reads the full story.                                                                                                                                                                                                                    |
| `routes/welcome.tsx`                                           | Polish          | Show a full-size live card in the chosen direction on the first screen; animate between steps.                                                                                                                                                                                                            |
| `i18n/locales/*.json`                                          | Extend          | New keys (e.g. "Read the story", "In one line", "Think first"); both locales; completeness test covers them.                                                                                                                                                                                              |
| Gesture layer (only for C)                                     | New, small      | ~150 lines: pointer events with velocity; buttons and keys as alternatives. No gesture library (B3).                                                                                                                                                                                                      |
| E2E (`e2e/m2-fixes.spec.ts`, `app.spec.ts`)                    | **Update**      | "Continue reading" and overflow tests are replaced by "card shows hero + full short text at every size". Trail return, soft stop and quiz scenarios stay.                                                                                                                                                 |

---

## 5. Implementation sequence

Each step ends green (`typecheck`, `lint`, `test`, `content:validate`, `build`) and with screenshots at the five sizes. Steps 1–2 are decisions; nothing is built before them.

1. **Choose a direction** in the Design Lab on the phone (A, B, C, or a named mix). Record it in `docs/DECISIONS.md`.
2. **Decide the content contract** (section 3.2: P8) and the completion rule (section 4, `tracking.ts`). Record both.
3. **Tokens and type.** Add fonts (approval for the dependency), per-topic tokens, type scale, contrast tests for text over imagery. No layout changes yet.
4. **The card.** Rework `LessonCard` to hook + summary + always-visible hero + simplified meta and actions. Remove the overflow logic. Update E2E. _This alone fixes V1, V3, V5, V6, C1–C3._
5. **Go deeper.** Rework `DeeperSheet` into the chosen reading view; quiz at the end; next in trail. Keep the Radix dialog semantics.
6. **Motion and feedback.** Card settle and text entrance, save/quiz micro-interactions, the card → Go deeper transition; all off under reduced motion.
7. **Illustrations.** The chosen treatment (A: larger redraw of the 20 scenes; B: generative worlds; C: monochrome bloom). Original art only (no third-party images without a license and attribution).
8. **Soft stop, welcome, desktop rail.** Restyle to match.
9. **Consistency pass** on Explore, Review, Library and You (type, color, spacing only).
10. **Measure and review.** Re-run the D11 measurement table, the a11y checklist and a phone review by the founder. Update `IMPLEMENTATION_STATUS.md` and `WALKTHROUGH.md`.

Estimated size: steps 3–6 are the core (one focused run); steps 7–9 are a second run. M3 starts after.

---

## 6. Acceptance criteria

**Content and layout**

- [ ] On 375×553 (iPhone SE in Safari), 393×660, 393×852, 360×800 and desktop, in both locales: every one of the 20 cards shows the hero, the headline, the hook and the summary **completely**, with no fade, no "Continue reading" and no inner scrolling.
- [ ] The full card text, takeaway and deep dive are all reachable in one tap (Go deeper), in that order, followed by the quiz and "Next in this trail".
- [ ] No lesson text is changed or added in M2.5; the validator still passes.

**Visual**

- [ ] Each of the five topics is recognizable from a card at a glance (color world and/or art), checked side by side in a screenshot grid.
- [ ] The headline is the most prominent text on every card; no more than two metadata items appear above it.
- [ ] One primary action (Go deeper) is visually distinct from the secondary actions.

**Interaction**

- [ ] Swipe, buttons and keyboard all navigate; the position is kept across Go deeper, the quiz, trails and tab switches (existing E2E keeps passing).
- [ ] Opening and closing Go deeper returns to the exact card, with focus restored.
- [ ] Animations run at 60 fps on a mid-range Android in Chrome DevTools' performance panel; all motion is disabled under reduced motion (OS or in-app setting).

**Accessibility**

- [ ] WCAG AA contrast for all text, including text over imagery (added to `tokens.test.ts` or a new test).
- [ ] Tap targets ≥ 44×44; labels on icon-only buttons; quiz feedback announced; `lang` set per lesson.

**Engineering**

- [ ] No changes to routing, repositories, IndexedDB schema, storage keys, ranking or the service worker.
- [ ] New dependencies are fonts only (approved).
- [ ] `pnpm typecheck`, `lint`, `test`, `content:validate`, `build` and `test:e2e` pass; updated E2E covers the new card at all sizes.
- [ ] Founder signs off after using it on a phone, both in Safari and installed.

---

## 2b. Concept D · Hybrid (added 2026-10-26)

The founder's synthesis after reviewing A–C: **Discover from B, Go deeper from A, Review from C**, with much better graphics. Built in the Design Lab as `concept-d.html` (A, B and C are unchanged).

| Part      | What it does                                                                                                                                                                                                                                                                                                                                                                                                         |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Discover  | Aurora's full-screen topic worlds and vertical snap, light and dark. Layout top to bottom: **explanatory diagram → topic chip, headline, one-sentence answer → Dive in + labeled Save / Listen / Quiz**, so text sits mid-screen, not at the bottom edge.                                                                                                                                                            |
| Graphics  | **20 original diagrams** (`d/plates.js`), one per lesson, each showing the mechanism: tidal bulges with force arrows, eclipse geometry, boiling point vs altitude, a red blood cell's life cycle, bone remodeling, a real-coordinate map of the Tordesillas line… Every label restates the lesson's own text; non-data shapes say "schematic". Theme-aware through CSS variables; lines draw in when a card settles. |
| Go deeper | Folio article: kicker, serif headline, dek, figure with caption, "the short version", drop-cap story, pull quote, deep dive, **sources module** (honest "pending review" state: the drafts have no sources yet), **related concepts** from `concept.related` with reasons, next in trail.                                                                                                                            |
| Review    | Clarity flashcards: **question only** (no figure, number or image before the reveal), then "Show answer" (self-grade: Not yet / Got it) or "Choose from options" (auto-graded). Back of card: answer, explanation, common mix-up, diagram, next review. Summary screen → Back to Discover.                                                                                                                           |
| Flow      | Discover → Dive in → Read → Review what you just read → summary → **back to the same card**. Quiz on a card and the live Review tab (badge = cards seen) open the same review flow.                                                                                                                                                                                                                                  |

**Verified with Playwright:** all 20 lessons at 375×667, 393×852, 360×800 and 375×553, in English and Portuguese: no overlap between diagram, text, actions and navigation; no clipped text or truncated button labels; no horizontal overflow; the diagram is never shorter than 190px. The full flow ran at each required size in both languages with no errors and returned to the same card every time.

**Implications if chosen:** a diagram per lesson becomes an authored, reviewed asset in M3 (like a claim). The plate kit (helpers + CSS variables) can become a small React component that renders a declarative diagram spec.

## 2c. Concept E · Founder's visual reference (added 2026-10-26)

The approved direction, built from the founder's reference sheet and design handoff (Markdown, supplied with the PNG): **Discover** = a cinematic Aurora feed; **Go Deeper** = the M2 sheet, polished and app-native; **Review** = calm, question-first cards. Built as `concept-e.html`; Concepts A–D are unchanged.

**Lessons:** red blood cells, why the Moon shows the same face, the Maillard reaction, why Brazil speaks Portuguese (Tordesillas), plus an end-of-session card. Feed copy is 25–30 words per card, condensed from each lesson's draft text (`e/content.js`); no new facts.

### Imagery

| Card                                                               | Image                                                                                                                                                                           | Rights              | Notes                                                                                                                                                                                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Red blood cells                                                    | Supplied artwork (design team, 27 Oct 2026)                                                                                                                                     | **To be confirmed** | Used as delivered (resized, cropped). Biconcave cells, no nucleus: matches the lesson.                                                                                                                            |
| Review panels (red blood cells, Moon, Maillard) and Moon Go Deeper | Supplied artwork (design team, 27 Oct 2026)                                                                                                                                     | **To be confirmed** | Used as delivered; the light outer frame on the Review files is cropped off. No answer hints in the Review images.                                                                                                |
| Moon                                                               | [Waning Gibbous Moon – High-Resolution Lunar Imaging](https://commons.wikimedia.org/wiki/File:Waning_Gibbous_Moon_%E2%80%93_High-Resolution_Lunar_Imaging.jpg), Astroclubkosova | CC0                 | Telescope photo on a darker sky with a navy glow and a few **decorative** stars.                                                                                                                                  |
| Maillard reaction                                                  | Supplied artwork (design team, 27 Oct 2026)                                                                                                                                     | **To be confirmed** | Used as delivered. Seared steak with steam.                                                                                                                                                                       |
| Tordesillas                                                        | Supplied artwork (design team, 27 Oct 2026)                                                                                                                                     | **To be confirmed** | Used as delivered. Atmospheric scene: the flags are generic red pennants and the sails plain, so it is not a specific fleet; check ships and flags for period accuracy (Portuguese ships c. 1500) before release. |

Supplied masters are 941×1672 px (9:16); the brief asks for 1290×2796 for final art, so they are slightly soft on 3× iPhones. The masters are kept outside the repo (with the founder and in the local review folder); earlier Commons sources for these three cards (an NCI illustration, a grill photo, a c. 1540 carracks painting) are retired.

Originals are not committed. `experiments/m2-5/tools/e-images/` fetches the Commons works with their license metadata and bakes all crops/grades into WebP (`e/img/`, 18 files, 1.2 MB total, each with a smaller variant for `srcset`). The current card's art is preloaded and the next card's is promoted from lazy to eager when a card settles (current ± 1).

### Comparison with the reference (rendered at 393×852; side-by-sides in the review folder)

- **Matches closely:** header (wordmark + segmented progress), topic chip + trail position at about 55% of the screen height, 2–3-line bold white question, answer copy, right rail of 50px circular Save / Listen / Quiz with labels, white `Dive in` pill above a dark tab bar with a Review badge; Go Deeper's back header with Save/Listen, rounded hero, _The big picture_, a tinted _Key takeaways_ card with an accent rule, _How it works_ with an explanatory diagram; Review's `1 / 4` header, topic, large question, light illustration panel, dashed _Reveal the answer_, tinted answer card, explanation, and footer icons with a large `Next`.
- **Imagery:** with the supplied art for red blood cells, the Maillard reaction and Tordesillas, those three cards now closely match the reference; the Moon is a real telescope photo in the same composition.
- **Intentional departures:** Discover answers run 4–5 lines (25–30 words, inside the handoff's 25–55) where the mock shows 3; Go Deeper keeps the M2 sheet's grab handle, drag-to-dismiss and sticky _Review / Continue trail_ footer (the M2 interaction pattern); Review adds a small _Did you remember it?_ self-check for future spaced repetition; the mock's garbled "Visua Busier Context" section was not reproduced; the mock's iOS status bar is the device's own.

### Verified (Playwright, `393×852`, `390×844`, `375×667`, `360×800`, English and Portuguese)

No overlap between copy, rail, header and tab bar; no clipped text; all touch targets ≥ 44×44; no horizontal scroll; touch swipe moves to the next card; Save toggles; Dive in opens the same lesson; the diagram expands; related → back → back returns to the same Discover card; Review hides the answer until revealed (checked against the answer text); single-card review ends back on the same card; no page errors; with reduced motion there is no image zoom, no text animation and no sheet transition.

### Still illustrative or to verify before any release

- Lesson text is an unreviewed draft; the Sources block says so and shows no references (only the real image credits).
- Confirm rights for the three supplied images, re-confirm the Commons licenses, and check each image's educational accuracy (in particular the ships and flags for c. 1500).
- Explore, Library and You are mock tabs; Review state and saves are local to the lab.
- Fonts load from Google Fonts in the prototype (production would self-host).

### Tabs in Concept E (added 2026-10-27, after the founder chose E — D14)

Explore, Review, Library and You mirror the app's features (§3.4–3.6) in E's light "paper" theme; Discover stays dark. All 20 lessons are browsable; the 16 without artwork use their explanatory diagrams as thumbnails.

| Tab     | What works                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Explore | Accent-insensitive search (title, hook, summary, topic); image topic tiles with explored progress; topic page with hero, Follow, trails first (progress dots, Start / Continue / Revisit), lessons as Discover-style cards (image across the top, title below; the diagram until a lesson has art) sorted Suggested / Shortest / Not seen. A trail plays in Discover (its cards only, from the first unseen; lessons without art show their diagram; × or the end card's Back to Explore returns to the topic page it started from; the end card also offers Review this trail). Lesson rows open Go Deeper. |
| Review  | Empty, ready-now (Review N) and all-caught-up states; Recently learned with next-review dates; Mastered. Schedule as in the app (B6): wrong → tomorrow, right → 1 / 3 / 7 days, mastered after 3 in a row. Lessons without curated review copy use their real quiz question, with the answer hidden until revealed.                                                                                                                                                                                                                                                                                          |
| Library | Saved / History / Completed with counts and dates.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| You     | Counts from real prototype events only; recall rate with sample size; 7-day activity; progress by topic; language and theme; clearly labelled prototype tools (Simulate next day, Reset).                                                                                                                                                                                                                                                                                                                                                                                                                    |

State is local to the lab (`designlab.m25.e.state`). A lesson becomes reviewable after 5 s on screen or when opened in Go Deeper; it is ready for its first review immediately (the app waits a day; the prototype doesn't, so the flow can be tried in one sitting). Verified with Playwright at 393×852, 390×844, 375×667 and 360×800 in both languages: no horizontal overflow, nothing under the tab bar, no clipped text, tap targets ≥ 40×40, arrow keys don't move the hidden feed.

## 7. Design Lab

Interactive prototypes of the three directions, isolated from the app.

```bash
# from the worktree: /Users/apple/Documents/GitHub/learn-app-design-lab
node experiments/m2-5/serve.mjs
# → http://localhost:5373/  and  http://<your-LAN-IP>:5373/ (iPhone on the same Wi-Fi)
```

- `index.html`: the three concepts with live previews and their philosophy. `compare.html`: all three side by side at a chosen phone size and lesson.
- A floating **Lab** tab at the top of each prototype switches concept (keeping the same lesson), language and theme.
- Content comes from `content/` through `experiments/m2-5/tools/build-data.mjs` (run with `node --import tsx` from `apps/web`), which also renders the app's existing illustrations to SVG. No lesson text was written for the lab. Concept C's key figures (`shared/figures.js`) are taken from each lesson's own text.
- State is stored under `designlab.m25.*` in localStorage. The app's `lumen.*` keys, its IndexedDB and its service worker are never touched.
- Repo integration: `experiments/` is excluded from ESLint (one line in `eslint.config.js`) and the generated `data.js` from Prettier. The display name is served at runtime from `brand.ts` (the rename guard stays green).
- To discard: delete `experiments/` and those two ignore lines, or simply delete the branch.
