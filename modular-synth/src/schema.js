/*

class DataApi {
  constructor(rawData) {
    this.rawData = rawData;
  }
  mapIntoObject(arr) {
    return arr.reduce((acc, curr) => {
      acc[curr.id] = curr;
      return acc;
    }, {});
  }
  getArticles() {
    return this.mapIntoObject(this.rawData.articles);
  }
  getAuthors() {
    return this.mapIntoObject(this.rawData.authors);
  }
}

export default DataApi;
*/



/**
 * This validates the Patch Object coming from Firebase, and
 * ensures that each Object has all the requesite fields. This
 * is important because everywhere else in the App we assume that
 * these fields are present; all data check happen only here.
 * @param  {Object} patches The Object of the user's patches.
 * @return {Object) The patches Object, with any data-corrections made.
 */
export function validateData(patches) {
  for (let key in patches) {
    const patch = patches[key];

    // if (typeof patch !== "object") {
    //   console.warn('patch prob ', key);
    //   return;
    // }
    //
    // check(patch.name, 'name', type)


    if (!patch.name) {
      console.warn('Patch "%s" missing name', key);
      patch.name = 'xxxx';
    }

    if (patch.id === undefined) {
      console.warn('Patch "%s" missing id. Fixing...', patch.name);
      patch.id = 0;
    }

    if (!patch.parameterSets) {
      console.warn('Patch "%s" missing parameterSets. Fixing...', patch.name);
      patch.parameterSets = [];
    }

    patch.parameterSets.forEach((set) => {
      set.name = set.name || 'yyyy';
      if (!set.parameters) {
        console.warn('Patch "%s" missing parameters in "%s". Fixing...', patch.name, set.name);
        set.parameters = {};
      }
    });

    if (!patch.connections) {
      console.warn('Patch "%s" missing connections. Fixing...', patch.name);
      patch.connections = [];
    }

    if (!patch.modules) {
      console.warn('Patch %s no modules.... (not fixed)', patch.name);
    }
  }

  return patches;
}
