import { Fraunces, Inter, Kalam, Space_Grotesk, Space_Mono, VT323 } from 'next/font/google';

// The faces from docs/design.md §3. Loaded via next/font so they're
// self-hosted at build time — no request to fonts.googleapis.com, and no FOUT.

export const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
});

export const kalam = Kalam({
  subsets: ['latin', 'devanagari'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-kalam',
});

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

export const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
  variable: '--font-space-mono',
});

export const vt323 = VT323({
  subsets: ['latin'],
  weight: '400',
  display: 'swap',
  variable: '--font-vt323',
});

export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const fontClassNames = [
  fraunces.variable,
  kalam.variable,
  spaceGrotesk.variable,
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
