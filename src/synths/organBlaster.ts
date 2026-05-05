import { emptyPatch } from '~/synths/empty';

export const organBlasterPatch = (): Patch => (<Patch>{
  ...emptyPatch(),
  i: 31,
  name: 'Organ Blaster',
  modules: [
    { type: 'MasterOut', id: 0, x: 680, y: 699 },
    { id: 1, type: 'NoteIn', x: 32, y: 120, col: 0, row: 0, w: 2, h: 1 },
    { id: 2, type: 'Env', x: 211, y: 31, col: 0, row: 0, w: 3, h: 1 },
    { id: 3, type: 'Mixer', x: 858, y: 217, col: 3, row: 0, w: 4, h: 1 },
    { id: 4, type: 'Filter', x: 1110, y: 123, col: 0, row: 1, w: 3, h: 1 },
    { id: 5, type: 'Env', x: 820, y: 470, col: 3, row: 1, w: 3, h: 1 },
    { id: 6, type: 'VCA', x: 1283, y: 206, col: 6, row: 1, w: 2, h: 1 },
    { id: 7, type: 'Delay', x: 1457, y: 210, col: 0, row: 2, w: 4, h: 1 },
    { id: 8, type: 'LFO', x: 489, y: 432, col: 8, row: 1, w: 2, h: 1 },
    { id: 9, type: 'Boutique', x: 667, y: 277, col: 4, row: 2, w: 3, h: 1 },
    { id: 10, type: 'Boutique', x: 679, y: 150, col: 7, row: 0, w: 3, h: 1 }
  ],
  connections: [
    { id: 0, from: { id: 1, port: 0 }, to: { id: 10, port: 0 } },
    { id: 1, from: { id: 2, port: 0 }, to: { id: 8, port: 1 } },
    { id: 2, from: { id: 1, port: 1 }, to: { id: 8, port: 0 } },
    { id: 3, from: { id: 8, port: 0 }, to: { id: 4, port: 2 } },
    { id: 4, from: { id: 1, port: 1 }, to: { id: 2, port: 0 } },
    { id: 5, from: { id: 1, port: 1 }, to: { id: 5, port: 0 } },
    { id: 6, from: { id: 8, port: 0 }, to: { id: 10, port: 2 } },
    { id: 7, from: { id: 8, port: 0 }, to: { id: 9, port: 2 } },
    { id: 8, from: { id: 8, port: 0 }, to: { id: 6, port: 1 } },
    { id: 9, from: { id: 1, port: 0 }, to: { id: 9, port: 0 } },
    { id: 10, from: { id: 9, port: 0 }, to: { id: 3, port: 1 } },
    { id: 11, from: { id: 10, port: 0 }, to: { id: 3, port: 0 } },
    { id: 12, from: { id: 5, port: 0 }, to: { id: 6, port: 1 } },
    { id: 13, from: { id: 4, port: 0 }, to: { id: 6, port: 0 } },
    { id: 14, from: { id: 3, port: 0 }, to: { id: 4, port: 0 } },
    { id: 15, from: { id: 1, port: 0 }, to: { id: 4, port: 1 } },
    { id: 16, from: { id: 7, port: 0 }, to: { id: 0, port: 0 } },
    { id: 17, from: { id: 7, port: 0 }, to: { id: 0, port: 1 } },
    { id: 18, from: { id: 6, port: 0 }, to: { id: 7, port: 0 } },
    { id: 19, from: { id: 2, port: 0 }, to: { id: 4, port: 2 } },
    { id: 20, from: { id: 8, port: 0 }, to: { id: 5, port: 1 } },
    { id: 21, from: { id: 8, port: 0 }, to: { id: 7, port: 1 } },
    { id: 22, from: { id: 2, port: 0 }, to: { id: 7, port: 1 } }
  ],
  presets: [
    { name: '-', parameters: {} }
  ]
});
