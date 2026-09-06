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
  // More detailed than a simple blob silhouette — separate head,
  // beak, wings with individual feather points, and a tail, so it
  // reads as an actual bird rather than an abstract flame shape.
  // Still hand-coded vector art, not photorealistic — that's a real
  // limit of inline SVG, not something more paths alone fixes.
  phoenix: `<svg viewBox="0 0 24 24">
    <defs>
      <linearGradient id="phoenixBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFD23F"/>
        <stop offset="60%" stop-color="#FF6B35"/>
        <stop offset="100%" stop-color="#C1121F"/>
      </linearGradient>
      <linearGradient id="phoenixWing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FF9142"/>
        <stop offset="100%" stop-color="#B00E1A"/>
      </linearGradient>
    </defs>
    <path d="M4 12c-1 1.5-1 3.5 0.5 4.5-0.8-2 0-3.5 1.5-4.5-1 0.3-1.5 0-2-2z" fill="url(#phoenixWing)"/>
    <path d="M20 12c1 1.5 1 3.5-0.5 4.5 0.8-2 0-3.5-1.5-4.5 1 0.3 1.5 0 2-2z" fill="url(#phoenixWing)"/>
    <path d="M12 18c-0.6 2-1.6 3.2-1 4.5 0.9-0.8 1.4-1.8 1-3 0.5 1.4 1.2 2.3 2 3 0.5-1.4-0.4-2.8-1-4.5z" fill="url(#phoenixWing)"/>
    <ellipse cx="12" cy="13" rx="4.4" ry="5.6" fill="url(#phoenixBody)"/>
    <circle cx="12" cy="7.5" r="2.6" fill="url(#phoenixBody)"/>
    <path d="M9.8 7.2l-2.2-0.6 1.6 1.6z" fill="#FF9142"/>
    <circle cx="11.3" cy="7" r="0.55" fill="#4A0800"/>
    <path d="M10.8 4.3c0.4-1.2 1.2-1.8 1.8-2.6-0.1 1-0.2 1.8 0.3 2.7-0.9-0.4-1.4-0.3-2.1-0.1z" fill="#FFD23F"/>
  </svg>`,
  // Reptilian: distinct snout with jaw line, brow horns, a curved
  // serpentine body, and membrane wings with visible finger-bone
  // lines instead of one flat wing shape.
  dragon: `<svg viewBox="0 0 24 24">
    <defs>
      <linearGradient id="dragonBody" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#8FD694"/>
        <stop offset="55%" stop-color="#2F9E44"/>
        <stop offset="100%" stop-color="#1B5E20"/>
      </linearGradient>
    </defs>
    <path d="M3 14c1.5 1.5 2.8 1.6 4-0.2 0.6 1.6 2 2 3.3 0.9 0.4 1.8 1.8 2.6 3.2 1.8 0.3 1.6 1.6 2.5 3.5 2-1 1.6-3.4 2.4-5.4 1.6-0.9 0.9-2.8 1.2-4.2 0.2-1.5 0.9-3.3 0.4-4.1-0.8-1 0.1-2.3-0.4-2.8-1.5-0.4-1.4 0.3-3.1 2.5-4z" fill="#1B5E20" opacity="0.35"/>
    <path d="M4 13.5c1.8-0.2 2.6-1.4 2.6-3 0.9 1 1.9 1.1 2.9 0.2 0.6 1.8 2.4 2.2 3.7 1 0.6 3 2.7 4.3 5.3 3.6-1.3 1.6-3.7 2.1-5.6 1-1 0.8-2.7 0.7-3.7-0.3-1.3 0.6-2.9-0.1-3.4-1.4-1.2-0.1-2.1-0.7-1.8-1.1z" fill="url(#dragonBody)"/>
    <path d="M6.4 10.6c0.2-1.2 1-1.9 1.9-1.6-0.3 0.6-0.4 1.1-0.1 1.8z" fill="#1B5E20"/>
    <path d="M8.5 9.4c0.1-1 0.7-1.6 1.5-1.4-0.2 0.5-0.3 0.9 0 1.5z" fill="#1B5E20"/>
    <ellipse cx="5.3" cy="11.4" rx="0.7" ry="0.5" fill="#FF3B30"/>
    <path d="M3.6 11.9l-1.4-0.4 1 1z" fill="#1B5E20"/>
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
      <linearGradient id="phoenixUltraWing" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FFD23F"/>
        <stop offset="100%" stop-color="#7B1FA2"/>
      </linearGradient>
    </defs>
    <path d="M3.5 12c-1.2 1.6-1.2 3.8 0.5 5-1-2.2 0-4 1.7-5-1.2 0.3-1.7 0-2.2-2z" fill="url(#phoenixUltraWing)"/>
    <path d="M20.5 12c1.2 1.6 1.2 3.8-0.5 5 1-2.2 0-4-1.7-5 1.2 0.3 1.7 0 2.2-2z" fill="url(#phoenixUltraWing)"/>
    <path d="M12 18.5c-0.7 2.2-1.8 3.5-1.1 5 1-0.9 1.5-2 1.1-3.3 0.6 1.5 1.3 2.5 2.2 3.3 0.5-1.5-0.4-3-2.2-5z" fill="url(#phoenixUltraWing)"/>
    <ellipse cx="12" cy="13" rx="4.6" ry="5.8" fill="url(#phoenixUltraGrad)"/>
    <circle cx="12" cy="7.3" r="2.7" fill="url(#phoenixUltraGrad)"/>
    <path d="M9.7 7l-2.3-0.6 1.7 1.6z" fill="#FFD23F"/>
    <circle cx="11.2" cy="6.8" r="0.55" fill="#3D0059"/>
    <path d="M10.7 4c0.4-1.3 1.3-1.9 1.9-2.8-0.1 1.1-0.2 1.9 0.3 2.9-0.9-0.4-1.5-0.3-2.2-0.1z" fill="#FFF3B0"/>
  </svg>`
};

const DECORATION_SVG = {
  crown: '<svg viewBox="0 0 24 24" fill="#F4C430" stroke="#B8860B" stroke-width="0.5"><path d="M3 18h18l-1-9-5 4-3-6-3 6-5-4-1 9z"/></svg>',
  sparkle: '<svg viewBox="0 0 24 24" fill="#3FE8D0" stroke="#1E9E8E" stroke-width="0.4"><path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="#FFD23F" stroke="#B8860B" stroke-width="0.4"><path d="M12 2l2.9 6.6 7.1 0.7-5.4 4.8 1.6 7-6.2-3.7-6.2 3.7 1.6-7-5.4-4.8 7.1-0.7z"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="#FF6B9D" stroke="#C1121F" stroke-width="0.4"><path d="M12 20s-7-4.5-9.5-9C1 8 2.5 4 6.5 4c2 0 3.5 1.2 4.5 2.7C12 5.2 13.5 4 15.5 4 19.5 4 21 8 19.5 11c-2.5 4.5-9.5 9-9.5 9z"/></svg>'
};

// A clean circular ring, not a pattern of separate shapes — colored
// and (for some frames) animated via CSS to still feel distinct.
function generateCircleFrameSvg(color) {
  return `<svg viewBox="0 0 100 100" class="frame-ring-svg"><circle cx="50" cy="50" r="47" fill="none" stroke="${color}" stroke-width="5"/></svg>`;
}

const FRAME_RING_SVG = {
  gold: generateCircleFrameSvg("#D4A54A"),
  fire: generateCircleFrameSvg("#FF6B35"),
  ice: generateCircleFrameSvg("#7DE8F0"),
  electric: generateCircleFrameSvg("#F7E733")
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
