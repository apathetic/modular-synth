export default {
  'name': 'Mod',
  'id': 10,
  'connections': [
    {
      'id': 1,
      'to': {
        'port': 1,
        'id': 2
      },
      'from': {
        'id': 1,
        'port': 1
      }
    },
    {
      'id': 2,
      'to': {
        'port': 0,
        'id': 2
      },
      'from': {
        'id': 1,
        'port': 0
      }
    },
    {
      'id': 3,
      'to': {
        'port': 0,
        'id': 3
      },
      'from': {
        'id': 4,
        'port': 0
      }
    },
    {
      'id': 4,
      'to': {
        'port': 0,
        'id': 0
      },
      'from': {
        'id': '3',
        'port': 0
      }
    },
    {
      'id': 5,
      'to': {
        'port': 1,
        'id': 0
      },
      'from': {
        'id': '3',
        'port': 0
      }
    }
  ],
  'modules': [
    {
      'type': 'MasterOut',
      'id': 0,
      'x': 641,
      'y': 474
    }, {
      'id': 6,
      'type': 'Node',
      'x': 357,
      'y': 62
    }, {
      'id': 7,
      'type': 'Node',
      'x': 348,
      'y': 145
    }, {
      'id': 8,
      'type': 'Oscillator',
      'x': 167,
      'y': 459
    }, {
      'id': 9,
      'type': 'LFO',
      'x': 23,
      'y': 132
    }
  ]
};
