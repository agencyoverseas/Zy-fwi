/* Service Worker ZYÉ — app installable + fonctionne hors-ligne pour les modules
   locaux (courses, mémos, rappels, heure). La lecture caméra nécessite le réseau. */
const CACHE = 'zye-v1-4';
const SHELL = [
  './', './index.html',
  './app/styles.css',
  './app/config.js', './app/supabase.js', './app/voice.js', './app/geo.js',
  './app/learning.js', './app/collection.js', './app/tiers.js', './app/app.js', './app/vapi.js',
  './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png'
];

self.addEventListener('install', e=>{
  e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(
    keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
  )).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e=>{
  const url = new URL(e.request.url);
  // Ne jamais mettre en cache l'API (Supabase, Vision, Anthropic, CDN dynamique)
  if(url.origin !== self.location.origin){ return; }
  // App shell : cache-first
  e.respondWith(
    caches.match(e.request).then(hit=> hit || fetch(e.request).then(resp=>{
      const copy = resp.clone();
      caches.open(CACHE).then(c=>c.put(e.request, copy)).catch(()=>{});
      return resp;
    }).catch(()=> caches.match('./index.html')))
  );
});
