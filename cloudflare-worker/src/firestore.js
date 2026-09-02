// ------------------------------------------------------------------
// Talks to Firestore over its REST API using a Google Cloud service
// account — replaces what firebase-admin's Firestore client did in
// the Firebase Functions version. This bypasses Firestore security
// rules the same way firebase-admin does (that's expected: this is
// privileged server-side access, the same trust level as before).
//
// You'll need a service account JSON key: Firebase Console > Project
// Settings > Service Accounts > Generate new private key. Store the
// whole downloaded JSON file's contents as a single secret — see the
// README for the exact command.
// ------------------------------------------------------------------

import { SignJWT, importPKCS8 } from "jose";

let cachedAccessToken = null;
let cachedTokenExpiry = 0;

async function getAccessToken(serviceAccountJson) {
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
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt
    })
  });

  if (!response.ok) {
    throw new Error("Failed to get Google access token: " + (await response.text()));
  }

  const data = await response.json();
  cachedAccessToken = data.access_token;
  cachedTokenExpiry = now + data.expires_in * 1000;
  return cachedAccessToken;
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

function fromFirestoreValue(fv) {
  if (!fv) return null;
  if ("nullValue" in fv) return null;
  if ("booleanValue" in fv) return fv.booleanValue;
  if ("integerValue" in fv) return parseInt(fv.integerValue, 10);
  if ("doubleValue" in fv) return fv.doubleValue;
  if ("stringValue" in fv) return fv.stringValue;
  if ("timestampValue" in fv) return fv.timestampValue;
  if ("arrayValue" in fv) return (fv.arrayValue.values || []).map(fromFirestoreValue);
  if ("mapValue" in fv) {
    const obj = {};
    for (const [k, val] of Object.entries(fv.mapValue.fields || {})) obj[k] = fromFirestoreValue(val);
    return obj;
  }
  return null;
}

export async function getFirestoreDocument(projectId, serviceAccountJson, collection, docId) {
  const accessToken = await getAccessToken(serviceAccountJson);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collection}/${docId}`;
  const response = await fetch(url, { headers: { Authorization: `Bearer ${accessToken}` } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Firestore read failed: " + (await response.text()));
  const doc = await response.json();
  const result = {};
  for (const [k, v] of Object.entries(doc.fields || {})) result[k] = fromFirestoreValue(v);
  return result;
}

export async function updateFirestoreDocument(projectId, serviceAccountJson, collection, docId, updates) {
  const accessToken = await getAccessToken(serviceAccountJson);
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

// Firestore's REST API has no direct equivalent of the client SDK's
// FieldValue.increment in a single atomic call — this does a
// read-then-write instead. For coin/XP-style increments at this
// app's scale, the small race-condition window (two purchases
// finishing at the exact same millisecond) is an acceptable
// trade-off; it was already a risk with client-side increments used
// elsewhere in the app, not a new one introduced here.
export async function incrementFirestoreField(projectId, serviceAccountJson, collection, docId, field, amount) {
  const current = await getFirestoreDocument(projectId, serviceAccountJson, collection, docId);
  const currentValue = (current && typeof current[field] === "number") ? current[field] : 0;
  await updateFirestoreDocument(projectId, serviceAccountJson, collection, docId, { [field]: currentValue + amount });
}

// Grants a cosmetic via the webhook (server-side), matching the same
// ownedCosmetics data shape the client uses in js/shop.js — reads the
// whole map, adds to the right category's array, writes it back.
export async function grantCosmeticServerSide(projectId, serviceAccountJson, collection, docId, category, cosmeticId) {
  const current = await getFirestoreDocument(projectId, serviceAccountJson, collection, docId);
  const ownedCosmetics = (current && current.ownedCosmetics) || {};
  const categoryArr = ownedCosmetics[category] || [];
  if (!categoryArr.includes(cosmeticId)) categoryArr.push(cosmeticId);
  ownedCosmetics[category] = categoryArr;
  await updateFirestoreDocument(projectId, serviceAccountJson, collection, docId, { ownedCosmetics });
}
export async function findFirestoreDocByField(projectId, serviceAccountJson, collection, field, value) {
  const accessToken = await getAccessToken(serviceAccountJson);
  const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery`;
  const body = {
    structuredQuery: {
      from: [{ collectionId: collection }],
      where: {
        fieldFilter: {
          field: { fieldPath: field },
          op: "EQUAL",
          value: toFirestoreValue(value)
        }
      },
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

  const docPath = match.document.name; // full path like .../documents/users/abc123
  const docId = docPath.split("/").pop();
  const fields = {};
  for (const [k, v] of Object.entries(match.document.fields || {})) fields[k] = fromFirestoreValue(v);
  return { id: docId, data: fields };
}
