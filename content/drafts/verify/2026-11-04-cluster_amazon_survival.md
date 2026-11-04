# Verification: Amazon survival tricks

- Verifier: Claude (Claude Code cloud session), separate from the writer session
- Instructions: `verify-v2`
- Date: 2026-11-04
- Scope: `cluster_amazon_survival`, first pass. Six lessons (`electric_eel`, `pirarucu_air_breathing`, `leafcutter_farming`, `poison_frog_diet`, `boto_echolocation`, `giant_water_lily`) from commit `de4aa5a` (write-v1), both locales: 96 claim instances and 24 quiz questions.
- Claim verdicts: **96 supported, 0 partial, 0 unsupported, 0 pending**. Every source was fetched, and every excerpt was found in its snapshot.
- Quiz review: **24 checked, 0 ambiguous answers**.
- Locale review: **no material disagreements**.
- Quality bar: no sensationalism and no advice. High-stakes claims (`electric_eel` `c5`, `pirarucu_air_breathing` `c1`, `poison_frog_diet` `c2` and `c4`) each have two publishers.

## Blockers

None. **The trail has zero blockers** and, once `content:check-drafts` passes for it (it does: 0 errors in these six lessons), it is ready for founder review.

## Editorial notes

1. `giant_water_lily` `c9` and deep dive (both): "Queen Victoria, newly crowned in 1837" follows Gardens by the Bay's wording. Victoria acceded in 1837 but was crowned in June 1838, so "who came to the throne in 1837" is safer.
2. `giant_water_lily` pt-BR `c7`: "fez a vitória-régia florescer pela primeira vez" drops the "in cultivation" qualifier that the en claim and the pt-BR card ("fora da natureza") have.
3. `poison_frog_diet` `c1` and `c5` (both): the "most toxic animals" and "the diet hypothesis won" statements rest on a Lake Forest College undergraduate review article. It is accurate here, but a primary review or museum source would be firmer. (`c2` and `c4` also cite the Smithsonian's National Zoo.)
4. `leafcutter_farming` (both): `c4` ("the fungus is the colony's only food source") sits a little awkwardly next to `c2`, where KQED says the ants "drink the sap … for energy"; the card's "They do drink a little sap, but their food is the fungus" handles it well. Also, `c5`'s second excerpt (KQED, "earliest … farmers") doesn't back the 50-million-year figure; ASM does.
5. `boto_echolocation` takeaway (both): drops the "probably" that `c1` and the card keep ("is therefore likely to depend …"). Minor.
6. `pirarucu_air_breathing` `c7`: the only source is Catraca Livre; a scientific or institutional source would be firmer.

## Draft check

`pnpm content:check-drafts` (whole repository, after recording these verdicts): **0 errors in this trail's lessons**. The repository-wide run still fails because of missing snapshots in other trails.
