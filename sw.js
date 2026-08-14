// Nombre y versión de la caché (Sube este número en cada actualización)
const APP_VERSION = 'aglucem-v22';

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
    '/Agenda/1.png',
    '/Agenda/2.png',
    '/Agenda/3.png',
    '/Agenda/4.png',
    '/Agenda/5.png',
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
    '/Agenda/classroom.png'
];

// 1. EVENTO DE INSTALACIÓN (Descarga los archivos)
self.addEventListener('install', event => {
    // ¡CLAVE! Fuerza al Service Worker a instalarse de inmediato sin esperar
    self.skipWaiting();

    event.waitUntil(
        caches.open(APP_VERSION)
            .then(cache => {
                console.log('[PWA] Guardando archivos en caché');
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .catch(err => console.log('[PWA] Error al guardar en caché:', err))
    );
});

// 2. EVENTO DE ACTIVACIÓN (Limpia la basura vieja y toma el control)
self.addEventListener('activate', event => {
    // ¡CLAVE! Fuerza al nuevo Service Worker a tomar el control de la app al instante
    event.waitUntil(self.clients.claim());

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Si la caché no es la versión actual, bórrala
                    if (cacheName !== APP_VERSION) {
                        console.log('[PWA] Borrando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// 3. EVENTO DE PETICIÓN (Responde desde la caché si no hay internet)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Si el archivo está en la caché, lo entrega; si no, lo busca en internet
                return response || fetch(event.request);
            })
            .catch(() => {
                // Opcional: Podrías redirigir a una página de "Sin conexión" si falla
                console.log('[PWA] Estás sin conexión y el archivo no está en caché.');
            })
    );
});
