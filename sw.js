/* Service worker: jaringan dulu, cadangan dari cache. Naikkan CACHE saat mengganti daftar SHELL. */
const CACHE = 'kasir-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => {
  // Tiap berkas di-cache sendiri-sendiri: bila satu berkas belum terunggah (mis. ikon), yang lain tetap tersimpan
  // dan aplikasi tetap bisa dipasang. (addAll bersifat semua-atau-tidak sama sekali.)
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const ok = url.origin === location.origin || /(fonts\.googleapis\.com|fonts\.gstatic\.com)$/.test(url.host);
  if (!ok) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && (res.ok || res.type === 'opaque')) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
