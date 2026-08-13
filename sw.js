// ==========================================
// SERVICE WORKER: MOTOR DE CACHÉ Y ACTUALIZACIONES
// ==========================================
// Versión actual. Cambia este número (ej. a v5, v6) si haces cambios drásticos
const APP_VERSION = 'aglucem-v5'; 

// Lista estricta de archivos con la ruta relativa a tu repositorio de GitHub Pages
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

// 1. INSTALACIÓN: Descarga y guarda todos los archivos base
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Toma el control inmediatamente, sin esperar
    event.waitUntil(
        caches.open(APP_VERSION).then((cache) => {
            console.log('[Araknia PWA] Guardando archivos en caché v4');
            return cache.addAll(ASSETS_TO_CACHE);
        }).catch(err => console.error('[Araknia PWA] Error al guardar caché:', err))
    );
});

// 2. ACTIVACIÓN: Limpia cualquier versión vieja (v1, v2, v3...)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== APP_VERSION) {
                        console.log('[Araknia PWA] Borrando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Toma control de las pestañas abiertas
    );
});

// 3. INTERCEPTOR DE RED (ESTRATEGIA BLINDADA: "Network First")
// Siempre intenta buscar la versión más nueva en internet. Si falla (sin conexión), usa la caché.
self.addEventListener('fetch', (event) => {
    // Ignorar peticiones de extensiones o esquemas externos al protocolo http/https
    if (!(event.request.url.indexOf('http') === 0)) return;

    event.respondWith(
        fetch(event.request)
            .then((networkResponse) => {
                // Si hay internet y responde bien, actualizamos el archivo en la caché para el futuro
                return caches.open(APP_VERSION).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                    return networkResponse;
                });
            })
            .catch(() => {
                // Si no hay internet, sacamos el archivo directamente de la memoria del teléfono
                return caches.match(event.request);
            })
    );
});