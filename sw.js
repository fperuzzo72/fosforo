// Fósforo: guarda o editor no aparelho para abrir sem internet.
// Rede primeiro (para receber atualizações), cópia guardada quando não há conexão.
const CACHE = 'fosforo-v1';
const ARQUIVOS = ['./', './index.html', './fosforo.html', './icone-180.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  const daRede = fetch(e.request).then(r => {
    if (r.ok){ const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
    return r;
  });
  daRede.catch(() => {});
  const limite = new Promise((_, falha) => setTimeout(() => falha(new Error('lento')), 4000));
  e.respondWith(Promise.race([daRede, limite]).catch(() =>
    caches.match(e.request, { ignoreSearch: true }).then(r => r || daRede.catch(() => caches.match('./fosforo.html')))));
});
