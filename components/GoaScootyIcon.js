'use client';

/**
 * Retro Goa Scooty (Vespa) SVG Icon.
 * Features vibrant yellow body, hot pink apron, cream headlight, and dark green chassis.
 */
export default function GoaScootyIcon({ className = '', width = 38, height = 32 }) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 48 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Goa Scooty Icon"
    >
      {/* Front Wheel */}
      <circle cx="12" cy="32" r="5" fill="#0A2A1D" stroke="#F7F2DE" strokeWidth="2" />
      <circle cx="12" cy="32" r="2" fill="#F5D732" />

      {/* Rear Wheel */}
      <circle cx="36" cy="32" r="5" fill="#0A2A1D" stroke="#F7F2DE" strokeWidth="2" />
      <circle cx="36" cy="32" r="2" fill="#F5D732" />

      {/* Main Body Chassis */}
      <path
        d="M8 28C8 28 10 20 14 20C18 20 22 26 26 26H38C41 26 43 28 43 31V32H7V31C7 29 8 28 8 28Z"
        fill="#F5D732"
        stroke="#0A2A1D"
        strokeWidth="2"
      />

      {/* Front Apron / Leg Shield */}
      <path
        d="M12 28L10 16C9.5 13 12 11 15 11H17C18 11 19 12 19 13L17 28"
        fill="#EC1B78"
        stroke="#0A2A1D"
        strokeWidth="2"
      />

      {/* Scooter Leather Seat */}
      <path
        d="M22 24C22 22 24 21 27 21H37C39 21 40 22 40 24V26H22V24Z"
        fill="#0A2A1D"
        stroke="#F7F2DE"
        strokeWidth="1.5"
      />

      {/* Handlebar & Headlight */}
      <path d="M15 11L14 6H18L17 11" stroke="#0A2A1D" strokeWidth="2" strokeLinecap="round" />
      <circle cx="16" cy="6" r="3.5" fill="#F7F2DE" stroke="#0A2A1D" strokeWidth="1.5" />
      <circle cx="16" cy="6" r="1.5" fill="#F5D732" />

      {/* Rearview Mirror */}
      <path d="M14 6L11 3" stroke="#0A2A1D" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="2" r="1.5" fill="#F7F2DE" />

      {/* Goa Side Carrier / License Badge */}
      <rect x="29" y="17" width="7" height="4" rx="1" fill="#EC1B78" stroke="#0A2A1D" strokeWidth="1" />
    </svg>
  );
}
