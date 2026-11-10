# Autumn Lake Healthcare brand ad — plan and storyboard

Source IDs (C1…C12, S1…S9) refer to `docs/research.md`.

## Concept: "Good care. Good times."

The company's own copy pairs two ideas in almost every sentence: professional
standards and personal warmth ("clinical excellence and compassionate care",
"havens of hospitality", "here you'll find family"). The ad is built on that
pairing and pays it off with the tagline that says the same thing in four
words: **Good care. Good times.**

The logo's tree is the visual thread. It grows leaf by leaf in the opening,
sits as a watermark behind the type the way it does on the website, lends its
leaf shape to bullets and accents, and reassembles for the sign-off.

## Audience

- **Primary:** adult children and spouses choosing short-term rehabilitation
  or long-term care for a family member in Connecticut, New Jersey, Maryland,
  West Virginia or Wisconsin.
- **Secondary:** hospital discharge planners and referral partners;
  prospective team members.
- **What they should leave with:** these centers treat care and warmth as one
  thing, there is one near me, and here is where to look.

## Format

- 1920×1080, 30 fps, 58.7 s (1,760 frames), H.264 MP4.
- No voiceover or music was supplied, so the film is designed to work silent:
  kinetic type carries the message and the caption track carries the narration
  script (ready to be recorded later).
- **Beat grid:** every cut and accent sits on a 90 BPM grid (1 beat = 20
  frames, 1 bar = 4 beats = 2.67 s). Every scene is a whole number of bars or
  half bars. If
  a music file is added to `assets/music`, set `BPM` in `src/theme/timing.ts`
  to the track's tempo and the whole film re-times to it.

## Narrative arc

| Act | Scenes | Job |
|-----|--------|-----|
| Open | 1 | Establish the brand: the tree grows. |
| Belief | 2–3 | What the centers stand for: holistic healing; clinical excellence + compassionate care. |
| Proof | 4–6 | What that looks like: services, the team, the network of centers. |
| Heart | 7–8 | The emotional turn ("family") and the tagline payoff. |
| Close | 9 | Call to action, logo, disclaimer. |

## Shot-by-shot

Times are start–end. "Beat n" counts from the start of the scene.

### 1 · Logo intro — 0:00–0:05.3 (8 beats) — `src/scenes/LogoIntro.tsx`
- **Frame:** soft paper-white background, logo centered.
- **Motion:** the ground line sweeps out from the center; the trunk grows
  upward; 34 leaves spring open from the trunk outward; "AUTUMN LAKE" rises
  letter by letter; "HEALTHCARE" fades up. Slow push-in throughout.
- **Text:** logo only. **Caption:** none.
- **Out:** maroon panels wipe up.

### 2 · Belief — 0:05.3–0:10.7 (8 beats) — `src/scenes/Belief.tsx`
- **Frame:** deep maroon, tree watermark drifting behind.
- **Text (C1):** label "OUR PHILOSOPHY"; headline "The healing process /
  should be / holistic."
- **Motion:** words rise through a mask one at a time; "holistic." lands on
  beat 4 in orange with a hand-drawn underline.
- **Caption 1.** **Out:** white panels wipe from the left.

### 3 · Cornerstones — 0:10.7–0:16.0 (8 beats) — `src/scenes/Cornerstones.tsx`
- **Frame:** paper-white.
- **Text (C2):** two blocks, "Clinical excellence" (maroon) and
  "Compassionate care" (orange); then "The cornerstones of each Autumn Lake
  Healthcare center."
- **Motion:** the blocks slide in from opposite sides and lock together on
  beat 1.5 with a small impact; the supporting line reveals on beat 3.5.
- **Caption 2.** **Out:** peach panels wipe from the right.

### 4 · Services — 0:16.0–0:24.0 (12 beats) — `src/scenes/Services.tsx`
- **Frame:** paper background, three white cards.
- **Text (C3, C4):** label "COMPREHENSIVE CARE SERVICES"; cards "Short-term
  rehabilitation", "Long-term care", "Personalized treatment plans"; footer
  "Focused on supporting recovery, comfort, and overall wellness."
- **Motion:** cards rise on beats 1, 2 and 3, each with a leaf bullet that
  springs open and an accent bar that draws; the footer line reveals on beat
  5; on beats 7, 8 and 9 the words "recovery", "comfort" and "wellness" are
  underlined in turn.
- **Captions 3–4.** **Out:** orange panels wipe up.

### 5 · Team — 0:24.0–0:30.7 (10 beats) — `src/scenes/Team.tsx`
- **Frame:** brand orange.
- **Text (C5):** "Doctors." "Therapists." "Specialists." then "A comprehensive
  team" / "devoted to creating personalized havens of hospitality."
- **Motion:** the three roles rise in on beats 0, 1 and 2, stacked large; on
  beat 4 they clear and return as a small label row above "A comprehensive
  team"; "havens of hospitality." is underlined on beat 7.
- **Captions 5–6.** **Out:** maroon panels wipe from the left.

### 6 · Network — 0:30.7–0:40.0 (14 beats) — `src/scenes/Network.tsx`
- **Frame:** maroon, text on the left, a large rounded photo card on the right
  sitting on an offset orange panel (echoing the homepage layout).
- **Text (C6):** label "MEET AUTUMN LAKE HEALTHCARE"; headline "A network of
  independent nursing homes and rehabilitative care centers"; the five states.
- **Imagery (C12):** five center exteriors, a new photo every 2.5–3 beats,
  each with a slow push.
- **Motion:** states appear one per beat from beat 5, each with a leaf bullet.
- **Captions 7–8.** **Out:** white panels wipe from the right.

### 7 · Family — 0:40.0–0:45.3 (8 beats) — `src/scenes/Family.tsx`
- **Frame:** paper-white, a few logo leaves drifting.
- **Text (C7):** "There are many healthcare groups," / "but here you'll find" /
  "family."
- **Motion:** the first line reveals word by word, the second on beat 2;
  "family." lands large in orange on beat 4 with an underline.
- **Caption 9.** **Out:** brick-to-maroon panels wipe up.

### 8 · Tagline — 0:45.3–0:50.7 (8 beats) — `src/scenes/Tagline.tsx`
- **Frame:** maroon-to-brick gradient (the homepage hero color).
- **Text (C8):** the official "Good care. Good times." lettering.
- **Motion:** "Good care." writes on across beats 0–2, "Good times." across
  beats 2–4, the swoosh on beat 4; slow push-in.
- **Caption 10.** **Out:** white panels wipe from the left.

### 9 · Call to action and logo outro — 0:50.7–0:58.7 (12 beats) — `src/scenes/CallToAction.tsx`
- **Frame:** white.
- **Text:** logo; "Find a center near you"; button "AutumnLakeHealthcare.com"
  (C9); "732-358-6883" (C10); footer disclaimer (C11).
- **Motion:** the logo reassembles quickly (same language as the intro);
  headline, button and phone number arrive on beats 3, 4 and 5; the disclaimer
  fades in on beat 6; a single highlight crosses the button on beat 7; the
  frame then holds to the end.
- **Caption 11** (clears before the disclaimer appears).

## Narration script (also the caption track)

1. We maintain that the healing process should be holistic.
2. Clinical excellence and compassionate care are the cornerstones of each
   Autumn Lake Healthcare center.
3. These centers provide comprehensive care services, including short-term
   rehabilitation and long-term care,
4. focused on supporting recovery, comfort, and overall wellness.
5. Doctors, therapists, and specialists comprise a comprehensive team
6. devoted to creating personalized havens of hospitality.
7. Autumn Lake Healthcare maintains a network of independent nursing homes and
   rehabilitative care centers
8. across Connecticut, New Jersey, Maryland, West Virginia and Wisconsin.
9. There are many healthcare groups, but here you'll find family.
10. Good care. Good times.
11. Find a center near you at AutumnLakeHealthcare.com.

## Guardrails applied

- No people, patients or stock imagery; photos are building exteriors only.
- No statistics, outcomes or testimonials (none are published by the company).
- Care is attributed to "each center"; the management-company disclaimer is on
  the end card.
- The logo is shown only in its original colors on a light background.
