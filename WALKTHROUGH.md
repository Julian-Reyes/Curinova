# Walkthrough: how this app is being built

This document explains, in plain English, what has been built, why, and how the pieces fit together. It's written for founders, partners, associates and future developers, so you don't need to be an engineer to follow it. Technical terms are explained the first time they appear.

> **About the name.** The app is currently called "CurioFeed", but that is a **working title** that will change before launch (other apps already use "Curio"). Inside the code, everything permanent uses the neutral codename **lumen**. Renaming the app later is a one-line change; see [Renaming the product](docs/DECISIONS.md#renaming-the-product).

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
- **Node 24.** Node runs our tools. The spec said version 22, but the founder chose 24 because 22 stops receiving long-term support in April 2027.
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

_(This section is written as Stage 2 is built.)_

---

## 5. How to run it yourself

You need a Mac, Windows or Linux computer with **Node 24** installed.

```bash
corepack enable        # one-time: turns on pnpm
pnpm install           # downloads the building blocks (a few minutes the first time)
pnpm dev               # starts the app
```

Then open the address it prints (usually http://localhost:5173).

**On your phone:** connect it to the same Wi-Fi as the computer and open the "Network" address that `pnpm dev` prints (something like `http://192.168.1.20:5173`). Offline mode and "install" need a secure connection, so they only work on `localhost` or a real deployment, but everything else works over Wi-Fi.

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
