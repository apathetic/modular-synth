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

export const DEFAULT = {
  id: 0,
  name: '<blank>',
  modules: [{'type': 'MasterOut', 'id': 0, 'x': 0, 'y': 0}],
  connections: [],
  parameterSets: [{
    name: '<empty>',
    parameters: {}
  }]
};



/**
 * This validates the Patch Object coming from Firebase, and
 * ensures that each Object has all the requesite fields. This
 * is important because everywhere else in the App we assume that
 * these fields are present; all data checks happen only here.
 * @param  {Object} patches The Object of the user's patches.
 * @return {Object) The patches Object, with any data-corrections made.
 */
export function validateData(patches) {
  for (let key in patches) {
    const patch = patches[key];

    if (!patch.name) {
      console.warn('Patch "%s" missing name', key);
      patch.name = DEFAULT.name;
    }

    if (patch.id === undefined) {
      console.warn('Patch "%s" missing id. Fixing...', patch.name);
      patch.id = DEFAULT.id;
    }

    if (!patch.parameterSets) {
      console.warn('Patch "%s" missing parameterSets. Fixing...', patch.name);
      patch.parameterSets = DEFAULT.parameterSets;
    }

    patch.parameterSets.forEach((set) => {
      set.name = set.name || '<missing>';
      if (!set.parameters) {
        console.warn('Patch "%s" missing parameters in "%s". Fixing...', patch.name, set.name);
        set.parameters = DEFAULT.parameterSets[0].parameters;
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
