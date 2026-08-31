// ------------------------------------------------------------------
// Verifies a Firebase Auth ID token WITHOUT the firebase-admin SDK —
// that package doesn't reliably run in Cloudflare's Workers runtime.
// This follows Firebase's own documented steps for verifying ID
// tokens with a third-party JWT library:
// https://firebase.google.com/docs/auth/admin/verify-id-tokens#verify_id_tokens_using_a_third-party_jwt_library
//
// In short: Firebase ID tokens are RS256 JWTs signed by Google. Google
// publishes the current signing certificates at a public URL; we
// fetch those, find the one matching the token's key ID, and verify
// the signature and standard claims (issuer, audience, expiry).
// ------------------------------------------------------------------

import { importX509, jwtVerify, decodeProtectedHeader } from "jose";

const GOOGLE_CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";

let cachedCerts = null;
let cachedCertsExpiry = 0;

async function getGoogleCerts() {
  const now = Date.now();
  if (cachedCerts && now < cachedCertsExpiry) return cachedCerts;

  const response = await fetch(GOOGLE_CERTS_URL);
  if (!response.ok) throw new Error("Failed to fetch Google public certs");
  const certs = await response.json();

  // Respect the Cache-Control max-age Google sends; fall back to 1 hour.
  const cacheControl = response.headers.get("cache-control") || "";
  const maxAgeMatch = cacheControl.match(/max-age=(\d+)/);
  const maxAgeSeconds = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 3600;

  cachedCerts = certs;
  cachedCertsExpiry = now + maxAgeSeconds * 1000;
  return certs;
}

// Returns { uid, email } if the token is valid, or throws with a
// descriptive message if not (expired, wrong project, tampered, etc.).
export async function verifyFirebaseToken(idToken, projectId) {
  if (!idToken) throw new Error("No token provided");

  let header;
  try {
    header = decodeProtectedHeader(idToken);
  } catch (err) {
    throw new Error("Malformed token");
  }
  if (header.alg !== "RS256") throw new Error("Unexpected token algorithm: " + header.alg);
  if (!header.kid) throw new Error("Token missing key ID");

  const certs = await getGoogleCerts();
  const certPem = certs[header.kid];
  if (!certPem) throw new Error("Token key ID not recognized (token may be malformed or very old)");

  const publicKey = await importX509(certPem, "RS256");

  const { payload } = await jwtVerify(idToken, publicKey, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId
  });

  if (!payload.sub) throw new Error("Token missing subject (uid)");

  return { uid: payload.sub, email: payload.email || null };
}

// Pulls the "Bearer <token>" out of an Authorization header and
// verifies it. Throws on anything missing or invalid.
export async function requireAuth(request, projectId) {
  const authHeader = request.headers.get("Authorization") || "";
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) throw new Error("Missing Authorization header");
  return verifyFirebaseToken(match[1], projectId);
}
