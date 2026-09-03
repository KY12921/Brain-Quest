// ------------------------------------------------------------------
// Brain Quest — Battles (formerly "Duels").
//
// HOW THIS WORKS NOW: this is a genuinely live battle, not just an
// async score comparison. The creator waits until an opponent joins
// before either of them sees a single question — both start at the
// same moment. While playing, each player's progress (question
// number, running score) is written to Firestore after every answer,
// and a small live scoreboard shows the opponent's progress updating
// in near-real-time via a Firestore listener (the same technique
// used for the "waiting for opponent" screen before).
//
// HONEST LIMIT: this still isn't a perfectly synchronized multiplayer
// session (there's no shared clock forcing both players to answer
// question N at the exact same second — each moves through the
// question set at their own pace once it starts). Firestore's
// realtime listeners give sub-second update latency, which is what
// makes the live scoreboard feel responsive, but true lockstep timing
// would need a dedicated realtime backend beyond what GitHub Pages +
// Firestore can offer.
//
// XP: both players earn normal per-correct-answer XP; the winner also
// gets a bonus. A tie awards the bonus to neither.
// ------------------------------------------------------------------

const DUEL_XP_PER_CORRECT = 20;
const DUEL_WIN_BONUS_XP = 100;

let activeDuelListener = null;
let activeDuelId = null;

let _selectedDuelSubjectId = null;

function renderDuelMenu() {
  const grid = document.getElementById("duel-subject-grid");
  if (!_selectedDuelSubjectId) _selectedDuelSubjectId = SUBJECTS[0].id;

  grid.innerHTML = SUBJECTS.map(s => `
    <button type="button" class="duel-subject-card${s.id === _selectedDuelSubjectId ? " duel-subject-card-active" : ""}" data-subject-id="${s.id}" style="--subject-color:${s.color}; --subject-soft:${s.colorSoft};">
      <span class="quest-icon">${SUBJECT_ICON_SVG[s.id] || s.icon}</span>
      <p class="quest-name">${s.name}</p>
    </button>
  `).join("");

  grid.querySelectorAll(".duel-subject-card").forEach(btn => {
    btn.addEventListener("click", () => {
      _selectedDuelSubjectId = btn.dataset.subjectId;
      renderDuelMenu();
    });
  });

  document.getElementById("duel-menu").classList.remove("hidden");
  document.getElementById("duel-waiting").classList.add("hidden");
  document.getElementById("duel-result").classList.add("hidden");
  document.getElementById("quick-match-waiting").classList.add("hidden");
  document.getElementById("duel-error").textContent = "";

  renderQuickMatchGrid();
  stopActiveDuelListener();
}

function stopActiveDuelListener() {
  if (activeDuelListener) {
    activeDuelListener();
    activeDuelListener = null;
  }
}

// ---------- Creating a battle ----------
// The creator does NOT start playing yet — they wait for an opponent
// to join first, so both players begin the same moment.
document.getElementById("duel-create-btn").addEventListener("click", async () => {
  const subjectId = _selectedDuelSubjectId;
  const subject = SUBJECTS.find(s => s.id === subjectId);
  const questions = getQuestions(subjectId);
  const errorEl = document.getElementById("duel-error");
  errorEl.textContent = "";

  try {
    const duelRef = await db.collection("duels").add({
      subjectId: subjectId,
      subjectName: subject.name,
      questions: questions,
      creatorUid: currentUser.uid,
      creatorName: currentUserData.name,
      creatorScore: null,
      creatorLiveScore: 0,
      creatorLiveIndex: 0,
      opponentUid: null,
      opponentName: null,
      opponentScore: null,
      opponentLiveScore: 0,
      opponentLiveIndex: 0,
      status: "waiting",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    activeDuelId = duelRef.id;
    const shortCode = duelRef.id.slice(0, 6).toUpperCase();
    document.getElementById("duel-code-display").textContent = shortCode;
    document.getElementById("duel-menu").classList.add("hidden");
    document.getElementById("duel-waiting").classList.remove("hidden");
    document.getElementById("duel-result").classList.add("hidden");
    document.getElementById("duel-waiting-status").textContent = "Share this code — the battle starts the moment someone joins…";
    showScreen("duel-section");

    listenForOpponentToStart(duelRef.id, subject, questions);
  } catch (err) {
    errorEl.textContent = "Couldn't create a battle right now. Please try again.";
  }
});

function listenForOpponentToStart(duelId, subject, questions) {
  stopActiveDuelListener();
  activeDuelListener = db.collection("duels").doc(duelId).onSnapshot((doc) => {
    const duel = doc.data();
    if (!duel) return;
    if (duel.status === "active" && duel.opponentUid) {
      stopActiveDuelListener();
      startBattleQuiz(duelId, "creator", subject, questions);
    }
  });
}

// ---------- Joining a battle ----------
document.getElementById("duel-join-btn").addEventListener("click", async () => {
  const codeRaw = document.getElementById("duel-code-input").value.trim();
  const errorEl = document.getElementById("duel-error");
  errorEl.textContent = "";

  if (!codeRaw) {
    errorEl.textContent = "Enter a battle code first.";
    return;
  }

  try {
    // Firestore auto-generated document IDs are mixed-case, so we find
    // the battle by scanning recent battles for one whose ID starts
    // with the entered code (case-insensitive). Fine at small scale.
    const recent = await db.collection("duels").orderBy("createdAt", "desc").limit(50).get();
    const duelDoc = recent.docs.find(d => d.id.toUpperCase().startsWith(codeRaw.toUpperCase())) || null;

    if (!duelDoc) {
      errorEl.textContent = "No battle found with that code.";
      return;
    }

    const duel = duelDoc.data();
    if (duel.status !== "waiting") {
      errorEl.textContent = "That battle has already started or been completed.";
      return;
    }
    if (duel.creatorUid === currentUser.uid) {
      errorEl.textContent = "You can't join your own battle.";
      return;
    }

    await db.collection("duels").doc(duelDoc.id).update({
      opponentUid: currentUser.uid,
      opponentName: currentUserData.name,
      status: "active"
    });

    const subject = { id: duel.subjectId, name: duel.subjectName };
    startBattleQuiz(duelDoc.id, "opponent", subject, duel.questions);
  } catch (err) {
    errorEl.textContent = "Couldn't join that battle. Double check the code and try again.";
  }
});

// ---------- Starting the live quiz for either role ----------
function startBattleQuiz(duelId, role, subject, questions) {
  currentQuiz = {
    mode: "duel",
    subjectId: subject.id,
    subjectName: (subject.name || "") + " Battle",
    questions: questions,
    index: 0,
    correctCount: 0,
    duelId: duelId,
    duelRole: role
  };

  showScreen("quiz-section");
  document.getElementById("hearts-hud").classList.add("hidden");
  document.getElementById("battle-live-hud").classList.remove("hidden");
  document.getElementById("duel-chat-widget").classList.remove("hidden");
  startDuelChatListener(duelId);
  listenForLiveOpponentProgress(duelId, role);
  renderQuestion();
}

// Live scoreboard: shows the OPPONENT's progress, updating in
// near-real-time as they answer questions on their own device.
function listenForLiveOpponentProgress(duelId, myRole) {
  stopActiveDuelListener();
  const oppScoreField = myRole === "creator" ? "opponentLiveScore" : "creatorLiveScore";
  const oppIndexField = myRole === "creator" ? "opponentLiveIndex" : "creatorLiveIndex";
  const oppNameField = myRole === "creator" ? "opponentName" : "creatorName";

  activeDuelListener = db.collection("duels").doc(duelId).onSnapshot((doc) => {
    const duel = doc.data();
    if (!duel) return;
    const hud = document.getElementById("battle-live-hud");
    const oppName = duel[oppNameField] || "Opponent";
    const oppIndex = duel[oppIndexField] || 0;
    const oppScore = duel[oppScoreField] || 0;
    const total = duel.questions ? duel.questions.length : 5;
    hud.textContent = `${oppName}: ${oppIndex}/${total} answered · ${oppScore} correct so far`;
  });
}

// Called after every answered question during a live battle (hooked
// from app.js's applyAnswerResult) — this is what makes the opponent's
// scoreboard update live rather than only at the very end.
function updateLiveBattleProgress() {
  if (!currentQuiz || currentQuiz.mode !== "duel" || !currentQuiz.duelId) return;
  const scoreField = currentQuiz.duelRole === "creator" ? "creatorLiveScore" : "opponentLiveScore";
  const indexField = currentQuiz.duelRole === "creator" ? "creatorLiveIndex" : "opponentLiveIndex";
  db.collection("duels").doc(currentQuiz.duelId).update({
    [scoreField]: currentQuiz.correctCount,
    [indexField]: currentQuiz.index + 1
  });
}

// ---------- Finishing a battle's questions (either role) ----------
async function finishDuelPlay() {
  const { correctCount, duelId, duelRole } = currentQuiz;
  const xpGained = currentQuiz.xpEarned || 0;
  await addXp(xpGained);
  registerMissionEvent("duelsPlayed", 1);

  document.getElementById("battle-live-hud").classList.add("hidden");
  document.getElementById("duel-chat-widget").classList.add("hidden");
  document.getElementById("duel-chat-panel").classList.add("hidden");
  stopDuelChatListener();
  stopActiveDuelListener();

  const field = duelRole === "creator" ? "creatorScore" : "opponentScore";
  await db.collection("duels").doc(duelId).update({ [field]: correctCount });

  const duelDoc = await db.collection("duels").doc(duelId).get();
  const duel = duelDoc.data();
  const otherScore = duelRole === "creator" ? duel.opponentScore : duel.creatorScore;

  if (otherScore !== null) {
    // The other player already finished — finalize right away.
    await finalizeDuel(duelId, duel);
    showScreen("duel-section");
    showDuelResultScreen(duelId);
  } else {
    // Still waiting on the other player to finish their questions.
    document.getElementById("duel-menu").classList.add("hidden");
    document.getElementById("duel-waiting").classList.remove("hidden");
    document.getElementById("duel-result").classList.add("hidden");
    document.getElementById("duel-waiting-status").textContent = "You're done! Waiting for your opponent to finish…";
    showScreen("duel-section");
    listenForDuelCompletion(duelId, duelRole);
  }
}

async function finalizeDuel(duelId, duel) {
  if (duel.status === "completed") return; // already finalized
  let winnerUid = null;
  if (duel.creatorScore > duel.opponentScore) winnerUid = duel.creatorUid;
  else if (duel.opponentScore > duel.creatorScore) winnerUid = duel.opponentUid;

  await db.collection("duels").doc(duelId).update({ status: "completed", winnerUid: winnerUid });

  if (winnerUid && winnerUid === currentUser.uid) {
    await addXp(DUEL_WIN_BONUS_XP);
    currentUserData.lifetimeBattlesWon = (currentUserData.lifetimeBattlesWon || 0) + 1;
    await db.collection("users").doc(currentUser.uid).update({
      lifetimeBattlesWon: firebase.firestore.FieldValue.increment(1)
    });
  }
}

// ---------- Waiting-for-opponent-to-finish listener ----------
function listenForDuelCompletion(duelId, myRole) {
  stopActiveDuelListener();
  activeDuelListener = db.collection("duels").doc(duelId).onSnapshot(async (doc) => {
    const duel = doc.data();
    if (!duel) return;

    const otherScore = myRole === "creator" ? duel.opponentScore : duel.creatorScore;
    if (otherScore !== null && duel.status === "waiting") {
      await finalizeDuel(duelId, duel);
    }

    if (duel.status === "completed") {
      stopActiveDuelListener();
      showScreen("duel-section");
      document.getElementById("duel-waiting").classList.add("hidden");
      showDuelResultScreen(duelId);
    }
  });
}

async function showDuelResultScreen(duelId) {
  const doc = await db.collection("duels").doc(duelId).get();
  const duel = doc.data();

  document.getElementById("duel-menu").classList.add("hidden");
  document.getElementById("duel-waiting").classList.add("hidden");
  document.getElementById("duel-result").classList.remove("hidden");

  document.getElementById("duel-result-creator").textContent =
    `${duel.creatorName}: ${duel.creatorScore ?? "—"} / ${duel.questions.length}`;
  document.getElementById("duel-result-opponent").textContent =
    `${duel.opponentName || "Opponent"}: ${duel.opponentScore ?? "—"} / ${duel.questions.length}`;

  const winnerEl = document.getElementById("duel-winner-text");
  if (duel.status !== "completed") {
    winnerEl.textContent = "Waiting for both players to finish…";
  } else if (!duel.winnerUid) {
    winnerEl.textContent = "It's a tie!";
  } else if (duel.winnerUid === currentUser.uid) {
    winnerEl.textContent = `You won! +${DUEL_WIN_BONUS_XP} bonus XP`;
  } else {
    const winnerName = duel.winnerUid === duel.creatorUid ? duel.creatorName : duel.opponentName;
    winnerEl.textContent = `${winnerName} won this battle.`;
  }
}

document.getElementById("duel-back-btn").addEventListener("click", () => {
  renderDuelMenu();
});

document.getElementById("battle-team-battle-link").addEventListener("click", () => navigateTo("team-battle-section"));

// ---------- Battle chat ----------
// Same safety posture as global chat (see js/global-chat.js) — public
// to just the two players in this battle, with the same profanity
// filter, rate limiting, and report mechanism, no private DMs beyond
// this one battle's scope.
let _duelChatListener = null;

document.getElementById("duel-chat-toggle").addEventListener("click", () => {
  document.getElementById("duel-chat-panel").classList.toggle("hidden");
});

function startDuelChatListener(duelId) {
  stopDuelChatListener();
  _duelChatListener = db.collection("duelChat")
    .where("duelId", "==", duelId)
    .orderBy("timestamp", "asc")
    .limit(100)
    .onSnapshot(snapshot => {
      const messages = [];
      snapshot.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
      renderDuelChatMessages(messages);
    }, err => console.warn("Duel chat listener error:", err.message));
}

function stopDuelChatListener() {
  if (_duelChatListener) { _duelChatListener(); _duelChatListener = null; }
}

function renderDuelChatMessages(messages) {
  const container = document.getElementById("duel-chat-messages");
  const wasScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 40;

  let runCount = 0;
  let lastUid = null;

  container.innerHTML = messages.map(m => {
    runCount = (m.uid === lastUid) ? runCount + 1 : 1;
    lastUid = m.uid;
    const initial = (m.name || "S").trim().charAt(0).toUpperCase();

    return `
    <div class="global-chat-msg${currentUser && m.uid === currentUser.uid ? " global-chat-msg-mine" : ""}">
      <span class="global-chat-msg-icon-wrap">
        <span class="global-chat-msg-icon">${initial}</span>
        <span class="global-chat-msg-count-badge">${runCount}</span>
      </span>
      <span class="global-chat-msg-name">${escapeHtml(m.name || "Student")}</span>
      <span class="global-chat-msg-text">${escapeHtml(m.text || "")}</span>
      <button class="global-chat-report-btn" data-msg-id="${m.id}" title="Report this message">⚑</button>
    </div>
  `;
  }).join("") || `<p class="global-chat-empty">No messages yet.</p>`;

  container.querySelectorAll(".global-chat-report-btn").forEach(btn => {
    btn.addEventListener("click", () => reportChatMessage(btn.dataset.msgId, "duel"));
  });

  if (wasScrolledToBottom) container.scrollTop = container.scrollHeight;
}

document.getElementById("duel-chat-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const input = document.getElementById("duel-chat-input");
  const text = input.value.trim();
  if (!text || !currentQuiz || !currentQuiz.duelId) return;

  if (Date.now() - _lastChatSendTime < CHAT_RATE_LIMIT_MS) return;
  if (text.length > CHAT_MAX_LENGTH || containsBlockedWord(text)) {
    input.value = "";
    return;
  }

  _lastChatSendTime = Date.now();
  input.value = "";

  try {
    await db.collection("duelChat").add({
      duelId: currentQuiz.duelId,
      uid: currentUser.uid,
      name: currentUserData.name || "Student",
      text: text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    console.warn("Couldn't send duel chat message:", err.message);
  }
});

// ------------------------------------------------------------------
// Quick Match — live matchmaking queue, not a friend-code battle.
//
// Two players can join the queue for the same subject at nearly the
// same moment and both try to pair with the same waiting entry.
// Without extra care, that's a real race: both would create separate
// duels against the same "opponent," and only one duel would ever
// actually get a second player. The claim step below runs inside a
// Firestore transaction specifically to make "mark this queue entry
// matched" atomic — whichever request's transaction commits first
// wins the candidate; the loser detects the conflict and falls back
// to joining the queue itself instead of assuming it won.
// ------------------------------------------------------------------
let _selectedQuickMatchSubjectId = null;
let _quickMatchQueueDocId = null;
let _quickMatchListener = null;

function renderQuickMatchGrid() {
  const grid = document.getElementById("quick-match-subject-grid");
  if (!_selectedQuickMatchSubjectId) _selectedQuickMatchSubjectId = SUBJECTS[0].id;

  grid.innerHTML = SUBJECTS.map(s => `
    <button type="button" class="duel-subject-card${s.id === _selectedQuickMatchSubjectId ? " duel-subject-card-active" : ""}" data-subject-id="${s.id}" style="--subject-color:${s.color}; --subject-soft:${s.colorSoft};">
      <span class="quest-icon">${SUBJECT_ICON_SVG[s.id] || s.icon}</span>
      <p class="quest-name">${s.name}</p>
    </button>
  `).join("");

  grid.querySelectorAll(".duel-subject-card").forEach(btn => {
    btn.addEventListener("click", () => {
      _selectedQuickMatchSubjectId = btn.dataset.subjectId;
      renderQuickMatchGrid();
    });
  });
}

async function stopQuickMatchWaiting(deleteQueueEntry) {
  if (_quickMatchListener) { _quickMatchListener(); _quickMatchListener = null; }
  if (deleteQueueEntry && _quickMatchQueueDocId) {
    try { await db.collection("matchmakingQueue").doc(_quickMatchQueueDocId).delete(); } catch (e) {}
  }
  _quickMatchQueueDocId = null;
}

async function joinMatchmakingQueue(subjectId, subject) {
  const questions = getQuestions(subjectId);
  const queueRef = await db.collection("matchmakingQueue").add({
    uid: currentUser.uid,
    name: currentUserData.name,
    subjectId: subjectId,
    subjectName: subject.name,
    questions: questions,
    status: "waiting",
    matchedDuelId: null,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  _quickMatchQueueDocId = queueRef.id;

  document.getElementById("duel-menu").classList.add("hidden");
  document.getElementById("quick-match-waiting").classList.remove("hidden");
  document.getElementById("quick-match-status").textContent = "Searching for another player studying the same subject.";
  showScreen("duel-section");

  _quickMatchListener = db.collection("matchmakingQueue").doc(queueRef.id).onSnapshot((doc) => {
    const data = doc.data();
    if (data && data.status === "matched" && data.matchedDuelId) {
      stopQuickMatchWaiting(false);
      startBattleQuiz(data.matchedDuelId, "creator", subject, data.questions);
    }
  });
}

document.getElementById("quick-match-btn").addEventListener("click", async () => {
  const subjectId = _selectedQuickMatchSubjectId;
  const subject = SUBJECTS.find(s => s.id === subjectId);
  const errorEl = document.getElementById("duel-error");
  errorEl.textContent = "";

  try {
    const waiting = await db.collection("matchmakingQueue")
      .where("subjectId", "==", subjectId)
      .where("status", "==", "waiting")
      .limit(10)
      .get();
    const candidate = waiting.docs.find(d => d.data().uid !== currentUser.uid);

    if (!candidate) {
      await joinMatchmakingQueue(subjectId, subject);
      return;
    }

    // Try to atomically claim this candidate. Pre-generate the duel's
    // ID so it can be referenced inside the transaction without a
    // separate write.
    const duelRef = db.collection("duels").doc();
    const candidateRef = db.collection("matchmakingQueue").doc(candidate.id);

    const claimed = await db.runTransaction(async (transaction) => {
      const freshDoc = await transaction.get(candidateRef);
      if (!freshDoc.exists || freshDoc.data().status !== "waiting") {
        return false; // someone else claimed them first
      }
      const opponentData = freshDoc.data();
      transaction.update(candidateRef, { status: "matched", matchedDuelId: duelRef.id });
      transaction.set(duelRef, {
        subjectId: subjectId,
        subjectName: subject.name,
        questions: opponentData.questions,
        creatorUid: opponentData.uid,
        creatorName: opponentData.name,
        creatorScore: null,
        creatorLiveScore: 0,
        creatorLiveIndex: 0,
        opponentUid: currentUser.uid,
        opponentName: currentUserData.name,
        opponentScore: null,
        opponentLiveScore: 0,
        opponentLiveIndex: 0,
        status: "active",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
    });

    if (claimed) {
      const duelSnap = await duelRef.get();
      startBattleQuiz(duelRef.id, "opponent", subject, duelSnap.data().questions);
    } else {
      // Lost the race for this candidate — just join the queue
      // ourselves rather than retry immediately.
      await joinMatchmakingQueue(subjectId, subject);
    }
  } catch (err) {
    errorEl.textContent = "Couldn't start matchmaking right now. Please try again.";
  }
});

document.getElementById("quick-match-cancel-btn").addEventListener("click", async () => {
  await stopQuickMatchWaiting(true);
  renderDuelMenu();
  renderQuickMatchGrid();
});
