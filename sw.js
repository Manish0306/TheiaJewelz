// Service Worker for Sales Tracking PWA
const CACHE_NAME = 'sales-tracker-v1.0.0';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './script.js',
    './manifest.json',
    // CDN resources (cached when accessed)
    'https://unpkg.com/lucide@latest/dist/umd/lucide.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js'
];

// Install event
self.addEventListener('install', (event) => {
    console.log('Service Worker: Install event');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Caching app shell');
                return cache.addAll(urlsToCache.slice(0, 5)); // Cache only local files during install
            })
            .catch((error) => {
                console.error('Service Worker: Error caching app shell', error);
            })
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Activate event');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Deleting old cache', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

// Fetch event - Cache first, then network
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('Service Worker: Serving from cache', event.request.url);
                    return cachedResponse;
                }
                
                // Otherwise fetch from network
                console.log('Service Worker: Fetching from network', event.request.url);
                return fetch(event.request).then((response) => {
                    // Check if response is valid
                    if (!response || response.status !== 200 || response.type !== 'basic') {
                        return response;
                    }
                    
                    // Clone the response for caching
                    const responseToCache = response.clone();
                    
                    // Cache the response
                    caches.open(CACHE_NAME)
                        .then((cache) => {
                            cache.put(event.request, responseToCache);
                        });
                    
                    return response;
                });
            })
            .catch((error) => {
                console.error('Service Worker: Fetch error', error);
                
                // Return offline fallback for navigation requests
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
                
                // Return offline fallback for API requests
                if (event.request.url.includes('/api/')) {
                    return new Response(JSON.stringify({
                        error: 'Offline',
                        message: 'You are currently offline. Data will be synced when connection is restored.'
                    }), {
                        status: 503,
                        headers: { 'Content-Type': 'application/json' }
                    });
                }
            })
    );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
    console.log('Service Worker: Background sync triggered', event.tag);
    
    if (event.tag === 'sync-sales-data') {
        event.waitUntil(syncSalesData());
    }
});

// Sync sales data when connection is restored
async function syncSalesData() {
    try {
        console.log('Service Worker: Syncing sales data');
        
        // Get offline data from IndexedDB if available
        const offlineData = await getOfflineData();
        
        if (offlineData && offlineData.length > 0) {
            // Sync offline data to server
            for (const data of offlineData) {
                await syncDataToServer(data);
            }
            
            // Clear offline data after successful sync
            await clearOfflineData();
        }
        
        console.log('Service Worker: Sales data sync completed');
    } catch (error) {
        console.error('Service Worker: Error syncing sales data', error);
    }
}

// Get offline data (placeholder - implement based on your storage)
async function getOfflineData() {
    // This would integrate with your local storage or IndexedDB
    return [];
}

// Sync data to server (placeholder - implement based on your API)
async function syncDataToServer(data) {
    // This would make API calls to sync data
    console.log('Service Worker: Syncing data to server', data);
}

// Clear offline data (placeholder - implement based on your storage)
async function clearOfflineData() {
    // This would clear offline data after successful sync
    console.log('Service Worker: Clearing offline data');
}

// Push notification handler
self.addEventListener('push', (event) => {
    console.log('Service Worker: Push notification received');
    
    let notificationData = {
        title: 'Sales Tracker',
        body: 'You have a new notification',
        icon: './icons/icon-192x192.png',
        badge: './icons/icon-72x72.png'
    };
    
    if (event.data) {
        try {
            notificationData = { ...notificationData, ...event.data.json() };
        } catch (error) {
            console.error('Service Worker: Error parsing push data', error);
        }
    }
    
    const options = {
        body: notificationData.body,
        icon: notificationData.icon,
        badge: notificationData.badge,
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: notificationData.primaryKey || 1
        },
        actions: [
            {
                action: 'open',
                title: 'Open App',
                icon: './icons/icon-192x192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: './icons/icon-192x192.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(notificationData.title, options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('Service Worker: Notification click received');
    
    event.notification.close();
    
    if (event.action === 'open') {
        // Open the app
        event.waitUntil(
            clients.openWindow('./')
        );
    } else if (event.action === 'close') {
        // Just close the notification
        console.log('Service Worker: Notification closed');
    } else {
        // Default action - open the app
        event.waitUntil(
            clients.openWindow('./')
        );
    }
});

// Handle messages from main thread
self.addEventListener('message', (event) => {
    console.log('Service Worker: Message received', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'SYNC_DATA') {
        // Register background sync
        self.registration.sync.register('sync-sales-data');
    }
});

// Share target handler (if implemented)
self.addEventListener('share', (event) => {
    console.log('Service Worker: Share received', event);
    
    event.waitUntil(
        (async () => {
            // Handle shared content
            const formData = await event.request.formData();
            const text = formData.get('text');
            const url = formData.get('url');
            
            // You can process shared content here
            console.log('Shared text:', text);
            console.log('Shared URL:', url);
            
            return Response.redirect('./?shared=true', 302);
        })()
    );
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event) => {
    console.log('Service Worker: Periodic sync triggered', event.tag);
    
    if (event.tag === 'daily-sync') {
        event.waitUntil(performDailySync());
    }
});

// Perform daily sync
async function performDailySync() {
    try {
        console.log('Service Worker: Performing daily sync');
        
        // Perform daily maintenance tasks
        await cleanupOldCaches();
        await syncSalesData();
        
        console.log('Service Worker: Daily sync completed');
    } catch (error) {
        console.error('Service Worker: Error in daily sync', error);
    }
}

// Cleanup old caches
async function cleanupOldCaches() {
    const cacheNames = await caches.keys();
    const oldCaches = cacheNames.filter(name => name !== CACHE_NAME);
    
    await Promise.all(
        oldCaches.map(cacheName => caches.delete(cacheName))
    );
    
    console.log('Service Worker: Old caches cleaned up');
}