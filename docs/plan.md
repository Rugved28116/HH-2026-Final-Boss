# Plan — HH Goa 2026 Frame / ID Card Generator

Build order chosen so there's a working, demoable product after every
phase — never a long stretch with nothing to show. Differentiators (D1–D4
from `prd.md` §4) are their own phase, deliberately after the core flow
works end to end, so they're additive polish on something solid rather
than risk to the base requirements.

---

## Phase 0 — Decisions (blocking, do first)

- [ ] Confirm scope: Format A only, B only, or both (recommendation: both)
- [ ] Confirm hosting platform (affects storage + counter choice, `schema.md` §9)
- [ ] Lock the palette/type/motif in `design.md` — no design churn once
      building starts
- [ ] Lock rarity tier names/weights for builder titles (`schema.md` §8)

---

## Phase 1 — Static render, no upload yet

Goal: prove the visual system works before wiring any interactivity.

- [ ] Draw the PFP frame on canvas with a placeholder photo
- [ ] Draw the Builder ID card on canvas with placeholder photo + fields
      + QR code placeholder
- [ ] Verify both at actual output resolution (1080×1080 / 1080×1512),
      not just on-screen scaled size
- [ ] Self-critique against `design.md` — does it read as this event, or
      as a generic badge? Revise before moving on.

**Demo at end of phase:** a page that shows the two finished graphics with
hardcoded input.

---

## Phase 2 — Real photo input

- [ ] File picker + drag-and-drop, with immediate dragenter visual feedback
- [ ] Cover-fit crop logic (arbitrary aspect ratio → target shape, centered)
- [ ] EXIF orientation normalization
- [ ] HEIC/HEIF conversion path
- [ ] Error states for unreadable/unsupported files
- [ ] Test against real phone photos: an iPhone HEIC, an Android
      screenshot-crop, a landscape shot, a heavily off-center portrait

**Demo at end of phase:** upload any real photo → correct-looking
graphic, every time, no pre-cropping.

---

## Phase 3 — Format B fields + rarity-weighted builder title

- [ ] Name / Stack-role inputs, wired to live re-render
- [ ] Rarity-weighted title pools + keyword matching (`schema.md` §8)
- [ ] Shuffle control with the flicker/cycle reroll animation (`app-flow.md` §3)
- [ ] Foil/sparkle treatment for rare-tier results
- [ ] Field validation gating the output actions

**Demo at end of phase:** full Format B flow works end to end, title
reroll feels like a mechanic, still without Download/Share.

---

## Phase 4 — Download

- [ ] Canvas → PNG blob → triggered file download
- [ ] Confirm real file output on both desktop and mobile browsers
- [ ] Filename convention
- [ ] QR code composited into the Format B canvas as part of the same
      render pass (`schema.md` §6)

**Demo at end of phase:** both formats fully usable start-to-finish
except X share preview and the two social/proof features.

---

## Phase 5 — Share to X

- [ ] `/api/share` upload endpoint (`schema.md` §2–4)
- [ ] Object storage wired up + public read access confirmed
- [ ] `/s/[slug]` landing page with correct `og:image`/`twitter:image` tags,
      styled to match the brand system (not a bare utility page)
- [ ] Verify OG tags resolve correctly using a card validator before
      trusting it live
- [ ] Tweet-intent URL construction (caption + `#FrameInGoa` + share URL)
- [ ] Failure fallback: upload failure → auto-download, inline message

**Demo at end of phase:** posting through Share shows the real graphic in
the tweet preview.

---

## Phase 6 — Differentiators (D1–D4)

The phase that exists specifically for the "win" and "unique" non-negotiables.

- [ ] **D1 Reveal animation:** scale/fade-in on first successful render
      per photo, brand-colored particle burst, respects
      `prefers-reduced-motion`, never blocks interaction
- [ ] **D4 Live counter:** `/api/counter` + `/api/counter/increment`
      wired to a KV store, signpost-ribbon display component, silent
      failure if unavailable
- [ ] **D3 QR code:** confirm it actually scans correctly at the final
      rendered size (test with a real phone camera, not just a validator)
- [ ] **D2 Rarity treatment:** confirm the rare-tier visual distinction
      reads clearly at both on-screen preview size and full export
      resolution
- [ ] Considered-and-cut: animated/video export — noted in `prd.md` §6 as
      out of scope; revisit only if every other phase is done early with
      time to spare, since it's the one item here with real scope risk

**Demo at end of phase:** the product now has something a judge will
specifically remember, not just "a nice frame."

---

## Phase 7 — Motion & performance pass

This is where "smooth" gets verified, not assumed.

- [ ] Profile render + input handling on an actual mid/low-end Android
      device, not just a laptop
- [ ] Confirm typing in Name/Role never drops a keystroke during a redraw
- [ ] Confirm parallax/confetti degrade gracefully (reduced/skipped, not
      stuttering) under load
- [ ] Confirm `prefers-reduced-motion` is honored everywhere motion was
      added in Phase 6
- [ ] Tab-switch and reroll animations feel spring-eased, not linear/robotic
- [ ] No layout shift on load (counter, doodles, placeholder all present
      from first paint)

**Demo at end of phase:** the product feels fast and considered on a
real, unimpressive phone — not just on the dev machine.

---

## Phase 8 — Mobile pass + visual/copy polish

- [ ] Full pass on an actual phone
- [ ] Tap targets, input focus behavior, viewport meta correctness
- [ ] Copy pass against `design.md` §8 voice guidelines
- [ ] Final on-brand gut check: does this look like it was made by the
      same people who made the real site, or like a reskin of a template?

---

## Phase 9 — Ship

- [ ] Deploy
- [ ] Confirm live share flow with a real tweet post
- [ ] Confirm the QR code scans correctly from a printed or screen-displayed card
- [ ] Confirm the live counter persists correctly across a few real
      Download/Share actions
- [ ] Confirm no login/signup gate anywhere in the deployed version
- [ ] Submit live link

---

## Testing checklist (run before submission, not just once mid-build)

- [ ] iPhone HEIC photo, both formats
- [ ] Android photo, both formats
- [ ] Landscape photo
- [ ] Extremely off-center portrait
- [ ] Non-image file upload (errors cleanly)
- [ ] Empty Name/Role fields (Format B) — actions correctly disabled
- [ ] Share with network throttled/offline — fallback triggers correctly
- [ ] Actual tweet posted from the flow — preview card shows the image
- [ ] Full flow on mobile data speeds, not just local wifi
- [ ] Reveal animation + confetti on a real photo, real device
- [ ] Title reroll a dozen times — rare tier actually appears and looks
      visually distinct
- [ ] QR code scanned with a real phone camera, from the exported image
- [ ] Counter increments visibly after a real Download/Share, and doesn't
      break the page if the counter API is down
- [ ] `prefers-reduced-motion` enabled — page still fully usable, just calmer
