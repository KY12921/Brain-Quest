# version5

A gamified study app: sign in, pick a subject, answer questions, earn XP —
now with Boss Fights, Daily Missions, a Leaderboard, Duels, and a Pro tier.

**Join our Discord**: https://discord.gg/6mTzCdVGZ

## Backend setup: Val Town (Gemini AI + Stripe payments)

The AI Tutor, photo homework analysis, Study Mode course generation,
clans, friends, and real payments all run through a single backend
val at `val-town/version5-backend.js`. This deliberately does **not**
use Firebase Cloud Functions — that would require upgrading to
Firebase's Blaze (pay-as-you-go) plan, which needs a payment method
on file with Google. Val Town's free plan needs no card. Firebase
Auth and Firestore (sign-in and the database) are untouched — only
the "talk to Gemini / talk to Stripe / privileged Firestore writes"
logic lives on Val Town.

**Where your Gemini key lives**: only as an environment variable
inside your Val Town val, set via its Settings tab (see Part 4
below). It is never written into any file in this project, never
committed to GitHub, and never sent to the browser — the frontend
calls your val's URL, and only your val calls Gemini.

### Part 1 — One-time account

**Create a free Val Town account** at https://val.town — sign up
with GitHub or email, no credit card required. No CLI or local
install needed; you write and paste code directly in Val Town's
web-based editor.

### Part 2 — Get your Gemini API key

Go to https://aistudio.google.com/app/apikey, sign in with any Google
account, and click "Create API key." No credit card needed for the
free tier. Copy it somewhere safe for a moment.

### Part 3 — Get a Firebase service account key (for Firestore access)

The val needs to read/write your Firestore database directly (the
same way `firebase-admin` would, just over Firestore's REST API
instead, since `firebase-admin` doesn't run in Val Town's runtime).

1. Go to the [Firebase Console](https://console.firebase.google.com) →
   your project (`study-boss-3e3e4`) → gear icon → **Project settings**
   → **Service accounts** tab
2. Click **Generate new private key** — this downloads a `.json` file
3. Keep this file safe and **never commit it to GitHub** — it's a
   privileged credential for your whole Firebase project

### Part 4 — Set up Stripe (skip this if you're only doing the AI Tutor for now)

1. Create a Stripe account: https://dashboard.stripe.com/register.
   You can do everything in **test mode** first (toggle in the
   top-right of the dashboard) before ever touching real money.

2. **Create five Products** in Stripe (Dashboard → Product catalog →
   Add product):
   - **Pro Monthly** — recurring, $5.99/month
   - **Pro Yearly** — recurring, $59.99/year (roughly two months free
     versus monthly — adjust to taste)
   - **Ultra Monthly** — recurring, $12.99/month
   - **Ultra Yearly** — recurring, $129.99/year
   - **Coins packs** — you'll actually want three separate one-time
     Prices here: 1000 coins ($0.99), 5000 coins ($3.99), 10000 coins
     ($6.99) — adjust to taste

   For each, click into the product after creating it and copy its
   **Price ID** (looks like `price_1AbC2DeFgHiJ...`). You'll need all
   of these in Part 5.

3. Get your **Secret key**: Dashboard → Developers → API keys → copy
   the Secret key (starts with `sk_test_...` while in test mode).

### Part 5 — Create the val and store your secrets

1. **Create an HTTP val**: from your Val Town dashboard, click
   **New val** → **HTTP val**.
2. **Paste the backend code**: copy the entire contents of
   `val-town/version5-backend.js` from this project into the val's
   editor, replacing the placeholder code Val Town starts you with.
3. **Set environment variables**: open the val's **Settings** tab →
   **Environment Variables**, and add each of these:
   - `GEMINI_API_KEY` — from Part 2
   - `FIREBASE_SERVICE_ACCOUNT` — open the `.json` file from Part 3 in
     a text editor, select all, copy the **entire file contents** (it's
     one JSON object) and paste that whole thing in
   - `FIREBASE_PROJECT_ID` — `study-boss-3e3e4`
   - `ADMIN_EMAILS` — comma-separated list of emails allowed to use the
     in-app Admin panel, e.g. `you@example.com,friend@example.com`
   - `STRIPE_SECRET_KEY` — from Part 4, step 3 (skip if not using payments)
   - `STRIPE_WEBHOOK_SECRET` — you don't have this yet; come back to
     this one after Part 6
   - The six `STRIPE_PRICE_ID_...` variables — from Part 4, step 2
     (`STRIPE_PRICE_ID_PRO_MONTHLY`, `STRIPE_PRICE_ID_PRO_YEARLY`,
     `STRIPE_PRICE_ID_ULTRA_MONTHLY`, `STRIPE_PRICE_ID_ULTRA_YEARLY`,
     `STRIPE_PRICE_ID_COINS_1000`, `STRIPE_PRICE_ID_COINS_5000`,
     `STRIPE_PRICE_ID_COINS_10000`)

### Part 6 — Deploy and connect the Stripe webhook

1. **Run the val**: Val Town runs HTTP vals automatically as soon as
   you save — there's no separate "deploy" step. Your val's URL is
   shown at the top of the editor, looking like
   `https://yourname--abc123.web.val.run`. Copy it.

2. **Put that URL into the frontend.** Open `js/worker-api.js` and
   replace the placeholder:
   ```js
   const WORKER_BASE_URL = "https://yourname--abc123.web.val.run";
   ```

3. **Connect the Stripe webhook** (Dashboard → Developers → Webhooks
   → Add endpoint):
   - **Endpoint URL**: your val's URL + `/stripeWebhook`, e.g.
     `https://yourname--abc123.web.val.run/stripeWebhook`
   - **Events to send**: `checkout.session.completed` and
     `customer.subscription.deleted`

   After creating it, Stripe shows a **Signing secret**
   (`whsec_...`) — go back to your val's Settings and add it as the
   `STRIPE_WEBHOOK_SECRET` environment variable. No redeploy needed —
   Val Town picks up the new variable automatically.

### Part 7 — Test everything

1. Push your updated `js/worker-api.js` to GitHub so your live site
   has the real val URL.
2. Open your live site, go to the **AI Tutor**, type something like
   "I don't understand fractions." You should see "Thinking…" then a
   real Gemini response.
3. Go to **Go Pro**, subscribe to Pro using Stripe's test card
   **`4242 4242 4242 4242`**, any future expiry, any CVC. You should
   come back with Pro active.
4. If anything fails, open your val in Val Town and check its
   **Logs** tab — it shows the real error from your backend, which is
   usually very specific (missing environment variable, wrong Price
   ID, etc.).

### Part 8 — One important cleanup step before real launch

Right now, Firestore rules still let the client write `isPro`/`isUltra`
directly (that's what makes the "Activate Pro (test)" button and the
Shop's "Buy 1-Day Pro" work). Before accepting real payments for real,
apply the tightened Firestore rules below so nobody can grant
themselves Pro/Ultra for free via browser dev tools:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.auth.uid == userId
                    && request.resource.data.isPro == false
                    && request.resource.data.isUltra == false;
      allow update: if request.auth != null && request.auth.uid == userId
                    && !request.resource.data.diff(resource.data).affectedKeys().hasAny(["isPro", "isUltra"]);
    }
    match /duels/{duelId} {
      allow read, write: if request.auth != null;
    }
    match /teamBattles/{battleId} {
      allow read, write: if request.auth != null;
    }
    match /duelChat/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow update, delete: if false;
    }
    match /globalChat/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow update, delete: if false;
    }
    match /reportedMessages/{reportId} {
      allow create: if request.auth != null;
      allow read, update, delete: if false;
    }
    match /feedback/{feedbackId} {
      allow create: if request.auth != null;
      allow read, update, delete: if false;
    }
    match /clans/{clanId} {
      allow read: if request.auth != null;
      allow write: if false;
      // Creating/joining/leaving a clan all go through the Val Town
      // backend (privileged service-account access) rather than
      // direct client writes, since joining costs coins that need
      // server-side validation and membership changes touch a
      // document the requester doesn't own. Reads are open so a
      // member's own clan screen can show live member/name updates
      // without a round trip through the backend for every view.
    }
    match /matchmakingQueue/{queueId} {
      allow read, write: if request.auth != null;
      // Used for live Quick Match pairing. Deliberately open to any
      // authenticated user (unlike most other collections here) —
      // entries are transient (a few seconds to minutes old) and
      // contain nothing sensitive beyond a name and a subject choice,
      // so the extra step of routing through the backend isn't
      // warranted the way it is for coins or clan membership.
    }
  }
}
```

**Known side effect**: this also disables the Shop's "Buy 1-Day Pro"
coin purchase and the test buttons, since they currently write
`isPro`/`isUltra` directly from the client too. Converting those into
Worker endpoints (same pattern as the Stripe webhook) is the way to
keep them working securely alongside real payments — not done yet in
this project.

### Files involved
- `val-town/version5-backend.js` — the entire backend: all endpoints
  (Gemini AI, Stripe payments, friends, clans, admin actions) live in
  this single file, since Val Town's HTTP vals are one file each
  rather than a multi-file project
- `js/worker-api.js` — the frontend's single helper for calling the
  val, used by the AI Tutor, Photo Help, Study Mode, friends, clans,
  admin panel, and Pro/Ultra/coin purchases alike

### Testing note
I can verify this code compiles, loads correctly, and matches
Firebase's and Stripe's own documented patterns — but I can't deploy
it or watch a real request succeed end-to-end, since I don't have
your Val Town account, Firebase project, or Stripe account. The real
end-to-end test happens when you run through Part 7 above. Your val's
Logs tab (Part 7, step 4) is the most useful thing to check first if
something doesn't work.

## Gifting and buying individual items with real money

Both of these reuse the exact same Stripe secrets you already set up
in Part 5 above — no new setup needed if you've already got Stripe
working for Pro/Ultra/coin packs. Just save the val after pulling
these changes — Val Town runs the new code immediately, no separate
deploy step.

**Why these needed real backend work, not just a client-side button**:
a signed-in user's ID token only lets them write to *their own*
Firestore document — that's the security rule working as intended.
Gifting an item to someone else, or letting the client decide what an
item costs in real money, both require a privileged server that can
independently verify the price and move data between two different
users' accounts. That's what `giftItem`, `giftCoins`, and
`createItemCheckoutSession` in `val-town/version5-backend.js` do.

**Maintenance note**: the val keeps its own trusted price list
(`GIFTABLE_ITEMS` in `val-town/version5-backend.js`) for every
giftable/real-money-purchasable item, separate from `js/shop.js`'s
`SHOP_ITEMS`. If you add a new cosmetic or change its coin price in
one, mirror the change in the other — there's no way to share this
data between the two codebases, and letting them drift means gifting
or real-money purchases would use a stale price.

**Scope note**: only one-time cosmetic unlocks (avatar icons, frames,
decorations, nameplates, extra themes, extra music) can be gifted or
bought with real money — not consumables like XP boosts or streak
freezes, and not bundles. Gifting "a temporary boost" doesn't carry
over as cleanly, so this was deliberately left out rather than built
half-heartedly.

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
    match /teamBattles/{battleId} {
      allow read, write: if request.auth != null;
    }
    match /duelChat/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow update, delete: if false;
    }
    match /globalChat/{messageId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow update, delete: if false;
    }
    match /reportedMessages/{reportId} {
      allow create: if request.auth != null;
      allow read, update, delete: if false;
    }
    match /feedback/{feedbackId} {
      allow create: if request.auth != null;
      allow read, update, delete: if false;
    }
    match /clans/{clanId} {
      allow read: if request.auth != null;
      allow write: if false;
      // Creating/joining/leaving a clan all go through the Val Town
      // backend (privileged service-account access) rather than
      // direct client writes, since joining costs coins that need
      // server-side validation and membership changes touch a
      // document the requester doesn't own. Reads are open so a
      // member's own clan screen can show live member/name updates
      // without a round trip through the backend for every view.
    }
    match /matchmakingQueue/{queueId} {
      allow read, write: if request.auth != null;
      // Used for live Quick Match pairing. Deliberately open to any
      // authenticated user (unlike most other collections here) —
      // entries are transient (a few seconds to minutes old) and
      // contain nothing sensitive beyond a name and a subject choice,
      // so the extra step of routing through the backend isn't
      // warranted the way it is for coins or clan membership.
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
version5/
├── index.html               All screens: auth, quests, quiz, boss, missions, leaderboard,
│                             battle, tutor, study mode, shop, pro, profile, settings, clans, friends, admin
├── css/style.css            Visual design for every screen, including 7 selectable background themes
├── js/firebase-config.js    Your Firebase project credentials (fill this in)
├── js/worker-api.js         Calls your Val Town backend (Gemini + Stripe + privileged Firestore actions)
├── js/questions.js          Question bank per subject, plus chapter>lesson Quests content (10 subjects)
├── js/cosmetics.js          Avatar icon / frame / decoration / nameplate rendering
├── js/app.js                Core: auth, nav, subject quests, shared quiz engine, streak, roadmap
├── js/interactive.js        Interactive question widgets (balance scale, slope-drag, sequence,
│                             grid-logic, sentence-build, speak-sentence)
├── js/ollie-3d.js           Ollie the mascot, rendered in real 3D via Three.js (SVG fallback included)
├── js/boss.js               Boss Fight mode (hearts, scaling difficulty)
├── js/missions.js           Daily mission tracking (rewards coins)
├── js/shop.js               Coin shop: boosts, cosmetics, daily rotating deals, daily spin wheel
├── js/leaderboard.js        Weekly ranked leaderboard (XP) + all-time lessons-completed leaderboard
├── js/duels.js              Live 1-on-1 Battles: friend-code battles and Quick Match (queue-based)
├── js/team-battles.js       Live team battles: 2v2 through 5v5, chosen at creation
├── js/friends.js            Add/remove friends, block/unblock
├── js/clans.js              Create/join/leave clans, clan leaderboard (most XP, most lessons)
├── js/admin.js              In-app admin panel (email or username lookup, grant/ban)
├── js/global-chat.js        App-wide live chat widget
├── js/tutor.js              AI Tutor chat
├── js/study-mode.js         AI-generates a custom course from your curriculum (Pro/Ultra),
│                             shareable via link (Ultra)
├── js/ai-tutor-gemini.js    Client side of the Gemini-powered features
├── js/ultra-photo.js        Ultra's photo homework analysis
├── js/pro.js                Go Pro/Ultra screen (real Stripe checkout)
├── js/settings.js           Themes, background lines toggle, music, language, interactive-questions toggle
├── js/theme.js              Light/dark mode toggle
├── js/music.js              Synthesized background music
├── js/achievements.js       Badges, with coin rewards for the hardest ones
├── js/profile.js            Account details + cosmetic equip picker
├── js/onboarding.js         First-run signup flow
├── js/onboarding-carousel.js  First-run welcome carousel
├── val-town/version5-backend.js   Backend: Gemini AI + Stripe + friends/clans/admin (see setup section above)
└── README.md                This file
```

## Suggested next steps

Most of the "obvious next things" for an app like this are already
built — live 1-on-1 and team battles, Quick Match queue-based
matchmaking, real AI tutoring and course generation, clans, friends,
and real Stripe payments are all in place. A few genuine ideas for
what's left:

1. **Get real users trying it** — friends, a study Discord, a
   subreddit. See what actually gets used before building more.
2. **Real ads**: once you have a Google AdSense account, swap the
   placeholder banner for AdSense's script snippet.
3. **Push notifications**: a daily reminder to keep a streak alive,
   via a service worker + the Web Push API.
4. **More Duolingo-style content**: sentence-building and speaking
   exercises currently cover 3 of English's 10 chapters — extending
   this to the rest, and to other subjects where it fits, is
   straightforward now that the interactive widgets exist.
   rather than the current asynchronous score comparison.
