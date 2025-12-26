/// <reference lib="webworker" />

import { clientsClaim } from 'workbox-core';
import {
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
  precacheAndRoute,
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<unknown>;
};

clientsClaim();
self.skipWaiting();

precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

registerRoute(new NavigationRoute(createHandlerBoundToURL('index.html')));

// Cache PDF bytes after first open; ignore signed URL params for stable cache keys.
const pdfCacheKeyPlugin = {
  cacheKeyWillBeUsed: async ({ request }: { request: Request }) => {
    const rangeHeader = request.headers.get('range');
    const url = new URL(request.url);
    url.search = '';
    if (rangeHeader) {
      url.searchParams.set('__range', rangeHeader);
    }
    const headers = new Headers(request.headers);
    headers.delete('range');
    return new Request(url.toString(), {
      method: request.method,
      headers,
      mode: request.mode,
      credentials: request.credentials,
      redirect: request.redirect,
      referrer: request.referrer,
      referrerPolicy: request.referrerPolicy,
      integrity: request.integrity,
      cache: request.cache,
    });
  },
};

const pdfCacheMatch = ({ request, url }: { request: Request; url: URL }) =>
  request.method === 'GET' &&
  url.pathname.toLowerCase().endsWith('.pdf') &&
  !request.headers.has('authorization');

registerRoute(
  pdfCacheMatch,
  new CacheFirst({
    cacheName: 'pdf-cache-v1',
    plugins: [
      pdfCacheKeyPlugin,
      new CacheableResponsePlugin({ statuses: [200, 206] }),
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 30 * 24 * 60 * 60,
      }),
    ],
  })
);
