# Study Boss — v2

A gamified study app: sign in, pick a subject, answer questions, earn XP —
now with Boss Fights, Daily Missions, a Leaderboard, Duels, and a Pro tier.

## What's in this version

- **Quests**: pick a subject, answer 5 questions, earn XP. Completing a
  subject locks it (🔒) until you unlock Pro, which allows replays.
- **Boss Fight**: 5 hearts, miss 5 questions and you're defeated. Each win
  makes that subject's boss tougher (a longer fight next time). Bigger XP
  per correct answer, plus a win bonus.
- **Daily Missions**: answer 5 questions correctly today (in any mode) for
  500 bonus XP. Resets every day.
- **Leaderboard**: top 20 students ranked by total XP.
- **Duel**: create a duel on a subject, get a share code, send it to a
  friend. They play the same 5 questions; whoever scores higher wins a
  bonus. See the honest note below on how this actually works.
- **Go Pro**: a $5.99/month tier removing ads, unlocking unlimited
  replays, and unlocking unlimited AI Tutor use. See the honest note
  below — there's no real payment processing yet.
- **AI Tutor**: tracks your right/wrong answers per subject across
  every mode and serves you a practice question from your weakest
  subject. Free tier gets 3 tailored questions per day; Pro gets
  unlimited and has the explanation shown automatically. See the
  honest note below on how "weak area detection" actually works here.
- **Ads**: a placeholder ad banner on the Quests screen for free-tier users.

## Honest notes on what's simplified (and why)

- **No live AI-generated questions.** Same as before — GitHub Pages is
  static hosting with no safe place to hold an AI API key. All modes
  (Quests, Boss Fight, Duels) draw from the curated bank in
  `js/questions.js`. Boss Fight "gets harder" by getting *longer*
  (cycling through the question pool) rather than by harder questions,
  since there's no real difficulty knob without an AI backend.
- **Boss difficulty never decreases.** Losing a fight doesn't lower your
  boss level — only winning raises it. If you'd rather losing reset
  progress, that's a one-line change in `js/boss.js` (`finishBossFight`).
- **Duels are asynchronous, not live.** There's no real-time matchmaking
  server on static hosting. A duel is really: two players independently
  answer the same 5 questions (whenever they each get to it), and scores
  are compared once both are done. The creator's "waiting" screen does
  update live via a Firestore listener, so it feels responsive even
  though play isn't turn-synchronized. A true simultaneous duel would
  need a real backend — ask if you want to explore that later.
- **Duel codes are found by scanning recent duels**, not a proper index
  lookup. Fine for a handful of duels at a time; if this app gets serious
  duel traffic, this should become a dedicated lookup collection.
- **"Go Pro" doesn't charge real money.** There's a clearly-labeled TEST
  button that flips your account's Pro flag directly in Firestore — no
  Stripe or other payment processor is connected. To take real payments,
  the next step is a small **Firebase Cloud Function** that verifies a
  Stripe payment server-side before setting `isPro` — never trust a
  client app to set its own billing status once this is a real product.
- **The AI Tutor doesn't call a live AI model.** Like question
  generation elsewhere, that needs a server-side API key. What it does
  do for real: it tracks correct/wrong answers per subject (in
  Firestore, across every mode you play) and picks whichever subject
  has your worst ratio — with a minimum of 3 attempts before it calls
  anything a "weak area," so one unlucky guess doesn't get flagged.
  From there it serves a real question from the curated bank, with the
  explanation either tap-to-reveal (free) or shown automatically (Pro).
  When you add a real AI backend, this is the natural place to swap in
  genuinely AI-generated, tailored questions instead.
- **Ads are a static placeholder**, not a real ad network. Real ads (e.g.
  Google AdSense) require your own approved AdSense account, which only
  you can set up — happy to help wire it in once you have one.

## Setup (one-time, ~10 minutes)

### 1. Create a Firebase project
Go to console.firebase.google.com, click **Add project**, give it a name, finish the wizard.

### 2. Register a web app
On your project's **Project settings > General** page, scroll to **Your apps**, click the web (`</>`) icon, register the app, and copy the `firebaseConfig` object into `js/firebase-config.js`.

### 3. Enable Email/Password sign-in
**Authentication > Sign-in method > Email/Password > Enable**.

### 4. Create a Firestore database
**Firestore Database > Create database.** Choose Standard edition, a
region close to you (e.g. `nam5`/`nam7` for North America), and start in
**test mode** while you're building.

### 5. Security rules (important — read this if you set rules beyond test mode)
The Leaderboard needs to **read every user's XP**, not just your own, so
the simple "only read your own doc" rule from v1 will break it. Use this
instead before any public launch:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /duels/{duelId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

This lets any signed-in user read XP totals (for the leaderboard) and
duel documents (to join/play), but only ever write to their own user
document — duel score fields are written by whichever player owns that
score, which this simple rule doesn't fully lock down. That's an
acceptable gap for a small app among friends; tighten it further before
a wider public launch if duel score integrity matters more.

### 6. Test it locally
Open `index.html` in a browser, or run `python3 -m http.server` in this
folder and visit `http://localhost:8000` if sign-in doesn't work when
opened directly as a file.

## Deploying to GitHub Pages

1. Push this folder's contents to a GitHub repository (the files
   themselves, not a zip).
2. **Settings > Pages > Source**: choose your `main` branch and `/ (root)`.
3. GitHub gives you a live URL within a minute or two.

## File structure

```
study-boss/
├── index.html            All screens: auth, quests, quiz, results, boss, missions, leaderboard, duel, pro
├── css/style.css         Visual design for every screen
├── js/firebase-config.js Your Firebase project credentials (fill this in)
├── js/questions.js       Question bank per subject — swap for AI generation later
├── js/app.js             Core: auth, nav, subject quests, shared quiz engine
├── js/boss.js            Boss Fight mode (hearts, scaling difficulty)
├── js/missions.js        Daily mission tracking
├── js/leaderboard.js     Top-XP leaderboard
├── js/duels.js           Asynchronous duel challenges
├── js/pro.js             Go Pro screen (test-only activation)
└── README.md             This file
```

## Suggested next steps

1. **Get real users trying it** — friends, a study Discord, a subreddit.
   See what actually gets used before building more.
2. **Real AI question generation**: a Firebase Cloud Function that calls
   an AI API server-side (keeping your API key hidden) and returns fresh
   questions — this is the natural replacement for the static question
   bank everywhere it's used (Quests, Boss Fight, Duels).
3. **Real payments**: Stripe Checkout + a Cloud Function to verify
   payment before setting `isPro` server-side.
4. **Real ads**: once you have a Google AdSense account, swap the
   placeholder banner for AdSense's script snippet.
5. **True live duels**: would need a small real-time backend (e.g. a
   Cloud Function + Firestore listeners driving a synchronized countdown)
   rather than the current asynchronous score comparison.
