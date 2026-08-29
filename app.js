// ------------------------------------------------------------------
// Study Boss — core app: auth, navigation, subject quests, and the
// shared quiz engine used by Quests, Boss Fight, and Duel modes.
// ------------------------------------------------------------------

const XP_PER_CORRECT_ANSWER = 20;
const XP_PER_LEVEL = 100; // used only for the visual XP bar fill
const MAX_HEARTS = 5;

let currentUser = null;
let currentUserData = null; // { name, xp, isPro, completedSubjects, bossLevels, mission }
let currentQuiz = null; // { mode: 'quest'|'boss'|'duel', subjectId, subjectName, questions, index, correctCount, wrongCount, duelId, duelRole }

// ---------- Screen helpers ----------
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.nav === id));
}

function setTopBarVisible(visible) {
  document.getElementById("top-bar").classList.toggle("hidden", !visible);
}

// ---------- XP HUD ----------
function updateXpHud(xp) {
  document.getElementById("xp-count").textContent = xp;
  const withinLevel = xp % XP_PER_LEVEL;
  const pct = (withinLevel / XP_PER_LEVEL) * 100;
  document.getElementById("xp-bar-fill").style.width = pct + "%";
}

// Call this after any XP change to persist + refresh the HUD.
async function addXp(amount) {
  currentUserData.xp = (currentUserData.xp || 0) + amount;
  updateXpHud(currentUserData.xp);
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      xp: firebase.firestore.FieldValue.increment(amount)
    });
  }
  registerMissionEvent("xpEarnedToday", amount);
}

// ---------- Nav bar ----------
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.nav;
    showScreen(target);
    if (target === "subjects-section") renderSubjects();
    if (target === "boss-section") renderBossGrid();
    if (target === "missions-section") renderMissions();
    if (target === "leaderboard-section") renderLeaderboard();
    if (target === "duel-section") renderDuelMenu();
    if (target === "tutor-section") renderTutorScreen();
    if (target === "pro-section") renderProScreen();
  });
});

// Links inside screens (like the ad banner) that should act like nav buttons
document.querySelectorAll("[data-nav].ad-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const target = link.dataset.nav;
    showScreen(target);
    if (target === "pro-section") renderProScreen();
  });
});

// ---------- Auth tab switching ----------
document.querySelectorAll(".auth-tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
    tab.classList.add("active");
    const target = tab.dataset.tab;
    document.getElementById("signin-form").classList.toggle("hidden", target !== "signin");
    document.getElementById("signup-form").classList.toggle("hidden", target !== "signup");
  });
});

// ---------- Sign up ----------
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const errorEl = document.getElementById("signup-error");
  errorEl.textContent = "";

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
    await db.collection("users").doc(cred.user.uid).set({
      name: name,
      xp: 0,
      isPro: false,
      completedSubjects: [],
      bossLevels: {},
      chapterProgress: {},
      missionDate: null,
      missionProgress: {},
      missionClaimed: {},
      subjectStats: {},
      aiTutorDate: null,
      aiTutorUsesToday: 0,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    errorEl.textContent = friendlyAuthError(err);
  }
});

// ---------- Sign in ----------
document.getElementById("signin-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("signin-email").value.trim();
  const password = document.getElementById("signin-password").value;
  const errorEl = document.getElementById("signin-error");
  errorEl.textContent = "";

  try {
    await auth.signInWithEmailAndPassword(email, password);
  } catch (err) {
    errorEl.textContent = friendlyAuthError(err);
  }
});

function friendlyAuthError(err) {
  const map = {
    "auth/email-already-in-use": "That email is already registered — try signing in instead.",
    "auth/invalid-email": "That doesn't look like a valid email address.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/user-not-found": "No account found with that email.",
    "auth/wrong-password": "Incorrect password.",
    "auth/invalid-credential": "Incorrect email or password."
  };
  return map[err.code] || "Something went wrong. Please try again.";
}

// ---------- Sign out ----------
document.getElementById("sign-out-btn").addEventListener("click", () => {
  auth.signOut();
});

// ---------- Auth state watcher ----------
auth.onAuthStateChanged(async (user) => {
  currentUser = user;
  if (user) {
    const doc = await db.collection("users").doc(user.uid).get();
    const data = doc.exists ? doc.data() : {};
    currentUserData = {
      name: data.name || user.displayName || "Student",
      xp: data.xp || 0,
      isPro: data.isPro || false,
      completedSubjects: data.completedSubjects || [],
      bossLevels: data.bossLevels || {},
      chapterProgress: data.chapterProgress || {},
      missionDate: data.missionDate || null,
      missionProgress: data.missionProgress || {},
      missionClaimed: data.missionClaimed || {},
      subjectStats: data.subjectStats || {},
      aiTutorDate: data.aiTutorDate || null,
      aiTutorUsesToday: data.aiTutorUsesToday || 0
    };
    updateXpHud(currentUserData.xp);
    setTopBarVisible(true);
    document.getElementById("welcome-message").textContent = `Hi ${currentUserData.name}, welcome back!`;
    renderSubjects();
    showScreen("subjects-section");
  } else {
    currentUserData = null;
    setTopBarVisible(false);
    showScreen("auth-section");
  }
});

// ---------- Subject grid (Quests) ----------
let currentOpenSubject = null; // subject currently being browsed at chapter-select level

function renderSubjects() {
  const grid = document.getElementById("quest-grid");
  grid.innerHTML = "";
  const isPro = currentUserData && currentUserData.isPro;

  SUBJECTS.forEach(subject => {
    const unlockedCount = (currentUserData.chapterProgress && currentUserData.chapterProgress[subject.id]) || 1;
    const completedCount = CHAPTER_NAMES.filter((_, i) =>
      currentUserData.completedSubjects.includes(`${subject.id}:${i}`)
    ).length;
    const allDone = completedCount === CHAPTER_NAMES.length;

    const card = document.createElement("button");
    card.className = "quest-card";
    card.innerHTML = `
      <span class="quest-icon">${subject.icon}</span>
      <p class="quest-name">${subject.name}</p>
      <p class="quest-meta">${allDone ? "All chapters complete ✅" : `Chapter ${unlockedCount} of ${CHAPTER_NAMES.length} unlocked`}</p>
    `;
    card.addEventListener("click", () => openSubjectChapters(subject));
    grid.appendChild(card);
  });

  document.getElementById("ad-banner-subjects").classList.toggle("hidden", isPro);
}

function openSubjectChapters(subject) {
  currentOpenSubject = subject;
  renderChapterList(subject);
  showScreen("chapters-section");
}

function renderChapterList(subject) {
  document.getElementById("chapters-heading").textContent = `${subject.icon} ${subject.name} — Chapters`;
  const grid = document.getElementById("chapters-grid");
  grid.innerHTML = "";

  const isPro = currentUserData.isPro;
  const unlockedCount = (currentUserData.chapterProgress && currentUserData.chapterProgress[subject.id]) || 1;

  CHAPTER_NAMES.forEach((chapterName, i) => {
    const isCompleted = currentUserData.completedSubjects.includes(`${subject.id}:${i}`);
    const isReached = i < unlockedCount;
    const card = document.createElement("button");

    if (!isReached) {
      card.className = "quest-card locked";
      card.innerHTML = `
        <span class="quest-icon">🔒</span>
        <p class="quest-name">Chapter ${i + 1}: ${chapterName}</p>
        <p class="quest-meta quest-locked-label">Complete the previous chapter first</p>
      `;
      card.disabled = true;
    } else if (isCompleted && !isPro) {
      card.className = "quest-card locked";
      card.innerHTML = `
        <span class="quest-icon">🔒</span>
        <p class="quest-name">Chapter ${i + 1}: ${chapterName}</p>
        <p class="quest-meta quest-locked-label">Completed — unlock replay with Pro</p>
      `;
      card.disabled = true;
    } else {
      card.className = "quest-card";
      card.innerHTML = `
        <span class="quest-icon">${isCompleted ? "✅" : "📘"}</span>
        <p class="quest-name">Chapter ${i + 1}: ${chapterName}</p>
        <p class="quest-meta">5 questions · up to ${XP_PER_CORRECT_ANSWER * 5} XP</p>
      `;
      card.addEventListener("click", () => startQuest(subject, i));
    }
    grid.appendChild(card);
  });
}

document.getElementById("chapters-back-btn").addEventListener("click", () => {
  renderSubjects();
  showScreen("subjects-section");
});

function startQuest(subject, chapterIndex) {
  const questions = getQuestions(subject.id, chapterIndex);
  currentQuiz = {
    mode: "quest",
    subjectId: subject.id,
    subjectName: `${subject.name} — Ch.${chapterIndex + 1} ${CHAPTER_NAMES[chapterIndex]}`,
    chapterIndex: chapterIndex,
    questions: questions,
    index: 0,
    correctCount: 0
  };
  showScreen("quiz-section");
  document.getElementById("hearts-hud").classList.add("hidden");
  renderQuestion();
}

// ---------- Correct-answer celebration ----------
function playCorrectAnswerAnimation(xpAmount) {
  const card = document.querySelector(".quiz-card");
  if (!card) return;

  const container = document.createElement("div");
  container.className = "celebration-container";

  const sparkleEmojis = ["✨", "⭐", "🌟"];
  for (let i = 0; i < 8; i++) {
    const sparkle = document.createElement("span");
    sparkle.className = "sparkle";
    sparkle.textContent = sparkleEmojis[Math.floor(Math.random() * sparkleEmojis.length)];
    sparkle.style.left = (30 + Math.random() * 40) + "%";
    sparkle.style.top = (20 + Math.random() * 40) + "%";
    sparkle.style.animationDelay = (Math.random() * 0.15) + "s";
    container.appendChild(sparkle);
  }

  const xpPop = document.createElement("div");
  xpPop.className = "xp-pop";
  xpPop.textContent = `+${xpAmount} XP`;
  container.appendChild(xpPop);

  card.appendChild(container);
  setTimeout(() => container.remove(), 900);
}

// ---------- Shared quiz engine ----------
function renderQuestion() {
  const { questions, index, subjectName } = currentQuiz;
  const question = questions[index];

  document.getElementById("quiz-subject-tag").textContent = subjectName;
  document.getElementById("quiz-progress-label").textContent = `Question ${index + 1} of ${questions.length}`;
  document.getElementById("quiz-progress-fill").style.width = `${(index / questions.length) * 100}%`;
  document.getElementById("quiz-question").textContent = question.q;
  document.getElementById("quiz-feedback").textContent = "";
  document.getElementById("quiz-feedback").className = "quiz-feedback";
  document.getElementById("quiz-next-btn").classList.add("hidden");
  document.getElementById("quiz-confirm-btn").classList.add("hidden");
  document.getElementById("quiz-explain-btn").classList.add("hidden");
  document.getElementById("quiz-explain-btn").textContent = "Explain this";
  document.getElementById("quiz-explanation").classList.add("hidden");
  document.getElementById("quiz-explanation").textContent = "";
  currentQuiz.selectedIndex = null;

  const optionsEl = document.getElementById("quiz-options");
  optionsEl.innerHTML = "";
  question.options.forEach((optionText, i) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = optionText;
    btn.addEventListener("click", () => selectOption(i));
    optionsEl.appendChild(btn);
  });

  if (currentQuiz.mode === "boss") renderHeartsHud();
}

function selectOption(i) {
  currentQuiz.selectedIndex = i;
  document.querySelectorAll(".quiz-option").forEach((btn, idx) => {
    btn.classList.toggle("selected", idx === i);
  });
  document.getElementById("quiz-confirm-btn").classList.remove("hidden");
}

document.getElementById("quiz-confirm-btn").addEventListener("click", () => {
  if (currentQuiz.selectedIndex === null || currentQuiz.selectedIndex === undefined) return;
  document.getElementById("quiz-confirm-btn").classList.add("hidden");
  handleAnswer(currentQuiz.selectedIndex);
});

// Returns the XP awarded per correct answer for the current mode, so
// the celebration animation and feedback text show the right number.
function xpPerCorrectForMode(mode) {
  if (mode === "boss") return BOSS_XP_PER_CORRECT;
  if (mode === "duel") return DUEL_XP_PER_CORRECT;
  return XP_PER_CORRECT_ANSWER;
}

function handleAnswer(selectedIndex) {
  const { questions, index } = currentQuiz;
  const question = questions[index];
  const isCorrect = selectedIndex === question.correct;
  const options = document.querySelectorAll(".quiz-option");
  const xpForThisAnswer = xpPerCorrectForMode(currentQuiz.mode);

  options.forEach((btn, i) => {
    btn.disabled = true;
    if (i === question.correct) btn.classList.add("correct");
    if (i === selectedIndex && !isCorrect) btn.classList.add("incorrect");
  });

  const feedbackEl = document.getElementById("quiz-feedback");
  if (isCorrect) {
    currentQuiz.correctCount++;
    feedbackEl.textContent = `Correct! +${xpForThisAnswer} XP`;
    feedbackEl.className = "quiz-feedback correct";
    registerMissionEvent("correctAnswers", 1);
    recordSubjectStat(currentQuiz.subjectId, true);
    playCorrectAnswerAnimation(xpForThisAnswer);
  } else {
    feedbackEl.textContent = "Not quite — the correct answer is highlighted.";
    feedbackEl.className = "quiz-feedback incorrect";
    recordSubjectStat(currentQuiz.subjectId, false);
    if (currentQuiz.mode === "boss") {
      currentQuiz.wrongCount++;
      renderHeartsHud();
      if (currentQuiz.wrongCount >= MAX_HEARTS) {
        document.getElementById("quiz-next-btn").classList.add("hidden");
        setTimeout(() => finishBossFight(false), 900);
        document.getElementById("quiz-progress-fill").style.width = "100%";
        return;
      }
    }
  }

  document.getElementById("quiz-progress-fill").style.width = `${((index + 1) / questions.length) * 100}%`;
  document.getElementById("quiz-next-btn").classList.remove("hidden");
  document.getElementById("quiz-explain-btn").classList.remove("hidden");

  // Pro perk: the AI Tutor auto-reveals the explanation for Pro users
  // instead of making them tap for it — a real, working "more powerful
  // tutor" difference, even without live AI generation.
  if (currentQuiz.mode === "tutor" && currentUserData.isPro) {
    document.getElementById("quiz-explain-btn").click();
  }
}

document.getElementById("quiz-explain-btn").addEventListener("click", () => {
  const explanationEl = document.getElementById("quiz-explanation");
  const btn = document.getElementById("quiz-explain-btn");
  const question = currentQuiz.questions[currentQuiz.index];

  if (explanationEl.classList.contains("hidden")) {
    explanationEl.textContent = question.explanation || "No explanation available for this question yet.";
    explanationEl.classList.remove("hidden");
    btn.textContent = "Hide explanation";
  } else {
    explanationEl.classList.add("hidden");
    btn.textContent = "Explain this";
  }
});

document.getElementById("quiz-next-btn").addEventListener("click", () => {
  currentQuiz.index++;
  if (currentQuiz.index < currentQuiz.questions.length) {
    renderQuestion();
  } else {
    if (currentQuiz.mode === "boss") {
      finishBossFight(true);
    } else if (currentQuiz.mode === "duel") {
      finishDuelPlay();
    } else if (currentQuiz.mode === "tutor") {
      finishTutorSession();
    } else {
      finishQuest();
    }
  }
});

// ---------- Quest completion ----------
async function finishQuest() {
  const { correctCount, questions, subjectId, chapterIndex } = currentQuiz;
  const xpGained = correctCount * XP_PER_CORRECT_ANSWER;
  const chapterKey = `${subjectId}:${chapterIndex}`;

  const alreadyCompleted = currentUserData.completedSubjects.includes(chapterKey);
  if (!alreadyCompleted) currentUserData.completedSubjects.push(chapterKey);

  await addXp(xpGained);
  registerMissionEvent("questsCompleted", 1);

  const updates = {};
  if (!alreadyCompleted) {
    updates.completedSubjects = firebase.firestore.FieldValue.arrayUnion(chapterKey);
  }

  // Unlock the next chapter if this was the highest one reached so far.
  let unlockedNext = false;
  if (!currentUserData.chapterProgress) currentUserData.chapterProgress = {};
  const currentUnlocked = currentUserData.chapterProgress[subjectId] || 1;
  if (chapterIndex === currentUnlocked - 1 && chapterIndex + 1 < CHAPTER_NAMES.length) {
    currentUserData.chapterProgress[subjectId] = chapterIndex + 2; // e.g. finishing ch.0 unlocks index 1 -> progress becomes 2
    updates[`chapterProgress.${subjectId}`] = currentUserData.chapterProgress[subjectId];
    unlockedNext = true;
  }

  if (currentUser && Object.keys(updates).length > 0) {
    await db.collection("users").doc(currentUser.uid).update(updates);
  }

  document.getElementById("results-eyebrow").textContent = "Quest complete";
  document.getElementById("results-score").textContent = `${correctCount} / ${questions.length}`;
  document.getElementById("results-xp-gain").textContent = `+${xpGained} XP`;
  document.getElementById("results-message").textContent = unlockedNext
    ? `${resultMessage(correctCount, questions.length)} Next chapter unlocked!`
    : resultMessage(correctCount, questions.length);

  const isPerfect = correctCount === questions.length;
  document.getElementById("results-upsell").classList.toggle("hidden", !isPerfect);

  showScreen("results-section");
}

function resultMessage(correct, total) {
  if (correct === total) return "Perfect run! You've mastered this set.";
  if (correct >= total * 0.6) return "Solid work — a bit more practice and you'll ace it.";
  return "Good attempt — try this chapter again to lock it in.";
}

document.getElementById("results-again-btn").addEventListener("click", () => {
  if (currentQuiz && currentQuiz.mode === "quest" && currentOpenSubject) {
    renderChapterList(currentOpenSubject);
    showScreen("chapters-section");
  } else {
    renderSubjects();
    showScreen("subjects-section");
  }
});
