import { validateData } from '@/utils/validatePatch';

export function debug() {
  const patches = JSON.parse(localStorage.patches);
  console.log(patches);

  validateData(patches);
}
