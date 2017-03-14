import config from '../../config/firebase';
import * as firebase from 'firebase/app';
import 'firebase/auth';     // import auth into firebase namespace
import 'firebase/database'; // import database into firebase namespace

firebase.initializeApp(config);

const auth = firebase.auth();
const database = firebase.database();


// function LOAD() {
//   // Reference to the /patches/ database path.
//   this.patches = database.ref('patches');
//   // Make sure we remove all previous listeners.
//   this.patches.off();
//
//   // Loads the last 12 messages and listen for new ones.
//   var setMessage = function(data) {
//     var val = data.val();
//
//     console.log(data.key, val.name, val.text, val.photoUrl, val.imageUrl);
//   };
//
//   this.patches.limitToLast(12).on('child_added', setMessage);
//   this.patches.limitToLast(12).on('child_changed', setMessage);
// };



export default {
  // Load data ONCE (ie. no "listeners")
  // path: ie: /users/' + userId
  load(path) {
    // var userId = auth.currentUser.uid;

    return database.ref(path).once('value');
  },

  list(path) {
    return database.ref(path + '?shallow=true');  // NOTE just to illustrate what trying to do. this won't work
  },

  // note: destructive. Will overwrite if anything happens to be at this path
  create(name, data) {
    database.ref('patch/' + name).set({});
  },

  save(path, data) {
    database.ref(path).update({});
  },

  add(path, data) {
    const currentUser = auth.currentUser;
    const items = database.ref(path);   // ie. patch, or patch/juno/parameterSets

    // Add a new message entry to the Firebase Database.
    items.push({    // data
      name: currentUser.displayName,
      text: this.messageInput.value
    }).then(function() {
      // do whatever
    }).catch(function(error) {
      console.error('Error writing new message to Firebase Database', error);
    });
  }
};
