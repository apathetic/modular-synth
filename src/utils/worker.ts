let messageHandler: ((data: any) => void) | null = null;

export function onWorkerMessage(handler: (data: any) => void) {
  messageHandler = handler;
}

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js', { scope: '/' })
        .then(reg => console.log('SW registered!', reg))
        .catch(err => console.error('SW registration failed!', err));
    });

    navigator.serviceWorker.addEventListener('message', (event) => {
      if (messageHandler) {
        messageHandler(event.data);
      }
    });
  }
}

export default function dispatchToWorker(payload: any) {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage(payload);
  } else if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      if (registration.active) {
        registration.active.postMessage(payload);
      }
    });
  }
}
