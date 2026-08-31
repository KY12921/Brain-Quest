// ------------------------------------------------------------------
// Brain Quest — Pro tier.
//
// Real Stripe checkout is now wired up (see functions/index.js for
// the server side). The "Activate Pro (test)" button still exists
// below Stripe's real button for local testing before you've set
// Stripe up — but once you deploy the real payment flow AND tighten
// your Firestore rules (see README), that test button will stop
// working, since isPro will no longer be client-writable. That's the
// correct, intended outcome for a real launch.
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
      <button class="btn btn-primary" id="pro-checkout-btn">Subscribe — $5.99/month</button>
      <p class="pro-note" id="pro-checkout-status"></p>
      <button class="btn btn-ghost" id="pro-activate-btn">Activate Pro (test, no real payment)</button>
    `;
    document.getElementById("pro-checkout-btn").addEventListener("click", startStripeCheckout);
    document.getElementById("pro-activate-btn").addEventListener("click", () => setProStatus(true));
  }
}

async function startStripeCheckout() {
  const btn = document.getElementById("pro-checkout-btn");
  const statusEl = document.getElementById("pro-checkout-status");
  btn.disabled = true;
  statusEl.textContent = "Redirecting to checkout...";

  try {
    const callable = functions.httpsCallable("createCheckoutSession");
    const result = await callable({
      successUrl: window.location.href,
      cancelUrl: window.location.href
    });
    window.location.href = result.data.url;
  } catch (err) {
    btn.disabled = false;
    statusEl.textContent = "Couldn't start checkout — Stripe may not be set up yet on this deployment. See the README.";
  }
}

async function setProStatus(isPro) {
  currentUserData.isPro = isPro;
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({ isPro: isPro });
  }
  renderProScreen();
}
