import { state } from '~/stores/patch';

/**
 * Seed patch used when localStorage is empty or reset via the dev Clear button.
 * A small, playable starting point: NoteIn -> OSC -> VCA -> MasterOut with an
 * Env modulating the VCA. Ships with a `Vanilla` preset of sensible defaults.
 *
 * NOTE: preset parameters are indexed first by `moduleId`, then by parameter
 * name — e.g. `parameters[1].freq = 100`. This is the same shape that
 * `useParameter` writes at runtime.
 */
export const basicPatch = (): Patch => (<Patch>{
  ...state(),
  i: 10,
  name: 'Basic',
  modules: [
    { id: 0, type: 'MasterOut', x: 1100, y: 441 },
    { id: 1, type: 'OSC',    x: 399, y: 173, col: 0, row: 0, w: 4, h: 1 },
    { id: 2, type: 'NoteIn', x: 163, y: 254, col: 4, row: 0, w: 2, h: 1 },
    { id: 4, type: 'VCA',    x: 665, y: 269, col: 6, row: 0, w: 2, h: 1 },
    { id: 5, type: 'Env',    x: 434, y: 439, col: 8, row: 0, w: 3, h: 1 },
  ],
  connections: [
    { id: 2, from: { id: 2, port: 0 }, to: { id: 1, port: 0 } }, // NoteIn pitch -> OSC freq
    { id: 5, from: { id: 2, port: 1 }, to: { id: 5, port: 0 } }, // NoteIn gate -> Env gate
    { id: 6, from: { id: 5, port: 0 }, to: { id: 4, port: 1 } }, // Env out    -> VCA gain
    { id: 7, from: { id: 1, port: 0 }, to: { id: 4, port: 0 } }, // OSC out    -> VCA in
    { id: 8, from: { id: 4, port: 0 }, to: { id: 0, port: 1 } }, // VCA out    -> MasterOut R
    { id: 9, from: { id: 4, port: 0 }, to: { id: 0, port: 0 } }, // VCA out    -> MasterOut L
  ],
  presets: [{
    name: 'Vanilla',
    parameters: {
      1: { mod: 0, freq: 100, PW: 0, detune: -500 },
      5: { attack: 0.01, decay: 0.01, sustain: 0.01, release: 0.01 },
    },
  }],
});
