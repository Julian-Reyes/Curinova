# Trail plan, batch 3 (approved 2026-11-13)

Six trails, 36 lessons (37 if Pompeii's optional Brazil lesson holds up). The founder approved the outlines below in chat on 2026-11-13 (D29), so a writer session **skips [WRITER.md](WRITER.md) §1** and starts each trail at §2 (sources).

## Scope

- Write each lesson in full, in both locales, per WRITER.md §2–5: `concept.json`, `variant.<locale>.json` (title, hook, summary, **card text**, card body, takeaway, deep dive, claims), `quiz.<locale>.json`, and the trail's `content/drafts/clusters/<cluster>.json`.
- **Discover card text is included this time** (`cardText`, 12–40 words, WRITER.md §3). Batch 2 left it out.
- **No pictures:** don't run `pnpm media:add` and don't add `media` entries. Set `heroMedia` to `fixture` as WRITER.md describes; pictures and "How it works" drawings come later.
- Everything stays a draft (`reviewStatus`/`publicationStatus: "draft"`, `contentLicense: "pending"`).

## How to run it

- Branch `content/batch-3`, from `main`. Commit each trail on its own, e.g. `content(batch-3): draft Rome: what lasted trail (write-v1)`.
- `generation.runId`: `<YYYY-MM-DD>-<cluster id>`.
- Concept IDs are `concept_<key>`, with `clusterOrder` as listed.
- Keep the lesson questions and the order. **If a lesson can't be sourced well, or the sources say something different from the outline, stop and ask the founder**; don't quietly change the lesson. The answers below are the expected findings, not facts to copy: write only what the saved snapshots support. Items marked _verify_ are unconfirmed; keep them only if sources support them.
- Links between batch 3 trails are added when the later trail is drafted, in both draft clusters. Links from **published** trails back to batch 3 trails are added after batch 3 is published, not by writer sessions.
- "Two sources" means two sources from different publishers (`highStakes: true`). `reviewAfter` marks lessons whose facts will date.
- This machine can't fetch some Cloudflare-protected sites (for example gpb, jabfm, unesco, nybg, kew, loc.gov); choose sources that fetch.
- Run `pnpm content:check-drafts` and `pnpm content:dedupe` before each commit and fix every error. Push only with the founder's OK.
- Verification is a **separate, new session** per trail ([VERIFIER.md](VERIFIER.md)).

## Order

1. Myths about the Middle Ages
2. Medieval inventions we still use
3. Rome: what lasted
4. Pompeii: a city frozen in time
5. Animal superpowers
6. Why your body does weird things

---

## 1. Myths about the Middle Ages

`cluster_middle_ages_myths` · topic `history`

- pt-BR: _Mitos sobre a Idade Média_. Hook: _Terra plana, capacetes com chifres e ninguém tomando banho: quase nada disso aconteceu._
- en: _Myths about the Middle Ages_. Hook: _A flat Earth, horned helmets and nobody bathing: almost none of it happened._
- Links: `cluster_everyday_myths` (same myth-busting format); `cluster_medieval_inventions` and `cluster_rome_what_lasted` (added with trails 2 and 3).

| #   | Key                        | Question → expected answer                                                                                                                                                                                                                                                                     | Notes                                                                    |
| --- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | `flat_earth_myth`          | Did medieval people think the Earth was flat? → No; educated Europeans knew it was round (Bede, 8th century; Sacrobosco's _De sphaera_, about 1230). Columbus's critics disputed the Earth's size. The myth spread in the 19th century (Washington Irving's 1828 Columbus book; Draper, White) | Two sources                                                              |
| 2   | `horned_helmets`           | Did Vikings wear horned helmets? → No evidence; the only near-complete Viking-age helmet (Gjermundbu) has none. Horned Bronze Age helmets are far older and ceremonial; the image comes from 19th-century art and the costumes for Wagner's _Ring_ (1876)                                      | Two sources                                                              |
| 3   | `armour_weight`            | Could knights in armour barely move? → A full harness weighed about 15–25 kg, spread over the body; knights could mount, run and get up. The crane story is a myth; a 2011 study measured the extra effort of moving in armour                                                                 | Weights from museum sources                                              |
| 4   | `medieval_bathing`         | Did people in the Middle Ages never bathe? → Public bathhouses were common in medieval towns (Paris tax records around 1300 list dozens); they declined in the 1500s, partly from fear of plague and syphilis                                                                                  | Two sources; _verify_ the Paris count                                    |
| 5   | `medieval_life_expectancy` | Did medieval people die at 30? → Low average life expectancy came mostly from child deaths; adults who survived childhood often lived into their 50s and 60s                                                                                                                                   | Replaces the "Dark Ages" lesson                                          |
| 6   | `black_death_wages`        | Why did wages soar after the Black Death? → It killed perhaps a third to a half of Europe's people (1347–1351); the labour shortage pushed wages up despite laws capping them (England's 1351 Statute of Labourers) and helped weaken serfdom                                                  | Title chosen by the founder; give ranges for the death toll; two sources |

## 2. Medieval inventions we still use

`cluster_medieval_inventions` · topic `history`

- pt-BR: _Invenções medievais que usamos até hoje_. Hook: _Óculos, relógios, universidades: a "Idade das Trevas" inventou mais do que parece._
- en: _Medieval inventions we still use_. Hook: _Glasses, clocks, universities: the "Dark Ages" invented more than you think._
- Links: `cluster_middle_ages_myths`; `cluster_brazil_capitals` (lesson 6 reaches 1808); `cluster_portuguese_in_brazil` (Coimbra, the Portuguese voyages).

| #   | Key                     | Question → expected answer                                                                                                                                                                                 | Notes                                                                                                                                                |
| --- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `eyeglasses_invention`  | Who invented eyeglasses? → Unknown craftsmen in northern Italy, around the 1280s; a 1306 sermon says they were invented less than 20 years earlier                                                         |                                                                                                                                                      |
| 2   | `medieval_universities` | Why are universities a medieval idea? → Bologna (traditionally 1088), Paris and Oxford grew from guilds of students and teachers                                                                           | Brazil: Coimbra (1290; settled in Coimbra in 1537) trained colonial Brazil's elite; Brazil had no university until the 20th century (_verify_ dates) |
| 3   | `mechanical_clocks`     | How did mechanical clocks change the day? → Before them, daylight was split into 12 hours whose length changed with the seasons; mechanical clocks (late 1200s) and public clock towers spread equal hours |                                                                                                                                                      |
| 4   | `arabic_numerals`       | Why do we write "Arabic" numerals? → They began in India and reached Europe through Arab scholars; Fibonacci's _Liber Abaci_ (1202) promoted them for trade arithmetic                                     | _Verify_: Florence's bankers' guild banned them in account books in 1299                                                                             |
| 5   | `compass_europe`        | How did the compass reach Europe? → Described in China in the 11th century and in Europe by about 1190                                                                                                     | Brazil: with the astrolabe and the caravel, a tool behind the Portuguese voyages up to Cabral in 1500                                                |
| 6   | `gutenberg_press`       | How did Gutenberg's press spread books so fast? → Movable metal type, Mainz, about 1450; the Gutenberg Bible about 1455; millions of books printed by 1500                                                 | Brazil: printing was banned in colonial Brazil until the Impressão Régia in 1808; two sources                                                        |

## 3. Rome: what lasted

`cluster_rome_what_lasted` · topic `history`

- pt-BR: _Roma: o que ficou_. Hook: _Um concreto que dura 2.000 anos, estradas que ainda usamos e a língua que você fala._
- en: _Rome: what lasted_. Hook: _Concrete that lasts 2,000 years, roads still in use, and the language Brazil speaks._
- Links: `cluster_portuguese_in_brazil` (lesson 5 leads into it); `cluster_middle_ages_myths` (Rome's fall in the West opens the Middle Ages); `cluster_pompeii` (added with trail 4).

| #   | Key                   | Question → expected answer                                                                                                                                                                                                                               | Notes                                                                         |
| --- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1   | `roman_concrete`      | Why is Roman concrete still standing? → Volcanic ash (pozzolana) with lime; in seawater it slowly grows new minerals (2017 study); lime lumps from hot mixing may heal cracks (MIT, 2023). The Pantheon still has the largest unreinforced concrete dome | Two sources                                                                   |
| 2   | `roman_roads`         | How did Roman roads last 2,000 years? → Layered foundations, a cambered surface and side ditches for drainage; the Via Appia dates from 312 BC                                                                                                           | Network length only as the sources give it (figures vary)                     |
| 3   | `gladiators_death`    | Did gladiators fight to the death? → Usually not: they were expensive trained professionals and many bouts ended with a decision; skeletons from the Ephesus gladiator cemetery show treated, healed wounds. What the thumb gesture meant is unknown     | Two sources; say where historians disagree                                    |
| 4   | `when_rome_fell`      | When did the Roman Empire fall? → In the West in 476, when Odoacer deposed Romulus Augustulus; the East lasted until 1453. Its people called themselves Romans; "Byzantine" is a later name (1557)                                                       |                                                                               |
| 5   | `latin_to_portuguese` | How did Latin turn into Portuguese? → Rome reached Iberia in 218 BC; spoken Latin there slowly became Galician-Portuguese, and most Portuguese words come from Latin                                                                                     | Brazil: Olavo Bilac's "última flor do Lácio"; leads into the Portuguese trail |

## 4. Pompeii: a city frozen in time

`cluster_pompeii` · topic `history`

- pt-BR: _Pompeia: uma cidade congelada no tempo_. Hook: _Uma erupção em 79 d.C. guardou uma cidade romana inteira, do pão no forno aos recados nas paredes._
- en: _Pompeii: a city frozen in time_. Hook: _An eruption in AD 79 preserved a whole Roman town, down to the bread and the graffiti._
- Links: `cluster_rome_what_lasted`.

| #   | Key                      | Question → expected answer                                                                                                                                                                                     | Notes                                                                                                |
| --- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | `vesuvius_eruption_79`   | What happened the day Vesuvius erupted? → Pliny the Younger's letters describe it; Pliny the Elder died leading a rescue. Traditionally 24 August AD 79; a charcoal inscription found in 2018 suggests October | Two sources (the date is debated)                                                                    |
| 2   | `pompeii_body_casts`     | How were Pompeii's body casts made? → In 1863 Giuseppe Fiorelli poured plaster into the hollows left in the ash by decayed bodies; DNA studies (2024) overturned some long-told stories about them             | Respectful tone; _verify_ the 2024 study                                                             |
| 3   | `pompeii_graffiti`       | What does Pompeii's graffiti say? → Thousands of inscriptions: election notices, gladiator adverts, insults, jokes and love notes                                                                              | Quote only what sources quote; nothing crude                                                         |
| 4   | `pompeii_street_food`    | Did Romans eat fast food? → Pompeii had dozens of street-food counters (_thermopolia_); one excavated in 2020 kept its painted decoration and traces of food                                                   | _Verify_ the number of counters                                                                      |
| 5   | `herculaneum_fate`       | Why was Herculaneum's fate different? → Buried deeper by hot ash flows, which preserved wood, food and the Villa of the Papyri's scrolls; hundreds of skeletons were found in its boathouses in the 1980s      |                                                                                                      |
| 6   | `herculaneum_scrolls_ai` | How is AI reading the burned scrolls? → The Vesuvius Challenge (2023): scans plus machine learning read a first word, "purple", from a scroll nobody can unroll                                                | `reviewAfter`                                                                                        |
| 7   | `pompeii_in_brazil`      | Is there a piece of Pompeii in Brazil? → Empress Teresa Cristina, a Bourbon princess from Naples, brought Roman artefacts to Rio; they went to the Museu Nacional, and some survived the 2018 fire             | **Optional.** Brazil; _verify_ everything and drop the lesson if sources are thin (tell the founder) |

## 5. Animal superpowers

`cluster_animal_superpowers` · topic `nature`

- pt-BR: _Superpoderes dos animais_. Hook: _Andar no teto, mudar de cor num piscar de olhos, sobreviver no espaço._
- en: _Animal superpowers_. Hook: _Walking on ceilings, changing colour in a blink, surviving open space._
- Links: `cluster_amazon_survival`; `cluster_brazil_in_space` (lesson 7).

| #   | Key                  | Question → expected answer                                                                                                                                                                                          | Notes                                                                           |
| --- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | `gecko_feet`         | How do geckos walk on ceilings? → Millions of microscopic hairs on their toes, split into finer tips, cling by weak molecular attraction (van der Waals forces); no glue, no suction                                |                                                                                 |
| 2   | `octopus_colour`     | How does an octopus change colour in a blink? → Colour sacs in the skin (chromatophores) opened and closed by nerve-controlled muscles in a fraction of a second; yet most octopuses are thought to be colour-blind | Explanations of the puzzle are hypotheses                                       |
| 3   | `hummingbird_hover`  | How does a hummingbird hover in mid-air? → Its wings trace a figure-eight and make lift on both the down-stroke and the up-stroke, dozens of beats a second; at night it can drop into torpor                       | Brazil: the _beija-flor_, dozens of species; beat rates from sources            |
| 4   | `sloth_slow_life`    | How do sloths live so slowly? → A very low metabolism, a low-energy leaf diet and algae in their fur; they come down about once a week to relieve themselves                                                        | Brazil: the _preguiça_; the maned sloth lives only in the Atlantic Forest       |
| 5   | `bird_navigation`    | How do migrating birds find their way? → The sun, the stars (planetarium experiments) and a magnetic sense whose mechanism is still being studied                                                                   | Brazil, _verify_: the red knot (_maçarico-de-papo-vermelho_) and Brazil's coast |
| 6   | `immortal_jellyfish` | Is there an animal that never dies of old age? → _Turritopsis dohrnii_ can turn back into its young polyp stage; it can still be eaten or get sick                                                                  | Two sources; don't overstate "immortal"                                         |
| 7   | `tardigrades_space`  | Can a tardigrade survive in space? → In 2007 tardigrades were exposed to open space in orbit (FOTON-M3) and some survived, dried out into a dormant state                                                           | Two sources                                                                     |

## 6. Why your body does weird things

`cluster_body_weird_things` · topic `body`

- pt-BR: _Por que o corpo faz coisas estranhas_. Hook: _Soluço, arrepio, bocejo contagioso: o que está por trás das esquisitices do corpo._
- en: _Why your body does weird things_. Hook: _Hiccups, goosebumps, contagious yawns: what's behind your body's odd habits._
- Links: `cluster_body_renews`; `cluster_everyday_myths` (knuckle cracking).

| #   | Key                   | Question → expected answer                                                                                                                                                                      | Notes                                   |
| --- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| 1   | `hiccups`             | Why do we get hiccups? → The diaphragm spasms and the vocal cords snap shut, making the "hic"; one hypothesis traces it to a reflex from gill-breathing ancestors                               | Label the hypothesis; no medical advice |
| 2   | `goosebumps`          | Why do we get goosebumps? → Tiny muscles pull hairs upright; in furry animals this traps warmth or makes them look bigger; a 2020 study found the same nerves and muscles help hair grow        |                                         |
| 3   | `contagious_yawning`  | Why is yawning contagious? → No settled answer; ideas include social bonding and empathy, with mixed evidence; chimpanzees catch yawns too                                                      | Two sources; honest about uncertainty   |
| 4   | `brain_freeze`        | What is brain freeze? → Cold on the roof of the mouth quickly changes blood flow nearby, and a facial nerve reports the pain as coming from the forehead                                        | Brazil: cold _açaí_ and _picolé_        |
| 5   | `wrinkly_fingers`     | Why do fingers wrinkle in water? → Nerves control it (fingers with damaged nerves don't wrinkle, once used as a nerve test); better grip on wet things is one explanation, and studies disagree | Two sources (the grip idea is disputed) |
| 6   | `foot_falling_asleep` | Why does your foot "fall asleep"? → Pressure on a nerve and its blood supply blocks its signals; pins and needles come as the nerve starts working again                                        | No medical advice                       |
