import Link from 'next/link';
import styles from './share.module.css';

// Deliberately no og:image:width / og:image:height.
//
// The slug carries only the image URL, so this page cannot know which of the
// three formats it is describing — 1080x1080 (PFP), 1080x1512 (Card) or
// 1200x630 (Team). Declaring one set of dimensions would be wrong for the
// other two, and a wrong declared ratio makes crawlers reserve the wrong box
// and crop the graphic. They are optional hints: omitting them makes the
// crawler fetch and measure the real image instead.

/**
 * Hosts whose images this page is willing to advertise in its OG tags.
 *
 * schema.md §5 puts the image URL directly in the slug with no lookup table,
 * which means the route accepts a URL from whoever crafts the link. Without
 * this check, /s/<any-url> would render an arbitrary image inside a card that
 * carries our domain — so the slug is only honoured when it points at the
 * blob storage the upload route actually writes to.
 */
function isAllowedImageUrl(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    return false;
  }

  if (url.protocol !== 'https:') return false;
  return (
    url.hostname === 'blob.vercel-storage.com' ||
    url.hostname.endsWith('.public.blob.vercel-storage.com')
  );
}

/**
 * Next decodes a dynamic segment once before handing it over, so a slug built
 * with encodeURIComponent usually arrives already readable. Older/proxied paths
 * can still arrive encoded, hence the second attempt.
 */
function decodeSlug(slug) {
  if (typeof slug !== 'string' || slug.length === 0) return null;
  if (isAllowedImageUrl(slug)) return slug;

  try {
    const decoded = decodeURIComponent(slug);
    return isAllowedImageUrl(decoded) ? decoded : null;
  } catch {
    return null;
  }
}

// Format-neutral: one page serves the PFP frame, the Builder ID card and the
// Team Squad frame, and the slug doesn't say which.
const TITLE = 'HH Goa 2026 — Beach × Bytes';
const DESCRIPTION = 'Made with the HH Goa 2026 frame generator. Make your own in seconds.';

/** schema.md §5 — the whole point of this route: OG tags X's crawler can read. */
export async function generateMetadata({ params }) {
  const imageUrl = decodeSlug(params.slug);

  if (!imageUrl) {
    return { title: TITLE, description: DESCRIPTION };
  }

  return {
    title: TITLE,
    description: DESCRIPTION,
    openGraph: {
      title: TITLE,
      description: DESCRIPTION,
      images: [{ url: imageUrl }],
    },
    twitter: {
      card: 'summary_large_image',
      title: TITLE,
      description: DESCRIPTION,
      images: [imageUrl],
    },
  };
}

export default function SharePage({ params }) {
  const imageUrl = decodeSlug(params.slug);

  return (
    <main className={styles.page}>
      <section className={styles.stack}>
        <p className={styles.tag}>HH GOA 2026</p>

        {imageUrl ? (
          // Plain <img>: the source is a runtime blob URL on a host that is not
          // in next.config, so next/image would need a remotePatterns entry and
          // an optimizer round trip to render an already-optimised PNG.
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.shot} src={imageUrl} alt="Shared HH Goa 2026 graphic" />
        ) : (
          <p className={styles.missing}>
            This share link has expired or is malformed — but you can still make your own.
          </p>
        )}

        <Link className={styles.cta} href="/">
          MAKE YOURS →
        </Link>
      </section>
    </main>
  );
}
