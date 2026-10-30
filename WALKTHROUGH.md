# Walkthrough: how this app is being built

This document explains, in plain English, what has been built, why, and how the pieces fit together. It's written for founders, partners, associates and future developers, so you don't need to be an engineer to follow it. Technical terms are explained the first time they appear.

> **About the name.** The app is currently called **"Curinova"**. That is a **working title**: the final name still needs trademark and domain checks before launch. Inside the code, everything permanent uses the neutral codename **lumen**, so renaming the app is a one-line change; see [Renaming the product](docs/DECISIONS.md#renaming-the-product).

---

## Contents

1. [The big picture](#1-the-big-picture)
2. [How the work is organized](#2-how-the-work-is-organized)
3. [Stage 1 (M1): the foundation](#3-stage-1-m1-the-foundation)
4. [Stage 2 (M2): the interactive prototype](#4-stage-2-m2-the-interactive-prototype)
5. [How to run it yourself](#5-how-to-run-it-yourself)
6. [Glossary](#6-glossary)

---

## 1. The big picture

**What we're building:** a free app where you swipe through short, fascinating, _verifiable_ ideas, one card at a time, instead of mindless scrolling. Each card takes under two minutes, offers a quick quiz, and connects to related ideas ("trails"). The app measures what you _remember days later_, not how long you stay.

**Who it's for first:** Brazil, in Brazilian Portuguese. English is a full second language, not an afterthought.

**How it's delivered:** as a website that can be "installed" on a phone like an app (a _PWA_, or Progressive Web App). Android and iPhone apps come later, built from the same code.

**What it costs to run:** close to nothing. The app is a set of static files. There's no server to pay for, no database, and no paid AI service. Your learning progress is stored on your own device.

The full product specification lives in [`docs/SPEC.md`](docs/SPEC.md). Every decision that refines or departs from it is in [`docs/DECISIONS.md`](docs/DECISIONS.md).

---

## 2. How the work is organized

The spec splits the work into **milestones** (M1, M2, …). Each one ends with everything working and tested before the next begins.

The working rhythm for every milestone:

1. **Plan, then stop.** The coding agent reads the spec and proposes a plan: what it will build, which tools it will use, any changes to the spec, and open questions.
2. **The founder approves** (or adjusts) the plan.
3. **Build in small steps.** Each step is saved as a separate _commit_ (a labeled snapshot in Git, the version-history tool), so any step can be reviewed or undone on its own.
4. **Check everything.** Automated checks run after every step (see "the safety net" below).
5. **Write it down.** Decisions go into `docs/DECISIONS.md`, progress into `docs/IMPLEMENTATION_STATUS.md`, and the story into this file.

### The repository at a glance

Think of the repository (the project folder) as a small company with departments:

| Folder                    | What lives there                                                                                             | Analogy            |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------ |
| `apps/web/`               | The app people actually use                                                                                  | The shop floor     |
| `packages/domain/`        | The core rules: what a "lesson", "quiz" or "review" _is_, and the logic around them. No screens, no storage. | The rulebook       |
| `tools/content-pipeline/` | Tools for producing and checking lessons                                                                     | Quality control    |
| `content/`                | The lessons themselves, as data files                                                                        | The library        |
| `docs/`                   | Spec, decisions, status                                                                                      | The filing cabinet |

The rulebook is kept separate from the shop floor on purpose: the same rules will later power the Android app and a browser extension without being rewritten.

---

## 3. Stage 1 (M1): the foundation

**Goal:** set up everything a real product needs _before_ building features: project structure, quality checks, data definitions, language support, visual design basics and an installable app shell.

### Step 1: Project skeleton and tools

**What:** created the project as a _monorepo_ (one repository holding several related packages) using **pnpm**, a tool that installs the open-source building blocks the project depends on.

**Key choices:**

- **TypeScript in strict mode.** TypeScript is JavaScript with types: it catches whole classes of mistakes (like passing a number where text was expected) before the code ever runs. "Strict" turns on every safety check.
- **Node 24.** Node runs our tools. The spec said version 22, but the founder chose 24 because 22 stops receiving long-term support in April 2027. On 25 October 2026 the minimum was raised to **24.22.1**, a security release that fixes a flaw in how Node decompresses Brotli-compressed data (CVE-2026-111497). The project now refuses to install on an older Node.
- **Latest compatible versions.** Some brand-new versions of tools weren't compatible with each other yet, so we picked the newest set that works together. For example, the routing library stays on version 7 because that's what was approved, and the newest TypeScript (7) isn't yet supported by the code checker. Exact versions are recorded in `pnpm-lock.yaml`.

**The safety net:** five commands that must pass before every commit:

| Command                 | Plain English                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------------- |
| `pnpm typecheck`        | "Does all the code fit together correctly?"                                               |
| `pnpm lint`             | "Does it follow our rules and formatting?" (for example: _no hard-coded text in screens_) |
| `pnpm test`             | "Do all the automated tests pass?"                                                        |
| `pnpm content:validate` | "Is every lesson file correct and safe to show?"                                          |
| `pnpm build`            | "Can we produce the finished app?"                                                        |

### Step 2: The rulebook (data definitions)

**What:** precise definitions of every kind of data in the product, written with a library called **Zod**. Each definition is also a _checker_: give it a file and it says exactly what's wrong.

The main things defined:

- **Topic** (for example "Space"), with names and descriptions in both languages.
- **Trail** (called a _cluster_ in the spec): an ordered path of related lessons, such as "How the Moon shapes Earth".
- **Concept**: one idea, independent of language.
- **Lesson variant**: the concept written up in _one_ language. Each concept has a pt-BR variant and an en variant. They're written natively, not machine-translated.
- **Claim and Source**: every factual statement in a lesson is a "claim" that must point to a real source with a quoted excerpt.
- **Quiz question**: 3–4 options, exactly one correct.
- **Your data**: preferences, bookmarks, progress events, review schedules, sessions.

**An important design rule:** your progress is attached to the _concept_, never to the language version. If you learn about tides in Portuguese and then switch the app to English, your progress, saves and review schedule all carry over. A test enforces this.

### Step 3: Content quality control (`content:validate`)

**What:** a checker that reads every lesson file and refuses anything that breaks the rules. It reports problems precisely, for example:

```text
content/lessons/tides/variant.pt-BR.json › cardBlocks: card body has 162 words (allowed 80–150)
```

**What it checks:**

- Every file matches its definition, and there are no misspelled field names.
- Web addresses ("slugs") are simple, unaccented and unique (`por-que-a-lua-mostra-sempre-o-mesmo-lado`).
- Published lessons exist in **both** languages. Drafts may start in one.
- Card length is 80–150 words. The optional one-line "takeaway" is counted separately (25 words max). The deeper explanation is 400 words max.
- Each lesson has 2–3 quiz questions, each with exactly one correct answer, and every question is paired with its counterpart in the other language.
- Every claim is linked to at least one source excerpt. Surprising or high-stakes claims need **two independent sources**, meaning different sources from different publishers.
- License information is present, and nothing can be published while the license is still "pending".
- Test data ("fixtures", see below) can never mix with real content.

Drafts get _warnings_ where published lessons get _errors_: you can work on a draft freely, but you can't publish it until it's complete.

There are 45 automated tests for this checker, at least one for every kind of mistake it's supposed to catch.

### Step 4: Fixtures (obviously fake test lessons)

**What:** 8 fake lessons (2 topics × 1 trail × 4 lessons, in both languages) used only for testing.

**Why they look so fake:** every title starts with `FIXTURE:`, the text openly says it's test text, and the "sources" point to `example.invalid`, an address reserved so it can never exist on the internet. The checker _enforces_ this, so test text can never be mistaken for real knowledge. Fixtures are automatically excluded from anything users see in production.

One fixture is deliberately the worst case (a 150-word card plus a 25-word takeaway) so we can test whether the longest allowed card still fits on a small phone.

### Step 5: Routing and offline support

**Routing** decides which screen appears for which web address. The founder chose **React Router 7** in "framework mode", which can also produce ready-made HTML pages at build time (_prerendering_). That matters later: when someone shares a lesson link on WhatsApp, the preview needs a real title and image, and prerendered pages provide that.

**Offline/installable app (PWA):** a _service worker_ is a small background script that saves the app's files on the phone so it opens instantly and works without internet. We hit a known clash: the service-worker tool ran _before_ the router finished writing its pages, so the offline copy was missing the main page. The fix is a small hook that rebuilds the offline file list at the very end. It was tested first, as agreed, and the app is verified as installable.

### Step 6: Languages (i18n)

**i18n** ("internationalization") means every piece of text on screen comes from a language file instead of being typed into the code. We use **i18next**.

- Portuguese (pt-BR) is the default. If your phone's language is any form of Portuguese you get pt-BR, otherwise English. You can switch anytime.
- **A test fails the build if any text exists in one language but not the other.** English can never be "mostly done".
- The lint rule blocks hard-coded text in screens.
- The app's display name is never typed into the language files. They use a placeholder, `{{appName}}`, filled in from one constant, so the rename stays a one-line change.

### Step 7: Visual design foundations

**Design tokens** are named design values (colors, corner radius, spacing, animation speed) defined once and reused everywhere:

- **Light theme:** the spec's palette (warm off-white background, deep teal, mint accent, dark green ink).
- **Dark theme:** its own palette, not an inversion, so it stays calm and readable at night.
- **Accessibility built in:** an automated test checks every text/background color pair against WCAG AA, the standard contrast level for readability. It caught two pairs that were slightly too faint. We fixed them without changing the brand colors.
- **Fonts:** _Fraunces_ (an editorial serif) for headlines and _Inter_ (highly legible) for body text. Both are free and open-licensed, hosted with the app (no Google Fonts calls), and cover every Portuguese accent (ã, ç, é, ô…).
- **Reduced motion:** if your phone asks apps to minimize animation, all animations switch off.

### Step 8: The app shell and the first visual check

M1 ended with an "under construction" screen that already had working language and theme switches, installability, and the five navigation tabs shown as **"Em breve / Soon"** (deliberately disabled, never broken).

We then used **Playwright**, a tool that drives a real browser automatically, to open the app at iPhone, small-iPhone, mid-range-Android and desktop sizes in both languages and both themes. It took screenshots, checked that nothing spills off the side of the screen, and confirmed the app is installable.

_Note:_ this development Mac runs macOS 13, which Playwright's own browsers no longer support, so local tests use the installed Google Chrome and _imitate_ an iPhone. Real Safari-engine testing runs in the cloud CI.

### Step 9: Automatic checks in the cloud (CI)

**CI** ("continuous integration") means the safety-net commands run automatically on GitHub every time code is pushed. The workflow is written (`.github/workflows/ci.yml`), but the project isn't connected to GitHub yet, by the founder's choice, so it hasn't run there.

---

## 4. Stage 2 (M2): the interactive prototype

**Goal:** turn the foundation into an app you can actually use and judge: open it on a phone, swipe through real ideas, take quizzes, save lessons, and see your progress.

### Step 10: The rules behind learning (review, feed and stats)

Before any screens, three pieces of pure logic were built and tested in the rulebook (`packages/domain`), so the Android app and browser extension can reuse them later:

- **Spaced review.** When you answer a quiz question, it comes back the next day. Each time you get it right on schedule, the gap grows: 3 days, then 7, 14, 30 and 60. Get it wrong and it comes back tomorrow. Three correct reviews in a row count as "mastered". "Tomorrow" means your next calendar day, so travelling across time zones never counts a day twice.
- **The feed order.** No AI, no tracking: a transparent recipe. Trails are always read in order; your chosen interests come up more often; roughly one card in four is something outside them, so you keep discovering; never three cards in a row from the same topic. Each card says _why_ it's there: "Because you chose Space", "Continues your trail" or "Something new". When you've seen everything, the app says so honestly instead of quietly repeating cards.
- **Progress numbers.** Everything on the "You" screen is counted from what you actually did. Quiz accuracy is shown two ways: right after the lesson, and when you remember it **3+ days later**. That second number is the one that matters, and it's the product's north star.

### Step 11: Sample lessons

There are 20 sample lessons, one 4-lesson trail for each of the five launch topics:

| Topic            | Trail                                                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Space            | How the Moon shapes Earth (why we see one face, two tides a day, days getting longer, why eclipses are rare)                   |
| Brain & Behavior | How memory works (the forgetting curve, spacing, testing yourself, sleep)                                                      |
| Human Body       | The body that renews itself (red blood cells, the stomach lining, bone, the "7 years" myth)                                    |
| Everyday Science | Kitchen chemistry (browning, onion tears, salt in pasta water, boiling at altitude)                                            |
| History          | How Portuguese became Brazil's language (Tordesillas, the Tupi-based _língua geral_, Pombal's decree, Tupi words we still use) |

Each lesson is written natively in Brazilian Portuguese and in English, with a deeper explanation, two quiz questions and links to related lessons. Brazil appears naturally: Sobral's 1919 eclipse, the pressure cooker and beans, Nheengatu.

**Important honesty rule:** these lessons stick to well-established facts, but they have **not** been through source checking or human review yet. So they are stored as _drafts_ with **no** sources listed, because the agent never invents citations. In the app, every card carries a small "Prévia / Preview" chip, and the sources sheet explains this plainly. The content pipeline (M3) will attach real sources, and a human reviewer will approve each one before anything is published.

### Step 12: The app's memory (storage on your device)

With no account, everything is saved in your browser's built-in database (IndexedDB), under the permanent name `lumen`: your preferences, saves, quiz answers and review schedule. Nothing is sent anywhere. If the browser blocks storage (some private modes do), the app still works and shows a banner saying progress won't be saved. Settings has a "Delete my data from this device" button with a confirmation.

### Step 13: The screens

- **Welcome (onboarding):** pick a language, see a preview of a real card, choose interests ("Surprise me" if none), a goal and how many cards per session, then a theme. Every step can be skipped; there's no sign-up and no permission prompts.
- **Discover (the feed):** one card at a time. Swipe up or down, use the buttons, or use the arrow keys on a computer. Each card shows its topic, its place in a trail, why you're seeing it, reading time, an original illustration, the idea itself and a one-line takeaway. Four actions: **Listen** (read aloud by your device, only with a voice in the lesson's language), **Save**, **Quiz** and **Go deeper**. "Next in trail" jumps into the trail.
- **The soft stop:** after your session size (5 by default), a friendly pause: "Nice work, you explored 5 ideas." Review, keep exploring (always free, never a quota), change your goal, or stop.
- **Trail mode:** follows one trail in order, with a progress bar and an "Exit trail" button that takes you back to exactly where you were in the feed.
- **Explore:** search (accents don't matter: "coracao" finds "coração"), topic cards with progress, and topic pages with trails first, a lesson list, and Follow or Mute.
- **Review:** what's due now, a low-pressure "Review 5" button, recently learned questions with their next date, and mastered ones. If you learned in Portuguese and switched to English, the questions appear in English and your schedule is unchanged.
- **Library:** Saved, History and Completed.
- **You:** your numbers, plus "active days this week". Deliberately **no streak to lose** and no guilt messages.
- **Settings:** language, theme, reduced motion, session size, interests and muted topics, reading speed and which voices your device has, reviews on/off, privacy and deleting your data.
- **On a computer:** navigation moves to a sidebar, the feed sits in the middle, and a side panel shows the current trail and related lessons.

### Step 14: Looking at it with a robot, then fixing what looked wrong

A script drove a real Chrome browser through the whole app at iPhone, small-iPhone, Android and desktop sizes, in both languages and both themes, and took screenshots. Reviewing them found real problems, which were fixed:

- Card text was cut off on phones, hiding the takeaway. The layout was rebuilt so the illustration shrinks to give the text room, and if a card is _still_ too long, the text scrolls inside the card with a soft fade at the bottom as a hint.
- On the small iPhone, the illustration was drawn on top of the text (a styling conflict).
- The topic name was squashed ("CÉREBRO & COMPO…"), and the "why you're seeing this" line lost its end.
- On desktop, the up/down buttons covered the side panel.
- The "You" screen briefly showed zeros while loading.
- Small things: "back" links below page titles, wrong singular/plural wording, the welcome button pushed off small screens.

**The one thing that needs a founder decision:** a script measured all 20 lessons on each phone size. On a standard iPhone (390×844) every card fits. On a mid-range Android almost all do. On the small iPhone SE most don't: at a readable text size, it fits about 60–75 words, and the spec asks for 80–150. The options are written up in `docs/DECISIONS.md` (P6).

### Step 15: Automated tests

- **165 unit and component tests**, covering the review schedule, time zones, feed order, statistics, storage, search, voice matching, the quiz screen, both languages being complete, and color contrast.
- **45 browser tests per run** on four device sizes, acting like a real person: onboarding in Portuguese, passing a quiz, reloading and seeing stats; switching to English and keeping saves and reviews; a save surviving a restart; the soft stop after five cards; following a trail and returning to the same spot; arrow keys that don't fire while typing; nothing spilling off the screen; the app being installable.

### Step 16: Testing on a real phone, and the founder's decisions (26 October)

The founder opened the app on an iPhone over Wi-Fi and sent screenshots. They showed two bugs:

- **"This browser is blocking storage."** The browser wasn't actually blocking anything. Over plain `http://` (as on a home Wi-Fi network), browsers switch off one modern function the app used to create IDs, so every save failed. The app now falls back to an older method that works everywhere. Real deployments use `https://`, so users wouldn't have hit this, but it made the phone test misleading.
- **The bottom of each card was hidden.** The warning banner took space at the top, and the feed didn't shrink to make room, so the card's buttons slid under the navigation bar. The feed now measures any banner and fits itself below it.

The founder also made two decisions:

1. **Cards never scroll.** If a lesson doesn't fit on the screen, the text fades out and a **"Continue reading"** button appears; the takeaway and the buttons always stay visible. "Continue reading" opens the "Go deeper" panel starting with the full text. Also, **tapping anywhere on a card** opens "Go deeper".
2. **What the onboarding goal does:**
   - _Explore_ mixes in more different subjects and surprises.
   - _Learn deeply_ keeps you moving along trails, lesson after lesson.
   - _Remember more_ returns to trails you've started, highlights the Quiz button, and, when reviews are waiting, shows a clearly labeled "Time to remember" card in the feed. Reviews are never disguised as new lessons.

A measurement worth knowing: phone browsers' address bars and toolbars take about 190 pixels, so in a browser most lessons show "Continue reading". **Added to the Home Screen** (installed), the app gets the full screen and the lessons show whole.

### Step 17: Putting it on the internet (26 October)

The app is published free on **GitHub Pages** at **https://curinova.julianreyes.dev**:

- **Every push to `main` is checked first.** The automatic checks and browser tests run on GitHub's computers. Only if everything passes is the new version published; otherwise the live site stays as it was.
- **Why a subdomain:** the app will eventually need a domain of its own. Living at the root of `curinova.julianreyes.dev` means moving later is just a DNS change, with no code changes. One caveat: browsers tie saved progress to the domain, so a future move needs the planned "export/import my data" feature first.
- **A fix from the first cloud run:** the browser tests hung for 14 minutes downloading Safari-engine libraries from Ubuntu's servers. They now run inside Playwright's ready-made image, which already contains everything, and every job has a time limit so it can never hang for hours again.

The step-by-step setup is in [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md).

### Step 18: Stepping back to ask "is it compelling?" (M2.5, 26 October)

The app worked, but on a phone browser almost every card ended in "Continue reading", the pictures disappeared, and every card looked the same. Before building the content pipeline, the founder asked for an audit and for design experiments that couldn't put the working app at risk.

- **A separate workspace.** The experiments live on their own branch (`feature/m2-5-ux-overhaul`) in a second folder next to the project (a Git "worktree"), so the running app and `main` are untouched.
- **The audit** (`docs/M2_5_UX_OVERHAUL.md`) found that each lesson already has a one-line curiosity hook and a one-sentence answer, but the feed never showed either. Together they are 23–40 words: a complete idea per swipe, with the longer text moving behind "Go deeper".
- **The Design Lab** (`experiments/m2-5/`) is three clickable prototypes built from the real sample lessons: _Folio_ (a magazine page), _Aurora_ (full-screen art) and _Clarity_ (one number, one question, tap to reveal). It runs on its own small server on port 5373, which a phone on the same Wi-Fi can open.

### Step 19: Building the chosen design into the app (M2.5, 28 October)

The founder chose Concept E and approved its integration plan (D15). The first build session moved the app to E's look without changing how it stores your progress:

- **Colours and type.** Warm "paper" pages, near-black ink and one accent colour per topic replace the mint palette; headings use Inter Tight. A test checks that every text colour is readable on its background, in both themes.
- **Pictures in lessons.** A lesson can now carry three pictures (the Discover card, Go Deeper and Review), each with a description for screen readers in both languages and a record of where it came from. AI-generated pictures are recorded but not credited on screen; licensed photos get a one-line credit. `pnpm media:add <folder>` crops and compresses new pictures, and the content check refuses any picture whose origin or description is missing. Pictures you have already seen stay available offline; otherwise the lesson's own diagram appears.
- **The Discover card** is now a full-screen picture with the topic, why the card is there, the title, a short card text written for every lesson (and approved by the founder), "Dive in", and a Save / Listen / Quiz rail.
- **Go Deeper** opens full-height: picture, the big picture, key takeaways, how it works, the longer explanation, sources, related lessons and the next lesson in the trail.
- **A bug the tests found.** Pressing the down arrow while the feed was still sliding was sometimes ignored. Now every press counts, and a slide the browser abandons finishes anyway.

### Step 20: The rest of the app (M2.5, 28 October)

The second build session brought every other screen into the same design:

- **Explore** has a picture tile for each topic with a bar showing how much you've explored; a **topic page** opens with the topic's picture, a Follow button, its trails (with a step-by-step progress strip) and its lessons as small Discover-style cards. Topic pictures follow the same rules as lesson pictures; the Webb telescope photo carries its required credit.
- **Review** shows how many questions are ready, then runs full screen: the topic, the question in large type and the lesson's picture come first, then the options, then the answer and why on the topic's colour. The questions and the review schedule are the same as before.
- **Library** shows counts on its tabs; **You** shows four numbers, how much you remember days later (with how many answers that's based on), the last seven days as circles, and progress per topic.
- **Welcome** shows a real Discover card.
- **A final check** measured every Discover card in both languages on four screen sizes (all 160 fit completely), every button's tap area, and the colour contrast, and fixed what fell short. Details: `docs/M2_5_INTEGRATION_PLAN.md` §7.

### Step 21: The founder's review screen (M3, 30 October)

Lessons are written and fact-checked by two separate AI sessions (`docs/CONTENT_PIPELINE.md`), but nothing reaches learners until the founder has read it. The review screen is where that happens. It exists only on the developer's own computer (`pnpm dev`, then `/_review`) and is never part of the published app.

- **The queue** lists every trail and lesson waiting for review, how the fact-checker judged each claim, and why a lesson can't be opened yet (for example, an unverified claim, or a source whose saved copy is missing on this computer). It also shows the median minutes spent per lesson language against the target of four.
- **A lesson** shows Portuguese and English side by side, drawn with the app's real Discover card, Go Deeper and quiz, so you see exactly what a learner will see. Answering the quiz there doesn't touch your own progress. Each claim is highlighted in the text and listed with the source's words, a link to the source and the surrounding passage from the saved copy. The fact-checker's report sits in a side panel.
- **Decisions** are keyboard-first (`j`/`k` to move, `a` approve, `e` edit, `r` reject with a note, `n` note, `[`/`]` previous/next lesson, `?` for the list), and every key also has a button. Approving a language moves it into the library as reviewed, under the "all rights reserved" licence (D21). Publishing is a separate step that puts both languages live together. Rejecting leaves a note for the writer. Every change is checked first, and refused if it would break the library. Every decision is logged in `content/review-log.jsonl`.

---

---

## 5. How to run it yourself

You need a Mac, Windows or Linux computer with **Node 24** installed.

```bash
corepack enable        # one-time: turns on pnpm
pnpm install           # downloads the building blocks (a few minutes the first time)
pnpm dev               # starts the app
```

Then open the address it prints (usually http://localhost:5273).

**On your phone:** connect it to the same Wi-Fi as the computer and open the "Network" address that `pnpm dev` prints (something like `http://192.168.1.20:5273`). Everything works over Wi-Fi except offline mode and "Add to Home Screen" installation, which browsers only allow on `localhost` or a secure (https) deployment.

To try the production version instead: `pnpm build`, then `pnpm preview`, then open the "Network" address it prints (port 4273).

---

## 6. Glossary

| Term                  | Meaning                                                                              |
| --------------------- | ------------------------------------------------------------------------------------ |
| **Build**             | Turning source code into the finished files a browser loads.                         |
| **CI**                | Automatic checks that run in the cloud on every change.                              |
| **Commit**            | A saved, labeled snapshot of the project in Git.                                     |
| **Component**         | A reusable piece of a screen (a button, a card).                                     |
| **Concept / variant** | A concept is one idea; a variant is that idea written in one language.               |
| **Fixture**           | Obviously fake test data, never shown to real users.                                 |
| **i18n**              | Internationalization: keeping all text in per-language files.                        |
| **Lint**              | Automatic code-style and rule checking.                                              |
| **Monorepo**          | One repository containing several related packages.                                  |
| **Prerender**         | Producing ready-made HTML pages ahead of time so links preview well and load fast.   |
| **PWA**               | Progressive Web App: a website you can install like an app, and that works offline.  |
| **Schema**            | A precise definition of what a piece of data must look like.                         |
| **Service worker**    | A background script that stores the app on the device for speed and offline use.     |
| **Slug**              | The readable part of a web address, e.g. `por-que-a-lua-mostra-sempre-o-mesmo-lado`. |
| **Token (design)**    | A named design value such as a color or spacing step.                                |
| **Trail (cluster)**   | An ordered path of 4–8 connected lessons.                                            |
