// ====== CONFIG ======
const CACHE_NAME = 'bazarlist-cache-v1';

// কমপক্ষে এই ফাইলগুলো ক্যাশে থাকবে (404 এড়াতে নিশ্চিত পাথ রাখুন)
const APP_ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './offline.html',
  // মিনিমাম আইকন (ইনস্টল/স্প্ল্যাশে লাগে)
  './AppImages/android/android-launchericon-192-192.png',
  './AppImages/android/android-launchericon-512-512.png'
];

// ====== INSTALL ======
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting(); // নতুন SW তৎক্ষণাৎ অ্যাক্টিভেট করার প্রস্তুতি
});

// ====== ACTIVATE ======
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : undefined))
      )
    )
  );
  self.clients.claim(); // পেজগুলো সাথে সাথে নতুন SW নিয়ন্ত্রণে নেবে
});

// ====== FETCH ======
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // শুধু GET রিকোয়েস্ট হ্যান্ডেল করি
  if (request.method !== 'GET') return;

  // 1) নেভিগেশন রিকোয়েস্ট: Network-First (নেট না থাকলে offline.html)
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request);
          return fresh;
        } catch (err) {
          const cache = await caches.open(CACHE_NAME);
          const cached = await cache.match('./index.html');
          return cached || cache.match('./offline.html');
        }
      })()
    );
    return;
  }

  // 2) অন্যান্য GET: Stale-While-Revalidate
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request);
      const networkPromise = fetch(request)
        .then((res) => {
          // সফল হলে ক্যাশ আপডেট
          cache.put(request, res.clone());
          return res;
        })
        .catch(() => null);

      // আগে ক্যাশ (ফাস্ট), পরে নেটওয়ার্ক
      return cached || networkPromise || fetchFallback(request);
    })()
  );
});

// fallback helper (যদি দরকার হয়)
async function fetchFallback(request) {
  // HTML হলে offline.html দেখাই
  if (request.headers.get('accept')?.includes('text/html')) {
    const cache = await caches.open(CACHE_NAME);
    return cache.match('./offline.html');
  }
  return new Response('', { status: 408, statusText: 'Offline' });
}

// Optional: পেজ থেকে postMessage('SKIP_WAITING') পাঠালে তৎক্ষণাৎ আপডেট
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
