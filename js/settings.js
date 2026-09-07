// ------------------------------------------------------------------
// Brain Quest — Settings screen: background theme picker + music
// picker. Both preferences are stored in localStorage (device-level,
// same pattern as the light/dark toggle in theme.js), not synced to
// the account, since they're presentation preferences, not progress.
// ------------------------------------------------------------------

const BG_THEMES = [
  { id: "journal", name: "Field Journal", description: "Ink navy & parchment, topographic map lines." },
  { id: "arcade", name: "Night Arcade", description: "Neon violet, cyan, and magenta glow.", pro: true },
  { id: "leather", name: "Warm Leather", description: "Aged brown leather with real paper grain.", pro: true },
  { id: "ocean", name: "Ocean Breeze", description: "Cool blues and teals for calm focus.", pro: true },
  { id: "forest", name: "Forest Study", description: "Earthy greens for a natural study space.", pro: true },
  { id: "sunset", name: "Sunset Glow", description: "Warm orange-and-pink — bought in the Shop.", shopItem: true },
  { id: "galaxy", name: "Midnight Galaxy", description: "Deep purple starfield — bought in the Shop.", shopItem: true }
];

function applyBgTheme(themeId) {
  document.documentElement.setAttribute("data-bg-theme", themeId);
  try { localStorage.setItem("bqBgTheme", themeId); } catch (e) {}
}

function initBgTheme() {
  let saved = "journal";
  try { saved = localStorage.getItem("bqBgTheme") || "journal"; } catch (e) {}
  applyBgTheme(saved);
  applyBgLineAppearance();
}
initBgTheme();

// Called once currentUserData is available (from app.js's login flow)
// to make sure a Pro-gated theme saved from a past Pro period doesn't
// keep applying after Pro lapses or was never actually active.
function enforceThemeAccess() {
  const current = document.documentElement.getAttribute("data-bg-theme") || "journal";
  const theme = BG_THEMES.find(t => t.id === current);
  const isPro = currentUserData && currentUserData.isPro;
  if (theme && theme.pro && !isPro) {
    applyBgTheme("journal");
  }
}

function renderSettingsScreen() {
  renderBgThemePicker();
  renderMusicPicker();
  renderInteractiveToggle();
  renderBgLinesToggle();
  renderBgLineControls();
  document.getElementById("settings-language").value = (currentUserData && currentUserData.language) || "en";
}

// ---------- Reset to defaults ----------
// Every setting below lives in localStorage (device-level, not tied
// to the account), so "reset" means clearing those specific keys and
// re-applying + re-rendering — not touching currentUserData at all.
// Three scoped resets (one per settings group) plus one that just
// calls all three, so a person can reset a single section they messed
// with, or start completely fresh, without those being two totally
// separate code paths to keep in sync.
function resetBgThemeToDefault() {
  try { localStorage.removeItem("bqBgTheme"); } catch (e) {}
  applyBgTheme("journal");
  renderBgThemePicker();
}

function resetGameplaySettingsToDefault() {
  try {
    localStorage.removeItem("bqDisableInteractive");
    localStorage.removeItem("bqDisableBgLines");
    localStorage.removeItem("bqBgLineOpacity");
    localStorage.removeItem("bqBgLineThickness");
  } catch (e) {}
  applyBgLinesSetting();
  applyBgLineAppearance();
  renderInteractiveToggle();
  renderBgLinesToggle();
  renderBgLineControls();
}

function resetMusicToDefault() {
  try {
    localStorage.removeItem("bqMusic");
    localStorage.removeItem("bqMusicVolume");
  } catch (e) {}
  MusicPlayer.stop();
  MusicPlayer.setVolume(0.5);
  renderMusicPicker();
}

function resetAllSettingsToDefault() {
  resetBgThemeToDefault();
  resetGameplaySettingsToDefault();
  resetMusicToDefault();
  document.getElementById("settings-reset-status").textContent = "All settings reset to default.";
}

document.getElementById("reset-bg-theme-btn").addEventListener("click", resetBgThemeToDefault);
document.getElementById("reset-gameplay-settings-btn").addEventListener("click", resetGameplaySettingsToDefault);
document.getElementById("reset-music-btn").addEventListener("click", resetMusicToDefault);
document.getElementById("reset-all-settings-btn").addEventListener("click", () => {
  if (confirm("Reset every setting (background, music, gameplay) back to its default? This won't affect your account, coins, or progress — only these device display/sound preferences.")) {
    resetAllSettingsToDefault();
  }
});

document.getElementById("settings-language").addEventListener("change", () => {
  const lang = document.getElementById("settings-language").value;
  currentUserData.language = lang;
  applyTranslations();
  if (currentUser) {
    db.collection("users").doc(currentUser.uid).update({ language: lang });
  }
});

function isInteractiveDisabled() {
  try { return localStorage.getItem("bqDisableInteractive") === "true"; } catch (e) { return false; }
}

function renderInteractiveToggle() {
  const toggle = document.getElementById("disable-interactive-toggle");
  toggle.checked = isInteractiveDisabled();
  toggle.onchange = () => {
    try { localStorage.setItem("bqDisableInteractive", toggle.checked ? "true" : "false"); } catch (e) {}
  };
}

function isBgLinesDisabled() {
  try { return localStorage.getItem("bqDisableBgLines") === "true"; } catch (e) { return false; }
}

function applyBgLinesSetting() {
  document.documentElement.classList.toggle("bg-lines-off", isBgLinesDisabled());
}

function renderBgLinesToggle() {
  const toggle = document.getElementById("disable-bg-lines-toggle");
  toggle.checked = isBgLinesDisabled();
  toggle.onchange = () => {
    try { localStorage.setItem("bqDisableBgLines", toggle.checked ? "true" : "false"); } catch (e) {}
    applyBgLinesSetting();
  };
}

// Darkness (opacity) and thickness of the background contour lines —
// same device-level localStorage pattern as the theme/music/on-off
// settings above. Applied as CSS custom properties that
// body::before's gradient (see css/style.css) reads directly, with
// defaults matching the original hardcoded values (0.4 opacity, 1px
// thickness) exactly, so anyone who's never touched these sees no
// change from before these settings existed.
function getBgLineOpacity() {
  try {
    const v = parseFloat(localStorage.getItem("bqBgLineOpacity"));
    return Number.isFinite(v) ? v : 0.4;
  } catch (e) { return 0.4; }
}

function getBgLineThickness() {
  try {
    const v = parseFloat(localStorage.getItem("bqBgLineThickness"));
    return Number.isFinite(v) ? v : 1;
  } catch (e) { return 1; }
}

function applyBgLineAppearance() {
  document.documentElement.style.setProperty("--bg-line-opacity", getBgLineOpacity());
  document.documentElement.style.setProperty("--bg-line-thickness", getBgLineThickness() + "px");
}

function renderBgLineControls() {
  const opacitySlider = document.getElementById("bg-line-opacity-slider");
  const thicknessSlider = document.getElementById("bg-line-thickness-slider");
  opacitySlider.value = getBgLineOpacity();
  thicknessSlider.value = getBgLineThickness();

  opacitySlider.oninput = () => {
    try { localStorage.setItem("bqBgLineOpacity", opacitySlider.value); } catch (e) {}
    applyBgLineAppearance();
  };
  thicknessSlider.oninput = () => {
    try { localStorage.setItem("bqBgLineThickness", thicknessSlider.value); } catch (e) {}
    applyBgLineAppearance();
  };
}

function renderBgThemePicker() {
  const grid = document.getElementById("bg-theme-grid");
  let current = "journal";
  try { current = localStorage.getItem("bqBgTheme") || "journal"; } catch (e) {}
  const isPro = currentUserData && currentUserData.isPro;
  const ownedThemes = (currentUserData.ownedCosmetics && currentUserData.ownedCosmetics.themes) || [];

  grid.innerHTML = BG_THEMES.map(theme => {
    const locked = (theme.pro && !isPro) || (theme.shopItem && !ownedThemes.includes(theme.id));
    const badge = theme.pro ? `<span class="bg-theme-pro-badge">PRO</span>` : (theme.shopItem ? `<span class="bg-theme-pro-badge bg-theme-shop-badge">SHOP</span>` : "");
    return `
    <button class="bg-theme-card${theme.id === current ? " bg-theme-card-active" : ""}${locked ? " bg-theme-card-locked" : ""}" data-theme-id="${theme.id}" data-locked="${locked}" data-shop-item="${!!theme.shopItem}">
      <span class="bg-theme-swatch bg-theme-swatch-${theme.id}"></span>
      <p class="bg-theme-name">${theme.name}${badge}</p>
      <p class="bg-theme-desc">${locked ? (theme.shopItem ? "Unlock in the Shop" : "Unlock with Pro") : theme.description}</p>
    </button>
  `;
  }).join("");

  grid.querySelectorAll(".bg-theme-card").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.locked === "true") {
        navigateTo(btn.dataset.shopItem === "true" ? "shop-section" : "pro-section");
        return;
      }
      applyBgTheme(btn.dataset.themeId);
      renderBgThemePicker();
    });
  });
}

function renderMusicPicker() {
  const picker = document.getElementById("music-picker");
  let current = "off";
  try { current = localStorage.getItem("bqMusic") || "off"; } catch (e) {}
  const ownedMusic = (currentUserData.ownedCosmetics && currentUserData.ownedCosmetics.music) || [];

  const options = [{ id: "off", name: "Off", description: "No music." },
    ...Object.entries(MUSIC_TRACKS).map(([id, t]) => ({ id, name: t.name, description: t.description, shopItem: t.shopItem }))];

  picker.innerHTML = options.map(opt => {
    const locked = opt.shopItem && !ownedMusic.includes(opt.id);
    return `
    <button class="music-option${opt.id === current ? " music-option-active" : ""}${locked ? " music-option-locked" : ""}" data-track-id="${opt.id}" data-locked="${locked}">
      <p class="music-option-name">${opt.name}${opt.shopItem ? ` <span class="bg-theme-pro-badge bg-theme-shop-badge">SHOP</span>` : ""}</p>
      <p class="music-option-desc">${locked ? "Unlock in the Shop" : opt.description}</p>
    </button>
  `;
  }).join("");

  picker.querySelectorAll(".music-option").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.locked === "true") {
        navigateTo("shop-section");
        return;
      }
      const trackId = btn.dataset.trackId;
      try { localStorage.setItem("bqMusic", trackId); } catch (e) {}
      MusicPlayer.play(trackId);
      renderMusicPicker();
    });
  });

  const volumeSlider = document.getElementById("music-volume");
  volumeSlider.value = MusicPlayer.volume;
  volumeSlider.oninput = () => {
    const v = parseFloat(volumeSlider.value);
    MusicPlayer.setVolume(v);
    try { localStorage.setItem("bqMusicVolume", String(v)); } catch (e) {}
  };
}

// Applied immediately on script load, not just when the Settings
// screen renders, so the saved preference takes effect right away
// rather than only after the user happens to open Settings.
applyBgLinesSetting();
