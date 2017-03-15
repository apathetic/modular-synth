import config from '../../config/firebase';
import * as firebase from 'firebase/app';
import 'firebase/auth';     // import auth into firebase namespace
import 'firebase/database'; // import database into firebase namespace

firebase.initializeApp(config);

const _auth = firebase.auth();
const _database = firebase.database();


// ----

_auth.onAuthStateChanged(function(user) {
  if (user) {
    // saveToken();
    var photoURL = user.photoURL;
    var name = user.displayName;
    var refreshToken = user.refreshToken;

    console.log(photoURL, name, refreshToken);
  } else {

  }
});

function isSignedIn() {
  if (_auth.currentUser) {
    return true;
  }

  // Display a message to the user and return false
  // ...
  return true;
};

// ----



export const auth = {
  signIn() {
    const provider = new firebase.auth.GoogleAuthProvider();
    _auth.signInWithPopup(provider);
  },

  signOut() {
    _auth.signOut();
  },

  isSignedIn: isSignedIn
};

export const api = {
  // Load data ONCE (ie. no "listeners")
  // path: ie: /users/' + userId
  load(path) {
    if (isSignedIn()) {
      return _database.ref(path).once('value');
    }
  },

  // list(path) {
  //   return _database.ref(path + '?shallow=true');  // NOTE just to illustrate what trying to do. this won't work
  // },

  // note: destructive. Will overwrite if anything happens to be at this path
  create(name, data) {
    _database.ref('patch/' + name).set({});
  },

  save(path, data) {
    if (isSignedIn()) {
      return _database.ref(path).update(data);
    }
  },

  add(path, data) {
    const currentUser = _auth.currentUser;
    const items = _database.ref(path);   // ie. patch, or patch/juno/parameterSets

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
