// ------------------------------------------------------------------
// Brain Quest — Pro tier.
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

  const comparisonTable = `
    <div class="pro-compare-table">
      <div class="pro-compare-row pro-compare-header">
        <span></span>
        <span>Free</span>
        <span class="pro-compare-pro-col">Pro</span>
      </div>
      <div class="pro-compare-row">
        <span>Ads</span>
        <span>Shown</span>
        <span class="pro-compare-pro-col">None</span>
      </div>
      <div class="pro-compare-row">
        <span>XP per correct answer</span>
        <span>Standard</span>
        <span class="pro-compare-pro-col">+5 bonus, every mode</span>
      </div>
      <div class="pro-compare-row">
        <span>AI Tutor questions</span>
        <span>3 per day</span>
        <span class="pro-compare-pro-col">Unlimited</span>
      </div>
      <div class="pro-compare-row">
        <span>Tutor explanations</span>
        <span>Tap to reveal</span>
        <span class="pro-compare-pro-col">Shown automatically</span>
      </div>
      <div class="pro-compare-row">
        <span>Background themes</span>
        <span>3 themes</span>
        <span class="pro-compare-pro-col">5 themes</span>
      </div>
    </div>
  `;

  if (isPro) {
    card.innerHTML = `
      <p class="pro-status pro-active">✅ You have Brain Quest Pro</p>
      ${comparisonTable}
      <button class="btn btn-ghost" id="pro-deactivate-btn">Deactivate Pro (test)</button>
    `;
    document.getElementById("pro-deactivate-btn").addEventListener("click", () => setProStatus(false));
  } else {
    card.innerHTML = `
      ${comparisonTable}
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
