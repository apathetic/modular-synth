<template>
  <div class="midi" v-if="devices.length">
    <h3>midi infos</h3>
    <select @change="onSelect" class="midi-in">
      <option selected disabled>Midi Input</option>
      <option v-for="value in devices" :value="value._uid" track-by="_uid">
        {{ value.name }}
      </option>
    </select>

    <!-- {{ devices | json }} -->

  </div>
</template>


<script>
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
      navigator.requestMIDIAccess({
        sysex: false
      }).then(
        (midi) => {
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
        '_uid': port.id,
        'name': port.name,
        'state': port.state,
        'connection': port.connection
      };
      this.devices.push(device);
    },

    // update the device list when devices get connected, disconnected, opened or closed
    onStateChange(e) {
      const port = e.port;
      const found = !!this.devices.find((d) => { return d._uid === port.id; });

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
      const selected = this.midi.inputs.get(id);    // NOTE: this is not an Array. It is Array-like, and get() is a property unique to it.

      if (this.midiIn) {
        this.midiIn.close();      // close current port
      }

      this.midiIn = selected;   // bind new port...
      this.midiIn.onmidimessage = this.onMIDIMessage;
    },

    onMIDIMessage(event) {
      let cmd = event.data[0] >> 4;
      let channel = event.data[0] & 0xf;
      let note = event.data[1];
      let velocity = event.data[2];

      if (channel === 9) { return; }

      if (cmd === 8 || (cmd === 9 && velocity === 0)) { // with MIDI, note on with velocity zero is the same as note off
        this.$bus.$emit('midi:noteOff', note);
      } else if (cmd === 9) {
        this.$bus.$emit('midi:noteOn', note, velocity / 127.0);
      } else if (cmd === 11) {
        this.$bus.$emit('midi:controller', note, velocity / 127.0);
      } else if (cmd === 14) {
        this.$bus.$emit('midi:pitchWheel', ((velocity * 128.0 + note) - 8192) / 8192.0);
      } else if (cmd === 10) {  // poly aftertouch
        this.$bus.$emit('midi:polyPressure', note, velocity / 127.0);
      } else {
        console.log(event.data[0] + ' ' + event.data[1] + ' ' + event.data[2]);
      }
    }
  }
};

</script>


<style lang="scss">
  select.midi-in { width: 130px; }
</style>
