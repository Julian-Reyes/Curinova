# Verification: batch 2 recheck after writer repair

- Verifier: Claude Opus 5.5 (Claude Code session), separate from the writer session
- Instructions: `verify-v2`
- Date: 2026-11-05
- Scope: recheck of the five batch 2 trails (`cluster_amazon_survival`, `cluster_brazil_capitals`, `cluster_brazil_in_space`, `cluster_everyday_myths`, `cluster_where_attention_goes`) after the writer repair in commit `7b744e5` (write-v1). Covered:
  1. every claim left `pending` or `partial` in `content/drafts/lessons/`, both locales: 84 `pending` claim instances in 11 lessons (`multitasking_switching`, `cocktail_party_effect`, `mpemba_effect`, `knuckle_cracking`, `brasilia_plan_shape`, `salvador_first_capital`, `marcos_pontes`, `pirarucu_air_breathing`, `giant_water_lily`, `blue_veins`, `falling_coin`), plus the 2 `partial` instances in `saccadic_suppression` (unchanged by the repair);
  2. a full re-read of the 11 lessons changed in `7b744e5` (title, hook, summary, card blocks, takeaway, deep dive, both quizzes, both locales) for coverage, quiz correctness, locale agreement and the quality bar;
  3. each support's snapshot, read around the excerpt.
- I compared every claim in the changed lessons with its version in `7b744e5~1`. Every claim whose text or support changed had been reset to `pending` by the writer. No claim kept `supported` after losing a support.
- Verdicts set in this run: **84 `supported`**, 0 `partial`, 0 `unsupported`. `saccadic_suppression` `c6` stays `partial` (both locales).
- Quiz review: 22 question groups in the changed lessons (44 questions across both locales). **0 ambiguous answers**.
- Locale review: **no material disagreements** in the changed lessons.
- Quality bar: no sensationalism. `knuckle_cracking` now marks the mechanism dispute in the card, the takeaway and the deep dive. `mpemba_effect` marks its dispute. Neither gives individual medical advice.

## Writer's description, checked

The commit message matches the diff. The four sources that could not be fetched are no longer cited by any draft: the APA page, UNESCO (`whc.unesco.org`), jabfm.org, gpb.org, NYBG and West Texas A&M are all gone. The repair touched these items:

- **`multitasking_switching`:** re-sourced on the APA 2001 press release (via Newswise), The Seattle Times, PsyToolkit and Wikipedia. The 40% figure is gone from the claims, the card and the quiz misconception.
- **`cocktail_party_effect` `c5`:** now has a second PMC article.
- **`mpemba_effect`:** the Scientific Reports snapshot now has text.
- **`knuckle_cracking`:** `c4` now says "suggested", the card says "though scientists still debate it", and a new `c8` covers the 2018 simulation.
- **`brasilia_plan_shape` `c5`:** re-sourced to Correio Braziliense.
- **`salvador_first_capital` `c10`:** narrowed in the claim and in the deep dive.
- **`marcos_pontes` `c1`:** the clock time is dropped from the claim and the card.
- **`pirarucu_air_breathing`:** gpb.org replaced by Wikipedia and NWF.
- **`giant_water_lily`:** now about 1 mm, from the 2022 PMC paper.
- **`blue_veins`:** the four new sources are in place.
- **`falling_coin` `c8`:** now says "up to".

## Verdicts after this run

Columns are supported / partial / unsupported. No claim is `pending`.

### `cluster_amazon_survival`

| Lesson                   | en        | pt-BR     |
| ------------------------ | --------- | --------- |
| `electric_eel`           | 9 / 0 / 0 | 9 / 0 / 0 |
| `pirarucu_air_breathing` | 9 / 0 / 0 | 9 / 0 / 0 |
| `leafcutter_farming`     | 7 / 0 / 0 | 7 / 0 / 0 |
| `poison_frog_diet`       | 7 / 0 / 0 | 7 / 0 / 0 |
| `boto_echolocation`      | 7 / 0 / 0 | 7 / 0 / 0 |
| `giant_water_lily`       | 9 / 0 / 0 | 9 / 0 / 0 |

### `cluster_brazil_capitals`

| Lesson                   | en         | pt-BR      |
| ------------------------ | ---------- | ---------- |
| `salvador_first_capital` | 11 / 0 / 0 | 11 / 0 / 0 |
| `rio_capital_1763`       | 9 / 0 / 0  | 9 / 0 / 0  |
| `court_in_rio_1808`      | 9 / 0 / 0  | 9 / 0 / 0  |
| `inland_capital_idea`    | 10 / 0 / 0 | 10 / 0 / 0 |
| `building_brasilia`      | 11 / 0 / 0 | 11 / 0 / 0 |
| `brasilia_plan_shape`    | 12 / 0 / 0 | 12 / 0 / 0 |

### `cluster_brazil_in_space`

| Lesson                     | en        | pt-BR     |
| -------------------------- | --------- | --------- |
| `equator_launch_alcantara` | 7 / 0 / 0 | 7 / 0 / 0 |
| `vls_accident_2003`        | 8 / 0 / 0 | 8 / 0 / 0 |
| `inpe_amazon_monitoring`   | 7 / 0 / 0 | 7 / 0 / 0 |
| `cbers_program`            | 8 / 0 / 0 | 8 / 0 / 0 |
| `amazonia_1`               | 8 / 0 / 0 | 8 / 0 / 0 |
| `marcos_pontes`            | 9 / 0 / 0 | 9 / 0 / 0 |

### `cluster_everyday_myths`

| Lesson                    | en        | pt-BR     |
| ------------------------- | --------- | --------- |
| `microwave_inside_out`    | 6 / 0 / 0 | 6 / 0 / 0 |
| `mpemba_effect`           | 7 / 0 / 0 | 7 / 0 / 0 |
| `blue_veins`              | 9 / 0 / 0 | 9 / 0 / 0 |
| `falling_coin`            | 8 / 0 / 0 | 8 / 0 / 0 |
| `radioactive_foods`       | 7 / 0 / 0 | 7 / 0 / 0 |
| `knuckle_cracking`        | 8 / 0 / 0 | 8 / 0 / 0 |
| `lightning_strikes_twice` | 6 / 0 / 0 | 6 / 0 / 0 |

### `cluster_where_attention_goes`

| Lesson                   | en        | pt-BR     |
| ------------------------ | --------- | --------- |
| `multitasking_switching` | 9 / 0 / 0 | 9 / 0 / 0 |
| `invisible_gorilla`      | 9 / 0 / 0 | 9 / 0 / 0 |
| `cocktail_party_effect`  | 7 / 0 / 0 | 7 / 0 / 0 |
| `saccadic_suppression`   | 7 / 1 / 0 | 7 / 1 / 0 |
| `stopped_clock_illusion` | 7 / 0 / 0 | 7 / 0 / 0 |
| `time_slows_fear`        | 8 / 0 / 0 | 8 / 0 / 0 |

## How the earlier blockers were resolved

- **`multitasking_switching` (where_attention_goes, blocker 1):** all nine claims now have readable snapshots and are supported.
  - `c1` to `c4`, `c6`, `c7` and `c9` follow the APA press release closely. The two-stage model is attributed as the researchers' suggestion, and the driving example as Meyer's view.
  - `c5` (slower and less accurate, even with cash) is in The Seattle Times' account of the same 2001 study. Wikipedia backs it generally.
  - `c8`: PsyToolkit describes Rogers and Monsell's 1995 alternating-runs design (a switch every two trials) and its slowdown after a switch. Wikipedia gives the paper's title ("The cost of a predictable switch…") and says the cost "remains even when there is ample warning".
  - Quiz 1's misconception now matches `c4`.
- **`cocktail_party_effect` `c5` (where_attention_goes, blocker 2):** both PMC articles state "about one third" and the Wood & Cowan (1995) replication. The first also describes Moray's shadowing setup. Supported. `q_cocktail_party_effect_1` is unambiguous.
- **`mpemba_effect` `c3`, `c5` and `c7` (everyday_myths, blocker 1):** the Scientific Reports snapshot is readable.
  - `c3` (high-stakes) has Wikipedia and Scientific Reports, two publishers.
  - `c5` (high-stakes) has the study itself plus Wikipedia, two publishers. The Wikipedia snapshot names Burridge and Linden (2016) elsewhere on the page (see editorial note 2).
  - `c7`: Aristotle and the 2012 RSC competition are both in the paper. Aristotle is also on Wikipedia.
- **`knuckle_cracking` `c4` (everyday_myths, blocker 2):** now "suggested", with PLOS ONE and Wikipedia, two publishers.
  - The card, takeaway, summary and quiz explanation now hedge ("most likely", "suggest", "scientists still debate it").
  - `c8` supports the 2018 counter-model and the community's scepticism.
  - `c1` (high-stakes) has Harvard Health and Wikipedia. `c2` is supported by Wikipedia's account of the 2011 study.
- **`brasilia_plan_shape` `c5` (brazil_capitals, blocker 1):** the Correio Braziliense snapshot names the Esplanada dos Ministérios on the Eixo Monumental and the Asa Norte and Asa Sul along the Eixo Rodoviário. Supported.
  - `c4`, `c9` and `c11` lost their UNESCO support. Each is still supported by its other source: Jornal de Brasília (`c4`), and Correio Braziliense's Candangando blog (`c9`: inscribed on 7 December 1987; `c11`: the four scales).
- **`salvador_first_capital` `c10` (brazil_capitals, blocker 2):** narrowed to "from 1558, Salvador had a slave market". This sits inside what the UNESCO text says. Nothing about "first in the New World" is left in the claim, the deep dive or the quizzes, in either locale. Supported.
- **`marcos_pontes` `c1` (brazil_in_space, blocker 1):** "on the night of 29 March 2006 (Brasília time)" is backed by Canaltech ("Na noite de 29 de março de 2006") and by Agência Brasil ("11:30 pm tonight (Brazilian time)"). No clock time is left in either locale. Supported.

## Other rechecked claims

- **`pirarucu_air_breathing`:**
  - `c2`: Portal Amazônia and Wikipedia.
  - `c6`: NWF, "every 15 minutes or so".
  - `c8`: NWF, the fishers' "eyeball" count when the fish comes up for air, used by officials to set catch quotas. The same article places this in the Mamirauá reserve.
  - All supported.
- **`giant_water_lily`:**
  - `c2`: PMC, "ca. 1 mm".
  - `c3`: Gardens by the Bay.
  - `c5`: PMC and Wikipedia, spines against herbivory and fish.
  - `c6`: Wikipedia, "enormously buoyant if the weight is distributed evenly".
  - `c8`: Gardens by the Bay and Wikipedia.
  - All supported.
- **`blue_veins`:** all nine claims supported.
  - `c1` and `c2`: Live Science and Mental Floss.
  - `c3`: Mental Floss, plus the Straight Dope phlebotomist's "almost all samples were dark red".
  - `c4`: Mental Floss.
  - `c5` and `c6`: the mechanism from Mental Floss. Blue light penetrates skin less and scatters back more, so shallow veins can look red and deeper ones blue.
  - `c7`: Wikipedia, skin scattering plus visual processing. The sentence is footnoted [6], which is Kienle et al. 1996.
  - `c8`: the Wikipedia reference entry.
  - `c9`: Mental Floss.
  - The new card mechanism matches its sources. It is a simplification, not a wrong mechanism.
- **`falling_coin` `c8`:** "up to 200 mph (about 320 km/h)" matches Ripley's ("traveling up to 200 mph"). The card also says "up to" in both locales. Supported.
- **`saccadic_suppression` `c6`:** not changed by the repair. It stays `partial` because "2021" still comes only from the URL. This is editorial note 1 from 2026-11-04 and not a blocker.

## Blockers

None. No claim is `unsupported` or `pending`. No high-stakes claim lacks two publishers. No quiz is ambiguous, and the locales agree.

- **`cluster_amazon_survival`: zero blockers.**
- **`cluster_brazil_capitals`: zero blockers.**
- **`cluster_brazil_in_space`: zero blockers.**
- **`cluster_everyday_myths`: zero blockers.**
- **`cluster_where_attention_goes`: zero blockers.**

## Editorial notes

These don't reopen a trail.

1. **`knuckle_cracking` `c5` (both locales):** the new Wikipedia support ("American doctor Donald Unger") backs "doctor". But the surrounding Wikipedia text gives a 2004 paper, "more than fifty years" and a 2009 Ig Nobel. The claim and deep dive say 1998, 60 years and an Ig Nobel. The claim follows the Ig Nobel citation from Improbable Research, which is the authoritative record (_Arthritis and Rheumatism_ vol. 41, 1998; "more than sixty (60) years"), so the claim stands. Citing a page that contradicts it in the next sentence invites confusion. Consider a different source for "doctor", or drop the word.
2. **`mpemba_effect` `c5` (both):** the Wikipedia excerpt ("some experiments finding no reproducible effect") is generic. The same snapshot has a passage that names Burridge and Linden (2016), "In 2016, Burridge and Linden studied…", which would make the second publisher's support explicit.
3. **`blue_veins` (both):**
   - `c3` cites The Straight Dope only for the phlebotomist's observation, which is fine. The same column wrongly says deoxygenated blood is "carboxyhemoglobin", and it carries its own accuracy disclaimer, so it should not be used for anything more.
   - The Live Science snapshot is truncated at 689 characters. It covers `c1` and `c2` only.
   - `c5` and `c6` (the mechanism) rest on Mental Floss alone. `c7` adds Wikipedia/Kienle for the general explanation. It is adequate at this level, but the Kienle paper itself would be firmer.
4. **`multitasking_switching` `c8` (both):** the PsyToolkit excerpts describe the paradigm and how the cost is measured more than Rogers and Monsell's result. The Wikipedia snapshot's "The switch cost remains even when there is ample warning of an upcoming switch" would be a more direct excerpt.
5. **`knuckle_cracking` `q_knuckle_cracking_2` option c (both):** "A tendon slipping out of place" is the intended distractor. The Wikipedia snapshot notes that snapping tendons can make popping sounds at other joints (e.g. snapping hip). For finger knuckles, option a is still the one right answer.
6. **`giant_water_lily` `c9` and deep dive (both):** "newly crowned in 1837" is still there. Victoria acceded in 1837 and was crowned in 1838. This was 2026-11-04 editorial note 1 for amazon_survival.
7. **`brasilia_plan_shape` `c4`, `c5`, `c9`, `c11`:** after the UNESCO removal, `c9` and `c11` rest on a single Correio Braziliense blog post, and `c5` on another Correio Braziliense article. Both are fine for non-high-stakes claims.
8. **Earlier notes not addressed by this repair:** the remaining 2026-11-04 editorial notes still stand where the text is unchanged. Examples are `rio_capital_1763` "main aim", the `court_in_rio_1808` pt-BR hook and `time_slows_fear` takeaway hedging. None was a blocker.

## Readiness

| Trail                          | Blockers | Changed claims left `pending` | Draft check | Ready for founder review |
| ------------------------------ | -------- | ----------------------------- | ----------- | ------------------------ |
| `cluster_amazon_survival`      | 0        | 0                             | passes      | yes                      |
| `cluster_brazil_capitals`      | 0        | 0                             | passes      | yes                      |
| `cluster_brazil_in_space`      | 0        | 0                             | passes      | yes                      |
| `cluster_everyday_myths`       | 0        | 0                             | passes      | yes                      |
| `cluster_where_attention_goes` | 0        | 0                             | passes      | yes                      |

Founder review and publication remain separate steps.

## Draft check

`pnpm content:check-drafts` (whole repository, after recording these verdicts) exited with 0: "62 draft variant(s). Claims: 510 supported, 2 partial, 0 unsupported, 0 not verified yet. ✔ drafts pass." Every cited source has a snapshot, and every excerpt matched.
