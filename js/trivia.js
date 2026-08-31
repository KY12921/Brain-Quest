// ------------------------------------------------------------------
// Brain Quest — Trivia mode.
//
// This is the classic "pick a subject, get 5 random questions" format
// that Quests used to be, before Quests became a structured lesson
// roadmap. It draws from the full QUESTION_BANK (all difficulty tiers
// combined) — exactly the same flattening pattern Boss Fight already
// uses — so no new content was needed to build this.
// ------------------------------------------------------------------

function renderTriviaGrid() {
  const grid = document.getElementById("trivia-grid");
  grid.innerHTML = "";
  const isPro = currentUserData && currentUserData.isPro;

  SUBJECTS.forEach(subject => {
    const card = document.createElement("button");
    card.className = "quest-card";
    card.style.setProperty("--subject-color", subject.color);
    card.style.setProperty("--subject-soft", subject.colorSoft);
    card.innerHTML = `
      <span class="quest-icon">${SUBJECT_ICON_SVG[subject.id] || subject.icon}</span>
      <p class="quest-name">${subject.name}</p>
      <p class="quest-meta">${isPro ? "All chapters" : "Chapter 1 only (free)"} · up to ${XP_PER_CORRECT_ANSWER * 5} XP</p>
    `;
    card.addEventListener("click", () => startTrivia(subject));
    grid.appendChild(card);
  });
}

function startTrivia(subject) {
  const isPro = currentUserData && currentUserData.isPro;
  // Free tier: trivia questions only come from Chapter 1 (the
  // Beginner tier). Pro unlocks the full pool across all 3 tiers.
  const pool = isPro ? QUESTION_BANK[subject.id].flat() : QUESTION_BANK[subject.id][0];
  const questions = [...pool].sort(() => Math.random() - 0.5).slice(0, 5);

  currentQuiz = {
    mode: "trivia",
    subjectId: subject.id,
    subjectName: `${subject.name} Trivia`,
    questions: questions,
    index: 0,
    correctCount: 0
  };

  showScreen("quiz-section");
  document.getElementById("hearts-hud").classList.add("hidden");
  renderQuestion();
}

async function finishTrivia() {
  const { correctCount, questions } = currentQuiz;
  const xpGained = currentQuiz.xpEarned || 0;
  await addXp(xpGained);
  registerMissionEvent("questsCompleted", 1);

  document.getElementById("results-eyebrow").textContent = "Trivia round complete";
  document.getElementById("results-score").textContent = `${correctCount} / ${questions.length}`;
  document.getElementById("results-xp-gain").textContent = `+${xpGained} XP`;
  document.getElementById("results-message").textContent = resultMessage(correctCount, questions.length);
  document.getElementById("results-upsell").classList.toggle("hidden", correctCount !== questions.length);

  showScreen("results-section");
  if (correctCount === questions.length) setTimeout(playConfettiAnimation, 300);
}
