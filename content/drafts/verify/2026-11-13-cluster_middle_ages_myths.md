# Verification: Myths about the Middle Ages

- Verifier: `claude-opus-5-5` (Claude Code session), separate from the writer session
- Instructions: `verify-v2`
- Date: 2026-11-13
- Scope: `cluster_middle_ages_myths`, first pass. Six lessons (`flat_earth_myth`, `horned_helmets`, `armour_weight`, `medieval_bathing`, `medieval_life_expectancy`, `black_death_wages`) from commit `823c503` (write-v1), both locales: 178 claim instances (89 per locale), 282 support excerpts and 36 quiz questions. Also checked: `content/drafts/clusters/cluster_middle_ages_myths.json`.
- Claim verdicts: **178 supported, 0 partial, 0 unsupported, 0 pending**.
- Quiz review: **36 checked, 0 ambiguous answers**. Every correct option follows from its claims, and every distractor is clearly wrong.
- Locale review: **no material disagreements**. Claim IDs, `highStakes` flags, support excerpts, source lists, quiz answers and quiz `claimIds` are identical across pt-BR and en, and the prose matches on every number, date and name.
- Quality bar: no sensationalism and no medical, financial or legal advice. Disputes are marked: the Black Death death toll ("still debated", plus the pollen study), why bathhouses declined ("still debated"), armour weight ("Estimates vary") and adult lifespan ("Even without childhood deaths, medieval lives were shorter than ours"). None of the lessons is date-sensitive, so `reviewAfter: null` is fine.
- Cluster file: titles, hooks and `conceptIds` match the six lessons. The only link is `cluster_everyday_myths`, which exists. The outline's other links will come with trails 2 and 3.

## Snapshots

All 19 sources the trail cites have snapshots, and all 282 excerpts match them exactly.

| Lesson                     | Sources (publisher)                                                                                                                                                | en (supported / partial / unsupported) | pt-BR      |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | ---------- |
| `flat_earth_myth`          | The Public Medievalist; Dialog Theologie & Naturwissenschaften (Pablo de Felipe); Linda Hall Library; American Scientific Affiliation (J. B. Russell's 1997 paper) | 14 / 0 / 0                             | 14 / 0 / 0 |
| `horned_helmets`           | ScienceNorway (×2); OUPblog; National Geographic; National Museum of Denmark; CNN; Aarhus University                                                               | 17 / 0 / 0                             | 17 / 0 / 0 |
| `armour_weight`            | Brewminate (reprint of a Met essay by Dirk H. Breiding); Smithsonian Magazine; ScienceDaily; Proc. R. Soc. B via PMC                                               | 16 / 0 / 0                             | 16 / 0 / 0 |
| `medieval_bathing`         | Medievalists.net; History News Network (Eleanor Janega); Paris Voice                                                                                               | 16 / 0 / 0                             | 16 / 0 / 0 |
| `medieval_life_expectancy` | The Skeptic; Our World in Data (×2); SAPIENS                                                                                                                       | 10 / 0 / 0                             | 10 / 0 / 0 |
| `black_death_wages`        | Science in Poland (PAP); Medievalists.net; WashU Center for the Humanities; Britannica (×2); Fordham Internet History Sourcebooks                                  | 16 / 0 / 0                             | 16 / 0 / 0 |

High-stakes claims, checked for two publishers: `flat_earth_myth` c1 and c5; `horned_helmets` c1, c3 and c5; `armour_weight` c1 and c4; `medieval_bathing` c1, c3, c4 and c6; `medieval_life_expectancy` c1; `black_death_wages` c1, c2 and c4. Each has at least two supporting publishers. Editorial notes 3, 5 and 8 cover the ones whose support is weak or second-hand.

Where the lessons depart from the outline (`TRAILS_BATCH_3.md` §1), they follow the sources, and none of these is a problem. `horned_helmets` calls Gjermundbu the best-known helmet rather than "the only near-complete" one, because a UK helmet has since been dated to the Viking Age (c8). `armour_weight` gives 20–25 kg (Met) and 30–50 kg (2011 study) rather than 15–25 kg. `medieval_life_expectancy` is more cautious than the outline's "50s and 60s", in line with The Skeptic. `medieval_bathing` makes no claim about Paris tax records, and neither source mentions them.

## Blockers

None.

**The trail has zero blockers.**

## Editorial notes

1. **`flat_earth_myth` summary, cardText and takeaway (both locales), and `c5` (high-stakes, `supported`):** "invented / created in the 19th century" ("nasceu / foi criado no século XIX") goes further than the sources. The two cited supports (Russell via ASA; The Public Medievalist) do back "arose in the 19th century; Irving one of the first". But the lesson's own Dialog source (de Felipe) says that "an even more complex prehistory of the flat error before the 19th century" exists, pointing to Montfaucon's 1706 republication of Cosmas. The card body ("only took hold / só se espalhou") and quiz 3 ("spread") have it right. Use "spread" or "took hold" in the summary and takeaway too.
2. **`armour_weight` pt-BR cardText:** "Conseguiam, sim." follows the title "Cavaleiros de armadura mal conseguiam se mexer?", so it can be read as confirming the myth. The en version is clear ("They moved just fine."). Something like "Mexiam-se bem, sim." would avoid the ambiguity.
3. **`armour_weight`, eight claims cite a reprint (c1, c2, c3, c4, c6, c9, c10, c11):** all of them rest on Brewminate's reprint of Dirk H. Breiding's Metropolitan Museum essay. The reprint names the author and says "Originally published by the Metropolitan Museum of Art, October 2004, republished with permission under an Open Access license", so the attribution is faithful, and the card is right to say "an essay from the Metropolitan Museum". One oddity: the byline gives Breiding's later title (Philadelphia Museum of Art), not his Met role. Prefer citing the Met original as the source of record. Both high-stakes claims (c1, c4) have Smithsonian as a second publisher. For c4, Smithsonian (Jaquet's tests) backs the core: range of motion, running, jumping onto a pommel horse. But "even an untrained man", "genuine armour" and "lie on the ground, get up again" come from the Met essay alone.
4. **`medieval_bathing` c4 (high-stakes; the trail hook and quiz 2), and c16:** two publishers, but both are weak sources. Paris Voice is an unsourced 1992 lifestyle feature, and the same paragraph claims that early Christians banned baths until the Crusades. Medievalists.net is a popular-history site. The two counts differ (26 in 1292 vs over 32 "by the thirteenth century"), and the lesson honestly gives both. c16 (only two bathhouses left in Paris by the end of the 16th century) rests on Paris Voice alone. The outline asked for the Paris count to be verified, so consider replacing Paris Voice with a scholarly or museum source.
5. **`medieval_bathing` en card block 2:** "moral pressure from stricter churchmen" narrows the source, which says "more puritanical religious people". The en deep dive ("stricter religious figures") and pt-BR ("religiosos mais rigorosos") are closer.
6. **`medieval_life_expectancy` summary and takeaway (both locales):** "a 25-year-old adult lived, on average, to about 50" leaves out the group the figure comes from: English male landholders (Jonker, via The Skeptic). The cardText, card body and quiz 2 keep that detail. Suggest "an English 25-year-old landholder" or similar.
7. **`medieval_life_expectancy` c4 and c5 (quiz 2 and quiz 3 answers):** these numbers come only from The Skeptic's second-hand summary. It cites Jonker in the JRSS for c4, but gives no name for the review of noble ages at death behind c5. The claims match the source, but citing the primary studies would be firmer.
8. **`black_death_wages` c2 (high-stakes):** two publishers back the labour shortage (WashU, Britannica Serfdom). But "workers demanded and received higher wages" and "wages rose" (also c5) are stated outright only in the WashU Center for the Humanities essay. Britannica Serfdom only says "economically favourable events for the peasantry". The lesson's central point would be safer with a second publisher that says wages rose. Britannica's Peasants' Revolt entry, which is already cited, implies it ("attempted to fix maximum wages during the labor shortage").
9. **`black_death_wages` death toll:** the card and quiz 3 give 30%–60%, but the deep dive cites Benedictow's 65%, which is outside that range. Medievalists.net puts it as "a third, half, or even two-thirds". Consider saying the highest estimates go above 60%. Quiz 3 is still unambiguous, because its distractors are below 5% and above 90%.

## Draft check

`pnpm content:check-drafts` (whole repository, run after recording these verdicts) exited with code 0: "38 draft variant(s). Claims: 348 supported, 0 partial, 0 unsupported, 190 not verified yet. ✔ drafts pass." It reported no errors or warnings for this trail's 12 variant files. The trail accounts for 178 of the supported claims and none of the not-yet-verified ones. Those belong to other trails still being written.
