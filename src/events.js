export const EVENT = {

  // MIDI
  MIDI_NOTEON: 'midi:noteOn',
  MIDI_NOTEOFF: 'midi:noteOff',
  MIDI_CONTROLLER: 'midi:controller',
  MIDI_PITCH: 'midi:pitchWheel',
  MIDI_POLY: 'midi:polyPressure',

  // CONNECTIONS
  CONNECTION_START: 'connection:start',

  // PARAMETERS
  PARAMETERS_LOAD: 'parameters:load',

  // DRAG
  DRAG_START: 'drag:start',
  DRAG_ACTIVE: 'drag:active',
  DRAG_END: 'drag:end',

  // SORT
  APP_SORT: 'app:sort',

  // MODULES
  MODULE_ADD: 'module:add',
  MODULE_REMOVE: 'module:remove',

  // NATIVE
  MOUSE_MOVE: 'mousemove',
  MOUSE_UP: 'mouseup',
  KEY_DOWN: 'keydown',
  KEY_UP: 'keyup',
  RESIZE: 'resize',
  CLICK: 'click'
  // CONTEXT_MENU: 'contextmenu'
};
