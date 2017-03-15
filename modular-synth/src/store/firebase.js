import config from '../../config/firebase';
import * as firebase from 'firebase/app';
import 'firebase/auth';     // import auth into firebase namespace
import 'firebase/database'; // import database into firebase namespace

firebase.initializeApp(config);

const database = firebase.database();

export const auth = firebase.auth;
export const api = {
  // Load data ONCE (ie. no "listeners")
  // path: ie: /users/' + userId
  load(path) {
    return database.ref(path).once('value');
  },

  // list(path) {
  //   return database.ref(path + '?shallow=true');  // NOTE just to illustrate what trying to do. this won't work
  // },

  // note: destructive. Will overwrite if anything happens to be at this path
  create(name, data) {
    return database.ref('patch/' + name).set({});
  },

  save(path, data) {
    return database.ref(path).update(data);
  },

  add(path, data) {
    // const currentUser = _auth.currentUser;
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
