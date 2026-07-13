
const CACHE_NAME = "mediplan-v1-0-0";
const ASSETS = [
  "./","./index.html","./manifest.json",
  "./css/base.css","./css/light.css","./css/dark.css","./css/responsive.css",
  "./js/core/storage.js","./js/core/data.js","./js/core/ui.js","./js/core/router.js",
  "./js/modules/dashboard.js","./js/modules/intakes.js","./js/modules/cabinet.js",
  "./js/modules/calendar.js","./js/modules/more.js","./js/modules/emergency.js",
  "./js/modules/admin.js","./js/modules/importer.js","./js/modules/settings.js",
  "./js/app.js"
];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request).then(response => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        return response;
      }).catch(()=>cached)
    )
  );
});
