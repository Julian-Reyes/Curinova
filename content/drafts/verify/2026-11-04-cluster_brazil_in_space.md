# Verification: Brazil in space

- Verifier: Claude (Claude Code cloud session), separate from the writer session
- Instructions: `verify-v2`
- Date: 2026-11-04
- Scope: `cluster_brazil_in_space`, first pass. Six lessons (`equator_launch_alcantara`, `vls_accident_2003`, `inpe_amazon_monitoring`, `cbers_program`, `amazonia_1`, `marcos_pontes`) from commit `be4a059` (write-v1), both locales: 94 claim instances and 24 quiz questions. Checked card blocks, takeaways, deep dives, summaries, hooks, quizzes and locale counterparts against the cited snapshots.
- Claim verdicts: **92 supported, 2 partial, 0 unsupported, 0 pending**.
- Quiz review: **24 checked, 0 ambiguous answers**.
- Locale review: **no material disagreements**.
- Quality bar: no sensationalism and no advice. The 2003 accident is reported factually.

## Snapshots

`pnpm content:sources refetch`: every source this trail cites was fetched, and every excerpt was found in its snapshot. `src_canaltech_com_br_espaco_o_dia_326e52`'s page text has changed since the writer saved it; its record's hash and access date were updated, and all of its excerpts still match.

| Lesson                     | en (supported / partial) | pt-BR |
| -------------------------- | ------------------------ | ----- |
| `equator_launch_alcantara` | 7 / 0                    | 7 / 0 |
| `vls_accident_2003`        | 8 / 0                    | 8 / 0 |
| `inpe_amazon_monitoring`   | 7 / 0                    | 7 / 0 |
| `cbers_program`            | 8 / 0                    | 8 / 0 |
| `amazonia_1`               | 8 / 0                    | 8 / 0 |
| `marcos_pontes`            | 8 / 1                    | 8 / 1 |

## Blockers

1. **Two cited sources disagree on the launch time.** `content/drafts/lessons/marcos_pontes/variant.en.json` and `variant.pt-BR.json`, claim `c1` (`partial` in each) and card block 1: "at 8:30 p.m. Brasília time" / "às 20h30 (horário de Brasília)". Canaltech gives 20h30, but Agência Brasil, cited in the same lesson for `c2`, `c3`, `c8` and `c9`, says the mission was "scheduled for liftoff at 11:30 pm tonight (Brazilian time)". The date, Baikonur and the destination are supported; the time is not settled. Confirm it with a primary source (e.g. NASA, Roscosmos or AEB) or drop the clock time.

**The trail does not have zero blockers.** Once blocker 1 is fixed and re-verified, it is ready for founder review.

## Editorial notes

1. `amazonia_1` `q_amazonia_1_1` explanation (both): "Before it, Brazil's observation satellites were joint projects, such as CBERS" has no claim. It is a reasonable reading of `c1` ("the first … designed, integrated, tested and operated by Brazil"), but nothing states it.
2. `cbers_program` `c3` (both): the expansion "China–Brazil Earth Resources Satellite" is cited to a FAPESP excerpt that only gives the Portuguese name for CBERS-2; the INPE snapshot cited in `c2` has the full English expansion.
3. `equator_launch_alcantara` `c1` en and pt-BR, and `vls_accident_2003` `c3` and `c6`: several excerpts are cut mid-word ("veículo", "qua", "estági"). They pass the mechanical check, but whole-sentence excerpts are easier to review.
4. `equator_launch_alcantara` `c6`: the oblate-Earth argument (the equator is "farther from the centre", so less gravity to overcome) is faithfully cited from Estadão; the eastward-spin boost in `c1` is the main effect. Fine as a simplification.

## Draft check

`pnpm content:check-drafts` (whole repository, run after recording this trail's verdicts): **0 errors in this trail's six lessons**. The repository-wide run still fails (46 errors) because of missing snapshots in other trails (`brasilia_plan_shape`, `multitasking_switching`, `mpemba_effect`, `cocktail_party_effect`), and 290 claims in trails not yet verified are `pending`. Those are covered by their own reports.
