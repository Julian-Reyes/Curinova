# Verification: Rome: what lasted (recheck after writer repair)

- Verifier: `claude-opus-5-5` (Claude Code helper agent), separate from the writer session and from the first-pass verifier
- Instructions: `verify-v2`, "after a writer repair" case
- Date: 2026-11-16
- First pass: `content/drafts/verify/2026-11-16-cluster_rome_what_lasted.md` (1 blocker, 6 editorial notes)
- Repair checked: commit `c9c5e69` (write-v1), 12 lesson files in the five lessons of `cluster_rome_what_lasted`

## Recheck scope

- **Claims reset to `pending` (both locales, 10 instances):** `latin_to_portuguese` c3; `gladiators_death` c8 and c9; `roman_roads` c13; `roman_concrete` c9. I re-read every support excerpt in its snapshot, with the text around it.
- **Changed passages:** `when_rome_fell` card block 1 (the first-pass blocker); `latin_to_portuguese` card block 2; `gladiators_death` card block 1 ("high-energy diet" / "dieta reforçada") and the deep dive paragraph "And the thumb?" ("spread" / "se espalhou"); `roman_roads` quiz 3 misconception (both locales).
- **Dependent passages that were not edited but rely on the new excerpts:** `gladiators_death` deep dive (Raecius Felix "who had 12"; "researchers in Austria"); `roman_roads` deep dive ("an archaeological park"); `roman_concrete` deep dive ("a team led by geologist Marie Jackson").
- **Locale counterparts:** each change appears in both pt-BR and en, and the two agree on every name, number and date.
- Unchanged claims, passages and quizzes keep their first-pass verdicts. Their text and snapshots have not changed.

## Findings

- **`latin_to_portuguese` c3: `supported` (was `partial`).** The claim and card now include the source's hedge ("it is thought" / "Acredita-se que"). This matches Instituto Camões: "Pensa-se que por volta do ano 600 o latim vulgar não fosse falado…". First-pass note 1 is resolved.
- **`gladiators_death` c8: `supported`.** The new BBC History excerpt ("Lucius Raecius Felix, who had 12 wreaths to his name") comes from the same paragraph as the other c8 excerpts. It now covers the deep dive's "who had 12". The claim text did not change.
- **`gladiators_death` c9: `supported`.** The new World Archaeology excerpt ("Karl Großschmidt of the Medical University of Vienna in Austria and Fabian Kanz of the Austrian Archaeological Institute") covers "researchers in Austria" / "pesquisadores da Áustria".
- **`roman_roads` c13: `supported`.** The new AP excerpt ("The whole area is a protected archaeological park.") covers the deep dive's "archaeological park" / "parque arqueológico".
- **`roman_concrete` c9: `supported`.** BBC calls Marie Jackson the "lead author" and Smithsonian calls her "a geologist". Together they cover "a team led by geologist Marie Jackson". BBC places her at Utah and Smithsonian at Berkeley, but the lesson names no institution, so this is fine.
- **`when_rome_fell` card block 1 (first-pass blocker): fixed.** It now reads "a boy whose father ruled in his name" / "um menino em cujo nome o pai governava". This agrees with Britannica ("For about 12 months Orestes ruled Italy in his son's name"), with c3 and with the deep dive.
- **`gladiators_death` card block 1:** "high-energy diet" / "dieta reforçada" now matches c1 and BBC History's "high-energy diet". First-pass note 4 is resolved.
- **`gladiators_death` "And the thumb?" paragraph:** "spread" / "se espalhou" now matches c13 and Encyclopaedia Romana ("perpetuated that mistaken notion"). First-pass note 3 is resolved.
- **`roman_roads` quiz 3:** the misconception now stays within Britain, as c10's source (Birmingham Roman Roads Project) does. The correct option (a) still follows from c10, and options b and c are still clearly wrong. The answer is unambiguous. First-pass note 2 is resolved.
- All excerpts match their snapshots exactly (checked mechanically and by `pnpm content:check-drafts`). None of the rechecked claims is high-stakes.

## Verdict totals for the trail

**142 supported, 0 partial, 0 unsupported, 0 pending** (71 per locale):

| Lesson                | en (supported / partial / unsupported / pending) | pt-BR          |
| --------------------- | ------------------------------------------------ | -------------- |
| `roman_concrete`      | 15 / 0 / 0 / 0                                   | 15 / 0 / 0 / 0 |
| `roman_roads`         | 14 / 0 / 0 / 0                                   | 14 / 0 / 0 / 0 |
| `gladiators_death`    | 13 / 0 / 0 / 0                                   | 13 / 0 / 0 / 0 |
| `when_rome_fell`      | 15 / 0 / 0 / 0                                   | 15 / 0 / 0 / 0 |
| `latin_to_portuguese` | 14 / 0 / 0 / 0                                   | 14 / 0 / 0 / 0 |

Quizzes: 30 questions, 0 ambiguous. Locales: no material disagreements.

## Blockers

None. The first-pass blocker (`when_rome_fell` card block 1) is fixed, and the repair introduced no new problems.

**The trail now has zero blockers.**

## Editorial notes

1. **Source record, not lesson text (carried over from first-pass note 6):** `content/sources/src_web_archive_org_web_20080703070609_http_f7be2f.json` (Instituto Camões, cited by `when_rome_fell` c2 and `latin_to_portuguese` c3–c5) still has `"language": "en"`, but the page is in Portuguese. I did not change it.

First-pass notes 1–5 are resolved.

## Draft check

I ran `pnpm content:check-drafts` (whole repository, without `-s`) after setting these verdicts. It exited with code 0: "72 draft variant(s). Claims: 1072 supported, 0 partial, 0 unsupported, 0 not verified yet. ✔ drafts pass." It reported no errors or warnings. The whole-repository totals include verdicts that another verifier is working on in this worktree for other trails. This trail accounts for 142 of the supported claims.

The trail is ready for founder review: it has no blockers, no `pending` claims, and the draft check passes.
