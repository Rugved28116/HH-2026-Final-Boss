# PRD — HH Goa 2026 Frame / ID Card Generator

**Status:** Draft
**Context:** HH Goa 2026 shortlisting task

---

## 0. Non-negotiables

These override convenience or scope-cutting anywhere else in this doc set:

1. **Smooth.** Every interaction — upload, field typing, format switch,
   render — should feel fluid, not janky. No visible re-paint stutter, no
   layout jump, no interaction that blocks the main thread.
2. **Eye-catching and aesthetically pleasing.** This isn't a utility form
   with a logo on it. The page itself should look like it belongs on the
   HH Goa 2026 site, and the *moment of getting your result* should feel
   like a small payoff, not a form submission.
3. **Built to win, not just to satisfy the brief.** Where the brief
   describes the minimum ("a tool that generates a graphic"), this doc set
   adds the specific things judged submissions actually get remembered
   for — see §4.
4. **Unique.** Assume every other shortlisted team also themes their
   output green/yellow/pink once they see the same site. The
   differentiators in §4 exist so this submission isn't distinguishable
   from theirs by palette alone.

---

## 1. Problem & goal

People at/around HH Goa 2026 want a fast, no-friction way to turn a selfie
into an on-brand, shareable graphic that signals "I'm part of this event"
and drives organic reach on X.

**Goal:** upload a photo → get a branded graphic in seconds → download or
post to X with the image visible in the tweet preview. Zero accounts, zero
loading screens, works on a phone.

**Non-goal:** general-purpose design tool. One photo in, one fixed layout
out. No manual repositioning or multi-photo support in v1.

---

## 2. Success criteria

- Upload → downloaded image in under 10 seconds of active waiting, on
  mobile data.
- A tweet posted through Share shows the actual generated graphic in the
  link preview card, not a blank thumbnail.
- Works correctly on: an iPhone HEIC photo, an off-center crop, and a
  landscape photo — without the user pre-cropping.
- Zero login/signup steps anywhere in the flow.
- **Interaction smoothness:** sustained 60fps during drag/upload/type
  interactions; no interaction feels delayed by more than ~100ms.
- **Memorability:** someone who tries 3–4 competing submissions back to
  back should be able to describe something specific about this one
  afterward — a mechanic, not just "it had a nice frame."

---

## 3. Formats

**Format A — PFP Frame:** photo in a circular window, wrapped in the
site's yellow ring + dashed-bunting + stamp-seal treatment. Square output,
ready as an X profile picture. Only input: the photo.

**Format B — Builder ID Card:** photo + Name + Stack/role + an
auto-generated (and rerollable, rarity-weighted) "builder title," laid out
like an event badge, with a QR code linking back to the tool. Portrait
output, meant to be posted as an image.

Both share one visual system (`design.md`) so they read as the same event.

---

## 4. Differentiators — why this wins

Ranked by effort-to-impact; all are scoped small enough to fit alongside
the core build, not instead of it.

| # | Feature | Why it matters |
|---|---|---|
| D1 | **Reveal animation + confetti burst** | The single highest-leverage "eye-catching" investment — the moment of getting your result should feel earned, not just rendered. Brand-colored particles (yellow/pink), sub-second, non-blocking. |
| D2 | **Rarity-weighted builder titles** | Turns a static field into a collectible mechanic. Most titles are common; a handful are rare and get a small foil/sparkle visual treatment on the card itself. People reroll to chase a good one, which is inherently more shareable than a plain generated tag. |
| D3 | **QR code on the Builder ID Card** | Links back to the generator. If cards get posted, printed, or shown around the venue, the QR *is* the growth loop — this is the one feature that makes the tool self-propagating rather than a one-off. |
| D4 | **Live "frames created" counter** | Reuses the site's own signpost-ribbon stat motif (`design.md` §4) to show real-time social proof ("1,204 frames made"). Makes the tool feel alive and event-specific rather than a generic template site. |
| D5 | **Motion-consistent micro-interactions** | Subtle parallax on background doodles on mouse move (desktop), a satisfying shutter-style animation on generate, spring-eased transitions on tab switches — cumulative effect of "smooth," not any single flashy moment. |

All four (D1–D4) are described in implementation detail in `app-flow.md`
§8 (states), `schema.md` §6–7 (counter + rarity data), and `plan.md`
Phase 6.

---

## 5. Requirements

### Functional

| # | Requirement | Notes |
|---|---|---|
| F1 | Accept JPG, PNG, WEBP, HEIC/HEIF uploads | HEIC needs client-side conversion |
| F2 | Handle any input aspect ratio / off-center subject, no pre-cropping required | Cover-fit crop into target shape, centered |
| F3 | Correct photo orientation regardless of EXIF metadata | Common phone-photo failure mode |
| F4 | Generate the graphic client-side, near-instantly | No server round trip to render |
| F5 | Format B: capture Name + Stack/role, auto-generate a rarity-weighted builder title | See `schema.md` §7 |
| F6 | Download produces a real image file | Not a screenshot workaround |
| F7 | Share to X opens a pre-filled tweet with caption + `#FrameInGoa` | Via X web intent URL |
| F8 | X link preview shows the actual generated graphic | Needs hosted image + `og:image` page |
| F9 | No login/signup anywhere | Including the share step |
| F10 | Fully usable on mobile viewport widths | Primary usage channel |
| F11 | Reveal animation + particle burst plays on successful render | Non-blocking, skippable by continued interaction |
| F12 | Format B card includes a scannable QR code linking to the tool's root URL | See `schema.md` §6 |
| F13 | Live counter of frames created, visible on the page | See `schema.md` §7 |
| F14 | Rerolling the builder title has a distinct micro-animation, with a visually different treatment for rare titles | See `design.md` motion addendum |

### Non-functional

- **Performance:** generation feels instant (<1s perceived); all canvas
  work and animation run without blocking user input. Target 60fps for
  any animated UI element; degrade gracefully (reduce/skip motion) on
  low-end devices rather than stutter.
- **Reliability:** the only network-dependent steps are Share-to-X upload
  and the live counter; both must fail silently/gracefully without
  blocking download or the rest of the experience.
- **Privacy:** photos aren't stored anywhere unless the user hits Share.
  The counter stores a number, never any per-user data.
- **On-brand:** one consistent visual system across both formats and the
  UI chrome — see `design.md`.
- **Accessibility baseline:** motion-heavy elements (confetti, parallax)
  respect `prefers-reduced-motion`.

---

## 6. Out of scope (v1)

- Manual photo repositioning/zoom.
- Multiple layout/theme choices per format.
- Accounts, saved history, gallery of past generations.
- Printable card export (Format B is social-only; QR code is digital-first).
- Server-side AI generation of the builder title.
- Animated/video export (considered, cut for scope — see `plan.md` Phase 6 note).

---

## 7. Risks / validate early

- HEIC conversion reliability — test with real iPhone photos.
- X's crawler caches preview cards aggressively — confirm each share gets
  a unique URL so previews don't go stale or collide between users.
- Cover-fit crop can clip faces on badly off-center photos.
- Confetti/motion work must not tank performance on mid-range Android —
  test on an actual low-end device, not just a laptop dev tools throttle.
- The live counter is the one piece of shared mutable state in an
  otherwise stateless product — needs a solution that can't be trivially
  spammed to inflate the number (see `schema.md` §7 for the approach).

---

## 8. Open decisions

1. Format A, B, or both for the shortlisting submission? (Recommendation:
   both — Format B carries D2/D3/D4, which is where most of the
   differentiation lives.)
2. Hosting platform (affects storage/counter approach — `schema.md` §7)?
3. Exact caption copy for the pre-filled tweet, beyond `#FrameInGoa`?
4. Final rarity tier names/weights for builder titles — see `schema.md` §7.

See `app-flow.md` for the step-by-step flow (including motion states),
`design.md` for the visual system, `schema.md` for data/API shapes, and
`plan.md` for the build sequence.
