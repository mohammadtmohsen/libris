import { registerSW } from 'virtual:pwa-register';

export const initPWA = () => {
  if (!('serviceWorker' in navigator)) return;

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    window.location.reload();
  });

  const updateSW = registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      registration?.update();
      setInterval(() => registration?.update(), 60 * 60 * 1000);
    },
    onNeedRefresh() {
      updateSW(true);
    },
  });
};
