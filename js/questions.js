// ------------------------------------------------------------------
// QUESTION BANK — organized into chapters per subject.
//
// Each subject has 3 chapters of real, increasing difficulty:
// Beginner -> Intermediate -> Advanced. This is written content, not
// AI-generated, so "harder" here means genuinely harder questions —
// not just more of them. Completing a chapter unlocks the next one
// (see chapterProgress logic in app.js).
//
// In a later version, replace this with a real AI backend that can
// generate infinite tiered questions instead of a fixed set — see the
// README for how that fits in.
// ------------------------------------------------------------------

const SUBJECTS = [
  { id: "math", name: "Math", icon: "🧮", color: "#4C6FA0", colorSoft: "rgba(76,111,160,0.18)" },
  { id: "science", name: "Science", icon: "🔬", color: "#4F8F63", colorSoft: "rgba(79,143,99,0.18)" },
  { id: "history", name: "History", icon: "📜", color: "#B98A3D", colorSoft: "rgba(185,138,61,0.18)" },
  { id: "geography", name: "Geography", icon: "🌍", color: "#3F8C93", colorSoft: "rgba(63,140,147,0.18)" },
  { id: "english", name: "English", icon: "📖", color: "#7C5FA0", colorSoft: "rgba(124,95,160,0.18)" },
  { id: "computer-science", name: "Computer Science", icon: "💻", color: "#A85276", colorSoft: "rgba(168,82,118,0.18)" },
  { id: "economics", name: "Economics", icon: "💰", color: "#B06A35", colorSoft: "rgba(176,106,53,0.18)" },
  { id: "probability", name: "Probability", icon: "🎲", color: "#5C9EAD", colorSoft: "rgba(92,158,173,0.18)" },
  { id: "technology", name: "Technology", icon: "🔋", color: "#7A8C5C", colorSoft: "rgba(122,140,92,0.18)" },
  { id: "coding", name: "Coding", icon: "⌨️", color: "#8B5FA0", colorSoft: "rgba(139,95,160,0.18)" }
];

// A small custom line-icon system replacing emoji in the visual
// subject badges (the quest/chapter cards). Emoji-as-UI-icons is
// one of the most common "AI slop" tells — a coherent stroke-based
// icon set reads as actually designed. subject.icon (emoji) is kept
// only for plain-text contexts, like the <option> list in the duel
// picker, where an <svg> can't render.
const SUBJECT_ICON_SVG = {
  math: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><line x1="8" y1="7" x2="16" y2="7"/><circle cx="8" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="8" cy="16" r="1"/><circle cx="12" cy="16" r="1"/><circle cx="16" cy="16" r="1"/></svg>',
  science: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3"/><line x1="8" y1="14" x2="16" y2="14"/></svg>',
  history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="20" y2="21"/><line x1="7" y1="18" x2="7" y2="8"/><line x1="11" y1="18" x2="11" y2="8"/><line x1="13" y1="18" x2="13" y2="8"/><line x1="17" y1="18" x2="17" y2="8"/><line x1="5" y1="8" x2="19" y2="8"/><polygon points="4,8 12,3 20,8"/></svg>',
  geography: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><ellipse cx="12" cy="12" rx="4" ry="9"/><line x1="3" y1="12" x2="21" y2="12"/></svg>',
  english: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5c3-1.5 6-1.5 8 0v14c-2-1.5-5-1.5-8 0V5z"/><path d="M20 5c-3-1.5-6-1.5-8 0v14c2-1.5 5-1.5 8 0V5z"/></svg>',
  "computer-science": '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 3 12 9 18"/><polyline points="15 6 21 12 15 18"/></svg>',
  economics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 9 11 13 15 21 6"/><polyline points="14 6 21 6 21 13"/></svg>',
  probability: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/><circle cx="7" cy="7" r="0.9" fill="currentColor" stroke="none"/><circle cx="17" cy="15.5" r="0.9" fill="currentColor" stroke="none"/><circle cx="15.5" cy="17" r="0.9" fill="currentColor" stroke="none"/><circle cx="18.5" cy="17" r="0.9" fill="currentColor" stroke="none"/><circle cx="17" cy="18.5" r="0.9" fill="currentColor" stroke="none"/></svg>',
  technology: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="10" y1="6" x2="14" y2="6"/><line x1="10" y1="18" x2="14" y2="18"/></svg>',
  coding: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="8 4 2 12 8 20"/><polyline points="16 4 22 12 16 20"/><line x1="13" y1="3" x2="11" y2="21"/></svg>'
};

// A couple of small utility icons (lock, checkmark) used on the
// chapter list, matching the same custom line-icon language.
const UTIL_ICON_SVG = {
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 12 9 17 20 6"/></svg>'
};
// Leaderboard, Tutor, Duel) so the whole app uses one consistent
// icon language instead of mixing SVG subject icons with emoji nav
// icons.
const NAV_ICON_SVG = {
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 8h3l2-3h6l2 3h3v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5z"/><line x1="12" y1="6" x2="12" y2="19"/></svg>',
  chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5h16v11H8l-4 4V5z"/></svg>',
  missions: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="13" y2="15"/></svg>',
  leaderboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v4a4 4 0 0 1-8 0V4z"/><path d="M8 5H5a3 3 0 0 0 3 4"/><path d="M16 5h3a3 3 0 0 1-3 4"/><line x1="12" y1="12" x2="12" y2="17"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="17" x2="12" y2="20"/></svg>',
  tutor: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9l10-5 10 5-10 5-10-5z"/><path d="M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5"/></svg>',
  duel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="20" x2="14" y2="10"/><line x1="20" y1="4" x2="10" y2="14"/><line x1="4" y1="4" x2="20" y2="20"/></svg>',
  quests: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12l4-8h10l4 8-4 8H7l-4-8z"/><circle cx="12" cy="12" r="2.5"/></svg>'
};

const CHAPTER_NAMES = ["Beginner", "Intermediate", "Advanced"];

// A short "why this matters" concept intro shown before each chapter's
// questions — the closest realistic version of Brilliant-style
// concept teaching we can do with static content (one per chapter,
// not one per question).
const CHAPTER_CONCEPTS = {
  math: [
    "Arithmetic is the toolkit for everything else in math — every formula eventually breaks down into adding, multiplying, or comparing numbers. Getting fast and confident with basics like multiplication and percentages means you can focus on the interesting parts of harder problems later, instead of getting stuck on the arithmetic itself.",
    "Algebra is really just a way of describing a relationship when you don't yet know one of the numbers in it. Once you can set up and solve an equation, you've got a tool that works for thousands of real problems — from splitting a bill to figuring out how fast something is moving.",
    "This is where math starts describing curves, growth, and change instead of just fixed numbers. Exponents, slopes, and logarithms aren't abstract rules — they're the language used to describe population growth, sound and light, and how computers process information."
  ],
  science: [
    "Science starts with noticing patterns in the world and asking why they happen. These basics — from planets to plants to gravity — are the building blocks every deeper scientific idea rests on.",
    "At this level, science shifts from 'what happens' to 'how it works underneath.' Understanding cells, states of matter, and energy means you can start explaining everyday things — like why ice melts or why your heart beats — instead of just memorizing facts about them.",
    "These are foundational laws the rest of physics, chemistry, and biology build on. Newton's laws, atomic structure, and cell division aren't isolated facts — they're rules that everything from rockets to medicine depends on."
  ],
  history: [
    "History isn't just dates to memorize — it's the story of how the world got to be the way it is. These early milestones are reference points that almost every later historical event connects back to.",
    "Once you know the big landmarks, this level is about cause and effect — why revolutions happened, why wars started, why people made the choices they did. That's the real skill of history: understanding why, not just what.",
    "At this level, you start seeing patterns that repeat across centuries — empires rising and falling, ideas spreading, power shifting. These deeper forces help explain current events too, since many echo patterns from history."
  ],
  geography: [
    "Geography is the physical stage that human history and daily life play out on. Knowing where things are isn't just memorization — it helps explain why civilizations grew where they did and how geography shapes culture.",
    "This level connects physical geography to how humans actually use the land — oceans for trade, mountains as natural borders, deserts limiting where people can live. That explains a lot about why the world is organized the way it is.",
    "These are the sharper, more specific facts that separate a solid geography foundation from a deep one — extreme places and quirks of the physical world that often tie bigger concepts together."
  ],
  english: [
    "Language has patterns, just like math does. Once you know how sentences are built — nouns, verbs, adjectives — you can notice HOW a sentence works, not just guess whether it 'sounds right.'",
    "This level is where grammar and vocabulary start letting you say more precisely what you mean, and notice how writers use language on purpose — like similes and careful word choice — instead of just using words automatically.",
    "At this level you're studying how writers create meaning and feeling deliberately — through devices like personification, irony, and sentence structure. Recognizing these tools helps you analyze writing, and write more powerfully yourself."
  ],
  "computer-science": [
    "Every computer, no matter how powerful, is built from a few very simple ideas — binary, basic hardware, step-by-step instructions. Understanding these fundamentals means later ideas won't feel like magic.",
    "This level covers the basic 'verbs' of programming — loops, variables, comments — the small tools combined to build every piece of software you've used. Once these feel natural, you can focus on solving problems instead of syntax.",
    "Algorithms and data structures are what separate 'code that works' from 'code that works well.' Understanding WHY one approach is faster than another is a core skill professional engineers build their careers on."
  ],
  economics: [
    "Economics is the study of how people make choices when they can't have everything they want. Supply, demand, and opportunity cost show up everywhere — from grocery prices to your own daily decisions.",
    "This level looks at how those basic choices scale up to affect entire markets — competition, policy, unemployment. Understanding these connections explains why prices rise and why governments make the decisions they do.",
    "These are the big-picture forces central banks and governments wrestle with — inflation, trade, monetary policy. Understanding them means economic news starts making sense as more than background noise."
  ]
};

// Grade bands map onto the existing chapter tiers rather than needing
// a fully separate curriculum per grade — picking a band sets how
// many chapters start unlocked across every subject.
const GRADE_BANDS = [
  { id: "elementary", label: "Elementary (Grades 3–5)", unlockCount: 1 },
  { id: "middle", label: "Middle School (Grades 6–8)", unlockCount: 2 },
  { id: "high", label: "High School (Grades 9–12)", unlockCount: 3 }
];

// ------------------------------------------------------------------
// Lesson & question data (LESSONS and QUESTION_BANK) lives in
// js/question-data.js. It's ~2 MB (about 320 KB compressed) and was the
// biggest thing the page had to download before it could show anything,
// even though sign-in and Home never use it. It now starts downloading
// in the background as soon as this file runs, and the screens that
// need it (Quests, Trivia, Battle, Team Battle) wait for it via
// ensureQuestionData() if it hasn't finished yet.
// ------------------------------------------------------------------
let _questionDataPromise = null;

function isQuestionDataLoaded() {
  return typeof LESSONS !== "undefined" && typeof QUESTION_BANK !== "undefined";
}

function ensureQuestionData() {
  if (isQuestionDataLoaded()) return Promise.resolve();
  if (_questionDataPromise) return _questionDataPromise;
  _questionDataPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "js/question-data.js?v=" + (typeof APP_BUILD !== "undefined" ? encodeURIComponent(APP_BUILD.split(" ")[0]) : "1");
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      _questionDataPromise = null; // allow a retry on the next attempt
      reject(new Error("Couldn't load lessons. Check your connection and try again."));
    };
    document.head.appendChild(script);
  });
  return _questionDataPromise;
}

// Start downloading right away, in the background.
ensureQuestionData().catch(err => console.warn(err.message));

// Returns 5 shuffled questions. Pass a chapterIndex (0, 1, or 2) to
// get that chapter specifically (used by Quests). Omit it to get a
// mixed pool across all chapters for that subject (used by Duels
// and the AI Tutor, where difficulty tiers don't apply).
// Removes interactive question types (balance, slope-drag, sequence)
// from a pool if the user has turned them off in Settings — checked
// wherever a question set gets assembled, not just one place, so the
// toggle applies consistently everywhere (Quests, Duel, Trivia,
// AI Tutor).
function applyInteractiveSetting(questions) {
  if (typeof isInteractiveDisabled === "function" && isInteractiveDisabled()) {
    // true-false is deliberately kept even with interactive questions
    // turned off: it needs no special interaction mechanism (no drag,
    // no typing) — just tapping one of two options, exactly like
    // standard multiple choice — so it doesn't belong in the same
    // "off" bucket as balance/slope-drag/sentence-build/fill-blank,
    // which do require a different kind of interaction.
    return questions.filter(q => !q.type || q.type === "true-false");
  }
  return questions;
}

function getQuestions(subjectId, chapterIndex) {
  const chapters = QUESTION_BANK[subjectId] || [];
  const pool = (typeof chapterIndex === "number")
    ? (chapters[chapterIndex] || [])
    : chapters.flat();
  const filtered = applyInteractiveSetting(pool);
  const shuffled = [...filtered].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}
