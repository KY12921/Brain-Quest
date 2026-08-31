// ------------------------------------------------------------------
// Brain Quest — Daily Mission Board.
//
// Several independent daily missions, each with its own progress
// counter and XP reward. All reset together at the start of each new
// calendar day (compared by date string, so it resets at local
// midnight). Hooks into this are called from app.js (correct answers,
// quest completion, XP gained), boss.js (boss wins), and duels.js
// (duels played) — see registerMissionEvent() calls in each file.
// ------------------------------------------------------------------

// A small star icon for the mission board, matching the existing
// line-icon system rather than an emoji.
const STAR_ICON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15 9 22 9 16.5 13.5 18.5 21 12 16.5 5.5 21 7.5 13.5 2 9 9 9"/></svg>';

const MISSIONS = [
  { id: "correctAnswers", label: "Answer 5 questions correctly", target: 5, reward: 500, icon: UTIL_ICON_SVG.check },
  { id: "questsCompleted", label: "Complete 1 full quest", target: 1, reward: 300, icon: NAV_ICON_SVG.quests },
  { id: "bossWins", label: "Defeat 1 boss", target: 1, reward: 400, icon: NAV_ICON_SVG.boss },
  { id: "duelsPlayed", label: "Play 1 battle", target: 1, reward: 250, icon: NAV_ICON_SVG.duel },
  { id: "xpEarnedToday", label: "Earn 150 XP today", target: 150, reward: 200, icon: STAR_ICON_SVG }
];

function todayString() {
  return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
}

// Makes sure progress/claimed maps exist for every mission and resets
// them if it's a new day. Safe to call often — it's cheap and local
// until something actually needs to persist.
function ensureMissionIsForToday() {
  const today = todayString();
  const isNewDay = currentUserData.missionDate !== today;

  if (!currentUserData.missionProgress || isNewDay) currentUserData.missionProgress = {};
  if (!currentUserData.missionClaimed || isNewDay) currentUserData.missionClaimed = {};

  MISSIONS.forEach(m => {
    if (typeof currentUserData.missionProgress[m.id] !== "number") {
      currentUserData.missionProgress[m.id] = 0;
    }
    if (typeof currentUserData.missionClaimed[m.id] !== "boolean") {
      currentUserData.missionClaimed[m.id] = false;
    }
  });

  if (isNewDay) currentUserData.missionDate = today;
}

// Called whenever something relevant happens (a correct answer, a
// completed quest, a boss win, a duel played, XP earned). Bumps the
// matching mission's progress and auto-claims the reward the moment
// its target is reached.
async function registerMissionEvent(missionId, amount = 1) {
  if (!currentUserData) return;
  const mission = MISSIONS.find(m => m.id === missionId);
  if (!mission) return;

  ensureMissionIsForToday();
  if (currentUserData.missionClaimed[missionId]) return;

  currentUserData.missionProgress[missionId] = Math.min(
    currentUserData.missionProgress[missionId] + amount,
    mission.target
  );

  const updates = {
    missionDate: currentUserData.missionDate,
    [`missionProgress.${missionId}`]: currentUserData.missionProgress[missionId]
  };

  let justCompleted = false;
  if (currentUserData.missionProgress[missionId] >= mission.target) {
    currentUserData.missionClaimed[missionId] = true;
    updates[`missionClaimed.${missionId}`] = true;
    justCompleted = true;
  }

  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update(updates);
  }

  if (justCompleted) {
    await addCoins(mission.reward);
  }

  if (!document.getElementById("missions-section").classList.contains("hidden")) {
    renderMissions();
  }
}

function renderMissions() {
  ensureMissionIsForToday();
  const board = document.getElementById("mission-card");
  board.innerHTML = "";
  board.className = "mission-board";

  MISSIONS.forEach(mission => {
    const progress = currentUserData.missionProgress[mission.id] || 0;
    const claimed = currentUserData.missionClaimed[mission.id];
    const pct = Math.min((progress / mission.target) * 100, 100);

    const item = document.createElement("div");
    item.className = "mission-item" + (claimed ? " mission-item-done" : "");
    item.innerHTML = `
      <p class="mission-name"><span class="mission-icon${claimed ? " seal-badge" : ""}">${claimed ? UTIL_ICON_SVG.check : mission.icon}</span> ${mission.label}</p>
      <div class="mission-progress-bar">
        <div class="mission-progress-fill" style="width:${pct}%"></div>
      </div>
      <p class="mission-status">${claimed ? "Completed — +" + mission.reward + " coins claimed" : progress + " / " + mission.target + " — reward: " + mission.reward + " coins"}</p>
    `;
    board.appendChild(item);
  });
}
