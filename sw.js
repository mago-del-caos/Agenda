// ==========================================
// SERVICE WORKER: CONTROL DE VERSIONES ESTRICTO
// ==========================================
// Cambia este número para FORZAR la actualización en todos los celulares (ej. a v7, v8)
const APP_VERSION = 'aglucem-v15';

// Rutas ABSOLUTAS obligatorias para GitHub Pages
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
    '/Agenda/1.png',
    '/Agenda/2.png',
    '/Agenda/3.png',
    '/Agenda/4.png',
    '/Agenda/5.png',
    '/Agenda/icon-192.png',
    '/Agenda/icon-512.png',
    '/Agenda/manifest.json'
];

// 1. INSTALACIÓN: Descarga y guarda la versión exacta que indicas arriba
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Fuerza a que este Service Worker tome el control
    event.waitUntil(
        caches.open(APP_VERSION).then((cache) => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// 2. ACTIVACIÓN: Destruye cualquier versión anterior sin piedad
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== APP_VERSION) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. ESTRATEGIA ESTRICTA: "Cache First" (Primero la caché)
// Lee directamente de la memoria. Solo va a internet si el archivo no está guardado.
// Esto garantiza que tú dictas exactamente cuándo se actualiza al cambiar APP_VERSION.
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
