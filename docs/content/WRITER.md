# Writer session instructions (`write-v1`)

You are writing lesson drafts for the app's library. Read `docs/SPEC.md` §5.1–5.4 (quality bar, bilingual authoring) and the content schemas in `packages/domain/src/schemas/content.ts`. Work in `content/drafts/`; never edit `content/lessons/` and never mark anything reviewed or published.

## 1. Plan (stop for approval)

Propose one trail: a title and one-line hook in both locales, 5–8 lessons in order (each: question-style title, one-sentence answer, why it follows the previous one), and 1–3 links to existing trails. Prefer Brazil-relevant angles where natural (§5.2). Check `pnpm content:dedupe` and `content/lessons/` for overlap. **Stop and wait for the founder's approval or edits.**

## 2. Sources

For each lesson:

- Find authoritative sources: primary research, agencies and universities (NASA, INPE, Fiocruz, IBGE, university pages), reputable references. Use `pnpm content:sources refs en "<Wikipedia title>"` (or `pt`) to find what Wikipedia cites; cite those, not Wikipedia, unless nothing better exists for a low-stakes claim (§5.6).
- Save each one with `pnpm content:sources fetch <url> …`. **Only cite sources you fetched**; if a fetch fails (paywall, robots, PDF), choose another.
- Surprising or high-stakes claims need two sources from different publishers.
- Edit the saved `content/sources/<id>.json` only to correct `publisher`, `type` (`primary` / `reference` / `news`) or `license`.

## 3. Write (pt-BR first, then en)

Write only from the saved snapshots (`content/sources/.snapshots/<id>.txt`); add nothing you cannot point to there. Create, per lesson `<key>` (snake_case):
`content/drafts/lessons/<key>/concept.json`, `variant.pt-BR.json`, `variant.en.json`, `quiz.pt-BR.json`, `quiz.en.json` (and `content/drafts/clusters/<cluster>.json` for a new trail). Copy the structure of an existing lesson in `content/lessons/`.

- **Your own words only.** Never adapt the wording of Wikipedia or any other source: lesson text is all rights reserved (D21). Keep `contentLicense: "pending"`; the review tool sets the license.
- **pt-BR reads as native Brazilian Portuguese**, not translation; en is written from the same sources, not translated word for word.
- Title: a question that hooks. `hook`: one line. `summary`: the answer in one sentence. `cardText`: 1–2 sentences, 12–40 words, answering the title (the Discover card). Card body: 80–150 words, one idea: narrative or analogy → the essential fact → a surprising or practical implication. Takeaway ≤ 25 words. Deep dive ≤ 400 words with headings.
- Explain uncommon words. No sensationalism; mark hypotheses and disputes. No medical, financial or legal advice. Date-sensitive lessons get `reviewAfter`.
- Quizzes: 2–3 questions per locale, 3–4 options, one correct, an explanation, a `misconception` where useful; pair locales with `questionGroupId`.
- `related`: 2–4 links with a one-line reason per locale. `heroMedia`: an existing illustration ID or `fixture`; pictures are added later with `pnpm media:add`.
- `generation`: `{ "model": "claude-code (<model ID>)", "promptVersion": "write-v1", "runId": "<YYYY-MM-DD>-<cluster>" }`. `reviewStatus`/`publicationStatus`: `"draft"`; `contentLicense`: `"pending"`; `reviewedBy`/`reviewedAt`/`publishedAt`: `null`.

## 4. Claims

Split every factual statement in the card text, card body, takeaway and deep dive into atomic `claims`. Each claim's `support` lists `{ sourceId, excerpt }` where **the excerpt is copied verbatim from the snapshot** (a sentence or two; the checker matches it). Set `highStakes: true` for surprising, health, safety or disputed claims (two publishers). Set `autoVerdict` and `humanVerdict` to `"pending"`. Each quiz question lists the `claimIds` it tests.

## 5. Check and hand off

Run `pnpm content:check-drafts` and `pnpm content:dedupe`; fix every error. Then end your session with a short list of the drafts and the sources used. **The verifier must be a new session** that has not seen this one.
