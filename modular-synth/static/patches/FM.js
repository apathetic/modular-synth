export default {
  name: 'FM',
  id: 5,
  modules: [
    {id: 0, type: 'MasterOut', 'x': 735, 'y': 469},
    {id: 1, type: 'Oscillator', 'x': 100, 'y': 237, 'col': 0, 'row': 0, 'w': 1, 'h': 1},
    {id: 2, type: 'Oscillator', 'x': 383, 'y': 225, 'col': 0, 'row': 1, 'w': 1, 'h': 1}
  ],
  connections: [
    {
      id: 3,
      from: {
        id: 1,
        port: 0,
        label: 'output-1'
      },
      to: {
        id: 2,
        port: 0,
        label: 'freq'
      }
    },
    {
      id: 4,
      from: {
        id: 2,
        port: 0,
        label: 'output-1'
      },
      to: {
        id: 0,
        port: 0,
        label: 'out-1'
      }
    }
  ]

};
