# App Flow — HH Goa 2026 Frame / ID Card Generator

Single-page flow, no navigation between routes except the share landing
page (exists only for X's link-preview crawler). Every state below is
written with the non-negotiables in mind: nothing should feel like a form
submission, and the moment of getting a result should feel like a payoff.

---

## 0. Entry

- User lands on the page directly. No splash, no gate, no login.
- Background doodles (palm fronds, sun rays — `design.md` §4) are
  present from first paint, not popped in late — avoids a layout-shift
  feeling on load.
- Live frames-created counter (D4) visible near the top, already showing
  a real number on load, not a placeholder that pops in.
- Format selector visible immediately, defaulted to one format.

**State:** empty canvas area with a placeholder prompt. The placeholder
itself should carry brand texture (a faint line-art doodle), not be a
bare gray box.

---

## 1. Format selection

- Toggle between **PFP Frame** and **Builder ID Card**, spring-eased
  transition on the active pill (matches `design.md` motion addendum),
  not an instant color swap.
- Switching format after a photo is already uploaded: re-renders
  immediately using the same photo.
- Switching format clears format-specific fields from view but doesn't
  discard them if the user switches back.

---

## 2. Photo upload

**Trigger:** tap the upload area, or drag-and-drop on desktop.

**Accepted input:** JPG, PNG, WEBP, HEIC, HEIF.

**Processing steps (all client-side):**
1. If HEIC/HEIF → convert to JPEG.
2. Normalize EXIF orientation.
3. Load into an in-memory image object.
4. Trigger render (step 4) *and* the reveal sequence (step 5).

**States:**
- *Drag-over* — dropzone border/fill responds immediately on dragenter,
  not just on drop; this is a cheap, high-value smoothness signal.
- *Reading photo* — brief inline status, not a full-screen spinner.
- *Error* — unreadable file, corrupt HEIC conversion, unsupported format:
  inline error message, upload area stays interactive. Never a dead end.
- *Success* — photo loads, flow proceeds automatically; no separate
  "confirm" step.

---

## 3. Field entry (Format B only)

- **Name** — required, short text input.
- **Stack/role** — required, short text input.
- **Builder title** — auto-generated the moment Stack/role has content.
  Read-only, with a shuffle control (🎲) for a reroll.
  - Reroll animation: the title text does a quick flicker/cycle through
    2–3 candidates before landing (slot-machine-lite, not instant swap) —
    this is what makes rerolling *feel* like a chase, which is the point
    of the rarity mechanic (D2).
  - If the landed title is a **rare** tier, the field gets a distinct
    treatment (subtle foil shimmer or sparkle accent) that a common title
    doesn't get — visible enough to notice and want to screenshot,
    restrained enough not to look like a bug.

**State:** live re-render on every keystroke/shuffle — no "apply" button.

---

## 4. Live render

- Canvas updates automatically whenever photo, format, or (Format B) any
  field changes.
- No explicit "Generate" button — result is always the current input
  state.
- Canvas sized per format, scaled responsively to fit viewport.
- Render work chunked/scheduled so typing in the Name field never
  produces a dropped keystroke or visible input lag, even while a
  redraw is in flight.

---

## 5. Reveal moment (D1)

Fires the first time a given photo produces a complete, valid render (not
on every subsequent minor edit — re-triggering it on every keystroke would
cheapen it):

1. Canvas scales/fades in rather than snapping into view.
2. A short particle burst in brand yellow/pink plays around the canvas
   edge, sub-second, non-blocking — the user can start typing or tap
   Download immediately without waiting for it to finish.
3. Respects `prefers-reduced-motion` — falls back to a plain fade, no
   particles, if set.

This is the single moment the whole "eye-catching" requirement hinges on;
everything else in the flow is intentionally calm so this doesn't compete
with anything.

---

## 6. Output actions

Two primary actions, disabled until a valid photo is loaded (and, for
Format B, until Name + Stack/role are filled):

### Download
1. Canvas exported to a PNG blob.
2. Browser download triggered with a descriptive filename.
3. Inline confirmation ("Downloaded ✓").
4. No network call — works offline once the page has loaded.
5. Increments the live counter (D4) — see `schema.md` §7 for how this is
   done without opening up abuse.

### Share to X
1. Canvas exported to a PNG blob.
2. Blob uploaded to storage → public image URL returned.
3. Share-landing URL constructed pointing at that image via OG tags.
4. X's tweet-intent URL opened in a new tab, pre-filled with caption +
   `#FrameInGoa` + the share-landing URL.
5. **Failure path:** upload failure → inline message, automatic fallback
   to Download. Never a dead end.

---

## 7. QR code (Format B, D3)

- Rendered directly into the card canvas (bottom corner, small, doesn't
  compete with the photo or name).
- Encodes the tool's root URL — not a per-user or per-card unique link;
  no state to manage, no lookup needed.
- Present in every downloaded/shared card automatically — no separate
  toggle or step for the user, it's just part of the card.

---

## 8. Live counter (Format-agnostic, D4)

- Displayed near the top of the page as a signpost-ribbon element
  (`design.md` §4), consistent with the site's own stat-display language.
- Fetched once on page load; incremented (optimistically on the client,
  confirmed server-side) on each successful Download or Share.
- If the fetch/increment fails, the counter simply doesn't update — this
  must never block or visibly break the rest of the page.

---

## 9. Share-landing page (`/s/[id]`)

Not a user-facing destination in the normal flow — exists so X's crawler
has a page to read `og:image`/`twitter:image` from.

- Shows the generated image and a "make your own" link back to the tool.
- Carries the same visual system (not a bare white utility page) so
  anyone who does land on it from curiosity still sees an on-brand page.

---

## 10. Edge cases to handle explicitly

| Case | Expected behavior |
|---|---|
| Very large uploaded image (12MP+) | Still renders promptly — downscale during canvas draw |
| Non-image file uploaded | Rejected with clear inline message, upload area stays usable |
| Name/Stack blank (Format B) | Actions stay disabled with a subtle hint of what's missing |
| Double-tap Share | Second tap ignored/debounced while first upload in flight |
| Network drops mid-share | Falls back to Download |
| Counter fetch fails | Page still works; counter just doesn't display/update |
| `prefers-reduced-motion` set | Reveal animation, parallax, and title-shuffle flicker all degrade to instant/static equivalents |
| Low-end device | Particle burst and parallax degrade gracefully rather than dropping frames — see `plan.md` Phase 7 |
| User revisits later | Stateless — no persisted history, clean slate each visit |
