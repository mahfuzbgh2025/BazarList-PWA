/* PWA Service Worker */
const CACHE_VERSION = "v4.0.0";
const STATIC_CACHE = `bl-static-${CACHE_VERSION}`;
const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./offline.html",
  "./android-launchericon-192-192.png",
  "./android-launchericon-512-512.png"
];

self.addEventListener("install", (e)=>{
  self.skipWaiting();
  e.waitUntil(caches.open(STATIC_CACHE).then(c=>c.addAll(ASSETS)));
});

self.addEventListener("activate", (e)=>{
  e.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k.startsWith("bl-static-") && k!==STATIC_CACHE)
      .map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

// network falling back to cache for html; cache-first for others
self.addEventListener("fetch", (e)=>{
  const req = e.request;
  const url = new URL(req.url);

  // Only handle same-origin
  if(url.origin !== location.origin) return;

  if(req.mode === "navigate"){
    e.respondWith((async ()=>{
      try{
        const fresh = await fetch(req);
        const cache = await caches.open(STATIC_CACHE);
        cache.put("./", fresh.clone());
        return fresh;
      }catch{
        const cache = await caches.open(STATIC_CACHE);
        return (await cache.match("./offline.html")) || Response.error();
      }
    })());
    return;
  }

  // cache-first for static
  e.respondWith((async ()=>{
    const cached = await caches.match(req);
    if(cached) return cached;
    try{
      const fresh = await fetch(req);
      const cache = await caches.open(STATIC_CACHE);
      cache.put(req, fresh.clone());
      return fresh;
    }catch{
      return new Response("", {status:504,statusText:"Gateway Timeout"});
    }
  })());
});