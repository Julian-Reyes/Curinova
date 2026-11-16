# Verification: Pompeii: a city frozen in time

- Verifier: `claude-opus-5-5` (Claude Code helper agent), separate from the writer session
- Instructions: `verify-v2`
- Date: 2026-11-16
- Scope: `cluster_pompeii`, first pass. Seven lessons (`vesuvius_eruption_79`, `pompeii_body_casts`, `pompeii_graffiti`, `pompeii_street_food`, `herculaneum_fate`, `herculaneum_scrolls_ai`, `pompeii_in_brazil`) from commit `0af6310` (write-v1), both locales: 250 claim instances (125 per locale), 352 support excerpts and 42 quiz questions. Also checked: `content/drafts/clusters/cluster_pompeii.json` and the seven `concept.json` files.
- Claim verdicts: **250 supported, 0 partial, 0 unsupported, 0 pending**.
- Quiz review: **42 checked, 0 ambiguous answers**. Every correct option follows from its claims, and every distractor is clearly wrong.
- Locale review: **no material disagreements**. Claim IDs, `highStakes` flags, support excerpts, source lists, quiz answers and quiz `claimIds` are identical across pt-BR and en, and the prose matches on every number, date and name. Two small wording differences are in editorial notes 1 and 4.
- Quality bar: no sensationalism and no medical, financial or legal advice. The body-casts lesson is respectful, and the street-food lesson does not quote the crude counter inscription. The graffiti lesson quotes only what the sources quote and nothing crude. Disputes are marked: the eruption date ("now disputed", "still debated"), how Herculaneum's victims died ("still debated", "The question remains open") and the scroll reading ("may be Book 1 ... still uncertain", "This story is moving fast"). The date-sensitive lessons have `reviewAfter` set: `vesuvius_eruption_79`, `pompeii_body_casts`, `herculaneum_fate` and `pompeii_in_brazil` 2027-11-01, `herculaneum_scrolls_ai` 2027-05-01. `pompeii_graffiti` and `pompeii_street_food` are not date-sensitive, so `null` is fine.
- Cluster file: titles and hooks match the outline, and the `conceptIds` match the seven lessons in `clusterOrder`. Links: `cluster_rome_what_lasted` (from the outline), plus `cluster_middle_ages_myths` and `cluster_brazil_capitals`. All three exist.

## Snapshots

All 34 sources the trail cites have snapshots, and all 352 excerpts match them exactly.

| Lesson                   | Sources (publisher)                                                                                                                 | en (supported / partial / unsupported) | pt-BR      |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- | ---------- |
| `vesuvius_eruption_79`   | Attalus.org (Pliny, Letters 6.16 and 6.20 in translation); BBC News; BBC History; The Guardian                                      | 23 / 0 / 0                             | 23 / 0 / 0 |
| `pompeii_body_casts`     | NPR (Michigan Public); Smithsonian Magazine; BBC History; Cell Press (EurekAlert!)                                                  | 16 / 0 / 0                             | 16 / 0 / 0 |
| `pompeii_graffiti`       | Smithsonian Magazine; Archaeology Magazine; Ancient Graffiti Project                                                                | 18 / 0 / 0                             | 18 / 0 / 0 |
| `pompeii_street_food`    | Parco Archeologico di Pompei (×2); UPI; BBC History                                                                                 | 15 / 0 / 0                             | 15 / 0 / 0 |
| `herculaneum_fate`       | CBC News; Parco Archeologico di Ercolano (×2); BBC History; The New York Times (1982); PLOS ONE (2010); Live Science; BBC News      | 16 / 0 / 0                             | 16 / 0 / 0 |
| `herculaneum_scrolls_ai` | Vesuvius Challenge (×2); Smithsonian Magazine; BBC News; Nature (×2); Fine Books & Collections                                      | 20 / 0 / 0                             | 20 / 0 / 0 |
| `pompeii_in_brazil`      | ISTOÉ (ANSA); Correio da Manhã; Museu Nacional/UFRJ (Harpia); Revista CPC (USP); Revista Pesquisa FAPESP (×2); Revista do MAE (USP) | 17 / 0 / 0                             | 17 / 0 / 0 |

High-stakes claims, checked for two publishers: `vesuvius_eruption_79` c3, c9 and c19; `pompeii_body_casts` c2, c5 and c12; `pompeii_street_food` c3 and c4; `herculaneum_fate` c3, c5 and c13; `herculaneum_scrolls_ai` c1, c3, c6, c15 and c17; `pompeii_in_brazil` c1 and c4. Each has at least two supporting publishers. `pompeii_graffiti` has no high-stakes claims.

Where the lessons depart from the outline (`TRAILS_BATCH_3.md` §4), they follow the sources, and none of these is a problem. `pompeii_body_casts` says "in the 1860s" for the casts and gives 1863–1875 for Fiorelli's directorship, as the sources do. `pompeii_street_food` gives "about 80" counters (Pompeii park; UPI says "more than 80"), which settles the outline's "verify the number". `herculaneum_fate` dates the boathouse skeletons to 1980 (Ercolano park) and adds the debate on how the victims died. `herculaneum_scrolls_ai` goes beyond "purple" to the 2024 grand prize and the 2025 title of PHerc. 172, with the uncertainty marked. `pompeii_in_brazil` was optional; its sources hold up. It credits the dowry account to ANSA, and it says only that some pieces were recovered after the fire, which the Harpia, FAPESP and USP sources back.

## Blockers

None.

**The trail has zero blockers.**

## Editorial notes

1. **`vesuvius_eruption_79` pt-BR card block 2:** "descem a encosta a mais de 100 km/h" says "more than 100 km/h". The source (BBC History, c8), the pt-BR claim and the en card say "100 km/h or more" ("a 100 km/h ou mais").
2. **`vesuvius_eruption_79` c20:** "Many archaeologists think ... around 24 October" rests on one source, a translator's footnote on Attalus.org ("Most archaeologists now believe ..."), which cites _Earth-Science Reviews_ 2022:104072. The lesson softens "most" to "many" and marks the debate, so this is fine as it stands. Citing the 2022 paper itself would be firmer. The Revista CPC (USP) source already lists it in its references.
3. **`pompeii_body_casts` deep dive "What the DNA showed" (both locales), c14:** "many of the people descended mainly from recent immigrants" (pt-BR "muitos moradores descendiam de imigrantes recentes") can be read as a claim about all of Pompeii's residents. The source is about the small group of individuals studied ("They primarily descended ..."). Suggest "most of those studied" or similar.
4. **`pompeii_body_casts` locales:** the en deep dive says "many ... descended **mainly**", while pt-BR leaves out "principalmente", although the pt-BR claim c14 keeps it. Not material, but the two should match.
5. **`pompeii_street_food` c6, card block 2 and quiz 3 (both locales):** "The jars held bones of duck, pig, goat, fish and land snails." The park says that a duck bone fragment was found "inside one of the containers, alongside swine, goats, fish and land snails". Snails have shells, not bones, and the source names one container. Something like "remains of duck, pig, goat, fish and snails" would be accurate. The quiz 3 answer is still unambiguous.
6. **`pompeii_street_food` card text (both locales):** "the midday meal" ("almoçar fora", "refeição do meio do dia") goes slightly further than the source, which says only "the prandium (meal)". _Prandium_ did mean the midday meal, so this is right, but no source in the lesson says so. The hook and takeaway "kept / preserved its menu" is a figure of speech. The body is right to say that the paintings show the food "at least in part".
7. **`herculaneum_fate` takeaway (both locales):** "turned Herculaneum to charcoal" ("transformou Herculano em carvão") goes too far: the mud carbonised the town's wood and other organic material, not the town. The card and body have it right ("its wood and food turned to charcoal").
8. **`herculaneum_fate` mechanism, for the record:** the lesson follows the Ercolano park and CBC, which describe a superheated "pyroclastic mud". The scrolls paragraph (c16, BBC News) says that a 400 °C gas blast carbonised the papyri before the town was buried. Each mechanism is attributed to the object its source describes, so readers do not learn anything wrong. If the writer wants the two to read as one story, a line saying that hot pyroclastic flows came first and then the deep deposit would help.
9. **`herculaneum_scrolls_ai` c10 and deep dive "From charcoal to text":** "ancient ink has no metal" (BBC News, 2013, after Seales) is too broad. Later inks such as iron-gall do contain metal, and the same lesson says that PHerc. 172's ink may contain lead (c20). Smithsonian (c7) gives the narrower fact: these scrolls were written in carbon-based ink. Suggest "the carbon ink of these scrolls contains no metal".
10. **`herculaneum_scrolls_ai` c2:** the "burnt newspaper" image comes from Dirk Obbink (BBC News, 2013). The lesson uses the image without naming him, which is wise: outside these snapshots, Oxford dismissed Obbink in 2021 over the sale of papyri (worth checking before naming him). Keep him unnamed, or take the image from another source.
11. **`herculaneum_scrolls_ai` c6:** "a 21-year-old student ... read the first whole word" joins two sources. Nature gives the age but, in the snapshot, not the name. The Vesuvius Challenge names Luke Farritor but not his age. The two match (the deep dive names Farritor), but neither snapshot says both. The quiz 3 misconception ("papyrologists read and check the letters") has no claim of its own. The Vesuvius Challenge pages describe the papyrologists' review, so it holds.
12. **`pompeii_in_brazil` deep dive "A fresco pieced back together" (both locales), c14 and c15:** "the water used against the fire" ("a água do combate ao fogo") reads the source's "contato com a água" as firefighting water. That is likely, but the source doesn't say it. "Shown in Naples, with its return to Brazil planned afterwards" comes from a 2022 Harpia article that announced the June 2022 exhibition. Whether the fresco has since returned is worth checking at `reviewAfter`. The same goes for the Italian loan to the Rio consulate (c16, ISTOÉ/ANSA 2019), which the lesson rightly gives only as "announced".

## Draft check

`pnpm content:check-drafts` (whole repository, run after recording these verdicts) exited with code 0: "72 draft variant(s). Claims: 1062 supported, 0 partial, 0 unsupported, 10 not verified yet. ✔ drafts pass." It reported no errors or warnings for this trail's 14 variant files. The trail accounts for 250 of the supported claims and none of the not-yet-verified ones. Those belong to the Rome trail, whose verification is still running.
