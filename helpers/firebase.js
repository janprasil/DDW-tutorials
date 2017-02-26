import firebase from 'firebase';

const config = {
  apiKey: "AIzaSyDj7c-p8XIcwe9mW-UYKQYcv0jgfDhMdCc",
  authDomain: "ddw-hw1.firebaseapp.com",
  databaseURL: "https://ddw-hw1.firebaseio.com",
  storageBucket: "ddw-hw1.appspot.com",
  messagingSenderId: "290749509676"
};
firebase.initializeApp(config);

firebase.auth().signInAnonymously().catch((error) => {
  const errorCode = error.code;
  const errorMessage = error.message;
});

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    const isAnonymous = user.isAnonymous;
    const uid = user.uid;
  }
});

export const database = firebase.database();
