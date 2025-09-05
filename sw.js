self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open("bazarlist-cache").then((cache) => {
      return cache.addAll([
        "/BazarList-PWA/",
        "/BazarList-PWA/index.html",
        "/BazarList-PWA/style.css",
        "/BazarList-PWA/app.js",
        "/BazarList-PWA/manifest.json",
        "/BazarList-PWA/android-launchericon-192-192.png",
        "/BazarList-PWA/android-launchericon-512-512.png"
      ]);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});