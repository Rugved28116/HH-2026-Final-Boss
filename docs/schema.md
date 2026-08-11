# Schema — HH Goa 2026 Frame / ID Card Generator

Still intentionally close to stateless — no accounts, no per-user records.
Three things now touch shared state instead of one: the share-image
upload (as before), the live frames-created counter, and the
rarity-weighted title pool (this one's just static config, not runtime
data, but documented here since it drives a user-facing mechanic).

---

## 1. Client-side state (in-memory, never persisted)

```
AppState {
  format: "pfp" | "card"
  photo: {
    image: HTMLImageElement
    sourceType: "jpg" | "png" | "webp" | "heic"
  } | null
  fields: {                        // Format B only
    name: string                   // required, max ~28 chars
    role: string                   // required, max ~24 chars
    builderTitle: {
      text: string
      tier: "common" | "rare"      // drives the foil/sparkle treatment
    }
  }
  render: {
    canvasWidth: number             // 1080 (both formats)
    canvasHeight: number            // 1080 (pfp) | 1512 (card)
  }
  hasRevealed: boolean              // gates the D1 reveal animation to once per photo
}
```

Nothing here leaves the browser unless the user hits Share or Download
(download only triggers the counter increment, §7 — never the photo).

---

## 2. Share upload — request

`POST /api/share`

`multipart/form-data`:

| Field | Type | Notes |
|---|---|---|
| `file` | binary (PNG) | The exported canvas, ≤ ~5MB typical |

No auth, no user identifier.

---

## 3. Share upload — response

```json
{
  "shareUrl": "https://<host>/s/<encoded-image-url>",
  "imageUrl": "https://<storage-host>/<path>/<id>.png"
}
```

Error shape:

```json
{ "error": "no_file" | "upload_failed" }
```

Client behavior on error: fall back to a direct download (`app-flow.md` §6).

---

## 4. Stored object naming

```
<bucket>/hhgoa-2026/<random-id>.png
```

- `random-id`: short random token, not derived from any user data.
- Public, unauthenticated read access (required for X's crawler and the
  share-landing page).
- Retention: not required to be permanent — a 30–90 day cleanup policy is
  fine, since nobody revisits their own share URL after posting.

---

## 5. Share-landing page data

Route: `/s/[slug]`, `slug` = URL-encoded `imageUrl` from §3. No lookup
table — the page decodes the slug directly back into the image URL.

```
generateMetadata({ params: { slug } }) → {
  openGraph.images: [{ url: decode(slug), width: 1080, height: variable }]
  twitter: { card: "summary_large_image", images: [decode(slug)] }
}
```

---

## 6. QR code (D3)

No schema needed — it's generated entirely client-side at render time,
encoding a fixed constant:

```
QR_TARGET_URL = "https://<production-domain>/"
```

Drawn directly into the Format B canvas as part of the same render pass
that draws the photo and text (a QR-generation library that can output to
`<canvas>` or an image buffer directly, so it composites in one pass with
everything else). No per-card uniqueness, no server round trip, no
storage — this is deliberately the simplest possible implementation of a
growth-loop feature.

---

## 7. Live counter (D4)

The one piece of genuinely shared mutable state in the product. Kept as
narrow as possible on purpose:

**Storage:** a single atomic counter (e.g. a key-value store's `INCR`
primitive — Vercel KV / Upstash Redis are natural fits alongside Vercel
Blob). Not a database table, not a row per event — one key.

```
KEY: "hhgoa2026:frames_created"
VALUE: integer
```

**Endpoints:**

`GET /api/counter` → `{ "count": number }`
- Called once on page load to populate the initial display.

`POST /api/counter/increment` → `{ "count": number }`
- Called after a successful Download or a successful Share upload.
- **Abuse resistance, kept lightweight:** rate-limit by IP (a handful of
  increments per minute is plenty for a real user generating a couple of
  variants) rather than building any auth around it. The counter is a
  vanity/social-proof feature, not a source of truth for anything —
  perfect accuracy isn't required, just resistance to trivial
  one-line-script inflation.
- If this call fails, the client-side displayed number simply doesn't
  update. Never blocks Download/Share themselves.

**What's deliberately not built:** no per-user tracking of who
incremented it, no leaderboard, no historical time-series — just a number.

---

## 8. Builder title pools (rarity-weighted)

Replaces the flat pool from the earlier draft. Still fully client-side,
no API call, no LLM — keeps the "instant" requirement intact.

```
TITLE_POOLS: {
  default: { common: string[], rare: string[] }
  ai:      { common: string[], rare: string[] }   // role contains: ai, ml, llm, gpt, agent
  frontend:{ common: string[], rare: string[] }   // role contains: front, react, next, ui, ux
  backend: { common: string[], rare: string[] }   // role contains: back, infra, devops, data, node, api
  design:  { common: string[], rare: string[] }   // role contains: design
  founder: { common: string[], rare: string[] }   // role contains: found, ceo, pm, product
}

RARE_WEIGHT = 0.12   // ~1 in 8 rolls lands rare — frequent enough to be
                      // chased, rare enough to feel worth screenshotting
```

**Selection:** keyword match on `role` → pick pool → roll tier against
`RARE_WEIGHT` → random entry from that tier's list.

**Rendering difference:** a `rare` result gets the foil/sparkle treatment
described in `design.md`'s motion addendum; `common` does not. This
distinction is what makes rerolling (`app-flow.md` §3) a mechanic instead
of a cosmetic detail.

---

## 9. Config / environment

| Var | Required for | Notes |
|---|---|---|
| Object storage credentials (e.g. blob read/write token) | `/api/share` upload | Not needed for the core render→download path |
| KV/Redis connection string | `/api/counter*` | Only if D4 is built; the rest of the product works without it |

No database URL, no auth provider, no third-party API keys beyond these two.

---

## 10. What's deliberately absent

- No `users` table — no accounts.
- No `generations` table — downloads aren't individually recorded, only
  counted in aggregate (§7).
- No per-card QR uniqueness — one fixed target URL, no tracking of scans.
- No analytics schema beyond the single counter — if richer usage
  tracking is wanted later, it should be added as a genuinely separate
  concern, not bolted onto `/api/share` or `/api/counter`.
