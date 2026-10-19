const CACHE_NAME = 'elektrospecialista-v1.0';
const ASSETS = [
    './',
    './index.html',
    './styles.css',
    './game.js',
    './data.js',
    './manifest.webmanifest'
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            return cachedResponse || fetch(e.request);
        })
    );
});
