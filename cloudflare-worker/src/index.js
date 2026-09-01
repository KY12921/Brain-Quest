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
      if (path === "giftItem") return await handleGiftItem(request, env);
      if (path === "giftCoins") return await handleGiftCoins(request, env);
      if (path === "createItemCheckoutSession") return await handleCreateItemCheckoutSession(request, env);
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
  const systemText = `You are a warm, patient AI tutor chatting with ${gradeWord} student inside a study app called Brain Quest.${weakNote} Explain concepts clearly and simply for their level, be encouraging, and keep replies conversational and fairly short (a few sentences, not an essay) unless they explicitly ask for more depth. If it seems like they've understood, you can mention they can tap "Give me a practice question" below your message to try one.

Stay focused on schoolwork, studying, and this app — that's what you're here for. A little friendly small talk is fine (saying hi, a quick "how are you," a question about how a feature works), and don't be preachy about it. But if someone asks for something that has nothing to do with learning or homework — writing unrelated stories, help with something totally off-topic, etc. — briefly and kindly note that you're set up to help with studying, and steer the conversation back to what they're working on, rather than fully going along with the off-topic request.`;

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
      // The 10000-coin pack is the biggest bundle: icon + frame +
      // decoration + nameplate, on top of the coins.
      if (productType === "coins10000") {
        await grantCosmeticServerSide(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", userId, "avatarIcons", "wizard");
        await grantCosmeticServerSide(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", userId, "frames", "ice");
        await grantCosmeticServerSide(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", userId, "decorations", "star");
        await grantCosmeticServerSide(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", userId, "nameplates", "shadow");
        console.log(`User ${userId} also received the coins10000 bundle's icon, frame, decoration, and nameplate.`);
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
    } else if (userId && productType === "shopItemRealMoney") {
      const itemId = session.metadata && session.metadata.itemId;
      const item = GIFTABLE_ITEMS[itemId];
      if (item) {
        await grantCosmeticServerSide(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", userId, item.cosmeticCategory, item.cosmeticId);
        console.log(`User ${userId} bought ${itemId} with real money.`);
      }
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

// ------------------------------------------------------------------
// Gifting and real-money item purchases.
//
// SECURITY NOTE: a client can't be trusted to say what something
// costs, or to grant items to another user's account directly (their
// own auth token only lets them write their own Firestore document).
// Both of these need to go through here — the Worker independently
// knows the real price of every item (this catalog) and uses its
// privileged Firestore access to move coins/items between accounts.
//
// MAINTENANCE WARNING: this catalog must be kept in sync with
// js/shop.js's SHOP_ITEMS by hand — there's no way to share this data
// between the two codebases (different runtimes, different deploys).
// If you change a price or add an item in shop.js, mirror it here too,
// or gifting/real-money purchases will use stale data.
// ------------------------------------------------------------------

const GIFTABLE_ITEMS = {
  "avatar-phoenix": { cosmeticCategory: "avatarIcons", cosmeticId: "phoenix", costCoins: 350 },
  "avatar-dragon": { cosmeticCategory: "avatarIcons", cosmeticId: "dragon", costCoins: 450 },
  "avatar-wizard": { cosmeticCategory: "avatarIcons", cosmeticId: "wizard", costCoins: 375 },
  "avatar-ninja": { cosmeticCategory: "avatarIcons", cosmeticId: "ninja", costCoins: 400 },
  "avatar-phoenix-ultra": { cosmeticCategory: "avatarIcons", cosmeticId: "phoenixUltra", costCoins: 550, requiresTier: "ultra" },
  "frame-gold": { cosmeticCategory: "frames", cosmeticId: "gold", costCoins: 300 },
  "frame-fire": { cosmeticCategory: "frames", cosmeticId: "fire", costCoins: 400 },
  "frame-ice": { cosmeticCategory: "frames", cosmeticId: "ice", costCoins: 400 },
  "frame-electric": { cosmeticCategory: "frames", cosmeticId: "electric", costCoins: 500, requiresTier: "pro" },
  "deco-crown": { cosmeticCategory: "decorations", cosmeticId: "crown", costCoins: 350 },
  "deco-sparkle": { cosmeticCategory: "decorations", cosmeticId: "sparkle", costCoins: 250 },
  "deco-star": { cosmeticCategory: "decorations", cosmeticId: "star", costCoins: 275 },
  "deco-heart": { cosmeticCategory: "decorations", cosmeticId: "heart", costCoins: 225 },
  "nameplate-gold": { cosmeticCategory: "nameplates", cosmeticId: "gold", costCoins: 500 },
  "nameplate-neon": { cosmeticCategory: "nameplates", cosmeticId: "neon", costCoins: 600 },
  "nameplate-rainbow": { cosmeticCategory: "nameplates", cosmeticId: "rainbow", costCoins: 700 },
  "nameplate-shadow": { cosmeticCategory: "nameplates", cosmeticId: "shadow", costCoins: 450 },
  "theme-sunset": { cosmeticCategory: "themes", cosmeticId: "sunset", costCoins: 750 },
  "theme-galaxy": { cosmeticCategory: "themes", cosmeticId: "galaxy", costCoins: 900 },
  "music-coffeeshop": { cosmeticCategory: "music", cosmeticId: "coffeeShop", costCoins: 300 },
  "music-zengarden": { cosmeticCategory: "music", cosmeticId: "zenGarden", costCoins: 350 }
};

// 100 coins = $1.00 — simple, transparent conversion for real-money
// purchases of individual items (Stripe's price_data wants cents).
function coinsToCents(coins) {
  return Math.round(coins);
}

async function handleGiftItem(request, env) {
  let auth;
  try {
    auth = await requireAuth(request, env.FIREBASE_PROJECT_ID);
  } catch (err) {
    return errorJson("You must be signed in to send a gift.", 401);
  }

  const data = await request.json().catch(() => ({}));
  const { itemId, recipientEmail } = data;
  const item = GIFTABLE_ITEMS[itemId];
  if (!item) return errorJson("Unknown or non-giftable item: " + itemId, 400);
  if (!recipientEmail) return errorJson("Missing recipientEmail.", 400);

  const sender = await getFirestoreDocument(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", auth.uid);
  if (!sender) return errorJson("Couldn't find your account.", 404);
  if (item.requiresTier === "ultra" && !sender.isUltra) return errorJson("That item is Ultra-exclusive.", 403);
  if (item.requiresTier === "pro" && !sender.isPro && !sender.isUltra) return errorJson("That item is Pro-exclusive.", 403);
  if ((sender.coins || 0) < item.costCoins) return errorJson("You don't have enough coins for that gift.", 400);

  const recipientMatch = await findFirestoreDocByField(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", "email", recipientEmail.trim().toLowerCase());
  if (!recipientMatch) return errorJson("No Brain Quest account found with that email.", 404);
  if (recipientMatch.id === auth.uid) return errorJson("You can't gift an item to yourself.", 400);

  await updateFirestoreDocument(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", auth.uid, {
    coins: (sender.coins || 0) - item.costCoins
  });
  await grantCosmeticServerSide(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", recipientMatch.id, item.cosmeticCategory, item.cosmeticId);

  return json({ success: true, message: `Gift sent to ${recipientEmail}!` });
}

async function handleGiftCoins(request, env) {
  let auth;
  try {
    auth = await requireAuth(request, env.FIREBASE_PROJECT_ID);
  } catch (err) {
    return errorJson("You must be signed in to send a gift.", 401);
  }

  const data = await request.json().catch(() => ({}));
  const { coinAmount, recipientEmail } = data;
  const amount = parseInt(coinAmount, 10);
  if (!amount || amount <= 0) return errorJson("Invalid coin amount.", 400);
  if (!recipientEmail) return errorJson("Missing recipientEmail.", 400);

  const sender = await getFirestoreDocument(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", auth.uid);
  if (!sender) return errorJson("Couldn't find your account.", 404);
  if ((sender.coins || 0) < amount) return errorJson("You don't have enough coins for that gift.", 400);

  const recipientMatch = await findFirestoreDocByField(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", "email", recipientEmail.trim().toLowerCase());
  if (!recipientMatch) return errorJson("No Brain Quest account found with that email.", 404);
  if (recipientMatch.id === auth.uid) return errorJson("You can't gift coins to yourself.", 400);

  await updateFirestoreDocument(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", auth.uid, {
    coins: (sender.coins || 0) - amount
  });
  await incrementFirestoreField(env.FIREBASE_PROJECT_ID, env.FIREBASE_SERVICE_ACCOUNT, "users", recipientMatch.id, "coins", amount);

  return json({ success: true, message: `${amount} coins sent to ${recipientEmail}!` });
}

async function handleCreateItemCheckoutSession(request, env) {
  let auth;
  try {
    auth = await requireAuth(request, env.FIREBASE_PROJECT_ID);
  } catch (err) {
    return errorJson("You must be signed in to purchase.", 401);
  }

  const stripe = new Stripe(env.STRIPE_SECRET_KEY, { httpClient: Stripe.createFetchHttpClient() });
  const data = await request.json().catch(() => ({}));
  const { itemId, successUrl, cancelUrl } = data;
  const item = GIFTABLE_ITEMS[itemId];
  if (!item) return errorJson("Unknown item: " + itemId, 400);
  if (!successUrl || !cancelUrl) return errorJson("Missing successUrl or cancelUrl.", 400);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: { name: "Brain Quest — " + itemId },
          unit_amount: coinsToCents(item.costCoins)
        },
        quantity: 1
      }],
      client_reference_id: auth.uid,
      metadata: { productType: "shopItemRealMoney", itemId: itemId },
      success_url: successUrl,
      cancel_url: cancelUrl
    });
    return json({ url: session.url });
  } catch (err) {
    console.error("Item checkout session error:", err.message);
    return errorJson("Couldn't start checkout right now. Please try again.", 500);
  }
}
