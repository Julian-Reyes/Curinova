# "How it works" diagram prompts (53 lessons)

ChatGPT prompts for polished versions of every lesson's **How it works** drawing in Go Deeper. Today each lesson shows an original SVG scene drawn in code (`apps/web/app/components/Illustration.tsx` and `illustrations/`). These prompts are for when we want better-looking versions: send ChatGPT the scene's picture together with its prompt, and it redraws the same idea in a richer style.

**Not wired up yet.** The app can only show the SVG scenes in this spot. Using ChatGPT pictures here needs a fourth picture slot ("diagram") in the lesson format, which is a decision to make first (D23 in `docs/DECISIONS.md`). Until then, keep the finished pictures in a folder; nothing in the app changes.

## How to use

1. Start a new ChatGPT chat and paste the **house style** below once.
2. For each lesson, attach its reference picture from `docs/content/how-it-works/<scene>.png` and paste the lesson's prompt.
3. Check the **accuracy notes** before keeping a picture. A diagram that teaches the wrong thing is worse than the plain SVG.
4. Name the file `<lesson>_diagram.png` (for example `tides_diagram.png`) and keep it until the diagram slot exists.

**The reference pictures are a snapshot** of the scenes as drawn on 2026-11-10. If a scene changes in code, ask for the PNGs to be exported again.

**Shape:** the drawing sits in a 2:1 box that shows only the top 170 pixels until the reader taps "Show more". Keep the key idea in the middle band and nothing important near the edges.

## House style (paste once per chat)

```text
You'll redraw a series of simple diagrams for a science-learning app for curious adults. For each one I'll attach a rough reference drawing and describe what it must show. House style for every image:
- A polished educational illustration: clean shapes, soft shading and gentle gradients, like a high-quality museum or textbook infographic. Calm, natural colours with mint, aqua and teal as the base palette plus one accent colour I'll name.
- Keep the reference drawing's layout and every element it contains, in the same places, so the idea stays the same. Make it richer and clearer, not different.
- Absolutely no text, letters, numbers, labels, logos or watermarks. Arrows, dashed lines and simple symbols are fine.
- No recognisable faces; people are small simple figures or silhouettes.
- Wide landscape, exactly twice as wide as tall (for example 1536×768). Plain light background, nothing important near the edges.
- Scientifically and historically accurate. Don't add things I didn't ask for.
Reply only with the image.
```

## Brazil in space (accent: blue)

#### equator_launch_alcantara: Why launch rockets near the equator?

- **Reference:** `how-it-works/equator-launch.png`
- **Prompt:** `DIAGRAM: Earth seen from the side, slightly wider at the equator than a perfect circle (a faint dashed circle shows the difference). A dashed golden equator line crosses South America; a blue dot marks Alcântara just below it. Two teal arrows on Earth's surface show rotation speed: a long one at the equator, a short one higher up. A curved arrow above the north pole shows Earth spinning west to east. A small rocket leaves from near the equator towards the upper right along a dashed path, with faint speed lines behind it. Accent colour: blue.`
- **Accuracy:** Earth spins west to east (left to right on the near side). Alcântara is about 2° south of the equator, on Brazil's north-east coast. The bulge at the equator should be subtle.

#### vls_accident_2003: What happened at Alcântara in 2003?

- **Reference:** `how-it-works/vls-pad.png`
- **Prompt:** `DIAGRAM: The VLS-1 rocket standing on its launch table beside a tall white mobile tower, with two thin red-and-white lightning masts to the left. The rocket has a slim central core with a pointed blue nose and four strap-on boosters around its base (three visible). One booster is highlighted in gold with a small spark at its base. A dashed line leads from it to a round inset showing a small detonator cartridge with a spark. Calm daylight, no fire, no smoke, no explosion. Accent colour: blue.`
- **Accuracy:** This lesson is about a real accident that killed 21 people: keep it sober. No flames, debris or people. The VLS-1 had four first-stage boosters around a central core.

#### inpe_amazon_monitoring: How does INPE watch the Amazon from space?

- **Reference:** `how-it-works/deforestation-watch.png`
- **Prompt:** `DIAGRAM: A small Earth-observation satellite at the top centre with two solar panels, its field of view a pale cone reaching down to a strip of green rainforest seen from above. Across the forest runs a road with side roads and rectangular clearings in a "fishbone" pattern; one clearing area is outlined with a dashed box, as if detected. On the left, a round dial with twelve marks stands for one yearly measurement; on the right, a bell with a row of dots stands for daily alerts. Dashed lines link the satellite to both. Accent colour: blue.`
- **Accuracy:** The fishbone pattern (roads with clearings branching off) is the classic look of Amazon deforestation from space. No words, calendars with dates or charts.

#### cbers_program: What is CBERS?

- **Reference:** `how-it-works/cbers-satellite.png`
- **Prompt:** `DIAGRAM: A boxy CBERS remote-sensing satellite in orbit above Earth's curved horizon. Its body is split down the middle into two colours (blue and gold) to show it is built by two countries. A single long solar panel wing extends to the right. A camera under the body looks down at Earth, its field of view a pale trapezoid on the ground. On the left, a small stack of satellite images (green land with a river) shows what it sends back. On the right, a small ground data station with an antenna sends signal arcs up to the satellite. Accent colour: blue.`
- **Accuracy:** No flags. CBERS satellites have one solar wing on one side. The ground station stands for the environmental data relay the first satellites carried.

#### amazonia_1: What was Amazonia-1?

- **Reference:** `how-it-works/multimission-platform.png`
- **Prompt:** `DIAGRAM: An exploded view of a modular satellite. At the bottom centre, a blue service module (the Multimission Platform) with a long solar panel to the right and a small thruster nozzle underneath. Above it, two possible payload modules: on the left a solid module with a camera lens, joined to the platform by a solid teal arrow; on the right a dashed, ghosted module with a small dish antenna, joined by a dashed arrow, showing the same platform can carry other payloads. On the far left, a framed aerial view of green forest with a river shows what the camera observes. Accent colour: blue.`
- **Accuracy:** The point is reuse: one standard platform, different payloads. No rocket, no India, no launch.

#### marcos_pontes: Who was the first Brazilian in space?

- **Reference:** `how-it-works/soyuz-iss.png`
- **Prompt:** `DIAGRAM: Earth's curved horizon along the bottom with a thin glowing atmosphere. A dashed path rises from Earth to a Soyuz spacecraft (round orbital module at the front, bell-shaped descent module, cylindrical service module with two small blue solar panels) approaching the International Space Station on the right. The station has a long horizontal truss with eight golden solar arrays and a cluster of white modules in the middle. A dashed arrow between them shows the docking approach. A few faint stars. Accent colour: blue.`
- **Accuracy:** The Soyuz docks nose-first with its orbital module. Keep the station generic in detail, no flags or mission patches.

## Amazon survival tricks (accent: coral red)

#### electric_eel: How does an electric eel make electricity?

- **Reference:** `how-it-works/eel-cells.png`
- **Prompt:** `DIAGRAM: A long olive-green electric eel swimming in pale water, head on the right. A cutaway window along its body shows rows of thin stacked cells (electrocytes) in alternating gold and coral, like a stack of tiny batteries. A plus symbol above the head end and a minus symbol above the tail end. Zigzag golden discharges leave the head towards two small fish on the right. Accent colour: coral red.`
- **Accuracy:** The electric organs run along most of the body, not just the tail; the head end is positive. Electric eels are knifefish, not true eels: long body, long fin along the belly, no big dorsal fin.

#### boto_echolocation: How does the boto hunt in muddy water?

- **Reference:** `how-it-works/boto-sonar.png`
- **Prompt:** `DIAGRAM: A pink Amazon river dolphin (boto) in murky brown water, facing right, with its long thin beak and a rounded bulge on its forehead (the melon). Golden curved sound waves spread from the melon towards a small fish; dashed teal echo waves bounce back from the fish towards the dolphin. Flooded tree trunks stand in the background on the right, and the wavy water surface runs along the top. Accent colour: coral red.`
- **Accuracy:** The boto has a long narrow beak, a prominent melon, small eyes and a low ridge instead of a tall dorsal fin.

#### pirarucu_air_breathing: Why does the pirarucu drown if it can't reach the surface?

- **Reference:** `how-it-works/pirarucu-breath.png`
- **Prompt:** `DIAGRAM: A huge pirarucu (arapaima) tilted upwards with its mouth breaking the water surface to gulp air; a few air bubbles above. Its body is dark olive with a red rear half and tail. A cutaway along its back shows the swim bladder as a long spongy, lung-like organ. Faint gill arcs behind the head. Below, a dashed loop and a small clock show that it must come up again and again. Accent colour: coral red.`
- **Accuracy:** The red colour is on the rear scales and tail. The swim bladder sits along the back, above the gut. It surfaces roughly every 15 minutes; no numbers in the image.

#### leafcutter_farming: Do leafcutter ants eat leaves?

- **Reference:** `how-it-works/ant-fungus.png`
- **Prompt:** `DIAGRAM: A cross-section of ground. Above the surface on the left, a plant; leafcutter ants walk in a line towards a small nest mound, each holding a green leaf piece over its head. A tunnel leads down from the mound to a large underground chamber filled with a spongy white fungus garden. One ant inside the chamber eats from the fungus. A dashed arrow runs from the leaves to the fungus. Accent colour: coral red.`
- **Accuracy:** The ants feed the leaves to the fungus and eat the fungus; don't show ants eating leaves. Leafcutter workers are reddish-brown with three body segments and six legs.

#### poison_frog_diet: Where do poison dart frogs get their poison?

- **Reference:** `how-it-works/frog-diet.png`
- **Prompt:** `DIAGRAM: Two rows separated by a dashed line. Top row (in the wild): a leaf, an arrow, an ant and a tiny red mite, an arrow, and a brightly coloured poison frog with dark-red spots and two small toxin drops above it. Bottom row (in captivity): a fruit fly and a cricket, an arrow, and the same frog drawn pale and plain with no drops, next to a small crossed-out drop symbol. Accent colour: coral red.`
- **Accuracy:** The toxins come from the diet (ants and mites that likely get them from plants), not from the frog itself. Captive frogs on crickets and fruit flies aren't poisonous.

#### giant_water_lily: How can a giant water lily leaf carry so much weight?

- **Reference:** `how-it-works/lily-ribs.png`
- **Prompt:** `DIAGRAM: Left: a side view of a giant water lily leaf floating on water, flat with a low upturned rim; five small weights sit evenly spread across the top, each with a small downward arrow; under the thin leaf, ribs hang down with air pockets inside. Right: the leaf seen from underneath as a large circle in reddish-purple, with thick ribs radiating from the centre, rings of cross-ribs connecting them, small air-filled pockets and scattered spines. Accent colour: coral red.`
- **Accuracy:** The blade is very thin; the strength is in the rib network underneath. The load works only when spread evenly. The underside is reddish-purple and spiny.

## Everyday science myths (accent: amber)

#### blue_veins: Is the blood in your veins blue?

- **Reference:** `how-it-works/vein-light.png`
- **Prompt:** `DIAGRAM: A cross-section of skin: a thin pale outer layer over a thicker pink layer, with a small dark-red vein near the surface and a larger dark-red vein deeper down. A sun in the upper left sends two rays: a red ray travels deep into the skin to the deep vein; a blue ray enters only a little way, scatters (small blue dots) and bounces back up to an eye in the upper right. Above the shallow vein the skin has a faint reddish tint; above the deep vein a faint bluish tint. Accent colour: amber.`
- **Accuracy:** Blood is always red: both veins must be dark red, never blue. Red light reaches deeper than blue light.

#### falling_coin: Could a coin dropped from a skyscraper kill someone?

- **Reference:** `how-it-works/coin-drag.png`
- **Prompt:** `DIAGRAM: A tall skyscraper on the left. Beside it, a coin falls at four moments, top to bottom, with a speed arrow under each that grows at first and then stays the same length. At the lowest coin, an amber downward arrow (weight) and an equal teal upward arrow (air drag) balance. On the right, a simple graph: speed rises and then flattens into a level line, with a faint dashed line climbing steeply for a fall without air. Accent colour: amber.`
- **Accuracy:** The speed levels off (terminal velocity) after a short fall; the two forces at the bottom are equal. No numbers.

#### knuckle_cracking: Does cracking your knuckles cause arthritis?

- **Reference:** `how-it-works/knuckle-joint.png`
- **Prompt:** `DIAGRAM: A finger joint in cross-section: two bone ends with mint cartilage caps facing each other inside a joint capsule filled with pale-blue synovial fluid. Arrows on both bones point outwards as they are pulled apart. In the fluid between them, a gas cavity forms as a bubble. Golden sound arcs above the joint. Accent colour: amber.`
- **Accuracy:** The pop most likely comes from the cavity forming (MRI, 2015); this is still debated, so don't show a bursting bubble. No signs of arthritis or damage.

#### lightning_strikes_twice: Does lightning never strike the same place twice?

- **Reference:** `how-it-works/lightning-tower.png`
- **Prompt:** `DIAGRAM: Grey storm clouds along the top. On the right, a tall, isolated, pointed hill with a small statue with open arms on its peak; three lightning bolts (one bright, two fainter, as if at different times) all strike the statue. On a low hill on the left, a lone tree is struck by one bolt. Small houses in the valley between are not struck. A tally of strikes in the sky on the right. Accent colour: amber.`
- **Accuracy:** Height, a pointed shape and isolation decide where lightning lands, not metal. Keep the statue a simple silhouette.

#### microwave_inside_out: Do microwaves cook food from the inside out?

- **Reference:** `how-it-works/microwave-depth.png`
- **Prompt:** `DIAGRAM: A block of food cut in half, seen in cross-section: a hot amber outer band, a warm gold middle band and a cool pale-blue centre. Wavy golden microwave arrows come in from both sides and stop in the outer band. Small dashed teal arrows point inwards from the warm band to the cool centre (heat spreading by conduction). In the lower right corner, a water molecule (one red atom, two white atoms) with a curved arrow showing it spinning. Accent colour: amber.`
- **Accuracy:** Microwaves reach only the outer few centimetres; the centre warms later by conduction. Never show the centre hotter than the outside.

#### mpemba_effect: Does hot water freeze faster than cold?

- **Reference:** `how-it-works/mpemba-cups.png`
- **Prompt:** `DIAGRAM: Left: a freezer compartment holding two glasses, one of hot amber water with steam and one of cold teal water, with a small snowflake. Right: a simple graph of two temperature curves falling towards a dashed freezing line, the hot one starting higher; where they approach the line, a soft grey uncertain zone shows that they may or may not cross. Accent colour: amber.`
- **Accuracy:** The effect is disputed: don't show the hot water clearly winning. No numbers or words.

#### radioactive_foods: Are bananas and Brazil nuts radioactive?

- **Reference:** `how-it-works/radium-roots.png`
- **Prompt:** `DIAGRAM: A Brazil nut tree in the centre, its very wide, spreading roots reaching through the soil, which holds scattered tiny amber particles (radium). Some particles sit on the roots, and a dashed arrow runs up the trunk to a round woody pod in the canopy; beside it, an opened pod with nuts. On the left, a banana with a few tiny amber dots for its trace of radioactive potassium. Accent colour: amber.`
- **Accuracy:** The doses are tiny: no warning symbols, glowing or danger signs. The pod is a hard round shell holding the nuts.

## Brazil's three capitals (accent: brown)

#### salvador_first_capital: Why was Salvador Brazil's first capital?

- **Reference:** `how-it-works/salvador-cliff.png`
- **Prompt:** `DIAGRAM: Salvador in cross-section, 1600s style. On the left, the sea with a sailing ship. At sea level, the Lower Town with warehouses by the port. A steep escarpment rises to the Upper Town on top: houses, a church with two towers and a fortified building. A tall lift shaft with a cabin connects the two levels, and a dashed double arrow beside the cliff shows the height. In the upper-left corner, an inset map shows the city on a peninsula between a bay and the open ocean. Accent colour: brown.`
- **Accuracy:** The Upper Town sits on an escarpment about 85 m high above the Lower Town and port. The peninsula lies between the Bay of All Saints and the Atlantic.

#### rio_capital_1763: Why did the capital move to Rio in 1763?

- **Reference:** `how-it-works/gold-route.png`
- **Prompt:** `DIAGRAM: A schematic map with land on the left and the ocean on the right. Inland, green mountains with gold nuggets (Minas Gerais). A dashed teal route runs from the mines down to a port on the coast (Rio, with a small rounded peak beside it), and a sailing ship heads out to sea to the right. Further up the coast, a faded crown marks Salvador; a dashed brown arrow carries the crown down to Rio, where a bright crown sits. Accent colour: brown.`
- **Accuracy:** Minas Gerais is inland and north of Rio; Salvador is far to the north on the coast. No names on the map.

#### court_in_rio_1808: How did Rio become the capital of a European empire?

- **Reference:** `how-it-works/court-crossing.png`
- **Prompt:** `DIAGRAM: A schematic map of the Atlantic: Brazil's coast on the left, Portugal at the top right. A brown arrow presses into Portugal from the east (the invasion). A dashed route of a small fleet of sailing ships crosses the ocean from Lisbon, stops at Salvador, then continues south to Rio de Janeiro, where a gold crown sits. Accent colour: brown.`
- **Accuracy:** The court reached Salvador in January 1808 and Rio in March. No portraits or flags.

#### inland_capital_idea: When did the idea of an inland capital begin?

- **Reference:** `how-it-works/inland-plateau.png`
- **Prompt:** `DIAGRAM: A schematic map of Brazil on a pale-blue sea. A coastal city marker on the south-east coast, and a dashed teal arrow moving inland from it to the central plateau, where a dashed brown rectangle marks out an area with a small flat-topped plateau and a gold star inside. Two rivers cross the country. Near the bottom, a surveyor's theodolite on a tripod. Accent colour: brown.`
- **Accuracy:** The outline should be recognisably Brazil. The marked area (the Cruls Quadrilateral) sits in the middle of the country, where Brasília is today.

#### building_brasilia: How was Brasília built so fast?

- **Reference:** `how-it-works/brasilia-build.png`
- **Prompt:** `DIAGRAM: A building site on the red earth of the central plateau under a strong sun. A truck full of workers drives in from the left. A tall crane lifts a load. In the middle, the twin towers of the National Congress rise inside scaffolding; on the right, the shallow bowl and the dome of the Congress stand on a low platform. Small worker figures walk around. In the top right, a row of twelve small blocks, ten filled in, shows the work nearly done. Accent colour: brown.`
- **Accuracy:** The Congress has two tall towers, a bowl facing up and a dome facing down. Workers came largely from the Northeast; keep figures small and generic.

#### brasilia_plan_shape: Why is Brasília shaped like an airplane?

- **Reference:** `how-it-works/plano-piloto.png`
- **Prompt:** `DIAGRAM: A schematic top view of the Plano Piloto: a straight brown axis running left to right (the Monumental Axis) crossed by a long curved teal axis (the Road Axis) forming the "wings". Small mint residential blocks line both sides of the curved axis; small white buildings line the straight one; a gold triangle at its right end marks the Square of the Three Powers. Lake Paranoá curves around the right side. A faint dashed straight line through the crossing shows the original straight cross, with a small dashed arrow showing how it was bent. Accent colour: brown.`
- **Accuracy:** The plan began as two axes crossing at a right angle; one was bent to fit the terrain. Don't draw an actual airplane.

## Where your attention goes (accent: purple)

#### cocktail_party_effect: How do you hear your own name across a noisy room?

- **Reference:** `how-it-works/name-filter.png`
- **Prompt:** `DIAGRAM: On the left, a cloud of faded grey speech bubbles. One bright purple bubble holds a gold star (standing for your name). On the right, a head in profile, facing left, with an ear and a funnel-shaped filter inside the head. Dotted grey lines from the faded bubbles stop before the head; a solid purple arrow carries the star bubble into the head and lights up a spot above the filter. Accent colour: purple.`
- **Accuracy:** Ignored sound is still partly processed; the name gets through. No letters in the bubbles.

#### invisible_gorilla: How did half the viewers miss a gorilla?

- **Reference:** `how-it-works/gorilla-count.png`
- **Prompt:** `DIAGRAM: A simple court with six small players, three in white shirts and three in black. Purple dashed arcs show the white team passing two orange balls between them, and a small purple tally in the top left counts the passes. In the middle of the scene, a large gorilla figure stands drawn faint and see-through with a dashed outline, as if unnoticed. Accent colour: purple.`
- **Accuracy:** Only the white team's passes are counted. The gorilla is right in the middle of the scene, not hidden.

#### multitasking_switching: Can you really do two things at once?

- **Reference:** `how-it-works/task-switch.png`
- **Prompt:** `DIAGRAM: At the top, two task cards: on the left, simple maths symbols; on the right, a triangle, a square and a circle. Between them, two small gears (switching goals, then rules). Below, two timelines: the top one is one long purple block then one long teal block; the bottom one alternates short purple and teal blocks with small grey gaps between them and ends later. A dashed line and a purple arrow show the extra time. Accent colour: purple.`
- **Accuracy:** The grey gaps are the switch costs; the switching timeline must end later than the one-task-at-a-time timeline.

#### saccadic_suppression: Why don't you see the world blur when your eyes jump?

- **Reference:** `how-it-works/saccade-blink.png`
- **Prompt:** `DIAGRAM: A wide landscape panel with two target dots, left and right, and a purple arc arrow showing the gaze jumping from one to the other. The middle of the panel is smeared and darkened, as the blurred view during the jump. Below, an eye, and under it a timeline bar: teal (seeing), then a dark segment (vision switched off) that starts just before a small dashed marker for the start of the eye movement, then teal again. Accent colour: purple.`
- **Accuracy:** The suppression starts slightly before the eye begins to move.

#### stopped_clock_illusion: Why does a clock's second hand seem to stop when you glance at it?

- **Reference:** `how-it-works/clock-stretch.png`
- **Prompt:** `DIAGRAM: An eye on the left with a dashed teal arrow jumping to an analogue clock on the right, its purple second hand pointing down to the right. Below, a timeline of seconds: the first block (purple) is about twice as long as the three teal blocks after it. A curved purple arrow points backwards from the first block to a dashed marker before it, showing the image stretched back in time. Accent colour: purple.`
- **Accuracy:** Only the first second after the glance seems longer; the following seconds are normal.

#### time_slows_fear: Does time really slow down when you're scared?

- **Reference:** `how-it-works/fall-memory.png`
- **Prompt:** `DIAGRAM: On the left, a tall free-fall tower; a small figure falls backwards, lying flat, towards a net at the bottom. A small wrist display beside it shows flickering bars. On the right, two film strips starting at the same point: the top one, "what happened", has four frames; the bottom one, "what is remembered", is longer and packed with more frames. A golden arrow marks the extra length. Accent colour: purple.`
- **Accuracy:** The memory is longer (about a third), not the experience itself. No numbers on the display.

## The Moon shapes Earth (original lessons, accent: blue)

#### moon_tidal_locking: Why does the Moon always show the same face?

- **Reference:** `how-it-works/moon-face.png`
- **Prompt:** `DIAGRAM: Earth in the centre of a dashed circular orbit, with the Moon drawn at four points around it (top, right, bottom, left). On each Moon the same dark patch faces Earth. Accent colour: blue.`
- **Accuracy:** At every position the same side faces Earth, so the patch turns a quarter turn each time.

#### tides: Why are there two high tides a day?

- **Reference:** `how-it-works/tides.png`
- **Prompt:** `DIAGRAM: Earth on the left inside a pale mint oval of ocean that bulges out on both sides along the line to the Moon; the Moon on the right with a small arrow pointing towards Earth. Accent colour: blue.`
- **Accuracy:** Two bulges, one facing the Moon and one on the far side, of equal size. Not to scale; don't add the Sun.

#### day_lengthening: Are Earth's days getting longer?

- **Reference:** `how-it-works/day-length.png`
- **Prompt:** `DIAGRAM: Earth on the left with a clock face on it; the Moon on the right with an arrow pointing away from Earth, showing it slowly drifting outward; a dotted curve below between them for the tidal pull that brakes Earth's spin. Accent colour: blue.`
- **Accuracy:** The day lengthens by about 2 milliseconds per century; keep the change subtle, no numbers.

#### eclipses_rare: Why isn't there an eclipse every month?

- **Reference:** `how-it-works/eclipse.png`
- **Prompt:** `DIAGRAM: The Sun on the left with a soft glow, the Moon in the middle and Earth on the right, in a line, with a faint shadow cone from the Moon reaching Earth and a small dark spot where it lands. Add a faint tilted orbit line for the Moon to show it usually passes above or below the line. Accent colour: blue.`
- **Accuracy:** The Moon's orbit is tilted about 5°; eclipses only happen when it crosses near the Sun–Earth line. Not to scale.

## How memory works (original lessons, accent: purple)

#### forgetting_curve: How fast do you forget?

- **Reference:** `how-it-works/forgetting-curve.png`
- **Prompt:** `DIAGRAM: A simple graph: a faint dashed curve that drops steeply then levels out, and over it a bold teal sawtooth line that drops, jumps back up at three review points (marked with small mint circles) and drops more gently each time. Accent colour: purple.`
- **Accuracy:** Forgetting is fastest at first, then flattens; each review slows it. No numbers or axis labels.

#### spacing_effect: Why does spacing out your study work better?

- **Reference:** `how-it-works/spacing.png`
- **Prompt:** `DIAGRAM: A wall calendar with a grid of days; a few study sessions are marked on separate, spread-out days in teal and purple, the rest of the days empty. Accent colour: purple.`
- **Accuracy:** The sessions must be spread out, not grouped together. No dates.

#### testing_effect: Why does trying to remember teach more than rereading?

- **Reference:** `how-it-works/recall.png`
- **Prompt:** `DIAGRAM: A tilted card with a question mark on the left, a dashed teal path leading to a glowing purple spark inside a mint circle on the right (the memory being retrieved), with two short lines below it. Accent colour: purple.`
- **Accuracy:** The idea is active recall before checking, not rereading. No text on the card.

#### retrieval_cues: Why can a cue bring a memory back?

- **Reference:** `how-it-works/cue.png`
- **Prompt:** `DIAGRAM: A purple label tag on the left, a dashed teal line leading to a set of six drawers on the right; one drawer is pulled open and highlighted in mint, the others closed. Accent colour: purple.`
- **Accuracy:** The cue leads to one memory among many stored ones.

#### sleep_memory: What does your brain do with your memories while you sleep?

- **Reference:** `how-it-works/sleep.png`
- **Prompt:** `DIAGRAM: A purple crescent moon on the left with a few small "z" shapes drawn as simple zigzags; on the right, a small network of mint nodes joined by teal lines, as memories being linked during sleep. Accent colour: purple.`
- **Accuracy:** Keep it suggestive: researchers still debate how replay during sleep works. Draw the "z" marks as shapes, not letters.

## Kitchen chemistry (original lessons, accent: amber)

#### maillard_reaction: Why do bread, steak and coffee turn brown and smell so good?

- **Reference:** `how-it-works/maillard.png`
- **Prompt:** `DIAGRAM: A golden-brown loaf of bread on the left with a few small aroma molecules rising above it; a cup of coffee on the right with steam. Accent colour: amber.`
- **Accuracy:** Browning needs dry surface heat above about 140 °C; don't show boiling water. No numbers.

#### onion_tears: Why does cutting onions make you cry?

- **Reference:** `how-it-works/onion.png`
- **Prompt:** `DIAGRAM: A cut onion on the left releasing small mint puffs of gas that drift right towards an eye, with a single tear below the eye. Accent colour: amber.`
- **Accuracy:** The gas forms only once the onion's cells are cut. Show the eye alone, not a face.

#### salt_boiling: Does salt make pasta water boil faster?

- **Reference:** `how-it-works/salt-pot.png`
- **Prompt:** `DIAGRAM: A pot of water with a few bubbles at the surface; on the right, a salt shaker with grains falling towards the water. Accent colour: amber.`
- **Accuracy:** Salt slightly raises the boiling point; the burst of bubbles when it goes in comes from grains giving bubbles places to form. Don't suggest it boils faster.

#### altitude_boiling: Why does water boil below 100 °C up a mountain?

- **Reference:** `how-it-works/mountain-pot.png`
- **Prompt:** `DIAGRAM: A mountain with a small pot steaming near its snowy peak; on the right, a thermometer whose level sits below the top mark. Accent colour: amber.`
- **Accuracy:** Lower air pressure up high means water boils at a lower temperature (about 92 °C at 2,300 m). No numbers in the image.

## The body renews itself (original lessons, accent: coral red)

#### red_blood_cells: How long does a red blood cell live?

- **Reference:** `how-it-works/red-cell.png`
- **Prompt:** `DIAGRAM: A blood vessel running across the image with five red blood cells flowing through it, each a disc with a shallow dip in the middle, at different angles. Accent colour: coral red.`
- **Accuracy:** Red blood cells are discs dimpled on both sides, with no nucleus.

#### bone_remodeling: Is your skeleton alive?

- **Reference:** `how-it-works/bone.png`
- **Prompt:** `DIAGRAM: A long bone with rounded ends; along its middle, small hexagonal cells in two colours, some removing old tissue and some laying down new, with a curved teal arrow below showing the cycle. Accent colour: coral red.`
- **Accuracy:** Osteoclasts remove old bone and osteoblasts build new matrix; it's a continuing cycle.

#### seven_year_myth: Does your entire body replace itself every seven years?

- **Reference:** `how-it-works/renewal.png`
- **Prompt:** `DIAGRAM: A simple human figure with a few coloured spots for different tissues, and two circular arrows on either side turning at different sizes, showing different renewal speeds. Accent colour: coral red.`
- **Accuracy:** Renewal follows many different timetables, from days to a lifetime; there is no single seven-year cycle.

#### skin_renewal: Where does your old skin go?

- **Reference:** `how-it-works/skin-layers.png`
- **Prompt:** `DIAGRAM: Layers of skin cells: round new cells at the base, flatter cells above them, thin flat cells near the surface and a few flakes lifting off the top; a dashed teal arrow on the right points upwards. Accent colour: coral red.`
- **Accuracy:** New cells form at the base of the epidermis, move up, flatten and flake off.

#### stomach_lining: Why doesn't your stomach digest itself?

- **Reference:** `how-it-works/stomach.png`
- **Prompt:** `DIAGRAM: A stomach shape with a mint protective layer of mucus lining its inner wall and a few amber acid drops inside, kept away from the wall by the layer. Accent colour: coral red.`
- **Accuracy:** The mucus layer (with bicarbonate) protects the lining; surface cells are replaced within days.

## The Portuguese language in Brazil (original lessons, accent: brown)

#### tordesillas: Why does Brazil speak Portuguese rather than Spanish?

- **Reference:** `how-it-works/tordesillas.png`
- **Prompt:** `DIAGRAM: An old parchment map of South America split by a dashed vertical line; a small compass rose in the lower right. Accent colour: brown.`
- **Accuracy:** The 1494 line ran north–south, 370 leagues west of Cape Verde; Portugal's side was the east. No words on the map.

#### lingua_geral: What language did colonial São Paulo speak?

- **Reference:** `how-it-works/lingua-geral.png`
- **Prompt:** `DIAGRAM: Two speech bubbles, one brown and one mint, above a winding river. Add a small colonial village with a whitewashed chapel on the riverbank below the bubbles. Accent colour: brown.`
- **Accuracy:** The bubbles must hold no letters. The general language was rooted in Tupi and was a contact language.

#### pombal_directorate: How did the Crown try to impose Portuguese in Brazil?

- **Reference:** `how-it-works/decree.png`
- **Prompt:** `DIAGRAM: An official document with faint unreadable lines of text and a red wax seal with ribbons, and a quill beside it. Accent colour: brown.`
- **Accuracy:** The lines must be illegible marks, not words.

#### tupi_words: Which everyday Portuguese words came from Tupi?

- **Reference:** `how-it-works/tupi-words.png`
- **Prompt:** `DIAGRAM: A pineapple (abacaxi) and a toucan side by side, in a friendly, simple style. Accent colour: brown.`
- **Accuracy:** No written words: the objects stand for the words. A toco toucan has a black body, a white throat and a large orange beak (the reference draws it brown).
