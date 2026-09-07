// ------------------------------------------------------------------
// Firebase config for the Brain Quest project.
// NOTE: the actual IDs below (study-boss-3e3e4) are your real,
// already-created Firebase project's identifiers — they must NOT be
// renamed even though the app itself is now called Brain Quest.
// Renaming these would disconnect the app from your real Firebase
// backend (Auth users, Firestore data) entirely.
// Already filled in — no editing needed for this file.
// ------------------------------------------------------------------

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

// Base URL of your deployed AI/payments backend. This works whether
// you deployed it as a Cloudflare Worker OR as a Val Town HTTP val —
// both give you a URL that this app calls the same way (the code
// just appends /generateTutorExplanation, /chatWithTutor, etc. to
// whatever you put here). Paste your real URL in below, replacing
// the placeholder.
const WORKER_BASE_URL = "https://KinY--e9bd6a12a62e11f193a61607ee4eb77e.web.val.run";
