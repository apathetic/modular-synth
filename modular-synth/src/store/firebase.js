import config from '../../config/firebase';
import * as firebase from 'firebase/app';
import 'firebase/auth';     // import auth into firebase namespace
import 'firebase/database'; // import database into firebase namespace

firebase.initializeApp(config);

const database = firebase.database();

export const auth = firebase.auth();
export const provider = new firebase.auth.GoogleAuthProvider();
// export function generateKey(str) {
//   return str.toLowerCase().trim().replace(/[^\w\s]/gi, '').replace(/\s+/g, '-');
// }

export function generateKey() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);

    return v.toString(16);
  });
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
      // return database.ref(path).once('value');

      const getSnapshot = database.ref(path).once('value');

      return new Promise((resolve, reject) => {
        getSnapshot.then((response) => {
          const responseObject = response.val();
          // let data = [];
          //
          // for (let item in responseObject) {
          //   data.push(item);
          // }
          //
          // resolve(data);
          resolve(responseObject);
        });
      });
    }
  },

  /**
   * Create a new Object in the database.
   * NOTE: destructive operation, will overwrite if anything happens to be at this path.
   * @return {Promise} A Firebase Promise, actually.
   */
  create(name, data) {
    return database.ref('patch/' + name).set(data);
  },

  /**
   * Save / update an exiting Object in the database.
   * @return {Promise} A Firebase Promise, actually.
   */
  save(path, data) {
    return database.ref(path).update(data);
  },

  /**
   *
   */
  add(path, data) {
    const items = database.ref(path);   // ie. patch, or patch/juno/parameterSets

    // Add a new message entry to the Firebase Database.
    items.push({    // data
      // name: currentUser.displayName,
      text: this.messageInput.value
    }).then(function() {
      // do whatever
    }).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};
