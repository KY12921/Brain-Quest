// ------------------------------------------------------------------
// Brain Quest — cosmetic rendering shared by Profile and Leaderboard.
//
// Nothing here decides what's OWNED (that's ownedCosmetics, tracked
// in shop.js) — this just renders whatever is currently EQUIPPED for
// a given user's data, so both Profile and Leaderboard stay visually
// consistent using the same source of truth.
// ------------------------------------------------------------------

const AVATAR_ICON_SVG = {
  default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
  phoenix: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c1 3 3 4 5 4-1 2-3 3-3 5 2 0 4-1 5-3 0 4-3 7-7 7s-7-3-7-7c1 2 3 3 5 3 0-2-2-3-3-5 2 0 4-1 5-4z"/></svg>',
  dragon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 14c2-1 3-3 3-5 1 1 2 1 3 0 1 2 3 2 4 1 1 3 3 4 5 3-1 2-3 3-5 3-1 1-3 2-5 1-2 1-4 0-5-1v-2z"/><circle cx="7" cy="10" r="0.8" fill="currentColor"/></svg>'
};

const DECORATION_SVG = {
  crown: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 18h18l-1-9-5 4-3-6-3 6-5-4-1 9z"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z"/></svg>'
};

// Returns the raw SVG markup for a user's equipped avatar icon.
function avatarIconSvg(equipped) {
  const id = (equipped && equipped.avatarIcon) || "default";
  return AVATAR_ICON_SVG[id] || AVATAR_ICON_SVG.default;
}

// Returns a full avatar element (icon + frame + decoration) as an
// HTML string, ready to drop into Profile or a Leaderboard row.
function renderAvatarCosmetic(userData, sizeClass) {
  const equipped = (userData && userData.equipped) || {};
  const frameClass = equipped.frame && equipped.frame !== "none" ? ` avatar-frame-${equipped.frame}` : "";
  const decoId = equipped.decoration && equipped.decoration !== "none" ? equipped.decoration : null;
  const decoSvg = decoId ? DECORATION_SVG[decoId] : "";

  return `
    <span class="avatar-cosmetic-wrap${frameClass}${sizeClass ? " " + sizeClass : ""}">
      <span class="avatar-icon-inner">${avatarIconSvg(equipped)}</span>
      ${decoSvg ? `<span class="avatar-decoration avatar-decoration-${decoId}">${decoSvg}</span>` : ""}
    </span>
  `;
}

// Returns the CSS class to apply to a displayed name for the user's
// equipped nameplate style (empty string if none equipped).
function nameplateClass(userData) {
  const equipped = (userData && userData.equipped) || {};
  return equipped.nameplate && equipped.nameplate !== "default" ? `nameplate-${equipped.nameplate}` : "";
}
