import { fontClassNames } from '@/lib/fonts';
import './globals.css';

export const metadata = {
  title: 'HH Goa 2026 — Frame & Builder ID',
  description:
    'Turn a photo into a Hacker House Goa 2026 frame or Builder ID card. No account, no upload wait.',
};

// Separate export, not a `metadata.viewport` key — Next 14 warns on the latter.
// `viewportFit: 'cover'` and a locked initialScale are here from the start so
// the mobile pass (plan.md Phase 8) isn't fixing viewport basics late.
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#0B3D2B',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={fontClassNames}>
      <body>{children}</body>
    </html>
  );
}
