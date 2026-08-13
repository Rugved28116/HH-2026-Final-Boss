'use client';

/**
 * Aesthetic Goa Coconut Palm Tree SVG Icon.
 * Features a tropical curved trunk, lush green palm fronds, and coconuts.
 */
export default function GoaPalmIcon({ className = '', width = 36, height = 36 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Goa Coconut Tree"
    >
      {/* Ground Mound */}
      <ellipse cx="24" cy="44" rx="14" ry="2.5" fill="#0A2A1D" opacity="0.3" />

      {/* Curved Trunk */}
      <path
        d="M21 44C21 44 26 32 23 20C22 17 21 15 21 15"
        stroke="#8B5E3C"
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* Trunk Ring Segments */}
      <path d="M21.5 40L24.5 39M22.5 34L25.5 33M23.5 28L25.5 27M23 22L24.5 21" stroke="#5C3A21" strokeWidth="1.5" strokeLinecap="round" />

      {/* Coconuts */}
      <circle cx="19" cy="16" r="2.5" fill="#F5D732" stroke="#0A2A1D" strokeWidth="1" />
      <circle cx="23" cy="17" r="2.5" fill="#A67C52" stroke="#0A2A1D" strokeWidth="1" />
      <circle cx="21" cy="19" r="2.2" fill="#F5D732" stroke="#0A2A1D" strokeWidth="1" />

      {/* Palm Fronds (Leaves) */}
      {/* Left Top */}
      <path
        d="M21 15C17 12 10 10 4 13C10 16 16 17 21 15Z"
        fill="#3E9B5C"
        stroke="#0A2A1D"
        strokeWidth="1.5"
      />
      {/* Left Bottom */}
      <path
        d="M21 16C15 17 8 20 3 26C8 26 15 23 21 16Z"
        fill="#1F6B44"
        stroke="#0A2A1D"
        strokeWidth="1.5"
      />
      {/* Top Center */}
      <path
        d="M21 15C21 9 20 2 24 0C26 5 25 11 21 15Z"
        fill="#3E9B5C"
        stroke="#0A2A1D"
        strokeWidth="1.5"
      />
      {/* Right Top */}
      <path
        d="M21 15C26 11 34 8 42 10C37 14 30 16 21 15Z"
        fill="#3E9B5C"
        stroke="#0A2A1D"
        strokeWidth="1.5"
      />
      {/* Right Bottom */}
      <path
        d="M21 16C27 18 35 20 41 27C36 26 28 22 21 16Z"
        fill="#1F6B44"
        stroke="#0A2A1D"
        strokeWidth="1.5"
      />
    </svg>
  );
}
