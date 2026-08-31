// ------------------------------------------------------------------
// Brain Quest — Ranked Leaderboard.
//
// HONEST NOTE ON HOW THIS WORKS: a real competitive weekly league
// (like Duolingo's) needs a server to run the week's rollover for
// everyone at the same instant, fairly, in one atomic step. This app
// has no backend, so instead: each player's own device checks — the
// next time THEY open the leaderboard — whether a new "week" (a
// rolling 7-day period counted from a fixed epoch, not calendar
// weeks) has started since they last checked. If so, it looks at
// where they landed in their rank's leaderboard and promotes/demotes
// them before resetting their weekly XP.
//
// This means: rollovers happen at slightly different real-world
// moments for different players (whenever each one next opens the
// app), and the "cohort" each player is judged against is whoever
// else happens to be in that rank with recorded weeklyXP at that
// exact moment — not a fixed, closed group the way a real backend-run
// league would guarantee. For a small app this works fine in
// practice; it's not perfectly fair at a large scale. A real fix
// would be a scheduled Cloud Function running the rollover for
// everyone at once — a good next step once this app has a backend.
// ------------------------------------------------------------------

const RANKS = [
  { name: "Bronze", color: "#B08D57" },
  { name: "Silver", color: "#B7C1C9" },
  { name: "Gold", color: "#E8B923" },
  { name: "Platinum", color: "#7FD8C9" },
  { name: "Sapphire", color: "#3B6FE0" },
  { name: "Ruby", color: "#E0304F" },
  { name: "Emerald", color: "#2FAE6B" },
  { name: "Diamond", color: "#5ED9F0" },
  { name: "Master", color: "#9B5DE5" },
  { name: "Legend", color: "#F5A623" }
];

const PROMOTION_ZONE_SIZE = 3;
const DEMOTION_ZONE_SIZE = 3;
const MIN_COHORT_FOR_MOVEMENT = 6; // skip promotion/demotion if too few players in a cohort this week
const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000;

function getCurrentWeekId() {
  return Math.floor(Date.now() / MS_PER_WEEK).toString();
}

// Checks whether a new week has started since this user's last visit
// and, if so, runs their promotion/demotion based on last week's
// standing within their rank cohort, then resets weeklyXP.
async function ensureWeekIsCurrent() {
  const currentWeekId = getCurrentWeekId();
  if (currentUserData.weekId === currentWeekId) return; // already up to date

  const isFirstEverCheck = !currentUserData.weekId;
  let newRank = currentUserData.rank || 0;

  if (!isFirstEverCheck) {
    try {
      // Fetch by rank only (no orderBy) — sorting client-side avoids
      // needing a Firestore composite index for this query entirely.
      const snapshot = await db.collection("users")
        .where("rank", "==", currentUserData.rank || 0)
        .limit(200)
        .get();

      const docsSorted = snapshot.docs
        .map(d => ({ id: d.id, weeklyXP: d.data().weeklyXP || 0 }))
        .sort((a, b) => b.weeklyXP - a.weeklyXP)
        .slice(0, 100);

      const ids = docsSorted.map(d => d.id);
      const position = currentUser ? ids.indexOf(currentUser.uid) : -1;
      const cohortSize = ids.length;

      if (position !== -1 && cohortSize >= MIN_COHORT_FOR_MOVEMENT) {
        if (position < PROMOTION_ZONE_SIZE && newRank < RANKS.length - 1) {
          newRank = newRank + 1;
        } else if (position >= cohortSize - DEMOTION_ZONE_SIZE && newRank > 0) {
          newRank = newRank - 1;
        }
      }
    } catch (err) {
      // If the ranked query fails for any reason, just carry the
      // player's rank over unchanged rather than block the
      // leaderboard from loading at all.
    }
  }

  const rankChanged = newRank !== (currentUserData.rank || 0);
  currentUserData.lastRankChange = isFirstEverCheck ? null : (rankChanged ? (newRank > currentUserData.rank ? "up" : "down") : null);
  currentUserData.rank = newRank;
  currentUserData.weeklyXP = 0;
  currentUserData.weekId = currentWeekId;

  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      rank: newRank,
      weeklyXP: 0,
      weekId: currentWeekId
    });
  }
}

async function renderLeaderboard() {
  const listEl = document.getElementById("leaderboard-list");
  listEl.innerHTML = `<p class="leaderboard-loading">Loading leaderboard…</p>`;

  await ensureWeekIsCurrent();

  const rankInfo = RANKS[currentUserData.rank || 0];
  const pendingRankChange = currentUserData.lastRankChange;
  currentUserData.lastRankChange = null; // only trigger the animation once

  try {
    // Fetch by rank only (no orderBy) — sorting client-side avoids
    // needing a Firestore composite index for this query.
    const snapshot = await db.collection("users")
      .where("rank", "==", currentUserData.rank || 0)
      .limit(200)
      .get();

    const docs = snapshot.docs
      .map(d => ({ id: d.id, data: d.data() }))
      .sort((a, b) => (b.data.weeklyXP || 0) - (a.data.weeklyXP || 0))
      .slice(0, 30);

    let rows = "";
    if (docs.length === 0) {
      rows = `<p class="leaderboard-loading">No one in this league has played yet this week.</p>`;
    } else {
      const total = docs.length;
      let rank = 0;
      docs.forEach(({ id, data }) => {
        rank++;
        const isMe = currentUser && id === currentUser.uid;
        const isPromoZone = total >= MIN_COHORT_FOR_MOVEMENT && rank <= PROMOTION_ZONE_SIZE && (currentUserData.rank || 0) < RANKS.length - 1;
        const isDemoZone = total >= MIN_COHORT_FOR_MOVEMENT && rank > total - DEMOTION_ZONE_SIZE && (currentUserData.rank || 0) > 0;
        rows += `
          <div class="leaderboard-row ${isMe ? "leaderboard-row-me" : ""} ${isPromoZone ? "promo-zone" : ""} ${isDemoZone ? "demo-zone" : ""}">
            <span class="leaderboard-rank">#${rank}</span>
            ${renderAvatarCosmetic(data)}
            <span class="leaderboard-name ${nameplateClass(data)}">${escapeHtml(data.name || "Student")}${isMe ? " (you)" : ""}</span>
            <span class="leaderboard-xp">${data.weeklyXP || 0} XP</span>
          </div>
        `;
      });
    }

    listEl.innerHTML = `
      <div class="rank-header">
        <span class="rank-badge" style="background:${rankInfo.color}22; color:${rankInfo.color}; border-color:${rankInfo.color}">${rankInfo.name} League</span>
        <span class="rank-subnote">Top ${PROMOTION_ZONE_SIZE} promote · Bottom ${DEMOTION_ZONE_SIZE} demote · Resets weekly</span>
      </div>
      ${rows}
    `;

    if (pendingRankChange) playLeagueChangeAnimation(pendingRankChange, rankInfo);
  } catch (err) {
    listEl.innerHTML = `<p class="leaderboard-loading">Couldn't load the leaderboard right now. (${escapeHtml(err.message || String(err))})</p>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function playLeagueChangeAnimation(direction, rankInfo) {
  const overlay = document.getElementById("league-change-overlay");
  const isUp = direction === "up";
  document.getElementById("league-change-title").textContent = isUp ? "Promoted!" : "Demoted";
  document.getElementById("league-change-name").textContent = rankInfo.name + " League";
  document.getElementById("league-change-name").style.color = rankInfo.color;
  document.getElementById("league-change-sub").textContent = isUp
    ? "You climbed into a tougher league last week. Keep it up!"
    : "You dropped a league last week — jump back in and climb again.";
  overlay.classList.toggle("league-change-down", !isUp);
  overlay.classList.remove("hidden");
  overlay.classList.remove("level-up-animate");
  void overlay.offsetWidth;
  overlay.classList.add("level-up-animate");
}

document.getElementById("league-change-close-btn").addEventListener("click", () => {
  document.getElementById("league-change-overlay").classList.add("hidden");
});
