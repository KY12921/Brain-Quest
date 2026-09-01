// ------------------------------------------------------------------
// Brain Quest — Cloud Function: real Gemini-powered AI Tutor.
//
// WHY THIS EXISTS: the Gemini API key must never be visible to the
// browser. This function runs on Google's servers, holds the key as
// a secret, and is the only thing that talks to Gemini. Your app
// calls this function (see js/ai-tutor-gemini.js), never Gemini
// directly.
//
// SETUP (one-time):
//   1. Get a free Gemini API key: https://aistudio.google.com/app/apikey
//   2. Upgrade your Firebase project to the Blaze (pay-as-you-go)
//      plan — Cloud Functions require it, but the free monthly quota
//      is generous and normal AI-Tutor-level usage should cost $0.
//   3. Install the Firebase CLI if you don't have it:
//        npm install -g firebase-tools
//   4. From your project's root folder (the one with firebase.json,
//      or run `firebase init functions` first if you don't have one):
//        firebase login
//        cd functions
//        npm install
//   5. Store your Gemini key as a secret (never put it in code):
//        firebase functions:secrets:set GEMINI_API_KEY
//      (it will prompt you to paste the key)
//   6. Deploy:
//        firebase deploy --only functions
//   7. Copy the Firebase Functions SDK script tag and the
//      firebase.functions() call into your index.html — see the
//      README section "Connecting the real AI Tutor" for the exact
//      snippet to add.
// ------------------------------------------------------------------

const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

// Keep responses short and cheap — this is a tutoring hint, not an essay.
const MAX_OUTPUT_TOKENS = 220;

exports.generateTutorExplanation = onCall(
  { secrets: [GEMINI_API_KEY], cors: true },
  async (request) => {
    // Require the caller to be signed in — this stops random people
    // from using your Gemini quota by calling the function directly.
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    const { question, options, correctAnswerText, selectedAnswerText, subject, gradeLevel } = request.data || {};
    if (!question || !correctAnswerText) {
      throw new HttpsError("invalid-argument", "Missing question or correctAnswerText.");
    }

    const gradeWord = { elementary: "an elementary school", middle: "a middle school", high: "a high school" }[gradeLevel] || "a";

    const wrongAnswerLine = selectedAnswerText && selectedAnswerText !== correctAnswerText
      ? `The student answered "${selectedAnswerText}", which is incorrect.`
      : "The student answered correctly.";

    const prompt = `You are a friendly, encouraging tutor helping ${gradeWord} student understand a ${subject || "general"} question.

Question: ${question}
${options ? "Options: " + options.join(", ") : ""}
Correct answer: ${correctAnswerText}
${wrongAnswerLine}

Explain WHY the correct answer is right, in 2-4 short sentences a student at this level can follow. If they got it wrong, briefly and kindly note what might have led to their answer. Do not just restate the question. Keep it warm and simple, no headers or bullet points, just plain sentences.`;

    const contents = [{ role: "user", parts: [{ text: prompt }] }];

    try {
      const text = await callGemini(GEMINI_API_KEY.value(), contents, { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.7 });
      return { explanation: text.trim() };
    } catch (err) {
      if (err.status === 429) {
        throw new HttpsError("resource-exhausted", "The AI Tutor is at its usage limit for now — try again in a bit.");
      }
      throw new HttpsError("internal", "The AI Tutor couldn't generate an explanation right now.");
    }
  }
);

// ------------------------------------------------------------------
// Real Pro payments via Stripe.
//
// Two functions, working together:
//   1. createCheckoutSession — the browser calls this when the user
//      taps "Subscribe." It creates a Stripe Checkout session and
//      returns the URL to redirect to.
//   2. stripeWebhook — Stripe calls this directly (never the
//      browser) the instant a payment actually succeeds or a
//      subscription is cancelled. This is the ONLY place `isPro`
//      gets set for real — never trust the frontend alone to say
//      "payment worked," since anyone could fake that with dev tools.
//
// SETUP:
//   1. Create a Stripe account: https://dashboard.stripe.com/register
//   2. Create THREE Products in Stripe (Dashboard > Product catalog):
//      - Pro (recurring monthly Price)
//      - Ultra (recurring monthly Price)
//      - "1000 Coins" (one-time Price, NOT recurring)
//      Copy each Price ID (looks like price_1AbC...).
//   3. Get your Secret key (Dashboard > Developers > API keys) and
//      store it:
//        firebase functions:secrets:set STRIPE_SECRET_KEY
//   4. After deploying (step 6 below), add a webhook endpoint in
//      Stripe (Dashboard > Developers > Webhooks > Add endpoint):
//        URL: the deployed stripeWebhook URL (shown after deploy)
//        Events to send: checkout.session.completed,
//                         customer.subscription.deleted
//      Copy the "Signing secret" it gives you and store it:
//        firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
//   5. Set all three Price IDs (not secret info, but kept as secrets
//      for consistent setup — plain env vars work too):
//        firebase functions:secrets:set STRIPE_PRICE_ID_PRO
//        firebase functions:secrets:set STRIPE_PRICE_ID_ULTRA
//        firebase functions:secrets:set STRIPE_PRICE_ID_COINS1000
//   6. Deploy: firebase deploy --only functions
//   7. IMPORTANT: tighten your Firestore rules (see README) so
//      clients can no longer write their own isPro/isUltra/coins
//      fields directly — otherwise this can be bypassed with dev tools.
// ------------------------------------------------------------------

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");
const stripePriceIdPro = defineSecret("STRIPE_PRICE_ID_PRO");
const stripePriceIdUltra = defineSecret("STRIPE_PRICE_ID_ULTRA");
const stripePriceIdCoins1000 = defineSecret("STRIPE_PRICE_ID_COINS1000");

exports.createCheckoutSession = onCall(
  { secrets: [stripeSecretKey, stripePriceIdPro, stripePriceIdUltra, stripePriceIdCoins1000] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in to purchase.");
    }
    const stripe = require("stripe")(stripeSecretKey.value());
    const { successUrl, cancelUrl, productType } = request.data || {};
    if (!successUrl || !cancelUrl || !productType) {
      throw new HttpsError("invalid-argument", "Missing successUrl, cancelUrl, or productType.");
    }

    // Three purchasable things: the Pro subscription, the Ultra
    // subscription (a superset of Pro), and a one-time 1000-coin pack.
    // Each needs its own Stripe Price ID, set up the same way as the
    // original Pro price — see the README's Stripe setup section.
    let sessionConfig;
    if (productType === "pro") {
      sessionConfig = { mode: "subscription", line_items: [{ price: stripePriceIdPro.value(), quantity: 1 }] };
    } else if (productType === "ultra") {
      sessionConfig = { mode: "subscription", line_items: [{ price: stripePriceIdUltra.value(), quantity: 1 }] };
    } else if (productType === "coins1000") {
      sessionConfig = { mode: "payment", line_items: [{ price: stripePriceIdCoins1000.value(), quantity: 1 }] };
    } else {
      throw new HttpsError("invalid-argument", "Unknown productType: " + productType);
    }

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        ...sessionConfig,
        // This is how the webhook knows WHICH user paid AND for what —
        // Stripe hands both back untouched in the webhook event.
        client_reference_id: request.auth.uid,
        metadata: { productType },
        success_url: successUrl,
        cancel_url: cancelUrl
      });
    } catch (err) {
      console.error("Stripe checkout session error:", err.message);
      throw new HttpsError("internal", "Couldn't start checkout right now. Please try again.");
    }

    return { url: session.url };
  }
);

// One-time coin purchase — separate from the Pro subscription above.
// Uses inline price_data instead of a pre-configured Stripe Price, so
// no extra setup in the Stripe Dashboard is needed beyond what Pro
// already requires (same STRIPE_SECRET_KEY secret).
const COIN_PACK_PRICE_CENTS = 99; // $0.99
const COIN_PACK_AMOUNT = 1000;

exports.createCoinCheckoutSession = onCall(
  { secrets: [stripeSecretKey] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in to buy coins.");
    }
    const stripe = require("stripe")(stripeSecretKey.value());
    const successUrl = request.data && request.data.successUrl;
    const cancelUrl = request.data && request.data.cancelUrl;
    if (!successUrl || !cancelUrl) {
      throw new HttpsError("invalid-argument", "Missing successUrl or cancelUrl.");
    }

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "usd",
            unit_amount: COIN_PACK_PRICE_CENTS,
            product_data: { name: `${COIN_PACK_AMOUNT} Brain Quest Coins` }
          },
          quantity: 1
        }],
        client_reference_id: request.auth.uid,
        metadata: { purchaseType: "coins", coinAmount: String(COIN_PACK_AMOUNT) },
        success_url: successUrl,
        cancel_url: cancelUrl
      });
    } catch (err) {
      console.error("Stripe coin checkout session error:", err.message);
      throw new HttpsError("internal", "Couldn't start checkout right now. Please try again.");
    }

    return { url: session.url };
  }
);

exports.stripeWebhook = onRequest(
  { secrets: [stripeSecretKey, stripeWebhookSecret] },
  async (req, res) => {
    const stripe = require("stripe")(stripeSecretKey.value());
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      // req.rawBody is required here (not req.body) — Stripe's
      // signature check needs the exact raw bytes Stripe sent.
      event = stripe.webhooks.constructEvent(req.rawBody, sig, stripeWebhookSecret.value());
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.client_reference_id;
      const productType = session.metadata && session.metadata.productType;

      if (userId && productType === "coins1000") {
        await db.collection("users").doc(userId).update({
          coins: admin.firestore.FieldValue.increment(1000)
        });
        console.log(`User ${userId} purchased 1000 coins.`);
      } else if (userId && productType === "ultra") {
        // Ultra includes every Pro perk, plus its own — isPro is set
        // alongside isUltra so existing Pro-gated checks keep working.
        await db.collection("users").doc(userId).update({
          isPro: true,
          isUltra: true,
          stripeCustomerId: session.customer
        });
        console.log(`User ${userId} upgraded to Ultra.`);
      } else if (userId && productType === "pro") {
        await db.collection("users").doc(userId).update({
          isPro: true,
          stripeCustomerId: session.customer
        });
        console.log(`User ${userId} upgraded to Pro.`);
      } else if (userId) {
        // Fallback for older sessions created before productType existed.
        await db.collection("users").doc(userId).update({
          isPro: true,
          stripeCustomerId: session.customer
        });
        console.log(`User ${userId} upgraded to Pro (legacy session, no productType).`);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const snapshot = await db.collection("users")
        .where("stripeCustomerId", "==", subscription.customer)
        .limit(1)
        .get();
      if (!snapshot.empty) {
        await snapshot.docs[0].ref.update({ isPro: false, isUltra: false });
        console.log(`User ${snapshot.docs[0].id} downgraded (subscription cancelled).`);
      }
    }

    res.status(200).json({ received: true });
  }
);

// ------------------------------------------------------------------
// AI Tutor chat + generated practice questions.
//
// Two more functions, sharing the same Gemini key as
// generateTutorExplanation above:
//   1. chatWithTutor — the open-ended conversation. Takes the message
//      history and returns the AI's next reply.
//   2. generatePracticeQuestion — takes the recent conversation and
//      asks Gemini to write ONE multiple-choice question testing
//      whatever was just discussed, in the same {q, options, correct,
//      explanation} shape the rest of the app already uses, so it
//      can be answered with the exact same quiz UI as everywhere else.
// ------------------------------------------------------------------

const GEMINI_MODEL = "gemini-2.5-flash";

async function callGemini(apiKey, contents, generationConfig) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({ contents, generationConfig })
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error("Gemini API error:", response.status, errText);
    const err = new Error("Gemini API error " + response.status);
    err.status = response.status;
    throw err;
  }
  const data = await response.json();
  const text = data && data.candidates && data.candidates[0] && data.candidates[0].content
    && data.candidates[0].content.parts && data.candidates[0].content.parts[0]
    && data.candidates[0].content.parts[0].text;
  if (!text) throw new Error("No text in Gemini response");
  return text;
}

const GRADE_WORDS = { elementary: "an elementary school", middle: "a middle school", high: "a high school" };

exports.chatWithTutor = onCall(
  { secrets: [GEMINI_API_KEY] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }
    const { history, gradeLevel, weakestSubject } = request.data || {};
    if (!Array.isArray(history) || history.length === 0) {
      throw new HttpsError("invalid-argument", "Missing conversation history.");
    }

    const gradeWord = GRADE_WORDS[gradeLevel] || "a";
    const weakNote = weakestSubject
      ? ` The student's own data shows ${weakestSubject} tends to be a weaker subject for them, which might be relevant context, but only bring it up if it's actually relevant to what they're asking.`
      : "";
    const systemText = `You are a warm, patient AI tutor chatting with ${gradeWord} student inside a study app called Brain Quest.${weakNote} Explain concepts clearly and simply for their level, be encouraging, and keep replies conversational and fairly short (a few sentences, not an essay) unless they explicitly ask for more depth. If it seems like they've understood, you can mention they can tap "Give me a practice question" below your message to try one.`;

    const contents = [
      { role: "user", parts: [{ text: systemText }] },
      { role: "model", parts: [{ text: "Understood — I'm ready to help them." }] },
      ...history.map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] }))
    ];

    try {
      const text = await callGemini(GEMINI_API_KEY.value(), contents, { maxOutputTokens: 300, temperature: 0.7 });
      return { reply: text.trim() };
    } catch (err) {
      if (err.status === 429) {
        throw new HttpsError("resource-exhausted", "The AI Tutor is at its usage limit for now — try again in a bit.");
      }
      throw new HttpsError("internal", "Couldn't reach the tutor right now.");
    }
  }
);

exports.generatePracticeQuestion = onCall(
  { secrets: [GEMINI_API_KEY] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }
    const { conversationContext, gradeLevel } = request.data || {};
    if (!conversationContext) {
      throw new HttpsError("invalid-argument", "Missing conversationContext.");
    }

    const gradeWord = GRADE_WORDS[gradeLevel] || "a";
    const prompt = `Based on this tutoring conversation with ${gradeWord} student:

${conversationContext}

Write ONE multiple-choice practice question testing the concept just discussed, at a difficulty appropriate for this student. Respond with ONLY raw JSON, no markdown formatting, no code fences, in exactly this shape:
{"q": "question text", "options": ["option A", "option B", "option C", "option D"], "correct": 0, "explanation": "why the correct answer is right"}
"correct" is the 0-based index of the right option within "options".`;

    const contents = [{ role: "user", parts: [{ text: prompt }] }];

    try {
      const text = await callGemini(GEMINI_API_KEY.value(), contents, { maxOutputTokens: 350, temperature: 0.6 });
      const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "");
      const parsed = JSON.parse(cleaned);
      if (!parsed.q || !Array.isArray(parsed.options) || parsed.options.length !== 4
        || typeof parsed.correct !== "number" || parsed.correct < 0 || parsed.correct > 3 || !parsed.explanation) {
        throw new Error("Malformed question shape from Gemini");
      }
      return { question: parsed };
    } catch (err) {
      console.error("generatePracticeQuestion error:", err.message);
      throw new HttpsError("internal", "Couldn't generate a practice question right now.");
    }
  }
);

// ------------------------------------------------------------------
// Ultra: photo homework analysis.
//
// Takes a photo of the student's work (as base64), sends it to Gemini
// alongside a text prompt asking it to identify mistakes and explain
// how to fix them. Gemini's vision input works the same way as text —
// you just add an inline_data part to the same contents array used
// everywhere else in this file.
//
// Gated to Ultra members only. Since request.auth only carries
// uid/email (no custom tier claims are set up), this reads the
// user's own Firestore doc to check isUltra before doing anything —
// the Admin SDK read here bypasses Firestore rules, so this check is
// what actually enforces the gate, not the client.
// ------------------------------------------------------------------

exports.analyzeHomeworkPhoto = onCall(
  { secrets: [GEMINI_API_KEY] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in.");
    }

    const userDoc = await db.collection("users").doc(request.auth.uid).get();
    const userData = userDoc.data();
    if (!userData || !userData.isUltra) {
      throw new HttpsError("permission-denied", "Photo homework analysis is an Ultra feature.");
    }

    const { imageBase64, mimeType, subject, gradeLevel } = request.data || {};
    if (!imageBase64) {
      throw new HttpsError("invalid-argument", "Missing imageBase64.");
    }
    // Rough sanity limit — base64 inflates size by ~33%, so this caps
    // the original image at roughly 6MB, well within what Cloud
    // Functions callable requests accept (10MB default).
    if (imageBase64.length > 8_000_000) {
      throw new HttpsError("invalid-argument", "That image is too large. Try a smaller photo or a tighter crop.");
    }

    const gradeWord = GRADE_WORDS[gradeLevel] || "a";
    const prompt = `You are a patient, encouraging tutor reviewing a photo of ${gradeWord} student's ${subject || "school"} work.

Look at the work in the photo and:
1. Identify what the student got right.
2. Identify specific mistakes or weak spots — be precise about which part of the work is wrong, not just "some errors."
3. Explain clearly how to fix each mistake, at a level this student can follow.

If the photo is unreadable, too blurry, or doesn't show clear schoolwork, say so plainly instead of guessing. Keep the whole response conversational and encouraging — a few short paragraphs, not a rigid list with headers.`;

    const contents = [{
      role: "user",
      parts: [
        { text: prompt },
        { inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } }
      ]
    }];

    try {
      const text = await callGemini(GEMINI_API_KEY.value(), contents, { maxOutputTokens: 500, temperature: 0.4 });
      return { analysis: text.trim() };
    } catch (err) {
      if (err.status === 429) {
        throw new HttpsError("resource-exhausted", "The photo analyzer is at its usage limit for now — try again in a bit.");
      }
      console.error("analyzeHomeworkPhoto error:", err.message);
      throw new HttpsError("internal", "Couldn't analyze that photo right now. Please try again.");
    }
  }
);
