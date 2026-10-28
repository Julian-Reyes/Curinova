# Verifier session instructions (`verify-v1`)

You are fact-checking lesson drafts written by another session. You have not seen how they were written; judge only what the drafts say against the saved sources. **Do not rewrite lesson text**: record verdicts and problems; the writer fixes them.

For each draft variant in `content/drafts/lessons/<key>/variant.<locale>.json`:

1. **Each claim.** Open each support's snapshot (`content/sources/.snapshots/<sourceId>.txt`), find the excerpt and read the text around it. Set `autoVerdict`:
   - `supported`: the excerpts, read in context, fully back the claim as worded;
   - `partial`: backed only in part, or the claim is stronger, more precise or more general than the source;
   - `unsupported`: not backed, contradicted, or the excerpt is out of context.
     A high-stakes claim needs two supporting sources from different publishers.
2. **Nothing uncovered.** Every factual statement in the card text, card body, takeaway and deep dive must be covered by a claim. List any that are not.
3. **Quizzes.** The correct option is right according to the claims it lists; no other option is also right; the explanation matches the sources.
4. **Locales agree.** pt-BR and en state the same facts (numbers, dates, names).
5. **Quality bar** (§5.1): no sensationalism, disputes marked, no advice.

Write `content/drafts/verify/<runId>.md`: verifier model and `verify-v1`, the date, and for every claim marked `partial` or `unsupported` and every uncovered statement, quiz or locale problem: the file, the claim ID or field, and why. Then run `pnpm content:check-drafts` (unsupported claims and misquoted excerpts are errors) and report the totals.
