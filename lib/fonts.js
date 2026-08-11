import { Fraunces, Inter, Kalam, Space_Mono, VT323 } from 'next/font/google';

// The five faces from docs/design.md §3. Loaded via next/font so they're
// self-hosted at build time — no request to fonts.googleapis.com, and no FOUT,
// which matters for the "no layout shift on load" criterion in plan.md Phase 7.
//
// Each exports a `variable` class name; layout.js puts all five on <html> and
// globals.css maps them onto semantic --font-* aliases.

// Display / hero wordmark. Variable font (100–900), so no `weight` here —
// ask for `font-weight: 900` at the usage site.
export const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
});

// Script accent. Static face, so `weight` is required. The devanagari subset is
// not optional — design.md §6 sets "गोवा" in this face.
export const kalam = Kalam({
  subsets: ['latin', 'devanagari'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-kalam',
});

// Utility / tags / terminal chips. Static face.
export const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-space-mono',
});

// LCD accent, used sparingly (design.md §3). Single weight.
export const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-vt323',
});

// Body / form UI outside the canvas. Variable font.
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const fontClassNames = [
  fraunces.variable,
  kalam.variable,
  spaceMono.variable,
  vt323.variable,
  inter.variable,
].join(' ');

// --- Note for the Phase 1 canvas work ---
// next/font emits an obfuscated family name (e.g. `__Fraunces_a1b2c3`), so
// canvas code can NOT hardcode `ctx.font = '900 72px Fraunces'` — that silently
// falls back to a default serif. Instead resolve the family off the CSS
// variable and wait for the face before the first draw:
//
//   const family = getComputedStyle(document.documentElement)
//     .getPropertyValue('--font-fraunces').trim();   // may include a fallback list
//   await document.fonts.load(`900 72px ${family}`);
//   ctx.font = `900 72px ${family}`;
//
// Do this once, before the initial render pass, not per draw call.
