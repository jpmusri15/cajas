// Funcionamiento sin conexión: guarda la app en el teléfono.
const VERSION = 'memoria-v6';
const SHELL = ['./', './index.html', './manifest.webmanifest', '../firebase-config.js',
  './icons/apple-touch-icon.png', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith('memoria-') && k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isPage = req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/firebase-config.js');
  const isFirebaseLib = url.hostname === 'www.gstatic.com' && url.pathname.startsWith('/firebasejs/');
  if (url.origin !== location.origin && !isFirebaseLib) return; // Firestore y Auth van directo a la red
  if (isPage) {
    // Primero la red (para recibir actualizaciones); sin conexión usa la copia guardada.
    e.respondWith(fetch(req).then(r => { const cp = r.clone(); caches.open(VERSION).then(c => c.put(req, cp)); return r; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => {
    if (res.ok || res.type === 'opaque') { const cp = res.clone(); caches.open(VERSION).then(c => c.put(req, cp)); }
    return res;
  })));
});
