const addResourcesToCache = async (resources) => {
  const cache = await caches.open('v1');
  await cache.addAll(resources);
};

const putInCache = async (request, response) => {
  const cache = await caches.open('v1');
  await cache.put(request, response);
};


self.addEventListener('activate', (event) => {
	console.log('we is activen an sw');
	event.waitUntil(self.clients.claim()); // Become available to all pages
  event.waitUntil(enableNavigationPreload());
});

self.addEventListener('install', (event) => {
	event.waitUntil(self.skipWaiting()); // Activate worker immediately
  event.waitUntil(
    addResourcesToCache([
      './',
      './index.html',
    ])
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
		'hi'
  );
});


self.addEventListener('sync', function (event) {
  if (event.tag == 'myFirstSync') {
    event.waitUntil(doSomeStuff());
  }
});


addEventListener('message', async ({ data, source }) => {
  if ('broadcast' in data ) {
		console.log('SW', data);

    const allClients = await clients.matchAll();
    for (const client of allClients) {
      client.postMessage(data.broadcast);
    }


		if (clients && clients.length) {
			//Respond to last focused tab
			clients[0].postMessage({type: 'MSG_ID'});
		}

  }
});
