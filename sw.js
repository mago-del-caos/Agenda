// Nombre y versión de la caché (Actualizado a v61 para forzar el cambio automático)
const APP_VERSION = 'aglucem-v61';

// Lista de archivos esenciales que la PWA guardará en la memoria
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

// 1. INSTALACIÓN INMEDIATA (Fuerza al navegador a aceptar la v59 sin esperar)
self.addEventListener('install', event => {
    self.skipWaiting(); // Obliga al nuevo Service Worker a instalarse ya
    event.waitUntil(
        caches.open(APP_VERSION)
            .then(cache => {
                console.log('[PWA] Instalando nueva versión: ' + APP_VERSION);
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(err => console.log('[PWA] Error en caché:', err))
    );
});

// 2. ACTIVACIÓN Y PURGA TOTAL (Borra cualquier versión anterior de golpe)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== APP_VERSION) {
                        console.log('[PWA] Destruyendo caché obsoleta:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            // Toma el control absoluto de todas las pestañas abiertas al instante
            return self.clients.claim();
        })
    );
});

// 3. INTERcepción DE PETICIONES (Garantiza lectura limpia)
self.addEventListener('fetch', event => {
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                return caches.open(APP_VERSION).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
