# Verifier report, run 2: How the Moon shapes Earth (`cluster_moon_shapes_earth`)

- Instructions: `verify-v1` (`docs/content/VERIFIER.md`)
- Verifier: Claude (Claude Code cloud session), separate from the writer
- Date: 2026-10-28
- Branch: `content/c1-moon`, drafts from commit `c182e4e` (writer fixes after the [first report](2026-10-28-cluster_moon_shapes_earth.md))
- Scope: the 18 claims the writer reset to `pending`, plus a re-read of every changed passage, quiz and locale pair. Claims and text unchanged since run 1 keep their run-1 verdicts; their snapshots are unchanged, so those verdicts still hold.

## Snapshots

`pnpm content:sources refetch`: 38 sources re-fetched (36 from run 1 plus `src_scienceinschool_org_article_2026_unlocking_the_400a1a` and `src_science_nasa_gov_eclipses_types_42f02f`), 0 with changed text, 0 failed. Source records were left unchanged. Every excerpt was found in its snapshot.

## Re-verified claims

All 18 are **supported**.

| Lesson               | Locale | Claims                | Notes                                                                                                                                                                                                                                                                     |
| -------------------- | ------ | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `moon_tidal_locking` | en     | c8                    | "also gets sunlight": NASA, "different parts are in sunlight or darkness at different times".                                                                                                                                                                             |
| `moon_tidal_locking` | pt-BR  | c4, c8                | c4 now adds "travamento de maré", backed by NASA's "synchronous tidal locking".                                                                                                                                                                                           |
| `day_lengthening`    | en     | c10                   | Now matches the source's "the atmosphere … and Earth's core".                                                                                                                                                                                                             |
| `day_lengthening`    | pt-BR  | c10                   | Same.                                                                                                                                                                                                                                                                     |
| `tides`              | en     | c3, c5, c8, c13 (new) | Science in School states the near > centre > far comparison and, in context, "tides arise from differences in the Moon's gravitational field across the Earth's surface". c8 now says "higher than average", not "biggest". c13 matches "até 7,2 m nas marés de sizígia". |
| `tides`              | pt-BR  | c3, c5, c8, c13       | Same; c13 is now limited to the Baía de São Marcos.                                                                                                                                                                                                                       |
| `eclipses_rare`      | en     | c4, c8, c10           | c4 now rests on NASA "Types of Solar Eclipses" ("only happens occasionally, because the Moon doesn't orbit in the exact same plane"); the out-of-context libration excerpt is gone. c8 "almost exactly" matches APOD. c10 adds the pt-BR FAPESP source for Ceará.         |
| `eclipses_rare`      | pt-BR  | c4, c8                | Same as en.                                                                                                                                                                                                                                                               |

## Run-1 findings

Every partial claim, uncovered statement, quiz problem and locale problem from run 1 is resolved:

- Uncovered statements: the far side's "just as much sunlight", the corals' "yearly" bands, "cover the Sun exactly" and the Earth's-centre comparison in `tides` were each removed or are now covered by a supported claim.
- Quizzes: `q_moon_tidal_locking_2` option a ("has day and night like the near side") follows from c8 and c9. The `q_moon_tidal_locking_1`, `q_tides_1` and `q_day_lengthening_1` misconceptions are now covered by their claims (`q_tides_1` now lists c5). `q_tides_2` no longer says "strongest" (its "extra-high high tides" is in c8's NOAA excerpt). The new `q_day_lengthening_1` distractor ("The Sun's gravity is getting stronger") is wrong and doesn't overlap the lesson. `q_eclipses_rare_1`'s explanation matches c4. `q_eclipses_rare_2`'s "Sobral, in Ceará" is now backed in en.
- Locales: en `tides` now has the Baía de São Marcos example (c13), and pt-BR `moon_tidal_locking` now names "travamento de maré". In every changed passage, pt-BR and en state the same facts and numbers.

No new problems found. No sensationalism, no advice, nothing disputed.

## Totals

| Lesson               | en (supported / partial / unsupported) | pt-BR      |
| -------------------- | -------------------------------------- | ---------- |
| `moon_tidal_locking` | 13 / 0 / 0                             | 13 / 0 / 0 |
| `tides`              | 13 / 0 / 0                             | 13 / 0 / 0 |
| `day_lengthening`    | 12 / 0 / 0                             | 12 / 0 / 0 |
| `eclipses_rare`      | 11 / 0 / 0                             | 11 / 0 / 0 |

`pnpm content:check-drafts`: 8 draft variants, 98 supported, 0 partial, 0 unsupported, 0 not verified; drafts pass. `pnpm content:dedupe`: no near-duplicate lessons.

Not checked by this run: `humanVerdict` (founder review) and the image accuracy reviews for `moon_tidal_locking`.
