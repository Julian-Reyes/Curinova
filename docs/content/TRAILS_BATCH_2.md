# Trail plan, batch 2 (approved 2026-10-30)

Five trails, one per topic, 31 lessons. The founder approved the outlines below in chat on 2026-10-30 (D19), so a writer session **skips [WRITER.md](WRITER.md) §1** and starts each trail at §2 (sources).

## Scope: lesson text only

- Write each lesson in full, in both locales, per WRITER.md §2–5: `concept.json`, `variant.<locale>.json` (title, hook, summary, card body, takeaway, deep dive, claims), `quiz.<locale>.json`, and the trail's `content/drafts/clusters/<cluster>.json`.
- **No Discover card text yet:** leave `cardText` out. It is written later, together with the pictures.
- **No pictures:** don't run `pnpm media:add` and don't add `media` entries. Set `heroMedia` to an existing illustration ID as WRITER.md describes; the founder adds photos once the existing lessons have theirs.
- Everything stays a draft (`reviewStatus`/`publicationStatus: "draft"`, `contentLicense: "pending"`).

## How to run it

- Branch `content/c1-moon` (shared by every trail in progress). Pull before starting; other sessions commit to it too.
- One trail at a time, in the order below. Commit each trail on its own, e.g. `content(c1-moon): draft Brazil's three capitals trail (write-v1)`.
- `generation.runId`: `<YYYY-MM-DD>-<cluster id>`.
- Concept IDs are `concept_<key>`, with `clusterOrder` as listed.
- Keep the lesson questions and the order. **If a lesson can't be sourced well, or the sources say something different from the outline, stop and ask the founder**; don't quietly change the lesson. The one-line answers below are the expected findings, not facts to copy: write only what the saved snapshots support.
- Trail links to a trail that doesn't exist yet are added when that trail is drafted (for example, Amazon survival tricks adds the Brazil in space ↔ Amazon links in both clusters).
- "Two sources" means two sources from different publishers (`highStakes: true`). `reviewAfter` marks lessons whose facts will date.
- Run `pnpm content:check-drafts` and `pnpm content:dedupe` before each commit and fix every error. Push only with the founder's OK.
- Verification is a **separate, new session** per trail ([VERIFIER.md](VERIFIER.md)).

## Order

1. Brazil's three capitals
2. Brazil in space
3. Where your attention goes
4. Amazon survival tricks
5. Everyday science myths (most claims that need two sources, so last)

---

## 1. Brazil's three capitals

`cluster_brazil_capitals` · topic `history`

- pt-BR: _As três capitais do Brasil_. Hook: _Por que a capital mudou duas vezes e foi parar no meio do cerrado._
- en: _Brazil's three capitals_. Hook: _Why the capital moved twice and ended up in the middle of the Cerrado._
- Links: `cluster_portuguese_in_brazil` (same colonial period).

| #   | Key                      | Question → expected answer                                                                                                                   | Notes                                                 |
| --- | ------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| 1   | `salvador_first_capital` | Why was Salvador Brazil's first capital? → Founded by Tomé de Sousa in 1549 as the seat of the colonial government, near the sugar Northeast |                                                       |
| 2   | `rio_capital_1763`       | Why did the capital move to Rio in 1763? → Gold from Minas Gerais shifted the economy south; Rio was its port                                |                                                       |
| 3   | `court_in_rio_1808`      | How did Rio become the capital of a European empire? → The Portuguese court fled Napoleon in 1808; United Kingdom with Portugal in 1815      |                                                       |
| 4   | `inland_capital_idea`    | When did the idea of an inland capital begin? → The 1891 Constitution reserved land on the Planalto Central; the Cruls Mission surveyed it   |                                                       |
| 5   | `building_brasilia`      | How was Brasília built so fast? → Under Juscelino Kubitschek, by the _candangos_; inaugurated 21 April 1960                                  | Take the construction time from sources               |
| 6   | `brasilia_plan_shape`    | Why is Brasília shaped like an airplane? → Lúcio Costa's plan of two crossing axes; "airplane" is the popular reading; UNESCO 1987           | Keep Costa's own words apart from the popular reading |

## 2. Brazil in space

`cluster_brazil_in_space` · topic `space`

- pt-BR: _O Brasil no espaço_. Hook: _Satélites que vigiam a Amazônia, uma base de lançamento perto do equador e o primeiro astronauta brasileiro._
- en: _Brazil in space_. Hook: _Satellites watching the Amazon, a launch site near the equator, and Brazil's first astronaut._
- Links: `cluster_moon_shapes_earth`; `cluster_amazon_survival` (added with trail 4).

| #   | Key                        | Question → expected answer                                                                                                     | Notes                        |
| --- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------- |
| 1   | `equator_launch_alcantara` | Why launch rockets near the equator? → Earth's spin adds speed; Alcântara is about 2° south                                    |                              |
| 2   | `vls_accident_2003`        | What happened at Alcântara in 2003? → The VLS-1 rocket exploded on the pad, killing 21 technicians                             | Two sources; respectful tone |
| 3   | `inpe_amazon_monitoring`   | How does INPE watch the Amazon from space? → PRODES (yearly, since 1988) and DETER (near-real-time alerts)                     | `reviewAfter`                |
| 4   | `cbers_program`            | What is CBERS? → A Brazil–China satellite programme agreed in 1988; first launch 1999                                          | `reviewAfter`                |
| 5   | `amazonia_1`               | What was Amazonia-1? → Launched in 2021, the first Earth-observation satellite designed, built and operated entirely by Brazil | `reviewAfter`                |
| 6   | `marcos_pontes`            | Who was the first Brazilian in space? → Marcos Pontes, to the ISS in 2006 (Centenary Mission)                                  |                              |

## 3. Where your attention goes

`cluster_where_attention_goes` · topic `brain`

- pt-BR: _Para onde vai sua atenção_. Hook: _Você percebe bem menos do que imagina, e nem o tempo é o que parece._
- en: _Where your attention goes_. Hook: _You notice far less than you think, and even time isn't what it seems._
- Links: `cluster_how_memory_works` (lesson 6 is about memory).

| #   | Key                      | Question → expected answer                                                                                                                                                           | Notes                                                                                            |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------ |
| 1   | `multitasking_switching` | Can you really do two things at once? → Mostly no; the brain switches tasks, and each switch costs time and accuracy                                                                 |                                                                                                  |
| 2   | `invisible_gorilla`      | How did half the viewers miss a gorilla? → Inattentional blindness (Simons and Chabris, 1999)                                                                                        |                                                                                                  |
| 3   | `cocktail_party_effect`  | How do you hear your own name across a noisy room? → Ignored sound is still partly processed                                                                                         |                                                                                                  |
| 4   | `saccadic_suppression`   | Why don't you see the world blur when your eyes jump? → The brain briefly shuts off vision during each eye jump                                                                      |                                                                                                  |
| 5   | `stopped_clock_illusion` | What happens when you glance at a clock's second hand? → Write what the sources show; chronostasis (the first tick seems to last longer than a second) is the best-documented effect | Founder's idea; summarize what the sources say in the handoff so the founder can check the angle |
| 6   | `time_slows_fear`        | Does time really slow down when you're scared? → In a free-fall study the "slow motion" was added later, in memory                                                                   | Two sources                                                                                      |

## 4. Amazon survival tricks

`cluster_amazon_survival` · topic `body` (may move to a future Animals/Earth topic; only the cluster's `topicId` would change)

- pt-BR: _Truques de sobrevivência da Amazônia_. Hook: _Peixes que se afogam, sapos que tiram veneno da comida e uma enguia de 860 volts._
- en: _Amazon survival tricks_. Hook: _Fish that can drown, frogs that get their poison from dinner, and an 860-volt eel._
- Links: `cluster_brazil_in_space` (INPE watches this forest from orbit); add the reverse link to `cluster_brazil_in_space`.

| #   | Key                      | Question → expected answer                                                                                                | Notes                                     |
| --- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| 1   | `electric_eel`           | How does an electric eel make electricity? → Stacks of battery-like cells; a species described in 2019 reached 860 V      | Two sources                               |
| 2   | `pirarucu_air_breathing` | Why does the pirarucu drown if it can't surface? → It must breathe air, using a modified swim bladder                     |                                           |
| 3   | `leafcutter_farming`     | Do leafcutter ants eat leaves? → No; they farm a fungus on them and eat the fungus                                        |                                           |
| 4   | `poison_frog_diet`       | Where do poison dart frogs get their poison? → From their diet; frogs bred in captivity aren't toxic                      | Two sources                               |
| 5   | `boto_echolocation`      | How does the boto hunt in muddy water? → Echolocation                                                                     |                                           |
| 6   | `giant_water_lily`       | How can a giant water lily leaf carry so much weight? → Ribs underneath spread the load; they inspired the Crystal Palace | Give a weight only if a source states one |

## 5. Everyday science myths

`cluster_everyday_myths` · topic `everyday_science`

- pt-BR: _Mitos da ciência do dia a dia_. Hook: _Coisas que todo mundo "sabe", e o que a ciência diz de verdade._
- en: _Everyday science myths_. Hook: _Things everyone "knows", and what science actually says._
- Links: `cluster_kitchen_chemistry`; `cluster_body_renews` (blood, lesson 3).

| #   | Key                       | Question → expected answer                                                                                                      | Notes                          |
| --- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 1   | `microwave_inside_out`    | Do microwaves cook food from the inside out? → No; they heat the outer few centimetres, and the centre heats from there         |                                |
| 2   | `mpemba_effect`           | Does hot water freeze faster than cold? → Sometimes reported, still debated; depends on conditions                              | Mark as disputed; two sources  |
| 3   | `blue_veins`              | Is the blood in your veins blue? → Never; the way skin scatters and absorbs light makes veins look blue                         |                                |
| 4   | `falling_coin`            | Could a coin dropped from a skyscraper kill someone? → No; air resistance caps its speed                                        |                                |
| 5   | `radioactive_foods`       | Are bananas and Brazil nuts radioactive? → Slightly (potassium-40; radium absorbed from soil), and harmless in normal amounts   | Two sources; no dietary advice |
| 6   | `knuckle_cracking`        | Does cracking your knuckles cause arthritis? → Studies haven't found a link; the pop is a gas bubble forming in the joint fluid | Two sources; no medical advice |
| 7   | `lightning_strikes_twice` | Does lightning never strike the same place twice? → It does; Christ the Redeemer is hit several times a year                    | Two sources                    |
