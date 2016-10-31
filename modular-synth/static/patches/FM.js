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
      to: {
        port: 1,
        label: 'gain',
        data: null,
        module: {
          'id': 2, 'type': 'Node', 'x': 383, 'y': 225
        }
      },
      from: {
        port: 1, label: 'output-2', 'data': {},
        module: {
          id: 1, type: 'Node', 'x': 100, 'y': 237
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
      to: {
        port: 0, label: 'freq', 'data': {},
        module: {
          id: 2, type: 'Node', 'x': 383, 'y': 225
        }
      },
      from: {
        port: 0, label: 'output-1', 'data': {},
        module: {
          id: 1, type: 'Node', 'x': 100, 'y': 237
        }
      }
    }
  ]

};
