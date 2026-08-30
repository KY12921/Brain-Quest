// ------------------------------------------------------------------
// Study Boss — Pro tier.
//
// IMPORTANT: there is no real payment processing here. Actually
// charging $5.99 requires a payment processor (Stripe is the common
// choice) with its own account setup, checkout flow, and a backend
// webhook to confirm payment before granting access — none of which
// can run on static GitHub Pages hosting. This screen instead has a
// clearly-labeled TEST button that flips the isPro flag directly, so
// you can see and demo the unlocked experience. When you're ready to
// take real payments, the natural next step is a small Firebase
// Cloud Function that verifies a Stripe payment, then sets isPro
// server-side (never trust a client to set its own billing status
// for a real launch).
// ------------------------------------------------------------------

function renderProScreen() {
  const card = document.getElementById("pro-card");
  const isPro = currentUserData && currentUserData.isPro;

  if (isPro) {
    card.innerHTML = `
      <p class="pro-status pro-active">✅ You have Study Boss Pro</p>
      <ul class="pro-perks">
        <li>No ads</li>
        <li>+5 XP on every correct answer, in every mode</li>
        <li>Unlimited AI Tutor questions, with explanations shown automatically</li>
      </ul>
      <button class="btn btn-ghost" id="pro-deactivate-btn">Deactivate Pro (test)</button>
    `;
    document.getElementById("pro-deactivate-btn").addEventListener("click", () => setProStatus(false));
  } else {
    card.innerHTML = `
      <ul class="pro-perks">
        <li>No ads</li>
        <li>+5 XP on every correct answer, in every mode</li>
        <li>Unlimited AI Tutor questions, with explanations shown automatically</li>
      </ul>
      <button class="btn btn-primary" id="pro-activate-btn">Activate Pro — $5.99 (test)</button>
      <p class="pro-note">No real payment is processed yet — this is a placeholder until a payment processor is connected.</p>
    `;
    document.getElementById("pro-activate-btn").addEventListener("click", () => setProStatus(true));
  }
}

async function setProStatus(isPro) {
  currentUserData.isPro = isPro;
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({ isPro: isPro });
  }
  renderProScreen();
}
