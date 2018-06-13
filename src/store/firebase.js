import config from '../../config.js';
import * as firebase from 'firebase/app';
import 'firebase/auth';     // import auth into firebase namespace
import 'firebase/database'; // import database into firebase namespace
import { state as DEFAULT } from './patch';


firebase.initializeApp(config);

const database = firebase.database();

export const auth = firebase.auth();
export const provider = new firebase.auth.GoogleAuthProvider();


/**
 * Generate a UUID to be used as a key.
 * @return {[type]} [description]
 */
// export function generateKey() {
//   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
//     const r = Math.random() * 16 | 0;
//     const v = c === 'x' ? r : (r & 0x3 | 0x8);
//
//     return v.toString(16);
//   });
// }

/**
 * Generate a "Firebase friendly" unique identifier that may be sorted lexigraphically.
 * @return {[type]} [description]
 */
export function generateKey() {
  const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
  let now = new Date().getTime();
  let timeStampChars = new Array(8);
  let result;

  // 8 characters of timestamp data at the beginning
  for (let i = 7; i >= 0; i--) {
    timeStampChars[i] = PUSH_CHARS.charAt(now % 64);
    now = Math.floor(now / 64);
  }

  // convert to string
  result = timeStampChars.join('');

  // 4 more characters of randomness
  for (let i = 0; i < 4; i++) {
    let random = Math.floor(Math.random() * 64);
    result += PUSH_CHARS.charAt(random);
  }

  return result;
}



/**
 * Simple Firebase API (CRUD) wrapper.
 * @type {Object}
 */
export const api = {
  /**
   * Fetch data from Firebase. This happens only once (ie. no "listeners")
   * @return {Promise} The loaded data.
   */
  load(path) {
    if (auth.currentUser) {
      const getSnapshot = database.ref(path).once('value');

      return new Promise((resolve, reject) => {
        getSnapshot
          .then((response) => {
            resolve(response.val());
          })
          .catch(reject);
      });
    }
  },

  /**
   * Create a new Object in the database.
   * NOTE: destructive operation, will overwrite if anything happens to be at this path.
   * @return {Promise} A Firebase Promise, actually.
   */
  create(key, data) {
    // return database.ref('patch/' + key).set(data);
    return new Promise((resolve, reject) => {
      database.ref('patch/' + key)
        .set(data)
        .then(resolve)
        .catch(reject);
    });
  },

  /**
   * Save / update an exiting Object in the database.
   * @return {Promise} A Firebase Promise, actually.
   */
  save(path, data) {
    return database.ref(path).update(data);
  },

  /**
   * Add a new item to Firebase
   * @param {String} path [description]
   * @param {Object} data The data to add
   * @return {Promise} With the new key reference.
   */
  add(path, data) {
    const items = database.ref(path);   // ie. patch, or patch/juno/parameterSets

    return new Promise((resolve, reject) => {
      items.push(data)
        .then((response) => {
          resolve(response.key);
        })
        .catch(reject);
    });
  },

  /**
   * Remove this here thing.
   * @param {String} path The data at this path will be deleted.
   * @return {Promise}
   */
  remove(path) {
    if (path === '/' || !path) { return; }

    const item = database.ref(path);

    return new Promise((resolve, reject) => {
      item.remove().then(resolve).catch(reject);
    });
  }
};



/**
 * This validates the Patch Object coming from Firebase, and
 * ensures that each Object has all the requesite fields. This
 * is important because everywhere else in the App we assume that
 * these fields are present -- and Firebase does _not_ store empty
 * values / arrays, etc. All data checks happen only here.
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
