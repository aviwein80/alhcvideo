# Autumn Lake Healthcare brand ad

A 58.7-second brand ad for Autumn Lake Healthcare, built as code with
[Remotion](https://www.remotion.dev) (React + TypeScript). Output is a
1920×1080, 30 fps H.264 MP4.

## Commands

```bash
npm ci                 # install
npm run studio         # live preview and scrubbing in the browser
npm run render         # render out/autumn-lake-brand-ad.mp4
npx remotion render    # same film, default name out/BrandAd.mp4
npm run typecheck      # TypeScript check
npm run logo           # regenerate src/brand/logoPaths.ts after replacing the logo file
```

Rendering takes about 90 seconds on 4 cores. `out/` is git-ignored. CI
(`.github/workflows/render.yml`) type-checks, renders on every push and
uploads the MP4 as the `autumn-lake-brand-ad` artifact.

## Project structure

```
assets/                 Remotion public dir: logo, lettering, photos, fonts, music
docs/
  research.md           Company research, sources and the claims register
  storyboard.md         Concept, audience, shot-by-shot plan, narration script
  missing-assets.md     Stand-ins in use and what to supply
scripts/
  extract-logo-paths.mjs  Splits assets/brand/logo.svg into animatable shapes
src/
  index.ts              registerRoot
  Root.tsx              The one <Composition id="BrandAd">
  BrandAd.tsx           Lays scenes, wipes, captions and music on the timeline
  timeline.ts           THE EDIT: scene order, length in beats, wipe per cut
  content.ts            Every on-screen string, with its source ID
  captions.ts           Narration script cues (in beats)
  theme/                colors.ts, fonts.ts, timing.ts (shared by everything)
  lib/anim.ts           ramp(), pop(), easing curves, seeded rand()
  brand/                logoPaths.ts (generated), logoParts.ts (trunk, leaves…)
  components/           Logo, TreeMark, Leaf, WordReveal, Underline, Label,
                        Background, PanelWipe, Captions
  scenes/               One file per scene (see below)
remotion.config.ts      Public dir, codec, quality
```

| # | Scene file | Beats | What it shows |
|---|------------|-------|---------------|
| 1 | `LogoIntro.tsx` | 8 | Logo grows: ground, trunk, leaves, lettering |
| 2 | `Belief.tsx` | 8 | "The healing process should be holistic." |
| 3 | `Cornerstones.tsx` | 8 | Clinical excellence & compassionate care |
| 4 | `Services.tsx` | 12 | Three service cards and the "focused on" line |
| 5 | `Team.tsx` | 10 | Doctors, therapists, specialists: one team |
| 6 | `Network.tsx` | 14 | Five states and center photos |
| 7 | `Family.tsx` | 8 | "…here you'll find family." |
| 8 | `Tagline.tsx` | 8 | "Good care. Good times." lettering |
| 9 | `CallToAction.tsx` | 12 | Logo, URL, phone, disclaimer |

## Conventions

### One scene, one file
- Each scene is a self-contained component in `src/scenes`. It reads
  `useCurrentFrame()`, which Remotion resets to 0 at the start of the scene's
  `<Sequence>`, so a scene never needs to know where it sits in the film.
- To reorder, retime, add or remove a scene, edit `SCENE_ORDER` in
  `src/timeline.ts`. Start frames, total duration and wipes are derived from it.
- Scenes do not animate themselves out. A `PanelWipe` covers each cut, so
  finish a scene's motion at least `WIPE_FRAMES` (12) before its end and start
  the next scene's motion a few frames in.

### Timing is in beats, never raw seconds
- `src/theme/timing.ts` defines `FPS`, `BPM` and `beats(n)`. Express every
  delay and duration that should feel "on the beat" as `beats(n)`. Small
  offsets inside a beat (a few frames of stagger) can be plain frame counts.
- `BPM` is 90 because no music was supplied. If a track is added, set `BPM`
  to its tempo; scene lengths, cuts and accents all follow. Then re-check
  `src/captions.ts`, whose cue times are also in beats.
- Changing a scene's length in beats changes the film's total duration.
  Keep the total between 45 and 60 seconds.

### Animation
- Everything is driven by the frame number. No CSS transitions, CSS
  animations, `setTimeout` or `Math.random()`: they do not render
  deterministically. Use `ramp()` for eased 0→1 moves, `pop()` for springs,
  `rand(seed)` for repeatable randomness (all in `src/lib/anim.ts`).
- Reuse `WordReveal` for kinetic type, `Underline` for emphasis, `Label` for
  small headings and `Background` for scene backdrops before writing new ones.

### Theme
- Colors come from `COLORS`, font stacks from `FONTS`. No hex codes or font
  names inside scenes or components (the caption pill and a few shadows are
  the only exceptions).
- Fonts are loaded once in `src/theme/fonts.ts` with `@remotion/fonts` from
  `assets/fonts`. The headline font is a stand-in; swapping it is a two-line
  change described in that file.

### Assets
- `assets/` is the Remotion public directory. Reference files with
  `staticFile('photos/center-01.jpg')` (path relative to `assets/`), and use
  Remotion's `<Img>` and `<Html5Audio>` so rendering waits for them to load.
- A music file dropped into `assets/music/` is picked up automatically by
  `BrandAd.tsx` and faded in and out.
- The logo is drawn from its own shapes (`src/brand/logoPaths.ts`, generated
  from `assets/brand/logo.svg`). Do not recolor it, redraw it or place it on a
  dark background. `TreeMark` and `Leaf` are decorative uses of the same shapes.

### Copy and compliance (healthcare marketing)
- All on-screen text lives in `src/content.ts`; caption text lives in
  `src/captions.ts`. Scenes never hard-code copy (the only generated text is
  the 01/02/03 numbering on the service cards).
- Every claim must appear in the claims register in `docs/research.md` with a
  public company source. When copy changes, update the register in the same
  commit.
- Do not add medical claims, outcomes, statistics, ratings or testimonials
  unless they appear verbatim in official company materials and are cited.
- No imagery of patients, residents or any people, and no stock imagery. Use
  only files in `assets/`.
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
   `npx remotion render BrandAd out/test.mp4 --frames=480-719` (Services).
3. `npm run render` before pushing. CI repeats the render and fails if the
   output is not 1920×1080 at 30 fps.
