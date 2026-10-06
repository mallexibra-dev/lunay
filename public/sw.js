/**
 * Service worker Lunay — offline sederhana, local-first.
 *
 * Di localhost SW sengaja menjadi "pembersih": menghapus semua cache
 * lalu unregister diri sendiri. Alasannya, URL aset dev Next tidak
 * berubah antar-recompile, sehingga SW cache-first akan menyajikan
 * CSS/JS basi tanpa pernah menyegarkan. Di production SW bekerja normal.
 *
 * Strategi production:
 *  - Aset statis ber-hash (_next/static): cache-first (URL-nya immutable).
 *  - Navigasi halaman: network-first, jatuh ke cache, lalu halaman /offline.
 *  - Sisanya (websocket, API): lewat jaringan saja.
 *
 * Seluruh data pengguna tetap di localStorage — SW hanya mengurus shell.
 */
const CACHE = 'lunay-v2';
const CORE = ['/offline'];
const IS_DEV =
  self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';

self.addEventListener('install', (event) => {
  if (IS_DEV) {
    // Langsung aktif tanpa menyimpan apa pun.
    self.skipWaiting();
    return;
  }
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  if (IS_DEV) {
    event.waitUntil(
      (async () => {
        // Hapus SEMUA cache milik SW (semua versi), lalu copot SW ini.
        const keys = await caches.keys();
        await Promise.all(keys.map((key) => caches.delete(key)));
        await self.registration.unregister();
      })()
    );
    return;
  }
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (IS_DEV) return; // dev:SW tidak menyimpan apa pun — semua lewat jaringan.

  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Aset statis ber-hash: cache-first
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (hit) =>
          hit ||
          fetch(request).then((response) => {
            const copy = response.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
            return response;
          })
      )
    );
    return;
  }

  // Navigasi halaman: network-first dengan fallback offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((hit) => hit || caches.match('/offline'))
        )
    );
  }
  // Permintaan lain: biarkan lewat jaringan (tanpa respondWith)
});
