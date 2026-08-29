# Study Boss — v1

A gamified study app: sign in, pick a subject, answer 5 questions, earn XP.
This is the **core loop** version — the foundation everything else (boss fights,
missions, leaderboard, duels, Pro tier) will build on top of.

## What's in v1

- Email/password sign in and sign up (Firebase Authentication)
- Subject selection (Math, Science, History, Geography — easy to add more)
- 5-question quiz per subject, 20 XP per correct answer
- XP is saved per user in Firestore and persists across sessions
- A visual XP bar in the top bar that fills and updates live

## What's *not* in v1 (on purpose — see the build order below)

- **Live AI-generated questions.** GitHub Pages can only host static files
  (HTML/CSS/JS) with no server, so there's nowhere safe to hide an AI API key.
  v1 uses a curated question bank instead (`js/questions.js`). When you're
  ready to add real AI generation, the move is a small **Firebase Cloud
  Function** that calls the AI API server-side and returns questions to the
  app — happy to help you build that next.
- Boss fights, missions, leaderboard, duels, Pro tier / ads — these come
  after you've validated the core loop with real users, per the build order
  we discussed.

## Setup (one-time, ~10 minutes)

### 1. Create a Firebase project
1. Go to [console.firebase.google.com](https://console.firebase.google.com) and click **Add project**.
2. Give it a name (e.g. "study-boss"), finish the wizard.

### 2. Register a web app
1. In your new project, click the **`</>`** (web) icon on the project overview page.
2. Give the app a nickname, click **Register app**.
3. Firebase will show you a `firebaseConfig` object — copy it.
4. Paste it into `js/firebase-config.js`, replacing the placeholder values.

### 3. Enable Email/Password sign-in
1. In the Firebase console sidebar: **Build > Authentication > Get started**.
2. Under **Sign-in method**, enable **Email/Password**.

### 4. Create a Firestore database
1. In the sidebar: **Build > Firestore Database > Create database**.
2. Start in **test mode** for now (lets you build without security rules
   getting in the way). Before you launch publicly, replace the rules with
   something like:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

   This ensures a user can only read/write their own XP data.

### 5. Test it locally
Just open `index.html` in a browser — no build step needed. (Some browsers
restrict local file access for security; if sign-in doesn't work when opened
directly, run a tiny local server instead, e.g. `python3 -m http.server` from
this folder, then visit `http://localhost:8000`.)

## Deploying to GitHub Pages

1. Create a new GitHub repository and push this whole folder to it.
2. In the repo: **Settings > Pages**.
3. Under **Source**, choose your main branch and `/ (root)`, then **Save**.
4. GitHub will give you a live URL (e.g. `https://yourusername.github.io/study-boss/`)
   within a minute or two — that's your app, live and shareable.

## File structure

```
study-boss/
├── index.html            Page structure (auth, subjects, quiz, results screens)
├── css/style.css         Visual design
├── js/firebase-config.js Your Firebase project credentials (fill this in)
├── js/questions.js       Question bank per subject — swap for AI generation later
├── js/app.js             App logic: auth, subject selection, quiz flow, XP
└── README.md             This file
```

## Suggested next steps (in order)

1. **Launch this to a small group of real users** (a study Discord, a subreddit,
   friends) and see if the core loop is actually fun before adding more.
2. Add the **solo boss fight** (5 hearts, harder questions, difficulty scales
   with wins) — reuses the quiz logic you already have here.
3. Add **missions** (e.g. "answer 5 correctly today for 500 XP") using the XP
   data you're already tracking.
4. Add a **leaderboard** (a Firestore query sorted by XP — much simpler than
   real-time duels).
5. Only then tackle **duels** (needs real-time sync — Firestore's realtime
   listeners can handle this without a full websocket server).
6. Add the **Pro tier and ads** once you have people using the free version
   regularly.
