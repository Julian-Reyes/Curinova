# Image prompts for batch 2 (31 lessons)

ChatGPT prompts and photo search briefs for every picture slot in the five batch 2 trails. Same workflow, house style and slots as `docs/content/IMAGE_PROMPTS.md`; read its **How to use** section first.

**Order:** pictures can be added only after a lesson's text is approved in `/_review` (`pnpm media:add` writes to `content/lessons/`). Work one trail at a time: approve its text, make its pictures, run `pnpm media:add <folder>`, look at them in `/_review`, replace any you don't like (same file name, run it again), then press **Images checked**.

**Slots:** _Discover_ is the full-screen card (9:16, white title over the bottom). _Deeper_ is the Go Deeper hero (cropped to 12:7). _Review_ is the quiz picture (cropped to 16:9) and **must not give the answer away**; each Review line says what to avoid.

**Real photos** (Pexels, Unsplash, Wikimedia Commons): keep each picture's page link for the credit. Pexels and Unsplash photos are free to use; on Commons, check the license (public domain, CC0, CC BY or CC BY-SA) and the author. Tall sources for wide slots may need a manual pre-crop around the subject first, because `media:add` only centre-crops. Use `-up20` (or another percentage) on a Discover file name to lift the subject above the title.

## Amazon survival tricks (AI, or real nature photos)

Animals and plants can be AI or real. If you prefer real photos, the **Search** line gives Pexels/Unsplash terms; check that the species is the right one.

### electric_eel: How does an electric eel make electricity?

- **Discover:** `DISCOVER: An electric eel gliding through dark, tea-coloured Amazon river water among submerged roots, its long olive-brown body and pale throat lit by shafts of light from above, the lower part fading to black.` _Accuracy: a long, cylindrical, eel-like fish with no dorsal fin and a long fin running under the body; olive-brown with a yellowish or orange throat. No sparks or glowing lightning._
- **Deeper:** `DEEPER: Side view of an electric eel resting near the muddy bottom of a murky river, its very long body stretched across the frame, soft green-brown light.`
- **Review:** `REVIEW: A calm dark Amazon river at dusk, flooded forest trees reflected in still water.` _Don't show cells, organs, batteries, sparks or several eels (all answers)._
- **Search:** "electric eel", "Electrophorus".

### pirarucu_air_breathing: Why does the pirarucu drown if it can't reach the surface?

- **Discover:** `DISCOVER: A huge pirarucu (arapaima) swimming just below the surface of a green Amazon lake, large scales edged in red towards the tail, sunlight filtering down from above, the depths below dark.` _Accuracy: very long, torpedo-shaped body, big rounded scales, grey-green front fading to red-edged scales on the rear half; flat head._
- **Deeper:** `DEEPER: An arapaima breaking the surface of a still, dark lake with its mouth to take a gulp of air, ripples spreading, flooded forest behind.`
- **Review:** `REVIEW: Close-up of the large red-edged scales on an arapaima's flank, filling the frame.` _Don't show a fish at the surface gulping air, fishers or canoes (all answers)._
- **Search:** "arapaima", "pirarucu".

### leafcutter_farming: Do leafcutter ants eat leaves?

- **Discover:** `DISCOVER: Macro of a column of leafcutter ants carrying bright green leaf pieces up a twig in the rainforest, raised like sails, lit from behind, the forest floor below in deep shadow.` _Accuracy: reddish-brown ants with spiny backs, each carrying a cut half-moon of leaf above its head._
- **Deeper:** `DEEPER: A trail of leafcutter ants crossing the rainforest floor, each carrying a green leaf fragment, shallow depth of field.`
- **Review:** `REVIEW: A single leafcutter ant holding a piece of green leaf in its jaws, on a twig, blurred green background.` _Don't show the fungus garden or anything white and spongy inside a nest (that's the answer)._
- **Search:** "leafcutter ants", "leaf cutter ant".

### poison_frog_diet: Where do poison dart frogs get their poison?

- **Discover:** `DISCOVER: A bright blue-and-black poison dart frog sitting on a wet green leaf in the rainforest, droplets on its skin, the background dark and blurred, the lower part in deep shadow.` _Accuracy: small (thumb-sized) frog, smooth glossy skin; real colour patterns only (e.g. blue with black spots, or yellow-and-black bands). No lizards or toads._
- **Deeper:** `DEEPER: A strawberry-red poison dart frog with blue legs on mossy bark in a misty rainforest.`
- **Review:** `REVIEW: Close-up of a yellow-and-black poison dart frog on a leaf, soft green background.` _Don't show ants, mites, termites, crickets or a terrarium (all answers)._
- **Search:** "poison dart frog", "Dendrobates".

### boto_echolocation: How does the boto hunt in muddy water?

- **Discover:** `DISCOVER: A pink Amazon river dolphin (boto) rising through brown, murky river water, its long thin beak and rounded forehead lit from above, the water below fading to dark.` _Accuracy: a pink to grey-pink river dolphin with a long, slender beak, a bulging rounded forehead (melon) and a low ridge instead of a tall dorsal fin. Not an ocean dolphin._
- **Deeper:** `DEEPER: A boto surfacing in a flooded Amazon forest, its pink back and long beak just above the dark water, tree trunks behind.`
- **Review:** `REVIEW: The pink back of a river dolphin breaking the surface of a brown river, seen from a canoe.` _Don't show sound waves, ears, clicks or fish being caught (all answers)._
- **Search:** "pink river dolphin", "Amazon river dolphin", "boto".

### giant_water_lily: How can a giant water lily leaf carry so much weight?

- **Discover:** `DISCOVER: Giant Amazon water lily leaves floating on a still dark lagoon seen from above at an angle, huge round pads with upturned rims, one white flower open, the lower part dark water.` _Accuracy: Victoria amazonica: flat round pads up to 2–3 m wide with a raised rim; the flower is white on its first night and turns pink the next._
- **Deeper:** `DEEPER: The underside of a giant water lily leaf lifted at the edge of a pond, showing its network of thick reddish ribs and spines.` _This is the lesson's subject, fine for Deeper._
- **Review:** `REVIEW: Several giant water lily pads floating on a calm lake at sunset, seen from the shore.` _Don't show the leaf's ribbed underside or a glass building (both answers)._
- **Search:** "Victoria amazonica", "giant water lily".

## Brazil's three capitals (real photos)

Real places and people: no AI. Modern cities are easy on Pexels/Unsplash; colonial history needs Wikimedia Commons (paintings, old engravings, maps). Discover needs a tall (portrait) picture or a tall crop.

| Lesson                   | Discover (tall)                                                               | Deeper (wide)                                                     | Review (wide)                                                    | Search terms                                                                                                          | Review: avoid                                                     |
| ------------------------ | ----------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `salvador_first_capital` | Pelourinho's colourful colonial houses and church towers                      | Salvador's upper and lower town with the Lacerda Elevator and bay | Salvador's bay seen from the upper town                          | Pexels/Unsplash: "Pelourinho", "Salvador Bahia", "Elevador Lacerda". Commons: "Salvador 17th century engraving"       | Tomé de Sousa, 1549, caravels arriving                            |
| `rio_capital_1763`       | An old engraving or painting of colonial Rio and Guanabara Bay                | Paço Imperial or Praça XV today                                   | Guanabara Bay with Sugarloaf (no gold)                           | Commons: "Rio de Janeiro 18th century", "Rugendas Rio". Pexels: "Paço Imperial", "Praça XV"                           | Gold, mines, Minas Gerais, Pombal                                 |
| `court_in_rio_1808`      | Portrait of Dom João VI (Commons, public domain)                              | Debret or Rugendas painting of Rio in the 1810s                   | Rio's old centre today (e.g. Real Gabinete Português de Leitura) | Commons: "Dom João VI retrato", "Debret Rio de Janeiro", "chegada da família real". Pexels: "Real Gabinete Português" | Napoleon, a fleet, anything about 1815                            |
| `inland_capital_idea`    | Cerrado landscape on the Planalto Central (twisted trees, red earth, big sky) | Old map of Brazil's interior, or a Cruls Mission photo (Commons)  | Wide Cerrado landscape with a dirt road                          | Pexels/Unsplash: "cerrado", "Chapada dos Veadeiros". Commons: "Missão Cruls", "Planalto Central 1892"                 | Surveyors, markers, the 1891 Constitution                         |
| `building_brasilia`      | Brasília Cathedral or the Congress towers at dusk                             | Construction photo from 1957–1960 (Arquivo Público do DF)         | Esplanada dos Ministérios today                                  | Pexels/Unsplash: "Brasília cathedral", "Congresso Nacional". Commons: "construção de Brasília", "candangos"           | Workers, cranes, building sites, a calendar                       |
| `brasilia_plan_shape`    | Congress towers or Palácio do Planalto in a tall crop                         | Aerial view of the Eixo Monumental                                | A Brasília superquadra with pilotis and trees                    | Pexels/Unsplash: "Brasília aerial", "Eixo Monumental", "superquadra". Commons: "Plano Piloto Brasília"                | The airplane or cross-shaped plan from above, UNESCO, Lúcio Costa |

## Brazil in space (real photos preferred)

Specific rockets, satellites and people should be real. NASA photos are public domain (on Commons and nasa.gov); check the license on INPE, AEB, FAB and ISRO pictures. Generic scenes (Earth from orbit, a night launch) can be AI if no real picture fits.

| Lesson                     | Discover (tall)                                                                   | Deeper (wide)                                                  | Review (wide)                                              | Search terms                                                                                             | Review: avoid                                         |
| -------------------------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| `equator_launch_alcantara` | A rocket lifting off at night over the sea (real, or AI)                          | Alcântara Launch Centre on the Maranhão coast                  | Coast of Maranhão from above (or the Lençóis Maranhenses)  | Commons: "Centro de Lançamento de Alcântara", "VSB-30 launch". Pexels: "rocket launch night", "Maranhão" | A globe or a line marking the equator                 |
| `vls_accident_2003`        | The VLS-1 on its launch tower before the accident                                 | Alcântara's launch area, or the memorial to the 21 technicians | The Alcântara coastline                                    | Commons: "VLS-1", "Veículo Lançador de Satélites", "Alcântara memorial"                                  | Fire, explosion, smoke, a detonator                   |
| `inpe_amazon_monitoring`   | Satellite photo of the Amazon with deforestation patches (NASA Earth Observatory) | Aerial photo of the edge between forest and cleared land       | Aerial photo of unbroken Amazon forest and a winding river | Commons/NASA: "Rondônia deforestation from space", "Landsat Amazon". Pexels/Unsplash: "Amazon aerial"    | Calendars, alerts, charts, the words PRODES or DETER  |
| `cbers_program`            | A CBERS satellite (photo or official render)                                      | A CBERS satellite image of a Brazilian city or river           | Earth from orbit over South America at night               | Commons: "CBERS-4", "CBERS satellite", "CBERS image". INPE gallery                                       | Flags of Brazil and China, dates                      |
| `amazonia_1`               | The Amazonia-1 satellite in the clean room (INPE)                                 | Earth-observation image of the Amazon taken by Amazonia-1      | Earth's curve from orbit over clouds                       | Commons: "Amazonia-1 satellite", "Amazônia 1 INPE". INPE and AEB galleries                               | A launch, India, the PSLV rocket                      |
| `marcos_pontes`            | NASA portrait of Marcos Pontes in his spacesuit (public domain)                   | Marcos Pontes aboard the ISS in 2006 (NASA)                    | Earth from orbit at night, city lights (NASA)              | Commons/NASA: "Marcos Pontes", "Expedition 13", "Soyuz TMA-8"                                            | The ISS, the 14-Bis, Santos Dumont, a calendar (2006) |

## Everyday science myths (AI)

### microwave_inside_out: Do microwaves cook food from the inside out?

- **Discover:** `DISCOVER: Inside a microwave oven seen through its door, a bowl of soup on the turntable glowing under the warm interior light, steam curling up, the area below the door dark.` _Accuracy: a normal mesh-screen door; no rays, glowing beams or waves drawn in the air._
- **Deeper:** `DEEPER: A plate of steaming rice and vegetables just out of the microwave on a kitchen counter, a fork resting beside it.`
- **Review:** `REVIEW: A modern microwave oven on a kitchen counter, door closed, soft morning light.` _Don't show a cut-open dish with a hot outside and cold centre, or a timer (both answers)._

### mpemba_effect: Does hot water freeze faster than cold?

- **Discover:** `DISCOVER: Two glasses of water side by side on a dark table, one with steam rising, the other with ice crystals forming at its rim, cold blue light, the lower part dark.`
- **Deeper:** `DEEPER: A tray of ice cubes in a frosty freezer, frost feathers on the walls, cold blue light.`
- **Review:** `REVIEW: A steaming kettle beside an empty glass on a kitchen counter.` _Don't show which glass froze first, a thin ice layer or a fully frozen block (all answers)._

### blue_veins: Is the blood in your veins blue?

- **Discover:** `DISCOVER: Close-up of the inside of a pale wrist resting on dark fabric, faint bluish veins visible under the skin, soft side light, the lower part in shadow.` _Accuracy: veins only faintly visible, as in real life; no glowing or bright-blue lines._
- **Deeper:** `DEEPER: The back of a hand in soft window light, veins slightly raised under the skin.`
- **Review:** `REVIEW: An open hand, palm up, resting on a white sheet in soft daylight.` _Don't show blood, a blood tube, a needle or light rays (all answers)._

### falling_coin: Could a coin dropped from a skyscraper kill someone?

- **Discover:** `DISCOVER: Looking straight up a tall glass skyscraper towards a pale sky, a single small coin tumbling in the air high above, the lower part the building's dark base.`
- **Deeper:** `DEEPER: A single coin spinning in mid-air against a blurred city skyline at dusk.`
- **Review:** `REVIEW: A handful of coins lying on a city pavement, shallow depth of field.` _Don't show a person being hit, speed lines or air arrows (all answers)._

### radioactive_foods: Are bananas and Brazil nuts radioactive?

- **Discover:** `DISCOVER: A bunch of ripe bananas and a small pile of shelled Brazil nuts on a dark wooden table, warm side light, the lower part in shadow.` _Accuracy: Brazil nuts are long, three-sided, brown-skinned kernels._
- **Deeper:** `DEEPER: An opened Brazil nut pod (round, woody, like a coconut) on the forest floor, its seeds packed inside like orange segments.`
- **Review:** `REVIEW: Three bananas on a white kitchen counter in daylight.` _Don't show a Geiger counter, a radiation symbol, soil or tree roots (all answers)._

### knuckle_cracking: Does cracking your knuckles cause arthritis?

- **Discover:** `DISCOVER: Two hands with fingers interlaced and pushed outward, as if about to crack the knuckles, against a dark background, warm side light on the knuckles, the lower part in shadow.` _Accuracy: normal, healthy hands; no visible joint swelling._
- **Deeper:** `DEEPER: A hand resting on a desk next to a keyboard, fingers slightly bent, soft daylight.`
- **Review:** `REVIEW: A relaxed hand resting on a wooden table, soft daylight.` _Don't show X-rays, MRI scans, bubbles or a cut-away joint (all answers)._

### lightning_strikes_twice: Does lightning never strike the same place twice?

- **Discover:** `DISCOVER: A bright lightning bolt striking a lone tall tree on a dark plain under a stormy night sky, the bolt in the upper half, the ground below black.`
- **Deeper:** `DEEPER: A stormy sky over a city at night, several lightning bolts reaching down to tall buildings.` _No identifiable landmark._
- **Review:** `REVIEW: Dark storm clouds gathering over an open field, no lightning yet.` _Don't show Christ the Redeemer, a lightning rod, or lightning hitting a tall object (all answers)._

## Where your attention goes (AI)

### multitasking_switching: Can you really do two things at once?

- **Discover:** `DISCOVER: A desk at night seen from behind a person: a laptop, an open notebook and a phone lighting up with a notification, two hands moving between them, the lower part in shadow.` _Accuracy: screens show only blurred, illegible shapes._
- **Deeper:** `DEEPER: Two hands juggling three balls against a plain dark background, soft light.`
- **Review:** `REVIEW: A tidy desk with a single open notebook and a pen, soft daylight.` _Don't show driving, a car or a phone at the wheel (that's an answer)._

### invisible_gorilla: How did half the viewers miss a gorilla?

- **Discover:** `DISCOVER: A basketball spinning in mid-air between blurred players' hands in a bright hallway, seen as a freeze-frame, the lower part dark.` _No gorilla and no faces._
- **Deeper:** `DEEPER: A small group of people seen from behind passing a basketball in a plain corridor, motion-blurred.`
- **Review:** `REVIEW: A single basketball resting on a polished gym floor.` _Don't show a gorilla or a half-filled crowd (both answers)._

### cocktail_party_effect: How do you hear your own name across a noisy room?

- **Discover:** `DISCOVER: A crowded evening party seen from behind the guests, warm lights, glasses raised, figures blurred; one person in the foreground turning their head over their shoulder, seen from behind; the lower part dark.` _No recognisable faces._
- **Deeper:** `DEEPER: Out-of-focus party lights and silhouettes of people talking in small groups.`
- **Review:** `REVIEW: Two empty wine glasses on a table with blurred party lights behind.` _Don't show headphones, one ear covered or name tags (all answers)._

### saccadic_suppression: Why don't you see the world blur when your eyes jump?

- **Discover:** `DISCOVER: Extreme close-up of a human eye looking sideways, its iris sharply detailed, soft light, the face around it in shadow and the lower part dark.` _Only the eye; not a recognisable face._
- **Deeper:** `DEEPER: A city street seen through a car window, the scene sharp, a coffee cup on the dashboard.`
- **Review:** `REVIEW: An open book on a table, its text blurred and illegible, soft daylight.` _Don't show motion blur, a blank frame or an eye mid-movement (all answers)._

### stopped_clock_illusion: Why does a clock's second hand seem to stop when you glance at it?

- **Discover:** `DISCOVER: An analogue wall clock with a thin red second hand, seen in a dim room, the face lit by a window, the lower part in shadow.` _Accuracy: no numbers needed; simple tick marks only._
- **Deeper:** `DEEPER: A railway station clock against a blurred station hall.` _No legible text._
- **Review:** `REVIEW: A pocket watch lying open on a wooden table, soft light.` _Don't show an eye glancing, or the hand mid-tick with motion trails (both answers)._

### time_slows_fear: Does time really slow down when you're scared?

- **Discover:** `DISCOVER: Looking down from a high platform into a deep canyon, a bungee cord trailing off the edge, the canyon floor far below in shadow.`
- **Deeper:** `DEEPER: A rollercoaster at the top of a steep drop against a bright sky, cars about to plunge.` _No faces._
- **Review:** `REVIEW: A big sand hourglass on a dark table, sand falling.` _Don't show a free-fall drop, a net or a stopwatch (all answers)._
