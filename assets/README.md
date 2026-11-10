# assets

This folder is Remotion's public directory (`Config.setPublicDir('assets')`),
so `staticFile('brand/logo.svg')` resolves to `assets/brand/logo.svg`.

| Path | What it is | Origin |
|------|------------|--------|
| `brand/logo.svg` | Official logo, unmodified | autumnlakehealthcare.com (`/wp-content/uploads/sites/40/2020/07/corporate-logo.svg`) |
| `brand/tagline-lettering.png` | Official "Good care. Good times." lettering, as served | autumnlakehealthcare.com (`/wp-content/uploads/sites/40/2020/07/banner-txt.png`) |
| `brand/tagline-lettering@3x.png` | Same lettering, enlarged 3× with edges re-sharpened for 1080p | Derived from the file above |
| `photos/center-01…05.jpg` | Center exteriors and grounds, no people | autumnlakehealthcare.com homepage (`/wp-content/uploads/sites/40/2025/11/…`) |
| `fonts/Lato-*.woff2` | Lato (the site's body font) | SIL Open Font License, see `fonts/LICENSE-Lato.txt` |
| `fonts/ZillaSlab-*.woff2` | Zilla Slab, stand-in for the site's DecourSoft headline font | SIL Open Font License, see `fonts/LICENSE-ZillaSlab.txt` |
| `music/` | Empty. Drop one music file here and it is used automatically | — |

See `docs/missing-assets.md` for what should be replaced with better originals.
