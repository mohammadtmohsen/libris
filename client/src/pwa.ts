import { registerSW } from 'virtual:pwa-register';

const cleanupOldServiceWorkers = async () => {
  const registrations = await navigator.serviceWorker.getRegistrations();
  for (const registration of registrations) {
    await registration.unregister();
  }
  if (registrations.length > 0) {
    const cacheNames = await caches.keys();
    for (const name of cacheNames) {
      await caches.delete(name);
    }
  }
};

export const initPWA = async () => {
  if (!('serviceWorker' in navigator)) return;

  const cleanupKey = 'sw-cleanup-v1';
  if (!localStorage.getItem(cleanupKey)) {
    await cleanupOldServiceWorkers();
    localStorage.setItem(cleanupKey, 'done');
  }

  const updateSW = registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      if (registration) {
        setInterval(() => registration.update(), 60 * 60 * 1000);
      }
    },
    onNeedRefresh() {
      updateSW(true);
    },
  });
};
