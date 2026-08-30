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

    const model = "gemini-2.5-flash"; // stable, generous free-tier model as of 2026 — check https://ai.google.dev/gemini-api/docs/models for the current recommended one
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    let response;
    try {
      response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": GEMINI_API_KEY.value()
        },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.7 }
        })
      });
    } catch (err) {
      throw new HttpsError("unavailable", "Couldn't reach Gemini right now. Please try again.");
    }

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("Gemini API error:", response.status, errText);
      if (response.status === 429) {
        throw new HttpsError("resource-exhausted", "The AI Tutor is at its usage limit for now — try again in a bit.");
      }
      throw new HttpsError("internal", "The AI Tutor couldn't generate an explanation right now.");
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new HttpsError("internal", "The AI Tutor didn't return a usable response.");
    }

    return { explanation: text.trim() };
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
//   2. Create a Product + recurring Price for Pro
//      (Dashboard > Product catalog > Add product). Copy the Price ID
//      (looks like price_1AbC...).
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
//   5. Set your Price ID (this one isn't secret, but keeping it as a
//      secret keeps setup consistent — a plain env var works too):
//        firebase functions:secrets:set STRIPE_PRICE_ID
//   6. Deploy: firebase deploy --only functions
//   7. IMPORTANT: tighten your Firestore rules (see README) so
//      clients can no longer write their own isPro field directly —
//      otherwise this whole system can be bypassed with dev tools.
// ------------------------------------------------------------------

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");
const stripePriceId = defineSecret("STRIPE_PRICE_ID");

exports.createCheckoutSession = onCall(
  { secrets: [stripeSecretKey, stripePriceId] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "You must be signed in to subscribe.");
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
        mode: "subscription",
        line_items: [{ price: stripePriceId.value(), quantity: 1 }],
        // This is how the webhook knows WHICH user paid — Stripe
        // hands this value back untouched in the webhook event.
        client_reference_id: request.auth.uid,
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
      if (userId) {
        await db.collection("users").doc(userId).update({
          isPro: true,
          stripeCustomerId: session.customer
        });
        console.log(`User ${userId} upgraded to Pro.`);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object;
      const snapshot = await db.collection("users")
        .where("stripeCustomerId", "==", subscription.customer)
        .limit(1)
        .get();
      if (!snapshot.empty) {
        await snapshot.docs[0].ref.update({ isPro: false });
        console.log(`User ${snapshot.docs[0].id} downgraded from Pro (subscription cancelled).`);
      }
    }

    res.status(200).json({ received: true });
  }
);
