// ------------------------------------------------------------------
// Brain Quest — cosmetic rendering shared by Profile and Leaderboard.
//
// Nothing here decides what's OWNED (that's ownedCosmetics, tracked
// in shop.js) — this just renders whatever is currently EQUIPPED for
// a given user's data, so both Profile and Leaderboard stay visually
// consistent using the same source of truth.
// ------------------------------------------------------------------

// Full-color filled icons (gradients + solid shapes), not line art —
// meant to actually look like the thing, not a stroke outline of it.
const AVATAR_ICON_SVG = {
  default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8"/></svg>',
  phoenix: `<svg viewBox="0 0 24 24">
    <defs>
      <linearGradient id="phoenixGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFD23F"/>
        <stop offset="55%" stop-color="#FF6B35"/>
        <stop offset="100%" stop-color="#C1121F"/>
      </linearGradient>
    </defs>
    <path d="M12 2c1.5 2.5 3.5 3.5 5.5 3.5-1 2-2.5 3-2.5 5 1.8 0 3.5-0.8 4.5-2.5 0.3 4.5-3 8-7.5 8s-7.8-3.5-7.5-8c1 1.7 2.7 2.5 4.5 2.5 0-2-1.5-3-2.5-5 2 0 4-1 5.5-3.5z" fill="url(#phoenixGrad)"/>
    <circle cx="10.5" cy="9.5" r="0.8" fill="#7A0C00"/>
  </svg>`,
  dragon: `<svg viewBox="0 0 24 24">
    <defs>
      <linearGradient id="dragonGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8FD694"/>
        <stop offset="60%" stop-color="#2F9E44"/>
        <stop offset="100%" stop-color="#1B5E20"/>
      </linearGradient>
    </defs>
    <path d="M2.5 14c2.2-0.8 3.3-2.8 3.3-5 1.1 1 2.2 1 3.3 0 1.1 2 3.3 2 4.4 1 1.1 3 3.3 4 5.5 3-1.1 2-3.3 3-5.5 3-1.1 1-3.3 2-5.5 1-2.2 1-4.4 0-5.5-1v-2z" fill="url(#dragonGrad)"/>
    <circle cx="6.5" cy="10.2" r="0.9" fill="#FF3B30"/>
    <path d="M9 8.5l1.2-2 0.6 1.6z" fill="#1B5E20"/>
  </svg>`,
  wizard: `<svg viewBox="0 0 24 24">
    <defs>
      <linearGradient id="wizardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#B084FF"/>
        <stop offset="100%" stop-color="#5B2C9E"/>
      </linearGradient>
    </defs>
    <path d="M12 2l7 15H5z" fill="url(#wizardGrad)"/>
    <circle cx="12" cy="8" r="1.1" fill="#FFD23F"/>
    <path d="M4 19h16v2H4z" fill="#3D1E6B"/>
  </svg>`,
  ninja: `<svg viewBox="0 0 24 24">
    <defs>
      <linearGradient id="ninjaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#4A4A52"/>
        <stop offset="100%" stop-color="#1A1A1F"/>
      </linearGradient>
    </defs>
    <circle cx="12" cy="12" r="9" fill="url(#ninjaGrad)"/>
    <rect x="4" y="10" width="16" height="4" fill="#E8102A"/>
    <path d="M9 11.5h2v1.5H9zM13 11.5h2v1.5h-2z" fill="#FFFFFF"/>
  </svg>`,
  phoenixUltra: `<svg viewBox="0 0 24 24">
    <defs>
      <linearGradient id="phoenixUltraGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFF3B0"/>
        <stop offset="35%" stop-color="#FFD23F"/>
        <stop offset="70%" stop-color="#FF6B35"/>
        <stop offset="100%" stop-color="#7B1FA2"/>
      </linearGradient>
    </defs>
    <path d="M12 1.5c1.7 3 4 4 6.2 4-1.2 2.2-3 3.4-3 5.6 2 0 4-1 5.3-3 0.4 5-3.5 9-8.5 9s-8.9-4-8.5-9c1.3 2 3.3 3 5.3 3 0-2.2-1.8-3.4-3-5.6 2.2 0 4.5-1 6.2-4z" fill="url(#phoenixUltraGrad)"/>
    <circle cx="10" cy="10" r="0.9" fill="#4A0072"/>
  </svg>`
};

const DECORATION_SVG = {
  crown: '<svg viewBox="0 0 24 24" fill="#F4C430" stroke="#B8860B" stroke-width="0.5"><path d="M3 18h18l-1-9-5 4-3-6-3 6-5-4-1 9z"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="#3FE8D0" stroke="#1E9E8E" stroke-width="0.4"><path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="#FFD23F" stroke="#B8860B" stroke-width="0.4"><path d="M12 2l2.9 6.6 7.1 0.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.8 7.1-0.7z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="#FF6B9D" stroke="#C1121F" stroke-width="0.4"><path d="M12 20s-7-4.5-9.5-9C1 8 2.5 4 6.5 4c2 0 3.5 1.2 4.5 2.7C12 5.2 13.5 4 15.5 4 19.5 4 21 8 19.5 11c-2.5 4.5-9.5 9-9.5 9z"/></svg>'
};

// Generates a ring of small decorative shapes evenly spaced around a
// circle — the "Discord-style patterned frame" look, built
// programmatically with trig instead of hand-placed coordinates.
function generateRingSvg(shapeType, colorMain, colorAccent, count) {
  const shapes = [];
  const radius = 46;
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
    const x = (50 + radius * Math.cos(angle)).toFixed(1);
    const y = (50 + radius * Math.sin(angle)).toFixed(1);
    const rotation = (angle * 180 / Math.PI + 90).toFixed(1);
    if (shapeType === "leaf") {
      shapes.push(`<ellipse cx="${x}" cy="${y}" rx="3.2" ry="6.5" fill="${colorMain}" stroke="${colorAccent}" stroke-width="0.4" transform="rotate(${rotation} ${x} ${y})"/>`);
    } else if (shapeType === "flame") {
      shapes.push(`<path d="M${x} ${(y - 6)} q3.2 4 0 8.5 q-3.2-2 0-8.5z" fill="${colorMain}" stroke="${colorAccent}" stroke-width="0.3" transform="rotate(${rotation} ${x} ${y})"/>`);
    }
  }
  return `<svg viewBox="0 0 100 100" class="frame-ring-svg">${shapes.join("")}</svg>`;
}

const FRAME_RING_SVG = {
  gold: generateRingSvg("leaf", "#D4A54A", "#8B6A1F", 8),
  fire: generateRingSvg("flame", "#FF6B35", "#C1121F", 10),
  ice: generateRingSvg("leaf", "#7DE8F0", "#2F8A9E", 8),
  electric: generateRingSvg("flame", "#F7E733", "#B8A800", 12)
};

// Returns the raw SVG markup for a user's equipped avatar icon.
function avatarIconSvg(equipped) {
  const id = (equipped && equipped.avatarIcon) || "default";
  return AVATAR_ICON_SVG[id] || AVATAR_ICON_SVG.default;
}

// Returns a full avatar element (icon + frame ring + decoration) as
// an HTML string, ready to drop into Profile or a Leaderboard row.
function renderAvatarCosmetic(userData, sizeClass) {
  const equipped = (userData && userData.equipped) || {};
  const frameId = equipped.frame && equipped.frame !== "none" ? equipped.frame : null;
  const frameSvg = frameId ? (FRAME_RING_SVG[frameId] || "") : "";
  const decoId = equipped.decoration && equipped.decoration !== "none" ? equipped.decoration : null;
  const decoSvg = decoId ? DECORATION_SVG[decoId] : "";

  return `
    <span class="avatar-cosmetic-wrap${frameId ? " has-frame" : ""}${sizeClass ? " " + sizeClass : ""}">
      ${frameSvg ? `<span class="avatar-frame-ring avatar-frame-ring-${frameId}">${frameSvg}</span>` : ""}
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
