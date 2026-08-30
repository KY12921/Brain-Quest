// ------------------------------------------------------------------
// Study Boss — Settings screen: background theme picker + music
// picker. Both preferences are stored in localStorage (device-level,
// same pattern as the light/dark toggle in theme.js), not synced to
// the account, since they're presentation preferences, not progress.
// ------------------------------------------------------------------

const BG_THEMES = [
  { id: "journal", name: "Field Journal", description: "Ink navy & parchment, topographic map lines." },
  { id: "arcade", name: "Night Arcade", description: "Neon violet, cyan, and magenta glow." },
  { id: "leather", name: "Warm Leather", description: "Aged brown leather with real paper grain." },
  { id: "ocean", name: "Ocean Breeze", description: "Cool blues and teals for calm focus.", pro: true },
  { id: "forest", name: "Forest Study", description: "Earthy greens for a natural study space.", pro: true }
];

function applyBgTheme(themeId) {
  document.documentElement.setAttribute("data-bg-theme", themeId);
  try { localStorage.setItem("studyBossBgTheme", themeId); } catch (e) {}
}

function initBgTheme() {
  let saved = "journal";
  try { saved = localStorage.getItem("studyBossBgTheme") || "journal"; } catch (e) {}
  applyBgTheme(saved);
}
initBgTheme();

function renderSettingsScreen() {
  renderBgThemePicker();
  renderMusicPicker();
}

function renderBgThemePicker() {
  const grid = document.getElementById("bg-theme-grid");
  let current = "journal";
  try { current = localStorage.getItem("studyBossBgTheme") || "journal"; } catch (e) {}
  const isPro = currentUserData && currentUserData.isPro;

  grid.innerHTML = BG_THEMES.map(theme => {
    const locked = theme.pro && !isPro;
    return `
    <button class="bg-theme-card${theme.id === current ? " bg-theme-card-active" : ""}${locked ? " bg-theme-card-locked" : ""}" data-theme-id="${theme.id}" data-locked="${locked}">
      <span class="bg-theme-swatch bg-theme-swatch-${theme.id}"></span>
      <p class="bg-theme-name">${theme.name}${theme.pro ? ` <span class="bg-theme-pro-badge">PRO</span>` : ""}</p>
      <p class="bg-theme-desc">${locked ? "Unlock with Pro" : theme.description}</p>
    </button>
  `;
  }).join("");

  grid.querySelectorAll(".bg-theme-card").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.locked === "true") {
        navigateTo("pro-section");
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
  try { current = localStorage.getItem("studyBossMusic") || "off"; } catch (e) {}

  const options = [{ id: "off", name: "Off", description: "No music." },
    ...Object.entries(MUSIC_TRACKS).map(([id, t]) => ({ id, name: t.name, description: t.description }))];

  picker.innerHTML = options.map(opt => `
    <button class="music-option${opt.id === current ? " music-option-active" : ""}" data-track-id="${opt.id}">
      <p class="music-option-name">${opt.name}</p>
      <p class="music-option-desc">${opt.description}</p>
    </button>
  `).join("");

  picker.querySelectorAll(".music-option").forEach(btn => {
    btn.addEventListener("click", () => {
      const trackId = btn.dataset.trackId;
      try { localStorage.setItem("studyBossMusic", trackId); } catch (e) {}
      MusicPlayer.play(trackId);
      renderMusicPicker();
    });
  });

  const volumeSlider = document.getElementById("music-volume");
  volumeSlider.value = MusicPlayer.volume;
  volumeSlider.oninput = () => {
    const v = parseFloat(volumeSlider.value);
    MusicPlayer.setVolume(v);
    try { localStorage.setItem("studyBossMusicVolume", String(v)); } catch (e) {}
  };
}
