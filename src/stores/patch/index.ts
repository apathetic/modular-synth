const uuid = (): string => crypto.randomUUID();

export const masterout = {
  type: 'MasterOut',
  id: 0,
  x: 0,
  y: 0,
} as MasterOut;


// A.K.A. "blank" state — the minimum viable Patch: no user-placed modules, no
// connections, a single empty preset, just the MasterOut sentinel. Concrete
// synths (e.g. `~/synths/basic`, `~/synths/dx7`) build on top via `...state()`.
export const state = () => <Patch>{
  id: uuid(),
  i: 0, // keeps track of modules, augmented when new module is added. could use uuid maybe
  loaded: false,
  name: '-',
  modules: [masterout],
  connections: [],
  presets: [{
    name: '-',
    parameters: {},
  }],
};
