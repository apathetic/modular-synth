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
