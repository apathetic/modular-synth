import { validateData } from '@/utils/firebase';

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
};

export const SET_PATCHES = (state, patches) => {
  state.patches = validateData(patches);
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

// // better name: MODULES ...?  WEBAUDIO_NODES?
// export const ADD_TO_REGISTRY = (state, payload) => {
//   state.registry[payload.id] = payload.node;
// };

// export const REMOVE_FROM_REGISTRY = (state, id) => {
//   delete state.registry[id];
// };


// -----------------------------------------------
//  UI
// -----------------------------------------------
// export const SET_ACTIVE = (state, id) => {
//   state.activeId = id;
// };

// export const CLEAR_ACTIVE = (state) => {
//   state.activeId = undefined;
// };

// export const SET_FOCUS = (state, id) => {
//   state.focusedId = id;
// };

// export const CLEAR_FOCUS = (state) => {
//   state.focusedId = undefined;
// };



// -----------------------------------------------
//  POSITION
// -----------------------------------------------

export const UPDATE_SCROLL_OFFSET = (state, data) => {
  state.canvasOffset = data;
};

