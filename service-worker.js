/**
 * The CACHE_NAME must be overwritten and changed with a
 * new version name if changes to any of the app files occur
 * (even to this file)
 */
const CACHE_NAME = "app-cache-v1";

const ASSETS_TO_CACHE = [
  "/index.html",
  "/assets/css/form.css",
  "/assets/css/layout.css",
  "/assets/css/reset.css",
  "/assets/css/typography.css",
  "/assets/images/icons/app-icon.png",
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
