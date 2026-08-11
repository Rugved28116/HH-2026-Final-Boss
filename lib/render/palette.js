// Canvas 2D color token management (design.md §2).
// Supports dual theme modes: 'sun' (Goa Sun) and 'sunset' (Goa Sunset).

export function withAlpha(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

export const THEME_PALETTES = {
  sun: {
    greenDeep: '#0B3D2B',
    greenMid: '#1F6B44',
    greenLight: '#3E9B5C',
    yellow: '#F5D732',
    pink: '#EC1B78',
    cream: '#F7F2DE',
    white: '#FFFFFF',
    ink: '#0A2A1D',
  },
  sunset: {
    greenDeep: '#161124',
    greenMid: '#2D1E4A',
    greenLight: '#523270',
    yellow: '#FFB703',
    pink: '#FB8500',
    cream: '#FCEFB4',
    white: '#FFFFFF',
    ink: '#0F091A',
  },
};

export const PALETTE = THEME_PALETTES.sun;

export function getPalette(themeMode = 'sun') {
  return THEME_PALETTES[themeMode] || THEME_PALETTES.sun;
}
