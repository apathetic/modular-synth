<template>
  <div class="midi" v-if="devices.length">
    <h3>midi infos</h3>
    <select class="midi-in select" @change="onSelect">
      <option selected disabled>&lt;select input&gt;</option>
      <option v-for="value in devices" :value="value._uid" :key="value._uid">
        {{ value.name }}
      </option>
    </select>
  </div>
</template>


<script lang="ts">
import { EVENT } from '@/events';
import { useEventBus } from '@/composables';

export default {
  data() {
    return {
      midiIn: null,
      midi: null,
      devices: []
    };
  },

  created() {
    if (navigator.requestMIDIAccess) {
      navigator
        .requestMIDIAccess({ sysex: false })
        .then((midi) => {
          this.midi = midi;
          midi.onstatechange = this.onStateChange;
          midi.inputs.forEach((port) => {
            this.addDevice(port);
          });
        },
        (error) => {
          console.log('Error accessing MIDI', error);
        }
      );
    } else {
      console.log('No access to MIDI devices: browser does not support WebMIDI API.');
    }
  },

  methods: {
    addDevice(port) {
      const device = {
        _uid: port.id,
        name: port.name,
        state: port.state,
        connection: port.connection
      };
      this.devices.push(device);
    },

    // update the device list when devices get connected, disconnected, opened or closed
    onStateChange(e) {
      const port = e.port;
      const found = !!this.devices.find((d) => d._uid === port.id);

      console.log('state change ', found, port.connection, port.state);

      if (port.type === 'input') {
        if (port.state === 'disconnected' && found) {
          console.log('removing input device %s', port.id);
          // delete this.devices[port.id];
          // this.devices.splice(this.devices.indexOf(i), 1);
          this.devices.pop();
        } else if (port.state === 'connected' && !found) {
          console.log('adding input device %s', port.id);
          this.addDevice(port);
        }
      }
    },

    onSelect(event) {
      const id = event.target.value;
      const selected = this.midi.inputs.get(id);    // NOTE: not an Array; it is Array-like. get() is a property on it

      if (this.midiIn) {
        this.midiIn.close();      // close current port
      }

      this.midiIn = selected;   // bind new port...
      this.midiIn.onmidimessage = this.onMIDIMessage;
    },

    onMIDIMessage({ data }: any) {
      const cmd = data[0] >> 4;
      const channel = data[0] & 0xf;
      const note = data[1];
      const velocity = data[2];
      const bus = useEventBus('midi');

      if (channel === 9) { return; }

      if (cmd === 8 || (cmd === 9 && velocity === 0)) { // with MIDI, note on with velocity zero is the same as note off
        bus.emit(EVENT.MIDI_NOTEOFF, { note });
      } else if (cmd === 9) {
        bus.emit(EVENT.MIDI_NOTEON, { note, velocity }); // / 127.0);
      } else if (cmd === 11) {
        bus.emit(EVENT.MIDI_CONTROLLER, { note, velocity }); // / 127.0);
      } else if (cmd === 14) {
        bus.emit(EVENT.MIDI_PITCH, { xxx: ((velocity * 128.0 + note) - 8192) / 8192.0 });
      } else if (cmd === 10) {  // poly aftertouch
        bus.emit(EVENT.MIDI_POLY, { note, velocity }); // / 127.0);
      } else {
        console.log('[MIDI] did not respond to:' + data[0] + ' ' + data[1] + ' ' + data[2]);
      }
    }
  }
};

</script>


<style>
  select.midi-in { width: 92px; }
</style>
