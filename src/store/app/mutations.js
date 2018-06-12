import { validateData } from '../../schema';

// -----------------------------------------------
//  PATCH
// -----------------------------------------------

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


// -----------------------------------------------
//  UI
// -----------------------------------------------
// TODO ----------------- move to VUE BUS ?
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

