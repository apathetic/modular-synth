const uuid = (): string => crypto.randomUUID();

export const masterout = {
  type: 'MasterOut',
  id: 0,
  x: 0,
  y: 0,
} as MasterOut;

// A.K.A. "blank" state — the minimum viable Patch: no user-placed modules, no
// connections; just a single empty preset and the MasterOut.
// Concrete synths (e.g. `./simple`, `./dx7`) build on top of this.
export const emptyPatch = () => <Patch>{
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
