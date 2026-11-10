# Autumn Lake Healthcare brand ad

A 56-second brand ad for Autumn Lake Healthcare, built as code with
[Remotion](https://www.remotion.dev) (React + TypeScript). Output is a
1920×1080, 30 fps H.264 MP4 with an original score, sound effects and
voiceover.

## Commands

```bash
npm ci                 # install
npm run studio         # live preview and scrubbing in the browser
npm run render         # render out/autumn-lake-brand-ad.mp4
npx remotion render    # same film, default name out/BrandAd.mp4
npm run typecheck      # TypeScript check
npm run logo           # regenerate src/brand/logoPaths.ts after replacing the logo file
npm run audio          # rebuild score, effects and voice (needs the Python setup in scripts/audio/README.md)
```

Rendering takes about two minutes on 4 cores. `out/` is git-ignored. CI
(`.github/workflows/render.yml`) type-checks, renders on every push and
uploads the MP4 as the `autumn-lake-brand-ad` artifact; it fails if the output
is not 1920×1080 at 30 fps or has no audio track. The audio files are
committed, so CI does not need Python. Rebuilding audio is a separate, manual
step: see `scripts/audio/README.md`.

## Project structure

```
assets/                 Remotion public dir
  audio/                score.mp3, sfx.mp3, voice/<id>.mp3 (generated, committed)
  brand/ fonts/ photos/ Logo, tagline lettering, fonts, center photos
docs/
  research.md           Company research, sources and the claims register
  storyboard.md         Concept, audience, shot-by-shot plan, voiceover script
  missing-assets.md     Stand-ins in use and what to supply
scripts/
  extract-logo-paths.mjs  Splits assets/brand/logo.svg into animatable shapes
  audio/                Python generators for the score, effects and voice
src/
  edit.json             THE CUE SHEET: tempo, scene order and length in beats,
                        wipes, voiceover lines, sound-effect cues
  index.ts, Root.tsx    registerRoot and the one <Composition id="BrandAd">
  BrandAd.tsx           Lays scenes, wipes, captions and audio on the timeline
  timeline.ts           Attaches a component to each scene id in edit.json
  audio.ts              Audio file names, mix levels, voice cues, ducking
  content.ts            Every on-screen string, with its source ID
  generated/voice.json  Voice clip lengths and word timings (written by scripts/audio)
  theme/                colors.ts, fonts.ts, timing.ts (shared by everything)
  lib/anim.ts           ramp(), pop(), easing curves, seeded rand()
  brand/                logoPaths.ts (generated), logoParts.ts (trunk, leaves…)
  components/           Logo, TreeMark, Leaf, LeafBurst, Flash, WordReveal,
                        Underline, Label, RoomLabel, Background, PanelWipe, Captions
    people/             Person.tsx (the illustrated character), cast.ts (who's who)
  scenes/               One file per scene (see below)
    tour/               The four illustrated rooms and their shared parts
remotion.config.ts      Public dir, codec, quality
```

| # | Scene file | Beats | What it shows |
|---|------------|-------|---------------|
| 1 | `LogoIntro.tsx` | 8 | Logo grows: ground, trunk, leaves, lettering |
| 2 | `Belief.tsx` | 8 | "The healing process should be holistic." |
| 3 | `Cornerstones.tsx` | 12 | Clinical excellence & compassionate care, on the first drop |
| 4 | `Tour.tsx` | 36 | Doors open; camera travels through four illustrated rooms |
|   | `tour/Lobby.tsx` | 8 | A caregiver wheels a resident in; the front desk waves |
|   | `tour/TherapyGym.tsx` | 8 | Parallel bars with a therapist |
|   | `tour/Suite.tsx` | 8 | A nurse brings tea; the doctor stops by |
|   | `tour/DiningRoom.tsx` | 8 | Music, a dance, everyone clapping |
| 5 | `Network.tsx` | 16 | Five states and real center photos |
| 6 | `Family.tsx` | 8 | "…here you'll find family." |
| 7 | `Tagline.tsx` | 8 | "Good care. Good times." lettering |
| 8 | `CallToAction.tsx` | 16 | Logo, URL, phone, disclaimer |

## Conventions

### The cue sheet drives picture and sound
- `src/edit.json` is read by both the Remotion code and the Python audio
  scripts. Scene order and lengths, wipes, voiceover lines and sound-effect
  cues all live there, in beats from the start of the film.
- If you change scene lengths, voiceover timing or effect cues, the committed
  audio no longer matches. Rebuild it (`scripts/audio/README.md`) or the film
  will be out of sync. Changing only on-screen copy or visuals needs no rebuild.
- A scene without a `wipe` in `edit.json` cuts in hard. Those cuts sit on
  musical downbeats on purpose (Cornerstones, Tagline).

### One scene, one file
- Each scene is a self-contained component in `src/scenes`. It reads
  `useCurrentFrame()`, which Remotion resets to 0 at the start of the scene's
  `<Sequence>`, so a scene never needs to know where it sits in the film.
- Scenes do not animate themselves out when a `PanelWipe` covers the cut:
  finish motion at least `WIPE_FRAMES` (12) before the end. Two scenes hand
  off to the next on purpose: Cornerstones ends by filling the frame with its
  two blocks, which are the closed doors Tour starts on.
- Tour rooms take one prop, `t` (frames since that room became current; it is
  negative while the camera is still arriving), and draw a 1920×1080 SVG.

### Timing is in beats, never raw seconds
- `src/theme/timing.ts` reads `fps` and `bpm` from `edit.json` and exports
  `beats(n)`. At 120 BPM one beat is 15 frames and one bar is 2 seconds.
  Express every delay that should feel "on the beat" as `beats(n)`. Small
  staggers inside a beat can be plain frame counts.
- Keep the total between 45 and 60 seconds.

### Animation
- Everything is driven by the frame number. No CSS transitions, CSS
  animations, `setTimeout` or `Math.random()`: they do not render
  deterministically. Use `ramp()` for eased 0→1 moves, `pop()` for springs,
  `rand(seed)` for repeatable randomness (all in `src/lib/anim.ts`).
- Reuse `WordReveal` for kinetic type, `Underline` for emphasis, `Label` and
  `RoomLabel` for headings, `Background` for backdrops, `LeafBurst` and
  `Flash` for accents on hard cuts.

### Illustrated people
- `Person` is a side-view cut-out authored facing right; pass `facing={-1}`
  to flip. Pose it with joint angles or with `reach: [x, y]` (the hand goes to
  that point in the character's own space). `stride(phase)` gives a walking
  leg and `blink(frame, offset)` the eyes.
- Looks (skin, hair, clothes) are defined once in `people/cast.ts`. Staff
  wear the brand maroon and orange; residents wear soft neutrals.
- Tie foot movement to distance travelled (`phase = x / 28`), not to time, so
  feet do not slide.

### Theme
- Brand colors come from `COLORS`, illustration-only colors (skin, hair,
  wood, plants) from `ILLO`, font stacks from `FONTS`. No hex codes or font
  names inside scenes or components, apart from a few shadows, highlights and
  the caption pill.
- Fonts are loaded once in `src/theme/fonts.ts` with `@remotion/fonts` from
  `assets/fonts`. The headline font is a stand-in; swapping it is a two-line
  change described in that file.

### Assets and audio
- `assets/` is the Remotion public directory. Reference files with
  `staticFile('photos/center-01.jpg')` and use Remotion's `<Img>` and
  `<Html5Audio>` so rendering waits for them to load.
- Audio file names and mix levels are in `src/audio.ts`. The score dips under
  each spoken line automatically. A missing audio file is skipped rather than
  failing the render. To use your own music, replace `assets/audio/score.mp3`
  (56 s, 120 BPM) or change the tempo in `edit.json` and rebuild the effects.
- `BrandAd` takes two props: `showCaptions` and `voiceover` (set to `false`
  for a music-only cut, for example `--props='{"showCaptions":false,"voiceover":false}'`).
- The logo is drawn from its own shapes (`src/brand/logoPaths.ts`, generated
  from `assets/brand/logo.svg`). Do not recolor it, redraw it or place it on a
  dark background. `TreeMark` and `Leaf` are decorative uses of the same shapes.

### Copy and compliance (healthcare marketing)
- On-screen text lives in `src/content.ts`; spoken lines and captions live in
  `src/edit.json` under `voice`. Scenes never hard-code copy.
- Every claim must appear in the claims register in `docs/research.md` with a
  public company source. When copy changes, update the register in the same
  commit.
- Do not add medical claims, outcomes, statistics, ratings or testimonials
  unless they appear verbatim in official company materials and are cited.
- **People appear only as illustration.** No photographs or footage of
  patients, residents or staff, no stock imagery, nothing photoreal. The
  illustrated rooms show services the company names; they must not depict a
  medical result or a specific real person or center. Each resident character
  appears in one room only (see `people/cast.ts`): never show someone in a
  wheelchair or in therapy and then walking or dancing later.
- Autumn Lake Healthcare is a management company; care is provided by each
  independently owned center. Attribute care to "each center" and keep the
  footer disclaimer on the end card.
- If an asset is missing, use a clean stand-in and list it in
  `docs/missing-assets.md`.

### Dependencies
- No paid APIs and nothing that needs a key. All Remotion packages must stay
  on the same exact version.
- Remotion itself is free for individuals and very small teams, but companies
  above its size threshold need a company license:
  https://www.remotion.dev/docs/license

## Checking changes
1. `npm run typecheck`
2. `npm run studio` and scrub the scene you changed, or render it alone:
   `npx remotion render BrandAd out/test.mp4 --frames=420-959` (the tour).
3. `npm run render` before pushing. CI repeats the render and fails if the
   output is not 1920×1080 at 30 fps.
4. Nobody can check sound by reading code. After any audio change, listen to
   the render on speakers and on a phone before it goes anywhere.
