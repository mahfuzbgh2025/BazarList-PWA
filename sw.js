self.addEventListener("install", e => {
  e.waitUntil(
    caches.open("bazarlist-cache").then(cache => {
      return cache.addAll([
        "index.html",
        "style.css",
        "app.js",
        "manifest.json",
        "offline.html"
      ]);
    })
  );
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(response => {
      return response || fetch(e.request).catch(() => caches.match("offline.html"));
    })
  );
});