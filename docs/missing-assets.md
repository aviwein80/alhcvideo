# Missing assets

`/assets` was empty when this project was built. The items below were either
replaced with a clean stand-in or sourced from the company's public website.
Each row says what to supply and where it plugs in.

## Missing — stand-in in use

| Asset | What the ad does now | What to supply | Where it plugs in |
|-------|----------------------|----------------|-------------------|
| **Music track** | The ad renders silent. | A licensed track of about 60 s (`.mp3`, `.wav`, `.m4a` or `.aac`). | Drop it in `assets/music/`. It is picked up automatically. Then set `BPM` in `src/theme/timing.ts` to the track's tempo so cuts land on the beat. |
| **Voiceover** | No narration; the script is shown as captions. | A recording of the narration script in `docs/storyboard.md`. | Add the file under `assets/` and an `<Audio>` in `src/BrandAd.tsx`; adjust cue timings in `src/captions.ts`. |
| **Headline font — DecourSoft** | Zilla Slab (open license) stands in. | Licensed `DecourSoft-Regular` and `DecourSoft-Bold` font files (`.woff2`, `.ttf` or `.otf`). The font is commercial, so it was not copied from the website. | Put the files in `assets/fonts/` and switch the headline entries in `src/theme/fonts.ts` (instructions are in that file). |
| **Brand guidelines** | Colors and type were derived from the public site (see `docs/research.md`). | Official palette, logo clear-space and usage rules. | `src/theme/colors.ts`. |

## Sourced from the public website — better originals wanted

| Asset | In use now | What to supply |
|-------|-----------|----------------|
| **Logo** | `assets/brand/logo.svg`, the file served on the corporate homepage. | Confirm this is the current master logo. If a reversed (white) version exists, the logo could also be used on maroon scenes. If the file is replaced, run `node scripts/extract-logo-paths.mjs`. |
| **"Good care. Good times." lettering** | `assets/brand/tagline-lettering.png` is the 532×325 px web image; `tagline-lettering@3x.png` is that same image enlarged and edge-sharpened for 1080p. | The original vector artwork (SVG, AI or EPS). Replace `tagline-lettering@3x.png`, keeping the same proportions. |
| **Center photos** | Five exterior photos from the homepage, about 1,229 px wide, shown inside a card so they are not enlarged. | Full-resolution originals (1920 px wide or larger), plus which center each one shows if you want them labeled. Replace `assets/photos/center-01…05.jpg`. |
| **Video clips** | None used. | Any approved b-roll without identifiable patients or residents. |
