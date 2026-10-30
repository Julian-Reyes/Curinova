# Verification, round 2: How Portuguese Became Brazil's Language

- Verifier model: Codex (GPT-6)
- Instructions: `verify-v2`
- Date: 2026-10-30
- Scope: Repair commit `080b3a4` against original draft `f059463` and the first verification report. Rechecked changed claims `pombal_directorate/c6` and `tordesillas/c8` in en and pt-BR against each cited snapshot and surrounding source text. Rechecked the dependent Pombal card and deep-dive passages, Tordesillas summaries, card text and blocks, both lessons' quizzes and locale counterparts, and the `tupi_words` related-link reason. Unchanged claim and quiz verdicts carry forward because their text and saved source hashes did not change. All 10 saved source snapshots still match their recorded hashes.
- Claim verdicts: **68 supported, 0 partial, 0 unsupported, 0 pending** across eight variants (34 supported per locale). This includes four newly assessed claim instances.
- Quiz review: **16 checked, 0 ambiguous or unsupported answers**. The four Pombal and Tordesillas questions in each locale remain supported after the repair; the other eight carry forward unchanged.
- Locale review: **no material disagreement** in the changed claims, passages, related-link reason, or quizzes.
- Quality bar: No new sensationalism, unmarked material dispute, or individualized medical, financial, or legal advice.

## Blockers

**None. The trail has zero blockers, no changed claim remains pending, and it is ready for founder review.** Founder review and publication remain separate.

## Editorial notes

1. `content/drafts/lessons/tordesillas/variant.en.json` and `variant.pt-BR.json`, `summary`, `cardText`, and `cardBlocks[0]`: The snapshots establish Tordesillas's territorial claims and its role in forming Portuguese America, but do not directly spell out the exact mapping of the treaty line onto **part of present-day Brazil**. This remains a reasonable geographic inference, not a blocker. The summary's “helped define Portuguese colonial rule” / “ajudou a definir o domínio colonial português” is also looser than the sources' language of claims and later occupation; wording it as a territorial claim would make the causal distinction clearer.
2. `content/drafts/clusters/cluster_portuguese_in_brazil.json`, `conceptIds`: The trail has four concepts; §5.3 recommends five to eight. This remains a scope recommendation for founder review, not a factual blocker.
3. `content/drafts/lessons/tordesillas/concept.json`, `media.discover` and `media.deeper`: Accuracy review remains pending under M3. This is a media-review handoff, not a new prose or quiz blocker.

## Repair findings

- `pombal_directorate/c6`, en and pt-BR: **supported**. Arquivo Nacional explicitly describes the Directorate's compulsory acculturation and its program of adopting Portuguese. The UFRJ _LaborHistórico_ snapshot independently describes prohibition of Indigenous languages, adoption and teaching of Portuguese, and the goal of Indigenous “civilidade.” Together these support the narrowed high-stakes claim. The dependent card and deep dive now omit the earlier labor and land assertion; their remaining language-policy and gradual-change statements map to `c3`–`c8`.
- `tordesillas/c8`, en and pt-BR: **supported**. Unicamp describes Língua Geral Paulista yielding to Portuguese in São Paulo from the 18th century with Pombaline measures. UFRJ describes the Directorate's language policy and Indigenous schooling as important to Portuguese's advance in Indigenous towns. The claim and changed card passages qualify the effect as helping Portuguese gain ground in regions, without making the treaty itself cause a language switch.
- `tupi_words/concept.json`, `related[concept_tordesillas].reason.en` and `.reason.pt-BR`: The caption now describes a preceding territorial agreement and no longer attributes Brazil's language to the treaty line. Both locales agree.
- The Pombal and Tordesillas quizzes in both locales still have one supported correct option each; their explanations agree with the cited claims. No changed claim is needed for a quiz answer.
- `content/sources/src_labeurb_unicamp_br_elb_ler_102_8d1cbf.json`, `language`: Corrected to `pt-BR`, matching the saved Portuguese article.

## Draft check

Ran `PATH=/Users/apple/.nvm/versions/node/v24.22.1/bin:$PATH pnpm content:check-drafts`. **Passed** across 44 repository draft variants: **396 supported, 0 partial, 0 unsupported, 0 not verified yet**. The checker reported the four-concept recommendation and existing M3 media-review warnings, including two Tordesillas fields.
