# Verifier report: Kitchen chemistry (`cluster_kitchen_chemistry`)

- Instructions: `verify-v1` (`docs/content/VERIFIER.md`)
- Verifier: Codex (GPT-6), a separate verifier session from the writer
- Date: 2026-10-29; the filename retains the requested 2026-10-28 run ID
- Branch: `content/c1-moon`, drafts at `6e9e141` (writer's source repair)
- Lessons: `altitude_boiling`, `maillard_reaction`, `onion_tears`, `salt_boiling`, in pt-BR and en
- Scope of edits: only the eight variants' `autoVerdict` values and this report. Lesson and quiz wording, evidence, human verdicts, source records, and the Moon trail are unchanged.

## Snapshots and method

`pnpm content:sources refetch` completed: **67 sources re-fetched, 0 with changed text, 0 failed**. No changed pages to list. `git status --short content/sources` was empty afterward, so restoration was unnecessary. Snapshots remain local and uncommitted.

The previous Band and Royal Meteorological Society blockers were removed by the writer. The replacement altitude c2 uses USDA's 7,500 feet / 198 °F example (approximately 2,300 m / 92 °C); c8 uses Embrapa's preparation instructions for biofortified common beans. Both revised claims are supported in both locales.

Checked all **92 claims**, locating all **187 support entries** in **29 distinct snapshots**, reading the surrounding text, and checking publisher records. Every excerpt was found and every used snapshot matched its committed hash. Matching an excerpt was treated separately from whether it supports the claim. Ordinary translations, rounding, and direct numerical derivations were accepted: for example, altitude c2's unit conversions and salt c7's doubling of 29.2 g to 58.4 g under the source's explicit linear-scaling rule.

Also checked every card text, card paragraph, takeaway, deep-dive block, and all **16 quiz questions**, including distractors, explanations and misconceptions, against the claims and saved sources. The findings below concern evidence coverage and wording, not approval for publication.

## Totals

| Lesson              | Locale | Supported | Partial | Unsupported |
| ------------------- | ------ | --------: | ------: | ----------: |
| `altitude_boiling`  | pt-BR  |        12 |       0 |           0 |
| `altitude_boiling`  | en     |        12 |       0 |           0 |
| `maillard_reaction` | pt-BR  |        12 |       0 |           0 |
| `maillard_reaction` | en     |        12 |       0 |           0 |
| `onion_tears`       | pt-BR  |        10 |       2 |           0 |
| `onion_tears`       | en     |        10 |       2 |           0 |
| `salt_boiling`      | pt-BR  |         7 |       3 |           0 |
| `salt_boiling`      | en     |         7 |       3 |           0 |
| **Kitchen total**   |        |    **82** |  **10** |       **0** |

No kitchen claims remain pending. The only `highStakes: true` claim is onion c9 in each locale. Physics World (IOP Publishing) and Nautilus are different publishers and both support the reported increase in droplet emission after chilling. Thus the finding meets the two-publisher requirement, but the claim remains partial because its attached evidence does not establish the study's year (below). These are two reports of the same study, not two independent experiments.

`pnpm content:check-drafts`: **16 draft variants, 180 supported, 10 partial, 0 unsupported, 0 not verified; 0 errors**, pass. This command includes the unchanged Moon trail, so its totals exceed the kitchen-only table. It printed **6 warnings** about media awaiting accuracy review: discover, deeper and review images for `maillard_reaction` and `moon_tidal_locking`.

`pnpm content:dedupe`: **0 near-duplicate pairs**.

Additional required checks passed: `pnpm typecheck`, `pnpm lint`, `pnpm test` (**215 tests in 21 files**), `pnpm content:validate`, `pnpm build`, and `pnpm exec prettier --check` on all nine changed files. Library validation reported **130 warnings** (16 media-unreviewed, 7 trail-size, 40 no-claims, 67 unused-source); it checks the library rather than replacing its copies with these drafts. The draft-check totals above are the relevant results for this verification. A structural comparison with `6e9e141` confirmed that every existing-file change is an `autoVerdict` value.

## Partial claims

File paths below are relative to `content/drafts/lessons/`. `variant.{pt-BR,en}.json` and `quiz.{pt-BR,en}.json` explicitly mean both locale files.

- **`onion_tears/variant.{pt-BR,en}.json`, c9:** the chilling result is supported, but none of its three attached snapshots (The Curious Clinicians `src_curiousclinicians_com_af8c54`, Physics World `src_physicsworld_com_a_the_physics_behind_6827f7`, Nautilus `src_nautil_us_no_more_tears_scientists_f1e16d`) supplies **2025**. The year does appear in the saved ScienceAlert snapshot `src_sciencealert_com_theres_a_surprisingly_simple_e8de09`, which is attached to c8, not c9. The writer can attach that existing evidence to c9. Nautilus additionally cautions that further study is needed before definitive conclusions; the lesson's attribution to a study should be retained.
- **`onion_tears/variant.{pt-BR,en}.json`, c12:** Bristol `src_chm_bris_ac_uk_motm_pso_1da9c2` says heating **before chopping may reduce tearing** by denaturing enzymes, and notes disagreement about the remedies. That is weaker than the categorical claim that cooked onions **do not sting the eyes**. The Curious Clinicians supports sweet flavor after sautéing, but does not establish enzyme deactivation as the cause of sweetness. The final deep-dive paragraph connects deactivation to both outcomes more strongly than the sources do.
- **`salt_boiling/variant.{pt-BR,en}.json`, c3:** Lumen Learning `src_courses_lumenlearning_com_umes_cheminter_chapter_f134db` and Illinois `src_van_physics_illinois_edu_ask_listing_da77f1` establish a small elevation at low salt concentrations and give quantities in grams per liter/kilogram. Neither supplies the mass of a **tablespoon**, nor establishes **a tablespoon in a few liters** as the usual cooking quantity. The general effect is backed; that specific household-measure example and its usualness are not fully supported by the attached evidence.
- **`salt_boiling/variant.{pt-BR,en}.json`, c4:** The Naked Scientists `src_thenakedscientists_com_node_179726_c31125` explains intensified bubbling when salt is added to water **already boiling**. The claim generalizes this to **hot water** suddenly fizzing. Nucleation is supported, but the necessary temperature condition has been broadened. This also affects the card's second paragraph and quiz 2.
- **`salt_boiling/variant.{pt-BR,en}.json`, c5:** Lumen Learning says flavor is **one reason** for adding salt to pasta water, not that it is **mainly** the reason. The ranking of motives is stronger than the evidence. The card text, second card paragraph and takeaway repeat that emphasis.

No claims were marked unsupported.

## Statements not fully covered by a claim

- **`altitude_boiling/variant.{pt-BR,en}.json`, `cardText`, `cardBlocks[1].text`, and takeaway `cardBlocks[2].text`:** water **boils sooner / ferve antes** is a time-to-boil assertion. c4 covers a lower boiling temperature and c5 covers slower food cooking; neither claims shorter time to reach boiling. Add explicit claim coverage and evidence with the comparison conditions. The title and summary repeat it.
- **`maillard_reaction/variant.pt-BR.json`, `deepDiveBlocks[3].text`:** drying meat **with paper / com papel** adds a specific method absent from c12 and its snapshots. c12 supports removal of surface water and avoiding overcrowding, not this particular technique. The same paragraph's advice issue is listed below.
- **`onion_tears/variant.{pt-BR,en}.json`, takeaway `cardBlocks[2].text`:** calls the mechanism the plant's chemical defense as a settled fact. c5 and Bristol explicitly qualify that function as **thought to be / acredita-se**. The card paragraph retains this qualification; the takeaway drops it.
- **`salt_boiling/variant.{pt-BR,en}.json`, `cardBlocks[0].text`:** the time difference is **unnoticeable / imperceptível**. c1 addresses direction of the effect, c3 temperature change; neither covers perceptibility of elapsed time. The saved sources do not quantify an imperceptible delay. Quiz 1's misconception repeats it.
- **`salt_boiling/variant.{pt-BR,en}.json`, takeaway `cardBlocks[2].text`:** says salt raises the boiling point by **only a fraction of a degree** without a concentration limit. c3 is limited to cooking quantities, while c7 explicitly describes an amount giving a full degree. The takeaway needs that scope to remain within its claims.

Other required lesson statements are covered by the claims, subject to the partial verdicts above. The salt/seawater comparison follows directly from c7 and c8; it is not an additional unsupported numerical claim.

## Quizzes

All correct options are option `a`. No alternative option is also supported as the answer under the intended conditions. The following qualifications prevent treating every question as fully verified:

- **`altitude_boiling/quiz.{pt-BR,en}.json`, questions 1 and 2:** correct options, explanations and the question 1 misconception agree with their claims and sources. No issue found.
- **`maillard_reaction/quiz.en.json`, `q_maillard_reaction_1__en`, `options[a].text`:** **below what the reaction needs** suggests a strict minimum temperature. c4 says the reaction speeds up around 140 °C, not that it cannot occur below that temperature. CooksInfo explicitly describes a beginning around 50 °C and a later browning stage; BBC Science Focus describes rapid production above 100 °C, ideally 110–170 °C. The pt-BR option's **abaixo do ideal** is more qualified. Both explanations should preserve the distinction between rapid browning and the reaction being possible at all.
- **`maillard_reaction/quiz.{pt-BR,en}.json`, question 2, `explanation`:** the correct option properly distinguishes amino acids plus sugars from sugars alone. The explanation then says Maillard **requires proteins**. That is not the same requirement as c2's amino acids; the saved Wikipedia and KUNC descriptions specify amino acids as the reactants. Avoid introducing a requirement for proteins that the correct option and claims do not state.
- **`onion_tears/quiz.{pt-BR,en}.json`, question 1:** correct option and explanation match c1/c2; no issue found.
- **`onion_tears/quiz.{pt-BR,en}.json`, question 2:** option `a` agrees with the cutting experiments and the other options do not describe fewer droplets in those experiments. The explanation's year inherits c9's evidence-link gap. The prompt and imperative answer turn the experimental finding into practical advice and should retain the study's scope and caution rather than imply an established universal rule. The sources distinguish droplet emission from the older volatility rationale for chilling; they do not establish that every proposed way of reducing tears was disproved.
- **`salt_boiling/quiz.{pt-BR,en}.json`, question 1:** its numerical answer depends on partial c3's tablespoon example. The misconception additionally asserts an imperceptible delay, uncovered above. No distractor is supported by the cited chemistry.
- **`salt_boiling/quiz.{pt-BR,en}.json`, question 2:** the nucleation answer is backed for boiling water, but the prompt says merely hot water and the explanation changes the condition to **nearly boiling**. The attached source describes water already boiling; see partial c4. No alternative option is supported.

## Locales

The lesson pairs agree on the stated numbers, dates and named people/chemicals. Shared source gaps affect both locales. Three localized wording differences need attention:

- **`maillard_reaction/quiz.en.json`, question 1 option `a`, versus `quiz.pt-BR.json`:** required temperature versus ideal temperature, as described above.
- **`salt_boiling/quiz.pt-BR.json`, question 1 `prompt`, versus `quiz.en.json`:** Portuguese says only **uma colher**, whereas English specifies a **tablespoon**. The Portuguese lesson itself says **colher de sopa**; the quiz loses that measure.
- **`maillard_reaction/variant.pt-BR.json`, `deepDiveBlocks[3].text`, versus `variant.en.json`:** Portuguese specifies paper for drying; English only says to pat the meat dry. This is a small extra procedural detail in Portuguese, with the coverage gap noted above.

## Quality bar (§5.1 / verify-v1)

- **Advice:** `maillard_reaction/variant.{pt-BR,en}.json`, `deepDiveBlocks[3].text`, recommends drying meat and avoiding overcrowding. `onion_tears/quiz.{pt-BR,en}.json`, question 2's prompt and correct option, directly instruct how to cut onions. These conflict with verify-v1's explicit **no advice** rule even though they are culinary rather than individualized medical advice. Reframe as explanations or attributed observations in a writer pass.
- **Hypothesis qualification:** the onion takeaway drops the defense hypothesis's qualifier; see coverage above. The chilling result remains attributed to one study in the lesson, appropriately, but its quiz should preserve that scope.
- **Hook precision:** `onion_tears/variant.{pt-BR,en}.json`, `hook`, calls a whole onion **harmless / inofensiva** and the tears a **weapon / arma**. c2 establishes absence of the cutting-induced tear mechanism, not harmlessness in general; c5 attributes possible defense to the onion's irritant, not to the reader's tears. The hook broadens and confuses the supported mechanism.
- **Unexplained terms:** `altitude_boiling/variant.{pt-BR,en}.json`, `deepDiveBlocks[1].text`, introduces **biofortified / biofortificado** without explanation. `maillard_reaction/variant.{pt-BR,en}.json`, `deepDiveBlocks[2].text`, introduces **alkaline / alcalino** without explaining it. §5.1 asks for uncommon words to be explained.

No individualized medical, financial or legal advice was found. Image accuracy approval is outside this text-verification scope and remains outstanding in the validator warnings. No source-access limitation remains for the requested text checks.
