/* kegelapp – cache v3 */
const CACHE_NAME = 'kegelapp-v3';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './sw.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/icon-1024-maskable.png',
  './icons/apple-touch-icon-180.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async ()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});

/* cache-first + maj en arrière-plan */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith((async ()=>{
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(e.request);
    const fetchPromise = fetch(e.request).then(res=>{
      if(res && res.status===200 && res.type==='basic'){ cache.put(e.request, res.clone()); }
      return res;
    }).catch(()=>cached);
    return cached || fetchPromise;
  })());
});
