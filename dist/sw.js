/* Service worker: guarda a aplicação em cache para funcionar sem rede.
   O nome da cache inclui um hash do build, injetado por tools/build.py, para que
   uma versão nova substitua a antiga em vez de ficar presa. */
const CACHE = 'torneio-udcsb-912c4e104b';
const ASSETS = ['./', './index.html', './manifest.webmanifest',
                './assets/icons/icon-192.png', './assets/icons/icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Cache primeiro: no campo a rede é má e a app não muda durante o torneio. */
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
