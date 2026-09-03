// ------------------------------------------------------------------
// version5 — Study Mode (Pro/Ultra).
//
// Reuses the same chapter > lesson flattening pattern built for the
// static Quests subjects, but pointed at a per-user, AI-generated
// course instead of the shared LESSONS object. Deliberately kept as
// its own parallel set of functions rather than merged into the
// existing renderRoadmap/beginLessonQuiz/finishLesson — those are
// already carefully tested against the static subjects, and forcing
// them to also understand a dynamically-generated, per-user course
// risked destabilizing something that already works.
// ------------------------------------------------------------------

function getStudyModeFlattenedSteps() {
  const course = currentUserData && currentUserData.studyModeCourse;
  if (!course || !course.chapters) return [];
  const steps = [];
  course.chapters.forEach((chapter, chapterIndex) => {
    chapter.lessons.forEach((lesson, lessonIndexInChapter) => {
      steps.push({
        chapterIndex,
        lessonIndexInChapter,
        chapterName: chapter.name,
        lessonName: lesson.name,
        questions: lesson.questions,
        isFirstInChapter: lessonIndexInChapter === 0
      });
    });
  });
  return steps;
}

function getStudyModeStepKey(step) {
  return `studymode:chapter:${step.chapterIndex}:lesson:${step.lessonIndexInChapter}`;
}

function renderStudyModeScreen() {
  const isProOrUltra = currentUserData && (currentUserData.isPro || currentUserData.isUltra);
  document.getElementById("study-mode-locked").classList.toggle("hidden", isProOrUltra);
  document.getElementById("study-mode-unlocked").classList.toggle("hidden", !isProOrUltra);
  if (!isProOrUltra) return;

  const hasCourse = !!(currentUserData.studyModeCourse && currentUserData.studyModeCourse.chapters);
  document.getElementById("study-mode-setup-form").classList.toggle("hidden", hasCourse);
  document.getElementById("study-mode-existing-course").classList.toggle("hidden", !hasCourse);
  document.getElementById("study-mode-status").textContent = "";
  if (hasCourse) {
    document.getElementById("study-mode-existing-name").textContent =
      `You have a course in progress: "${currentUserData.studyModeCourse.courseName}"`;
    // Sharing a course you're studying is an Ultra-exclusive perk on
    // top of Study Mode itself (already Pro/Ultra-gated) — Pro users
    // can use Study Mode but not share their course via link.
    document.getElementById("study-mode-share-btn").classList.toggle("hidden", !currentUserData.isUltra);
    document.getElementById("study-mode-share-note").textContent = "";
  }
}

document.getElementById("tutor-study-mode-link").addEventListener("click", () => navigateTo("study-mode-section"));
document.getElementById("study-mode-back-btn").addEventListener("click", () => navigateTo("tutor-section"));
document.getElementById("study-mode-upgrade-btn").addEventListener("click", () => navigateTo("pro-section"));
document.getElementById("study-mode-roadmap-back-btn").addEventListener("click", () => navigateTo("study-mode-section"));

document.getElementById("study-mode-continue-btn").addEventListener("click", () => {
  const steps = getStudyModeFlattenedSteps();
  const firstUnreached = steps.findIndex(s => !currentUserData.completedSubjects.includes(getStudyModeStepKey(s)));
  renderStudyModeRoadmap(firstUnreached === -1 ? steps.length - 1 : firstUnreached);
  showScreen("study-mode-roadmap-section");
});

document.getElementById("study-mode-new-course-btn").addEventListener("click", () => {
  document.getElementById("study-mode-setup-form").classList.remove("hidden");
  document.getElementById("study-mode-existing-course").classList.add("hidden");
});

document.getElementById("study-mode-generate-btn").addEventListener("click", async () => {
  const curriculum = document.getElementById("study-mode-curriculum").value.trim();
  const grade = document.getElementById("study-mode-grade").value;
  const statusEl = document.getElementById("study-mode-status");
  const btn = document.getElementById("study-mode-generate-btn");

  statusEl.textContent = "";
  if (!curriculum) {
    statusEl.textContent = "Tell the AI what you want to study first.";
    return;
  }

  btn.disabled = true;
  statusEl.textContent = "Generating your course — this can take a moment...";

  try {
    const result = await callWorkerFunction("generateStudyCourse", { curriculum, gradeLevel: grade });
    currentUserData.studyModeCourse = result.course;
    currentUserData.studyModePerformance = {};
    // Clear any previous course's completion keys so the new one starts fresh.
    currentUserData.completedSubjects = currentUserData.completedSubjects.filter(k => !k.startsWith("studymode:"));

    if (currentUser) {
      await db.collection("users").doc(currentUser.uid).update({
        studyModeCourse: result.course,
        studyModePerformance: {},
        completedSubjects: currentUserData.completedSubjects
      });
    }

    statusEl.textContent = "";
    renderStudyModeRoadmap(0);
    showScreen("study-mode-roadmap-section");
  } catch (err) {
    statusEl.textContent = err.message || "Couldn't generate a course right now.";
  } finally {
    btn.disabled = false;
  }
});

function renderStudyModeRoadmap(highlightIndex) {
  const course = currentUserData.studyModeCourse;
  document.getElementById("study-mode-roadmap-heading").textContent = course.courseName;
  const steps = getStudyModeFlattenedSteps();
  const path = document.getElementById("study-mode-roadmap-path");
  path.innerHTML = "";

  steps.forEach((step, i) => {
    if (step.isFirstInChapter) {
      const header = document.createElement("p");
      header.className = "roadmap-chapter-header";
      header.textContent = `Chapter ${step.chapterIndex + 1}: ${step.chapterName}`;
      path.appendChild(header);
    }

    const stepKey = getStudyModeStepKey(step);
    const isCompleted = currentUserData.completedSubjects.includes(stepKey);
    const isReached = i === 0 || currentUserData.completedSubjects.includes(getStudyModeStepKey(steps[i - 1]));
    const isLocked = !isReached;
    const side = i % 2 === 0 ? "left" : "right";

    const node = document.createElement("div");
    node.className = `roadmap-node roadmap-node-${side}`;

    const btn = document.createElement("button");
    btn.className = "roadmap-dot" + (isCompleted ? " seal-badge roadmap-dot-done" : "") + (isLocked ? " roadmap-dot-locked" : "");
    btn.innerHTML = isCompleted ? UTIL_ICON_SVG.check : (isLocked ? UTIL_ICON_SVG.lock : String(i + 1));
    btn.disabled = isLocked;
    if (!isLocked) btn.addEventListener("click", () => showStudyModeLessonIntro(i));

    if (i === highlightIndex) {
      node.classList.add("roadmap-node-highlighted");
      const mascot = document.createElement("div");
      mascot.className = "roadmap-mascot";
      renderOllieMascotInto(mascot, 60);
      node.appendChild(mascot);
    }

    const label = document.createElement("p");
    label.className = "roadmap-label";
    label.textContent = step.lessonName;

    node.appendChild(btn);
    node.appendChild(label);
    path.appendChild(node);
  });
}

let _pendingStudyModeLessonStart = null;

function showStudyModeLessonIntro(stepIndex) {
  _pendingStudyModeLessonStart = stepIndex;
  _pendingLessonStart = null;
  _pendingQuestStart = null;
  const step = getStudyModeFlattenedSteps()[stepIndex];
  document.getElementById("concept-subject-tag").textContent =
    `${currentUserData.studyModeCourse.courseName} — Chapter ${step.chapterIndex + 1}: ${step.chapterName} (${step.lessonName})`;
  document.getElementById("concept-heading").textContent = "Before you start...";
  document.getElementById("concept-text").textContent = `This is ${step.lessonName.toLowerCase()} of "${step.chapterName}" — work through the questions to practice this piece.`;
  showScreen("concept-section");
}

function beginStudyModeLesson(stepIndex) {
  const step = getStudyModeFlattenedSteps()[stepIndex];
  const questions = applyInteractiveSetting(step.questions);
  currentQuiz = {
    mode: "studyMode",
    stepIndex: stepIndex,
    subjectName: `${currentUserData.studyModeCourse.courseName} — Ch${step.chapterIndex + 1} (${step.lessonName})`,
    questions: [...questions].sort(() => Math.random() - 0.5),
    index: 0,
    correctCount: 0
  };
  showScreen("quiz-section");
  document.getElementById("hearts-hud").classList.add("hidden");
  renderQuestion();
}

async function finishStudyModeLesson() {
  const { correctCount, questions, stepIndex } = currentQuiz;
  const xpGained = currentQuiz.xpEarned || 0;
  const steps = getStudyModeFlattenedSteps();
  const step = steps[stepIndex];
  const stepKey = getStudyModeStepKey(step);

  const alreadyCompleted = currentUserData.completedSubjects.includes(stepKey);
  if (!alreadyCompleted) currentUserData.completedSubjects.push(stepKey);

  await addXp(xpGained);
  registerMissionEvent("questsCompleted", 1);

  // Track per-chapter accuracy so the end-of-course feedback can
  // point at a specific weak topic instead of speaking generically.
  if (!currentUserData.studyModePerformance) currentUserData.studyModePerformance = {};
  const perf = currentUserData.studyModePerformance;
  const chKey = "ch" + step.chapterIndex;
  perf[chKey] = perf[chKey] || { correct: 0, total: 0, name: step.chapterName };
  perf[chKey].correct += correctCount;
  perf[chKey].total += questions.length;

  const updates = { studyModePerformance: perf };
  if (!alreadyCompleted) updates.completedSubjects = firebase.firestore.FieldValue.arrayUnion(stepKey);

  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update(updates);
  }

  const nextStepIndex = stepIndex + 1 < steps.length ? stepIndex + 1 : stepIndex;
  const isLastStep = stepIndex === steps.length - 1;
  const unlockedNext = !alreadyCompleted && stepIndex + 1 < steps.length;

  showLessonCompleteToast(correctCount, questions.length, xpGained, unlockedNext);
  checkLeaderboardRankUpAnimation(xpGained);
  renderStudyModeRoadmap(nextStepIndex);
  showScreen("study-mode-roadmap-section");

  if (correctCount === questions.length) {
    setTimeout(playConfettiAnimation, 300);
  }

  if (isLastStep && !alreadyCompleted) {
    await showStudyModeCompletionFeedback();
  }
}

async function showStudyModeCompletionFeedback() {
  const overlay = document.getElementById("study-mode-feedback-overlay");
  const textEl = document.getElementById("study-mode-feedback-text");
  overlay.classList.remove("hidden");
  textEl.textContent = "Thinking about how you did...";

  const perf = currentUserData.studyModePerformance || {};
  const summary = Object.values(perf).map(p => `${p.name}: ${p.correct}/${p.total} correct`).join("\n");

  try {
    const result = await callWorkerFunction("generateStudyModeFeedback", {
      courseName: currentUserData.studyModeCourse.courseName,
      performanceSummary: summary,
      gradeLevel: currentUserData.gradeLevel
    });
    textEl.textContent = result.feedback;
  } catch (err) {
    textEl.textContent = "Great work finishing the course! Look back at whichever chapter you missed the most questions in for what to review next.";
  }
}

document.getElementById("study-mode-feedback-close-btn").addEventListener("click", () => {
  document.getElementById("study-mode-feedback-overlay").classList.add("hidden");
});

// ------------------------------------------------------------------
// Sharing a Study Mode course via link (Ultra only for the sharer;
// anyone with the link can view/import it, since Study Mode's own
// Pro/Ultra gate already governs whether they can actually USE it).
// ------------------------------------------------------------------
document.getElementById("study-mode-share-btn").addEventListener("click", async () => {
  const noteEl = document.getElementById("study-mode-share-note");
  if (!currentUserData.isUltra) {
    noteEl.textContent = "Sharing a course is an Ultra feature.";
    return;
  }
  const url = `${window.location.origin}${window.location.pathname}?sharedCourse=${currentUser.uid}`;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      noteEl.textContent = "Link copied! Anyone with it can import your course.";
    } else {
      noteEl.textContent = url;
    }
  } catch (err) {
    noteEl.textContent = url; // clipboard access denied — show the raw link instead
  }
});

// Checked once on load (see checkForSharedStudyCourseLink, called
// from the main auth-ready flow) rather than only when the user
// happens to visit Study Mode — someone opening a shared link should
// see the import prompt regardless of which screen they land on.
async function checkForSharedStudyCourseLink() {
  if (!window.location || !currentUser) return;
  const params = new URLSearchParams(window.location.search);
  const creatorUid = params.get("sharedCourse");
  if (!creatorUid) return;
  if (creatorUid === currentUser.uid) return; // sharing your own link back to yourself — nothing to do

  const overlay = document.getElementById("study-mode-import-overlay");
  const textEl = document.getElementById("study-mode-import-text");
  const acceptBtn = document.getElementById("study-mode-import-accept-btn");
  overlay.classList.remove("hidden");
  textEl.textContent = "Loading shared course...";
  acceptBtn.classList.add("hidden");

  try {
    const result = await callWorkerFunction("getSharedStudyCourse", { creatorUid });
    textEl.textContent = `${result.sharedByName} shared a course with you: "${result.course.courseName}". Importing this will replace any Study Mode course you currently have in progress.`;
    acceptBtn.classList.remove("hidden");
    acceptBtn.onclick = async () => {
      currentUserData.studyModeCourse = result.course;
      currentUserData.studyModePerformance = {};
      currentUserData.completedSubjects = currentUserData.completedSubjects.filter(k => !k.startsWith("studymode:"));
      if (currentUser) {
        await db.collection("users").doc(currentUser.uid).update({
          studyModeCourse: result.course,
          studyModePerformance: {},
          completedSubjects: currentUserData.completedSubjects
        });
      }
      overlay.classList.add("hidden");
      navigateTo("study-mode-section");
    };
  } catch (err) {
    textEl.textContent = err.message || "Couldn't load that shared course.";
  }
}

document.getElementById("study-mode-import-dismiss-btn").addEventListener("click", () => {
  document.getElementById("study-mode-import-overlay").classList.add("hidden");
});
