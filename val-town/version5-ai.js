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

export default async function (request) {
  if (request.method === "OPTIONS") return new Response(null, { headers: CORS_HEADERS });

  const projectId = Deno.env.get("FIREBASE_PROJECT_ID");
  const geminiKey = Deno.env.get("GEMINI_API_KEY");
  const serviceAccount = Deno.env.get("FIREBASE_SERVICE_ACCOUNT");

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/+/, "");

  try {
    if (path === "getHint") return await handleGetHint(request, projectId, geminiKey);
    if (path === "getHint") return await handleGetHint(request, projectId, geminiKey);
    if (path === "generateTutorExplanation") return await handleGenerateTutorExplanation(request, projectId, geminiKey);
    if (path === "chatWithTutor") return await handleChatWithTutor(request, projectId, geminiKey);
    if (path === "generatePracticeQuestion") return await handleGeneratePracticeQuestion(request, projectId, geminiKey);
    if (path === "analyzeHomeworkPhoto") return await handleAnalyzeHomeworkPhoto(request, projectId, geminiKey, serviceAccount);
    return errorJson("Unknown endpoint: " + path, 404);
  } catch (err) {
    console.error("Unhandled error on " + path + ":", err.message);
    return errorJson("Something went wrong. Please try again.", 500);
  }
}
