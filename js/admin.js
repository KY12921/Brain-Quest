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

// Ban/unban are explicit, separate buttons rather than a checkbox on
// the main form — a checkbox that "only sets when checked" would make
// it genuinely ambiguous whether leaving it unchecked means "don't
// touch this" or "unban them," which is exactly the kind of mistake
// you don't want available for something like banning an account.
async function submitBanChange(targetBanned) {
  const statusEl = document.getElementById("admin-status");
  const targetEmail = document.getElementById("admin-target-email").value.trim();
  const banDurationDays = parseInt(document.getElementById("admin-ban-duration").value, 10);
  const banReason = document.getElementById("admin-ban-reason").value.trim();
  statusEl.textContent = "";

  if (!targetEmail) {
    statusEl.textContent = "Enter a target account email first.";
    return;
  }
  if (targetBanned) {
    const durationLabel = banDurationDays > 0 ? `${banDurationDays} day(s)` : "permanently";
    if (!confirm(`Ban ${targetEmail} for ${durationLabel}? They'll be signed out and blocked from using the app.`)) {
      return;
    }
  }

  document.getElementById("admin-ban-btn").disabled = true;
  document.getElementById("admin-unban-btn").disabled = true;
  statusEl.textContent = targetBanned ? "Banning..." : "Unbanning...";

  try {
    const payload = { targetEmail: targetEmail, banned: targetBanned };
    if (targetBanned) {
      payload.banDurationDays = banDurationDays;
      payload.banReason = banReason;
    }
    const result = await callWorkerFunction("adminGrant", payload);
    statusEl.textContent = result.message || "Done.";
  } catch (err) {
    statusEl.textContent = err.message || "Couldn't apply that change.";
  } finally {
    document.getElementById("admin-ban-btn").disabled = false;
    document.getElementById("admin-unban-btn").disabled = false;
  }
}

document.getElementById("admin-ban-btn").addEventListener("click", () => submitBanChange(true));
document.getElementById("admin-unban-btn").addEventListener("click", () => submitBanChange(false));
