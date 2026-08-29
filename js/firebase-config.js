// ------------------------------------------------------------------
// PASTE YOUR OWN FIREBASE CONFIG HERE.
//
// How to get this (takes ~3 minutes):
// 1. Go to https://console.firebase.google.com and create a project.
// 2. In the project, click the "</>" (web) icon to register a web app.
// 3. Firebase will show you a config object — copy it into firebaseConfig below.
// 4. In the Firebase console sidebar: Build > Authentication > Sign-in method
//    > enable "Email/Password".
// 5. In the Firebase console sidebar: Build > Firestore Database > Create database
//    (start in "test mode" for now — see README for production security rules).
// ------------------------------------------------------------------

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
