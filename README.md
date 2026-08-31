# Brain Quest — v3

A gamified study app: sign in, pick a subject, answer questions, earn XP —
now with Boss Fights, Daily Missions, a Leaderboard, Duels, and a Pro tier.

**Join our Discord**: https://discord.gg/6mTzCdVGZ

## Connecting the real AI Tutor (Gemini)

The AI Tutor is a real chat interface, plus the "Explain this" button
elsewhere in the app can call a genuinely real, Gemini-generated
explanation instead of the template-based one — but
only once you deploy the Cloud Function that makes this safe. Until
you do, the app automatically falls back to the free template
explanations, so nothing breaks if you skip this section.

**Why this needs a Cloud Function at all**: a Gemini API key is a
secret credential, unlike your Firebase config (which is meant to be
public). If you paste a Gemini key directly into this site's HTML or
JS, anyone who views your page source can steal it and run up usage
on your account. The fix is a small server-side function that holds
the key privately — your browser calls that function, and the
function calls Gemini, never the other way around.

### Setup steps

1. **Get a free Gemini API key** at
   https://aistudio.google.com/app/apikey — no credit card needed for
   the free tier.

2. **Upgrade your Firebase project to the Blaze (pay-as-you-go) plan.**
   Cloud Functions require Blaze, but the free monthly quota is
   generous — normal AI Tutor usage should cost $0. Do this from the
   Firebase Console: **Settings (gear icon) > Usage and billing >
   Modify plan**.

3. **Install the Firebase CLI**, if you don't already have it:
   ```
   npm install -g firebase-tools
   firebase login
   ```

4. **Install the function's dependencies.** From this project's root
   folder (the one containing `firebase.json`):
   ```
   cd functions
   npm install
   cd ..
   ```

5. **Store your Gemini key as a secret** — never put it directly in
   code or commit it to GitHub:
   ```
   firebase functions:secrets:set GEMINI_API_KEY
   ```
   This will prompt you to paste the key; it's stored securely by
   Google, not in your repo.

6. **Deploy the function**:
   ```
   firebase deploy --only functions
   ```
   The first deploy can take a few minutes. Once it finishes, the
   function is live — the app will start using it automatically,
   since `js/ai-tutor-gemini.js` and the Firebase Functions SDK are
   already wired into `index.html`.

7. **Try it**: open the AI Tutor, answer a question, and tap "Explain
   this." If the function is deployed correctly, you'll see "Thinking…"
   for a moment, then a real Gemini-generated explanation. If anything
   goes wrong (not deployed yet, quota hit, network issue), it falls
   back to the template explanation instead of showing an error.

### Files involved
- `functions/index.js` — the Cloud Function itself. This is the only
  code that ever sees your Gemini key.
- `functions/package.json` — its dependencies.
- `firebase.json` / `.firebaserc` — tell the Firebase CLI where the
  function lives and which project to deploy to.
- `js/ai-tutor-gemini.js` — the client-side code that calls the
  function and gracefully falls back on any failure.

### Photo Help (Ultra tier)
Uses the exact same `GEMINI_API_KEY` secret as everything else above —
no extra setup needed once you've deployed the Gemini functions. It's
gated to Ultra members via a server-side check (the Cloud Function
reads the user's own Firestore doc and checks `isUltra` using the
Admin SDK, not a client-side check, so it can't be bypassed with dev
tools). See `functions/index.js`'s `analyzeHomeworkPhoto` and
`js/ultra-photo.js`.

## Taking real payments (Stripe)

The "Go Pro" screen currently has a TEST button that flips `isPro`
directly — no real money involved. Here's how to accept real
payments instead, using the same security principle as the AI Tutor
setup above: the browser is never trusted to say "payment succeeded"
on its own — only Stripe, calling your server directly, can.

**How it works**: tapping "Subscribe" calls `createCheckoutSession`,
which creates a Stripe Checkout page and redirects the user there.
Once they actually pay, Stripe calls `stripeWebhook` directly (never
through the browser) to confirm it, and only then does the server
mark the user as Pro in Firestore.

### Setup steps

1. **Create a Stripe account**: https://dashboard.stripe.com/register

2. **Create a Product and a recurring Price** for Pro (Dashboard >
   Product catalog > Add product). Use test mode while you're setting
   this up. Copy the Price ID — it looks like `price_1AbC...`.

3. **Get your Secret key** (Dashboard > Developers > API keys, use
   the test key while testing) and store it:
   ```
   firebase functions:secrets:set STRIPE_SECRET_KEY
   ```

4. **Store your Price ID** the same way:
   ```
   firebase functions:secrets:set STRIPE_PRICE_ID
   ```

5. **Deploy the functions**:
   ```
   firebase deploy --only functions
   ```
   This prints a URL for `stripeWebhook` — copy it.

6. **Add the webhook in Stripe** (Dashboard > Developers > Webhooks >
   Add endpoint):
   - URL: the `stripeWebhook` URL from step 5
   - Events to send: `checkout.session.completed` and
     `customer.subscription.deleted`

   Stripe will show you a "Signing secret" — store it:
   ```
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   ```

7. **Redeploy** so the webhook function picks up the new secret:
   ```
   firebase deploy --only functions
   ```

8. **Tighten your Firestore security rules** (see the updated rules
   in the Security Rules section below) so `isPro`/`isUltra` can no
   longer be written directly by a signed-in client — only the webhook
   function can set them from here on. Skipping this step leaves a
   real gap: anyone could grant themselves Pro/Ultra for free via
   browser dev tools. **Known side effect**: this also disables the
   Shop's "Buy 1-Day Pro" coin purchase, since it currently writes
   `isPro` directly from the client too (see the comment in
   `js/shop.js` for what converting it to a Cloud Function would take).

9. **Test with Stripe's test cards** (e.g. `4242 4242 4242 4242`,
   any future expiry, any CVC) before switching to live mode. Switch
   to live API keys and a live webhook only once you've confirmed the
   whole flow works in test mode.

### Files involved
- `functions/index.js` — adds `createCheckoutSession` and
  `stripeWebhook` alongside the existing Gemini function.
- `functions/package.json` — now includes the `stripe` dependency.
- `js/pro.js` — the real "Subscribe" button, plus the test button
  kept for local testing before Stripe is set up.

## What's in this version

- **AI Tutor is now a real chat**, not an auto-picked question. Type
  what you're stuck on ("I don't understand fractions") and Gemini
  explains it conversationally. After any reply, you can ask for a
  tailored practice question — Gemini generates one specifically for
  what you just discussed, answered using the same quiz engine as
  everywhere else in the app. Free tier: 3 interactions/day (a
  message or a practice question each count as one). Pro: unlimited.
- **Sidebar navigation was removed** — back to the top nav bar only.

- **Streak calendar**: a real daily-activity streak on Home, with a
  7-day visual strip — increments on consecutive days, resets on a
  gap, doesn't double-count same-day revisits.
- **League change animation**: promotion/demotion now shows a full
  celebratory overlay instead of a plain text banner.
- **Micro-animations**: hearts shake when you lose one in Boss Fight,
  the XP counter ticks up/down instead of jumping instantly, and
  confetti bursts on a perfect score in Quests, Brain Quest lessons,
  or Trivia.

- **Pro comparison table**: the Go Pro screen now shows Free vs Pro
  side by side (ads, XP bonus, Tutor limits, explanation behavior,
  background theme count) instead of just a perks list.
- **Badges wall**: a new "Badges" tab showing 8 achievements, all
  computed from data already tracked (XP, completed lessons, boss
  wins, league rank, Pro status) — no new tracking was added.

- **Optional mascot tutorial**: brand-new accounts get asked by the
  owl mascot "Want a quick tour?" — Yes walks through an 8-step guide
  to every feature, No (or Skip mid-tour) dismisses it permanently.
  Existing accounts never see this, since they default to having
  already seen it.
- **Full brand rename to "Brain Quest"** — the logo, browser tab
  title, and every user-facing mention of the old name are updated.
- **Duel subject picker redesigned**: replaced the plain dropdown
  (which could only show emoji as plain text) with the same custom
  SVG icon cards used in Quests and Trivia.
- **3D "bubbly" nav text**: the nav bar labels (Home, Quests, Boss
  Fight, etc.) now have a layered text-shadow giving them a chunky,
  extruded look instead of flat text.
- **Top bar rearranged**: the light/dark toggle moved into the top bar
  as the leftmost item; Settings, Profile, and Sign out are grouped
  at the rightmost edge. One trade-off: the toggle is now only
  reachable once signed in, since it lives inside the top bar (which
  is hidden pre-login) — it's no longer available on the sign-in
  screen itself.

- **Brain Quest for every subject**: the structured, 10-lesson-per-subject
  roadmap (previously just Math and Science) now covers all 7 subjects —
  History, Geography, English, Computer Science, and Economics included.
  Each lesson teaches one specific topic with 5 real questions on it,
  not random trivia. 350 roadmap questions total.
- **Mascot**: a friendly owl on the Home screen with a rotating
  speech-bubble message, in the spirit of Duolingo's owl companion.
- **Settings and Profile moved to the top-right corner**, out of the
  main nav row, each with their own icon button (gear for Settings,
  person for Profile).
- **Profile screen**: shows your username and email, and lets you
  change your password (with re-authentication, as Firebase requires
  for this kind of account change).
- **Top bar bug fixed**: it previously had a hardcoded dark color
  completely disconnected from the theme system, which is why it
  stayed black in every theme except the original one, and why
  "Sign out" text could disappear in light mode. It now properly uses
  the theme's surface color.
- **Nav overflow fixed**: with this many tabs, the nav bar now wraps
  onto a second line instead of showing a horizontal scrollbar.

- **Settings screen**: choose between 3 background themes (Field
  Journal, Night Arcade, Warm Leather — reusing earlier design
  iterations as real user-selectable options) and 3 instrumental game
  music tracks with a volume slider. Preferences are stored on the
  device (localStorage), same as the light/dark toggle.
- **Game music**: 3 tracks (Adventure, Focus, Retro Quest) generated
  live in the browser with the Web Audio API — no audio files, no
  speech, genuinely instrumental by construction since it's just
  synthesized tones. See the honest note below.
- **Structured Quests roadmap**: Math and Science now have a real
  10-lesson roadmap, each lesson teaching one specific topic (not
  random trivia). Other subjects still use the old chapter system for
  now — see the honest note below.
- **Trivia mode**: a new tab for the classic "pick a subject, get 5
  random questions" format, now separated from the structured Quests
  roadmap.

- **Interactive questions**: 5 questions across 3 types are hands-on
  instead of multiple choice — a balance scale for equations, a
  draggable line grapher for slope (Math), and a tap-to-reorder
  sequence widget (History event ordering, Science process ordering).
  Dragging uses Pointer Events so it works on touch devices, not just
  mouse. Most questions are still multiple choice on purpose — these
  are variety, not a replacement.

- **Custom icon set**: subject and nav icons are now hand-built SVG
  line icons instead of emoji — heavy emoji-as-UI-icons is one of the
  most common signs of templated design, so this was a deliberate fix.

- **Screen transitions**: switching screens now fades and slides in
  instead of cutting instantly.

- **Home screen**: a dashboard shown right after sign-in — current level,
  total XP, league, and quick links into every mode.
- **Concept intros**: before each chapter's questions, a short "why this
  matters" explanation of the underlying idea, not just a jump straight
  into questions.
- **Exit button**: leave any lesson (Quest, Boss Fight, Duel, Tutor)
  mid-attempt with a confirmation, returning you to where you came from.
- **Adaptive "Explain this"**: explanations now adapt their wording and
  depth to the student's grade level, and add a note about the specific
  wrong answer picked — see the honest note below on how this works.

- **Quests**: pick a subject, work through 3 chapters (Beginner,
  Intermediate, Advanced) of real, increasingly hard questions.
  Completing a chapter unlocks the next one. Any completed chapter can
  be freely replayed by anyone — there's no Pro lock on this.
- **Boss Fight**: 5 hearts, miss 5 questions and you're defeated. Each win
  makes that subject's boss tougher (a longer fight next time). Bigger XP
  per correct answer, plus a win bonus.
- **Daily Missions**: answer 5 questions correctly today (in any mode) for
  500 bonus XP. Resets every day.
- **Duel**: create a duel on a subject, get a share code, send it to a
  friend. They play the same 5 questions; whoever scores higher wins a
  bonus. See the honest note below on how this actually works.
- **AI Tutor**: tracks your right/wrong answers per subject across
  every mode and serves you a practice question from your weakest
  subject. Free tier gets 3 tailored questions per day; Pro gets
  unlimited and has the explanation shown automatically. See the
  honest note below on how "weak area detection" actually works here.
- **Go Pro**: a $14.99/month tier removing ads, unlocking unlimited
  AI Tutor use, and boosting coin earning — see "Taking real payments"
  below for how this actually charges real money now.
- **Grade level**: choose Elementary, Middle School, or High School at
  sign-up (changeable anytime from the Quests screen). This sets how
  many chapters start unlocked across every subject — see the honest
  note below on how this maps onto the existing chapter tiers rather
  than needing a separate curriculum per literal grade.
- **Ranked Leaderboard**: 10 leagues (Bronze up through Legend) with
  weekly promotion and demotion zones, Duolingo-style. See the honest
  note below — this runs client-side rather than on a real backend,
  which has real limitations at scale.
- **Ads**: a placeholder ad banner on the Quests screen for free-tier users.

## Honest notes on what's simplified (and why)

- **Real Gemini calls are scoped to the AI Tutor only, not every
  question everywhere.** Quests, Boss Fight, Duels, and Trivia still
  use the instant, free template explanations. A live API call has
  real cost and quota, so it's reserved for the one feature that's
  actually named "AI Tutor." Extending it elsewhere just means
  reusing `fetchGeminiExplanation()` from `js/ai-tutor-gemini.js` in
  those modes' explain handlers too.
- **Practice questions in the chat are freshly generated by Gemini
  each time, not pulled from the curated question bank.** This means
  format and difficulty can vary more than the hand-written Quests
  content — the Cloud Function validates the JSON shape it gets back
  (4 options, a valid correct-answer index, a real explanation) and
  fails cleanly if Gemini returns something malformed, but it can't
  verify the question is actually *good*. If quality turns out
  inconsistent in practice, the safer alternative is matching the
  conversation topic to a lesson in the existing `LESSONS` data
  (e.g. "fractions" → Math → "Fractions & Percentages") and serving
  one of those 5 curated questions instead — more consistent, but
  loses the "asked exactly what we just talked about" feel.
- **Chat history resets on reload — it's in-memory only for the
  current session, not saved to Firestore.** Persisting it would
  mean a `tutorChatHistory` field on the user doc, written after each
  message. That's a reasonable next step, but it does mean every
  Tutor conversation adds ongoing storage rather than being ephemeral.
- **I couldn't deploy or live-test the Cloud Function myself.** I
  don't have access to your Firebase project or a way to run
  `firebase deploy` from here. I verified the client-side logic
  thoroughly (both the successful-response path and the
  graceful-failure fallback), and checked the Gemini API endpoint and
  model name against current documentation, but the real end-to-end
  test happens when you deploy it. If something doesn't work, the
  Firebase Console's Functions logs (Console > Functions > Logs) are
  the first place to check.

- **Same is true for the Stripe integration — I couldn't test a real
  payment.** I verified the code compiles and the client-side flow
  handles failures gracefully (falls back to a clear error message if
  checkout can't start), but Stripe checkout sessions, webhook
  signature verification, and the Firestore rule change all need to
  be tested against your real Stripe account. Use Stripe's test mode
  and test card numbers first — never test with real money.
- **The old test Pro button and real Stripe payments are mutually
  exclusive by design, not by accident.** Once you apply the
  tightened Firestore rule, the test button's direct write to
  `isPro` will be silently rejected by Firestore (the request just
  won't take effect). That's the intended outcome — a "free Pro"
  button has no business existing once real payments are live.

- **The game music is synthesized, not composed/recorded.** There are
  no audio files — each track is a short sequence of notes played by
  browser oscillators (Web Audio API), looping indefinitely. This
  guarantees no speech and no copyright issues, but it sounds like
  simple chiptune-style tones, not a produced soundtrack. Swapping in
  real audio files later is straightforward — replace `MusicPlayer`
  with `<audio>` elements pointing at real files once you have them.
- **The old 3-tier chapter system is now unused for Quests, but still
  intact and used elsewhere.** Since Brain Quest now covers all 7
  subjects, no subject falls back to the old chapters anymore for
  Quests — but that data (`QUESTION_BANK`) wasn't deleted, since Boss
  Fight, Trivia, the AI Tutor, and Duels all still pull from it
  directly (they're not tied to the lesson structure). Both systems
  coexist in `js/questions.js` on purpose.
- **The leaderboard sorts client-side, not in the Firestore query.**
  It used to combine a `where` filter with an `orderBy` on a different
  field, which needs a manual Firestore composite index — an easy
  step to miss, and the likely cause if your leaderboard ever showed
  "Couldn't load the leaderboard right now." It now fetches everyone
  in your rank (up to 200) and sorts by weekly XP in JavaScript
  instead, so no index setup is required at all. The trade-off: if a
  single rank tier somehow had more than 200 active players, the sort
  wouldn't see everyone — a non-issue at this app's scale.

- **Only 5 interactive questions exist so far, across 3 types.** A
  genuinely good drag interaction (real cross-device pointer handling,
  snapping, visual feedback) takes real work per question type, so
  this is a proof-of-concept set, not full coverage. Adding more is
  straightforward — new questions of type `"balance"`, `"slope-drag"`,
  or `"sequence"` just need question data in `js/questions.js` and
  they'll work automatically. The sequence widget deliberately uses
  tap-to-reorder rather than free dragging — a genuine bug turned up
  in an earlier version of the slope-drag widget from conflicting
  drag handlers, so a more reliable interaction pattern was chosen for
  the new type on purpose.

- **The question bank grew, but isn't infinite.** It's now 286
  questions (up from ~213 two passes ago), with a fuller spread across
  all three difficulty tiers in every subject — not just Advanced.
  Chapters still cycle through a fixed pool rather than generating
  infinite new questions — that would need a real AI backend.

- **The adaptive "Explain this" is templates, not a model.** It picks
  from a few pre-written intro/outro phrasings based on grade level
  (elementary/middle/high) and whether the answer was right or wrong,
  and wraps the underlying explanation with them. It's not writing new
  sentences the way a real AI would — the depth increase comes from
  the underlying explanation itself (already fairly thorough for all
  210 questions) plus this framing layer, not from full per-grade
  rewrites. Writing genuinely distinct 3-tier explanations for every
  question (630 total) wasn't realistic to do well in one pass — this
  templated approach is the honest middle ground.
- **Concept intros are per-chapter, not per-question.** A true
  "Brilliant-style" interactive lesson for all 210 questions
  individually is a much bigger project — this gives one solid concept
  explanation per chapter (21 total) before the questions start,
  which is the realistic version of "teach why, not just how" without
  a live AI or a huge hand-authored curriculum.

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
- **Grade levels are bands, not per-grade curricula.** Writing distinct
  content for every individual grade (1st through 12th, times 7
  subjects, times 3 difficulty tiers) isn't realistic to hand-write.
  Instead, 3 grade bands (Elementary, Middle School, High School) map
  onto the existing Beginner/Intermediate/Advanced chapters — picking
  a band sets how many chapters start unlocked across every subject,
  which is a real, working difference, just not a separate question
  bank per literal grade number.
- **The ranked leaderboard's weekly rollover runs client-side, not on
  a real server.** A true competitive league (like Duolingo's) needs a
  backend to run everyone's promotion/demotion in one fair, atomic
  step at the same moment. Here, each player's own device checks —
  next time THEY open the leaderboard — whether a new 7-day period has
  started since their last visit, and if so, promotes or demotes them
  based on where they landed in their rank's leaderboard at that
  moment. This works fine for a small app, but isn't perfectly fair at
  scale: two players in the same rank might have their "week" roll
  over at different real-world times, and the cohort each is judged
  against is just whoever happens to have recorded weekly XP in that
  rank right then — not a fixed, closed group the way a real
  server-run league guarantees. A scheduled Firebase Cloud Function
  running the rollover for everyone at once is the real fix, once this
  app has a backend.
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
  It also adapts difficulty per subject: answer a tutor question
  right and the next one for that subject comes from the next harder
  chapter tier (Beginner → Intermediate → Advanced); get it wrong and
  it stays at the same tier. This is plain conditional logic, not an
  AI call, but it's what makes the tutor feel like it's adjusting to
  you. Explanations are either tap-to-reveal (free) or shown
  automatically (Pro). When you add a real AI backend, this is the
  natural place to swap in genuinely AI-generated, tailored questions.
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
      // A signed-in user can create and update their own document,
      // but NOT the isPro or isUltra fields directly — those can only
      // be set by the Stripe webhook Cloud Function (which uses the
      // Admin SDK and bypasses these rules entirely). Without this
      // split, a user could open dev tools and grant themselves
      // Pro/Ultra for free with a raw Firestore write, no payment
      // required. Coins stay normally writable by the client, same
      // trust level as XP — there's no real-money cashout for coins,
      // so this isn't the same risk as faking a paid subscription.
      allow create: if request.auth != null && request.auth.uid == userId
                    && request.resource.data.isPro == false
                    && request.resource.data.isUltra == false;
      allow update: if request.auth != null && request.auth.uid == userId
                    && !request.resource.data.diff(resource.data).affectedKeys().hasAny(["isPro", "isUltra"]);
    }
    match /duels/{duelId} {
      allow read, write: if request.auth != null;
    }
    match /feedback/{feedbackId} {
      allow create: if request.auth != null;
      allow read, update, delete: if false;
    }
  }
}
```

This lets any signed-in user submit feedback, but not read anyone
else's — you view all submitted feedback yourself directly in the
Firebase console (Firestore Database > Data > `feedback` collection),
which bypasses these client-side rules entirely since you're using
the console, not the app.

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
