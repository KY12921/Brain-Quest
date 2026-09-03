// ------------------------------------------------------------------
// Brain Quest — core app: auth, navigation, subject quests, and the
// shared quiz engine used by Quests, Boss Fight, and Duel modes.
// ------------------------------------------------------------------

const XP_PER_CORRECT_ANSWER = 20;
const FREE_LESSON_CAP = 3; // free tier can reach at most Lesson 3 on any Brain Quest roadmap

// A small version of the Home screen's owl mascot, used to point at
// whichever lesson is "next up" right after finishing one.
// Ollie, given a genuinely more dimensional look via layered radial/
// linear gradients (simulating light hitting a rounded surface from
// the upper-left), a soft SVG drop-shadow on the body silhouette, a
// flat ground-shadow ellipse beneath for grounding, and a glossy
// highlight sheen. This is still 2D vector art — true 3D geometry
// would need a real 3D engine (Three.js or similar), which is a much
// bigger, disproportionate lift for something that only ever appears
// icon-sized in hint panels and the roadmap. feDropShadow and SVG
// gradients/filters are all well-supported (baseline since 2020),
// unlike color-mix() which caused real trouble on Safari earlier.
const ROADMAP_MASCOT_SVG = `<svg viewBox="0 0 120 120" aria-hidden="true">
  <defs>
    <radialGradient id="ollie-body-grad" cx="35%" cy="25%" r="80%">
      <stop offset="0%" stop-color="#E8B87C"/>
      <stop offset="55%" stop-color="#C68B4A"/>
      <stop offset="100%" stop-color="#96682F"/>
    </radialGradient>
    <radialGradient id="ollie-belly-grad" cx="35%" cy="18%" r="85%">
      <stop offset="0%" stop-color="#FFFDF6"/>
      <stop offset="65%" stop-color="#F5E1C4"/>
      <stop offset="100%" stop-color="#DDBD8E"/>
    </radialGradient>
    <linearGradient id="ollie-wing-grad-l" x1="10%" y1="0%" x2="90%" y2="100%">
      <stop offset="0%" stop-color="#8EE0D3"/>
      <stop offset="100%" stop-color="#438F84"/>
    </linearGradient>
    <linearGradient id="ollie-wing-grad-r" x1="90%" y1="0%" x2="10%" y2="100%">
      <stop offset="0%" stop-color="#8EE0D3"/>
      <stop offset="100%" stop-color="#438F84"/>
    </linearGradient>
    <radialGradient id="ollie-eye-grad" cx="38%" cy="28%" r="75%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#E4E4E4"/>
    </radialGradient>
    <radialGradient id="ollie-pupil-grad" cx="35%" cy="30%" r="75%">
      <stop offset="0%" stop-color="#3A3A3A"/>
      <stop offset="100%" stop-color="#0B141C"/>
    </radialGradient>
    <filter id="ollie-body-shadow" x="-30%" y="-20%" width="160%" height="150%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.28"/>
    </filter>
  </defs>

  <ellipse cx="61" cy="112" rx="32" ry="6" fill="#000000" opacity="0.16"/>

  <g filter="url(#ollie-body-shadow)">
    <ellipse cx="60" cy="72" rx="40" ry="36" fill="url(#ollie-body-grad)"/>
    <ellipse cx="60" cy="82" rx="25" ry="21" fill="url(#ollie-belly-grad)"/>
    <path d="M28 76 Q17 87 24 100 Q32 89 28 76 Z" fill="url(#ollie-wing-grad-l)"/>
    <path d="M92 76 Q103 87 96 100 Q88 89 92 76 Z" fill="url(#ollie-wing-grad-r)"/>
    <path d="M25 44 Q34 27 45 41 Q36 38 25 44 Z" fill="#7A4F26"/>
    <path d="M95 44 Q86 27 75 41 Q84 38 95 44 Z" fill="#7A4F26"/>
    <circle cx="42" cy="55" r="17" fill="url(#ollie-eye-grad)" stroke="var(--stamp-ink)" stroke-width="2"/>
    <circle cx="78" cy="55" r="17" fill="url(#ollie-eye-grad)" stroke="var(--stamp-ink)" stroke-width="2"/>
    <circle cx="44" cy="57" r="7" fill="url(#ollie-pupil-grad)"/>
    <circle cx="80" cy="57" r="7" fill="url(#ollie-pupil-grad)"/>
    <circle cx="47" cy="53.5" r="2.3" fill="#FFFFFF"/>
    <circle cx="83" cy="53.5" r="2.3" fill="#FFFFFF"/>
    <ellipse cx="30" cy="66" rx="6" ry="4" fill="#FF9EAE" opacity="0.75"/>
    <ellipse cx="90" cy="66" rx="6" ry="4" fill="#FF9EAE" opacity="0.75"/>
    <path d="M54 63 Q60 71 66 63 Q60 68 54 63 Z" fill="#FF9142"/>
    <!-- Glossy highlight sheen, upper-left, for a rounded/lit look -->
    <ellipse cx="47" cy="50" rx="15" ry="10" fill="#FFFFFF" opacity="0.20"/>
  </g>
</svg>`;
const XP_PER_LEVEL = 1000;
const MAX_HEARTS = 5;

let currentUser = null;
let currentUserData = null; // { name, xp, isPro, completedSubjects, bossLevels, mission }
let currentQuiz = null; // { mode: 'quest'|'boss'|'duel', subjectId, subjectName, questions, index, correctCount, wrongCount, duelId, duelRole }

function levelForXp(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

// ---------- Screen helpers ----------
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  const target = document.getElementById(id);
  target.classList.remove("hidden");
  target.classList.remove("screen-enter");
  void target.offsetWidth; // force reflow so the animation replays every time
  target.classList.add("screen-enter");
  // Remove the class once the entrance animation finishes — leaving
  // it on indefinitely keeps a `transform` applied to the screen
  // (held by animation-fill-mode: both), which creates a new
  // containing block for any position:fixed element nested inside it
  // (like a modal). That silently broke fixed positioning for modals
  // on tall/scrolled screens — they'd anchor to the screen's own box
  // instead of the true viewport. 300ms comfortably covers the 0.28s
  // animation.
  setTimeout(() => target.classList.remove("screen-enter"), 300);
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.nav === id));
}

function setTopBarVisible(visible) {
  document.getElementById("top-bar").classList.toggle("hidden", !visible);
}

// Shown when a banned account signs in. Signs them straight back out
// so they can't just navigate around the app while banned — banning
// should actually stop access, not just hide a nav button. The flag
// below tells the auth-state-change handler (which normally shows the
// login screen the instant anyone signs out) to show the banned
// notice instead, just this once — otherwise the login screen would
// immediately overwrite this message before the user could read it.
let _wasBannedSignOut = false;
let isGuestMode = false;

// Guest mode's core guarantee ("progress doesn't save") is enforced
// here, in one place, rather than by touching every one of the many
// scattered Firestore write calls throughout the app individually —
// that would be much larger and far easier to miss a spot on. This
// overrides db.collection so that ANY future call to
// db.collection("users").doc(<the guest's own uid>), from anywhere in
// the app, quietly no-ops instead of writing, while every other
// collection/uid keeps working normally (so guests can still browse
// the leaderboard, etc.).
function enableGuestModeFirestoreGuard(guestUid) {
  const realCollectionFn = db.collection.bind(db);
  db.collection = function (name) {
    const realCol = realCollectionFn(name);
    if (name !== "users") return realCol;
    const realDocFn = realCol.doc.bind(realCol);
    realCol.doc = function (id) {
      if (id === guestUid) {
        return {
          get: () => Promise.resolve({ exists: false, data: () => ({}), id: guestUid }),
          set: () => Promise.resolve(),
          update: () => Promise.resolve(),
          onSnapshot: (cb) => { cb({ data: () => ({}) }); return () => {}; }
        };
      }
      return realDocFn(id);
    };
    return realCol;
  };
}
function showBannedScreen() {
  _wasBannedSignOut = true;
  setTopBarVisible(false);
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));

  document.getElementById("banned-reason").textContent = currentUserData.banReason
    ? `Reason: ${currentUserData.banReason}`
    : "";
  document.getElementById("banned-expiry").textContent = currentUserData.bannedUntil
    ? `This ban lifts on ${new Date(currentUserData.bannedUntil).toLocaleDateString()} at ${new Date(currentUserData.bannedUntil).toLocaleTimeString()}.`
    : "This is a permanent ban.";

  document.getElementById("banned-section").classList.remove("hidden");
  auth.signOut();
}

// ---------- XP HUD ----------
function updateXpHud(xp) {
  animateXpCounter(document.getElementById("xp-count"), xp);
  document.getElementById("level-badge").textContent = "Lv. " + levelForXp(xp);
  const withinLevel = xp % XP_PER_LEVEL;
  const pct = (withinLevel / XP_PER_LEVEL) * 100;
  document.getElementById("xp-bar-fill").style.width = pct + "%";
}

// Ticks the displayed number up (or down) toward the target rather
// than jumping instantly — a small satisfying touch on every XP gain.
const _raf = (typeof requestAnimationFrame !== "undefined") ? requestAnimationFrame : (cb => setTimeout(() => cb(Date.now()), 16));
const _now = (typeof performance !== "undefined" && performance.now) ? () => performance.now() : () => Date.now();

function animateXpCounter(el, target) {
  const start = parseInt(el.textContent, 10) || 0;
  if (start === target) return;
  const duration = 500;
  const startTime = _now();
  function step(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 2); // ease-out
    const current = Math.round(start + (target - start) * eased);
    el.textContent = current;
    if (progress < 1) _raf(step);
  }
  _raf(step);
}

// ---------- Level-up overlay ----------
function playLevelUpAnimation(newLevel) {
  const overlay = document.getElementById("level-up-overlay");
  document.getElementById("level-up-number").textContent = newLevel;
  overlay.classList.remove("hidden");
  overlay.classList.remove("level-up-animate");
  // Force a reflow so the animation class can be re-added and replay
  // correctly even if the overlay was shown very recently.
  void overlay.offsetWidth;
  overlay.classList.add("level-up-animate");
}

document.getElementById("level-up-close-btn").addEventListener("click", () => {
  document.getElementById("level-up-overlay").classList.add("hidden");
});

// Call this after any XP change to persist + refresh the HUD.
async function addXp(amount) {
  const oldXp = currentUserData.xp || 0;
  const newXp = oldXp + amount;
  currentUserData.xp = newXp;
  currentUserData.weeklyXP = (currentUserData.weeklyXP || 0) + amount;
  updateXpHud(currentUserData.xp);
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      xp: firebase.firestore.FieldValue.increment(amount),
      weeklyXP: firebase.firestore.FieldValue.increment(amount)
    });
  }
  registerMissionEvent("xpEarnedToday", amount);

  const oldLevel = levelForXp(oldXp);
  const newLevel = levelForXp(newXp);
  if (newLevel > oldLevel) {
    playLevelUpAnimation(newLevel);
  }
}

async function addCoins(amount) {
  // Ultra: 1.5x coins on everything earned. Pro: 1.25x. Free: 1x.
  const multiplier = currentUserData.isUltra ? 1.5 : (currentUserData.isPro ? 1.25 : 1);
  const finalAmount = Math.round(amount * multiplier);
  currentUserData.coins = (currentUserData.coins || 0) + finalAmount;
  updateCoinHud();
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      coins: firebase.firestore.FieldValue.increment(finalAmount)
    });
  }
}

const ULTRA_DAILY_COINS = 100;

// Ultra members get 100 free coins once per calendar day, granted at
// login. This bypasses the tier multiplier in addCoins() on purpose —
// it's a flat daily perk, not something that should also get boosted.
async function grantUltraDailyCoins() {
  if (!currentUserData.isUltra) return;
  const today = localDateString();
  if (currentUserData.lastUltraCoinBonusDate === today) return;

  currentUserData.lastUltraCoinBonusDate = today;
  currentUserData.coins = (currentUserData.coins || 0) + ULTRA_DAILY_COINS;
  updateCoinHud();
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      lastUltraCoinBonusDate: today,
      coins: firebase.firestore.FieldValue.increment(ULTRA_DAILY_COINS)
    });
  }
}

function updateCoinHud() {
  const el = document.getElementById("coin-count");
  if (el) el.textContent = currentUserData.coins || 0;
}

function navigateTo(target) {
  const guestLockedScreens = { "shop-section": "the Shop", "tutor-section": "the AI Tutor" };
  if (isGuestMode && guestLockedScreens[target]) {
    alert(`${guestLockedScreens[target]} isn't available in Guest Mode — create a free account to unlock it.`);
    return;
  }
  showScreen(target);
  if (target === "home-section") renderHome();
  if (target === "subjects-section") renderSubjects();
  if (target === "boss-section") renderBossGrid();
  if (target === "missions-section") renderMissions();
  if (target === "leaderboard-section") renderLeaderboard();
  if (target === "friends-section") renderFriendsScreen();
  if (target === "clans-section") renderClansScreen();
  if (target === "duel-section") renderDuelMenu();
  if (target === "trivia-section") renderTriviaGrid();
  if (target === "achievements-section") renderAchievementsScreen();
  if (target === "shop-section") renderShopScreen();
  if (target === "team-battle-section") renderTeamBattleMenu();
  if (target === "photo-help-section") renderPhotoHelpScreen();
  if (target === "settings-section") renderSettingsScreen();
  if (target === "profile-section") renderProfileScreen();
  if (target === "tutor-section") renderTutorScreen();
  if (target === "study-mode-section") renderStudyModeScreen();
  if (target === "pro-section") renderProScreen();
}

// ---------- Daily streak ----------
// Returns YYYY-MM-DD in the user's LOCAL calendar day, not UTC.
// This matters: toISOString() is UTC-based, so anyone not in the UTC
// timezone would see their "day" roll over at some random local hour
// (e.g. 7pm for US Eastern) instead of local midnight — causing
// streaks, daily missions, and the AI Tutor's daily limit to
// sometimes advance a day early if you're active late in the evening.
function localDateString(date) {
  const d = date || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayDateString() {
  return localDateString();
}

async function updateStreak() {
  const today = todayDateString();
  if (currentUserData.lastActiveDate === today) return; // already counted today

  const yesterday = localDateString(new Date(Date.now() - 86400000));
  let newStreak;
  let freezeUsed = false;

  if (currentUserData.lastActiveDate === yesterday) {
    newStreak = (currentUserData.streakCount || 0) + 1;
  } else if (currentUserData.lastActiveDate) {
    // Figure out exactly how many days had zero activity in between —
    // if it's precisely one missed day and a Streak Freeze (bought in
    // the Shop) is available, consume it and keep the streak alive
    // instead of resetting to 1.
    const lastActive = new Date(currentUserData.lastActiveDate + "T00:00:00");
    const todayDate = new Date(today + "T00:00:00");
    const daysMissed = Math.round((todayDate - lastActive) / 86400000) - 1;

    if (daysMissed === 1 && (currentUserData.streakFreezes || 0) > 0) {
      newStreak = (currentUserData.streakCount || 0) + 1;
      freezeUsed = true;
    } else {
      newStreak = 1;
    }
  } else {
    newStreak = 1; // first ever visit
  }

  const activeDates = [...(currentUserData.activeDates || []), today].slice(-30); // keep last 30 days

  currentUserData.streakCount = newStreak;
  currentUserData.lastActiveDate = today;
  currentUserData.activeDates = activeDates;
  if (freezeUsed) currentUserData.streakFreezes = (currentUserData.streakFreezes || 0) - 1;

  const updates = { streakCount: newStreak, lastActiveDate: today, activeDates: activeDates };
  if (freezeUsed) updates.streakFreezes = firebase.firestore.FieldValue.increment(-1);

  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update(updates);
  }
}

function renderHome() {
  document.getElementById("home-level").textContent = levelForXp(currentUserData.xp || 0);
  document.getElementById("home-xp").textContent = currentUserData.xp || 0;
  const rankInfo = (typeof RANKS !== "undefined") ? RANKS[currentUserData.rank || 0] : null;
  document.getElementById("home-rank").textContent = rankInfo ? rankInfo.name : "Bronze";

  const mascotMessages = [
    `Ready to learn something new today, ${currentUserData.name}?`,
    "A quick lesson now beats a big cram session later.",
    "Your weakest subject might be one Tutor session away from clicking.",
    "Come on, let's beat that boss today!"
  ];
  document.getElementById("mascot-message").textContent = mascotMessages[Math.floor(Math.random() * mascotMessages.length)];

  renderStreakCalendar();
}

function renderStreakCalendar() {
  document.getElementById("streak-count").textContent = currentUserData.streakCount || 0;
  const activeDates = new Set(currentUserData.activeDates || []);
  const dayLabels = ["S", "M", "T", "W", "T", "F", "S"];
  const strip = document.getElementById("streak-calendar-strip");
  strip.innerHTML = "";

  for (let i = 0; i <= 6; i++) {
    const d = new Date(Date.now() - i * 86400000);
    const dateStr = localDateString(d);
    const isActive = activeDates.has(dateStr);
    const isToday = i === 0;
    const cell = document.createElement("div");
    cell.className = "streak-day" + (isActive ? " streak-day-active" : "") + (isToday ? " streak-day-today" : "");
    cell.innerHTML = `<span class="streak-day-label">${dayLabels[d.getDay()]}</span><span class="streak-day-dot"></span>`;
    strip.appendChild(cell);
  }
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => navigateTo(btn.dataset.nav));
});

document.querySelectorAll(".home-shortcut").forEach(btn => {
  btn.addEventListener("click", () => navigateTo(btn.dataset.nav));
});

document.getElementById("settings-icon-btn").addEventListener("click", () => navigateTo("settings-section"));
document.getElementById("profile-icon-btn").addEventListener("click", () => navigateTo("profile-section"));

// Links inside screens (like the ad banner) that should act like nav buttons
document.querySelectorAll("[data-nav].ad-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo(link.dataset.nav);
  });
});

// ---------- Auth tab switching ----------
document.querySelectorAll(".auth-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.tab;
    document.getElementById("signin-form").classList.toggle("hidden", target !== "signin");
    document.getElementById("signup-form").classList.toggle("hidden", target !== "signup");
    document.getElementById("forgot-password-form").classList.add("hidden");
  });
});

// ---------- Sign up ----------
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const gradeId = document.getElementById("signup-grade").value;
  const language = document.getElementById("signup-language").value;
  const errorEl = document.getElementById("signup-error");
  errorEl.textContent = "";

  const gradeBand = GRADE_BANDS.find(g => g.id === gradeId) || GRADE_BANDS[0];
  const initialChapterProgress = {};
  SUBJECTS.forEach(s => { initialChapterProgress[s.id] = gradeBand.unlockCount; });

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
    await db.collection("users").doc(cred.user.uid).set({
      name: name,
      email: email,
      xp: 0,
      isPro: false,
      isUltra: false,
      lastUltraCoinBonusDate: null,
      completedSubjects: [],
      bossLevels: {},
      chapterProgress: initialChapterProgress,
      lessonProgress: {},
      hasSeenTutorial: false,
      gradeLevel: gradeBand.id,
      missionDate: null,
      missionProgress: {},
      missionClaimed: {},
      subjectStats: {},
      aiTutorDate: null,
      aiTutorUsesToday: 0,
      tutorLevel: {},
      rank: 0,
      weeklyXP: 0,
      weekId: null,
      streakCount: 0,
      coins: 0,
      xpBoost: null,
      streakFreezes: 0,
      lifetimeBattlesWon: 0,
      perfectLessons: 0,
      totalCorrectAnswers: 0,
      lifetimeCoinsSpent: 0,
      lastSpinDate: null,
      banned: false,
      bannedUntil: null,
      banReason: null,
      language: language,
      studyModeCourse: null,
      studyModePerformance: {},
      claimedAchievementRewards: [],
      friends: [],
      blockedUsers: [],
      clanId: null,
      clanName: null,
      ownedCosmetics: { avatarIcons: [], frames: [], decorations: [], nameplates: [], themes: [], music: [] },
      equipped: { avatarIcon: "default", frame: "none", decoration: "none", nameplate: "default" },
      tempProUntil: null,
      lastActiveDate: null,
      activeDates: [],
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    errorEl.textContent = friendlyAuthError(err);
  }
});

// ---------- Sign in ----------
document.getElementById("signin-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signin-email").value.trim();
  const password = document.getElementById("signin-password").value;
  const errorEl = document.getElementById("signin-error");
  errorEl.textContent = "";

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    errorEl.textContent = friendlyAuthError(err);
  }
});

function friendlyAuthError(err) {
  const map = {
    "auth/email-already-in-use": "That email is already registered — try signing in instead.",
    "auth/invalid-email": "That doesn't look like a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password."
  };
  return map[err.code] || "Something went wrong. Please try again.";
}

document.getElementById("feedback-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const messageEl = document.getElementById("feedback-message");
  const statusEl = document.getElementById("feedback-status");
  const message = messageEl.value.trim();
  if (!message) return;

  statusEl.textContent = "";
  statusEl.classList.remove("form-success");

  try {
    await db.collection("feedback").add({
      uid: currentUser ? currentUser.uid : null,
      name: currentUserData ? currentUserData.name : "Unknown",
      message: message,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    messageEl.value = "";
    statusEl.textContent = "Thanks! Your feedback was sent.";
    statusEl.classList.add("form-success");
  } catch (err) {
    statusEl.textContent = "Couldn't send that right now — please try again.";
  }
});

// ---------- Forgot password ----------
document.getElementById("guest-mode-btn").addEventListener("click", async () => {
  const btn = document.getElementById("guest-mode-btn");
  btn.disabled = true;
  try {
    await auth.signInAnonymously();
  } catch (err) {
    document.getElementById("signin-error").textContent = "Couldn't start guest mode right now. Please try again.";
    btn.disabled = false;
  }
});

document.getElementById("forgot-password-link").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("signin-form").classList.add("hidden");
  document.getElementById("signup-form").classList.add("hidden");
  document.getElementById("forgot-password-form").classList.remove("hidden");
  document.getElementById("forgot-password-message").textContent = "";
  document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
});

document.getElementById("forgot-password-back-btn").addEventListener("click", () => {
  document.getElementById("forgot-password-form").classList.add("hidden");
  document.getElementById("signin-form").classList.remove("hidden");
  document.querySelector('.auth-tab[data-tab="signin"]').classList.add("active");
});

document.getElementById("forgot-password-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("forgot-password-email").value.trim();
  const msgEl = document.getElementById("forgot-password-message");
  msgEl.textContent = "";
  msgEl.classList.remove("form-success");

  try {
    await auth.sendPasswordResetEmail(email);
    msgEl.textContent = "Check your email for a link to reset your password.";
    msgEl.classList.add("form-success");
  } catch (err) {
    msgEl.textContent = friendlyAuthError(err);
  }
});

// ---------- Sign out ----------
document.getElementById("sign-out-btn").addEventListener("click", () => {
  auth.signOut();
});

// ---------- Auth state watcher ----------
auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  if (user) {
    isGuestMode = !!user.isAnonymous;
    if (isGuestMode) enableGuestModeFirestoreGuard(user.uid);

    const doc = await db.collection("users").doc(user.uid).get();
    const data = doc.exists ? doc.data() : {};
    currentUserData = {
      name: data.name || user.displayName || (isGuestMode ? "Guest" : "Student"),
      xp: data.xp || 0,
      isPro: data.isPro || false,
      isUltra: data.isUltra || false,
      lastUltraCoinBonusDate: data.lastUltraCoinBonusDate || null,
      completedSubjects: data.completedSubjects || [],
      bossLevels: data.bossLevels || {},
      chapterProgress: data.chapterProgress || {},
      lessonProgress: data.lessonProgress || {},
      hasSeenTutorial: typeof data.hasSeenTutorial === "boolean" ? data.hasSeenTutorial : true,
      missionDate: data.missionDate || null,
      missionProgress: data.missionProgress || {},
      missionClaimed: data.missionClaimed || {},
      subjectStats: data.subjectStats || {},
      aiTutorDate: data.aiTutorDate || null,
      aiTutorUsesToday: data.aiTutorUsesToday || 0,
      tutorLevel: data.tutorLevel || {},
      gradeLevel: data.gradeLevel || "high",
      rank: typeof data.rank === "number" ? data.rank : 0,
      weeklyXP: data.weeklyXP || 0,
      weekId: data.weekId || null,
      streakCount: data.streakCount || 0,
      coins: data.coins || 0,
      xpBoost: data.xpBoost || null,
      streakFreezes: data.streakFreezes || 0,
      lifetimeBattlesWon: data.lifetimeBattlesWon || 0,
      perfectLessons: data.perfectLessons || 0,
      totalCorrectAnswers: data.totalCorrectAnswers || 0,
      lifetimeCoinsSpent: data.lifetimeCoinsSpent || 0,
      lastSpinDate: data.lastSpinDate || null,
      banned: data.banned || false,
      bannedUntil: data.bannedUntil || null,
      banReason: data.banReason || null,
      language: data.language || "en",
      studyModeCourse: data.studyModeCourse || null,
      studyModePerformance: data.studyModePerformance || {},
      claimedAchievementRewards: data.claimedAchievementRewards || [],
      friends: data.friends || [],
      blockedUsers: data.blockedUsers || [],
      clanId: data.clanId || null,
      clanName: data.clanName || null,
      ownedCosmetics: data.ownedCosmetics || { avatarIcons: [], frames: [], decorations: [], nameplates: [], themes: [], music: [] },
      equipped: data.equipped || { avatarIcon: "default", frame: "none", decoration: "none", nameplate: "default" },
      tempProUntil: data.tempProUntil || null,
      lastActiveDate: data.lastActiveDate || null,
      activeDates: data.activeDates || []
    };

    if (currentUserData.banned) {
      const isExpired = currentUserData.bannedUntil && Date.now() > currentUserData.bannedUntil;
      if (isExpired) {
        // Temporary ban has run out — lift it automatically rather
        // than making them wait on an admin, and let this login
        // proceed normally instead of showing the banned screen.
        currentUserData.banned = false;
        currentUserData.bannedUntil = null;
        currentUserData.banReason = null;
        db.collection("users").doc(user.uid).update({ banned: false, bannedUntil: null, banReason: null });
      } else {
        showBannedScreen();
        return;
      }
    }

    updateXpHud(currentUserData.xp);
    updateCoinHud();
    checkAndGrantAchievementRewards();
    checkForSharedStudyCourseLink().catch(err => console.error("Shared course check failed:", err));
    setTopBarVisible(true);
    document.getElementById("welcome-message").textContent = `Hi ${currentUserData.name}, welcome back!`;

    // Start music now — the sign-in/sign-up click that got us here
    // already satisfies the browser's user-gesture requirement, so
    // this is more precise than waiting for "the next click anywhere."
    // Wrapped defensively: audio initialization failing for any reason
    // should never be able to break the rest of the login flow.
    try {
      let savedTrack = "nightOwl";
      try { savedTrack = localStorage.getItem("bqMusic") || "nightOwl"; } catch (e) {}
      if (savedTrack !== "off" && MusicPlayer.currentTrackId !== savedTrack) {
        MusicPlayer.play(savedTrack);
      }
    } catch (err) {
      console.warn("Music playback couldn't start:", err.message || err);
    }

    await updateStreak();
    await checkTempProExpiry();
    await grantUltraDailyCoins();

    // Backfill email for accounts created before this field existed —
    // needed so gifting (find a recipient by email) works for everyone,
    // not just new signups going forward.
    if (!currentUserData.email && user.email) {
      currentUserData.email = user.email;
      db.collection("users").doc(currentUser.uid).update({ email: user.email });
    }
    enforceThemeAccess();
    renderHome();
    showScreen("home-section");
    if (!currentUserData.hasSeenTutorial) {
      setTimeout(() => document.getElementById("tutorial-prompt-overlay").classList.remove("hidden"), 400);
    }
  } else {
    currentUserData = null;
    isGuestMode = false;
    setTopBarVisible(false);
    if (_wasBannedSignOut) {
      _wasBannedSignOut = false; // consumed — next real sign-out shows the normal login screen
      return;
    }
    showScreen(hasSeenWelcomeCarousel() ? "auth-section" : "welcome-carousel-section");
  }
});

// ---------- Subject grid (Quests) ----------
let currentOpenSubject = null; // subject currently being browsed at chapter-select level

function renderGradeSelector() {
  const select = document.getElementById("grade-select");
  if (select.options.length === 0) {
    select.innerHTML = GRADE_BANDS.map(g => `<option value="${g.id}">${g.label}</option>`).join("");
    select.addEventListener("change", handleGradeChange);
  }
  select.value = currentUserData.gradeLevel || "high";
}

async function handleGradeChange() {
  const select = document.getElementById("grade-select");
  const gradeBand = GRADE_BANDS.find(g => g.id === select.value);
  if (!gradeBand) return;

  currentUserData.gradeLevel = gradeBand.id;
  if (!currentUserData.chapterProgress) currentUserData.chapterProgress = {};

  const updates = { gradeLevel: gradeBand.id };
  // Raise (never lower) each subject's unlocked chapter count to match the new grade band.
  SUBJECTS.forEach(subject => {
    const current = currentUserData.chapterProgress[subject.id] || 1;
    if (gradeBand.unlockCount > current) {
      currentUserData.chapterProgress[subject.id] = gradeBand.unlockCount;
      updates[`chapterProgress.${subject.id}`] = gradeBand.unlockCount;
    }
  });

  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update(updates);
  }
  renderSubjects();
}

function renderSubjects() {
  renderGradeSelector();
  const grid = document.getElementById("quest-grid");
  grid.innerHTML = "";
  const isPro = currentUserData && currentUserData.isPro;

  SUBJECTS.forEach(subject => {
    const hasRoadmap = typeof LESSONS !== "undefined" && LESSONS[subject.id];
    const card = document.createElement("button");
    card.className = "quest-card";
    card.style.setProperty("--subject-color", subject.color);
    card.style.setProperty("--subject-soft", subject.colorSoft);

    let metaText;
    if (hasRoadmap) {
      const steps = getFlattenedSteps(subject.id);
      const completedCount = steps.filter(s => currentUserData.completedSubjects.includes(getStepKey(subject.id, s))).length;
      metaText = completedCount === steps.length ? "version5 complete ✅" : `${completedCount} of ${steps.length} lessons complete`;
    } else {
      const unlockedCount = (currentUserData.chapterProgress && currentUserData.chapterProgress[subject.id]) || 1;
      const completedCount = CHAPTER_NAMES.filter((_, i) =>
        currentUserData.completedSubjects.includes(`${subject.id}:${i}`)
      ).length;
      const allDone = completedCount === CHAPTER_NAMES.length;
      metaText = allDone ? "All chapters complete ✅" : `Chapter ${unlockedCount} of ${CHAPTER_NAMES.length} unlocked`;
    }

    card.innerHTML = `
      <span class="quest-icon">${SUBJECT_ICON_SVG[subject.id] || subject.icon}</span>
      <p class="quest-name">${subject.name}</p>
      <p class="quest-meta">${metaText}</p>
    `;
    card.addEventListener("click", () => hasRoadmap ? openRoadmap(subject) : openSubjectChapters(subject));
    grid.appendChild(card);
  });

  document.getElementById("ad-banner-subjects").classList.toggle("hidden", isPro);
}

function openSubjectChapters(subject) {
  currentOpenSubject = subject;
  renderChapterList(subject);
  showScreen("chapters-section");
}

function renderChapterList(subject) {
  document.getElementById("chapters-heading").textContent = `${subject.name} — Chapters`;
  const grid = document.getElementById("chapters-grid");
  grid.innerHTML = "";

  const unlockedCount = (currentUserData.chapterProgress && currentUserData.chapterProgress[subject.id]) || 1;

  CHAPTER_NAMES.forEach((chapterName, i) => {
    const isCompleted = currentUserData.completedSubjects.includes(`${subject.id}:${i}`);
    const isReached = i < unlockedCount;
    const card = document.createElement("button");
    card.style.setProperty("--subject-color", subject.color);
    card.style.setProperty("--subject-soft", subject.colorSoft);

    if (!isReached) {
      card.className = "quest-card locked";
      card.innerHTML = `
        <span class="quest-icon">${UTIL_ICON_SVG.lock}</span>
        <p class="quest-name">Chapter ${i + 1}: ${chapterName}</p>
        <p class="quest-meta quest-locked-label">Complete the previous chapter first</p>
      `;
      card.disabled = true;
    } else {
      card.className = "quest-card";
      const icon = isCompleted ? UTIL_ICON_SVG.check : (SUBJECT_ICON_SVG[subject.id] || "");
      card.innerHTML = `
        <span class="quest-icon${isCompleted ? " seal-badge" : ""}">${icon}</span>
        <p class="quest-name">Chapter ${i + 1}: ${chapterName}</p>
        <p class="quest-meta">5 questions · up to ${XP_PER_CORRECT_ANSWER * 5} XP</p>
      `;
      card.addEventListener("click", () => startQuest(subject, i));
    }
    grid.appendChild(card);
  });
}

document.getElementById("chapters-back-btn").addEventListener("click", () => {
  renderSubjects();
  showScreen("subjects-section");
});

// ---------- Roadmap (structured lesson-by-lesson Quests) ----------
function openRoadmap(subject) {
  currentOpenSubject = subject;
  renderRoadmap(subject);
  showScreen("roadmap-section");
}

// ------------------------------------------------------------------
// Chapter > Lesson roadmap helpers.
//
// Each subject's LESSONS entry is a list of CHAPTERS, each covering
// one topic and broken into a few smaller LESSONS within it (so a
// topic is learned piece by piece, not all 5 questions at once).
// Rather than rewrite every piece of roadmap/lock/progress logic to
// understand two levels of nesting, these helpers FLATTEN a
// subject's chapters into one ordered list of "steps" — each step
// remembering which chapter and which lesson-within-that-chapter it
// is. Everything downstream (locking, rendering, completion) then
// works on this flat list exactly the way it always worked on a flat
// lesson list, just with an extra chapter label attached to each step.
// ------------------------------------------------------------------
function getFlattenedSteps(subjectId) {
  const chapters = LESSONS[subjectId] || [];
  const steps = [];
  chapters.forEach((chapter, chapterIndex) => {
    // Backward compatible with the older flat format (a chapter with
    // just .questions directly, no .lessons) — every subject has
    // since been restructured into the nested chapter>lesson format,
    // but this fallback costs nothing to keep and protects against
    // any future subject being added without the same treatment.
    const lessonsInChapter = chapter.lessons || [{ name: chapter.name, questions: chapter.questions }];
    lessonsInChapter.forEach((lesson, lessonIndexInChapter) => {
      steps.push({
        chapterIndex,
        lessonIndexInChapter,
        chapterName: chapter.name,
        lessonName: lesson.name,
        questions: lesson.questions,
        isFirstInChapter: lessonIndexInChapter === 0,
        isChallenge: !!lesson.isChallenge
      });
    });
  });
  return steps;
}

// A step's completion key is based on its chapter+lesson position,
// not a flat index — flat indices would shift if a chapter's lesson
// count ever changes, silently scrambling everyone's saved progress.
function getStepKey(subjectId, step) {
  return `${subjectId}:chapter:${step.chapterIndex}:lesson:${step.lessonIndexInChapter}`;
}

// The free-tier cap used to mean "the first FREE_LESSON_CAP topics."
// Now that each topic is several smaller steps, the cap means the
// same thing in spirit — translated into "however many flattened
// steps make up the first FREE_LESSON_CAP chapters."
function getFreeTierStepCap(subjectId) {
  const chapters = LESSONS[subjectId] || [];
  let count = 0;
  for (let c = 0; c < Math.min(FREE_LESSON_CAP, chapters.length); c++) {
    // Same backward-compatibility as getFlattenedSteps: a
    // not-yet-restructured chapter counts as exactly one step.
    count += chapters[c].lessons ? chapters[c].lessons.length : 1;
  }
  return count;
}

function renderRoadmap(subject, highlightLessonIndex) {
  document.getElementById("roadmap-heading").textContent = `${subject.name} version5`;
  const steps = getFlattenedSteps(subject.id);
  const isPro = currentUserData.isPro;
  const path = document.getElementById("roadmap-path");
  path.innerHTML = "";
  path.style.setProperty("--subject-color", subject.color);

  const freeStepCap = getFreeTierStepCap(subject.id);

  steps.forEach((step, i) => {
    if (step.isFirstInChapter) {
      const header = document.createElement("p");
      header.className = "roadmap-chapter-header";
      header.textContent = `Chapter ${step.chapterIndex + 1}: ${step.chapterName}`;
      path.appendChild(header);
    }

    const stepKey = getStepKey(subject.id, step);
    const isCompleted = currentUserData.completedSubjects.includes(stepKey);
    // Derived directly from actual completion history, not a stored
    // progress counter — a counter gets capped while free, and
    // doesn't automatically catch up the moment someone becomes Pro.
    // Basing "reached" on real completions means it self-heals
    // immediately: if you've completed step N, step N+1 is reached,
    // full stop, regardless of what was true historically.
    const isReached = i === 0 || currentUserData.completedSubjects.includes(getStepKey(subject.id, steps[i - 1]));
    // Free tier: even a step the user has technically "reached"
    // beyond the cap stays locked behind Pro.
    const isProLocked = !isPro && i >= freeStepCap;
    const isLocked = !isReached || isProLocked;
    const side = i % 2 === 0 ? "left" : "right";

    const node = document.createElement("div");
    node.className = `roadmap-node roadmap-node-${side}`;

    const btn = document.createElement("button");
    btn.className = "roadmap-dot" + (isCompleted ? " seal-badge roadmap-dot-done" : "") + (isLocked ? " roadmap-dot-locked" : "") + (isProLocked ? " roadmap-dot-pro-locked" : "") + (step.isChallenge ? " roadmap-dot-challenge" : "");
    btn.innerHTML = isCompleted ? UTIL_ICON_SVG.check : (isLocked ? UTIL_ICON_SVG.lock : (step.isChallenge ? "⚡" : String(i + 1)));
    btn.disabled = isLocked;
    btn.title = isProLocked ? "Requires Pro" : "";
    if (!isLocked) btn.addEventListener("click", () => showLessonIntro(subject, i));
    if (isProLocked) btn.addEventListener("click", () => navigateTo("pro-section"));

    if (i === highlightLessonIndex) {
      node.classList.add("roadmap-node-highlighted");
      const mascot = document.createElement("div");
      mascot.className = "roadmap-mascot";
      renderOllieMascotInto(mascot, 60);
      node.appendChild(mascot);
    }

    const label = document.createElement("p");
    label.className = "roadmap-label" + (step.isChallenge ? " roadmap-label-challenge" : "");
    label.textContent = step.lessonName + (step.isChallenge ? " (2× XP)" : "") + (isProLocked ? " (Pro)" : "");

    node.appendChild(btn);
    node.appendChild(label);
    path.appendChild(node);
  });
}

document.getElementById("roadmap-back-btn").addEventListener("click", () => {
  renderSubjects();
  showScreen("subjects-section");
});

function showLessonIntro(subject, lessonIndex) {
  _pendingLessonStart = { subject, lessonIndex };
  const step = getFlattenedSteps(subject.id)[lessonIndex];
  document.getElementById("concept-subject-tag").textContent = `${subject.name} — Chapter ${step.chapterIndex + 1}: ${step.chapterName} (${step.lessonName})`;
  document.getElementById("concept-heading").textContent = "Before you start...";
  document.getElementById("concept-text").textContent = `This is ${step.lessonName.toLowerCase()} of "${step.chapterName}" — work through the questions to practice this piece before moving on.`;
  _pendingQuestStart = null; // ensure the old chapter-flow pending state doesn't interfere
  showScreen("concept-section");
}

let _pendingLessonStart = null;

function beginLessonQuiz(subject, lessonIndex) {
  const step = getFlattenedSteps(subject.id)[lessonIndex];
  // Filtering interactive questions here can occasionally leave a
  // step with fewer questions than usual (a step's pool is small and
  // fixed, unlike Trivia/Boss's larger pools) — an acceptable
  // trade-off for honoring the Settings toggle rather than
  // fabricating a substitute question on the fly.
  const questions = applyInteractiveSetting(step.questions);
  currentQuiz = {
    mode: "lesson",
    subjectId: subject.id,
    subjectName: `${subject.name} — Ch${step.chapterIndex + 1}: ${step.chapterName} (${step.lessonName})`,
    lessonIndex: lessonIndex,
    questions: [...questions].sort(() => Math.random() - 0.5),
    index: 0,
    correctCount: 0
  };
  showScreen("quiz-section");
  document.getElementById("hearts-hud").classList.add("hidden");
  renderQuestion();
}

async function finishLesson() {
  const { correctCount, questions, subjectId, lessonIndex } = currentQuiz;
  const steps = getFlattenedSteps(subjectId);
  const step = steps[lessonIndex];
  const stepKey = getStepKey(subjectId, step);
  // Chapter Challenge lessons — a cumulative review of everything in
  // the chapter, deliberately harder since it draws on both earlier
  // lessons at once — pay double XP.
  const xpGained = (currentQuiz.xpEarned || 0) * (step.isChallenge ? 2 : 1);

  const alreadyCompleted = currentUserData.completedSubjects.includes(stepKey);
  if (!alreadyCompleted) currentUserData.completedSubjects.push(stepKey);

  await addXp(xpGained);
  registerMissionEvent("questsCompleted", 1);

  const updates = {};
  if (!alreadyCompleted) updates.completedSubjects = firebase.firestore.FieldValue.arrayUnion(stepKey);

  // "Reached" for every step is now derived purely from completion
  // history (see renderRoadmap) rather than a separate stored
  // counter — so there's no separate progress counter to advance
  // here. Completing this step always makes the next one reached,
  // unless the free-tier cap or the end of the list stops it.
  const freeStepCap = getFreeTierStepCap(subjectId);
  const unlockCap = currentUserData.isPro ? steps.length : Math.min(steps.length, freeStepCap);
  const unlockedNext = !alreadyCompleted && lessonIndex + 1 < unlockCap;

  if (currentUser && Object.keys(updates).length > 0) {
    await db.collection("users").doc(currentUser.uid).update(updates);
  }

  // Straight to the roadmap instead of the usual results screen — the
  // mascot points at whatever step is next, and a brief toast shows
  // the score/XP instead of a full separate screen to click past.
  const subject = SUBJECTS.find(s => s.id === subjectId);
  const nextLessonIndex = lessonIndex + 1 < steps.length ? lessonIndex + 1 : lessonIndex;

  showLessonCompleteToast(correctCount, questions.length, xpGained, unlockedNext);
  // Delayed so it doesn't immediately overwrite the lesson-complete
  // toast above — both use the same toast element.
  setTimeout(() => checkAndGrantAchievementRewards(), 3600);
  checkLeaderboardRankUpAnimation(xpGained);
  renderRoadmap(subject, nextLessonIndex);
  showScreen("roadmap-section");
  if (correctCount === questions.length) {
    setTimeout(playConfettiAnimation, 300);
    currentUserData.perfectLessons = (currentUserData.perfectLessons || 0) + 1;
    if (currentUser) {
      db.collection("users").doc(currentUser.uid).update({
        perfectLessons: firebase.firestore.FieldValue.increment(1)
      });
    }
  }
}

function showLessonCompleteToast(correctCount, total, xpGained, unlockedNext) {
  const overlay = document.getElementById("lesson-complete-overlay");
  document.getElementById("lesson-complete-title").textContent = correctCount === total ? "Perfect Lesson!" : "Lesson Complete!";
  document.getElementById("lesson-complete-score").textContent = `${correctCount} / ${total} correct`;
  document.getElementById("lesson-complete-unlock").classList.toggle("hidden", !unlockedNext);
  overlay.classList.remove("hidden");

  animateLessonCompleteXpCounter(xpGained);

  document.getElementById("lesson-complete-continue-btn").onclick = () => {
    overlay.classList.add("hidden");
  };
}

// Counts up from 0 to the earned amount rather than just displaying
// the final number — this is the actual "animation" for the XP earned.
function animateLessonCompleteXpCounter(targetXp) {
  const el = document.getElementById("lesson-complete-xp-number");
  const durationMs = 900;
  const startTime = performance.now();

  function tick(now) {
    const progress = Math.min((now - startTime) / durationMs, 1);
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    el.textContent = Math.round(eased * targetXp);
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function startQuest(subject, chapterIndex) {
  showConceptIntro(subject, chapterIndex);
}

let _pendingQuestStart = null;

function showConceptIntro(subject, chapterIndex) {
  _pendingQuestStart = { subject, chapterIndex };
  document.getElementById("concept-subject-tag").textContent = `${subject.name} — Chapter ${chapterIndex + 1}: ${CHAPTER_NAMES[chapterIndex]}`;
  document.getElementById("concept-heading").textContent = "Before you start...";
  const concepts = CHAPTER_CONCEPTS[subject.id] || [];
  document.getElementById("concept-text").textContent = concepts[chapterIndex] || "Let's practice!";
  showScreen("concept-section");
}

document.getElementById("concept-start-btn").addEventListener("click", () => {
  if (_pendingLessonStart) {
    const { subject, lessonIndex } = _pendingLessonStart;
    _pendingLessonStart = null;
    beginLessonQuiz(subject, lessonIndex);
  } else if (_pendingQuestStart) {
    const { subject, chapterIndex } = _pendingQuestStart;
    _pendingQuestStart = null;
    beginQuestQuiz(subject, chapterIndex);
  } else if (_pendingStudyModeLessonStart !== null) {
    const stepIndex = _pendingStudyModeLessonStart;
    _pendingStudyModeLessonStart = null;
    beginStudyModeLesson(stepIndex);
  }
});

function beginQuestQuiz(subject, chapterIndex) {
  const questions = getQuestions(subject.id, chapterIndex);
  currentQuiz = {
    mode: "quest",
    subjectId: subject.id,
    subjectName: `${subject.name} — Ch.${chapterIndex + 1} ${CHAPTER_NAMES[chapterIndex]}`,
    chapterIndex: chapterIndex,
    questions: questions,
    index: 0,
    correctCount: 0
  };
  showScreen("quiz-section");
  document.getElementById("hearts-hud").classList.add("hidden");
  renderQuestion();
}

// ---------- Exit lesson ----------
document.getElementById("quiz-exit-btn").addEventListener("click", () => {
  if (!currentQuiz) return;
  const confirmed = confirm("Exit this lesson? Your progress on this attempt will be lost.");
  if (!confirmed) return;

  const mode = currentQuiz.mode;
  currentQuiz = null;
  if (mode === "boss") {
    renderBossGrid();
    showScreen("boss-section");
  } else if (mode === "duel") {
    renderDuelMenu();
    showScreen("duel-section");
  } else if (mode === "tutor") {
    renderTutorScreen();
    showScreen("tutor-section");
  } else if (mode === "lesson" && currentOpenSubject) {
    renderRoadmap(currentOpenSubject);
    showScreen("roadmap-section");
  } else if (mode === "trivia") {
    renderTriviaGrid();
    showScreen("trivia-section");
  } else if (currentOpenSubject) {
    renderChapterList(currentOpenSubject);
    showScreen("chapters-section");
  } else {
    renderSubjects();
    showScreen("subjects-section");
  }
});

// ---------- Correct-answer celebration ----------
// Confetti burst shown on the results screen after finishing a
// lesson/quest/trivia round — same lightweight DOM-based approach as
// the correct-answer sparkle, no external library.
function playConfettiAnimation() {
  const target = document.querySelector(".results-inner");
  if (!target) return;

  const container = document.createElement("div");
  container.className = "confetti-container";
  const colors = ["var(--gold)", "var(--cyan)", "var(--coral)", "var(--grape)"];

  for (let i = 0; i < 24; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = (Math.random() * 0.3) + "s";
    piece.style.animationDuration = (1.2 + Math.random() * 0.8) + "s";
    container.appendChild(piece);
  }

  target.appendChild(container);
  setTimeout(() => container.remove(), 2200);
}

function playCorrectAnswerAnimation(xpAmount) {
  const card = document.querySelector(".quiz-card");
  if (!card) return;

  const container = document.createElement("div");
  container.className = "celebration-container";

  const sparkleEmojis = ["✨", "⭐", "🌟"];
  for (let i = 0; i < 8; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
    sparkle.style.left = (30 + Math.random() * 40) + "%";
    sparkle.style.top = (20 + Math.random() * 40) + "%";
    sparkle.style.animationDelay = (Math.random() * 0.15) + "s";
    container.appendChild(sparkle);
  }

  const xpPop = document.createElement("div");
  xpPop.className = "xp-pop";
  xpPop.textContent = `+${xpAmount} XP`;
  container.appendChild(xpPop);

  card.appendChild(container);
  setTimeout(() => container.remove(), 900);
}

// ---------- Shared quiz engine ----------
function renderQuestion() {
  const { questions, index } = currentQuiz;
  const question = questions[index];

  const introCard = document.getElementById("concept-intro-card");
  const quizCard = document.querySelector(".quiz-card");

  // Concept-first only makes sense for learning-oriented modes. Boss
  // Fight and live Battles are meant to feel fast-paced and
  // competitive — showing a mini-lesson above every question there
  // would work against what those modes are for, so they skip
  // straight to the question like before.
  const conceptFirstModes = ["lesson", "quest", "trivia", "tutor", "studyMode"];
  const showConceptFirst = conceptFirstModes.includes(currentQuiz.mode);

  // Both the card and the question sit on the same page at once —
  // card on top, question below — rather than gating the question
  // behind a separate "continue" step. The user scrolls down to
  // reach the question when they're ready.
  //
  // IMPORTANT: this deliberately does NOT show question.explanation
  // here. That field exists to explain why the correct answer is
  // right AFTER answering — which means it typically states the
  // answer directly (e.g. "7 x 8 = 56"). Showing it before the
  // question would just hand over the answer. This card uses a
  // generic, always-safe framing instead — it can't leak anything
  // because it never references the question's specific content.
  quizCard.classList.remove("hidden");
  introCard.classList.toggle("hidden", !showConceptFirst);
  if (showConceptFirst) {
    document.getElementById("concept-intro-text").textContent =
      `This question is about ${currentQuiz.subjectName} — take a moment to think through what you already know before you answer. You'll get a full explanation either way once you've picked.`;
  }
  renderQuestionCore();
}

function renderQuestionCore() {
  const { questions, index, subjectName } = currentQuiz;
  const question = questions[index];

  document.getElementById("quiz-subject-tag").textContent = subjectName;
  document.getElementById("quiz-progress-label").textContent = `Question ${index + 1} of ${questions.length}`;
  document.getElementById("quiz-progress-fill").style.width = `${(index / questions.length) * 100}%`;
  document.getElementById("quiz-question").textContent = question.q;
  document.getElementById("quiz-feedback").textContent = "";
  document.getElementById("quiz-feedback").className = "quiz-feedback";
  document.getElementById("quiz-next-btn").classList.add("hidden");
  document.getElementById("quiz-confirm-btn").classList.add("hidden");
  document.getElementById("quiz-explain-btn").classList.add("hidden");
  document.getElementById("quiz-explain-btn").textContent = "Explain this";
  document.getElementById("quiz-explanation").classList.add("hidden");
  document.getElementById("ollie-hint-panel").classList.add("hidden");
  unmountOllie3D();
  document.getElementById("quiz-retry-hint-btn").classList.add("hidden");
  document.getElementById("quiz-explanation").textContent = "";
  currentQuiz.selectedIndex = null;
  currentQuiz.attemptsOnThisQuestion = 0;
  resetInteractiveWidget();

  if (question.type === "balance") {
    renderBalanceWidget(question);
  } else if (question.type === "slope-drag") {
    renderSlopeDragWidget(question);
  } else if (question.type === "sequence") {
    renderSequenceWidget(question);
  } else if (question.type === "grid-logic") {
    renderGridLogicWidget(question);
  } else if (question.type === "sentence-build") {
    renderSentenceBuildWidget(question);
  } else if (question.type === "speak-sentence") {
    renderSpeakSentenceWidget(question);
  } else {
    const optionsEl = document.getElementById("quiz-options");
    optionsEl.innerHTML = "";
    question.options.forEach((optionText, i) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.textContent = optionText;
      btn.addEventListener("click", () => selectOption(i));
      optionsEl.appendChild(btn);
    });
  }

  if (currentQuiz.mode === "boss") renderHeartsHud();
}

function selectOption(i) {
  currentQuiz.selectedIndex = i;
  document.querySelectorAll(".quiz-option").forEach((btn, idx) => {
    btn.classList.toggle("selected", idx === i);
  });
  document.getElementById("quiz-confirm-btn").classList.remove("hidden");
}

document.getElementById("quiz-confirm-btn").addEventListener("click", () => {
  const question = currentQuiz.questions[currentQuiz.index];
  document.getElementById("quiz-confirm-btn").classList.add("hidden");

  if (question.type === "balance" || question.type === "slope-drag" || question.type === "sequence" || question.type === "grid-logic" || question.type === "sentence-build" || question.type === "speak-sentence") {
    if (!window.__interactiveCheck) return;
    const result = window.__interactiveCheck();
    if (!result) return;
    handleInteractiveAnswer(result.isCorrect, result.pickedText);
  } else {
    if (currentQuiz.selectedIndex === null || currentQuiz.selectedIndex === undefined) return;
    handleAnswer(currentQuiz.selectedIndex);
  }
});

// Returns the XP awarded per correct answer for the current mode, so
// the celebration animation and feedback text show the right number.
const PRO_XP_BONUS_PER_CORRECT = 5;

// Single source of truth for per-correct-answer XP, so the on-screen
// feedback always matches what actually gets awarded. Pro users get
// a flat bonus on top of the mode's base rate.
function xpPerCorrectForMode(mode) {
  let base = XP_PER_CORRECT_ANSWER;
  if (mode === "boss") base = BOSS_XP_PER_CORRECT;
  else if (mode === "duel") base = DUEL_XP_PER_CORRECT;
  if (currentUserData && currentUserData.isPro) base += PRO_XP_BONUS_PER_CORRECT;
  return base;
}

function handleAnswer(selectedIndex) {
  const { questions, index } = currentQuiz;
  const question = questions[index];
  const isCorrect = selectedIndex === question.correct;
  const options = document.querySelectorAll(".quiz-option");
  const attemptsSoFar = currentQuiz.attemptsOnThisQuestion || 0;

  // First wrong attempt: offer a retry instead of finalizing — the
  // correct answer stays hidden, and Ollie's hint becomes available.
  // Only the second attempt (or a correct first attempt) actually
  // finalizes the question. Interactive question types (grid-logic,
  // balance scale, etc.) don't go through this — they keep their
  // existing single-attempt behavior.
  if (!isCorrect && attemptsSoFar === 0) {
    currentQuiz.attemptsOnThisQuestion = 1;
    offerQuestionRetry();
    return;
  }

  currentQuiz.attemptsOnThisQuestion = attemptsSoFar + 1;
  options.forEach((btn, i) => {
    btn.disabled = true;
    if (i === question.correct) btn.classList.add("correct");
    if (i === selectedIndex && !isCorrect) btn.classList.add("incorrect");
  });

  applyAnswerResult(isCorrect);
}

// Shown after a first wrong attempt on a standard multiple-choice
// question — lets the student try again without immediately being
// shown the answer, and offers Ollie's hint (not the answer itself)
// as an option before that second try.
function offerQuestionRetry() {
  const feedbackEl = document.getElementById("quiz-feedback");
  feedbackEl.textContent = "Not quite — want to try again?";
  feedbackEl.className = "quiz-feedback incorrect";

  document.querySelectorAll(".quiz-option").forEach(btn => {
    btn.disabled = false;
    btn.classList.remove("selected");
  });
  currentQuiz.selectedIndex = null;
  document.getElementById("quiz-confirm-btn").classList.add("hidden");
  document.getElementById("quiz-retry-hint-btn").classList.remove("hidden");
}

// Interactive question types (balance scale, slope-drag) don't have
// option buttons to style, but everything else about scoring an
// answer — XP, mission tracking, celebration, boss hearts, the
// explain/next buttons — is identical, so both paths share this.
function handleInteractiveAnswer(isCorrect, pickedText) {
  const feedbackEl = document.getElementById("quiz-feedback");
  applyAnswerResult(isCorrect);
  if (!isCorrect) {
    feedbackEl.textContent = `Not quite — you got ${pickedText}. Check the explanation for the reasoning.`;
    feedbackEl.className = "quiz-feedback incorrect";
  }
}

function applyAnswerResult(isCorrect) {
  const { questions, index } = currentQuiz;
  let xpForThisAnswer = xpPerCorrectForMode(currentQuiz.mode);
  const feedbackEl = document.getElementById("quiz-feedback");

  if (isCorrect) {
    currentQuiz.correctCount++;

    // Apply an active Shop XP boost, if any, and count down its uses.
    if (currentUserData.xpBoost && currentUserData.xpBoost.usesRemaining > 0) {
      xpForThisAnswer = Math.round(xpForThisAnswer * currentUserData.xpBoost.multiplier);
      currentUserData.xpBoost.usesRemaining--;
      const remainingBoost = currentUserData.xpBoost.usesRemaining > 0 ? currentUserData.xpBoost : null;
      currentUserData.xpBoost = remainingBoost;
      if (currentUser) {
        db.collection("users").doc(currentUser.uid).update({ xpBoost: remainingBoost });
      }
    }

    currentQuiz.xpEarned = (currentQuiz.xpEarned || 0) + xpForThisAnswer;
    currentUserData.totalCorrectAnswers = (currentUserData.totalCorrectAnswers || 0) + 1;
    if (currentUser) {
      db.collection("users").doc(currentUser.uid).update({
        totalCorrectAnswers: firebase.firestore.FieldValue.increment(1)
      });
    }
    feedbackEl.textContent = `Correct! +${xpForThisAnswer} XP`;
    feedbackEl.className = "quiz-feedback correct";
    registerMissionEvent("correctAnswers", 1);
    recordSubjectStat(currentQuiz.subjectId, true);
    playCorrectAnswerAnimation(xpForThisAnswer);
    currentQuiz.consecutiveWrong = 0;
  } else {
    feedbackEl.textContent = "Not quite — the correct answer is highlighted.";
    feedbackEl.className = "quiz-feedback incorrect";
    recordSubjectStat(currentQuiz.subjectId, false);
    currentQuiz.consecutiveWrong = (currentQuiz.consecutiveWrong || 0) + 1;
    if (currentQuiz.consecutiveWrong === 2) {
      const question = questions[index];
      showOllieHelper(question.explanation);
    }
    if (currentQuiz.mode === "boss") {
      currentQuiz.wrongCount++;
      renderHeartsHud();
      if (currentQuiz.wrongCount >= MAX_HEARTS) {
        document.getElementById("quiz-next-btn").classList.add("hidden");
        setTimeout(() => finishBossFight(false), 900);
        document.getElementById("quiz-progress-fill").style.width = "100%";
        return;
      }
    }
  }

  document.getElementById("quiz-progress-fill").style.width = `${((index + 1) / questions.length) * 100}%`;
  document.getElementById("quiz-next-btn").classList.remove("hidden");
  document.getElementById("quiz-explain-btn").classList.remove("hidden");

  if (currentQuiz.mode === "duel") updateLiveBattleProgress();
  if (currentQuiz.mode === "teamBattle") updateTeamBattleProgress();

  // Pro perk: the AI Tutor auto-reveals the explanation for Pro users
  // instead of making them tap for it — a real, working "more powerful
  // tutor" difference, even without live AI generation.
  if (currentQuiz.mode === "tutor" && currentUserData.isPro) {
    document.getElementById("quiz-explain-btn").click();
  }
}

// ------------------------------------------------------------------
// "AI Tutor" explanation engine — NOT a real AI model. This is plain
// rule-based logic that adapts the explanation's framing, depth, and
// feedback based on the user's grade level and whether they got the
// question right, using templates rather than a fixed static string.
// This is what makes "Explain this" feel tailored per-user without
// needing a live model call.
// ------------------------------------------------------------------
function buildAdaptiveExplanation(question, isCorrect, selectedIndex) {
  const grade = (currentUserData && currentUserData.gradeLevel) || "high";
  const parts = [];

  const intros = {
    elementary: "Let's break this down step by step:",
    middle: "Here's the reasoning behind it:",
    high: "Here's a closer look at the reasoning:"
  };
  parts.push(intros[grade] || intros.high);

  parts.push(question.explanation);

  if (!isCorrect && typeof selectedIndex === "number" && question.options[selectedIndex]) {
    const pickedText = question.options[selectedIndex];
    const mistakeNotes = {
      elementary: `You picked "${pickedText}" — that's a really common guess, but it doesn't quite match what the question is asking. Take another look at the correct answer above and see why it fits better.`,
      middle: `You picked "${pickedText}." That's a reasonable guess, but it misses a detail — compare it against the correct answer above to spot the difference.`,
      high: `You selected "${pickedText}," which is a common near-miss here. Comparing it against the correct answer usually reveals exactly which assumption led there.`
    };
    parts.push(mistakeNotes[grade] || mistakeNotes.high);
  }

  const extensions = {
    elementary: "Nice work thinking it through — the more you practice, the faster this will feel!",
    middle: "Try to notice this pattern next time it comes up — recognizing it quickly is half the battle.",
    high: "Try connecting this idea to a related concept you already know — that's usually how deeper understanding sticks."
  };
  parts.push(extensions[grade] || extensions.high);

  return parts.join(" ");
}

// Automatic trigger: called from applyAnswerResult when the same
// question session hits 2 wrong answers in a row. Reuses the exact
// same panel as the manual "Stuck? Ask Ollie" button, just framed as
// Ollie noticing rather than being asked — and skips straight to a
// real AI hint rather than making the student ask first.
// ------------------------------------------------------------------


async function showOllieHelper(explanationFallback) {
  const question = currentQuiz.questions[currentQuiz.index];
  const panel = document.getElementById("ollie-hint-panel");
  const textEl = document.getElementById("ollie-hint-text");
  const mascotEl = document.getElementById("ollie-hint-mascot");

  renderOllieMascotInto(mascotEl, 60);
  panel.classList.remove("hidden");
  textEl.textContent = "Hey, looks like this one's tricky — let me help...";

  const hint = await fetchOllieHint({
    question: question.q,
    options: question.options,
    subject: currentQuiz.subjectId,
    gradeLevel: currentUserData.gradeLevel
  });

  const hintText = hint || explanationFallback || "Take another look at the question and think about what it's really asking — that's usually the key.";
  textEl.textContent = hintText;
}

document.getElementById("ollie-hint-btn").addEventListener("click", async () => {
  const question = currentQuiz.questions[currentQuiz.index];
  const panel = document.getElementById("ollie-hint-panel");
  const textEl = document.getElementById("ollie-hint-text");
  const mascotEl = document.getElementById("ollie-hint-mascot");
  const btn = document.getElementById("ollie-hint-btn");

  renderOllieMascotInto(mascotEl, 60);
  panel.classList.remove("hidden");
  textEl.textContent = "Hmm, let me think about that...";
  btn.disabled = true;

  const hint = await fetchOllieHint({
    question: question.q,
    options: question.options,
    subject: currentQuiz.subjectId,
    gradeLevel: currentUserData.gradeLevel
  });

  const hintText = hint || "I'd start by rereading the question carefully and thinking about what it's really asking — sometimes that's the biggest clue!";
  textEl.textContent = hintText;
  btn.disabled = false;
});

document.getElementById("ollie-hint-close-btn").addEventListener("click", () => {
  document.getElementById("ollie-hint-panel").classList.add("hidden");
  unmountOllie3D();
});

// The retry-specific "Ask Ollie for a hint" button, shown only after
// a first wrong attempt (see offerQuestionRetry). Same hint mechanism
// as the manual button above — a nudge, not the answer — but offered
// right when it's actually useful: after a miss, before the retry.
document.getElementById("quiz-retry-hint-btn").addEventListener("click", async () => {
  const question = currentQuiz.questions[currentQuiz.index];
  const panel = document.getElementById("ollie-hint-panel");
  const textEl = document.getElementById("ollie-hint-text");
  const mascotEl = document.getElementById("ollie-hint-mascot");
  const btn = document.getElementById("quiz-retry-hint-btn");

  renderOllieMascotInto(mascotEl, 60);
  panel.classList.remove("hidden");
  textEl.textContent = "Hmm, let me think about that...";
  btn.disabled = true;

  const hint = await fetchOllieHint({
    question: question.q,
    options: question.options,
    subject: currentQuiz.subjectId,
    gradeLevel: currentUserData.gradeLevel
  });

  const hintText = hint || "Take another look at the question — think about what it's really asking before you try again.";
  textEl.textContent = hintText;
  btn.disabled = false;
});

document.getElementById("quiz-explain-btn").addEventListener("click", async () => {
  const explanationEl = document.getElementById("quiz-explanation");
  const btn = document.getElementById("quiz-explain-btn");
  const question = currentQuiz.questions[currentQuiz.index];
  const isCorrect = currentQuiz.selectedIndex === question.correct;

  if (!explanationEl.classList.contains("hidden")) {
    explanationEl.classList.add("hidden");
    btn.textContent = "Explain this";
    return;
  }

  // Real Gemini-powered explanations are reserved for the AI Tutor —
  // that's the one place a live API call is worth the cost/quota.
  // Every other mode uses the instant, free template explanation.
  if (currentQuiz.mode === "tutor" && question.options) {
    explanationEl.textContent = "Thinking...";
    explanationEl.classList.remove("hidden");
    btn.disabled = true;

    const geminiText = await fetchGeminiExplanation({
      question: question.q,
      options: question.options,
      correctAnswerText: question.options[question.correct],
      selectedAnswerText: typeof currentQuiz.selectedIndex === "number" ? question.options[currentQuiz.selectedIndex] : null,
      subject: currentQuiz.subjectId,
      gradeLevel: currentUserData.gradeLevel
    });

    btn.disabled = false;
    explanationEl.textContent = geminiText || (question.explanation
      ? buildAdaptiveExplanation(question, isCorrect, currentQuiz.selectedIndex)
      : "No explanation available for this question yet.");
    btn.textContent = "Hide explanation";
    return;
  }

  explanationEl.textContent = question.explanation
    ? buildAdaptiveExplanation(question, isCorrect, currentQuiz.selectedIndex)
    : "No explanation available for this question yet.";
  explanationEl.classList.remove("hidden");
  btn.textContent = "Hide explanation";
});

document.getElementById("quiz-next-btn").addEventListener("click", () => {
  currentQuiz.index++;
  if (currentQuiz.index < currentQuiz.questions.length) {
    renderQuestion();
  } else {
    if (currentQuiz.mode === "boss") {
      finishBossFight(true);
    } else if (currentQuiz.mode === "duel") {
      finishDuelPlay();
    } else if (currentQuiz.mode === "teamBattle") {
      finishTeamBattlePlay();
    } else if (currentQuiz.mode === "tutor") {
      finishTutorSession();
    } else if (currentQuiz.mode === "lesson") {
      finishLesson();
    } else if (currentQuiz.mode === "studyMode") {
      finishStudyModeLesson();
    } else if (currentQuiz.mode === "trivia") {
      finishTrivia();
    } else {
      finishQuest();
    }
  }
});

// ---------- Quest completion ----------
async function finishQuest() {
  const { correctCount, questions, subjectId, chapterIndex } = currentQuiz;
  const xpGained = currentQuiz.xpEarned || 0;
  const chapterKey = `${subjectId}:${chapterIndex}`;

  const alreadyCompleted = currentUserData.completedSubjects.includes(chapterKey);
  if (!alreadyCompleted) currentUserData.completedSubjects.push(chapterKey);

  await addXp(xpGained);
  registerMissionEvent("questsCompleted", 1);

  const updates = {};
  if (!alreadyCompleted) {
    updates.completedSubjects = firebase.firestore.FieldValue.arrayUnion(chapterKey);
  }

  // Unlock the next chapter if this was the highest one reached so far.
  let unlockedNext = false;
  if (!currentUserData.chapterProgress) currentUserData.chapterProgress = {};
  const currentUnlocked = currentUserData.chapterProgress[subjectId] || 1;
  if (chapterIndex === currentUnlocked - 1 && chapterIndex + 1 < CHAPTER_NAMES.length) {
    currentUserData.chapterProgress[subjectId] = chapterIndex + 2; // e.g. finishing ch.0 unlocks index 1 -> progress becomes 2
    updates[`chapterProgress.${subjectId}`] = currentUserData.chapterProgress[subjectId];
    unlockedNext = true;
  }

  if (currentUser && Object.keys(updates).length > 0) {
    await db.collection("users").doc(currentUser.uid).update(updates);
  }

  document.getElementById("results-eyebrow").textContent = "Quest complete";
  document.getElementById("results-score").textContent = `${correctCount} / ${questions.length}`;
  document.getElementById("results-xp-gain").textContent = `+${xpGained} XP`;
  document.getElementById("results-message").textContent = unlockedNext
    ? `${resultMessage(correctCount, questions.length)} Next chapter unlocked!`
    : resultMessage(correctCount, questions.length);

  const isPerfect = correctCount === questions.length;
  document.getElementById("results-upsell").classList.toggle("hidden", !isPerfect);

  showScreen("results-section");
  if (isPerfect) setTimeout(playConfettiAnimation, 300);
}

function resultMessage(correct, total) {
  if (correct === total) return "Perfect run! You've mastered this set.";
  if (correct >= total * 0.6) return "Solid work — a bit more practice and you'll ace it.";
  return "Good attempt — try this chapter again to lock it in.";
}

document.getElementById("results-again-btn").addEventListener("click", () => {
  if (currentQuiz && currentQuiz.mode === "quest" && currentOpenSubject) {
    renderChapterList(currentOpenSubject);
    showScreen("chapters-section");
  } else {
    renderSubjects();
    showScreen("subjects-section");
  }
});
