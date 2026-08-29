const firebaseConfig = {
  apiKey: "AIzaSyCDHIEqZcpvSeuYfcdxhly8Xw-G5T3koc8",
  authDomain: "study-boss-3e3e4.firebaseapp.com",
  projectId: "study-boss-3e3e4",
  storageBucket: "study-boss-3e3e4.firebasestorage.app",
  messagingSenderId: "164740651144",
  appId: "1:164740651144:web:8f1d76923f7c275114e73d"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
