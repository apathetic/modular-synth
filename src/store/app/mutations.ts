import { validateData } from '../firebase';

// -----------------------------------------------
//  PATCH
// -----------------------------------------------

// loads modules, id, and patch name
// connection, parameters are loaded below
export const LOAD_PATCH = (state, patch) => {
  if (patch) {
    state.id = patch.id;
    state.name = patch.name;
    state.modules = patch.modules;
    state.parameterSets = patch.parameterSets;
    // NOTE: parameters (knobs, sliders, etc) are created only after
    // their parent; they then register themselves within the store.
    // Parameter _values_ are then fetched once the params:load event
    // is fired
  }
};

export const SAVE_PATCH = (state, data) => {
  const patch = data.patch;
  const key = data.key;

  state.patches[key] = patch;
};

export const REMOVE_PATCH = (state, key) => {
  delete state.patches[key];
  // Vue.delete(state.patches, key);
  // state.patches.$remove(key);
  // state.patches = state.patches.filter(....
};

export const SET_PATCHES = (state, patches) => {
  state.patches = validateData(patches); // patches;
};

export const SET_KEY = (state, key) => {
  state.patchKey = key;
};


// -----------------------------------------------
//  APP
// -----------------------------------------------
export const TOGGLE_POWER = (state) => {
  state.power = !state.power;
};

export const TOGGLE_EDIT = (state) => {
  state.editing = !state.editing;
};

export const ADD_TO_REGISTRY = (state, payload) => {
  state.registry[payload.id] = payload.node;
};

export const REMOVE_FROM_REGISTRY = (state, id) => {
  delete state.registry[id];
};


// -----------------------------------------------
//  UI
// -----------------------------------------------
export const SET_ACTIVE = (state, id) => {
  state.active = id;
};

export const CLEAR_ACTIVE = (state) => {
  state.active = undefined;
};

export const SET_FOCUS = (state, id) => {
  state.focused = id;
};

export const CLEAR_FOCUS = (state) => {
  state.focused = undefined;
};



// -----------------------------------------------
//  POSITION
// -----------------------------------------------

export const UPDATE_SCROLL_OFFSET = (state, data) => {
  state.canvasOffset = data;
};

