# Verifier session instructions (`verify-v2`)

You are fact-checking lesson drafts written by another session. You have not seen how they were written; judge only what the drafts say against the saved sources. **Do not rewrite lesson text**: record verdicts and problems; the writer fixes them.

The target is a simple explanation that remains true when simplified. Accept omitted detail, ordinary explanatory language and clearly qualified conclusions. Do not demand research-paper precision. Block a simplification when it teaches the wrong mechanism or changes the finding's meaning.

For a first pass, check each draft variant in `content/drafts/lessons/<key>/variant.<locale>.json`. After a writer repair, recheck changed claims and their support, plus every dependent card passage, deep dive passage, quiz and locale counterpart. Unchanged verdicts may stand when their text and source snapshots have not changed.

1. **Each claim.** Open each support's snapshot (`content/sources/.snapshots/<sourceId>.txt`), find the excerpt and read the text around it. Set `autoVerdict`:
   - `supported`: the sources back the claim's substantive meaning, including a faithful simplification or qualified conclusion;
   - `partial`: the core is backed, but a qualifier, scope or secondary detail lacks support;
   - `unsupported`: the claim is contradicted, teaches the wrong mechanism, or lacks support for its core meaning.
     A high-stakes claim needs two supporting sources from different publishers. Keep the evidence verdict distinct from the severity of a problem: a `partial` claim can be an editorial note or a blocker depending on what readers would learn.
2. **Coverage.** The substantive facts in the card text, card body, takeaway and deep dive must map to claims. Flag a missing claim when it leaves a material assertion unchecked; do not split a supported explanation into extra claims solely for finer wording.
3. **Quizzes.** The correct option follows from its claims, no other option is also right, and the explanation matches the sources.
4. **Locales.** pt-BR and en agree on material facts, especially mechanisms, numbers, dates and names. Natural differences in phrasing are fine.
5. **Quality bar** (§5.1): no sensationalism, disputes marked, no individualized medical, financial or legal advice.

## Severity and handoff

- **Blockers:** incorrect claims, misleading explanations (including a wrong mechanism or false attribution), unsupported numbers, ambiguous quiz answers, material locale disagreements, missing evidence for a high-stakes claim, and source excerpts that fail the mechanical check. The writer must fix these before the trail is cleared.
- **Editorial notes:** minor wording or citation improvements, omitted nonessential detail, and qualified explanations that could be more precise without changing what readers learn. These do not reopen a trail.

Write `content/drafts/verify/<runId>.md` with the verifier model, `verify-v2`, date, scope, verdict totals, **Blockers** and **Editorial notes**. For each `partial` or `unsupported` claim and each coverage, quiz or locale issue, give the file, claim ID or field, reason and severity. Say explicitly whether the trail has zero blockers. Run `pnpm content:check-drafts` and report its totals; it catches unsupported verdicts and misquoted excerpts but does not judge prose or quiz meaning. A trail is ready for founder review when there are no blockers, no changed claims left `pending`, and the draft check passes. Founder review and publication remain separate.
