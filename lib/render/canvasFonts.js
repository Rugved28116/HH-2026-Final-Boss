// next/font emits obfuscated family names (see the note in lib/fonts.js), so
// canvas code resolves families off the CSS variables instead of hardcoding
// "Fraunces" / "Space Mono" — which would silently fall back to default faces.

export function cssFontFamily(varName, fallback) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
}

// Resolve the two families the canvas renderers use and make sure the actual
// faces are loaded before the first draw — document.fonts.load() is the only
// reliable "usable now" signal; drawing earlier rasterizes the fallback font
// into the bitmap.
//
// Load ONLY the first family from each variable: next/font appends a
// size-adjusted local() fallback face to the list, and asking fonts.load()
// for that face rejects with a NetworkError, which would otherwise abort the
// draw. The full list still goes into ctx.font so canvas keeps its fallback
// chain. Warm-up failures are non-fatal — a fallback-font render beats a
// blank canvas.
export async function resolveCanvasFonts() {
  const display = cssFontFamily('--font-fraunces', 'serif');
  const mono = cssFontFamily('--font-space-mono', 'monospace');
  const script = cssFontFamily('--font-kalam', 'cursive');
  // VT323, for the Format C clock mark. design.md §3 restricts this face to
  // sparing digital-clock accents, which is exactly that one signature detail.
  const lcd = cssFontFamily('--font-vt323', 'monospace');
  const primary = (list) => list.split(',')[0].trim();
  await Promise.allSettled([
    document.fonts.load(`900 64px ${primary(display)}`),
    document.fonts.load(`700 32px ${primary(mono)}`),
    document.fonts.load(`400 32px ${primary(mono)}`),
    // Sample text forces the Devanagari unicode-range face, not just latin.
    document.fonts.load(`700 48px ${primary(script)}`, 'गोवा'),
    document.fonts.load(`400 28px ${primary(lcd)}`),
  ]);
  return { display, mono, script, lcd };
}
