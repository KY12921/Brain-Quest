// ------------------------------------------------------------------
// Study Boss — core app: auth, navigation, subject quests, and the
// shared quiz engine used by Quests, Boss Fight, and Duel modes.
// ------------------------------------------------------------------

const XP_PER_CORRECT_ANSWER = 20;
const XP_PER_LEVEL = 1000;
const MAX_HEARTS = 5;

let currentUser = null;
let currentUserData = null; // { name, xp, isPro, completedSubjects, bossLevels, mission }
let currentQuiz = null; // { mode: 'quest'|'boss'|'duel', subjectId, subjectName, questions, index, correctCount, wrongCount, duelId, duelRole }

function levelForXp(xp) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

// ---------- Screen helpers ----------
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  const target = document.getElementById(id);
  target.classList.remove("hidden");
  target.classList.remove("screen-enter");
  void target.offsetWidth; // force reflow so the animation replays every time
  target.classList.add("screen-enter");
  document.querySelectorAll(".nav-btn").forEach(b => b.classList.toggle("active", b.dataset.nav === id));
}

function setTopBarVisible(visible) {
  document.getElementById("top-bar").classList.toggle("hidden", !visible);
}

// ---------- XP HUD ----------
function updateXpHud(xp) {
  document.getElementById("xp-count").textContent = xp;
  document.getElementById("level-badge").textContent = "Lv. " + levelForXp(xp);
  const withinLevel = xp % XP_PER_LEVEL;
  const pct = (withinLevel / XP_PER_LEVEL) * 100;
  document.getElementById("xp-bar-fill").style.width = pct + "%";
}

// ---------- Level-up overlay ----------
function playLevelUpAnimation(newLevel) {
  const overlay = document.getElementById("level-up-overlay");
  document.getElementById("level-up-number").textContent = newLevel;
  overlay.classList.remove("hidden");
  overlay.classList.remove("level-up-animate");
  // Force a reflow so the animation class can be re-added and replay
  // correctly even if the overlay was shown very recently.
  void overlay.offsetWidth;
  overlay.classList.add("level-up-animate");
}

document.getElementById("level-up-close-btn").addEventListener("click", () => {
  document.getElementById("level-up-overlay").classList.add("hidden");
});

// Call this after any XP change to persist + refresh the HUD.
async function addXp(amount) {
  const oldXp = currentUserData.xp || 0;
  const newXp = oldXp + amount;
  currentUserData.xp = newXp;
  currentUserData.weeklyXP = (currentUserData.weeklyXP || 0) + amount;
  updateXpHud(currentUserData.xp);
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      xp: firebase.firestore.FieldValue.increment(amount),
      weeklyXP: firebase.firestore.FieldValue.increment(amount)
    });
  }
  registerMissionEvent("xpEarnedToday", amount);

  const oldLevel = levelForXp(oldXp);
  const newLevel = levelForXp(newXp);
  if (newLevel > oldLevel) {
    playLevelUpAnimation(newLevel);
  }
}

function navigateTo(target) {
  showScreen(target);
  if (target === "home-section") renderHome();
  if (target === "subjects-section") renderSubjects();
  if (target === "boss-section") renderBossGrid();
  if (target === "missions-section") renderMissions();
  if (target === "leaderboard-section") renderLeaderboard();
  if (target === "duel-section") renderDuelMenu();
  if (target === "tutor-section") renderTutorScreen();
  if (target === "pro-section") renderProScreen();
}

function renderHome() {
  document.getElementById("home-level").textContent = levelForXp(currentUserData.xp || 0);
  document.getElementById("home-xp").textContent = currentUserData.xp || 0;
  const rankInfo = (typeof RANKS !== "undefined") ? RANKS[currentUserData.rank || 0] : null;
  document.getElementById("home-rank").textContent = rankInfo ? rankInfo.name : "Bronze";
}

document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("click", () => navigateTo(btn.dataset.nav));
});

document.querySelectorAll(".home-shortcut").forEach(btn => {
  btn.addEventListener("click", () => navigateTo(btn.dataset.nav));
});

// Links inside screens (like the ad banner) that should act like nav buttons
document.querySelectorAll("[data-nav].ad-link").forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo(link.dataset.nav);
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
    document.getElementById("forgot-password-form").classList.add("hidden");
  });
});

// ---------- Sign up ----------
document.getElementById("signup-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = document.getElementById("signup-name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const gradeId = document.getElementById("signup-grade").value;
  const errorEl = document.getElementById("signup-error");
  errorEl.textContent = "";

  const gradeBand = GRADE_BANDS.find(g => g.id === gradeId) || GRADE_BANDS[0];
  const initialChapterProgress = {};
  SUBJECTS.forEach(s => { initialChapterProgress[s.id] = gradeBand.unlockCount; });

  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await cred.user.updateProfile({ displayName: name });
    await db.collection("users").doc(cred.user.uid).set({
      name: name,
      xp: 0,
      isPro: false,
      completedSubjects: [],
      bossLevels: {},
      chapterProgress: initialChapterProgress,
      gradeLevel: gradeBand.id,
      missionDate: null,
      missionProgress: {},
      missionClaimed: {},
      subjectStats: {},
      aiTutorDate: null,
      aiTutorUsesToday: 0,
      tutorLevel: {},
      rank: 0,
      weeklyXP: 0,
      weekId: null,
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

document.getElementById("feedback-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const messageEl = document.getElementById("feedback-message");
  const statusEl = document.getElementById("feedback-status");
  const message = messageEl.value.trim();
  if (!message) return;

  statusEl.textContent = "";
  statusEl.classList.remove("form-success");

  try {
    await db.collection("feedback").add({
      uid: currentUser ? currentUser.uid : null,
      name: currentUserData ? currentUserData.name : "Unknown",
      message: message,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    messageEl.value = "";
    statusEl.textContent = "Thanks! Your feedback was sent.";
    statusEl.classList.add("form-success");
  } catch (err) {
    statusEl.textContent = "Couldn't send that right now — please try again.";
  }
});

// ---------- Forgot password ----------
document.getElementById("forgot-password-link").addEventListener("click", (e) => {
  e.preventDefault();
  document.getElementById("signin-form").classList.add("hidden");
  document.getElementById("signup-form").classList.add("hidden");
  document.getElementById("forgot-password-form").classList.remove("hidden");
  document.getElementById("forgot-password-message").textContent = "";
  document.querySelectorAll(".auth-tab").forEach(t => t.classList.remove("active"));
});

document.getElementById("forgot-password-back-btn").addEventListener("click", () => {
  document.getElementById("forgot-password-form").classList.add("hidden");
  document.getElementById("signin-form").classList.remove("hidden");
  document.querySelector('.auth-tab[data-tab="signin"]').classList.add("active");
});

document.getElementById("forgot-password-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("forgot-password-email").value.trim();
  const msgEl = document.getElementById("forgot-password-message");
  msgEl.textContent = "";
  msgEl.classList.remove("form-success");

  try {
    await auth.sendPasswordResetEmail(email);
    msgEl.textContent = "Check your email for a link to reset your password.";
    msgEl.classList.add("form-success");
  } catch (err) {
    msgEl.textContent = friendlyAuthError(err);
  }
});

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
      aiTutorUsesToday: data.aiTutorUsesToday || 0,
      tutorLevel: data.tutorLevel || {},
      gradeLevel: data.gradeLevel || "high",
      rank: typeof data.rank === "number" ? data.rank : 0,
      weeklyXP: data.weeklyXP || 0,
      weekId: data.weekId || null
    };
    updateXpHud(currentUserData.xp);
    setTopBarVisible(true);
    document.getElementById("welcome-message").textContent = `Hi ${currentUserData.name}, welcome back!`;
    renderHome();
    showScreen("home-section");
  } else {
    currentUserData = null;
    setTopBarVisible(false);
    showScreen("auth-section");
  }
});

// ---------- Subject grid (Quests) ----------
let currentOpenSubject = null; // subject currently being browsed at chapter-select level

function renderGradeSelector() {
  const select = document.getElementById("grade-select");
  if (select.options.length === 0) {
    select.innerHTML = GRADE_BANDS.map(g => `<option value="${g.id}">${g.label}</option>`).join("");
    select.addEventListener("change", handleGradeChange);
  }
  select.value = currentUserData.gradeLevel || "high";
}

async function handleGradeChange() {
  const select = document.getElementById("grade-select");
  const gradeBand = GRADE_BANDS.find(g => g.id === select.value);
  if (!gradeBand) return;

  currentUserData.gradeLevel = gradeBand.id;
  if (!currentUserData.chapterProgress) currentUserData.chapterProgress = {};

  const updates = { gradeLevel: gradeBand.id };
  // Raise (never lower) each subject's unlocked chapter count to match the new grade band.
  SUBJECTS.forEach(subject => {
    const current = currentUserData.chapterProgress[subject.id] || 1;
    if (gradeBand.unlockCount > current) {
      currentUserData.chapterProgress[subject.id] = gradeBand.unlockCount;
      updates[`chapterProgress.${subject.id}`] = gradeBand.unlockCount;
    }
  });

  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update(updates);
  }
  renderSubjects();
}

function renderSubjects() {
  renderGradeSelector();
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
    card.style.setProperty("--subject-color", subject.color);
    card.style.setProperty("--subject-soft", subject.colorSoft);
    card.innerHTML = `
      <span class="quest-icon">${SUBJECT_ICON_SVG[subject.id] || subject.icon}</span>
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

  const unlockedCount = (currentUserData.chapterProgress && currentUserData.chapterProgress[subject.id]) || 1;

  CHAPTER_NAMES.forEach((chapterName, i) => {
    const isCompleted = currentUserData.completedSubjects.includes(`${subject.id}:${i}`);
    const isReached = i < unlockedCount;
    const card = document.createElement("button");
    card.style.setProperty("--subject-color", subject.color);
    card.style.setProperty("--subject-soft", subject.colorSoft);

    if (!isReached) {
      card.className = "quest-card locked";
      card.innerHTML = `
        <span class="quest-icon">🔒</span>
        <p class="quest-name">Chapter ${i + 1}: ${chapterName}</p>
        <p class="quest-meta quest-locked-label">Complete the previous chapter first</p>
      `;
      card.disabled = true;
    } else {
      card.className = "quest-card";
      card.innerHTML = `
        <span class="quest-icon${isCompleted ? " seal-badge" : ""}">${isCompleted ? "✅" : "📘"}</span>
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
  showConceptIntro(subject, chapterIndex);
}

let _pendingQuestStart = null;

function showConceptIntro(subject, chapterIndex) {
  _pendingQuestStart = { subject, chapterIndex };
  document.getElementById("concept-subject-tag").textContent = `${subject.name} — Chapter ${chapterIndex + 1}: ${CHAPTER_NAMES[chapterIndex]}`;
  document.getElementById("concept-heading").textContent = "Before you start...";
  const concepts = CHAPTER_CONCEPTS[subject.id] || [];
  document.getElementById("concept-text").textContent = concepts[chapterIndex] || "Let's practice!";
  showScreen("concept-section");
}

document.getElementById("concept-start-btn").addEventListener("click", () => {
  if (!_pendingQuestStart) return;
  const { subject, chapterIndex } = _pendingQuestStart;
  _pendingQuestStart = null;
  beginQuestQuiz(subject, chapterIndex);
});

function beginQuestQuiz(subject, chapterIndex) {
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

// ---------- Exit lesson ----------
document.getElementById("quiz-exit-btn").addEventListener("click", () => {
  if (!currentQuiz) return;
  const confirmed = confirm("Exit this lesson? Your progress on this attempt will be lost.");
  if (!confirmed) return;

  const mode = currentQuiz.mode;
  currentQuiz = null;
  if (mode === "boss") {
    renderBossGrid();
    showScreen("boss-section");
  } else if (mode === "duel") {
    renderDuelMenu();
    showScreen("duel-section");
  } else if (mode === "tutor") {
    renderTutorScreen();
    showScreen("tutor-section");
  } else if (currentOpenSubject) {
    renderChapterList(currentOpenSubject);
    showScreen("chapters-section");
  } else {
    renderSubjects();
    showScreen("subjects-section");
  }
});

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
  resetInteractiveWidget();

  if (question.type === "balance") {
    renderBalanceWidget(question);
  } else if (question.type === "slope-drag") {
    renderSlopeDragWidget(question);
  } else if (question.type === "sequence") {
    renderSequenceWidget(question);
  } else {
    const optionsEl = document.getElementById("quiz-options");
    optionsEl.innerHTML = "";
    question.options.forEach((optionText, i) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.textContent = optionText;
      btn.addEventListener("click", () => selectOption(i));
      optionsEl.appendChild(btn);
    });
  }

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
  const question = currentQuiz.questions[currentQuiz.index];
  document.getElementById("quiz-confirm-btn").classList.add("hidden");

  if (question.type === "balance" || question.type === "slope-drag" || question.type === "sequence") {
    if (!window.__interactiveCheck) return;
    const result = window.__interactiveCheck();
    if (!result) return;
    handleInteractiveAnswer(result.isCorrect, result.pickedText);
  } else {
    if (currentQuiz.selectedIndex === null || currentQuiz.selectedIndex === undefined) return;
    handleAnswer(currentQuiz.selectedIndex);
  }
});

// Returns the XP awarded per correct answer for the current mode, so
// the celebration animation and feedback text show the right number.
const PRO_XP_BONUS_PER_CORRECT = 5;

// Single source of truth for per-correct-answer XP, so the on-screen
// feedback always matches what actually gets awarded. Pro users get
// a flat bonus on top of the mode's base rate.
function xpPerCorrectForMode(mode) {
  let base = XP_PER_CORRECT_ANSWER;
  if (mode === "boss") base = BOSS_XP_PER_CORRECT;
  else if (mode === "duel") base = DUEL_XP_PER_CORRECT;
  if (currentUserData && currentUserData.isPro) base += PRO_XP_BONUS_PER_CORRECT;
  return base;
}

function handleAnswer(selectedIndex) {
  const { questions, index } = currentQuiz;
  const question = questions[index];
  const isCorrect = selectedIndex === question.correct;
  const options = document.querySelectorAll(".quiz-option");

  options.forEach((btn, i) => {
    btn.disabled = true;
    if (i === question.correct) btn.classList.add("correct");
    if (i === selectedIndex && !isCorrect) btn.classList.add("incorrect");
  });

  applyAnswerResult(isCorrect);
}

// Interactive question types (balance scale, slope-drag) don't have
// option buttons to style, but everything else about scoring an
// answer — XP, mission tracking, celebration, boss hearts, the
// explain/next buttons — is identical, so both paths share this.
function handleInteractiveAnswer(isCorrect, pickedText) {
  const feedbackEl = document.getElementById("quiz-feedback");
  applyAnswerResult(isCorrect);
  if (!isCorrect) {
    feedbackEl.textContent = `Not quite — you got ${pickedText}. Check the explanation for the reasoning.`;
    feedbackEl.className = "quiz-feedback incorrect";
  }
}

function applyAnswerResult(isCorrect) {
  const { questions, index } = currentQuiz;
  const xpForThisAnswer = xpPerCorrectForMode(currentQuiz.mode);
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

// ------------------------------------------------------------------
// "AI Tutor" explanation engine — NOT a real AI model. This is plain
// rule-based logic that adapts the explanation's framing, depth, and
// feedback based on the user's grade level and whether they got the
// question right, using templates rather than a fixed static string.
// This is what makes "Explain this" feel tailored per-user without
// needing a live model call.
// ------------------------------------------------------------------
function buildAdaptiveExplanation(question, isCorrect, selectedIndex) {
  const grade = (currentUserData && currentUserData.gradeLevel) || "high";
  const parts = [];

  const intros = {
    elementary: "Let's break this down step by step:",
    middle: "Here's the reasoning behind it:",
    high: "Here's a closer look at the reasoning:"
  };
  parts.push(intros[grade] || intros.high);

  parts.push(question.explanation);

  if (!isCorrect && typeof selectedIndex === "number" && question.options[selectedIndex]) {
    const pickedText = question.options[selectedIndex];
    const mistakeNotes = {
      elementary: `You picked "${pickedText}" — that's a really common guess, but it doesn't quite match what the question is asking. Take another look at the correct answer above and see why it fits better.`,
      middle: `You picked "${pickedText}." That's a reasonable guess, but it misses a detail — compare it against the correct answer above to spot the difference.`,
      high: `You selected "${pickedText}," which is a common near-miss here. Comparing it against the correct answer usually reveals exactly which assumption led there.`
    };
    parts.push(mistakeNotes[grade] || mistakeNotes.high);
  }

  const extensions = {
    elementary: "Nice work thinking it through — the more you practice, the faster this will feel!",
    middle: "Try to notice this pattern next time it comes up — recognizing it quickly is half the battle.",
    high: "Try connecting this idea to a related concept you already know — that's usually how deeper understanding sticks."
  };
  parts.push(extensions[grade] || extensions.high);

  return parts.join(" ");
}

document.getElementById("quiz-explain-btn").addEventListener("click", () => {
  const explanationEl = document.getElementById("quiz-explanation");
  const btn = document.getElementById("quiz-explain-btn");
  const question = currentQuiz.questions[currentQuiz.index];
  const isCorrect = currentQuiz.selectedIndex === question.correct;

  if (explanationEl.classList.contains("hidden")) {
    explanationEl.textContent = question.explanation
      ? buildAdaptiveExplanation(question, isCorrect, currentQuiz.selectedIndex)
      : "No explanation available for this question yet.";
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
  const xpGained = correctCount * xpPerCorrectForMode("quest");
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
