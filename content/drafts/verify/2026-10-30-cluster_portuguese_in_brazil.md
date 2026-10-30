# Verification: How Portuguese Became Brazil's Language

- Verifier model: Codex (GPT-6)
- Instructions: `verify-v2`
- Date: 2026-10-30
- Scope: `cluster_portuguese_in_brazil`; four draft lessons (`tordesillas`, `lingua_geral`, `pombal_directorate`, `tupi_words`), both locales, 66 claim instances and 16 quiz questions. Checked the substantive card text, card blocks, takeaways, deep dives, locale counterparts, and user-facing cluster/concept text against all ten cited local source snapshots.
- Claim verdicts: **64 supported, 2 partial, 0 unsupported, 0 pending** (per locale: 32 supported, 1 partial). All cited excerpts occur verbatim in their snapshots; **no snapshots are missing**.
- Quiz review: **16 checked, 0 ambiguous or unsupported answers**. Correct options and explanations follow the cited claims in both locales.
- Locale review: **no material disagreements** in dates, names, numbers, mechanisms, or quiz answers.
- Quality bar: No sensationalism, unmarked material disputes, or individualized medical, financial, or legal advice in the lesson variants. One misleading related-link caption is a blocker below.

## Blockers

1. **Insufficient independent support for a high-stakes claim.** `content/drafts/lessons/pombal_directorate/variant.en.json` and `variant.pt-BR.json`, claim `c6` (`autoVerdict: partial` in each). The Arquivo Nacional snapshot supports forced acculturation and continued exploitation of Indigenous labor and village lands. The second cited publisher, UFRJ's _LaborHistórico_, supports the Directorate's language restrictions and Portuguese teaching but says nothing in its saved snapshot about labor exploitation or land loss. Thus the full high-stakes claim has only one supporting publisher, below the `verify-v2` two-publisher requirement. The claim's core is backed by Arquivo Nacional; the partial verdict records the missing independent corroboration, not a contradiction. Add an independent source that supports the labor/land details, or narrow and reassess the high-stakes claim and dependent card/deep-dive passages in both locales.
2. **Material causal assertion has no claim.** `content/drafts/lessons/tordesillas/variant.en.json` and `variant.pt-BR.json`, `summary`, `cardText`, and `cardBlocks[0]`: Portuguese spread later _through colonization_ is central to the lesson's answer, but claims `c1`–`c7` cover the treaty, borders, pre-existing Indigenous languages, and colonizers' use of Tupi, not the spread of Portuguese through colonization. The three cited snapshots do not directly establish that causal assertion. Add a supported claim and source or revise the assertion; recheck the locale counterpart.
3. **Related-link caption teaches the opposite mechanism.** `content/drafts/lessons/tupi_words/concept.json`, `related` entry for `concept_tordesillas`, `reason.en` ("the line that decided Brazil's language") and `reason.pt-BR` ("a linha que decidiu a língua do Brasil"). The first lesson explicitly and correctly explains that the line set colonial claims but did not decide what people spoke. Change both captions so the link does not undo that explanation.

**The trail does not have zero blockers and is not yet ready for founder review.**

## Editorial notes

1. `content/drafts/lessons/tordesillas/variant.en.json` and `variant.pt-BR.json`, `summary`, `cardText`, and `cardBlocks[0]`: "part of present-day Brazil" on Portugal's side is a reasonable geographic inference from the line's location and the territory discussion, but none of the saved text excerpts states that precise modern-geography mapping. A direct source or explicit claim would make the lesson's opening easier to audit. This is separate from the causal-assertion blocker above.
2. `content/sources/src_labeurb_unicamp_br_elb_ler_102_8d1cbf.json`, `language`: recorded as `en-US`, although the saved Unicamp article is in Portuguese. Correct the source metadata when repairing the draft.
3. `content/drafts/clusters/cluster_portuguese_in_brazil.json`, `conceptIds`: four lessons; the draft checker warns that §5.3 recommends five to eight per trail. This is a recommendation, not a factual blocker. Founder review of the trail's scope can decide whether four is sufficient.

## Draft check

Ran `PATH=/Users/apple/.nvm/versions/node/v24.22.1/bin:$PATH pnpm content:check-drafts`. **Passed** across the repository's 44 draft variants: 392 supported, 2 partial, 0 unsupported, 0 not verified yet. It emitted the four-concept recommendation and existing media-review warnings, including two Tordesillas media fields awaiting M3 review. The mechanical pass does not clear the blockers above.
