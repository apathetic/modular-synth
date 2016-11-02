export default {
  name: 'FM',
  id: 5,
  modules: [
    {id: 0, type: 'MasterOut', 'x': 735, 'y': 469},
    {id: 1, type: 'Oscillator', 'x': 100, 'y': 237, 'col': 0, 'row': 0},
    {id: 2, type: 'Oscillator', 'x': 383, 'y': 225, 'col': 0, 'row': 1}
  ],
  connections: [
    {
      id: 3,
      from: {
        port: 0, label: 'output-1',
        module: {
          id: 1, type: 'Node'
        }
      },
      to: {
        port: 0,
        label: 'freq',
        module: {
          id: 2, type: 'Node'
        }
      }


      // ideal (?) :
      //  ------------
      //  id: 3,
      //  to: {
      //    id: 2          // the ref module
      //    label: 'gain'  // the port label
      //  },
      //  from: {
      //    id: 1,
      //    label: output-2
      //  }

    },
    {
      id: 4,
      from: {
        port: 0, label: 'output-1',
        module: {
          id: 2, type: 'Node'
        }
      },
      to: {
        port: 0, label: 'out-1',
        module: {
          id: 0, type: 'MasterOut'
        }
      }
    }
  ]

};
