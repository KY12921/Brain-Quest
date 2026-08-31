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

// Base URL of your deployed Cloudflare Worker backend (see
// cloudflare-worker/ and the README's "Connecting the real AI Tutor"
// and "Taking real payments" sections). `wrangler deploy` prints this
// URL after your first deploy — paste it in here, replacing the
// placeholder below. This has replaced the earlier Firebase Cloud
// Functions approach, so Blaze and a payment method on Firebase are
// no longer needed for the AI Tutor or Stripe payments.
const WORKER_BASE_URL = "https://brain-quest-api.YOUR-SUBDOMAIN.workers.dev";
