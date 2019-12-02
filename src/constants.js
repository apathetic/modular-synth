// -----------------------------------------------
//  APP
// -----------------------------------------------
// export const headerHeight = 48;

// -----------------------------------------------
//  MODULE
// -----------------------------------------------

export const rackHeight = 240;
export const rackWidth = 60;
export const cellHeight = 90;
export const cellWidth = 120;

/**
 * Rack unit sizes when in "Play" mode. The third item is the module height
 * when in in "Edit" mode.
 * @type {Object}
 */
export const moduleSize = {
  'Analyser': [6, 1],
  'Clock': {},
  'Comb': [3, 1],
  'Compressor': [3, 1],
  'Debugger': [1, 1],
  'Delay': [4, 1],
  'Drive': [2, 1],
  'Env': [3, 1],
  'Filter': [3, 1],
  'LFO': [2, 1],
  'Mixer': [3, 1, 'tall'],
  'Node': [4, 1],
  'NoteIn': [2, 1, 'tall'],
  'Reverb': [3, 1],
  'VCA': [2, 1],
  'VCF': [3, 1],
  'VCO': [4, 1, 'tall'],

  'OSC': [2, 1],

};
