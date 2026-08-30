// ------------------------------------------------------------------
// Brain Quest — Duels.
//
// HONEST NOTE ON HOW THIS WORKS: this is an ASYNCHRONOUS duel, not a
// live simultaneous battle. GitHub Pages has no backend to host a
// real-time matchmaking server, so instead: Player A creates a duel
// (picks a subject, gets a 5-question set and a short code), shares
// the code, and Player B plays the same 5 questions whenever they
// open the app. Once both have played, scores are compared and a
// winner is declared. Player A's "waiting" screen updates live via a
// Firestore listener, so it FEELS real-time even though play itself
// isn't turn-synchronized. True live duels are a bigger project —
// ask if you want to explore that later.
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
  document.getElementById("duel-error").textContent = "";

  if (activeDuelListener) {
    activeDuelListener();
    activeDuelListener = null;
  }
}

// ---------- Creating a duel ----------
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
      opponentUid: null,
      opponentName: null,
      opponentScore: null,
      status: "waiting",
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    activeDuelId = duelRef.id;

    // The creator plays their own 5 questions right away.
    currentQuiz = {
      mode: "duel",
      subjectId: subjectId,
      subjectName: subject.name + " Duel",
      questions: questions,
      index: 0,
      correctCount: 0,
      duelId: duelRef.id,
      duelRole: "creator"
    };

    showScreen("quiz-section");
    document.getElementById("hearts-hud").classList.add("hidden");
    renderQuestion();
  } catch (err) {
    errorEl.textContent = "Couldn't create a duel right now. Please try again.";
  }
});

// ---------- Joining a duel ----------
document.getElementById("duel-join-btn").addEventListener("click", async () => {
  const codeRaw = document.getElementById("duel-code-input").value.trim();
  const errorEl = document.getElementById("duel-error");
  errorEl.textContent = "";

  if (!codeRaw) {
    errorEl.textContent = "Enter a duel code first.";
    return;
  }

  try {
    // Firestore auto-generated document IDs are mixed-case, so we find
    // the duel by scanning recent duels for one whose ID starts with
    // the entered code (case-insensitive). Fine at small scale.
    const recent = await db.collection("duels").orderBy("createdAt", "desc").limit(50).get();
    const duelDoc = recent.docs.find(d => d.id.toUpperCase().startsWith(codeRaw.toUpperCase())) || null;

    if (!duelDoc) {
      errorEl.textContent = "No duel found with that code.";
      return;
    }

    const duel = duelDoc.data();
    if (duel.status !== "waiting") {
      errorEl.textContent = "That duel has already been completed.";
      return;
    }
    if (duel.creatorUid === currentUser.uid) {
      errorEl.textContent = "You can't join your own duel.";
      return;
    }

    activeDuelId = duelDoc.id;
    currentQuiz = {
      mode: "duel",
      subjectId: duel.subjectId,
      subjectName: duel.subjectName + " Duel",
      questions: duel.questions,
      index: 0,
      correctCount: 0,
      duelId: duelDoc.id,
      duelRole: "opponent"
    };

    await db.collection("duels").doc(duelDoc.id).update({
      opponentUid: currentUser.uid,
      opponentName: currentUserData.name
    });

    showScreen("quiz-section");
    document.getElementById("hearts-hud").classList.add("hidden");
    renderQuestion();
  } catch (err) {
    errorEl.textContent = "Couldn't join that duel. Double check the code and try again.";
  }
});

// ---------- Finishing a duel's questions (either role) ----------
async function finishDuelPlay() {
  const { correctCount, duelId, duelRole } = currentQuiz;
  const xpGained = correctCount * xpPerCorrectForMode("duel");
  await addXp(xpGained);
  registerMissionEvent("duelsPlayed", 1);

  const field = duelRole === "creator" ? "creatorScore" : "opponentScore";
  await db.collection("duels").doc(duelId).update({ [field]: correctCount });

  if (duelRole === "opponent") {
    // Check if the duel is now complete (creator already played).
    const duelDoc = await db.collection("duels").doc(duelId).get();
    const duel = duelDoc.data();
    if (duel.creatorScore !== null) {
      await finalizeDuel(duelId, duel);
    }
    showScreen("duel-section");
    showDuelResultScreen(duelId);
  } else {
    // Creator just finished playing their own questions. Show the
    // shareable code and wait for an opponent (live via listener).
    const shortCode = duelId.slice(0, 6).toUpperCase();
    document.getElementById("duel-code-display").textContent = shortCode;

    document.getElementById("duel-menu").classList.add("hidden");
    document.getElementById("duel-waiting").classList.remove("hidden");
    document.getElementById("duel-result").classList.add("hidden");
    document.getElementById("duel-waiting-status").textContent = "Share this code — waiting for an opponent…";
    showScreen("duel-section");

    listenForDuelCompletion(duelId, "creator");
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
  }
}

// ---------- Creator's live "waiting" listener ----------
function listenForDuelCompletion(duelId, role) {
  if (activeDuelListener) activeDuelListener();
  activeDuelListener = db.collection("duels").doc(duelId).onSnapshot(async (doc) => {
    const duel = doc.data();
    if (!duel) return;

    if (duel.opponentUid && duel.status === "waiting") {
      document.getElementById("duel-waiting-status").textContent =
        `${duel.opponentName || "An opponent"} joined — waiting for them to finish…`;
    }

    if (duel.creatorScore !== null && duel.opponentScore !== null && duel.status === "waiting") {
      await finalizeDuel(duelId, duel);
    }

    if (duel.status === "completed") {
      if (activeDuelListener) { activeDuelListener(); activeDuelListener = null; }
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
    winnerEl.textContent = `${winnerName} won this duel.`;
  }
}

document.getElementById("duel-back-btn").addEventListener("click", () => {
  renderDuelMenu();
});
