import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// A 1080x1512 PNG lands well under this; the ceiling only exists so a bad
// client can't stream an arbitrarily large body into blob storage.
const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Short random token. schema.md §4 requires the stored object name not be
 * derived from any user data, so this is pure randomness — no name, no hash
 * of the image.
 */
function randomId() {
  return crypto.randomUUID().replace(/-/g, '').slice(0, 16);
}

/**
 * Origin to build the share-landing URL against. NEXT_PUBLIC_SITE_URL wins so
 * production always advertises the canonical domain; the forwarded headers keep
 * preview deploys and local dev self-consistent without extra config.
 */
function resolveOrigin(request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (configured) return configured.replace(/\/$/, '');

  const host = request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (host) {
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    return `${proto}://${host}`;
  }

  return new URL(request.url).origin;
}

/**
 * POST /api/share — schema.md §2/§3.
 *
 * multipart/form-data with a single `file` (PNG) → public blob URL plus the
 * `/s/<encoded-image-url>` landing URL that carries the OG tags X's crawler
 * reads. Every failure path returns a documented error shape rather than a
 * bare 500, because the client's fallback (app-flow.md §6) is a plain download
 * and it only needs to know that the upload did not happen.
 */
export async function POST(request) {
  // Without a token `put()` would throw on every call. Failing fast here keeps
  // the client's fallback-to-download path instant instead of waiting on a
  // round trip that cannot succeed.
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'upload_failed' }, { status: 503 });
  }

  let file;
  try {
    const formData = await request.formData();
    file = formData.get('file');
  } catch {
    return NextResponse.json({ error: 'no_file' }, { status: 400 });
  }

  if (!file || typeof file === 'string' || typeof file.arrayBuffer !== 'function') {
    return NextResponse.json({ error: 'no_file' }, { status: 400 });
  }

  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'no_file' }, { status: 400 });
  }

  try {
    const blob = await put(`hhgoa-2026/${randomId()}.png`, file, {
      access: 'public',
      contentType: 'image/png',
      // The filename already carries a random token; without this Vercel Blob
      // appends its own suffix and the URL grows for no reason.
      addRandomSuffix: false,
      // schema.md §4: retention need not be permanent, 30–90 days is fine.
      cacheControlMaxAge: 60 * 60 * 24 * 90,
    });

    const shareUrl = `${resolveOrigin(request)}/s/${encodeURIComponent(blob.url)}`;
    return NextResponse.json({ shareUrl, imageUrl: blob.url });
  } catch {
    return NextResponse.json({ error: 'upload_failed' }, { status: 502 });
  }
}
