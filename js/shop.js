// ------------------------------------------------------------------
// Brain Quest — Shop.
//
// Spends coins (earned from Daily Missions — see missions.js) on:
//   - XP boosts, temporary Pro (as before)
//   - Cosmetics: avatar icons, frames, decorations, and nameplate
//     styles — shown on Profile and the Leaderboard
//   - Extra background themes and music tracks, beyond the
//     subscription-gated ones in Settings
//   - Streak freezes — protects your streak if you miss a day
//   - Bundles — several items together at a discount
//
// If you don't have enough coins for something, clicking it takes
// you to the Go Pro screen instead of just showing an error — that's
// where the coin packs (and Pro/Ultra, which also boost coin
// earning) live.
// ------------------------------------------------------------------

const SHOP_ITEMS = [
  // ---------- XP boosts (consumable, always repurchasable) ----------
  { id: "boost-1.5x", category: "Boosts", name: "1.5x XP Boost", description: "Next 10 correct answers earn 1.5x XP.",
    cost: 150, apply: () => applyXpBoost(1.5, 10) },
  { id: "boost-3x", category: "Boosts", name: "3x XP Boost", description: "Next 10 correct answers earn 3x XP.",
    cost: 400, apply: () => applyXpBoost(3, 10) },
  { id: "temp-pro-1day", category: "Boosts", name: "Pro for 1 Day", description: "Every Pro perk for 24 hours.",
    cost: 800, apply: () => applyTempPro(24 * 60 * 60 * 1000) },

  // ---------- Streak protection (consumable, stackable) ----------
  { id: "streak-freeze", category: "Streak", name: "Streak Freeze", description: "Protects your streak the next time you miss a day. Stackable.",
    cost: 350, apply: () => addStreakFreeze(1) },

  // ---------- Avatar icons (one-time unlock) ----------
  { id: "avatar-phoenix", category: "Avatar Icons", name: "Phoenix", description: "A blazing phoenix avatar icon.",
    cost: 700, cosmeticCategory: "avatarIcons", cosmeticId: "phoenix" },
  { id: "avatar-dragon", category: "Avatar Icons", name: "Dragon", description: "A fierce dragon avatar icon.",
    cost: 900, cosmeticCategory: "avatarIcons", cosmeticId: "dragon" },

  // ---------- Avatar frames (one-time unlock) ----------
  { id: "frame-gold", category: "Frames", name: "Gold Ring Frame", description: "A polished gold ring around your avatar.",
    cost: 600, cosmeticCategory: "frames", cosmeticId: "gold" },
  { id: "frame-fire", category: "Frames", name: "Fire Frame", description: "A flickering flame border around your avatar.",
    cost: 800, cosmeticCategory: "frames", cosmeticId: "fire" },

  // ---------- Avatar decorations (one-time unlock) ----------
  { id: "deco-crown", category: "Decorations", name: "Crown Badge", description: "A small crown badge on your avatar's corner.",
    cost: 700, cosmeticCategory: "decorations", cosmeticId: "crown" },
  { id: "deco-sparkle", category: "Decorations", name: "Sparkle Badge", description: "A sparkle badge on your avatar's corner.",
    cost: 500, cosmeticCategory: "decorations", cosmeticId: "sparkle" },

  // ---------- Nameplate styles (one-time unlock; leaderboard name styling) ----------
  { id: "nameplate-gold", category: "Nameplates", name: "Golden Nameplate", description: "Your leaderboard name in gold, with a subtle glow.",
    cost: 1000, cosmeticCategory: "nameplates", cosmeticId: "gold" },
  { id: "nameplate-neon", category: "Nameplates", name: "Neon Nameplate", description: "Your leaderboard name in glowing neon cyan.",
    cost: 1200, cosmeticCategory: "nameplates", cosmeticId: "neon" },

  // ---------- Extra themes (one-time unlock; coin-purchasable, separate from Pro/Ultra themes) ----------
  { id: "theme-sunset", category: "Themes", name: "Sunset Glow Theme", description: "A warm orange-and-pink background theme.",
    cost: 1500, cosmeticCategory: "themes", cosmeticId: "sunset" },
  { id: "theme-galaxy", category: "Themes", name: "Midnight Galaxy Theme", description: "A deep purple starfield background theme.",
    cost: 1800, cosmeticCategory: "themes", cosmeticId: "galaxy" },

  // ---------- Extra music (one-time unlock) ----------
  { id: "music-coffeeshop", category: "Music", name: "Coffee Shop Track", description: "A relaxed, warm instrumental loop.",
    cost: 600, cosmeticCategory: "music", cosmeticId: "coffeeShop" },
  { id: "music-zengarden", category: "Music", name: "Zen Garden Track", description: "A slow, minimal ambient loop.",
    cost: 700, cosmeticCategory: "music", cosmeticId: "zenGarden" },

  // ---------- Bundles (discounted combos, grant several unlocks at once) ----------
  {
    id: "bundle-starter", category: "Bundles", name: "Starter Bundle",
    description: "Phoenix icon + Gold Ring frame + Golden Nameplate — a 300 coin discount vs buying separately.",
    cost: 2000,
    grants: [
      { cosmeticCategory: "avatarIcons", cosmeticId: "phoenix" },
      { cosmeticCategory: "frames", cosmeticId: "gold" },
      { cosmeticCategory: "nameplates", cosmeticId: "gold" }
    ]
  },
  {
    id: "bundle-legendary", category: "Bundles", name: "Legendary Bundle",
    description: "Dragon icon + Fire frame + Neon nameplate + Crown badge — a big discount vs buying separately.",
    cost: 3200,
    grants: [
      { cosmeticCategory: "avatarIcons", cosmeticId: "dragon" },
      { cosmeticCategory: "frames", cosmeticId: "fire" },
      { cosmeticCategory: "nameplates", cosmeticId: "neon" },
      { cosmeticCategory: "decorations", cosmeticId: "crown" }
    ]
  }
];

function renderShopScreen() {
  document.getElementById("shop-coin-balance").textContent = currentUserData.coins || 0;
  document.getElementById("shop-status").textContent = "";
  const grid = document.getElementById("shop-grid");
  const owned = currentUserData.ownedCosmetics || {};

  const categories = [...new Set(SHOP_ITEMS.map(i => i.category))];
  grid.innerHTML = categories.map(cat => {
    const items = SHOP_ITEMS.filter(i => i.category === cat);
    return `
      <h3 class="settings-heading shop-category-heading">${cat}</h3>
      <div class="shop-category-grid">
        ${items.map(item => {
          const isOwned = isCosmeticOwned(item, owned);
          const affordable = (currentUserData.coins || 0) >= item.cost;
          return `
            <div class="shop-item${!affordable && !isOwned ? " shop-item-unaffordable" : ""}">
              <p class="shop-item-name">${item.name}</p>
              <p class="shop-item-desc">${item.description}</p>
              <button class="btn ${isOwned ? "btn-ghost" : "btn-primary"} shop-buy-btn" data-item-id="${item.id}" ${isOwned ? "disabled" : ""}>
                ${isOwned ? "Owned" : item.cost + " coins"}
              </button>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }).join("");

  grid.querySelectorAll(".shop-buy-btn:not(:disabled)").forEach(btn => {
    btn.addEventListener("click", () => purchaseShopItem(btn.dataset.itemId));
  });
}

// Consumables (Boosts, Streak) and Bundles are always repurchasable —
// only single-cosmetic items (which have cosmeticCategory/cosmeticId)
// are checked against what's already owned.
function isCosmeticOwned(item, owned) {
  if (!item.cosmeticCategory) return false;
  return (owned[item.cosmeticCategory] || []).includes(item.cosmeticId);
}

async function purchaseShopItem(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  const statusEl = document.getElementById("shop-status");
  if (!item) return;

  if ((currentUserData.coins || 0) < item.cost) {
    // Not enough coins — send them to Go Pro, where coin packs (and
    // Pro/Ultra's coin-earning multipliers) live, instead of just
    // showing an error with nowhere to act on it.
    navigateTo("pro-section");
    return;
  }

  currentUserData.coins -= item.cost;
  updateCoinHud();
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      coins: firebase.firestore.FieldValue.increment(-item.cost)
    });
  }

  if (item.grants) {
    for (const g of item.grants) await grantCosmetic(g.cosmeticCategory, g.cosmeticId);
  } else if (item.cosmeticCategory) {
    await grantCosmetic(item.cosmeticCategory, item.cosmeticId);
  } else if (item.apply) {
    await item.apply();
  }

  statusEl.textContent = `Purchased ${item.name}!`;
  renderShopScreen();
}

async function applyXpBoost(multiplier, uses) {
  currentUserData.xpBoost = { multiplier, usesRemaining: uses };
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({ xpBoost: currentUserData.xpBoost });
  }
}

async function addStreakFreeze(count) {
  currentUserData.streakFreezes = (currentUserData.streakFreezes || 0) + count;
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      streakFreezes: firebase.firestore.FieldValue.increment(count)
    });
  }
}

// Grants a cosmetic (adds it to the owned list for that category).
// Doesn't auto-equip it — equipping happens on the Profile screen.
async function grantCosmetic(category, cosmeticId) {
  if (!currentUserData.ownedCosmetics) currentUserData.ownedCosmetics = {};
  if (!currentUserData.ownedCosmetics[category]) currentUserData.ownedCosmetics[category] = [];
  if (currentUserData.ownedCosmetics[category].includes(cosmeticId)) return; // already owned

  currentUserData.ownedCosmetics[category].push(cosmeticId);
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      [`ownedCosmetics.${category}`]: firebase.firestore.FieldValue.arrayUnion(cosmeticId)
    });
  }
}

// KNOWN CONFLICT, DOCUMENTED HONESTLY: this writes isPro directly from
// the client, same as the old test button. If you apply the tightened
// Firestore rule from the README (blocking direct client writes to
// isPro/isUltra once real Stripe payments are live), this purchase
// will ALSO silently stop working, not just the test button. If you
// want both real payments and this coin-based temp-Pro purchase to
// coexist securely, this needs converting into a Cloud Function/Worker
// endpoint that verifies/deducts coins and sets isPro server-side, the
// same pattern as the Stripe webhook. Left as a direct write for now
// to keep this feature working out of the box.
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
// touched here — only the Cloudflare Worker's webhook manages those.
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
