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
    //   console.log('patch prob ', key);
    //   return;
    // }
    //
    // check(patch.name, 'name', type)


    // if (!patch.name) {
    //   console.log('missing name');
    //   patch.name = 'Blank';
    // }
    // if (!patch.id) {
    //   console.log('missing id'); }
    //   patch.id = 0;
    // }

    if (!patch.parameterSets) {
      console.log('Patch %s missing parameterSets Array. Correcting', key);
      patch.parameterSets = [];
    }

    patch.parameterSets.forEach((set) => {
      set.name = set.name || '';
      if (!set.parameters) console.log('fuck');
      set.parameters = set.parameters || {};
    });

    if (!patch.name || !patch.id || !patch.connections || !patch.modules) {
      console.log('Patch error ', key);
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
//     console.log('Problem with missing %s in patch', name);
//     assert
//   }
// }
