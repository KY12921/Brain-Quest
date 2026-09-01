// ------------------------------------------------------------------
// Brain Quest — Achievements wall (100 badges).
//
// Almost every badge here is computed from data already being
// tracked (xp, completedSubjects, bossLevels, isPro, rank, coins,
// ownedCosmetics) — no storage needed, just a check() function run
// live against the current user. A handful of categories needed a
// small new lifetime counter that didn't exist before (battles won,
// perfect lessons, total correct answers, coins spent) — those are
// incremented at the relevant point in app.js/duels.js/shop.js.
//
// The repetitive categories (level milestones, streak milestones,
// per-subject completion, etc.) are generated programmatically rather
// than hand-typed 100 times — less error-prone, and easy to extend.
// ------------------------------------------------------------------

const ACHIEVEMENTS = [];

function addAchievement(id, name, description, check) {
  ACHIEVEMENTS.push({ id, name, description, check });
}

// ---------- Level milestones ----------
[2, 5, 10, 15, 20, 25, 30, 40, 50, 75].forEach(lvl => {
  addAchievement(`level-${lvl}`, `Level ${lvl}`, `Reach Level ${lvl}.`, u => levelForXp(u.xp || 0) >= lvl);
});

// ---------- Total lessons completed ----------
// Capped at 70 since 7 subjects × 10 lessons each is the actual
// maximum achievable — anything higher would be an impossible badge.
[1, 5, 10, 25, 40, 55, 70].forEach(n => {
  addAchievement(`lessons-${n}`, n === 1 ? "First Steps" : `${n} Lessons`, `Complete ${n} lesson${n === 1 ? "" : "s"} total, across any subjects.`,
    u => (u.completedSubjects || []).length >= n);
});

// ---------- Per-subject: started and mastered ----------
SUBJECTS.forEach(subject => {
  addAchievement(`started-${subject.id}`, `${subject.name} Beginner`, `Complete your first ${subject.name} lesson.`,
    u => (u.completedSubjects || []).some(k => k.startsWith(subject.id + ":")));
  addAchievement(`halfway-${subject.id}`, `${subject.name} Halfway`, `Complete 5 ${subject.name} lessons.`,
    u => (u.completedSubjects || []).filter(k => k.startsWith(subject.id + ":")).length >= 5);
  addAchievement(`mastered-${subject.id}`, `${subject.name} Master`, `Complete all 10 ${subject.name} lessons.`,
    u => (u.completedSubjects || []).filter(k => k.startsWith(subject.id + ":")).length >= 10);
});

// ---------- Streak milestones ----------
[3, 5, 7, 14, 21, 30, 60, 100].forEach(days => {
  addAchievement(`streak-${days}`, `${days}-Day Streak`, `Reach a ${days}-day streak.`, u => (u.streakCount || 0) >= days);
});

// ---------- Boss Fight wins (summed across all subjects' boss level) ----------
function totalBossWins(u) {
  return Object.values(u.bossLevels || {}).reduce((sum, lvl) => sum + (lvl || 0), 0);
}
[1, 3, 5, 10, 15, 25].forEach(n => {
  addAchievement(`boss-wins-${n}`, n === 1 ? "Boss Slayer" : `Boss Veteran ${n}`, `Win ${n} Boss Fight${n === 1 ? "" : "s"}, across any subjects.`,
    u => totalBossWins(u) >= n);
});

// ---------- Battle (duel) wins ----------
[1, 5, 10, 25].forEach(n => {
  addAchievement(`battles-won-${n}`, n === 1 ? "First Victory" : `Battle Champion ${n}`, `Win ${n} live Battle${n === 1 ? "" : "s"}.`,
    u => (u.lifetimeBattlesWon || 0) >= n);
});

// ---------- League / rank ----------
[1, 2, 3, 6, 9].forEach(rankIndex => {
  const rankName = RANKS[rankIndex].name;
  addAchievement(`rank-${rankIndex}`, `Reached ${rankName}`, `Get promoted to the ${rankName} league.`, u => (u.rank || 0) >= rankIndex);
});

// ---------- Weekly XP ----------
[500, 1000, 2500, 5000].forEach(n => {
  addAchievement(`weekly-xp-${n}`, `${n.toLocaleString()} Weekly XP`, `Earn ${n.toLocaleString()} XP in a single week.`, u => (u.weeklyXP || 0) >= n);
});

// ---------- Coins (current balance) ----------
[100, 500, 1000, 2500, 5000, 10000].forEach(n => {
  addAchievement(`coins-${n}`, `${n.toLocaleString()} Coins`, `Have ${n.toLocaleString()} coins at once.`, u => (u.coins || 0) >= n);
});

// ---------- Lifetime coins spent in the Shop ----------
[500, 2000, 5000].forEach(n => {
  addAchievement(`coins-spent-${n}`, `Big Spender ${n}`, `Spend ${n.toLocaleString()} coins total in the Shop.`, u => (u.lifetimeCoinsSpent || 0) >= n);
});

// ---------- Perfect lessons ----------
[1, 10, 25, 50].forEach(n => {
  addAchievement(`perfect-${n}`, n === 1 ? "Flawless" : `Perfectionist ${n}`, `Get a perfect score on ${n} lesson${n === 1 ? "" : "s"}.`,
    u => (u.perfectLessons || 0) >= n);
});

// ---------- Total correct answers ----------
[50, 100, 500, 1000, 2500].forEach(n => {
  addAchievement(`correct-${n}`, `${n.toLocaleString()} Correct Answers`, `Answer ${n.toLocaleString()} questions correctly, lifetime.`,
    u => (u.totalCorrectAnswers || 0) >= n);
});

// ---------- Pro / Ultra ----------
addAchievement("pro-member", "Pro Member", "Subscribe to Brain Quest Pro.", u => !!u.isPro);
addAchievement("ultra-member", "Ultra Member", "Subscribe to Brain Quest Ultra.", u => !!u.isUltra);

// ---------- Cosmetics ----------
const COSMETIC_CATEGORIES = [
  { key: "avatarIcons", label: "Avatar Icon", total: 2 },
  { key: "frames", label: "Frame", total: 2 },
  { key: "decorations", label: "Decoration", total: 2 },
  { key: "nameplates", label: "Nameplate", total: 2 },
  { key: "themes", label: "Shop Theme", total: 2 },
  { key: "music", label: "Shop Music Track", total: 2 }
];
COSMETIC_CATEGORIES.forEach(cat => {
  addAchievement(`own-${cat.key}-1`, `First ${cat.label}`, `Own at least one ${cat.label.toLowerCase()}.`,
    u => ((u.ownedCosmetics && u.ownedCosmetics[cat.key]) || []).length >= 1);
  addAchievement(`own-${cat.key}-all`, `${cat.label} Collector`, `Own every ${cat.label.toLowerCase()} in the Shop.`,
    u => ((u.ownedCosmetics && u.ownedCosmetics[cat.key]) || []).length >= cat.total);
});
addAchievement("fully-customized", "Fully Customized", "Own at least one item in every cosmetic category.",
  u => COSMETIC_CATEGORIES.every(cat => ((u.ownedCosmetics && u.ownedCosmetics[cat.key]) || []).length >= 1));

// ---------- Renaissance / breadth ----------
addAchievement("renaissance-mind", "Renaissance Mind", "Complete lessons in at least 4 different subjects.", u => {
  const subjectsTouched = new Set((u.completedSubjects || []).map(key => key.split(":")[0]));
  return subjectsTouched.size >= 4;
});
addAchievement("renaissance-master", "True Renaissance Mind", "Complete at least one lesson in every subject.", u => {
  const subjectsTouched = new Set((u.completedSubjects || []).map(key => key.split(":")[0]));
  return SUBJECTS.every(s => subjectsTouched.has(s.id));
});

// ---------- AI Tutor ----------
addAchievement("tutor-first-use", "Curious Mind", "Use the AI Tutor for the first time.", u => Object.keys(u.tutorLevel || {}).length > 0);

function renderAchievementsScreen() {
  const grid = document.getElementById("achievements-grid");
  grid.innerHTML = ACHIEVEMENTS.map(a => {
    const unlocked = a.check(currentUserData);
    return `
      <div class="achievement-card${unlocked ? " achievement-unlocked" : ""}">
        <span class="achievement-badge${unlocked ? " seal-badge" : ""}">
          ${unlocked ? UTIL_ICON_SVG.check : UTIL_ICON_SVG.lock}
        </span>
        <p class="achievement-name">${a.name}</p>
        <p class="achievement-desc">${a.description}</p>
      </div>
    `;
  }).join("");

  const unlockedCount = ACHIEVEMENTS.filter(a => a.check(currentUserData)).length;
  document.getElementById("achievements-progress").textContent = `${unlockedCount} / ${ACHIEVEMENTS.length} unlocked`;
}
