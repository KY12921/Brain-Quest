// ------------------------------------------------------------------
// Study Boss — Boss Fight mode.
//
// Difficulty scaling: since v1 uses a curated question bank (not live
// AI generation — see questions.js), difficulty is scaled by fight
// LENGTH rather than question hardness: each boss win makes the next
// fight longer, cycling through the subject's question pool as needed.
// Once you add a real AI backend, swap this for a difficulty parameter
// sent to the model instead (e.g. "generate tier {bossLevel} questions").
//
// Design choice: losing a boss fight does NOT reduce your boss level —
// it just ends the attempt. Only wins increase difficulty. Flip this
// in finishBossFight() below if you'd rather it reset on a loss.
// ------------------------------------------------------------------

const BOSS_BASE_LENGTH = 8;
const BOSS_LENGTH_PER_LEVEL = 2;
const BOSS_MAX_LENGTH = 20;
const BOSS_XP_PER_CORRECT = 30;
const BOSS_WIN_BONUS_XP = 200;

function renderBossGrid() {
  const grid = document.getElementById("boss-grid");
  grid.innerHTML = "";
  const bossLevels = (currentUserData && currentUserData.bossLevels) || {};

  SUBJECTS.forEach(subject => {
    const level = bossLevels[subject.id] || 0;
    const card = document.createElement("button");
    card.className = "quest-card boss-card";
    card.style.setProperty("--subject-color", subject.color);
    card.style.setProperty("--subject-soft", subject.colorSoft);
    card.innerHTML = `
      <span class="quest-icon boss-level-badge">${level}</span>
      <p class="quest-name">${subject.name} Boss</p>
      <p class="quest-meta">Level ${level} · ${questionCountForLevel(level)} questions · 5 hearts</p>
    `;
    card.addEventListener("click", () => startBossFight(subject));
    grid.appendChild(card);
  });
}

function questionCountForLevel(level) {
  return Math.min(BOSS_BASE_LENGTH + level * BOSS_LENGTH_PER_LEVEL, BOSS_MAX_LENGTH);
}

// Build a question list of the required length by cycling/reshuffling
// the subject's pool (the curated bank is small; this stands in for
// the AI generating fresh ones each time).
function getBossQuestions(subjectId, count) {
  const chapters = QUESTION_BANK[subjectId] || [];
  const pool = chapters.flat(); // boss fights draw from all difficulty tiers
  const result = [];
  while (result.length < count) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    result.push(...shuffled);
  }
  return result.slice(0, count);
}

function startBossFight(subject) {
  const level = (currentUserData.bossLevels && currentUserData.bossLevels[subject.id]) || 0;
  const length = questionCountForLevel(level);
  const questions = getBossQuestions(subject.id, length);

  currentQuiz = {
    mode: "boss",
    subjectId: subject.id,
    subjectName: subject.name + " Boss",
    questions: questions,
    index: 0,
    correctCount: 0,
    wrongCount: 0
  };

  showScreen("quiz-section");
  document.getElementById("hearts-hud").classList.remove("hidden");
  renderQuestion();
}

function renderHeartsHud() {
  const hud = document.getElementById("hearts-hud");
  const wrong = currentQuiz.wrongCount || 0;
  let hearts = "";
  for (let i = 0; i < MAX_HEARTS; i++) {
    hearts += i < (MAX_HEARTS - wrong) ? "❤️" : "🖤";
  }
  hud.textContent = hearts;
}

async function finishBossFight(won) {
  const { correctCount, questions, subjectId, subjectName } = currentQuiz;
  const xpGained = correctCount * xpPerCorrectForMode("boss") + (won ? BOSS_WIN_BONUS_XP : 0);

  await addXp(xpGained);

  if (won && currentUser) {
    const newLevel = ((currentUserData.bossLevels && currentUserData.bossLevels[subjectId]) || 0) + 1;
    currentUserData.bossLevels[subjectId] = newLevel;
    await db.collection("users").doc(currentUser.uid).update({
      [`bossLevels.${subjectId}`]: newLevel
    });
    registerMissionEvent("bossWins", 1);
  }

  document.getElementById("results-eyebrow").textContent = won ? "Boss defeated!" : "You were defeated";
  document.getElementById("results-score").textContent = `${correctCount} / ${questions.length}`;
  document.getElementById("results-xp-gain").textContent = `+${xpGained} XP`;
  document.getElementById("results-upsell").classList.add("hidden");
  document.getElementById("results-message").textContent = won
    ? `${subjectName} is now tougher next time. Great work.`
    : `${subjectName} got the better of you this time — try again to improve.`;

  showScreen("results-section");
}
