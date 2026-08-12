// Unique squad pass ID (schema.md §9). Client-side only, like the builder
// title — no server round trip, so a reroll is instant by construction.

export const PASS_PREFIX = 'HH26';
export const PASS_SUFFIX_LEN = 6;

/**
 * Crockford-ish alphabet: no 0/O, 1/I/L, or U. The ID is meant to be read off
 * a rendered graphic and typed back in, and those are the pairs people
 * transcribe wrong. 32 symbols keeps it a clean 5 bits per character.
 */
const ALPHABET = 'ABCDEFGHJKMNPQRSTVWXYZ23456789';

/**
 * Rejection-sampled so every symbol is equally likely. `% ALPHABET.length` on a
 * raw byte would bias toward the first 16 symbols, which is invisible in one ID
 * but shows up as repeated leading characters across a room full of cards.
 */
function randomSymbols(count) {
  const out = [];
  const limit = Math.floor(256 / ALPHABET.length) * ALPHABET.length;

  while (out.length < count) {
    const bytes = new Uint8Array(count * 2);
    crypto.getRandomValues(bytes);
    for (const byte of bytes) {
      if (out.length === count) break;
      if (byte < limit) out.push(ALPHABET[byte % ALPHABET.length]);
    }
  }
  return out.join('');
}

/**
 * @param {string|null} avoid an ID not to return — a reroll that visibly does
 *   nothing reads as a broken button, same reasoning as rollTitle's `avoid`.
 * @returns {string} e.g. "HH26-7KQ2WX"
 */
export function rollPassId({ avoid = null } = {}) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const id = `${PASS_PREFIX}-${randomSymbols(PASS_SUFFIX_LEN)}`;
    if (id !== avoid) return id;
  }
  // 30^6 ≈ 7.3e8 possibilities, so eight collisions in a row is not reachable
  // in practice; returning anyway keeps the function total.
  return `${PASS_PREFIX}-${randomSymbols(PASS_SUFFIX_LEN)}`;
}

/**
 * Display-only filler for the reroll flicker, matching flickerCandidates in
 * lib/title/pools.js. Never starts on `from` or ends on `to`, so the reel
 * always visibly moves and never lands twice.
 */
export function flickerPassIds(count, { from = null, to = null } = {}) {
  const out = [];
  let prev = from;
  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    let pick = rollPassId({ avoid: prev });
    if (isLast && pick === to) pick = rollPassId({ avoid: to });
    out.push(pick);
    prev = pick;
  }
  return out;
}
