
const CACHE_NAME = "mediplan-v0-5-3";
const ASSETS = [
  "./","./index.html","./manifest.json",
  "./css/design-system/tokens.css",
  "./css/design-system/components.css",
  "./css/design-system/icons.css",
  "./css/design-system/motion.css",
  "./css/design-system/accessibility.css",
  "./css/base.css",
  "./css/dashboard.css",
  "./css/navigation.css","./css/light.css","./css/dark.css","./css/responsive.css",
  "./js/core/storage.js","./js/core/data.js","./js/core/ui.js","./js/core/router.js",
  "./js/modules/dashboard.js","./js/modules/intakes.js","./js/modules/cabinet.js",
  "./js/modules/calendar.js","./js/modules/more.js","./js/modules/emergency.js",
  "./js/modules/admin.js","./js/modules/importer.js","./js/modules/settings.js",
  "./assets/icons/ui-icons.svg",
  "./js/components/components.js",
  "./js/utils/validators.js",
  "./js/app.js",
  "./assets/brand/mediplan-logo.svg","./assets/brand/mediplan-mark.svg",
  "./assets/icons/icon-192.png","./assets/icons/icon-512.png","./assets/icons/icon-32.png"
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
