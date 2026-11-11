# Verification: Everyday science myths

- Verifier: Claude (Claude Code cloud session), separate from the writer session
- Instructions: `verify-v2`
- Date: 2026-11-04
- Scope: `cluster_everyday_myths`, first pass. Seven lessons (`microwave_inside_out`, `mpemba_effect`, `blue_veins`, `falling_coin`, `radioactive_foods`, `knuckle_cracking`, `lightning_strikes_twice`) from commit `716c6d4` (write-v1), both locales: 96 claim instances and 28 quiz questions.
- Claim verdicts: **86 supported, 6 partial, 0 unsupported, 4 pending (source unavailable)**.
- Quiz review: **28 checked, 0 ambiguous answers**. `q_mpemba_effect_1` rests partly on `c5` (pending).
- Locale review: **no material disagreements**.
- Quality bar: no sensationalism. The health-adjacent lessons (`knuckle_cracking`, `radioactive_foods`) give general findings, not individual advice. `mpemba_effect` and `knuckle_cracking` mark their disputes.

## Snapshots

One source this trail cites returned no text on `pnpm content:sources refetch`: `src_pmc_ncbi_nlm_nih_gov_articles_e89e1d` (Scientific Reports via PubMed Central, "only 130 characters"), cited in `mpemba_effect` `c3`, `c5` and `c7`. Every other source was fetched, and all of its excerpts match.

| Lesson                    | en (supported / partial / pending) | pt-BR     |
| ------------------------- | ---------------------------------- | --------- |
| `microwave_inside_out`    | 6 / 0 / 0                          | 6 / 0 / 0 |
| `mpemba_effect`           | 4 / 1 / 2                          | 4 / 1 / 2 |
| `blue_veins`              | 7 / 0 / 0                          | 7 / 0 / 0 |
| `falling_coin`            | 7 / 1 / 0                          | 7 / 1 / 0 |
| `radioactive_foods`       | 7 / 0 / 0                          | 7 / 0 / 0 |
| `knuckle_cracking`        | 6 / 1 / 0                          | 6 / 1 / 0 |
| `lightning_strikes_twice` | 6 / 0 / 0                          | 6 / 0 / 0 |

## Blockers

1. **`mpemba_effect`: high-stakes claims without two checkable publishers, and two claims unverifiable.** Both locales.
   - `c3` (`partial`, high-stakes: effect not seen in every setup, mixed results) is backed by Wikipedia; its second publisher is the unfetchable Scientific Reports article.
   - `c5` (`pending`, high-stakes: the 2016 controlled study found "no evidence to support meaningful observations") cites the unfetchable article first. The Wikipedia snapshot already cited does describe Burridge & Linden (2016) and quotes the same conclusion, but it is one publisher. Note that it says they measured the time to reach 0 °C, not to freeze.
   - `c7` (`pending`: Aristotle; the 2012 Royal Society of Chemistry competition) cites only the unfetchable article. The Wikipedia snapshot covers Aristotle but not the RSC competition.
   - Fix: add a second fetchable publisher for `c3` and `c5` (for example a university or science-news write-up of Burridge & Linden 2016), and re-source or drop the RSC detail in `c7`.
2. **`knuckle_cracking` `c4`: a disputed high-stakes mechanism with one publisher.** Both locales (`partial`): "2015 MRI images showed the crack is linked to the cavity forming, not to a bubble collapsing." Only Kawchuk et al. (PLOS ONE) states this. The second support is a Wikipedia figure caption ("MRI of a cracking finger joint depicting cavitation") that doesn't address bubble collapse. The lesson's own "mechanism is still debated" section is right that this is contested, but card block 2 states it as settled ("showed that the crack happens as the cavity forms, not when a bubble bursts"). Add a second publisher and align the card with the debate section (e.g. "MRI images from 2015 suggested…").

**The trail does not have zero blockers.**

## Editorial notes

1. `blue_veins` (both): the whole lesson rests on one Q&A page (Christopher Baird, West Texas A&M), including its paraphrase of Kienle's optics paper as the core mechanism (`c5`: skin "scatters a lot of the red portion of white light before it can reflect off the blood"). The claims match the source, but a second optics source or Kienle's paper itself would make the mechanism safer.
2. `falling_coin` `c8` (`partial`, both): the source says a pen could travel "up to 200 mph"; the claim and card say it would "reach about 320 km/h". Use "up to".
3. `falling_coin` `c1` (high-stakes): both publishers (Ripley's, Today I Found Out) are entertainment sites. The physics is quoted from Louis Bloomfield, but a physics or university source would be firmer.
4. `radioactive_foods` `c6` (high-stakes): the core ("small dose, higher than common foods") has two publishers, but the 40–260 Bq/kg range comes from Wikipedia alone. The lesson rightly hedges Mental Floss's "1000 times".
5. `lightning_strikes_twice` deep-dive heading "A record-holder in New York" / "Recordista em Nova York": nothing supports "record"; `c5` only gives 23 strikes a year.
6. `knuckle_cracking` `c5`: "The American doctor Donald Unger". The Ig Nobel citation gives his town, not his profession.
7. `microwave_inside_out` `c1`: the "centre of the plate stays cold" observation comes from a reader's question in The Straight Dope, not from the answer. It's fine as an illustration.

## Draft check

`pnpm content:check-drafts` (whole repository, after recording these verdicts): this trail's only errors are 8 missing-snapshot errors in `mpemba_effect` (blocker 1). Every excerpt with an existing snapshot matched.
