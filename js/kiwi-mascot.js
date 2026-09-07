// ------------------------------------------------------------------
// version5 — Kiwi mascot, flat 2D SVG.
//
// Previously rendered in real 3D via Three.js (spheres/cones lit by
// real lights). Reverted to a flat, hand-drawn-style SVG per explicit
// request — simpler, loads instantly with no WebGL/CDN dependency,
// and easier to keep consistent everywhere Kiwi appears (the roadmap
// mascot popup, the hint panel, the skip-ahead warning, Study Mode).
// Eyes are deliberately drawn larger than a real kiwi's tiny eyes
// (kiwis are nocturnal and hunt by smell, not sight) for a friendlier,
// more approachable mascot look.
// ------------------------------------------------------------------

const ROADMAP_MASCOT_SVG = `<svg viewBox="0 0 120 120" aria-hidden="true">
  <defs>
    <radialGradient id="kiwi-body-grad" cx="35%" cy="25%" r="80%">
      <stop offset="0%" stop-color="#E8B87C"/>
      <stop offset="55%" stop-color="#C68B4A"/>
      <stop offset="100%" stop-color="#96682F"/>
    </radialGradient>
    <radialGradient id="kiwi-belly-grad" cx="35%" cy="18%" r="85%">
      <stop offset="0%" stop-color="#FFFDF6"/>
      <stop offset="65%" stop-color="#F5E1C4"/>
      <stop offset="100%" stop-color="#DDBD8E"/>
    </radialGradient>
    <linearGradient id="kiwi-wing-grad-l" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#8EE0D3"/>
      <stop offset="100%" stop-color="#438F84"/>
    </linearGradient>
    <linearGradient id="kiwi-wing-grad-r" x1="90%" y1="0%" x2="10%" y2="100%">
      <stop offset="0%" stop-color="#8EE0D3"/>
      <stop offset="100%" stop-color="#438F84"/>
    </linearGradient>
    <radialGradient id="kiwi-eye-grad" cx="38%" cy="28%" r="75%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E4E4E4"/>
    </radialGradient>
    <radialGradient id="kiwi-pupil-grad" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#3A3A3A"/>
      <stop offset="100%" stop-color="#0B141C"/>
    </radialGradient>
    <filter id="kiwi-body-shadow" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.28"/>
    </filter>
  </defs>

  <ellipse cx="61" cy="112" rx="32" ry="6" fill="#000000" opacity="0.16"/>

  <g filter="url(#kiwi-body-shadow)">
    <ellipse cx="60" cy="72" rx="40" ry="36" fill="url(#kiwi-body-grad)"/>
    <ellipse cx="60" cy="82" rx="25" ry="21" fill="url(#kiwi-belly-grad)"/>
    <path d="M28 76 Q17 87 24 100 Q32 89 28 76 Z" fill="url(#kiwi-wing-grad-l)"/>
    <path d="M92 76 Q103 87 96 100 Q88 89 92 76 Z" fill="url(#kiwi-wing-grad-r)"/>
    <path d="M25 44 Q34 27 45 41 Q36 38 25 44 Z" fill="#7A4F26"/>
    <path d="M95 44 Q86 27 75 41 Q84 38 95 44 Z" fill="#7A4F26"/>
    <!-- Eyes: enlarged from the original r=17/7/2.3 for a friendlier,
         more approachable look. -->
    <circle cx="42" cy="56" r="21" fill="url(#kiwi-eye-grad)" stroke="var(--stamp-ink)" stroke-width="2"/>
    <circle cx="78" cy="56" r="21" fill="url(#kiwi-eye-grad)" stroke="var(--stamp-ink)" stroke-width="2"/>
    <circle cx="44.5" cy="58.5" r="10" fill="url(#kiwi-pupil-grad)"/>
    <circle cx="80.5" cy="58.5" r="10" fill="url(#kiwi-pupil-grad)"/>
    <circle cx="48.5" cy="54" r="3.2" fill="#FFFFFF"/>
    <circle cx="84.5" cy="54" r="3.2" fill="#FFFFFF"/>
    <ellipse cx="27" cy="68" rx="6" ry="4" fill="#FF9EAE" opacity="0.75"/>
    <ellipse cx="93" cy="68" rx="6" ry="4" fill="#FF9EAE" opacity="0.75"/>
    <path d="M54 63 Q60 71 66 63 Q60 68 54 63 Z" fill="#FF9142"/>
    <!-- Glossy highlight sheen, upper-left, for a rounded/lit look -->
    <ellipse cx="47" cy="50" rx="15" ry="10" fill="#FFFFFF" opacity="0.20"/>
  </g>
</svg>`;

// The single entry point every call site uses. containerEl: the DOM
// element Kiwi should fill. sizePx: render size in CSS pixels
// (square) — applied directly to the SVG so callers don't need their
// own sizing CSS for every mascot placement.
//
// Every gradient/filter id in the template above (kiwi-body-grad,
// kiwi-eye-grad, etc.) is rewritten below to include a unique
// per-call instance number. This matters because the home screen's
// mascot, the roadmap's, and any hint panel's can all be sitting in
// the DOM at the same time (switching screens hides elements, it
// doesn't remove them) — multiple <svg> elements reusing the exact
// same id="kiwi-body-grad" is invalid HTML/SVG, and which instance a
// given url(#kiwi-body-grad) reference actually resolves to becomes
// undefined behavior, observed as a mascot rendering as a blurry,
// wrong-colored blob instead of the real artwork. Giving each call
// its own instance-numbered ids (kiwi-body-grad-3, etc.) makes every
// id genuinely unique across the whole page, regardless of how many
// mascots are simultaneously present in the DOM.
let _kiwiMascotInstanceCounter = 0;

function renderKiwiMascotInto(containerEl, sizePx) {
  if (!containerEl) return;
  const size = sizePx || 60;
  const instanceId = ++_kiwiMascotInstanceCounter;
  const uniqueSvg = ROADMAP_MASCOT_SVG.replace(/kiwi-/g, `kiwi-${instanceId}-`);
  containerEl.innerHTML = uniqueSvg.replace(
    "<svg viewBox=\"0 0 120 120\" aria-hidden=\"true\">",
    `<svg viewBox="0 0 120 120" width="${size}" height="${size}" aria-hidden="true">`
  );
}
