# Verifier recheck: How memory works (`cluster_how_memory_works`)

- Instructions: `verify-v2` (`docs/content/VERIFIER.md`)
- Verifier model: Codex (GPT-6), separate from the writer session
- Date: 2026-10-30
- Scope: repaired passages in `spacing_effect` (en and pt-BR), changed c5 in `retrieval_cues` (pt-BR), all dependent card and deep dive text, both locales of the two lessons, and their eight quizzes. Unchanged claim verdicts and the other three lessons stand from the 2026-10-29 report because their draft text and source snapshots did not change.

## Evidence and verdicts

I read the cited excerpts and surrounding passages in the saved snapshots `src_pmc_ncbi_nlm_nih_gov_articles_e2e5f5.txt`, `src_pmc_ncbi_nlm_nih_gov_articles_a969bb.txt`, `src_pmc_ncbi_nlm_nih_gov_articles_464a77.txt`, and `src_pmc_ncbi_nlm_nih_gov_articles_bd62fd.txt`. The spacing experiment varied gaps for German–Japanese word pairs, but reports a global maximum near 12 hours across its tested retention intervals. Its introduction attributes the tendency for longer optimal gaps with longer retention intervals to earlier studies. The revised `spacing_effect` deep dive now makes that distinction in both languages, matching supported c5 and c6. The classroom meta-analysis supports the card's benefit, report count, participant count, and qualified longer-retention observation.

The word-pair source says original cues outperformed extraexperimental cues strongly associated with the target. Revised `retrieval_cues` pt-BR c5 states only that comparison and no longer claims those associations were formed later. I changed its `autoVerdict` from `pending` to `supported`. The category-cue and encoding-specificity snapshot supports the surrounding retrieval text. The English and Portuguese card, deep dive, and quiz facts agree. Each of the eight dependent quizzes has one correct answer, and each explanation follows its cited claim.

| Lesson             | Locale | Supported | Partial | Unsupported | Pending |
| ------------------ | ------ | --------: | ------: | ----------: | ------: |
| `forgetting_curve` | en     |         5 |       0 |           0 |       0 |
| `forgetting_curve` | pt-BR  |         5 |       0 |           0 |       0 |
| `spacing_effect`   | en     |         6 |       0 |           0 |       0 |
| `spacing_effect`   | pt-BR  |         6 |       0 |           0 |       0 |
| `testing_effect`   | en     |         5 |       0 |           0 |       0 |
| `testing_effect`   | pt-BR  |         5 |       0 |           0 |       0 |
| `sleep_memory`     | en     |         6 |       0 |           0 |       0 |
| `sleep_memory`     | pt-BR  |         6 |       0 |           0 |       0 |
| `retrieval_cues`   | en     |         5 |       0 |           0 |       0 |
| `retrieval_cues`   | pt-BR  |         5 |       0 |           0 |       0 |
| **Trail total**    |        |    **54** |   **0** |       **0** |   **0** |

## Blockers

None. **The trail has zero blockers and no changed claims left pending.** I found no newly uncovered factual assertion, misleading attribution, ambiguous answer, material locale difference, sensationalism, or individualized advice in the rechecked material.

## Editorial notes

- `content/drafts/lessons/retrieval_cues/variant.en.json`, first `deepDiveBlocks` paragraph: “a later strong association” can be read as an association formed later, while the source establishes that the alternative cue was _presented_ later. The matching pt-BR passage says “oferecida depois,” which is clearer. The English c5 claim says “introduced later,” also referring to cue presentation. This is a wording refinement, not a blocker; the actual comparison is correct.
- The earlier report's nonblocking notes about the cue discrimination boundary condition, feedback detail, and duplicate excerpts within a source remain editorial.

## Draft check

`PATH=/Users/apple/.nvm/versions/node/v24.22.1/bin:$PATH pnpm content:check-drafts` passed: **36 draft variants; 328 supported, 0 partial, 0 unsupported, 0 pending** across all drafts. It reported nine existing media accuracy warnings in the Moon, Kitchen Chemistry, and Body Renews drafts, outside this trail. An initial run using the shell's Node v24.14.0 could not start because the project requires Node v24.22.1 or newer; the rerun used installed Node v24.22.1.

The trail is ready for founder review under `verify-v2`; founder review and publication are separate.
