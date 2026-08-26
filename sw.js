// Nombre y versión de la caché (Actualizado a v61 para forzar el cambio)
const APP_VERSION = 'aglucem-v61';

// Lista de archivos que la PWA guardará en la memoria del celular
const ASSETS_TO_CACHE = [
    '/Agenda/',
    '/Agenda/index.html',
    '/Agenda/novedades.html',
    '/Agenda/horario.html',
    '/Agenda/agenda.html',
    '/Agenda/herramientas.html',
    '/Agenda/comunicacion.html',
    '/Agenda/redes.html',
    '/Agenda/ajustes.html',
    '/Agenda/styles.css',
    '/Agenda/script.js',
    '/Agenda/manifest.json',
    '/Agenda/Ag.png',
    '/Agenda/icon-192.png',
    '/Agenda/icon-512.png',
    '/Agenda/Chemini.png',
    '/Agenda/Edu.png',
    '/Agenda/repo.png',
    '/Agenda/mapa.png',
    '/Agenda/DIE.png',
    '/Agenda/IJEM.png',
    '/Agenda/facebook.png',
    '/Agenda/instagram.png',
    '/Agenda/juventudtv.png',
    '/Agenda/padlet.png',
    '/Agenda/global.png',
    '/Agenda/classroom.png',
    '/Agenda/calculadora.png',
    '/Agenda/goblin.png'
];

// 1. EVENTO DE INSTALACIÓN (Descarga los archivos)
self.addEventListener('install', event => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(APP_VERSION)
            .then(cache => {
                console.log('[PWA] Guardando archivos en caché v58');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(err => console.log('[PWA] Error al guardar en caché:', err))
    );
});

// 2. EVENTO DE ACTIVACIÓN (Limpia la basura vieja y toma el control)
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== APP_VERSION) {
                        console.log('[PWA] Borrando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 3. EVENTO DE PETICIÓN (Estrategia: RED PRIMERO con bypass para Novedades y páginas)
self.addEventListener('fetch', event => {
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    // Forzar la carga actualizada asegurando que las páginas (incluyendo novedades) prioricen la red
    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                return caches.open(APP_VERSION).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                console.log('[PWA] Sin conexión, cargando desde la caché: ', event.request.url);
                return caches.match(event.request);
            })
    );
});
