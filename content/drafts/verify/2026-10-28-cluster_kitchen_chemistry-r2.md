# Verifier recheck: Kitchen chemistry (`cluster_kitchen_chemistry`)

- Instructions: `verify-v1` (`docs/content/VERIFIER.md`), applying the founder's clarified bar of 2026-10-29: block incorrect claims, misleading explanations, unsupported numbers, and ambiguous quiz answers; treat minor wording and citation improvements as editorial notes.
- Verifier: Codex (GPT-6), separate from the writer
- Date: 2026-10-29
- Branch: `content/c1-moon`; writer repair commit: `1f1210a`
- Scope: `altitude_boiling`, `maillard_reaction`, `onion_tears`, `salt_boiling`, both locales. This recheck supersedes the findings in `2026-10-28-cluster_kitchen_chemistry.md`; that report remains a record of the first pass.

## Sources and review

`pnpm content:sources refetch`: **67 of 67 sources re-fetched, 0 changed text, 0 failed**. No pages changed. `git status --short content/sources` remained empty; local snapshots were not committed.

The writer reset 16 changed claim instances to `pending`. I opened each changed claim's support snapshot, found its excerpt, and read the surrounding passage. I also rechecked all dependent card, takeaway, deep-dive and quiz text in both locales. Across the whole kitchen trail, all **189 support entries** in **29 distinct snapshots** match their excerpts and committed hashes; the high-stakes onion c9 has support from Physics World and Nautilus, which have different publishers, plus ScienceAlert for the study year.

Every changed claim is now `supported`. The unchanged claims retain the prior pass's supported verdicts. No factual statement in the required lesson fields remains uncovered by a claim, and each of the 16 quizzes has one supported correct option with an explanation consistent with its claims. The two locales agree on numbers, dates and names. No incorrect claim, misleading explanation, unsupported number, ambiguous quiz answer, sensationalism or unqualified disputed claim was found in the repaired text.

## Verdict totals

| Lesson              | Locale | Supported | Partial | Unsupported |
| ------------------- | ------ | --------: | ------: | ----------: |
| `altitude_boiling`  | pt-BR  |        12 |       0 |           0 |
| `altitude_boiling`  | en     |        12 |       0 |           0 |
| `maillard_reaction` | pt-BR  |        12 |       0 |           0 |
| `maillard_reaction` | en     |        12 |       0 |           0 |
| `onion_tears`       | pt-BR  |        12 |       0 |           0 |
| `onion_tears`       | en     |        12 |       0 |           0 |
| `salt_boiling`      | pt-BR  |        10 |       0 |           0 |
| `salt_boiling`      | en     |        10 |       0 |           0 |
| **Kitchen total**   |        |    **92** |   **0** |       **0** |

There are no partial or unsupported kitchen claims and no outstanding factual, quiz, locale or quality-bar blockers from the first report. The repairs specifically removed the unsupported time-to-boil and tablespoon examples, anchored the salt calculation to 29.2 g/kg, limited the bubbling explanation to water already boiling, qualified the onion study and plant-defense language, and made the Maillard quiz distinguish rapid browning from a hard temperature threshold.

## Editorial note

- `content/drafts/lessons/altitude_boiling/variant.{pt-BR,en}.json`, c8 and `deepDiveBlocks[1].text`: Embrapa's saved page is specifically about **biofortified common beans**, while the lesson calls it a **bean preparation guide**. The statement accurately describes that page's pressure-cooker option; naming the specific bean variety would make the citation more precise. This does not change the verdict.

## Checks and remaining review

`pnpm content:check-drafts`: **16 draft variants, 190 supported, 0 partial, 0 unsupported, 0 pending; 0 errors**. Its totals include the unchanged Moon trail. Six warnings concern media awaiting accuracy review: three `maillard_reaction` images and three `moon_tidal_locking` images. `pnpm content:dedupe`: **0 near-duplicate pairs**.

`pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm content:validate`, `pnpm build`, and a Prettier check of the changed files passed. Image accuracy and founder review remain separate from this text verification. This recheck is committed locally; no push was requested.
