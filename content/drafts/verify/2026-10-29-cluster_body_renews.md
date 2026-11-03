# Verifier report: The body that renews itself (`cluster_body_renews`)

- Instructions: `verify-v1` (`docs/content/VERIFIER.md`)
- Verifier: Codex (GPT-6), separate from the writer
- Date: 2026-10-29
- Branch: `content/c1-moon`; writer draft commit: `38303f3`
- Lessons: `red_blood_cells`, `stomach_lining`, `skin_renewal`, `bone_remodeling`, `seven_year_myth` (en and pt-BR)

## Snapshots

I checked all 14 cited, local snapshot files against both the SHA-256 manifest in `.cache/body-renews-handoff/body-renews-snapshots.zip` and their committed `content/sources/*.json` hashes. All 14 matched in all three places. Every cited excerpt was present; each support was read in context. I used these saved snapshots for verdicts. I did not re-fetch live pages, so this report does not assess whether any page changed after capture. `git status content/sources` showed no changes.

## Totals

| Lesson            | Locale | Supported | Partial | Unsupported |
| ----------------- | ------ | --------: | ------: | ----------: |
| `red_blood_cells` | en     |        11 |       0 |           0 |
| `red_blood_cells` | pt-BR  |        11 |       0 |           0 |
| `stomach_lining`  | en     |         8 |       0 |           0 |
| `stomach_lining`  | pt-BR  |         8 |       0 |           0 |
| `skin_renewal`    | en     |         7 |       0 |           0 |
| `skin_renewal`    | pt-BR  |         7 |       0 |           0 |
| `bone_remodeling` | en     |         9 |       0 |           0 |
| `bone_remodeling` | pt-BR  |         9 |       0 |           0 |
| `seven_year_myth` | en     |         7 |       0 |           0 |
| `seven_year_myth` | pt-BR  |         7 |       0 |           0 |
| **Total**         |        |    **84** |   **0** |       **0** |

The high-stakes claims have qualifying support from distinct publishers: `stomach_lining` c2 (Leeds and Weill Cornell), `seven_year_myth` c1 (MedlinePlus/NLM, Leeds and PNAS) and c6 (Karolinska Institutet and Lawrence Livermore National Laboratory for adult hippocampal neuron formation, with PNAS supporting the neocortical contrast). This applies in both locales.

`pnpm content:check-drafts`: 26 draft variants across the branch, 274 supported claims, 0 partial, 0 unsupported, 0 pending; drafts pass with nine existing image-accuracy warnings (three each in Moon, Kitchen and `red_blood_cells`). `pnpm content:dedupe`: no near-duplicate lessons.

Pre-commit checks passed: `pnpm typecheck`, `pnpm lint`, `pnpm test` (215 tests), `pnpm content:validate` (28 concepts, 56 library variants, 112 questions, 84 source records; 144 existing warnings), `pnpm build`, and `pnpm exec prettier --check` on the changed files.

## Partial or unsupported claims

None.

## Editorial notes and claim coverage

These are minor precision or claim-mapping improvements, not factual blockers:

- `content/drafts/lessons/bone_remodeling/variant.en.json` and `variant.pt-BR.json`, `cardText`, second `cardBlocks` paragraph, and `q_bone_remodeling_2` explanation: remodeling is described as occurring at sites in the skeleton / being localized. The York snapshot explicitly says “discrete sites in the skeleton,” but no claim states the location aspect. Add it to a claim during editorial repair so the card and quiz wording map directly to one.
- `content/drafts/lessons/red_blood_cells/variant.en.json` and `variant.pt-BR.json`, last `deepDiveBlocks` paragraph: “maintaining that liquid” / “manter esse líquido” adds a vague plasma-maintenance statement beyond c11, which describes plasma and its composition. Rephrase this as a comparison of blood components or add a claim if a specific maintenance process is intended.
- `content/drafts/lessons/seven_year_myth/variant.en.json` and `variant.pt-BR.json`, `cardText`: “Studies have found” / “Estudos encontraram” is plural, while the cited neuron-age evidence here is one PNAS study. The study examined **neocortical** neurons; naming that region here would make the distinction from the adult hippocampus clearer. The current “some neurons” and the deep dive's regional qualification keep the claim accurate.

All other factual statements in card text, card body, takeaway and deep dive map to claims supported by the snapshots. The notes above identify the only wording or claim-coverage gaps found.

## Quizzes, locales and quality bar

All 20 questions (two per lesson and locale) have one correct option according to their `claimIds`; no distractor is also correct. Their explanations match the snapshots. No quiz blocker was found.

The two locales agree on the facts, including numbers, named anatomy and the seven-year framing. No sensationalism or advice was found. The neuron-formation conclusion is qualified to the adult hippocampus, while the long-lived neuron study is treated as evidence about some neurons rather than the whole brain. The nine image-accuracy warnings still need separate media review; this verification covered the lesson and quiz text, not the artwork.
