// ------------------------------------------------------------------
// Brain Quest — First-time tutorial, offered by the mascot.
// Triggered from app.js's onAuthStateChanged when
// currentUserData.hasSeenTutorial is false (new accounts only —
// existing accounts default to true so they're never surprised by
// this popping up later).
// ------------------------------------------------------------------

const TUTORIAL_STEPS = [
  "This is your Home base — check your Level, XP, and League here anytime.",
  "Head to Quests for Brain Quest — bite-sized lessons that teach you one topic at a time.",
  "Feeling brave? Boss Fight throws exam-level questions at you with only 5 hearts to spare.",
  "Complete Daily Missions for bonus XP, and check the Leaderboard to see how you rank.",
  "Challenge a friend in Duel, or jump into quick rounds anytime in Trivia.",
  "Stuck on something? The AI Tutor tracks your weak spots and gives you extra practice on exactly what you need.",
  "Go Pro anytime for unlimited AI Tutor use, no ads, and a small XP bonus on everything you earn.",
  "That's the tour! Tap below whenever you want — let's get started."
];

let _tutorialStepIndex = 0;

async function markTutorialSeen() {
  if (!currentUserData) return;
  currentUserData.hasSeenTutorial = true;
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({ hasSeenTutorial: true });
  }
}

document.getElementById("tutorial-yes-btn").addEventListener("click", () => {
  document.getElementById("tutorial-prompt-overlay").classList.add("hidden");
  _tutorialStepIndex = 0;
  renderTutorialStep();
  document.getElementById("tutorial-steps-overlay").classList.remove("hidden");
});

document.getElementById("tutorial-no-btn").addEventListener("click", () => {
  document.getElementById("tutorial-prompt-overlay").classList.add("hidden");
  markTutorialSeen();
});

function renderTutorialStep() {
  document.getElementById("tutorial-step-counter").textContent = `${_tutorialStepIndex + 1} / ${TUTORIAL_STEPS.length}`;
  document.getElementById("tutorial-step-text").textContent = TUTORIAL_STEPS[_tutorialStepIndex];
  const nextBtn = document.getElementById("tutorial-next-btn");
  nextBtn.textContent = _tutorialStepIndex === TUTORIAL_STEPS.length - 1 ? "Let's go!" : "Next";
}

document.getElementById("tutorial-next-btn").addEventListener("click", () => {
  if (_tutorialStepIndex < TUTORIAL_STEPS.length - 1) {
    _tutorialStepIndex++;
    renderTutorialStep();
  } else {
    document.getElementById("tutorial-steps-overlay").classList.add("hidden");
    markTutorialSeen();
  }
});

document.getElementById("tutorial-skip-btn").addEventListener("click", () => {
  document.getElementById("tutorial-steps-overlay").classList.add("hidden");
  markTutorialSeen();
});
