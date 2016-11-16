<template>
  <div class="midi">
    <h3>midi infos</h3>
    <select v-model="selected" @change="select" class="midi-in">
      <option v-for="value in devices" :value="value._uid" track-by="_uid">
        {{ value.name }} ({{ value.manufacturer }})
      </option>
    </select>
    Current: {{ selected }}
  </div>
</template>


<script>
export default {
  data() {
    return {
      selected: null,
      midiIn: null,
      midiAccess: null,
      devices: []
    };
  },

  created() {
    if (navigator.requestMIDIAccess) {
      navigator.requestMIDIAccess().then((midiAccess) => {
        this.midiAccess = midiAccess;
        this.showDevices();
        midiAccess.onstatechange = this.onstatechange;
      },
      (error) => {
        console.log('Error accessing MIDI', error);
      });
    } else {
      console.log('No access to MIDI devices: browser does not support WebMIDI API.');
    }
  },

  methods: {
    showDevices() {
      const inputs = this.midiAccess.inputs;

      inputs.forEach((port) => {
        console.log('type: ', port.type);
        console.log('id:   ', port.id);
        console.log('name: ', port.name);
        console.log('state:', port.state);
        console.log('manft:', port.manufacturer);
        console.log('cnx:  ', port.connection);
        // console.log('type', port.type, port.id, port.name, port.state, port.connection);

        const device = {
          '_uid': port.id,
          'name': port.name,
          'state': port.state,
          'manufacturer': port.manufacturer || '?',
          'connection': port.connection
        };

        this.devices.push(device);
      });
    },

    midiMessageReceived(ev) {
      let cmd = ev.data[0] >> 4;
      let channel = ev.data[0] & 0xf;
      let noteNumber = ev.data[1];
      let velocity = ev.data[2];

      if (channel === 9) { return; }

      if (cmd === 8 || (cmd === 9 && velocity === 0)) { // with MIDI, note on with velocity zero is the same as note off
        this.noteOff(noteNumber);
      } else if (cmd === 9) {
        this.noteOn(noteNumber, velocity / 127.0);
      } else if (cmd === 11) {
        this.controller(noteNumber, velocity / 127.0);
      } else if (cmd === 14) {
        this.pitchWheel(((velocity * 128.0 + noteNumber) - 8192) / 8192.0);
      } else if (cmd === 10) {  // poly aftertouch
        this.polyPressure(noteNumber, velocity / 127);
      } else {
        this.log = ev.data[0] + ' ' + ev.data[1] + ' ' + ev.data[2];
      }
    },

    select(e) {
      const id = e.target.value;
      const selected = this.midiAccess.inputs.get(id);    // NOTE: this is not an Array. It is Array-like, and get() is a property unique to it.

      if (this.midiIn) {
        //     this.midi.onmidimessage = null;
        this.midiIn.close();      // close current port
      }
      this.midiIn = selected;   // bind new port...
      this.midiIn.onmidimessage = this.inputListener; // ... and open it
      // this.midi.onmidimessage = this.midiMessageReceived;// ???????????
    },

    // update the device list when devices get connected, disconnected, opened or closed
    onstatechange(e) {
      const port = e.port;
      const device = {
        '_uid': port.id,
        'name': port.name,
        'state': port.state,
        'manufacturer': port.manufacturer,
        'connection': port.connection
      };

      if (port.state === 'disconnected') {
        if (port.type === 'input') {
          console.log('removing input device %s', port.id);
          delete this.devices[port.id];
          // let i = this.devices.find((j) => { return j.id === port.id; });
          // this.devices.splice(this.devices.indexOf(i), 1);
        }
        return;
      }

      if (port.type === 'input') {
        var found = this.devices.find((d) => { d._uid === port.id; });
        if (!found) {
          console.log('adding input device %s', port.id);
          this.devices.push(device);
        }
      // } else {
      //   console.log('adding output device %s', port.id);
      //   this.devices.outputs.push(device);
      }
    },

    inputListener(midimessageEvent) {
      let port;
      let portId;
      let data = midimessageEvent.data;
      let type = data[0];
      let data1 = data[1];
      let data2 = data[2];

      // do something graphical with the incoming midi data
      // this.log.innerHTML = type + ' ' + data1 + ' ' + data2 + '<br>' + this.log.innerHTML;
      this.log += type + ' ' + data1 + ' ' + data2 + '<br>';

      for (portId in this.activeOutputs) {
        if (this.activeOutputs.hasOwnProperty(portId)) {
          port = this.activeOutputs[portId];
          port.send(data);
        }
      }
    }

  }
};

</script>


<style lang="scss">
  select.midi-in { width: 130px; }
</style>
