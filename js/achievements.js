// ------------------------------------------------------------------
// Brain Quest — Achievements wall.
//
// Every badge here is computed from data already being tracked
// (xp, completedSubjects, bossLevels, isPro, rank) — no new fields
// were added to the user data model for this.
// ------------------------------------------------------------------

const ACHIEVEMENTS = [
  {
    id: "first-lesson",
    name: "First Steps",
    description: "Complete your first lesson.",
    check: (u) => (u.completedSubjects || []).length >= 1
  },
  {
    id: "quick-learner",
    name: "Quick Learner",
    description: "Reach Level 5.",
    check: (u) => levelForXp(u.xp || 0) >= 5
  },
  {
    id: "dedicated-scholar",
    name: "Dedicated Scholar",
    description: "Reach Level 10.",
    check: (u) => levelForXp(u.xp || 0) >= 10
  },
  {
    id: "boss-slayer",
    name: "Boss Slayer",
    description: "Defeat a Boss Fight in any subject.",
    check: (u) => Object.values(u.bossLevels || {}).some(lvl => lvl > 0)
  },
  {
    id: "renaissance-mind",
    name: "Renaissance Mind",
    description: "Complete lessons in at least 4 different subjects.",
    check: (u) => {
      const subjectsTouched = new Set((u.completedSubjects || []).map(key => key.split(":")[0]));
      return subjectsTouched.size >= 4;
    }
  },
  {
    id: "quarter-century",
    name: "Quarter Century",
    description: "Complete 25 lessons total, across any subjects.",
    check: (u) => (u.completedSubjects || []).length >= 25
  },
  {
    id: "league-climber",
    name: "League Climber",
    description: "Get promoted out of Bronze league at least once.",
    check: (u) => (u.rank || 0) >= 1
  },
  {
    id: "pro-member",
    name: "Pro Member",
    description: "Subscribe to Brain Quest Pro.",
    check: (u) => !!u.isPro
  }
];

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
