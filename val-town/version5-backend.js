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

// Creates a new document with an auto-generated ID (POST to the
// collection, no docId in the URL) — used for clans, where the ID
// isn't known ahead of time the way it is for a user's own uid-keyed
// document.
async function createFirestoreDocument(projectId, serviceAccountJson, collection, data) {
  const accessToken = await getFirestoreAccessToken(serviceAccountJson);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}`;
  const fields = {};
  for (const [k, v] of Object.entries(data)) fields[k] = toFirestoreValue(v);
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ fields })
  });
  if (!response.ok) throw new Error("Firestore create failed: " + (await response.text()));
  const doc = await response.json();
  return { id: doc.name.split("/").pop() };
}

async function deleteFirestoreDocument(projectId, serviceAccountJson, collection, docId) {
  const accessToken = await getFirestoreAccessToken(serviceAccountJson);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  const response = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok && response.status !== 404) throw new Error("Firestore delete failed: " + (await response.text()));
}

// Lists documents in a collection (no filter) — used for browsing all
// clans. Capped by `limit` since this is a full collection scan, not
// a query; fine for a small number of clans, not meant to scale to a
// huge collection.
async function listFirestoreDocuments(projectId, serviceAccountJson, collection, limit) {
  const accessToken = await getFirestoreAccessToken(serviceAccountJson);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}?pageSize=${limit || 50}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error("Firestore list failed: " + (await response.text()));
  const data = await response.json();
  return (data.documents || []).map(doc => {
    const docId = doc.name.split("/").pop();
    const fields = {};
    for (const [k, v] of Object.entries(doc.fields || {})) fields[k] = fromFirestoreValue(v);
    return { id: docId, data: fields };
  });
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

// Like findFirestoreDocByField, but returns every match instead of
// just the first — needed for username lookups specifically, since
// usernames (unlike email) aren't guaranteed unique.
async function findAllFirestoreDocsByField(projectId, serviceAccountJson, collection, field, value, limit) {
  const accessToken = await getFirestoreAccessToken(serviceAccountJson);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: { fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value: toFirestoreValue(value) } },
      limit: limit || 10
    }
  };
  const response = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  if (!response.ok) throw new Error("Firestore query failed: " + (await response.text()));
  const results = await response.json();
  return results.filter(r => r.document).map(r => {
    const docId = r.document.name.split("/").pop();
    const fields = {};
    for (const [k, v] of Object.entries(r.document.fields || {})) fields[k] = fromFirestoreValue(v);
    return { id: docId, data: fields };
  });
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

// WHY THIS LOOKS THE WAY IT DOES: Gemini 3 "thinking" models spend
// part of maxOutputTokens on hidden reasoning ("thought" tokens) before
// writing the visible answer. With a small limit (e.g. 500 for a hint)
// the thinking could use almost all of it — Kiwi's hint came back cut
// off mid-sentence, and the tutor chat sometimes got NO visible text at
// all, which used to throw "No text in Gemini response" and surface to
// the student as an HTTP 500. The fix has three parts:
//   1. Ask for minimal thinking (thinkingConfig.thinkingLevel) — these
//      are short, friendly explanations, not hard reasoning tasks.
//   2. Read ALL visible text parts (skipping `thought: true` parts)
//      instead of only parts[0].
//   3. If the answer still comes back empty or cut off (MAX_TOKENS),
//      retry once with double the token budget before giving up.
// If the model ever rejects thinkingConfig (400), the call is retried
// once without it, so an API change can't take every AI feature down.
const GEMINI_THINKING_LEVEL = "minimal";

function extractGeminiText(data) {
  const candidate = data?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  const text = parts.filter(p => typeof p.text === "string" && !p.thought).map(p => p.text).join("").trim();
  return { text, finishReason: candidate?.finishReason || null, usage: data?.usageMetadata || null };
}

async function postGemini(apiKey, contents, generationConfig) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  return fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({ contents, generationConfig })
  });
}

async function callGemini(apiKey, contents, generationConfig, trimIncompleteSentence = false) {
  let config = { ...generationConfig, thinkingConfig: { thinkingLevel: GEMINI_THINKING_LEVEL } };
  let result = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    let response = await postGemini(apiKey, contents, config);
    if (response.status === 400 && config.thinkingConfig) {
      // The model didn't accept thinkingConfig — retry once without it.
      const errText = await response.text().catch(() => "");
      console.error("Gemini rejected thinkingConfig, retrying without it:", errText.slice(0, 300));
      config = { ...config };
      delete config.thinkingConfig;
      response = await postGemini(apiKey, contents, config);
    }
    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      console.error("Gemini API error:", response.status, errText.slice(0, 500));
      const err = new Error("Gemini API error " + response.status);
      err.status = response.status;
      throw err;
    }
    result = extractGeminiText(await response.json());
    const cutOff = result.finishReason === "MAX_TOKENS";
    if (result.text && !cutOff) return result.text;
    console.warn("Gemini reply empty or cut off", JSON.stringify({ attempt, finishReason: result.finishReason, usage: result.usage }));
    // Give the retry twice the room — thinking tokens count against it.
    config = { ...config, maxOutputTokens: (config.maxOutputTokens || 1024) * 2 };
  }

  if (!result || !result.text) {
    const err = new Error("No text in Gemini response");
    err.status = 502;
    throw err;
  }
  // Still cut off after the retry. For plain-text replies, trim back to
  // the last complete sentence; if there isn't one, report failure
  // rather than show a fragment. JSON callers (practice questions,
  // study courses) never opt in, so their JSON.parse surfaces it.
  if (trimIncompleteSentence) {
    const t = result.text;
    const lastSentenceEnd = Math.max(t.lastIndexOf("."), t.lastIndexOf("!"), t.lastIndexOf("?"));
    if (lastSentenceEnd > 0) return t.slice(0, lastSentenceEnd + 1);
    const err = new Error("Gemini reply was cut off before a full sentence");
    err.status = 502;
    throw err;
  }
  return result.text;
}

// ---------- Endpoint handlers ----------

// "Kiwi" (the kiwi bird mascot) gives a nudge-style HINT before the
// student has answered — deliberately different from
// generateTutorExplanation above, which explains the correct answer
// AFTER they've already answered. This one must never reveal which
// option is correct.
// Kiwi's hint: teach the METHOD, not just point at it. Earlier
// versions gave vague meta-nudges ("focus on this part of the
// question," "ask yourself what's being tested") without actually
// showing HOW to approach it — reported back as "still bad, not
// helpful." The fix: explain the actual technique or formula, using
// a concrete example or analogy with DIFFERENT numbers than the
// question itself (fractions as pie slices, etc.) — genuinely useful
// the way a good teacher's hint is, while still stopping short of
// plugging the question's own numbers into that method for them.
// Two layers of protection against accidentally giving away the
// answer regardless: the prompt itself forbids it, AND the response
// is checked afterward for whether it happens to contain one of the
// answer options verbatim — if so, it's discarded in favor of a safe
// generic fallback rather than shown as-is. Prompting alone failed
// the same way the pre-question concept card once did (see
// renderQuestion in app.js), so this doesn't rely on the model's word
// alone a second time.
async function handleGetHint(request, projectId, geminiKey) {
  try { await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const data = await request.json().catch(() => ({}));
  const { question, options, subject, gradeLevel } = data;
  if (!question) return errorJson("Missing question.", 400);

  const gradeWord = GRADE_WORDS[gradeLevel] || "a";
  const prompt = `You are Kiwi, a friendly, encouraging kiwi bird mascot helping ${gradeWord} student who's stuck on a ${subject || "school"} question.

Question: ${question}
${options ? "Options: " + options.join(", ") : ""}

Give a genuinely useful hint that actually teaches the method, not a vague nudge. In 3-5 short sentences:
1. Name the specific concept, formula, or technique this question is testing.
2. Explain HOW that technique works, using a small concrete example or a vivid analogy — with DIFFERENT numbers or a different scenario than the actual question above (e.g., for a fractions question, you might explain adding fractions using a pizza-slices example with different numbers, or for an algebra question, walk through the same TYPE of equation with different values). This is the heart of the hint — a real, worked-through explanation of the approach, not just a pointer toward it.
3. Tell them to apply that same method to the numbers/details in their own question.

Rules: don't say which option is correct, don't perform the final calculation for THIS question's own numbers or arrive at this question's answer yourself, and don't restate any of the answer options as part of your hint — but DO fully work through an example calculation using different numbers, since that's what makes the hint actually useful. Warm and encouraging tone, no headers or lists, plain sentences. Every sentence must be real, substantive help toward the question above — never filler, never a bird-call or animal sound ("hoot hoot" and similar), never a greeting or exclamation with no content, and never padding just to sound in-character. Write only in plain text — never use LaTeX or dollar-sign math notation (like $7$ or \\times); write any math the normal way (like 7 x 8), since this is shown as plain text and math notation would display as broken symbols.`;

  try {
    const text = await callGemini(geminiKey, [{ role: "user", parts: [{ text: prompt }] }], { maxOutputTokens: 500, temperature: 0.7 }, true);
    const hint = text.trim();

    // Safety net: if the hint happens to contain one of the actual
    // options verbatim (case-insensitive, ignoring surrounding
    // punctuation), it's treated as a leak regardless of how it got
    // there, and replaced with a safe fallback instead of shown.
    const normalize = (s) => s.toLowerCase().replace(/[^\w\s]/g, "").trim();
    const hintNormalized = normalize(hint);
    const leaked = Array.isArray(options) && options.some(opt => {
      const optNormalized = normalize(opt);
      return optNormalized.length > 1 && hintNormalized.includes(optNormalized);
    });

    if (leaked) {
      return json({ hint: "Take a closer look at exactly what the question is asking, and rule out any options that clearly don't fit before picking one." });
    }

    // Second safety net: a hint with almost no actual words (an
    // exclamation, a bird-call, a bare greeting) passed the leak
    // check above trivially — it has nothing in it to leak — but is
    // just as useless to the student. Word count, not character
    // count, since "Hoot hoot hoot!" is long enough in characters to
    // slip past a length check but contains zero real content.
    const wordCount = hint.split(/\s+/).filter(Boolean).length;
    if (wordCount < 8) {
      return json({ hint: "Start by identifying exactly what the question is asking for, then think about which concept or formula applies here." });
    }

    return json({ hint });
  } catch (err) {
    if (err.status === 429) return errorJson("Kiwi is a little busy right now — try again in a bit.", 429);
    return errorJson("Kiwi couldn't come up with a hint right now.", 500);
  }
}

// ------------------------------------------------------------------
// Study Mode (Pro/Ultra only) — an AI-generated custom course.
//
// Reuses the exact same chapter > lesson > question shape as the
// hand-written Quests content, so it can plug into the existing
// roadmap/quiz rendering without a parallel UI system. The trade-off
// of generating a full 5-chapter course in one call is real: it's a
// much bigger ask of Gemini than a single question, so validation
// here is strict — a malformed course is rejected outright rather
// than rendered half-broken.
// ------------------------------------------------------------------
// Fetches ONLY the courseName + chapters of another user's Study Mode
// course, for the "share via link" feature — deliberately not a
// general-purpose user-document reader, so a shared link can never
// expose anything else about the sharer's account.
async function handleGetSharedStudyCourse(request, projectId, serviceAccount) {
  try { await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const data = await request.json().catch(() => ({}));
  const { creatorUid } = data;
  if (!creatorUid) return errorJson("Missing creatorUid.", 400);

  const creator = await getFirestoreDocument(projectId, serviceAccount, "users", creatorUid);
  if (!creator || !creator.studyModeCourse) return errorJson("That shared course couldn't be found — the link may be broken or the course deleted.", 404);

  return json({
    course: creator.studyModeCourse,
    sharedByName: creator.name || "A version5 student"
  });
}

async function handleGenerateStudyCourse(request, projectId, geminiKey, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const userData = await getFirestoreDocument(projectId, serviceAccount, "users", auth.uid);
  if (!userData || !hasActivePro(userData)) return errorJson("Study Mode is a Pro/Ultra feature.", 403);

  const data = await request.json().catch(() => ({}));
  const { curriculum, gradeLevel } = data;
  if (!curriculum) return errorJson("Missing curriculum.", 400);

  const gradeWord = GRADE_WORDS[gradeLevel] || "a";
  const prompt = `Design a short custom study course for ${gradeWord} student, tailored to this description of what they want to learn and their curriculum:

"${curriculum}"

Build exactly 5 chapters, each covering one topic, ordered from easier to harder so the difficulty ramps up gradually. Each chapter has exactly 2 lessons named "Part 1" and "Part 2" (Part 1 slightly easier, building toward Part 2). Each lesson has exactly 3 multiple-choice questions, each with exactly 4 options.

Respond with ONLY raw JSON, no markdown formatting, no code fences, in exactly this shape:
{
  "courseName": "short course title",
  "chapters": [
    {
      "name": "Chapter topic name",
      "lessons": [
        { "name": "Part 1", "questions": [ { "q": "...", "options": ["...","...","...","..."], "correct": 0, "explanation": "..." }, ... 3 total ] },
        { "name": "Part 2", "questions": [ ... 3 total ] }
      ]
    }
    ... 5 chapters total
  ]
}
"correct" is the 0-based index of the right option within "options". Every question needs a real, accurate explanation. Write all text in plain text only — never use LaTeX or dollar-sign math notation (like $7$ or \\times); write any math the normal way (like 7 x 8), since this is shown as plain text and math notation would display as broken symbols.`;

  try {
    const text = await callGemini(geminiKey, [{ role: "user", parts: [{ text: prompt }] }], { maxOutputTokens: 12000, temperature: 0.6 });
    const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "");
    const course = JSON.parse(cleaned);

    // Strict validation — a generated course this large has a real
    // chance of coming back malformed, and a broken course would
    // break the roadmap it plugs into, not just show a blank message.
    if (!course.courseName || !Array.isArray(course.chapters) || course.chapters.length === 0) {
      throw new Error("Missing courseName or chapters");
    }
    course.chapters.forEach((ch, ci) => {
      if (!ch.name || !Array.isArray(ch.lessons) || ch.lessons.length === 0) {
        throw new Error(`Chapter ${ci} missing name or lessons`);
      }
      ch.lessons.forEach((lesson, li) => {
        if (!lesson.name || !Array.isArray(lesson.questions) || lesson.questions.length === 0) {
          throw new Error(`Chapter ${ci} lesson ${li} missing name or questions`);
        }
        lesson.questions.forEach((q, qi) => {
          if (!q.q || !Array.isArray(q.options) || q.options.length !== 4
            || typeof q.correct !== "number" || q.correct < 0 || q.correct > 3 || !q.explanation) {
            throw new Error(`Chapter ${ci} lesson ${li} question ${qi} malformed`);
          }
        });
      });
    });

    return json({ course });
  } catch (err) {
    console.error("generateStudyCourse error:", err.message);
    return errorJson("Couldn't generate a course right now — try rephrasing what you're looking for, or try again in a moment.", 500);
  }
}

// After finishing a generated course, a short AI-written summary of
// what to focus on next — using the student's own per-chapter
// accuracy, not a generic "great job" message.
async function handleGenerateStudyModeFeedback(request, projectId, geminiKey) {
  try { await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const data = await request.json().catch(() => ({}));
  const { courseName, performanceSummary, gradeLevel } = data;
  if (!performanceSummary) return errorJson("Missing performanceSummary.", 400);

  const gradeWord = GRADE_WORDS[gradeLevel] || "a";
  const prompt = `${gradeWord} student just finished a custom study course called "${courseName || "their course"}". Here's how they did, chapter by chapter:

${performanceSummary}

Write a short, encouraging summary (3-5 sentences) of how they did overall, and specifically call out which topic(s) they should practice more, based on where their accuracy was lowest. Be specific about the weak topic(s), not generic. No headers or bullet points, just warm, direct sentences. Write only in plain text — never use LaTeX or dollar-sign math notation (like $7$ or \\times); write any math the normal way (like 7 x 8), since this is shown as plain text and math notation would display as broken symbols.`;

  try {
    const text = await callGemini(geminiKey, [{ role: "user", parts: [{ text: prompt }] }], { maxOutputTokens: 800, temperature: 0.7 }, true);
    return json({ feedback: text.trim() });
  } catch (err) {
    if (err.status === 429) return errorJson("The AI is a little busy right now — try again in a bit.", 429);
    return errorJson("Couldn't generate feedback right now.", 500);
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

Explain WHY the correct answer is right, in 2-4 short sentences a student at this level can follow. If they got it wrong, briefly and kindly note what might have led to their answer. Do not just restate the question. Keep it warm and simple, no headers or bullet points, just plain sentences. Write only in plain text — never use LaTeX or dollar-sign math notation (like $7$ or \\times); write any math the normal way (like 7 x 8), since this is shown as plain text and math notation would display as broken symbols.`;

  try {
    const text = await callGemini(geminiKey, [{ role: "user", parts: [{ text: prompt }] }], { maxOutputTokens: 700, temperature: 0.7 }, true);
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

Stay focused on schoolwork, studying, and this app — that's what you're here for. A little friendly small talk is fine (saying hi, a quick "how are you," a question about how a feature works), and don't be preachy about it. But if someone asks for something that has nothing to do with learning or homework — writing unrelated stories, help with something totally off-topic, etc. — briefly and kindly note that you're set up to help with studying, and steer the conversation back to what they're working on, rather than fully going along with the off-topic request.

Write only in plain text — never use LaTeX or dollar-sign math notation (like $7$ or \\times); write any math the normal way (like 7 x 8), since this is shown as plain text and math notation would display as broken symbols.`;

  const contents = [
    { role: "user", parts: [{ text: systemText }] },
    { role: "model", parts: [{ text: "Understood — I'm ready to help them." }] },
    ...history.map(m => ({ role: m.role === "user" ? "user" : "model", parts: [{ text: m.text }] }))
  ];

  try {
    const text = await callGemini(geminiKey, contents, { maxOutputTokens: 1200, temperature: 0.7 }, true);
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
"correct" is the 0-based index of the right option within "options". Write all text in plain text only — never use LaTeX or dollar-sign math notation (like $7$ or \\times); write any math the normal way (like 7 x 8), since this is shown as plain text and math notation would display as broken symbols.`;

  try {
    const text = await callGemini(geminiKey, [{ role: "user", parts: [{ text: prompt }] }], { maxOutputTokens: 900, temperature: 0.6 });
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

If the photo is unreadable, too blurry, or doesn't show clear schoolwork, say so plainly instead of guessing. Keep the whole response conversational and encouraging — a few short paragraphs, not a rigid list with headers. Write only in plain text — never use LaTeX or dollar-sign math notation (like $7$ or \\times); write any math the normal way (like 7 x 8), since this is shown as plain text and math notation would display as broken symbols.`;

  const contents = [{
    role: "user",
    parts: [{ text: prompt }, { inline_data: { mime_type: mimeType || "image/jpeg", data: imageBase64 } }]
  }];

  try {
    const text = await callGemini(geminiKey, contents, { maxOutputTokens: 1500, temperature: 0.4 }, true);
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
    } else if (userId && productType === "clanPurchase") {
      const clanName = session.metadata && session.metadata.clanName;
      const me = await getFirestoreDocument(projectId, serviceAccount, "users", userId);
      // Re-check both conditions at fulfillment time, not just at
      // checkout-session-creation time — several minutes can pass
      // during actual checkout, in which time the user could have
      // joined another clan, or someone else could have taken the
      // name via the coin-payment path. If either happened, this
      // logs it for manual follow-up (a refund) rather than silently
      // creating a broken second clan or overwriting someone's
      // membership.
      if (me && !me.clanId && clanName) {
        const existing = await findFirestoreDocByField(projectId, serviceAccount, "clans", "name", clanName);
        if (!existing) {
          const clanRef = await createFirestoreDocument(projectId, serviceAccount, "clans", {
            name: clanName,
            ownerUid: userId,
            ownerName: me.name || "Student",
            memberUids: [userId],
            members: [{ uid: userId, name: me.name || "Student" }],
            createdAt: new Date().toISOString()
          });
          await updateFirestoreDocument(projectId, serviceAccount, "users", userId, { clanId: clanRef.id, clanName: clanName });
          console.log(`User ${userId} purchased and created clan "${clanName}" for $6.49.`);
        } else {
          console.error(`Clan purchase fulfillment issue: name "${clanName}" was taken before payment completed for user ${userId} — needs a manual refund.`);
        }
      } else if (me && me.clanId) {
        console.error(`Clan purchase fulfillment issue: user ${userId} joined another clan before payment completed — needs a manual refund.`);
      }
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

// ------------------------------------------------------------------
// Friends & blocking.
//
// Same reasoning as gifting: adding "me" to someone else's friends
// list means writing to THEIR document, which a client's own auth
// token can't do under normal Firestore rules — so this goes through
// here, using the Worker's privileged access, same as every other
// cross-account action in this app.
// ------------------------------------------------------------------
// ------------------------------------------------------------------
// Clans.
//
// Membership changes (join/leave) write to a clan document the
// requester doesn't own, so — same reasoning as friends/gifting —
// this goes through the Worker's privileged access rather than
// relying on permissive client-side Firestore rules for a shared
// document multiple users need to write to.
// ------------------------------------------------------------------
async function handleCreateClan(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const data = await request.json().catch(() => ({}));
  const name = (data.name || "").trim();
  if (!name) return errorJson("Enter a clan name.", 400);
  if (name.length > 30) return errorJson("Clan name is too long (30 characters max).", 400);

  const me = await getFirestoreDocument(projectId, serviceAccount, "users", auth.uid);
  if (!me) return errorJson("Couldn't find your account.", 404);
  if (me.clanId) return errorJson("You're already in a clan — leave it first.", 400);

  // Ultra members create a clan for free. Everyone else pays with
  // coins here, or real money via handleCreateClanCheckoutSession
  // below — this endpoint only ever handles the free/coin path.
  const isFree = !!me.isUltra;
  if (!isFree && (me.coins || 0) < 10000) {
    return errorJson("Creating a clan costs 10,000 coins (or $6.49, or it's free with Ultra) — you don't have enough coins yet.", 400);
  }

  const existing = await findFirestoreDocByField(projectId, serviceAccount, "clans", "name", name);
  if (existing) return errorJson("A clan with that name already exists.", 409);

  const clanRef = await createFirestoreDocument(projectId, serviceAccount, "clans", {
    name: name,
    ownerUid: auth.uid,
    ownerName: me.name || "Student",
    memberUids: [auth.uid],
    members: [{ uid: auth.uid, name: me.name || "Student" }],
    createdAt: new Date().toISOString()
  });

  const coinsToCharge = isFree ? 0 : 10000;
  await updateFirestoreDocument(projectId, serviceAccount, "users", auth.uid, {
    coins: (me.coins || 0) - coinsToCharge,
    lifetimeCoinsSpent: (me.lifetimeCoinsSpent || 0) + coinsToCharge,
    clanId: clanRef.id,
    clanName: name
  });

  return json({ success: true, clanId: clanRef.id, message: `Clan "${name}" created${isFree ? " — free with Ultra!" : "!"}` });
}

// Real-money alternative to the coin path above — $6.49, still free
// for Ultra (handled entirely by the free path in handleCreateClan,
// so this endpoint is only ever used by non-Ultra members choosing
// to pay cash instead of coins). The clan itself isn't created here —
// only after Stripe confirms payment, in the webhook below, since
// creating it before payment succeeds would let someone back out of
// checkout and keep a clan they never paid for.
async function handleCreateClanCheckoutSession(request, projectId, stripeSecretKey, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const stripe = getStripeClient(stripeSecretKey);
  const data = await request.json().catch(() => ({}));
  const name = (data.clanName || "").trim();
  const { successUrl, cancelUrl } = data;
  if (!name) return errorJson("Enter a clan name.", 400);
  if (name.length > 30) return errorJson("Clan name is too long (30 characters max).", 400);
  if (!successUrl || !cancelUrl) return errorJson("Missing successUrl or cancelUrl.", 400);

  const me = await getFirestoreDocument(projectId, serviceAccount, "users", auth.uid);
  if (!me) return errorJson("Couldn't find your account.", 404);
  if (me.clanId) return errorJson("You're already in a clan — leave it first.", 400);
  if (me.isUltra) return errorJson("Clans are free with Ultra — no need to pay.", 400);

  const existing = await findFirestoreDocByField(projectId, serviceAccount, "clans", "name", name);
  if (existing) return errorJson("A clan with that name already exists.", 409);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{
        price_data: { currency: "usd", product_data: { name: `version5 — Create clan "${name}"` }, unit_amount: 649 },
        quantity: 1
      }],
      client_reference_id: auth.uid,
      metadata: { productType: "clanPurchase", clanName: name },
      success_url: successUrl,
      cancel_url: cancelUrl
    });
    return json({ url: session.url });
  } catch (err) {
    console.error("Clan checkout session error:", err.message);
    return errorJson("Couldn't start checkout right now. Please try again.", 500);
  }
}

async function handleJoinClan(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const data = await request.json().catch(() => ({}));
  const { clanId } = data;
  if (!clanId) return errorJson("Missing clanId.", 400);

  const me = await getFirestoreDocument(projectId, serviceAccount, "users", auth.uid);
  if (!me) return errorJson("Couldn't find your account.", 404);
  if (me.clanId) return errorJson("You're already in a clan — leave it first.", 400);

  const clan = await getFirestoreDocument(projectId, serviceAccount, "clans", clanId);
  if (!clan) return errorJson("That clan doesn't exist anymore.", 404);

  // Requirements an owner can optionally set via handleUpdateClanSettings
  // below — both default to 0 (no requirement) for clans that have
  // never touched this setting, so existing clans keep working exactly
  // as before.
  const myLevel = Math.floor((me.xp || 0) / 1000) + 1;
  const myLessonsCompleted = (me.completedSubjects || []).length;
  if (clan.minLevel && myLevel < clan.minLevel) {
    return errorJson(`This clan requires at least level ${clan.minLevel} to join (you're level ${myLevel}).`, 403);
  }
  if (clan.minLessonsCompleted && myLessonsCompleted < clan.minLessonsCompleted) {
    return errorJson(`This clan requires at least ${clan.minLessonsCompleted} completed lessons to join (you have ${myLessonsCompleted}).`, 403);
  }

  const memberUids = clan.memberUids || [];
  const members = clan.members || [];
  if (!memberUids.includes(auth.uid)) {
    memberUids.push(auth.uid);
    members.push({ uid: auth.uid, name: me.name || "Student" });
  }

  await updateFirestoreDocument(projectId, serviceAccount, "clans", clanId, { memberUids, members });
  await updateFirestoreDocument(projectId, serviceAccount, "users", auth.uid, { clanId: clanId, clanName: clan.name });

  return json({ success: true, message: `You joined "${clan.name}"!` });
}

// Lets a clan's owner set join requirements — a minimum level and/or
// a minimum number of completed lessons. Both optional and default to
// 0 (no requirement, matching every clan's behavior before this
// setting existed). Enforced in handleJoinClan above at the moment
// someone tries to join, not by hiding the clan from listings — it
// still shows up in Browse/the leaderboard either way, just refuses
// the join with a clear reason if the requirement isn't met.
async function handleUpdateClanSettings(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const data = await request.json().catch(() => ({}));
  const me = await getFirestoreDocument(projectId, serviceAccount, "users", auth.uid);
  if (!me) return errorJson("Couldn't find your account.", 404);
  if (!me.clanId) return errorJson("You're not in a clan.", 400);

  const clan = await getFirestoreDocument(projectId, serviceAccount, "clans", me.clanId);
  if (!clan) return errorJson("Your clan doesn't exist anymore.", 404);
  if (clan.ownerUid !== auth.uid) return errorJson("Only the clan owner can change these settings.", 403);

  const minLevel = Math.max(0, parseInt(data.minLevel, 10) || 0);
  const minLessonsCompleted = Math.max(0, parseInt(data.minLessonsCompleted, 10) || 0);

  await updateFirestoreDocument(projectId, serviceAccount, "clans", me.clanId, { minLevel, minLessonsCompleted });
  return json({ success: true, minLevel, minLessonsCompleted, message: "Clan settings updated." });
}

async function handleLeaveClan(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const me = await getFirestoreDocument(projectId, serviceAccount, "users", auth.uid);
  if (!me || !me.clanId) return errorJson("You're not in a clan.", 400);

  const clan = await getFirestoreDocument(projectId, serviceAccount, "clans", me.clanId);
  await updateFirestoreDocument(projectId, serviceAccount, "users", auth.uid, { clanId: null, clanName: null });

  if (clan) {
    const remainingUids = (clan.memberUids || []).filter(uid => uid !== auth.uid);
    const remainingMembers = (clan.members || []).filter(m => m.uid !== auth.uid);
    if (remainingUids.length === 0) {
      await deleteFirestoreDocument(projectId, serviceAccount, "clans", me.clanId);
    } else {
      const updates = { memberUids: remainingUids, members: remainingMembers };
      // If the owner left, hand ownership to whoever's been a member longest.
      if (clan.ownerUid === auth.uid) {
        updates.ownerUid = remainingUids[0];
        updates.ownerName = remainingMembers[0].name;
      }
      await updateFirestoreDocument(projectId, serviceAccount, "clans", me.clanId, updates);
    }
  }

  return json({ success: true, message: "You left the clan." });
}

async function handleListClans(request, projectId, serviceAccount) {
  try { await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }
  const clans = await listFirestoreDocuments(projectId, serviceAccount, "clans", 50);
  return json({
    clans: clans.map(c => ({ id: c.id, name: c.data.name, ownerName: c.data.ownerName, memberCount: (c.data.memberUids || []).length }))
  });
}

// Aggregated on demand from member data rather than maintained as a
// running total on the clan document — the running-total approach
// would need every single XP-earning action anywhere in the app
// (lessons, trivia, duels, team battles, study mode) to
// also write to its clan's document, which is a lot of surface area
// to touch correctly. Computing it at view time instead means one
// read per member per leaderboard view — acceptable for an app this
// size, capped below so a pathological case (huge clans) can't run
// away with the read cost.
async function handleGetClanLeaderboard(request, projectId, serviceAccount) {
  try { await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const clans = await listFirestoreDocuments(projectId, serviceAccount, "clans", 30);
  const results = [];

  for (const clan of clans) {
    const memberUids = (clan.data.memberUids || []).slice(0, 25);
    let totalXp = 0;
    let totalLessons = 0;
    for (const uid of memberUids) {
      const member = await getFirestoreDocument(projectId, serviceAccount, "users", uid);
      if (member) {
        totalXp += member.xp || 0;
        totalLessons += (member.completedSubjects || []).length;
      }
    }
    results.push({
      id: clan.id,
      name: clan.data.name,
      memberCount: (clan.data.memberUids || []).length,
      totalXp,
      totalLessons
    });
  }

  return json({
    byXp: [...results].sort((a, b) => b.totalXp - a.totalXp),
    byLessons: [...results].sort((a, b) => b.totalLessons - a.totalLessons)
  });
}

async function handleAddFriend(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const data = await request.json().catch(() => ({}));
  const { targetEmail } = data;
  if (!targetEmail) return errorJson("Missing targetEmail.", 400);

  const me = await getFirestoreDocument(projectId, serviceAccount, "users", auth.uid);
  if (!me) return errorJson("Couldn't find your account.", 404);

  const targetMatch = await findFirestoreDocByField(projectId, serviceAccount, "users", "email", targetEmail.trim().toLowerCase());
  if (!targetMatch) return errorJson("No version5 account found with that email.", 404);
  if (targetMatch.id === auth.uid) return errorJson("You can't add yourself as a friend.", 400);

  const target = targetMatch.data;
  const myBlocked = me.blockedUsers || [];
  const theirBlocked = target.blockedUsers || [];
  if (myBlocked.some(b => b.uid === targetMatch.id)) return errorJson("You've blocked this account — unblock them first.", 400);
  if (theirBlocked.some(b => b.uid === auth.uid)) return errorJson("This account isn't accepting friend requests from you.", 403);

  const myFriends = me.friends || [];
  const theirFriends = target.friends || [];
  if (!myFriends.some(f => f.uid === targetMatch.id)) myFriends.push({ uid: targetMatch.id, name: target.name || "Student" });
  if (!theirFriends.some(f => f.uid === auth.uid)) theirFriends.push({ uid: auth.uid, name: me.name || "Student" });

  await updateFirestoreDocument(projectId, serviceAccount, "users", auth.uid, { friends: myFriends });
  await updateFirestoreDocument(projectId, serviceAccount, "users", targetMatch.id, { friends: theirFriends });

  return json({ success: true, message: `You and ${target.name || "this user"} are now friends!` });
}

async function handleRemoveFriend(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const data = await request.json().catch(() => ({}));
  const { targetUid } = data;
  if (!targetUid) return errorJson("Missing targetUid.", 400);

  const me = await getFirestoreDocument(projectId, serviceAccount, "users", auth.uid);
  if (!me) return errorJson("Couldn't find your account.", 404);
  const target = await getFirestoreDocument(projectId, serviceAccount, "users", targetUid);

  const myFriends = (me.friends || []).filter(f => f.uid !== targetUid);
  await updateFirestoreDocument(projectId, serviceAccount, "users", auth.uid, { friends: myFriends });

  if (target) {
    const theirFriends = (target.friends || []).filter(f => f.uid !== auth.uid);
    await updateFirestoreDocument(projectId, serviceAccount, "users", targetUid, { friends: theirFriends });
  }

  return json({ success: true, message: "Removed." });
}

// Blocking is unilateral — it doesn't need the other person's
// cooperation, unlike adding a friend. It also removes any existing
// friendship on both sides, since being blocked implies un-friending.
async function handleBlockUser(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const data = await request.json().catch(() => ({}));
  const { targetEmail, targetUid } = data;
  if (!targetEmail && !targetUid) return errorJson("Missing targetEmail or targetUid.", 400);

  const me = await getFirestoreDocument(projectId, serviceAccount, "users", auth.uid);
  if (!me) return errorJson("Couldn't find your account.", 404);

  let targetMatch;
  if (targetUid) {
    const targetData = await getFirestoreDocument(projectId, serviceAccount, "users", targetUid);
    if (!targetData) return errorJson("Couldn't find that account.", 404);
    targetMatch = { id: targetUid, data: targetData };
  } else {
    targetMatch = await findFirestoreDocByField(projectId, serviceAccount, "users", "email", targetEmail.trim().toLowerCase());
    if (!targetMatch) return errorJson("No version5 account found with that email.", 404);
  }
  if (targetMatch.id === auth.uid) return errorJson("You can't block yourself.", 400);

  const myBlocked = me.blockedUsers || [];
  if (!myBlocked.some(b => b.uid === targetMatch.id)) {
    myBlocked.push({ uid: targetMatch.id, name: targetMatch.data.name || "Student" });
  }
  const myFriends = (me.friends || []).filter(f => f.uid !== targetMatch.id);
  await updateFirestoreDocument(projectId, serviceAccount, "users", auth.uid, { blockedUsers: myBlocked, friends: myFriends });

  const theirFriends = (targetMatch.data.friends || []).filter(f => f.uid !== auth.uid);
  await updateFirestoreDocument(projectId, serviceAccount, "users", targetMatch.id, { friends: theirFriends });

  return json({ success: true, message: `${targetMatch.data.name || "That account"} has been blocked.` });
}

async function handleUnblockUser(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const data = await request.json().catch(() => ({}));
  const { targetUid } = data;
  if (!targetUid) return errorJson("Missing targetUid.", 400);

  const me = await getFirestoreDocument(projectId, serviceAccount, "users", auth.uid);
  if (!me) return errorJson("Couldn't find your account.", 404);

  const myBlocked = (me.blockedUsers || []).filter(b => b.uid !== targetUid);
  await updateFirestoreDocument(projectId, serviceAccount, "users", auth.uid, { blockedUsers: myBlocked });

  return json({ success: true, message: "Unblocked." });
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
// Lets the admin search by username instead of only email — since
// usernames aren't unique, this returns every match (name + email +
// uid) so the client can show a picker when there's more than one,
// rather than silently guessing which account was meant.
async function handleAdminFindUsersByUsername(request, projectId, serviceAccount, adminEmailsRaw) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const adminEmails = (adminEmailsRaw || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
  if (!auth.email || !adminEmails.includes(auth.email.toLowerCase())) {
    return errorJson("You're not authorized to use the admin panel.", 403);
  }

  const data = await request.json().catch(() => ({}));
  const { username } = data;
  if (!username) return errorJson("Missing username.", 400);

  const matches = await findAllFirestoreDocsByField(projectId, serviceAccount, "users", "name", username.trim(), 20);
  if (matches.length === 0) return errorJson("No version5 account found with that username.", 404);

  return json({
    matches: matches.map(m => ({ uid: m.id, name: m.data.name || "", email: m.data.email || "(no email on file)" }))
  });
}

async function handleAdminGrant(request, projectId, serviceAccount, adminEmailsRaw) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }

  const adminEmails = (adminEmailsRaw || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
  if (!auth.email || !adminEmails.includes(auth.email.toLowerCase())) {
    return errorJson("You're not authorized to use the admin panel.", 403);
  }

  const data = await request.json().catch(() => ({}));
  const { targetEmail, isPro, isUltra, coinsToAdd, banned, banDurationDays, banReason } = data;
  if (!targetEmail) return errorJson("Missing targetEmail.", 400);

  const targetMatch = await findFirestoreDocByField(projectId, serviceAccount, "users", "email", targetEmail.trim().toLowerCase());
  if (!targetMatch) return errorJson("No version5 account found with that email.", 404);

  const updates = {};
  if (typeof isPro === "boolean") updates.isPro = isPro;
  if (typeof isUltra === "boolean") updates.isUltra = isUltra;
  if (typeof banned === "boolean") {
    updates.banned = banned;
    if (banned) {
      // banDurationDays absent or 0 means permanent (bannedUntil: null).
      updates.bannedUntil = (banDurationDays && banDurationDays > 0)
        ? Date.now() + banDurationDays * 24 * 60 * 60 * 1000
        : null;
      updates.banReason = banReason || "No reason given.";
    } else {
      // Unbanning clears the reason/expiry too, so a later ban starts clean.
      updates.bannedUntil = null;
      updates.banReason = null;
    }
  }
  if (Object.keys(updates).length > 0) {
    await updateFirestoreDocument(projectId, serviceAccount, "users", targetMatch.id, updates);
  }
  if (coinsToAdd && parseInt(coinsToAdd, 10) !== 0) {
    await incrementFirestoreField(projectId, serviceAccount, "users", targetMatch.id, "coins", parseInt(coinsToAdd, 10));
  }

  return json({ success: true, message: `Updated ${targetEmail}.` });
}

// ==================================================================
// Server-side economy.
//
// Coins, Pro/Ultra, owned cosmetics, badge rewards, the daily spin and
// Ultra's daily bonus used to be written straight from the browser,
// which meant anyone could open dev tools and give themselves any of
// them. The Firestore rules (firestore.rules) now block the browser
// from writing those fields at all, and every change to them goes
// through the endpoints below, which apply fixed prices, fixed reward
// amounts and once-per-day limits on the server.
//
// Honest limit: XP, lesson completion and mission PROGRESS are still
// reported by the browser (the README's long-standing "same trust level
// as XP" design). So these endpoints can't prove a mission was really
// completed — but they do cap what can be claimed: each reward once per
// day (missions, spin, Ultra bonus) or once ever (badges), at a fixed
// amount decided here, never a number the browser sends.
// ==================================================================

const ECONOMY_MISSIONS = {
  correctAnswers: { target: 5, reward: 500 },
  questsCompleted: { target: 1, reward: 300 },
  duelsPlayed: { target: 1, reward: 250 },
  hintsUsed: { target: 1, reward: 200 },
  xpEarnedToday: { target: 150, reward: 200 }
};
const ULTRA_DAILY_COINS = 100;
const TEMP_PRO_MS = 24 * 60 * 60 * 1000;

// Must match the slot order in getThemedSpinSlots() in js/shop.js — the
// client animates the wheel to whichever index the server picks.
const SPIN_SLOTS = [
  { type: "nothing" }, { type: "xpBoost" }, { type: "nothing" }, { type: "coins", amount: 500 },
  { type: "nothing" }, { type: "xpBoost" }, { type: "nothing" }, { type: "coins", amount: 500 }
];

// Coin-shop catalog. MAINTENANCE: keep in sync with SHOP_ITEMS and
// ROTATING_EXCLUSIVE_ITEMS in js/shop.js (single cosmetics come from
// GIFTABLE_ITEMS above, which already mirrors the shop).
const SHOP_SPECIAL_ITEMS = {
  "boost-1.5x": { cost: 100, xpBoost: { multiplier: 1.5, usesRemaining: 10 } },
  "boost-3x": { cost: 250, xpBoost: { multiplier: 3, usesRemaining: 10 } },
  "temp-pro-1day": { cost: 5000, tempPro: true },
  "streak-freeze": { cost: 200, streakFreeze: 1 },
  "bundle-starter": { cost: 1000, grants: [["avatarIcons", "phoenix"], ["frames", "gold"], ["nameplates", "gold"]] },
  "bundle-legendary": { cost: 1600, grants: [["avatarIcons", "dragon"], ["frames", "fire"], ["nameplates", "neon"], ["decorations", "crown"]] }
};
const ROTATING_EXCLUSIVE_ITEMS = [
  ["nameplate-frost", 500, "nameplates", "frost"], ["nameplate-ember", 550, "nameplates", "ember"],
  ["nameplate-royal", 500, "nameplates", "royal"], ["nameplate-ocean", 550, "nameplates", "ocean"],
  ["nameplate-mint", 450, "nameplates", "mint"], ["nameplate-plum", 550, "nameplates", "plum"],
  ["nameplate-crimson", 500, "nameplates", "crimson"], ["nameplate-lavender", 450, "nameplates", "lavender"],
  ["nameplate-steel", 450, "nameplates", "steel"], ["nameplate-sunset", 550, "nameplates", "sunset"],
  ["nameplate-jade", 500, "nameplates", "jade"], ["nameplate-cosmic", 600, "nameplates", "cosmic"],
  ["nameplate-cherry", 500, "nameplates", "cherry"], ["nameplate-arctic", 500, "nameplates", "arctic"],
  ["nameplate-amber", 500, "nameplates", "amber"], ["decoration-flame", 300, "decorations", "flame"],
  ["decoration-leaf", 275, "decorations", "leaf"]
].map(([id, cost, cosmeticCategory, cosmeticId]) => ({ id, cost, cosmeticCategory, cosmeticId }));
const ROTATING_SHOP_DISCOUNT = 0.8;
const ROTATING_SHOP_SIZE = 6;

// Same algorithm as js/shop.js, so the server agrees with the client
// about which 6 items are on sale for a given calendar date.
function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  return function () {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}
function rotatingShopItemsFor(dateStr) {
  const rng = seededRandom("rotating-shop-" + dateStr);
  const shuffled = [...ROTATING_EXCLUSIVE_ITEMS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, ROTATING_SHOP_SIZE).map(it => ({ ...it, discountedCost: Math.round(it.cost * ROTATING_SHOP_DISCOUNT) }));
}

// The app runs on each student's LOCAL calendar day (see localDateString
// in js/app.js). The browser sends its local date; the server accepts it
// only if it's within one day of the server's UTC date (every real time
// zone is), which stops "claim tomorrow's and next week's reward now".
function validateLocalDate(dateStr) {
  if (typeof dateStr !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const t = Date.parse(dateStr + "T00:00:00Z");
  if (Number.isNaN(t)) return false;
  const todayUtc = Date.parse(new Date().toISOString().slice(0, 10) + "T00:00:00Z");
  return Math.abs(t - todayUtc) <= 24 * 60 * 60 * 1000;
}

// A 1-day Pro bought with coins lapses on its own even if the browser
// never reports it. Real Stripe subscribers are never affected.
function hasActivePro(user) {
  if (!user) return false;
  if (user.isUltra) return true;
  if (!user.isPro) return false;
  if (user.tempProUntil && user.tempProUntil <= Date.now() && !user.stripeCustomerId) return false;
  return true;
}
function coinMultiplier(user) {
  return user.isUltra ? 1.5 : (hasActivePro(user) ? 1.25 : 1);
}

// Read-modify-write with Firestore's updateTime precondition, so two
// requests at the same moment (a double-click on "Buy") can't both
// spend the same coins. On a conflict it re-reads and tries again.
async function getDocWithUpdateTime(projectId, serviceAccountJson, collection, docId) {
  const accessToken = await getFirestoreAccessToken(serviceAccountJson);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Firestore read failed: " + (await response.text()));
  const doc = await response.json();
  const data = {};
  for (const [k, v] of Object.entries(doc.fields || {})) data[k] = fromFirestoreValue(v);
  return { data, updateTime: doc.updateTime };
}

async function transactUserUpdate(projectId, serviceAccountJson, uid, computeFn) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const current = await getDocWithUpdateTime(projectId, serviceAccountJson, "users", uid);
    if (!current) return { error: "Couldn't find your account.", status: 404 };
    const outcome = computeFn(current.data);
    if (outcome.error) return outcome;
    if (!outcome.updates || Object.keys(outcome.updates).length === 0) return outcome;

    // documents:commit with a currentDocument.updateTime precondition:
    // the write only lands if nobody changed the account since we read it.
    const accessToken = await getFirestoreAccessToken(serviceAccountJson);
    const fields = {};
    for (const [k, v] of Object.entries(outcome.updates)) fields[k] = toFirestoreValue(v);
    const docName = `projects/${projectId}/databases/(default)/documents/users/${uid}`;
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:commit`, {
      method: "POST",
      headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        writes: [{
          update: { name: docName, fields },
          updateMask: { fieldPaths: Object.keys(outcome.updates) },
          currentDocument: { updateTime: current.updateTime }
        }]
      })
    });
    if (response.ok) return outcome;
    const errText = await response.text();
    if (response.status === 400 && errText.includes("FAILED_PRECONDITION")) continue; // changed underneath us — retry
    throw new Error("Firestore update failed: " + errText);
  }
  return { error: "Too many changes at once — please try again.", status: 409 };
}

function economyResponse(outcome) {
  if (outcome.error) return errorJson(outcome.error, outcome.status || 400);
  return json(outcome.response || { success: true });
}

async function handleClaimMissionReward(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }
  const { missionId, localDate } = await request.json().catch(() => ({}));
  const mission = ECONOMY_MISSIONS[missionId];
  if (!mission) return errorJson("Unknown mission.", 400);
  if (!validateLocalDate(localDate)) return errorJson("Your device date looks wrong — check your clock and try again.", 400);

  return economyResponse(await transactUserUpdate(projectId, serviceAccount, auth.uid, (user) => {
    const progress = (user.missionProgress || {})[missionId] || 0;
    if (user.missionDate !== localDate || progress < mission.target) return { error: "That mission isn't complete yet.", status: 400 };
    const claims = user.missionRewardClaims || { date: null, ids: [] };
    if (claims.date && claims.date > localDate) return { error: "That day's missions are already closed.", status: 400 };
    const ids = claims.date === localDate ? [...(claims.ids || [])] : [];
    if (ids.includes(missionId)) return { response: { success: true, alreadyClaimed: true, coins: user.coins || 0 } };
    ids.push(missionId);
    const amount = Math.round(mission.reward * coinMultiplier(user));
    const coins = (user.coins || 0) + amount;
    return { updates: { coins, missionRewardClaims: { date: localDate, ids } }, response: { success: true, amount, coins } };
  }));
}

async function handleClaimUltraDailyCoins(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }
  const { localDate } = await request.json().catch(() => ({}));
  if (!validateLocalDate(localDate)) return errorJson("Your device date looks wrong.", 400);

  return economyResponse(await transactUserUpdate(projectId, serviceAccount, auth.uid, (user) => {
    if (!user.isUltra) return { error: "The daily coin bonus is an Ultra perk.", status: 403 };
    if (user.lastUltraCoinBonusDate && user.lastUltraCoinBonusDate >= localDate) {
      return { response: { success: true, alreadyClaimed: true, coins: user.coins || 0 } };
    }
    const coins = (user.coins || 0) + ULTRA_DAILY_COINS;
    return { updates: { coins, lastUltraCoinBonusDate: localDate }, response: { success: true, amount: ULTRA_DAILY_COINS, coins } };
  }));
}

async function handleSpinDailyWheel(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }
  const { localDate } = await request.json().catch(() => ({}));
  if (!validateLocalDate(localDate)) return errorJson("Your device date looks wrong.", 400);

  return economyResponse(await transactUserUpdate(projectId, serviceAccount, auth.uid, (user) => {
    if (user.lastSpinDate && user.lastSpinDate >= localDate) return { error: "You've already spun today — come back tomorrow!", status: 400 };
    const slotIndex = crypto.getRandomValues(new Uint32Array(1))[0] % SPIN_SLOTS.length;
    const slot = SPIN_SLOTS[slotIndex];
    const updates = { lastSpinDate: localDate };
    const response = { success: true, slotIndex, type: slot.type };
    if (slot.type === "coins") {
      updates.coins = (user.coins || 0) + slot.amount;
      response.amount = slot.amount;
      response.coins = updates.coins;
    } else if (slot.type === "xpBoost") {
      updates.xpBoost = { multiplier: 1.5, usesRemaining: 5 };
      response.xpBoost = updates.xpBoost;
    }
    return { updates, response };
  }));
}

async function handlePurchaseShopItem(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }
  const { itemId, localDate } = await request.json().catch(() => ({}));
  if (!validateLocalDate(localDate)) return errorJson("Your device date looks wrong.", 400);

  // Work out the item and its real price here — never trust a price sent by the browser.
  let item = null;
  const rotating = rotatingShopItemsFor(localDate).find(it => it.id === itemId);
  if (rotating) {
    item = { cost: rotating.discountedCost, cosmeticCategory: rotating.cosmeticCategory, cosmeticId: rotating.cosmeticId };
  } else if (GIFTABLE_ITEMS[itemId]) {
    const g = GIFTABLE_ITEMS[itemId];
    item = { cost: g.costCoins, cosmeticCategory: g.cosmeticCategory, cosmeticId: g.cosmeticId, requiresTier: g.requiresTier };
  } else if (SHOP_SPECIAL_ITEMS[itemId]) {
    item = SHOP_SPECIAL_ITEMS[itemId];
  } else if (ROTATING_EXCLUSIVE_ITEMS.some(it => it.id === itemId)) {
    return errorJson("That item isn't in today's featured deals anymore.", 400);
  }
  if (!item) return errorJson("Unknown item.", 400);

  return economyResponse(await transactUserUpdate(projectId, serviceAccount, auth.uid, (user) => {
    if (item.requiresTier === "ultra" && !user.isUltra) return { error: "That item is Ultra-exclusive.", status: 403 };
    if (item.requiresTier === "pro" && !hasActivePro(user)) return { error: "That item is Pro-exclusive.", status: 403 };
    const owned = JSON.parse(JSON.stringify(user.ownedCosmetics || {}));
    if (item.cosmeticCategory && (owned[item.cosmeticCategory] || []).includes(item.cosmeticId)) {
      return { error: "You already own that.", status: 400 };
    }
    if ((user.coins || 0) < item.cost) return { error: "You don't have enough coins for that.", status: 400 };

    const updates = {
      coins: (user.coins || 0) - item.cost,
      lifetimeCoinsSpent: (user.lifetimeCoinsSpent || 0) + item.cost
    };
    const grants = item.grants ? item.grants : (item.cosmeticCategory ? [[item.cosmeticCategory, item.cosmeticId]] : []);
    if (grants.length) {
      for (const [cat, id] of grants) {
        owned[cat] = owned[cat] || [];
        if (!owned[cat].includes(id)) owned[cat].push(id);
      }
      updates.ownedCosmetics = owned;
    }
    if (item.xpBoost) updates.xpBoost = { ...item.xpBoost };
    if (item.streakFreeze) updates.streakFreezes = (user.streakFreezes || 0) + item.streakFreeze;
    if (item.tempPro) {
      updates.isPro = true;
      updates.tempProUntil = Date.now() + TEMP_PRO_MS;
    }
    return { updates, response: { success: true, ...updates } };
  }));
}

// Badge rewards. The unlock conditions are a server-side copy of
// js/achievements.js (keep the two in sync), evaluated against the
// stored account, so the browser can't claim a badge it hasn't earned
// or claim the same one twice.
const SERVER_SUBJECT_IDS = ["math", "science", "history", "geography", "english", "computer-science", "economics", "probability", "technology", "coding"];
const SERVER_COSMETIC_CATEGORIES = ["avatarIcons", "frames", "decorations", "nameplates", "themes", "music"];
function serverAchievements() {
  const list = [];
  const add = (id, check) => list.push({ id, check });
  const done = u => u.completedSubjects || [];
  const owned = (u, k) => ((u.ownedCosmetics && u.ownedCosmetics[k]) || []).length;
  [2, 5, 10, 15, 20, 25, 30, 40, 50, 75].forEach(l => add(`level-${l}`, u => Math.floor((u.xp || 0) / 1000) + 1 >= l));
  [1, 5, 10, 25, 40, 55, 70].forEach(n => add(`lessons-${n}`, u => done(u).length >= n));
  SERVER_SUBJECT_IDS.forEach(s => {
    const count = u => done(u).filter(k => k.startsWith(s + ":")).length;
    add(`started-${s}`, u => count(u) >= 1);
    add(`halfway-${s}`, u => count(u) >= 5);
    add(`mastered-${s}`, u => count(u) >= 10);
  });
  [3, 5, 7, 14, 21, 30, 60, 100].forEach(d => add(`streak-${d}`, u => (u.streakCount || 0) >= d));
  [1, 5, 10, 25].forEach(n => add(`battles-won-${n}`, u => (u.lifetimeBattlesWon || 0) >= n));
  [1, 2, 3, 6, 9].forEach(r => add(`rank-${r}`, u => (u.rank || 0) >= r));
  [500, 1000, 2500, 5000].forEach(n => add(`weekly-xp-${n}`, u => (u.weeklyXP || 0) >= n));
  [100, 500, 1000, 2500, 5000, 10000].forEach(n => add(`coins-${n}`, u => (u.coins || 0) >= n));
  [500, 2000, 5000].forEach(n => add(`coins-spent-${n}`, u => (u.lifetimeCoinsSpent || 0) >= n));
  [1, 10, 25, 50].forEach(n => add(`perfect-${n}`, u => (u.perfectLessons || 0) >= n));
  [50, 100, 500, 1000, 2500].forEach(n => add(`correct-${n}`, u => (u.totalCorrectAnswers || 0) >= n));
  add("pro-member", u => !!u.isPro);
  add("ultra-member", u => !!u.isUltra);
  SERVER_COSMETIC_CATEGORIES.forEach(k => {
    add(`own-${k}-1`, u => owned(u, k) >= 1);
    add(`own-${k}-all`, u => owned(u, k) >= 2);
  });
  add("fully-customized", u => SERVER_COSMETIC_CATEGORIES.every(k => owned(u, k) >= 1));
  const touched = u => new Set(done(u).map(k => k.split(":")[0]));
  add("renaissance-mind", u => touched(u).size >= 4);
  add("renaissance-master", u => SERVER_SUBJECT_IDS.every(s => touched(u).has(s)));
  add("tutor-first-use", u => Object.keys(u.tutorLevel || {}).length > 0);
  return list;
}
const SERVER_ACHIEVEMENT_REWARDS = {
  "level-50": 750, "level-75": 1500, "lessons-55": 400, "lessons-70": 800, "streak-60": 600, "streak-100": 1200,
  "battles-won-10": 150, "battles-won-25": 350, "rank-9": 1000, "weekly-xp-5000": 300, "coins-spent-5000": 200,
  "perfect-50": 500, "correct-2500": 600, "ultra-member": 300, "fully-customized": 250, "renaissance-master": 800
};
SERVER_SUBJECT_IDS.forEach(s => { SERVER_ACHIEVEMENT_REWARDS[`mastered-${s}`] = 150; });
SERVER_COSMETIC_CATEGORIES.forEach(k => { SERVER_ACHIEVEMENT_REWARDS[`own-${k}-all`] = 150; });
const DEFAULT_ACHIEVEMENT_REWARD_COINS = 50;

async function handleClaimAchievementRewards(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }
  return economyResponse(await transactUserUpdate(projectId, serviceAccount, auth.uid, (user) => {
    const claimed = [...(user.claimedAchievementRewards || [])];
    const granted = [];
    const working = { ...user };
    for (const a of serverAchievements()) {
      if (claimed.includes(a.id) || !a.check(working)) continue;
      const coins = SERVER_ACHIEVEMENT_REWARDS[a.id] || DEFAULT_ACHIEVEMENT_REWARD_COINS;
      claimed.push(a.id);
      working.coins = (working.coins || 0) + coins; // same as before: a coin badge can unlock in the same pass
      granted.push({ id: a.id, coins });
    }
    if (granted.length === 0) return { response: { success: true, granted: [], coins: user.coins || 0 } };
    return {
      updates: { coins: working.coins, claimedAchievementRewards: claimed },
      response: { success: true, granted, coins: working.coins }
    };
  }));
}

async function handleExpireTempPro(request, projectId, serviceAccount) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }
  return economyResponse(await transactUserUpdate(projectId, serviceAccount, auth.uid, (user) => {
    if (!user.tempProUntil || user.tempProUntil > Date.now()) return { response: { success: true, isPro: !!user.isPro } };
    if (user.stripeCustomerId) return { updates: { tempProUntil: null }, response: { success: true, isPro: !!user.isPro } };
    return { updates: { isPro: false, tempProUntil: null }, response: { success: true, isPro: false } };
  }));
}

// Lets the app show the Admin panel link only to admins. This is only
// about hiding a button — handleAdminGrant still checks the caller
// against ADMIN_EMAILS itself on every request.
async function handleCheckAdmin(request, projectId, adminEmailsRaw) {
  let auth;
  try { auth = await requireAuth(request, projectId); } catch (err) { return errorJson("You must be signed in.", 401); }
  const adminEmails = (adminEmailsRaw || "").split(",").map(e => e.trim().toLowerCase()).filter(Boolean);
  return json({ isAdmin: !!auth.email && adminEmails.includes(auth.email.toLowerCase()) });
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
    if (path === "generateStudyCourse") return await handleGenerateStudyCourse(request, projectId, geminiKey, serviceAccount);
    if (path === "getSharedStudyCourse") return await handleGetSharedStudyCourse(request, projectId, serviceAccount);
    if (path === "generateStudyModeFeedback") return await handleGenerateStudyModeFeedback(request, projectId, geminiKey);
    if (path === "generateTutorExplanation") return await handleGenerateTutorExplanation(request, projectId, geminiKey);
    if (path === "chatWithTutor") return await handleChatWithTutor(request, projectId, geminiKey);
    if (path === "generatePracticeQuestion") return await handleGeneratePracticeQuestion(request, projectId, geminiKey);
    if (path === "analyzeHomeworkPhoto") return await handleAnalyzeHomeworkPhoto(request, projectId, geminiKey, serviceAccount);
    if (path === "createCheckoutSession") return await handleCreateCheckoutSession(request, projectId, stripeSecretKey);
    if (path === "createItemCheckoutSession") return await handleCreateItemCheckoutSession(request, projectId, stripeSecretKey);
    if (path === "stripeWebhook") return await handleStripeWebhook(request, projectId, stripeSecretKey, stripeWebhookSecret, serviceAccount);
    if (path === "giftItem") return await handleGiftItem(request, projectId, serviceAccount);
    if (path === "giftCoins") return await handleGiftCoins(request, projectId, serviceAccount);
    if (path === "createClan") return await handleCreateClan(request, projectId, serviceAccount);
    if (path === "createClanCheckoutSession") return await handleCreateClanCheckoutSession(request, projectId, stripeSecretKey, serviceAccount);
    if (path === "joinClan") return await handleJoinClan(request, projectId, serviceAccount);
    if (path === "updateClanSettings") return await handleUpdateClanSettings(request, projectId, serviceAccount);
    if (path === "leaveClan") return await handleLeaveClan(request, projectId, serviceAccount);
    if (path === "listClans") return await handleListClans(request, projectId, serviceAccount);
    if (path === "getClanLeaderboard") return await handleGetClanLeaderboard(request, projectId, serviceAccount);
    if (path === "addFriend") return await handleAddFriend(request, projectId, serviceAccount);
    if (path === "removeFriend") return await handleRemoveFriend(request, projectId, serviceAccount);
    if (path === "blockUser") return await handleBlockUser(request, projectId, serviceAccount);
    if (path === "unblockUser") return await handleUnblockUser(request, projectId, serviceAccount);
    if (path === "adminFindUsersByUsername") return await handleAdminFindUsersByUsername(request, projectId, serviceAccount, Deno.env.get("ADMIN_EMAILS"));
    if (path === "adminGrant") return await handleAdminGrant(request, projectId, serviceAccount, Deno.env.get("ADMIN_EMAILS"));
    if (path === "checkAdmin") return await handleCheckAdmin(request, projectId, Deno.env.get("ADMIN_EMAILS"));
    if (path === "claimMissionReward") return await handleClaimMissionReward(request, projectId, serviceAccount);
    if (path === "claimUltraDailyCoins") return await handleClaimUltraDailyCoins(request, projectId, serviceAccount);
    if (path === "spinDailyWheel") return await handleSpinDailyWheel(request, projectId, serviceAccount);
    if (path === "purchaseShopItem") return await handlePurchaseShopItem(request, projectId, serviceAccount);
    if (path === "claimAchievementRewards") return await handleClaimAchievementRewards(request, projectId, serviceAccount);
    if (path === "expireTempPro") return await handleExpireTempPro(request, projectId, serviceAccount);
    return errorJson("Unknown endpoint: " + path, 404);
  } catch (err) {
    console.error("Unhandled error on " + path + ":", err.message);
    return errorJson("Something went wrong. Please try again.", 500);
  }
}
