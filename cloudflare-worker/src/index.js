// ------------------------------------------------------------------
// Brain Quest — Cloudflare Worker backend.
//
// This replaces the Firebase Cloud Functions version, so this app
// never needs Firebase's Blaze (pay-as-you-go) plan or a payment
// method on file with Google. Firebase Auth and Firestore are
// untouched — only the "talk to Gemini / talk to Stripe" logic moved
// here, onto Cloudflare's free tier (no card required, and — unlike
// some other free tiers — explicitly allowed for commercial/paid use).
//
// See the README's "Connecting the real AI Tutor" and "Taking real
// payments" sections for full setup steps.
// ------------------------------------------------------------------

import { requireAuth } from "./firebaseAuth.js";
import { callGemini, GRADE_WORDS } from "./gemini.js";
import { getFirestoreDocument, updateFirestoreDocument, incrementFirestoreField, findFirestoreDocByField, grantCosmeticServerSide } from "./firestore.js";
import Stripe from "stripe";

const MAX_OUTPUT_TOKENS = 220;

// Using "*" here is a deliberate, reasonable choice: this API is
// authenticated with a bearer token the client explicitly attaches
// per-request (not a cookie/session), so there's no ambient
// credential a third-party site could silently ride on. If you'd
// rather restrict this to your own domain, replace "*" with your
// exact GitHub Pages URL (e.g. "https://yourname.github.io").
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS_HEADERS }
  });
}

function errorJson(message, status = 400) {
  return json({ error: message }, status);
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+/, "");

    try {
      if (path === "generateTutorExplanation") return await handleGenerateTutorExplanation(request, env);
      if (path === "chatWithTutor") return await handleChatWithTutor(request, env);
      if (path === "generatePracticeQuestion") return await handleGeneratePracticeQuestion(request, env);
      if (path === "analyzeHomeworkPhoto") return await handleAnalyzeHomeworkPhoto(request, env);
      if (path === "createCheckoutSession") return await handleCreateCheckoutSession(request, env);
      if (path === "stripeWebhook") return await handleStripeWebhook(request, env);
      return errorJson("Unknown endpoint: " + path, 404);
    } catch (err) {
      console.error("Unhandled error on " + path + ":", err.message);
      return errorJson("Something went wrong. Please try again.", 500);
    }
  }
};

async function handleGenerateTutorExplanation(request, env) {
  try {
    await requireAuth(request, env.FIREBASE_PROJECT_ID);
  } catch (err) {
    return errorJson("You must be signed in.", 401);
  }

  const data = await request.json().catch(() => ({}));
  const { question, options, correctAnswerText, selectedAnswerText, subject, gradeLevel } = data;
  if (!question || !correctAnswerText) {
    return errorJson("Missing question or correctAnswerText.", 400);
  }

  const gradeWord = GRADE_WORDS[gradeLevel] || "a";
  const wrongAnswerLine = selectedAnswerText && selectedAnswerText !== correctAnswerText
    ? `The student answered "${selectedAnswerText}", which is incorrect.`
    : "The student answered correctly.";

  const prompt = `You are a friendly, encouraging tutor helping ${gradeWord} student understand a ${subject || "general"} question.

Question: ${question}
${options ? "Options: " + options.join(", ") : ""}
Correct answer: ${correctAnswerText}
${wrongAnswerLine}

Explain WHY the correct answer is right, in 2-4 short sentences a student at this level can follow. If they got it wrong, briefly and kindly note what might have led to their answer. Do not just restate the question. Keep it warm and simple, no headers or bullet points, just plain sentences.`;

  try {
    const text = await callGemini(env.GEMINI_API_KEY, [{ role: "user", parts: [{ text: prompt }] }], { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.7 });
    return json({ explanation: text.trim() });
  } catch (err) {
    if (err.status === 429) return errorJson("The AI Tutor is at its usage limit for now — try again in a bit.", 429);
    return errorJson("The AI Tutor couldn't generate an explanation right now.", 500);
  }
}

async function handleChatWithTutor(request, env) {
  try {
    await requireAuth(request, env.FIREBASE_PROJECT_ID);
  } catch (err) {
    return errorJson("You must be signed in.", 401);
  }

  const data = await request.json().catch(() => ({}));
  const { history, gradeLevel, weakestSubject } = data;
  if (!Array.isArray(history) || history.length === 0) {
    return errorJson("Missing conversation history.", 400);
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
    const text = await callGemini(env.GEMINI_API_KEY, contents, { maxOutputTokens: 300, temperature: 0.7 });
    return json({ reply: text.trim() });
  } catch (err) {
    if (err.status === 429) return errorJson("The AI Tutor is at its usage limit for now — try again in a bit.", 429);
    return errorJson("Couldn't reach the tutor right now.", 500);
  }
}

async function handleGeneratePracticeQuestion(request, env) {
  try {
    await requireAuth(request, env.FIREBASE_PROJECT_ID);
  } catch (err) {
    return errorJson("You must be signed in.", 401);
  }

  const data = await request.json().catch(() => ({}));
  const { conversationContext, gradeLevel } = data;
  if (!conversationContext) return errorJson("Missing conversationContext.", 400);

  const gradeWord = GRADE_WORDS[gradeLevel] || "a";
  const prompt = `Based on this tutoring conversation with ${gradeWord} student:

${conversationContext}

Write ONE multiple-choice practice question testing the concept just discussed, at a difficulty appropriate for this student. Respond with ONLY raw JSON, no markdown formatting, no code fences, in exactly this shape:
{"q": "question text", "options": ["option A", "option B", "option C", "option D"], "correct": 0, "explanation": "why the correct answer is right"}
"correct" is the 0-based index of the right option within "options".`;

  try {
    const text = await callGemini(env.GEMINI_API_KEY, [{ role: "user", parts: [{ text: prompt }] }], { maxOutputTokens: 350, temperature: 0.6 });
    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "");
    const parsed = JSON.parse(cleaned);
    if (!parsed.q || !Array.isArray(parsed.options) || parsed.options.length !== 4
      || typeof parsed.correct !== "number" || parsed.correct < 0 || parsed.correct > 3 || !parsed.explanation) {
      throw new Error("Malformed question shape from Gemini");
    }
    return json({ question: parsed });
  } catch (err) {
    console.error("generatePracticeQuestion error:", err.message);
    return errorJson("Couldn't generate a practice question right now.", 500);
  }
}

async function handleAnalyzeHomeworkPhoto(request, env) {
  let auth;
  try {
    auth = await requireAuth(request, env.FIREBASE_PROJECT_ID);
  } catch (err) {
    return errorJson("You must be signed in.", 401);
  }

  const userData = await getFirestoreDocument(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", auth.uid);
  if (!userData || !userData.isUltra) {
    return errorJson("Photo homework analysis is an Ultra feature.", 403);
  }

  const data = await request.json().catch(() => ({}));
  const { imageBase64, mimeType, subject, gradeLevel } = data;
  if (!imageBase64) return errorJson("Missing imageBase64.", 400);
  if (imageBase64.length > 8000000) {
    return errorJson("That image is too large. Try a smaller photo or a tighter crop.", 400);
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
    const text = await callGemini(env.GEMINI_API_KEY, contents, { maxOutputTokens: 500, temperature: 0.4 });
    return json({ analysis: text.trim() });
  } catch (err) {
    if (err.status === 429) return errorJson("The photo analyzer is at its usage limit for now — try again in a bit.", 429);
    console.error("analyzeHomeworkPhoto error:", err.message);
    return errorJson("Couldn't analyze that photo right now. Please try again.", 500);
  }
}

// Maps a productType the client sends to the Cloudflare secret name
// holding that Stripe Price ID, and whether it's a subscription or a
// one-time payment. Coin packs are always "payment" mode; Pro/Ultra
// (either billing period) are always "subscription" mode.
const PRODUCT_CONFIG = {
  proMonthly: { priceEnvKey: "STRIPE_PRICE_ID_PRO_MONTHLY", mode: "subscription" },
  proYearly: { priceEnvKey: "STRIPE_PRICE_ID_PRO_YEARLY", mode: "subscription" },
  ultraMonthly: { priceEnvKey: "STRIPE_PRICE_ID_ULTRA_MONTHLY", mode: "subscription" },
  ultraYearly: { priceEnvKey: "STRIPE_PRICE_ID_ULTRA_YEARLY", mode: "subscription" },
  coins1000: { priceEnvKey: "STRIPE_PRICE_ID_COINS_1000", mode: "payment", coinAmount: 1000 },
  coins5000: { priceEnvKey: "STRIPE_PRICE_ID_COINS_5000", mode: "payment", coinAmount: 5000 },
  coins10000: { priceEnvKey: "STRIPE_PRICE_ID_COINS_10000", mode: "payment", coinAmount: 10000 }
};

async function handleCreateCheckoutSession(request, env) {
  let auth;
  try {
    auth = await requireAuth(request, env.FIREBASE_PROJECT_ID);
  } catch (err) {
    return errorJson("You must be signed in to purchase.", 401);
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });
  const data = await request.json().catch(() => ({}));
  const { successUrl, cancelUrl, productType } = data;
  if (!successUrl || !cancelUrl || !productType) {
    return errorJson("Missing successUrl, cancelUrl, or productType.", 400);
  }

  const config = PRODUCT_CONFIG[productType];
  if (!config) return errorJson("Unknown productType: " + productType, 400);
  const priceId = env[config.priceEnvKey];
  if (!priceId) return errorJson("This product isn't configured yet on the server (missing " + config.priceEnvKey + ").", 500);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: config.mode,
      line_items: [{ price: priceId, quantity: 1 }],
      client_reference_id: auth.uid,
      metadata: { productType },
      success_url: successUrl,
      cancel_url: cancelUrl
    });
    return json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session error:", err.message);
    return errorJson("Couldn't start checkout right now. Please try again.", 500);
  }
}

async function handleStripeWebhook(request, env) {
  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });
  const sig = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event;
  try {
    const cryptoProvider = Stripe.createSubtleCryptoProvider();
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, env.STRIPE_WEBHOOK_SECRET, undefined, cryptoProvider);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response("Webhook Error: " + err.message, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.client_reference_id;
    const productType = session.metadata && session.metadata.productType;
    const config = PRODUCT_CONFIG[productType];

    if (userId && config && config.mode === "payment") {
      // Coin pack purchase.
      await incrementFirestoreField(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", userId, "coins", config.coinAmount);
      console.log(`User ${userId} purchased ${config.coinAmount} coins (${productType}).`);

      // The 5000-coin pack is a bundle: it also grants a frame + icon,
      // on top of the coins — see the Shop's description of this pack.
      if (productType === "coins5000") {
        await grantCosmeticServerSide(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", userId, "avatarIcons", "dragon");
        await grantCosmeticServerSide(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", userId, "frames", "fire");
        console.log(`User ${userId} also received the coins5000 bundle's frame + icon.`);
      }
    } else if (userId && productType && productType.startsWith("ultra")) {
      await updateFirestoreDocument(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", userId, {
        isPro: true, isUltra: true, stripeCustomerId: session.customer
      });
      console.log(`User ${userId} upgraded to Ultra (${productType}).`);
    } else if (userId && productType && productType.startsWith("pro")) {
      await updateFirestoreDocument(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", userId, {
        isPro: true, stripeCustomerId: session.customer
      });
      console.log(`User ${userId} upgraded to Pro (${productType}).`);
    } else if (userId) {
      // Fallback for older sessions created before productType existed.
      await updateFirestoreDocument(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", userId, {
        isPro: true, stripeCustomerId: session.customer
      });
      console.log(`User ${userId} upgraded to Pro (legacy session, no productType).`);
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const match = await findFirestoreDocByField(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", "stripeCustomerId", subscription.customer);
    if (match) {
      await updateFirestoreDocument(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", match.id, { isPro: false, isUltra: false });
      console.log(`User ${match.id} downgraded (subscription cancelled).`);
    }
  }

  return json({ received: true });
}
