import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

import firebaseConfig from '../../firebase.config.js';
// import type { API } from '@/types/firebase';


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
// const user = auth.currentUser;

export { auth };

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
  // return '_' + Math.random().toString(36).substr(2, 9);

  const PUSH_CHARS = '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';
  const timeStampChars = new Array(8);
  let now = new Date().getTime();
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
    const random = Math.floor(Math.random() * 64);
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
   * @param path The Firebase path to data to load.
   * @return {Promise} The loaded data.
   */
  async load (path) {

    // const auth = getAuth();
    const user = auth.currentUser;

    console.log('xxx', user, auth)

    if (user) {
      // User is signed in, see docs for a list of available properties
      // https://firebase.google.com/docs/reference/js/firebase.User

      const querySnapshot = await getDocs(collection(db, path));
      querySnapshot.forEach((doc) => {
        console.log(`${doc.id} => ${doc.data()}`);
      });

      // const getSnapshot = db.ref(path).once('value');
      // getSnapshot
      //   .then((response) => {
      //     resolve(response.val());
      //   })
      //   .catch(reject);
    } else {
      // reject('Not logged in to Firebase');
      throw new Error('Not logged in to Firebase');
    }
  },

  /**
   * Create a new Object in the db.
   * NOTE: destructive operation, will overwrite if anything happens to be at this path.
   * @return {Promise} A Firebase Promise, actually.
   */
  create(key, data) {
    // return db.ref('patch/' + key).set(data);
    return new Promise((resolve, reject) => {
      db.ref('patch/' + key)
        .set(data)
        .then(resolve)
        .catch(reject);
    });
  },

  /**
   * Save / update an exiting Object in the db.
   * @return {Promise} A Firebase Promise, actually.
   */
  save(path, data) {
    return db.ref(path).update(data);
  },

  /**
   * Add a new item to Firebase
   * @param {String} path [description]
   * @param {Object} data The data to add
   * @return {Promise} With the new key reference.
   */
  add(path, data) {
    const items = db.ref(path);   // ie. patch, or patch/juno/parameterSets

    return new Promise((resolve, reject) => {
      items.push(data)
        .then((response) => {
          resolve(response.key);
        });
    });
  },

  /**
   * Remove this here thing.
   * @param {String} path The data at this path will be deleted.
   * @return {Promise}
   */
  remove(path) {
    return new Promise((resolve, reject) => {
      if (path === '/' || !path) {
        resolve();
      } else {
        const item = db.ref(path);
        item.remove().then(resolve).catch(reject);
      }
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
  for (const key in patches) {
    if (!patches.hasOwnProperty(key)) { continue; }

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
