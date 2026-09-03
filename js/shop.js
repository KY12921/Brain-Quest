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

// ------------------------------------------------------------------
// Daily Spin (BETA) — one free spin per calendar day. 8 equally-likely
// slots: 4 nothing, 2 small XP boosts, 2 coin prizes. Marked BETA
// since the odds/prizes may still change.
// ------------------------------------------------------------------
// Colors reference the CURRENT theme's own CSS variables rather than
// fixed hex values, so the wheel actually matches whichever
// background theme (and light/dark mode) the player has selected,
// instead of always looking the same regardless of theme. Resolved
// at render time via getComputedStyle since inline SVG fills need an
// actual color value, not a live CSS variable reference.
function getThemedSpinSlots() {
  const style = getComputedStyle(document.documentElement);
  const read = (name) => style.getPropertyValue(name).trim();
  const gold = read("--gold") || "#D4A54A";
  const cyan = read("--cyan") || "#3FE8D0";
  const border = read("--border") || "#4A4A52";
  const surfaceRaised = read("--surface-raised") || "#5A5A62";

  return [
    { type: "nothing", label: "Nothing", wheelLabel: "✗", color: border },
    { type: "xpBoost", label: "1.5x XP Boost", wheelLabel: "XP", color: cyan },
    { type: "nothing", label: "Nothing", wheelLabel: "✗", color: surfaceRaised },
    { type: "coins", label: "500 Coins", amount: 500, wheelLabel: "500", color: gold },
    { type: "nothing", label: "Nothing", wheelLabel: "✗", color: border },
    { type: "xpBoost", label: "1.5x XP Boost", wheelLabel: "XP", color: cyan },
    { type: "nothing", label: "Nothing", wheelLabel: "✗", color: surfaceRaised },
    { type: "coins", label: "500 Coins", amount: 500, wheelLabel: "500", color: gold }
  ];
}

// Builds the wheel as real SVG pie slices via trigonometry — slice i
// spans from (i * sliceAngle) to ((i+1) * sliceAngle) clockwise from
// the top, so its center sits at (i + 0.5) * sliceAngle clockwise
// from the top. That center-angle formula is exactly what the spin
// rotation math below has to match, or the wheel visually lands one
// slice off from the slot that actually gets applied — see the
// verified rotation formula in spinDailyWheel.
function generateWheelSvg(slots) {
  const cx = 100, cy = 100, r = 92;
  const sliceAngle = 360 / slots.length;

  let paths = "";
  let labels = "";
  slots.forEach((slot, i) => {
    const startDeg = i * sliceAngle - 90; // -90 shifts 0° to point straight up
    const endDeg = (i + 1) * sliceAngle - 90;
    const startRad = startDeg * Math.PI / 180;
    const endRad = endDeg * Math.PI / 180;
    const x1 = (cx + r * Math.cos(startRad)).toFixed(2);
    const y1 = (cy + r * Math.sin(startRad)).toFixed(2);
    const x2 = (cx + r * Math.cos(endRad)).toFixed(2);
    const y2 = (cy + r * Math.sin(endRad)).toFixed(2);
    paths += `<path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z" fill="${slot.color}" stroke="#16212B" stroke-width="1.5"/>`;

    const midRad = ((i + 0.5) * sliceAngle - 90) * Math.PI / 180;
    const labelR = r * 0.66;
    const lx = (cx + labelR * Math.cos(midRad)).toFixed(2);
    const ly = (cy + labelR * Math.sin(midRad)).toFixed(2);
    labels += `<text x="${lx}" y="${ly}" font-size="13" font-weight="700" fill="#EFE6D2" text-anchor="middle" dominant-baseline="middle">${slot.wheelLabel}</text>`;
  });

  return `<svg viewBox="0 0 200 200">
    <circle cx="${cx}" cy="${cy}" r="${r + 4}" fill="none" stroke="#D4A54A" stroke-width="5"/>
    ${paths}${labels}
    <circle cx="${cx}" cy="${cy}" r="10" fill="#D4A54A"/>
  </svg>`;
}

// ------------------------------------------------------------------
// Rotating Shop — a featured selection that changes once a day,
// deterministically seeded from the calendar date so every player
// sees the SAME rotation on the same day (a shared "deal of the day"
// rather than a random per-player selection), at a 20% discount off
// the item's normal coin price. No server round-trip needed — it's
// computed the same way client-side for everyone.
// ------------------------------------------------------------------
const ROTATING_SHOP_DISCOUNT = 0.8; // pay 80% of normal price
const ROTATING_SHOP_SIZE = 4;

function seededRandom(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return function () {
    h = Math.imul(h ^ (h >>> 15), h | 1);
    h ^= h + Math.imul(h ^ (h >>> 7), h | 61);
    return ((h ^ (h >>> 14)) >>> 0) / 4294967296;
  };
}

function getRotatingShopItems() {
  const today = localDateString();
  const rng = seededRandom("rotating-shop-" + today);
  // Cosmetics only — a "featured deal" makes sense for something
  // collectible, less so for a consumable boost you'd buy repeatedly.
  const eligible = SHOP_ITEMS.filter(i => i.cosmeticCategory && !i.requiresTier);
  const shuffled = [...eligible];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, ROTATING_SHOP_SIZE).map(item => ({
    ...item,
    discountedCost: Math.round(item.cost * ROTATING_SHOP_DISCOUNT)
  }));
}

function renderRotatingShop() {
  const container = document.getElementById("rotating-shop-grid");
  if (!container) return;
  const owned = currentUserData.ownedCosmetics || {};
  const items = getRotatingShopItems();

  container.innerHTML = items.map(item => {
    const isOwned = isCosmeticOwned(item, owned);
    const affordable = (currentUserData.coins || 0) >= item.discountedCost;
    return `
      <div class="shop-item rotating-shop-item${!affordable && !isOwned ? " shop-item-unaffordable" : ""}">
        <span class="rotating-shop-discount-badge">-20%</span>
        <p class="shop-item-name">${item.name}</p>
        <p class="shop-item-desc">${item.description}</p>
        <p class="shop-item-price-row">
          <span class="shop-item-price-coins-strike">🪙 ${item.cost}</span>
          <span class="shop-item-price-coins">🪙 ${item.discountedCost}</span>
        </p>
        <button class="btn ${isOwned ? "btn-ghost" : "btn-primary"} rotating-shop-buy-btn" data-item-id="${item.id}" data-cost="${item.discountedCost}" ${isOwned ? "disabled" : ""}>
          ${isOwned ? "Owned" : "Buy — " + item.discountedCost + " coins"}
        </button>
      </div>
    `;
  }).join("");

  container.querySelectorAll(".rotating-shop-buy-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      await purchaseShopItem(btn.dataset.itemId, parseInt(btn.dataset.cost, 10));
      renderShopScreen();
    });
  });
}

function renderDailySpinner() {
  const wheelEl = document.getElementById("daily-spin-wheel");
  const btn = document.getElementById("daily-spin-btn");
  const resultEl = document.getElementById("daily-spin-result");
  resultEl.textContent = "";

  wheelEl.innerHTML = generateWheelSvg(getThemedSpinSlots());
  wheelEl.style.transition = "none";
  wheelEl.style.transform = "rotate(0deg)";

  const today = localDateString();
  const alreadySpun = currentUserData.lastSpinDate === today;
  btn.disabled = alreadySpun;
  btn.textContent = alreadySpun ? "Come back tomorrow" : "Spin!";
  if (!alreadySpun) btn.onclick = spinDailyWheel;
}

async function spinDailyWheel() {
  const btn = document.getElementById("daily-spin-btn");
  const resultEl = document.getElementById("daily-spin-result");
  const wheelEl = document.getElementById("daily-spin-wheel");
  btn.disabled = true;
  resultEl.textContent = "";

  const spinSlots = getThemedSpinSlots();
  const winningIndex = Math.floor(Math.random() * spinSlots.length);
  const winningSlot = spinSlots[winningIndex];
  const sliceAngle = 360 / spinSlots.length;

  // The pointer is fixed at the top (0°). Slice `winningIndex`'s
  // center sits at (winningIndex + 0.5) * sliceAngle clockwise from
  // the top (see generateWheelSvg's comment). To bring that center
  // to the pointer, the wheel must rotate clockwise by 360 minus that
  // angle — plus several full spins for the visual effect.
  const targetSliceAngle = (winningIndex + 0.5) * sliceAngle;
  const extraSpins = 5 * 360;
  const finalRotation = extraSpins + (360 - targetSliceAngle);

  wheelEl.style.transition = "transform 3.2s cubic-bezier(0.12, 0.67, 0.1, 1)";
  wheelEl.style.transform = `rotate(${finalRotation}deg)`;

  await new Promise(r => setTimeout(r, 3300));

  const today = localDateString();
  currentUserData.lastSpinDate = today;
  const updates = { lastSpinDate: today };

  if (winningSlot.type === "coins") {
    currentUserData.coins = (currentUserData.coins || 0) + winningSlot.amount;
    updates.coins = firebase.firestore.FieldValue.increment(winningSlot.amount);
    resultEl.textContent = `You won ${winningSlot.amount} coins!`;
    updateCoinHud();
  } else if (winningSlot.type === "xpBoost") {
    currentUserData.xpBoost = { multiplier: 1.5, usesRemaining: 5 };
    updates.xpBoost = currentUserData.xpBoost;
    resultEl.textContent = "You won a 1.5x XP Boost (next 5 correct answers)!";
  } else {
    resultEl.textContent = "Nothing this time — try again tomorrow!";
  }

  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update(updates);
  }

  btn.disabled = true;
  btn.textContent = "Come back tomorrow";
}

const SHOP_ITEMS = [
  // ---------- XP boosts (consumable, always repurchasable) ----------
  { id: "boost-1.5x", category: "Boosts", name: "1.5x XP Boost", description: "Next 10 correct answers earn 1.5x XP.",
    cost: 100, apply: () => applyXpBoost(1.5, 10) },
  { id: "boost-3x", category: "Boosts", name: "3x XP Boost", description: "Next 10 correct answers earn 3x XP.",
    cost: 250, apply: () => applyXpBoost(3, 10) },
  { id: "temp-pro-1day", category: "Boosts", name: "Pro for 1 Day", description: "Every Pro perk for 24 hours.",
    cost: 500, apply: () => applyTempPro(24 * 60 * 60 * 1000) },

  // ---------- Streak protection (consumable, stackable) ----------
  { id: "streak-freeze", category: "Streak", name: "Streak Freeze", description: "Protects your streak the next time you miss a day. Stackable.",
    cost: 200, apply: () => addStreakFreeze(1) },

  // ---------- Avatar icons (one-time unlock) ----------
  { id: "avatar-phoenix", category: "Avatar Icons", name: "Phoenix", description: "A blazing phoenix avatar icon.",
    cost: 350, cosmeticCategory: "avatarIcons", cosmeticId: "phoenix" },
  { id: "avatar-dragon", category: "Avatar Icons", name: "Dragon", description: "A fierce dragon avatar icon.",
    cost: 450, cosmeticCategory: "avatarIcons", cosmeticId: "dragon" },
  { id: "avatar-wizard", category: "Avatar Icons", name: "Wizard", description: "A mysterious wizard avatar icon.",
    cost: 375, cosmeticCategory: "avatarIcons", cosmeticId: "wizard" },
  { id: "avatar-ninja", category: "Avatar Icons", name: "Ninja", description: "A stealthy ninja avatar icon.",
    cost: 400, cosmeticCategory: "avatarIcons", cosmeticId: "ninja" },
  { id: "avatar-phoenix-ultra", category: "Avatar Icons", name: "Radiant Phoenix", description: "An exclusive rainbow-fire phoenix. Ultra members only.",
    cost: 550, cosmeticCategory: "avatarIcons", cosmeticId: "phoenixUltra", requiresTier: "ultra" },

  // ---------- Avatar frames (one-time unlock) ----------
  { id: "frame-gold", category: "Frames", name: "Gold Ring Frame", description: "A polished gold ring around your avatar.",
    cost: 300, cosmeticCategory: "frames", cosmeticId: "gold" },
  { id: "frame-fire", category: "Frames", name: "Fire Frame", description: "A flickering flame border around your avatar.",
    cost: 400, cosmeticCategory: "frames", cosmeticId: "fire" },
  { id: "frame-ice", category: "Frames", name: "Ice Frame", description: "A cool crystalline border around your avatar.",
    cost: 400, cosmeticCategory: "frames", cosmeticId: "ice" },
  { id: "frame-electric", category: "Frames", name: "Electric Frame", description: "A crackling electric border. Pro members only.",
    cost: 500, cosmeticCategory: "frames", cosmeticId: "electric", requiresTier: "pro" },

  // ---------- Avatar decorations (one-time unlock) ----------
  { id: "deco-crown", category: "Decorations", name: "Crown Badge", description: "A small crown badge on your avatar's corner.",
    cost: 350, cosmeticCategory: "decorations", cosmeticId: "crown" },
  { id: "deco-sparkle", category: "Decorations", name: "Sparkle Badge", description: "A sparkle badge on your avatar's corner.",
    cost: 250, cosmeticCategory: "decorations", cosmeticId: "sparkle" },
  { id: "deco-star", category: "Decorations", name: "Star Badge", description: "A gold star badge on your avatar's corner.",
    cost: 275, cosmeticCategory: "decorations", cosmeticId: "star" },
  { id: "deco-heart", category: "Decorations", name: "Heart Badge", description: "A pink heart badge on your avatar's corner.",
    cost: 225, cosmeticCategory: "decorations", cosmeticId: "heart" },

  // ---------- Nameplate styles (one-time unlock; leaderboard name styling) ----------
  { id: "nameplate-gold", category: "Nameplates", name: "Golden Nameplate", description: "Your leaderboard name in gold, with a subtle glow.",
    cost: 500, cosmeticCategory: "nameplates", cosmeticId: "gold" },
  { id: "nameplate-neon", category: "Nameplates", name: "Neon Nameplate", description: "Your leaderboard name in glowing neon cyan.",
    cost: 600, cosmeticCategory: "nameplates", cosmeticId: "neon" },
  { id: "nameplate-rainbow", category: "Nameplates", name: "Rainbow Nameplate", description: "Your leaderboard name in a gradient rainbow.",
    cost: 700, cosmeticCategory: "nameplates", cosmeticId: "rainbow" },
  { id: "nameplate-shadow", category: "Nameplates", name: "Shadow Nameplate", description: "A bold drop-shadow effect on your name.",
    cost: 450, cosmeticCategory: "nameplates", cosmeticId: "shadow" },

  // ---------- Extra themes (one-time unlock; coin-purchasable, separate from Pro/Ultra themes) ----------
  { id: "theme-sunset", category: "Themes", name: "Sunset Glow Theme", description: "A warm orange-and-pink background theme.",
    cost: 750, cosmeticCategory: "themes", cosmeticId: "sunset" },
  { id: "theme-galaxy", category: "Themes", name: "Midnight Galaxy Theme", description: "A deep purple starfield background theme.",
    cost: 900, cosmeticCategory: "themes", cosmeticId: "galaxy" },

  // ---------- Extra music (one-time unlock) ----------
  { id: "music-coffeeshop", category: "Music", name: "Coffee Shop Track", description: "A relaxed, warm instrumental loop.",
    cost: 300, cosmeticCategory: "music", cosmeticId: "coffeeShop" },
  { id: "music-zengarden", category: "Music", name: "Zen Garden Track", description: "A slow, minimal ambient loop.",
    cost: 350, cosmeticCategory: "music", cosmeticId: "zenGarden" },

  // ---------- Bundles (discounted combos, grant several unlocks at once) ----------
  {
    id: "bundle-starter", category: "Bundles", name: "Starter Bundle",
    description: "Phoenix icon + Gold Ring frame + Golden Nameplate — a 300 coin discount vs buying separately.",
    cost: 1000,
    grants: [
      { cosmeticCategory: "avatarIcons", cosmeticId: "phoenix" },
      { cosmeticCategory: "frames", cosmeticId: "gold" },
      { cosmeticCategory: "nameplates", cosmeticId: "gold" }
    ]
  },
  {
    id: "bundle-legendary", category: "Bundles", name: "Legendary Bundle",
    description: "Dragon icon + Fire frame + Neon nameplate + Crown badge — a big discount vs buying separately.",
    cost: 1600,
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
  renderDailySpinner();
  renderRotatingShop();
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
          const priceRow = item.cosmeticCategory
            ? `<p class="shop-item-price-row"><span class="shop-item-price-coins">🪙 ${item.cost}</span><span class="shop-item-price-divider">or</span><span class="shop-item-price-cash">$${(item.cost / 100).toFixed(2)}</span></p>`
            : `<p class="shop-item-price-row"><span class="shop-item-price-coins">🪙 ${item.cost}</span></p>`;
          return `
            <div class="shop-item${(!affordable && !isOwned) || tierLocked ? " shop-item-unaffordable" : ""}" data-item-id="${item.id}" data-preview="true">
              <p class="shop-item-name">${item.name} ${tierBadge}</p>
              <p class="shop-item-desc">${item.description}</p>
              ${priceRow}
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

  // Real-money purchase and gifting are only available for one-time
  // cosmetic unlocks (not consumables like boosts/streak freezes, or
  // bundles) — see GIFTABLE_ITEMS in the Cloudflare Worker, which is
  // the actual source of truth for what's giftable and what it costs.
  const realMoneyBtn = document.getElementById("shop-preview-real-money-btn");
  const giftBtn = document.getElementById("shop-preview-gift-btn");
  const giftForm = document.getElementById("shop-gift-form");
  giftForm.classList.add("hidden");
  document.getElementById("shop-gift-status").textContent = "";
  document.getElementById("shop-gift-email-input").value = "";

  if (item.cosmeticCategory && !isOwned) {
    const priceUsd = (item.cost / 100).toFixed(2);
    realMoneyBtn.textContent = `Buy with real money — $${priceUsd}`;
    realMoneyBtn.classList.remove("hidden");
    realMoneyBtn.onclick = () => buyItemWithRealMoney(item);
  } else {
    realMoneyBtn.classList.add("hidden");
  }

  if (item.cosmeticCategory) {
    giftBtn.classList.remove("hidden");
    giftBtn.onclick = () => giftForm.classList.toggle("hidden");
    document.getElementById("shop-gift-send-btn").onclick = () => sendGift(item);
  } else {
    giftBtn.classList.add("hidden");
  }
}

async function buyItemWithRealMoney(item) {
  const btn = document.getElementById("shop-preview-real-money-btn");
  btn.disabled = true;
  try {
    const result = await callWorkerFunction("createItemCheckoutSession", {
      itemId: item.id,
      successUrl: window.location.href,
      cancelUrl: window.location.href
    });
    window.location.href = result.url;
  } catch (err) {
    btn.disabled = false;
    document.getElementById("shop-gift-status").textContent = "Couldn't start checkout — this may not be deployed yet. See the README.";
  }
}

async function sendGift(item) {
  const emailInput = document.getElementById("shop-gift-email-input");
  const statusEl = document.getElementById("shop-gift-status");
  const sendBtn = document.getElementById("shop-gift-send-btn");
  const email = emailInput.value.trim();
  statusEl.textContent = "";

  if (!email) {
    statusEl.textContent = "Enter your friend's email address.";
    return;
  }

  sendBtn.disabled = true;
  try {
    const result = await callWorkerFunction("giftItem", { itemId: item.id, recipientEmail: email });
    statusEl.textContent = result.message || "Gift sent!";
    currentUserData.coins -= item.cost;
    updateCoinHud();
  } catch (err) {
    statusEl.textContent = err.message || "Couldn't send that gift right now.";
  } finally {
    sendBtn.disabled = false;
  }
}

document.getElementById("shop-preview-close-btn").addEventListener("click", () => {
  document.getElementById("shop-preview-modal").classList.add("hidden");
});

async function purchaseShopItem(itemId, overrideCost) {
  const item = SHOP_ITEMS.find(i => i.id === itemId);
  const statusEl = document.getElementById("shop-status");
  if (!item) return;
  const cost = (typeof overrideCost === "number") ? overrideCost : item.cost;

  if (!meetsTierRequirement(item)) {
    navigateTo("pro-section");
    return;
  }

  if ((currentUserData.coins || 0) < cost) {
    // Not enough coins — send them to Go Pro, where coin packs (and
    // Pro/Ultra's coin-earning multipliers) live, instead of just
    // showing an error with nowhere to act on it.
    navigateTo("pro-section");
    return;
  }

  currentUserData.coins -= cost;
  currentUserData.lifetimeCoinsSpent = (currentUserData.lifetimeCoinsSpent || 0) + cost;
  updateCoinHud();
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      coins: firebase.firestore.FieldValue.increment(-cost),
      lifetimeCoinsSpent: firebase.firestore.FieldValue.increment(cost)
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
