// ------------------------------------------------------------------
// Brain Quest — Light/Dark mode toggle.
// Loaded before everything else so the saved theme applies instantly
// (no flash of the wrong theme on page load). Preference is stored in
// the browser's localStorage, so it's remembered on this device only —
// it doesn't sync across devices the way XP does in Firestore.
// ------------------------------------------------------------------

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("theme-toggle-btn");
  if (btn) btn.textContent = theme === "light" ? "🌙" : "☀️";
  try {
    localStorage.setItem("bqTheme", theme);
  } catch (e) {
    // localStorage can fail in some private-browsing modes — theme
    // still works for this session, it just won't be remembered.
  }
}

function initTheme() {
  let saved = "dark";
  try {
    saved = localStorage.getItem("bqTheme") || "dark";
  } catch (e) {
    // fall back to dark if localStorage is unavailable
  }
  applyTheme(saved);

  const btn = document.getElementById("theme-toggle-btn");
  if (btn) {
    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") || "dark";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }
}

// The toggle button already exists in the HTML by the time this
// script tag runs (it's placed right after <body> opens), so we can
// initialize immediately rather than waiting for DOMContentLoaded.
initTheme();
