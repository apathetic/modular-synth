import { state as blank } from '@/stores/patch';


/**
 * This validates the Patch Object coming from the server, and
 * ensures that each object has all the requesite fields. This
 * is important because everywhere else in the App we assume that
 * these fields are present -- and Firebase does _not_ store empty
 * values / arrays, etc. All data checks happen only here.
 * @param  {Patch[]} patches The Object of the user's patches.
 * @return {Patch[]) The patches Object, with any data-corrections made.
 */
export function validateData(patches: Patch[]) {
  const DEFAULT = blank();

  for (const key in patches) {
    if (!patches.hasOwnProperty(key)) { continue; }

    const patch = patches[key];

    if (!patch.name) {
      console.warn('Patch "%s" missing name', key);
      patch.name = DEFAULT.name;
    }

    if (patch.id === undefined) {
      console.warn('Patch "%s" missing id. Fixing...', patch.name);
      patch.id = DEFAULT.id; // note: should autogenerate a UUID, here
    }

    if (!patch.configs) {
      console.warn('Patch "%s" missing configs. Fixing...', patch.name);
      patch.configs = DEFAULT.configs;
    }

    patch.configs.forEach((set) => {
      set.name = set.name || '<missing>';
      if (!set.parameters) {
        console.warn('Patch "%s" missing parameters in "%s". Fixing...', patch.name, set.name);
        set.parameters = DEFAULT.configs[0].parameters;
      }
    });

    if (!patch.connections) {
      console.warn('Patch "%s" missing connections. Fixing...', patch.name);
      patch.connections = DEFAULT.connections;
    }

    if (!patch.modules) {
      console.warn('Patch %s no modules.... (not fixed)', patch.name);
    }
  }

  return patches;
}
