/*
const Schema = {
  type: Object,
  properties:  {
    "name" : {
      type: String,
    },
    "id" : {
      type: Integer
    },
    "connections" : {
      type: Array,
      items: {
        type: Object,
        properties: {
          "id" : 21,
          "from" : {
            "id" : 20,
            "port" : 0
          },
          "to" : {
            "id" : 0,
            "port" : 0
          }
        }
      }
    },
    "modules" : {
      type: Array,
      items: {
        "id" : Integer
        "type" : String,
        "col" : 0,
        "row" : 1,
        "w" : 4,
        "h" : 1,
        "x" : 291,
        "y" : 220
      }
    }
    "parameterSets" : {
      type: Array,
      items: {
        type: Object,
        properties: {
          "name" : {
            type: String
          },
          "parameters" : {
            type: Mixed
          }
        }
      }
    }
  }
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

// /**
//  * Asserts the field is present and correct. If not, tries to fix.
//  * @param  {[type]} assert [description]
//  * @param  {[type]} name   [description]
//  * @param  {[type]} type   [description]
//  * @return {[type]}        [description]
//  */
// function check(assert, name, type) {
//   if (assert) {
//     return;
//   } else {
//     console.warn('Problem with missing "%s" in patch', name);
//     assert
//   }
// }
