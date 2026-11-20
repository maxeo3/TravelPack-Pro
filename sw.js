// Cambia la versione quando aggiorni l'app, così i telefoni scaricano i file nuovi
const CACHE = 'travelpack-v2';
const FILES = ['./', 'index.html', 'manifest.json', 'icon.png', 'icon.svg'];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// Prima prova la rete (così vedi sempre l'ultima versione), se non c'è usa la copia salvata
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET' || new URL(e.request.url).origin !== self.location.origin) return;
    e.respondWith(
        fetch(e.request)
            .then(res => {
                if (res.ok) {
                    const copy = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, copy));
                }
                return res;
            })
            .catch(() =>
                caches.match(e.request, { ignoreSearch: true })
                    .then(r => r || caches.match('index.html'))
            )
    );
});
