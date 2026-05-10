import { ref } from 'vue';

type MidiActions = {
  noteOn?: (note: number, velocity: number) => void;
  noteOff?: (note: number) => void;
  pitchWheel?: (bend: number) => void;
  controller?: (target: number, value: number) => void;
}

const devices = ref<any[]>([]);
const listeners = new Set<MidiActions>();
let isInitializing = false;
let midiAccess: any = null;
let midiIn: any = null;


function addDevice(port: any) {
  if (devices.value.find((d) => d._uid === port.id)) return;

  devices.value.push({
    _uid: port.id,
    name: port.name,
    state: port.state,
    connection: port.connection
  });
}

function onStateChange(e: any) {
  const port = e.port;
  if (port.type === 'input') {
    if (port.state === 'disconnected') {
      devices.value = devices.value.filter(d => d._uid !== port.id);
    } else if (port.state === 'connected') {
      addDevice(port);
    }
  }
}

function selectDevice(id: string) {
  if (!midiAccess) return;
  const selected = midiAccess.inputs.get(id);

  if (midiIn) {
    midiIn.close();
  }

  midiIn = selected;
  if (midiIn) {
    midiIn.onmidimessage = onMIDIMessage;
  }
}

function onMIDIMessage({ data }: any) {
  const cmd = data[0] >> 4;
  const channel = data[0] & 0xf;
  const note = data[1];
  const velocity = data[2];

  if (channel === 9) return;

  if (cmd === 8 || (cmd === 9 && velocity === 0)) {
    listeners.forEach(l => l.noteOff?.(note));
  } else if (cmd === 9) {
    listeners.forEach(l => l.noteOn?.(note, velocity));
  } else if (cmd === 11) {
    listeners.forEach(l => l.controller?.(note, velocity));
  } else if (cmd === 14) {
    listeners.forEach(l => l.pitchWheel?.(((velocity * 128.0 + note) - 8192) / 8192.0));
  }
}

function initMidi() {
  if (midiAccess || isInitializing) return;
  isInitializing = true;

  if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess({ sysex: false }).then(
      (midi) => {
        midiAccess = midi;
        midi.onstatechange = onStateChange;
        midi.inputs.forEach((port: any) => addDevice(port));
      },
      (error) => console.log('Error accessing MIDI', error)
    );
  } else {
    console.log('No access to MIDI devices: browser does not support WebMIDI API.');
  }
}

export function useMidi(callbacks?: MidiActions) {
  initMidi();

  if (callbacks) {
    listeners.add(callbacks);
  }

  function unsubscribe() {
    if (callbacks) {
      listeners.delete(callbacks);
    }
  }

  return {
    devices,
    selectDevice,
    unsubscribe
  };
}
