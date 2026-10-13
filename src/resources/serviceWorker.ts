export function register() {
  if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) return;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(new URL('../sw.ts', import.meta.url), { type: 'module', scope: '/' })
      .catch((error) => console.error('Service worker registration failed:', error));
  });
}

export function unregister() {
  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.ready
    .then((registration) => registration.unregister())
    .catch((error) => console.error(error.message));
}
