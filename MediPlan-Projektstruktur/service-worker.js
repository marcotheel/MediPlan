const CACHE_NAME = "mediplan-v0-1";

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        "./",
        "./index.html",
        "./css/style.css",
        "./css/light.css",
        "./css/dark.css",
        "./css/responsive.css",
        "./js/app.js"
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
