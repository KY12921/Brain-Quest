// ------------------------------------------------------------------
// Study Boss — AI Tutor.
//
// HONEST NOTE: this does not call a live AI model. That would need an
// API key held server-side (a Firebase Cloud Function), which is a
// bigger next step — a static GitHub Pages site can't hold a secret
// key safely. What this DOES do, for real: track your right/wrong
// answers per subject across every mode you play (Quests, Boss Fight,
// Duels), figure out your actual weakest subject from that data, and
// serve you a real practice question from it — with the explanation
// bundled in, matching the spec's goal of "identify weak areas and
// ask more questions about it."
//
// Free tier: 3 tailored questions per day (resets daily).
// Pro tier: unlimited, and the explanation is revealed automatically
// after each question instead of requiring a tap — see the hook in
// app.js's handleAnswer().
//
// Adaptive difficulty: get a tutor question right and the next one
// for that subject comes from the next harder tier (Beginner ->
// Intermediate -> Advanced). Get it wrong and it drops back a tier.
// This is plain conditional logic, not a real AI adjusting anything.
// ------------------------------------------------------------------

const FREE_DAILY_AI_LIMIT = 3;
const MIN_ATTEMPTS_FOR_WEAK_AREA = 3;

// Records a correct/incorrect answer against a subject's running
// stats, regardless of which mode (quest, boss, duel, tutor) it came
// from — this is what lets the tutor find your real weak areas.
async function recordSubjectStat(subjectId, isCorrect) {
  if (!currentUserData || !subjectId) return;
  if (!currentUserData.subjectStats) currentUserData.subjectStats = {};
  if (!currentUserData.subjectStats[subjectId]) {
    currentUserData.subjectStats[subjectId] = { correct: 0, wrong: 0 };
  }
  const key = isCorrect ? "correct" : "wrong";
  currentUserData.subjectStats[subjectId][key]++;

  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      [`subjectStats.${subjectId}.${key}`]: firebase.firestore.FieldValue.increment(1)
    });
  }
}

// Finds the subject with the highest wrong-answer ratio, requiring a
// minimum number of attempts so a single unlucky guess doesn't get
// flagged as a "weakness." Returns null if there isn't enough data yet.
function getWeakestSubject() {
  const stats = (currentUserData && currentUserData.subjectStats) || {};
  let weakest = null;
  let weakestRatio = -1;

  SUBJECTS.forEach(s => {
    const st = stats[s.id];
    if (!st) return;
    const attempts = st.correct + st.wrong;
    if (attempts < MIN_ATTEMPTS_FOR_WEAK_AREA) return;
    const wrongRatio = st.wrong / attempts;
    if (wrongRatio > weakestRatio) {
      weakestRatio = wrongRatio;
      weakest = s;
    }
  });

  return weakest;
}

function ensureAiTutorIsForToday() {
  const today = todayString(); // defined in missions.js, loaded earlier
  if (currentUserData.aiTutorDate !== today) {
    currentUserData.aiTutorDate = today;
    currentUserData.aiTutorUsesToday = 0;
  }
}

function renderTutorScreen() {
  ensureAiTutorIsForToday();
  const card = document.getElementById("tutor-card");
  const isPro = currentUserData.isPro;
  const usesToday = currentUserData.aiTutorUsesToday || 0;
  const remaining = FREE_DAILY_AI_LIMIT - usesToday;
  const weakest = getWeakestSubject();
  const atLimit = !isPro && remaining <= 0;
  const previewSubject = weakest || SUBJECTS[0];
  const tier = (currentUserData.tutorLevel && currentUserData.tutorLevel[previewSubject.id]) || 0;

  card.innerHTML = `
    <p class="tutor-usage">${isPro ? "⭐ Pro Tutor — unlimited questions, auto-explained" : `Free Tutor — ${Math.max(remaining, 0)} of ${FREE_DAILY_AI_LIMIT} tailored questions left today`}</p>
    <p class="tutor-weak-area">${weakest
      ? `Your weakest area right now: <strong>${weakest.icon} ${weakest.name}</strong> — currently at <strong>${CHAPTER_NAMES[tier]}</strong> level`
      : "Answer a few more questions across any subject so the tutor can spot your weak areas. Until then, it'll pick a random subject."}</p>
    <button class="btn btn-primary" id="tutor-start-btn" ${atLimit ? "disabled" : ""}>
      ${atLimit ? "Come back tomorrow for more" : "Get a tailored question"}
    </button>
    ${!isPro ? `<p class="tutor-upsell">Go Pro for unlimited tutor questions and instant explanations.</p>` : ""}
  `;

  if (!atLimit) {
    document.getElementById("tutor-start-btn").addEventListener("click", startTutorQuestion);
  }
}

async function startTutorQuestion() {
  const weakest = getWeakestSubject();
  const subject = weakest || SUBJECTS[Math.floor(Math.random() * SUBJECTS.length)];

  if (!currentUserData.tutorLevel) currentUserData.tutorLevel = {};
  const tierIndex = currentUserData.tutorLevel[subject.id] || 0;
  const question = getQuestions(subject.id, tierIndex)[0];

  ensureAiTutorIsForToday();
  if (!currentUserData.isPro) {
    currentUserData.aiTutorUsesToday = (currentUserData.aiTutorUsesToday || 0) + 1;
    if (currentUser) {
      await db.collection("users").doc(currentUser.uid).update({
        aiTutorDate: currentUserData.aiTutorDate,
        aiTutorUsesToday: currentUserData.aiTutorUsesToday
      });
    }
  }

  currentQuiz = {
    mode: "tutor",
    subjectId: subject.id,
    subjectName: subject.name + " Tutor",
    tutorTier: tierIndex,
    questions: [question],
    index: 0,
    correctCount: 0
  };

  showScreen("quiz-section");
  document.getElementById("hearts-hud").classList.add("hidden");
  renderQuestion();
}

async function finishTutorSession() {
  const { correctCount, questions, subjectId, tutorTier } = currentQuiz;
  const xpGained = correctCount * xpPerCorrectForMode("tutor");
  await addXp(xpGained);

  // Adaptive difficulty: get it right, move up a tier for this subject
  // next time. Get it wrong, move down a tier so the tutor eases off.
  // No live AI call — just picking from the curated tier that matches
  // performance, invisibly.
  let tierChange = null; // "up" | "down" | null
  if (!currentUserData.tutorLevel) currentUserData.tutorLevel = {};

  if (correctCount > 0 && tutorTier < CHAPTER_NAMES.length - 1) {
    currentUserData.tutorLevel[subjectId] = tutorTier + 1;
    tierChange = "up";
  } else if (correctCount === 0 && tutorTier > 0) {
    currentUserData.tutorLevel[subjectId] = tutorTier - 1;
    tierChange = "down";
  }

  if (tierChange && currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      [`tutorLevel.${subjectId}`]: currentUserData.tutorLevel[subjectId]
    });
  }

  document.getElementById("results-eyebrow").textContent = "Tutor session";
  document.getElementById("results-score").textContent = `${correctCount} / ${questions.length}`;
  document.getElementById("results-xp-gain").textContent = `+${xpGained} XP`;
  document.getElementById("results-upsell").classList.add("hidden");

  const newTierName = tierChange ? CHAPTER_NAMES[currentUserData.tutorLevel[subjectId]] : CHAPTER_NAMES[tutorTier];
  if (tierChange === "up") {
    document.getElementById("results-message").textContent = `Nice — the tutor is stepping this subject up to ${newTierName} level next time.`;
  } else if (tierChange === "down") {
    document.getElementById("results-message").textContent = `No worries — the tutor will bring this subject back to ${newTierName} level next time to rebuild the basics.`;
  } else {
    document.getElementById("results-message").textContent = correctCount === questions.length
      ? "Nice — you've got this one down."
      : "That's exactly the kind of question the tutor will keep bringing back until it clicks.";
  }

  showScreen("results-section");
}
