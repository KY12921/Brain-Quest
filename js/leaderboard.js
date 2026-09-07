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

// One badge shape per rank, increasing in visual complexity as rank
// rises — a plain shield at Bronze, escalating to a winged crest at
// Legend — rather than the flat colored text pill used before. Each
// uses currentColor so the same shape works for any rank's color via
// a wrapping element's CSS `color`, instead of needing 10 separate
// hardcoded-color SVGs. A diagonal white "shine" sweep and a soft
// dark base shadow are layered onto every badge for a faceted,
// gem-like look rather than a flat silhouette; the top three ranks
// (Diamond, Master, Legend) add small sparkle accents on top of that
// for extra shine befitting the rarest tiers.
const RANK_BADGE_SVG = [
  // Bronze — simple shield
  '<svg viewBox="0 0 48 48"><path d="M24 4 L40 10 V24 C40 34 33 41 24 44 C15 41 8 34 8 24 V10 Z" fill="currentColor" opacity="0.85" stroke="currentColor" stroke-width="2"/><path d="M24 36 C30 33 35 28 35 22 V14 L24 10 Z" fill="#FFFFFF" opacity="0.18"/><path d="M24 44 C15 41 8 34 8 24 V21 C8 30 15 37 24 40 C33 37 40 30 40 21 V24 C40 34 33 41 24 44 Z" fill="#000000" opacity="0.15"/></svg>',
  // Silver — diamond outline
  '<svg viewBox="0 0 48 48"><path d="M24 4 L42 24 L24 44 L6 24 Z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M24 4 L34 24 L24 34 L18 22 Z" fill="#FFFFFF" opacity="0.2"/><path d="M12 30 L24 44 L36 30 L24 38 Z" fill="#000000" opacity="0.12"/></svg>',
  // Gold — filled diamond
  '<svg viewBox="0 0 48 48"><path d="M24 4 L42 24 L24 44 L6 24 Z" fill="currentColor"/><path d="M24 4 L42 24 L24 24 Z" fill="currentColor" opacity="0.6"/><path d="M24 4 L32 22 L24 24 L18 16 Z" fill="#FFFFFF" opacity="0.3"/><path d="M10 27 L24 44 L38 27 L24 34 Z" fill="#000000" opacity="0.15"/></svg>',
  // Platinum — faceted shield
  '<svg viewBox="0 0 48 48"><path d="M24 4 L40 12 V24 C40 34 33 41 24 44 C15 41 8 34 8 24 V12 Z" fill="currentColor" opacity="0.9"/><path d="M24 4 V44 M8 20 L40 20" stroke="#0B141C" stroke-width="1.5" opacity="0.25"/><path d="M24 4 L34 13 L24 20 L16 15 Z" fill="#FFFFFF" opacity="0.28"/><path d="M10 26 C12 33 17 39 24 42 C31 39 36 33 38 26 V22 C36 30 31 36 24 39 C17 36 12 30 10 22 Z" fill="#000000" opacity="0.15"/></svg>',
  // Sapphire — hexagonal gem
  '<svg viewBox="0 0 48 48"><path d="M16 6 H32 L42 24 L32 42 H16 L6 24 Z" fill="currentColor"/><path d="M16 6 L24 24 L32 6 M6 24 H42 M16 42 L24 24 L32 42" stroke="#0B141C" stroke-width="1" opacity="0.2"/><path d="M16 6 H26 L24 24 L14 20 Z" fill="#FFFFFF" opacity="0.3"/><path d="M10 28 L16 42 H32 L38 28 L24 34 Z" fill="#000000" opacity="0.16"/></svg>',
  // Ruby — rounded gem
  '<svg viewBox="0 0 48 48"><path d="M24 6 C34 6 42 14 42 24 C42 34 34 42 24 42 C14 42 6 34 6 24 C6 14 14 6 24 6 Z" fill="currentColor"/><ellipse cx="17" cy="15" rx="6" ry="4.5" fill="#FFFFFF" opacity="0.35" transform="rotate(-30 17 15)"/><path d="M8 30 C11 36 17 41 24 42 C31 41 37 36 40 30 C36 35 30 38 24 38 C18 38 12 35 8 30 Z" fill="#000000" opacity="0.16"/></svg>',
  // Emerald — elongated hex gem with facets
  '<svg viewBox="0 0 48 48"><path d="M18 4 H30 L42 16 V32 L30 44 H18 L6 32 V16 Z" fill="currentColor"/><path d="M18 4 L24 16 L30 4 M6 16 L24 16 L42 16 M6 32 L24 32 L42 32 M18 44 L24 32 L30 44" stroke="#0B141C" stroke-width="1" opacity="0.2"/><path d="M18 4 H27 L24 16 L14 13 Z" fill="#FFFFFF" opacity="0.3"/><path d="M9 30 L18 44 H30 L39 30 L24 36 Z" fill="#000000" opacity="0.16"/></svg>',
  // Diamond — classic multi-facet diamond, plus small sparkles
  '<svg viewBox="0 0 48 48"><path d="M12 8 H36 L44 20 L24 44 L4 20 Z" fill="currentColor"/><path d="M12 8 L24 20 L36 8 M4 20 H44 M24 20 L24 44" stroke="#0B141C" stroke-width="1.2" opacity="0.25"/><path d="M12 8 H24 L20 20 L6 18 Z" fill="#FFFFFF" opacity="0.32"/><path d="M6 22 L24 44 L42 22 L24 32 Z" fill="#000000" opacity="0.15"/><path d="M40 6 L41.3 9 L44 10.3 L41.3 11.6 L40 14.6 L38.7 11.6 L36 10.3 L38.7 9 Z" fill="#FFFFFF" opacity="0.85"/></svg>',
  // Master — star burst inside a diamond, plus a soft glow ring
  '<svg viewBox="0 0 48 48"><circle cx="24" cy="24" r="21" fill="currentColor" opacity="0.18"/><path d="M24 2 L30 18 L46 24 L30 30 L24 46 L18 30 L2 24 L18 18 Z" fill="currentColor"/><path d="M24 2 L27 18 L24 20 L21 18 Z" fill="#FFFFFF" opacity="0.35"/><path d="M8 30 L24 46 L40 30 L24 38 Z" fill="#000000" opacity="0.14"/><path d="M8 6 L9.3 9 L12 10.3 L9.3 11.6 L8 14.6 L6.7 11.6 L4 10.3 L6.7 9 Z" fill="#FFFFFF" opacity="0.8"/><path d="M40 34 L41 36.4 L43.4 37.4 L41 38.4 L40 40.8 L39 38.4 L36.6 37.4 L39 36.4 Z" fill="#FFFFFF" opacity="0.8"/></svg>',
  // Legend — winged crest, the most elaborate badge, with a glow halo
  '<svg viewBox="0 0 64 48"><circle cx="32" cy="22" r="20" fill="currentColor" opacity="0.16"/><path d="M2 20 L16 14 L22 22 L16 26 Z" fill="currentColor" opacity="0.85"/><path d="M62 20 L48 14 L42 22 L48 26 Z" fill="currentColor" opacity="0.85"/><path d="M22 8 H42 L48 22 L32 44 L16 22 Z" fill="currentColor"/><path d="M22 8 H32 L28 22 L16 22 Z" fill="#FFFFFF" opacity="0.3"/><path d="M16 24 L32 44 L48 24 L32 34 Z" fill="#000000" opacity="0.16"/><circle cx="32" cy="22" r="6" fill="#FFFFFF" opacity="0.35"/><path d="M8 4 L9.3 7 L12 8.3 L9.3 9.6 L8 12.6 L6.7 9.6 L4 8.3 L6.7 7 Z" fill="#FFFFFF" opacity="0.85"/><path d="M56 4 L57.3 7 L60 8.3 L57.3 9.6 L56 12.6 L54.7 9.6 L52 8.3 L54.7 7 Z" fill="#FFFFFF" opacity="0.85"/><path d="M32 40 L33 42.4 L35.4 43.4 L33 44.4 L32 46.8 L31 44.4 L28.6 43.4 L31 42.4 Z" fill="#FFFFFF" opacity="0.85"/></svg>'
];

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

async function renderLeaderboard(viewRankIndex) {
  const isOwnRank = viewRankIndex === undefined || viewRankIndex === (currentUserData.rank || 0);
  const displayRank = viewRankIndex !== undefined ? viewRankIndex : (currentUserData.rank || 0);

  const listEl = document.getElementById("leaderboard-list");
  listEl.innerHTML = `<p class="leaderboard-loading">Loading leaderboard…</p>`;
  renderLeagueSelector(displayRank);

  // Weekly reset/promotion checks only make sense for your own
  // league — browsing another league to look around shouldn't
  // trigger (or suppress) your own rank-change animation.
  if (isOwnRank) await ensureWeekIsCurrent();

  const rankInfo = RANKS[displayRank];
  const pendingRankChange = isOwnRank ? currentUserData.lastRankChange : null;
  if (isOwnRank) currentUserData.lastRankChange = null; // only trigger the animation once

  try {
    // Fetch by rank only (no orderBy) — sorting client-side avoids
    // needing a Firestore composite index for this query.
    const snapshot = await db.collection("users")
      .where("rank", "==", displayRank)
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
        // Promotion/demotion zones reflect the league being VIEWED,
        // not the viewer's own rank — Bronze's promotion rules apply
        // when looking at Bronze, even if you're a Gold player
        // just browsing.
        const isPromoZone = total >= MIN_COHORT_FOR_MOVEMENT && rank <= PROMOTION_ZONE_SIZE && displayRank < RANKS.length - 1;
        const isDemoZone = total >= MIN_COHORT_FOR_MOVEMENT && rank > total - DEMOTION_ZONE_SIZE && displayRank > 0;
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

    // Master and Legend (the top two tiers) get an animated glow —
    // a static badge doesn't feel meaningfully different from a
    // mid-tier one no matter how detailed its artwork is; a subtle
    // pulse is the common "this is the rare one" signal in most
    // game UIs, reserved for just the top two so it stays special.
    const isTopTier = displayRank >= RANKS.length - 2;
    listEl.innerHTML = `
      <div class="rank-header">
        <span class="rank-badge-icon${isTopTier ? " rank-badge-icon-glow" : ""}" style="color:${rankInfo.color}">${RANK_BADGE_SVG[displayRank]}</span>
        <span class="rank-badge" style="background:${rankInfo.color}22; color:${rankInfo.color}; border-color:${rankInfo.color}">${rankInfo.name} League${!isOwnRank ? " (browsing)" : ""}</span>
        <span class="rank-subnote">Top ${PROMOTION_ZONE_SIZE} promote · Bottom ${DEMOTION_ZONE_SIZE} demote · Resets weekly</span>
      </div>
      ${rows}
    `;

    if (pendingRankChange) playLeagueChangeAnimation(pendingRankChange, rankInfo);
  } catch (err) {
    listEl.innerHTML = `<p class="leaderboard-loading">Couldn't load the leaderboard right now. (${escapeHtml(err.message || String(err))})</p>`;
  }
}

// A row of every league's badge — tap any one to browse its
// standings without affecting your own rank/animation state.
function renderLeagueSelector(activeRankIndex) {
  const container = document.getElementById("league-selector");
  if (!container) return;
  container.innerHTML = RANKS.map((r, i) => `
    <button type="button" class="league-selector-btn ${i === activeRankIndex ? "league-selector-btn-active" : ""}" data-rank-index="${i}" style="color:${r.color}" title="${r.name}">
      ${RANK_BADGE_SVG[i]}
    </button>
  `).join("");
  container.querySelectorAll(".league-selector-btn").forEach(btn => {
    btn.addEventListener("click", () => renderLeaderboard(parseInt(btn.dataset.rankIndex, 10)));
  });
}

// A separate, simpler global view — not scoped to weekly league rank
// the way the XP leaderboard above is, since "lessons completed" is a
// lifetime total, not a weekly competitive metric. Firestore can't
// order by an array's length server-side, so this fetches a
// reasonable pool and sorts client-side, same approach the XP
// leaderboard already uses to avoid needing a composite index.
async function renderLessonsLeaderboard() {
  const listEl = document.getElementById("leaderboard-list-lessons");
  listEl.innerHTML = `<p class="leaderboard-loading">Loading leaderboard…</p>`;

  try {
    const snapshot = await db.collection("users").limit(200).get();
    const docs = snapshot.docs
      .map(d => ({ id: d.id, data: d.data() }))
      .sort((a, b) => (b.data.completedSubjects || []).length - (a.data.completedSubjects || []).length)
      .slice(0, 30);

    if (docs.length === 0) {
      listEl.innerHTML = `<p class="leaderboard-loading">No one has completed any lessons yet.</p>`;
      return;
    }

    let rank = 0;
    listEl.innerHTML = docs.map(({ id, data }) => {
      rank++;
      const isMe = currentUser && id === currentUser.uid;
      return `
        <div class="leaderboard-row ${isMe ? "leaderboard-row-me" : ""}">
          <span class="leaderboard-rank">#${rank}</span>
          ${renderAvatarCosmetic(data)}
          <span class="leaderboard-name ${nameplateClass(data)}">${escapeHtml(data.name || "Student")}${isMe ? " (you)" : ""}</span>
          <span class="leaderboard-xp">${(data.completedSubjects || []).length} lessons</span>
        </div>
      `;
    }).join("");
  } catch (err) {
    listEl.innerHTML = `<p class="leaderboard-loading">Couldn't load the leaderboard right now. (${escapeHtml(err.message || String(err))})</p>`;
  }
}

document.querySelectorAll('[data-leaderboard-tab]').forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll('[data-leaderboard-tab]').forEach(b => b.classList.toggle("leaderboard-tab-active", b === btn));
    const tab = btn.dataset.leaderboardTab;
    document.getElementById("leaderboard-list").classList.toggle("hidden", tab !== "xp");
    document.getElementById("leaderboard-list-lessons").classList.toggle("hidden", tab !== "lessons");
    if (tab === "lessons") renderLessonsLeaderboard();
  });
});

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

// ------------------------------------------------------------------
// Immediate "you moved up the leaderboard" animation — distinct from
// the weekly league promotion/demotion overlay above. This checks
// your position WITHIN your current league's weekly cohort right
// after a lesson, using a single read: everyone else's weeklyXP
// hasn't changed, so comparing it against both your before-and-after
// XP values gives both positions without needing two separate queries
// at two points in time.
// ------------------------------------------------------------------
async function checkLeaderboardRankUpAnimation(xpGained) {
  if (!currentUser || !xpGained || xpGained <= 0) return;

  try {
    const snapshot = await db.collection("users").where("rank", "==", currentUserData.rank || 0).get();
    const myXpAfter = currentUserData.weeklyXP || 0;
    const myXpBefore = myXpAfter - xpGained;

    let positionBefore = 1;
    let positionAfter = 1;
    snapshot.forEach(doc => {
      if (doc.id === currentUser.uid) return;
      const theirXp = doc.data().weeklyXP || 0;
      if (theirXp > myXpBefore) positionBefore++;
      if (theirXp > myXpAfter) positionAfter++;
    });

    if (positionAfter < positionBefore) {
      playLeaderboardRankUpAnimation(positionBefore, positionAfter);
    }
  } catch (err) {
    console.warn("Couldn't check leaderboard position change:", err.message);
  }
}

function playLeaderboardRankUpAnimation(fromPosition, toPosition) {
  const overlay = document.getElementById("leaderboard-rankup-overlay");
  document.getElementById("leaderboard-rankup-from").textContent = "#" + fromPosition;
  document.getElementById("leaderboard-rankup-to").textContent = "#" + toPosition;
  overlay.classList.remove("hidden");
  overlay.classList.remove("leaderboard-rankup-animate");
  void overlay.offsetWidth;
  overlay.classList.add("leaderboard-rankup-animate");
}

document.getElementById("leaderboard-rankup-close-btn").addEventListener("click", () => {
  document.getElementById("leaderboard-rankup-overlay").classList.add("hidden");
});
