# Autumn Lake Healthcare — brand research

Researched 2026-11-10 from public, official company web properties only. Every
line of on-screen copy in the ad traces to a row in the [claims register](#claims-register)
below. Quotes are verbatim unless a row says otherwise.

## Sources

| ID | Source | URL |
|----|--------|-----|
| S1 | Corporate homepage | https://autumnlakehealthcare.com/ |
| S2 | Corporate careers page | https://autumnlakehealthcare.com/careers/ |
| S3 | Center site — Pikesville, Maryland | https://autumnlakepikesville.com |
| S4 | Center site — Cromwell, Connecticut | https://autumnlakecromwell.com |
| S5 | Center site — Beloit, Wisconsin | https://autumnlakebeloit.com |
| S6 | Center site — Crystal Springs, West Virginia | https://autumnlakecrystalsprings.com |
| S7 | Official logo file | https://autumnlakehealthcare.com/wp-content/uploads/sites/40/2020/07/corporate-logo.svg |
| S8 | Homepage hero lettering ("Good care. Good times.") | https://autumnlakehealthcare.com/wp-content/uploads/sites/40/2020/07/banner-txt.png |
| S9 | Homepage stylesheet / computed styles (colors, fonts) | https://autumnlakehealthcare.com/ (theme `autumn-lake`) |

## Who they are

- **What the company is.** S1 footer, verbatim: "Autumn Lake Healthcare is a
  management company that provides non-healthcare services to licensed
  healthcare centers. Healthcare related services are provided solely by each
  independently owned and operated Healthcare Center. Autumn Lake Healthcare
  licenses the use of its name to Autumn Lake Healthcare Facilities."
  **Implication for the ad:** care is always attributed to "each center", never
  to Autumn Lake Healthcare itself, and the footer disclaimer runs on the end card.
- **Footprint.** S1: "Autumn Lake Healthcare maintains a network of independent
  nursing homes and rehabilitative care center's across Connecticut, New Jersey,
  Maryland, West Virginia and Wisconsin." (The site's stray apostrophe in
  "center's" is corrected to "centers" in the ad.)
- **Corporate contact.** S1 footer: "Phone: 732-358-6883", "4481 Route 9,
  Howell, NJ 07731", "AutumnLakeHealthcare.com".
- **Center listings on S1** (counted on 2026-11-10, not used in the ad): New
  Jersey 13, Connecticut 10, Maryland 37, Wisconsin 4, West Virginia 2. These
  are counts of listings, not a figure the company publishes, so no number
  appears on screen.

## Services (as the company describes them)

- S1: "These centers provide comprehensive care services, including short-term
  rehabilitation and long-term care, focused on supporting recovery, comfort,
  and overall wellness." On S1 this sentence follows one about the New Jersey
  centers. The same two service lines are corroborated outside New Jersey by
  the navigation headings "SHORT-TERM REHAB" and "LONG-TERM LIVING" on S3
  (Maryland), S4 (Connecticut), S5 (Wisconsin) and S6 (West Virginia).
- S1: "Each location delivers personalized treatment plans in a warm,
  supportive environment designed to help individuals heal, regain strength,
  and enhance their quality of life through compassionate, professional care."
  Only the first half ("personalized treatment plans") is used; the outcome
  language in the second half is deliberately left out of the ad.
- Other headings seen on center sites (not used): "World Class Therapy",
  "Renowned Specialty Care", "SECURE MEMORY CARE UNIT" (S4), "RESIDENT
  CONCIERGE" (S4).

## Mission, philosophy and tone

- S1: "Clinical excellence and compassionate care are the cornerstones of each
  Autumn Lake Healthcare center."
- S1: "Autumn Lake Healthcare's centers have a philosophy, and we maintain that
  the healing process should be holistic."
- S1: "Each Center's well-trained, compassionate, and experienced doctors,
  therapists, and specialists comprise a comprehensive team devoted to creating
  personalized havens of hospitality throughout each individual's recovery
  process."
- S2: "There are many healthcare groups, but here you'll find family." and
  "It's not just a job, it's a family."
- Tagline: "Good care. Good times." — hero lettering on S1 (file S8) and
  repeated as "Good Care. Good Times." on S3–S6.
- **Tone:** warm, family-first, hospitality language ("havens of hospitality",
  "Welcome Home", "family") sitting next to professional language ("clinical
  excellence", "highest professional standards"). The ad keeps that pairing:
  warm color and soft motion, confident slab-serif headlines.

## Visual identity

No brand guide, color file or font file was supplied in `/assets`, so the
identity below is **derived from the public site (S7, S9)**.

### Colors

| Token | Hex | Where it comes from |
|-------|-----|---------------------|
| `maroon` | `#822820` | S9 — heading and body-copy color (`rgb(130, 40, 32)`) |
| `maroonDeep` | `#7C261E` | S9 — announcement bar background (`rgb(124, 38, 30)`) |
| `brick` | `#AF372C` | S9 — panel background (`rgb(175, 55, 44)`) |
| `orange` | `#E15A2A` | S9 — buttons and "Meet Autumn Lake Healthcare" panel (`rgb(225, 90, 42)`) |
| `peach` | `#F6CDBF` | S9 — light text on orange (`rgb(246, 205, 191)`) |
| `mist` | `#F6F6F6` | S9 — card background (`rgb(246, 246, 246)`) |
| `ink` | `#383839` | S9 — H1 color (`rgb(56, 56, 57)`) |
| `white` | `#FFFFFF` | S9 — page background |
| logo orange / maroon | `#DF5829` / `#7F2629` | S7 — fills inside the logo file (left untouched) |

One tint is **derived, not sampled**: `paper` (`#FDF3EE`), which is `peach`
mixed toward white, used as a softer alternative to pure white backgrounds.

### Typography

| Role | Site font (S9) | Used in the ad | Note |
|------|----------------|----------------|------|
| Headlines | DecourSoft (bold) | **Zilla Slab** (stand-in) | DecourSoft is a commercial typeface and no licensed file was supplied, so it was not copied from the site. See `docs/missing-assets.md`. |
| Body / UI | Lato | **Lato** | Open Font License; files are in `assets/fonts`. |
| Tagline | Script lettering, supplied as an image | Official lettering image (S8) | Not set in a font. |

### Logo

`assets/brand/logo.svg` is the unmodified file from S7. It is only ever shown in
its original colors on white or near-white, because no reversed (white) version
is published. The intro and outro animate the logo's own shapes (leaves, trunk,
letters); nothing is redrawn.

### Imagery

- The site's hero and widget photos show people. Because it cannot be confirmed
  from public materials whether they are residents or models, **no imagery of
  people is used anywhere in the ad**.
- Five exterior/grounds photos from S1 with no people in them are used
  (`assets/photos/center-01…05.jpg`). The site does not caption which center
  each shows, so the ad does not label them.

## Claims register

Every piece of on-screen text and every caption line. "Verbatim" means the
words appear in that order in the source; a fragment of a sentence is marked as
such. The copy itself lives in `src/content.ts` and `src/captions.ts`.

| ID | On-screen text | Scene | Source | Match |
|----|----------------|-------|--------|-------|
| C1 | "Our philosophy" (label) / "The healing process should be holistic." | 2 | S1: "Autumn Lake Healthcare's centers have a philosophy, and we maintain that the healing process should be holistic." | Verbatim fragment; label paraphrases "have a philosophy" |
| C2 | "Clinical excellence" / "&" / "Compassionate care" / "The cornerstones of each Autumn Lake Healthcare center." | 3 | S1: "Clinical excellence and compassionate care are the cornerstones of each Autumn Lake Healthcare center." | Verbatim, split across elements; "and" shown as "&" |
| C3 | "Comprehensive care services" / "Short-term rehabilitation" / "Long-term care" / "Focused on supporting recovery, comfort, and overall wellness." | 4 | S1: "These centers provide comprehensive care services, including short-term rehabilitation and long-term care, focused on supporting recovery, comfort, and overall wellness." Corroborated for other states by S3–S6. | Verbatim fragments |
| C4 | "Personalized treatment plans" | 4 | S1: "Each location delivers personalized treatment plans in a warm, supportive environment…" | Verbatim fragment |
| C5 | "Doctors." / "Therapists." / "Specialists." / "A comprehensive team" / "devoted to creating personalized havens of hospitality." | 5 | S1: "…doctors, therapists, and specialists comprise a comprehensive team devoted to creating personalized havens of hospitality throughout each individual's recovery process." | Verbatim fragments |
| C6 | "Meet Autumn Lake Healthcare" / "A network of independent nursing homes and rehabilitative care centers" / "Connecticut", "New Jersey", "Maryland", "West Virginia", "Wisconsin" | 6 | S1 heading "Meet Autumn Lake Healthcare" and sentence "Autumn Lake Healthcare maintains a network of independent nursing homes and rehabilitative care center's across Connecticut, New Jersey, Maryland, West Virginia and Wisconsin." | Verbatim; "center's" corrected to "centers" |
| C7 | "There are many healthcare groups, but here you'll find family." | 7 | S2 (careers page subhead) | Verbatim. Note: written for a recruiting audience. |
| C8 | "Good care. Good times." (official lettering image) | 8 | S1 hero / S8; repeated on S3–S6 | Verbatim (official artwork) |
| C9 | "AutumnLakeHealthcare.com" | 9 | S1 footer | Verbatim |
| C10 | "732-358-6883" | 9 | S1 footer: "Phone: 732-358-6883" | Verbatim |
| C11 | Footer disclaimer (three sentences beginning "Autumn Lake Healthcare is a management company…") | 9 | S1 footer | Verbatim |
| C12 | Photos of center exteriors | 6 | S1 images (`/wp-content/uploads/sites/40/2025/11/…`) | Official imagery, unlabeled |
| — | "Find a center near you" | 9 | Call to action, not a claim. Mirrors S1 links "see centers" / "View a full list of Autumn Facilities". | Original wording |
| — | "01", "02", "03" on the service cards | 4 | Card numbering, generated in the scene. Decorative, not a statistic. | Not a claim |

### Caption (narration script) lines

| Cue | Caption text | Source | Match |
|-----|--------------|--------|-------|
| 1 | "We maintain that the healing process should be holistic." | S1 | Verbatim fragment |
| 2 | "Clinical excellence and compassionate care are the cornerstones of each Autumn Lake Healthcare center." | S1 | Verbatim |
| 3 | "These centers provide comprehensive care services, including short-term rehabilitation and long-term care," | S1 | Verbatim fragment |
| 4 | "focused on supporting recovery, comfort, and overall wellness." | S1 | Verbatim fragment |
| 5 | "Doctors, therapists, and specialists comprise a comprehensive team" | S1 | Verbatim fragment |
| 6 | "devoted to creating personalized havens of hospitality." | S1 | Verbatim fragment |
| 7 | "Autumn Lake Healthcare maintains a network of independent nursing homes and rehabilitative care centers" | S1 | Verbatim; "center's" corrected |
| 8 | "across Connecticut, New Jersey, Maryland, West Virginia and Wisconsin." | S1 | Verbatim fragment |
| 9 | "There are many healthcare groups, but here you'll find family." | S2 | Verbatim |
| 10 | "Good care. Good times." | S1 / S8 | Verbatim |
| 11 | "Find a center near you at AutumnLakeHealthcare.com." | Call to action + S1 footer URL | Original wording + verbatim URL |

### Deliberately not used

- No statistics, ratings, outcomes or testimonials: none are published on S1 or S2.
- No center counts (see "Center listings" above).
- "designed to help individuals heal, regain strength, and enhance their
  quality of life" (S1) — outcome language.
- "the highest professional standards for medical treatment" (S1) — superlative.
- "World Class Therapy", "Renowned Specialty Care" (S3–S6) — superlatives.
- Any photo containing a person.

## How this was gathered

Pages were read in a normal browser session and through a text fetch on
2026-11-10. Colors and font names are the browser's computed styles for the
live homepage. Site copy changes over time; re-check the register against the
live pages before the ad is published.
