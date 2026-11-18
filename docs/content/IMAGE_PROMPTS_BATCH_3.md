# Image prompts for batch 3 (36 lessons)

ChatGPT prompts and photo search briefs for every picture slot in the six batch 3 trails (D29). Same workflow, house style and slots as `docs/content/IMAGE_PROMPTS.md`; read its **How to use** section first and paste its **house style** once at the start of each ChatGPT chat.

**Order:** the lessons are verified drafts awaiting review. `pnpm media:add` writes to the draft (`content/drafts/lessons/`), and approving a lesson carries its pictures into the library. Make a lesson's pictures, run `pnpm media:add <folder>`, look at them in `/_review`, replace any you don't like (same file name, run it again), then press **Images checked**.

**Slots:** _Discover_ is the full-screen card (9:16, white title over the bottom). _Deeper_ is the Go Deeper hero (cropped to 12:7). _Review_ is the quiz picture (cropped to 16:9) and **must not give the answer away**; each Review line says what to avoid, taken from the lesson's three quiz answers.

**AI or real:** the two nature and body trails are AI-first (`DISCOVER:`/`DEEPER:`/`REVIEW:` prompts to paste into ChatGPT). The four history trails are **real-first**: named objects, places, artworks and manuscripts must be real photos or public-domain scans, with the real creator, license and page URL recorded. A history slot marked _(AI ok)_ is a generic scene that may be generated if no real picture fits.

**Real photos** (Pexels, Unsplash, Wikimedia Commons, The Met Open Access): download the full-size original from the source page and keep the page link for the credit. On Commons, check the license (public domain, CC0, CC BY or CC BY-SA) and the author. A Discover source shorter than 9:16 is pre-cropped to 9:16 around the subject before `media:add`; never use the blurred fill. Use `-up20` (or another percentage) on a Discover file name to lift the subject above the title.

**AI origin record:** `{ "kind": "generated", "tool": "ChatGPT (Plus)", "createdBy": "Founder", "createdAt": "<date>" }`, plus alt text in pt-BR and en.

## Still to do (69 pictures)

- **Myths about the Middle Ages:** all 6 lessons (18), real-first.
- **Medieval inventions we still use:** all 5 lessons (15), real-first.
- **Rome: what lasted:** all 5 lessons (15), real-first.
- **Pompeii: a city frozen in time:** all 7 lessons (21), real-first.

### Myths about the Middle Ages (real photos preferred)

#### flat_earth_myth: Did medieval people think the Earth was flat?

- **Discover:** A medieval manuscript illustration of a round Earth, e.g. from Sacrobosco's _De sphaera_ or Gossuin's _Image du monde_ (Commons, public domain).
- **Deeper:** A page of a _De sphaera_ manuscript or early printed edition with its spherical diagrams (Commons).
- **Review:** A medieval monastery cloister _(AI ok)_. _Don't show: a flat or round Earth, globes, the Moon, ships, Columbus, 19th-century books._
- **Search:** Commons: "De sphaera mundi", "Image du monde", "spherical Earth medieval".

#### horned_helmets: Did Vikings wear horned helmets?

- **Discover:** The Gjermundbu helmet (Museum of Cultural History, Oslo; Commons, check license).
- **Deeper:** The Oseberg or Gokstad Viking ship (Viking Ship Museum; Commons or Unsplash).
- **Review:** A Norwegian fjord _(AI ok)_. _Don't show: helmets of any kind, horns, opera or costumes, the Viksø helmets._
- **Search:** Commons: "Gjermundbu helmet", "Oseberg ship". Unsplash: "Viking ship museum".

#### armour_weight: Could knights in armour barely move?

- **Discover:** A complete 15th- or 16th-century suit of field armour on display (The Met Open Access, CC0; or Commons).
- **Deeper:** A reenactor in full plate armour running, or mounting a horse (Commons, check license).
- **Review:** A medieval castle courtyard _(AI ok)_. _Don't show: horses, stirrups, stools, squires, scales or weights, armour._
- **Search:** The Met: "armor for field". Commons: "plate armour reenactment".

#### medieval_bathing: Did people in the Middle Ages never bathe?

- **Discover:** A 15th-century manuscript miniature of a public bathhouse, e.g. the bathhouse scene in a Valerius Maximus manuscript (Commons, public domain).
- **Deeper:** Another medieval bathing scene (Commons category "Bathing in medieval art").
- **Review:** A narrow medieval street of half-timbered houses _(AI ok)_. _Don't show: bathers, tubs, water buckets, Paris, plague doctors, dates or counts._
- **Search:** Commons: "medieval bathhouse", "Valerius Maximus bath".

#### medieval_life_expectancy: Did people in the Middle Ages die at 30?

- **Discover:** A medieval "Ages of Man" illumination (Commons, public domain).
- **Deeper:** Effigies on a medieval English tomb (Commons).
- **Review:** A medieval village of thatched cottages _(AI ok)_. _Don't show: children, graves or cradles, old people, numbers._
- **Search:** Commons: "Ages of Man medieval", "medieval tomb effigy England".

#### black_death_wages: Why did wages soar after the Black Death?

- **Discover:** The burial of plague victims in Tournai, from Gilles Li Muisis's chronicle, 1349 (Commons, public domain).
- **Deeper:** Medieval peasants harvesting or ploughing, e.g. the Luttrell Psalter or the _Très Riches Heures_ (Commons, public domain).
- **Review:** A golden wheat field with a stone farmhouse _(AI ok)_. _Don't show: coins, wage figures, laws or scrolls, coffins or death, maps of Europe._
- **Search:** Commons: "Tournai plague 1349", "Luttrell Psalter ploughing".

### Medieval inventions we still use (real photos preferred)

#### eyeglasses_invention: Who invented eyeglasses?

- **Discover:** Tommaso da Modena's 1352 fresco of Hugh of Saint-Cher wearing spectacles, Treviso (Commons, public domain).
- **Deeper:** Medieval rivet spectacles, e.g. the Wienhausen glasses or a replica (Commons, check license).
- **Review:** A Gothic cathedral nave _(AI ok)_. _Don't show: glasses, lenses, magnifiers, books up close, friars, Italy._
- **Search:** Commons: "Tommaso da Modena Hugh of Saint-Cher", "rivet spectacles".

#### medieval_universities: Why are universities a medieval idea?

- **Discover:** Laurentius de Voltolina's miniature of a lecture at Bologna, 1350s (Commons, public domain).
- **Deeper:** A medieval college quadrangle at Oxford, e.g. Merton's Mob Quad (Commons or Unsplash).
- **Review:** A stone Gothic archway and courtyard _(AI ok)_. _Don't show: Coimbra, guild emblems, money, Brazil._
- **Search:** Commons: "Laurentius de Voltolina", "Mob Quad". Unsplash: "Oxford college".

#### mechanical_clocks: How did mechanical clocks change the day?

- **Discover:** The Salisbury Cathedral clock, about 1386, with no dial (Commons).
- **Deeper:** A medieval tower clock mechanism or the Wells Cathedral clock (Commons).
- **Review:** A bell tower over a medieval town square at dawn, no clock face _(AI ok)_. _Don't show: dials, hands, sundials, hourglasses, numbers._
- **Search:** Commons: "Salisbury Cathedral clock", "Wells Cathedral clock".

#### arabic_numerals: Why do we write "Arabic" numerals?

- **Discover:** A page of a _Liber abaci_ manuscript (Biblioteca Nazionale Centrale di Firenze; Commons, public domain).
- **Deeper:** The Codex Vigilanus (976), the earliest Western European manuscript with these numerals (Commons, public domain).
- **Review:** Old leather-bound books on a shelf _(AI ok)_. _Don't show: digits or Roman numerals, merchants or market stalls, India, maps._
- **Search:** Commons: "Liber abaci", "Codex Vigilanus numerals".

#### gutenberg_press: How did Gutenberg's press spread books so fast?

- **Discover:** A page of the Gutenberg Bible (Commons, public domain).
- **Deeper:** A reconstructed Gutenberg press (Gutenberg Museum, Mainz; Commons), or metal type in a composing stick.
- **Review:** A stack of old books on a desk _(AI ok)_. _Don't show: metal type, presses, ink, China or Korea, Brazil or the Portuguese court._
- **Search:** Commons: "Gutenberg Bible", "Gutenberg press replica". Unsplash: "letterpress type".

### Rome: what lasted (real photos preferred)

#### roman_concrete: Why is Roman concrete still standing?

- **Discover:** The Pantheon's dome and oculus from inside (Pexels or Unsplash).
- **Deeper:** Close-up of Roman concrete with white lime lumps, or a Roman harbour structure in the sea (Commons, check license).
- **Review:** The Pont du Gard aqueduct (Pexels or Unsplash). _Don't show: volcanoes or ash, seawater or harbours, white lumps, cracks._
- **Search:** Unsplash: "Pantheon dome". Commons: "Roman concrete", "opus caementicium".

#### roman_roads: How did Roman roads last 2,000 years?

- **Discover:** The Via Appia Antica's paving stones lined with umbrella pines (Pexels, Unsplash or Commons).
- **Deeper:** A Roman street in Pompeii with its stepping stones and cart ruts, or a Roman road in Britain (Commons).
- **Review:** A Roman stone bridge over a river, e.g. Ponte Fabricio _(real)_. _Don't show: road surfaces or curvature, rain runoff, gravel, signs naming the Appian Way._
- **Search:** Pexels/Unsplash: "Appian Way". Commons: "Roman road".

#### gladiators_death: Did gladiators fight to the death?

- **Discover:** The Colosseum's arena floor and hypogeum from above (Pexels or Unsplash).
- **Deeper:** A Roman gladiator mosaic, e.g. the Zliten mosaic or the Borghese gladiator mosaic (Commons, public domain).
- **Review:** The Colosseum's outer arches at dusk. _Don't show: thumbs or hand gestures, skeletons, wounds, coins, Ephesus._
- **Search:** Pexels: "Colosseum interior". Commons: "Zliten mosaic", "Borghese gladiator mosaic".

#### when_rome_fell: When did the Roman Empire fall?

- **Discover:** Hagia Sophia, Istanbul (Pexels or Unsplash).
- **Deeper:** The Theodosian Walls of Constantinople (Commons).
- **Review:** The Roman Forum's ruins at sunset. _Don't show: Hagia Sophia, Istanbul, city walls, dates, coins with emperors, Ottoman flags._
- **Search:** Unsplash: "Hagia Sophia". Commons: "Theodosian Walls".

#### latin_to_portuguese: How did Latin turn into Portuguese?

- **Discover:** The Roman temple of Évora, Portugal (Pexels, Unsplash or Commons).
- **Deeper:** A page of the _Cancioneiro da Ajuda_, Galician-Portuguese songs from about 1300 (Commons, public domain).
- **Review:** An olive grove on a hillside _(AI ok)_. _Don't show: maps of Iberia, Portuguese flags, written words, soldiers, flowers._
- **Search:** Unsplash: "Évora temple". Commons: "Cancioneiro da Ajuda".

### Pompeii: a city frozen in time (real photos preferred)

#### vesuvius_eruption_79: What happened the day Vesuvius erupted?

- **Discover:** Vesuvius rising behind the ruins of Pompeii (Pexels or Unsplash).
- **Deeper:** Karl Bryullov's _The Last Day of Pompeii_ (1833; Commons, public domain). The alt text says it is a 19th-century painting.
- **Review:** The Bay of Naples at dawn. _Don't show: eruptions, ash clouds or flows, letters or writing, calendars._
- **Search:** Unsplash: "Pompeii Vesuvius". Commons: "The Last Day of Pompeii".

#### pompeii_body_casts: How were Pompeii's body casts made?

- **Discover:** Plaster casts in Pompeii's Garden of the Fugitives (Commons, check license). Choose a respectful, distant view.
- **Deeper:** A portrait of Giuseppe Fiorelli (Commons, public domain), or a single cast in a display case.
- **Review:** Pompeii's amphitheatre. _Don't show: casts or plaster, bracelets, children, DNA or labs._
- **Search:** Commons: "Garden of the Fugitives", "Giuseppe Fiorelli".

#### pompeii_graffiti: What does Pompeii's graffiti say?

- **Discover:** A painted election notice in red letters on a Pompeii wall (Commons).
- **Deeper:** Graffiti scratched into the plaster of a Pompeii wall (Commons).
- **Review:** A Pompeii house atrium with frescoes. _Don't show: any writing, red letters, gladiators, numbers._
- **Search:** Commons: "Pompeii electoral inscription", "Pompeii graffiti".

#### pompeii_street_food: Did Romans eat fast food?

- **Discover:** A Pompeii thermopolium counter with its built-in jars, e.g. the one excavated in Regio V in 2020 or the Thermopolium of Vetutius Placidus (Commons, check license).
- **Deeper:** The painted panels of the Regio V thermopolium (Commons, check license).
- **Review:** A Pompeii street with stepping stones. _Don't show: counters, jars, food, ducks or animals, bones._
- **Search:** Commons: "thermopolium Pompeii", "Thermopolium Regio V".

#### herculaneum_fate: Why was Herculaneum's fate different?

- **Discover:** The Herculaneum excavations seen from above, with the modern town's houses on the cliff behind them, showing how deep the city lay (Pexels, Unsplash or Commons).
- **Deeper:** Carbonised wood from Herculaneum, e.g. a charred wooden door or bed (Commons, check license).
- **Review:** A Herculaneum street of Roman houses. _Don't show: skeletons, boat vaults, charred wood or food, mud layers._
- **Search:** Commons: "Herculaneum excavations", "Herculaneum carbonized wood".

#### herculaneum_scrolls_ai: How is AI reading the burned scrolls?

- **Discover:** A carbonised Herculaneum papyrus scroll (Commons, check license).
- **Deeper:** The Getty Villa in Malibu, built as a copy of the Villa of the Papyri where the scrolls were found (Pexels, Unsplash or Commons). The alt text says it is a modern copy.
- **Review:** A fragment of a Roman marble column in soft light _(AI ok)_. _Don't show: scrolls, scanners, computers, the colour purple, Greek letters._
- **Search:** Commons: "Herculaneum papyri", "Getty Villa".

#### pompeii_in_brazil: Is there a piece of Pompeii in Brazil?

- **Discover:** The National Museum of Brazil (Paço de São Cristóvão), Rio de Janeiro (Commons).
- **Deeper:** A portrait of Empress Teresa Cristina (Commons, public domain).
- **Review:** The gardens of Quinta da Boa Vista, Rio. _Don't show: fire or smoke, Naples, the empress, frescoes._
- **Search:** Commons: "Museu Nacional Rio de Janeiro", "Teresa Cristina".

## Already done

Pictures generated on the founder's ChatGPT account on 2026-11-18 and added to the drafts; each still needs **Images checked** in `/_review`. Notes in italics record what had to change from the first brief.

### Animal superpowers (AI, or real photos)

Animals can be AI or real. Check the species against the accuracy note before keeping a picture. If you prefer real photos, the **Search** line gives terms.

#### gecko_feet: How do geckos walk on ceilings?

- **Discover:** `DISCOVER: A Mediterranean house gecko clinging to a rainy night window, photographed from the other side of the glass: head pointing up, pale belly against the glass, a dark wooden window frame along the left edge and the bottom, raindrops, a softly blurred warm living room with a lamp behind it.` _Used instead of the ceiling view, which read as upside down and floating. Spell out the toes ("digit 1 shortest, like a thumb … count 5 + 5 + 5 + 5 = 20") and check every foot: ChatGPT kept drawing four toes; the back feet needed one follow-up._ _Accuracy: wide, flattened toe pads with fine ridges (lamellae) across the underside; no suction cups, no glue, no drips._
- **Deeper:** `DEEPER: Extreme macro of the underside of a gecko's foot pressed against glass, the toe pads showing rows of fine pale ridges, soft green background.`
- **Review:** `REVIEW: A gecko resting on a mossy tree trunk at dusk, side view.` _Don't show: suction cups, glue, a frying pan or non-stick coating, peeling toes, microscopic hairs._
- **Search:** "gecko glass", "tokay gecko", "gecko foot macro".

#### octopus_colour: How does an octopus change colour in a blink?

- **Discover:** `DISCOVER: A common octopus on a dark reef at night, its skin mid-change, mottled red-brown on one side and pale sandy on the other, arms curling below it, soft blue light from above.` _Accuracy: eight arms with two rows of suckers, a rounded mantle, a horizontal slit pupil._
- **Deeper:** `DEEPER: Macro of octopus skin filling the frame, a pattern of tiny red, yellow and brown dots of different sizes, some opened wide and some shrunk to pinpoints.`
- **Review:** `REVIEW: An octopus tucked into a rocky crevice, one even colour, only its eye and two arms showing.` _Don't show: colour changing mid-way, muscles or nerves, an eye close-up, anything about energy._
- **Search:** "octopus reef", "octopus skin macro", "Octopus vulgaris".

#### hummingbird_hover: How does a hummingbird hover in mid-air?

- **Discover:** `DISCOVER: A green hummingbird hovering in front of a red tubular flower in the Atlantic Forest, wings a soft blur, body perfectly still, dark green forest behind, the lower part fading to black.` _Accuracy: long thin straight bill, iridescent green back, tiny feet tucked up; wings blurred, not frozen in a bird-like flap._
- **Deeper:** `DEEPER: Side view of a hummingbird hovering with its wings frozen at the top of a stroke, wings swept back and nearly flat, against a soft out-of-focus background.`
- **Review:** `REVIEW: A hummingbird perched on a thin twig in daylight, wings folded.` _Don't show: wing-motion trails or arrows, a sleeping bird at night, a map of Brazil, numbers._
- **Search:** "hummingbird hovering", "beija-flor".

#### sloth_slow_life: How do sloths live so slowly?

- **Discover:** `DISCOVER: A brown-throated three-toed sloth hanging from a high branch in the Amazon canopy at dawn, long arms hooked over the branch, morning mist below, the lower part fading to dark green shadow.` _Accuracy: three long curved claws on each front limb, a dark stripe through each eye like a mask, a shaggy grey-brown coat._
- **Deeper:** `DEEPER: Close-up of a three-toed sloth's calm face among leaves, its shaggy coat faintly tinted green.`
- **Review:** `REVIEW: The Amazon rainforest canopy seen from above in morning mist.` _Don't show: a sloth on the ground, green fur close-ups, leaves being eaten, calendars._
- **Search:** "three-toed sloth", "Bradypus variegatus".

#### bird_navigation: How do migrating birds find their way?

- **Discover:** `DISCOVER: A long V-shaped skein of migrating geese flying high across a deep blue dusk sky …` _Ask for every bird in a different wing position (the first try was copy-pasted silhouettes) and only a thin, dim orange line at the horizon, so the title area stays dark._
- **Deeper:** `DEEPER: A flock of migrating birds flying low over the open sea at sunset, wide view.`
- **Review:** `REVIEW: A small songbird perched on a branch in soft morning light.` _Don't show: stars, the sun, a compass, magnetic field lines, an eye close-up, a planetarium._
- **Search:** "geese migration sky", "bird migration flock".

#### immortal_jellyfish: Is there an animal that never dies of old age?

- **Discover:** `DISCOVER: A tiny transparent jellyfish drifting in dark blue water, its bell glowing faintly, a vivid red-orange stomach in the centre and a fringe of fine white tentacles around the rim, specks of plankton around it for scale, the lower part dark.` _Accuracy: Turritopsis is a few millimetres across, bell about as tall as wide, clear with a red-orange centre and many thin tentacles. Not a large moon jelly._
- **Deeper:** `DEEPER: Several tiny transparent jellyfish with red-orange centres drifting among plankton in dark water.`
- **Review:** `REVIEW: The calm surface of the sea seen from just below, rays of sunlight in blue water.` _Don't show: polyps, a fish eating a jellyfish, a lab or aquarium, a scientist._
- **Search:** real photos are rare; Commons "Turritopsis dohrnii" (check license).

#### tardigrades_space: Can a tardigrade survive in space?

- **Discover:** `DISCOVER: A tardigrade walking along a strand of green moss, seen very close, plump translucent segmented body with eight stubby legs ending in tiny claws, dark background below.` _Accuracy: eight legs in four pairs, a rounded snout, no antennae, no tail._
- **Deeper:** `DEEPER: A small uncrewed capsule orbiting high above Earth …` _Ask for a plain ball-shaped return capsule on a cylindrical equipment module, no windows, hatch or solar wings (closer to the Foton capsule); the first try looked crewed._
- **Review:** `REVIEW: Macro of damp green moss on a rock, soft light.` _Don't show: space, the Sun, a capsule, a dried-out shrunken tardigrade, the year 2007._
- **Search:** Commons "tardigrade" (electron micrographs, check license).

### Why your body does weird things (AI)

No recognisable faces (house style). Anatomy must be correct and unlabelled.

#### hiccups: Why do we get hiccups?

- **Discover:** `DISCOVER: A person seen from behind in a dim kitchen at night, shoulders jolting up mid-hiccup, holding a glass of water, warm light from above, the lower part dark.`
- **Deeper:** `DEEPER: A translucent human torso in soft studio light showing the dome-shaped diaphragm beneath the lungs, no labels.` _Accuracy: the diaphragm is a dome under the lungs and heart, above the liver and stomach._
- **Review:** `REVIEW: A glass of water on a wooden kitchen table in morning light.` _Don't show: throats, vocal cords, the diaphragm, frogs, tadpoles or other amphibians._

#### goosebumps: Why do we get goosebumps?

- **Discover:** `DISCOVER: Macro of a forearm covered in goosebumps, fine hairs standing up, cool blue light, the lower part dark.`
- **Deeper:** `DEEPER: A red fox in frosty air with its fur fluffed up thick against the cold, snowy background.`
- **Review:** `REVIEW: Hands in a wool sweater wrapped around a warm mug by a frosty window.` _Don't show: hair muscles, fluffed fur, mice, stem cells._

#### contagious_yawning: Why is yawning contagious?

- **Discover:** `DISCOVER: A person seen from behind at a window at dusk, arms stretched high over their head in a big yawn, warm room light, the lower part dark.`
- **Deeper:** `DEEPER: A chimpanzee yawning wide in a forest, teeth showing.` _Accuracy: a chimpanzee, not a gorilla or monkey._
- **Review:** `REVIEW: Two coffee cups on a café table late at night.` _Don't show: chimpanzees, families or groups of friends, anyone yawning._

#### brain_freeze: What is brain freeze?

- **Discover:** `DISCOVER: A hand holding an ice-cream cone with a big bite taken out of it, frost on the cone, against a dark background, the lower part dark.`
- **Deeper:** `DEEPER: A tall glass of frozen slushy drink with frost on the glass, close-up.`
- **Review:** `REVIEW: A bowl of vanilla ice cream with a spoon on a café table.` _Don't show: anyone eating fast, a forehead or head, the mouth, clocks or stopwatches, blood vessels._

#### wrinkly_fingers: Why do fingers wrinkle in water?

- **Discover:** `DISCOVER: Close-up of wrinkled fingertips just lifted out of bath water, droplets falling, soft light from above, the lower part dark.`
- **Deeper:** `DEEPER: A hand reaching into clear water to pick up a smooth wet pebble, seen from the side.`
- **Review:** `REVIEW: A bathtub full of still water in a softly lit bathroom.` _Don't show: wrinkled fingers, nerves, blood vessels, hands gripping objects._

#### foot_falling_asleep: Why does your foot "fall asleep"?

- **Discover:** `DISCOVER: Bare feet of a person sitting cross-legged on a wooden floor, seen from above, soft window light, the lower part dark.`
- **Deeper:** `DEEPER: A translucent human leg in soft studio light showing the nerve running down the thigh and wrapping around the outside of the knee, no labels.` _Accuracy: the common fibular nerve curves around the outside of the leg just below the knee._
- **Review:** `REVIEW: A cosy armchair with a folded blanket.` _Don't show: crossed legs, nerves, a knee, pins or needles._
