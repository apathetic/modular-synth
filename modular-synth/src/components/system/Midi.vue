<template>
  <div class="midi" v-if="devices.length">
    <h3>midi infos</h3>
    <select v-model="selected" @change="onSelect" class="midi-in">
      <option v-for="value in devices" :value="value._uid" track-by="_uid">
        {{ value.name }} ({{ value.manufacturer }})
      </option>
    </select>
    Current: {{ selected }}
    {{ devices | json }}
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
        this.listDevices();
        midiAccess.onstatechange = this.onStateChange;
      },
      (error) => {
        console.log('Error accessing MIDI', error);
      });
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
        'manufacturer': port.manufacturer,
        'connection': port.connection
      };
      this.devices.push(device);
    },

    listDevices() {
      const inputs = this.midiAccess.inputs;

      inputs.forEach((port) => {
        this.addDevice(port);
      });
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
      const selected = this.midiAccess.inputs.get(id);    // NOTE: this is not an Array. It is Array-like, and get() is a property unique to it.

      if (this.midiIn) {
        //     this.midiIn.onmidimessage = null;
        this.midiIn.close();      // close current port
      }

      console.log(this.midiIn);
      this.midiIn = selected;   // bind new port...
      // this.midiIn.onmidimessage = this.inputListener; // ... and open it
      this.midiIn.onmidimessage = this.midiMessageReceived;// ???????????
    },

    // inputListener(midimessageEvent) {
    //   let port;
    //   let portId;
    //   let data = midimessageEvent.data;
    //   let type = data[0];
    //   let data1 = data[1];
    //   let data2 = data[2];
    //
    //   // do something graphical with the incoming midi data
    //   // this.log.innerHTML = type + ' ' + data1 + ' ' + data2 + '<br>' + this.log.innerHTML;
    //   this.log += type + ' ' + data1 + ' ' + data2 + '<br>';
    //
    //   for (portId in this.activeOutputs) {
    //     if (this.activeOutputs.hasOwnProperty(portId)) {
    //       port = this.activeOutputs[portId];
    //       port.send(data);
    //     }
    //   }
    // },

    midiMessageReceived(event) {
      let cmd = event.data[0] >> 4;
      let channel = event.data[0] & 0xf;
      let noteNumber = event.data[1];
      let velocity = event.data[2];

      if (channel === 9) { return; }

      if (cmd === 8 || (cmd === 9 && velocity === 0)) { // with MIDI, note on with velocity zero is the same as note off
        // this.noteOff(noteNumber);
        this.$dispatch('midi:noteOff', noteNumber);
        console.log(noteNumber);
      } else if (cmd === 9) {
        // this.noteOn(noteNumber, velocity / 127.0);
        this.$dispatch('midi:noteOn', noteNumber, velocity / 127.0);
        console.log(noteNumber, velocity / 127.0);
      } else if (cmd === 11) {
        // this.controller(noteNumber, velocity / 127.0);
        this.$dispatch('midi:controller', noteNumber, velocity / 127.0);
      } else if (cmd === 14) {
        // this.pitchWheel(((velocity * 128.0 + noteNumber) - 8192) / 8192.0);
        this.$dispatch('midi:pitchWheel', ((velocity * 128.0 + noteNumber) - 8192) / 8192.0);
      } else if (cmd === 10) {  // poly aftertouch
        // this.polyPressure(noteNumber, velocity / 127);
        this.$dispatch('midi:polyPressure', noteNumber, velocity / 127.0);
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
