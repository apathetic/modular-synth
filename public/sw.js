const voices = new Map(); // id -> { client, note }. keeps track of notes and which tab is playing them
let isPoweredOn = false;


function handleNoteOn(note, velocity) {
  let availableVoice = null;

  for (const state of voices.values()) {
    // Deduplicate: if any tab is already playing this note, ignore the request
    if (state.note === note) return;

    // Find the first available voice (tab)
    if (!availableVoice && state.note === null) {
      availableVoice = state;
    }
  }

  if (availableVoice) {
    availableVoice.note = note;
    availableVoice.client.postMessage({ type: 'playNote', note, velocity });
  }
}

function handleNoteOff(note) {
  for (const state of voices.values()) {
    if (state.note === note) {
      state.note = null;
      state.client.postMessage({ type: 'stopNote', note });
    }
  }
}

async function handleSetPower(value) {
  isPoweredOn = value;

  // Broadcast to all currently registered tabs immediately
  for (const { client } of voices.values()) {
    client.postMessage({ type: 'powerChanged', value: isPoweredOn });
  }

  // Then do a hard sync in the background to catch any missed or uncontrolled tabs
  const allClients = await self.clients.matchAll({ includeUncontrolled: true });
  for (const client of allClients) {
    if (!voices.has(client.id)) {
      voices.set(client.id, { client, note: null });
      // Sync the power state for this newly discovered tab
      client.postMessage({ type: 'powerChanged', value: isPoweredOn });
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

self.addEventListener('fetch', () => {
  // Pass through fetch
});

self.addEventListener('message', async (event) => {
  const { data, source } = event;
  if (!data || !source) return;

  if (data.type === 'noteOn') {
    handleNoteOn(data.note, data.velocity);
  } else if (data.type === 'noteOff') {
    handleNoteOff(data.note);
  } else if (data.type === 'setPower') {
    await handleSetPower(data.value);
  } else if (data.type === 'register') {
    voices.set(source.id, { client: source, note: null });
    source.postMessage({ type: 'powerChanged', value: isPoweredOn }); // sync power immediately
  } else if (data.type === 'unregister') {
    voices.delete(source.id);
  }
});
