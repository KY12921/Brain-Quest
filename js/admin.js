// ------------------------------------------------------------------
// version5 — Admin panel.
//
// IMPORTANT: this button is visible to every signed-in user, and
// that's fine — the actual authorization check happens entirely
// server-side (see handleAdminGrant in the Val Town backend), by
// comparing the caller's verified Firebase email against a secret
// list (ADMIN_EMAILS) that never reaches the client. Anyone who isn't
// on that list gets a clear "not authorized" error back from the
// server, no matter what they do in this UI.
// ------------------------------------------------------------------

document.getElementById("admin-panel-link").addEventListener("click", () => {
  document.getElementById("admin-status").textContent = "";
  navigateTo("admin-section");
});

document.getElementById("admin-back-btn").addEventListener("click", () => navigateTo("settings-section"));

document.getElementById("admin-submit-btn").addEventListener("click", async () => {
  const statusEl = document.getElementById("admin-status");
  const btn = document.getElementById("admin-submit-btn");
  const targetEmail = document.getElementById("admin-target-email").value.trim();
  const grantPro = document.getElementById("admin-grant-pro").checked;
  const grantUltra = document.getElementById("admin-grant-ultra").checked;
  const coinsRaw = document.getElementById("admin-coins-amount").value;
  const coinsToAdd = coinsRaw ? parseInt(coinsRaw, 10) : 0;

  statusEl.textContent = "";
  if (!targetEmail) {
    statusEl.textContent = "Enter a target account email.";
    return;
  }

  btn.disabled = true;
  statusEl.textContent = "Applying...";

  try {
    const result = await callWorkerFunction("adminGrant", {
      targetEmail: targetEmail,
      isPro: grantPro,
      isUltra: grantUltra,
      coinsToAdd: coinsToAdd
    });
    statusEl.textContent = result.message || "Done.";
  } catch (err) {
    statusEl.textContent = err.message || "Couldn't apply that change.";
  } finally {
    btn.disabled = false;
  }
});
