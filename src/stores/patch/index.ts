import type {
  Patch,
  Module,
} from '@/types';

const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0
    const v = c == 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  });
};

const masterout = {
  type: 'MasterOut',
  id: 0,
  x: 0,
  y: 0,
} as unknown as Module;


// A.K.A. "blank" state
export const state = () => <Patch>{
  id: uuid(),
  i: 0, // keeps track of modules, augmented when new module is added. could use uuid maybe
  name: 'untitled',
  modules: [masterout],
  connections: [],
  configs: [{  // "settings ..?  parameterSets
    name: '<blank>',
    parameters: {}
  }]
};
