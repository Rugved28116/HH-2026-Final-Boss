# Design — HH Goa 2026 "Beach × Bytes"

Matched directly to the official HH Goa 2026 site (screenshots supplied as
reference): a retro Goan travel-poster illustration style — flat line art,
palm trees, a big flat sun, hand-lettered Devanagari accents — carrying the
"hacker" layer through small monospace/terminal details rather than tech
clichés. This replaces the earlier "Sunset Circuit" direction entirely; the
generated graphics should look unmistakably pulled from the same site.

---

## 1. Concept

A vintage beach travel poster layered with retro luggage-label stickers — 
as if years of travelers to Goa have plastered their journey marks onto 
the same poster. Green is the dominant color (not a neutral background — 
it *is* the brand), yellow and hot pink carry all the energy, and the 
illustration is white line-art on green rather than full-color scenery. 
Die-cut sticker shapes (shields, circles, banners, ribbons) overlap and 
rotate at slightly different angles, mimicking hand-applied travel labels 
from the 1930s–50s era. The "tech" identity shows up as small inset 
details (a terminal chip, a monospace tag, code-styled callouts) sitting 
inside an otherwise fully analog, hand-drawn world — not as circuits or 
gradients.

---

## 2. Color tokens

| Token | Approx. hex | Use |
|---|---|---|
| `green-deep` | `#0B3D2B` | Darkest background areas, shadow/outline color under yellow display type |
| `green-mid` | `#1F6B44` | Base background green, gradient midpoint |
| `green-light` | `#3E9B5C` | Lighter ground/beach areas at the bottom of a gradient |
| `yellow` | `#F5D732` | Primary accent — display type, pills, ring, CTAs |
| `pink` | `#EC1B78` | Secondary accent — script accents, ribbons, dashed borders, stamp seal |
| `cream` | `#F7F2DE` | Off-white for line-art strokes and light body text where pure white is too harsh |
| `white` | `#FFFFFF` | Line-art illustration strokes (palms, waves, birds, sun rays) |
| `ink` | `#0A2A1D` | Near-black green, used for body text set on yellow/pink |

No gold, no coral, no indigo, no dark-mode UI chrome — green *is* the dark
base color across both the site and the generated graphics.

---

## 3. Type

| Role | Face | Notes |
|---|---|---|
| Display / hero wordmark | **Fraunces**, weight 900 (or the closest flared slab serif available) | The big "HACKER HOUSE" treatment — bold, slightly vintage serif, not a geometric sans |
| Script accent | **Kalam** (has Devanagari support) | For hand-lettered accents like "गोवा" and any playful cursive callouts |
| Utility / tags / terminal | **Space Mono** or **JetBrains Mono** | Eyebrow tags, "#FRAMEINGOA", terminal-style lines, signpost labels |
| Digital/clock accent | **VT323** or another LCD-style face | Only for small digital-clock-style details (mirrors the site's "2:47 PM" mark) — used sparingly, not for body text |
| Body | **Inter** | Form labels, descriptive UI text outside the generated graphic itself |

Rule of thumb: three registers, used consistently — **serif** for the big
declarative wordmark, **mono** for anything that reads as data/tags/system
text, **script** only for the one hand-lettered accent per composition.
Never mix serif and script for the same word.

---

## 4. Vintage luggage-label sticker aesthetic (new layer on top of the poster)

This is the visual "glue" that makes the tool feel like a time-worn artifact 
rather than a freshly-printed badge:

- **Die-cut shapes:** shields (pointed-bottom), circles (simple rings), banners 
  (ribbon with pointed ends), badges (scalloped edges), and the occasional 
  hexagon or octagon — pulled from 1930s–50s steamship and hotel branding. 
  Each shape gets a thin cream or white outline/border (2–3px stroke) to 
  read as a discrete sticker even when overlapped.
- **Hand-rotated placement:** stickers should rotate at slightly different 
  angles (±5–15 degrees) as if placed by hand over years, not perfectly 
  aligned on a grid. This small detail is the difference between "badge" 
  and "collected stickers."
- **Slightly worn edges:** thin, subtle variations in the outline stroke 
  (not a full distortion filter, just a 1–2px irregularity in the border) 
  or a faint inner shadow to suggest age. Don't overdo this — restraint 
  reads as intentional, oversaturation reads as a filter.
- **Muted retro palette layering:** the sticker fills should use the core 
  brand colors (yellow, pink, green, cream) but sometimes with a slight 
  opacity shift or a paper-texture overlay to read as "aged" rather than 
  "fresh print."
- **Overlapping without chaos:** when stickers overlap (e.g. the QR code 
  in a corner, a stat ribbon crossing the bottom edge), the overlap should 
  read as intentional composition, not accidental — use z-order/layering 
  to guide the eye, not confuse it.

---

## 4b. Signature elements (pull at least two into every generated graphic)

- **Dashed bunting border** — a thin dashed line (alternating red/white or
  pink/white) framing badges and pills, like festival bunting. This is the
  fastest way to make something read as "this event" at a glance.
- **Circular stamp seal** — small dashed-circle badge with a star and short
  text ("GOA"), like a postal stamp. Works well as an "official" mark
  overlapping the photo ring.
- **Signpost ribbon** — an arrow-ended ribbon shape (points left or right),
  alternating yellow and pink fills, bold numeral/label in contrasting
  ink. Originally used for stats on the site; reusable here as a tag shape
  for short labels (e.g. a role tag).
- **Terminal chip** — a small dark rounded rectangle with three dot
  "window controls" and a line of monospace text (`> frame.goa[2026]`
  style). The one explicitly "hacker" motif — use once per composition,
  small, not centered.
- **Flat sun + rays** — a plain yellow half-circle or circle with straight
  line rays, sitting on a horizon. Good as a background anchor, not a
  foreground element (photo should never compete with it for attention).
- **White line-art doodles** — palm trees, waves, birds, a scooter, a
  cassette tape, sunglasses, a coconut drink — scattered at low density in
  empty corners, thin single-weight white stroke, no fill. These add
  texture without adding visual noise if kept small and sparse (2–4 per
  composition, not a border of them).
- **Bottom ticker bar** — a full-width dark green pill/bar, small caps or
  mono text, left-aligned event details and right-aligned wordmark,
  separated by a middle dot. Reads as an official footer strip — can itself
  be a die-cut banner or badge shape, not just a flat bar, to tie into the
  sticker aesthetic.
- **Sticker "wear" details:** thin scuff marks (barely visible, 1–2px lines
  or soft shadows) around the edges of key sticker shapes, especially the
  stamp seal, ribbons, and the QR code frame — suggests these have been
  there a while, picked at, traveled with. Keep this subtle; a 2–3% opacity
  inner shadow is enough.

---

## 5. Format A — PFP Frame layout

- Canvas: 1080×1080.
- Background: green gradient (deep green upper-left → mid green
  lower-right), with 2–3 small white line-art doodles at low opacity in the
  corners not covered by the ring (a palm frond, a few sun rays, a wave).
- Photo: cover-cropped into a centered circle, ~72% of canvas width.
- Ring: solid yellow stroke around the photo (~3% of canvas width thick).
- Bunting: a thin dashed pink/white ring just outside the yellow ring —
  the signature framing device.
- Stamp seal: small circular badge (dashed border, star, "GOA" in mono)
  overlapping the ring at roughly 2 o'clock position — reads as an
  official mark, not a sticker.
- Bottom banner: dark ticker-bar pill overlapping the bottom of the ring,
  "HACKER HOUSE GOA · 2026" — wordmark in yellow serif, date/location
  detail in small mono if space allows.

## 6. Format B — Builder ID Card layout

- Canvas: 1080×1512 (5:7 portrait).
- Background: same green gradient, white line-art palm trees anchored at
  the bottom corners (mirrors the site's beach-hut skyline), a flat sun
  with rays sitting near the top edge behind the header content.
- Header: small "HACKER HOUSE GOA" wordmark top-left in serif, small script
  "गोवा" pink accent tucked beside it — mirrors the real site's lockup
  rather than inventing a new one. Terminal chip top-right
  (`> builder.goa[2026]`).
- Photo: circular inset, same yellow-ring + pink-dashed-bunting treatment
  as Format A, centered below the header.
- Name: large Fraunces 900, yellow fill with a dark-green offset shadow
  (matches the site's hero-title treatment exactly — flat drop shadow, not
  a soft blur), auto-shrinks to fit width.
- Role: rendered as a **signpost ribbon** (arrow-ended, pink fill, yellow
  ink text) rather than a plain pill — directly reuses the site's stat-sign
  motif for a tag that would otherwise be generic.
- Builder title: sits inside a small terminal chip below the ribbon —
  `> title: "Prompt Whisperer"` in mono, pink text on the dark chip. This
  replaces the italic-script treatment from the old direction; it now
  carries the "hacker" register instead of a purely decorative one.
- Footer: full-width ticker bar — "GOA, INDIA · 28–31 OCT 2026" left,
  "HH GOA 2026" right, center dot divider — plus a small dashed-bunting
  `#FRAMEINGOA` pill sitting just above it.

---

## 6b. Format C — Team Squad Frame layout

- Canvas: 1200×630 (the OG-image ratio, so a shared link's card crops to
  the artwork rather than through it).
- Background: same green gradient, white line-art palm trees **flanking
  both sides** rather than the bottom corners — a landscape canvas has no
  tall corner to hang them in, and the sides are the only region the member
  row never occupies.
- Header band: full-bleed yellow banner across the top, "HACKER HOUSE GOA
  2026 · TEAM SQUAD" in Fraunces 900 ink caps, cream cut line along its
  lower edge only (the other three sides run off-canvas — outlining those
  would draw a border around the artwork).
- Beneath the band: the team name in mono caps (auto-shrinks to fit), then
  "GOA, INDIA · 28–31 OCT 2026" smaller and dimmer.
- Class + pass chips: two terminal chips centered as a pair — the pink
  `> class: "…"` and the yellow `pass HH26-XXXXXX`. Both carry a few
  degrees of tilt; they are small enough that rotation can't throw a corner
  off-canvas, unlike the header and footer bars, which stay level (§9b).
- Member row: 1–4 circles evenly spaced and centered, each with the same
  yellow-ring + pink/white bunting treatment as Formats A and B. Beneath
  each: the member's name in mono small caps, then a yellow `BUILDER 0N`
  tag — the device that makes the row read as a roster, not a row of
  avatars.
  - **Radius is derived from the active member count, not fixed.** Four
    across 1060px of usable width is the binding constraint; a radius that
    fits four would leave one or two looking lost, so height caps it the
    rest of the time. Ring weight and bunting gap scale with the circle so
    the treatment reads identically at any size.
  - The row is laid out downward from a **fixed top edge** rather than
    around a fixed centre — pinning the centre would walk the top edge up
    into the chip row as the radius grows.
  - An empty slot renders a dashed placeholder circle with `NO PHOTO
    UPLOADED` and **no solid yellow ring**; the ring is what distinguishes a
    filled member from a pending one at a glance.
- Footer: dark ticker bar — `#FrameInGoa · Oct 28–31, 2026 · GOA, INDIA ·
  hhgoa.com` left, with the hashtag and domain in yellow and the dividers
  in pink so it reads as a ticker rather than a caption. A small
  `4:26 PM STUDIO` clock mark sits at the right end in VT323, the one
  place per composition that face is used (§3).

---

## 7. UI chrome (the page around the canvas, not the generated graphic)

- Page background: `green-deep`, not black — the whole tool should feel
  like it's inside the same poster world. Optional: add a very faint paper
  texture or linen pattern (2–3% opacity) to reinforce the "vintage
  postcard" feeling without being obvious.
- Format tabs: pill switcher, active state filled yellow with ink text.
  The inactive pills can have a subtle worn/scuffed appearance (thin inner
  shadow) to suggest they've been "tapped before."
- Buttons: primary action (Download) yellow fill / ink text in a die-cut
  shield or banner shape (optional, can stay rectangular if it feels forced).
  Share to X a plain dark chip so it doesn't compete with X's own brand
  color. Both should have a subtle hover state (slight scale, slight shadow).
- Inputs: cream fields on dark green cards, thin pink border on focus.
  Optional: add a thin cream or white outline around the input (1–2px) to
  read as a discrete UI element, not merged into the background.
- Any UI micro-copy in mono type (matches the tags/eyebrows on the actual
  site) rather than the sans body face, for anything short and label-like.
- Decorative elements (doodles, the live counter display, QR frame): should
  all read as "stickers" — each in its own subtle die-cut boundary or with
  a thin outline + slight rotation, not floating seamlessly into the
  background.

---

## 8. Copy voice

Matches the site's own tone: short, punchy, lower-effort-feeling capitals
for tags ("BEACH × BYTES," "SUN · CODE · SURF" style constructions), plain
sentence case for anything longer. Buttons say what they do. No
exclamation marks, no "Generate Now!" energy — the site itself is
confident and understated despite the loud palette; the tool should match
that register rather than oversell itself.

---

## 9. What changed from the earlier "Sunset Circuit" direction

- Palette swapped from gold/coral/pink-on-black to green/yellow/pink —
  green is now the primary brand color, not a UI-only dark base.
- Circuit-trace ticks replaced by the dashed-bunting + stamp-seal +
  terminal-chip motifs, which are what the real site actually uses to
  signal "hacker."
- Display type moves from a geometric sans (Archivo Black) to a flared
  slab serif (Fraunces), matching the site's hero wordmark.
- Card layout now explicitly reuses the site's own signpost-ribbon and
  ticker-bar shapes for the role tag and footer, rather than generic pill
  shapes — this is the main thing that will make the output look like it
  belongs to this specific event rather than a reskin.

---

## 9b. Sticker placement & composition rules

When compositing multiple stickers/shapes on a single canvas (especially
Format B, which has the photo circle, role ribbon, QR frame, title chip,
ticker bar, and decorative elements):

- Each significant shape gets a slight rotation (±5–12 degrees) so the
  composition reads as "collected over time," not "perfectly gridded."
- Overlaps are intentional: a sticker edge can peek behind another, or a
  corner can break out of an invisible boundary — this reads as "stuck on
  top," which is the goal.
- Hierarchy is still visible: the photo circle is the primary focal point,
  not competing with overlapping decorative elements. Use z-order and
  opacity wisely.
- The overall composition should still feel balanced (not random), just
  *intentionally* off-center or asymmetrical in a way that suggests
  human curation rather than algorithmic layout.

---

## 10. Motion & delight

Added to satisfy the "smooth" and "eye-catching" non-negotiables — see
`prd.md` §0 and §4, `app-flow.md` §5–8 for where each of these fires.

**Timing/easing baseline:** short and springy, never linear. Tab switches,
button presses, and the title-reroll flicker should all use an
ease-out-back or spring curve (slight overshoot, quick settle) — this
reads as "considered" rather than "instant snap" or "slow fade," and
matches the slightly playful, hand-drawn character of the illustration
style. Nothing should take longer than ~400ms to settle; motion should
never make the tool feel slower than it is.

**Reveal animation (D1):** on first successful render of a given photo —
canvas scales from ~96% to 100% while fading in (not a hard cut), paired
with a brief particle burst around the canvas edge in `yellow` and `pink`.
Particles should feel like confetti/paper-scrap, not generic sparkles —
small rectangular or torn-paper shapes read closer to the poster-craft
aesthetic than circular sparkle particles would.

**Title reroll flicker (D2):** on shuffle, the title text cycles through
2–3 rapid placeholder values before settling on the final one — same
register as a departures-board flip or slot reel, not a random jitter.
Total duration under ~600ms so it never feels like a wait.

**Rare-tier treatment (D2):** a subtle animated foil/sheen sweep across
the title text or its container (a soft diagonal highlight passing once,
not looping indefinitely — a looping shimmer reads as a UI bug rather
than a deliberate flourish). Paired with a slightly heavier drop shadow
or a thin pink outline to distinguish it at a glance from a common result
even in a static screenshot, since that's how it'll actually get shared.

**Background parallax:** on desktop, the scattered line-art doodles
(§4) shift a few pixels opposite to cursor movement — subtle enough to
notice only on deliberate movement, never enough to feel like the page is
unstable. Skipped entirely on touch devices rather than simulated via
scroll or tilt.

**Reduced motion:** every animation described above has a static
equivalent (instant state change, no particles, no sheen sweep) gated
behind `prefers-reduced-motion`. This isn't a degraded experience to
apologize for — the static versions should still hit the aesthetic bar on
their own, since motion is additive polish, not the thing carrying the
design.