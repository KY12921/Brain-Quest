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

// The target field accepts either an email or a username. Usernames
// aren't unique, so resolving one can turn up more than one account —
// this holds whichever specific account the admin actually picked
// (or the email directly, if that's what was typed), so every action
// below acts on the account that was actually confirmed, not just
// whatever text happens to be sitting in the input.
let _resolvedAdminTargetEmail = null;

document.getElementById("admin-panel-link").addEventListener("click", () => {
  document.getElementById("admin-status").textContent = "";
  navigateTo("admin-section");
});

document.getElementById("admin-back-btn").addEventListener("click", () => navigateTo("settings-section"));

document.getElementById("admin-target-email").addEventListener("input", () => {
  // Typing invalidates whatever was previously resolved/picked.
  _resolvedAdminTargetEmail = null;
  document.getElementById("admin-resolved-note").textContent = "";
  document.getElementById("admin-username-picker").classList.add("hidden");
});

document.getElementById("admin-resolve-username-btn").addEventListener("click", async () => {
  const raw = document.getElementById("admin-target-email").value.trim();
  const noteEl = document.getElementById("admin-resolved-note");
  const pickerEl = document.getElementById("admin-username-picker");
  noteEl.textContent = "";
  pickerEl.classList.add("hidden");
  pickerEl.innerHTML = "";

  if (!raw) {
    noteEl.textContent = "Type an email or username first.";
    return;
  }

  if (raw.includes("@")) {
    // Looks like an email already — use it directly, no lookup needed.
    _resolvedAdminTargetEmail = raw;
    noteEl.textContent = `Using: ${raw}`;
    return;
  }

  noteEl.textContent = "Searching...";
  try {
    const result = await callWorkerFunction("adminFindUsersByUsername", { username: raw });
    const matches = result.matches || [];
    if (matches.length === 1) {
      _resolvedAdminTargetEmail = matches[0].email;
      noteEl.textContent = `Found: ${matches[0].name} (${matches[0].email})`;
    } else {
      // Multiple accounts share this username — let the admin pick
      // the right one instead of guessing.
      noteEl.textContent = `${matches.length} accounts have this username — pick one:`;
      pickerEl.innerHTML = matches.map((m, i) =>
        `<button type="button" class="btn btn-ghost admin-username-option" data-idx="${i}">${m.name} — ${m.email}</button>`
      ).join("");
      pickerEl.classList.remove("hidden");
      pickerEl.querySelectorAll(".admin-username-option").forEach((btn, i) => {
        btn.addEventListener("click", () => {
          _resolvedAdminTargetEmail = matches[i].email;
          noteEl.textContent = `Selected: ${matches[i].name} (${matches[i].email})`;
          pickerEl.classList.add("hidden");
        });
      });
    }
  } catch (err) {
    noteEl.textContent = err.message || "Couldn't search for that username.";
  }
});

// Every action below needs a CONFIRMED account, not just raw text in
// the input — if it looks like an email, that's enough on its own;
// otherwise the admin must have actually resolved/picked a specific
// account first via the button above.
function getConfirmedTargetEmail() {
  const raw = document.getElementById("admin-target-email").value.trim();
  if (raw.includes("@")) return raw;
  return _resolvedAdminTargetEmail;
}

document.getElementById("admin-submit-btn").addEventListener("click", async () => {
  const statusEl = document.getElementById("admin-status");
  const btn = document.getElementById("admin-submit-btn");
  const targetEmail = getConfirmedTargetEmail();
  const grantPro = document.getElementById("admin-grant-pro").checked;
  const grantUltra = document.getElementById("admin-grant-ultra").checked;
  const coinsRaw = document.getElementById("admin-coins-amount").value;
  const coinsToAdd = coinsRaw ? parseInt(coinsRaw, 10) : 0;

  statusEl.textContent = "";
  if (!targetEmail) {
    statusEl.textContent = "Enter an email, or find and pick a username first.";
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
  const targetEmail = getConfirmedTargetEmail();
  const banDurationDays = parseInt(document.getElementById("admin-ban-duration").value, 10);
  const banReason = document.getElementById("admin-ban-reason").value.trim();
  statusEl.textContent = "";

  if (!targetEmail) {
    statusEl.textContent = "Enter an email, or find and pick a username first.";
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
