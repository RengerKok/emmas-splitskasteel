const CACHE = 'splitskasteel-v3';
const CORE = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const response = await fetch('./index.html');
    const html = await response.text();
    const assets = [...html.matchAll(/(?:src|href)="([^"]+\.(?:js|css|svg|webmanifest))"/g)].map((match) => match[1]);
    const cache = await caches.open(CACHE);
    await cache.addAll([...new Set([...CORE, ...assets])]);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response.ok && request.destination !== 'document') {
        const copy = response.clone();
        void caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return response;
    }).catch(() => {
      if (request.mode === 'navigate') return caches.match('./index.html');
      throw new Error('Deze pagina is nog niet offline beschikbaar.');
    });
  }));
});
