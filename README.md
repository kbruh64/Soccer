# The Charter Records

An editorial history of FIFA, from the founding charter of 21 May 1904 to the 2026
finals. Three content pages plus three standing documents. Static site, no build step,
no framework, no npm install.

## Run it

Open [index.html](index.html) in a browser. That is the whole setup.

All 51 photographs are served from `assets/img/` rather than hotlinked, so they work
offline and cannot break when someone else's CDN rate limits you. Only the typefaces
(Google Fonts) and the icon set (Phosphor) come from the network, and both fall back
to system defaults without affecting layout.

## Tooling

Two scripts, no dependencies, plain `node`.

```
node tools/images.js              # verify local image integrity (default)
node tools/images.js --fetch      # pull any remote image local, repoint the HTML
node tools/images.js --optimise   # refetch anything oversized at its slot width
node tools/images.js --credits    # regenerate CREDITS.md from sources.json
node tools/images.js --all        # all of the above

node tools/audit.js               # dead CSS, unused tokens, orphan images, dead anchors
```

Provenance lives in [assets/img/sources.json](assets/img/sources.json), which maps each
local file to its Wikimedia Commons original. `--credits` reads it, pulls author and
licence from the Commons API, and writes [CREDITS.md](CREDITS.md), so attribution
cannot drift from what is on disk. `--verify` fails loudly if an image exists without a
provenance entry, or a provenance entry without an image.

Two traps worth knowing, both of which broke this site once:

- **Never hand write a Wikimedia thumbnail URL.** The thumbnailer refuses to upscale,
  so asking for a width larger than the original returns HTTP 400. Resolve through the
  API, which clamps the request.
- **Commons only renders certain thumbnail widths.** 320, 400 and 500 produce real
  thumbnails; 600, 640, 700, 768 and 1024 hand back the untouched original. An
  optimise pass at 700px therefore saved nothing at all. 500 is the working default.

For a local server instead of `file://`:

```
python -m http.server 8000
```

## Structure

```
index.html                the record, 25 sections
timeline.html             every World Cup, 1930 to 2026
halloffame.html           28 inductees across five wings
privacy.html              standing documents
terms.html
corrections.html
404.html                  branded not found page
assets/css/main.css       the whole design system
assets/css/timeline.css   the timeline page
assets/css/hall.css       the hall of fame page
assets/css/doc.css        the standing document pages
assets/js/main.js         reveals, counters, filter, menu, image states
assets/img/               51 photographs, 5.9mb, served locally
assets/img/sources.json   provenance for every photograph
assets/favicon.svg        the mark
tools/images.js           fetch, optimise, credit and verify photographs
tools/audit.js            repo hygiene
CREDITS.md                per file author and licence, generated
DESIGN.md                 design system spec
BRANDKIT.md               brand identity system
ART-DIRECTION.md          photographic analysis and per section image briefs
```

Page weight, images only: index 3.5mb, timeline 2.1mb, hall of fame 1.3mb. All of it
lazy loaded below the fold.

## Colour

White, green and red. Two accents are only workable with a rule, so there is one and
it is mechanical:

- **Green is the record.** Structure, years, active state, the primary CTA, the
  timeline spine, anything that continues.
- **Red is the rupture.** Spent only on the 1921 ban on women's football, the 1966
  theft, the 2015 arrests, the two World Cups cancelled by war, and error states.

The two meet in one place only, the brand mark. A red anywhere else is a bug.

## What is on the record page

Twenty five sections. At that length "every layout family appears once" stops being
achievable, so the rule actually in force is: **no two adjacent sections share a
layout family, and no family is used more than three times.** That is weaker than the
original rule and it is the honest one.

Origins, who owns the laws (IFAB), the six confederations, FIFA's governance tiers,
the presidents rail, the pinned era pan, the Olympic quarrel, the trophy, the ball,
top scorers, records and oddities, four turning points, how hosts are chosen,
qualifying and the 48 places, referees, the women's game, other tournaments,
technology on the pitch, the world ranking, the transfer system, FIFA today, where
the money comes from, and a filterable index of 30 entries running 1886 to 2026.

## What is on the hall of fame page

Twenty eight inductees in five wings: the inner circle (6), the builders who never
played a match (6), the women's game (6), the goalkeepers (4), and six players
inducted for a single tournament.

FIFA does not operate a hall of fame. This one is editorial, says so prominently, and
gives every inductee a citation that can be checked rather than asserting a ranking.

## What is on the timeline page

White canvas, a green spine that draws as you descend, and 23 tournaments from
Montevideo in 1930 to MetLife Stadium in 2026, alternating either side of the spine.
Each entry carries the host, the winner, the final score, that tournament's Golden
Boot winner, and a portrait of the player who defined it. 1942 and 1946 sit in the
sequence as a red dashed gap.

The portraits are held at light desaturation rather than forced to grayscale, so the
set drifts from monochrome to colour on its own as the decades pass. They are
portraits of the players, not photographs from the tournament beside them, and the
page says so.

## Scroll and motion

- Top progress bar via `animation-timeline: scroll()`
- Pinned horizontal era pan via `view-timeline`, with a horizontal snap fallback
- Timeline spine drawn via `view-timeline`, falling back to a fully drawn rule
- Sticky turning point stack via cascading `position: sticky` offsets
- Staggered chapter reveals, figure counters, and active navigation via `IntersectionObserver`
- Marquee, magnetic primary CTA, press feedback, image hover lift

There is no `window.addEventListener("scroll")` anywhere in the project. Everything
above collapses to static under `prefers-reduced-motion: reduce`.

Full dark mode via `prefers-color-scheme`. Responsive down to 320px.

## Content

Text written for this project. Dates and figures follow FIFA's published record and
contemporary reporting. All 51 photographs came from Wikimedia Commons under free
licences, are served from this repository rather than hotlinked, and are credited by
author and licence in [CREDITS.md](CREDITS.md).

Current through the 2026 final of 19 July 2026, which Spain won 1 goal to 0 against
Argentina after extra time.

This is an independent history project. It is not affiliated with, endorsed by, or
connected to FIFA.
