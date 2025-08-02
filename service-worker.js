const CACHE = 'kegelapp-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './service-worker.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon-180.png'
];

// Install
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k!==CACHE && caches.delete(k))))
  );
  self.clients.claim();
});

// Fetch: cache-first, fallback réseau
self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(res => res || fetch(req).then(net => {
      // Mise en cache en arrière-plan (best effort)
      const copy = net.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
      return net;
    }).catch(()=> caches.match('./index.html')))
  );
});
