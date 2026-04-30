const clients = new Map(); // keeps track of available tabs. It's much faster than clients.matchAll()
const voices = new Map(); // keeps track of notes and which client is playing them
let isRefreshing = false;
let lastRefreshTime = 0;


async function refreshClients() {
  if (isRefreshing) return;
  isRefreshing = true;
  try {
    const allClients = await self.clients.matchAll();

    // 1. Rebuild our local clients map from the source of truth
    clients.clear();
    for (const client of allClients) {
      clients.set(client.id, client);

      if (!voices.has(client.id)) {  // if id wasn't registered in `voices`
        voices.set(client.id, null); // add it, and mark as available (null)
      }
    }

    // 2. Clean up ghost tabs (i.e. closed) from our voices map
    for (const id of voices.keys()) {
      if (!clients.has(id)) { // if id no longer exists in `clients`
        voices.delete(id);    // remove it from `voices`
      }
    }
  } finally {
    isRefreshing = false;
  }
}

function handleNoteOn(note, velocity, sourceId) {
  // Deduplicate: all tabs listen to the same MIDI device and send the same
  // noteOn events. If a tab is already playing this note, ignore it.
  for (const currentNote of voices.values()) {
    if (currentNote === note) return;
  }

  // find an available voice (tab)
  let availableClientId = null;
  for (const [id, currentNote] of voices.entries()) {
    if (currentNote === null) {
      availableClientId = id;
      break;
    }
  }

  // If no voices are available, we drop the note completely (no voice stealing)
  if (availableClientId) {
    voices.set(availableClientId, note);
    const targetClient = clients.get(availableClientId);
    if (targetClient) {
      targetClient.postMessage({ type: 'playNote', note, velocity });
    }
  }
}

function handleNoteOff(note) {
  // Stop all clients playing this note
  for (const [id, currentNote] of voices.entries()) {
    if (currentNote === note) {
      voices.set(id, null); // free up the voice
      const targetClient = clients.get(id);
      if (targetClient) {
        targetClient.postMessage({ type: 'stopNote', note });
      }
    }
  }
}


self.addEventListener('activate', (event) => {
  console.log('SW activated');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('install', (event) => {
  console.log('SW installed');
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('fetch', (event) => {
  // Pass through fetch
});

self.addEventListener('message', async (event) => {
  const { data, source } = event;
  if (!data || !source) return;

  // if the client (i.e. tab) is not registered, register it
  if (!clients.has(source.id)) {
    clients.set(source.id, source);
    voices.set(source.id, null);
  }

  // Debounce'd check for dead tabs (tabs that were closed, but still in `clients`)
  const now = Date.now();
  if (now - lastRefreshTime > 5000 && !isRefreshing) {
    lastRefreshTime = now;
    refreshClients();
  }

  if (data.type === 'noteOn') {
    handleNoteOn(data.note, data.velocity, source.id);
  } else if (data.type === 'noteOff') {
    handleNoteOff(data.note);
  }
});
