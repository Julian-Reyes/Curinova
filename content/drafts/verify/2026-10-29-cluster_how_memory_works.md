# Verifier report: How memory works (`cluster_how_memory_works`)

- Instructions: `verify-v1` (`docs/content/VERIFIER.md`)
- Verifier: Codex (GPT-6), in a session separate from the writer
- Date: 2026-10-29
- Branch: `content/c1-moon`; writer commit: `8342c43`
- Scope: `forgetting_curve`, `spacing_effect`, `testing_effect`, `sleep_memory`, and `retrieval_cues` in en and pt-BR

## Sources and coverage

I located every cited excerpt for all 54 claim instances in nine saved local source snapshots and read its surrounding text. The nine snapshot SHA-256 hashes match their committed source records. I did not re-fetch live pages. I checked factual statements in `cardText`, `cardBlocks`, takeaway, and `deepDiveBlocks`, plus all 20 quizzes and agreement between locales. No other factual statement lacked claim coverage.

## Verdict totals

| Lesson             | Locale | Supported | Partial | Unsupported |
| ------------------ | ------ | --------: | ------: | ----------: |
| `forgetting_curve` | en     |         5 |       0 |           0 |
| `forgetting_curve` | pt-BR  |         5 |       0 |           0 |
| `spacing_effect`   | en     |         6 |       0 |           0 |
| `spacing_effect`   | pt-BR  |         6 |       0 |           0 |
| `testing_effect`   | en     |         5 |       0 |           0 |
| `testing_effect`   | pt-BR  |         5 |       0 |           0 |
| `sleep_memory`     | en     |         6 |       0 |           0 |
| `sleep_memory`     | pt-BR  |         6 |       0 |           0 |
| `retrieval_cues`   | en     |         5 |       0 |           0 |
| `retrieval_cues`   | pt-BR  |         4 |       1 |           0 |
| **Total**          |        |    **53** |   **1** |       **0** |

## Blockers

- `content/drafts/lessons/spacing_effect/variant.en.json`, first `deepDiveBlocks` paragraph: “Together with other studies, its authors found” attributes the longer-gap/longer-retention trend to the cited German–Japanese word-pair experiment. Its discussion explicitly says its own optimum stayed near 12 hours across the tested retention intervals. Prior studies support the qualified general trend in c5, so c5 is supported; this sentence misstates what this experiment found.
- `content/drafts/lessons/spacing_effect/variant.pt-BR.json`, first `deepDiveBlocks` paragraph: “Em conjunto com outros trabalhos, seus autores observaram” makes the same attribution. The cited experiment reports a nearly unchanged 12-hour optimum across its tested retention intervals. The general tendency in c5 remains supported by the source's review of earlier studies.
- `content/drafts/lessons/retrieval_cues/variant.pt-BR.json`, c5: “outras associações fortes feitas depois” implies the strong associations were formed after learning. The source says alternative, already strong semantic associations were used as retrieval cues outside the learning episode; it does not establish when those associations formed. The comparison with original cues is supported, but this added timing claim is not. The en claim's “introduced later” describes presentation of the alternative cues at the test and does not have this problem. This is also the only material factual difference between locales.

## Quizzes and quality bar

All 20 quizzes have one correct answer, their distractors are incorrect in context, their explanations agree with the snapshots, and their `claimIds` identify the relevant evidence. The pt-BR `retrieval_cues` second quiz uses c5, but its answer and explanation state only the supported original-cue comparison, not when other associations formed. The Ebbinghaus lesson keeps its curve limited to the experimental pattern rather than a personal percentage. The sleep lesson separates human vocabulary results from animal replay observations and leaves the mechanism open. I found no sensationalism or individualized advice.

## Editorial notes

- `content/drafts/lessons/retrieval_cues/variant.en.json` and `variant.pt-BR.json`, c4 and the second quiz: the cited review supports encoding specificity, while the other cited paper reports that a matching cue may not help unless it also distinguishes the target from competing memories. The current “more likely” and “can help” language is qualified enough to be supported; a future edit could add this boundary condition.
- `content/drafts/lessons/testing_effect/variant.en.json` and `variant.pt-BR.json`, second `cardBlocks` paragraph and first `deepDiveBlocks` paragraph: the source discusses the value of feedback after failed attempts and correction of errors, but c4 states only the general feedback advantage. Adding that detail to a claim would improve mapping; the prose is substantively supported.
- `forgetting_curve` c4, `testing_effect` c1, and `sleep_memory` c6 each list two excerpts from the same source. The extra excerpts help context but are not independent sources; none of these claims is marked high stakes.

## Draft checks

- `pnpm content:check-drafts`: passed. Across the branch: 36 draft variants, 327 supported claims, 1 partial, 0 unsupported, and 0 pending. It reported nine existing media-accuracy warnings in the Moon, Kitchen Chemistry, and Body Renews drafts.
- `pnpm content:dedupe`: passed; no near-duplicate lessons.
