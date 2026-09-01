// ------------------------------------------------------------------
// Brain Quest — Pro & Ultra tiers (monthly or yearly), plus coin packs.
//
// Real Stripe checkout is wired up for all of these (see
// cloudflare-worker/src/index.js for the server side). The "Activate
// Pro (test)" button still exists below the real buttons for local
// testing before you've set Stripe up — but once you deploy the real
// payment flow AND tighten your Firestore rules (see README), that
// test button stops working, since isPro/isUltra are no longer
// client-writable. That's the correct, intended outcome for a real
// launch.
//
// Ultra includes every Pro perk plus: photo homework analysis (see
// js/ultra-photo.js), a 1.5x coin multiplier (vs Pro's 1.25x), and
// 100 free coins per day.
// ------------------------------------------------------------------

let _billingPeriod = "monthly"; // toggled by the user, not persisted

const COIN_PACKS = [
  { id: "coins1000", amount: 1000, price: "$0.99", desc: "A one-time top-up for the Shop." },
  { id: "coins5000", amount: 5000, price: "$3.99", desc: "Bundle: 5000 coins + a bonus Dragon icon + Fire frame." },
  { id: "coins10000", amount: 10000, price: "$6.99", desc: "Bundle: 10,000 coins + a bonus Wizard icon, Ice frame, Star badge, and Shadow nameplate." }
];

function renderProScreen() {
  const card = document.getElementById("pro-card");
  const isPro = currentUserData && currentUserData.isPro;
  const isUltra = currentUserData && currentUserData.isUltra;

  const comparisonTable = `
    <div class="pro-compare-table pro-compare-table-3col">
      <div class="pro-compare-row pro-compare-header">
        <span></span>
        <span>Free</span>
        <span class="pro-compare-pro-col">Pro</span>
        <span class="pro-compare-ultra-col">Ultra</span>
      </div>
      <div class="pro-compare-row">
        <span>Ads</span>
        <span>Shown</span>
        <span class="pro-compare-pro-col">None</span>
        <span class="pro-compare-ultra-col">None</span>
      </div>
      <div class="pro-compare-row">
        <span>XP per correct answer</span>
        <span>Standard</span>
        <span class="pro-compare-pro-col">+5 bonus</span>
        <span class="pro-compare-ultra-col">+5 bonus</span>
      </div>
      <div class="pro-compare-row">
        <span>Coin earn rate</span>
        <span>1x</span>
        <span class="pro-compare-pro-col">1.25x</span>
        <span class="pro-compare-ultra-col">1.5x</span>
      </div>
      <div class="pro-compare-row">
        <span>Free daily coins</span>
        <span>—</span>
        <span class="pro-compare-pro-col">—</span>
        <span class="pro-compare-ultra-col">100/day</span>
      </div>
      <div class="pro-compare-row">
        <span>AI Tutor questions</span>
        <span>3 per day</span>
        <span class="pro-compare-pro-col">Unlimited</span>
        <span class="pro-compare-ultra-col">Unlimited</span>
      </div>
      <div class="pro-compare-row">
        <span>Photo homework analysis</span>
        <span>—</span>
        <span class="pro-compare-pro-col">—</span>
        <span class="pro-compare-ultra-col">✅</span>
      </div>
      <div class="pro-compare-row">
        <span>Background themes</span>
        <span>1 theme</span>
        <span class="pro-compare-pro-col">5 themes</span>
        <span class="pro-compare-ultra-col">5 themes</span>
      </div>
    </div>
  `;

  const billingToggle = `
    <div class="billing-toggle">
      <button class="billing-toggle-btn${_billingPeriod === "monthly" ? " billing-toggle-active" : ""}" data-period="monthly">Monthly</button>
      <button class="billing-toggle-btn${_billingPeriod === "yearly" ? " billing-toggle-active" : ""}" data-period="yearly">Yearly <span class="billing-save-badge">Save ~17%</span></button>
    </div>
  `;

  const proPrice = _billingPeriod === "monthly" ? "$5.99/month" : "$59.99/year";
  const ultraPrice = _billingPeriod === "monthly" ? "$12.99/month" : "$129.99/year";
  const proType = _billingPeriod === "monthly" ? "proMonthly" : "proYearly";
  const ultraType = _billingPeriod === "monthly" ? "ultraMonthly" : "ultraYearly";

  const coinPackSection = `
    <h3 class="settings-heading">Need coins faster?</h3>
    ${COIN_PACKS.map(pack => `
      <div class="coin-pack-card">
        <div>
          <p class="coin-pack-name">${pack.amount.toLocaleString()} Coins</p>
          <p class="coin-pack-desc">${pack.desc}</p>
        </div>
        <button class="btn btn-primary coin-pack-btn" data-pack-id="${pack.id}">${pack.price}</button>
      </div>
    `).join("")}
    <p class="pro-note" id="coin-pack-status"></p>
  `;

  if (isUltra) {
    card.innerHTML = `
      <p class="pro-status pro-active">🌟 You have Brain Quest Ultra</p>
      ${comparisonTable}
      <button class="btn btn-ghost" id="pro-deactivate-btn">Deactivate (test)</button>
      ${coinPackSection}
    `;
    document.getElementById("pro-deactivate-btn").addEventListener("click", () => setTierStatus(false, false));
  } else if (isPro) {
    card.innerHTML = `
      <p class="pro-status pro-active">✅ You have Brain Quest Pro</p>
      ${comparisonTable}
      ${billingToggle}
      <button class="btn btn-primary btn-ultra" id="ultra-checkout-btn">Upgrade to Ultra — ${ultraPrice}</button>
      <p class="pro-note" id="ultra-checkout-status"></p>
      <button class="btn btn-ghost" id="pro-deactivate-btn">Deactivate Pro (test)</button>
      ${coinPackSection}
    `;
    document.getElementById("ultra-checkout-btn").addEventListener("click", () => startStripeCheckout(ultraType, "ultra-checkout-btn", "ultra-checkout-status"));
    document.getElementById("pro-deactivate-btn").addEventListener("click", () => setTierStatus(false, false));
    wireBillingToggle();
  } else {
    card.innerHTML = `
      ${comparisonTable}
      ${billingToggle}
      <button class="btn btn-primary" id="pro-checkout-btn">Subscribe to Pro — ${proPrice}</button>
      <p class="pro-note" id="pro-checkout-status"></p>
      <button class="btn btn-primary btn-ultra" id="ultra-checkout-btn">Subscribe to Ultra — ${ultraPrice}</button>
      <p class="pro-note" id="ultra-checkout-status"></p>
      <button class="btn btn-ghost" id="pro-activate-btn">Activate Pro (test, no real payment)</button>
      ${coinPackSection}
    `;
    document.getElementById("pro-checkout-btn").addEventListener("click", () => startStripeCheckout(proType, "pro-checkout-btn", "pro-checkout-status"));
    document.getElementById("ultra-checkout-btn").addEventListener("click", () => startStripeCheckout(ultraType, "ultra-checkout-btn", "ultra-checkout-status"));
    document.getElementById("pro-activate-btn").addEventListener("click", () => setTierStatus(true, false));
    wireBillingToggle();
  }

  document.querySelectorAll(".coin-pack-btn").forEach(btn => {
    btn.addEventListener("click", () => startStripeCheckout(btn.dataset.packId, null, "coin-pack-status", btn));
  });
}

function wireBillingToggle() {
  document.querySelectorAll(".billing-toggle-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      _billingPeriod = btn.dataset.period;
      renderProScreen();
    });
  });
}

async function startStripeCheckout(productType, btnId, statusId, btnEl) {
  const btn = btnEl || document.getElementById(btnId);
  const statusEl = document.getElementById(statusId);
  btn.disabled = true;
  statusEl.textContent = "Redirecting to checkout...";

  try {
    const result = await callWorkerFunction("createCheckoutSession", {
      productType: productType,
      successUrl: window.location.href,
      cancelUrl: window.location.href
    });
    window.location.href = result.url;
  } catch (err) {
    btn.disabled = false;
    statusEl.textContent = "Couldn't start checkout — Stripe may not be set up yet on this deployment. See the README.";
  }
}

async function setTierStatus(isPro, isUltra) {
  currentUserData.isPro = isPro;
  currentUserData.isUltra = isUltra;
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({ isPro: isPro, isUltra: isUltra });
  }
  renderProScreen();
}
