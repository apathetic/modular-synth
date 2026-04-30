import { log } from '~/utils/logger';

const messageHandlers = new Set<(data: any) => void>();

export function onWorkerMessage(handler: (data: any) => void) {
  messageHandlers.add(handler);
  return () => messageHandlers.delete(handler);
}

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(() => log({ type:'system', action:'setup', data:'SW' })) //   console.log('SW registered!', reg))
        .catch((err) => log({ type:'system', action:'error', data:err }));
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      messageHandlers.forEach(handler => handler(event.data));
    });

    // Handle tab lifecycle events for Service Worker tracking
    window.addEventListener('pageshow', () => {
      dispatchToWorker({ type: 'register' });
    });

    window.addEventListener('pagehide', () => {
      dispatchToWorker({ type: 'unregister' });
    });
  }
}

export function dispatchToWorker(payload: any) {
  const sw = navigator.serviceWorker;
  if (!sw) return;

  if (sw.controller) {
    sw.controller.postMessage(payload);
  } else {
    sw.ready.then((reg) => reg.active?.postMessage(payload));
  }
}
