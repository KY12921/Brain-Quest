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
  { id: "avatar-wizard", category: "Avatar Icons", name: "Wizard", description: "A mysterious wizard avatar icon.",
    cost: 750, cosmeticCategory: "avatarIcons", cosmeticId: "wizard" },
  { id: "avatar-ninja", category: "Avatar Icons", name: "Ninja", description: "A stealthy ninja avatar icon.",
    cost: 800, cosmeticCategory: "avatarIcons", cosmeticId: "ninja" },
  { id: "avatar-phoenix-ultra", category: "Avatar Icons", name: "Radiant Phoenix", description: "An exclusive rainbow-fire phoenix. Ultra members only.",
    cost: 1100, cosmeticCategory: "avatarIcons", cosmeticId: "phoenixUltra", requiresTier: "ultra" },

  // ---------- Avatar frames (one-time unlock) ----------
  { id: "frame-gold", category: "Frames", name: "Gold Ring Frame", description: "A polished gold ring around your avatar.",
    cost: 600, cosmeticCategory: "frames", cosmeticId: "gold" },
  { id: "frame-fire", category: "Frames", name: "Fire Frame", description: "A flickering flame border around your avatar.",
    cost: 800, cosmeticCategory: "frames", cosmeticId: "fire" },
  { id: "frame-ice", category: "Frames", name: "Ice Frame", description: "A cool crystalline border around your avatar.",
    cost: 800, cosmeticCategory: "frames", cosmeticId: "ice" },
  { id: "frame-electric", category: "Frames", name: "Electric Frame", description: "A crackling electric border. Pro members only.",
    cost: 1000, cosmeticCategory: "frames", cosmeticId: "electric", requiresTier: "pro" },

  // ---------- Avatar decorations (one-time unlock) ----------
  { id: "deco-crown", category: "Decorations", name: "Crown Badge", description: "A small crown badge on your avatar's corner.",
    cost: 700, cosmeticCategory: "decorations", cosmeticId: "crown" },
  { id: "deco-sparkle", category: "Decorations", name: "Sparkle Badge", description: "A sparkle badge on your avatar's corner.",
    cost: 500, cosmeticCategory: "decorations", cosmeticId: "sparkle" },
  { id: "deco-star", category: "Decorations", name: "Star Badge", description: "A gold star badge on your avatar's corner.",
    cost: 550, cosmeticCategory: "decorations", cosmeticId: "star" },
  { id: "deco-heart", category: "Decorations", name: "Heart Badge", description: "A pink heart badge on your avatar's corner.",
    cost: 450, cosmeticCategory: "decorations", cosmeticId: "heart" },

  // ---------- Nameplate styles (one-time unlock; leaderboard name styling) ----------
  { id: "nameplate-gold", category: "Nameplates", name: "Golden Nameplate", description: "Your leaderboard name in gold, with a subtle glow.",
    cost: 1000, cosmeticCategory: "nameplates", cosmeticId: "gold" },
  { id: "nameplate-neon", category: "Nameplates", name: "Neon Nameplate", description: "Your leaderboard name in glowing neon cyan.",
    cost: 1200, cosmeticCategory: "nameplates", cosmeticId: "neon" },
  { id: "nameplate-rainbow", category: "Nameplates", name: "Rainbow Nameplate", description: "Your leaderboard name in a gradient rainbow.",
    cost: 1400, cosmeticCategory: "nameplates", cosmeticId: "rainbow" },
  { id: "nameplate-shadow", category: "Nameplates", name: "Shadow Nameplate", description: "A bold drop-shadow effect on your name.",
    cost: 900, cosmeticCategory: "nameplates", cosmeticId: "shadow" },

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

function meetsTierRequirement(item) {
  if (!item.requiresTier) return true;
  if (item.requiresTier === "ultra") return !!currentUserData.isUltra;
  if (item.requiresTier === "pro") return !!(currentUserData.isPro || currentUserData.isUltra);
  return true;
}

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
          const tierLocked = !meetsTierRequirement(item);
          const tierBadge = item.requiresTier ? `<span class="shop-tier-badge shop-tier-badge-${item.requiresTier}">${item.requiresTier.toUpperCase()} ONLY</span>` : "";
          return `
            <div class="shop-item${(!affordable && !isOwned) || tierLocked ? " shop-item-unaffordable" : ""}" data-item-id="${item.id}" data-preview="true">
              <p class="shop-item-name">${item.name} ${tierBadge}</p>
              <p class="shop-item-desc">${item.description}</p>
              <button class="btn ${isOwned ? "btn-ghost" : "btn-primary"} shop-buy-btn" data-item-id="${item.id}" ${isOwned || tierLocked ? "disabled" : ""}>
                ${isOwned ? "Owned" : tierLocked ? "Locked" : item.cost + " coins"}
              </button>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }).join("");

  // Clicking anywhere on the card (except the buy button itself) opens
  // a preview instead of buying immediately.
  grid.querySelectorAll(".shop-item").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest(".shop-buy-btn")) return;
      const item = SHOP_ITEMS.find(i => i.id === card.dataset.itemId);
      if (item) showItemPreview(item);
    });
  });

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

const CATEGORY_TO_EQUIP_SLOT = {
  avatarIcons: "avatarIcon",
  frames: "frame",
  decorations: "decoration",
  nameplates: "nameplate"
};

// Auto-equips whatever was just purchased. For avatar/frame/decoration/
// nameplate this sets the `equipped` slot; for a theme or music track
// it applies it immediately, the same as picking it in Settings.
async function equipCosmeticSlot(category, cosmeticId) {
  const slotKey = CATEGORY_TO_EQUIP_SLOT[category];
  if (slotKey) {
    if (!currentUserData.equipped) currentUserData.equipped = {};
    currentUserData.equipped[slotKey] = cosmeticId;
    if (currentUser) {
      await db.collection("users").doc(currentUser.uid).update({ [`equipped.${slotKey}`]: cosmeticId });
    }
    return;
  }
  if (category === "themes" && typeof applyBgTheme === "function") {
    applyBgTheme(cosmeticId);
    return;
  }
  if (category === "music" && typeof MusicPlayer !== "undefined") {
    try { localStorage.setItem("bqMusic", cosmeticId); } catch (e) {}
    MusicPlayer.play(cosmeticId);
  }
}

function showItemPreview(item) {
  const modal = document.getElementById("shop-preview-modal");
  const body = document.getElementById("shop-preview-body");
  let previewHtml = "";

  if (item.cosmeticCategory === "avatarIcons" || item.cosmeticCategory === "frames" || item.cosmeticCategory === "decorations") {
    const slotKey = CATEGORY_TO_EQUIP_SLOT[item.cosmeticCategory];
    const previewData = { equipped: { ...(currentUserData.equipped || {}), [slotKey]: item.cosmeticId } };
    previewHtml = `<div class="shop-preview-avatar">${renderAvatarCosmetic(previewData, "avatar-lg")}</div>`;
  } else if (item.cosmeticCategory === "nameplates") {
    previewHtml = `<p class="nameplate-${item.cosmeticId} shop-preview-nameplate">${currentUserData.name || "Your Name"}</p>`;
  } else if (item.cosmeticCategory === "themes") {
    previewHtml = `<span class="bg-theme-swatch bg-theme-swatch-${item.cosmeticId} shop-preview-swatch"></span>`;
  } else if (item.cosmeticCategory === "music") {
    previewHtml = `<button class="btn btn-ghost" id="shop-preview-play-btn">▶ Play a preview</button>`;
  } else if (item.grants) {
    previewHtml = `<p class="shop-preview-bundle-list">Includes: ${item.grants.map(g => g.cosmeticId).join(", ")}</p>`;
  }

  document.getElementById("shop-preview-title").textContent = item.name;
  body.innerHTML = previewHtml + `<p class="shop-preview-desc">${item.description}</p>`;
  modal.classList.remove("hidden");

  if (item.cosmeticCategory === "music") {
    document.getElementById("shop-preview-play-btn").addEventListener("click", () => {
      MusicPlayer.play(item.cosmeticId);
      setTimeout(() => { if (MusicPlayer.currentTrackId === item.cosmeticId) MusicPlayer.stop(); }, 4000);
    });
  }

  const owned = currentUserData.ownedCosmetics || {};
  const isOwned = isCosmeticOwned(item, owned);
  const buyBtn = document.getElementById("shop-preview-buy-btn");
  buyBtn.textContent = isOwned ? "Owned" : `Buy — ${item.cost} coins`;
  buyBtn.disabled = isOwned;
  buyBtn.onclick = () => {
    modal.classList.add("hidden");
    purchaseShopItem(item.id);
  };
}

document.getElementById("shop-preview-close-btn").addEventListener("click", () => {
  document.getElementById("shop-preview-modal").classList.add("hidden");
});

async function purchaseShopItem(itemId) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  const statusEl = document.getElementById("shop-status");
  if (!item) return;

  if (!meetsTierRequirement(item)) {
    navigateTo("pro-section");
    return;
  }

  if ((currentUserData.coins || 0) < item.cost) {
    // Not enough coins — send them to Go Pro, where coin packs (and
    // Pro/Ultra's coin-earning multipliers) live, instead of just
    // showing an error with nowhere to act on it.
    navigateTo("pro-section");
    return;
  }

  currentUserData.coins -= item.cost;
  currentUserData.lifetimeCoinsSpent = (currentUserData.lifetimeCoinsSpent || 0) + item.cost;
  updateCoinHud();
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      coins: firebase.firestore.FieldValue.increment(-item.cost),
      lifetimeCoinsSpent: firebase.firestore.FieldValue.increment(item.cost)
    });
  }

  if (item.grants) {
    for (const g of item.grants) await grantCosmetic(g.cosmeticCategory, g.cosmeticId);
    // Auto-equip the last cosmetic in the bundle of each type — good
    // enough for a 2-3 item bundle without needing extra UI to ask
    // "which one do you want equipped."
    for (const g of item.grants) await equipCosmeticSlot(g.cosmeticCategory, g.cosmeticId);
  } else if (item.cosmeticCategory) {
    await grantCosmetic(item.cosmeticCategory, item.cosmeticId);
    await equipCosmeticSlot(item.cosmeticCategory, item.cosmeticId);
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
