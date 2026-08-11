// === SISTEMA DE VERSIONES ===
const APP_VERSION = 'aglucem-v1'; 

// Rutas exactas para tu repositorio en GitHub Pages
const ASSETS_TO_CACHE = [
    '/Agenda/',
    '/Agenda/index.html',
    '/Agenda/novedades.html',
    '/Agenda/horario.html',
    '/Agenda/agenda.html',
    '/Agenda/herramientas.html',
    '/Agenda/comunicacion.html',
    '/Agenda/redes.html',
    '/Agenda/styles.css',
    '/Agenda/script.js',
    '/Agenda/Ag.png',
    '/Agenda/manifest.json'
];

self.addEventListener('install', (event) => {
    self.skipWaiting(); 
    event.waitUntil(
        caches.open(APP_VERSION).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== APP_VERSION) {
                        console.log('Borrando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) 
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
