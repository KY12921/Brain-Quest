// ------------------------------------------------------------------
// Study Boss v1 — core loop: sign in -> pick subject -> 5 questions -> XP
// ------------------------------------------------------------------

const XP_PER_CORRECT_ANSWER = 20;
const XP_PER_LEVEL = 100; // used only for the visual XP bar fill

let currentUser = null;
let currentUserData = null; // { name, xp }
let currentQuiz = null; // { subjectId, subjectName, questions, index, correctCount }

// ---------- Screen helpers ----------
function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.add("hidden"));
  document.getElementById(id).classList.remove("hidden");
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
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    // onAuthStateChanged will take it from here
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
    currentUserData = doc.exists ? doc.data() : { name: user.displayName || "Student", xp: 0 };
    updateXpHud(currentUserData.xp || 0);
    setTopBarVisible(true);
    renderSubjects();
    showScreen("subjects-section");
  } else {
    currentUserData = null;
    setTopBarVisible(false);
    showScreen("auth-section");
  }
});

// ---------- Subject grid ----------
function renderSubjects() {
  const grid = document.getElementById("quest-grid");
  grid.innerHTML = "";
  SUBJECTS.forEach(subject => {
    const card = document.createElement("button");
    card.className = "quest-card";
    card.innerHTML = `
      <span class="quest-icon">${subject.icon}</span>
      <p class="quest-name">${subject.name}</p>
      <p class="quest-meta">5 questions · up to ${XP_PER_CORRECT_ANSWER * 5} XP</p>
    `;
    card.addEventListener("click", () => startQuiz(subject));
    grid.appendChild(card);
  });
}

// ---------- Quiz flow ----------
function startQuiz(subject) {
  const questions = getQuestions(subject.id);
  currentQuiz = {
    subjectId: subject.id,
    subjectName: subject.name,
    questions: questions,
    index: 0,
    correctCount: 0
  };
  showScreen("quiz-section");
  renderQuestion();
}

function renderQuestion() {
  const { questions, index, subjectName } = currentQuiz;
  const question = questions[index];

  document.getElementById("quiz-subject-tag").textContent = subjectName;
  document.getElementById("quiz-progress-label").textContent = `Question ${index + 1} of ${questions.length}`;
  document.getElementById("quiz-progress-fill").style.width = `${((index) / questions.length) * 100}%`;
  document.getElementById("quiz-question").textContent = question.q;
  document.getElementById("quiz-feedback").textContent = "";
  document.getElementById("quiz-feedback").className = "quiz-feedback";
  document.getElementById("quiz-next-btn").classList.add("hidden");

  const optionsEl = document.getElementById("quiz-options");
  optionsEl.innerHTML = "";
  question.options.forEach((optionText, i) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option";
    btn.textContent = optionText;
    btn.addEventListener("click", () => handleAnswer(i));
    optionsEl.appendChild(btn);
  });
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

  const feedbackEl = document.getElementById("quiz-feedback");
  if (isCorrect) {
    currentQuiz.correctCount++;
    feedbackEl.textContent = `Correct! +${XP_PER_CORRECT_ANSWER} XP`;
    feedbackEl.className = "quiz-feedback correct";
  } else {
    feedbackEl.textContent = "Not quite — the correct answer is highlighted.";
    feedbackEl.className = "quiz-feedback incorrect";
  }

  document.getElementById("quiz-progress-fill").style.width = `${((index + 1) / questions.length) * 100}%`;
  document.getElementById("quiz-next-btn").classList.remove("hidden");
}

document.getElementById("quiz-next-btn").addEventListener("click", () => {
  currentQuiz.index++;
  if (currentQuiz.index < currentQuiz.questions.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
});

async function finishQuiz() {
  const { correctCount, questions } = currentQuiz;
  const xpGained = correctCount * XP_PER_CORRECT_ANSWER;
  const newXp = (currentUserData.xp || 0) + xpGained;

  currentUserData.xp = newXp;
  updateXpHud(newXp);

  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({
      xp: firebase.firestore.FieldValue.increment(xpGained)
    });
  }

  document.getElementById("results-score").textContent = `${correctCount} / ${questions.length}`;
  document.getElementById("results-xp-gain").textContent = `+${xpGained} XP`;
  document.getElementById("results-message").textContent = resultMessage(correctCount, questions.length);
  showScreen("results-section");
}

function resultMessage(correct, total) {
  if (correct === total) return "Perfect run! You've mastered this set.";
  if (correct >= total * 0.6) return "Solid work — a bit more practice and you'll ace it.";
  return "Good attempt — try this subject again to lock it in.";
}

document.getElementById("results-again-btn").addEventListener("click", () => {
  showScreen("subjects-section");
});
