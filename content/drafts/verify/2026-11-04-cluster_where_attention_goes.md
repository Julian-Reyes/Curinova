# Verification: Where your attention goes

- Verifier: Claude (Claude Code cloud session), separate from the writer session
- Instructions: `verify-v2`
- Date: 2026-11-04
- Scope: `cluster_where_attention_goes`, first pass. Six lessons (`multitasking_switching`, `invisible_gorilla`, `cocktail_party_effect`, `saccadic_suppression`, `stopped_clock_illusion`, `time_slows_fear`) from commit `0e651de` (write-v1), both locales: 96 claim instances and 24 quiz questions.
- Claim verdicts: **74 supported, 2 partial, 0 unsupported, 20 pending (source unavailable)**.
- Quiz review: 20 checkable questions have one clear answer. The 2 `multitasking_switching` quizzes and `cocktail_party_effect` quiz 1 rest on unverifiable claims.
- Locale review: **no material disagreements**.
- Quality bar: no sensationalism and no advice. `saccadic_suppression` marks its open debate.

## Snapshots

Two sources this trail cites returned no text on `pnpm content:sources refetch`:

- `src_apa_org_topics_research_multitasking_dfe2c4` (apa.org, "only 0 characters of text"), the **only** source for all of `multitasking_switching`;
- `src_pmc_ncbi_nlm_nih_gov_articles_edc704` (PubMed Central, "only 130 characters"), the only source for `cocktail_party_effect` `c5`.

Every other source was fetched, and all of its excerpts match.

| Lesson                   | en (supported / partial / pending) | pt-BR     |
| ------------------------ | ---------------------------------- | --------- |
| `multitasking_switching` | 0 / 0 / 9                          | 0 / 0 / 9 |
| `invisible_gorilla`      | 9 / 0 / 0                          | 9 / 0 / 0 |
| `cocktail_party_effect`  | 6 / 0 / 1                          | 6 / 0 / 1 |
| `saccadic_suppression`   | 7 / 1 / 0                          | 7 / 1 / 0 |
| `stopped_clock_illusion` | 7 / 0 / 0                          | 7 / 0 / 0 |
| `time_slows_fear`        | 8 / 0 / 0                          | 8 / 0 / 0 |

## Blockers

1. **`multitasking_switching` can't be checked.** `content/drafts/lessons/multitasking_switching/variant.en.json` and `variant.pt-BR.json`, claims `c1`–`c9` (all left `pending`). Every claim cites only the APA page, which the fetcher reads as empty (probably rendered by script), so nothing in the lesson has a snapshot and `check-drafts` reports a missing snapshot for each support. Replace or add sources that the fetcher can read; a published task-switching study or review (e.g. Rogers & Monsell 1995; Rubinstein, Meyer & Evans 2001) covers most of the lesson. Note for the repair: the "as much as 40 percent of productive time" figure (`c5`, and the quiz misconception's "more than a third") is a surprising, frequently repeated figure. It should be `highStakes: true` with two publishers, or be attributed explicitly as Meyer's estimate, as the card already does.
2. **`cocktail_party_effect` `c5` can't be checked.** Both locales (left `pending`): Moray 1959, "about a third" heard their name, replicated in 1995. Its only source is a PubMed Central article that returned no text. `q_cocktail_party_effect_1` tests exactly this figure. The Wikipedia snapshot already cited covers Moray's 1959 experiment and that "subjectively 'important' messages" got through, but not the one-third figure or the 1995 replication. Cite a readable source for those numbers (e.g. Wood & Cowan 1995), drop them, or fetch the PMC article from a network that serves it.

**The trail does not have zero blockers.**

## Editorial notes

1. `saccadic_suppression` `c6` (`partial`, both): "In 2021" comes only from the ScienceDaily URL (`/releases/2021/12/…`); the saved text gives no date. Add an excerpt that states the year, or cite the PNAS paper.
2. `time_slows_fear` takeaway (both): "memory records the moment more richly, so it seems to have lasted longer" states as fact what the paper offers as "may" (`c7`), and the deep dive correctly says "The authors suggest". Consider "probably" in the takeaway.
3. `time_slows_fear` summary and `q_time_slows_fear_1` option a: "nobody gained slow-motion vision" for the paper's "no evidence of increased temporal resolution" is acceptable at this level.
4. `invisible_gorilla` `c7`, `saccadic_suppression` `c4`, `time_slows_fear` `c4` and `c5`: several excerpts begin or end mid-word. They pass the mechanical check, but full sentences are easier to review.

## Draft check

`pnpm content:check-drafts` (whole repository, after recording these verdicts): this trail's errors are all missing-snapshot errors for the two sources above (blockers 1 and 2). No excerpt failed to match a snapshot that exists.
