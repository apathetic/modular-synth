import { loadPatches } from '~/utils/persistence';
import { validateData } from '~/utils/validatePatch';

export function debug() {
  const patches = loadPatches();
  console.log(patches);

  try {
    validateData(patches);
  } catch (err) {
    console.warn('[debug] validateData threw:', err);
  }
}
