# CurioFeed — Product & Engineering Build Specification (v2)

> **Working title:** CurioFeed. **Must be renamed before public launch** (see §0.1). Keep the brand name in a single constant (`packages/domain/src/brand.ts`) and in i18n strings so a rename is a one-line change.
> **Product:** A free, mobile-first, bite-sized learning feed for people who want to replace mindless scrolling with something they will actually remember. Category inspiration: GenK. Original branding, UI, content and implementation.
> **Primary market:** Brazil (**pt-BR**) at launch. **Secondary:** English-speaking markets (**en**). Every user-facing string and every published lesson ships in both pt-BR and en. This spec and all engineering docs are written in English.
> **Audience:** Codex / Claude Code as the implementation agent, run milestone by milestone (§20). Lesson content is produced by a separate pipeline run, not by the coding agent (§5).
> **Platforms, in order:** responsive web + installable PWA with prerendered lesson pages → Android app (Capacitor) → browser extension → iPhone app (Capacitor).
> **Status:** v2, 22 October 2026. Supersedes v1. Changes are listed in Appendix A.
> **Business constraint:** No recurring paywall, forced trial, hard daily content limit, ads, required paid AI API, or paid account for core learning features.

---

## 0. DIRECT INSTRUCTIONS TO THE CODING AGENT

**Build a functioning application, not a UI prototype or a planning document.** This specification is the product brief, implementation checklist and definition of done.

1. Work **one milestone at a time** (§20). Each milestone ends with a green build, passing tests, and an updated `docs/IMPLEMENTATION_STATUS.md`. Do not start the next milestone in the same run unless told to.
2. Inspect the repository and reuse good existing code. If empty, scaffold the stack in §9. Record every deviation from this spec in `docs/DECISIONS.md` with the reason.
3. Use **original** design, assets, copy and content. Do not clone GenK or any other competitor's screens, and do not scrape or extract any proprietary lesson corpus.
4. Prefer established libraries and small maintainable abstractions. No microservices, speculative agent frameworks or dependency churn.
5. Every visible control must work, have an intentional disabled state, or be clearly marked as not yet available. No fake interactions.
6. **You do not author published lessons.** Build the app and the content pipeline tooling. For development, use a small set of clearly marked fixtures (`"fixture": true`) that are excluded from production builds by the content build step. Never fabricate a source, citation or URL.
7. **Internationalization from the first commit.** No hard-coded user-facing strings. `pt-BR` is the default locale; `en` must be complete for every UI key. A test fails the build if either locale is missing a key.
8. Guest mode is first-class: learning, quizzes, saves, reviews and progress work with no account and no configured backend.
9. Include `.env.example`, seed tooling, setup instructions, tests and a deploy guide. Never commit secrets.
10. Keep the web code compatible with Capacitor packaging and a browser extension: isolate native capabilities behind adapters, keep domain logic platform-independent, and avoid browser-only assumptions in core logic.

### 0.1 Name status

A name check on 2026-10-22 found at least two existing microlearning apps already named **Curio** (one advertising bite-sized lessons, quizzes and streaks; another offering daily read-or-listen lessons), plus a well-known **Curio** audio-news app. "CurioFeed" would be confused with them in app-store search. The founder is choosing a replacement. Before launch, also check INPI (Brazil, Nice classes 9 and 41), USPTO, app-store listings, `registro.br` (.com.br) and a registrar for .com/.app.

### 0.2 Build priority

**P0 — must ship (public beta):**
- Onboarding, guest-first feed, swipe and button navigation, topic browsing, search, bookmarks, quizzes with explanations, spaced review, progress, settings.
- Full **pt-BR and en** UI; language auto-detected and switchable; lessons available in both languages.
- **Curiosity Trails (lite):** lessons organized in clusters, with "next in this trail" and related lessons with reasons.
- Text-to-speech where supported, finite-session option, offline PWA, data export/import.
- **Prerendered, shareable lesson pages** with OG images, sitemap, hreflang.
- **Content pipeline tooling:** schemas, validator, link checker, claim/source model, review tool.
- Cookieless aggregate analytics with opt-out.
- Privacy policy, terms and credits pages (pt-BR and en).
- Accessibility and automated tests.

**P1 — after P0 is stable:**
- Optional accounts and cloud sync (maintained auth library).
- Backend content API and admin/editorial workflow.
- Report-issue workflow with correction ledger.
- **Android app**, **browser extension**, curated paths, stronger recommendations.
- Social short-video export.
- Weekly digest and optional reminders.

**P2 — follow-on:**
- Teach-back challenges, knowledge map, bring-your-own content, creator submissions.
- iPhone app, native focus/nudge features, original micro-video.

Do not let P1/P2 delay P0.

---

## 1. PRODUCT VISION

### The problem

Short-form feeds feel effortless, but people leave having learned little, remembered less, and spent more time than they meant to. Microlearning apps improve on this, but free use is usually restricted by trials, caps or ads.

### The solution

A swipe-based discovery experience where **each card teaches one genuinely interesting, verifiable idea** in under two minutes. Ideas connect into trails, so curiosity leads somewhere. Every card offers an optional recall check. The app measures what people *learn and retain*, not how long they stay.

**Product promise:** *Scroll with curiosity. Leave with knowledge.*
**pt-BR:** *Role com curiosidade. Saia sabendo mais.* (copy to be finalized with the brand)

### Principles

- **Free means useful.** Unlimited access to lessons, quizzes, bookmarks, audio and reviews. No ads, no caps.
- **Learning over engagement.** Correct delayed recall matters more than time-on-app or swipe count.
- **Trustworthy.** Every claim is sourced; corrections are visible.
- **Brazilian first, not translated.** pt-BR content is written natively and includes Brazil-relevant topics. English is a first-class second language.
- **Curiosity branches.** Every lesson leads to related ideas.
- **User control.** Interests, muted topics, session size, notifications, data export and delete.
- **Accessible.** Text and audio, reduced motion, keyboard and screen-reader support.

### North-star metric

**Delayed recalls per weekly learner:** correct review answers given at least 3 days after the lesson was first learned, divided by weekly active learners. It rewards learning that sticks and cannot be gamed by endless scrolling. Supporting metrics are in §13.

### Primary user journeys

1. **Five-minute break:** open app → relevant card → swipe 3–5 cards → one-tap quizzes → "You've learned enough for now" summary.
2. **Targeted interest:** browse a topic → pick a trail → read or listen → save → return later.
3. **Remember something:** open Review → answer due questions → see explanations → next review scheduled.
4. **Follow curiosity:** on a card about black holes, tap *Go deeper* → longer explanation, related lessons with reasons → follow a trail → return to the original feed position.
5. **Offline:** continue with cached lessons, saved lessons and reviews, with clear offline status.
6. **Shared link (key growth loop):** someone receives a lesson link on WhatsApp → sees a rich preview → opens a fast, readable lesson page → taps "next in this trail" → keeps learning as a guest with no signup.

---

## 2. COMPETITIVE LANDSCAPE AND POSITIONING

### 2.1 GenK (primary reference)

As of review on 2026-10-22, GenK's public marketing and app-store listing advertise:
- Short lessons, topic selection and a personalized feed.
- Read and listen modes with playback speed.
- Quizzes, spaced review and mistake explanations.
- Saves, progress, streaks, badges, XP, learning paths and levels.
- Deep dives, plus a Screen Time–based blocker in its native app.
- A 3-day trial, with a premium tier for unlimited learnings, the full library, audio, saves, enhanced quizzes and the blocker.

Sources: https://genk.app/en · https://www.genk.app/ · https://apps.apple.com/us/app/genk-daily-learning-quiz/id6612027371

**GenK's biggest advantage is its library size** (it advertises 20,000+ learnings). Library depth is the hardest thing to replicate, so it is treated as a core engineering problem in §5.

### 2.2 Other apps observed in the category (2026-10-22, not exhaustive)

- **Two iOS microlearning apps named "Curio":** bite-sized lessons, quizzes and streaks.
- **Upscroll:** shows facts when the user opens chosen "distracting" apps; includes ads and in-app purchases.
- **unscroll:** blocks chosen apps and offers curated articles, video essays and podcasts instead; subscription.
- **Nibble:** quiz-based learning, publishes Portuguese-language content.
- **Factly:** offline bundled facts with streaks.

**Implication:** "free" and "anti-doomscroll" are not unique on their own. CurioFeed's defensible position is the combination of:
1. A native-quality, source-verified **pt-BR library** that is also available in English.
2. **Connected trails** instead of isolated trivia.
3. **Retention measurement** instead of XP.
4. **Genuinely free with no ads.**
5. A fast **shareable web presence**.

Re-check the market before making any "only app that…" claim.

### 2.3 Positioning table

| Capability | CurioFeed direction |
|---|---|
| Short, swipeable lessons | Yes, original presentation; native pt-BR + en |
| Read / listen | Both free; device speech synthesis |
| Quizzes, bookmarks, review | All free, no quota |
| Personalization | User-controlled, explainable, cluster-aware |
| Depth | Curiosity Trails from day one |
| Learning outcome | Retention dashboard (delayed recall) |
| Session design | Finite-session option by default |
| Trust | Visible sources per claim, reviewed dates, corrections |
| Interrupting doomscrolling | Browser extension (P1), Android nudge (P1–P2), iOS Screen Time (P2) |
| Discovery | Prerendered lesson pages, SEO, rich link previews, social video |

### 2.4 Non-goals for first launch

- No GenK or competitor branding, trademarks, copied cards or reverse-engineered datasets.
- No video hosting pipeline in v1.
- No social comments, public profiles, follower counts or ragebait.
- No paywall, payments, ads, affiliate marketplace or token economy.
- No AI-generated content published without claim verification and human review.
- No claims that the website can block other apps.

---

## 3. THE CORE EXPERIENCE

### 3.1 First-run onboarding — P0

Skippable, finishable in under 30 seconds.

- **Language:** detected from the browser (`pt-*` → pt-BR, otherwise en), shown on the first screen with a one-tap switch.
- Welcome with a preview of a real card; CTA **Começar a explorar / Start exploring**.
- Optional topic chips from the launch topics; zero selections gives a varied default feed.
- Optional purpose: **Explore / Learn deeply / Remember more** (used only to bias the feed).
- Session size: **3 / 5 / 10 cards / No limit**; default **5**.
- Theme: dark / light / system.
- **No registration and no notification permission request during onboarding.**
- Store choices locally immediately.

### 3.2 Main learning feed — P0

A vertical one-card-at-a-time experience tuned for learning.

**Card anatomy:**
- **Top:** topic icon and name, trail indicator ("Trail: How the Moon shapes Earth · 2 of 6"), session progress.
- **Headline:** intriguing but accurate; no clickbait that misrepresents the answer.
- **Hero:** original SVG, licensed photo, diagram or typographic layout, with attribution.
- **Card body:** **80–150 words, hard cap enforced by the validator.** It must fit a 375×667 CSS-px viewport at default text size without inner scrolling. Optional one-line key takeaway.
- **Reading time** derived from word count.
- **Actions:** **Listen / Save / Quiz / Go deeper / Sources / Share / More**.
- **Next:** swipe up for next, down for previous; buttons for accessibility and desktop; arrow keys on desktop.

**Go deeper sheet:**
- Up to 400 words of extended explanation, sources, and 2–4 related lessons each with a one-line *why it's related*.
- "Continue this trail" button.
- Closing the sheet returns to the exact feed position.

**Behavior:**
- Lazy-load the next card and its image.
- No auto-playing audio or video.
- Keep position when opening quiz or deep-dive.
- Respect muted topics; no immediate repeats.

**Card states:** loading/skeleton, standard, saved, complete, quiz-open, deep-dive-open, offline, broken-media fallback, end-of-session, catalog-exhausted (§6).

**Navigation:** bottom tabs **Descobrir / Explorar / Revisar / Biblioteca / Você** (en: **Discover / Explore / Review / Library / You**). Respect safe areas. On desktop, center the feed (420–560px) with side rails for trails and related lessons.

### 3.3 Quizzes — P0

- Every published lesson variant has **2–3 verified questions**, each with 3–4 options and exactly one correct answer.
- After answering, show correct/incorrect, why, and why the common misconception is wrong where relevant. Announce feedback to screen readers.
- Questions have stable IDs; display order of options is randomized; answers are hidden until submission.
- Never treat a tap or swipe as mastery.
- Record answer, correctness, attempts and timestamps locally.
- pt-BR and en questions for the same concept share a `questionGroupId`, so review progress survives a language switch (§10).

### 3.4 Review / spaced repetition — P0

- Correctly answered questions enter the review queue unless the user opts out.
- **Initial schedule:** due next day; then 3, 7, 14, 30, 60 days after consecutive correct reviews. A wrong answer schedules a retry the next day and resets the streak.
- Implement as a pure function so it can later be replaced by FSRS.
- "Completed" and "mastered" are distinct; mastery requires successful delayed reviews.
- **Review tab:** **Due now**, **Recently learned**, **Mastered**, and a low-pressure **Review 5** CTA.
- One schedule per concept/questionGroup. Timezone changes must not double-count days.
- Works offline.

### 3.5 Explore and Library — P0

- **Topic grid:** description and lesson count. Topic pages list **trails (clusters)** first, then individual lessons.
- **Search** over title, summary, topic and tags in the active locale; works offline for cached lessons.
- **Filters:** Newest / Shortest / Suggested / Not seen.
- **Library:** Saved / History / Completed. Downloaded appears only if implemented.
- Bookmarks persist as guest.
- **Share** uses the Web Share API with clipboard fallback and links to the prerendered lesson page (§7).

### 3.6 Progress — P0

- Lessons explored, completed, saved.
- Immediate quiz accuracy vs delayed review accuracy, shown separately.
- Due reviews; number of concepts with successful delayed recall.
- Trails completed.
- Optional streak with no guilt messaging.
- Topic activity with sample-size context.
- No invented metrics.

### 3.7 Text-to-speech — P0

- Web Speech `speechSynthesis`, started only by user tap.
- Controls: play/pause/stop; speed 0.75×, 1×, 1.25×, 1.5×.
- Choose a voice matching the lesson locale (`pt-BR` voices for pt-BR lessons). If no matching voice exists, say so instead of reading Portuguese with an English voice. Persist voice and speed.
- Stop on lesson change or unmount.
- Feature-detect and degrade cleanly. Do not promise playback with the screen locked.

### 3.8 Intentional sessions — P0

- **Default 5-card session**, then a soft stop: *"Boa — você explorou 5 ideias. Quer revisar rapidinho ou parar por hoje?"* / *"Nice — you explored 5 ideas. Quick recall check, or call it a day?"*
- Actions: **Review what I learned / Keep exploring / Change my goal / Done**.
- Unlimited mode is always available; this is not a quota.
- No manipulative re-engagement, fake scarcity or streak-loss shaming.

### 3.9 Curiosity Trails (lite) — P0

- Every lesson belongs to exactly one primary **cluster** (an ordered trail of 5–8 lessons; §5.3).
- Clusters can link to lessons in other clusters, each with a reason.
- **"Next in this trail"** appears at the end of each card and in Go deeper.
- **Trail mode:** the feed temporarily follows the trail in order, with a visible exit back to the regular feed. The original feed position is preserved.
- Topic pages show trails with progress (e.g. "3 of 6 explored").
- Full graph view and cross-topic trail discovery are P1; the knowledge map is P2.

---

## 4. DIFFERENTIATING FEATURES AFTER P0

### A. Full Curiosity Trails — P1
A graph view of concept relationships across clusters, editorially vetted links, and "trail of the week" curation.

### B. Source confidence and correction ledger — P1
- P0 already shows sources, reviewed date, and a **Report issue** action. In P0, that action opens a prefilled form or email with the lesson ID and locale.
- P1 adds the full workflow: reports queue, editorial resolution, and a public changelog per lesson with statuses *Reviewed / Needs review / Corrected*. No numeric "truth score."

### C. Teach-back — P2
- Explain an idea in one or two sentences from memory, then compare against a model answer with a self-assessment rubric and three keyword cues. Works offline with no AI.
- Optional AI feedback only if a provider is configured, clearly labeled as machine-generated.

### D. Bring your own curiosity — P2
- Paste your own notes, or a permitted article URL, to get a private card and self-quiz.
- Respect copyright and site terms; apply SSRF protections (§14).
- Generation only on explicit user action, with clear limits.

### E. Knowledge map — P2
A visual map of concepts the learner has successfully recalled, with branches to explore next.

### F. Language-learning mode — P2
Because every lesson exists in pt-BR and en, offer an optional side-by-side or "learn the fact plus key vocabulary" mode for people studying the other language.

### G. Weekly digest — P1
Opt-in summary: what you learned, what you remembered, your best trail, your next five reviews.

### H. Original micro-video — P2
Licensed or original 15–60 second captioned explainers, paused by default, with transcripts and bandwidth controls.

---

## 5. CONTENT: STRATEGY AND PIPELINE

**This is the most important section.** A beautiful feed with a thin library will fail: an engaged user on "No limit" can exhaust 150 lessons in a weekend. The product needs both quality and volume. Volume is only safe with a pipeline that verifies claims.

### 5.1 Quality bar

- One precise idea per card.
- The title hooks; the body delivers on the hook with any needed qualifications.
- Explain uncommon words.
- Each card follows a narrative or analogy, then the essential fact, then a surprising or practical implication.
- No sensationalized science, health or history; mark hypotheses and disputes.
- Every factual claim maps to at least one real source excerpt. Surprising or high-stakes claims need at least **two independent** sources.
- Original prose only; respect source and image licenses.
- No individualized medical, financial or legal advice.
- Date-sensitive lessons carry `reviewAfter`.
- At least two real quiz questions per variant, each with a verified answer and explanation.

### 5.2 Launch shape: narrow and deep

Launch with **5 topics**, each with several complete trails, rather than many thin topics. Recommended launch topics, chosen for broad appeal and where the founder's biology, neuroscience and chemistry background speeds up verification:

1. **Corpo Humano & Biologia** / Human Body & Biology
2. **Cérebro & Comportamento** / Brain & Behavior
3. **Espaço** / Space
4. **Ciência do Dia a Dia** / Everyday Science (chemistry and physics of daily life)
5. **História** / History, including Brazilian history

Include **Brazil-relevant trails** in every topic where natural: Amazon and Cerrado biodiversity, Brazilian scientists, INPE and space research, the history of Portuguese and of Brazil. This makes pt-BR content distinctive, not translated.

**Volume targets:**

| Milestone | Reviewed lessons per locale | Shape |
|---|---|---|
| Internal demo | 40 | 5 topics × 2 trails × ~4 lessons |
| Public beta (P0 gate) | 250 | 5 topics × ~6 trails × 6–8 lessons |
| ~6 months after beta | 1,000+ | Add 3–5 topics as the pipeline proves out |

Add topics (Geography, Technology, Art, Economics, Philosophy, Language, Animals) only once existing topics have depth.

### 5.3 Clusters (trails) as the authoring unit

- Content is planned and written **as clusters of 5–8 connected lessons**, not as isolated cards.
- *Example:* "How the Moon shapes Earth" → tidal locking → tides → why Earth's day is slowly lengthening → how the Moon may have formed → why eclipses are rare.
- Each cluster has a title, a one-line hook, an ordered `conceptIds` list, and 1–3 outbound links to adjacent clusters with reasons.
- Each concept has 2–4 `related` links (same or other clusters) with a one-line reason per locale.
- Clustered authoring gives trails, recommendations and internal links almost for free (§6, §7).

### 5.4 Bilingual authoring

- **A lesson is a concept with locale variants** (`pt-BR`, `en`), not one card with a translation toggle (§10).
- pt-BR is authored first and reads as native Brazilian Portuguese, not translation. The en variant is generated from the same sources and reviewed independently. A variant can be published as soon as it passes review.
- Quizzes are written per locale but share `questionGroupId`.
- Sources may differ by locale. For pt-BR, prefer authoritative Brazilian sources where they are equally good (for example Fiocruz, INPE, IBGE, universities), but verify every claim against the best available source in any language.
- The founder can read and review both locales; the review tool shows both side by side.

### 5.5 Pipeline stages

```text
 PLAN ──► RESEARCH ──► DRAFT ──► CLAIMS ──► AUTO-VERIFY ──► HUMAN REVIEW ──► PUBLISH ──► RE-REVIEW
 cluster   fetch &      grounded   atomic     support check,   claim-by-claim   static      scheduled
 outline   snapshot     writing    claims +   links, license,  approve/edit/    build       by reviewAfter
 (human    sources      pt-BR→en   source     length, dedupe   reject
 approves)                         excerpts
```

1. **Plan.** An LLM proposes a cluster outline (concept titles, hooks, order). A human approves or edits it before drafting.
2. **Research.**
   - Gather candidate sources via a search API or manual entry.
   - Fetch each page and store a text snapshot and hash under `content/sources/`. Snapshots are for verification only and are never republished.
   - Respect robots and site terms. Skip paywalled or disallowed sources.
3. **Draft.** Write the lesson variant **only from the stored source text** (grounded generation), plus deep-dive text, quiz candidates and related-lesson suggestions with reasons.
4. **Claim extraction.**
   - Split card and deep-dive text into atomic claims.
   - Each claim must reference one or more `{sourceId, excerpt}` pairs.
   - Mark high-stakes or surprising claims; these require two independent sources.
5. **Auto-verify.**
   - A separate verification pass (different prompt, ideally a different model) judges each claim against its excerpts as *supported / partial / unsupported*. Unsupported claims block the lesson.
   - Also run: link checker, media license check, word-count and readability limits, quiz validity, and near-duplicate detection against the library (embeddings).
6. **Human review.** A review tool, keyboard-driven, shows:
   - Card, deep-dive and quizzes, with pt-BR and en side by side.
   - Every claim highlighted next to its source excerpt and auto-verdict.
   - Actions: **approve / edit / reject**, with notes.
   - Reviewer ID and time are logged. **Target: median ≤4 minutes per variant (~15 per hour).**
7. **Publish.** Only `reviewStatus: "reviewed"` + `publicationStatus: "published"` variants enter the static content build. Nothing generated is ever auto-published.
8. **Re-review.** `content:due-review` lists lessons past `reviewAfter` or with open reports.

**Implementation notes:**
- Lives in `tools/content-pipeline/` (Node + TypeScript).
- LLM access goes through a provider-agnostic interface (Anthropic, OpenAI, local). Every artifact records model, prompt version and pipeline run ID.
- Log cost per lesson and support a per-run budget cap.
- API keys live only in the authoring environment, never in the app or its build.
- The pipeline **never runs in user requests**.
- The review tool is a dev-only route (`/_review`, excluded from production builds) or a small separate app. It reads `content/drafts/` and writes to `content/lessons/`.

### 5.6 Sources, Wikipedia and licensing

- **Wikipedia as a pointer:** use it to find primary and reference sources, then cite those. Citing Wikipedia directly is acceptable for low-stakes claims when nothing better exists.
- **Wikipedia as text source:** Wikipedia text is licensed CC BY-SA 4.0. Any lesson text *adapted* from it must carry attribution and be released under CC BY-SA.
- **DECISION NEEDED (founder):** whether to license all lesson text CC BY-SA 4.0. This makes Wikipedia adaptation legal at scale and makes an "open, sourced library" part of the brand. It also lets others reuse the library. Once published under CC BY-SA, that content cannot be un-licensed. Record the choice in `docs/DECISIONS.md` before the first public release.
- **Images:** prefer original SVG. For Wikimedia Commons or other Creative Commons works, store creator, license, source URL and any share-alike obligations; show them on the credits page and in the source sheet.

### 5.7 Content scripts

| Command | Purpose |
|---|---|
| `content:validate` | Schema, lengths, slugs, locales, quiz validity, claim→source mapping, license fields. Fails CI. |
| `content:check-links` | Fetch every source URL; fail on 4xx/5xx or redirects to unrelated hosts. Cached; runs nightly in CI. |
| `content:verify` | Re-run automated claim verification (authoring env only). |
| `content:dedupe` | Near-duplicate detection across concepts. |
| `content:build` | Produce the versioned static content bundle; excludes fixtures and unpublished variants. |
| `content:seed` | Upsert published content into MongoDB when configured (P1). |
| `content:stats` | Coverage by topic, cluster and locale; review backlog. |
| `content:due-review` | Lessons past `reviewAfter` or with open reports. |
| `content:export-social` | P1: vertical-video script, captions and slide frames per lesson (§7.5). |

### 5.8 Division of labor

| Who | Does |
|---|---|
| Coding agent (milestones M1–M6) | App, schemas, validator, link checker, content build, review tool, pipeline scaffolding with provider interface, fixtures |
| Content pipeline run(s) (prompt C1, §20) | Plans clusters, drafts, extracts claims, auto-verifies, outputs drafts for review |
| Founder / human reviewers | Approve outlines, review claims, publish |

---

## 6. FEED SELECTION AND RECOMMENDATIONS

**P0: transparent, cluster-aware, non-ML ranking.** No LLM calls in feed rendering.

**Candidate filters:**
1. Published, reviewed variants in the active locale. If a concept lacks the active locale, it may be shown in the other locale with a clear label, only if the user enabled "show lessons in other language."
2. Respect muted topics and seen concepts unless the catalog is exhausted.
3. No more than two consecutive cards from the same topic.

**Illustrative scoring:**

```text
score =
  3.0 * interestMatch
+ 2.5 * trailContinuation      // next unseen concept in a cluster the user has started
+ 1.5 * clusterAdjacency       // concept in a cluster linked from one the user engaged with
+ 2.0 * topicVariety
+ 1.0 * editorialQuality
+ 1.0 * novelty
- 4.0 * recentlySeen
- 2.0 * sameTopicAsPreviousTwo
```

**Rules:**
- Reserve 20–30% of positions for quality content outside followed topics.
- **Cold start:** the first session draws cluster openers from different launch topics.
- **Engagement signals** (completion, correct quiz, save, trail follow) raise interest in that cluster and its adjacent clusters. This is how "spent time on astronomy → gradually more astrophysics and cosmology" works without ML.
- Use a deterministic shuffle seed per session; cards never jump mid-session.
- Due reviews live in Review or an optional prompt, never disguised as new lessons.
- **Reason shown on the card:** *Porque você escolheu Espaço* / *Because you chose Space*, *Continua a trilha* / *Continues your trail*, *Algo novo* / *Something new*.
- **Catalog exhaustion:** when a user has seen most lessons in their interests, say so honestly ("You've explored most of Space — new trails arrive regularly. Try Brain & Behavior?") instead of recycling silently.

**P1:** tune weights with aggregate data (§13); add collaborative signals only with explanation and user control. Never optimize for time-on-app.

---

## 7. DISTRIBUTION AND GROWTH

A real product needs a plan for being found. Most of this is engineering, so it lives in the spec.

### 7.1 Prerendered lesson pages — P0

An SPA serves an empty shell to crawlers and link-preview bots, so shared links would show no title or image. To avoid that:

- **Prerender at build time** a static HTML page for every published variant:
  - pt-BR: `/pt/licao/:slug`
  - en: `/en/lesson/:slug`
  - Slugs are localized.
- Each page includes title, description, canonical URL, `hreflang` alternates between locales, JSON-LD (`LearningResource` or `Article`, with `isBasedOn` sources), and OG/Twitter meta tags.
- The page is fully readable without JavaScript, then hydrates into the app.
- Also prerender topic and trail landing pages.
- Recommended approach: React Router v7 framework mode with `prerender` (SPA elsewhere), or a Vite prerender plugin. Record the choice.

### 7.2 OG images — P0

- Generate a 1200×630 image per variant at build time (e.g. Satori + resvg) with title, topic and brand.
- **Test previews in WhatsApp, iMessage, X and Telegram.** WhatsApp is the most important channel in Brazil.

### 7.3 SEO — P0

- `sitemap.xml` per locale, `robots.txt`, and internal links via trails.
- Question-style titles match how people search ("Por que a Lua mostra sempre o mesmo lado?").
- Only reviewed, published pages are indexable. No thin or auto-generated pages.

### 7.4 Share cards — P0

- In addition to the link, offer a 1080×1920 story image of the card (rendered client-side or prebuilt) for Instagram and WhatsApp Status, with a short URL.
- Use the Web Share API with files where supported.

### 7.5 Social short-video export — P1

- `content:export-social` turns a lesson into a 30–45 second vertical video package: script, captions, slide frames and a link back.
- Purpose: meet doomscrollers on TikTok, Reels and Shorts with good content that points back to the app.
- Human review before posting.

### 7.6 Browser extension — P1

"Interrupt the scroll" — a Manifest V3 extension for Chrome and Edge, then Firefox; Safari later via conversion.

- The user picks sites (suggested: tiktok.com, youtube.com/shorts, instagram.com/reels).
- On visiting one, the extension shows an interstitial with one card: **"Keep learning"** or **"Continue to site."**
- Optional daily allowance before the interstitial appears.
- Everything is local. **No browsing data leaves the device.**
- Request host permissions only for user-chosen sites. Respect store policies.
- Shares the domain and content packages with the web app.

### 7.7 Android — P1

- Brazil is overwhelmingly Android, so **package for Android before iOS** with Capacitor.
- Optional "nudge" (P1–P2): with the user's explicit grant of the usage-access permission, detect when a chosen app is opened and offer a notification with a card.
- **Before building, check current Google Play policy** for usage-access, overlay and Accessibility API use. Do not rely on the Accessibility API for this.

### 7.8 Launch channels (non-engineering, for planning)

- WhatsApp shareability.
- Brazilian science communicators and creators (co-authored trails, credited).
- Teachers, with care under ECA Digital (§14).
- Reddit and Product Hunt for the English launch.

---

## 8. DESIGN AND INTERACTION

### Visual direction

Warm, editorial, youthful, premium, calm. **Not a clone of GenK, TikTok or Duolingo.**

**Color:**
- Background: warm off-white `#F7FAF8` with a subtle mint→aqua glow (`#DDF8EC` → `#DDF5FA`) around hero areas.
- Primary: deep teal `#087F75`. Accent: mint `#83E6CD`. Ink: `#15312D`.
- Warm neutral: `#F2EEE6`. Muted text: `#5E746F`.
- WCAG AA contrast; never use mint for small text on white.
- Dark theme with its own palette, not an inversion.

**Shape and type:**
- 20–28px card radius, soft elevation, 8px spacing scale.
- Editorial serif or strong sans for headlines; highly legible body type. Self-host only licensed fonts; **fonts must cover Portuguese diacritics** (ã, ç, é, ô…).

**Motion:** short and smooth; respect `prefers-reduced-motion`.

**Localization in layout:** pt-BR strings often run 15–30% longer than English. Design for long labels, test every screen in both locales, and never truncate quiz options.

### Layout

**Mobile (<768px):**
- Full-height shell, fixed top chrome and bottom nav with `env(safe-area-inset-*)`.
- Cards fit the viewport (§3.2).
- Tap targets ≥44×44.
- Quiz and deep-dive open as accessible bottom sheets.

**Tablet/desktop:**
- Feed centered at 420–560px; trails and related lessons in side rails.
- Keyboard navigation when no input or dialog is focused.

### Sketches (not literal UI)

```text
┌─────────────────────────────┐
│ CurioFeed          3 de 5   │
│ ●●●○○                       │
│ ESPAÇO · Trilha 2/6   1 MIN │
│                             │
│ Por que a Lua mostra sempre │
│ o mesmo lado?               │
│      [ilustração original]  │
│ Ela gira em torno de si no  │
│ mesmo tempo em que orbita…  │
│                             │
│ [Ouvir] [Salvar] [Fontes]   │
│ [Quiz]   [Ir mais fundo →]  │
│ Próximo na trilha: Marés ↑  │
├─────────────────────────────┤
│ Descobrir Explorar Revisar… │
└─────────────────────────────┘
```

```text
┌─────────────────────────────┐
│       Mandou bem hoje!      │
│   Você explorou 5 ideias    │
│   e respondeu 3 quizzes.    │
│ [Revisar o que aprendi]     │
│ [Continuar explorando]      │
│ [Parar por hoje]            │
└─────────────────────────────┘
```

### Accessibility checklist

- Semantic landmarks and headings; dialog focus traps and restoration; screen-reader labels.
- Gesture alternatives; announced quiz feedback; keyboard navigation.
- WCAG AA contrast; dynamic text resizing; reduced motion; no flashing media.
- `lang` attribute set per lesson locale (so screen readers switch voice correctly).
- Locale-aware dates and numbers; robust touch behavior in iOS Safari.

---

## 9. TECHNICAL ARCHITECTURE

### 9.1 Frontend (P0)

- React + TypeScript + Vite, routing via **React Router v7** (framework mode with prerender for public pages, SPA for the app shell), or plain Vite SPA plus a prerender plugin. Record the decision.
- Tailwind CSS with accessible primitives (Radix or shadcn/ui).
- TanStack Query for server/cache data. Zustand only if needed for transient UI state.
- Dexie / IndexedDB for guest progress and offline cache.
- `vite-plugin-pwa` + Workbox.
- Zod for schemas and imports.
- **i18next / react-i18next** with `pt-BR` (default) and `en` from day one. Locale prefix in public URLs; in-app locale stored in preferences.
- Vitest + React Testing Library + Playwright.
- OG image generation at build: Satori + resvg (or equivalent).

### 9.2 Analytics (P0)

- Cookieless, aggregate, privacy-respecting: Plausible, self-hosted Umami, or PostHog configured without persistent identifiers. Behind an `Analytics` adapter with a no-op implementation.
- Details in §13.

### 9.3 Backend (P1, behind repository interfaces)

- Node.js 22+ + Express + TypeScript; Zod-validated endpoints; central error handler.
- **Database:** MongoDB Atlas (current choice) with Mongoose and explicit indexes. If a managed auth+database platform is preferred, Postgres via Supabase is an acceptable substitution. Decide before P1 and record it.
- **Auth: use a maintained library or service** (e.g. Better Auth, or the auth built into the chosen platform). Do **not** hand-roll password hashing, sessions, verification or reset. Secure httpOnly cookies, CSRF protection, rate limiting.
- Public lesson content stays a versioned static bundle served from a CDN; the API serves user data and admin workflows.

### 9.4 Native and extension

- **Capacitor Android (P1), then iOS (P2).** A `PlatformCapabilities` adapter covers share, TTS, notifications, haptics, usage-access (Android) and Family Controls (iOS, future).
- **Browser extension (P1)** in `apps/extension`, reusing `packages/domain` and `packages/content`.
- **Storage caveat:** PWA browser storage does not migrate into a Capacitor app's WebView storage. Provide export/import (P0) and account sync (P1) before native launch.

### 9.5 Repository tree

```text
curiofeed/
  apps/
    web/                     # app shell, features, prerendered public routes
      public/
      src/
        app/  components/  hooks/  i18n/  styles/  platform/  data/
        features/ onboarding feed trails explore library quiz review progress settings legal
        dev/review/          # dev-only content review tool (excluded from prod)
    api/                     # P1 Express routes/services/admin
    extension/               # P1 MV3 browser extension
    mobile/                  # P1 Capacitor config (Android, later iOS)
  packages/
    domain/                  # types, schemas, review algorithm, feed ranking, brand constant
    content/                 # built, validated static content bundle (generated)
    ui/                      # shared card/quiz components for web + extension
  tools/
    content-pipeline/        # plan, research, draft, claims, verify, build, export-social
  content/
    topics.json
    clusters/                # cluster definitions (ordered concept lists, links)
    lessons/                 # reviewed concept + locale variant files
    drafts/                  # pipeline output awaiting review (gitignored or separate branch)
    sources/                 # source metadata + snapshot hashes (snapshots stored outside public build)
    fixtures/                # dev-only fixtures, never published
  docs/
    IMPLEMENTATION_STATUS.md  DECISIONS.md  CONTENT_GUIDE.md  CONTENT_PIPELINE.md
    DEPLOYMENT.md  PRIVACY_NOTES.md  IOS_ROADMAP.md  ANDROID_ROADMAP.md
  .env.example
  README.md
```

Use one package manager with workspaces (npm or pnpm), consistently.

### 9.6 Route map

| Route | Purpose | Phase |
|---|---|---|
| `/` | Locale redirect; welcome on first use, else Discover | P0 |
| `/app/discover` | Swipe feed | P0 |
| `/app/explore`, `/app/topic/:slug` | Topics, search, trails | P0 |
| `/app/trail/:slug` | Trail mode | P0 |
| `/app/review` | Due reviews | P0 |
| `/app/library` | Saved, history, completed | P0 |
| `/app/you`, `/app/settings` | Stats, preferences, privacy, export/import | P0 |
| `/pt/licao/:slug`, `/en/lesson/:slug` | **Prerendered** public lesson pages | P0 |
| `/pt/topico/:slug`, `/en/topic/:slug`, `/pt/trilha/:slug`, `/en/trail/:slug` | Prerendered landing pages | P0 |
| `/pt/privacidade`, `/en/privacy`, `/pt/termos`, `/en/terms`, `/pt/creditos`, `/en/credits` | Legal and attribution | P0 |
| `/_review` | Dev-only content review | P0 (dev) |
| `/app/paths/:slug` | Curated paths | P1 |
| `/auth/*`, `/admin/*` | Optional accounts; editorial tools | P1 |

Final URL scheme may differ; keep public lesson URLs stable once launched.

### 9.7 Data access seam

```ts
type Locale = "pt-BR" | "en";

interface ContentRepository {
  listLessons(query: LessonQuery & { locale: Locale }): Promise<LessonSummary[]>;
  getLesson(slug: string, locale: Locale): Promise<LessonVariant | null>;
  getConcept(conceptId: string): Promise<Concept | null>;
  listTopics(locale: Locale): Promise<Topic[]>;
  listClusters(topicId: string, locale: Locale): Promise<Cluster[]>;
  searchLessons(q: string, locale: Locale): Promise<LessonSummary[]>;
}

interface ProgressRepository {
  appendEvent(event: ProgressEvent): Promise<void>;
  getReviewQueue(now: Date): Promise<ReviewItem[]>;
  getStats(): Promise<ProgressStats>;
  setBookmark(conceptId: string, saved: boolean): Promise<void>;
  exportData(): Promise<UserDataExport>;
  importData(data: UserDataExport): Promise<ImportResult>;
}
```

P0 implements `StaticContentRepository` and `IndexedDbProgressRepository`.

---

## 10. DOMAIN MODELS

Stable IDs for concepts, variants, questions and events. UTC timestamps; user timezone only for display and day boundaries. **Progress, bookmarks and reviews are keyed by `conceptId` (and `questionGroupId`), not by locale variant,** so switching language keeps everything.

### 10.1 Concept (language-independent)

```json
{
  "id": "concept_moon_tidal_locking",
  "topicId": "space",
  "clusterId": "cluster_moon_shapes_earth",
  "clusterOrder": 2,
  "tags": ["moon", "gravity", "orbits"],
  "difficulty": "beginner",
  "related": [
    { "conceptId": "concept_tides", "type": "next",
      "reason": { "pt-BR": "A mesma gravidade que trava a Lua também cria as marés.",
                  "en": "The same gravity that locks the Moon also raises the tides." } }
  ],
  "variants": ["pt-BR", "en"]
}
```

*Schema illustration only; reasons must be authored and reviewed like any lesson text.*

### 10.2 Lesson variant (one per locale)

```json
{
  "id": "lesson_moon_tidal_locking__pt-BR",
  "conceptId": "concept_moon_tidal_locking",
  "locale": "pt-BR",
  "slug": "por-que-a-lua-mostra-sempre-o-mesmo-lado",
  "title": "Por que a Lua mostra sempre o mesmo lado?",
  "hook": "AUTHOR ORIGINAL HOOK",
  "summary": "AUTHOR ORIGINAL SUMMARY",
  "cardBlocks": [ { "type": "paragraph", "text": "AUTHOR ORIGINAL CARD TEXT (80–150 words)" },
                  { "type": "takeaway", "text": "AUTHOR VERIFIED KEY IDEA" } ],
  "deepDiveBlocks": [ { "type": "paragraph", "text": "AUTHOR ORIGINAL DEEP DIVE (≤400 words)" } ],
  "readingTimeSeconds": 60,
  "heroMedia": { "type": "image", "url": "/media/moon-orbit.svg",
                 "alt": "Ilustração da Lua orbitando a Terra",
                 "license": "original", "attribution": "CurioFeed" },
  "claims": [
    { "id": "c1", "text": "ATOMIC CLAIM AS WRITTEN IN THE LESSON",
      "highStakes": false,
      "support": [ { "sourceId": "src_example", "excerpt": "VERBATIM SUPPORTING EXCERPT FROM SNAPSHOT", "locator": "section/paragraph" } ],
      "autoVerdict": "supported", "humanVerdict": "approved" }
  ],
  "sourceIds": ["src_example"],
  "quizIds": ["q_moon_1__pt-BR", "q_moon_2__pt-BR"],
  "contentLicense": "TBD — see §5.6 decision",
  "generation": { "model": "MODEL_ID", "promptVersion": "draft-v3", "runId": "run_..." },
  "reviewStatus": "draft",
  "publicationStatus": "draft",
  "reviewedBy": null,
  "reviewedAt": null,
  "reviewAfter": null,
  "publishedAt": null,
  "updatedAt": "2026-10-22T00:00:00Z"
}
```

*Deliberately unpublished illustration.* Placeholder text and sources must be replaced by pipeline output and human review before any status change.

### 10.3 Other entities

| Entity | Required fields |
|---|---|
| `Topic` | `id`, `slug{pt-BR,en}`, `name{pt-BR,en}`, `description{pt-BR,en}`, `icon`, `accentColor`, `sortOrder` |
| `Cluster` | `id`, `topicId`, `slug{…}`, `title{…}`, `hook{…}`, `conceptIds[]` (ordered), `links[]` (to clusters, with reasons) |
| `Source` | `id`, `title`, `publisher`, `url`, `language`, `type` (primary / reference / news), `license?`, `accessedAt`, `snapshotHash` |
| `QuizQuestion` | `id`, `questionGroupId`, `conceptId`, `locale`, `prompt`, `options[]` (stable IDs), `correctOptionId`, `explanation`, `claimIds[]`, `status` |
| `UserPreferences` | `locale`, `showOtherLocale`, `timezone`, `interests[]`, `mutedTopics[]`, `sessionGoal`, `theme`, `reducedMotion`, `audioSpeed`, `voiceURI?`, `remindersOptIn`, `reviewOptIn`, `analyticsOptOut` |
| `ProgressEvent` | `eventId`, `userId?`, `deviceId`, `type`, `conceptId`, `locale`, `questionGroupId?`, `response?`, `occurredAt`, `schemaVersion` |
| `Bookmark` | `userIdOrLocalId`, `conceptId`, `saved`, `updatedAt` |
| `ReviewState` | `conceptId`, `questionGroupId`, `dueAt`, `intervalDays`, `correctStreak`, `lastReviewedAt`, `lastResult` |
| `Session` | `sessionId`, `startedAt`, `goal`, `completedConceptIds[]`, `endedAt?` |
| `Report` (P1) | `conceptId`, `locale`, `reason`, `details`, `createdAt`, `status`, `resolution?` |
| `EditorialAudit` | `targetId`, `actorId`, `action`, `before/after`, `timestamp` |

### 10.4 Event types

`lesson_opened`, `lesson_completed`, `quiz_answered`, `review_answered`, `bookmark_changed`, `trail_started`, `trail_step`, `deep_dive_opened`, `share_clicked`, `language_switched`, `topic_preference_changed`, `session_finished`.

- Do not count a card as read because it flashed in the viewport. Use an explicit "done" action or a documented conservative threshold; quizzes remain the strongest signal.
- Append-only local event log, for offline use and future sync.
- Never put free text (teach-back answers, search queries) into analytics.

### 10.5 P1 indexes

- `concepts.id` unique; `variants.slug + locale` unique; `variants.publicationStatus + locale + topicId`.
- `quizQuestions.conceptId + locale`.
- `users.email` unique, normalized.
- `progressEvents.userId + eventId` unique; `progressEvents.userId + occurredAt`.
- `reviewStates.userId + conceptId + questionGroupId` unique; `reviewStates.userId + dueAt`.
- `bookmarks.userId + conceptId` unique.
- `reports.status + createdAt`.

---

## 11. API CONTRACT (P1)

`/api/v1`, versioned JSON envelopes `{ data, meta, error }`, documented with OpenAPI. Public content stays a static CDN bundle; these endpoints exist for sync, admin, and clients that cannot use the bundle.

```http
# Public (cacheable, ETag)
GET  /api/v1/topics?locale=pt-BR
GET  /api/v1/clusters?topic=space&locale=pt-BR
GET  /api/v1/lessons?topic=space&cursor=…&limit=10&locale=pt-BR
GET  /api/v1/lessons/:slug?locale=pt-BR
GET  /api/v1/concepts/:id/related?locale=pt-BR
GET  /api/v1/search?q=lua&locale=pt-BR&limit=10

# Authenticated user
GET    /api/v1/me
PATCH  /api/v1/me/preferences
GET    /api/v1/me/bookmarks
PUT    /api/v1/me/bookmarks/:conceptId
DELETE /api/v1/me/bookmarks/:conceptId
POST   /api/v1/me/progress-events/batch
GET    /api/v1/me/reviews?dueBefore=…
GET    /api/v1/me/stats
GET    /api/v1/me/export
DELETE /api/v1/me
POST   /api/v1/reports

# Admin / editorial (role-gated)
POST  /api/v1/admin/concepts
PATCH /api/v1/admin/variants/:id
POST  /api/v1/admin/variants/:id/submit-review
POST  /api/v1/admin/variants/:id/publish
POST  /api/v1/admin/variants/:id/unpublish
GET   /api/v1/admin/reports
PATCH /api/v1/admin/reports/:id
```

**Rules:**
- Cursor pagination, capped page sizes.
- Strict server-side authorization.
- Event batches deduplicated by `eventId`, with accepted/duplicate/invalid reported explicitly.
- Authoritative stats are computed server-side from validated events; client-submitted counters are not trusted.

---

## 12. OFFLINE-FIRST, SYNC AND DATA SAFETY

### P0

- First visit caches the app shell and a bounded **starter pack** in the user's locale (e.g. the first trail of each topic). Further lessons are cached as viewed.
- IndexedDB stores preferences, events, bookmarks, review states and recent lessons.
- Offline: cached lessons, bookmarks, quizzes and reviews keep working. Uncached lessons show a friendly unavailable state.
- **Settings → Export / Import learning data** as versioned JSON, with validation and a conflict preview.
- Tell users plainly that guest progress lives on this device and can be cleared by the browser; offer export.
- PWA updates must never corrupt or delete progress. Use migrations with schema versions.

### P1 account sync

- Accounts are optional forever; never upload guest data silently.
- On opt-in, import local events idempotently by `eventId`. Bookmarks resolve by latest explicit action; review state is recomputed from merged events in stable order.
- Keep local data until the server acknowledges.
- Show sync status unobtrusively. Account delete erases server data per the disclosed retention policy, with a local wipe option.

---

## 13. ANALYTICS AND MEASUREMENT

You cannot improve retention you cannot see. Guest-first does not mean blind.

### Metrics

- **North star:** delayed recalls per weekly learner (§1).
- **Retention:** D1 / D7 / D30 returning learners (aggregate, cookieless).
- **Session:** sessions per week, session-goal completion rate, share of sessions using "No limit."
- **Learning:** quiz attempt rate, immediate vs delayed accuracy, review completion.
- **Trails:** trail start, step and completion rates; deep-dive open rate.
- **Growth:** share clicks, landing-page → app conversion, extension installs (P1).
- **Content quality:** per-question accuracy (items nearly everyone misses may be badly written), report rate per lesson, catalog-exhaustion rate per topic.

### Implementation rules

- Cookieless aggregate analytics behind an `Analytics` adapter, with an explicit allowlist of event names and properties.
- No persistent cross-session identifiers in guest mode (or use a provider's privacy mode that rotates them).
- No fingerprinting, no free text, no third-party ad or social pixels.
- **Settings → Privacy → "Send anonymous usage statistics"** toggle, on by default unless legal review says consent is required. Respect Do Not Track / Global Privacy Control.
- Document exactly what is collected on the privacy page, in both languages.
- **ACTION (founder):** confirm with Brazilian counsel whether this aggregate analytics setup can rely on legitimate interest under LGPD, or needs opt-in consent.
- The learning data itself (events, reviews) stays on the device in guest mode. Only aggregate pings leave it.

---

## 14. SECURITY, PRIVACY AND LEGAL

### Security

- HTTPS everywhere; security headers including a strict CSP.
- Render authored content from structured blocks; never inject untrusted HTML.
- Validate input at UI and API boundaries; safe error messages.
- Rate limit auth, reports and expensive endpoints; prevent account enumeration.
- httpOnly secure cookies, CSRF defense, least-privilege admin roles.
- Auth via a maintained library (§9.3).
- No secrets in bundles or the repo; LLM keys only in the authoring environment.
- **URL import (P2):** block private and loopback IPs, redirects to private hosts, file schemes and metadata endpoints; enforce size and time limits.
- **Extension:** minimal permissions, no remote code, no data exfiltration.

### Brazil: LGPD

- Privacy policy (pt-BR and en): controller identity and contact, data inventory, purposes, legal bases, retention, rights (access, export, deletion), and the contact for the person in charge of data (*encarregado*).
- Data minimization: guest mode collects no personal data beyond aggregate analytics.
- **ACTION:** confirm with counsel which obligations apply to a small operator, and whether a formal *encarregado* is required.

### Brazil: ECA Digital (Lei 15.211/2025)

- In force since **17 March 2026**, with a regulating decree (Decreto 12.880/2026) and enforcement by the ANPD.
- Applies to digital products aimed at, or **likely to be accessed by**, children and adolescents in Brazil, including those offered by companies based abroad. An anti-TikTok learning app is likely to be used by teenagers, so **assume it applies**.
- The product already aligns with much of its spirit: no ads, no behavioral profiling, no loot-box-style rewards, no manipulative engagement, privacy by default. Keep it that way.
- **Accounts (P1)** may require age-related handling (the law sets specific rules for younger adolescents, including guardian linkage and parental supervision tools). Native apps must also consider app-store age signals.
- **ACTION (founder):** legal review of age policy before public launch; record the result in `docs/DECISIONS.md`. Do not market to children under 12.

### English-speaking markets

- COPPA (US): no accounts for under-13s; guest mode collects no personal data.
- UK and EU (GDPR, UK Children's Code) apply if marketed there: re-check consent requirements for analytics.

### P0 legal pages

Privacy, Terms, and Credits (image and source attribution, content license), each in pt-BR and en, linked from Settings and the footer of public pages.

Collect minimal data and never sell learning history. Data export and delete are product features.

---

## 15. PERFORMANCE AND RELIABILITY

Measured on a mid-range Android phone over throttled 4G (the realistic Brazilian baseline), not only on desktop.

- **Prerendered lesson pages:** LCP < 2.0 s; total JS for the public page kept small.
- **App:** LCP < 2.5 s; CLS < 0.1; next-card response < 100 ms once loaded.
- Preload only the next 1–2 cards; lazy-load the rest. Optimize images; SVG for diagrams.
- Starter pack size budget documented and enforced (e.g. ≤ 3 MB).
- Designed empty, error, retry and offline states.
- PWA updates never corrupt progress.

---

## 16. TESTS AND ACCEPTANCE

### Unit

- Review interval transitions, including timezone and day-boundary edge cases.
- Feed ranking: muted topics, trail continuation, cluster adjacency, variety, exploration share, catalog exhaustion, locale fallback.
- Content schema validation: missing sources, claim without support, card over 150 words, missing locale keys, invalid answer IDs, fixtures excluded from build.
- Event export/import and idempotent merge; progress keyed by concept across locales.
- Quiz accuracy rollups (immediate vs delayed).

### Component / integration

- Onboarding persist and skip; language auto-detect and switch.
- Feed navigation via swipe, buttons and keyboard.
- Quiz → explanation → review scheduled.
- Trail mode enter/exit preserves feed position.
- Save persists across refresh; TTS voice/locale matching and fallback; session soft stop.

### Build checks

- **i18n completeness:** every UI key exists in pt-BR and en.
- **Prerender:** every published variant has a static HTML page with title, description, canonical, hreflang, OG image and JSON-LD.
- `content:validate` and a mocked `content:check-links` run in CI.

### E2E (Playwright)

1. New guest (pt-BR browser) gets a Portuguese UI, picks two interests, reads a card, passes a quiz, reloads, sees persisted stats.
2. Switching to English keeps saved lessons and review states.
3. Save a lesson, find it in Library after restart.
4. Five cards → soft stop → continue indefinitely for free.
5. Follow "next in this trail" through three lessons, then exit to the original feed position.
6. Offline: open a cached lesson and quiz; data remains after reconnecting.
7. Open a prerendered lesson URL with JavaScript disabled: content readable. With JavaScript: hydrates into the app.
8. iPhone and mid-range Android viewports: no horizontal overflow; nav and sheets usable; no truncated pt-BR labels.
9. Desktop keyboard navigation does not interfere with inputs and dialogs.
10. Automated accessibility checks (axe) show no serious violations in either locale.

### P0 release gates

- [ ] Installable PWA runs locally and on a deployment URL.
- [ ] **250 reviewed lessons per locale** across 5 topics, organized in trails, each with 2+ quiz questions, every claim mapped to a source; no fixtures or placeholders in production.
- [ ] Full pt-BR and en UI; language detection and switching work.
- [ ] No login, trial or payment needed for any core feature.
- [ ] Trails (lite), quizzes, source sheets, review scheduling, saves and settings persist through reload.
- [ ] Prerendered lesson pages with working previews in WhatsApp and iMessage; sitemap and hreflang valid.
- [ ] TTS works where supported, with correct-language voices or a clear fallback.
- [ ] Offline and export/import work.
- [ ] Aggregate analytics live, with opt-out and a privacy page that matches reality.
- [ ] Privacy, Terms and Credits pages in both locales; legal review of LGPD and ECA Digital posture done.
- [ ] README, deploy guide, `.env.example`; unit, build-check and E2E tests pass.
- [ ] No copied branding, UI or content; final product name chosen and cleared (§0.1).

### P1 gates

- [ ] Accounts via a maintained auth solution, with verification and recovery.
- [ ] Guest → account migration loses and duplicates nothing.
- [ ] Admin editorial workflow, content versioning and the correction ledger work.
- [ ] API validation, rate limits, indexes, pagination and authorization tested.
- [ ] Android app passes real-device tests; extension passes store review.

---

## 17. PHASED ROADMAP

| Phase | Scope | Output |
|---|---|---|
| **0. Foundation** | Monorepo, CI, domain schemas (concept / variant / cluster / claim / source), validator, i18n scaffolding, design tokens, PWA shell, fixtures | Green skeleton; `content:validate` working |
| **1. Guest MVP slice** | Onboarding → feed → card → quiz → review → save → progress, IndexedDB, both locales, trails-lite | Usable app on fixtures |
| **2. Content pipeline** | Pipeline tooling, review tool, link checker, content build; first pipeline runs; first 40 reviewed lessons | Real content flowing |
| **3. Public web** | Prerendered pages, OG images, SEO, share cards, offline/export, analytics, legal pages, polish, performance, E2E | **Public beta** at 250 lessons per locale |
| **4. Accounts and backend (P1)** | Auth, sync, admin, reports/corrections, curated paths, digest | Cross-device sync; content operations |
| **5. Reach (P1)** | Android app, browser extension, social video export | Distribution beyond the web |
| **6. iPhone and differentiators (P2)** | iOS app, Screen Time exploration (entitlement required), teach-back, knowledge map, BYO content, original video | App Store release after native review |

Content production (phase 2 onward) runs continuously in parallel with engineering.

---

## 18. PLATFORM CAPABILITIES

| Feature | Web/PWA | Browser extension | Android (Capacitor) | iPhone (Capacitor) |
|---|---|---|---|---|
| Feed, quizzes, saves, review | Yes | Single-card interstitial | Yes | Yes |
| Install | Add to Home Screen | Extension stores | Play Store | App Store |
| Offline | Within browser storage limits | N/A | Yes (separate storage) | Yes (separate storage) |
| Read aloud | Web Speech (device-dependent) | Web Speech | Web Speech or native TTS | Web Speech or native TTS |
| Reminders | Web push where supported (iOS only for installed web apps) | N/A | Native notifications | APNs |
| Interrupt doomscrolling | No | **Yes, for chosen websites** | Possible via usage access (check Play policy) | Only via Screen Time frameworks, with an approved Family Controls entitlement and native Swift work |
| Widgets | No | N/A | Native work | Native Swift work |

References:
- Capacitor — https://capacitorjs.com/docs
- Apple Family Controls entitlement — https://developer.apple.com/documentation/familycontrols/requesting-the-family-controls-entitlement
- Apple web push — https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers
- MDN SpeechSynthesisUtterance — https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance

---

## 19. COST CONTROL AND SUSTAINABILITY

- **P0 runs as a static site:** CDN-hosted prerendered pages, a versioned content bundle, and device TTS. No database query per swipe.
- **Content creation is the main cost.** Log LLM spend per lesson and per pipeline run; set a budget cap per run. Generation happens once, before publishing, never per page view.
- P1 database starts on a small managed tier; monitor bandwidth and traffic.
- If funding is ever needed, the promise stands: the **full core learning experience stays free and ad-free**. Prefer donations, grants, institutional or science-communication sponsorship (clearly disclosed, never inside lesson content) before reducing anything free.
- Operational telemetry tracks cost, content quality, crash rates and delayed-recall retention, not invasive tracking.

---

## 20. HANDOFF PROMPTS

Give the coding agent **one milestone prompt per run**, together with this file. Each prompt assumes previous milestones are complete and green.

**Common preamble (prepend to every milestone prompt):**
> Read `curiofeed_product_build_spec_v2.md` fully. Implement only the milestone below. Keep builds and tests green. Update `docs/IMPLEMENTATION_STATUS.md` and record deviations in `docs/DECISIONS.md`. Do not author published lessons or invent sources; use fixtures marked `"fixture": true`. pt-BR is the default locale and en must be complete. When finished, report what was built, commands run, test results, and what is deferred.

**M1 — Foundation.**
> Scaffold the monorepo (§9.5) with workspaces, lint, typecheck, test and build scripts, and CI. Implement Zod schemas and TypeScript types for Topic, Cluster, Concept, LessonVariant, Claim, Source, QuizQuestion and progress entities (§10). Implement `content:validate` with all checks in §5.7, including the 80–150-word card limit and claim→source mapping. Set up i18next with pt-BR and en and the key-completeness test. Add design tokens and the PWA shell. Create fixtures: 2 topics × 1 cluster × 4 concepts, both locales, marked as fixtures.

**M2 — Guest MVP slice.**
> Build onboarding (§3.1), the feed with swipe, button and keyboard navigation (§3.2), Go deeper sheet, quizzes (§3.3), review with the pure scheduling function (§3.4), bookmarks, Library, progress (§3.6), TTS with locale-matched voices (§3.7), finite sessions (§3.8), and trails-lite including trail mode (§3.9). Use `StaticContentRepository` and `IndexedDbProgressRepository`. Implement the cluster-aware ranking in §6 as a tested pure function. Add unit and component tests.

**M3 — Content pipeline tooling.**
> Build `tools/content-pipeline` (§5.5): provider-agnostic LLM interface, plan / research / draft / claims / verify stages writing to `content/drafts/`, source snapshots with hashes, and cost logging. Build the dev-only review tool at `/_review` (side-by-side locales, claim-by-claim excerpts, keyboard approve/edit/reject, reviewer log). Implement `content:check-links`, `content:dedupe`, `content:build` (excluding fixtures and unpublished variants), `content:stats` and `content:due-review`. Document everything in `docs/CONTENT_PIPELINE.md`. The pipeline must run without network access in tests (mocked providers).

**M4 — Public web and growth surface.**
> Prerender public lesson, topic and trail pages with localized URLs, canonical, hreflang, JSON-LD and OG meta (§7.1). Generate OG images at build (§7.2), sitemap and robots (§7.3), and share cards (§7.4). Add Privacy, Terms and Credits pages in both locales (§14). Add the cookieless analytics adapter with allowlisted events and the opt-out setting (§13). Add build checks and E2E scenario 7.

**M5 — Offline, polish and beta readiness.**
> Implement PWA caching with the locale starter pack, offline states and export/import (§12). Finish accessibility (§8), dark mode, desktop layout, and performance budgets (§15). Complete all E2E scenarios (§16). Write `README.md` and `docs/DEPLOYMENT.md`, and deploy to a static host. Produce a checklist of remaining P0 release gates that depend on content volume or legal review.

**M6+ — P1 milestones** (accounts and sync, admin and corrections, Android, extension, social export): write individual prompts when P0 is live.

**C1 — Content pipeline run (separate from coding runs).**
> Using `tools/content-pipeline`, plan clusters for topic `<TOPIC>` following §5.2–5.4: 5–8 concepts per cluster, Brazil-relevant where natural, pt-BR first. Stop after planning for human outline approval. After approval, research, draft both locales from stored source snapshots only, extract claims with excerpts, run verification, and write results to `content/drafts/`. Never mark anything reviewed or published. Report the cost per lesson, claims flagged unsupported, and sources that failed fetching.

### Commands expected by the end of P0

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run test:e2e
npm run build            # includes content:build and prerender
npm run preview
npm run content:validate
npm run content:check-links
npm run content:stats
```

**Final acceptance:** someone in Brazil taps a WhatsApp link, sees a rich preview, reads a fast lesson page in natural Portuguese, follows a trail into the app, learns something verifiable, listens if their phone supports it, tests themselves, returns days later for reviews, and keeps their progress. The same works in English. All without an account, a trial timer, an ad, or a payment.

---

## APPENDIX A — CHANGES FROM v1

1. **Content pipeline promoted to P0 infrastructure** (§5): claim-level verification against source snapshots, separate verification pass, human review tool, link checker, dedupe, cost logging. The coding agent no longer writes published lessons.
2. **Cluster-based authoring** (§5.3) makes Curiosity Trails (lite) a **P0** feature (§3.9) and feeds cluster-aware recommendations (§6), including catalog-exhaustion handling.
3. **Narrow-and-deep launch** (§5.2): 5 topics with trails, 250 lessons per locale at beta, instead of 10+ thin topics with 36–150 lessons.
4. **pt-BR first, English first-class** throughout: concept + locale-variant model, progress keyed by concept, localized URLs, hreflang, voice matching, layout for longer pt-BR strings, Brazil-relevant trails.
5. **New distribution section** (§7): prerendered pages, OG images, SEO, share cards, social video export, browser extension, Android before iOS.
6. **Card body capped at 80–150 words** so it fits one screen; longer text moves to Go deeper (≤400 words).
7. **New analytics section** (§13): north-star metric, cookieless aggregate analytics with opt-out.
8. **Legal** (§14): LGPD, ECA Digital (in force since March 2026), COPPA, and P0 legal pages.
9. **Auth:** maintained library instead of hand-rolled primitives; Supabase/Postgres noted as an acceptable alternative to Mongo.
10. **Handoff split into milestone prompts** (§20) plus a separate content-pipeline prompt.
11. **Competitive section expanded** (§2) with other apps observed in the category; name-conflict note (§0.1).
