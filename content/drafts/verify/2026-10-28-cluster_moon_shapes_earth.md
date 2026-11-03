# Verifier report: How the Moon shapes Earth (`cluster_moon_shapes_earth`)

- Instructions: `verify-v1` (`docs/content/VERIFIER.md`)
- Verifier: Claude (Claude Code cloud session), a separate session from the writer
- Date: 2026-10-28
- Branch: `content/c1-moon`, drafts from commit `4995bdc` (write-v1)
- Lessons: `moon_tidal_locking`, `tides`, `day_lengthening`, `eclipses_rare` (pt-BR and en)

## Snapshots

All 36 sources in `content/sources/` were re-fetched with the loop in `docs/CONTENT_PIPELINE.md`. Every snapshot hash matched the committed record, so the pages have not changed since the writer fetched them. Every excerpt was found in its snapshot.

Tooling note: the re-fetch loop also rewrites each source record's `publisher`, `type` and `accessedAt` with auto-detected values (e.g. "Smithsonian National Air and Space Museum" → "airandspace.si.edu", `news` → `reference`). The committed records were restored with `git checkout content/sources`; nothing in `content/sources/` changed in this run. A verifier-only re-fetch that leaves curated fields alone would avoid this.

## Totals

| Lesson               | Locale | Supported | Partial | Unsupported |
| -------------------- | ------ | --------: | ------: | ----------: |
| `moon_tidal_locking` | en     |        13 |       0 |           0 |
| `moon_tidal_locking` | pt-BR  |        13 |       0 |           0 |
| `tides`              | en     |        10 |       2 |           0 |
| `tides`              | pt-BR  |        10 |       3 |           0 |
| `day_lengthening`    | en     |        11 |       1 |           0 |
| `day_lengthening`    | pt-BR  |        11 |       1 |           0 |
| `eclipses_rare`      | en     |        10 |       1 |           0 |
| `eclipses_rare`      | pt-BR  |        10 |       1 |           0 |
| **Total**            |        |    **88** |   **9** |       **0** |

All high-stakes claims (`day_lengthening` c3, c5, c6; `eclipses_rare` c11) have support from two different publishers.

`pnpm content:check-drafts`: 8 draft variants, 88 supported, 9 partial, 0 unsupported, 0 not verified; drafts pass (3 warnings: `moon_tidal_locking` media not yet accuracy-reviewed, expected before M3 review). `pnpm content:dedupe`: no near-duplicate lessons.

## Partial claims

### `tides`

- **c5** (en and pt-BR), "Tides come from the difference in the Moon's pull across Earth" (also the takeaway and quiz 1's correct option and misconception). The excerpts say the Moon's gravity pulls every point on Earth (strongest nearest, weakest farthest) and that tidal forces are based on gravity, but no source states that tides come from the _difference_ in pull. The NOAA source (`…tides_7a3e59`) explains the far-side bulge with inertia, not with a weaker pull than at Earth's centre. Related: the card text and body say the Moon pulls "the near ocean harder than Earth's center, and the center harder than the far ocean"; the comparison with Earth's centre is in no claim or excerpt. The physics is standard, but it needs a source that states it (the NOAA tutorial's "tidal generating forces vary inversely as the cube of the distance" is close but does not say it).
- **c8** (en and pt-BR), "Spring tides have the biggest difference between high and low water." NOAA says high tides are "a little higher" and low tides "a little lower than average"; pt.wikipedia says the difference "tende a aumentar" / "tende a ser maior". Neither supports the superlative "biggest". Also affects quiz 2 ("the strongest tides").
- **c13** (pt-BR only), "No litoral do Maranhão, a amplitude das marés passa de vários metros." The source covers one bay, the Baía de São Marcos (up to 7.2 m at spring tides, mean 4.9 m), not the Maranhão coast as a whole. Narrow the claim and the deep dive to the Baía de São Marcos (São Luís), or add a source for the wider coast.

### `day_lengthening`

- **c10** (en and pt-BR), "…because of the atmosphere and motion in Earth's core." The source says the variations are "caused by the atmosphere, tides, and Earth's core"; "motion in" the core is more specific than the source. "Earth's core" alone would match.

### `eclipses_rare`

- **c4** (en and pt-BR), "in most months the Moon passes above or below the line between Earth and the Sun, so its shadow misses Earth" (also the card text, body and quiz 1 explanation). The first excerpt (`…moon_phases_5a8021`) is about libration in latitude (the tilt lets us see a little more of the Moon's northern or southern hemisphere), not about the Moon's shadow, so it is out of context for this claim. The second (SVS) only says eclipses don't happen every new and full Moon because of the tilt. No source states that the shadow passes above or below Earth, or "in most months".

## Statements not covered by a claim

- `moon_tidal_locking` en deep dive: "The side we never see gets just as much sunlight as the side we do"; pt-BR: "recebe tanta luz do Sol quanto o lado visível". c8 only says the far side is not permanently dark. Quiz 2's correct option repeats it in both locales ("it gets as much sunlight as the near side" / "recebe luz do Sol tanto quanto o lado visível"). No snapshot says the two sides get equal sunlight.
- `day_lengthening` card body (both locales): fossil corals with "daily and yearly growth bands" / "faixas de crescimento diárias e anuais". c4 and its excerpts cover only daily bands ("about 400 daily growth rings per year"); yearly bands are not in any claim.
- `eclipses_rare` deep dive (both locales): "the Moon can cover the Sun exactly" / "cobrir o Sol exatamente". The APOD source says the Moon blocks the Sun "almost exactly"; c8 says only that it covers the Sun.
- `tides` card text and body: the Earth's-centre comparison (see c5 above).

## Quizzes

- `q_moon_tidal_locking_2` (en, pt-BR): the correct option's "as much sunlight as the near side" is not backed by c8 or c9 (see above). The answer is right, and no distractor is also right, but the option should be worded from the claims (e.g. "No, it has day and night like the near side").
- `q_moon_tidal_locking_1` (en, pt-BR) misconception: "If it didn't [rotate], we would see all of its sides over a month" is not in any claim. Minor.
- `q_tides_1` (en, pt-BR): the correct option, explanation and misconception rest on c5 (partial). The misconception's "the second high tide would exist without [the Sun]" is not in any claim.
- `q_tides_2` (en, pt-BR): the prompt's "strongest tides" rests on c8 (partial). Option c differs by locale ("Only in the spring" / "Apenas durante eclipses"); acceptable, since the spring/season pun only exists in English, and both are wrong.
- `q_day_lengthening_1` (en, pt-BR): misconception "Distance from the Sun affects the length of the year, not the day" is not in any claim. Distractor c ("Earth's core is cooling down") is wrong as worded, but the same lesson says the core does change the day's length slightly (c10); consider a distractor that does not overlap the lesson.
- `q_eclipses_rare_2` (en): option a "Sobral, in Ceará". The en lesson and its sources only say "northeastern Brazil"; "Ceará" is backed only by the pt-BR FAPESP source used in the pt-BR c10. Add that source (or another that names Ceará) to en c10, or drop "in Ceará" from the en option.
- All other quizzes: the correct option matches its claims, no other option is also right, and the explanation matches the sources.

## Locales

pt-BR and en state the same numbers, dates and names, except:

- `tides`: pt-BR has an extra claim and deep-dive sentence about Maranhão (c13); en has no equivalent. This follows WRITER.md's Brazil-relevant angle, but en and pt-BR do not state the same facts. en also explains that "spring tide" has nothing to do with the season, which pt-BR ("sizígia") does not need.
- `moon_tidal_locking`: en names the phenomenon "synchronous rotation, or tidal locking"; pt-BR only "rotação sincronizada" (no "travamento de maré"). Minor.
- `eclipses_rare`: en heading "An eclipse in Brazil", pt-BR "Um eclipse no Ceará"; see `q_eclipses_rare_2` above.

## Quality bar (§5.1)

No sensationalism, no advice. Nothing in this trail is disputed in the sources. Small precision notes for the writer:

- `day_lengthening` card: "Tidal friction brakes Earth's spin, adding about 2 milliseconds per century." The sources give about 2 ms as the observed lengthening (Live Science: 1.8 ms observed, 2.3 ms expected from the tides alone). "About 2 ms" covers both, so c3 is supported; the writer may prefer to attribute the 2 ms to the day's lengthening rather than to tidal friction alone.
- `day_lengthening` c6: Encyclopedia.com gives 22 hours, Indiana Public Media 21.5 hours; "about 22 hours" fits both.
