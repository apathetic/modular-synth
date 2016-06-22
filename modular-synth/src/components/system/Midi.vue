<template>
  <h3>midi infos</h3>
  <div id="log">{{ divLog }}</div>
  <div id="inputs" v-el:inputs></div>
  <div id="outputs" v-el:outputs></div>

  inputs:
  <select>
    <option v-for="value in devices.inputs" v-bind:value="_uid" track-by="_uid">
      {{ value.name }} ({{ value.manufacturer }})
    </option>
  </select>

  outputs:
  <select>
    <option v-for="value in devices.outputs" v-bind:value="_uid" track-by="_uid">
      {{ value.name }} ({{ value.manufacturer }})
    </option>
  </select>

  {{ devices | json }}
</template>


<script>
export default {
  data() {
    return {
      // divLog: document.getElementById('log'),
      // divInputs: document.getElementById('inputs'),
      // divOutputs: document.getElementById('outputs'),
      divLog: '',
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

    // update the device list when devices get connected, disconnected, opened or closed
    onstatechange(e) {
      var port = e.port;
      let device = {};
     // var div = port.type === 'input' ? divInputs : divOutputs;
      // var listener = port.type === 'input' ? checkboxMIDIInOnChange : checkboxMIDIOutOnChange;
      // var activePorts = port.type === 'input' ? activeInputs : activeOutputs;
      // var checkbox = document.getElementById(port.type + port.id);
      // var label;


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

      // device disconnected
      // if (port.state === 'disconnected') {
      //   port.close();
      //   label = checkbox.parentNode;
      //   checkbox.nextSibling.nodeValue = port.name + ' (' + port.state + ', ' +  port.connection + ')';
      //   checkbox.disabled = true;
      //   checkbox.checked = false;
      //   delete activePorts[port.type + port.id];

      // // new device connected
      // } else if (checkbox === null) {
      //   label = document.createElement('label');
      //   checkbox = document.createElement('input');
      //   checkbox.type = 'checkbox';
      //   checkbox.id = port.type + port.id;
      //   checkbox.addEventListener('change', listener, false);
      //   label.appendChild(checkbox);
      //   label.appendChild(document.createTextNode(port.name + ' (' + port.state + ', ' +  port.connection + ')'));
      //   div.appendChild(label);
      //   div.appendChild(document.createElement('br'));

      // // device opened or closed
      // } else if (checkbox !== null) {
      //   label = checkbox.parentNode;
      //   checkbox.disabled = false;
      //   checkbox.nextSibling.nodeValue = port.name + ' (' + port.state + ', ' +  port.connection + ')';
      // }
    },

    inputListener(midimessageEvent) {
      let port;
      let portId;
      let data = midimessageEvent.data;
      let type = data[0];
      let data1 = data[1];
      let data2 = data[2];

      // do something graphical with the incoming midi data
      // this.divLog.innerHTML = type + ' ' + data1 + ' ' + data2 + '<br>' + this.divLog.innerHTML;
      this.divLog += type + ' ' + data1 + ' ' + data2 + '<br>';

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