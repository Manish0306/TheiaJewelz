
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open('sales-tracker-cache').then(function(cache) {
      return cache.addAll([
        './pwa-test.html',
        './manifest.json',
        './favicon.ico'
      ]);
    })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
