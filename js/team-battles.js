// ------------------------------------------------------------------
// Brain Quest — Team Battles (2v2, live).
//
// Same core idea as the 1v1 Battle in duels.js: nobody sees a
// question until everyone's in, live progress is visible via
// Firestore listeners, and honesty about the limits applies equally
// here — this is not a millisecond-synchronized multiplayer session,
// each player moves through their own 5 questions at their own pace
// once the battle starts.
//
// Firestore doesn't support "update one object inside an array" as a
// single atomic operation the way it does document fields, so team
// rosters and scores are updated via read-the-whole-document,
// modify-the-one-player's-object, write-the-whole-array-back. That's
// an accepted small race-condition window (two teammates finishing in
// the exact same instant) — the same trade-off already made
// elsewhere in this app (see firestore.js's incrementFirestoreField
// equivalent reasoning on the Cloudflare Worker side).
// ------------------------------------------------------------------

const TEAM_BATTLE_WIN_BONUS_XP = 120;
let _selectedTeamBattleSubjectId = null;
let _selectedTeamBattleSize = 2;
let _activeTeamBattleListener = null;
let _activeTeamBattleId = null;

document.querySelectorAll(".team-size-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    _selectedTeamBattleSize = parseInt(btn.dataset.size, 10);
    document.querySelectorAll(".team-size-btn").forEach(b => b.classList.toggle("team-size-btn-active", b === btn));
  });
});

function renderTeamBattleMenu() {
  const grid = document.getElementById("team-battle-subject-grid");
  if (!_selectedTeamBattleSubjectId) _selectedTeamBattleSubjectId = SUBJECTS[0].id;

  grid.innerHTML = SUBJECTS.map(s => `
    <button type="button" class="duel-subject-card${s.id === _selectedTeamBattleSubjectId ? " duel-subject-card-active" : ""}" data-subject-id="${s.id}" style="--subject-color:${s.color}; --subject-soft:${s.colorSoft};">
      <span class="quest-icon">${SUBJECT_ICON_SVG[s.id] || s.icon}</span>
      <p class="quest-name">${s.name}</p>
    </button>
  `).join("");

  grid.querySelectorAll(".duel-subject-card").forEach(btn => {
    btn.addEventListener("click", () => {
      _selectedTeamBattleSubjectId = btn.dataset.subjectId;
      renderTeamBattleMenu();
    });
  });

  document.getElementById("team-battle-menu").classList.remove("hidden");
  document.getElementById("team-battle-waiting").classList.add("hidden");
  document.getElementById("team-battle-result").classList.add("hidden");
  document.getElementById("team-battle-error").textContent = "";
  document.querySelectorAll(".team-size-btn").forEach(b => b.classList.toggle("team-size-btn-active", parseInt(b.dataset.size, 10) === _selectedTeamBattleSize));
  stopTeamBattleListener();
}

function stopTeamBattleListener() {
  if (_activeTeamBattleListener) { _activeTeamBattleListener(); _activeTeamBattleListener = null; }
}

// ---------- Creating a Team Battle ----------
document.getElementById("team-battle-create-btn").addEventListener("click", async () => {
  const subjectId = _selectedTeamBattleSubjectId;
  const subject = SUBJECTS.find(s => s.id === subjectId);
  const questions = getQuestions(subjectId);
  const errorEl = document.getElementById("team-battle-error");
  errorEl.textContent = "";

  try {
    const battleRef = await db.collection("teamBattles").add({
      subjectId: subjectId,
      subjectName: subject.name,
      questions: questions,
      teamSize: _selectedTeamBattleSize,
      teamA: [{ uid: currentUser.uid, name: currentUserData.name, score: null, liveScore: 0, liveIndex: 0 }],
      teamB: [],
      status: "waiting",
      winningTeam: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    _activeTeamBattleId = battleRef.id;
    showTeamBattleWaitingScreen(battleRef.id);
  } catch (err) {
    errorEl.textContent = "Couldn't create a Team Battle right now. Please try again.";
  }
});

// ---------- Joining a Team Battle (finds it, shows waiting screen) ----------
document.getElementById("team-battle-join-btn").addEventListener("click", async () => {
  const codeRaw = document.getElementById("team-battle-code-input").value.trim();
  const errorEl = document.getElementById("team-battle-error");
  errorEl.textContent = "";

  if (!codeRaw) {
    errorEl.textContent = "Enter a battle code first.";
    return;
  }

  try {
    const recent = await db.collection("teamBattles").orderBy("createdAt", "desc").limit(50).get();
    const battleDoc = recent.docs.find(d => d.id.toUpperCase().startsWith(codeRaw.toUpperCase())) || null;

    if (!battleDoc) {
      errorEl.textContent = "No Team Battle found with that code.";
      return;
    }
    const battle = battleDoc.data();
    if (battle.status !== "waiting") {
      errorEl.textContent = "That Team Battle has already started or finished.";
      return;
    }
    const alreadyIn = [...battle.teamA, ...battle.teamB].some(p => p.uid === currentUser.uid);
    if (alreadyIn) {
      errorEl.textContent = "You're already in this battle.";
      return;
    }

    _activeTeamBattleId = battleDoc.id;
    showTeamBattleWaitingScreen(battleDoc.id);
  } catch (err) {
    errorEl.textContent = "Couldn't join that Team Battle. Double check the code and try again.";
  }
});

function showTeamBattleWaitingScreen(battleId) {
  document.getElementById("team-battle-menu").classList.add("hidden");
  document.getElementById("team-battle-waiting").classList.remove("hidden");
  document.getElementById("team-battle-result").classList.add("hidden");
  document.getElementById("team-battle-code-display").textContent = battleId.slice(0, 6).toUpperCase();
  showScreen("team-battle-section");
  listenToTeamBattle(battleId);
}

function listenToTeamBattle(battleId) {
  stopTeamBattleListener();
  _activeTeamBattleListener = db.collection("teamBattles").doc(battleId).onSnapshot((doc) => {
    const battle = doc.data();
    if (!battle) return;

    if (battle.status === "active") {
      stopTeamBattleListener();
      startTeamBattleQuiz(battleId, battle);
      return;
    }
    if (battle.status === "completed") {
      stopTeamBattleListener();
      showTeamBattleResult(battle);
      return;
    }

    renderTeamRoster(battle);

    // If both teams are now full, flip status to active. Every
    // waiting player's listener runs this same check — harmless if
    // more than one of them writes "active", since it's the same value.
    const requiredSize = battle.teamSize || 2; // default 2 protects any battle created before this field existed
    if (battle.teamA.length === requiredSize && battle.teamB.length === requiredSize && battle.status === "waiting") {
      db.collection("teamBattles").doc(battleId).update({ status: "active" });
    }
  });
}

function renderTeamRoster(battle) {
  const requiredSize = battle.teamSize || 2;
  const isOnA = battle.teamA.some(p => p.uid === currentUser.uid);
  const isOnB = battle.teamB.some(p => p.uid === currentUser.uid);
  const onAnyTeam = isOnA || isOnB;

  document.getElementById("team-battle-gamemode-bar").textContent = `${requiredSize}v${requiredSize} Team Battle — ${battle.subjectName}`;
  document.getElementById("team-battle-team-a-list").innerHTML = battle.teamA.map(p => `<p>${escapeHtml(p.name)}</p>`).join("") || `<p class="team-battle-empty-slot">Open</p>`;
  document.getElementById("team-battle-team-b-list").innerHTML = battle.teamB.map(p => `<p>${escapeHtml(p.name)}</p>`).join("") || `<p class="team-battle-empty-slot">Open</p>`;

  const joinABtn = document.getElementById("team-battle-join-a-btn");
  const joinBBtn = document.getElementById("team-battle-join-b-btn");
  joinABtn.classList.toggle("hidden", onAnyTeam || battle.teamA.length >= requiredSize);
  joinBBtn.classList.toggle("hidden", onAnyTeam || battle.teamB.length >= requiredSize);

  document.getElementById("team-battle-waiting-status").textContent =
    onAnyTeam ? `Waiting for both teams to fill up (${requiredSize} players each)…` : "Pick a team to join.";
}

document.querySelectorAll(".team-battle-join-team-btn").forEach(btn => {
  btn.addEventListener("click", async () => {
    if (!_activeTeamBattleId) return;
    const team = btn.dataset.team;
    const field = team === "A" ? "teamA" : "teamB";
    const newPlayer = { uid: currentUser.uid, name: currentUserData.name, score: null, liveScore: 0, liveIndex: 0 };
    try {
      await db.collection("teamBattles").doc(_activeTeamBattleId).update({
        [field]: firebase.firestore.FieldValue.arrayUnion(newPlayer)
      });
    } catch (err) {
      document.getElementById("team-battle-error").textContent = "Couldn't join that team. Please try again.";
    }
  });
});

document.getElementById("team-battle-cancel-btn").addEventListener("click", () => renderTeamBattleMenu());
document.getElementById("team-battle-back-btn").addEventListener("click", () => renderTeamBattleMenu());
document.getElementById("team-battle-back-to-battle-btn").addEventListener("click", () => navigateTo("duel-section"));

// ---------- Starting the live quiz once both teams are full ----------
function startTeamBattleQuiz(battleId, battle) {
  const myTeam = battle.teamA.some(p => p.uid === currentUser.uid) ? "A" : "B";
  currentQuiz = {
    mode: "teamBattle",
    subjectId: battle.subjectId,
    subjectName: battle.subjectName + " Team Battle",
    questions: battle.questions,
    index: 0,
    correctCount: 0,
    teamBattleId: battleId,
    myTeam: myTeam
  };

  showScreen("quiz-section");
  document.getElementById("hearts-hud").classList.add("hidden");
  document.getElementById("battle-live-hud").classList.remove("hidden");
  listenForTeamBattleLiveProgress(battleId);
  renderQuestion();
}

function listenForTeamBattleLiveProgress(battleId) {
  stopTeamBattleListener();
  _activeTeamBattleListener = db.collection("teamBattles").doc(battleId).onSnapshot((doc) => {
    const battle = doc.data();
    if (!battle) return;
    const hud = document.getElementById("battle-live-hud");
    const totalA = battle.teamA.reduce((sum, p) => sum + (p.liveScore || 0), 0);
    const totalB = battle.teamB.reduce((sum, p) => sum + (p.liveScore || 0), 0);
    hud.textContent = `Team A: ${totalA} correct so far · Team B: ${totalB} correct so far`;
  });
}

// Called after every answered question during a team battle (hooked
// from app.js's applyAnswerResult, same as the 1v1 battle's hook).
async function updateTeamBattleProgress() {
  if (!currentQuiz || currentQuiz.mode !== "teamBattle" || !currentQuiz.teamBattleId) return;
  const battleId = currentQuiz.teamBattleId;
  const teamField = currentQuiz.myTeam === "A" ? "teamA" : "teamB";

  const doc = await db.collection("teamBattles").doc(battleId).get();
  const battle = doc.data();
  if (!battle) return;

  const team = battle[teamField].map(p =>
    p.uid === currentUser.uid ? { ...p, liveScore: currentQuiz.correctCount, liveIndex: currentQuiz.index + 1 } : p
  );
  await db.collection("teamBattles").doc(battleId).update({ [teamField]: team });
}

// ---------- Finishing a team battle's questions ----------
async function finishTeamBattlePlay() {
  const { correctCount, teamBattleId, myTeam } = currentQuiz;
  const xpGained = currentQuiz.xpEarned || 0;
  await addXp(xpGained);
  registerMissionEvent("duelsPlayed", 1);

  document.getElementById("battle-live-hud").classList.add("hidden");
  stopTeamBattleListener();

  const teamField = myTeam === "A" ? "teamA" : "teamB";
  const doc = await db.collection("teamBattles").doc(teamBattleId).get();
  let battle = doc.data();
  const updatedTeam = battle[teamField].map(p => p.uid === currentUser.uid ? { ...p, score: correctCount } : p);
  await db.collection("teamBattles").doc(teamBattleId).update({ [teamField]: updatedTeam });

  const refreshedDoc = await db.collection("teamBattles").doc(teamBattleId).get();
  battle = refreshedDoc.data();
  const allDone = [...battle.teamA, ...battle.teamB].every(p => p.score !== null);

  if (allDone) {
    await finalizeTeamBattle(teamBattleId, battle);
    showScreen("team-battle-section");
    const finalDoc = await db.collection("teamBattles").doc(teamBattleId).get();
    showTeamBattleResult(finalDoc.data());
  } else {
    showScreen("team-battle-section");
    document.getElementById("team-battle-menu").classList.add("hidden");
    document.getElementById("team-battle-waiting").classList.remove("hidden");
    document.getElementById("team-battle-result").classList.add("hidden");
    document.getElementById("team-battle-waiting-status").textContent = "You're done! Waiting for the other players to finish…";
    listenForTeamBattleCompletion(teamBattleId);
  }
}

async function finalizeTeamBattle(battleId, battle) {
  if (battle.status === "completed") return;
  const totalA = battle.teamA.reduce((sum, p) => sum + (p.score || 0), 0);
  const totalB = battle.teamB.reduce((sum, p) => sum + (p.score || 0), 0);
  let winningTeam = null;
  if (totalA > totalB) winningTeam = "A";
  else if (totalB > totalA) winningTeam = "B";

  await db.collection("teamBattles").doc(battleId).update({ status: "completed", winningTeam: winningTeam });

  const myTeamLetter = battle.teamA.some(p => p.uid === currentUser.uid) ? "A" : "B";
  if (winningTeam && winningTeam === myTeamLetter) {
    await addXp(TEAM_BATTLE_WIN_BONUS_XP);
  }
}

function listenForTeamBattleCompletion(battleId) {
  stopTeamBattleListener();
  _activeTeamBattleListener = db.collection("teamBattles").doc(battleId).onSnapshot(async (doc) => {
    const battle = doc.data();
    if (!battle) return;

    const allDone = [...battle.teamA, ...battle.teamB].every(p => p.score !== null);
    if (allDone && battle.status === "active") {
      await finalizeTeamBattle(battleId, battle);
    }
    if (battle.status === "completed") {
      stopTeamBattleListener();
      showTeamBattleResult(battle);
    }
  });
}

function showTeamBattleResult(battle) {
  document.getElementById("team-battle-menu").classList.add("hidden");
  document.getElementById("team-battle-waiting").classList.add("hidden");
  document.getElementById("team-battle-result").classList.remove("hidden");

  const totalA = battle.teamA.reduce((sum, p) => sum + (p.score || 0), 0);
  const totalB = battle.teamB.reduce((sum, p) => sum + (p.score || 0), 0);

  document.getElementById("team-battle-result-a").textContent =
    `Team A (${battle.teamA.map(p => p.name).join(" & ")}): ${totalA} / ${battle.questions.length * 2}`;
  document.getElementById("team-battle-result-b").textContent =
    `Team B (${battle.teamB.map(p => p.name).join(" & ")}): ${totalB} / ${battle.questions.length * 2}`;

  const winnerEl = document.getElementById("team-battle-winner-text");
  const myTeamLetter = battle.teamA.some(p => p.uid === currentUser.uid) ? "A" : "B";
  if (battle.status !== "completed") {
    winnerEl.textContent = "Waiting for everyone to finish…";
  } else if (!battle.winningTeam) {
    winnerEl.textContent = "It's a tie!";
  } else if (battle.winningTeam === myTeamLetter) {
    winnerEl.textContent = `Your team won! +${TEAM_BATTLE_WIN_BONUS_XP} bonus XP`;
  } else {
    winnerEl.textContent = `Team ${battle.winningTeam} won this Team Battle.`;
  }
}
