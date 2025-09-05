const CACHE_NAME = "bazarlist-cache-v1";
const urlsToCache = [
  "/BazarList-PWA/",
  "/BazarList-PWA/index.html",
  "/BazarList-PWA/style.css",
  "/BazarList-PWA/app.js",
  "/BazarList-PWA/manifest.json",
  "/BazarList-PWA/android-launchericon-192-192.png",
  "/BazarList-PWA/android-launchericon-512-512.png"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => response || fetch(e.request))
  );
});