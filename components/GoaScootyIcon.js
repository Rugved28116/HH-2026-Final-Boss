'use client';

/**
 * Authentic Retro Vespa Scooter SVG Icon.
 * Features the iconic bulbous side engine cowl, wide front leg-shield,
 * chrome horn grille, dual bench seat, and round chrome headlight.
 */
export default function GoaScootyIcon({ className = '', width = 46, height = 36 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 56 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Classic Goa Vespa Scooter"
    >
      {/* Ground Shadow */}
      <ellipse cx="28" cy="39" rx="22" ry="3" fill="#000000" fillOpacity="0.25" />

      {/* Rear Wheel */}
      <circle cx="42" cy="33" r="6" fill="#0A2A1D" stroke="#F7F2DE" strokeWidth="2" />
      <circle cx="42" cy="33" r="3" fill="#94A3B8" stroke="#0A2A1D" strokeWidth="1" />
      <circle cx="42" cy="33" r="1" fill="#F5D732" />

      {/* Front Wheel */}
      <circle cx="14" cy="33" r="6" fill="#0A2A1D" stroke="#F7F2DE" strokeWidth="2" />
      <circle cx="14" cy="33" r="3" fill="#94A3B8" stroke="#0A2A1D" strokeWidth="1" />
      <circle cx="14" cy="33" r="1" fill="#F5D732" />

      {/* Iconic Vespa Curved Bulbous Rear Side Panel (Engine Cowl) */}
      <path
        d="M26 30C26 23 30 19 38 19C45 19 49 23 48 30C47 34 42 35 36 35C30 35 26 33 26 30Z"
        fill="#F5D732"
        stroke="#0A2A1D"
        strokeWidth="2"
      />

      {/* Side Cowl Chrome Trim & Air Vent Slats */}
      <path d="M34 24H44M35 27H43M37 30H42" stroke="#0A2A1D" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="30" cy="27" r="1.5" fill="#EC1B78" />

      {/* Footrest Floorboard & Central Tunnel */}
      <path d="M18 31H32C34 31 35 32 35 34H16C16 32 17 31 18 31Z" fill="#0A2A1D" stroke="#0A2A1D" strokeWidth="1" />

      {/* Front Teardrop Mudguard (Fender) */}
      <path d="M9 31C9 26 12 24 18 24L17 31H9Z" fill="#F5D732" stroke="#0A2A1D" strokeWidth="2" />

      {/* Iconic Vespa Front Leg Shield (Apron) */}
      <path
        d="M14 31L11 15C10 11 13 8 18 8H20C22 8 23 10 23 12L20 31"
        fill="#EC1B78"
        stroke="#0A2A1D"
        strokeWidth="2"
      />

      {/* Center Horn Grille Trim */}
      <path d="M16 10V22" stroke="#F5D732" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M16 12V20" stroke="#0A2A1D" strokeWidth="1" strokeLinecap="round" />

      {/* Classic Dual Bench Seat */}
      <path
        d="M24 20C24 17 26 15 31 15H42C45 15 47 17 46 20V21H24V20Z"
        fill="#0A2A1D"
        stroke="#F7F2DE"
        strokeWidth="1.5"
      />
      <path d="M31 15V21" stroke="#F7F2DE" strokeWidth="1" strokeDasharray="1 1" />

      {/* Handlebar Column & Steering Stem */}
      <path d="M17 10L16 4H20L19 10" fill="#F5D732" stroke="#0A2A1D" strokeWidth="2" />

      {/* Handlebar Grips */}
      <path d="M13 5H23" stroke="#0A2A1D" strokeWidth="2.5" strokeLinecap="round" />

      {/* Iconic Round Vespa Headlight */}
      <circle cx="18" cy="4" r="4" fill="#F7F2DE" stroke="#0A2A1D" strokeWidth="2" />
      <circle cx="18" cy="4" r="2.5" fill="#F5D732" />
      <circle cx="16.5" cy="2.5" r="1" fill="#FFFFFF" />

      {/* Dual Chrome Rearview Mirrors */}
      <path d="M15 3L12 0" stroke="#0A2A1D" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="11" cy="0" r="1.5" fill="#F7F2DE" stroke="#0A2A1D" strokeWidth="1" />
      <path d="M21 3L24 0" stroke="#0A2A1D" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="25" cy="0" r="1.5" fill="#F7F2DE" stroke="#0A2A1D" strokeWidth="1" />
    </svg>
  );
}
