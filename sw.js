// Nombre y versión de la caché (Subido a v44 para forzar el cambio)
const APP_VERSION = 'aglucem-v45';

// Lista de archivos que la PWA guardará en la memoria del celular
// (Se eliminaron las imágenes de Novedades porque ahora viven en Neocities)
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

// 3. EVENTO DE PETICIÓN (Estrategia: RED PRIMERO, luego caché)
self.addEventListener('fetch', event => {
    // Solo aplicamos esta lógica a los archivos de nuestra propia aplicación
    // (Ignoramos peticiones a YouTube, Neocities u otros servidores para evitar errores de seguridad)
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(networkResponse => {
                // Si hay internet y responde bien, actualizamos la caché de forma silenciosa
                return caches.open(APP_VERSION).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // Si NO hay internet o la red falla, sacamos el archivo de la caché de emergencia
                console.log('[PWA] Sin conexión, cargando desde la caché: ', event.request.url);
                return caches.match(event.request);
            })
    );
});
