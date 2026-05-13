
// -----------------------------------------------
//  APP
// -----------------------------------------------
// export const headerHeight = 48;

// -----------------------------------------------
//  MODULE
// -----------------------------------------------

export const rackHeight = 250;
export const rackWidth = 64; // per unit
export const cellHeight = 90;
export const cellWidth = 120;

/**
 * Rack unit sizes when in "Play" mode. The third item is the module height
 * when in in "Edit" mode.
 * @type {Object}
 */
export const moduleSize: Record<moduleType, Array<number>> = {
  'Analyser':   [6, 1],
  'Bento':      [4, 1],
  'Boutique':   [3, 1],
  'Clock':      [2, 1],
  // 'Comb':       [3, 1],
  'Compressor': [3, 1],
  'Debugger':   [1, 1],
  'Delay':      [3, 1],
  'Drive':      [2, 1],
  'Env':        [2, 1],
  'Filter':     [3, 1],
  'LFO':        [2, 1],
  'Mixer':      [2, 1],
  'Node':       [4, 1],
  'NoteIn':     [2, 1],
  'Reverb':     [3, 1],
  'VCA':        [2, 1],
  'VCF':        [3, 1],

  // 'VCO': [4, 1, 'tall'],
  'OSC': [4, 1], // 'tall'],
  'Monarch': [3, 1] // 'tall'],

};
