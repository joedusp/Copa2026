const CACHE_NAME = 'copa-2026-v1';
const urlsToCache = [
  './index.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Para garantir que sempre temos a versão mais recente, 
        // tentamos a rede primeiro, e usamos o cache como fallback.
        return fetch(event.request).catch(() => caches.match(event.request));
      })
  );
});
