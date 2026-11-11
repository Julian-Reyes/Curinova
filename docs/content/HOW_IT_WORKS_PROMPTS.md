# "How it works" diagram prompts (53 lessons)

ChatGPT prompts for the pictures in Go Deeper's **How it works** box. All 53 were generated on 2026-11-10 by Claude Code on the founder's ChatGPT account and checked for accuracy before being kept; the prompts below are the versions that worked, with any correction folded in.

**Where the pictures are**

- **Batch 2 (31 drafts):** on the site in the new `diagram` slot (D23), waiting for **Images checked** in `/_review`. A lesson with a diagram picture shows it in How it works; the others keep their SVG scene.
- **Published lessons (22):** generated but not added. An unchecked picture on a published lesson fails `content:validate` and would reach the live site unchecked, and `/_review` lists drafts only. The originals are in `~/Downloads/lumen-diagrams/final/`, named `<lesson>_diagram.png`, ready for `pnpm media:add` once that is sorted.

## How to use

1. Start a fresh ChatGPT chat (long chats start refusing harmless prompts).
2. Paste a lesson's prompt followed by the **house style** line. Do not attach the SVG reference: with a reference ChatGPT just traces the rough drawing.
3. Check the picture against the **Check** line. ChatGPT often gets arrow directions, lengths and balance wrong; ask for a redo naming the exact fix.
4. Save as `<lesson>_diagram.png` and run `pnpm media:add <folder>`; then fill in alt text and the origin in the lesson's `concept.json`.

The old SVG reference pictures stay in `docs/content/how-it-works/` for comparison.

## House style (add to every prompt)

```text
Polished educational illustration in the style of a high-end museum or textbook infographic: soft shading, gentle gradients, realistic but clean, calm natural colours. Wide landscape, exactly twice as wide as tall, with nothing important near the edges. Absolutely no text, letters, numbers, labels, logos or watermarks; arrows and dashed lines are fine. Reply only with the image.
```

## Brazil in space

#### equator_launch_alcantara: Why launch rockets near the equator?

- **Prompt:** `Why rockets launch near the equator. On the left, a realistic Earth seen from space, South America facing us, very slightly wider at the equator than at the poles (a faint dashed circle shows a perfect sphere for comparison). A thin golden dashed line marks the equator, and a small glowing blue dot marks Alcântara on Brazil's north-east coast, just south of the equator. Two teal arrows on the surface show the speed of Earth's spin from west to east: a long arrow at the equator and a short arrow at a higher latitude. A curved arrow above the North Pole shows the spin direction. On the right, a white rocket climbs away from near the equator towards the east on a curved dashed path, with faint speed streaks behind it. Deep navy space with faint stars.`
- **Check:** Spin and launch are west to east (left to right on the near side); the equator arrow is clearly longer; Alcântara is just south of the equator on Brazil's north-east coast.

#### vls_accident_2003: What happened at Alcântara in 2003?

- **Prompt:** `A calm technical illustration of a historic Brazilian satellite launch vehicle, the VLS-1, standing on its launch pad on a tropical coast in daylight. A tall white mobile service tower on the left; two thin red-and-white lightning masts behind; low green scrub and the ocean in the distance. The rocket is slim and white with a pointed nose: a central core with four strap-on boosters around its base (three visible). One booster is softly outlined in a warm golden glow, and a thin dashed line leads from its bottom to a round magnified inset on the right showing its small cylindrical ignition unit. Peaceful scene, no people.`
- **Check:** ChatGPT refuses the words accident and detonator; keep the wording neutral. Four boosters; nothing violent.

#### inpe_amazon_monitoring: How does INPE watch the Amazon from space?

- **Prompt:** `How satellites watch the Amazon. At the top centre, a small Earth-observation satellite with solar panels, its field of view a pale translucent cone reaching down to the rainforest. Below, an aerial view of dense green Amazon rainforest crossed by a straight dirt road with side roads branching off it, and rectangular brown clearings along them in the typical fishbone pattern of deforestation; one cluster of clearings is outlined with a dashed rectangle, as if just detected. On the left, a round dial with twelve segments (one measurement a year); on the right, a small bell with a row of dots (daily alerts); thin dashed lines link the satellite to both.`
- **Check:** Fishbone pattern of roads and clearings; satellite looks down; no words, dates or charts.

#### cbers_program: What is CBERS?

- **Prompt:** `An Earth-observation satellite at work. A boxy satellite wrapped in gold foil orbits above the curve of the Earth, with a single long dark-blue solar panel wing on one side only. A camera under its body looks down; its field of view is a pale translucent trapezoid on the land below, where a river winds through green and brown terrain. On the left, a small stack of satellite photos of land and rivers floats as what it sends back. On the right, a small ground station with an antenna sends faint signal arcs up to the satellite. Deep space with faint stars.`
- **Check:** ChatGPT refused the version that said the satellite is built by two countries. One solar wing only; no flags.

#### amazonia_1: What was Amazonia-1?

- **Prompt:** `An exploded technical view of a modular satellite, explaining a reusable platform. At the bottom centre, a box-shaped service module (the platform) with a long dark-blue solar panel to the right and a small thruster nozzle underneath. Above it, two alternative top modules float: on the left a solid module with a camera lens, joined to the platform by a solid teal arrow; on the right a ghosted, translucent module with a small dish antenna, joined by a dashed arrow, showing the same platform can carry other instruments. On the far left, a framed aerial view of green Amazon forest with a winding river shows what the camera observes. Clean light background.`
- **Check:** The idea is one platform, interchangeable payloads; no rocket, no launch, no India.

#### marcos_pontes: Who was the first Brazilian in space?

- **Prompt:** `A Soyuz spacecraft approaching the International Space Station to dock, above Earth's curved horizon with a thin glowing blue atmosphere. A dashed path rises from Earth to the Soyuz on the left: a round orbital module at the front, a bell-shaped descent module and a cylindrical service module with two small solar panels. On the right, the space station with its long horizontal truss, several pairs of large golden solar arrays and a cluster of white modules in the middle. A short dashed arrow between them shows the docking approach. Deep space with a few faint stars. The dashed path's arrowhead is at the Soyuz end, so it clearly rises from Earth.`
- **Check:** The first try put the arrowhead at Earth, like a return trip.

## Amazon survival tricks

#### electric_eel: How does an electric eel make electricity?

- **Prompt:** `How an electric eel makes electricity. A long, dark olive electric eel swims in clear Amazon river water, head on the right, with a long fin running along its belly and no tall back fin. A cutaway window along most of its body reveals thousands of thin, flat cells stacked in rows like coins in a battery, glowing softly in gold and coral. A small plus symbol floats above the head end and a minus symbol above the tail end. Bright golden zigzag discharges leave the head towards two small fish on the right. Soft underwater light.`
- **Check:** The electric organs run along most of the body; head end positive; body shaped like a knifefish, not a true eel.

#### boto_echolocation: How does the boto hunt in muddy water?

- **Prompt:** `How the Amazon river dolphin (boto) hunts in muddy water by echolocation. An underwater view of a murky, brownish-green Amazon river, the wavy surface along the top, submerged tree trunks and roots of the flooded forest behind. On the left, a pink boto facing right: long thin beak, a rounded bulging forehead (the melon), small eyes, a low ridge on its back instead of a tall fin. Golden curved sound waves spread from its forehead towards a small silver fish on the right, half hidden in the murk; fainter dashed teal echo waves bounce back from the fish towards the dolphin.`
- **Check:** Long beak, melon, no tall dorsal fin; echoes return from the fish.

#### pirarucu_air_breathing: Why does the pirarucu drown if it can't reach the surface?

- **Prompt:** `Why the pirarucu must breathe air. A huge pirarucu (arapaima) in a warm, greenish Amazon lake, tilted upwards with its mouth breaking the water surface to gulp air, a few bubbles above. Its body is long and dark olive, with bright red scales on the rear half and tail. A cutaway along its back shows the swim bladder as a long, spongy, lung-like organ full of small air pockets, glowing slightly. Faint gill arches behind the head. Below the fish, a curved dashed loop and a small clock face without numbers show that it has to come up again and again. Soft underwater light.`
- **Check:** Red colouring on the rear and tail; the lung-like bladder is along the back; no numbers on the clock.

#### leafcutter_farming: Do leafcutter ants eat leaves?

- **Prompt:** `Leafcutter ants farming fungus, as a cross-section of rainforest ground. Above the surface on the left, a leafy plant; a line of reddish-brown leafcutter ants walks towards a small nest mound, each holding a green leaf fragment over its head. A tunnel leads down from the mound to a large underground chamber filled with a spongy, white-grey fungus garden. Inside the chamber, ants place leaf pieces on the fungus and one ant eats from the fungus. A curved dashed arrow runs from the leaves to the fungus. Warm earthy soil tones.`
- **Check:** Ants eat the fungus, never the leaves; ants have three body parts and six legs.

#### poison_frog_diet: Where do poison dart frogs get their poison?

- **Prompt:** `Where poison dart frogs get their poison, as two rows separated by a thin dashed line. Top row (in the wild): a green rainforest leaf, an arrow, a small ant and a tiny red mite, an arrow, then a brilliant yellow-and-black poison dart frog with two small drops of toxin glistening above it. Bottom row (in captivity): a fruit fly and a cricket, an arrow, then the same kind of frog shown pale and plain, with a small crossed-out drop symbol next to it. Clean light background.`
- **Check:** Toxin flows from diet (ants and mites) to the frog; the captive frog has no toxin.

#### giant_water_lily: How can a giant water lily leaf carry so much weight?

- **Prompt:** `Why a giant water lily leaf can carry weight, in two views. Left: a side view of a huge round lily leaf floating on calm water, very thin and flat with a low upturned rim; five small weights sit evenly spread across the top, each with a small downward arrow; beneath the thin leaf, a shallow network of ribs only a few centimetres deep, like the beams under a floor, with small air pockets between them; the long stalk goes straight down from the centre. Right: the same leaf seen from underneath as a large circle, reddish-purple, with thick ribs radiating from the centre, rings of cross-ribs connecting them, small air-filled pockets and scattered sharp spines. Soft natural light.`
- **Check:** The first try drew the ribs as a deep cone. Weight evenly spread; underside reddish and spiny.

## Everyday science myths

#### blue_veins: Is the blood in your veins blue?

- **Prompt:** `Why veins look blue though blood is red, as a cross-section of human skin. A thin pale outer layer over a thicker pink layer; a small dark-red vein lies just under the surface on the left, and a larger dark-red vein lies deeper on the right. A soft light source in the upper left sends two beams into the skin: a red beam travels deep and reaches the deep vein; a blue beam enters only a little way, scatters into small blue dots and bounces back up to a human eye in the upper right. On the surface, the skin above the shallow vein has a faint reddish tint and above the deep vein a faint bluish tint.`
- **Check:** Both veins are dark red, never blue; red light goes deeper than blue.

#### falling_coin: Could a coin dropped from a skyscraper kill someone?

- **Prompt:** `Why a coin dropped from a skyscraper can't kill anyone. Light sky background. On the left, a tall glass skyscraper seen from the side. Beside it, the same small copper coin at four moments of its fall, top to bottom; under each coin an amber speed arrow: short under the first coin, clearly longer under the second, and the longest under the third and fourth, which are exactly equal. At the lowest coin, a teal arrow pointing up (air resistance) exactly as long as an amber arrow pointing down (weight), with faint air swirls. On the right, a minimal graph with two unlabelled axes: a teal curve rises steeply, then levels off; a faint dashed line keeps climbing (a fall without air).`
- **Check:** Speed arrows grow, then stay equal; up and down arrows at the bottom are equal (the first try drew all arrows the same and the forces unequal).

#### knuckle_cracking: Does cracking your knuckles cause arthritis?

- **Prompt:** `A simple, friendly textbook diagram (not photorealistic, no skin or blood) of a finger joint in a neat cut-away. Two smooth ivory bone ends with pale cartilage caps face each other inside a soft translucent capsule of clear pale-blue fluid. Two arrows on the bones point outwards as they are gently pulled apart. In the fluid between them, a single round gas bubble forms. Soft golden sound arcs rise above the joint.`
- **Check:** A realistic version was blocked by ChatGPT's output filter; keep it stylised. The bubble is forming, not bursting.

#### lightning_strikes_twice: Does lightning never strike the same place twice?

- **Prompt:** `Why lightning strikes the same place many times. Dark grey storm clouds fill the top. On the right, a tall, pointed, isolated granite hill with a small statue with open arms on its summit; three lightning bolts, one bright and two fainter as if at different moments, all strike the statue. On a low hill on the left, a lone tall tree is struck by one fainter bolt. Small low houses in the valley between are untouched. A row of short tally marks glows faintly in the sky on the right. Dramatic but clear lighting.`
- **Check:** Tall, pointed, isolated places get struck; the low houses are not.

#### microwave_inside_out: Do microwaves cook food from the inside out?

- **Prompt:** `How a microwave really heats food, as a block of food cut in half and seen in cross-section. The outer band is hot amber-orange, a middle band is warm gold and the centre is still cool pale blue. Wavy golden microwave arrows come in from both sides and stop within the outer band. Small dashed teal arrows point inwards from the warm band towards the cool centre, showing heat spreading by conduction. In the lower right corner, a small water molecule (one red atom and two white atoms) with a curved arrow showing it spinning. Clean light background.`
- **Check:** The centre is the coolest part; microwaves stop in the outer layer.

#### mpemba_effect: Does hot water freeze faster than cold?

- **Prompt:** `The disputed Mpemba effect. On the left, an open freezer compartment with frosty walls holding two identical glasses: one of hot water with rising steam and one of cold water, with a small snowflake symbol. On the right, a clean minimal graph with two axes and no labels: two temperature curves, amber for hot and teal for cold, fall towards a dashed horizontal freezing line, the hot one starting higher; near the freezing line a soft grey cloud of uncertainty covers the place where they might or might not cross. Light background.`
- **Check:** The graph must not show the hot water clearly winning; no numbers.

#### radioactive_foods: Are bananas and Brazil nuts radioactive?

- **Prompt:** `Why bananas and Brazil nuts carry a tiny amount of natural minerals from the soil. In the centre, a tall Brazil nut tree with a cross-section of the soil below showing its very wide, spreading roots; the soil holds scattered tiny amber specks, and some specks sit along the roots. A dashed arrow runs up the trunk to a round, hard woody pod in the canopy; beside the tree, an opened pod with the nuts packed inside. On the left, a ripe banana with a few tiny amber specks around it. Calm, matter-of-fact natural colours.`
- **Check:** Tiny doses: no warning symbols or glow.

## Brazil's three capitals

#### salvador_first_capital: Why was Salvador Brazil's first capital?

- **Prompt:** `Colonial Salvador in the 1600s, shown as a cross-section from the bay. On the left, the calm sea with a sailing ship. At sea level, the Lower Town with warehouses along the port. A steep escarpment rises to the Upper Town on top, with whitewashed houses, a church with two bell towers and fortified walls. A tall, simple wooden hoist or lift shaft connects the two levels, and a dashed double-headed arrow beside the cliff shows its height. In the upper-left corner, a small inset map shows the city on a peninsula between a large bay and the open ocean. Warm historical colours.`
- **Check:** Upper Town on top of a steep escarpment above the port; peninsula between bay and ocean.

#### rio_capital_1763: Why did the capital move to Rio in 1763?

- **Prompt:** `Why the capital moved to Rio in 1763, as an illustrated 18th-century-style map of south-eastern Brazil, land on the left and the Atlantic on the right. Inland, green mountains with gold nuggets glinting among them (the gold mines). A dashed route runs down from the mines to a port city on the coast, beside a rounded granite peak at the mouth of a bay; a sailing ship leaves the port heading out to sea. Far up the coast, a faded crown marks the old capital; a curved dashed arrow carries the crown down the coast to the port city, where a bright golden crown now sits.`
- **Check:** Mines inland, north of the port; the old capital far up the coast; no names.

#### court_in_rio_1808: How did Rio become the capital of a European empire?

- **Prompt:** `The Portuguese court crossing the Atlantic in 1808, as an illustrated map. Brazil's coast on the left, Portugal and the Iberian coast at the top right. A dark arrow presses into Portugal from the east, standing for the invading army. A small fleet of sailing ships follows a dashed route from Lisbon across the ocean, stops at a port on Brazil's north-east coast, then continues south to a bay further down the coast, where a golden crown sits. Aged-parchment ocean colours.`
- **Check:** Route Lisbon, then Salvador, then Rio; no portraits or flags.

#### inland_capital_idea: When did the idea of an inland capital begin?

- **Prompt:** `The idea of moving Brazil's capital inland, as an illustrated map of Brazil (recognisable outline) with the rest of South America around it to the north, west and south as plain, pale land with thin borders, and the sea only on the east. A marker sits on the south-east coast; a dashed arrow leads from it inland to the central plateau, where a dashed rectangle marks out an area containing a small flat-topped plateau and a golden star. A couple of rivers cross the country. Near the bottom, a 19th-century surveyor's theodolite on a wooden tripod. Clean cartographic style.`
- **Check:** The first try drew Brazil as an island. The rectangle sits in the centre of the country.

#### building_brasilia: How was Brasília built so fast?

- **Prompt:** `Brasília being built in the late 1950s on the red earth of the central plateau under a strong sun. From the left, an open truck loaded with workers drives in along a dirt road. A tall construction crane lifts a load. In the middle, two tall slender towers rise inside scaffolding; on the right, a shallow upturned bowl and a low dome stand on a long low platform. Small worker figures carry materials. In the top right corner, a row of twelve small blocks, ten of them filled in, shows the work nearly finished. Warm, dusty light.`
- **Check:** Two towers, an upturned bowl and a dome; figures small and generic.

#### brasilia_plan_shape: Why is Brasília shaped like an airplane?

- **Prompt:** `Brasília's Plano Piloto from directly above as an elegant planning drawing. A straight axis runs left to right, with government buildings and a small triangular square at its right end by a large blue lake. Crossing it is one single smooth C-shaped curved road, like a drawn bow: its middle, at the crossing, sits furthest to the left and both ends sweep evenly to the right towards the lake, parallel to the curved rows of residential blocks on either side. One faint dashed straight vertical line through the crossing shows where a straight axis would have been, with a small dashed arrow from it to the curved road. Soft greens and sandy tones. Do not draw an airplane.`
- **Check:** Took three tries: the curved axis came out straight, then S-shaped. It must be one smooth arc.

## Where your attention goes

#### cocktail_party_effect: How do you hear your own name across a noisy room?

- **Prompt:** `How your own name cuts through the noise of a party. On the left, a cloud of faded, blank grey speech bubbles. One bright purple speech bubble holds a small golden star, standing for the listener's name. On the right, a head in profile facing left, drawn as a smooth, softly shaded translucent silhouette with no facial features, showing the brain and a funnel-shaped filter inside. Dotted grey lines from the faded bubbles fade out just before the ear; a solid purple arrow carries the star bubble into the ear, through the funnel, and lights up a glowing spot in the brain.`
- **Check:** The first try drew a realistic face with the arrow entering the forehead.

#### invisible_gorilla: How did half the viewers miss a gorilla?

- **Prompt:** `The invisible gorilla experiment. A simple indoor court with six small players, three in white shirts and three in black shirts, passing two orange basketballs; dashed purple arcs trace the passes of the white team only, and a small purple tally of marks in the top left counts them. Right in the middle of the scene, a large person in a gorilla suit stands thumping its chest, drawn faint and semi-transparent with a dashed outline, as if unnoticed. Soft indoor lighting.`
- **Check:** Only the white team's passes are traced; the gorilla is in plain sight in the middle.

#### multitasking_switching: Can you really do two things at once?

- **Prompt:** `Why switching between tasks costs time. At the top, two task cards: on the left, simple arithmetic symbols; on the right, a triangle, a square and a circle. Between them, two small interlocking gears. Below, two timelines: the top one is one long purple block followed by one long teal block; the bottom one alternates short purple and teal blocks with small grey gaps between them and ends noticeably later. A dashed vertical line and a purple arrow show the extra time. Clean light background.`
- **Check:** The switching timeline must end later than the one-at-a-time timeline.

#### saccadic_suppression: Why don't you see the world blur when your eyes jump?

- **Prompt:** `Why you don't see a blur when your eyes jump. A wide landscape panel with two small target dots, left and right, and a purple arc arrow showing the gaze jumping from one to the other; the middle of the panel is smeared and darkened, as the blurred view the eye would get during the jump. Below, a realistic human eye looking sideways, and under it a timeline bar: teal (seeing), then a dark segment (vision switched off) that starts just before a small dashed marker for the start of the eye movement, then teal again.`
- **Check:** The dark segment starts slightly before the eye movement. The current picture only brackets the dark segment; ask for it to start clearly before the eye-movement marker if you redo it.

#### stopped_clock_illusion: Why does a clock's second hand seem to stop when you glance at it?

- **Prompt:** `The stopped-clock illusion. On the left, a realistic human eye; a dashed arrow arcs from it to a classic analogue wall clock on the right with a thin purple second hand. Below, a timeline of seconds: the first block, purple, is about twice as long as the three equal teal blocks after it. A curved purple arrow points backwards from the start of the first block to a small dashed marker before it, showing the image stretched back in time. Clean light background; the clock face has marks but no numbers.`
- **Check:** Only the first second is longer; the later seconds are equal; no numbers on the clock.

#### time_slows_fear: Does time really slow down when you're scared?

- **Prompt:** `Why a scare seems to last longer. On the left, a tall free-fall tower against the sky; a small figure falls backwards, lying flat, towards a large safety net at the bottom; a small wrist display beside it shows rapidly flickering blocks. On the right, two film strips starting at the same point: the upper one has four frames; the lower one is noticeably longer and packed with more, denser frames. A golden arrow marks the extra length. Clean light background.`
- **Check:** The memory strip is longer, not the actual fall; no numbers.

## The Moon shapes Earth (published)

#### moon_tidal_locking: Why does the Moon always show the same face?

- **Prompt:** `Why the Moon always shows the same face. A realistic Earth in the centre of a dashed circular orbit; the Moon is shown at four positions around it: top, right, bottom and left. At every position the same distinctive dark patch on the Moon faces Earth, so the patch turns a quarter turn each time. Small arrows along the orbit show the direction of travel. Deep navy space with faint stars.`
- **Check:** The same patch always faces Earth.

#### tides: Why are there two high tides a day?

- **Prompt:** `Why there are two high tides a day. Deep navy space with faint stars. On the left, a realistic Earth seen from above the North Pole, with blue oceans, recognisable continents and soft white clouds. Around it, a translucent aqua layer of ocean water drawn as an exaggerated oval that bulges out equally on two sides: one bulge towards the Moon and one on the opposite side. On the right, a smaller realistic grey Moon with craters. Between them, a few subtle golden arrows pointing from Earth towards the Moon, showing the Moon's pull.`
- **Check:** Two equal bulges; the arrows point towards the Moon (the first try pointed them at Earth). No Sun.

#### day_lengthening: Are Earth's days getting longer?

- **Prompt:** `Why Earth's days slowly get longer. On the left, a realistic Earth with a translucent ocean layer bulging gently and equally on both sides along the Earth-Moon line and a curved arrow showing its spin slowing, a small translucent clock face without numbers overlaid on it. On the right, the Moon with a small arrow pointing away from Earth, as it slowly drifts outward. A faint dotted arc of tidal pull links them. Deep navy space with faint stars.`
- **Check:** The first try showed only one bulge; tides make two.

#### eclipses_rare: Why isn't there an eclipse every month?

- **Prompt:** `Why eclipses are rare. The glowing Sun on the left, the Moon in the middle and Earth on the right, lined up, with a faint shadow cone from the Moon reaching Earth and a small dark spot where it lands. A thin tilted ellipse shows the Moon's orbit, tilted against the line from Sun to Earth, with two faded Moons at other points on the orbit sitting above and below the line. Not to scale. Deep space background.`
- **Check:** The Moon's orbit is tilted, so it usually passes above or below the line.

## How memory works (published)

#### forgetting_curve: How fast do you forget?

- **Prompt:** `The forgetting curve. A clean minimal graph with two axes and no labels: a faint dashed curve drops steeply and then levels out low. Over it, a bold teal line drops, jumps back up at three review moments marked with small glowing mint circles, and drops more gently after each review, levelling out higher each time. Clean light background.`
- **Check:** Forgetting is fastest at first; each review slows it.

#### spacing_effect: Why does spacing out your study work better?

- **Prompt:** `Spaced study. A tidy wall calendar with a grid of days, no numbers; a few study sessions are marked as small open books on separate, spread-out days, the rest of the days empty. Beside it, a small plant that has grown taller with each session. Clean light background.`
- **Check:** Sessions spread out, not grouped; no numbers or dates.

#### testing_effect: Why does trying to remember teach more than rereading?

- **Prompt:** `The testing effect. On the left, a closed book and a blank flashcard with a large question mark; a dashed teal path leads from the card to a glowing purple spark inside a soft mint circle on the right, a memory being pulled out. Below the spark, a small tick mark appears as the answer is checked. Clean light background.`
- **Check:** Recall before checking, not rereading.

#### retrieval_cues: Why can a cue bring a memory back?

- **Prompt:** `How a cue brings a memory back. On the left, a purple luggage-style label tag with a small piece of fruit drawn on it; a dashed teal line leads from it to a wooden cabinet of six drawers on the right. One drawer is pulled open and glows softly, showing small objects inside; the other drawers stay closed. Clean light background.`
- **Check:** The cue opens one drawer among several.

#### sleep_memory: What does your brain do with your memories while you sleep?

- **Prompt:** `Memory during sleep. A person sleeping peacefully under a blanket on the left, seen from behind, with a purple crescent moon above the bed. On the right, a soft translucent network of glowing mint nodes joined by teal lines, with a few connections brightening, as memories being linked during sleep. Calm night colours. No letter Z symbols.`
- **Check:** Keep it suggestive; the person seen from behind.

## Kitchen chemistry (published)

#### maillard_reaction: Why do bread, steak and coffee turn brown and smell so good?

- **Prompt:** `The Maillard reaction. On the left, a golden-brown crusty loaf of bread on a board; in the middle, a seared steak in a hot dry pan; on the right, a cup of coffee with roasted beans. Small translucent aroma molecules, drawn as linked spheres, rise from all three. Warm kitchen light.`
- **Check:** Browning on dry, very hot surfaces; no boiling water.

#### onion_tears: Why does cutting onions make you cry?

- **Prompt:** `Why cutting onions makes you cry. On a cutting board on the left, a halved onion with a knife; small translucent puffs of gas rise from the cut surface and drift right towards a single human eye, drawn alone, with one tear forming below it. Clean light background.`
- **Check:** Gas appears only from the cut surface; show the eye alone, not a face.

#### salt_boiling: Does salt make pasta water boil faster?

- **Prompt:** `What salt really does to boiling water. A pot of water on a stove with bubbles rising; salt grains fall in from a salt shaker above, and around each grain a small burst of bubbles forms. A thermometer beside the pot rises just a hair above its usual mark. Clean kitchen background.`
- **Check:** The bubbles form on the grains; salt slightly raises the boiling point; no numbers.

#### altitude_boiling: Why does water boil below 100 °C up a mountain?

- **Prompt:** `Why water boils at a lower temperature up a mountain. A snowy mountain, with a small camping pot steaming near the summit and another pot at its foot; a column of air arrows presses down, many arrows at the foot and fewer near the summit. On the right, two thermometers: the summit one reads lower than the one at the foot. Clear sky.`
- **Check:** Less air pressure up high, lower boiling temperature; no numbers.

## The body renews itself (published)

#### red_blood_cells: How long does a red blood cell live?

- **Prompt:** `Red blood cells on their journey. A cut-away blood vessel running across the image, with many red blood cells flowing through it: each a smooth red disc dimpled on both sides, seen at different angles. On the left, a cross-section of spongy bone marrow releasing new cells into the stream. Soft medical-illustration lighting.`
- **Check:** Discs dimpled on both sides, no nucleus.

#### bone_remodeling: Is your skeleton alive?

- **Prompt:** `Bone remodelling. A long bone with a magnified cut-away window into its spongy inner structure. Inside, large cells nibble away a small pit of old bone, and nearby smaller cells line up laying down fresh new bone matrix. A curved arrow underneath shows the continuing cycle of removal and rebuilding. Soft medical-illustration lighting.`
- **Check:** Removal and rebuilding side by side, as a cycle.

#### seven_year_myth: Does your entire body replace itself every seven years?

- **Prompt:** `Different parts of the body renew at different speeds. A translucent human figure seen from the front with a few highlighted areas: the stomach lining, the blood, the skin and the brain. Beside each, a small circular arrow of a different size and speed: small fast circles for the stomach lining, medium ones for blood and skin, and a still, solid ring for the brain's neurons. Clean light background.`
- **Check:** Many different timetables, no single cycle; no numbers.

#### skin_renewal: Where does your old skin go?

- **Prompt:** `How skin renews itself, as a cross-section of the outer skin. At the base, round, plump new cells; above them, cells that grow flatter layer by layer; at the surface, thin flat dead cells, with a few flakes lifting away into the air. A dashed arrow on the side points upward. Soft medical-illustration lighting.`
- **Check:** New cells at the base move up, flatten and flake off.

#### stomach_lining: Why doesn't your stomach digest itself?

- **Prompt:** `Why the stomach doesn't digest itself. A cut-away human stomach with its muscular wall; a thick glistening layer of protective mucus lines the inside of the wall; inside the stomach, droplets of acid stay kept away from the wall by the mucus layer. A small magnified inset shows the surface cells under the mucus. Soft medical-illustration lighting.`
- **Check:** The mucus layer separates acid from the wall.

## The Portuguese language in Brazil (published)

#### tordesillas: Why does Brazil speak Portuguese rather than Spanish?

- **Prompt:** `The Treaty of Tordesillas line. An aged parchment map of the Atlantic and South America in 15th-century style, with a dashed north-south line drawn down the map, cutting through the eastern bulge of South America; the land east of the line is lightly tinted one colour and the land to the west another. A compass rose in the lower right and a small sailing ship in the ocean. No words or names on the map.`
- **Check:** The line runs north to south and cuts off the eastern part of South America.

#### lingua_geral: What language did colonial São Paulo speak?

- **Prompt:** `The general language of colonial São Paulo. A winding river through forest, with a small colonial village of whitewashed houses and a chapel on the riverbank, and a canoe on the water. Above, two blank speech bubbles overlap in soft brown and mint, standing for two languages mixing. Warm historical colours.`
- **Check:** The speech bubbles are blank, with no letters.

#### pombal_directorate: How did the Crown try to impose Portuguese in Brazil?

- **Prompt:** `An 18th-century royal decree. An official document on aged paper covered in illegible handwritten lines, a red wax seal with ribbons at the bottom, a quill and inkwell beside it, on a dark wooden desk. Warm candlelit colours.`
- **Check:** The writing is illegible marks, not real words.

#### tupi_words: Which everyday Portuguese words came from Tupi?

- **Prompt:** `Things whose Portuguese names come from Tupi, arranged as a friendly still life: a pineapple, a toco toucan perched on a branch, a capybara, a bowl of popcorn and cassava roots. Bright natural colours on a light background.`
- **Check:** The toco toucan is black with a white throat and a large orange beak; no written words.
