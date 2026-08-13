// Utility to load and cache background artwork images for canvas compositing.

let heroBgCache = null;
let heroBgPromise = null;

let pfpBgCache = null;
let pfpBgPromise = null;

export function getHeroBgImage() {
  if (heroBgCache) return heroBgCache;
  if (typeof window === 'undefined') return null;
  if (!heroBgPromise) {
    heroBgPromise = new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        heroBgCache = img;
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = '/hero-bg.jpg';
    });
  }
  return heroBgCache;
}

export function loadHeroBgImage() {
  getHeroBgImage();
  return heroBgPromise ?? Promise.resolve(null);
}

export function getPfpFrameBgImage() {
  if (pfpBgCache) return pfpBgCache;
  if (typeof window === 'undefined') return null;
  if (!pfpBgPromise) {
    pfpBgPromise = new Promise((resolve) => {
      const img = new window.Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        pfpBgCache = img;
        resolve(img);
      };
      img.onerror = () => resolve(null);
      img.src = '/pfp-frame-bg.png';
    });
  }
  return pfpBgCache;
}

export function loadPfpFrameBgImage() {
  getPfpFrameBgImage();
  return pfpBgPromise ?? Promise.resolve(null);
}
