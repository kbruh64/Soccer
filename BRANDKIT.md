# Brand Kit: The Charter Records

Generated per the `brandkit` skill.

**Honest note on format.** The `brandkit` skill is an image generation skill: its
normal output is a rendered 3x3 identity board. No image generation tool is available
in this environment, so this file delivers the layer that has to exist before any board
can be rendered, plus the exact generation prompt to produce it when a tool is
available. Nothing here is a placeholder. The mark, palette and type system described
below are the ones already implemented in the live site.

---

## 1. Brand Strategy

| Field | Value |
|---|---|
| Category | Independent editorial history project |
| Audience | General readers who follow football and want the institutional story behind it |
| Product function | One long form record of FIFA from 1904 to 2026 |
| Emotional promise | You will finish this knowing what actually happened and in what order |
| Cultural position | Archival and unsentimental. Not a fan site, not a FIFA channel |
| Trust level | High. The project succeeds only if the dates are right |
| Visual world | Swiss industrial print. Technical binders, match programmes, filing systems |
| Core metaphor | **The charter.** A signed document that created something, and the paper trail that followed |
| What it must avoid | Stadium spectacle, national flags, crest pastiche, anything that reads as FIFA's own marketing |

The name comes from the founding document itself. Seven signatures on one page in
Paris is the origin of everything the site covers, so the brand is built around the
record rather than around the sport.

---

## 2. Logo System

**Method:** construction geometry plus negative space. No monogram, no animal, no ball.

The mark is a green square struck through by a red band. Read one way it is a document
with a redacted line. Read the other way it is a page split into two halves, which is
the site's own structure: before the tournament, and after it. It is also the only
place the two accents are allowed to touch, which makes the mark a statement of the
colour rule rather than just a logo.

- **Symbol:** `32 x 32` field, white ground, green plate inset at 6 units on all
  sides, red band 4 units high struck through the middle. Implemented at
  [assets/favicon.svg](assets/favicon.svg).
- **Lock up:** symbol at cap height, then a fixed gap of one symbol width, then the
  wordmark set in JetBrains Mono 700, uppercase, tracking `0.16em`.
- **Scaling:** the band is the first thing to fail, so below 16px the mark drops to a
  solid red square with no strike. That reduced form is the app icon and the favicon
  fallback.
- **Colour states:** green and red on white (primary), single colour ink on white
  (print), white on ink (dark substrate), and a 100 percent ink version for fax
  quality reproduction.

**Never:** outline the mark, rotate it, place it inside a circle, add a swoosh, add a
football, or set the wordmark in anything other than the mono.

---

## 3. Colour System

White, green and red. Two accents, one mechanical rule. Full token table in
[DESIGN.md](DESIGN.md) section 2.

| Role | Light | Dark |
|---|---|---|
| Base | Canvas `#FFFFFF` | Canvas `#0A0D0B` |
| Secondary surface | Recessed Stock `#F1F5F1` | Recessed `#121712` |
| Foreground | Ink `#0F1411` | Ink `#E9EFEA` |
| Accent, the record | Pitch Green `#0B6B3A` | Pitch Green `#37C46F` |
| Accent, the rupture | Rupture Red `#C8102E` | Rupture Red `#FF5566` |

**Green is the record.** Structure, years, active state, the single call to action,
the timeline spine. **Red is the rupture,** and is spent only on the 1921 ban, the
1966 theft, the 2015 arrests, the two cancelled World Cups, and interface errors.

The two meet in exactly one place: the mark. Everywhere else they are kept apart, so
that a red on the page always means something has gone wrong rather than that a
designer wanted variety.

---

## 4. Typography

| Role | Face | Treatment |
|---|---|---|
| Display | Archivo Black | Uppercase, tracking `-0.035em` to `-0.05em`, leading `0.85` to `0.95` |
| Body | Archivo 400 to 700 | Leading `1.6`, measure 52 to 65 characters |
| Data and labels | JetBrains Mono 400 to 700 | Uppercase, tracking `0.08em` to `0.22em`, `10px` to `12px` |

The system runs on the gap between the display and the mono. There is no third voice.

---

## 5. Detail Language

ASCII symbology carries the technical register instead of icons: `///` as the marquee
separator, `[   ]` as the empty state mark, `+` as the list bullet. Numerals are always
tabular. Photography is always grayscale with lifted contrast. Rules are always
exactly 1px and always carbon, produced by a `gap: 1px` grid rather than by borders.
A fixed film grain sits over the whole page at low opacity so the substrate reads as
stock rather than as screen.

---

## 6. Tagline

**Seven signatures. One hundred and twenty one years.**

Alternates held in reserve: *The record, in order.* and *Founded 1904. Still arguing.*

---

## 7. Board Generation Prompt

Use this verbatim when an image generation tool is available. Target `3 x 3`, `16:10`.

> Create a premium brand kit overview board for "The Charter Records", an independent
> editorial history project about FIFA.
>
> Brand strategy: category is archival editorial publishing; audience is general
> readers of football history; personality is unsentimental, precise, documentary;
> core metaphor is the founding charter, a signed document and the paper trail that
> followed; the logo is a filled square with a horizontal band struck out of its
> centre, reading as both a redacted document line and a page split in two.
>
> Layout: 3 x 3 presentation grid on a pure white canvas (`#FFFFFF`) with wide even
> gutters, generous negative space, and small monospace page labels in the corner of
> each panel.
>
> Panels: 1, logo cover, mark and wordmark, extreme negative space. 2, logo
> construction, the square and the strike shown on a measured grid with alignment
> marks. 3, digital application, a browser frame showing the site header on white. 4,
> brand essence, the line "Seven signatures. One hundred and twenty one
> years." set large in heavy uppercase grotesque. 5, colour system, four flat chips
> labelled Canvas White, Recessed Stock, Ink, Pitch Green, Rupture Red. 6,
> typography, an uppercase specimen row in a heavy grotesque above a monospace label
> row. 7, physical application, a manila document folder and a stamped index card
> carrying the mark. 8, image direction, a high contrast black and white archival
> football photograph from the 1930s with a halftone treatment. 9, system detail, a
> 1px lattice grid of small data compartments with monospace year labels.
>
> Visual mode: Swiss industrial print on white. Palette: pure white, near black ink,
> one deep pitch green, one reserved red, nothing else. Green carries structure, red
> appears once only. Typography: heavy uppercase grotesque
> for display, monospace for every label, no serif. Style: sparse, rigid, mechanical,
> zero rounded corners, no gradients, no glow, no translucency, subtle print grain.
> No real world logos, no crests, no flags, no footballs.

---

## 8. Anti-Generic Guardrails

No stadium spectacle. No national flags or crests. No football as a graphic device.
No gold, no trophies as ornament. The green is a flat ink, never a turf texture, never
a pitch with mown stripes. No gradients, glows or 3D renders. No stock photography of
crowds cheering. No third accent colour, and no red outside the rupture rule. No
rounded corners. Nothing that could be mistaken for FIFA's own brand, which is the
specific failure mode this identity is built to avoid.
