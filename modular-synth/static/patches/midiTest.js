export default {
  name: 'midi test',
  id: 5,
  modules: [
    {id: 0, type: 'MasterOut', 'x': 735, 'y': 469},
    {id: 1, type: 'NoteIn', 'x': 100, 'y': 237, 'col': 0, 'row': 0, 'w': 1, 'h': 1},
    {id: 2, type: 'Oscillator', 'x': 383, 'y': 225, 'col': 0, 'row': 1, 'w': 1, 'h': 1}
  ],
  connections: [
    {
      id: 4,
      from: {
        id: 2,
        port: 0
      },
      to: {
        id: 0,
        port: 0
      }
    }
  ]

};
