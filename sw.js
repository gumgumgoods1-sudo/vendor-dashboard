// Minimal app-shell service worker — caches the static files that make up the app so
// home.html (and the dashboard it links to) still open, showing whatever was last
// loaded, even with no signal. It deliberately does NOT cache Firebase/Firestore
// network calls — those go straight to the network so you always get live data when
// you have a connection; the app-shell cache below is only a fallback for when you
// don't.
const CACHE_NAME = 'tcg-vendor-shell-v23';
const SHELL_FILES = [
  './',
  './home.html',
  './index.html',
  './manifest.webmanifest',
  './js/firebase-config.js',
  './js/data-sync.js',
  './js/jsqr.js',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/logo-v2.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  // Only handle same-origin GET requests for the app shell — Firebase/Firestore/Google
  // API calls (different origin) go straight to the network, untouched.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const network = fetch(event.request)
        .then((resp) => {
          if (resp && resp.status === 200) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return resp;
        })
        .catch(() => cached); // offline — fall back to whatever's cached
      return cached || network;
    })
  );
});
