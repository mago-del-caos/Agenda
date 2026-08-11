// === SISTEMA DE VERSIONES ===
// Cuando quieras forzar una actualización a todos los alumnos, 
// solo cambia este número (ej. de v1 a v2, luego a v3, etc.)
const APP_VERSION = 'aglucem-v1'; 

const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/novedades.html',
    '/horario.html',
    '/agenda.html',
    '/herramientas.html',
    '/comunicacion.html',
    '/redes.html',
    '/styles.css',
    '/script.js',
    '/Ag.png',
    '/manifest.json'
    // Puedes agregar aquí '1.png', '2.png', etc., si quieres que carguen offline
];

// 1. INSTALACIÓN (Forzamos a que tome el control inmediatamente)
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Obliga al nuevo Service Worker a activarse sin esperar
    event.waitUntil(
        caches.open(APP_VERSION).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. ACTIVACIÓN (Borra versiones antiguas para forzar la actualización)
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
        }).then(() => self.clients.claim()) // Toma el control de las ventanas abiertas al instante
    );
});

// 3. ESTRATEGIA DE RED (Busca primero en caché, si no está, va a internet)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
