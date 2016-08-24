export default {
  'name': 'Mod',
  'id': 5,
  'cid': 7,
  'connections': [{
    'id': 0,
    'to': {
      'port': 1,
      'label': 'gain',
      'data': null,
      'module': {
        'id': 2,
        'type': 'Node',
        'x': 348,
        'y': 145
      }
    },
    'from': {
      'module': {
        'id': 1,
        'type': 'Node',
        'x': 357,
        'y': 62
      },
      'port': 1,
      'label': 'output-2',
      'data': {}
    }
  }, {
    'id': 1,
    'to': {
      'port': 0,
      'label': 'freq',
      'data': {},
      'module': {
        'id': 2,
        'type': 'Node',
        'x': 348,
        'y': 145
      }
    },
    'from': {
      'module': {
        'id': 1,
        'type': 'Node',
        'x': 357,
        'y': 62
      },
      'port': 0,
      'label': 'output-1',
      'data': {}
    }
  }, {
    'id': 3,
    'to': {
      'port': 0,
      'label': 'freq',
      'data': {},
      'module': {
        'id': '3',
        'type': 'Oscillator',
        'x': 167,
        'y': 459
      }
    },
    'from': {
      'module': {
        'id': '4',
        'type': 'LFO',
        'x': 23,
        'y': 132
      },
      'port': 0,
      'label': 'output',
      'data': {}
    }
  }, {
    'id': 5,
    'to': {
      'port': 0,
      'label': 'out-1',
      'data': {},
      'module': {
        'type': 'MasterOut',
        'id': 0,
        'x': 641,
        'y': 474
      }
    },
    'from': {
      'module': {
        'id': '3',
        'type': 'Oscillator',
        'x': 167,
        'y': 459
      },
      'port': 0,
      'label': 'output',
      'data': {}
    }
  }, {
    'id': 6,
    'to': {
      'port': 1,
      'label': 'out-2',
      'data': {},
      'module': {
        'type': 'MasterOut',
        'id': 0,
        'x': 641,
        'y': 474
      }
    },
    'from': {
      'module': {
        'id': '3',
        'type': 'Oscillator',
        'x': 167,
        'y': 459
      },
      'port': 0,
      'label': 'output',
      'data': {}
    }
  }],
  'modules': [{
    'type': 'MasterOut',
    'id': 0,
    'x': 641,
    'y': 474
  }, {
    'id': 1,
    'type': 'Node',
    'x': 357,
    'y': 62
  }, {
    'id': 2,
    'type': 'Node',
    'x': 348,
    'y': 145
  }, {
    'id': '3',
    'type': 'Oscillator',
    'x': 167,
    'y': 459
  }, {
    'id': '4',
    'type': 'LFO',
    'x': 23,
    'y': 132
  }]
};
