// ------------------------------------------------------------------
// Shared helper for calling the Cloudflare Worker backend (see
// cloudflare-worker/src/index.js) — replaces Firebase Functions'
// httpsCallable(), attaching the current user's Firebase ID token as
// a Bearer token so the Worker can verify who's calling, the same way
// request.auth worked automatically inside a real Cloud Function.
// ------------------------------------------------------------------

async function callWorkerFunction(name, payload) {
  if (!currentUser) throw new Error("Not signed in");
  const idToken = await currentUser.getIdToken();

  const response = await fetch(`${WORKER_BASE_URL}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${idToken}`
    },
    body: JSON.stringify(payload || {})
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data.error || `Worker request failed (${response.status})`);
    err.status = response.status;
    throw err;
  }
  return data;
}
