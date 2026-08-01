# Art Direction

Covers three image led skills: `image-to-code`, `imagegen-frontend-web`,
`imagegen-frontend-mobile`.

**Honest note on format.** All three skills mandate an image first workflow: generate
reference comps, analyse them, then implement. No image generation tool is available in
this environment, so the workflow was inverted in the way those skills allow when
generation is unavailable. Real archival photography was sourced first, analysed, and
the design system was derived from what that photography actually looks like. Part A
records that analysis. Parts B and C are the per section and per screen briefs, held
at full fidelity so they can be rendered the moment a generation tool is present.

---

## Part A. Source First Analysis (`image-to-code`)

The project now carries 51 photographs, all sourced from Wikimedia Commons, all
verified to resolve, and all served locally from `assets/img/` rather than hotlinked.
The design system was extracted from them rather than imposed on them. The analysis
below was written against the first fifteen and holds for the full set.

### What the source material actually is

| Property | Observation | Consequence in the build |
|---|---|---|
| Tonality | Mixed. Silver gelatin from the 1920s and 1930s, colour digital from 2009 onward | Every photograph is forced to `grayscale(1) contrast(1.08)` so a 1930 team line up and a 2019 confetti shot read as one archive |
| Grain | Heavy on the pre war plates, absent on the modern files | A fixed film grain layer over the whole page closes the gap |
| Contrast | The 1930 aerial of the Estadio Centenario is flat and hazy | Hero applies `contrast(1.15) brightness(0.72)` plus a bottom weighted scrim so the headline holds AA |
| Aspect | Portrait for the person plates, landscape for the crowd and building plates | Two fixed ratios only: `4:5` and `3:4` for people and objects, `16:9` for environments |
| Subject scale | The archival plates put the subject small in frame | Frames are large and the tray padding is thin, so the subject is not shrunk further |
| Colour information | Effectively none in the historic files | The interface supplies all of the colour, so both accents always mean something. Green for the record, red for the rupture |

### Design decisions that fall out of the source

1. On the record pages, grayscale is not a style choice. It is the only treatment that
   makes 1930 and 2019 sit on the same page without one looking like a mistake.
2. On the timeline page the opposite call is correct. Portraits run from 1930 to 2026,
   so they are held at `saturate(0.82)` and allowed to go fully natural on hover. The
   set drifts from monochrome to colour on its own as the decades pass, and that drift
   is the clearest thing on the page about how much time has gone by.
3. Because the archival plates are soft, the interface has to be hard. Zero radius,
   1px lattice rules, heavy uppercase display. The structure supplies the precision
   the photographs lack.
4. Because subjects sit small in frame, captions go below the frame rather than
   overlaid. Overlay would cover the subject.
5. Hover lifts each plate to `grayscale(0.55)`. The archive warms slightly when you
   touch it, which is the only ornament the page allows itself.

### Fixed media frame system

- **Person or object:** outer tray, 8px padding, 1px carbon border, inner plate at
  `4:5` or `3:4`, caption below in mono at `0.6875rem`.
- **Environment:** full bleed, no tray, tonal scrim, text in the safe area.
- **Compartment media:** flush to the lattice cell, no tray, caption bar pinned to the
  bottom edge with a 1px top rule.

No third frame type may be introduced.

---

## Part B. Per Section Comps (`imagegen-frontend-web`)

The table below covers the ten sections the record page opened with, which are the ones
the art direction was actually derived from. Fifteen more sections and two more pages
have been added since, and they follow the same locked global choices rather than
extending this table. Regenerating comps for all of them is the outstanding work here.

Ten sections, ten comps, one horizontal frame each. Locked global choices, applied to
every frame: **Theme** Pristine Light Mode. **Background character** tactile textured
paper. **Typography** Swiss rational with very strong hierarchy. **Hero scale** Giant
Statement. **Section system** Swiss grid discipline. **Narrative spine** Archive and
dossier. **Second read moment** the oversized `1904` numeral bleeding off the right
edge of the origins section, used exactly once.

Signature components, four, used across the page: off grid editorial layout, gapless
bento grid, layered image crop frames, infinite brand marquee strip.

| # | Section | Composition anchor | Background mode | CTA variation |
|---|---|---|---|---|
| 0 | Timeline page | Alternating spine, cards either side of a drawn green rule | White field, portraits in fixed 3:4 frames | None |
| 1 | Hero | Bottom left text over background image | Full bleed image with tonal overlay | Classic primary with nested icon capsule |
| 2 | Origins 1904 | Off grid editorial offset | Tactile paper with an oversized bleeding numeral | None |
| 3 | Confederation band | Centred statement | Flat carbon block | None |
| 4 | Presidents rail | Left third caption, right two thirds visual | Solid paper with a 1px lattice | None |
| 5 | Eras pan | Image as canvas, panels overlaid in a safe area | Flat carbon block | None |
| 6 | Trophy | Top left lead, support bottom right | Solid paper with two offset image trays | None |
| 7 | Turning points | Stacked centre | Solid paper, one panel inverted to accent | None |
| 8 | Women's game | Bottom left text over background image | Full bleed image, left weighted scrim | None |
| 9 | Today bento | Off grid editorial offset | Colour blocked, one red cell against paper | None |
| 10 | Archive index | Stacked centre | Solid paper, hairline rows | Ghost outline |

Composition check: no anchor repeats more than twice consecutively, no background mode
repeats more than three times consecutively, and two full bleed image backgrounds
appear. Section size deliberately varies: the band and the archive are mini, the hero
and the pan are giant, the rest are medium.

Prompt skeleton for any one of these frames:

> Horizontal 16:9 website section comp, section [N] of 10, [section name], for an
> editorial history site about FIFA. Swiss industrial print aesthetic on pure white
> `#FFFFFF` with near black ink `#0F1411`, pitch green `#0B6B3A` carrying structure,
> and a reserved red `#C8102E` used only where something broke.
> Composition anchor: [anchor]. Background mode: [mode]. Heavy uppercase
> grotesque display type with tight negative tracking, monospace uppercase labels at
> small size, no serif. Zero rounded corners, 1px hairline rules, generous negative
> space, film grain. Archival black and white football photography where imagery
> appears. No gradients, no glow, no glassmorphism, no crests, no flags, no emoji.

---

## Part C. Companion Mobile Screens (`imagegen-frontend-mobile`)

Six screens, each rendered inside a restrained phone frame with even margins, the
frame subordinate to the content. Same palette, same type system, same photographic
treatment as the web comps.

| # | Screen | Job | Composition notes |
|---|---|---|---|
| 1 | Cover | Open the archive | Full bleed 1930 aerial, wordmark at top left, title block in the lower third, one red action bar pinned above the safe area |
| 2 | Era index | Choose a period | Six full width rows on a 1px lattice, year range in red mono, era name in heavy uppercase, no chevrons |
| 3 | Era detail | Read one era | Scrolling long form, plate at `4:5` under a sticky mono header carrying the year range |
| 4 | Presidents | Browse nine holders | Horizontal snap cards, one per screen width, name in display, tenure in red mono |
| 5 | Search | Find an entry | Mono input pinned under the header, results as hairline rows, empty state as a dashed compartment with a bracket mark |
| 6 | Plate view | Inspect a photograph | Photograph edge to edge on carbon, caption and credit in a bottom sheet with a 1px top rule and no rounded corner |

Mobile rules: `44px` minimum tap target throughout, safe area respected top and bottom,
body text never below `14px`, single column always, no floating action buttons, no
pills, no tab bar icons without labels, no charts.

---

## Anti-Slop Guardrails (all three parts)

No purple or blue AI gradients. No floating blobs or orbs. No glassmorphism. No fake
dashboards. No stock photography of cheering crowds. No crests, flags or footballs as
graphic devices. No tiny unreadable text in a comp. No multiple sections compressed
into one frame. No cropping a section out of a larger board, always regenerate the
section clean. No cards inside cards inside cards. No decorative micro labels or
pseudo system markers.
