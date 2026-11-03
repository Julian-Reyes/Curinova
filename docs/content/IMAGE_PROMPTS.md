# Image prompts for the 22 sample lessons

ChatGPT prompts for every lesson picture slot, for the founder to generate, pick and approve before `pnpm media:add` processes anything. Pictures for historical subjects stay real: they get search briefs instead of prompts.

## How to use

1. Start a new ChatGPT chat and paste the **house style** below once.
2. Paste one prompt at a time. Regenerate until it looks right, then download it.
3. Name the file `<lesson>_<slot>.png` (e.g. `tides_discover.png`) and put it in one folder. If the subject would sit behind the Discover title, name it `tides_discover-up20.png` to shift it up 20%.
4. Check the **accuracy notes** before keeping an image. AI pictures get no visible credit, but they still have to be correct.
5. Run `pnpm media:add <folder>`, then fill in alt text (pt-BR and en) and the origin: `{ "kind": "generated", "tool": "ChatGPT (Plus)", "createdBy": "Founder", "createdAt": "<date>" }`.

**Slots:** _Discover_ is the full-screen card (9:16, with white title text over the bottom). _Deeper_ is the Go Deeper hero (cropped to 12:7). _Review_ is the image above a quiz question (cropped to 16:9) and **must not give the answer away**. The image now also shows on the quiz after each lesson.

## House style (paste once per chat)

```text
You'll make a series of images for a science-learning app for curious adults. House style for every image:
- Realistic, cinematic digital illustration, like a still from a high-end nature or science documentary. Rich but natural colour, soft directional light, shallow depth of field, one clear subject, uncluttered background.
- Absolutely no text, letters, numbers, labels, arrows, logos, watermarks, borders or UI. If paper, books, screens or calendars appear, their marks are blurred and illegible.
- No recognisable faces. People, if any, are seen from behind, in silhouette or as hands only.
- Scientifically accurate. Don't add things I didn't ask for.
I'll ask for three formats:
- DISCOVER: tall portrait (1024×1536 or taller). Subject in the upper half. The bottom 40% must be dark, simple and calm, because white text goes there; the very top is also darker.
- DEEPER: wide landscape (1536×1024). Subject centred, nothing important near the top or bottom edge.
- REVIEW: wide landscape (1536×1024). One simple, centred subject that reads well small.
Reply only with the image.
```

## Space

### moon_tidal_locking — Why does the Moon always show the same face?

- **Discover:** keep the telescope photo (real, works well).
- **Deeper** (optional; current AI image is fine): `DEEPER: The Moon and Earth seen from deep space, the Moon in the foreground at three-quarter phase, Earth small and blue in the distance, black starry sky.`
- **Review:** keep. If redone: `REVIEW: The full Moon's near side, sharp crater detail, on a deep navy sky.` _Don't show the far side lit (that's an answer)._

### tides — Why are there two high tides a day?

- **Discover:** `DISCOVER: A rocky coastline at dusk at high tide, waves washing over dark rocks, a large Moon rising low over the sea in the upper part of the frame, the lower part dark water fading to near-black.`
- **Deeper:** keep the Bay of Fundy photo.
- **Review:** keep the Bay of Fundy shore. _Don't show the Sun and Moon aligned (the spring-tide answer)._

### day_lengthening — Are Earth's days getting longer?

- **Discover:** `DISCOVER: Earth seen from orbit at sunrise: a thin glowing line of dawn along the curved horizon, the night side below fading into darkness, a few faint city lights.`
- **Deeper:** `DEEPER: Close-up of a fossil horn coral (Devonian rugose coral) lying on dark stone, its outer wall showing many fine, closely spaced horizontal growth ridges, raking side light that makes the ridges stand out.` _Accuracy: a solitary horn-shaped coral with fine growth lines, not a modern branching reef coral._
- **Review:** `REVIEW: A stone sundial in a garden at late afternoon, its shadow stretching long across the dial, warm low sun.` _Don't show the Moon or tides (that's the answer)._

### eclipses_rare — Why isn't there an eclipse every month?

- **Discover:** `DISCOVER: A total solar eclipse high in a deep blue-black sky: the Moon's black disc with the Sun's white, wispy corona around it. Below, a dark silhouetted hilltop landscape under an eerie twilight horizon.` _Accuracy: the corona is white and feathery, the disc fully black, with a faint orange glow along the horizon all round._
- **Deeper:** keep the 1919 Sobral photo (historical, real).
- **Review:** `REVIEW: A thin crescent Moon low in a clear dusk sky over a calm sea, the first stars appearing.` _Don't show Sobral, orbits or diagrams (both are answers)._

## Body & Biology

### red_blood_cells — How long does a red blood cell live?

- **Discover / Deeper / Review:** keep the current AI images. If redone:
  - `DISCOVER: Inside a blood vessel: many red blood cells drifting towards the viewer, each a smooth red disc with a shallow dip in the centre on both sides, soft warm backlight, the bottom of the frame dark red to black.` _Accuracy: biconcave discs with no nucleus; no spikes or bumps._
  - `REVIEW: Four red blood cells floating against a soft dark-red background, smooth discs dipped in the middle.` _Don't show bone or bone marrow (that's an answer)._

### bone_remodeling — Is your skeleton alive?

- **Discover** (missing): `DISCOVER: A macro view inside spongy bone: a lattice of ivory-coloured struts and plates (trabecular bone) lit like a cave, warm light from above, the lower part in deep shadow.` _Accuracy: an irregular honeycomb-like lattice, not a regular grid._
- **Deeper / Review:** keep the current AI femur images.

### skin_renewal — Where does your old skin go?

- **Discover:** keep the skin close-up photo, or `DISCOVER: Extreme close-up of the back of a human hand in warm side light, fine skin grooves and tiny hairs visible, the lower part fading into shadow.`
- **Deeper:** keep the microscope section.
- **Review** (missing): `REVIEW: A forearm resting in soft sunlight on a linen sheet, the skin texture gently visible.` _Don't show a layered cross-section (that's an answer)._

### stomach_lining — Why doesn't your stomach digest itself?

- **Discover:** `DISCOVER: A stylised journey inside the stomach: soft pink folds of lining (rugae) glistening under a thin clear layer of mucus, lit from above like a cave, the lower part falling into darkness.` _Accuracy: folded, moist pink lining; no teeth, no acid "flames"._
- **Deeper:** keep the micrograph.
- **Review:** `REVIEW: A realistic anatomical model of a human stomach, J-shaped, on a dark background, soft studio light.` _Don't show glistening mucus or cells (that's the answer)._

### seven_year_myth — Does your entire body replace itself every seven years?

- **Discover / Deeper / Review:** keep the current AI images.

## Brain & Mind

### forgetting_curve — How fast do you forget?

- **Discover:** keep the current AI image, or `DISCOVER: An old leather notebook open on a desk at night, the illegible ink handwriting on its pages fading and lifting off as fine dust into the lamplight above.`
- **Deeper:** keep the current AI desk scene.
- **Review:** `REVIEW: An hourglass on a wooden desk, sand mid-fall, warm lamplight, dark background.` _Don't show lists or "saved effort" (that's an answer)._

### spacing_effect — Why does spacing out your study work better?

- **Discover:** `DISCOVER: A paper wall calendar seen at an angle in morning light, blank day squares with no numbers, a few days spread far apart marked with small coloured dots, a pencil hanging on a string, the lower part in soft shadow.`
- **Deeper:** keep the calendar photo, or `DEEPER: A study desk by a window across several days, shown as one scene with the same open notebook in morning, afternoon and evening light falling across it.`
- **Review:** `REVIEW: A desk lamp lighting an open notebook on a dark wooden desk at night.` _No calendars (that's an answer)._

### testing_effect — Why does trying to remember teach more than rereading?

- **Discover:** `DISCOVER: A hand turning over a blank index card above a small stack of cards on a dark desk, warm lamplight on the card, everything below falling into shadow.`
- **Deeper:** keep the classroom photo.
- **Review:** `REVIEW: A neat stack of index cards face down on a wooden desk beside a pencil, soft daylight.` _Don't show a closed book next to a thinking person (that's the answer)._

### retrieval_cues — Why can a cue bring a memory back?

- **Discover / Deeper:** keep the card-catalogue photos.
- **Review** (missing): `REVIEW: A hand with a red string tied around the index finger, resting on a wooden table, soft daylight.`

### sleep_memory — What does your brain do with your memories while you sleep?

- **Discover:** keep _The Sleeping Student_ (a real painting).
- **Deeper:** `DEEPER: A dim bedroom at night, moonlight through the window falling across a bed where a person sleeps seen from behind, a closed book on the nightstand.`
- **Review:** `REVIEW: A quiet city at night seen from a high window, a few lit windows, a crescent Moon.` _Don't show studying in bed (that's an answer)._

## Everyday Science

### altitude_boiling — Why does water boil below 100 °C up a mountain?

- **Discover:** `DISCOVER: A small pot of water boiling on a camping stove at a high mountain campsite at dawn, steam rising, snowy peaks glowing pink behind it in the upper part, the foreground rocks dark.`
- **Deeper:** `DEEPER: A mountain cabin kitchen: a pot of beans simmering on a wood stove, a window behind showing snowy peaks.`
- **Review:** keep Pico da Neblina, or `REVIEW: Snow-capped mountain peaks above a sea of clouds at sunrise.` _No pressure cooker (that's an answer)._

### maillard_reaction — Why do bread, steak and coffee turn brown and smell so good?

- **Discover:** `DISCOVER: A crusty loaf of bread just out of the oven on a dark wooden board, golden-brown crust with deep cracks, wisps of steam rising in warm backlight, the bottom of the frame dark.`
- **Deeper:** `DEEPER: Coffee beans mid-roast tumbling in a drum roaster, a mix of tan, light-brown and dark-brown beans, warm light.`
- **Review:** keep the toast photo, or `REVIEW: A steak searing in a cast-iron pan, its surface deep golden-brown, light smoke.` _Don't show boiled meat or caramel (both answers)._

### onion_tears — Why does cutting onions make you cry?

- **Discover:** `DISCOVER: Macro of a knife slicing through a yellow onion on a dark board, a fine mist of tiny droplets caught in backlight above the cut, the lower part in darkness.`
- **Deeper:** `DEEPER: A halved red onion on a wooden board showing its concentric layers, glistening cut surface, soft side light.`
- **Review:** `REVIEW: Three whole, uncut yellow onions on a kitchen counter in daylight.` _Don't show blades or cutting speed (that's an answer)._

### salt_boiling — Does salt make pasta water boil faster?

- **Discover:** `DISCOVER: A hand sprinkling coarse salt from above into a large pot of water on a gas stove, steam rising, backlit in a dark kitchen, the lower part of the frame dark.`
- **Deeper:** `DEEPER: Extreme macro of coarse salt crystals, clear cubic shapes, on a dark slate surface, cool light.` _Accuracy: table salt crystals are cubes._
- **Review:** `REVIEW: A pot of still, unheated water on a stove beside a small bowl of salt.` _Don't show salt making bubbles foam up (that's an answer)._

## History (real images, no AI)

These stay real. For each Discover slot, look for a **portrait-oriented** public-domain or CC image (taller than wide) on Wikimedia Commons, Biblioteca Nacional Digital or Brasiliana. Record the creator, license and https URL. Search terms only, no specific files: check each find yourself.

| Lesson               | Discover (portrait) idea                                                     | Search terms                                                                                              | Review: avoid                                               |
| -------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `tordesillas`        | A page of the treaty manuscript, or a portrait-shaped detail of an old chart | "Tratado de Tordesilhas manuscrito", "Cantino planisphere" (crop to Brazil)                               | The dividing line or a map split between Portugal and Spain |
| `pombal_directorate` | Portrait of the Marquis of Pombal (already portrait-shaped)                  | "Marquês de Pombal retrato", "Directório dos Índios 1758"                                                 | The text of the Directorate                                 |
| `lingua_geral`       | A colonial-era view of São Paulo or the Tietê in a tall format               | "São Paulo colonial pintura", "rio Tietê século XIX", "Benedito Calixto"                                  | Anything naming Tupi, São Vicente or Nheengatu              |
| `tupi_words`         | Real photo or AI (nature, not historical): a capybara by a riverbank         | AI: `DISCOVER: A capybara standing at a riverbank among water plants at dusk, the lower part dark water.` | Popcorn (pipoca) or stones ("ita"): both answers            |

For `tordesillas`, the current Discover and Deeper images are AI-generated ships flagged in M2.5 for period accuracy (Portuguese ships c. 1500). Replace them with real images or keep them only after that check.
