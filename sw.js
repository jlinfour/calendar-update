const CACHE_NAME = 'calendar-update-v4';
const ASSETS = [
  './', './index.html', './styles.css', './app.js', './bg.js', './frame-guard.js',
  './manifest.json', './logo.png', './icon-192.png', './icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first for the app's own files, refreshing the offline copy on each
// successful load. Everything else (Google/OpenRouter API calls, Google Fonts)
// is left alone so it goes straight to the network, untouched and uncached.
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  e.respondWith(
    // 'no-cache' revalidates with the server (a cheap 304 when unchanged) instead
    // of trusting the browser's 10-minute HTTP cache — so after a deploy the
    // page never mixes a new index.html with an old app.js or styles.css.
    // (The URL is used because a navigation Request can't take new options.)
    fetch(req.url, { cache: 'no-cache' })
      .then(res => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
        }
        return res;
      })
      .catch(async () => {
        const hit = await caches.match(req, { ignoreSearch: true });
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('./index.html');
        return Response.error();
      })
  );
});
