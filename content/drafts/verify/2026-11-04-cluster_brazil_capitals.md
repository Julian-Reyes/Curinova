# Verification: Brazil's three capitals

- Verifier: Claude (Claude Code cloud session), separate from the writer session
- Instructions: `verify-v2`
- Date: 2026-11-04
- Scope: `cluster_brazil_capitals`, first pass. Six draft lessons (`salvador_first_capital`, `rio_capital_1763`, `court_in_rio_1808`, `inland_capital_idea`, `building_brasilia`, `brasilia_plan_shape`) from commit `967c4d5` (write-v1), both locales: 124 claim instances and 24 quiz questions. Checked card blocks, takeaways, deep dives, summaries and hooks, quizzes, locale counterparts, the concepts' `related` captions and the cluster text against the cited local snapshots.
- Claim verdicts: **120 supported, 2 partial, 0 unsupported, 2 pending (not verifiable)**.
- Quiz review: **24 checked, 0 ambiguous or unsupported answers**.
- Locale review: **no material disagreements** in dates, names, numbers, mechanisms or quiz answers (one small wording point below).
- Quality bar: no sensationalism and no advice. One unmarked superlative is a blocker below.

## Snapshots

`pnpm content:sources refetch` re-fetched 114 of 125 sources; 1 changed and 11 failed. In this trail, **one cited source could not be fetched**: `src_whc_unesco_org_en_list_445_aeab5d` (whc.unesco.org, HTTP 403 to the automated fetch). I did not try to get around the refusal. All other 23 sources cited by this trail were re-fetched with unchanged records, and every one of their excerpts was found in its snapshot. The changed source and the other failures belong to other trails and are outside this run's scope.

| Lesson                   | en (supported / partial / pending) | pt-BR      |
| ------------------------ | ---------------------------------- | ---------- |
| `salvador_first_capital` | 10 / 1 / 0                         | 10 / 1 / 0 |
| `rio_capital_1763`       | 9 / 0 / 0                          | 9 / 0 / 0  |
| `court_in_rio_1808`      | 9 / 0 / 0                          | 9 / 0 / 0  |
| `inland_capital_idea`    | 10 / 0 / 0                         | 10 / 0 / 0 |
| `building_brasilia`      | 11 / 0 / 0                         | 11 / 0 / 0 |
| `brasilia_plan_shape`    | 11 / 0 / 1                         | 11 / 0 / 1 |

## Blockers

1. **A claim's only source can't be checked, and the draft check fails.** `content/drafts/lessons/brasilia_plan_shape/variant.en.json` and `variant.pt-BR.json`, claim `c5` (left `pending`): "The Monumental Axis holds the Esplanade of the Ministries; the North and South Wings run along the Road Axis." Both of its supports are the UNESCO page, which has no local snapshot. The same page is also cited by `c4`, `c9` and `c11`. Those three are verified on their other sources (Jornal de Brasília for the curved axis; Correio Braziliense for 1987 and the four scales), but `pnpm content:check-drafts` reports 10 errors for the missing snapshot (5 supports × 2 locales). Fix: either fetch the UNESCO page from a network it accepts and re-run this check for `c4`, `c5`, `c9` and `c11`, or re-source `c5` and drop the UNESCO supports. The trail already has a suitable snapshot: `src_correiobraziliense_com_br_revista_do_correio_08ec0b` mentions the "Esplanada dos Ministérios, pelo Eixo Monumental" and the "Eixo Rodoviário, como suas asas, divididas em Asa Norte e Asa Sul".
2. **A surprising superlative from a single publisher.** `content/drafts/lessons/salvador_first_capital/variant.en.json` and `variant.pt-BR.json`, claim `c10` (`partial` in each), and the "Sugar and slavery" / "Açúcar e escravidão" deep dive: "From 1558, Salvador was the first slave market in the New World." The UNESCO text (via Google Arts & Culture) says exactly this, but it is the only source. A "first in the New World" claim is surprising, and historians may dispute it, so it should be `highStakes: true` with a second, independent publisher. Without one, narrow it to what the cited text already backs elsewhere: `c6` supports Salvador being "an important centre of the sugar industry and the slave trade". The core (Salvador as a slave market from 1558, with Africans forced to work on sugar plantations) is backed; the "first in the New World" scope is what lacks support.

**The trail does not have zero blockers and is not yet ready for founder review.**

## Editorial notes

1. `salvador_first_capital` `c3` (both locales): 29 March 1549 is supported by the Tribunal de Justiça da Bahia. But bahia.ws, also cited for `c3` (for Tomé de Sousa as founder), gives "1 May 1549" as the foundation and 29 March as the day the fleet sighted land. Consider citing only TJBA for the date, or noting arrival vs. foundation.
2. `salvador_first_capital` `c11` (both): the year 1985 appears only as a caption label, "Historic Centre of Salvador de Bahia (1985)". An excerpt that states the inscription year would be easier to audit.
3. `salvador_first_capital` `c1`, `c2` and `c9` rest only on bahia.ws, recorded as a tourist guide. They are supported, but a historical or institutional source would be stronger for the lesson's opening.
4. `q_salvador_first_capital_1` misconception (both): "Cabral arrived in 1500 but founded no city" has no claim.
5. `rio_capital_1763` card body, takeaway and `q_rio_capital_1763_1` (both): "the main aim" / "main reason" was gold control. The Eumed source lists gold control and defending the south together, without ranking them; Meer attributes the move to Rio's role as the gold outlet. This is an acceptable simplification and the quiz answer is unambiguous, but "a main aim" would match the sources more closely.
6. `rio_capital_1763` card body and `q_rio_capital_1763_2` option a (both): Pombal as "King Joseph I's minister". The source says "sob a regência de D. José"; "minister" is not in `c3`.
7. `court_in_rio_1808` pt-BR `hook`: "um rei europeu foi governar a partir da colônia". In 1808 D. João was prince regent, governing for Queen Maria I (Exame); the en hook's "a European ruler" is accurate. Suggest "um príncipe regente" or "um soberano europeu".
8. `q_court_in_rio_1808_2` misconception (both): "Independence came only in 1822" has no claim. The cited Exame and IHU snapshots both mention 1822.
9. `inland_capital_idea` en card body: "Hipólito José da Costa and José Bonifácio, who argued for moving it to Paracatu" reads as if both proposed Paracatu; the source and `c2` attribute that to Bonifácio only. The pt-BR singular "que defendia" is clear.
10. `building_brasilia` en card body: Tiradentes as "a hero of Brazil's fight against colonial rule" has no claim and is not in pt-BR. The cited Jornal de Brasília series notes that he was used "de forma errônea" as a symbol of Independence, so either source the description or drop it.
11. `building_brasilia` `c9` (both): the 2,966 figure comes from a senator's speech, reported by Agência Senado, that cites IBGE's 1959 census. It is supported, but a direct IBGE source would be firmer.
12. `brasilia_plan_shape` en `c11` and deep dive: "social" for Costa's "gregária" scale is a loose translation (the pt-BR claim gives "gregária (social)"); "gregarious" is the usual English term.

## Draft check

`pnpm content:check-drafts`: 12 draft variants, 120 supported, 2 partial, 0 unsupported, 2 not verified yet; **failed with 10 errors**, all "no local snapshot for `src_whc_unesco_org_en_list_445_aeab5d`" in `brasilia_plan_shape` (blocker 1). The remaining warnings are images not yet checked for accuracy, which happens in founder review. `pnpm content:dedupe`: no near-duplicate lessons.
