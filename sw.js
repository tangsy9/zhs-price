// Service Worker - 芝华仕价格查询 PWA
var CACHE_NAME = 'cheers-price-v7';
var CACHE_URLS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-180.png',
  './icon-512.png',
  './icon-167.png'
];

self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(CACHE_URLS);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(n) { return n !== CACHE_NAME; })
             .map(function(n) { return caches.delete(n); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(e) {
  // For navigation requests, always network first + update cache
  if (e.request.mode === 'navigate') {
    e.respondWith(
      fetch(e.request).then(function(resp) {
        var copy = resp.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put('./', copy);
          cache.put('./index.html', copy);
        });
        return resp;
      }).catch(function() {
        return caches.match('./').then(function(r) {
          return r || caches.match('./index.html');
        });
      })
    );
    return;
  }
  // For other requests, network first, fallback to cache
  e.respondWith(
    fetch(e.request).catch(function() {
      return caches.match(e.request);
    })
  );
});
