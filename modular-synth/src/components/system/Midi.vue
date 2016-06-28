<template>
  <h3>midi infos</h3>
  <div id="log">{{ log }}</div>
  <div id="inputs" v-el:inputs></div>
  <div id="outputs" v-el:outputs></div>

  inputs:
  <select>
    <option v-for="value in devices.inputs" v-bind:value="value._uid" track-by="_uid">
      {{ value.name }} ({{ value.manufacturer }})
    </option>
  </select>

  outputs:
  <select>
    <option v-for="value in devices.outputs" v-bind:value="value._uid" track-by="_uid">
      {{ value.name }} ({{ value.manufacturer }})
    </option>
  </select>

  <!-- {{ devices | json }} -->
</template>


<script>
export default {
  data() {
    return {
      // log: document.getElementById('log'),
      // divInputs: document.getElementById('inputs'),
      // divOutputs: document.getElementById('outputs'),
      midiIn: null,

      log: '',
      divInputs: '',
      divOutputs: '',
      midiAccess: null,
      checkboxMIDIInOnChange: null,
      checkboxMIDIOutOnChange: null,
      activeInputs: {},
      activeOutputs: {},
      devices: {
        inputs: [],
        outputs: []
      }
    };
  },

  created() {
    if (navigator.requestMIDIAccess !== undefined) {
      navigator.requestMIDIAccess().then((midiAccess) => {
        this.midiAccess = midiAccess;
        this.showMIDIPorts();
        midiAccess.onstatechange = this.onstatechange;
      },
      (error) => {
        this.divInputs = error.message;
        this.divOutputs = '';
      });
    } else {
      this.divInputs = 'No access to MIDI devices: browser does not support WebMIDI API.';
      this.divOutputs = '';
    }
  },

  methods: {
    showMIDIPorts() {
      let html;
      let checkbox;
      let checkboxes;
      let inputs;
      let outputs;
      // let i;
      // let maxi;

      inputs = this.midiAccess.inputs;
      html = '<h4>midi inputs:</h4>';
      inputs.forEach(function(port) {
        // console.log('in', port.name, port.id);
        html += '<label><input type="checkbox" id="' + port.type + port.id + '">' + port.name + ' (' + port.state + ', ' + port.connection + ')</label><br>';
      });

      // this.divInputs.innerHTML = html;
      this.divInputs = html;

      outputs = this.midiAccess.outputs;
      html = '<h4>midi outputs:</h4>';
      outputs.forEach(function(port) {
        // console.log('out', port.name, port.id);
        html += '<label><input type="checkbox" id="' + port.type + port.id + '">' + port.name + ' (' + port.state + ', ' + port.connection + ')</label><br>';
      });
      // this.divOutputs.innerHTML = html;
      this.divOutputs = html;

      checkboxes = document.querySelectorAll('#inputs input[type="checkbox"]');
      for (let i = 0, maxi = checkboxes.length; i < maxi; i++) {
        checkbox = checkboxes[i];
        checkbox.addEventListener('change', this.checkboxMIDIInOnChange, false);
      }

      checkboxes = document.querySelectorAll('#outputs input[type="checkbox"]');
      for (let i = 0, maxi = checkboxes.length; i < maxi; i++) {
        checkbox = checkboxes[i];
        checkbox.addEventListener('change', this.checkboxMIDIOutOnChange, false);
      }
    },

    selectMIDIIn(ev) {
      let midiIn = this.midiIn;
      let midiAccess = this.midiAccess;

      if (midiIn) {
        midiIn.onmidimessage = null;
      }
      if (typeof (midiAccess.inputs) === 'function') {   // Old Skool MIDI inputs() code
        midiIn = midiAccess.inputs()[ev.target.selectedIndex];
      } else {
        let id = ev.target[ev.target.selectedIndex].value;
        midiIn = midiAccess.inputs.get(id);
      }
      if (midiIn) {
        midiIn.onmidimessage = this.midiMessageReceived;
      }
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

    noteOn() {},
    noteOff() {},
    controller() {},
    polyPressure() {},

    // update the device list when devices get connected, disconnected, opened or closed
    onstatechange(e) {
      var port = e.port;
      let device = {};

      if (port.state === 'disconnected') {
        if (port.type === 'input') {
          console.log('removing input device %s', port.id);
          delete this.devices.inputs[port.id];
        } else {
          console.log('removing output device %s', port.id);
          delete this.devices.outputs[port.id];
        }
        return;
      }

      device = {
        '_uid': port.id,
        'name': port.name,
        'state': port.state,
        'manufacturer': port.manufacturer,
        'connection': port.connection
      };

      if (port.type === 'input') {
        console.log('adding input device %s', port.id);
        this.devices.inputs.push(device);
      } else {
        console.log('adding output device %s', port.id);
        this.devices.outputs.push(device);
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
    },

    checkboxMIDIInOnChange() {
      // port id is the same a the checkbox id
      var id = this.id;
      var port = this.midiAccess.inputs.get(id.replace('input', ''));
      if (this.checked === true) {
        this.activeInputs[id] = port;
        // implicitly open port by adding an onmidimessage listener
        port.onmidimessage = this.inputListener;
      } else {
        delete this.activeInputs[id];
        port.close();
      }
    },

    checkboxMIDIOutOnChange() {
      // port id is the same a the checkbox id
      var id = this.id;
      var port = this.midiAccess.outputs.get(id.replace('output', ''));
      if (this.checked === true) {
        this.activeOutputs[id] = port;
        port.open();
      } else {
        delete this.activeOutputs[id];
        port.close();
      }
    }
  }
};

</script>


<style lang="scss">
</style>