/**
 * The CACHE_NAME must be overwritten and changed with a
 * new version name if changes to any of the app files occur
 */
const CACHE_NAME = "app-cache-v1";

//If the app is opened with Live Server locally, the routes must be changing
//by deleting the string /Real-Time-Chat-App 
const ASSETS_TO_CACHE = [
  "/Real-Time-Chat-App/index.html",
  "/Real-Time-Chat-App/assets/css/form.css",
  "/Real-Time-Chat-App/assets/css/layout.css",
  "/Real-Time-Chat-App/assets/css/reset.css",
  "/Real-Time-Chat-App/assets/css/typography.css",
  "/Real-Time-Chat-App/assets/images/icons/app-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("message", (event) => {
  const senderTabID = event.source.id; // ID of the tab which sent the message to the worker

  clients.matchAll().then((clients) => {
    const recipientTabs = clients.filter((client) => client.id !== senderTabID);

    recipientTabs.forEach((client) => {
      client.postMessage(event.data);
    });
  });
});

//Code to intercept fetch requests
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      console.log("Request: " + event.request.url);
      if (cachedResponse) {
        console.log("Showing cachedResponse for fetch: " + cachedResponse);
        return cachedResponse;
      } else {
        console.log("Not found in cache, searching the network...");
        return fetch(event.request).then((response) => {
          // Clone the response before using it
          const responseToCache = response.clone();

          if (
            event.request.url.endsWith(".js") &&
            !event.request.url.includes("service-worker.js")
          ) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }

          return response;
        });
      }
    })
  );
});

//Code to keep cache up to date
//Code to remove outdated caches and keep only the current cache
self.addEventListener("activate", (event) => {
  event.waitUntil(handleActivation());
});

async function handleActivation() {
  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames.map((cacheName) => {
      if (cacheName !== CACHE_NAME) {
        console.log(`Deleting outdated cache: ${cacheName}`);
        return caches.delete(cacheName);
      }
    })
  );

  // Claim clients immediately to take control of them
  await self.clients.claim();
}
