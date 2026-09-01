// ------------------------------------------------------------------
// Brain Quest — AI backend for Val Town.
//
// This is the AI-only version: the AI Tutor chat, per-question
// explanations, generated practice questions, and Ultra's photo
// homework analysis. No Stripe/payments code here — that comes as a
// separate step once this part is working.
//
// HOW TO USE THIS FILE: create an HTTP val on val.town, paste this
// entire file in as its code, add the two secrets it needs (see the
// bottom of this comment block), and save. Val Town gives you a live
// URL the moment you save — no separate "deploy" step, no CLI, no
// local install.
//
// SECRETS THIS NEEDS (Val Town: your profile picture -> Environment
// Variables -> Add):
//   GEMINI_API_KEY          - from https://aistudio.google.com/app/apikey
//   FIREBASE_SERVICE_ACCOUNT - the whole contents of the .json file
//                              from Firebase Console -> Project
//                              Settings -> Service Accounts ->
//                              Generate new private key
//   FIREBASE_PROJECT_ID      - just the plain project id, e.g.
//                              study-boss-3e3e4 (not a JSON file,
//                              just the id itself)
//
// Val Town's npm: import syntax pulls in these libraries directly —
// no package.json, no local install, no bundling step needed.
// ------------------------------------------------------------------

import { importX509, jwtVerify, decodeProtectedHeader, SignJWT, importPKCS8 } from "npm:jose@5";
import Stripe from "npm:stripe@16";

const GEMINI_MODEL = "gemini-3.7-flash";
const MAX_OUTPUT_TOKENS = 220;
const GRADE_WORDS = { elementary: "an elementary school", middle: "a middle school", high: "a high school" };

// Using "*" is a deliberate, reasonable choice here: this API is
// authenticated with a bearer token the client explicitly attaches
// per-request (not a cookie/session), so there's no ambient
// credential a third-party site could silently ride on.
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

// ---------- Firebase ID token verification (no firebase-admin needed) ----------

const GOOGLE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
let cachedCerts = null;
let cachedCertsExpiry = 0;

async function getGoogleCerts() {
  const now = Date.now();
  if (cachedCerts && now < cachedCertsExpiry) return cachedCerts;
  const response = await fetch(GOOGLE_CERTS_URL);
  if (!response.ok) throw new Error("Failed to fetch Google public certs");
  const certs = await response.json();
  const cacheControl = response.headers.get("cache-control") || "";
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSeconds = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 3600;
  cachedCerts = certs;
  cachedCertsExpiry = now + maxAgeSeconds * 1000;
  return certs;
}

async function verifyFirebaseToken(idToken, projectId) {
  if (!idToken) throw new Error("No token provided");
  let header;
  try { header = decodeProtectedHeader(idToken); } catch (err) { throw new Error("Malformed token"); }
  if (header.alg !== "RS256") throw new Error("Unexpected token algorithm: " + header.alg);
  if (!header.kid) throw new Error("Token missing key ID");

  const certs = await getGoogleCerts();
  const certPem = certs[header.kid];
  if (!certPem) throw new Error("Token key ID not recognized");

  const publicKey = await importX509(certPem, "RS256");
  const { payload } = await jwtVerify(idToken, publicKey, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId
  });
  if (!payload.sub) throw new Error("Token missing subject (uid)");
  return { uid: payload.sub, email: payload.email || null };
}

async function requireAuth(request, projectId) {
  const authHeader = request.headers.get("Authorization") || "";
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) throw new Error("Missing Authorization header");
  return verifyFirebaseToken(match[1], projectId);
}

// ---------- Firestore REST access (for Photo Help's isUltra check) ----------

let cachedAccessToken = null;
let cachedTokenExpiry = 0;

async function getFirestoreAccessToken(serviceAccountJson) {
  const now = Date.now();
  if (cachedAccessToken && now < cachedTokenExpiry - 60000) return cachedAccessToken;
  const sa = JSON.parse(serviceAccountJson);
  const privateKey = await importPKCS8(sa.private_key, "RS256");
  const jwt = await new SignJWT({ scope: "https://www.googleapis.com/auth/datastore" })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(sa.client_email)
    .setSubject(sa.client_email)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(privateKey);
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: jwt })
  });
  if (!response.ok) throw new Error("Failed to get Google access token: " + (await response.text()));
  const data = await response.json();
  cachedAccessToken = data.access_token;
  cachedTokenExpiry = now + data.expires_in * 1000;
  return cachedAccessToken;
}

function fromFirestoreValue(fv) {
  if (!fv) return null;
  if ("nullValue" in fv) return null;
  if ("booleanValue" in fv) return fv.booleanValue;
  if ("integerValue" in fv) return parseInt(fv.integerValue, 10);
  if ("doubleValue" in fv) return fv.doubleValue;
  if ("stringValue" in fv) return fv.stringValue;
  if ("arrayValue" in fv) return (fv.arrayValue.values || []).map(fromFirestoreValue);
  if ("mapValue" in fv) {
    const obj = {};
    for (const [k, v] of Object.entries(fv.mapValue.fields || {})) obj[k] = fromFirestoreValue(v);
    return obj;
  }
  return null;
}

async function getFirestoreDocument(projectId, serviceAccountJson, collection, docId) {
  const accessToken = await getFirestoreAccessToken(serviceAccountJson);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Firestore read failed: " + (await response.text()));
  const doc = await response.json();
  const result = {};
  for (const [k, v] of Object.entries(doc.fields || {})) result[k] = fromFirestoreValue(v);
  return result;
}

function toFirestoreValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === "string") return { stringValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFirestoreValue) } };
  if (typeof v === "object") {
    const fields = {};
    for (const [k, val] of Object.entries(v)) fields[k] = toFirestoreValue(val);
    return { mapValue: { fields } };
  }
  throw new Error("Unsupported Firestore value type: " + typeof v);
}

async function updateFirestoreDocument(projectId, serviceAccountJson, collection, docId, updates) {
  const accessToken = await getFirestoreAccessToken(serviceAccountJson);
  const fieldPaths = Object.keys(updates);
  const maskParams = fieldPaths.map(f => `updateMask.fieldPaths=${encodeURIComponent(f)}`).join("&");
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}?${maskParams}`;
  const fields = {};
  for (const [k, v] of Object.entries(updates)) fields[k] = toFirestoreValue(v);
  const response = await fetch(url, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields })
  });
  if (!response.ok) throw new Error("Firestore update failed: " + (await response.text()));
  return response.json();
}

// Read-then-write — Firestore's REST API has no atomic increment the
// way the client SDK does. An acceptable trade-off at this app's
// scale (see the README for the fuller explanation).
async function incrementFirestoreField(projectId, serviceAccountJson, collection, docId, field, amount) {
  const current = await getFirestoreDocument(projectId, serviceAccountJson, collection, docId);
  const currentValue = (current && typeof current[field] === "number") ? current[field] : 0;
  await updateFirestoreDocument(projectId, serviceAccountJson, collection, docId, { [field]: currentValue + amount });
}

async function findFirestoreDocByField(projectId, serviceAccountJson, collection, field, value) {
  const accessToken = await getFirestoreAccessToken(serviceAccountJson);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: { fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value: toFirestoreValue(value) } },
      limit: 1
    }
  };
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error("Firestore query failed: " + (await response.text()));
  const results = await response.json();
  const match = results.find(r => r.document);
  if (!match) return null;
  const docId = match.document.name.split("/").pop();
  const fields = {};
  for (const [k, v] of Object.entries(match.document.fields || {})) fields[k] = fromFirestoreValue(v);
  return { id: docId, data: fields };
}

async function grantCosmeticServerSide(projectId, serviceAccountJson, collection, docId, category, cosmeticId) {
  const current = await getFirestoreDocument(projectId, serviceAccountJson, collection, docId);
  const ownedCosmetics = (current && current.ownedCosmetics) || {};
  const categoryArr = ownedCosmetics[category] || [];
  if (!categoryArr.includes(cosmeticId)) categoryArr.push(cosmeticId);
  ownedCosmetics[category] = categoryArr;
  await updateFirestoreDocument(projectId, serviceAccountJson, collection, docId, { ownedCosmetics });
}

// ---------- Gemini ----------

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
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("No text in Gemini response");
  return text;
}

// ---------- Endpoint handlers ----------

// "Ollie" (the owl mascot) gives a nudge-style HINT before the
// student has answered — deliberately different from
// generateTutorExplanation above, which explains the correct answer
// AFTER they've already answered. This one must never reveal which
// option is correct.
async function handleGetHint(request, projectId, geminiKey) {
  try { await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const data = await request.json().catch(() => ({}));
  const { question, options, subject, gradeLevel } = data;
  if (!question) return errorJson("Missing question.", 400);

  const gradeWord = GRADE_WORDS[gradeLevel] || "a";
  const prompt = `You are Ollie, a friendly owl mascot who gives ${gradeWord} student a HINT when they're stuck on a question — never the answer itself.

Question: ${question}
${options ? "Options: " + options.join(", ") : ""}
Subject: ${subject || "general"}

Give a short (1-2 sentence), encouraging nudge that helps them think through the problem themselves. Do NOT say which option is correct, and do NOT directly state the answer — just point their thinking in a useful direction. Keep your tone warm and a little playful, like a helpful owl friend, not a lecture.`;

  try {
    const text = await callGemini(geminiKey, [{ role: "user", parts: [{ text: prompt }] }], { maxOutputTokens: 120, temperature: 0.8 });
    return json({ hint: text.trim() });
  } catch (err) {
    if (err.status === 429) return errorJson("Ollie's a little busy right now — try again in a moment.", 429);
    return errorJson("Ollie couldn't come up with a hint just now.", 500);
  }
}

// Ollie's hint: a Socratic nudge, not the answer. Deliberately doesn't
// need to know the correct answer — Gemini can work that out from the
// question/options itself, and is instructed not to state it outright.
async function handleGetHint(request, projectId, geminiKey) {
  try { await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const data = await request.json().catch(() => ({}));
  const { question, options, subject, gradeLevel } = data;
  if (!question) return errorJson("Missing question.", 400);

  const gradeWord = GRADE_WORDS[gradeLevel] || "a";
  const prompt = `You are Ollie, a friendly, encouraging owl mascot helping ${gradeWord} student who's stuck on a ${subject || "school"} question.

Question: ${question}
${options ? "Options: " + options.join(", ") : ""}

Give a short, Socratic HINT — point them toward the key idea or a useful way to think about the question, WITHOUT stating which specific option is correct and without directly giving away the answer. Keep it warm, encouraging, and brief: 1-3 short sentences, no headers or lists.`;

  try {
    const text = await callGemini(geminiKey, [{ role: "user", parts: [{ text: prompt }] }], { maxOutputTokens: 150, temperature: 0.7 });
    return json({ hint: text.trim() });
  } catch (err) {
    if (err.status === 429) return errorJson("Ollie is a little busy right now — try again in a bit.", 429);
    return errorJson("Ollie couldn't come up with a hint right now.", 500);
  }
}

async function handleGenerateTutorExplanation(request, projectId, geminiKey) {
  try { await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const data = await request.json().catch(() => ({}));
  const { question, options, correctAnswerText, selectedAnswerText, subject, gradeLevel } = data;
  if (!question || !correctAnswerText) return errorJson("Missing question or correctAnswerText.", 400);

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
    const text = await callGemini(geminiKey, [{ role: "user", parts: [{ text: prompt }] }], { maxOutputTokens: MAX_OUTPUT_TOKENS, temperature: 0.7 });
    return json({ explanation: text.trim() });
  } catch (err) {
    if (err.status === 429) return errorJson("The AI Tutor is at its usage limit for now — try again in a bit.", 429);
    return errorJson("The AI Tutor couldn't generate an explanation right now.", 500);
  }
}

async function handleChatWithTutor(request, projectId, geminiKey) {
  try { await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const data = await request.json().catch(() => ({}));
  const { history, gradeLevel, weakestSubject } = data;
  if (!Array.isArray(history) || history.length === 0) return errorJson("Missing conversation history.", 400);

  const gradeWord = GRADE_WORDS[gradeLevel] || "a";
  const weakNote = weakestSubject
    ? ` The student's own data shows ${weakestSubject} tends to be a weaker subject for them, which might be relevant context, but only bring it up if it's actually relevant to what they're asking.`
    : "";
  const systemText = `You are a warm, patient AI tutor chatting with ${gradeWord} student inside a study app called version5.${weakNote} Explain concepts clearly and simply for their level, be encouraging, and keep replies conversational and fairly short (a few sentences, not an essay) unless they explicitly ask for more depth. If it seems like they've understood, you can mention they can tap "Give me a practice question" below your message to try one.

Stay focused on schoolwork, studying, and this app — that's what you're here for. A little friendly small talk is fine (saying hi, a quick "how are you," a question about how a feature works), and don't be preachy about it. But if someone asks for something that has nothing to do with learning or homework — writing unrelated stories, help with something totally off-topic, etc. — briefly and kindly note that you're set up to help with studying, and steer the conversation back to what they're working on, rather than fully going along with the off-topic request.`;

  const contents = [
    { role: "user", parts: [{ text: systemText }] },
    { role: "model", parts: [{ text: "Understood — I'm ready to help them." }] },
    ...history.map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] }))
  ];

  try {
    const text = await callGemini(geminiKey, contents, { maxOutputTokens: 300, temperature: 0.7 });
    return json({ reply: text.trim() });
  } catch (err) {
    if (err.status === 429) return errorJson("The AI Tutor is at its usage limit for now — try again in a bit.", 429);
    return errorJson("Couldn't reach the tutor right now.", 500);
  }
}

async function handleGeneratePracticeQuestion(request, projectId, geminiKey) {
  try { await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

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
    const text = await callGemini(geminiKey, [{ role: "user", parts: [{ text: prompt }] }], { maxOutputTokens: 350, temperature: 0.6 });
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

async function handleAnalyzeHomeworkPhoto(request, projectId, geminiKey, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const userData = await getFirestoreDocument(projectId, serviceAccount, "users", auth.uid);
  if (!userData || !userData.isUltra) return errorJson("Photo homework analysis is an Ultra feature.", 403);

  const data = await request.json().catch(() => ({}));
  const { imageBase64, mimeType, subject, gradeLevel } = data;
  if (!imageBase64) return errorJson("Missing imageBase64.", 400);
  if (imageBase64.length > 8000000) return errorJson("That image is too large. Try a smaller photo or a tighter crop.", 400);

  const gradeWord = GRADE_WORDS[gradeLevel] || "a";
  const prompt = `You are a patient, encouraging tutor reviewing a photo of ${gradeWord} student's ${subject || "school"} work.

Look at the work in the photo and:
1. Identify what the student got right.
2. Identify specific mistakes or weak spots — be precise about which part of the work is wrong, not just "some errors."
3. Explain clearly how to fix each mistake, at a level this student can follow.

If the photo is unreadable, too blurry, or doesn't show clear schoolwork, say so plainly instead of guessing. Keep the whole response conversational and encouraging — a few short paragraphs, not a rigid list with headers.`;

  const contents = [{
    role: "user",
    parts: [{ text: prompt }, { inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } }]
  }];

  try {
    const text = await callGemini(geminiKey, contents, { maxOutputTokens: 500, temperature: 0.4 });
    return json({ analysis: text.trim() });
  } catch (err) {
    if (err.status === 429) return errorJson("The photo analyzer is at its usage limit for now — try again in a bit.", 429);
    console.error("analyzeHomeworkPhoto error:", err.message);
    return errorJson("Couldn't analyze that photo right now. Please try again.", 500);
  }
}

// ---------- Router — this is the val's HTTP entry point ----------

// ---------- Stripe: subscriptions, coin packs ----------

const PRODUCT_CONFIG = {
  proMonthly: { priceEnvKey: "STRIPE_PRICE_ID_PRO_MONTHLY", mode: "subscription" },
  proYearly: { priceEnvKey: "STRIPE_PRICE_ID_PRO_YEARLY", mode: "subscription" },
  ultraMonthly: { priceEnvKey: "STRIPE_PRICE_ID_ULTRA_MONTHLY", mode: "subscription" },
  ultraYearly: { priceEnvKey: "STRIPE_PRICE_ID_ULTRA_YEARLY", mode: "subscription" },
  coins1000: { priceEnvKey: "STRIPE_PRICE_ID_COINS_1000", mode: "payment", coinAmount: 1000 },
  coins5000: { priceEnvKey: "STRIPE_PRICE_ID_COINS_5000", mode: "payment", coinAmount: 5000 },
  coins10000: { priceEnvKey: "STRIPE_PRICE_ID_COINS_10000", mode: "payment", coinAmount: 10000 }
};

// Trusted server-side catalog for gifting / real-money individual item
// purchases. MAINTENANCE WARNING: keep this in sync with js/shop.js's
// SHOP_ITEMS by hand — there's no way to share this data between the
// two codebases.
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

function coinsToCents(coins) {
  return Math.round(coins); // 100 coins = $1.00
}

function getStripeClient(secretKey) {
  return new Stripe(secretKey, { httpClient: Stripe.createFetchHttpClient() });
}

async function handleCreateCheckoutSession(request, projectId, stripeSecretKey) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in to purchase.", 401); }

  const stripe = getStripeClient(stripeSecretKey);
  const data = await request.json().catch(() => ({}));
  const { successUrl, cancelUrl, productType } = data;
  if (!successUrl || !cancelUrl || !productType) return errorJson("Missing successUrl, cancelUrl, or productType.", 400);

  const config = PRODUCT_CONFIG[productType];
  if (!config) return errorJson("Unknown productType: " + productType, 400);
  const priceId = Deno.env.get(config.priceEnvKey);
  if (!priceId) return errorJson("This product isn't configured yet (missing " + config.priceEnvKey + ").", 500);

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

async function handleCreateItemCheckoutSession(request, projectId, stripeSecretKey) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in to purchase.", 401); }

  const stripe = getStripeClient(stripeSecretKey);
  const data = await request.json().catch(() => ({}));
  const { itemId, successUrl, cancelUrl } = data;
  const item = GIFTABLE_ITEMS[itemId];
  if (!item) return errorJson("Unknown item: " + itemId, 400);
  if (!successUrl || !cancelUrl) return errorJson("Missing successUrl or cancelUrl.", 400);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: { currency: "usd", product_data: { name: "version5 — " + itemId }, unit_amount: coinsToCents(item.costCoins) },
        quantity: 1
      }],
      client_reference_id: auth.uid,
      metadata: { productType: "shopItemRealMoney", itemId },
      success_url: successUrl,
      cancel_url: cancelUrl
    });
    return json({ url: session.url });
  } catch (err) {
    console.error("Item checkout session error:", err.message);
    return errorJson("Couldn't start checkout right now. Please try again.", 500);
  }
}

async function handleStripeWebhook(request, projectId, stripeSecretKey, webhookSecret, serviceAccount) {
  const stripe = getStripeClient(stripeSecretKey);
  const sig = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  let event;
  try {
    const cryptoProvider = Stripe.createSubtleCryptoProvider();
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, webhookSecret, undefined, cryptoProvider);
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
      await incrementFirestoreField(projectId, serviceAccount, "users", userId, "coins", config.coinAmount);
      console.log(`User ${userId} purchased ${config.coinAmount} coins (${productType}).`);
      if (productType === "coins5000") {
        await grantCosmeticServerSide(projectId, serviceAccount, "users", userId, "avatarIcons", "dragon");
        await grantCosmeticServerSide(projectId, serviceAccount, "users", userId, "frames", "fire");
      }
      if (productType === "coins10000") {
        await grantCosmeticServerSide(projectId, serviceAccount, "users", userId, "avatarIcons", "wizard");
        await grantCosmeticServerSide(projectId, serviceAccount, "users", userId, "frames", "ice");
        await grantCosmeticServerSide(projectId, serviceAccount, "users", userId, "decorations", "star");
        await grantCosmeticServerSide(projectId, serviceAccount, "users", userId, "nameplates", "shadow");
      }
    } else if (userId && productType === "shopItemRealMoney") {
      const itemId = session.metadata && session.metadata.itemId;
      const item = GIFTABLE_ITEMS[itemId];
      if (item) await grantCosmeticServerSide(projectId, serviceAccount, "users", userId, item.cosmeticCategory, item.cosmeticId);
    } else if (userId && productType && productType.startsWith("ultra")) {
      await updateFirestoreDocument(projectId, serviceAccount, "users", userId, { isPro: true, isUltra: true, stripeCustomerId: session.customer });
    } else if (userId && productType && productType.startsWith("pro")) {
      await updateFirestoreDocument(projectId, serviceAccount, "users", userId, { isPro: true, stripeCustomerId: session.customer });
    } else if (userId) {
      await updateFirestoreDocument(projectId, serviceAccount, "users", userId, { isPro: true, stripeCustomerId: session.customer });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object;
    const match = await findFirestoreDocByField(projectId, serviceAccount, "users", "stripeCustomerId", subscription.customer);
    if (match) await updateFirestoreDocument(projectId, serviceAccount, "users", match.id, { isPro: false, isUltra: false });
  }

  return json({ received: true });
}

async function handleGiftItem(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in to send a gift.", 401); }

  const data = await request.json().catch(() => ({}));
  const { itemId, recipientEmail } = data;
  const item = GIFTABLE_ITEMS[itemId];
  if (!item) return errorJson("Unknown or non-giftable item: " + itemId, 400);
  if (!recipientEmail) return errorJson("Missing recipientEmail.", 400);

  const sender = await getFirestoreDocument(projectId, serviceAccount, "users", auth.uid);
  if (!sender) return errorJson("Couldn't find your account.", 404);
  if (item.requiresTier === "ultra" && !sender.isUltra) return errorJson("That item is Ultra-exclusive.", 403);
  if (item.requiresTier === "pro" && !sender.isPro && !sender.isUltra) return errorJson("That item is Pro-exclusive.", 403);
  if ((sender.coins || 0) < item.costCoins) return errorJson("You don't have enough coins for that gift.", 400);

  const recipientMatch = await findFirestoreDocByField(projectId, serviceAccount, "users", "email", recipientEmail.trim().toLowerCase());
  if (!recipientMatch) return errorJson("No version5 account found with that email.", 404);
  if (recipientMatch.id === auth.uid) return errorJson("You can't gift an item to yourself.", 400);

  await updateFirestoreDocument(projectId, serviceAccount, "users", auth.uid, { coins: (sender.coins || 0) - item.costCoins });
  await grantCosmeticServerSide(projectId, serviceAccount, "users", recipientMatch.id, item.cosmeticCategory, item.cosmeticId);

  return json({ success: true, message: `Gift sent to ${recipientEmail}!` });
}

async function handleGiftCoins(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in to send a gift.", 401); }

  const data = await request.json().catch(() => ({}));
  const { coinAmount, recipientEmail } = data;
  const amount = parseInt(coinAmount, 10);
  if (!amount || amount <= 0) return errorJson("Invalid coin amount.", 400);
  if (!recipientEmail) return errorJson("Missing recipientEmail.", 400);

  const sender = await getFirestoreDocument(projectId, serviceAccount, "users", auth.uid);
  if (!sender) return errorJson("Couldn't find your account.", 404);
  if ((sender.coins || 0) < amount) return errorJson("You don't have enough coins for that gift.", 400);

  const recipientMatch = await findFirestoreDocByField(projectId, serviceAccount, "users", "email", recipientEmail.trim().toLowerCase());
  if (!recipientMatch) return errorJson("No version5 account found with that email.", 404);
  if (recipientMatch.id === auth.uid) return errorJson("You can't gift coins to yourself.", 400);

  await updateFirestoreDocument(projectId, serviceAccount, "users", auth.uid, { coins: (sender.coins || 0) - amount });
  await incrementFirestoreField(projectId, serviceAccount, "users", recipientMatch.id, "coins", amount);

  return json({ success: true, message: `${amount} coins sent to ${recipientEmail}!` });
}

// ------------------------------------------------------------------
// Admin override.
//
// SECURITY: authorization happens ONLY here, server-side, by checking
// the caller's verified email against a list configured as a secret
// (ADMIN_EMAILS) — never trust a client-side "am I admin" flag, since
// that could be trivially forged. Set this secret with:
//   wrangler secret put ADMIN_EMAILS     (Cloudflare)
//   or add ADMIN_EMAILS as a Val Town environment variable
// Comma-separated if you want more than one admin.
// ------------------------------------------------------------------
async function handleAdminGrant(request, projectId, serviceAccount, adminEmailsRaw) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const adminEmails = (adminEmailsRaw || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
  if (!auth.email || !adminEmails.includes(auth.email.toLowerCase())) {
    return errorJson("You're not authorized to use the admin panel.", 403);
  }

  const data = await request.json().catch(() => ({}));
  const { targetEmail, isPro, isUltra, coinsToAdd } = data;
  if (!targetEmail) return errorJson("Missing targetEmail.", 400);

  const targetMatch = await findFirestoreDocByField(projectId, serviceAccount, "users", "email", targetEmail.trim().toLowerCase());
  if (!targetMatch) return errorJson("No version5 account found with that email.", 404);

  const updates = {};
  if (typeof isPro === "boolean") updates.isPro = isPro;
  if (typeof isUltra === "boolean") updates.isUltra = isUltra;
  if (Object.keys(updates).length > 0) {
    await updateFirestoreDocument(projectId, serviceAccount, "users", targetMatch.id, updates);
  }
  if (coinsToAdd && parseInt(coinsToAdd, 10) !== 0) {
    await incrementFirestoreField(projectId, serviceAccount, "users", targetMatch.id, "coins", parseInt(coinsToAdd, 10));
  }

  return json({ success: true, message: `Updated ${targetEmail}.` });
}

export default async function (request) {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  const serviceAccount = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");
  const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY");
  const stripeWebhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/+/, "");

  try {
    if (path === "getHint") return await handleGetHint(request, projectId, geminiKey);
    if (path === "getHint") return await handleGetHint(request, projectId, geminiKey);
    if (path === "generateTutorExplanation") return await handleGenerateTutorExplanation(request, projectId, geminiKey);
    if (path === "chatWithTutor") return await handleChatWithTutor(request, projectId, geminiKey);
    if (path === "generatePracticeQuestion") return await handleGeneratePracticeQuestion(request, projectId, geminiKey);
    if (path === "analyzeHomeworkPhoto") return await handleAnalyzeHomeworkPhoto(request, projectId, geminiKey, serviceAccount);
    if (path === "createCheckoutSession") return await handleCreateCheckoutSession(request, projectId, stripeSecretKey);
    if (path === "createItemCheckoutSession") return await handleCreateItemCheckoutSession(request, projectId, stripeSecretKey);
    if (path === "stripeWebhook") return await handleStripeWebhook(request, projectId, stripeSecretKey, stripeWebhookSecret, serviceAccount);
    if (path === "giftItem") return await handleGiftItem(request, projectId, serviceAccount);
    if (path === "giftCoins") return await handleGiftCoins(request, projectId, serviceAccount);
    if (path === "adminGrant") return await handleAdminGrant(request, projectId, serviceAccount, Deno.env.get("ADMIN_EMAILS"));
    return errorJson("Unknown endpoint: " + path, 404);
  } catch (err) {
    console.error("Unhandled error on " + path + ":", err.message);
    return errorJson("Something went wrong. Please try again.", 500);
  }
}
