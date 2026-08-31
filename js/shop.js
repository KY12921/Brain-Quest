// ------------------------------------------------------------------
// Brain Quest — Shop.
//
// Spends coins (earned from Daily Missions — see missions.js) on:
//   - XP boosts: a multiplier applied to the next N correct answers,
//     consumed via the xpBoost field checked in app.js's
//     applyAnswerResult().
//   - 1-Day Pro: temporarily grants every Pro perk. Tracked via
//     tempProUntil, checked and expired on login (see app.js).
// ------------------------------------------------------------------

const SHOP_ITEMS = [
  {
    id: "boost-1.5x",
    name: "1.5x XP Boost",
    description: "Next 10 correct answers earn 1.5x XP.",
    cost: 150,
    apply: () => applyXpBoost(1.5, 10)
  },
  {
    id: "boost-3x",
    name: "3x XP Boost",
    description: "Next 10 correct answers earn 3x XP.",
    cost: 400,
    apply: () => applyXpBoost(3, 10)
  },
  {
    id: "temp-pro-1day",
    name: "Pro for 1 Day",
    description: "Every Pro perk — no ads, bonus XP, unlimited AI Tutor, all themes — for 24 hours.",
    cost: 800,
    apply: () => applyTempPro(24 * 60 * 60 * 1000)
  }
];

function renderShopScreen() {
  document.getElementById("shop-coin-balance").textContent = currentUserData.coins || 0;
  document.getElementById("shop-status").textContent = "";
  const grid = document.getElementById("shop-grid");

  grid.innerHTML = SHOP_ITEMS.map(item => {
    const affordable = (currentUserData.coins || 0) >= item.cost;
    return `
      <div class="shop-item${!affordable ? " shop-item-unaffordable" : ""}">
        <p class="shop-item-name">${item.name}</p>
        <p class="shop-item-desc">${item.description}</p>
        <button class="btn btn-primary shop-buy-btn" data-item-id="${item.id}" ${!affordable ? "disabled" : ""}>
          ${item.cost} coins
        </button>
      </div>
    `;
  }).join("");

  grid.querySelectorAll(".shop-buy-btn").forEach(btn => {
    btn.addEventListener("click", () => purchaseShopItem(btn.dataset.itemId));
  });
}

async function purchaseShopItem(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  const statusEl = document.getElementById("shop-status");
  if (!item) return;

  if ((currentUserData.coins || 0) < item.cost) {
    statusEl.textContent = "Not enough coins for that yet.";
    return;
  }

  currentUserData.coins -= item.cost;
  updateCoinHud();
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      coins: firebase.firestore.FieldValue.increment(-item.cost)
    });
  }

  await item.apply();
  statusEl.textContent = `Purchased ${item.name}!`;
  renderShopScreen();
}

async function applyXpBoost(multiplier, uses) {
  currentUserData.xpBoost = { multiplier, usesRemaining: uses };
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({ xpBoost: currentUserData.xpBoost });
  }
}

async function applyTempPro(durationMs) {
  currentUserData.isPro = true;
  currentUserData.tempProUntil = Date.now() + durationMs;
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      isPro: true,
      tempProUntil: currentUserData.tempProUntil
    });
  }
}

// Called once at login. If a purchased 1-Day Pro window has expired
// and the user isn't a real paying subscriber (no Stripe customer ID
// on file), revert isPro back to false. Real subscriptions are never
// touched here — only the webhook in functions/index.js manages those.
async function checkTempProExpiry() {
  if (!currentUserData.tempProUntil) return;
  if (currentUserData.tempProUntil > Date.now()) return; // still active
  if (currentUserData.stripeCustomerId) return; // real subscriber, leave alone

  currentUserData.isPro = false;
  currentUserData.tempProUntil = null;
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      isPro: false,
      tempProUntil: null
    });
  }
}
