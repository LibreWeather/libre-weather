import { manifest, version } from '@parcel/service-worker';

import { precacheList, strategyFor } from './utilities/cacheStrategy';

interface SwExtendableEvent extends Event {
  waitUntil(promise: Promise<unknown>): void;
}

interface SwFetchEvent extends SwExtendableEvent {
  request: Request;
  respondWith(response: Response | Promise<Response>): void;
}

interface SwScope {
  location: Location;
  clients: { claim(): Promise<void> };
  skipWaiting(): Promise<void>;
  addEventListener(type: 'install' | 'activate', listener: (event: SwExtendableEvent) => void): void;
  addEventListener(type: 'fetch', listener: (event: SwFetchEvent) => void): void;
}

const sw = self as unknown as SwScope;

const SHELL_CACHE = `shell-${version}`;
const DATA_CACHE = 'data-v1';
const SHELL_URL = '/';

sw.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll([SHELL_URL, ...precacheList(manifest)]))
      .then(() => sw.skipWaiting())
  );
});

sw.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== SHELL_CACHE && key !== DATA_CACHE).map((key) => caches.delete(key)))
      )
      .then(() => sw.clients.claim())
  );
});

const networkFirst = async (request: Request, cacheName: string, fallback?: string) => {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response.ok) await cache.put(fallback ?? request, response.clone());
    return response;
  } catch (error) {
    const cached = await cache.match(fallback ?? request);
    if (cached) return cached;
    throw error;
  }
};

const cacheFirst = async (request: Request) => {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(SHELL_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
};

sw.addEventListener('fetch', (event) => {
  const { request } = event;
  switch (strategyFor(request, sw.location.origin, process.env.LIBRE_WEATHER_API)) {
    case 'app-shell':
      event.respondWith(networkFirst(request, SHELL_CACHE, SHELL_URL));
      break;
    case 'network-first':
      event.respondWith(networkFirst(request, DATA_CACHE));
      break;
    case 'cache-first':
      event.respondWith(cacheFirst(request));
      break;
    default:
      break;
  }
});
