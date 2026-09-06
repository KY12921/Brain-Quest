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
// subject badges (the quest/chapter/boss cards). Emoji-as-UI-icons is
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
  boss: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 18h18l-1-9-5 4-3-6-3 6-5-4-1 9z"/></svg>',
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

// QUESTION_BANK[subjectId] = [ [chapter0 questions], [chapter1], [chapter2] ]
// ------------------------------------------------------------------
// LESSONS — a structured, topic-by-topic roadmap for the Quests
// experience. Each subject has 10 lessons, each teaching one specific
// topic (not random trivia mixed together), with exactly 5 questions
// on that topic. Currently fully built for Math and Science; other
// subjects still use the older difficulty-tier QUESTION_BANK below
// for Quests until they get converted too (see README).
// ------------------------------------------------------------------

const LESSONS = {
  math: [
  {
    name: "Whole Number Operations",
    lessons: [
      {
        name: "Addition Facts",
  questions: [
    { q: "What is 12 + 15?", options: ["25", "26", "27", "28"], correct: 2, explanation: "12 + 15 = 27. Adding the ones (2+5=7) and tens (10+10=20) gives 27." },
    { q: "What is 9 + 8?", options: ["15", "16", "17", "18"], correct: 2, explanation: "9 + 8 = 17. One way: 9 + 8 = 9 + 1 + 7 = 10 + 7 = 17." },
    { q: "What is 34 + 21?", options: ["53", "54", "55", "56"], correct: 2, explanation: "34 + 21 = 55. Adding tens (30+20=50) and ones (4+1=5) gives 55." }
  ]
},
      {
        name: "Subtraction Facts",
  questions: [
    { q: "What is 15 - 7?", options: ["6", "7", "8", "9"], correct: 2, explanation: "15 - 7 = 8. Counting up from 7 to 15 takes 8 steps." },
    { q: "What is 42 - 18?", options: ["22", "23", "24", "25"], correct: 2, explanation: "42 - 18 = 24. Borrowing: 42 becomes 3 tens and 12 ones; 12-8=4, 3-1=2, giving 24." },
    { q: "What is 20 - 13?", options: ["6", "7", "8", "9"], correct: 1, explanation: "20 - 13 = 7. Counting up from 13 to 20 takes 7 steps." }
  ]
},
      {
        name: "Multiplication Facts",
  questions: [
    { q: "What is 7 × 8?", options: ["54", "56", "64", "48"], correct: 1, explanation: "7 × 8 means adding 7 eight times: 7+7+7+7+7+7+7+7 = 56." },
    { q: "What is 6 × 9?", options: ["45", "48", "54", "56"], correct: 2, explanation: "6 × 9 = 54. One trick: 6 × 9 = 6 × 10 - 6 = 60 - 6 = 54." },
    { q: "What is 3 × 3 × 3?", options: ["9", "18", "27", "36"], correct: 2, explanation: "3 × 3 = 9, then 9 × 3 = 27." }
  ]
},
      {
        name: "Division Facts",
  questions: [
    { q: "What is 100 ÷ 4?", options: ["20", "25", "30", "40"], correct: 1, explanation: "100 ÷ 4 = 25, since 25 × 4 = 100." },
    { q: "What is 48 ÷ 6?", options: ["6", "7", "8", "9"], correct: 2, explanation: "48 ÷ 6 = 8, since 8 × 6 = 48." },
    { q: "What is 63 ÷ 9?", options: ["6", "7", "8", "9"], correct: 1, explanation: "63 ÷ 9 = 7, since 7 × 9 = 63." }
  ]
},
      {
        name: "Order of Operations",
  questions: [
    { q: "What is 2 + 3 × 4?", options: ["20", "14", "24", "9"], correct: 1, explanation: "Multiplication happens before addition: 3 × 4 = 12, then 2 + 12 = 14." },
    { q: "What is (5 + 3) × 2?", options: ["11", "13", "16", "10"], correct: 2, explanation: "Parentheses first: 5 + 3 = 8, then 8 × 2 = 16." },
    { q: "What is 10 - 2 × 3?", options: ["24", "4", "8", "6"], correct: 1, explanation: "Multiplication first: 2 × 3 = 6, then 10 - 6 = 4." }
  ]
},
      {
        name: "Rounding & Estimation",
  questions: [
    { q: "Round 47 to the nearest ten.", options: ["40", "45", "50", "60"], correct: 2, explanation: "47 is closer to 50 than to 40, so it rounds to 50." },
    { q: "Round 123 to the nearest hundred.", options: ["100", "120", "130", "200"], correct: 0, explanation: "123 is closer to 100 than to 200, so it rounds to 100." },
    { q: "Estimate 38 + 52 by rounding each to the nearest ten first.", options: ["80", "90", "100", "70"], correct: 1, explanation: "38 rounds to 40, 52 rounds to 50, and 40 + 50 = 90." }
  ]
},
      {
        name: "Multi-Digit Addition & Subtraction",
  questions: [
    { q: "What is 256 + 178?", options: ["424", "434", "444", "454"], correct: 1, explanation: "256 + 178 = 434. Adding ones: 6+8=14 (carry 1); tens: 5+7+1=13 (carry 1); hundreds: 2+1+1=4." },
    { q: "What is 500 - 237?", options: ["253", "263", "273", "283"], correct: 1, explanation: "500 - 237 = 263. Borrowing across the zeros: 500 becomes 4 hundreds, 9 tens, 10 ones; 10-7=3, 9-3=6, 4-2=2." },
    { q: "What is 348 + 265?", options: ["603", "613", "623", "633"], correct: 1, explanation: "348 + 265 = 613. Ones: 8+5=13 (carry 1); tens: 4+6+1=11 (carry 1); hundreds: 3+2+1=6." }
  ]
},
      {
        name: "Multi-Digit Multiplication",
  questions: [
    { q: "What is 23 × 4?", options: ["82", "88", "92", "96"], correct: 2, explanation: "23 × 4 = 92. Break it up: 20×4=80, 3×4=12, and 80+12=92." },
    { q: "What is 15 × 12?", options: ["160", "170", "180", "190"], correct: 2, explanation: "15 × 12 = 180. Break it up: 15×10=150, 15×2=30, and 150+30=180." },
    { q: "What is 32 × 5?", options: ["150", "155", "160", "165"], correct: 2, explanation: "32 × 5 = 160. Break it up: 30×5=150, 2×5=10, and 150+10=160." }
  ]
},
      {
        name: "Word Problems",
  questions: [
    { q: "Maria has 24 stickers. She gives 9 to her friend. How many does she have left?", options: ["13", "14", "15", "16"], correct: 2, explanation: "24 - 9 = 15 stickers remain." },
    { q: "A box holds 6 apples. How many apples are in 8 boxes?", options: ["42", "44", "46", "48"], correct: 3, explanation: "6 apples × 8 boxes = 48 apples." },
    { q: "There are 35 students split evenly into 5 groups. How many students are in each group?", options: ["5", "6", "7", "8"], correct: 2, explanation: "35 ÷ 5 = 7 students per group." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What is 12 + 15?", options: ["25", "26", "27", "28"], correct: 2, explanation: "12 + 15 = 27. Adding the ones (2+5=7) and tens (10+10=20) gives 27." },
          { q: "What is 9 + 8?", options: ["15", "16", "17", "18"], correct: 2, explanation: "9 + 8 = 17. One way: 9 + 8 = 9 + 1 + 7 = 10 + 7 = 17." },
          { q: "What is 34 + 21?", options: ["53", "54", "55", "56"], correct: 2, explanation: "34 + 21 = 55. Adding tens (30+20=50) and ones (4+1=5) gives 55." },
          { q: "What is 15 - 7?", options: ["6", "7", "8", "9"], correct: 2, explanation: "15 - 7 = 8. Counting up from 7 to 15 takes 8 steps." },
          { q: "What is 42 - 18?", options: ["22", "23", "24", "25"], correct: 2, explanation: "42 - 18 = 24. Borrowing: 42 becomes 3 tens and 12 ones; 12-8=4, 3-1=2, giving 24." },
          { q: "What is 20 - 13?", options: ["6", "7", "8", "9"], correct: 1, explanation: "20 - 13 = 7. Counting up from 13 to 20 takes 7 steps." },
          { q: "What is 7 × 8?", options: ["54", "56", "64", "48"], correct: 1, explanation: "7 × 8 means adding 7 eight times: 7+7+7+7+7+7+7+7 = 56." },
          { q: "What is 6 × 9?", options: ["45", "48", "54", "56"], correct: 2, explanation: "6 × 9 = 54. One trick: 6 × 9 = 6 × 10 - 6 = 60 - 6 = 54." },
          { q: "What is 3 × 3 × 3?", options: ["9", "18", "27", "36"], correct: 2, explanation: "3 × 3 = 9, then 9 × 3 = 27." },
          { q: "What is 100 ÷ 4?", options: ["20", "25", "30", "40"], correct: 1, explanation: "100 ÷ 4 = 25, since 25 × 4 = 100." },
          { q: "What is 48 ÷ 6?", options: ["6", "7", "8", "9"], correct: 2, explanation: "48 ÷ 6 = 8, since 8 × 6 = 48." },
          { q: "What is 63 ÷ 9?", options: ["6", "7", "8", "9"], correct: 1, explanation: "63 ÷ 9 = 7, since 7 × 9 = 63." },
          { q: "What is 2 + 3 × 4?", options: ["20", "14", "24", "9"], correct: 1, explanation: "Multiplication happens before addition: 3 × 4 = 12, then 2 + 12 = 14." },
          { q: "What is (5 + 3) × 2?", options: ["11", "13", "16", "10"], correct: 2, explanation: "Parentheses first: 5 + 3 = 8, then 8 × 2 = 16." },
          { q: "What is 10 - 2 × 3?", options: ["24", "4", "8", "6"], correct: 1, explanation: "Multiplication first: 2 × 3 = 6, then 10 - 6 = 4." },
          { q: "Round 47 to the nearest ten.", options: ["40", "45", "50", "60"], correct: 2, explanation: "47 is closer to 50 than to 40, so it rounds to 50." },
          { q: "Round 123 to the nearest hundred.", options: ["100", "120", "130", "200"], correct: 0, explanation: "123 is closer to 100 than to 200, so it rounds to 100." },
          { q: "Estimate 38 + 52 by rounding each to the nearest ten first.", options: ["80", "90", "100", "70"], correct: 1, explanation: "38 rounds to 40, 52 rounds to 50, and 40 + 50 = 90." },
          { q: "What is 256 + 178?", options: ["424", "434", "444", "454"], correct: 1, explanation: "256 + 178 = 434. Adding ones: 6+8=14 (carry 1); tens: 5+7+1=13 (carry 1); hundreds: 2+1+1=4." },
          { q: "What is 500 - 237?", options: ["253", "263", "273", "283"], correct: 1, explanation: "500 - 237 = 263. Borrowing across the zeros: 500 becomes 4 hundreds, 9 tens, 10 ones; 10-7=3, 9-3=6, 4-2=2." },
          { q: "What is 348 + 265?", options: ["603", "613", "623", "633"], correct: 1, explanation: "348 + 265 = 613. Ones: 8+5=13 (carry 1); tens: 4+6+1=11 (carry 1); hundreds: 3+2+1=6." },
          { q: "What is 23 × 4?", options: ["82", "88", "92", "96"], correct: 2, explanation: "23 × 4 = 92. Break it up: 20×4=80, 3×4=12, and 80+12=92." },
          { q: "What is 15 × 12?", options: ["160", "170", "180", "190"], correct: 2, explanation: "15 × 12 = 180. Break it up: 15×10=150, 15×2=30, and 150+30=180." },
          { q: "What is 32 × 5?", options: ["150", "155", "160", "165"], correct: 2, explanation: "32 × 5 = 160. Break it up: 30×5=150, 2×5=10, and 150+10=160." },
          { q: "Maria has 24 stickers. She gives 9 to her friend. How many does she have left?", options: ["13", "14", "15", "16"], correct: 2, explanation: "24 - 9 = 15 stickers remain." },
          { q: "A box holds 6 apples. How many apples are in 8 boxes?", options: ["42", "44", "46", "48"], correct: 3, explanation: "6 apples × 8 boxes = 48 apples." },
          { q: "There are 35 students split evenly into 5 groups. How many students are in each group?", options: ["5", "6", "7", "8"], correct: 2, explanation: "35 ÷ 5 = 7 students per group." }
        ]
      }
    ]
  },
  {
    name: "Fractions & Percentages",
    lessons: [
      {
        name: "Understanding Fractions",
  questions: [
    { q: "In the fraction 3/5, what does the 5 represent?", options: ["The number of parts you have", "The total number of equal parts", "The whole number", "The remainder"], correct: 1, explanation: "The bottom number (denominator) shows how many equal parts the whole is divided into; the top number (numerator) shows how many of those parts you have." },
    { q: "Which fraction represents 'half' of something?", options: ["1/3", "1/2", "2/1", "1/4"], correct: 1, explanation: "1/2 means 1 part out of 2 equal parts — exactly half." },
    { q: "A pizza is cut into 8 equal slices. If you eat 3 slices, what fraction of the pizza did you eat?", options: ["3/5", "5/8", "3/8", "8/3"], correct: 2, explanation: "You ate 3 out of 8 total slices, which is written as 3/8." }
  ]
},
      {
        name: "Equivalent Fractions",
  questions: [
    { q: "Which fraction is equivalent to 1/2?", options: ["2/3", "3/4", "2/4", "1/4"], correct: 2, explanation: "Multiplying both the top and bottom of 1/2 by 2 gives 2/4 — the same value, different form." },
    { q: "Which fraction is equivalent to 2/3?", options: ["4/6", "3/4", "4/5", "2/6"], correct: 0, explanation: "Multiplying both parts of 2/3 by 2 gives 4/6, an equivalent fraction." },
    { q: "Simplify 6/8 to its lowest terms.", options: ["2/3", "3/4", "4/5", "5/6"], correct: 1, explanation: "Both 6 and 8 can be divided by 2, giving 3/4 — the simplest form." }
  ]
},
      {
        name: "Adding & Subtracting Fractions (Same Denominator)",
  questions: [
    { q: "What is 1/4 + 2/4?", options: ["2/4", "3/4", "3/8", "1/2"], correct: 1, explanation: "When denominators match, just add the numerators: 1+2=3, giving 3/4." },
    { q: "What is 3/4 - 1/4?", options: ["1/4", "2/4", "1/2", "4/4"], correct: 2, explanation: "3-1=2, giving 2/4, which simplifies to 1/2." },
    { q: "What is 2/5 + 1/5?", options: ["3/5", "3/10", "1/5", "2/10"], correct: 0, explanation: "The denominators already match, so just add the numerators: 2+1=3, giving 3/5." }
  ]
},
      {
        name: "Adding & Subtracting Fractions (Different Denominators)",
  questions: [
    { q: "What is 1/2 + 1/4?", options: ["2/6", "2/4", "3/4", "1/6"], correct: 2, explanation: "Convert 1/2 to 2/4 (same denominator), then 2/4 + 1/4 = 3/4." },
    { q: "What is 1/3 + 1/6?", options: ["1/2", "2/9", "2/6", "1/9"], correct: 0, explanation: "Convert 1/3 to 2/6, then 2/6 + 1/6 = 3/6, which simplifies to 1/2." },
    { q: "What is 3/4 - 1/2?", options: ["1/4", "2/4", "1/2", "2/2"], correct: 0, explanation: "Convert 1/2 to 2/4, then 3/4 - 2/4 = 1/4." }
  ]
},
      {
        name: "Multiplying Fractions",
  questions: [
    { q: "What is 1/2 × 1/3?", options: ["1/6", "1/5", "2/3", "1/3"], correct: 0, explanation: "Multiply numerators (1×1=1) and denominators (2×3=6), giving 1/6." },
    { q: "What is 2/3 × 3/4?", options: ["5/7", "6/12", "1/2", "6/7"], correct: 2, explanation: "2×3=6 and 3×4=12, giving 6/12, which simplifies to 1/2." },
    { q: "What is 1/4 × 2/5?", options: ["2/20", "3/9", "1/10", "2/9"], correct: 2, explanation: "1×2=2 and 4×5=20, giving 2/20, which simplifies to 1/10." }
  ]
},
      {
        name: "Converting Fractions to Decimals",
  questions: [
    { q: "What is 1/2 as a decimal?", options: ["0.2", "0.25", "0.5", "0.125"], correct: 2, explanation: "1 divided by 2 equals 0.5." },
    { q: "What is 3/4 as a decimal?", options: ["0.34", "0.75", "0.43", "0.25"], correct: 1, explanation: "3 divided by 4 equals 0.75." },
    { q: "What is 1/4 as a decimal?", options: ["0.4", "0.14", "0.25", "0.41"], correct: 2, explanation: "1 divided by 4 equals 0.25." }
  ]
},
      {
        name: "Understanding Percentages",
  questions: [
    { q: "What does 'percent' mean?", options: ["Per ten", "Per hundred", "Per thousand", "Per one"], correct: 1, explanation: "'Percent' comes from Latin for 'per hundred' — a percentage is a fraction out of 100." },
    { q: "What fraction is equivalent to 50%?", options: ["1/5", "1/2", "1/4", "1/10"], correct: 1, explanation: "50% means 50 out of 100, which simplifies to 1/2." },
    { q: "What is 100% of any number?", options: ["Half the number", "Double the number", "The number itself", "Zero"], correct: 2, explanation: "100% represents the whole amount — 100 out of 100 parts, or the entire number." }
  ]
},
      {
        name: "Calculating Percentages of a Number",
  questions: [
    { q: "What is 15% of 200?", options: ["20", "25", "30", "35"], correct: 2, explanation: "15% of 200 = 0.15 × 200 = 30." },
    { q: "What is 25% of 80?", options: ["15", "20", "25", "30"], correct: 1, explanation: "25% of 80 = 0.25 × 80 = 20." },
    { q: "What is 20% of 150?", options: ["25", "30", "35", "40"], correct: 1, explanation: "20% of 150 = 0.20 × 150 = 30." }
  ]
},
      {
        name: "Percentage Increase & Decrease",
  questions: [
    { q: "A $50 item goes up by 10%. What is the new price?", options: ["$52", "$55", "$60", "$45"], correct: 1, explanation: "10% of $50 is $5, so the new price is $50 + $5 = $55." },
    { q: "A $40 item is discounted by 25%. What is the new price?", options: ["$30", "$32", "$35", "$28"], correct: 0, explanation: "25% of $40 is $10, so the discounted price is $40 - $10 = $30." },
    { q: "A population of 200 grows by 15%. What is the new population?", options: ["215", "220", "225", "230"], correct: 3, explanation: "15% of 200 is 30, so the new population is 200 + 30 = 230." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "In the fraction 3/5, what does the 5 represent?", options: ["The number of parts you have", "The total number of equal parts", "The whole number", "The remainder"], correct: 1, explanation: "The bottom number (denominator) shows how many equal parts the whole is divided into; the top number (numerator) shows how many of those parts you have." },
          { q: "Which fraction represents 'half' of something?", options: ["1/3", "1/2", "2/1", "1/4"], correct: 1, explanation: "1/2 means 1 part out of 2 equal parts — exactly half." },
          { q: "A pizza is cut into 8 equal slices. If you eat 3 slices, what fraction of the pizza did you eat?", options: ["3/5", "5/8", "3/8", "8/3"], correct: 2, explanation: "You ate 3 out of 8 total slices, which is written as 3/8." },
          { q: "Which fraction is equivalent to 1/2?", options: ["2/3", "3/4", "2/4", "1/4"], correct: 2, explanation: "Multiplying both the top and bottom of 1/2 by 2 gives 2/4 — the same value, different form." },
          { q: "Which fraction is equivalent to 2/3?", options: ["4/6", "3/4", "4/5", "2/6"], correct: 0, explanation: "Multiplying both parts of 2/3 by 2 gives 4/6, an equivalent fraction." },
          { q: "Simplify 6/8 to its lowest terms.", options: ["2/3", "3/4", "4/5", "5/6"], correct: 1, explanation: "Both 6 and 8 can be divided by 2, giving 3/4 — the simplest form." },
          { q: "What is 1/4 + 2/4?", options: ["2/4", "3/4", "3/8", "1/2"], correct: 1, explanation: "When denominators match, just add the numerators: 1+2=3, giving 3/4." },
          { q: "What is 3/4 - 1/4?", options: ["1/4", "2/4", "1/2", "4/4"], correct: 2, explanation: "3-1=2, giving 2/4, which simplifies to 1/2." },
          { q: "What is 2/5 + 1/5?", options: ["3/5", "3/10", "1/5", "2/10"], correct: 0, explanation: "The denominators already match, so just add the numerators: 2+1=3, giving 3/5." },
          { q: "What is 1/2 + 1/4?", options: ["2/6", "2/4", "3/4", "1/6"], correct: 2, explanation: "Convert 1/2 to 2/4 (same denominator), then 2/4 + 1/4 = 3/4." },
          { q: "What is 1/3 + 1/6?", options: ["1/2", "2/9", "2/6", "1/9"], correct: 0, explanation: "Convert 1/3 to 2/6, then 2/6 + 1/6 = 3/6, which simplifies to 1/2." },
          { q: "What is 3/4 - 1/2?", options: ["1/4", "2/4", "1/2", "2/2"], correct: 0, explanation: "Convert 1/2 to 2/4, then 3/4 - 2/4 = 1/4." },
          { q: "What is 1/2 × 1/3?", options: ["1/6", "1/5", "2/3", "1/3"], correct: 0, explanation: "Multiply numerators (1×1=1) and denominators (2×3=6), giving 1/6." },
          { q: "What is 2/3 × 3/4?", options: ["5/7", "6/12", "1/2", "6/7"], correct: 2, explanation: "2×3=6 and 3×4=12, giving 6/12, which simplifies to 1/2." },
          { q: "What is 1/4 × 2/5?", options: ["2/20", "3/9", "1/10", "2/9"], correct: 2, explanation: "1×2=2 and 4×5=20, giving 2/20, which simplifies to 1/10." },
          { q: "What is 1/2 as a decimal?", options: ["0.2", "0.25", "0.5", "0.125"], correct: 2, explanation: "1 divided by 2 equals 0.5." },
          { q: "What is 3/4 as a decimal?", options: ["0.34", "0.75", "0.43", "0.25"], correct: 1, explanation: "3 divided by 4 equals 0.75." },
          { q: "What is 1/4 as a decimal?", options: ["0.4", "0.14", "0.25", "0.41"], correct: 2, explanation: "1 divided by 4 equals 0.25." },
          { q: "What does 'percent' mean?", options: ["Per ten", "Per hundred", "Per thousand", "Per one"], correct: 1, explanation: "'Percent' comes from Latin for 'per hundred' — a percentage is a fraction out of 100." },
          { q: "What fraction is equivalent to 50%?", options: ["1/5", "1/2", "1/4", "1/10"], correct: 1, explanation: "50% means 50 out of 100, which simplifies to 1/2." },
          { q: "What is 100% of any number?", options: ["Half the number", "Double the number", "The number itself", "Zero"], correct: 2, explanation: "100% represents the whole amount — 100 out of 100 parts, or the entire number." },
          { q: "What is 15% of 200?", options: ["20", "25", "30", "35"], correct: 2, explanation: "15% of 200 = 0.15 × 200 = 30." },
          { q: "What is 25% of 80?", options: ["15", "20", "25", "30"], correct: 1, explanation: "25% of 80 = 0.25 × 80 = 20." },
          { q: "What is 20% of 150?", options: ["25", "30", "35", "40"], correct: 1, explanation: "20% of 150 = 0.20 × 150 = 30." },
          { q: "A $50 item goes up by 10%. What is the new price?", options: ["$52", "$55", "$60", "$45"], correct: 1, explanation: "10% of $50 is $5, so the new price is $50 + $5 = $55." },
          { q: "A $40 item is discounted by 25%. What is the new price?", options: ["$30", "$32", "$35", "$28"], correct: 0, explanation: "25% of $40 is $10, so the discounted price is $40 - $10 = $30." },
          { q: "A population of 200 grows by 15%. What is the new population?", options: ["215", "220", "225", "230"], correct: 3, explanation: "15% of 200 is 30, so the new population is 200 + 30 = 230." }
        ]
      }
    ]
  },
  {
    name: "Decimals & Estimation",
    lessons: [
      {
        name: "Understanding Decimal Place Value",
  questions: [
    { q: "In the number 45.278, what digit is in the hundredths place?", options: ["2", "7", "8", "4"], correct: 1, explanation: "After the decimal point, the places are tenths, hundredths, thousandths — so 7 is in the hundredths place." },
    { q: "Which number is larger: 0.5 or 0.45?", options: ["0.45", "0.5", "They are equal", "Cannot tell"], correct: 1, explanation: "0.5 equals 0.50, and 0.50 is larger than 0.45." },
    { q: "What is 3.4 written as a fraction with denominator 10?", options: ["34/10", "3/10", "4/10", "3.4/10"], correct: 0, explanation: "3.4 means 3 and 4 tenths, which as an improper fraction is 34/10." }
  ]
},
      {
        name: "Adding Decimals",
  questions: [
    { q: "What is 4.25 + 3.7?", options: ["7.85", "7.95", "8.05", "6.95"], correct: 1, explanation: "Line up decimal points: 4.25 + 3.70 = 7.95." },
    { q: "What is 12.6 + 8.45?", options: ["20.05", "21.05", "21.15", "20.95"], correct: 1, explanation: "Line up decimal points: 12.60 + 8.45 = 21.05." },
    { q: "What is 0.75 + 0.5?", options: ["1.15", "1.20", "1.25", "1.30"], correct: 2, explanation: "0.75 + 0.50 = 1.25." }
  ]
},
      {
        name: "Subtracting Decimals",
  questions: [
    { q: "What is 8.5 - 3.25?", options: ["5.15", "5.25", "5.35", "4.25"], correct: 1, explanation: "8.50 - 3.25 = 5.25." },
    { q: "What is 10 - 4.6?", options: ["5.4", "5.6", "6.4", "4.6"], correct: 0, explanation: "10.0 - 4.6 = 5.4." },
    { q: "What is 6.75 - 2.5?", options: ["4.15", "4.25", "4.35", "3.25"], correct: 1, explanation: "6.75 - 2.50 = 4.25." }
  ]
},
      {
        name: "Multiplying Decimals",
  questions: [
    { q: "What is 2.5 × 4?", options: ["8", "9", "10", "11"], correct: 2, explanation: "2.5 × 4 = 10." },
    { q: "What is 0.6 × 0.3?", options: ["0.09", "0.18", "1.8", "0.8"], correct: 1, explanation: "6 × 3 = 18, and since there are 2 total decimal places in the problem, the answer is 0.18." },
    { q: "What is 1.5 × 2.2?", options: ["3.0", "3.2", "3.3", "3.5"], correct: 2, explanation: "15 × 22 = 330, and with 2 total decimal places, the answer is 3.30, or 3.3." }
  ]
},
      {
        name: "Dividing Decimals",
  questions: [
    { q: "What is 6.4 ÷ 2?", options: ["3.0", "3.2", "3.4", "2.8"], correct: 1, explanation: "6.4 ÷ 2 = 3.2." },
    { q: "What is 9 ÷ 0.5?", options: ["4.5", "9", "18", "45"], correct: 2, explanation: "Dividing by 0.5 is the same as multiplying by 2: 9 × 2 = 18." },
    { q: "What is 3.6 ÷ 4?", options: ["0.8", "0.85", "0.9", "0.95"], correct: 2, explanation: "3.6 ÷ 4 = 0.9." }
  ]
},
      {
        name: "Rounding Decimals",
  questions: [
    { q: "Round 7.36 to the nearest tenth.", options: ["7.3", "7.4", "7.35", "7.5"], correct: 1, explanation: "The digit after the tenths place is 6, which rounds the 3 up to 4, giving 7.4." },
    { q: "Round 2.847 to the nearest hundredth.", options: ["2.84", "2.85", "2.83", "2.86"], correct: 1, explanation: "The digit after the hundredths place is 7, which rounds the 4 up to 5, giving 2.85." },
    { q: "Round 15.5 to the nearest whole number.", options: ["15", "16", "15.5", "14"], correct: 1, explanation: "15.5 rounds up to 16, since .5 always rounds up." }
  ]
},
      {
        name: "Converting Decimals to Fractions",
  questions: [
    { q: "What is 0.25 as a fraction in simplest form?", options: ["1/4", "1/5", "1/2", "2/5"], correct: 0, explanation: "0.25 = 25/100, which simplifies to 1/4." },
    { q: "What is 0.6 as a fraction in simplest form?", options: ["6/10", "3/5", "2/3", "1/6"], correct: 1, explanation: "0.6 = 6/10, which simplifies to 3/5." },
    { q: "What is 0.75 as a fraction in simplest form?", options: ["7/10", "3/4", "75/10", "1/4"], correct: 1, explanation: "0.75 = 75/100, which simplifies to 3/4." }
  ]
},
      {
        name: "Estimation Strategies",
  questions: [
    { q: "Estimate 4.9 × 3.1 by rounding each to the nearest whole number.", options: ["12", "15", "18", "20"], correct: 1, explanation: "4.9 rounds to 5, 3.1 rounds to 3, and 5 × 3 = 15." },
    { q: "Estimate 22.8 + 19.3 by rounding each to the nearest ten.", options: ["30", "40", "50", "60"], correct: 1, explanation: "22.8 rounds to 20, 19.3 rounds to 20, and 20 + 20 = 40." },
    { q: "Which is the best estimate for 48.7 ÷ 5.2?", options: ["6", "8", "10", "12"], correct: 2, explanation: "48.7 is close to 50, and 5.2 is close to 5; 50 ÷ 5 = 10." }
  ]
},
      {
        name: "Decimal Word Problems",
  questions: [
    { q: "A sandwich costs $4.75 and a drink costs $1.50. What is the total cost?", options: ["$5.75", "$6.00", "$6.25", "$6.50"], correct: 2, explanation: "$4.75 + $1.50 = $6.25." },
    { q: "You have $20 and spend $12.35. How much money is left?", options: ["$7.65", "$7.75", "$8.65", "$7.35"], correct: 0, explanation: "$20.00 - $12.35 = $7.65." },
    { q: "A recipe needs 2.5 cups of flour, and you want to make 3 batches. How much flour is needed total?", options: ["6.5 cups", "7 cups", "7.5 cups", "8 cups"], correct: 2, explanation: "2.5 × 3 = 7.5 cups." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "In the number 45.278, what digit is in the hundredths place?", options: ["2", "7", "8", "4"], correct: 1, explanation: "After the decimal point, the places are tenths, hundredths, thousandths — so 7 is in the hundredths place." },
          { q: "Which number is larger: 0.5 or 0.45?", options: ["0.45", "0.5", "They are equal", "Cannot tell"], correct: 1, explanation: "0.5 equals 0.50, and 0.50 is larger than 0.45." },
          { q: "What is 3.4 written as a fraction with denominator 10?", options: ["34/10", "3/10", "4/10", "3.4/10"], correct: 0, explanation: "3.4 means 3 and 4 tenths, which as an improper fraction is 34/10." },
          { q: "What is 4.25 + 3.7?", options: ["7.85", "7.95", "8.05", "6.95"], correct: 1, explanation: "Line up decimal points: 4.25 + 3.70 = 7.95." },
          { q: "What is 12.6 + 8.45?", options: ["20.05", "21.05", "21.15", "20.95"], correct: 1, explanation: "Line up decimal points: 12.60 + 8.45 = 21.05." },
          { q: "What is 0.75 + 0.5?", options: ["1.15", "1.20", "1.25", "1.30"], correct: 2, explanation: "0.75 + 0.50 = 1.25." },
          { q: "What is 8.5 - 3.25?", options: ["5.15", "5.25", "5.35", "4.25"], correct: 1, explanation: "8.50 - 3.25 = 5.25." },
          { q: "What is 10 - 4.6?", options: ["5.4", "5.6", "6.4", "4.6"], correct: 0, explanation: "10.0 - 4.6 = 5.4." },
          { q: "What is 6.75 - 2.5?", options: ["4.15", "4.25", "4.35", "3.25"], correct: 1, explanation: "6.75 - 2.50 = 4.25." },
          { q: "What is 2.5 × 4?", options: ["8", "9", "10", "11"], correct: 2, explanation: "2.5 × 4 = 10." },
          { q: "What is 0.6 × 0.3?", options: ["0.09", "0.18", "1.8", "0.8"], correct: 1, explanation: "6 × 3 = 18, and since there are 2 total decimal places in the problem, the answer is 0.18." },
          { q: "What is 1.5 × 2.2?", options: ["3.0", "3.2", "3.3", "3.5"], correct: 2, explanation: "15 × 22 = 330, and with 2 total decimal places, the answer is 3.30, or 3.3." },
          { q: "What is 6.4 ÷ 2?", options: ["3.0", "3.2", "3.4", "2.8"], correct: 1, explanation: "6.4 ÷ 2 = 3.2." },
          { q: "What is 9 ÷ 0.5?", options: ["4.5", "9", "18", "45"], correct: 2, explanation: "Dividing by 0.5 is the same as multiplying by 2: 9 × 2 = 18." },
          { q: "What is 3.6 ÷ 4?", options: ["0.8", "0.85", "0.9", "0.95"], correct: 2, explanation: "3.6 ÷ 4 = 0.9." },
          { q: "Round 7.36 to the nearest tenth.", options: ["7.3", "7.4", "7.35", "7.5"], correct: 1, explanation: "The digit after the tenths place is 6, which rounds the 3 up to 4, giving 7.4." },
          { q: "Round 2.847 to the nearest hundredth.", options: ["2.84", "2.85", "2.83", "2.86"], correct: 1, explanation: "The digit after the hundredths place is 7, which rounds the 4 up to 5, giving 2.85." },
          { q: "Round 15.5 to the nearest whole number.", options: ["15", "16", "15.5", "14"], correct: 1, explanation: "15.5 rounds up to 16, since .5 always rounds up." },
          { q: "What is 0.25 as a fraction in simplest form?", options: ["1/4", "1/5", "1/2", "2/5"], correct: 0, explanation: "0.25 = 25/100, which simplifies to 1/4." },
          { q: "What is 0.6 as a fraction in simplest form?", options: ["6/10", "3/5", "2/3", "1/6"], correct: 1, explanation: "0.6 = 6/10, which simplifies to 3/5." },
          { q: "What is 0.75 as a fraction in simplest form?", options: ["7/10", "3/4", "75/10", "1/4"], correct: 1, explanation: "0.75 = 75/100, which simplifies to 3/4." },
          { q: "Estimate 4.9 × 3.1 by rounding each to the nearest whole number.", options: ["12", "15", "18", "20"], correct: 1, explanation: "4.9 rounds to 5, 3.1 rounds to 3, and 5 × 3 = 15." },
          { q: "Estimate 22.8 + 19.3 by rounding each to the nearest ten.", options: ["30", "40", "50", "60"], correct: 1, explanation: "22.8 rounds to 20, 19.3 rounds to 20, and 20 + 20 = 40." },
          { q: "Which is the best estimate for 48.7 ÷ 5.2?", options: ["6", "8", "10", "12"], correct: 2, explanation: "48.7 is close to 50, and 5.2 is close to 5; 50 ÷ 5 = 10." },
          { q: "A sandwich costs $4.75 and a drink costs $1.50. What is the total cost?", options: ["$5.75", "$6.00", "$6.25", "$6.50"], correct: 2, explanation: "$4.75 + $1.50 = $6.25." },
          { q: "You have $20 and spend $12.35. How much money is left?", options: ["$7.65", "$7.75", "$8.65", "$7.35"], correct: 0, explanation: "$20.00 - $12.35 = $7.65." },
          { q: "A recipe needs 2.5 cups of flour, and you want to make 3 batches. How much flour is needed total?", options: ["6.5 cups", "7 cups", "7.5 cups", "8 cups"], correct: 2, explanation: "2.5 × 3 = 7.5 cups." }
        ]
      }
    ]
  },
  {
    name: "Number Theory",
    lessons: [
      {
        name: "Prime and Composite Numbers",
  questions: [
    { q: "What is a prime number?", options: ["A number divisible by 2", "A number with exactly two factors: 1 and itself", "Any odd number", "A number greater than 10"], correct: 1, explanation: "A prime number has exactly two factors: 1 and itself. For example, 7 is only divisible by 1 and 7." },
    { q: "Which of these is a composite number?", options: ["7", "11", "12", "13"], correct: 2, explanation: "12 has factors 1, 2, 3, 4, 6, 12 — more than two — making it composite. The others are prime." },
    { q: "Is 1 a prime number?", options: ["Yes, because it's only divisible by 1", "No, because it has only one factor, not two", "Yes, because it's odd", "No, because it's even"], correct: 1, explanation: "By definition, a prime number needs exactly two different factors. The number 1 has only one factor (itself), so it is neither prime nor composite." }
  ]
},
      {
        name: "Factors of a Number",
  questions: [
    { q: "What are all the factors of 12?", options: ["1, 2, 3, 4, 6, 12", "1, 2, 4, 12", "2, 3, 4, 6", "1, 3, 6, 12"], correct: 0, explanation: "12 = 1×12, 2×6, 3×4, so its factors are 1, 2, 3, 4, 6, 12." },
    { q: "Which number is a factor of 18?", options: ["4", "5", "6", "7"], correct: 2, explanation: "18 ÷ 6 = 3 exactly, so 6 is a factor of 18." },
    { q: "How many factors does 7 have?", options: ["1", "2", "3", "4"], correct: 1, explanation: "7 only has two factors: 1 and 7, since it's a prime number." }
  ]
},
      {
        name: "Multiples of a Number",
  questions: [
    { q: "What are the first four multiples of 5?", options: ["5, 10, 15, 20", "1, 5, 10, 15", "5, 15, 25, 35", "0, 5, 10, 15"], correct: 0, explanation: "Multiples of 5 are found by multiplying 5 by 1, 2, 3, 4: giving 5, 10, 15, 20." },
    { q: "Which of these is a multiple of 7?", options: ["27", "30", "35", "40"], correct: 2, explanation: "35 ÷ 7 = 5 exactly, so 35 is a multiple of 7." },
    { q: "Is 24 a multiple of 6?", options: ["Yes, because 24 ÷ 6 = 4 exactly", "No, because 6 is even", "Yes, because 24 is even", "No, because 24 is not divisible by 6"], correct: 0, explanation: "24 ÷ 6 = 4 with no remainder, so 24 is indeed a multiple of 6." }
  ]
},
      {
        name: "Greatest Common Factor (GCF)",
  questions: [
    { q: "What is the GCF of 12 and 18?", options: ["3", "6", "9", "12"], correct: 1, explanation: "Factors of 12: 1,2,3,4,6,12. Factors of 18: 1,2,3,6,9,18. The largest shared factor is 6." },
    { q: "What is the GCF of 8 and 20?", options: ["2", "4", "5", "8"], correct: 1, explanation: "Factors of 8: 1,2,4,8. Factors of 20: 1,2,4,5,10,20. The largest shared factor is 4." },
    { q: "What is the GCF of 15 and 25?", options: ["3", "5", "10", "15"], correct: 1, explanation: "Factors of 15: 1,3,5,15. Factors of 25: 1,5,25. The largest shared factor is 5." }
  ]
},
      {
        name: "Least Common Multiple (LCM)",
  questions: [
    { q: "What is the LCM of 4 and 6?", options: ["8", "10", "12", "24"], correct: 2, explanation: "Multiples of 4: 4,8,12,16. Multiples of 6: 6,12,18. The smallest shared multiple is 12." },
    { q: "What is the LCM of 3 and 5?", options: ["8", "10", "15", "20"], correct: 2, explanation: "Multiples of 3: 3,6,9,12,15. Multiples of 5: 5,10,15. The smallest shared multiple is 15." },
    { q: "What is the LCM of 6 and 8?", options: ["16", "24", "36", "48"], correct: 1, explanation: "Multiples of 6: 6,12,18,24. Multiples of 8: 8,16,24. The smallest shared multiple is 24." }
  ]
},
      {
        name: "Prime Factorization",
  questions: [
    { q: "What is 15 written as a product of its prime factors?", options: ["1 × 15", "3 × 5", "5 × 5", "3 × 3 × 5"], correct: 1, explanation: "15 = 3 × 5, and both 3 and 5 are prime numbers." },
    { q: "What is the prime factorization of 12?", options: ["2 × 6", "3 × 4", "2 × 2 × 3", "2 × 3 × 3"], correct: 2, explanation: "12 = 2 × 2 × 3, breaking it down until only prime numbers remain." },
    { q: "What is the prime factorization of 20?", options: ["2 × 10", "2 × 2 × 5", "4 × 5", "2 × 2 × 2 × 5"], correct: 1, explanation: "20 = 2 × 2 × 5, breaking it down until only prime numbers remain." }
  ]
},
      {
        name: "Divisibility Rules",
  questions: [
    { q: "How can you tell if a number is divisible by 3?", options: ["It ends in 0 or 5", "The sum of its digits is divisible by 3", "It is an even number", "It ends in 3"], correct: 1, explanation: "A number is divisible by 3 if the sum of its digits is divisible by 3. For example, 123: 1+2+3=6, and 6 is divisible by 3." },
    { q: "Is 456 divisible by 3?", options: ["Yes, because 4+5+6=15, which is divisible by 3", "No, because it's even", "Yes, because it ends in 6", "No, because 456 is too large"], correct: 0, explanation: "4+5+6=15, and 15 is divisible by 3, so 456 is divisible by 3." },
    { q: "Which rule tells you a number is divisible by 5?", options: ["It is even", "It ends in 0 or 5", "The digits add up to 5", "It is divisible by 10"], correct: 1, explanation: "Any number ending in 0 or 5 is divisible by 5." }
  ]
},
      {
        name: "Perfect Squares",
  questions: [
    { q: "What is a perfect square?", options: ["A number multiplied by 4", "A number that is the product of an integer multiplied by itself", "Any even number", "A number with 4 sides"], correct: 1, explanation: "A perfect square is the result of multiplying a whole number by itself, like 3×3=9." },
    { q: "Which of these is a perfect square?", options: ["18", "20", "25", "30"], correct: 2, explanation: "25 = 5×5, making it a perfect square. The others are not." },
    { q: "What is the square root of 49?", options: ["6", "7", "8", "9"], correct: 1, explanation: "7 × 7 = 49, so the square root of 49 is 7." }
  ]
},
      {
        name: "Number Theory Word Problems",
  questions: [
    { q: "Two friends want to split 24 candies and 36 stickers into identical bags with no leftovers, using the largest number of bags possible. How many bags can they make?", options: ["6", "8", "12", "18"], correct: 2, explanation: "The GCF of 24 and 36 is 12, so they can make 12 identical bags." },
    { q: "Two buses leave a station — one every 4 minutes, one every 6 minutes. If they both just left together, in how many minutes will they leave together again?", options: ["8 minutes", "10 minutes", "12 minutes", "24 minutes"], correct: 2, explanation: "The LCM of 4 and 6 is 12, so they'll next leave together in 12 minutes." },
    { q: "A gardener wants to plant 18 tomato plants in equal rows with no leftovers. Which of these is NOT a possible number of rows?", options: ["2", "3", "5", "6"], correct: 2, explanation: "18's factors are 1,2,3,6,9,18 — 5 is not among them, so 5 equal rows isn't possible." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What is a prime number?", options: ["A number divisible by 2", "A number with exactly two factors: 1 and itself", "Any odd number", "A number greater than 10"], correct: 1, explanation: "A prime number has exactly two factors: 1 and itself. For example, 7 is only divisible by 1 and 7." },
          { q: "Which of these is a composite number?", options: ["7", "11", "12", "13"], correct: 2, explanation: "12 has factors 1, 2, 3, 4, 6, 12 — more than two — making it composite. The others are prime." },
          { q: "Is 1 a prime number?", options: ["Yes, because it's only divisible by 1", "No, because it has only one factor, not two", "Yes, because it's odd", "No, because it's even"], correct: 1, explanation: "By definition, a prime number needs exactly two different factors. The number 1 has only one factor (itself), so it is neither prime nor composite." },
          { q: "What are all the factors of 12?", options: ["1, 2, 3, 4, 6, 12", "1, 2, 4, 12", "2, 3, 4, 6", "1, 3, 6, 12"], correct: 0, explanation: "12 = 1×12, 2×6, 3×4, so its factors are 1, 2, 3, 4, 6, 12." },
          { q: "Which number is a factor of 18?", options: ["4", "5", "6", "7"], correct: 2, explanation: "18 ÷ 6 = 3 exactly, so 6 is a factor of 18." },
          { q: "How many factors does 7 have?", options: ["1", "2", "3", "4"], correct: 1, explanation: "7 only has two factors: 1 and 7, since it's a prime number." },
          { q: "What are the first four multiples of 5?", options: ["5, 10, 15, 20", "1, 5, 10, 15", "5, 15, 25, 35", "0, 5, 10, 15"], correct: 0, explanation: "Multiples of 5 are found by multiplying 5 by 1, 2, 3, 4: giving 5, 10, 15, 20." },
          { q: "Which of these is a multiple of 7?", options: ["27", "30", "35", "40"], correct: 2, explanation: "35 ÷ 7 = 5 exactly, so 35 is a multiple of 7." },
          { q: "Is 24 a multiple of 6?", options: ["Yes, because 24 ÷ 6 = 4 exactly", "No, because 6 is even", "Yes, because 24 is even", "No, because 24 is not divisible by 6"], correct: 0, explanation: "24 ÷ 6 = 4 with no remainder, so 24 is indeed a multiple of 6." },
          { q: "What is the GCF of 12 and 18?", options: ["3", "6", "9", "12"], correct: 1, explanation: "Factors of 12: 1,2,3,4,6,12. Factors of 18: 1,2,3,6,9,18. The largest shared factor is 6." },
          { q: "What is the GCF of 8 and 20?", options: ["2", "4", "5", "8"], correct: 1, explanation: "Factors of 8: 1,2,4,8. Factors of 20: 1,2,4,5,10,20. The largest shared factor is 4." },
          { q: "What is the GCF of 15 and 25?", options: ["3", "5", "10", "15"], correct: 1, explanation: "Factors of 15: 1,3,5,15. Factors of 25: 1,5,25. The largest shared factor is 5." },
          { q: "What is the LCM of 4 and 6?", options: ["8", "10", "12", "24"], correct: 2, explanation: "Multiples of 4: 4,8,12,16. Multiples of 6: 6,12,18. The smallest shared multiple is 12." },
          { q: "What is the LCM of 3 and 5?", options: ["8", "10", "15", "20"], correct: 2, explanation: "Multiples of 3: 3,6,9,12,15. Multiples of 5: 5,10,15. The smallest shared multiple is 15." },
          { q: "What is the LCM of 6 and 8?", options: ["16", "24", "36", "48"], correct: 1, explanation: "Multiples of 6: 6,12,18,24. Multiples of 8: 8,16,24. The smallest shared multiple is 24." },
          { q: "What is 15 written as a product of its prime factors?", options: ["1 × 15", "3 × 5", "5 × 5", "3 × 3 × 5"], correct: 1, explanation: "15 = 3 × 5, and both 3 and 5 are prime numbers." },
          { q: "What is the prime factorization of 12?", options: ["2 × 6", "3 × 4", "2 × 2 × 3", "2 × 3 × 3"], correct: 2, explanation: "12 = 2 × 2 × 3, breaking it down until only prime numbers remain." },
          { q: "What is the prime factorization of 20?", options: ["2 × 10", "2 × 2 × 5", "4 × 5", "2 × 2 × 2 × 5"], correct: 1, explanation: "20 = 2 × 2 × 5, breaking it down until only prime numbers remain." },
          { q: "How can you tell if a number is divisible by 3?", options: ["It ends in 0 or 5", "The sum of its digits is divisible by 3", "It is an even number", "It ends in 3"], correct: 1, explanation: "A number is divisible by 3 if the sum of its digits is divisible by 3. For example, 123: 1+2+3=6, and 6 is divisible by 3." },
          { q: "Is 456 divisible by 3?", options: ["Yes, because 4+5+6=15, which is divisible by 3", "No, because it's even", "Yes, because it ends in 6", "No, because 456 is too large"], correct: 0, explanation: "4+5+6=15, and 15 is divisible by 3, so 456 is divisible by 3." },
          { q: "Which rule tells you a number is divisible by 5?", options: ["It is even", "It ends in 0 or 5", "The digits add up to 5", "It is divisible by 10"], correct: 1, explanation: "Any number ending in 0 or 5 is divisible by 5." },
          { q: "What is a perfect square?", options: ["A number multiplied by 4", "A number that is the product of an integer multiplied by itself", "Any even number", "A number with 4 sides"], correct: 1, explanation: "A perfect square is the result of multiplying a whole number by itself, like 3×3=9." },
          { q: "Which of these is a perfect square?", options: ["18", "20", "25", "30"], correct: 2, explanation: "25 = 5×5, making it a perfect square. The others are not." },
          { q: "What is the square root of 49?", options: ["6", "7", "8", "9"], correct: 1, explanation: "7 × 7 = 49, so the square root of 49 is 7." },
          { q: "Two friends want to split 24 candies and 36 stickers into identical bags with no leftovers, using the largest number of bags possible. How many bags can they make?", options: ["6", "8", "12", "18"], correct: 2, explanation: "The GCF of 24 and 36 is 12, so they can make 12 identical bags." },
          { q: "Two buses leave a station — one every 4 minutes, one every 6 minutes. If they both just left together, in how many minutes will they leave together again?", options: ["8 minutes", "10 minutes", "12 minutes", "24 minutes"], correct: 2, explanation: "The LCM of 4 and 6 is 12, so they'll next leave together in 12 minutes." },
          { q: "A gardener wants to plant 18 tomato plants in equal rows with no leftovers. Which of these is NOT a possible number of rows?", options: ["2", "3", "5", "6"], correct: 2, explanation: "18's factors are 1,2,3,6,9,18 — 5 is not among them, so 5 equal rows isn't possible." }
        ]
      }
    ]
  },
  {
    name: "Ratios & Proportions",
    lessons: [
      {
        name: "Understanding Ratios",
  questions: [
    { q: "What does a ratio compare?", options: ["Only whole numbers", "Two or more quantities", "Only fractions", "Percentages only"], correct: 1, explanation: "A ratio compares two or more quantities, showing their relative sizes." },
    { q: "In a classroom with 12 boys and 15 girls, what is the ratio of boys to girls?", options: ["15:12", "12:15", "12:27", "27:12"], correct: 1, explanation: "The ratio of boys to girls, in that order, is 12:15." },
    { q: "A ratio of 3:4 can also be written as which fraction?", options: ["3/4", "4/3", "3/7", "4/7"], correct: 0, explanation: "A ratio a:b can be written as the fraction a/b, so 3:4 becomes 3/4." }
  ]
},
      {
        name: "Simplifying Ratios",
  questions: [
    { q: "Simplify the ratio 10:15.", options: ["1:2", "2:3", "5:10", "3:2"], correct: 1, explanation: "Both numbers can be divided by 5: 10÷5=2, 15÷5=3, giving 2:3." },
    { q: "Simplify the ratio 8:12.", options: ["2:3", "4:6", "1:2", "3:4"], correct: 0, explanation: "Both numbers can be divided by 4: 8÷4=2, 12÷4=3, giving 2:3." },
    { q: "Simplify the ratio 20:25.", options: ["5:4", "4:5", "2:5", "5:2"], correct: 1, explanation: "Both numbers can be divided by 5: 20÷5=4, 25÷5=5, giving 4:5." }
  ]
},
      {
        name: "Unit Rates",
  questions: [
    { q: "A car travels 240 miles in 4 hours. What is its unit rate in miles per hour?", options: ["50 mph", "60 mph", "70 mph", "80 mph"], correct: 1, explanation: "240 miles ÷ 4 hours = 60 miles per hour." },
    { q: "If 5 notebooks cost $15, what is the unit price per notebook?", options: ["$2", "$3", "$4", "$5"], correct: 1, explanation: "$15 ÷ 5 notebooks = $3 per notebook." },
    { q: "A recipe uses 300 grams of flour for 6 servings. What is the unit rate of flour per serving?", options: ["40 grams", "45 grams", "50 grams", "60 grams"], correct: 2, explanation: "300 grams ÷ 6 servings = 50 grams per serving." }
  ]
},
      {
        name: "Solving Proportions",
  questions: [
    { q: "Solve for x: 3/4 = x/12", options: ["6", "8", "9", "10"], correct: 2, explanation: "Cross-multiply: 3×12 = 4×x, so 36 = 4x, giving x = 9." },
    { q: "Solve for x: 5/x = 10/6", options: ["2", "3", "4", "5"], correct: 1, explanation: "Cross-multiply: 5×6 = 10×x, so 30 = 10x, giving x = 3." },
    { q: "Solve for x: x/8 = 6/16", options: ["2", "3", "4", "5"], correct: 1, explanation: "Cross-multiply: 16×x = 8×6, so 16x = 48, giving x = 3." }
  ]
},
      {
        name: "Scale and Maps",
  questions: [
    { q: "A map has a scale of 1 inch = 50 miles. How many miles does 3.5 inches represent?", options: ["150 miles", "175 miles", "200 miles", "125 miles"], correct: 1, explanation: "3.5 × 50 = 175 miles." },
    { q: "A model car is built at a scale of 1:24. If the real car is 192 inches long, how long is the model?", options: ["6 inches", "8 inches", "10 inches", "12 inches"], correct: 1, explanation: "192 ÷ 24 = 8 inches." },
    { q: "On a map with scale 1 cm = 20 km, two cities are 6 cm apart. How far apart are they in real life?", options: ["100 km", "110 km", "120 km", "130 km"], correct: 2, explanation: "6 × 20 = 120 km." }
  ]
},
      {
        name: "Ratio Word Problems",
  questions: [
    { q: "A fruit basket has apples and oranges in a ratio of 2:3. If there are 10 apples, how many oranges are there?", options: ["12", "15", "18", "20"], correct: 1, explanation: "Since 2:3 = 10:x, cross-multiplying gives 2x = 30, so x = 15 oranges." },
    { q: "A paint mix uses blue and yellow in a ratio of 3:5. If you use 15 cups of blue, how many cups of yellow are needed?", options: ["20", "25", "30", "35"], correct: 1, explanation: "Since 3:5 = 15:x, cross-multiplying gives 3x = 75, so x = 25 cups." },
    { q: "In a class, the ratio of boys to total students is 2:5. If there are 30 students total, how many are boys?", options: ["10", "12", "14", "16"], correct: 1, explanation: "2/5 of 30 = 12 boys." }
  ]
},
      {
        name: "Proportional Relationships",
  questions: [
    { q: "If y is proportional to x and y=12 when x=4, what is y when x=10?", options: ["24", "26", "28", "30"], correct: 3, explanation: "The constant ratio is 12/4=3, so when x=10, y=3×10=30." },
    { q: "Which table shows a proportional relationship? Table A: (1,3),(2,6),(3,9). Table B: (1,3),(2,7),(3,9)", options: ["Table A", "Table B", "Both", "Neither"], correct: 0, explanation: "In Table A, y is always 3 times x (a constant ratio), which is the definition of a proportional relationship. Table B doesn't keep this pattern." },
    { q: "If 4 tickets cost $20 and the price is proportional to the number of tickets, how much do 7 tickets cost?", options: ["$30", "$32.50", "$35", "$37.50"], correct: 2, explanation: "The unit rate is $20÷4=$5 per ticket, so 7 tickets cost 7×$5=$35." }
  ]
},
      {
        name: "Comparing Ratios",
  questions: [
    { q: "Which ratio is equivalent to 2:3?", options: ["3:2", "4:5", "6:9", "5:6"], correct: 2, explanation: "6:9 simplifies to 2:3 (dividing both by 3), so they are equivalent." },
    { q: "Which is a larger ratio: 3:4 or 5:8?", options: ["3:4", "5:8", "They are equal", "Cannot compare"], correct: 0, explanation: "3/4=0.75 and 5/8=0.625, so 3:4 is the larger ratio." },
    { q: "Are the ratios 4:6 and 6:9 equivalent?", options: ["Yes, both simplify to 2:3", "No, they are different", "Yes, because both contain a 6", "No, only fractions can be equivalent"], correct: 0, explanation: "4:6 simplifies to 2:3, and 6:9 also simplifies to 2:3 — they are equivalent." }
  ]
},
      {
        name: "Rates and Speed",
  questions: [
    { q: "If you walk 12 miles in 3 hours, what is your speed?", options: ["3 mph", "4 mph", "5 mph", "6 mph"], correct: 1, explanation: "12 miles ÷ 3 hours = 4 miles per hour." },
    { q: "A train travels at 80 mph. How far does it go in 2.5 hours?", options: ["180 miles", "190 miles", "200 miles", "210 miles"], correct: 2, explanation: "80 × 2.5 = 200 miles." },
    { q: "If a runner covers 100 meters in 20 seconds, how many meters per second is that?", options: ["4", "5", "6", "7"], correct: 1, explanation: "100 ÷ 20 = 5 meters per second." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What does a ratio compare?", options: ["Only whole numbers", "Two or more quantities", "Only fractions", "Percentages only"], correct: 1, explanation: "A ratio compares two or more quantities, showing their relative sizes." },
          { q: "In a classroom with 12 boys and 15 girls, what is the ratio of boys to girls?", options: ["15:12", "12:15", "12:27", "27:12"], correct: 1, explanation: "The ratio of boys to girls, in that order, is 12:15." },
          { q: "A ratio of 3:4 can also be written as which fraction?", options: ["3/4", "4/3", "3/7", "4/7"], correct: 0, explanation: "A ratio a:b can be written as the fraction a/b, so 3:4 becomes 3/4." },
          { q: "Simplify the ratio 10:15.", options: ["1:2", "2:3", "5:10", "3:2"], correct: 1, explanation: "Both numbers can be divided by 5: 10÷5=2, 15÷5=3, giving 2:3." },
          { q: "Simplify the ratio 8:12.", options: ["2:3", "4:6", "1:2", "3:4"], correct: 0, explanation: "Both numbers can be divided by 4: 8÷4=2, 12÷4=3, giving 2:3." },
          { q: "Simplify the ratio 20:25.", options: ["5:4", "4:5", "2:5", "5:2"], correct: 1, explanation: "Both numbers can be divided by 5: 20÷5=4, 25÷5=5, giving 4:5." },
          { q: "A car travels 240 miles in 4 hours. What is its unit rate in miles per hour?", options: ["50 mph", "60 mph", "70 mph", "80 mph"], correct: 1, explanation: "240 miles ÷ 4 hours = 60 miles per hour." },
          { q: "If 5 notebooks cost $15, what is the unit price per notebook?", options: ["$2", "$3", "$4", "$5"], correct: 1, explanation: "$15 ÷ 5 notebooks = $3 per notebook." },
          { q: "A recipe uses 300 grams of flour for 6 servings. What is the unit rate of flour per serving?", options: ["40 grams", "45 grams", "50 grams", "60 grams"], correct: 2, explanation: "300 grams ÷ 6 servings = 50 grams per serving." },
          { q: "Solve for x: 3/4 = x/12", options: ["6", "8", "9", "10"], correct: 2, explanation: "Cross-multiply: 3×12 = 4×x, so 36 = 4x, giving x = 9." },
          { q: "Solve for x: 5/x = 10/6", options: ["2", "3", "4", "5"], correct: 1, explanation: "Cross-multiply: 5×6 = 10×x, so 30 = 10x, giving x = 3." },
          { q: "Solve for x: x/8 = 6/16", options: ["2", "3", "4", "5"], correct: 1, explanation: "Cross-multiply: 16×x = 8×6, so 16x = 48, giving x = 3." },
          { q: "A map has a scale of 1 inch = 50 miles. How many miles does 3.5 inches represent?", options: ["150 miles", "175 miles", "200 miles", "125 miles"], correct: 1, explanation: "3.5 × 50 = 175 miles." },
          { q: "A model car is built at a scale of 1:24. If the real car is 192 inches long, how long is the model?", options: ["6 inches", "8 inches", "10 inches", "12 inches"], correct: 1, explanation: "192 ÷ 24 = 8 inches." },
          { q: "On a map with scale 1 cm = 20 km, two cities are 6 cm apart. How far apart are they in real life?", options: ["100 km", "110 km", "120 km", "130 km"], correct: 2, explanation: "6 × 20 = 120 km." },
          { q: "A fruit basket has apples and oranges in a ratio of 2:3. If there are 10 apples, how many oranges are there?", options: ["12", "15", "18", "20"], correct: 1, explanation: "Since 2:3 = 10:x, cross-multiplying gives 2x = 30, so x = 15 oranges." },
          { q: "A paint mix uses blue and yellow in a ratio of 3:5. If you use 15 cups of blue, how many cups of yellow are needed?", options: ["20", "25", "30", "35"], correct: 1, explanation: "Since 3:5 = 15:x, cross-multiplying gives 3x = 75, so x = 25 cups." },
          { q: "In a class, the ratio of boys to total students is 2:5. If there are 30 students total, how many are boys?", options: ["10", "12", "14", "16"], correct: 1, explanation: "2/5 of 30 = 12 boys." },
          { q: "If y is proportional to x and y=12 when x=4, what is y when x=10?", options: ["24", "26", "28", "30"], correct: 3, explanation: "The constant ratio is 12/4=3, so when x=10, y=3×10=30." },
          { q: "Which table shows a proportional relationship? Table A: (1,3),(2,6),(3,9). Table B: (1,3),(2,7),(3,9)", options: ["Table A", "Table B", "Both", "Neither"], correct: 0, explanation: "In Table A, y is always 3 times x (a constant ratio), which is the definition of a proportional relationship. Table B doesn't keep this pattern." },
          { q: "If 4 tickets cost $20 and the price is proportional to the number of tickets, how much do 7 tickets cost?", options: ["$30", "$32.50", "$35", "$37.50"], correct: 2, explanation: "The unit rate is $20÷4=$5 per ticket, so 7 tickets cost 7×$5=$35." },
          { q: "Which ratio is equivalent to 2:3?", options: ["3:2", "4:5", "6:9", "5:6"], correct: 2, explanation: "6:9 simplifies to 2:3 (dividing both by 3), so they are equivalent." },
          { q: "Which is a larger ratio: 3:4 or 5:8?", options: ["3:4", "5:8", "They are equal", "Cannot compare"], correct: 0, explanation: "3/4=0.75 and 5/8=0.625, so 3:4 is the larger ratio." },
          { q: "Are the ratios 4:6 and 6:9 equivalent?", options: ["Yes, both simplify to 2:3", "No, they are different", "Yes, because both contain a 6", "No, only fractions can be equivalent"], correct: 0, explanation: "4:6 simplifies to 2:3, and 6:9 also simplifies to 2:3 — they are equivalent." },
          { q: "If you walk 12 miles in 3 hours, what is your speed?", options: ["3 mph", "4 mph", "5 mph", "6 mph"], correct: 1, explanation: "12 miles ÷ 3 hours = 4 miles per hour." },
          { q: "A train travels at 80 mph. How far does it go in 2.5 hours?", options: ["180 miles", "190 miles", "200 miles", "210 miles"], correct: 2, explanation: "80 × 2.5 = 200 miles." },
          { q: "If a runner covers 100 meters in 20 seconds, how many meters per second is that?", options: ["4", "5", "6", "7"], correct: 1, explanation: "100 ÷ 20 = 5 meters per second." }
        ]
      }
    ]
  },
  {
    name: "Introduction to Algebra",
    lessons: [
      {
        name: "Understanding Variables",
  questions: [
    { q: "What is a variable in algebra?", options: ["A fixed number that never changes", "A letter or symbol representing an unknown value", "Only the letter x", "A type of equation"], correct: 1, explanation: "A variable is a letter or symbol (like x, y, or n) used to represent a value that is unknown or can change." },
    { q: "In the expression 3x + 5, what is the variable?", options: ["3", "5", "x", "3x"], correct: 2, explanation: "x is the variable — the letter representing an unknown value. 3 and 5 are constants." },
    { q: "If x = 4, what is the value of x + 7?", options: ["9", "10", "11", "12"], correct: 2, explanation: "Substituting x = 4: 4 + 7 = 11." }
  ]
},
      {
        name: "One-Step Equations: Addition & Subtraction",
  questions: [
    { q: "Solve for x: x + 9 = 15", options: ["4", "5", "6", "7"], correct: 2, explanation: "Subtract 9 from both sides: x = 15 - 9 = 6." },
    { q: "Solve for y: y - 7 = 12", options: ["17", "18", "19", "20"], correct: 2, explanation: "Add 7 to both sides: y = 12 + 7 = 19." },
    { q: "Solve for x: x + 14 = 30", options: ["14", "15", "16", "17"], correct: 2, explanation: "Subtract 14 from both sides: x = 30 - 14 = 16." }
  ]
},
      {
        name: "One-Step Equations: Multiplication & Division",
  questions: [
    { q: "Solve for x: 4x = 28", options: ["5", "6", "7", "8"], correct: 2, explanation: "Divide both sides by 4: x = 28 ÷ 4 = 7." },
    { q: "Solve for y: y/5 = 6", options: ["25", "30", "35", "40"], correct: 1, explanation: "Multiply both sides by 5: y = 6 × 5 = 30." },
    { q: "Solve for x: 9x = 63", options: ["6", "7", "8", "9"], correct: 1, explanation: "Divide both sides by 9: x = 63 ÷ 9 = 7." }
  ]
},
      {
        name: "Two-Step Equations",
  questions: [
    { q: "Solve for x: 3x + 4 = 19", options: ["4", "5", "6", "7"], correct: 1, explanation: "Subtract 4 from both sides: 3x = 15. Divide by 3: x = 5." },
    { q: "Solve for y: 2y - 6 = 10", options: ["6", "7", "8", "9"], correct: 2, explanation: "Add 6 to both sides: 2y = 16. Divide by 2: y = 8." },
    { q: "Solve for x: 5x + 2 = 27", options: ["4", "5", "6", "7"], correct: 1, explanation: "Subtract 2 from both sides: 5x = 25. Divide by 5: x = 5." }
  ]
},
      {
        name: "Balance Scale Equations",
  questions: [
    { type: "balance", q: "Balance the scale: x + 4 = 10. Which weight for x makes it balance?", leftLabel: "x + 4", rightValue: 10, correct: 6, weights: [4,5,6,7,8], explanation: "To balance x + 4 = 10, x must equal 10 - 4 = 6." },
    { type: "balance", q: "Balance the scale: 2x = 14. Which weight for x makes it balance?", leftLabel: "2x", rightValue: 14, correct: 7, weights: [5,6,7,8,9], explanation: "To balance 2x = 14, divide both sides by 2: x = 7." },
    { type: "balance", q: "Balance the scale: x - 3 = 9. Which weight for x makes it balance?", leftLabel: "x - 3", rightValue: 9, correct: 12, weights: [10,11,12,13,14], explanation: "To balance x - 3 = 9, x must equal 9 + 3 = 12." }
  ]
},
      {
        name: "Writing Algebraic Expressions",
  questions: [
    { q: "Write an expression for 'a number x increased by 8'.", options: ["x - 8", "x + 8", "8x", "8 - x"], correct: 1, explanation: "'Increased by 8' means adding 8, giving the expression x + 8." },
    { q: "Write an expression for 'five times a number n'.", options: ["n + 5", "n - 5", "5n", "n/5"], correct: 2, explanation: "'Five times a number' means multiplying by 5, giving 5n." },
    { q: "Write an expression for 'a number y decreased by 3'.", options: ["y + 3", "y - 3", "3y", "3 - y"], correct: 1, explanation: "'Decreased by 3' means subtracting 3, giving y - 3." }
  ]
},
      {
        name: "Evaluating Expressions",
  questions: [
    { q: "Evaluate 2x + 3 when x = 5.", options: ["11", "12", "13", "14"], correct: 2, explanation: "Substitute x = 5: 2(5) + 3 = 10 + 3 = 13." },
    { q: "Evaluate 4n - 6 when n = 3.", options: ["4", "5", "6", "7"], correct: 2, explanation: "Substitute n = 3: 4(3) - 6 = 12 - 6 = 6." },
    { q: "Evaluate 3a + 2b when a = 4 and b = 5.", options: ["20", "21", "22", "23"], correct: 2, explanation: "Substitute a=4, b=5: 3(4) + 2(5) = 12 + 10 = 22." }
  ]
},
      {
        name: "Combining Like Terms",
  questions: [
    { q: "Simplify: 3x + 5x", options: ["8", "8x", "15x", "2x"], correct: 1, explanation: "3x and 5x are like terms (same variable), so add the coefficients: 3+5=8, giving 8x." },
    { q: "Simplify: 7y - 2y + 4", options: ["5y + 4", "9y + 4", "5y - 4", "9y - 4"], correct: 0, explanation: "7y - 2y = 5y, and the +4 stays separate since it has no variable, giving 5y + 4." },
    { q: "Simplify: 4a + 3b + 2a", options: ["6a + 3b", "9a + b", "6a + 5b", "4a + 5b"], correct: 0, explanation: "4a and 2a are like terms: 4a+2a=6a. The 3b stays separate, giving 6a + 3b." }
  ]
},
      {
        name: "Algebra Word Problems",
  questions: [
    { q: "Maria has some stickers. After getting 6 more, she has 14. How many did she start with?", options: ["6", "7", "8", "9"], correct: 2, explanation: "Let x = starting stickers. x + 6 = 14, so x = 14 - 6 = 8." },
    { q: "A number tripled equals 21. What is the number?", options: ["6", "7", "8", "9"], correct: 1, explanation: "Let x = the number. 3x = 21, so x = 21 ÷ 3 = 7." },
    { q: "Tom has $5 more than twice what Sam has. If Tom has $17, how much does Sam have?", options: ["$5", "$6", "$7", "$8"], correct: 1, explanation: "Let x = Sam's money. 2x + 5 = 17, so 2x = 12, giving x = 6." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What is a variable in algebra?", options: ["A fixed number that never changes", "A letter or symbol representing an unknown value", "Only the letter x", "A type of equation"], correct: 1, explanation: "A variable is a letter or symbol (like x, y, or n) used to represent a value that is unknown or can change." },
          { q: "In the expression 3x + 5, what is the variable?", options: ["3", "5", "x", "3x"], correct: 2, explanation: "x is the variable — the letter representing an unknown value. 3 and 5 are constants." },
          { q: "If x = 4, what is the value of x + 7?", options: ["9", "10", "11", "12"], correct: 2, explanation: "Substituting x = 4: 4 + 7 = 11." },
          { q: "Solve for x: x + 9 = 15", options: ["4", "5", "6", "7"], correct: 2, explanation: "Subtract 9 from both sides: x = 15 - 9 = 6." },
          { q: "Solve for y: y - 7 = 12", options: ["17", "18", "19", "20"], correct: 2, explanation: "Add 7 to both sides: y = 12 + 7 = 19." },
          { q: "Solve for x: x + 14 = 30", options: ["14", "15", "16", "17"], correct: 2, explanation: "Subtract 14 from both sides: x = 30 - 14 = 16." },
          { q: "Solve for x: 4x = 28", options: ["5", "6", "7", "8"], correct: 2, explanation: "Divide both sides by 4: x = 28 ÷ 4 = 7." },
          { q: "Solve for y: y/5 = 6", options: ["25", "30", "35", "40"], correct: 1, explanation: "Multiply both sides by 5: y = 6 × 5 = 30." },
          { q: "Solve for x: 9x = 63", options: ["6", "7", "8", "9"], correct: 1, explanation: "Divide both sides by 9: x = 63 ÷ 9 = 7." },
          { q: "Solve for x: 3x + 4 = 19", options: ["4", "5", "6", "7"], correct: 1, explanation: "Subtract 4 from both sides: 3x = 15. Divide by 3: x = 5." },
          { q: "Solve for y: 2y - 6 = 10", options: ["6", "7", "8", "9"], correct: 2, explanation: "Add 6 to both sides: 2y = 16. Divide by 2: y = 8." },
          { q: "Solve for x: 5x + 2 = 27", options: ["4", "5", "6", "7"], correct: 1, explanation: "Subtract 2 from both sides: 5x = 25. Divide by 5: x = 5." },
          { type: "balance", q: "Balance the scale: x + 4 = 10. Which weight for x makes it balance?", leftLabel: "x + 4", rightValue: 10, correct: 6, weights: [4,5,6,7,8], explanation: "To balance x + 4 = 10, x must equal 10 - 4 = 6." },
          { type: "balance", q: "Balance the scale: 2x = 14. Which weight for x makes it balance?", leftLabel: "2x", rightValue: 14, correct: 7, weights: [5,6,7,8,9], explanation: "To balance 2x = 14, divide both sides by 2: x = 7." },
          { type: "balance", q: "Balance the scale: x - 3 = 9. Which weight for x makes it balance?", leftLabel: "x - 3", rightValue: 9, correct: 12, weights: [10,11,12,13,14], explanation: "To balance x - 3 = 9, x must equal 9 + 3 = 12." },
          { q: "Write an expression for 'a number x increased by 8'.", options: ["x - 8", "x + 8", "8x", "8 - x"], correct: 1, explanation: "'Increased by 8' means adding 8, giving the expression x + 8." },
          { q: "Write an expression for 'five times a number n'.", options: ["n + 5", "n - 5", "5n", "n/5"], correct: 2, explanation: "'Five times a number' means multiplying by 5, giving 5n." },
          { q: "Write an expression for 'a number y decreased by 3'.", options: ["y + 3", "y - 3", "3y", "3 - y"], correct: 1, explanation: "'Decreased by 3' means subtracting 3, giving y - 3." },
          { q: "Evaluate 2x + 3 when x = 5.", options: ["11", "12", "13", "14"], correct: 2, explanation: "Substitute x = 5: 2(5) + 3 = 10 + 3 = 13." },
          { q: "Evaluate 4n - 6 when n = 3.", options: ["4", "5", "6", "7"], correct: 2, explanation: "Substitute n = 3: 4(3) - 6 = 12 - 6 = 6." },
          { q: "Evaluate 3a + 2b when a = 4 and b = 5.", options: ["20", "21", "22", "23"], correct: 2, explanation: "Substitute a=4, b=5: 3(4) + 2(5) = 12 + 10 = 22." },
          { q: "Simplify: 3x + 5x", options: ["8", "8x", "15x", "2x"], correct: 1, explanation: "3x and 5x are like terms (same variable), so add the coefficients: 3+5=8, giving 8x." },
          { q: "Simplify: 7y - 2y + 4", options: ["5y + 4", "9y + 4", "5y - 4", "9y - 4"], correct: 0, explanation: "7y - 2y = 5y, and the +4 stays separate since it has no variable, giving 5y + 4." },
          { q: "Simplify: 4a + 3b + 2a", options: ["6a + 3b", "9a + b", "6a + 5b", "4a + 5b"], correct: 0, explanation: "4a and 2a are like terms: 4a+2a=6a. The 3b stays separate, giving 6a + 3b." },
          { q: "Maria has some stickers. After getting 6 more, she has 14. How many did she start with?", options: ["6", "7", "8", "9"], correct: 2, explanation: "Let x = starting stickers. x + 6 = 14, so x = 14 - 6 = 8." },
          { q: "A number tripled equals 21. What is the number?", options: ["6", "7", "8", "9"], correct: 1, explanation: "Let x = the number. 3x = 21, so x = 21 ÷ 3 = 7." },
          { q: "Tom has $5 more than twice what Sam has. If Tom has $17, how much does Sam have?", options: ["$5", "$6", "$7", "$8"], correct: 1, explanation: "Let x = Sam's money. 2x + 5 = 17, so 2x = 12, giving x = 6." }
        ]
      }
    ]
  },
  {
    name: "Negative Numbers & Integers",
    lessons: [
      {
        name: "Understanding Negative Numbers",
  questions: [
    { q: "What does a negative number represent?", options: ["A value greater than zero", "A value less than zero", "Always an even number", "A fraction"], correct: 1, explanation: "A negative number represents a value less than zero, often used for things like temperatures below zero or debt." },
    { q: "On a number line, where is -5 located relative to 0?", options: ["5 units to the right", "5 units to the left", "At the same point", "Above 0"], correct: 1, explanation: "Negative numbers sit to the left of zero on a number line — -5 is 5 units to the left of 0." },
    { q: "Which of these represents a temperature of 3 degrees below zero?", options: ["3", "-3", "0.3", "-0.3"], correct: 1, explanation: "'3 below zero' is written as -3." }
  ]
},
      {
        name: "Adding Integers",
  questions: [
    { q: "What is -8 + 3?", options: ["-11", "-5", "5", "11"], correct: 1, explanation: "Starting at -8 and moving 3 units toward positive gives -5." },
    { q: "What is -4 + -6?", options: ["-10", "-2", "2", "10"], correct: 0, explanation: "Adding two negative numbers: -4 + -6 = -10." },
    { q: "What is 7 + -12?", options: ["-19", "-5", "5", "19"], correct: 1, explanation: "7 + -12 is the same as 7 - 12 = -5." }
  ]
},
      {
        name: "Subtracting Integers",
  questions: [
    { q: "What is 5 - (-3)?", options: ["2", "-2", "8", "-8"], correct: 2, explanation: "Subtracting a negative is the same as adding: 5 - (-3) = 5 + 3 = 8." },
    { q: "What is -6 - 4?", options: ["-10", "-2", "2", "10"], correct: 0, explanation: "-6 - 4 means moving 4 more units negative: -6 - 4 = -10." },
    { q: "What is -2 - (-9)?", options: ["-11", "-7", "7", "11"], correct: 2, explanation: "Subtracting a negative is the same as adding: -2 - (-9) = -2 + 9 = 7." }
  ]
},
      {
        name: "Multiplying Integers",
  questions: [
    { q: "What is -4 × -6?", options: ["-24", "-10", "10", "24"], correct: 3, explanation: "A negative times a negative gives a positive: -4 × -6 = 24." },
    { q: "What is -5 × 3?", options: ["-15", "-2", "2", "15"], correct: 0, explanation: "A negative times a positive gives a negative: -5 × 3 = -15." },
    { q: "What is 7 × -8?", options: ["-56", "-1", "1", "56"], correct: 0, explanation: "A positive times a negative gives a negative: 7 × -8 = -56." }
  ]
},
      {
        name: "Dividing Integers",
  questions: [
    { q: "What is -15 ÷ -3?", options: ["-5", "-3", "3", "5"], correct: 3, explanation: "A negative divided by a negative gives a positive: -15 ÷ -3 = 5." },
    { q: "What is -20 ÷ 4?", options: ["-5", "-4", "4", "5"], correct: 0, explanation: "A negative divided by a positive gives a negative: -20 ÷ 4 = -5." },
    { q: "What is 36 ÷ -6?", options: ["-6", "-1", "1", "6"], correct: 0, explanation: "A positive divided by a negative gives a negative: 36 ÷ -6 = -6." }
  ]
},
      {
        name: "Comparing and Ordering Integers",
  questions: [
    { q: "Which of these numbers is smallest?", options: ["-10", "-2", "0", "1"], correct: 0, explanation: "On a number line, -10 is farthest to the left, making it the smallest." },
    { q: "Which of these numbers is largest?", options: ["-8", "-3", "-15", "-1"], correct: 3, explanation: "-1 is closest to zero (and to the right of the others), making it the largest of these negative numbers." },
    { q: "Put these in order from least to greatest: -4, 2, -7, 0", options: ["-7, -4, 0, 2", "2, 0, -4, -7", "-4, -7, 0, 2", "0, -4, -7, 2"], correct: 0, explanation: "From least to greatest: -7 is smallest, then -4, then 0, then 2." }
  ]
},
      {
        name: "Absolute Value",
  questions: [
    { q: "What is the absolute value of -7?", options: ["-7", "0", "7", "14"], correct: 2, explanation: "Absolute value is the distance from zero, always positive: |-7| = 7." },
    { q: "What is |−12|?", options: ["-12", "0", "6", "12"], correct: 3, explanation: "The absolute value of -12 is 12 — its distance from zero." },
    { q: "Which has a greater absolute value: -9 or 5?", options: ["-9", "5", "They are equal", "Cannot compare"], correct: 0, explanation: "|-9| = 9 and |5| = 5. Since 9 > 5, -9 has the greater absolute value." }
  ]
},
      {
        name: "Integer Word Problems",
  questions: [
    { q: "The temperature was -3°C and rose by 8 degrees. What is the new temperature?", options: ["-11°C", "-5°C", "5°C", "11°C"], correct: 2, explanation: "-3 + 8 = 5°C." },
    { q: "A submarine is at -150 feet (150 feet below sea level) and dives 75 feet deeper. What is its new depth?", options: ["-75 feet", "-125 feet", "-225 feet", "-275 feet"], correct: 2, explanation: "-150 + (-75) = -225 feet." },
    { q: "You owe a friend $12 (a debt of -$12), then pay back $5. How much do you still owe?", options: ["-$17", "-$7", "$7", "$17"], correct: 1, explanation: "-12 + 5 = -7, meaning you still owe $7 (represented as -$7)." }
  ]
},
      {
        name: "Combining Operations with Integers",
  questions: [
    { q: "What is -3 + 5 × -2?", options: ["-13", "-7", "4", "7"], correct: 0, explanation: "Multiplication first: 5 × -2 = -10. Then -3 + -10 = -13." },
    { q: "What is (4 - 9) × -3?", options: ["-15", "-5", "5", "15"], correct: 3, explanation: "Parentheses first: 4 - 9 = -5. Then -5 × -3 = 15." },
    { q: "What is -6 - 4 × -2?", options: ["-14", "-2", "2", "14"], correct: 2, explanation: "Multiplication first: 4 × -2 = -8. Then -6 - (-8) = -6 + 8 = 2." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What does a negative number represent?", options: ["A value greater than zero", "A value less than zero", "Always an even number", "A fraction"], correct: 1, explanation: "A negative number represents a value less than zero, often used for things like temperatures below zero or debt." },
          { q: "On a number line, where is -5 located relative to 0?", options: ["5 units to the right", "5 units to the left", "At the same point", "Above 0"], correct: 1, explanation: "Negative numbers sit to the left of zero on a number line — -5 is 5 units to the left of 0." },
          { q: "Which of these represents a temperature of 3 degrees below zero?", options: ["3", "-3", "0.3", "-0.3"], correct: 1, explanation: "'3 below zero' is written as -3." },
          { q: "What is -8 + 3?", options: ["-11", "-5", "5", "11"], correct: 1, explanation: "Starting at -8 and moving 3 units toward positive gives -5." },
          { q: "What is -4 + -6?", options: ["-10", "-2", "2", "10"], correct: 0, explanation: "Adding two negative numbers: -4 + -6 = -10." },
          { q: "What is 7 + -12?", options: ["-19", "-5", "5", "19"], correct: 1, explanation: "7 + -12 is the same as 7 - 12 = -5." },
          { q: "What is 5 - (-3)?", options: ["2", "-2", "8", "-8"], correct: 2, explanation: "Subtracting a negative is the same as adding: 5 - (-3) = 5 + 3 = 8." },
          { q: "What is -6 - 4?", options: ["-10", "-2", "2", "10"], correct: 0, explanation: "-6 - 4 means moving 4 more units negative: -6 - 4 = -10." },
          { q: "What is -2 - (-9)?", options: ["-11", "-7", "7", "11"], correct: 2, explanation: "Subtracting a negative is the same as adding: -2 - (-9) = -2 + 9 = 7." },
          { q: "What is -4 × -6?", options: ["-24", "-10", "10", "24"], correct: 3, explanation: "A negative times a negative gives a positive: -4 × -6 = 24." },
          { q: "What is -5 × 3?", options: ["-15", "-2", "2", "15"], correct: 0, explanation: "A negative times a positive gives a negative: -5 × 3 = -15." },
          { q: "What is 7 × -8?", options: ["-56", "-1", "1", "56"], correct: 0, explanation: "A positive times a negative gives a negative: 7 × -8 = -56." },
          { q: "What is -15 ÷ -3?", options: ["-5", "-3", "3", "5"], correct: 3, explanation: "A negative divided by a negative gives a positive: -15 ÷ -3 = 5." },
          { q: "What is -20 ÷ 4?", options: ["-5", "-4", "4", "5"], correct: 0, explanation: "A negative divided by a positive gives a negative: -20 ÷ 4 = -5." },
          { q: "What is 36 ÷ -6?", options: ["-6", "-1", "1", "6"], correct: 0, explanation: "A positive divided by a negative gives a negative: 36 ÷ -6 = -6." },
          { q: "Which of these numbers is smallest?", options: ["-10", "-2", "0", "1"], correct: 0, explanation: "On a number line, -10 is farthest to the left, making it the smallest." },
          { q: "Which of these numbers is largest?", options: ["-8", "-3", "-15", "-1"], correct: 3, explanation: "-1 is closest to zero (and to the right of the others), making it the largest of these negative numbers." },
          { q: "Put these in order from least to greatest: -4, 2, -7, 0", options: ["-7, -4, 0, 2", "2, 0, -4, -7", "-4, -7, 0, 2", "0, -4, -7, 2"], correct: 0, explanation: "From least to greatest: -7 is smallest, then -4, then 0, then 2." },
          { q: "What is the absolute value of -7?", options: ["-7", "0", "7", "14"], correct: 2, explanation: "Absolute value is the distance from zero, always positive: |-7| = 7." },
          { q: "What is |−12|?", options: ["-12", "0", "6", "12"], correct: 3, explanation: "The absolute value of -12 is 12 — its distance from zero." },
          { q: "Which has a greater absolute value: -9 or 5?", options: ["-9", "5", "They are equal", "Cannot compare"], correct: 0, explanation: "|-9| = 9 and |5| = 5. Since 9 > 5, -9 has the greater absolute value." },
          { q: "The temperature was -3°C and rose by 8 degrees. What is the new temperature?", options: ["-11°C", "-5°C", "5°C", "11°C"], correct: 2, explanation: "-3 + 8 = 5°C." },
          { q: "A submarine is at -150 feet (150 feet below sea level) and dives 75 feet deeper. What is its new depth?", options: ["-75 feet", "-125 feet", "-225 feet", "-275 feet"], correct: 2, explanation: "-150 + (-75) = -225 feet." },
          { q: "You owe a friend $12 (a debt of -$12), then pay back $5. How much do you still owe?", options: ["-$17", "-$7", "$7", "$17"], correct: 1, explanation: "-12 + 5 = -7, meaning you still owe $7 (represented as -$7)." },
          { q: "What is -3 + 5 × -2?", options: ["-13", "-7", "4", "7"], correct: 0, explanation: "Multiplication first: 5 × -2 = -10. Then -3 + -10 = -13." },
          { q: "What is (4 - 9) × -3?", options: ["-15", "-5", "5", "15"], correct: 3, explanation: "Parentheses first: 4 - 9 = -5. Then -5 × -3 = 15." },
          { q: "What is -6 - 4 × -2?", options: ["-14", "-2", "2", "14"], correct: 2, explanation: "Multiplication first: 4 × -2 = -8. Then -6 - (-8) = -6 + 8 = 2." }
        ]
      }
    ]
  },
  {
    name: "Geometry Basics",
    lessons: [
      {
        name: "Types of Angles",
  questions: [
    { q: "What type of angle measures exactly 90 degrees?", options: ["Acute", "Right", "Obtuse", "Straight"], correct: 1, explanation: "A right angle measures exactly 90 degrees, often shown with a small square symbol." },
    { q: "What type of angle is less than 90 degrees?", options: ["Acute", "Right", "Obtuse", "Reflex"], correct: 0, explanation: "An acute angle measures less than 90 degrees." },
    { q: "What type of angle is between 90 and 180 degrees?", options: ["Acute", "Right", "Obtuse", "Straight"], correct: 2, explanation: "An obtuse angle measures more than 90 but less than 180 degrees." }
  ]
},
      {
        name: "Types of Triangles",
  questions: [
    { q: "What is a triangle with all three sides equal called?", options: ["Scalene", "Isosceles", "Equilateral", "Right"], correct: 2, explanation: "An equilateral triangle has all three sides (and all three angles) equal." },
    { q: "What is a triangle with exactly two equal sides called?", options: ["Scalene", "Isosceles", "Equilateral", "Obtuse"], correct: 1, explanation: "An isosceles triangle has exactly two sides of equal length." },
    { q: "If a triangle has angles 50° and 60°, what is the third angle?", options: ["60°", "70°", "80°", "90°"], correct: 1, explanation: "The angles of any triangle sum to 180°: 180 - 50 - 60 = 70°." }
  ]
},
      {
        name: "Perimeter of Shapes",
  questions: [
    { q: "What is the perimeter of a square with side length 6cm?", options: ["18cm", "20cm", "24cm", "36cm"], correct: 2, explanation: "A square has 4 equal sides, so perimeter = 4 × 6 = 24cm." },
    { q: "What is the perimeter of a rectangle with length 8cm and width 3cm?", options: ["11cm", "18cm", "22cm", "24cm"], correct: 2, explanation: "Perimeter = 2×(length + width) = 2×(8+3) = 2×11 = 22cm." },
    { q: "A triangle has sides 5cm, 7cm, and 9cm. What is its perimeter?", options: ["19cm", "20cm", "21cm", "22cm"], correct: 2, explanation: "Perimeter = 5+7+9 = 21cm." }
  ]
},
      {
        name: "Area of Rectangles & Squares",
  questions: [
    { q: "What is the area of a rectangle 4cm by 9cm?", options: ["13cm²", "26cm²", "36cm²", "40cm²"], correct: 2, explanation: "Area of a rectangle = length × width = 4 × 9 = 36cm²." },
    { q: "What is the area of a square with side length 7cm?", options: ["14cm²", "28cm²", "42cm²", "49cm²"], correct: 3, explanation: "Area of a square = side × side = 7 × 7 = 49cm²." },
    { q: "A rectangle has an area of 48cm² and a width of 6cm. What is its length?", options: ["6cm", "7cm", "8cm", "9cm"], correct: 2, explanation: "Length = Area ÷ width = 48 ÷ 6 = 8cm." }
  ]
},
      {
        name: "Area of Triangles",
  questions: [
    { q: "What is the area of a triangle with base 10cm and height 6cm?", options: ["16cm²", "30cm²", "60cm²", "8cm²"], correct: 1, explanation: "Area of a triangle = (1/2) × base × height = (1/2) × 10 × 6 = 30cm²." },
    { q: "What is the area of a triangle with base 8cm and height 5cm?", options: ["13cm²", "20cm²", "40cm²", "26cm²"], correct: 1, explanation: "Area = (1/2) × 8 × 5 = 20cm²." },
    { q: "A triangle has an area of 24cm² and a base of 8cm. What is its height?", options: ["3cm", "4cm", "5cm", "6cm"], correct: 3, explanation: "Height = (2 × Area) ÷ base = (2 × 24) ÷ 8 = 48 ÷ 8 = 6cm." }
  ]
},
      {
        name: "Circles: Circumference",
  questions: [
    { q: "What is the circumference of a circle with radius 5? (use π ≈ 3.14)", options: ["15.7", "31.4", "62.8", "78.5"], correct: 1, explanation: "Circumference = 2πr = 2 × 3.14 × 5 = 31.4." },
    { q: "What is the circumference of a circle with diameter 10? (use π ≈ 3.14)", options: ["15.7", "31.4", "62.8", "78.5"], correct: 1, explanation: "Circumference = πd = 3.14 × 10 = 31.4." },
    { q: "What is the circumference of a circle with radius 3? (use π ≈ 3.14)", options: ["9.42", "18.84", "28.26", "37.68"], correct: 1, explanation: "Circumference = 2πr = 2 × 3.14 × 3 = 18.84." }
  ]
},
      {
        name: "Circles: Area",
  questions: [
    { q: "What is the area of a circle with radius 4? (use π ≈ 3.14)", options: ["12.56", "25.12", "50.24", "100.48"], correct: 2, explanation: "Area = πr² = 3.14 × 4² = 3.14 × 16 = 50.24." },
    { q: "What is the area of a circle with radius 2? (use π ≈ 3.14)", options: ["6.28", "12.56", "18.84", "25.12"], correct: 1, explanation: "Area = πr² = 3.14 × 2² = 3.14 × 4 = 12.56." },
    { q: "What is the area of a circle with radius 5? (use π ≈ 3.14)", options: ["31.4", "62.8", "78.5", "94.2"], correct: 2, explanation: "Area = πr² = 3.14 × 5² = 3.14 × 25 = 78.5." }
  ]
},
      {
        name: "Polygon Angle Sums",
  questions: [
    { q: "What is the sum of the interior angles of a hexagon (6 sides)?", options: ["540°", "600°", "720°", "900°"], correct: 2, explanation: "Sum of interior angles = (n-2) × 180° = (6-2) × 180° = 4 × 180° = 720°." },
    { q: "What is the sum of the interior angles of a pentagon (5 sides)?", options: ["360°", "450°", "540°", "630°"], correct: 2, explanation: "Sum = (5-2) × 180° = 3 × 180° = 540°." },
    { q: "What is the sum of the interior angles of a quadrilateral (4 sides)?", options: ["180°", "270°", "360°", "450°"], correct: 2, explanation: "Sum = (4-2) × 180° = 2 × 180° = 360°." }
  ]
},
      {
        name: "Geometry Word Problems",
  questions: [
    { q: "A rectangular garden is 12m long and 8m wide. How much fencing (perimeter) is needed to go around it?", options: ["20m", "40m", "48m", "96m"], correct: 1, explanation: "Perimeter = 2×(12+8) = 2×20 = 40m." },
    { q: "A circular pool has a radius of 7m. What is its area, using π ≈ 3.14? (round to nearest whole number)", options: ["44m²", "88m²", "154m²", "308m²"], correct: 2, explanation: "Area = πr² = 3.14 × 49 = 153.86, which rounds to 154m²." },
    { q: "A triangular flag has a base of 12cm and a height of 9cm. What is its area?", options: ["54cm²", "60cm²", "108cm²", "21cm²"], correct: 0, explanation: "Area = (1/2) × 12 × 9 = (1/2) × 108 = 54cm²." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What type of angle measures exactly 90 degrees?", options: ["Acute", "Right", "Obtuse", "Straight"], correct: 1, explanation: "A right angle measures exactly 90 degrees, often shown with a small square symbol." },
          { q: "What type of angle is less than 90 degrees?", options: ["Acute", "Right", "Obtuse", "Reflex"], correct: 0, explanation: "An acute angle measures less than 90 degrees." },
          { q: "What type of angle is between 90 and 180 degrees?", options: ["Acute", "Right", "Obtuse", "Straight"], correct: 2, explanation: "An obtuse angle measures more than 90 but less than 180 degrees." },
          { q: "What is a triangle with all three sides equal called?", options: ["Scalene", "Isosceles", "Equilateral", "Right"], correct: 2, explanation: "An equilateral triangle has all three sides (and all three angles) equal." },
          { q: "What is a triangle with exactly two equal sides called?", options: ["Scalene", "Isosceles", "Equilateral", "Obtuse"], correct: 1, explanation: "An isosceles triangle has exactly two sides of equal length." },
          { q: "If a triangle has angles 50° and 60°, what is the third angle?", options: ["60°", "70°", "80°", "90°"], correct: 1, explanation: "The angles of any triangle sum to 180°: 180 - 50 - 60 = 70°." },
          { q: "What is the perimeter of a square with side length 6cm?", options: ["18cm", "20cm", "24cm", "36cm"], correct: 2, explanation: "A square has 4 equal sides, so perimeter = 4 × 6 = 24cm." },
          { q: "What is the perimeter of a rectangle with length 8cm and width 3cm?", options: ["11cm", "18cm", "22cm", "24cm"], correct: 2, explanation: "Perimeter = 2×(length + width) = 2×(8+3) = 2×11 = 22cm." },
          { q: "A triangle has sides 5cm, 7cm, and 9cm. What is its perimeter?", options: ["19cm", "20cm", "21cm", "22cm"], correct: 2, explanation: "Perimeter = 5+7+9 = 21cm." },
          { q: "What is the area of a rectangle 4cm by 9cm?", options: ["13cm²", "26cm²", "36cm²", "40cm²"], correct: 2, explanation: "Area of a rectangle = length × width = 4 × 9 = 36cm²." },
          { q: "What is the area of a square with side length 7cm?", options: ["14cm²", "28cm²", "42cm²", "49cm²"], correct: 3, explanation: "Area of a square = side × side = 7 × 7 = 49cm²." },
          { q: "A rectangle has an area of 48cm² and a width of 6cm. What is its length?", options: ["6cm", "7cm", "8cm", "9cm"], correct: 2, explanation: "Length = Area ÷ width = 48 ÷ 6 = 8cm." },
          { q: "What is the area of a triangle with base 10cm and height 6cm?", options: ["16cm²", "30cm²", "60cm²", "8cm²"], correct: 1, explanation: "Area of a triangle = (1/2) × base × height = (1/2) × 10 × 6 = 30cm²." },
          { q: "What is the area of a triangle with base 8cm and height 5cm?", options: ["13cm²", "20cm²", "40cm²", "26cm²"], correct: 1, explanation: "Area = (1/2) × 8 × 5 = 20cm²." },
          { q: "A triangle has an area of 24cm² and a base of 8cm. What is its height?", options: ["3cm", "4cm", "5cm", "6cm"], correct: 3, explanation: "Height = (2 × Area) ÷ base = (2 × 24) ÷ 8 = 48 ÷ 8 = 6cm." },
          { q: "What is the circumference of a circle with radius 5? (use π ≈ 3.14)", options: ["15.7", "31.4", "62.8", "78.5"], correct: 1, explanation: "Circumference = 2πr = 2 × 3.14 × 5 = 31.4." },
          { q: "What is the circumference of a circle with diameter 10? (use π ≈ 3.14)", options: ["15.7", "31.4", "62.8", "78.5"], correct: 1, explanation: "Circumference = πd = 3.14 × 10 = 31.4." },
          { q: "What is the circumference of a circle with radius 3? (use π ≈ 3.14)", options: ["9.42", "18.84", "28.26", "37.68"], correct: 1, explanation: "Circumference = 2πr = 2 × 3.14 × 3 = 18.84." },
          { q: "What is the area of a circle with radius 4? (use π ≈ 3.14)", options: ["12.56", "25.12", "50.24", "100.48"], correct: 2, explanation: "Area = πr² = 3.14 × 4² = 3.14 × 16 = 50.24." },
          { q: "What is the area of a circle with radius 2? (use π ≈ 3.14)", options: ["6.28", "12.56", "18.84", "25.12"], correct: 1, explanation: "Area = πr² = 3.14 × 2² = 3.14 × 4 = 12.56." },
          { q: "What is the area of a circle with radius 5? (use π ≈ 3.14)", options: ["31.4", "62.8", "78.5", "94.2"], correct: 2, explanation: "Area = πr² = 3.14 × 5² = 3.14 × 25 = 78.5." },
          { q: "What is the sum of the interior angles of a hexagon (6 sides)?", options: ["540°", "600°", "720°", "900°"], correct: 2, explanation: "Sum of interior angles = (n-2) × 180° = (6-2) × 180° = 4 × 180° = 720°." },
          { q: "What is the sum of the interior angles of a pentagon (5 sides)?", options: ["360°", "450°", "540°", "630°"], correct: 2, explanation: "Sum = (5-2) × 180° = 3 × 180° = 540°." },
          { q: "What is the sum of the interior angles of a quadrilateral (4 sides)?", options: ["180°", "270°", "360°", "450°"], correct: 2, explanation: "Sum = (4-2) × 180° = 2 × 180° = 360°." },
          { q: "A rectangular garden is 12m long and 8m wide. How much fencing (perimeter) is needed to go around it?", options: ["20m", "40m", "48m", "96m"], correct: 1, explanation: "Perimeter = 2×(12+8) = 2×20 = 40m." },
          { q: "A circular pool has a radius of 7m. What is its area, using π ≈ 3.14? (round to nearest whole number)", options: ["44m²", "88m²", "154m²", "308m²"], correct: 2, explanation: "Area = πr² = 3.14 × 49 = 153.86, which rounds to 154m²." },
          { q: "A triangular flag has a base of 12cm and a height of 9cm. What is its area?", options: ["54cm²", "60cm²", "108cm²", "21cm²"], correct: 0, explanation: "Area = (1/2) × 12 × 9 = (1/2) × 108 = 54cm²." }
        ]
      }
    ]
  },
  {
    name: "Exponents & Roots",
    lessons: [
      {
        name: "Understanding Exponents",
  questions: [
    { q: "What does 5³ mean?", options: ["5 × 3", "5 + 5 + 5", "5 × 5 × 5", "3 × 3 × 3 × 3 × 3"], correct: 2, explanation: "An exponent tells you how many times to multiply the base by itself: 5³ = 5 × 5 × 5." },
    { q: "What is 4²?", options: ["8", "12", "16", "20"], correct: 2, explanation: "4² = 4 × 4 = 16." },
    { q: "What is 2⁵?", options: ["10", "16", "25", "32"], correct: 3, explanation: "2⁵ = 2×2×2×2×2 = 32." }
  ]
},
      {
        name: "Perfect Squares and Square Roots",
  questions: [
    { q: "What is the square root of 144?", options: ["11", "12", "13", "14"], correct: 1, explanation: "12 × 12 = 144, so the square root of 144 is 12." },
    { q: "What is 9² (9 squared)?", options: ["18", "72", "81", "90"], correct: 2, explanation: "9² = 9 × 9 = 81." },
    { q: "What is the square root of 81?", options: ["7", "8", "9", "10"], correct: 2, explanation: "9 × 9 = 81, so the square root of 81 is 9." }
  ]
},
      {
        name: "Perfect Cubes and Cube Roots",
  questions: [
    { q: "What is 3³ (3 cubed)?", options: ["9", "18", "27", "36"], correct: 2, explanation: "3³ = 3×3×3 = 27." },
    { q: "What is the cube root of 64?", options: ["3", "4", "5", "6"], correct: 1, explanation: "4×4×4 = 64, so the cube root of 64 is 4." },
    { q: "What is 5³?", options: ["15", "25", "100", "125"], correct: 3, explanation: "5³ = 5×5×5 = 125." }
  ]
},
      {
        name: "Exponent Rules: Multiplying Powers",
  questions: [
    { q: "What is x³ × x⁴?", options: ["x⁷", "x¹²", "2x⁷", "x¹"], correct: 0, explanation: "When multiplying powers with the same base, add the exponents: x³ × x⁴ = x^(3+4) = x⁷." },
    { q: "What is 2² × 2³?", options: ["2⁵", "2⁶", "4⁵", "8⁵"], correct: 0, explanation: "Add the exponents when multiplying same-base powers: 2² × 2³ = 2^(2+3) = 2⁵." },
    { q: "What is y⁵ × y²?", options: ["y³", "y⁷", "y¹⁰", "2y⁷"], correct: 1, explanation: "y⁵ × y² = y^(5+2) = y⁷." }
  ]
},
      {
        name: "Exponent Rules: Dividing Powers",
  questions: [
    { q: "What is x⁸ ÷ x³?", options: ["x⁵", "x¹¹", "x²⁴", "x³"], correct: 0, explanation: "When dividing powers with the same base, subtract the exponents: x⁸ ÷ x³ = x^(8-3) = x⁵." },
    { q: "What is 3⁶ ÷ 3²?", options: ["3³", "3⁴", "3⁸", "3¹²"], correct: 1, explanation: "Subtract the exponents: 3⁶ ÷ 3² = 3^(6-2) = 3⁴." },
    { q: "What is y⁷ ÷ y⁵?", options: ["y¹", "y²", "y³", "y¹²"], correct: 1, explanation: "y⁷ ÷ y⁵ = y^(7-5) = y²." }
  ]
},
      {
        name: "Negative and Zero Exponents",
  questions: [
    { q: "What is any nonzero number raised to the power of 0?", options: ["0", "1", "The number itself", "Undefined"], correct: 1, explanation: "Any nonzero number raised to the power of 0 equals 1, by definition." },
    { q: "What is 2⁻²?", options: ["-4", "-2", "1/4", "1/2"], correct: 2, explanation: "A negative exponent means take the reciprocal: 2⁻² = 1/2² = 1/4." },
    { q: "What is 5⁻¹?", options: ["-5", "-1/5", "1/5", "5"], correct: 2, explanation: "5⁻¹ = 1/5¹ = 1/5." }
  ]
},
      {
        name: "Solving Exponential Equations",
  questions: [
    { q: "Solve for x: 3ˣ = 81", options: ["3", "4", "5", "6"], correct: 1, explanation: "3⁴ = 3×3×3×3 = 81, so x = 4." },
    { q: "Solve for x: 2ˣ = 32", options: ["4", "5", "6", "7"], correct: 1, explanation: "2⁵ = 32, so x = 5." },
    { q: "Solve for x: 5ˣ = 125", options: ["2", "3", "4", "5"], correct: 1, explanation: "5³ = 125, so x = 3." }
  ]
},
      {
        name: "Introduction to Logarithms",
  questions: [
    { q: "What does log₂(8) equal?", options: ["2", "3", "4", "8"], correct: 1, explanation: "log₂(8) asks 'what power of 2 gives 8?' Since 2³=8, log₂(8)=3." },
    { q: "Solve for x: log₂(x) = 5", options: ["10", "16", "25", "32"], correct: 3, explanation: "log₂(x)=5 means 2⁵=x, so x=32." },
    { q: "What does log₁₀(100) equal?", options: ["1", "2", "10", "100"], correct: 1, explanation: "log₁₀(100) asks 'what power of 10 gives 100?' Since 10²=100, log₁₀(100)=2." }
  ]
},
      {
        name: "Exponents & Roots Word Problems",
  questions: [
    { q: "A square garden has an area of 121 square meters. What is the length of one side?", options: ["9m", "10m", "11m", "12m"], correct: 2, explanation: "Since area = side², side = √121 = 11m." },
    { q: "A bacteria culture doubles every hour, starting with 1 bacterium. How many bacteria are there after 6 hours?", options: ["12", "32", "64", "128"], correct: 2, explanation: "This is 2⁶ = 64 bacteria after 6 doublings." },
    { q: "A cube-shaped box has a volume of 8 cubic feet. What is the length of one edge?", options: ["2 feet", "3 feet", "4 feet", "8 feet"], correct: 0, explanation: "Since volume = edge³, edge = cube root of 8 = 2 feet." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What does 5³ mean?", options: ["5 × 3", "5 + 5 + 5", "5 × 5 × 5", "3 × 3 × 3 × 3 × 3"], correct: 2, explanation: "An exponent tells you how many times to multiply the base by itself: 5³ = 5 × 5 × 5." },
          { q: "What is 4²?", options: ["8", "12", "16", "20"], correct: 2, explanation: "4² = 4 × 4 = 16." },
          { q: "What is 2⁵?", options: ["10", "16", "25", "32"], correct: 3, explanation: "2⁵ = 2×2×2×2×2 = 32." },
          { q: "What is the square root of 144?", options: ["11", "12", "13", "14"], correct: 1, explanation: "12 × 12 = 144, so the square root of 144 is 12." },
          { q: "What is 9² (9 squared)?", options: ["18", "72", "81", "90"], correct: 2, explanation: "9² = 9 × 9 = 81." },
          { q: "What is the square root of 81?", options: ["7", "8", "9", "10"], correct: 2, explanation: "9 × 9 = 81, so the square root of 81 is 9." },
          { q: "What is 3³ (3 cubed)?", options: ["9", "18", "27", "36"], correct: 2, explanation: "3³ = 3×3×3 = 27." },
          { q: "What is the cube root of 64?", options: ["3", "4", "5", "6"], correct: 1, explanation: "4×4×4 = 64, so the cube root of 64 is 4." },
          { q: "What is 5³?", options: ["15", "25", "100", "125"], correct: 3, explanation: "5³ = 5×5×5 = 125." },
          { q: "What is x³ × x⁴?", options: ["x⁷", "x¹²", "2x⁷", "x¹"], correct: 0, explanation: "When multiplying powers with the same base, add the exponents: x³ × x⁴ = x^(3+4) = x⁷." },
          { q: "What is 2² × 2³?", options: ["2⁵", "2⁶", "4⁵", "8⁵"], correct: 0, explanation: "Add the exponents when multiplying same-base powers: 2² × 2³ = 2^(2+3) = 2⁵." },
          { q: "What is y⁵ × y²?", options: ["y³", "y⁷", "y¹⁰", "2y⁷"], correct: 1, explanation: "y⁵ × y² = y^(5+2) = y⁷." },
          { q: "What is x⁸ ÷ x³?", options: ["x⁵", "x¹¹", "x²⁴", "x³"], correct: 0, explanation: "When dividing powers with the same base, subtract the exponents: x⁸ ÷ x³ = x^(8-3) = x⁵." },
          { q: "What is 3⁶ ÷ 3²?", options: ["3³", "3⁴", "3⁸", "3¹²"], correct: 1, explanation: "Subtract the exponents: 3⁶ ÷ 3² = 3^(6-2) = 3⁴." },
          { q: "What is y⁷ ÷ y⁵?", options: ["y¹", "y²", "y³", "y¹²"], correct: 1, explanation: "y⁷ ÷ y⁵ = y^(7-5) = y²." },
          { q: "What is any nonzero number raised to the power of 0?", options: ["0", "1", "The number itself", "Undefined"], correct: 1, explanation: "Any nonzero number raised to the power of 0 equals 1, by definition." },
          { q: "What is 2⁻²?", options: ["-4", "-2", "1/4", "1/2"], correct: 2, explanation: "A negative exponent means take the reciprocal: 2⁻² = 1/2² = 1/4." },
          { q: "What is 5⁻¹?", options: ["-5", "-1/5", "1/5", "5"], correct: 2, explanation: "5⁻¹ = 1/5¹ = 1/5." },
          { q: "Solve for x: 3ˣ = 81", options: ["3", "4", "5", "6"], correct: 1, explanation: "3⁴ = 3×3×3×3 = 81, so x = 4." },
          { q: "Solve for x: 2ˣ = 32", options: ["4", "5", "6", "7"], correct: 1, explanation: "2⁵ = 32, so x = 5." },
          { q: "Solve for x: 5ˣ = 125", options: ["2", "3", "4", "5"], correct: 1, explanation: "5³ = 125, so x = 3." },
          { q: "What does log₂(8) equal?", options: ["2", "3", "4", "8"], correct: 1, explanation: "log₂(8) asks 'what power of 2 gives 8?' Since 2³=8, log₂(8)=3." },
          { q: "Solve for x: log₂(x) = 5", options: ["10", "16", "25", "32"], correct: 3, explanation: "log₂(x)=5 means 2⁵=x, so x=32." },
          { q: "What does log₁₀(100) equal?", options: ["1", "2", "10", "100"], correct: 1, explanation: "log₁₀(100) asks 'what power of 10 gives 100?' Since 10²=100, log₁₀(100)=2." },
          { q: "A square garden has an area of 121 square meters. What is the length of one side?", options: ["9m", "10m", "11m", "12m"], correct: 2, explanation: "Since area = side², side = √121 = 11m." },
          { q: "A bacteria culture doubles every hour, starting with 1 bacterium. How many bacteria are there after 6 hours?", options: ["12", "32", "64", "128"], correct: 2, explanation: "This is 2⁶ = 64 bacteria after 6 doublings." },
          { q: "A cube-shaped box has a volume of 8 cubic feet. What is the length of one edge?", options: ["2 feet", "3 feet", "4 feet", "8 feet"], correct: 0, explanation: "Since volume = edge³, edge = cube root of 8 = 2 feet." }
        ]
      }
    ]
  },
  {
    name: "Intermediate Algebra",
    lessons: [
      {
        name: "The Distributive Property",
  questions: [
    { q: "Simplify: 3(x + 4)", options: ["3x + 4", "3x + 12", "x + 12", "7x"], correct: 1, explanation: "Distribute the 3 to both terms: 3×x + 3×4 = 3x + 12." },
    { q: "Simplify: 5(2x - 3)", options: ["10x - 15", "10x - 3", "7x - 15", "10x + 15"], correct: 0, explanation: "Distribute the 5: 5×2x - 5×3 = 10x - 15." },
    { q: "Simplify: -2(x + 6)", options: ["-2x + 6", "-2x - 12", "2x - 12", "-2x + 12"], correct: 1, explanation: "Distribute the -2: -2×x + -2×6 = -2x - 12." }
  ]
},
      {
        name: "Simplifying Expressions",
  questions: [
    { q: "Simplify: 4x - 2x + 6", options: ["2x + 6", "6x + 6", "2x - 6", "8x"], correct: 0, explanation: "Combine like terms: 4x - 2x = 2x, and the +6 stays, giving 2x + 6." },
    { q: "Simplify: 3(x + 2) + 4x", options: ["7x + 2", "7x + 6", "3x + 6", "4x + 6"], correct: 1, explanation: "Distribute: 3x + 6 + 4x. Combine like terms: 3x + 4x = 7x, giving 7x + 6." },
    { q: "Simplify: 2(3x - 1) - 5", options: ["6x - 7", "6x - 6", "6x - 3", "5x - 7"], correct: 0, explanation: "Distribute: 6x - 2 - 5. Combine constants: -2 - 5 = -7, giving 6x - 7." }
  ]
},
      {
        name: "Multiplying Monomials",
  questions: [
    { q: "Simplify: (2x²)(3x³)", options: ["5x⁵", "6x⁵", "6x⁶", "5x⁶"], correct: 1, explanation: "Multiply coefficients (2×3=6) and add exponents (2+3=5): 6x⁵." },
    { q: "Simplify: (4x)(5x²)", options: ["9x³", "20x²", "20x³", "9x²"], correct: 2, explanation: "Multiply coefficients (4×5=20) and add exponents (1+2=3): 20x³." },
    { q: "Simplify: (3x²)(2x)", options: ["5x²", "5x³", "6x²", "6x³"], correct: 3, explanation: "Multiply coefficients (3×2=6) and add exponents (2+1=3): 6x³." }
  ]
},
      {
        name: "Systems of Equations: Substitution",
  questions: [
    { q: "Solve the system using substitution: y = x + 2, and x + y = 10. What is x?", options: ["3", "4", "5", "6"], correct: 1, explanation: "Substitute y: x + (x+2) = 10, so 2x + 2 = 10, giving 2x = 8, so x = 4." },
    { q: "Solve the system: y = 2x, and x + y = 12. What is x?", options: ["2", "3", "4", "5"], correct: 2, explanation: "Substitute y: x + 2x = 12, so 3x = 12, giving x = 4." },
    { q: "Solve the system: x = y + 3, and 2x + y = 12. What is y?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Substitute x: 2(y+3) + y = 12, so 2y+6+y=12, giving 3y=6, so y=2." }
  ]
},
      {
        name: "Systems of Equations: Elimination",
  questions: [
    { q: "Solve the system: x + y = 10, x − y = 2. What is x?", options: ["4", "5", "6", "7"], correct: 2, explanation: "Adding both equations eliminates y: 2x = 12, so x = 6." },
    { q: "Solve the system: 2x + y = 11, x - y = 1. What is x?", options: ["3", "4", "5", "6"], correct: 1, explanation: "Adding both equations eliminates y: 3x = 12, so x = 4." },
    { q: "Solve the system: x + y = 7, x - y = 3. What is y?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Subtracting: (x+y)-(x-y)=7-3, so 2y=4, giving y=2." }
  ]
},
      {
        name: "Introduction to Quadratic Equations",
  questions: [
    { q: "What is the standard form of a quadratic equation?", options: ["ax + b = 0", "ax² + bx + c = 0", "ax³ + b = 0", "a/x + b = 0"], correct: 1, explanation: "A quadratic equation has the standard form ax² + bx + c = 0, where a ≠ 0." },
    { q: "What are the solutions to x² - 16 = 0?", options: ["x = 4 only", "x = -4 only", "x = 4 or x = -4", "x = 16 or x = -16"], correct: 2, explanation: "x² = 16 means x = 4 or x = -4, since both squared give 16." },
    { q: "Factor: x² + 7x + 12", options: ["(x+3)(x+4)", "(x+2)(x+6)", "(x+1)(x+12)", "(x+5)(x+2)"], correct: 0, explanation: "We need two numbers that multiply to 12 and add to 7: those are 3 and 4, giving (x+3)(x+4)." }
  ]
},
      {
        name: "The Quadratic Formula",
  questions: [
    { q: "What is the quadratic formula used to solve ax² + bx + c = 0?", options: ["x = -b ± √(b²-4ac) / 2a", "x = b ± √(b²+4ac) / 2a", "x = -b ± √(b²+4ac) / a", "x = a ± √(b²-4ac) / 2c"], correct: 0, explanation: "The quadratic formula is x = [-b ± √(b²-4ac)] / 2a." },
    { q: "In the quadratic formula, what does the expression b²-4ac tell you?", options: ["The value of x directly", "The number and type of solutions (the discriminant)", "The sum of the roots", "Nothing useful"], correct: 1, explanation: "b²-4ac is called the discriminant — it tells you whether there are 2, 1, or 0 real solutions." },
    { q: "For x² - 5x + 6 = 0, what are a, b, and c in the quadratic formula?", options: ["a=1, b=-5, c=6", "a=1, b=5, c=6", "a=1, b=-5, c=-6", "a=-1, b=-5, c=6"], correct: 0, explanation: "Matching to ax²+bx+c=0: a=1, b=-5, c=6." }
  ]
},
      {
        name: "Inequalities",
  questions: [
    { q: "Solve: x + 5 > 12", options: ["x > 5", "x > 6", "x > 7", "x > 8"], correct: 2, explanation: "Subtract 5 from both sides: x > 12 - 5 = 7." },
    { q: "Solve: 3x ≤ 21", options: ["x ≤ 6", "x ≤ 7", "x ≤ 8", "x ≤ 9"], correct: 1, explanation: "Divide both sides by 3: x ≤ 21/3 = 7." },
    { q: "When you multiply or divide an inequality by a negative number, what happens?", options: ["Nothing changes", "The inequality sign flips", "The variable disappears", "The inequality becomes an equation"], correct: 1, explanation: "Multiplying or dividing both sides of an inequality by a negative number flips the direction of the inequality sign." }
  ]
},
      {
        name: "Intermediate Algebra Word Problems",
  questions: [
    { q: "The sum of two numbers is 15, and their difference is 5. What are the two numbers?", options: ["5 and 10", "6 and 9", "7 and 8", "4 and 11"], correct: 0, explanation: "Let the numbers be x and y: x+y=15, x-y=5. Adding gives 2x=20, so x=10, and y=15-10=5." },
    { q: "A rectangle's length is 3 more than its width. If the perimeter is 26, what is the width?", options: ["4", "5", "6", "7"], correct: 1, explanation: "Let width=w, length=w+3. Perimeter: 2(w + w+3) = 26, so 2(2w+3)=26, 4w+6=26, 4w=20, w=5." },
    { q: "A number squared minus 9 equals 0. What are the possible values of the number?", options: ["3 only", "-3 only", "3 or -3", "9 or -9"], correct: 2, explanation: "x² - 9 = 0 means x² = 9, so x = 3 or x = -3." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "Simplify: 3(x + 4)", options: ["3x + 4", "3x + 12", "x + 12", "7x"], correct: 1, explanation: "Distribute the 3 to both terms: 3×x + 3×4 = 3x + 12." },
          { q: "Simplify: 5(2x - 3)", options: ["10x - 15", "10x - 3", "7x - 15", "10x + 15"], correct: 0, explanation: "Distribute the 5: 5×2x - 5×3 = 10x - 15." },
          { q: "Simplify: -2(x + 6)", options: ["-2x + 6", "-2x - 12", "2x - 12", "-2x + 12"], correct: 1, explanation: "Distribute the -2: -2×x + -2×6 = -2x - 12." },
          { q: "Simplify: 4x - 2x + 6", options: ["2x + 6", "6x + 6", "2x - 6", "8x"], correct: 0, explanation: "Combine like terms: 4x - 2x = 2x, and the +6 stays, giving 2x + 6." },
          { q: "Simplify: 3(x + 2) + 4x", options: ["7x + 2", "7x + 6", "3x + 6", "4x + 6"], correct: 1, explanation: "Distribute: 3x + 6 + 4x. Combine like terms: 3x + 4x = 7x, giving 7x + 6." },
          { q: "Simplify: 2(3x - 1) - 5", options: ["6x - 7", "6x - 6", "6x - 3", "5x - 7"], correct: 0, explanation: "Distribute: 6x - 2 - 5. Combine constants: -2 - 5 = -7, giving 6x - 7." },
          { q: "Simplify: (2x²)(3x³)", options: ["5x⁵", "6x⁵", "6x⁶", "5x⁶"], correct: 1, explanation: "Multiply coefficients (2×3=6) and add exponents (2+3=5): 6x⁵." },
          { q: "Simplify: (4x)(5x²)", options: ["9x³", "20x²", "20x³", "9x²"], correct: 2, explanation: "Multiply coefficients (4×5=20) and add exponents (1+2=3): 20x³." },
          { q: "Simplify: (3x²)(2x)", options: ["5x²", "5x³", "6x²", "6x³"], correct: 3, explanation: "Multiply coefficients (3×2=6) and add exponents (2+1=3): 6x³." },
          { q: "Solve the system using substitution: y = x + 2, and x + y = 10. What is x?", options: ["3", "4", "5", "6"], correct: 1, explanation: "Substitute y: x + (x+2) = 10, so 2x + 2 = 10, giving 2x = 8, so x = 4." },
          { q: "Solve the system: y = 2x, and x + y = 12. What is x?", options: ["2", "3", "4", "5"], correct: 2, explanation: "Substitute y: x + 2x = 12, so 3x = 12, giving x = 4." },
          { q: "Solve the system: x = y + 3, and 2x + y = 12. What is y?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Substitute x: 2(y+3) + y = 12, so 2y+6+y=12, giving 3y=6, so y=2." },
          { q: "Solve the system: x + y = 10, x − y = 2. What is x?", options: ["4", "5", "6", "7"], correct: 2, explanation: "Adding both equations eliminates y: 2x = 12, so x = 6." },
          { q: "Solve the system: 2x + y = 11, x - y = 1. What is x?", options: ["3", "4", "5", "6"], correct: 1, explanation: "Adding both equations eliminates y: 3x = 12, so x = 4." },
          { q: "Solve the system: x + y = 7, x - y = 3. What is y?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Subtracting: (x+y)-(x-y)=7-3, so 2y=4, giving y=2." },
          { q: "What is the standard form of a quadratic equation?", options: ["ax + b = 0", "ax² + bx + c = 0", "ax³ + b = 0", "a/x + b = 0"], correct: 1, explanation: "A quadratic equation has the standard form ax² + bx + c = 0, where a ≠ 0." },
          { q: "What are the solutions to x² - 16 = 0?", options: ["x = 4 only", "x = -4 only", "x = 4 or x = -4", "x = 16 or x = -16"], correct: 2, explanation: "x² = 16 means x = 4 or x = -4, since both squared give 16." },
          { q: "Factor: x² + 7x + 12", options: ["(x+3)(x+4)", "(x+2)(x+6)", "(x+1)(x+12)", "(x+5)(x+2)"], correct: 0, explanation: "We need two numbers that multiply to 12 and add to 7: those are 3 and 4, giving (x+3)(x+4)." },
          { q: "What is the quadratic formula used to solve ax² + bx + c = 0?", options: ["x = -b ± √(b²-4ac) / 2a", "x = b ± √(b²+4ac) / 2a", "x = -b ± √(b²+4ac) / a", "x = a ± √(b²-4ac) / 2c"], correct: 0, explanation: "The quadratic formula is x = [-b ± √(b²-4ac)] / 2a." },
          { q: "In the quadratic formula, what does the expression b²-4ac tell you?", options: ["The value of x directly", "The number and type of solutions (the discriminant)", "The sum of the roots", "Nothing useful"], correct: 1, explanation: "b²-4ac is called the discriminant — it tells you whether there are 2, 1, or 0 real solutions." },
          { q: "For x² - 5x + 6 = 0, what are a, b, and c in the quadratic formula?", options: ["a=1, b=-5, c=6", "a=1, b=5, c=6", "a=1, b=-5, c=-6", "a=-1, b=-5, c=6"], correct: 0, explanation: "Matching to ax²+bx+c=0: a=1, b=-5, c=6." },
          { q: "Solve: x + 5 > 12", options: ["x > 5", "x > 6", "x > 7", "x > 8"], correct: 2, explanation: "Subtract 5 from both sides: x > 12 - 5 = 7." },
          { q: "Solve: 3x ≤ 21", options: ["x ≤ 6", "x ≤ 7", "x ≤ 8", "x ≤ 9"], correct: 1, explanation: "Divide both sides by 3: x ≤ 21/3 = 7." },
          { q: "When you multiply or divide an inequality by a negative number, what happens?", options: ["Nothing changes", "The inequality sign flips", "The variable disappears", "The inequality becomes an equation"], correct: 1, explanation: "Multiplying or dividing both sides of an inequality by a negative number flips the direction of the inequality sign." },
          { q: "The sum of two numbers is 15, and their difference is 5. What are the two numbers?", options: ["5 and 10", "6 and 9", "7 and 8", "4 and 11"], correct: 0, explanation: "Let the numbers be x and y: x+y=15, x-y=5. Adding gives 2x=20, so x=10, and y=15-10=5." },
          { q: "A rectangle's length is 3 more than its width. If the perimeter is 26, what is the width?", options: ["4", "5", "6", "7"], correct: 1, explanation: "Let width=w, length=w+3. Perimeter: 2(w + w+3) = 26, so 2(2w+3)=26, 4w+6=26, 4w=20, w=5." },
          { q: "A number squared minus 9 equals 0. What are the possible values of the number?", options: ["3 only", "-3 only", "3 or -3", "9 or -9"], correct: 2, explanation: "x² - 9 = 0 means x² = 9, so x = 3 or x = -3." }
        ]
      }
    ]
  },
  {
    name: "Linear Equations & Graphing",
    lessons: [
      {
        name: "Slope-Intercept Form",
  questions: [
    { q: "In the equation y = mx + b, what does 'b' represent?", options: ["The slope", "The x-intercept", "The y-intercept", "The variable"], correct: 2, explanation: "'b' is the y-intercept — the value of y when x = 0, where the line crosses the y-axis." },
    { q: "In the equation y = mx + b, what does 'm' represent?", options: ["The slope", "The y-intercept", "The x-value", "A constant with no meaning"], correct: 0, explanation: "'m' is the slope, showing how steep the line is and its direction." },
    { q: "What is the slope of the line y = 3x + 2?", options: ["1", "2", "3", "5"], correct: 2, explanation: "In y = mx + b form, the coefficient of x is the slope, which is 3." }
  ]
},
      {
        name: "Writing Linear Equations",
  questions: [
    { q: "If a line passes through (0, 4) and has a slope of 2, what is its equation?", options: ["y = 2x + 4", "y = 4x + 2", "y = 2x - 4", "y = x + 4"], correct: 0, explanation: "With slope 2 and y-intercept 4, the equation in slope-intercept form is y = 2x + 4." },
    { q: "What is the equation of a line with slope -3 and y-intercept 5?", options: ["y = -3x + 5", "y = 3x - 5", "y = -3x - 5", "y = 5x - 3"], correct: 0, explanation: "Slope-intercept form is y = mx + b: with m=-3 and b=5, the equation is y = -3x + 5." },
    { q: "A line crosses the y-axis at 0 and has slope 4. What is its equation?", options: ["y = 4x", "y = x + 4", "y = 4", "y = x/4"], correct: 0, explanation: "With b=0, the equation simplifies to y = 4x." }
  ]
},
      {
        name: "Solving Linear Equations",
  questions: [
    { q: "Solve for x: 2x + 5 = 15", options: ["3", "4", "5", "6"], correct: 2, explanation: "Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5." },
    { q: "Solve for x: 4(x - 2) = 12", options: ["3", "4", "5", "6"], correct: 2, explanation: "Distribute: 4x - 8 = 12, then add 8: 4x = 20, then divide by 4: x = 5." },
    { q: "Solve for x: 3x - 7 = 14", options: ["5", "6", "7", "8"], correct: 2, explanation: "Add 7 to both sides: 3x = 21, then divide by 3: x = 7." }
  ]
},
      {
        name: "Graphing Lines",
  questions: [
    { q: "To graph y = 2x + 1, where does the line cross the y-axis?", options: ["(0, 0)", "(0, 1)", "(1, 0)", "(2, 1)"], correct: 1, explanation: "The y-intercept is 1, so the line crosses the y-axis at (0, 1)." },
    { q: "A line has a slope of 0. What does its graph look like?", options: ["A vertical line", "A horizontal line", "A diagonal line", "A curve"], correct: 1, explanation: "A slope of 0 means no vertical change as x increases, producing a horizontal line." },
    { q: "Starting at the y-intercept, a slope of 3/1 means you move how many units to plot the next point?", options: ["Up 1, right 3", "Up 3, right 1", "Down 3, right 1", "Up 3, left 1"], correct: 1, explanation: "Slope is rise/run: 3/1 means up 3 units and right 1 unit for each step." }
  ]
},
      {
        name: "X and Y Intercepts",
  questions: [
    { q: "What is the y-intercept of y = 5x - 10?", options: ["-10", "-5", "5", "10"], correct: 0, explanation: "The y-intercept is the constant term when x=0: y = 5(0) - 10 = -10." },
    { q: "What is the x-intercept of y = 2x - 8? (where the line crosses the x-axis, y=0)", options: ["2", "4", "6", "8"], correct: 1, explanation: "Set y=0: 0 = 2x - 8, so 2x=8, giving x=4." },
    { q: "What is the x-intercept of y = 3x - 12?", options: ["3", "4", "6", "12"], correct: 1, explanation: "Set y=0: 0 = 3x - 12, so 3x=12, giving x=4." }
  ]
},
      {
        name: "Parallel and Perpendicular Lines",
  questions: [
    { q: "Two lines are parallel. What must be true about their slopes?", options: ["They must be equal", "They must be negative reciprocals", "They must add to zero", "There's no relationship"], correct: 0, explanation: "Parallel lines never intersect and always have the exact same slope." },
    { q: "A line has slope 2. What slope would a line perpendicular to it have?", options: ["2", "-2", "1/2", "-1/2"], correct: 3, explanation: "Perpendicular lines have slopes that are negative reciprocals: the negative reciprocal of 2 is -1/2." },
    { q: "Are the lines y = 3x + 1 and y = 3x - 5 parallel?", options: ["Yes, because they have the same slope", "No, because they have different y-intercepts", "No, because they are the same line", "Cannot tell"], correct: 0, explanation: "Both lines have slope 3, so they are parallel (and since their y-intercepts differ, they are distinct parallel lines)." }
  ]
},
      {
        name: "Graphing Linear Inequalities",
  questions: [
    { q: "When graphing y > 2x + 1, how is the boundary line drawn?", options: ["Solid line", "Dashed line", "No line needed", "A curved line"], correct: 1, explanation: "Strict inequalities (> or <) use a dashed line, since points ON the line aren't included in the solution." },
    { q: "When graphing y ≤ 3x - 2, how is the boundary line drawn?", options: ["Solid line", "Dashed line", "No line needed", "A curved line"], correct: 0, explanation: "Inequalities with ≤ or ≥ use a solid line, since points on the line ARE included." },
    { q: "For y > x + 2, which side of the line gets shaded?", options: ["Above the line", "Below the line", "Left of the line", "No shading needed"], correct: 0, explanation: "Since y is greater than the line's values, the region above the line is shaded." }
  ]
},
      {
        name: "Rate of Change",
  questions: [
    { q: "What does the slope of a line represent in a real-world context, like distance vs. time?", options: ["The starting point", "The rate of change (like speed)", "The total distance", "The ending time"], correct: 1, explanation: "Slope represents the rate of change — in a distance-time graph, this is speed." },
    { q: "A line passes through (1, 5) and (3, 9). What is the rate of change (slope)?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Slope = (9-5)/(3-1) = 4/2 = 2." },
    { q: "A line passes through (2, 3) and (4, 11). What is the rate of change (slope)?", options: ["2", "4", "6", "8"], correct: 1, explanation: "Slope = (11-3)/(4-2) = 8/2 = 4." }
  ]
},
      {
        name: "Linear Equations Word Problems",
  questions: [
    { q: "A taxi charges $3 plus $2 per mile. Write an equation for the total cost y after x miles.", options: ["y = 2x + 3", "y = 3x + 2", "y = 2x - 3", "y = 5x"], correct: 0, explanation: "The base fee ($3) is the y-intercept, and the per-mile rate ($2) is the slope: y = 2x + 3." },
    { q: "Using y = 2x + 3 for taxi fare, how much does a 10-mile ride cost?", options: ["$20", "$23", "$25", "$30"], correct: 1, explanation: "y = 2(10) + 3 = 20 + 3 = $23." },
    { q: "A phone plan costs $20 plus $0.10 per text. If the bill was $35, how many texts were sent?", options: ["100", "150", "200", "250"], correct: 1, explanation: "35 = 0.10x + 20, so 0.10x = 15, giving x = 150 texts." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "In the equation y = mx + b, what does 'b' represent?", options: ["The slope", "The x-intercept", "The y-intercept", "The variable"], correct: 2, explanation: "'b' is the y-intercept — the value of y when x = 0, where the line crosses the y-axis." },
          { q: "In the equation y = mx + b, what does 'm' represent?", options: ["The slope", "The y-intercept", "The x-value", "A constant with no meaning"], correct: 0, explanation: "'m' is the slope, showing how steep the line is and its direction." },
          { q: "What is the slope of the line y = 3x + 2?", options: ["1", "2", "3", "5"], correct: 2, explanation: "In y = mx + b form, the coefficient of x is the slope, which is 3." },
          { q: "If a line passes through (0, 4) and has a slope of 2, what is its equation?", options: ["y = 2x + 4", "y = 4x + 2", "y = 2x - 4", "y = x + 4"], correct: 0, explanation: "With slope 2 and y-intercept 4, the equation in slope-intercept form is y = 2x + 4." },
          { q: "What is the equation of a line with slope -3 and y-intercept 5?", options: ["y = -3x + 5", "y = 3x - 5", "y = -3x - 5", "y = 5x - 3"], correct: 0, explanation: "Slope-intercept form is y = mx + b: with m=-3 and b=5, the equation is y = -3x + 5." },
          { q: "A line crosses the y-axis at 0 and has slope 4. What is its equation?", options: ["y = 4x", "y = x + 4", "y = 4", "y = x/4"], correct: 0, explanation: "With b=0, the equation simplifies to y = 4x." },
          { q: "Solve for x: 2x + 5 = 15", options: ["3", "4", "5", "6"], correct: 2, explanation: "Subtract 5 from both sides: 2x = 10, then divide by 2: x = 5." },
          { q: "Solve for x: 4(x - 2) = 12", options: ["3", "4", "5", "6"], correct: 2, explanation: "Distribute: 4x - 8 = 12, then add 8: 4x = 20, then divide by 4: x = 5." },
          { q: "Solve for x: 3x - 7 = 14", options: ["5", "6", "7", "8"], correct: 2, explanation: "Add 7 to both sides: 3x = 21, then divide by 3: x = 7." },
          { q: "To graph y = 2x + 1, where does the line cross the y-axis?", options: ["(0, 0)", "(0, 1)", "(1, 0)", "(2, 1)"], correct: 1, explanation: "The y-intercept is 1, so the line crosses the y-axis at (0, 1)." },
          { q: "A line has a slope of 0. What does its graph look like?", options: ["A vertical line", "A horizontal line", "A diagonal line", "A curve"], correct: 1, explanation: "A slope of 0 means no vertical change as x increases, producing a horizontal line." },
          { q: "Starting at the y-intercept, a slope of 3/1 means you move how many units to plot the next point?", options: ["Up 1, right 3", "Up 3, right 1", "Down 3, right 1", "Up 3, left 1"], correct: 1, explanation: "Slope is rise/run: 3/1 means up 3 units and right 1 unit for each step." },
          { q: "What is the y-intercept of y = 5x - 10?", options: ["-10", "-5", "5", "10"], correct: 0, explanation: "The y-intercept is the constant term when x=0: y = 5(0) - 10 = -10." },
          { q: "What is the x-intercept of y = 2x - 8? (where the line crosses the x-axis, y=0)", options: ["2", "4", "6", "8"], correct: 1, explanation: "Set y=0: 0 = 2x - 8, so 2x=8, giving x=4." },
          { q: "What is the x-intercept of y = 3x - 12?", options: ["3", "4", "6", "12"], correct: 1, explanation: "Set y=0: 0 = 3x - 12, so 3x=12, giving x=4." },
          { q: "Two lines are parallel. What must be true about their slopes?", options: ["They must be equal", "They must be negative reciprocals", "They must add to zero", "There's no relationship"], correct: 0, explanation: "Parallel lines never intersect and always have the exact same slope." },
          { q: "A line has slope 2. What slope would a line perpendicular to it have?", options: ["2", "-2", "1/2", "-1/2"], correct: 3, explanation: "Perpendicular lines have slopes that are negative reciprocals: the negative reciprocal of 2 is -1/2." },
          { q: "Are the lines y = 3x + 1 and y = 3x - 5 parallel?", options: ["Yes, because they have the same slope", "No, because they have different y-intercepts", "No, because they are the same line", "Cannot tell"], correct: 0, explanation: "Both lines have slope 3, so they are parallel (and since their y-intercepts differ, they are distinct parallel lines)." },
          { q: "When graphing y > 2x + 1, how is the boundary line drawn?", options: ["Solid line", "Dashed line", "No line needed", "A curved line"], correct: 1, explanation: "Strict inequalities (> or <) use a dashed line, since points ON the line aren't included in the solution." },
          { q: "When graphing y ≤ 3x - 2, how is the boundary line drawn?", options: ["Solid line", "Dashed line", "No line needed", "A curved line"], correct: 0, explanation: "Inequalities with ≤ or ≥ use a solid line, since points on the line ARE included." },
          { q: "For y > x + 2, which side of the line gets shaded?", options: ["Above the line", "Below the line", "Left of the line", "No shading needed"], correct: 0, explanation: "Since y is greater than the line's values, the region above the line is shaded." },
          { q: "What does the slope of a line represent in a real-world context, like distance vs. time?", options: ["The starting point", "The rate of change (like speed)", "The total distance", "The ending time"], correct: 1, explanation: "Slope represents the rate of change — in a distance-time graph, this is speed." },
          { q: "A line passes through (1, 5) and (3, 9). What is the rate of change (slope)?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Slope = (9-5)/(3-1) = 4/2 = 2." },
          { q: "A line passes through (2, 3) and (4, 11). What is the rate of change (slope)?", options: ["2", "4", "6", "8"], correct: 1, explanation: "Slope = (11-3)/(4-2) = 8/2 = 4." },
          { q: "A taxi charges $3 plus $2 per mile. Write an equation for the total cost y after x miles.", options: ["y = 2x + 3", "y = 3x + 2", "y = 2x - 3", "y = 5x"], correct: 0, explanation: "The base fee ($3) is the y-intercept, and the per-mile rate ($2) is the slope: y = 2x + 3." },
          { q: "Using y = 2x + 3 for taxi fare, how much does a 10-mile ride cost?", options: ["$20", "$23", "$25", "$30"], correct: 1, explanation: "y = 2(10) + 3 = 20 + 3 = $23." },
          { q: "A phone plan costs $20 plus $0.10 per text. If the bill was $35, how many texts were sent?", options: ["100", "150", "200", "250"], correct: 1, explanation: "35 = 0.10x + 20, so 0.10x = 15, giving x = 150 texts." }
        ]
      }
    ]
  },
  {
    name: "Coordinate Geometry & Slope",
    lessons: [
      {
        name: "The Coordinate Plane",
  questions: [
    { q: "In the point (3, -2), which number is the x-coordinate?", options: ["3", "-2", "Both", "Neither"], correct: 0, explanation: "In an ordered pair (x, y), the first number is always the x-coordinate — here, 3." },
    { q: "Which quadrant contains the point (-4, 5)?", options: ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"], correct: 1, explanation: "Quadrant II has negative x and positive y values, matching (-4, 5)." },
    { q: "What are the coordinates of the origin?", options: ["(1, 1)", "(0, 0)", "(-1, -1)", "(0, 1)"], correct: 1, explanation: "The origin, where the axes cross, is always at (0, 0)." }
  ]
},
      {
        name: "Calculating Slope from Two Points",
  questions: [
    { q: "What is the slope of the line through points (2,3) and (4,7)?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Slope = (7-3)/(4-2) = 4/2 = 2." },
    { q: "What is the slope of the line through (1,1) and (5,9)?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Slope = (9-1)/(5-1) = 8/4 = 2." },
    { q: "What is the slope of the line through (0,4) and (3,-2)?", options: ["-2", "-1", "1", "2"], correct: 0, explanation: "Slope = (-2-4)/(3-0) = -6/3 = -2." }
  ]
},
      {
        name: "Identifying Slope Types",
  questions: [
    { q: "A line rises from left to right. What type of slope does it have?", options: ["Positive", "Negative", "Zero", "Undefined"], correct: 0, explanation: "A line rising left to right has a positive slope." },
    { q: "A line falls from left to right. What type of slope does it have?", options: ["Positive", "Negative", "Zero", "Undefined"], correct: 1, explanation: "A line falling left to right has a negative slope." },
    { q: "What is the slope of a perfectly vertical line?", options: ["0", "1", "Undefined", "Negative"], correct: 2, explanation: "A vertical line has an undefined slope, since the run (horizontal change) is 0, making rise/run undefined." }
  ]
},
      {
        name: "Distance Between Two Points",
  questions: [
    { q: "What is the distance between points (0,0) and (3,4)?", options: ["3", "4", "5", "7"], correct: 2, explanation: "Using the distance formula (essentially the Pythagorean theorem): √(3²+4²) = √(9+16) = √25 = 5." },
    { q: "What is the distance between points (1,1) and (4,5)?", options: ["4", "5", "6", "7"], correct: 1, explanation: "Distance = √((4-1)²+(5-1)²) = √(9+16) = √25 = 5." },
    { q: "What is the distance between points (0,0) and (6,8)?", options: ["8", "9", "10", "12"], correct: 2, explanation: "Distance = √(6²+8²) = √(36+64) = √100 = 10." }
  ]
},
      {
        name: "Midpoint Formula",
  questions: [
    { q: "What is the midpoint of the segment connecting (2,4) and (6,8)?", options: ["(3,5)", "(4,6)", "(5,7)", "(8,12)"], correct: 1, explanation: "Midpoint = ((2+6)/2, (4+8)/2) = (4, 6)." },
    { q: "What is the midpoint of (0,0) and (10,4)?", options: ["(4,2)", "(5,2)", "(5,4)", "(10,2)"], correct: 1, explanation: "Midpoint = ((0+10)/2, (0+4)/2) = (5, 2)." },
    { q: "What is the midpoint of (-2,3) and (4,-1)?", options: ["(1,1)", "(1,2)", "(2,1)", "(3,1)"], correct: 0, explanation: "Midpoint = ((-2+4)/2, (3+-1)/2) = (1, 1)." }
  ]
},
      {
        name: "Slope Practice: Interactive",
  questions: [
    { type: "slope-drag", q: "Drag the point so the line through the origin has a slope of 2.", fixedPoint: { x: 0, y: 0 }, targetSlope: 2, explanation: "Slope = rise/run. A slope of 2 means for every 1 unit you move right, the line rises 2 units — for example, passing through (1,2) or (2,4)." },
    { type: "slope-drag", q: "Drag the point so the line through the origin has a slope of -1.", fixedPoint: { x: 0, y: 0 }, targetSlope: -1, explanation: "A slope of -1 means for every 1 unit right, the line falls 1 unit — for example, passing through (1,-1) or (2,-2)." },
    { type: "slope-drag", q: "Drag the point so the line through the origin has a slope of 3.", fixedPoint: { x: 0, y: 0 }, targetSlope: 3, explanation: "A slope of 3 means for every 1 unit right, the line rises 3 units — for example, passing through (1,3) or (2,6)." }
  ]
},
      {
        name: "Writing Equations from Two Points",
  questions: [
    { q: "What is the equation of the line through (0,2) with slope 3?", options: ["y = 3x + 2", "y = 2x + 3", "y = 3x - 2", "y = x + 2"], correct: 0, explanation: "Using slope-intercept form with slope 3 and y-intercept 2: y = 3x + 2." },
    { q: "A line passes through (2,3) and (4,7). What is its slope-intercept equation?", options: ["y = 2x - 1", "y = 2x + 1", "y = x + 1", "y = 2x - 3"], correct: 0, explanation: "Slope = (7-3)/(4-2) = 2. Using point (2,3): 3 = 2(2) + b, so b = -1, giving y = 2x - 1." },
    { q: "A line passes through (0,-3) and has slope 4. What is its equation?", options: ["y = 4x - 3", "y = 4x + 3", "y = -3x + 4", "y = 3x - 4"], correct: 0, explanation: "With y-intercept -3 and slope 4: y = 4x - 3." }
  ]
},
      {
        name: "Parallel Lines in Coordinate Geometry",
  questions: [
    { q: "Two lines are parallel if they have the same what?", options: ["Y-intercept", "Slope", "X-intercept", "Length"], correct: 1, explanation: "Parallel lines always have identical slopes, even though they cross the y-axis at different points." },
    { q: "What is the y-intercept of the line y = 4x − 7?", options: ["-7", "-4", "4", "7"], correct: 0, explanation: "In y = mx + b form, the y-intercept is the constant term: -7." },
    { q: "Line A has slope 5, and Line B has slope 5 but a different y-intercept. Are they parallel?", options: ["Yes", "No", "Only if they share a point", "Cannot tell"], correct: 0, explanation: "Since both lines have the same slope (5) and different y-intercepts, they are parallel and never intersect." }
  ]
},
      {
        name: "Coordinate Geometry Word Problems",
  questions: [
    { q: "Two towns are located at (0,0) and (6,8) on a map (units in miles). How far apart are they in a straight line?", options: ["8 miles", "9 miles", "10 miles", "14 miles"], correct: 2, explanation: "Distance = √(6²+8²) = √100 = 10 miles." },
    { q: "Two friends meet exactly halfway between their houses at (2,4) and (8,10). Where do they meet?", options: ["(4,6)", "(5,7)", "(6,8)", "(5,6)"], correct: 1, explanation: "Midpoint = ((2+8)/2, (4+10)/2) = (5, 7)." },
    { q: "A delivery route goes from (1,2) to (5,10). What is the slope (steepness) of this route on the grid?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Slope = (10-2)/(5-1) = 8/4 = 2." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "In the point (3, -2), which number is the x-coordinate?", options: ["3", "-2", "Both", "Neither"], correct: 0, explanation: "In an ordered pair (x, y), the first number is always the x-coordinate — here, 3." },
          { q: "Which quadrant contains the point (-4, 5)?", options: ["Quadrant I", "Quadrant II", "Quadrant III", "Quadrant IV"], correct: 1, explanation: "Quadrant II has negative x and positive y values, matching (-4, 5)." },
          { q: "What are the coordinates of the origin?", options: ["(1, 1)", "(0, 0)", "(-1, -1)", "(0, 1)"], correct: 1, explanation: "The origin, where the axes cross, is always at (0, 0)." },
          { q: "What is the slope of the line through points (2,3) and (4,7)?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Slope = (7-3)/(4-2) = 4/2 = 2." },
          { q: "What is the slope of the line through (1,1) and (5,9)?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Slope = (9-1)/(5-1) = 8/4 = 2." },
          { q: "What is the slope of the line through (0,4) and (3,-2)?", options: ["-2", "-1", "1", "2"], correct: 0, explanation: "Slope = (-2-4)/(3-0) = -6/3 = -2." },
          { q: "A line rises from left to right. What type of slope does it have?", options: ["Positive", "Negative", "Zero", "Undefined"], correct: 0, explanation: "A line rising left to right has a positive slope." },
          { q: "A line falls from left to right. What type of slope does it have?", options: ["Positive", "Negative", "Zero", "Undefined"], correct: 1, explanation: "A line falling left to right has a negative slope." },
          { q: "What is the slope of a perfectly vertical line?", options: ["0", "1", "Undefined", "Negative"], correct: 2, explanation: "A vertical line has an undefined slope, since the run (horizontal change) is 0, making rise/run undefined." },
          { q: "What is the distance between points (0,0) and (3,4)?", options: ["3", "4", "5", "7"], correct: 2, explanation: "Using the distance formula (essentially the Pythagorean theorem): √(3²+4²) = √(9+16) = √25 = 5." },
          { q: "What is the distance between points (1,1) and (4,5)?", options: ["4", "5", "6", "7"], correct: 1, explanation: "Distance = √((4-1)²+(5-1)²) = √(9+16) = √25 = 5." },
          { q: "What is the distance between points (0,0) and (6,8)?", options: ["8", "9", "10", "12"], correct: 2, explanation: "Distance = √(6²+8²) = √(36+64) = √100 = 10." },
          { q: "What is the midpoint of the segment connecting (2,4) and (6,8)?", options: ["(3,5)", "(4,6)", "(5,7)", "(8,12)"], correct: 1, explanation: "Midpoint = ((2+6)/2, (4+8)/2) = (4, 6)." },
          { q: "What is the midpoint of (0,0) and (10,4)?", options: ["(4,2)", "(5,2)", "(5,4)", "(10,2)"], correct: 1, explanation: "Midpoint = ((0+10)/2, (0+4)/2) = (5, 2)." },
          { q: "What is the midpoint of (-2,3) and (4,-1)?", options: ["(1,1)", "(1,2)", "(2,1)", "(3,1)"], correct: 0, explanation: "Midpoint = ((-2+4)/2, (3+-1)/2) = (1, 1)." },
          { type: "slope-drag", q: "Drag the point so the line through the origin has a slope of 2.", fixedPoint: { x: 0, y: 0 }, targetSlope: 2, explanation: "Slope = rise/run. A slope of 2 means for every 1 unit you move right, the line rises 2 units — for example, passing through (1,2) or (2,4)." },
          { type: "slope-drag", q: "Drag the point so the line through the origin has a slope of -1.", fixedPoint: { x: 0, y: 0 }, targetSlope: -1, explanation: "A slope of -1 means for every 1 unit right, the line falls 1 unit — for example, passing through (1,-1) or (2,-2)." },
          { type: "slope-drag", q: "Drag the point so the line through the origin has a slope of 3.", fixedPoint: { x: 0, y: 0 }, targetSlope: 3, explanation: "A slope of 3 means for every 1 unit right, the line rises 3 units — for example, passing through (1,3) or (2,6)." },
          { q: "What is the equation of the line through (0,2) with slope 3?", options: ["y = 3x + 2", "y = 2x + 3", "y = 3x - 2", "y = x + 2"], correct: 0, explanation: "Using slope-intercept form with slope 3 and y-intercept 2: y = 3x + 2." },
          { q: "A line passes through (2,3) and (4,7). What is its slope-intercept equation?", options: ["y = 2x - 1", "y = 2x + 1", "y = x + 1", "y = 2x - 3"], correct: 0, explanation: "Slope = (7-3)/(4-2) = 2. Using point (2,3): 3 = 2(2) + b, so b = -1, giving y = 2x - 1." },
          { q: "A line passes through (0,-3) and has slope 4. What is its equation?", options: ["y = 4x - 3", "y = 4x + 3", "y = -3x + 4", "y = 3x - 4"], correct: 0, explanation: "With y-intercept -3 and slope 4: y = 4x - 3." },
          { q: "Two lines are parallel if they have the same what?", options: ["Y-intercept", "Slope", "X-intercept", "Length"], correct: 1, explanation: "Parallel lines always have identical slopes, even though they cross the y-axis at different points." },
          { q: "What is the y-intercept of the line y = 4x − 7?", options: ["-7", "-4", "4", "7"], correct: 0, explanation: "In y = mx + b form, the y-intercept is the constant term: -7." },
          { q: "Line A has slope 5, and Line B has slope 5 but a different y-intercept. Are they parallel?", options: ["Yes", "No", "Only if they share a point", "Cannot tell"], correct: 0, explanation: "Since both lines have the same slope (5) and different y-intercepts, they are parallel and never intersect." },
          { q: "Two towns are located at (0,0) and (6,8) on a map (units in miles). How far apart are they in a straight line?", options: ["8 miles", "9 miles", "10 miles", "14 miles"], correct: 2, explanation: "Distance = √(6²+8²) = √100 = 10 miles." },
          { q: "Two friends meet exactly halfway between their houses at (2,4) and (8,10). Where do they meet?", options: ["(4,6)", "(5,7)", "(6,8)", "(5,6)"], correct: 1, explanation: "Midpoint = ((2+8)/2, (4+10)/2) = (5, 7)." },
          { q: "A delivery route goes from (1,2) to (5,10). What is the slope (steepness) of this route on the grid?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Slope = (10-2)/(5-1) = 8/4 = 2." }
        ]
      }
    ]
  },
  {
    name: "Systems of Equations",
    lessons: [
      {
        name: "What Is a System of Equations?",
  questions: [
    { q: "What does it mean to 'solve' a system of two equations?", options: ["Find any value that works for one equation", "Find the values that satisfy both equations at the same time", "Add the two equations together", "Graph only one of the lines"], correct: 1, explanation: "Solving a system means finding the value(s) that make every equation in the system true simultaneously." },
    { q: "How many equations does a 'system of equations' typically involve?", options: ["Exactly one", "Two or more", "Always three", "It varies randomly"], correct: 1, explanation: "A system of equations involves two or more equations considered together." },
    { q: "Is (2,3) a solution to the system x+y=5 and x-y=-1?", options: ["Yes, it satisfies both equations", "No, it fails the first equation", "No, it fails the second equation", "Cannot tell without graphing"], correct: 0, explanation: "Check: 2+3=5 ✓ and 2-3=-1 ✓. Both equations are satisfied, so (2,3) is a solution." }
  ]
},
      {
        name: "Solving Systems by Graphing",
  questions: [
    { q: "Graphically, the solution to a system of two linear equations is:", options: ["The area between the lines", "The point where the lines intersect", "The steeper line's slope", "Always the origin"], correct: 1, explanation: "The solution to a system of two linear equations is the point (or points) where their graphs intersect." },
    { q: "If you graph y=x+2 and y=3x-2, at what x-value do they intersect?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Setting equal: x+2=3x-2, so 4=2x, giving x=2." },
    { q: "When solving by graphing, what should you do after finding the intersection point?", options: ["Nothing more is needed", "Check the point satisfies both original equations", "Redraw the graph", "Assume it's correct"], correct: 1, explanation: "Always verify the intersection point actually satisfies both original equations, to catch any graphing errors." }
  ]
},
      {
        name: "Solving Systems by Substitution",
  questions: [
    { q: "Solve using substitution: y = 3x, and x + y = 8. What is x?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Substitute y: x + 3x = 8, so 4x=8, giving x=2." },
    { q: "Solve using substitution: x = y - 3, and 2x + y = 12. What is y?", options: ["4", "5", "6", "7"], correct: 2, explanation: "Substitute x: 2(y-3) + y = 12, so 2y-6+y=12, giving 3y=18, so y=6." },
    { q: "Solve using substitution: y = 4x - 1, and x + y = 9. What is x?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Substitute y: x + 4x - 1 = 9, so 5x = 10, giving x = 2." }
  ]
},
      {
        name: "Solving Systems by Elimination",
  questions: [
    { q: "Solve the system: x + y = 10 and x - y = 4. What is x?", options: ["5", "6", "7", "8"], correct: 2, explanation: "Adding both equations: 2x = 14, so x = 7." },
    { q: "Using the same system (x + y = 10, x - y = 4), what is y?", options: ["2", "3", "4", "5"], correct: 1, explanation: "With x = 7, substitute into x + y = 10: 7 + y = 10, so y = 3." },
    { q: "Solve the system: 3x + y = 14 and x - y = 2. What is x?", options: ["3", "4", "5", "6"], correct: 1, explanation: "Adding both equations: 4x = 16, so x = 4." }
  ]
},
      {
        name: "Types of Solutions: One, None, Infinite",
  questions: [
    { q: "A system has two lines that intersect at exactly one point. How many solutions does it have?", options: ["Zero", "Exactly one", "Infinite", "Cannot tell"], correct: 1, explanation: "Two intersecting (non-parallel, non-identical) lines have exactly one solution: their single intersection point." },
    { q: "A system has two identical lines (the same line written differently). How many solutions does it have?", options: ["Zero", "Exactly one", "Infinitely many", "Exactly two"], correct: 2, explanation: "If both equations describe the same line, every point on that line is a solution — infinitely many." },
    { q: "If two lines in a system are parallel and never intersect, how many solutions does the system have?", options: ["Infinite solutions", "Exactly one solution", "No solution", "Exactly two solutions"], correct: 2, explanation: "Parallel lines never cross, so a system made of two parallel lines has no solution." }
  ]
},
      {
        name: "Systems with No Solution",
  questions: [
    { q: "Which pair of equations has no solution? A) y=2x+1 and y=2x+5. B) y=2x+1 and y=3x+1", options: ["A, because they have the same slope but different intercepts", "B, because they have different slopes", "Both have solutions", "Neither has a solution"], correct: 0, explanation: "Pair A has identical slopes (2) but different y-intercepts, meaning the lines are parallel and never meet — no solution." },
    { q: "If you solve a system algebraically and end up with a false statement like '5 = 8', what does this mean?", options: ["x = 5", "y = 8", "The system has no solution", "The system has infinite solutions"], correct: 2, explanation: "Reaching an impossible, false statement means the equations contradict each other — the system has no solution." },
    { q: "Do the lines y = -x + 3 and y = -x - 4 intersect?", options: ["Yes, at one point", "No, they are parallel", "Yes, infinitely many times", "Cannot tell"], correct: 1, explanation: "Both lines have slope -1 but different y-intercepts, so they are parallel and never intersect." }
  ]
},
      {
        name: "Systems with Infinite Solutions",
  questions: [
    { q: "If solving a system algebraically leads to a true statement like '7 = 7', what does this mean?", options: ["The system has no solution", "The system has exactly one solution", "The system has infinitely many solutions", "There was a calculation error"], correct: 2, explanation: "A true statement with no variables (like 7=7) means the two equations are equivalent — every point that satisfies one satisfies the other, giving infinite solutions." },
    { q: "Are y = 2x + 4 and 2y = 4x + 8 the same line?", options: ["Yes, dividing the second equation by 2 gives the first", "No, they are different lines", "Yes, but only at one point", "Cannot tell without graphing"], correct: 0, explanation: "Dividing 2y=4x+8 by 2 gives y=2x+4, which is identical to the first equation — they're the same line." },
    { q: "A system with infinitely many solutions means the two equations represent:", options: ["Two different parallel lines", "The exact same line", "Two lines meeting once", "Two curves"], correct: 1, explanation: "Infinite solutions occur when both equations describe the exact same line." }
  ]
},
      {
        name: "Systems of Inequalities",
  questions: [
    { q: "What does the solution to a system of inequalities look like on a graph?", options: ["A single point", "A single line", "A region where the shaded areas overlap", "Nothing can be graphed"], correct: 2, explanation: "The solution to a system of inequalities is the overlapping shaded region that satisfies all the inequalities at once." },
    { q: "If a point satisfies y > x and y < 5, is (2, 3) a solution?", options: ["Yes, it satisfies both", "No, it fails y > x", "No, it fails y < 5", "Cannot tell"], correct: 0, explanation: "Check: 3 > 2 ✓ and 3 < 5 ✓. Both are satisfied, so (2,3) is a solution." },
    { q: "Is (1, 6) a solution to y > x and y < 5?", options: ["Yes, it satisfies both", "No, it fails y > x", "No, it fails y < 5", "Cannot tell"], correct: 2, explanation: "Check: 6 > 1 ✓, but 6 < 5 is false. Since it fails one inequality, it's not a solution to the system." }
  ]
},
      {
        name: "Systems of Equations Word Problems",
  questions: [
    { q: "Adult tickets cost $8 and child tickets cost $5. If 10 tickets were sold for $65 total, how many adult tickets were sold?", options: ["3", "4", "5", "6"], correct: 2, explanation: "Let a=adult, c=child. a+c=10 and 8a+5c=65. Substituting c=10-a: 8a+5(10-a)=65, so 3a=15, giving a=5." },
    { q: "Two numbers add to 20, and one is 4 more than the other. What is the smaller number?", options: ["6", "7", "8", "9"], correct: 2, explanation: "Let numbers be x and x+4: x+(x+4)=20, so 2x=16, giving x=8 (the smaller number)." },
    { q: "A farm has chickens and cows totaling 25 animals and 70 legs. How many chickens are there? (chickens have 2 legs, cows have 4)", options: ["10", "12", "15", "18"], correct: 2, explanation: "Let c=chickens, w=cows. c+w=25, 2c+4w=70. From first: w=25-c. Substitute: 2c+4(25-c)=70, 2c+100-4c=70, -2c=-30, c=15." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What does it mean to 'solve' a system of two equations?", options: ["Find any value that works for one equation", "Find the values that satisfy both equations at the same time", "Add the two equations together", "Graph only one of the lines"], correct: 1, explanation: "Solving a system means finding the value(s) that make every equation in the system true simultaneously." },
          { q: "How many equations does a 'system of equations' typically involve?", options: ["Exactly one", "Two or more", "Always three", "It varies randomly"], correct: 1, explanation: "A system of equations involves two or more equations considered together." },
          { q: "Is (2,3) a solution to the system x+y=5 and x-y=-1?", options: ["Yes, it satisfies both equations", "No, it fails the first equation", "No, it fails the second equation", "Cannot tell without graphing"], correct: 0, explanation: "Check: 2+3=5 ✓ and 2-3=-1 ✓. Both equations are satisfied, so (2,3) is a solution." },
          { q: "Graphically, the solution to a system of two linear equations is:", options: ["The area between the lines", "The point where the lines intersect", "The steeper line's slope", "Always the origin"], correct: 1, explanation: "The solution to a system of two linear equations is the point (or points) where their graphs intersect." },
          { q: "If you graph y=x+2 and y=3x-2, at what x-value do they intersect?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Setting equal: x+2=3x-2, so 4=2x, giving x=2." },
          { q: "When solving by graphing, what should you do after finding the intersection point?", options: ["Nothing more is needed", "Check the point satisfies both original equations", "Redraw the graph", "Assume it's correct"], correct: 1, explanation: "Always verify the intersection point actually satisfies both original equations, to catch any graphing errors." },
          { q: "Solve using substitution: y = 3x, and x + y = 8. What is x?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Substitute y: x + 3x = 8, so 4x=8, giving x=2." },
          { q: "Solve using substitution: x = y - 3, and 2x + y = 12. What is y?", options: ["4", "5", "6", "7"], correct: 2, explanation: "Substitute x: 2(y-3) + y = 12, so 2y-6+y=12, giving 3y=18, so y=6." },
          { q: "Solve using substitution: y = 4x - 1, and x + y = 9. What is x?", options: ["1", "2", "3", "4"], correct: 1, explanation: "Substitute y: x + 4x - 1 = 9, so 5x = 10, giving x = 2." },
          { q: "Solve the system: x + y = 10 and x - y = 4. What is x?", options: ["5", "6", "7", "8"], correct: 2, explanation: "Adding both equations: 2x = 14, so x = 7." },
          { q: "Using the same system (x + y = 10, x - y = 4), what is y?", options: ["2", "3", "4", "5"], correct: 1, explanation: "With x = 7, substitute into x + y = 10: 7 + y = 10, so y = 3." },
          { q: "Solve the system: 3x + y = 14 and x - y = 2. What is x?", options: ["3", "4", "5", "6"], correct: 1, explanation: "Adding both equations: 4x = 16, so x = 4." },
          { q: "A system has two lines that intersect at exactly one point. How many solutions does it have?", options: ["Zero", "Exactly one", "Infinite", "Cannot tell"], correct: 1, explanation: "Two intersecting (non-parallel, non-identical) lines have exactly one solution: their single intersection point." },
          { q: "A system has two identical lines (the same line written differently). How many solutions does it have?", options: ["Zero", "Exactly one", "Infinitely many", "Exactly two"], correct: 2, explanation: "If both equations describe the same line, every point on that line is a solution — infinitely many." },
          { q: "If two lines in a system are parallel and never intersect, how many solutions does the system have?", options: ["Infinite solutions", "Exactly one solution", "No solution", "Exactly two solutions"], correct: 2, explanation: "Parallel lines never cross, so a system made of two parallel lines has no solution." },
          { q: "Which pair of equations has no solution? A) y=2x+1 and y=2x+5. B) y=2x+1 and y=3x+1", options: ["A, because they have the same slope but different intercepts", "B, because they have different slopes", "Both have solutions", "Neither has a solution"], correct: 0, explanation: "Pair A has identical slopes (2) but different y-intercepts, meaning the lines are parallel and never meet — no solution." },
          { q: "If you solve a system algebraically and end up with a false statement like '5 = 8', what does this mean?", options: ["x = 5", "y = 8", "The system has no solution", "The system has infinite solutions"], correct: 2, explanation: "Reaching an impossible, false statement means the equations contradict each other — the system has no solution." },
          { q: "Do the lines y = -x + 3 and y = -x - 4 intersect?", options: ["Yes, at one point", "No, they are parallel", "Yes, infinitely many times", "Cannot tell"], correct: 1, explanation: "Both lines have slope -1 but different y-intercepts, so they are parallel and never intersect." },
          { q: "If solving a system algebraically leads to a true statement like '7 = 7', what does this mean?", options: ["The system has no solution", "The system has exactly one solution", "The system has infinitely many solutions", "There was a calculation error"], correct: 2, explanation: "A true statement with no variables (like 7=7) means the two equations are equivalent — every point that satisfies one satisfies the other, giving infinite solutions." },
          { q: "Are y = 2x + 4 and 2y = 4x + 8 the same line?", options: ["Yes, dividing the second equation by 2 gives the first", "No, they are different lines", "Yes, but only at one point", "Cannot tell without graphing"], correct: 0, explanation: "Dividing 2y=4x+8 by 2 gives y=2x+4, which is identical to the first equation — they're the same line." },
          { q: "A system with infinitely many solutions means the two equations represent:", options: ["Two different parallel lines", "The exact same line", "Two lines meeting once", "Two curves"], correct: 1, explanation: "Infinite solutions occur when both equations describe the exact same line." },
          { q: "What does the solution to a system of inequalities look like on a graph?", options: ["A single point", "A single line", "A region where the shaded areas overlap", "Nothing can be graphed"], correct: 2, explanation: "The solution to a system of inequalities is the overlapping shaded region that satisfies all the inequalities at once." },
          { q: "If a point satisfies y > x and y < 5, is (2, 3) a solution?", options: ["Yes, it satisfies both", "No, it fails y > x", "No, it fails y < 5", "Cannot tell"], correct: 0, explanation: "Check: 3 > 2 ✓ and 3 < 5 ✓. Both are satisfied, so (2,3) is a solution." },
          { q: "Is (1, 6) a solution to y > x and y < 5?", options: ["Yes, it satisfies both", "No, it fails y > x", "No, it fails y < 5", "Cannot tell"], correct: 2, explanation: "Check: 6 > 1 ✓, but 6 < 5 is false. Since it fails one inequality, it's not a solution to the system." },
          { q: "Adult tickets cost $8 and child tickets cost $5. If 10 tickets were sold for $65 total, how many adult tickets were sold?", options: ["3", "4", "5", "6"], correct: 2, explanation: "Let a=adult, c=child. a+c=10 and 8a+5c=65. Substituting c=10-a: 8a+5(10-a)=65, so 3a=15, giving a=5." },
          { q: "Two numbers add to 20, and one is 4 more than the other. What is the smaller number?", options: ["6", "7", "8", "9"], correct: 2, explanation: "Let numbers be x and x+4: x+(x+4)=20, so 2x=16, giving x=8 (the smaller number)." },
          { q: "A farm has chickens and cows totaling 25 animals and 70 legs. How many chickens are there? (chickens have 2 legs, cows have 4)", options: ["10", "12", "15", "18"], correct: 2, explanation: "Let c=chickens, w=cows. c+w=25, 2c+4w=70. From first: w=25-c. Substitute: 2c+4(25-c)=70, 2c+100-4c=70, -2c=-30, c=15." }
        ]
      }
    ]
  },
  {
    name: "Quadratic Equations",
    lessons: [
      {
        name: "What Makes an Equation Quadratic?",
  questions: [
    { q: "What makes an equation 'quadratic'?", options: ["It has a variable raised to the first power only", "It has a variable raised to the second power (x²) as its highest term", "It has no variables at all", "It always equals zero"], correct: 1, explanation: "A quadratic equation's highest-degree term is x squared, giving it the general form ax² + bx + c = 0." },
    { q: "Which of these is a quadratic equation?", options: ["y = 3x + 2", "y = x² + 4x - 1", "y = 5", "y = 1/x"], correct: 1, explanation: "y = x² + 4x - 1 has x² as its highest power, making it quadratic." },
    { q: "In ax² + bx + c = 0, what must be true about 'a'?", options: ["a must be 0", "a must not be 0", "a must be negative", "a must be 1"], correct: 1, explanation: "If a were 0, the x² term would disappear and the equation would no longer be quadratic — so a cannot be 0." }
  ]
},
      {
        name: "Graphing Parabolas",
  questions: [
    { q: "What shape does a quadratic equation's graph make?", options: ["A straight line", "A parabola (U-shaped curve)", "A circle", "A zigzag"], correct: 1, explanation: "Quadratic functions graph as parabolas — smooth U-shaped (or upside-down U) curves." },
    { q: "If the coefficient 'a' in ax²+bx+c is positive, which way does the parabola open?", options: ["Upward", "Downward", "Sideways", "It doesn't open"], correct: 0, explanation: "A positive leading coefficient makes the parabola open upward, like a smile." },
    { q: "If the coefficient 'a' is negative, which way does the parabola open?", options: ["Upward", "Downward", "Sideways", "It doesn't open"], correct: 1, explanation: "A negative leading coefficient makes the parabola open downward, like a frown." }
  ]
},
      {
        name: "Solving Quadratics by Factoring",
  questions: [
    { q: "What are the solutions to x² - 9 = 0?", options: ["x = 3 only", "x = -3 only", "x = 3 or x = -3", "x = 9 or x = -9"], correct: 2, explanation: "x² = 9 means x = 3 or x = -3, since both values squared equal 9." },
    { q: "What are the solutions to x² - 25 = 0?", options: ["x = 5 only", "x = -5 only", "x = 5 or x = -5", "x = 25 or x = -25"], correct: 2, explanation: "x² = 25 means x = 5 or x = -5." },
    { q: "Solve by factoring: x² - 5x = 0", options: ["x = 0 only", "x = 5 only", "x = 0 or x = 5", "x = -5 or x = 5"], correct: 2, explanation: "Factor out x: x(x-5) = 0, so x = 0 or x = 5." }
  ]
},
      {
        name: "Factoring Quadratic Trinomials",
  questions: [
    { q: "Factor: x² + 5x + 6", options: ["(x+2)(x+3)", "(x+1)(x+6)", "(x-2)(x-3)", "(x+6)(x-1)"], correct: 0, explanation: "We need two numbers that multiply to 6 and add to 5: those are 2 and 3, giving (x+2)(x+3)." },
    { q: "Factor: x² + 8x + 15", options: ["(x+3)(x+5)", "(x+1)(x+15)", "(x+7)(x+8)", "(x-3)(x-5)"], correct: 0, explanation: "We need two numbers that multiply to 15 and add to 8: those are 3 and 5, giving (x+3)(x+5)." },
    { q: "Factor: x² - 2x - 8", options: ["(x-4)(x+2)", "(x+4)(x-2)", "(x-8)(x+1)", "(x+8)(x-1)"], correct: 0, explanation: "We need two numbers that multiply to -8 and add to -2: those are -4 and 2, giving (x-4)(x+2)." }
  ]
},
      {
        name: "Applying the Quadratic Formula",
  questions: [
    { q: "Using the quadratic formula concept, if a quadratic has no real solutions, what does that mean about its graph?", options: ["It crosses the x-axis twice", "It never touches the x-axis", "It touches the x-axis exactly once", "It's a straight line"], correct: 1, explanation: "No real solutions means the parabola never crosses or touches the x-axis at all." },
    { q: "For x² - 4x + 4 = 0, using the quadratic formula, how many real solutions are there?", options: ["Zero", "Exactly one", "Exactly two", "Infinite"], correct: 1, explanation: "The discriminant b²-4ac = 16-16 = 0, meaning exactly one real solution (a repeated root)." },
    { q: "For x² + 2x + 5 = 0, is the discriminant (b²-4ac) positive, negative, or zero?", options: ["Positive", "Negative", "Zero", "Cannot tell"], correct: 1, explanation: "Discriminant = 2²-4(1)(5) = 4-20 = -16, which is negative, meaning no real solutions." }
  ]
},
      {
        name: "The Vertex of a Parabola",
  questions: [
    { q: "What is the 'vertex' of a parabola?", options: ["Any point on the curve", "The highest or lowest point of the curve", "Where it crosses the y-axis only", "The width of the curve"], correct: 1, explanation: "The vertex is the turning point of the parabola — its minimum point if it opens upward, or maximum if it opens downward." },
    { q: "For a parabola opening upward, is the vertex a maximum or minimum point?", options: ["Maximum", "Minimum", "Neither", "Both"], correct: 1, explanation: "An upward-opening parabola's vertex is its lowest point — a minimum." },
    { q: "What is the vertex's x-coordinate for y = x² - 4x + 3? (using x = -b/2a)", options: ["1", "2", "3", "4"], correct: 1, explanation: "x = -b/2a = -(-4)/(2×1) = 4/2 = 2." }
  ]
},
      {
        name: "Zeroes and Roots of Quadratics",
  questions: [
    { q: "What are the 'zeroes' (or roots) of a quadratic equation?", options: ["The coefficients", "The x-values where the graph crosses the x-axis", "The y-intercept", "The vertex"], correct: 1, explanation: "Zeroes (or roots) are the x-values that make the equation equal zero — where the graph crosses the x-axis." },
    { q: "How many zeroes can a quadratic equation have at most?", options: ["0", "1", "2", "3"], correct: 2, explanation: "A quadratic equation can have at most 2 real zeroes (solutions)." },
    { q: "If a quadratic's graph crosses the x-axis at x=2 and x=5, what are its zeroes?", options: ["x=2 only", "x=5 only", "x=2 and x=5", "x=7"], correct: 2, explanation: "The zeroes are exactly where the graph crosses the x-axis: x=2 and x=5." }
  ]
},
      {
        name: "Completing the Square (Introduction)",
  questions: [
    { q: "What is the goal of 'completing the square'?", options: ["To make an equation into a perfect square trinomial", "To eliminate all variables", "To make a triangle", "To find the y-intercept only"], correct: 0, explanation: "Completing the square rewrites a quadratic so one side becomes a perfect square trinomial, making it easier to solve." },
    { q: "What number completes the square for x² + 6x + ___?", options: ["3", "6", "9", "36"], correct: 2, explanation: "Take half of 6 (which is 3) and square it: 3² = 9, giving x² + 6x + 9 = (x+3)²." },
    { q: "What number completes the square for x² + 10x + ___?", options: ["5", "10", "20", "25"], correct: 3, explanation: "Take half of 10 (which is 5) and square it: 5² = 25." }
  ]
},
      {
        name: "Quadratic Word Problems",
  questions: [
    { q: "A ball is thrown and its height follows h = -x² + 6x. At what x-values is the ball at height 0 (on the ground)?", options: ["x=0 and x=6", "x=0 and x=3", "x=3 only", "x=6 only"], correct: 0, explanation: "Set h=0: -x²+6x=0, factor: -x(x-6)=0, so x=0 or x=6." },
    { q: "A rectangular garden's area is given by A = x² + 5x, where x is a measurement in meters. If the area is 24 square meters, what is x? (try factoring x²+5x-24=0)", options: ["3", "4", "5", "6"], correct: 0, explanation: "x²+5x-24=0 factors to (x+8)(x-3)=0, giving x=-8 or x=3. Since x is a measurement, it must be positive, so x=3." },
    { q: "The equation x² - 6x + 5 = 0 models a scenario. What are its solutions?", options: ["x=1 or x=5", "x=2 or x=4", "x=-1 or x=-5", "x=6 or x=1"], correct: 0, explanation: "Factor: (x-1)(x-5)=0, so x=1 or x=5." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What makes an equation 'quadratic'?", options: ["It has a variable raised to the first power only", "It has a variable raised to the second power (x²) as its highest term", "It has no variables at all", "It always equals zero"], correct: 1, explanation: "A quadratic equation's highest-degree term is x squared, giving it the general form ax² + bx + c = 0." },
          { q: "Which of these is a quadratic equation?", options: ["y = 3x + 2", "y = x² + 4x - 1", "y = 5", "y = 1/x"], correct: 1, explanation: "y = x² + 4x - 1 has x² as its highest power, making it quadratic." },
          { q: "In ax² + bx + c = 0, what must be true about 'a'?", options: ["a must be 0", "a must not be 0", "a must be negative", "a must be 1"], correct: 1, explanation: "If a were 0, the x² term would disappear and the equation would no longer be quadratic — so a cannot be 0." },
          { q: "What shape does a quadratic equation's graph make?", options: ["A straight line", "A parabola (U-shaped curve)", "A circle", "A zigzag"], correct: 1, explanation: "Quadratic functions graph as parabolas — smooth U-shaped (or upside-down U) curves." },
          { q: "If the coefficient 'a' in ax²+bx+c is positive, which way does the parabola open?", options: ["Upward", "Downward", "Sideways", "It doesn't open"], correct: 0, explanation: "A positive leading coefficient makes the parabola open upward, like a smile." },
          { q: "If the coefficient 'a' is negative, which way does the parabola open?", options: ["Upward", "Downward", "Sideways", "It doesn't open"], correct: 1, explanation: "A negative leading coefficient makes the parabola open downward, like a frown." },
          { q: "What are the solutions to x² - 9 = 0?", options: ["x = 3 only", "x = -3 only", "x = 3 or x = -3", "x = 9 or x = -9"], correct: 2, explanation: "x² = 9 means x = 3 or x = -3, since both values squared equal 9." },
          { q: "What are the solutions to x² - 25 = 0?", options: ["x = 5 only", "x = -5 only", "x = 5 or x = -5", "x = 25 or x = -25"], correct: 2, explanation: "x² = 25 means x = 5 or x = -5." },
          { q: "Solve by factoring: x² - 5x = 0", options: ["x = 0 only", "x = 5 only", "x = 0 or x = 5", "x = -5 or x = 5"], correct: 2, explanation: "Factor out x: x(x-5) = 0, so x = 0 or x = 5." },
          { q: "Factor: x² + 5x + 6", options: ["(x+2)(x+3)", "(x+1)(x+6)", "(x-2)(x-3)", "(x+6)(x-1)"], correct: 0, explanation: "We need two numbers that multiply to 6 and add to 5: those are 2 and 3, giving (x+2)(x+3)." },
          { q: "Factor: x² + 8x + 15", options: ["(x+3)(x+5)", "(x+1)(x+15)", "(x+7)(x+8)", "(x-3)(x-5)"], correct: 0, explanation: "We need two numbers that multiply to 15 and add to 8: those are 3 and 5, giving (x+3)(x+5)." },
          { q: "Factor: x² - 2x - 8", options: ["(x-4)(x+2)", "(x+4)(x-2)", "(x-8)(x+1)", "(x+8)(x-1)"], correct: 0, explanation: "We need two numbers that multiply to -8 and add to -2: those are -4 and 2, giving (x-4)(x+2)." },
          { q: "Using the quadratic formula concept, if a quadratic has no real solutions, what does that mean about its graph?", options: ["It crosses the x-axis twice", "It never touches the x-axis", "It touches the x-axis exactly once", "It's a straight line"], correct: 1, explanation: "No real solutions means the parabola never crosses or touches the x-axis at all." },
          { q: "For x² - 4x + 4 = 0, using the quadratic formula, how many real solutions are there?", options: ["Zero", "Exactly one", "Exactly two", "Infinite"], correct: 1, explanation: "The discriminant b²-4ac = 16-16 = 0, meaning exactly one real solution (a repeated root)." },
          { q: "For x² + 2x + 5 = 0, is the discriminant (b²-4ac) positive, negative, or zero?", options: ["Positive", "Negative", "Zero", "Cannot tell"], correct: 1, explanation: "Discriminant = 2²-4(1)(5) = 4-20 = -16, which is negative, meaning no real solutions." },
          { q: "What is the 'vertex' of a parabola?", options: ["Any point on the curve", "The highest or lowest point of the curve", "Where it crosses the y-axis only", "The width of the curve"], correct: 1, explanation: "The vertex is the turning point of the parabola — its minimum point if it opens upward, or maximum if it opens downward." },
          { q: "For a parabola opening upward, is the vertex a maximum or minimum point?", options: ["Maximum", "Minimum", "Neither", "Both"], correct: 1, explanation: "An upward-opening parabola's vertex is its lowest point — a minimum." },
          { q: "What is the vertex's x-coordinate for y = x² - 4x + 3? (using x = -b/2a)", options: ["1", "2", "3", "4"], correct: 1, explanation: "x = -b/2a = -(-4)/(2×1) = 4/2 = 2." },
          { q: "What are the 'zeroes' (or roots) of a quadratic equation?", options: ["The coefficients", "The x-values where the graph crosses the x-axis", "The y-intercept", "The vertex"], correct: 1, explanation: "Zeroes (or roots) are the x-values that make the equation equal zero — where the graph crosses the x-axis." },
          { q: "How many zeroes can a quadratic equation have at most?", options: ["0", "1", "2", "3"], correct: 2, explanation: "A quadratic equation can have at most 2 real zeroes (solutions)." },
          { q: "If a quadratic's graph crosses the x-axis at x=2 and x=5, what are its zeroes?", options: ["x=2 only", "x=5 only", "x=2 and x=5", "x=7"], correct: 2, explanation: "The zeroes are exactly where the graph crosses the x-axis: x=2 and x=5." },
          { q: "What is the goal of 'completing the square'?", options: ["To make an equation into a perfect square trinomial", "To eliminate all variables", "To make a triangle", "To find the y-intercept only"], correct: 0, explanation: "Completing the square rewrites a quadratic so one side becomes a perfect square trinomial, making it easier to solve." },
          { q: "What number completes the square for x² + 6x + ___?", options: ["3", "6", "9", "36"], correct: 2, explanation: "Take half of 6 (which is 3) and square it: 3² = 9, giving x² + 6x + 9 = (x+3)²." },
          { q: "What number completes the square for x² + 10x + ___?", options: ["5", "10", "20", "25"], correct: 3, explanation: "Take half of 10 (which is 5) and square it: 5² = 25." },
          { q: "A ball is thrown and its height follows h = -x² + 6x. At what x-values is the ball at height 0 (on the ground)?", options: ["x=0 and x=6", "x=0 and x=3", "x=3 only", "x=6 only"], correct: 0, explanation: "Set h=0: -x²+6x=0, factor: -x(x-6)=0, so x=0 or x=6." },
          { q: "A rectangular garden's area is given by A = x² + 5x, where x is a measurement in meters. If the area is 24 square meters, what is x? (try factoring x²+5x-24=0)", options: ["3", "4", "5", "6"], correct: 0, explanation: "x²+5x-24=0 factors to (x+8)(x-3)=0, giving x=-8 or x=3. Since x is a measurement, it must be positive, so x=3." },
          { q: "The equation x² - 6x + 5 = 0 models a scenario. What are its solutions?", options: ["x=1 or x=5", "x=2 or x=4", "x=-1 or x=-5", "x=6 or x=1"], correct: 0, explanation: "Factor: (x-1)(x-5)=0, so x=1 or x=5." }
        ]
      }
    ]
  },
  {
    name: "Polynomials & Factoring",
    lessons: [
      {
        name: "What Is a Polynomial?",
  questions: [
    { q: "What is a polynomial?", options: ["An equation with only one term", "An expression with multiple terms involving variables raised to whole-number powers", "A type of fraction", "Only equations that equal zero"], correct: 1, explanation: "A polynomial is an expression built from variables and constants using addition, subtraction, and non-negative whole-number exponents." },
    { q: "Which of these is a polynomial?", options: ["3x² + 2x - 1", "3/x + 2", "√x + 1", "1/x²"], correct: 0, explanation: "3x² + 2x - 1 uses only whole-number exponents on its variable, making it a polynomial. The others involve fractions or roots with variables, which aren't allowed in polynomials." },
    { q: "What is a polynomial with exactly one term called?", options: ["Binomial", "Trinomial", "Monomial", "Polynomial"], correct: 2, explanation: "A single-term expression like 5x² is called a monomial." }
  ]
},
      {
        name: "Degree of a Polynomial",
  questions: [
    { q: "What is the degree of the polynomial 3x⁴ + 2x² - 5?", options: ["2", "3", "4", "5"], correct: 2, explanation: "The degree of a polynomial is its highest exponent, which is 4 here." },
    { q: "What is the degree of 7x³ - x + 2?", options: ["1", "2", "3", "7"], correct: 2, explanation: "The highest exponent is 3, so the degree is 3." },
    { q: "What is the degree of the constant polynomial 5?", options: ["0", "1", "5", "Undefined"], correct: 0, explanation: "A constant (like 5) has degree 0, since it can be thought of as 5x⁰." }
  ]
},
      {
        name: "Adding and Subtracting Polynomials",
  questions: [
    { q: "Simplify: (2x + 3) + (x - 1)", options: ["3x + 2", "2x + 2", "3x + 4", "x + 2"], correct: 0, explanation: "Combine like terms: 2x + x = 3x, and 3 - 1 = 2, giving 3x + 2." },
    { q: "Simplify: (5x² + 3x) - (2x² + x)", options: ["3x² + 2x", "7x² + 4x", "3x² + 4x", "7x² + 2x"], correct: 0, explanation: "Subtract like terms: 5x²-2x²=3x², and 3x-x=2x, giving 3x² + 2x." },
    { q: "Simplify: (4x² - 2x + 1) + (x² + 5x - 3)", options: ["5x² + 3x - 2", "5x² + 7x - 2", "3x² + 3x - 2", "5x² + 3x + 2"], correct: 0, explanation: "Combine like terms: 4x²+x²=5x², -2x+5x=3x, 1-3=-2, giving 5x²+3x-2." }
  ]
},
      {
        name: "Multiplying Binomials (FOIL)",
  questions: [
    { q: "Multiply: (x + 2)(x + 3)", options: ["x² + 5x + 6", "x² + 6x + 5", "x² + 5x + 5", "2x + 6"], correct: 0, explanation: "Using FOIL: x·x + x·3 + 2·x + 2·3 = x² + 3x + 2x + 6 = x² + 5x + 6." },
    { q: "Multiply: (x - 4)(x + 2)", options: ["x² - 2x - 8", "x² + 2x - 8", "x² - 6x - 8", "x² - 2x + 8"], correct: 0, explanation: "FOIL: x²+2x-4x-8 = x²-2x-8." },
    { q: "Multiply: (x + 5)(x - 5)", options: ["x² - 25", "x² + 25", "x² - 10x - 25", "x² + 10x - 25"], correct: 0, explanation: "This is a difference of squares: (x+5)(x-5) = x² - 25 (the middle terms cancel: 5x-5x=0)." }
  ]
},
      {
        name: "Factoring Out the GCF",
  questions: [
    { q: "Factor out the greatest common factor: 6x² + 9x", options: ["3x(2x + 3)", "3(2x² + 3x)", "x(6x + 9)", "6x(x + 9)"], correct: 0, explanation: "3x is the greatest common factor of both terms: 3x(2x) = 6x² and 3x(3) = 9x." },
    { q: "Factor out the GCF: 8x³ + 12x²", options: ["4x²(2x + 3)", "4x(2x² + 3x)", "2x²(4x + 6)", "8x(x² + 12x)"], correct: 0, explanation: "4x² is the GCF: 4x²(2x)=8x³ and 4x²(3)=12x²." },
    { q: "Factor out the GCF: 10x² - 15x", options: ["5x(2x - 3)", "5(2x² - 3x)", "x(10x - 15)", "10x(x - 15)"], correct: 0, explanation: "5x is the GCF: 5x(2x)=10x² and 5x(-3)=-15x." }
  ]
},
      {
        name: "Factoring the Difference of Squares",
  questions: [
    { q: "Factor: x² - 16", options: ["(x+4)(x-4)", "(x+8)(x-2)", "(x-4)²", "(x+4)²"], correct: 0, explanation: "x²-16 is a difference of squares: x²-4² = (x+4)(x-4)." },
    { q: "Factor: x² - 49", options: ["(x+7)(x-7)", "(x+49)(x-1)", "(x-7)²", "(x+7)²"], correct: 0, explanation: "x²-49 = x²-7² = (x+7)(x-7)." },
    { q: "Factor: 4x² - 9", options: ["(2x+3)(2x-3)", "(4x+9)(x-1)", "(2x-3)²", "(4x-3)(x+3)"], correct: 0, explanation: "4x²-9 = (2x)²-3² = (2x+3)(2x-3)." }
  ]
},
      {
        name: "Multiplying a Polynomial by a Monomial",
  questions: [
    { q: "Multiply: 3x(x + 4)", options: ["3x² + 4", "3x² + 12x", "3x + 12x", "x² + 12x"], correct: 1, explanation: "Distribute 3x to both terms: 3x·x + 3x·4 = 3x² + 12x." },
    { q: "Multiply: 2x²(3x - 5)", options: ["6x³ - 10x²", "6x² - 10x", "5x³ - 10x²", "6x³ - 5x"], correct: 0, explanation: "Distribute 2x²: 2x²·3x - 2x²·5 = 6x³ - 10x²." },
    { q: "Multiply: -4x(x - 3)", options: ["-4x² - 12x", "-4x² + 12x", "4x² - 12x", "-4x - 12x"], correct: 1, explanation: "Distribute -4x: -4x·x - 4x·(-3) = -4x² + 12x." }
  ]
},
      {
        name: "Dividing a Polynomial by a Monomial",
  questions: [
    { q: "Divide: (6x² + 9x) ÷ 3x", options: ["2x + 3", "2x² + 3x", "3x + 3", "2 + 3x"], correct: 0, explanation: "Divide each term by 3x: 6x²÷3x=2x, and 9x÷3x=3, giving 2x + 3." },
    { q: "Divide: (10x³ - 15x²) ÷ 5x²", options: ["2x - 3", "5x - 3", "2x² - 3", "2x - 3x"], correct: 0, explanation: "Divide each term by 5x²: 10x³÷5x²=2x, and 15x²÷5x²=3, giving 2x - 3." },
    { q: "Divide: (8x² - 4x) ÷ 4x", options: ["2x - 1", "2x - 4", "4x - 1", "2 - 1"], correct: 0, explanation: "Divide each term by 4x: 8x²÷4x=2x, and 4x÷4x=1, giving 2x - 1." }
  ]
},
      {
        name: "Polynomial Word Problems",
  questions: [
    { q: "A rectangle has width x and length (x+5). Write a polynomial expression for its area.", options: ["x² + 5x", "2x + 5", "x² + 5", "5x"], correct: 0, explanation: "Area = width × length = x(x+5) = x² + 5x." },
    { q: "A box's volume is given by V = x(x+2)(x-1). What is this expanded, focusing just on the highest-degree term?", options: ["x²", "x³", "x⁴", "2x"], correct: 1, explanation: "Multiplying three linear factors, each contributing one x, gives a highest-degree term of x³." },
    { q: "The cost of producing x items is C = 2x² + 10x + 50. What is the degree of this polynomial?", options: ["0", "1", "2", "3"], correct: 2, explanation: "The highest exponent is 2, so this is a degree-2 (quadratic) polynomial." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What is a polynomial?", options: ["An equation with only one term", "An expression with multiple terms involving variables raised to whole-number powers", "A type of fraction", "Only equations that equal zero"], correct: 1, explanation: "A polynomial is an expression built from variables and constants using addition, subtraction, and non-negative whole-number exponents." },
          { q: "Which of these is a polynomial?", options: ["3x² + 2x - 1", "3/x + 2", "√x + 1", "1/x²"], correct: 0, explanation: "3x² + 2x - 1 uses only whole-number exponents on its variable, making it a polynomial. The others involve fractions or roots with variables, which aren't allowed in polynomials." },
          { q: "What is a polynomial with exactly one term called?", options: ["Binomial", "Trinomial", "Monomial", "Polynomial"], correct: 2, explanation: "A single-term expression like 5x² is called a monomial." },
          { q: "What is the degree of the polynomial 3x⁴ + 2x² - 5?", options: ["2", "3", "4", "5"], correct: 2, explanation: "The degree of a polynomial is its highest exponent, which is 4 here." },
          { q: "What is the degree of 7x³ - x + 2?", options: ["1", "2", "3", "7"], correct: 2, explanation: "The highest exponent is 3, so the degree is 3." },
          { q: "What is the degree of the constant polynomial 5?", options: ["0", "1", "5", "Undefined"], correct: 0, explanation: "A constant (like 5) has degree 0, since it can be thought of as 5x⁰." },
          { q: "Simplify: (2x + 3) + (x - 1)", options: ["3x + 2", "2x + 2", "3x + 4", "x + 2"], correct: 0, explanation: "Combine like terms: 2x + x = 3x, and 3 - 1 = 2, giving 3x + 2." },
          { q: "Simplify: (5x² + 3x) - (2x² + x)", options: ["3x² + 2x", "7x² + 4x", "3x² + 4x", "7x² + 2x"], correct: 0, explanation: "Subtract like terms: 5x²-2x²=3x², and 3x-x=2x, giving 3x² + 2x." },
          { q: "Simplify: (4x² - 2x + 1) + (x² + 5x - 3)", options: ["5x² + 3x - 2", "5x² + 7x - 2", "3x² + 3x - 2", "5x² + 3x + 2"], correct: 0, explanation: "Combine like terms: 4x²+x²=5x², -2x+5x=3x, 1-3=-2, giving 5x²+3x-2." },
          { q: "Multiply: (x + 2)(x + 3)", options: ["x² + 5x + 6", "x² + 6x + 5", "x² + 5x + 5", "2x + 6"], correct: 0, explanation: "Using FOIL: x·x + x·3 + 2·x + 2·3 = x² + 3x + 2x + 6 = x² + 5x + 6." },
          { q: "Multiply: (x - 4)(x + 2)", options: ["x² - 2x - 8", "x² + 2x - 8", "x² - 6x - 8", "x² - 2x + 8"], correct: 0, explanation: "FOIL: x²+2x-4x-8 = x²-2x-8." },
          { q: "Multiply: (x + 5)(x - 5)", options: ["x² - 25", "x² + 25", "x² - 10x - 25", "x² + 10x - 25"], correct: 0, explanation: "This is a difference of squares: (x+5)(x-5) = x² - 25 (the middle terms cancel: 5x-5x=0)." },
          { q: "Factor out the greatest common factor: 6x² + 9x", options: ["3x(2x + 3)", "3(2x² + 3x)", "x(6x + 9)", "6x(x + 9)"], correct: 0, explanation: "3x is the greatest common factor of both terms: 3x(2x) = 6x² and 3x(3) = 9x." },
          { q: "Factor out the GCF: 8x³ + 12x²", options: ["4x²(2x + 3)", "4x(2x² + 3x)", "2x²(4x + 6)", "8x(x² + 12x)"], correct: 0, explanation: "4x² is the GCF: 4x²(2x)=8x³ and 4x²(3)=12x²." },
          { q: "Factor out the GCF: 10x² - 15x", options: ["5x(2x - 3)", "5(2x² - 3x)", "x(10x - 15)", "10x(x - 15)"], correct: 0, explanation: "5x is the GCF: 5x(2x)=10x² and 5x(-3)=-15x." },
          { q: "Factor: x² - 16", options: ["(x+4)(x-4)", "(x+8)(x-2)", "(x-4)²", "(x+4)²"], correct: 0, explanation: "x²-16 is a difference of squares: x²-4² = (x+4)(x-4)." },
          { q: "Factor: x² - 49", options: ["(x+7)(x-7)", "(x+49)(x-1)", "(x-7)²", "(x+7)²"], correct: 0, explanation: "x²-49 = x²-7² = (x+7)(x-7)." },
          { q: "Factor: 4x² - 9", options: ["(2x+3)(2x-3)", "(4x+9)(x-1)", "(2x-3)²", "(4x-3)(x+3)"], correct: 0, explanation: "4x²-9 = (2x)²-3² = (2x+3)(2x-3)." },
          { q: "Multiply: 3x(x + 4)", options: ["3x² + 4", "3x² + 12x", "3x + 12x", "x² + 12x"], correct: 1, explanation: "Distribute 3x to both terms: 3x·x + 3x·4 = 3x² + 12x." },
          { q: "Multiply: 2x²(3x - 5)", options: ["6x³ - 10x²", "6x² - 10x", "5x³ - 10x²", "6x³ - 5x"], correct: 0, explanation: "Distribute 2x²: 2x²·3x - 2x²·5 = 6x³ - 10x²." },
          { q: "Multiply: -4x(x - 3)", options: ["-4x² - 12x", "-4x² + 12x", "4x² - 12x", "-4x - 12x"], correct: 1, explanation: "Distribute -4x: -4x·x - 4x·(-3) = -4x² + 12x." },
          { q: "Divide: (6x² + 9x) ÷ 3x", options: ["2x + 3", "2x² + 3x", "3x + 3", "2 + 3x"], correct: 0, explanation: "Divide each term by 3x: 6x²÷3x=2x, and 9x÷3x=3, giving 2x + 3." },
          { q: "Divide: (10x³ - 15x²) ÷ 5x²", options: ["2x - 3", "5x - 3", "2x² - 3", "2x - 3x"], correct: 0, explanation: "Divide each term by 5x²: 10x³÷5x²=2x, and 15x²÷5x²=3, giving 2x - 3." },
          { q: "Divide: (8x² - 4x) ÷ 4x", options: ["2x - 1", "2x - 4", "4x - 1", "2 - 1"], correct: 0, explanation: "Divide each term by 4x: 8x²÷4x=2x, and 4x÷4x=1, giving 2x - 1." },
          { q: "A rectangle has width x and length (x+5). Write a polynomial expression for its area.", options: ["x² + 5x", "2x + 5", "x² + 5", "5x"], correct: 0, explanation: "Area = width × length = x(x+5) = x² + 5x." },
          { q: "A box's volume is given by V = x(x+2)(x-1). What is this expanded, focusing just on the highest-degree term?", options: ["x²", "x³", "x⁴", "2x"], correct: 1, explanation: "Multiplying three linear factors, each contributing one x, gives a highest-degree term of x³." },
          { q: "The cost of producing x items is C = 2x² + 10x + 50. What is the degree of this polynomial?", options: ["0", "1", "2", "3"], correct: 2, explanation: "The highest exponent is 2, so this is a degree-2 (quadratic) polynomial." }
        ]
      }
    ]
  },
  {
    name: "Probability & Statistics",
    lessons: [
      {
        name: "Mean (Average)",
  questions: [
    { q: "What is the mean (average) of 2, 4, 6, 8?", options: ["4", "5", "6", "7"], correct: 1, explanation: "Mean = (2+4+6+8)/4 = 20/4 = 5." },
    { q: "What is the mean of 10, 20, 30?", options: ["15", "20", "25", "30"], correct: 1, explanation: "Mean = (10+20+30)/3 = 60/3 = 20." },
    { q: "What is the mean of 5, 5, 5, 5, 10?", options: ["5", "6", "7", "8"], correct: 1, explanation: "Mean = (5+5+5+5+10)/5 = 30/5 = 6." }
  ]
},
      {
        name: "Median",
  questions: [
    { q: "What is the median of the numbers 3, 7, 9, 12, 15?", options: ["7", "9", "12", "15"], correct: 1, explanation: "With 5 numbers in order, the median is the middle (3rd) value: 9." },
    { q: "What is the median of 4, 8, 15, 16, 23, 42?", options: ["14.5", "15", "15.5", "16"], correct: 2, explanation: "With 6 numbers, the median is the average of the two middle values: (15+16)/2 = 15.5." },
    { q: "What is the median of 1, 3, 3, 6, 7, 8, 9?", options: ["3", "5", "6", "7"], correct: 2, explanation: "With 7 numbers in order, the median is the middle (4th) value: 6." }
  ]
},
      {
        name: "Mode",
  questions: [
    { q: "What is the mode of the numbers 4, 4, 6, 7, 9?", options: ["4", "6", "7", "9"], correct: 0, explanation: "The mode is the most frequently occurring value. 4 appears twice, more than any other number." },
    { q: "What is the mode of 2, 2, 3, 3, 3, 5?", options: ["2", "3", "5", "There is no mode"], correct: 1, explanation: "3 appears three times, more than any other value, making it the mode." },
    { q: "What is the mode of 1, 2, 3, 4, 5?", options: ["1", "3", "5", "There is no mode"], correct: 3, explanation: "Since every number appears exactly once, there is no mode." }
  ]
},
      {
        name: "Range",
  questions: [
    { q: "What is the range of 5, 12, 8, 20, 3?", options: ["15", "17", "20", "23"], correct: 1, explanation: "Range = highest - lowest = 20 - 3 = 17." },
    { q: "What is the range of 10, 10, 10, 10?", options: ["0", "10", "20", "40"], correct: 0, explanation: "Since the highest and lowest values are both 10, the range is 10 - 10 = 0." },
    { q: "What is the range of 45, 12, 78, 33, 90?", options: ["68", "78", "88", "90"], correct: 1, explanation: "Range = highest - lowest = 90 - 12 = 78." }
  ]
},
      {
        name: "Introduction to Probability",
  questions: [
    { q: "What does a probability of 1 mean?", options: ["The event is impossible", "The event is certain to happen", "The event has a 50% chance", "The event cannot be measured"], correct: 1, explanation: "A probability of 1 (or 100%) means the event is certain to occur." },
    { q: "What does a probability of 0 mean?", options: ["The event is certain", "The event is impossible", "The event has a 50% chance", "Cannot tell"], correct: 1, explanation: "A probability of 0 means the event can never happen." },
    { q: "What is the probability of rolling a 4 on a fair six-sided die?", options: ["1/6", "1/4", "1/3", "1/2"], correct: 0, explanation: "There is 1 favorable outcome (rolling a 4) out of 6 possible outcomes, giving 1/6." }
  ]
},
      {
        name: "Compound Probability",
  questions: [
    { q: "If you flip a fair coin twice, what is the probability of getting two heads?", options: ["1/2", "1/3", "1/4", "1/8"], correct: 2, explanation: "Each flip has a 1/2 chance of heads; for two independent flips, multiply: 1/2 × 1/2 = 1/4." },
    { q: "What is the probability of rolling a sum of 7 with two six-sided dice?", options: ["1/12", "1/9", "1/6", "1/4"], correct: 2, explanation: "There are 6 ways to roll a sum of 7 (1+6,2+5,3+4,4+3,5+2,6+1) out of 36 total outcomes: 6/36 = 1/6." },
    { q: "If you flip a coin 3 times, what is the probability of getting all tails?", options: ["1/2", "1/4", "1/6", "1/8"], correct: 3, explanation: "Each flip is 1/2, and for 3 independent flips: 1/2 × 1/2 × 1/2 = 1/8." }
  ]
},
      {
        name: "Reading Data Displays",
  questions: [
    { q: "In a bar graph, what does the height of each bar typically represent?", options: ["The category name", "The frequency or value of that category", "The color", "The x-axis label"], correct: 1, explanation: "Bar height represents the frequency or numeric value associated with each category." },
    { q: "What is a good use for a line graph?", options: ["Showing categories with no order", "Showing change over time", "Showing parts of a whole", "Showing only single data points"], correct: 1, explanation: "Line graphs are ideal for showing trends and changes over time, since points connect in sequence." },
    { q: "What does a pie chart typically show?", options: ["Change over time", "Parts of a whole (percentages)", "Only two values", "Raw, unprocessed data"], correct: 1, explanation: "Pie charts divide a circle into slices representing parts of a whole, often as percentages." }
  ]
},
      {
        name: "Permutations and Combinations (Introduction)",
  questions: [
    { q: "In how many ways can you arrange 3 different books on a shelf?", options: ["3", "6", "9", "12"], correct: 1, explanation: "This is 3! (3 factorial) = 3×2×1 = 6 arrangements." },
    { q: "Does order matter in a 'combination' (as opposed to a 'permutation')?", options: ["Yes, order always matters", "No, order doesn't matter", "Only sometimes", "Combinations don't exist"], correct: 1, explanation: "In combinations, order doesn't matter — choosing {A,B} is the same as choosing {B,A}. In permutations, order matters." },
    { q: "How many ways can you choose 2 people from a group of 4 (order doesn't matter)?", options: ["4", "6", "8", "12"], correct: 1, explanation: "This is a combination: 4!/(2!×2!) = 24/4 = 6 ways." }
  ]
},
      {
        name: "Probability & Statistics Word Problems",
  questions: [
    { q: "A class of 20 students has test scores averaging 80. If one student with a score of 60 is removed, does the new average go up or down?", options: ["Up", "Down", "Stays the same", "Cannot tell"], correct: 0, explanation: "Removing a score below the average (60 is below 80) raises the average of the remaining students." },
    { q: "A bag has 3 red and 7 blue marbles. What is the probability of picking a red marble?", options: ["3/7", "3/10", "7/10", "1/3"], correct: 1, explanation: "There are 3 red marbles out of 10 total, giving a probability of 3/10." },
    { q: "In a survey of 50 people, 30 like coffee. What percentage like coffee?", options: ["50%", "60%", "65%", "70%"], correct: 1, explanation: "30/50 = 0.6 = 60%." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What is the mean (average) of 2, 4, 6, 8?", options: ["4", "5", "6", "7"], correct: 1, explanation: "Mean = (2+4+6+8)/4 = 20/4 = 5." },
          { q: "What is the mean of 10, 20, 30?", options: ["15", "20", "25", "30"], correct: 1, explanation: "Mean = (10+20+30)/3 = 60/3 = 20." },
          { q: "What is the mean of 5, 5, 5, 5, 10?", options: ["5", "6", "7", "8"], correct: 1, explanation: "Mean = (5+5+5+5+10)/5 = 30/5 = 6." },
          { q: "What is the median of the numbers 3, 7, 9, 12, 15?", options: ["7", "9", "12", "15"], correct: 1, explanation: "With 5 numbers in order, the median is the middle (3rd) value: 9." },
          { q: "What is the median of 4, 8, 15, 16, 23, 42?", options: ["14.5", "15", "15.5", "16"], correct: 2, explanation: "With 6 numbers, the median is the average of the two middle values: (15+16)/2 = 15.5." },
          { q: "What is the median of 1, 3, 3, 6, 7, 8, 9?", options: ["3", "5", "6", "7"], correct: 2, explanation: "With 7 numbers in order, the median is the middle (4th) value: 6." },
          { q: "What is the mode of the numbers 4, 4, 6, 7, 9?", options: ["4", "6", "7", "9"], correct: 0, explanation: "The mode is the most frequently occurring value. 4 appears twice, more than any other number." },
          { q: "What is the mode of 2, 2, 3, 3, 3, 5?", options: ["2", "3", "5", "There is no mode"], correct: 1, explanation: "3 appears three times, more than any other value, making it the mode." },
          { q: "What is the mode of 1, 2, 3, 4, 5?", options: ["1", "3", "5", "There is no mode"], correct: 3, explanation: "Since every number appears exactly once, there is no mode." },
          { q: "What is the range of 5, 12, 8, 20, 3?", options: ["15", "17", "20", "23"], correct: 1, explanation: "Range = highest - lowest = 20 - 3 = 17." },
          { q: "What is the range of 10, 10, 10, 10?", options: ["0", "10", "20", "40"], correct: 0, explanation: "Since the highest and lowest values are both 10, the range is 10 - 10 = 0." },
          { q: "What is the range of 45, 12, 78, 33, 90?", options: ["68", "78", "88", "90"], correct: 1, explanation: "Range = highest - lowest = 90 - 12 = 78." },
          { q: "What does a probability of 1 mean?", options: ["The event is impossible", "The event is certain to happen", "The event has a 50% chance", "The event cannot be measured"], correct: 1, explanation: "A probability of 1 (or 100%) means the event is certain to occur." },
          { q: "What does a probability of 0 mean?", options: ["The event is certain", "The event is impossible", "The event has a 50% chance", "Cannot tell"], correct: 1, explanation: "A probability of 0 means the event can never happen." },
          { q: "What is the probability of rolling a 4 on a fair six-sided die?", options: ["1/6", "1/4", "1/3", "1/2"], correct: 0, explanation: "There is 1 favorable outcome (rolling a 4) out of 6 possible outcomes, giving 1/6." },
          { q: "If you flip a fair coin twice, what is the probability of getting two heads?", options: ["1/2", "1/3", "1/4", "1/8"], correct: 2, explanation: "Each flip has a 1/2 chance of heads; for two independent flips, multiply: 1/2 × 1/2 = 1/4." },
          { q: "What is the probability of rolling a sum of 7 with two six-sided dice?", options: ["1/12", "1/9", "1/6", "1/4"], correct: 2, explanation: "There are 6 ways to roll a sum of 7 (1+6,2+5,3+4,4+3,5+2,6+1) out of 36 total outcomes: 6/36 = 1/6." },
          { q: "If you flip a coin 3 times, what is the probability of getting all tails?", options: ["1/2", "1/4", "1/6", "1/8"], correct: 3, explanation: "Each flip is 1/2, and for 3 independent flips: 1/2 × 1/2 × 1/2 = 1/8." },
          { q: "In a bar graph, what does the height of each bar typically represent?", options: ["The category name", "The frequency or value of that category", "The color", "The x-axis label"], correct: 1, explanation: "Bar height represents the frequency or numeric value associated with each category." },
          { q: "What is a good use for a line graph?", options: ["Showing categories with no order", "Showing change over time", "Showing parts of a whole", "Showing only single data points"], correct: 1, explanation: "Line graphs are ideal for showing trends and changes over time, since points connect in sequence." },
          { q: "What does a pie chart typically show?", options: ["Change over time", "Parts of a whole (percentages)", "Only two values", "Raw, unprocessed data"], correct: 1, explanation: "Pie charts divide a circle into slices representing parts of a whole, often as percentages." },
          { q: "In how many ways can you arrange 3 different books on a shelf?", options: ["3", "6", "9", "12"], correct: 1, explanation: "This is 3! (3 factorial) = 3×2×1 = 6 arrangements." },
          { q: "Does order matter in a 'combination' (as opposed to a 'permutation')?", options: ["Yes, order always matters", "No, order doesn't matter", "Only sometimes", "Combinations don't exist"], correct: 1, explanation: "In combinations, order doesn't matter — choosing {A,B} is the same as choosing {B,A}. In permutations, order matters." },
          { q: "How many ways can you choose 2 people from a group of 4 (order doesn't matter)?", options: ["4", "6", "8", "12"], correct: 1, explanation: "This is a combination: 4!/(2!×2!) = 24/4 = 6 ways." },
          { q: "A class of 20 students has test scores averaging 80. If one student with a score of 60 is removed, does the new average go up or down?", options: ["Up", "Down", "Stays the same", "Cannot tell"], correct: 0, explanation: "Removing a score below the average (60 is below 80) raises the average of the remaining students." },
          { q: "A bag has 3 red and 7 blue marbles. What is the probability of picking a red marble?", options: ["3/7", "3/10", "7/10", "1/3"], correct: 1, explanation: "There are 3 red marbles out of 10 total, giving a probability of 3/10." },
          { q: "In a survey of 50 people, 30 like coffee. What percentage like coffee?", options: ["50%", "60%", "65%", "70%"], correct: 1, explanation: "30/50 = 0.6 = 60%." }
        ]
      }
    ]
  },
  {
    name: "Trigonometry Fundamentals",
    lessons: [
      {
        name: "Right Triangle Basics",
  questions: [
    { q: "What is the longest side of a right triangle called?", options: ["Adjacent", "Opposite", "Hypotenuse", "Base"], correct: 2, explanation: "The hypotenuse is always the longest side, located opposite the right angle." },
    { q: "What is the sum of the interior angles of any triangle?", options: ["90°", "180°", "270°", "360°"], correct: 1, explanation: "The angles of any triangle always sum to 180°." },
    { q: "If one angle of a right triangle is 90° and another is 30°, what is the third angle?", options: ["30°", "45°", "60°", "90°"], correct: 2, explanation: "180 - 90 - 30 = 60°." }
  ]
},
      {
        name: "The Pythagorean Theorem",
  questions: [
    { q: "In a right triangle with a hypotenuse of 10 and one leg of 6, what is the other leg?", options: ["6", "7", "8", "9"], correct: 2, explanation: "Using a²+b²=c²: 6²+b²=10², so 36+b²=100, b²=64, giving b=8." },
    { q: "In a right triangle with legs 3 and 4, what is the hypotenuse?", options: ["5", "6", "7", "8"], correct: 0, explanation: "c² = 3²+4² = 9+16 = 25, so c = 5." },
    { q: "In a right triangle with legs 5 and 12, what is the hypotenuse?", options: ["11", "12", "13", "14"], correct: 2, explanation: "c² = 5²+12² = 25+144 = 169, so c = 13." }
  ]
},
      {
        name: "The Sine Ratio",
  questions: [
    { q: "In a right triangle, what does 'sine' (sin) of an angle represent?", options: ["Opposite/Hypotenuse", "Adjacent/Hypotenuse", "Opposite/Adjacent", "Hypotenuse/Opposite"], correct: 0, explanation: "Sine of an angle is the ratio of the length of the opposite side to the hypotenuse." },
    { q: "In a right triangle, the opposite side to an angle is 6 and the hypotenuse is 10. What is sin of that angle?", options: ["0.4", "0.5", "0.6", "0.7"], correct: 2, explanation: "sin = opposite/hypotenuse = 6/10 = 0.6." },
    { q: "If sin(θ) = 0.5, and the hypotenuse is 20, what is the length of the opposite side?", options: ["5", "10", "15", "20"], correct: 1, explanation: "sin(θ) = opposite/hypotenuse, so opposite = 0.5 × 20 = 10." }
  ]
},
      {
        name: "The Cosine Ratio",
  questions: [
    { q: "What does 'cosine' (cos) of an angle represent?", options: ["Opposite/Hypotenuse", "Adjacent/Hypotenuse", "Opposite/Adjacent", "Adjacent/Opposite"], correct: 1, explanation: "Cosine of an angle is the ratio of the adjacent side to the hypotenuse." },
    { q: "In a right triangle, the adjacent side is 8 and the hypotenuse is 10. What is cos of that angle?", options: ["0.6", "0.7", "0.8", "0.9"], correct: 2, explanation: "cos = adjacent/hypotenuse = 8/10 = 0.8." },
    { q: "If cos(θ) = 0.5, and the hypotenuse is 16, what is the length of the adjacent side?", options: ["4", "6", "8", "10"], correct: 2, explanation: "cos(θ) = adjacent/hypotenuse, so adjacent = 0.5 × 16 = 8." }
  ]
},
      {
        name: "The Tangent Ratio",
  questions: [
    { q: "What does 'tangent' (tan) of an angle represent?", options: ["Opposite/Adjacent", "Adjacent/Hypotenuse", "Opposite/Hypotenuse", "Hypotenuse/Adjacent"], correct: 0, explanation: "Tangent of an angle is the ratio of the opposite side to the adjacent side." },
    { q: "In a right triangle, the opposite side is 9 and the adjacent side is 12. What is tan of that angle?", options: ["0.6", "0.75", "0.8", "1.2"], correct: 1, explanation: "tan = opposite/adjacent = 9/12 = 0.75." },
    { q: "If tan(θ) = 2, and the adjacent side is 5, what is the length of the opposite side?", options: ["5", "7", "10", "12"], correct: 2, explanation: "tan(θ) = opposite/adjacent, so opposite = 2 × 5 = 10." }
  ]
},
      {
        name: "Remembering SOH-CAH-TOA",
  questions: [
    { q: "What does the mnemonic SOH-CAH-TOA help you remember?", options: ["The order of operations", "The three trig ratios: sine, cosine, tangent", "The Pythagorean theorem", "Types of triangles"], correct: 1, explanation: "SOH-CAH-TOA reminds you: Sine=Opposite/Hypotenuse, Cosine=Adjacent/Hypotenuse, Tangent=Opposite/Adjacent." },
    { q: "According to SOH-CAH-TOA, which ratio uses both the opposite and adjacent sides (no hypotenuse)?", options: ["Sine", "Cosine", "Tangent", "None of them"], correct: 2, explanation: "TOA stands for Tangent = Opposite/Adjacent, the only ratio that doesn't involve the hypotenuse." },
    { q: "According to SOH-CAH-TOA, which two ratios involve the hypotenuse?", options: ["Sine and Cosine", "Sine and Tangent", "Cosine and Tangent", "All three"], correct: 0, explanation: "SOH (Sine) and CAH (Cosine) both have the hypotenuse in their ratio; TOA (Tangent) does not." }
  ]
},
      {
        name: "Finding Missing Sides Using Trig Ratios",
  questions: [
    { q: "A right triangle has a 30° angle and a hypotenuse of 10. Using sin(30°)=0.5, what is the opposite side?", options: ["3", "4", "5", "6"], correct: 2, explanation: "opposite = sin(30°) × hypotenuse = 0.5 × 10 = 5." },
    { q: "A right triangle has a 60° angle and a hypotenuse of 8. Using cos(60°)=0.5, what is the adjacent side?", options: ["2", "3", "4", "5"], correct: 2, explanation: "adjacent = cos(60°) × hypotenuse = 0.5 × 8 = 4." },
    { q: "A right triangle has an angle where tan(θ)=1 and the adjacent side is 7. What is the opposite side?", options: ["5", "6", "7", "8"], correct: 2, explanation: "opposite = tan(θ) × adjacent = 1 × 7 = 7." }
  ]
},
      {
        name: "Angles of Elevation and Depression",
  questions: [
    { q: "What is an 'angle of elevation'?", options: ["The angle looking down from a height", "The angle looking up from the ground to an object", "Always exactly 90°", "The angle between two ground points"], correct: 1, explanation: "The angle of elevation is measured upward from the horizontal to a point above, like looking up at a tall building." },
    { q: "What is an 'angle of depression'?", options: ["The angle looking up at something", "The angle looking down from a height to an object below", "The same as angle of elevation", "Always 45°"], correct: 1, explanation: "The angle of depression is measured downward from the horizontal to a point below, like looking down from a cliff." },
    { q: "If you're standing 50 feet from a building and the angle of elevation to its top is such that tan(θ)=1.5, how tall is the building?", options: ["50 feet", "60 feet", "75 feet", "100 feet"], correct: 2, explanation: "height = tan(θ) × distance = 1.5 × 50 = 75 feet." }
  ]
},
      {
        name: "Trigonometry Word Problems",
  questions: [
    { q: "A ladder leans against a wall, forming a right triangle. If the ladder (hypotenuse) is 13 feet and the base is 5 feet from the wall, how high up the wall does it reach?", options: ["10 feet", "11 feet", "12 feet", "13 feet"], correct: 2, explanation: "Using the Pythagorean theorem: 5²+h²=13², so 25+h²=169, h²=144, giving h=12 feet." },
    { q: "A kite string is 100 feet long and makes a 30° angle with the ground. Using sin(30°)=0.5, how high is the kite?", options: ["25 feet", "50 feet", "75 feet", "100 feet"], correct: 1, explanation: "height = sin(30°) × string length = 0.5 × 100 = 50 feet." },
    { q: "A ramp rises 3 feet over a horizontal distance of 4 feet. What is the length of the ramp itself (hypotenuse)?", options: ["4 feet", "5 feet", "6 feet", "7 feet"], correct: 1, explanation: "Using the Pythagorean theorem: 3²+4²=5², so the ramp is 5 feet long." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What is the longest side of a right triangle called?", options: ["Adjacent", "Opposite", "Hypotenuse", "Base"], correct: 2, explanation: "The hypotenuse is always the longest side, located opposite the right angle." },
          { q: "What is the sum of the interior angles of any triangle?", options: ["90°", "180°", "270°", "360°"], correct: 1, explanation: "The angles of any triangle always sum to 180°." },
          { q: "If one angle of a right triangle is 90° and another is 30°, what is the third angle?", options: ["30°", "45°", "60°", "90°"], correct: 2, explanation: "180 - 90 - 30 = 60°." },
          { q: "In a right triangle with a hypotenuse of 10 and one leg of 6, what is the other leg?", options: ["6", "7", "8", "9"], correct: 2, explanation: "Using a²+b²=c²: 6²+b²=10², so 36+b²=100, b²=64, giving b=8." },
          { q: "In a right triangle with legs 3 and 4, what is the hypotenuse?", options: ["5", "6", "7", "8"], correct: 0, explanation: "c² = 3²+4² = 9+16 = 25, so c = 5." },
          { q: "In a right triangle with legs 5 and 12, what is the hypotenuse?", options: ["11", "12", "13", "14"], correct: 2, explanation: "c² = 5²+12² = 25+144 = 169, so c = 13." },
          { q: "In a right triangle, what does 'sine' (sin) of an angle represent?", options: ["Opposite/Hypotenuse", "Adjacent/Hypotenuse", "Opposite/Adjacent", "Hypotenuse/Opposite"], correct: 0, explanation: "Sine of an angle is the ratio of the length of the opposite side to the hypotenuse." },
          { q: "In a right triangle, the opposite side to an angle is 6 and the hypotenuse is 10. What is sin of that angle?", options: ["0.4", "0.5", "0.6", "0.7"], correct: 2, explanation: "sin = opposite/hypotenuse = 6/10 = 0.6." },
          { q: "If sin(θ) = 0.5, and the hypotenuse is 20, what is the length of the opposite side?", options: ["5", "10", "15", "20"], correct: 1, explanation: "sin(θ) = opposite/hypotenuse, so opposite = 0.5 × 20 = 10." },
          { q: "What does 'cosine' (cos) of an angle represent?", options: ["Opposite/Hypotenuse", "Adjacent/Hypotenuse", "Opposite/Adjacent", "Adjacent/Opposite"], correct: 1, explanation: "Cosine of an angle is the ratio of the adjacent side to the hypotenuse." },
          { q: "In a right triangle, the adjacent side is 8 and the hypotenuse is 10. What is cos of that angle?", options: ["0.6", "0.7", "0.8", "0.9"], correct: 2, explanation: "cos = adjacent/hypotenuse = 8/10 = 0.8." },
          { q: "If cos(θ) = 0.5, and the hypotenuse is 16, what is the length of the adjacent side?", options: ["4", "6", "8", "10"], correct: 2, explanation: "cos(θ) = adjacent/hypotenuse, so adjacent = 0.5 × 16 = 8." },
          { q: "What does 'tangent' (tan) of an angle represent?", options: ["Opposite/Adjacent", "Adjacent/Hypotenuse", "Opposite/Hypotenuse", "Hypotenuse/Adjacent"], correct: 0, explanation: "Tangent of an angle is the ratio of the opposite side to the adjacent side." },
          { q: "In a right triangle, the opposite side is 9 and the adjacent side is 12. What is tan of that angle?", options: ["0.6", "0.75", "0.8", "1.2"], correct: 1, explanation: "tan = opposite/adjacent = 9/12 = 0.75." },
          { q: "If tan(θ) = 2, and the adjacent side is 5, what is the length of the opposite side?", options: ["5", "7", "10", "12"], correct: 2, explanation: "tan(θ) = opposite/adjacent, so opposite = 2 × 5 = 10." },
          { q: "What does the mnemonic SOH-CAH-TOA help you remember?", options: ["The order of operations", "The three trig ratios: sine, cosine, tangent", "The Pythagorean theorem", "Types of triangles"], correct: 1, explanation: "SOH-CAH-TOA reminds you: Sine=Opposite/Hypotenuse, Cosine=Adjacent/Hypotenuse, Tangent=Opposite/Adjacent." },
          { q: "According to SOH-CAH-TOA, which ratio uses both the opposite and adjacent sides (no hypotenuse)?", options: ["Sine", "Cosine", "Tangent", "None of them"], correct: 2, explanation: "TOA stands for Tangent = Opposite/Adjacent, the only ratio that doesn't involve the hypotenuse." },
          { q: "According to SOH-CAH-TOA, which two ratios involve the hypotenuse?", options: ["Sine and Cosine", "Sine and Tangent", "Cosine and Tangent", "All three"], correct: 0, explanation: "SOH (Sine) and CAH (Cosine) both have the hypotenuse in their ratio; TOA (Tangent) does not." },
          { q: "A right triangle has a 30° angle and a hypotenuse of 10. Using sin(30°)=0.5, what is the opposite side?", options: ["3", "4", "5", "6"], correct: 2, explanation: "opposite = sin(30°) × hypotenuse = 0.5 × 10 = 5." },
          { q: "A right triangle has a 60° angle and a hypotenuse of 8. Using cos(60°)=0.5, what is the adjacent side?", options: ["2", "3", "4", "5"], correct: 2, explanation: "adjacent = cos(60°) × hypotenuse = 0.5 × 8 = 4." },
          { q: "A right triangle has an angle where tan(θ)=1 and the adjacent side is 7. What is the opposite side?", options: ["5", "6", "7", "8"], correct: 2, explanation: "opposite = tan(θ) × adjacent = 1 × 7 = 7." },
          { q: "What is an 'angle of elevation'?", options: ["The angle looking down from a height", "The angle looking up from the ground to an object", "Always exactly 90°", "The angle between two ground points"], correct: 1, explanation: "The angle of elevation is measured upward from the horizontal to a point above, like looking up at a tall building." },
          { q: "What is an 'angle of depression'?", options: ["The angle looking up at something", "The angle looking down from a height to an object below", "The same as angle of elevation", "Always 45°"], correct: 1, explanation: "The angle of depression is measured downward from the horizontal to a point below, like looking down from a cliff." },
          { q: "If you're standing 50 feet from a building and the angle of elevation to its top is such that tan(θ)=1.5, how tall is the building?", options: ["50 feet", "60 feet", "75 feet", "100 feet"], correct: 2, explanation: "height = tan(θ) × distance = 1.5 × 50 = 75 feet." },
          { q: "A ladder leans against a wall, forming a right triangle. If the ladder (hypotenuse) is 13 feet and the base is 5 feet from the wall, how high up the wall does it reach?", options: ["10 feet", "11 feet", "12 feet", "13 feet"], correct: 2, explanation: "Using the Pythagorean theorem: 5²+h²=13², so 25+h²=169, h²=144, giving h=12 feet." },
          { q: "A kite string is 100 feet long and makes a 30° angle with the ground. Using sin(30°)=0.5, how high is the kite?", options: ["25 feet", "50 feet", "75 feet", "100 feet"], correct: 1, explanation: "height = sin(30°) × string length = 0.5 × 100 = 50 feet." },
          { q: "A ramp rises 3 feet over a horizontal distance of 4 feet. What is the length of the ramp itself (hypotenuse)?", options: ["4 feet", "5 feet", "6 feet", "7 feet"], correct: 1, explanation: "Using the Pythagorean theorem: 3²+4²=5², so the ramp is 5 feet long." }
        ]
      }
    ]
  },
  {
    name: "Pre-Calculus: Functions",
    lessons: [
      {
        name: "What Is a Function?",
  questions: [
    { q: "What is a function, in mathematical terms?", options: ["Any equation with x and y", "A rule that assigns exactly one output to each input", "An equation that always graphs as a line", "A rule with multiple outputs per input"], correct: 1, explanation: "A function assigns exactly one output value for every input value — this is the defining property." },
    { q: "What test can you use on a graph to check if it represents a function?", options: ["The horizontal line test", "The vertical line test", "The origin test", "The slope test"], correct: 1, explanation: "The vertical line test: if any vertical line crosses the graph more than once, it's not a function (that input would have multiple outputs)." },
    { q: "Is the relation {(1,2), (1,3), (2,4)} a function?", options: ["Yes, every input has an output", "No, because input 1 has two different outputs", "Yes, because it has 3 points", "Cannot tell"], correct: 1, explanation: "Input 1 maps to both 2 and 3 — two different outputs for the same input — so this is not a function." }
  ]
},
      {
        name: "Evaluating Functions",
  questions: [
    { q: "If f(x) = 2x + 3, what is f(4)?", options: ["8", "9", "10", "11"], correct: 3, explanation: "f(4) = 2(4) + 3 = 8 + 3 = 11." },
    { q: "If f(x) = x² - 1, what is f(3)?", options: ["7", "8", "9", "10"], correct: 1, explanation: "f(3) = 3² - 1 = 9 - 1 = 8." },
    { q: "If f(x) = 3x - 5, what is f(-2)?", options: ["-11", "-9", "1", "11"], correct: 0, explanation: "f(-2) = 3(-2) - 5 = -6 - 5 = -11." }
  ]
},
      {
        name: "Domain and Range",
  questions: [
    { q: "What is the 'domain' of a function?", options: ["The set of all possible output values", "The set of all possible input values", "Always all real numbers", "The graph's highest point"], correct: 1, explanation: "The domain is the complete set of possible input (x) values for a function." },
    { q: "What is the 'range' of a function?", options: ["The set of all possible input values", "The set of all possible output values", "The x-intercept", "The slope"], correct: 1, explanation: "The range is the complete set of possible output (y) values a function can produce." },
    { q: "What is the domain of f(x) = 1/x?", options: ["All real numbers", "All real numbers except 0", "Only positive numbers", "Only x=1"], correct: 1, explanation: "Since division by zero is undefined, x cannot be 0 — the domain is all real numbers except 0." }
  ]
},
      {
        name: "Increasing and Decreasing Functions",
  questions: [
    { q: "What does it mean for a function to be 'increasing' on an interval?", options: ["The graph goes down as x increases", "The graph goes up as x increases", "The graph stays flat", "The graph crosses the x-axis"], correct: 1, explanation: "A function is increasing on an interval if its output values go up as the input values increase." },
    { q: "What does it mean for a function to be 'decreasing' on an interval?", options: ["The graph goes up as x increases", "The graph goes down as x increases", "The graph is a straight horizontal line", "The function has no domain"], correct: 1, explanation: "A function is decreasing if its output values go down as the input values increase." },
    { q: "For the parabola y = x², on which side of the vertex (x=0) is the function increasing?", options: ["x < 0 (left side)", "x > 0 (right side)", "Both sides equally", "Neither side"], correct: 1, explanation: "For y=x², the function decreases for x<0 and increases for x>0 (to the right of the vertex)." }
  ]
},
      {
        name: "Inverse Functions",
  questions: [
    { q: "What is the inverse of the function f(x) = x + 5?", options: ["f⁻¹(x) = x - 5", "f⁻¹(x) = x + 5", "f⁻¹(x) = -x - 5", "f⁻¹(x) = 5 - x"], correct: 0, explanation: "To find the inverse, swap x and y then solve: y=x+5 becomes x=y+5, so y=x-5." },
    { q: "What is the inverse of f(x) = 3x?", options: ["f⁻¹(x) = 3x", "f⁻¹(x) = x/3", "f⁻¹(x) = x - 3", "f⁻¹(x) = -3x"], correct: 1, explanation: "Swap and solve: x=3y, so y=x/3." },
    { q: "If f(x) = 2x - 4, what is f⁻¹(x)?", options: ["f⁻¹(x) = (x+4)/2", "f⁻¹(x) = (x-4)/2", "f⁻¹(x) = 2x+4", "f⁻¹(x) = x/2 - 4"], correct: 0, explanation: "Swap and solve: x=2y-4, so x+4=2y, giving y=(x+4)/2." }
  ]
},
      {
        name: "Composite Functions",
  questions: [
    { q: "If f(x) = x + 2 and g(x) = 3x, what is f(g(2))?", options: ["6", "8", "10", "12"], correct: 1, explanation: "First find g(2) = 3(2) = 6. Then f(6) = 6 + 2 = 8." },
    { q: "If f(x) = x² and g(x) = x + 1, what is g(f(3))?", options: ["9", "10", "16", "12"], correct: 1, explanation: "First find f(3) = 3² = 9. Then g(9) = 9 + 1 = 10." },
    { q: "If f(x) = 2x and g(x) = x - 3, what is f(g(5))?", options: ["2", "4", "7", "10"], correct: 1, explanation: "First find g(5) = 5 - 3 = 2. Then f(2) = 2(2) = 4." }
  ]
},
      {
        name: "Transformations of Functions",
  questions: [
    { q: "If f(x) = x² and g(x) = x² + 3, how does g's graph compare to f's?", options: ["Shifted left 3", "Shifted right 3", "Shifted up 3", "Shifted down 3"], correct: 2, explanation: "Adding a constant outside the function (+3) shifts the entire graph upward by 3 units." },
    { q: "If f(x) = x² and g(x) = (x-2)², how does g's graph compare to f's?", options: ["Shifted left 2", "Shifted right 2", "Shifted up 2", "Shifted down 2"], correct: 1, explanation: "Subtracting inside the function, like (x-2), shifts the graph to the right by 2 units." },
    { q: "If f(x) = x² and g(x) = -x², how does g's graph compare to f's?", options: ["Shifted up", "Shifted down", "Reflected over the x-axis", "Reflected over the y-axis"], correct: 2, explanation: "A negative sign in front of the function reflects the graph over the x-axis (flips it upside down)." }
  ]
},
      {
        name: "Piecewise Functions (Introduction)",
  questions: [
    { q: "What is a piecewise function?", options: ["A function with only one rule", "A function defined by different rules for different parts of its domain", "A function that's always increasing", "A function with no domain"], correct: 1, explanation: "A piecewise function uses different formulas depending on which interval the input falls into." },
    { q: "For f(x) = x+1 if x<0, and f(x) = x-1 if x≥0, what is f(-3)?", options: ["-4", "-2", "2", "4"], correct: 1, explanation: "Since -3 < 0, use f(x)=x+1: f(-3) = -3+1 = -2." },
    { q: "Using the same piecewise function, what is f(5)?", options: ["4", "5", "6", "-6"], correct: 0, explanation: "Since 5 ≥ 0, use f(x)=x-1: f(5) = 5-1 = 4." }
  ]
},
      {
        name: "Pre-Calculus Word Problems",
  questions: [
    { q: "A company's profit is modeled by P(x) = 50x - 200, where x is units sold. What is the profit when 10 units are sold?", options: ["$200", "$300", "$400", "$500"], correct: 1, explanation: "P(10) = 50(10) - 200 = 500 - 200 = $300." },
    { q: "A ball's height is h(t) = -5t² + 20t. At what values of t is the ball at height 0?", options: ["t=0 and t=2", "t=0 and t=4", "t=2 and t=4", "t=0 only"], correct: 1, explanation: "Set h(t)=0: -5t²+20t=0, factor: -5t(t-4)=0, so t=0 or t=4." },
    { q: "A temperature conversion function is f(c) = 1.8c + 32 (Celsius to Fahrenheit). What is f(20)?", options: ["52", "58", "68", "72"], correct: 2, explanation: "f(20) = 1.8(20) + 32 = 36 + 32 = 68." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What is a function, in mathematical terms?", options: ["Any equation with x and y", "A rule that assigns exactly one output to each input", "An equation that always graphs as a line", "A rule with multiple outputs per input"], correct: 1, explanation: "A function assigns exactly one output value for every input value — this is the defining property." },
          { q: "What test can you use on a graph to check if it represents a function?", options: ["The horizontal line test", "The vertical line test", "The origin test", "The slope test"], correct: 1, explanation: "The vertical line test: if any vertical line crosses the graph more than once, it's not a function (that input would have multiple outputs)." },
          { q: "Is the relation {(1,2), (1,3), (2,4)} a function?", options: ["Yes, every input has an output", "No, because input 1 has two different outputs", "Yes, because it has 3 points", "Cannot tell"], correct: 1, explanation: "Input 1 maps to both 2 and 3 — two different outputs for the same input — so this is not a function." },
          { q: "If f(x) = 2x + 3, what is f(4)?", options: ["8", "9", "10", "11"], correct: 3, explanation: "f(4) = 2(4) + 3 = 8 + 3 = 11." },
          { q: "If f(x) = x² - 1, what is f(3)?", options: ["7", "8", "9", "10"], correct: 1, explanation: "f(3) = 3² - 1 = 9 - 1 = 8." },
          { q: "If f(x) = 3x - 5, what is f(-2)?", options: ["-11", "-9", "1", "11"], correct: 0, explanation: "f(-2) = 3(-2) - 5 = -6 - 5 = -11." },
          { q: "What is the 'domain' of a function?", options: ["The set of all possible output values", "The set of all possible input values", "Always all real numbers", "The graph's highest point"], correct: 1, explanation: "The domain is the complete set of possible input (x) values for a function." },
          { q: "What is the 'range' of a function?", options: ["The set of all possible input values", "The set of all possible output values", "The x-intercept", "The slope"], correct: 1, explanation: "The range is the complete set of possible output (y) values a function can produce." },
          { q: "What is the domain of f(x) = 1/x?", options: ["All real numbers", "All real numbers except 0", "Only positive numbers", "Only x=1"], correct: 1, explanation: "Since division by zero is undefined, x cannot be 0 — the domain is all real numbers except 0." },
          { q: "What does it mean for a function to be 'increasing' on an interval?", options: ["The graph goes down as x increases", "The graph goes up as x increases", "The graph stays flat", "The graph crosses the x-axis"], correct: 1, explanation: "A function is increasing on an interval if its output values go up as the input values increase." },
          { q: "What does it mean for a function to be 'decreasing' on an interval?", options: ["The graph goes up as x increases", "The graph goes down as x increases", "The graph is a straight horizontal line", "The function has no domain"], correct: 1, explanation: "A function is decreasing if its output values go down as the input values increase." },
          { q: "For the parabola y = x², on which side of the vertex (x=0) is the function increasing?", options: ["x < 0 (left side)", "x > 0 (right side)", "Both sides equally", "Neither side"], correct: 1, explanation: "For y=x², the function decreases for x<0 and increases for x>0 (to the right of the vertex)." },
          { q: "What is the inverse of the function f(x) = x + 5?", options: ["f⁻¹(x) = x - 5", "f⁻¹(x) = x + 5", "f⁻¹(x) = -x - 5", "f⁻¹(x) = 5 - x"], correct: 0, explanation: "To find the inverse, swap x and y then solve: y=x+5 becomes x=y+5, so y=x-5." },
          { q: "What is the inverse of f(x) = 3x?", options: ["f⁻¹(x) = 3x", "f⁻¹(x) = x/3", "f⁻¹(x) = x - 3", "f⁻¹(x) = -3x"], correct: 1, explanation: "Swap and solve: x=3y, so y=x/3." },
          { q: "If f(x) = 2x - 4, what is f⁻¹(x)?", options: ["f⁻¹(x) = (x+4)/2", "f⁻¹(x) = (x-4)/2", "f⁻¹(x) = 2x+4", "f⁻¹(x) = x/2 - 4"], correct: 0, explanation: "Swap and solve: x=2y-4, so x+4=2y, giving y=(x+4)/2." },
          { q: "If f(x) = x + 2 and g(x) = 3x, what is f(g(2))?", options: ["6", "8", "10", "12"], correct: 1, explanation: "First find g(2) = 3(2) = 6. Then f(6) = 6 + 2 = 8." },
          { q: "If f(x) = x² and g(x) = x + 1, what is g(f(3))?", options: ["9", "10", "16", "12"], correct: 1, explanation: "First find f(3) = 3² = 9. Then g(9) = 9 + 1 = 10." },
          { q: "If f(x) = 2x and g(x) = x - 3, what is f(g(5))?", options: ["2", "4", "7", "10"], correct: 1, explanation: "First find g(5) = 5 - 3 = 2. Then f(2) = 2(2) = 4." },
          { q: "If f(x) = x² and g(x) = x² + 3, how does g's graph compare to f's?", options: ["Shifted left 3", "Shifted right 3", "Shifted up 3", "Shifted down 3"], correct: 2, explanation: "Adding a constant outside the function (+3) shifts the entire graph upward by 3 units." },
          { q: "If f(x) = x² and g(x) = (x-2)², how does g's graph compare to f's?", options: ["Shifted left 2", "Shifted right 2", "Shifted up 2", "Shifted down 2"], correct: 1, explanation: "Subtracting inside the function, like (x-2), shifts the graph to the right by 2 units." },
          { q: "If f(x) = x² and g(x) = -x², how does g's graph compare to f's?", options: ["Shifted up", "Shifted down", "Reflected over the x-axis", "Reflected over the y-axis"], correct: 2, explanation: "A negative sign in front of the function reflects the graph over the x-axis (flips it upside down)." },
          { q: "What is a piecewise function?", options: ["A function with only one rule", "A function defined by different rules for different parts of its domain", "A function that's always increasing", "A function with no domain"], correct: 1, explanation: "A piecewise function uses different formulas depending on which interval the input falls into." },
          { q: "For f(x) = x+1 if x<0, and f(x) = x-1 if x≥0, what is f(-3)?", options: ["-4", "-2", "2", "4"], correct: 1, explanation: "Since -3 < 0, use f(x)=x+1: f(-3) = -3+1 = -2." },
          { q: "Using the same piecewise function, what is f(5)?", options: ["4", "5", "6", "-6"], correct: 0, explanation: "Since 5 ≥ 0, use f(x)=x-1: f(5) = 5-1 = 4." },
          { q: "A company's profit is modeled by P(x) = 50x - 200, where x is units sold. What is the profit when 10 units are sold?", options: ["$200", "$300", "$400", "$500"], correct: 1, explanation: "P(10) = 50(10) - 200 = 500 - 200 = $300." },
          { q: "A ball's height is h(t) = -5t² + 20t. At what values of t is the ball at height 0?", options: ["t=0 and t=2", "t=0 and t=4", "t=2 and t=4", "t=0 only"], correct: 1, explanation: "Set h(t)=0: -5t²+20t=0, factor: -5t(t-4)=0, so t=0 or t=4." },
          { q: "A temperature conversion function is f(c) = 1.8c + 32 (Celsius to Fahrenheit). What is f(20)?", options: ["52", "58", "68", "72"], correct: 2, explanation: "f(20) = 1.8(20) + 32 = 36 + 32 = 68." }
        ]
      }
    ]
  },
  {
    name: "Calculus & Trigonometry Basics",
    lessons: [
      {
        name: "Introduction to Derivatives",
  questions: [
    { q: "What does a derivative measure?", options: ["The area under a curve", "The instantaneous rate of change of a function", "The total value of a function", "The domain of a function"], correct: 1, explanation: "A derivative gives the instantaneous rate of change — essentially, the slope of the function at a specific point." },
    { q: "What is the derivative of x² with respect to x?", options: ["x", "2x", "x²", "2"], correct: 1, explanation: "Using the power rule (bring down the exponent, reduce it by 1): the derivative of x² is 2x." },
    { q: "What is the derivative of x³?", options: ["x²", "2x²", "3x²", "3x"], correct: 2, explanation: "Using the power rule: bring down the 3, reduce the exponent by 1: 3x²." }
  ]
},
      {
        name: "The Power Rule",
  questions: [
    { q: "Using the power rule, what is the derivative of x⁵?", options: ["4x⁴", "5x⁴", "5x⁵", "x⁴"], correct: 1, explanation: "Power rule: bring down the exponent (5) and reduce it by 1: 5x⁴." },
    { q: "What is the derivative of a constant, like 7?", options: ["7", "1", "0", "Undefined"], correct: 2, explanation: "A constant never changes, so its rate of change (derivative) is always 0." },
    { q: "What is the derivative of 4x³?", options: ["4x²", "12x²", "12x³", "3x²"], correct: 1, explanation: "Apply the power rule to x³ (giving 3x²) and multiply by the coefficient 4: 4×3x² = 12x²." }
  ]
},
      {
        name: "Introduction to Limits",
  questions: [
    { q: "What does a 'limit' describe in calculus?", options: ["The exact value at a point", "The value a function approaches as the input gets close to some value", "The highest point of a graph", "The domain of a function"], correct: 1, explanation: "A limit describes the value a function approaches as the input gets arbitrarily close to a specific point, even if the function isn't defined there." },
    { q: "What is the limit of (x² − 1) / (x − 1) as x approaches 1?", options: ["0", "1", "2", "Undefined"], correct: 2, explanation: "Factor: (x-1)(x+1)/(x-1) = x+1 for x≠1. As x approaches 1, this approaches 1+1=2." },
    { q: "What is the limit of 3x + 2 as x approaches 4?", options: ["12", "13", "14", "15"], correct: 2, explanation: "Since this function is continuous everywhere, just substitute: 3(4)+2 = 14." }
  ]
},
      {
        name: "Basic Derivative Rules",
  questions: [
    { q: "What is the derivative of f(x) = 3x² + 2x?", options: ["6x + 2", "3x + 2", "6x²+2x", "6x"], correct: 0, explanation: "Apply the power rule to each term: derivative of 3x² is 6x, and derivative of 2x is 2, giving 6x+2." },
    { q: "What is the derivative of f(x) = x² + 5?", options: ["2x", "2x+5", "x", "5"], correct: 0, explanation: "The derivative of x² is 2x, and the derivative of the constant 5 is 0, giving just 2x." },
    { q: "What is the derivative of f(x) = 5x⁴ - 3x?", options: ["20x³ - 3", "20x³ - 3x", "5x³ - 3", "4x³ - 3"], correct: 0, explanation: "Derivative of 5x⁴ is 20x³, and derivative of -3x is -3, giving 20x³-3." }
  ]
},
      {
        name: "Introduction to Integrals",
  questions: [
    { q: "What is the integral of 2x dx?", options: ["x²", "x² + C", "2x² + C", "x"], correct: 1, explanation: "Integration reverses differentiation. Since the derivative of x² is 2x, the integral of 2x is x² + C (the +C accounts for any constant that would vanish upon differentiating)." },
    { q: "What is the integral of 3 dx?", options: ["3", "3x", "3x + C", "x + C"], correct: 2, explanation: "The integral of a constant 3 is 3x + C." },
    { q: "What is the integral of x dx?", options: ["x²/2 + C", "x² + C", "2x + C", "x/2 + C"], correct: 0, explanation: "Using the reverse power rule: raise the power by 1 and divide by the new power: x²/2 + C." }
  ]
},
      {
        name: "Sine of Special Angles",
  questions: [
    { q: "What is the value of sin(90°)?", options: ["0", "0.5", "0.707", "1"], correct: 3, explanation: "sin(90°) = 1, its maximum possible value." },
    { q: "What is the value of sin(0°)?", options: ["0", "0.5", "0.707", "1"], correct: 0, explanation: "sin(0°) = 0." },
    { q: "What is the value of sin(30°)?", options: ["0", "0.5", "0.707", "1"], correct: 1, explanation: "sin(30°) = 0.5 (or 1/2), a commonly memorized special angle value." }
  ]
},
      {
        name: "Cosine of Special Angles",
  questions: [
    { q: "What is the value of cos(60°)?", options: ["0", "0.5", "0.707", "1"], correct: 1, explanation: "cos(60°) = 0.5 (or 1/2)." },
    { q: "What is the value of cos(0°)?", options: ["0", "0.5", "0.707", "1"], correct: 3, explanation: "cos(0°) = 1, its maximum possible value." },
    { q: "What is the value of cos(90°)?", options: ["0", "0.5", "0.707", "1"], correct: 0, explanation: "cos(90°) = 0." }
  ]
},
      {
        name: "The Unit Circle",
  questions: [
    { q: "What is the radius of the unit circle?", options: ["0", "0.5", "1", "It varies"], correct: 2, explanation: "The unit circle, by definition, has a radius of exactly 1." },
    { q: "On the unit circle, what do the coordinates of a point at angle θ represent?", options: ["(sin θ, cos θ)", "(cos θ, sin θ)", "(tan θ, 1)", "(1, θ)"], correct: 1, explanation: "On the unit circle, a point at angle θ has coordinates (cos θ, sin θ)." },
    { q: "What is sin²(θ) + cos²(θ) equal to, for any angle θ?", options: ["0", "1", "2", "It varies by angle"], correct: 1, explanation: "This is the Pythagorean identity: sin²(θ) + cos²(θ) = 1 for all angles, a direct result of the unit circle having radius 1." }
  ]
},
      {
        name: "Calculus & Trig Word Problems",
  questions: [
    { q: "A car's position is given by s(t) = t² + 3t (in meters, t in seconds). What is its velocity (the derivative) at any time t?", options: ["t + 3", "2t + 3", "t² + 3", "2t"], correct: 1, explanation: "Velocity is the derivative of position: the derivative of t²+3t is 2t+3." },
    { q: "A Ferris wheel's height is modeled using sin. If the height formula gives sin(90°) at the top, what is the sine value there?", options: ["0", "0.5", "0.707", "1"], correct: 3, explanation: "sin(90°) = 1, representing the maximum height point in this model." },
    { q: "If a function's derivative is always positive on an interval, what does that tell you about the function there?", options: ["It's decreasing", "It's constant", "It's increasing", "It has no meaning"], correct: 2, explanation: "A positive derivative means the function's rate of change is positive, so the function is increasing on that interval." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What does a derivative measure?", options: ["The area under a curve", "The instantaneous rate of change of a function", "The total value of a function", "The domain of a function"], correct: 1, explanation: "A derivative gives the instantaneous rate of change — essentially, the slope of the function at a specific point." },
          { q: "What is the derivative of x² with respect to x?", options: ["x", "2x", "x²", "2"], correct: 1, explanation: "Using the power rule (bring down the exponent, reduce it by 1): the derivative of x² is 2x." },
          { q: "What is the derivative of x³?", options: ["x²", "2x²", "3x²", "3x"], correct: 2, explanation: "Using the power rule: bring down the 3, reduce the exponent by 1: 3x²." },
          { q: "Using the power rule, what is the derivative of x⁵?", options: ["4x⁴", "5x⁴", "5x⁵", "x⁴"], correct: 1, explanation: "Power rule: bring down the exponent (5) and reduce it by 1: 5x⁴." },
          { q: "What is the derivative of a constant, like 7?", options: ["7", "1", "0", "Undefined"], correct: 2, explanation: "A constant never changes, so its rate of change (derivative) is always 0." },
          { q: "What is the derivative of 4x³?", options: ["4x²", "12x²", "12x³", "3x²"], correct: 1, explanation: "Apply the power rule to x³ (giving 3x²) and multiply by the coefficient 4: 4×3x² = 12x²." },
          { q: "What does a 'limit' describe in calculus?", options: ["The exact value at a point", "The value a function approaches as the input gets close to some value", "The highest point of a graph", "The domain of a function"], correct: 1, explanation: "A limit describes the value a function approaches as the input gets arbitrarily close to a specific point, even if the function isn't defined there." },
          { q: "What is the limit of (x² − 1) / (x − 1) as x approaches 1?", options: ["0", "1", "2", "Undefined"], correct: 2, explanation: "Factor: (x-1)(x+1)/(x-1) = x+1 for x≠1. As x approaches 1, this approaches 1+1=2." },
          { q: "What is the limit of 3x + 2 as x approaches 4?", options: ["12", "13", "14", "15"], correct: 2, explanation: "Since this function is continuous everywhere, just substitute: 3(4)+2 = 14." },
          { q: "What is the derivative of f(x) = 3x² + 2x?", options: ["6x + 2", "3x + 2", "6x²+2x", "6x"], correct: 0, explanation: "Apply the power rule to each term: derivative of 3x² is 6x, and derivative of 2x is 2, giving 6x+2." },
          { q: "What is the derivative of f(x) = x² + 5?", options: ["2x", "2x+5", "x", "5"], correct: 0, explanation: "The derivative of x² is 2x, and the derivative of the constant 5 is 0, giving just 2x." },
          { q: "What is the derivative of f(x) = 5x⁴ - 3x?", options: ["20x³ - 3", "20x³ - 3x", "5x³ - 3", "4x³ - 3"], correct: 0, explanation: "Derivative of 5x⁴ is 20x³, and derivative of -3x is -3, giving 20x³-3." },
          { q: "What is the integral of 2x dx?", options: ["x²", "x² + C", "2x² + C", "x"], correct: 1, explanation: "Integration reverses differentiation. Since the derivative of x² is 2x, the integral of 2x is x² + C (the +C accounts for any constant that would vanish upon differentiating)." },
          { q: "What is the integral of 3 dx?", options: ["3", "3x", "3x + C", "x + C"], correct: 2, explanation: "The integral of a constant 3 is 3x + C." },
          { q: "What is the integral of x dx?", options: ["x²/2 + C", "x² + C", "2x + C", "x/2 + C"], correct: 0, explanation: "Using the reverse power rule: raise the power by 1 and divide by the new power: x²/2 + C." },
          { q: "What is the value of sin(90°)?", options: ["0", "0.5", "0.707", "1"], correct: 3, explanation: "sin(90°) = 1, its maximum possible value." },
          { q: "What is the value of sin(0°)?", options: ["0", "0.5", "0.707", "1"], correct: 0, explanation: "sin(0°) = 0." },
          { q: "What is the value of sin(30°)?", options: ["0", "0.5", "0.707", "1"], correct: 1, explanation: "sin(30°) = 0.5 (or 1/2), a commonly memorized special angle value." },
          { q: "What is the value of cos(60°)?", options: ["0", "0.5", "0.707", "1"], correct: 1, explanation: "cos(60°) = 0.5 (or 1/2)." },
          { q: "What is the value of cos(0°)?", options: ["0", "0.5", "0.707", "1"], correct: 3, explanation: "cos(0°) = 1, its maximum possible value." },
          { q: "What is the value of cos(90°)?", options: ["0", "0.5", "0.707", "1"], correct: 0, explanation: "cos(90°) = 0." },
          { q: "What is the radius of the unit circle?", options: ["0", "0.5", "1", "It varies"], correct: 2, explanation: "The unit circle, by definition, has a radius of exactly 1." },
          { q: "On the unit circle, what do the coordinates of a point at angle θ represent?", options: ["(sin θ, cos θ)", "(cos θ, sin θ)", "(tan θ, 1)", "(1, θ)"], correct: 1, explanation: "On the unit circle, a point at angle θ has coordinates (cos θ, sin θ)." },
          { q: "What is sin²(θ) + cos²(θ) equal to, for any angle θ?", options: ["0", "1", "2", "It varies by angle"], correct: 1, explanation: "This is the Pythagorean identity: sin²(θ) + cos²(θ) = 1 for all angles, a direct result of the unit circle having radius 1." },
          { q: "A car's position is given by s(t) = t² + 3t (in meters, t in seconds). What is its velocity (the derivative) at any time t?", options: ["t + 3", "2t + 3", "t² + 3", "2t"], correct: 1, explanation: "Velocity is the derivative of position: the derivative of t²+3t is 2t+3." },
          { q: "A Ferris wheel's height is modeled using sin. If the height formula gives sin(90°) at the top, what is the sine value there?", options: ["0", "0.5", "0.707", "1"], correct: 3, explanation: "sin(90°) = 1, representing the maximum height point in this model." },
          { q: "If a function's derivative is always positive on an interval, what does that tell you about the function there?", options: ["It's decreasing", "It's constant", "It's increasing", "It has no meaning"], correct: 2, explanation: "A positive derivative means the function's rate of change is positive, so the function is increasing on that interval." }
        ]
      }
    ]
  },
  {
    name: "Integral Calculus Basics",
    lessons: [
      {
        name: "What Is Integration?",
  questions: [
    { q: "What does integration generally calculate, geometrically?", options: ["The slope of a tangent line", "The area under a curve", "The domain of a function", "The highest point of a graph"], correct: 1, explanation: "Integration calculates the area between a function's curve and the x-axis over a given interval." },
    { q: "What is the relationship between differentiation and integration?", options: ["They are unrelated operations", "Integration is the reverse process of differentiation", "They always give the same result", "Differentiation is used only for areas"], correct: 1, explanation: "Integration and differentiation are inverse operations — integrating a derivative gets you back to (a version of) the original function." },
    { q: "What symbol is typically used to represent an integral?", options: ["Δ (delta)", "∫ (integral sign)", "Σ (sigma)", "√ (square root)"], correct: 1, explanation: "The elongated 'S' symbol ∫ represents integration, historically standing for a sum of infinitely many small pieces." }
  ]
},
      {
        name: "Indefinite Integrals",
  questions: [
    { q: "What is the indefinite integral of 2x?", options: ["x²", "x² + C", "2x² + C", "x + C"], correct: 1, explanation: "Reversing the power rule: the integral of 2x is x² + C." },
    { q: "What is the indefinite integral of 4x³?", options: ["x⁴ + C", "4x⁴ + C", "x⁴/4 + C", "12x² + C"], correct: 0, explanation: "Raise the power by 1 (giving x⁴) and divide by the new power (4): (4/4)x⁴ = x⁴ + C." },
    { q: "What is the indefinite integral of 6?", options: ["6", "6x", "6x + C", "x + C"], correct: 2, explanation: "The integral of a constant 6 is 6x + C." }
  ]
},
      {
        name: "The Constant of Integration",
  questions: [
    { q: "What does the '+C' represent in an indefinite integral?", options: ["A fixed number that's always 5", "An unknown constant, since constants disappear when differentiating", "The x-intercept", "A calculation error"], correct: 1, explanation: "Since the derivative of any constant is 0, when reversing differentiation we can't know what constant was originally there — so we add +C to represent any possible constant." },
    { q: "If F(x) = x² + 5 and G(x) = x² - 3 both have the same derivative, what does this tell you?", options: ["One of them is wrong", "They differ only by a constant", "They must be equal", "Neither is a valid antiderivative"], correct: 1, explanation: "Since both differentiate to 2x, they are both valid antiderivatives of 2x, differing only by a constant (5 vs -3) — exactly what +C accounts for." },
    { q: "Why can't you determine the exact value of C from an indefinite integral alone?", options: ["C is always 0", "Additional information (like an initial condition) is needed to pin down C", "C never exists", "Integration doesn't need a constant"], correct: 1, explanation: "Without extra information (like a known point the function passes through), any value of C is equally valid, so we leave it general." }
  ]
},
      {
        name: "Definite Integrals",
  questions: [
    { q: "A 'definite integral' differs from an indefinite integral because it:", options: ["Has no constant of integration and gives a specific numeric value", "Is always equal to zero", "Can't be calculated", "Only works for straight lines"], correct: 0, explanation: "A definite integral is evaluated between two specific bounds, producing a single numeric value (the area under the curve between those bounds) with no +C." },
    { q: "What do the numbers written at the top and bottom of the integral sign in a definite integral represent?", options: ["The slope range", "The upper and lower bounds of the interval", "The function's domain", "Random constants"], correct: 1, explanation: "These numbers mark the interval over which you're calculating the area — the lower and upper bounds." },
    { q: "If ∫f(x)dx from 0 to 3 represents an area, what would a larger interval (0 to 6) generally give, assuming f(x) stays positive?", options: ["A smaller area", "The same area", "A larger area (or equal, never smaller)", "Cannot tell"], correct: 2, explanation: "Extending the interval while the function stays positive adds more area, so the total is larger (or the same if f(x)=0 on the new part)." }
  ]
},
      {
        name: "Evaluating Definite Integrals",
  questions: [
    { q: "To evaluate a definite integral, you find the antiderivative F(x) and calculate:", options: ["F(upper) + F(lower)", "F(upper) - F(lower)", "F(upper) × F(lower)", "F(upper) ÷ F(lower)"], correct: 1, explanation: "The Fundamental Theorem of Calculus says the definite integral equals F(upper bound) - F(lower bound)." },
    { q: "If F(x) = x² is the antiderivative of 2x, what is the definite integral of 2x from 0 to 3?", options: ["3", "6", "9", "12"], correct: 2, explanation: "F(3) - F(0) = 3² - 0² = 9 - 0 = 9." },
    { q: "If F(x) = x²/2 is the antiderivative of x, what is the definite integral of x from 1 to 3?", options: ["2", "3", "4", "5"], correct: 2, explanation: "F(3) - F(1) = 9/2 - 1/2 = 8/2 = 4." }
  ]
},
      {
        name: "Area Under a Curve",
  questions: [
    { q: "The definite integral of a positive function over an interval gives:", options: ["The slope of the curve", "The area between the curve and the x-axis", "The maximum value of the function", "The domain"], correct: 1, explanation: "For a positive function, the definite integral directly equals the area between the curve and the x-axis." },
    { q: "What happens to the sign of a definite integral if the function is below the x-axis over the interval?", options: ["It stays positive", "It becomes negative", "It becomes zero", "Integrals can't be negative"], correct: 1, explanation: "When a function is negative (below the x-axis), its definite integral over that interval is negative, even though 'area' is normally positive." },
    { q: "What is the definite integral of a constant function f(x)=4 from x=0 to x=5, geometrically?", options: ["The area of a rectangle: 4×5=20", "Zero", "Undefined", "The perimeter"], correct: 0, explanation: "A constant function forms a rectangle with height 4 and width 5, so the area (and the integral) is 4×5=20." }
  ]
},
      {
        name: "The Fundamental Theorem of Calculus",
  questions: [
    { q: "What does the Fundamental Theorem of Calculus connect?", options: ["Addition and subtraction", "Differentiation and integration", "Fractions and decimals", "Triangles and circles"], correct: 1, explanation: "The Fundamental Theorem of Calculus establishes that differentiation and integration are inverse processes of each other." },
    { q: "According to the Fundamental Theorem, if F'(x) = f(x), what is the definite integral of f(x) from a to b?", options: ["F(a) - F(b)", "F(b) - F(a)", "F(a) + F(b)", "F(a) × F(b)"], correct: 1, explanation: "The definite integral equals F(b) - F(a), where F is any antiderivative of f." },
    { q: "Why is the Fundamental Theorem of Calculus considered so important?", options: ["It only applies to triangles", "It links the two main branches of calculus, making integrals computable via antiderivatives", "It replaces algebra entirely", "It has no practical use"], correct: 1, explanation: "It provides a practical way to compute definite integrals directly using antiderivatives, rather than complex area-approximation methods." }
  ]
},
      {
        name: "Applications of Integration",
  questions: [
    { q: "If v(t) represents velocity, what does the integral of v(t) represent?", options: ["Acceleration", "Displacement (position change)", "Force", "Time"], correct: 1, explanation: "Since velocity is the derivative of position, integrating velocity gives back displacement (position change) — the reverse operation." },
    { q: "If a(t) represents acceleration, what does the integral of a(t) give you?", options: ["Position", "Velocity", "Distance only", "Time"], correct: 1, explanation: "Since acceleration is the derivative of velocity, integrating acceleration gives back velocity." },
    { q: "Integration can be used to find the average value of a function over an interval. What general field commonly uses this application?", options: ["Only art", "Physics, economics, and engineering, among others", "No real field uses it", "Only music theory"], correct: 1, explanation: "Integration for averages and totals is widely used across physics (work, distance), economics (consumer surplus), and engineering (material stress)." }
  ]
},
      {
        name: "Integral Calculus Word Problems",
  questions: [
    { q: "A car's velocity is v(t) = 4t (meters/second). Using the antiderivative F(t)=2t², what distance does it travel from t=0 to t=3?", options: ["12 meters", "18 meters", "24 meters", "36 meters"], correct: 1, explanation: "Distance = F(3) - F(0) = 2(3²) - 2(0²) = 18 - 0 = 18 meters." },
    { q: "A factory's production rate is f(t) = 10 units per hour. Using the antiderivative F(t)=10t, how many units are made from t=0 to t=8 hours?", options: ["18", "40", "80", "100"], correct: 2, explanation: "Total units = F(8) - F(0) = 10(8) - 10(0) = 80." },
    { q: "Water flows into a tank at rate r(t) = 3t liters/minute. Using F(t)=1.5t², how many liters accumulate from t=0 to t=4 minutes?", options: ["12", "18", "24", "36"], correct: 2, explanation: "Total = F(4) - F(0) = 1.5(16) - 1.5(0) = 24 liters." }
  ]
},
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What does integration generally calculate, geometrically?", options: ["The slope of a tangent line", "The area under a curve", "The domain of a function", "The highest point of a graph"], correct: 1, explanation: "Integration calculates the area between a function's curve and the x-axis over a given interval." },
          { q: "What is the relationship between differentiation and integration?", options: ["They are unrelated operations", "Integration is the reverse process of differentiation", "They always give the same result", "Differentiation is used only for areas"], correct: 1, explanation: "Integration and differentiation are inverse operations — integrating a derivative gets you back to (a version of) the original function." },
          { q: "What symbol is typically used to represent an integral?", options: ["Δ (delta)", "∫ (integral sign)", "Σ (sigma)", "√ (square root)"], correct: 1, explanation: "The elongated 'S' symbol ∫ represents integration, historically standing for a sum of infinitely many small pieces." },
          { q: "What is the indefinite integral of 2x?", options: ["x²", "x² + C", "2x² + C", "x + C"], correct: 1, explanation: "Reversing the power rule: the integral of 2x is x² + C." },
          { q: "What is the indefinite integral of 4x³?", options: ["x⁴ + C", "4x⁴ + C", "x⁴/4 + C", "12x² + C"], correct: 0, explanation: "Raise the power by 1 (giving x⁴) and divide by the new power (4): (4/4)x⁴ = x⁴ + C." },
          { q: "What is the indefinite integral of 6?", options: ["6", "6x", "6x + C", "x + C"], correct: 2, explanation: "The integral of a constant 6 is 6x + C." },
          { q: "What does the '+C' represent in an indefinite integral?", options: ["A fixed number that's always 5", "An unknown constant, since constants disappear when differentiating", "The x-intercept", "A calculation error"], correct: 1, explanation: "Since the derivative of any constant is 0, when reversing differentiation we can't know what constant was originally there — so we add +C to represent any possible constant." },
          { q: "If F(x) = x² + 5 and G(x) = x² - 3 both have the same derivative, what does this tell you?", options: ["One of them is wrong", "They differ only by a constant", "They must be equal", "Neither is a valid antiderivative"], correct: 1, explanation: "Since both differentiate to 2x, they are both valid antiderivatives of 2x, differing only by a constant (5 vs -3) — exactly what +C accounts for." },
          { q: "Why can't you determine the exact value of C from an indefinite integral alone?", options: ["C is always 0", "Additional information (like an initial condition) is needed to pin down C", "C never exists", "Integration doesn't need a constant"], correct: 1, explanation: "Without extra information (like a known point the function passes through), any value of C is equally valid, so we leave it general." },
          { q: "A 'definite integral' differs from an indefinite integral because it:", options: ["Has no constant of integration and gives a specific numeric value", "Is always equal to zero", "Can't be calculated", "Only works for straight lines"], correct: 0, explanation: "A definite integral is evaluated between two specific bounds, producing a single numeric value (the area under the curve between those bounds) with no +C." },
          { q: "What do the numbers written at the top and bottom of the integral sign in a definite integral represent?", options: ["The slope range", "The upper and lower bounds of the interval", "The function's domain", "Random constants"], correct: 1, explanation: "These numbers mark the interval over which you're calculating the area — the lower and upper bounds." },
          { q: "If ∫f(x)dx from 0 to 3 represents an area, what would a larger interval (0 to 6) generally give, assuming f(x) stays positive?", options: ["A smaller area", "The same area", "A larger area (or equal, never smaller)", "Cannot tell"], correct: 2, explanation: "Extending the interval while the function stays positive adds more area, so the total is larger (or the same if f(x)=0 on the new part)." },
          { q: "To evaluate a definite integral, you find the antiderivative F(x) and calculate:", options: ["F(upper) + F(lower)", "F(upper) - F(lower)", "F(upper) × F(lower)", "F(upper) ÷ F(lower)"], correct: 1, explanation: "The Fundamental Theorem of Calculus says the definite integral equals F(upper bound) - F(lower bound)." },
          { q: "If F(x) = x² is the antiderivative of 2x, what is the definite integral of 2x from 0 to 3?", options: ["3", "6", "9", "12"], correct: 2, explanation: "F(3) - F(0) = 3² - 0² = 9 - 0 = 9." },
          { q: "If F(x) = x²/2 is the antiderivative of x, what is the definite integral of x from 1 to 3?", options: ["2", "3", "4", "5"], correct: 2, explanation: "F(3) - F(1) = 9/2 - 1/2 = 8/2 = 4." },
          { q: "The definite integral of a positive function over an interval gives:", options: ["The slope of the curve", "The area between the curve and the x-axis", "The maximum value of the function", "The domain"], correct: 1, explanation: "For a positive function, the definite integral directly equals the area between the curve and the x-axis." },
          { q: "What happens to the sign of a definite integral if the function is below the x-axis over the interval?", options: ["It stays positive", "It becomes negative", "It becomes zero", "Integrals can't be negative"], correct: 1, explanation: "When a function is negative (below the x-axis), its definite integral over that interval is negative, even though 'area' is normally positive." },
          { q: "What is the definite integral of a constant function f(x)=4 from x=0 to x=5, geometrically?", options: ["The area of a rectangle: 4×5=20", "Zero", "Undefined", "The perimeter"], correct: 0, explanation: "A constant function forms a rectangle with height 4 and width 5, so the area (and the integral) is 4×5=20." },
          { q: "What does the Fundamental Theorem of Calculus connect?", options: ["Addition and subtraction", "Differentiation and integration", "Fractions and decimals", "Triangles and circles"], correct: 1, explanation: "The Fundamental Theorem of Calculus establishes that differentiation and integration are inverse processes of each other." },
          { q: "According to the Fundamental Theorem, if F'(x) = f(x), what is the definite integral of f(x) from a to b?", options: ["F(a) - F(b)", "F(b) - F(a)", "F(a) + F(b)", "F(a) × F(b)"], correct: 1, explanation: "The definite integral equals F(b) - F(a), where F is any antiderivative of f." },
          { q: "Why is the Fundamental Theorem of Calculus considered so important?", options: ["It only applies to triangles", "It links the two main branches of calculus, making integrals computable via antiderivatives", "It replaces algebra entirely", "It has no practical use"], correct: 1, explanation: "It provides a practical way to compute definite integrals directly using antiderivatives, rather than complex area-approximation methods." },
          { q: "If v(t) represents velocity, what does the integral of v(t) represent?", options: ["Acceleration", "Displacement (position change)", "Force", "Time"], correct: 1, explanation: "Since velocity is the derivative of position, integrating velocity gives back displacement (position change) — the reverse operation." },
          { q: "If a(t) represents acceleration, what does the integral of a(t) give you?", options: ["Position", "Velocity", "Distance only", "Time"], correct: 1, explanation: "Since acceleration is the derivative of velocity, integrating acceleration gives back velocity." },
          { q: "Integration can be used to find the average value of a function over an interval. What general field commonly uses this application?", options: ["Only art", "Physics, economics, and engineering, among others", "No real field uses it", "Only music theory"], correct: 1, explanation: "Integration for averages and totals is widely used across physics (work, distance), economics (consumer surplus), and engineering (material stress)." },
          { q: "A car's velocity is v(t) = 4t (meters/second). Using the antiderivative F(t)=2t², what distance does it travel from t=0 to t=3?", options: ["12 meters", "18 meters", "24 meters", "36 meters"], correct: 1, explanation: "Distance = F(3) - F(0) = 2(3²) - 2(0²) = 18 - 0 = 18 meters." },
          { q: "A factory's production rate is f(t) = 10 units per hour. Using the antiderivative F(t)=10t, how many units are made from t=0 to t=8 hours?", options: ["18", "40", "80", "100"], correct: 2, explanation: "Total units = F(8) - F(0) = 10(8) - 10(0) = 80." },
          { q: "Water flows into a tank at rate r(t) = 3t liters/minute. Using F(t)=1.5t², how many liters accumulate from t=0 to t=4 minutes?", options: ["12", "18", "24", "36"], correct: 2, explanation: "Total = F(4) - F(0) = 1.5(16) - 1.5(0) = 24 liters." }
        ]
      }
    ]
  }

],
  science: [
  {
    name: "Astronomy Basics",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What planet is known as the Red Planet?",
        options: [
          "Venus",
          "Mars",
          "Jupiter",
          "Saturn"
        ],
        correct: 1,
        explanation: "Mars appears reddish because its surface is covered in iron oxide, better known as rust."
      },
          {
        q: "What is the closest star to Earth?",
        options: [
          "Proxima Centauri",
          "The Sun",
          "Sirius",
          "Alpha Centauri"
        ],
        correct: 1,
        explanation: "The Sun is by far the closest star to Earth, about 150 million km away."
      },
          {
        q: "Which planet is known for its prominent rings?",
        options: [
          "Mars",
          "Saturn",
          "Mercury",
          "Venus"
        ],
        correct: 1,
        explanation: "Saturn is famous for its extensive, visible ring system made mostly of ice and rock particles."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is the speed of light in a vacuum (approximately)?",
        options: [
          "3×10⁵ km/s",
          "3×10⁸ m/s",
          "3×10³ m/s",
          "3×10⁸ km/s"
        ],
        correct: 1,
        explanation: "Light travels at approximately 299,792,458 meters per second in a vacuum, commonly rounded to 3×10⁸ m/s."
      },
          {
        q: "What is the name of our galaxy?",
        options: [
          "Andromeda",
          "Milky Way",
          "Triangulum",
          "Whirlpool"
        ],
        correct: 1,
        explanation: "Our solar system is located within the Milky Way galaxy."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What planet is known as the Red Planet?",
        options: [
          "Venus",
          "Mars",
          "Jupiter",
          "Saturn"
        ],
        correct: 1,
        explanation: "Mars appears reddish because its surface is covered in iron oxide, better known as rust."
      },
          {
        q: "What is the closest star to Earth?",
        options: [
          "Proxima Centauri",
          "The Sun",
          "Sirius",
          "Alpha Centauri"
        ],
        correct: 1,
        explanation: "The Sun is by far the closest star to Earth, about 150 million km away."
      },
          {
        q: "Which planet is known for its prominent rings?",
        options: [
          "Mars",
          "Saturn",
          "Mercury",
          "Venus"
        ],
        correct: 1,
        explanation: "Saturn is famous for its extensive, visible ring system made mostly of ice and rock particles."
      },
          {
        q: "What is the speed of light in a vacuum (approximately)?",
        options: [
          "3×10⁵ km/s",
          "3×10⁸ m/s",
          "3×10³ m/s",
          "3×10⁸ km/s"
        ],
        correct: 1,
        explanation: "Light travels at approximately 299,792,458 meters per second in a vacuum, commonly rounded to 3×10⁸ m/s."
      },
          {
        q: "What is the name of our galaxy?",
        options: [
          "Andromeda",
          "Milky Way",
          "Triangulum",
          "Whirlpool"
        ],
        correct: 1,
        explanation: "Our solar system is located within the Milky Way galaxy."
      }
        ]
      }
    ]
  },
  {
    name: "Human Body Systems",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "How many bones are in the adult human body?",
        options: [
          "186",
          "206",
          "226",
          "246"
        ],
        correct: 1,
        explanation: "Babies are born with around 300 bones, many of which fuse together as they grow, leaving adults with 206."
      },
          {
        q: "Which sense organ is used for hearing?",
        options: [
          "Eyes",
          "Ears",
          "Nose",
          "Skin"
        ],
        correct: 1,
        explanation: "Ears detect sound waves and convert them into signals the brain interprets as hearing."
      },
          {
        q: "What is the largest organ in the human body?",
        options: [
          "Heart",
          "Liver",
          "Skin",
          "Brain"
        ],
        correct: 2,
        explanation: "The skin is the body's largest organ, covering and protecting everything underneath it."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is the main function of the lungs?",
        options: [
          "Pumping blood",
          "Digesting food",
          "Exchanging oxygen and carbon dioxide",
          "Filtering waste"
        ],
        correct: 2,
        explanation: "The lungs take in oxygen from the air and release carbon dioxide, a process called gas exchange."
      },
          {
        q: "Which organ pumps blood through the body?",
        options: [
          "Liver",
          "Lungs",
          "Heart",
          "Kidney"
        ],
        correct: 2,
        explanation: "The heart is a muscular organ that pumps blood through the circulatory system."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "How many bones are in the adult human body?",
        options: [
          "186",
          "206",
          "226",
          "246"
        ],
        correct: 1,
        explanation: "Babies are born with around 300 bones, many of which fuse together as they grow, leaving adults with 206."
      },
          {
        q: "Which sense organ is used for hearing?",
        options: [
          "Eyes",
          "Ears",
          "Nose",
          "Skin"
        ],
        correct: 1,
        explanation: "Ears detect sound waves and convert them into signals the brain interprets as hearing."
      },
          {
        q: "What is the largest organ in the human body?",
        options: [
          "Heart",
          "Liver",
          "Skin",
          "Brain"
        ],
        correct: 2,
        explanation: "The skin is the body's largest organ, covering and protecting everything underneath it."
      },
          {
        q: "What is the main function of the lungs?",
        options: [
          "Pumping blood",
          "Digesting food",
          "Exchanging oxygen and carbon dioxide",
          "Filtering waste"
        ],
        correct: 2,
        explanation: "The lungs take in oxygen from the air and release carbon dioxide, a process called gas exchange."
      },
          {
        q: "Which organ pumps blood through the body?",
        options: [
          "Liver",
          "Lungs",
          "Heart",
          "Kidney"
        ],
        correct: 2,
        explanation: "The heart is a muscular organ that pumps blood through the circulatory system."
      }
        ]
      }
    ]
  },
  {
    name: "Plants & Ecosystems",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What gas do plants absorb from the atmosphere for photosynthesis?",
        options: [
          "Oxygen",
          "Nitrogen",
          "Carbon dioxide",
          "Hydrogen"
        ],
        correct: 2,
        explanation: "Plants take in carbon dioxide through tiny pores called stomata, using it with sunlight and water to produce glucose and oxygen."
      },
          {
        q: "What do we call animals that only eat plants?",
        options: [
          "Carnivores",
          "Herbivores",
          "Omnivores",
          "Insectivores"
        ],
        correct: 1,
        explanation: "Herbivores are animals whose diet consists mainly or entirely of plant material."
      },
          {
        q: "What do plants need, besides water and sunlight, to grow well?",
        options: [
          "Nutrients from soil",
          "Salt",
          "Sugar",
          "Only darkness"
        ],
        correct: 0,
        explanation: "Plants absorb nutrients like nitrogen and phosphorus from the soil through their roots to support healthy growth."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is the term for an animal that eats both plants and meat?",
        options: [
          "Herbivore",
          "Carnivore",
          "Omnivore",
          "Decomposer"
        ],
        correct: 2,
        explanation: "Omnivores eat both plant and animal matter — humans, bears, and pigs are common examples."
      },
          {
        q: "What is a decomposer's role in an ecosystem?",
        options: [
          "Producing oxygen",
          "Breaking down dead organisms for nutrients",
          "Hunting prey",
          "Photosynthesizing"
        ],
        correct: 1,
        explanation: "Decomposers break down dead plants and animals, recycling nutrients back into the ecosystem."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What gas do plants absorb from the atmosphere for photosynthesis?",
        options: [
          "Oxygen",
          "Nitrogen",
          "Carbon dioxide",
          "Hydrogen"
        ],
        correct: 2,
        explanation: "Plants take in carbon dioxide through tiny pores called stomata, using it with sunlight and water to produce glucose and oxygen."
      },
          {
        q: "What do we call animals that only eat plants?",
        options: [
          "Carnivores",
          "Herbivores",
          "Omnivores",
          "Insectivores"
        ],
        correct: 1,
        explanation: "Herbivores are animals whose diet consists mainly or entirely of plant material."
      },
          {
        q: "What do plants need, besides water and sunlight, to grow well?",
        options: [
          "Nutrients from soil",
          "Salt",
          "Sugar",
          "Only darkness"
        ],
        correct: 0,
        explanation: "Plants absorb nutrients like nitrogen and phosphorus from the soil through their roots to support healthy growth."
      },
          {
        q: "What is the term for an animal that eats both plants and meat?",
        options: [
          "Herbivore",
          "Carnivore",
          "Omnivore",
          "Decomposer"
        ],
        correct: 2,
        explanation: "Omnivores eat both plant and animal matter — humans, bears, and pigs are common examples."
      },
          {
        q: "What is a decomposer's role in an ecosystem?",
        options: [
          "Producing oxygen",
          "Breaking down dead organisms for nutrients",
          "Hunting prey",
          "Photosynthesizing"
        ],
        correct: 1,
        explanation: "Decomposers break down dead plants and animals, recycling nutrients back into the ecosystem."
      }
        ]
      }
    ]
  },
  {
    name: "States of Matter & Energy",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is the freezing point of water in Celsius?",
        options: [
          "-10°",
          "0°",
          "10°",
          "32°"
        ],
        correct: 1,
        explanation: "Water freezes at 0°C (32°F) at standard atmospheric pressure."
      },
          {
        q: "What state of matter has a fixed volume but no fixed shape?",
        options: [
          "Solid",
          "Liquid",
          "Gas",
          "Plasma"
        ],
        correct: 1,
        explanation: "Liquids keep a constant volume but take the shape of their container, unlike gases, which expand to fill any space."
      },
          {
        q: "What type of energy is stored in a stretched rubber band?",
        options: [
          "Kinetic",
          "Potential",
          "Thermal",
          "Chemical"
        ],
        correct: 1,
        explanation: "Stretched or compressed objects store elastic potential energy, released when they return to their original shape."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What happens to particles in a gas compared to a solid?",
        options: [
          "They move slower",
          "They are packed tightly together",
          "They move freely and are spread far apart",
          "They stop moving entirely"
        ],
        correct: 2,
        explanation: "Gas particles move freely and are spread far apart, unlike the tightly packed particles in a solid."
      },
          {
        q: "What is the term for the amount of matter in an object?",
        options: [
          "Weight",
          "Volume",
          "Mass",
          "Density"
        ],
        correct: 2,
        explanation: "Mass measures the amount of matter in an object, unlike weight, which depends on gravity."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is the freezing point of water in Celsius?",
        options: [
          "-10°",
          "0°",
          "10°",
          "32°"
        ],
        correct: 1,
        explanation: "Water freezes at 0°C (32°F) at standard atmospheric pressure."
      },
          {
        q: "What state of matter has a fixed volume but no fixed shape?",
        options: [
          "Solid",
          "Liquid",
          "Gas",
          "Plasma"
        ],
        correct: 1,
        explanation: "Liquids keep a constant volume but take the shape of their container, unlike gases, which expand to fill any space."
      },
          {
        q: "What type of energy is stored in a stretched rubber band?",
        options: [
          "Kinetic",
          "Potential",
          "Thermal",
          "Chemical"
        ],
        correct: 1,
        explanation: "Stretched or compressed objects store elastic potential energy, released when they return to their original shape."
      },
          {
        q: "What happens to particles in a gas compared to a solid?",
        options: [
          "They move slower",
          "They are packed tightly together",
          "They move freely and are spread far apart",
          "They stop moving entirely"
        ],
        correct: 2,
        explanation: "Gas particles move freely and are spread far apart, unlike the tightly packed particles in a solid."
      },
          {
        q: "What is the term for the amount of matter in an object?",
        options: [
          "Weight",
          "Volume",
          "Mass",
          "Density"
        ],
        correct: 2,
        explanation: "Mass measures the amount of matter in an object, unlike weight, which depends on gravity."
      }
        ]
      }
    ]
  },
  {
    name: "Chemistry Basics",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is the chemical symbol for gold?",
        options: [
          "Go",
          "Gd",
          "Au",
          "Ag"
        ],
        correct: 2,
        explanation: "'Au' comes from 'aurum,' the Latin word for gold."
      },
          {
        q: "What is the chemical formula for water?",
        options: [
          "CO2",
          "H2O",
          "O2",
          "NaCl"
        ],
        correct: 1,
        explanation: "Water is made of two hydrogen atoms and one oxygen atom, giving the formula H2O."
      },
          {
        q: "What type of rock is formed from cooled lava or magma?",
        options: [
          "Sedimentary",
          "Metamorphic",
          "Igneous",
          "Fossil"
        ],
        correct: 2,
        explanation: "Igneous rocks form when molten rock (lava or magma) cools and solidifies."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "Which gas do humans need to breathe in to survive?",
        options: [
          "Carbon dioxide",
          "Nitrogen",
          "Oxygen",
          "Helium"
        ],
        correct: 2,
        explanation: "Humans need oxygen for cellular respiration, which produces the energy our bodies use."
      },
          {
        q: "What gas makes up about 78% of Earth's atmosphere?",
        options: [
          "Oxygen",
          "Carbon dioxide",
          "Nitrogen",
          "Hydrogen"
        ],
        correct: 2,
        explanation: "Nitrogen makes up about 78% of Earth's atmosphere, with oxygen at about 21%."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is the chemical symbol for gold?",
        options: [
          "Go",
          "Gd",
          "Au",
          "Ag"
        ],
        correct: 2,
        explanation: "'Au' comes from 'aurum,' the Latin word for gold."
      },
          {
        q: "What is the chemical formula for water?",
        options: [
          "CO2",
          "H2O",
          "O2",
          "NaCl"
        ],
        correct: 1,
        explanation: "Water is made of two hydrogen atoms and one oxygen atom, giving the formula H2O."
      },
          {
        q: "What type of rock is formed from cooled lava or magma?",
        options: [
          "Sedimentary",
          "Metamorphic",
          "Igneous",
          "Fossil"
        ],
        correct: 2,
        explanation: "Igneous rocks form when molten rock (lava or magma) cools and solidifies."
      },
          {
        q: "Which gas do humans need to breathe in to survive?",
        options: [
          "Carbon dioxide",
          "Nitrogen",
          "Oxygen",
          "Helium"
        ],
        correct: 2,
        explanation: "Humans need oxygen for cellular respiration, which produces the energy our bodies use."
      },
          {
        q: "What gas makes up about 78% of Earth's atmosphere?",
        options: [
          "Oxygen",
          "Carbon dioxide",
          "Nitrogen",
          "Hydrogen"
        ],
        correct: 2,
        explanation: "Nitrogen makes up about 78% of Earth's atmosphere, with oxygen at about 21%."
      }
        ]
      }
    ]
  },
  {
    name: "Cells & Microbiology",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is the powerhouse of the cell?",
        options: [
          "Nucleus",
          "Ribosome",
          "Mitochondria",
          "Golgi body"
        ],
        correct: 2,
        explanation: "Mitochondria convert nutrients into ATP, the energy cells run on — hence the nickname."
      },
          {
        q: "What process do cells use to divide and produce identical copies?",
        options: [
          "Meiosis",
          "Mitosis",
          "Osmosis",
          "Diffusion"
        ],
        correct: 1,
        explanation: "Mitosis is the process where a cell divides to produce two genetically identical daughter cells."
      },
          {
        q: "What is the process by which cells produce energy using oxygen called?",
        options: [
          "Fermentation",
          "Cellular respiration",
          "Photosynthesis",
          "Osmosis"
        ],
        correct: 1,
        explanation: "Cellular respiration converts glucose and oxygen into usable energy (ATP), releasing carbon dioxide and water as byproducts."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is the function of white blood cells?",
        options: [
          "Carry oxygen",
          "Fight infection",
          "Clot wounds",
          "Digest nutrients"
        ],
        correct: 1,
        explanation: "White blood cells are part of the immune system and help the body fight off infections and disease."
      },
          {
        q: "What is the main function of red blood cells?",
        options: [
          "Fight infection",
          "Carry oxygen",
          "Clot blood",
          "Digest food"
        ],
        correct: 1,
        explanation: "Red blood cells contain hemoglobin, which binds to oxygen and carries it throughout the body."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is the powerhouse of the cell?",
        options: [
          "Nucleus",
          "Ribosome",
          "Mitochondria",
          "Golgi body"
        ],
        correct: 2,
        explanation: "Mitochondria convert nutrients into ATP, the energy cells run on — hence the nickname."
      },
          {
        q: "What process do cells use to divide and produce identical copies?",
        options: [
          "Meiosis",
          "Mitosis",
          "Osmosis",
          "Diffusion"
        ],
        correct: 1,
        explanation: "Mitosis is the process where a cell divides to produce two genetically identical daughter cells."
      },
          {
        q: "What is the process by which cells produce energy using oxygen called?",
        options: [
          "Fermentation",
          "Cellular respiration",
          "Photosynthesis",
          "Osmosis"
        ],
        correct: 1,
        explanation: "Cellular respiration converts glucose and oxygen into usable energy (ATP), releasing carbon dioxide and water as byproducts."
      },
          {
        q: "What is the function of white blood cells?",
        options: [
          "Carry oxygen",
          "Fight infection",
          "Clot wounds",
          "Digest nutrients"
        ],
        correct: 1,
        explanation: "White blood cells are part of the immune system and help the body fight off infections and disease."
      },
          {
        q: "What is the main function of red blood cells?",
        options: [
          "Fight infection",
          "Carry oxygen",
          "Clot blood",
          "Digest food"
        ],
        correct: 1,
        explanation: "Red blood cells contain hemoglobin, which binds to oxygen and carries it throughout the body."
      }
        ]
      }
    ]
  },
  {
    name: "Physics Laws",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is Newton's second law of motion?",
        options: [
          "F = ma",
          "E = mc²",
          "P = IV",
          "V = IR"
        ],
        correct: 0,
        explanation: "Newton's second law states that force equals mass times acceleration (F = ma)."
      },
          {
        q: "What law states that energy cannot be created or destroyed, only transformed?",
        options: [
          "Law of Gravity",
          "Law of Conservation of Energy",
          "Newton's Third Law",
          "Law of Inertia"
        ],
        correct: 1,
        explanation: "The Law of Conservation of Energy states energy can change form, but the total amount stays constant in an isolated system."
      },
          {
        q: "What does Charles's Law describe?",
        options: [
          "The relationship between pressure and volume",
          "The relationship between a gas's volume and temperature",
          "The speed of chemical reactions",
          "The behavior of light"
        ],
        correct: 1,
        explanation: "Charles's Law states that at constant pressure, a gas's volume is directly proportional to its temperature."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What force pulls objects toward the Earth?",
        options: [
          "Magnetism",
          "Friction",
          "Gravity",
          "Tension"
        ],
        correct: 2,
        explanation: "Gravity is the force of attraction between objects with mass — Earth's gravity pulls objects toward its center."
      },
          {
        q: "What is the equation for kinetic energy?",
        options: [
          "KE = mv",
          "KE = ½mv²",
          "KE = mgh",
          "KE = Fd"
        ],
        correct: 1,
        explanation: "Kinetic energy equals one-half times mass times velocity squared (KE = ½mv²)."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is Newton's second law of motion?",
        options: [
          "F = ma",
          "E = mc²",
          "P = IV",
          "V = IR"
        ],
        correct: 0,
        explanation: "Newton's second law states that force equals mass times acceleration (F = ma)."
      },
          {
        q: "What law states that energy cannot be created or destroyed, only transformed?",
        options: [
          "Law of Gravity",
          "Law of Conservation of Energy",
          "Newton's Third Law",
          "Law of Inertia"
        ],
        correct: 1,
        explanation: "The Law of Conservation of Energy states energy can change form, but the total amount stays constant in an isolated system."
      },
          {
        q: "What does Charles's Law describe?",
        options: [
          "The relationship between pressure and volume",
          "The relationship between a gas's volume and temperature",
          "The speed of chemical reactions",
          "The behavior of light"
        ],
        correct: 1,
        explanation: "Charles's Law states that at constant pressure, a gas's volume is directly proportional to its temperature."
      },
          {
        q: "What force pulls objects toward the Earth?",
        options: [
          "Magnetism",
          "Friction",
          "Gravity",
          "Tension"
        ],
        correct: 2,
        explanation: "Gravity is the force of attraction between objects with mass — Earth's gravity pulls objects toward its center."
      },
          {
        q: "What is the equation for kinetic energy?",
        options: [
          "KE = mv",
          "KE = ½mv²",
          "KE = mgh",
          "KE = Fd"
        ],
        correct: 1,
        explanation: "Kinetic energy equals one-half times mass times velocity squared (KE = ½mv²)."
      }
        ]
      }
    ]
  },
  {
    name: "Atomic & Chemical Structure",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What particle has a negative charge?",
        options: [
          "Proton",
          "Neutron",
          "Electron",
          "Photon"
        ],
        correct: 2,
        explanation: "Electrons carry a negative electric charge and orbit the nucleus of an atom."
      },
          {
        q: "What is the atomic number of an element determined by?",
        options: [
          "Number of neutrons",
          "Number of protons",
          "Number of electrons only",
          "Atomic mass"
        ],
        correct: 1,
        explanation: "The atomic number is defined as the number of protons in an atom's nucleus, which determines the element."
      },
          {
        q: "What type of bond involves atoms sharing electrons?",
        options: [
          "Ionic bond",
          "Covalent bond",
          "Metallic bond",
          "Hydrogen bond"
        ],
        correct: 1,
        explanation: "Covalent bonds form when atoms share pairs of electrons, common in molecules like water and methane."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is Avogadro's number, approximately?",
        options: [
          "6.02 × 10²³",
          "3.14 × 10⁸",
          "9.8 × 10¹⁰",
          "1.6 × 10⁻¹⁹"
        ],
        correct: 0,
        explanation: "Avogadro's number, 6.02 × 10²³, is the number of particles in one mole of a substance."
      },
          {
        q: "What type of radioactive decay releases a helium nucleus?",
        options: [
          "Alpha decay",
          "Beta decay",
          "Gamma decay",
          "Neutron decay"
        ],
        correct: 0,
        explanation: "Alpha decay releases an alpha particle, which is identical to a helium nucleus (2 protons, 2 neutrons)."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What particle has a negative charge?",
        options: [
          "Proton",
          "Neutron",
          "Electron",
          "Photon"
        ],
        correct: 2,
        explanation: "Electrons carry a negative electric charge and orbit the nucleus of an atom."
      },
          {
        q: "What is the atomic number of an element determined by?",
        options: [
          "Number of neutrons",
          "Number of protons",
          "Number of electrons only",
          "Atomic mass"
        ],
        correct: 1,
        explanation: "The atomic number is defined as the number of protons in an atom's nucleus, which determines the element."
      },
          {
        q: "What type of bond involves atoms sharing electrons?",
        options: [
          "Ionic bond",
          "Covalent bond",
          "Metallic bond",
          "Hydrogen bond"
        ],
        correct: 1,
        explanation: "Covalent bonds form when atoms share pairs of electrons, common in molecules like water and methane."
      },
          {
        q: "What is Avogadro's number, approximately?",
        options: [
          "6.02 × 10²³",
          "3.14 × 10⁸",
          "9.8 × 10¹⁰",
          "1.6 × 10⁻¹⁹"
        ],
        correct: 0,
        explanation: "Avogadro's number, 6.02 × 10²³, is the number of particles in one mole of a substance."
      },
          {
        q: "What type of radioactive decay releases a helium nucleus?",
        options: [
          "Alpha decay",
          "Beta decay",
          "Gamma decay",
          "Neutron decay"
        ],
        correct: 0,
        explanation: "Alpha decay releases an alpha particle, which is identical to a helium nucleus (2 protons, 2 neutrons)."
      }
        ]
      }
    ]
  },
  {
    name: "Earth Systems & Water Cycle",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is the boiling point of water at sea level, in Celsius?",
        options: [
          "90°",
          "100°",
          "110°",
          "120°"
        ],
        correct: 1,
        explanation: "At standard atmospheric pressure, water boils at 100°C (212°F)."
      },
          {
        q: "What is the process by which water changes from liquid to gas called?",
        options: [
          "Condensation",
          "Evaporation",
          "Precipitation",
          "Sublimation"
        ],
        correct: 1,
        explanation: "Evaporation is when liquid water absorbs enough heat energy to turn into water vapor (gas)."
      },
          {
        type: "sequence",
        q: "Put these steps of the water cycle in the correct order.",
        items: [
          "Evaporation from oceans and lakes",
          "Water vapor rises and cools",
          "Condensation forms clouds",
          "Precipitation falls as rain or snow"
        ],
        explanation: "The water cycle begins with evaporation from bodies of water; the vapor rises and cools, condenses into clouds, and eventually falls back to Earth as precipitation."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What layer of Earth do we live on?",
        options: [
          "Core",
          "Mantle",
          "Crust",
          "Atmosphere"
        ],
        correct: 2,
        explanation: "The crust is Earth's outermost solid layer, where all life exists."
      },
          {
        q: "What causes ocean tides?",
        options: [
          "Wind patterns",
          "The Moon's gravitational pull",
          "Ocean currents alone",
          "Earth's rotation alone"
        ],
        correct: 1,
        explanation: "Tides are primarily caused by the gravitational pull of the Moon (and to a lesser extent, the Sun) on Earth's oceans."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is the boiling point of water at sea level, in Celsius?",
        options: [
          "90°",
          "100°",
          "110°",
          "120°"
        ],
        correct: 1,
        explanation: "At standard atmospheric pressure, water boils at 100°C (212°F)."
      },
          {
        q: "What is the process by which water changes from liquid to gas called?",
        options: [
          "Condensation",
          "Evaporation",
          "Precipitation",
          "Sublimation"
        ],
        correct: 1,
        explanation: "Evaporation is when liquid water absorbs enough heat energy to turn into water vapor (gas)."
      },
          {
        type: "sequence",
        q: "Put these steps of the water cycle in the correct order.",
        items: [
          "Evaporation from oceans and lakes",
          "Water vapor rises and cools",
          "Condensation forms clouds",
          "Precipitation falls as rain or snow"
        ],
        explanation: "The water cycle begins with evaporation from bodies of water; the vapor rises and cools, condenses into clouds, and eventually falls back to Earth as precipitation."
      },
          {
        q: "What layer of Earth do we live on?",
        options: [
          "Core",
          "Mantle",
          "Crust",
          "Atmosphere"
        ],
        correct: 2,
        explanation: "The crust is Earth's outermost solid layer, where all life exists."
      },
          {
        q: "What causes ocean tides?",
        options: [
          "Wind patterns",
          "The Moon's gravitational pull",
          "Ocean currents alone",
          "Earth's rotation alone"
        ],
        correct: 1,
        explanation: "Tides are primarily caused by the gravitational pull of the Moon (and to a lesser extent, the Sun) on Earth's oceans."
      }
        ]
      }
    ]
  },
  {
    name: "Advanced Biology & Chemistry",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is the pH of a neutral solution?",
        options: [
          "0",
          "7",
          "10",
          "14"
        ],
        correct: 1,
        explanation: "pH 7 is neutral; below 7 is acidic, and above 7 is basic (alkaline)."
      },
          {
        q: "Which part of the brain is responsible for balance and coordination?",
        options: [
          "Cerebrum",
          "Cerebellum",
          "Medulla oblongata",
          "Hypothalamus"
        ],
        correct: 1,
        explanation: "The cerebellum coordinates voluntary movements, posture, and balance."
      },
          {
        q: "What is the function of enzymes in the body?",
        options: [
          "Store energy",
          "Speed up chemical reactions",
          "Transport oxygen",
          "Fight infection"
        ],
        correct: 1,
        explanation: "Enzymes are proteins that speed up (catalyze) chemical reactions in the body without being consumed themselves."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is homeostasis?",
        options: [
          "The process of cell division",
          "The body's ability to maintain a stable internal environment",
          "A type of genetic mutation",
          "The breakdown of food"
        ],
        correct: 1,
        explanation: "Homeostasis refers to an organism's ability to maintain stable internal conditions, like temperature and pH, despite external changes."
      },
          {
        q: "What is the function of DNA in a cell?",
        options: [
          "Produces energy",
          "Carries genetic information",
          "Breaks down waste",
          "Transports oxygen"
        ],
        correct: 1,
        explanation: "DNA carries the genetic instructions used for the development, functioning, and reproduction of living organisms."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is the pH of a neutral solution?",
        options: [
          "0",
          "7",
          "10",
          "14"
        ],
        correct: 1,
        explanation: "pH 7 is neutral; below 7 is acidic, and above 7 is basic (alkaline)."
      },
          {
        q: "Which part of the brain is responsible for balance and coordination?",
        options: [
          "Cerebrum",
          "Cerebellum",
          "Medulla oblongata",
          "Hypothalamus"
        ],
        correct: 1,
        explanation: "The cerebellum coordinates voluntary movements, posture, and balance."
      },
          {
        q: "What is the function of enzymes in the body?",
        options: [
          "Store energy",
          "Speed up chemical reactions",
          "Transport oxygen",
          "Fight infection"
        ],
        correct: 1,
        explanation: "Enzymes are proteins that speed up (catalyze) chemical reactions in the body without being consumed themselves."
      },
          {
        q: "What is homeostasis?",
        options: [
          "The process of cell division",
          "The body's ability to maintain a stable internal environment",
          "A type of genetic mutation",
          "The breakdown of food"
        ],
        correct: 1,
        explanation: "Homeostasis refers to an organism's ability to maintain stable internal conditions, like temperature and pH, despite external changes."
      },
          {
        q: "What is the function of DNA in a cell?",
        options: [
          "Produces energy",
          "Carries genetic information",
          "Breaks down waste",
          "Transports oxygen"
        ],
        correct: 1,
        explanation: "DNA carries the genetic instructions used for the development, functioning, and reproduction of living organisms."
      }
        ]
      }
    ]
  }


],
  history: [
  {
    name: "Ancient Civilizations",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "The ancient pyramids of Giza are located in which country?",
        options: [
          "Mexico",
          "Egypt",
          "Peru",
          "Sudan"
        ],
        correct: 1,
        explanation: "The Giza pyramid complex was built as royal tombs for Egyptian pharaohs around 2500 BCE."
      },
          {
        q: "Which empire built the Colosseum?",
        options: [
          "Greek",
          "Roman",
          "Ottoman",
          "Persian"
        ],
        correct: 1,
        explanation: "The Colosseum was completed around 80 CE under the Roman Empire and used for gladiator contests and public spectacles."
      },
          {
        q: "Which ancient civilization built the Great Wall?",
        options: [
          "Roman",
          "Chinese",
          "Egyptian",
          "Greek"
        ],
        correct: 1,
        explanation: "The Great Wall of China was built over centuries by various Chinese dynasties to protect against invasions."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What ancient wonder of the world stood in Egypt?",
        options: [
          "The Colosseum",
          "The Great Pyramid of Giza",
          "The Parthenon",
          "Stonehenge"
        ],
        correct: 1,
        explanation: "The Great Pyramid of Giza is the only one of the original Seven Wonders of the Ancient World still standing."
      },
          {
        q: "What was the name of the ancient trade route connecting China and Europe?",
        options: [
          "The Silk Road",
          "The Amber Road",
          "The Spice Route",
          "The Royal Road"
        ],
        correct: 0,
        explanation: "The Silk Road was a network of trade routes connecting China to the Mediterranean, used for trading silk, spices, and ideas."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "The ancient pyramids of Giza are located in which country?",
        options: [
          "Mexico",
          "Egypt",
          "Peru",
          "Sudan"
        ],
        correct: 1,
        explanation: "The Giza pyramid complex was built as royal tombs for Egyptian pharaohs around 2500 BCE."
      },
          {
        q: "Which empire built the Colosseum?",
        options: [
          "Greek",
          "Roman",
          "Ottoman",
          "Persian"
        ],
        correct: 1,
        explanation: "The Colosseum was completed around 80 CE under the Roman Empire and used for gladiator contests and public spectacles."
      },
          {
        q: "Which ancient civilization built the Great Wall?",
        options: [
          "Roman",
          "Chinese",
          "Egyptian",
          "Greek"
        ],
        correct: 1,
        explanation: "The Great Wall of China was built over centuries by various Chinese dynasties to protect against invasions."
      },
          {
        q: "What ancient wonder of the world stood in Egypt?",
        options: [
          "The Colosseum",
          "The Great Pyramid of Giza",
          "The Parthenon",
          "Stonehenge"
        ],
        correct: 1,
        explanation: "The Great Pyramid of Giza is the only one of the original Seven Wonders of the Ancient World still standing."
      },
          {
        q: "What was the name of the ancient trade route connecting China and Europe?",
        options: [
          "The Silk Road",
          "The Amber Road",
          "The Spice Route",
          "The Royal Road"
        ],
        correct: 0,
        explanation: "The Silk Road was a network of trade routes connecting China to the Mediterranean, used for trading silk, spices, and ideas."
      }
        ]
      }
    ]
  },
  {
    name: "Colonial America & Exploration",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What year did Christopher Columbus first reach the Americas?",
        options: [
          "1392",
          "1492",
          "1592",
          "1692"
        ],
        correct: 1,
        explanation: "Columbus's first voyage across the Atlantic reached the Americas in 1492."
      },
          {
        q: "What was the name of the ship the Pilgrims sailed to America on?",
        options: [
          "Mayflower",
          "Santa Maria",
          "Endeavour",
          "Beagle"
        ],
        correct: 0,
        explanation: "The Mayflower carried English Pilgrims to what is now Massachusetts in 1620."
      },
          {
        q: "Which explorer led the first expedition to circumnavigate the globe?",
        options: [
          "Vasco da Gama",
          "Ferdinand Magellan",
          "Christopher Columbus",
          "James Cook"
        ],
        correct: 1,
        explanation: "Magellan's expedition (1519–1522), though he died partway through, was the first to circumnavigate the Earth."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "Which country gifted the Statue of Liberty to the United States?",
        options: [
          "England",
          "France",
          "Spain",
          "Italy"
        ],
        correct: 1,
        explanation: "France gave the Statue of Liberty to the U.S. in 1886 as a gift symbolizing friendship and liberty."
      },
          {
        q: "What was the main cause of the American Revolutionary War?",
        options: [
          "Religious persecution",
          "Taxation without representation",
          "A border dispute",
          "A trade agreement"
        ],
        correct: 1,
        explanation: "American colonists rebelled largely over being taxed by the British Parliament without having elected representation in it."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What year did Christopher Columbus first reach the Americas?",
        options: [
          "1392",
          "1492",
          "1592",
          "1692"
        ],
        correct: 1,
        explanation: "Columbus's first voyage across the Atlantic reached the Americas in 1492."
      },
          {
        q: "What was the name of the ship the Pilgrims sailed to America on?",
        options: [
          "Mayflower",
          "Santa Maria",
          "Endeavour",
          "Beagle"
        ],
        correct: 0,
        explanation: "The Mayflower carried English Pilgrims to what is now Massachusetts in 1620."
      },
          {
        q: "Which explorer led the first expedition to circumnavigate the globe?",
        options: [
          "Vasco da Gama",
          "Ferdinand Magellan",
          "Christopher Columbus",
          "James Cook"
        ],
        correct: 1,
        explanation: "Magellan's expedition (1519–1522), though he died partway through, was the first to circumnavigate the Earth."
      },
          {
        q: "Which country gifted the Statue of Liberty to the United States?",
        options: [
          "England",
          "France",
          "Spain",
          "Italy"
        ],
        correct: 1,
        explanation: "France gave the Statue of Liberty to the U.S. in 1886 as a gift symbolizing friendship and liberty."
      },
          {
        q: "What was the main cause of the American Revolutionary War?",
        options: [
          "Religious persecution",
          "Taxation without representation",
          "A border dispute",
          "A trade agreement"
        ],
        correct: 1,
        explanation: "American colonists rebelled largely over being taxed by the British Parliament without having elected representation in it."
      }
        ]
      }
    ]
  },
  {
    name: "World Wars",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "In what year did World War II end?",
        options: [
          "1943",
          "1945",
          "1947",
          "1950"
        ],
        correct: 1,
        explanation: "Germany surrendered in May 1945, and Japan surrendered in September 1945, ending the war."
      },
          {
        q: "What event triggered the start of World War I?",
        options: [
          "Assassination of Archduke Franz Ferdinand",
          "Attack on Pearl Harbor",
          "Sinking of the Lusitania",
          "The Treaty of Versailles"
        ],
        correct: 0,
        explanation: "The 1914 assassination of Archduke Franz Ferdinand of Austria-Hungary set off the chain of events leading to WWI."
      },
          {
        q: "Who was the leader of Nazi Germany during WWII?",
        options: [
          "Joseph Stalin",
          "Winston Churchill",
          "Adolf Hitler",
          "Benito Mussolini"
        ],
        correct: 2,
        explanation: "Adolf Hitler led Nazi Germany from 1933 until his death in 1945."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        type: "sequence",
        q: "Put these World War II events in chronological order (earliest to latest).",
        items: [
          "Germany invades Poland (1939)",
          "Pearl Harbor attacked (1941)",
          "D-Day landings (1944)",
          "Japan surrenders (1945)"
        ],
        explanation: "World War II began with Germany's invasion of Poland in 1939, expanded globally after the attack on Pearl Harbor in 1941, saw a major turning point with the D-Day landings in 1944, and ended with Japan's surrender in 1945."
      },
          {
        q: "What was the Berlin Airlift a response to?",
        options: [
          "A famine in Germany",
          "A Soviet blockade of West Berlin",
          "A civil war in Germany",
          "An earthquake"
        ],
        correct: 1,
        explanation: "In 1948–49, the Allies airlifted supplies into West Berlin after the Soviet Union blockaded ground access to the city."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "In what year did World War II end?",
        options: [
          "1943",
          "1945",
          "1947",
          "1950"
        ],
        correct: 1,
        explanation: "Germany surrendered in May 1945, and Japan surrendered in September 1945, ending the war."
      },
          {
        q: "What event triggered the start of World War I?",
        options: [
          "Assassination of Archduke Franz Ferdinand",
          "Attack on Pearl Harbor",
          "Sinking of the Lusitania",
          "The Treaty of Versailles"
        ],
        correct: 0,
        explanation: "The 1914 assassination of Archduke Franz Ferdinand of Austria-Hungary set off the chain of events leading to WWI."
      },
          {
        q: "Who was the leader of Nazi Germany during WWII?",
        options: [
          "Joseph Stalin",
          "Winston Churchill",
          "Adolf Hitler",
          "Benito Mussolini"
        ],
        correct: 2,
        explanation: "Adolf Hitler led Nazi Germany from 1933 until his death in 1945."
      },
          {
        type: "sequence",
        q: "Put these World War II events in chronological order (earliest to latest).",
        items: [
          "Germany invades Poland (1939)",
          "Pearl Harbor attacked (1941)",
          "D-Day landings (1944)",
          "Japan surrenders (1945)"
        ],
        explanation: "World War II began with Germany's invasion of Poland in 1939, expanded globally after the attack on Pearl Harbor in 1941, saw a major turning point with the D-Day landings in 1944, and ended with Japan's surrender in 1945."
      },
          {
        q: "What was the Berlin Airlift a response to?",
        options: [
          "A famine in Germany",
          "A Soviet blockade of West Berlin",
          "A civil war in Germany",
          "An earthquake"
        ],
        correct: 1,
        explanation: "In 1948–49, the Allies airlifted supplies into West Berlin after the Soviet Union blockaded ground access to the city."
      }
        ]
      }
    ]
  },
  {
    name: "Cold War & 20th Century",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What wall divided a European city during the Cold War?",
        options: [
          "Vienna Wall",
          "Berlin Wall",
          "Warsaw Wall",
          "Prague Wall"
        ],
        correct: 1,
        explanation: "The Berlin Wall divided East and West Berlin from 1961 to 1989, symbolizing the divide between communist and democratic Europe."
      },
          {
        q: "The Cold War was primarily a rivalry between which two powers?",
        options: [
          "USA and China",
          "USA and Soviet Union",
          "UK and Germany",
          "France and USSR"
        ],
        correct: 1,
        explanation: "The Cold War (roughly 1947–1991) was a geopolitical rivalry between the United States and the Soviet Union."
      },
          {
        q: "What did the Marshall Plan primarily provide after World War II?",
        options: [
          "US financial aid to rebuild Western Europe",
          "Soviet reparations from Germany",
          "A global gold standard",
          "Nationalization of European industries"
        ],
        correct: 0,
        explanation: "The Marshall Plan (1948) was a US program providing financial aid to rebuild Western European economies, partly to counter Soviet influence."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "Which country was first to send a human into space?",
        options: [
          "USA",
          "Soviet Union",
          "China",
          "France"
        ],
        correct: 1,
        explanation: "The Soviet Union sent Yuri Gagarin into orbit in 1961 — the first human in space."
      },
          {
        q: "Which country was the first to grant women the right to vote nationally?",
        options: [
          "United States",
          "United Kingdom",
          "New Zealand",
          "France"
        ],
        correct: 2,
        explanation: "New Zealand became the first self-governing country to grant women the right to vote, in 1893."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What wall divided a European city during the Cold War?",
        options: [
          "Vienna Wall",
          "Berlin Wall",
          "Warsaw Wall",
          "Prague Wall"
        ],
        correct: 1,
        explanation: "The Berlin Wall divided East and West Berlin from 1961 to 1989, symbolizing the divide between communist and democratic Europe."
      },
          {
        q: "The Cold War was primarily a rivalry between which two powers?",
        options: [
          "USA and China",
          "USA and Soviet Union",
          "UK and Germany",
          "France and USSR"
        ],
        correct: 1,
        explanation: "The Cold War (roughly 1947–1991) was a geopolitical rivalry between the United States and the Soviet Union."
      },
          {
        q: "What did the Marshall Plan primarily provide after World War II?",
        options: [
          "US financial aid to rebuild Western Europe",
          "Soviet reparations from Germany",
          "A global gold standard",
          "Nationalization of European industries"
        ],
        correct: 0,
        explanation: "The Marshall Plan (1948) was a US program providing financial aid to rebuild Western European economies, partly to counter Soviet influence."
      },
          {
        q: "Which country was first to send a human into space?",
        options: [
          "USA",
          "Soviet Union",
          "China",
          "France"
        ],
        correct: 1,
        explanation: "The Soviet Union sent Yuri Gagarin into orbit in 1961 — the first human in space."
      },
          {
        q: "Which country was the first to grant women the right to vote nationally?",
        options: [
          "United States",
          "United Kingdom",
          "New Zealand",
          "France"
        ],
        correct: 2,
        explanation: "New Zealand became the first self-governing country to grant women the right to vote, in 1893."
      }
        ]
      }
    ]
  },
  {
    name: "Early 20th Century Events",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "Who was the first President of the United States?",
        options: [
          "Thomas Jefferson",
          "John Adams",
          "George Washington",
          "Benjamin Franklin"
        ],
        correct: 2,
        explanation: "George Washington served as the first U.S. President from 1789 to 1797, setting many precedents still followed today."
      },
          {
        q: "Who wrote the Declaration of Independence?",
        options: [
          "Thomas Jefferson",
          "Abraham Lincoln",
          "James Madison",
          "Alexander Hamilton"
        ],
        correct: 0,
        explanation: "Thomas Jefferson drafted the Declaration in 1776, though the Continental Congress reviewed and edited it."
      },
          {
        q: "Which U.S. president issued the Emancipation Proclamation?",
        options: [
          "George Washington",
          "Abraham Lincoln",
          "Thomas Jefferson",
          "Andrew Jackson"
        ],
        correct: 1,
        explanation: "Lincoln issued the Emancipation Proclamation in 1863, declaring enslaved people in Confederate states to be free."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What was the name of the period of economic hardship in the 1930s?",
        options: [
          "The Gilded Age",
          "The Great Depression",
          "The Industrial Revolution",
          "The Progressive Era"
        ],
        correct: 1,
        explanation: "The Great Depression was a severe worldwide economic downturn beginning in 1929 and lasting through much of the 1930s."
      },
          {
        q: "In what year did the Titanic sink?",
        options: [
          "1905",
          "1912",
          "1918",
          "1923"
        ],
        correct: 1,
        explanation: "The RMS Titanic sank on April 15, 1912, after hitting an iceberg on its maiden voyage."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "Who was the first President of the United States?",
        options: [
          "Thomas Jefferson",
          "John Adams",
          "George Washington",
          "Benjamin Franklin"
        ],
        correct: 2,
        explanation: "George Washington served as the first U.S. President from 1789 to 1797, setting many precedents still followed today."
      },
          {
        q: "Who wrote the Declaration of Independence?",
        options: [
          "Thomas Jefferson",
          "Abraham Lincoln",
          "James Madison",
          "Alexander Hamilton"
        ],
        correct: 0,
        explanation: "Thomas Jefferson drafted the Declaration in 1776, though the Continental Congress reviewed and edited it."
      },
          {
        q: "Which U.S. president issued the Emancipation Proclamation?",
        options: [
          "George Washington",
          "Abraham Lincoln",
          "Thomas Jefferson",
          "Andrew Jackson"
        ],
        correct: 1,
        explanation: "Lincoln issued the Emancipation Proclamation in 1863, declaring enslaved people in Confederate states to be free."
      },
          {
        q: "What was the name of the period of economic hardship in the 1930s?",
        options: [
          "The Gilded Age",
          "The Great Depression",
          "The Industrial Revolution",
          "The Progressive Era"
        ],
        correct: 1,
        explanation: "The Great Depression was a severe worldwide economic downturn beginning in 1929 and lasting through much of the 1930s."
      },
          {
        q: "In what year did the Titanic sink?",
        options: [
          "1905",
          "1912",
          "1918",
          "1923"
        ],
        correct: 1,
        explanation: "The RMS Titanic sank on April 15, 1912, after hitting an iceberg on its maiden voyage."
      }
        ]
      }
    ]
  },
  {
    name: "Ancient Empires & Dynasties",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "Which empire was ruled by Genghis Khan?",
        options: [
          "Ottoman Empire",
          "Mongol Empire",
          "Persian Empire",
          "Byzantine Empire"
        ],
        correct: 1,
        explanation: "Genghis Khan founded and led the Mongol Empire, which became the largest contiguous land empire in history."
      },
          {
        q: "Who was the first Emperor of unified China?",
        options: [
          "Confucius",
          "Qin Shi Huang",
          "Sun Tzu",
          "Kublai Khan"
        ],
        correct: 1,
        explanation: "Qin Shi Huang unified China's warring states in 221 BCE and became its first emperor."
      },
          {
        q: "What ancient civilization built Machu Picchu?",
        options: [
          "Aztec",
          "Maya",
          "Inca",
          "Olmec"
        ],
        correct: 2,
        explanation: "Machu Picchu was built by the Inca civilization in the 15th century, in present-day Peru."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "The Renaissance began in which country?",
        options: [
          "France",
          "England",
          "Italy",
          "Spain"
        ],
        correct: 2,
        explanation: "The Renaissance began in Italy in the 14th century before spreading across Europe."
      },
          {
        q: "What is generally considered the primary cause of the fall of the Western Roman Empire?",
        options: [
          "A single major battle",
          "A combination of invasions, economic troubles, and political instability",
          "A volcanic eruption",
          "A plague alone"
        ],
        correct: 1,
        explanation: "Historians generally attribute Rome's fall to a combination of factors — barbarian invasions, economic decline, and political corruption — rather than one single cause."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "Which empire was ruled by Genghis Khan?",
        options: [
          "Ottoman Empire",
          "Mongol Empire",
          "Persian Empire",
          "Byzantine Empire"
        ],
        correct: 1,
        explanation: "Genghis Khan founded and led the Mongol Empire, which became the largest contiguous land empire in history."
      },
          {
        q: "Who was the first Emperor of unified China?",
        options: [
          "Confucius",
          "Qin Shi Huang",
          "Sun Tzu",
          "Kublai Khan"
        ],
        correct: 1,
        explanation: "Qin Shi Huang unified China's warring states in 221 BCE and became its first emperor."
      },
          {
        q: "What ancient civilization built Machu Picchu?",
        options: [
          "Aztec",
          "Maya",
          "Inca",
          "Olmec"
        ],
        correct: 2,
        explanation: "Machu Picchu was built by the Inca civilization in the 15th century, in present-day Peru."
      },
          {
        q: "The Renaissance began in which country?",
        options: [
          "France",
          "England",
          "Italy",
          "Spain"
        ],
        correct: 2,
        explanation: "The Renaissance began in Italy in the 14th century before spreading across Europe."
      },
          {
        q: "What is generally considered the primary cause of the fall of the Western Roman Empire?",
        options: [
          "A single major battle",
          "A combination of invasions, economic troubles, and political instability",
          "A volcanic eruption",
          "A plague alone"
        ],
        correct: 1,
        explanation: "Historians generally attribute Rome's fall to a combination of factors — barbarian invasions, economic decline, and political corruption — rather than one single cause."
      }
        ]
      }
    ]
  },
  {
    name: "Empires, Treaties & Colonialism",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "The Magna Carta, signed in 1215, primarily limited the power of whom?",
        options: [
          "The Pope",
          "The English king",
          "The French king",
          "Roman senators"
        ],
        correct: 1,
        explanation: "The Magna Carta limited King John of England's power, establishing that even the king was subject to the law."
      },
          {
        q: "The Treaty of Tordesillas divided newly claimed lands between which two countries?",
        options: [
          "England and France",
          "Spain and Portugal",
          "Netherlands and England",
          "France and Portugal"
        ],
        correct: 1,
        explanation: "The 1494 Treaty of Tordesillas divided lands outside Europe between Spain and Portugal along a meridian line."
      },
          {
        q: "The Peace of Westphalia (1648) is often credited with establishing what concept in international relations?",
        options: [
          "Free trade",
          "The nation-state and sovereignty",
          "The United Nations",
          "Colonialism"
        ],
        correct: 1,
        explanation: "The Peace of Westphalia is widely considered the origin of the modern concept of state sovereignty in international relations."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "The Opium Wars were fought between China and which country?",
        options: [
          "France",
          "Britain",
          "Russia",
          "Japan"
        ],
        correct: 1,
        explanation: "The Opium Wars (1839–1860) were fought between Qing China and Britain over trade, including the opium trade."
      },
          {
        q: "The Sykes-Picot Agreement (1916) was a secret plan between which two countries to divide territory?",
        options: [
          "USA and USSR",
          "Britain and France",
          "Germany and Italy",
          "Spain and Portugal"
        ],
        correct: 1,
        explanation: "Britain and France secretly agreed to divide the Ottoman Empire's Middle Eastern territories after WWI, an agreement with lasting geopolitical consequences."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "The Magna Carta, signed in 1215, primarily limited the power of whom?",
        options: [
          "The Pope",
          "The English king",
          "The French king",
          "Roman senators"
        ],
        correct: 1,
        explanation: "The Magna Carta limited King John of England's power, establishing that even the king was subject to the law."
      },
          {
        q: "The Treaty of Tordesillas divided newly claimed lands between which two countries?",
        options: [
          "England and France",
          "Spain and Portugal",
          "Netherlands and England",
          "France and Portugal"
        ],
        correct: 1,
        explanation: "The 1494 Treaty of Tordesillas divided lands outside Europe between Spain and Portugal along a meridian line."
      },
          {
        q: "The Peace of Westphalia (1648) is often credited with establishing what concept in international relations?",
        options: [
          "Free trade",
          "The nation-state and sovereignty",
          "The United Nations",
          "Colonialism"
        ],
        correct: 1,
        explanation: "The Peace of Westphalia is widely considered the origin of the modern concept of state sovereignty in international relations."
      },
          {
        q: "The Opium Wars were fought between China and which country?",
        options: [
          "France",
          "Britain",
          "Russia",
          "Japan"
        ],
        correct: 1,
        explanation: "The Opium Wars (1839–1860) were fought between Qing China and Britain over trade, including the opium trade."
      },
          {
        q: "The Sykes-Picot Agreement (1916) was a secret plan between which two countries to divide territory?",
        options: [
          "USA and USSR",
          "Britain and France",
          "Germany and Italy",
          "Spain and Portugal"
        ],
        correct: 1,
        explanation: "Britain and France secretly agreed to divide the Ottoman Empire's Middle Eastern territories after WWI, an agreement with lasting geopolitical consequences."
      }
        ]
      }
    ]
  },
  {
    name: "Revolutions & Independence Movements",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What was the primary ideological conflict driving the Chinese Civil War?",
        options: [
          "Monarchy vs. republic",
          "Nationalism vs. communism",
          "Capitalism vs. feudalism",
          "Religious vs. secular rule"
        ],
        correct: 1,
        explanation: "The Chinese Civil War (1927–1949) was fought primarily between the Nationalist Kuomintang and the Communist Party, ending in Communist victory."
      },
          {
        q: "Which treaty formally ended World War I?",
        options: [
          "Treaty of Paris",
          "Treaty of Versailles",
          "Treaty of Rome",
          "Treaty of Vienna"
        ],
        correct: 1,
        explanation: "The Treaty of Versailles, signed in 1919, formally ended World War I and imposed heavy penalties on Germany."
      },
          {
        q: "The French Revolution began in what year?",
        options: [
          "1776",
          "1789",
          "1804",
          "1815"
        ],
        correct: 1,
        explanation: "The French Revolution began in 1789, leading to the end of the monarchy and major political change in France."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "Who was known as the 'Father of the Nation' in India?",
        options: [
          "Jawaharlal Nehru",
          "Mahatma Gandhi",
          "Indira Gandhi",
          "Subhas Chandra Bose"
        ],
        correct: 1,
        explanation: "Mahatma Gandhi led India's independence movement through nonviolent resistance and is honored with that title."
      },
          {
        q: "Which country was the Roman Empire centered in?",
        options: [
          "Greece",
          "Italy",
          "Spain",
          "Turkey"
        ],
        correct: 1,
        explanation: "The Roman Empire was centered in Italy, with Rome as its capital, before expanding across Europe, North Africa, and the Middle East."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What was the primary ideological conflict driving the Chinese Civil War?",
        options: [
          "Monarchy vs. republic",
          "Nationalism vs. communism",
          "Capitalism vs. feudalism",
          "Religious vs. secular rule"
        ],
        correct: 1,
        explanation: "The Chinese Civil War (1927–1949) was fought primarily between the Nationalist Kuomintang and the Communist Party, ending in Communist victory."
      },
          {
        q: "Which treaty formally ended World War I?",
        options: [
          "Treaty of Paris",
          "Treaty of Versailles",
          "Treaty of Rome",
          "Treaty of Vienna"
        ],
        correct: 1,
        explanation: "The Treaty of Versailles, signed in 1919, formally ended World War I and imposed heavy penalties on Germany."
      },
          {
        q: "The French Revolution began in what year?",
        options: [
          "1776",
          "1789",
          "1804",
          "1815"
        ],
        correct: 1,
        explanation: "The French Revolution began in 1789, leading to the end of the monarchy and major political change in France."
      },
          {
        q: "Who was known as the 'Father of the Nation' in India?",
        options: [
          "Jawaharlal Nehru",
          "Mahatma Gandhi",
          "Indira Gandhi",
          "Subhas Chandra Bose"
        ],
        correct: 1,
        explanation: "Mahatma Gandhi led India's independence movement through nonviolent resistance and is honored with that title."
      },
          {
        q: "Which country was the Roman Empire centered in?",
        options: [
          "Greece",
          "Italy",
          "Spain",
          "Turkey"
        ],
        correct: 1,
        explanation: "The Roman Empire was centered in Italy, with Rome as its capital, before expanding across Europe, North Africa, and the Middle East."
      }
        ]
      }
    ]
  },
  {
    name: "World Religions & Ancient Culture",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "Which religion originated in ancient India and is based on the teachings of Siddhartha Gautama?",
        options: [
          "Hinduism",
          "Buddhism",
          "Sikhism",
          "Jainism"
        ],
        correct: 1,
        explanation: "Buddhism was founded by Siddhartha Gautama (the Buddha) in ancient India around the 5th century BCE."
      },
          {
        q: "What ancient Greek structure was dedicated to the goddess Athena?",
        options: [
          "The Colosseum",
          "The Parthenon",
          "The Pantheon",
          "Stonehenge"
        ],
        correct: 1,
        explanation: "The Parthenon, built on the Acropolis in Athens, was dedicated to the goddess Athena."
      },
          {
        q: "Which civilization developed one of the earliest writing systems, cuneiform?",
        options: [
          "Egyptians",
          "Sumerians",
          "Romans",
          "Greeks"
        ],
        correct: 1,
        explanation: "The Sumerians of ancient Mesopotamia developed cuneiform, one of the earliest known writing systems, around 3400 BCE."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What was the Code of Hammurabi?",
        options: [
          "A religious text",
          "One of the earliest written law codes",
          "A trade agreement",
          "A military strategy"
        ],
        correct: 1,
        explanation: "The Code of Hammurabi, from ancient Babylon, is one of the oldest deciphered writings and one of the earliest examples of a formal legal code."
      },
          {
        q: "Confucianism, a major influence on Chinese culture, was founded by whom?",
        options: [
          "Laozi",
          "Confucius",
          "Sun Tzu",
          "Buddha"
        ],
        correct: 1,
        explanation: "Confucianism was founded by the philosopher Confucius in ancient China, emphasizing morality and proper social relationships."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "Which religion originated in ancient India and is based on the teachings of Siddhartha Gautama?",
        options: [
          "Hinduism",
          "Buddhism",
          "Sikhism",
          "Jainism"
        ],
        correct: 1,
        explanation: "Buddhism was founded by Siddhartha Gautama (the Buddha) in ancient India around the 5th century BCE."
      },
          {
        q: "What ancient Greek structure was dedicated to the goddess Athena?",
        options: [
          "The Colosseum",
          "The Parthenon",
          "The Pantheon",
          "Stonehenge"
        ],
        correct: 1,
        explanation: "The Parthenon, built on the Acropolis in Athens, was dedicated to the goddess Athena."
      },
          {
        q: "Which civilization developed one of the earliest writing systems, cuneiform?",
        options: [
          "Egyptians",
          "Sumerians",
          "Romans",
          "Greeks"
        ],
        correct: 1,
        explanation: "The Sumerians of ancient Mesopotamia developed cuneiform, one of the earliest known writing systems, around 3400 BCE."
      },
          {
        q: "What was the Code of Hammurabi?",
        options: [
          "A religious text",
          "One of the earliest written law codes",
          "A trade agreement",
          "A military strategy"
        ],
        correct: 1,
        explanation: "The Code of Hammurabi, from ancient Babylon, is one of the oldest deciphered writings and one of the earliest examples of a formal legal code."
      },
          {
        q: "Confucianism, a major influence on Chinese culture, was founded by whom?",
        options: [
          "Laozi",
          "Confucius",
          "Sun Tzu",
          "Buddha"
        ],
        correct: 1,
        explanation: "Confucianism was founded by the philosopher Confucius in ancient China, emphasizing morality and proper social relationships."
      }
        ]
      }
    ]
  },
  {
    name: "Modern World Leaders & Events",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "Who was the President of the United States during the Cuban Missile Crisis?",
        options: [
          "Dwight Eisenhower",
          "John F. Kennedy",
          "Lyndon Johnson",
          "Richard Nixon"
        ],
        correct: 1,
        explanation: "John F. Kennedy was president during the 1962 Cuban Missile Crisis, a tense standoff between the US and Soviet Union."
      },
          {
        q: "Nelson Mandela became the first Black president of which country?",
        options: [
          "Kenya",
          "Nigeria",
          "South Africa",
          "Zimbabwe"
        ],
        correct: 2,
        explanation: "Nelson Mandela became South Africa's first Black president in 1994, after the end of apartheid."
      },
          {
        q: "What event is often said to mark the symbolic end of the Cold War?",
        options: [
          "The Cuban Missile Crisis",
          "The fall of the Berlin Wall",
          "World War II",
          "The Korean War"
        ],
        correct: 1,
        explanation: "The fall of the Berlin Wall in 1989 symbolized the end of the Cold War and led to German reunification."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "Who was the British Prime Minister during most of World War II?",
        options: [
          "Neville Chamberlain",
          "Winston Churchill",
          "Clement Attlee",
          "Margaret Thatcher"
        ],
        correct: 1,
        explanation: "Winston Churchill led Britain through most of World War II as Prime Minister, known for his rousing wartime speeches."
      },
          {
        q: "The United Nations was established immediately after which conflict?",
        options: [
          "World War I",
          "World War II",
          "The Cold War",
          "The Korean War"
        ],
        correct: 1,
        explanation: "The United Nations was founded in 1945, immediately after World War II, aiming to prevent future global conflicts."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "Who was the President of the United States during the Cuban Missile Crisis?",
        options: [
          "Dwight Eisenhower",
          "John F. Kennedy",
          "Lyndon Johnson",
          "Richard Nixon"
        ],
        correct: 1,
        explanation: "John F. Kennedy was president during the 1962 Cuban Missile Crisis, a tense standoff between the US and Soviet Union."
      },
          {
        q: "Nelson Mandela became the first Black president of which country?",
        options: [
          "Kenya",
          "Nigeria",
          "South Africa",
          "Zimbabwe"
        ],
        correct: 2,
        explanation: "Nelson Mandela became South Africa's first Black president in 1994, after the end of apartheid."
      },
          {
        q: "What event is often said to mark the symbolic end of the Cold War?",
        options: [
          "The Cuban Missile Crisis",
          "The fall of the Berlin Wall",
          "World War II",
          "The Korean War"
        ],
        correct: 1,
        explanation: "The fall of the Berlin Wall in 1989 symbolized the end of the Cold War and led to German reunification."
      },
          {
        q: "Who was the British Prime Minister during most of World War II?",
        options: [
          "Neville Chamberlain",
          "Winston Churchill",
          "Clement Attlee",
          "Margaret Thatcher"
        ],
        correct: 1,
        explanation: "Winston Churchill led Britain through most of World War II as Prime Minister, known for his rousing wartime speeches."
      },
          {
        q: "The United Nations was established immediately after which conflict?",
        options: [
          "World War I",
          "World War II",
          "The Cold War",
          "The Korean War"
        ],
        correct: 1,
        explanation: "The United Nations was founded in 1945, immediately after World War II, aiming to prevent future global conflicts."
      }
        ]
      }
    ]
  }


],
  geography: [
  {
    name: "World Rivers & Oceans",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is the longest river in the world?",
        options: [
          "Amazon",
          "Nile",
          "Yangtze",
          "Mississippi"
        ],
        correct: 1,
        explanation: "The Nile flows about 6,650 km through northeastern Africa, generally considered the longest river in the world."
      },
          {
        q: "What is the longest river in South America?",
        options: [
          "Nile",
          "Amazon",
          "Mississippi",
          "Yangtze"
        ],
        correct: 1,
        explanation: "The Amazon River is the longest river in South America and carries more water than any other river in the world."
      },
          {
        q: "What is the largest ocean on Earth?",
        options: [
          "Atlantic",
          "Indian",
          "Arctic",
          "Pacific"
        ],
        correct: 3,
        explanation: "The Pacific Ocean is the largest and deepest ocean, covering about a third of Earth's surface."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What ocean lies between Africa and Australia?",
        options: [
          "Atlantic",
          "Pacific",
          "Indian",
          "Arctic"
        ],
        correct: 2,
        explanation: "The Indian Ocean lies between Africa, Asia, and Australia."
      },
          {
        q: "Which river flows through Egypt and empties into the Mediterranean Sea?",
        options: [
          "Amazon",
          "Nile",
          "Congo",
          "Niger"
        ],
        correct: 1,
        explanation: "The Nile flows north through Egypt and empties into the Mediterranean Sea."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is the longest river in the world?",
        options: [
          "Amazon",
          "Nile",
          "Yangtze",
          "Mississippi"
        ],
        correct: 1,
        explanation: "The Nile flows about 6,650 km through northeastern Africa, generally considered the longest river in the world."
      },
          {
        q: "What is the longest river in South America?",
        options: [
          "Nile",
          "Amazon",
          "Mississippi",
          "Yangtze"
        ],
        correct: 1,
        explanation: "The Amazon River is the longest river in South America and carries more water than any other river in the world."
      },
          {
        q: "What is the largest ocean on Earth?",
        options: [
          "Atlantic",
          "Indian",
          "Arctic",
          "Pacific"
        ],
        correct: 3,
        explanation: "The Pacific Ocean is the largest and deepest ocean, covering about a third of Earth's surface."
      },
          {
        q: "What ocean lies between Africa and Australia?",
        options: [
          "Atlantic",
          "Pacific",
          "Indian",
          "Arctic"
        ],
        correct: 2,
        explanation: "The Indian Ocean lies between Africa, Asia, and Australia."
      },
          {
        q: "Which river flows through Egypt and empties into the Mediterranean Sea?",
        options: [
          "Amazon",
          "Nile",
          "Congo",
          "Niger"
        ],
        correct: 1,
        explanation: "The Nile flows north through Egypt and empties into the Mediterranean Sea."
      }
        ]
      }
    ]
  },
  {
    name: "Deserts & Dry Places",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "Which continent is the Sahara Desert located on?",
        options: [
          "Asia",
          "Africa",
          "South America",
          "Australia"
        ],
        correct: 1,
        explanation: "The Sahara spans much of North Africa, covering roughly 9 million square kilometers."
      },
          {
        q: "Which desert is the largest hot desert in the world?",
        options: [
          "Gobi",
          "Sahara",
          "Kalahari",
          "Mojave"
        ],
        correct: 1,
        explanation: "The Sahara is the largest hot desert in the world, covering much of North Africa."
      },
          {
        q: "What is the largest desert in the world by area (including cold deserts)?",
        options: [
          "Sahara Desert",
          "Antarctic Desert",
          "Arabian Desert",
          "Gobi Desert"
        ],
        correct: 1,
        explanation: "The Antarctic Desert is technically the largest desert in the world by area, since a desert is defined by low precipitation, not heat."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is the driest place on Earth (excluding polar regions)?",
        options: [
          "Sahara Desert",
          "Atacama Desert",
          "Death Valley",
          "Gobi Desert"
        ],
        correct: 1,
        explanation: "The Atacama Desert in Chile is considered the driest non-polar desert on Earth, with some areas receiving almost no rainfall."
      },
          {
        q: "What is a 'rain shadow'?",
        options: [
          "A cloud formation",
          "A dry area on the leeward side of a mountain range",
          "A type of monsoon",
          "An ocean current pattern"
        ],
        correct: 1,
        explanation: "A rain shadow is a dry region on the side of a mountain range facing away from prevailing winds, since moisture falls as precipitation on the windward side."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "Which continent is the Sahara Desert located on?",
        options: [
          "Asia",
          "Africa",
          "South America",
          "Australia"
        ],
        correct: 1,
        explanation: "The Sahara spans much of North Africa, covering roughly 9 million square kilometers."
      },
          {
        q: "Which desert is the largest hot desert in the world?",
        options: [
          "Gobi",
          "Sahara",
          "Kalahari",
          "Mojave"
        ],
        correct: 1,
        explanation: "The Sahara is the largest hot desert in the world, covering much of North Africa."
      },
          {
        q: "What is the largest desert in the world by area (including cold deserts)?",
        options: [
          "Sahara Desert",
          "Antarctic Desert",
          "Arabian Desert",
          "Gobi Desert"
        ],
        correct: 1,
        explanation: "The Antarctic Desert is technically the largest desert in the world by area, since a desert is defined by low precipitation, not heat."
      },
          {
        q: "What is the driest place on Earth (excluding polar regions)?",
        options: [
          "Sahara Desert",
          "Atacama Desert",
          "Death Valley",
          "Gobi Desert"
        ],
        correct: 1,
        explanation: "The Atacama Desert in Chile is considered the driest non-polar desert on Earth, with some areas receiving almost no rainfall."
      },
          {
        q: "What is a 'rain shadow'?",
        options: [
          "A cloud formation",
          "A dry area on the leeward side of a mountain range",
          "A type of monsoon",
          "An ocean current pattern"
        ],
        correct: 1,
        explanation: "A rain shadow is a dry region on the side of a mountain range facing away from prevailing winds, since moisture falls as precipitation on the windward side."
      }
        ]
      }
    ]
  },
  {
    name: "Mountains & Landforms",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is the name of the mountain range running through South America?",
        options: [
          "Rockies",
          "Alps",
          "Andes",
          "Atlas"
        ],
        correct: 2,
        explanation: "The Andes is the longest mountain range in the world, running along the western edge of South America."
      },
          {
        q: "Which mountain range separates Europe from Asia?",
        options: [
          "Alps",
          "Andes",
          "Ural Mountains",
          "Himalayas"
        ],
        correct: 2,
        explanation: "The Ural Mountains run north-south through Russia and are traditionally treated as the boundary between Europe and Asia."
      },
          {
        q: "What is the tallest mountain in the world (above sea level)?",
        options: [
          "K2",
          "Mount Kilimanjaro",
          "Mount Everest",
          "Denali"
        ],
        correct: 2,
        explanation: "Mount Everest, in the Himalayas, stands at about 8,849 meters — the tallest mountain above sea level."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What term describes a narrow strip of land connecting two larger landmasses?",
        options: [
          "Peninsula",
          "Isthmus",
          "Archipelago",
          "Plateau"
        ],
        correct: 1,
        explanation: "An isthmus is a narrow strip of land connecting two larger landmasses, like the Isthmus of Panama connecting North and South America."
      },
          {
        q: "What is the name for a large, flat, elevated area of land?",
        options: [
          "Valley",
          "Plateau",
          "Basin",
          "Delta"
        ],
        correct: 1,
        explanation: "A plateau is a large area of relatively flat land that is elevated significantly above the surrounding terrain."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is the name of the mountain range running through South America?",
        options: [
          "Rockies",
          "Alps",
          "Andes",
          "Atlas"
        ],
        correct: 2,
        explanation: "The Andes is the longest mountain range in the world, running along the western edge of South America."
      },
          {
        q: "Which mountain range separates Europe from Asia?",
        options: [
          "Alps",
          "Andes",
          "Ural Mountains",
          "Himalayas"
        ],
        correct: 2,
        explanation: "The Ural Mountains run north-south through Russia and are traditionally treated as the boundary between Europe and Asia."
      },
          {
        q: "What is the tallest mountain in the world (above sea level)?",
        options: [
          "K2",
          "Mount Kilimanjaro",
          "Mount Everest",
          "Denali"
        ],
        correct: 2,
        explanation: "Mount Everest, in the Himalayas, stands at about 8,849 meters — the tallest mountain above sea level."
      },
          {
        q: "What term describes a narrow strip of land connecting two larger landmasses?",
        options: [
          "Peninsula",
          "Isthmus",
          "Archipelago",
          "Plateau"
        ],
        correct: 1,
        explanation: "An isthmus is a narrow strip of land connecting two larger landmasses, like the Isthmus of Panama connecting North and South America."
      },
          {
        q: "What is the name for a large, flat, elevated area of land?",
        options: [
          "Valley",
          "Plateau",
          "Basin",
          "Delta"
        ],
        correct: 1,
        explanation: "A plateau is a large area of relatively flat land that is elevated significantly above the surrounding terrain."
      }
        ]
      }
    ]
  },
  {
    name: "Countries & Capitals",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is the capital of Canada?",
        options: [
          "Toronto",
          "Vancouver",
          "Ottawa",
          "Montreal"
        ],
        correct: 2,
        explanation: "Ottawa, located in Ontario, has been Canada's capital since 1857, chosen partly for its position between English and French Canada."
      },
          {
        q: "What is the capital city of France?",
        options: [
          "Marseille",
          "Lyon",
          "Paris",
          "Nice"
        ],
        correct: 2,
        explanation: "Paris has been the capital of France since the late 10th century."
      },
          {
        q: "What is the capital of Australia?",
        options: [
          "Sydney",
          "Melbourne",
          "Canberra",
          "Perth"
        ],
        correct: 2,
        explanation: "Canberra — not Sydney or Melbourne — is Australia's capital, purpose-built as a compromise between the two rival cities."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is the smallest country in the world?",
        options: [
          "Monaco",
          "San Marino",
          "Vatican City",
          "Liechtenstein"
        ],
        correct: 2,
        explanation: "Vatican City, an independent city-state in Rome, covers just about 0.44 square kilometers."
      },
          {
        q: "Which country currently has the largest population?",
        options: [
          "USA",
          "India",
          "China",
          "Indonesia"
        ],
        correct: 1,
        explanation: "India surpassed China to become the world's most populous country in 2023, according to United Nations estimates."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is the capital of Canada?",
        options: [
          "Toronto",
          "Vancouver",
          "Ottawa",
          "Montreal"
        ],
        correct: 2,
        explanation: "Ottawa, located in Ontario, has been Canada's capital since 1857, chosen partly for its position between English and French Canada."
      },
          {
        q: "What is the capital city of France?",
        options: [
          "Marseille",
          "Lyon",
          "Paris",
          "Nice"
        ],
        correct: 2,
        explanation: "Paris has been the capital of France since the late 10th century."
      },
          {
        q: "What is the capital of Australia?",
        options: [
          "Sydney",
          "Melbourne",
          "Canberra",
          "Perth"
        ],
        correct: 2,
        explanation: "Canberra — not Sydney or Melbourne — is Australia's capital, purpose-built as a compromise between the two rival cities."
      },
          {
        q: "What is the smallest country in the world?",
        options: [
          "Monaco",
          "San Marino",
          "Vatican City",
          "Liechtenstein"
        ],
        correct: 2,
        explanation: "Vatican City, an independent city-state in Rome, covers just about 0.44 square kilometers."
      },
          {
        q: "Which country currently has the largest population?",
        options: [
          "USA",
          "India",
          "China",
          "Indonesia"
        ],
        correct: 1,
        explanation: "India surpassed China to become the world's most populous country in 2023, according to United Nations estimates."
      }
        ]
      }
    ]
  },
  {
    name: "Continents & Unique Nations",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "Which continent is the largest by land area?",
        options: [
          "Africa",
          "Asia",
          "North America",
          "Europe"
        ],
        correct: 1,
        explanation: "Asia is the largest continent, covering about 30% of Earth's total land area."
      },
          {
        q: "Which of these countries is transcontinental, spanning both Europe and Asia?",
        options: [
          "Egypt",
          "Turkey",
          "Brazil",
          "Japan"
        ],
        correct: 1,
        explanation: "Turkey spans two continents — a small part (Eastern Thrace) lies in Europe, while the majority (Anatolia) lies in Asia."
      },
          {
        q: "Which country is both an island and a continent?",
        options: [
          "Greenland",
          "Iceland",
          "Australia",
          "Madagascar"
        ],
        correct: 2,
        explanation: "Australia is unique in being classified as both an island and its own continent."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "Which country is known as the 'Land of the Rising Sun'?",
        options: [
          "China",
          "Japan",
          "Thailand",
          "South Korea"
        ],
        correct: 1,
        explanation: "Japan is nicknamed the 'Land of the Rising Sun' because, from East Asia, the sun appears to rise from its direction."
      },
          {
        q: "Which U.S. state is the largest by area?",
        options: [
          "Texas",
          "California",
          "Alaska",
          "Montana"
        ],
        correct: 2,
        explanation: "Alaska is by far the largest U.S. state by land area, more than twice the size of Texas."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "Which continent is the largest by land area?",
        options: [
          "Africa",
          "Asia",
          "North America",
          "Europe"
        ],
        correct: 1,
        explanation: "Asia is the largest continent, covering about 30% of Earth's total land area."
      },
          {
        q: "Which of these countries is transcontinental, spanning both Europe and Asia?",
        options: [
          "Egypt",
          "Turkey",
          "Brazil",
          "Japan"
        ],
        correct: 1,
        explanation: "Turkey spans two continents — a small part (Eastern Thrace) lies in Europe, while the majority (Anatolia) lies in Asia."
      },
          {
        q: "Which country is both an island and a continent?",
        options: [
          "Greenland",
          "Iceland",
          "Australia",
          "Madagascar"
        ],
        correct: 2,
        explanation: "Australia is unique in being classified as both an island and its own continent."
      },
          {
        q: "Which country is known as the 'Land of the Rising Sun'?",
        options: [
          "China",
          "Japan",
          "Thailand",
          "South Korea"
        ],
        correct: 1,
        explanation: "Japan is nicknamed the 'Land of the Rising Sun' because, from East Asia, the sun appears to rise from its direction."
      },
          {
        q: "Which U.S. state is the largest by area?",
        options: [
          "Texas",
          "California",
          "Alaska",
          "Montana"
        ],
        correct: 2,
        explanation: "Alaska is by far the largest U.S. state by land area, more than twice the size of Texas."
      }
        ]
      }
    ]
  },
  {
    name: "Islands, Straits & Landmarks",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "Which country consists of over 17,000 islands?",
        options: [
          "Philippines",
          "Indonesia",
          "Japan",
          "New Zealand"
        ],
        correct: 1,
        explanation: "Indonesia is the world's largest archipelago, made up of more than 17,000 islands."
      },
          {
        q: "Which landlocked country is entirely surrounded by South Africa?",
        options: [
          "Botswana",
          "Eswatini",
          "Lesotho",
          "Zimbabwe"
        ],
        correct: 2,
        explanation: "Lesotho is a small landlocked country completely surrounded by South Africa — one of only three such 'enclave countries' in the world."
      },
          {
        q: "Which country has the most natural lakes?",
        options: [
          "USA",
          "Canada",
          "Russia",
          "Finland"
        ],
        correct: 1,
        explanation: "Canada has more lakes than the rest of the world's countries combined, thanks to its glacially formed landscape."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is the world's largest coral reef system?",
        options: [
          "Belize Barrier Reef",
          "Great Barrier Reef",
          "Red Sea Coral Reef",
          "Florida Reef"
        ],
        correct: 1,
        explanation: "The Great Barrier Reef, off the coast of Australia, is the world's largest coral reef system."
      },
          {
        q: "Which strait separates Europe and Africa at its narrowest point?",
        options: [
          "Strait of Hormuz",
          "Strait of Gibraltar",
          "Bering Strait",
          "Strait of Malacca"
        ],
        correct: 1,
        explanation: "The Strait of Gibraltar separates Spain (Europe) from Morocco (Africa) at its narrowest point, about 13 km wide."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "Which country consists of over 17,000 islands?",
        options: [
          "Philippines",
          "Indonesia",
          "Japan",
          "New Zealand"
        ],
        correct: 1,
        explanation: "Indonesia is the world's largest archipelago, made up of more than 17,000 islands."
      },
          {
        q: "Which landlocked country is entirely surrounded by South Africa?",
        options: [
          "Botswana",
          "Eswatini",
          "Lesotho",
          "Zimbabwe"
        ],
        correct: 2,
        explanation: "Lesotho is a small landlocked country completely surrounded by South Africa — one of only three such 'enclave countries' in the world."
      },
          {
        q: "Which country has the most natural lakes?",
        options: [
          "USA",
          "Canada",
          "Russia",
          "Finland"
        ],
        correct: 1,
        explanation: "Canada has more lakes than the rest of the world's countries combined, thanks to its glacially formed landscape."
      },
          {
        q: "What is the world's largest coral reef system?",
        options: [
          "Belize Barrier Reef",
          "Great Barrier Reef",
          "Red Sea Coral Reef",
          "Florida Reef"
        ],
        correct: 1,
        explanation: "The Great Barrier Reef, off the coast of Australia, is the world's largest coral reef system."
      },
          {
        q: "Which strait separates Europe and Africa at its narrowest point?",
        options: [
          "Strait of Hormuz",
          "Strait of Gibraltar",
          "Bering Strait",
          "Strait of Malacca"
        ],
        correct: 1,
        explanation: "The Strait of Gibraltar separates Spain (Europe) from Morocco (Africa) at its narrowest point, about 13 km wide."
      }
        ]
      }
    ]
  },
  {
    name: "Time, Coordinates & Forces",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "Which country has the most time zones?",
        options: [
          "Russia",
          "USA",
          "France",
          "China"
        ],
        correct: 2,
        explanation: "Thanks to its overseas territories, France spans 12 time zones — more than any other country."
      },
          {
        q: "What is the name of the imaginary line at 0° longitude?",
        options: [
          "Equator",
          "Prime Meridian",
          "Tropic of Cancer",
          "International Date Line"
        ],
        correct: 1,
        explanation: "The Prime Meridian, passing through Greenwich, England, marks 0° longitude and divides the Eastern and Western Hemispheres."
      },
          {
        q: "What causes the Coriolis effect?",
        options: [
          "Earth's magnetic field",
          "Earth's rotation",
          "Ocean currents",
          "Solar radiation"
        ],
        correct: 1,
        explanation: "The Coriolis effect is caused by Earth's rotation, deflecting moving air and water — to the right in the Northern Hemisphere and left in the Southern Hemisphere."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "Which line of latitude receives the most consistent, direct sunlight year-round?",
        options: [
          "Arctic Circle",
          "Tropic of Cancer",
          "Equator",
          "Tropic of Capricorn"
        ],
        correct: 2,
        explanation: "The Equator receives the most consistent, direct sunlight throughout the year since it's equidistant from both poles."
      },
          {
        q: "What is the term for a city that serves as the seat of a country's government?",
        options: [
          "Metropolis",
          "Capital",
          "Province",
          "Territory"
        ],
        correct: 1,
        explanation: "A capital is the city designated as the seat of a country's government."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "Which country has the most time zones?",
        options: [
          "Russia",
          "USA",
          "France",
          "China"
        ],
        correct: 2,
        explanation: "Thanks to its overseas territories, France spans 12 time zones — more than any other country."
      },
          {
        q: "What is the name of the imaginary line at 0° longitude?",
        options: [
          "Equator",
          "Prime Meridian",
          "Tropic of Cancer",
          "International Date Line"
        ],
        correct: 1,
        explanation: "The Prime Meridian, passing through Greenwich, England, marks 0° longitude and divides the Eastern and Western Hemispheres."
      },
          {
        q: "What causes the Coriolis effect?",
        options: [
          "Earth's magnetic field",
          "Earth's rotation",
          "Ocean currents",
          "Solar radiation"
        ],
        correct: 1,
        explanation: "The Coriolis effect is caused by Earth's rotation, deflecting moving air and water — to the right in the Northern Hemisphere and left in the Southern Hemisphere."
      },
          {
        q: "Which line of latitude receives the most consistent, direct sunlight year-round?",
        options: [
          "Arctic Circle",
          "Tropic of Cancer",
          "Equator",
          "Tropic of Capricorn"
        ],
        correct: 2,
        explanation: "The Equator receives the most consistent, direct sunlight throughout the year since it's equidistant from both poles."
      },
          {
        q: "What is the term for a city that serves as the seat of a country's government?",
        options: [
          "Metropolis",
          "Capital",
          "Province",
          "Territory"
        ],
        correct: 1,
        explanation: "A capital is the city designated as the seat of a country's government."
      }
        ]
      }
    ]
  },
  {
    name: "Climate, Ecosystems & Earth's Past",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What term describes a large, flat, treeless Arctic region?",
        options: [
          "Savanna",
          "Tundra",
          "Steppe",
          "Prairie"
        ],
        correct: 1,
        explanation: "Tundra describes cold, treeless regions with permanently frozen subsoil, found in Arctic and high-altitude areas."
      },
          {
        q: "What geological process primarily explains the formation of the Himalayas?",
        options: [
          "Volcanic eruption",
          "Tectonic plate collision",
          "Glacial erosion",
          "Meteor impact"
        ],
        correct: 1,
        explanation: "The Himalayas formed from the collision of the Indian and Eurasian tectonic plates, a process that is still slowly continuing today."
      },
          {
        q: "What is the name of the supercontinent that existed roughly 300 million years ago?",
        options: [
          "Gondwana",
          "Laurasia",
          "Pangaea",
          "Rodinia"
        ],
        correct: 2,
        explanation: "Pangaea was the supercontinent that existed roughly 335 to 175 million years ago before splitting into today's continents."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "Which African country was never colonized by a European power?",
        options: [
          "Kenya",
          "Ethiopia",
          "Nigeria",
          "Ghana"
        ],
        correct: 1,
        explanation: "Ethiopia successfully resisted European colonization, notably defeating Italy at the Battle of Adwa in 1896."
      },
          {
        q: "Which country is home to most of the Amazon Rainforest?",
        options: [
          "Peru",
          "Colombia",
          "Brazil",
          "Venezuela"
        ],
        correct: 2,
        explanation: "While the Amazon Rainforest spans several countries, the majority of it lies within Brazil."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What term describes a large, flat, treeless Arctic region?",
        options: [
          "Savanna",
          "Tundra",
          "Steppe",
          "Prairie"
        ],
        correct: 1,
        explanation: "Tundra describes cold, treeless regions with permanently frozen subsoil, found in Arctic and high-altitude areas."
      },
          {
        q: "What geological process primarily explains the formation of the Himalayas?",
        options: [
          "Volcanic eruption",
          "Tectonic plate collision",
          "Glacial erosion",
          "Meteor impact"
        ],
        correct: 1,
        explanation: "The Himalayas formed from the collision of the Indian and Eurasian tectonic plates, a process that is still slowly continuing today."
      },
          {
        q: "What is the name of the supercontinent that existed roughly 300 million years ago?",
        options: [
          "Gondwana",
          "Laurasia",
          "Pangaea",
          "Rodinia"
        ],
        correct: 2,
        explanation: "Pangaea was the supercontinent that existed roughly 335 to 175 million years ago before splitting into today's continents."
      },
          {
        q: "Which African country was never colonized by a European power?",
        options: [
          "Kenya",
          "Ethiopia",
          "Nigeria",
          "Ghana"
        ],
        correct: 1,
        explanation: "Ethiopia successfully resisted European colonization, notably defeating Italy at the Battle of Adwa in 1896."
      },
          {
        q: "Which country is home to most of the Amazon Rainforest?",
        options: [
          "Peru",
          "Colombia",
          "Brazil",
          "Venezuela"
        ],
        correct: 2,
        explanation: "While the Amazon Rainforest spans several countries, the majority of it lies within Brazil."
      }
        ]
      }
    ]
  },
  {
    name: "Political & Human Geography",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is the term for the line that separates two countries?",
        options: [
          "Coastline",
          "Border",
          "Equator",
          "Meridian"
        ],
        correct: 1,
        explanation: "A border (or boundary) is the line separating two countries or regions."
      },
          {
        q: "What is a 'landlocked' country?",
        options: [
          "A country surrounded by mountains",
          "A country with no access to the ocean",
          "A country on an island",
          "A country near the equator"
        ],
        correct: 1,
        explanation: "A landlocked country has no coastline and no direct access to the ocean."
      },
          {
        q: "What is the term for the movement of people from rural areas to cities?",
        options: [
          "Migration",
          "Urbanization",
          "Globalization",
          "Colonization"
        ],
        correct: 1,
        explanation: "Urbanization describes the growing proportion of a population living in cities rather than rural areas."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is a 'peninsula'?",
        options: [
          "Land surrounded by water on three sides",
          "An island in the middle of a lake",
          "A mountain range",
          "A type of desert"
        ],
        correct: 0,
        explanation: "A peninsula is a piece of land almost entirely surrounded by water, connected to the mainland on one side."
      },
          {
        q: "Which of these best describes 'population density'?",
        options: [
          "Total number of people in a country",
          "The average number of people per unit of area",
          "The birth rate of a country",
          "The rate of urban migration"
        ],
        correct: 1,
        explanation: "Population density measures how many people live per unit of area, not just the total population."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is the term for the line that separates two countries?",
        options: [
          "Coastline",
          "Border",
          "Equator",
          "Meridian"
        ],
        correct: 1,
        explanation: "A border (or boundary) is the line separating two countries or regions."
      },
          {
        q: "What is a 'landlocked' country?",
        options: [
          "A country surrounded by mountains",
          "A country with no access to the ocean",
          "A country on an island",
          "A country near the equator"
        ],
        correct: 1,
        explanation: "A landlocked country has no coastline and no direct access to the ocean."
      },
          {
        q: "What is the term for the movement of people from rural areas to cities?",
        options: [
          "Migration",
          "Urbanization",
          "Globalization",
          "Colonization"
        ],
        correct: 1,
        explanation: "Urbanization describes the growing proportion of a population living in cities rather than rural areas."
      },
          {
        q: "What is a 'peninsula'?",
        options: [
          "Land surrounded by water on three sides",
          "An island in the middle of a lake",
          "A mountain range",
          "A type of desert"
        ],
        correct: 0,
        explanation: "A peninsula is a piece of land almost entirely surrounded by water, connected to the mainland on one side."
      },
          {
        q: "Which of these best describes 'population density'?",
        options: [
          "Total number of people in a country",
          "The average number of people per unit of area",
          "The birth rate of a country",
          "The rate of urban migration"
        ],
        correct: 1,
        explanation: "Population density measures how many people live per unit of area, not just the total population."
      }
        ]
      }
    ]
  },
  {
    name: "Natural Disasters & Earth Hazards",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What causes earthquakes?",
        options: [
          "Ocean currents",
          "Movement of tectonic plates",
          "Volcanic ash",
          "Wind patterns"
        ],
        correct: 1,
        explanation: "Earthquakes are caused by the sudden release of energy from movement along fault lines where tectonic plates meet."
      },
          {
        q: "What is a tsunami usually caused by?",
        options: [
          "Heavy rainfall",
          "Underwater earthquakes or landslides",
          "Strong winds",
          "Melting glaciers"
        ],
        correct: 1,
        explanation: "Tsunamis are most commonly caused by underwater earthquakes, which displace huge volumes of water."
      },
          {
        q: "What scale is commonly used to measure the strength of an earthquake?",
        options: [
          "Richter scale",
          "Beaufort scale",
          "Fujita scale",
          "Kelvin scale"
        ],
        correct: 0,
        explanation: "The Richter scale (and its modern successor) measures the energy released by an earthquake."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is the eye of a hurricane?",
        options: [
          "The strongest part of the storm",
          "The calm center of the storm",
          "The outer edge of the storm",
          "A type of storm surge"
        ],
        correct: 1,
        explanation: "The eye is the calm, low-pressure center of a hurricane, surrounded by the most intense winds and rain."
      },
          {
        q: "What term describes a long period of unusually low rainfall?",
        options: [
          "Flood",
          "Drought",
          "Monsoon",
          "Blizzard"
        ],
        correct: 1,
        explanation: "A drought is an extended period of abnormally low rainfall, leading to water shortages."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What causes earthquakes?",
        options: [
          "Ocean currents",
          "Movement of tectonic plates",
          "Volcanic ash",
          "Wind patterns"
        ],
        correct: 1,
        explanation: "Earthquakes are caused by the sudden release of energy from movement along fault lines where tectonic plates meet."
      },
          {
        q: "What is a tsunami usually caused by?",
        options: [
          "Heavy rainfall",
          "Underwater earthquakes or landslides",
          "Strong winds",
          "Melting glaciers"
        ],
        correct: 1,
        explanation: "Tsunamis are most commonly caused by underwater earthquakes, which displace huge volumes of water."
      },
          {
        q: "What scale is commonly used to measure the strength of an earthquake?",
        options: [
          "Richter scale",
          "Beaufort scale",
          "Fujita scale",
          "Kelvin scale"
        ],
        correct: 0,
        explanation: "The Richter scale (and its modern successor) measures the energy released by an earthquake."
      },
          {
        q: "What is the eye of a hurricane?",
        options: [
          "The strongest part of the storm",
          "The calm center of the storm",
          "The outer edge of the storm",
          "A type of storm surge"
        ],
        correct: 1,
        explanation: "The eye is the calm, low-pressure center of a hurricane, surrounded by the most intense winds and rain."
      },
          {
        q: "What term describes a long period of unusually low rainfall?",
        options: [
          "Flood",
          "Drought",
          "Monsoon",
          "Blizzard"
        ],
        correct: 1,
        explanation: "A drought is an extended period of abnormally low rainfall, leading to water shortages."
      }
        ]
      }
    ]
  }


],
  english: [
  {
    name: "Parts of Speech",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "Which word is a pronoun?",
        options: [
          "Run",
          "She",
          "Quickly",
          "Happy"
        ],
        correct: 1,
        explanation: "Pronouns replace nouns in a sentence — 'she' stands in for a person's name."
      },
          {
        q: "Which word is a verb?",
        options: [
          "Blue",
          "Jump",
          "Table",
          "Slowly"
        ],
        correct: 1,
        explanation: "A verb describes an action or state of being — 'jump' describes an action."
      },
          {
        q: "What type of word describes a noun?",
        options: [
          "Verb",
          "Adjective",
          "Adverb",
          "Pronoun"
        ],
        correct: 1,
        explanation: "Adjectives describe or modify nouns, telling us more about qualities like size, color, or feeling."
      }
        ,
          {
    type: "sentence-build",
    prompt: "Arrange the words to form a correct sentence:",
    words: ["quickly", "the", "dog", "ran"],
    correctOrder: ["the", "dog", "ran", "quickly"],
    explanation: "English word order is Subject-Verb-Object/Modifier: 'The dog' (subject) + 'ran' (verb) + 'quickly' (adverb modifying the verb)."
  },
          {
    type: "speak-sentence",
    sentence: "The bright red car drove down the street.",
    explanation: "This sentence has a clear subject (car), adjectives (bright, red), and a verb phrase (drove down) — practice saying it smoothly."
  }]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "Which of these is a proper noun?",
        options: [
          "dog",
          "London",
          "quickly",
          "happiness"
        ],
        correct: 1,
        explanation: "Proper nouns name specific people, places, or things and are capitalized — 'London' names a specific city."
      },
          {
        q: "What part of speech is the word 'quickly'?",
        options: [
          "Noun",
          "Verb",
          "Adjective",
          "Adverb"
        ],
        correct: 3,
        explanation: "Words ending in -ly that modify verbs, like 'quickly,' are typically adverbs, describing how an action is done."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "Which word is a pronoun?",
        options: [
          "Run",
          "She",
          "Quickly",
          "Happy"
        ],
        correct: 1,
        explanation: "Pronouns replace nouns in a sentence — 'she' stands in for a person's name."
      },
          {
        q: "Which word is a verb?",
        options: [
          "Blue",
          "Jump",
          "Table",
          "Slowly"
        ],
        correct: 1,
        explanation: "A verb describes an action or state of being — 'jump' describes an action."
      },
          {
        q: "What type of word describes a noun?",
        options: [
          "Verb",
          "Adjective",
          "Adverb",
          "Pronoun"
        ],
        correct: 1,
        explanation: "Adjectives describe or modify nouns, telling us more about qualities like size, color, or feeling."
      },
          {
        q: "Which of these is a proper noun?",
        options: [
          "dog",
          "London",
          "quickly",
          "happiness"
        ],
        correct: 1,
        explanation: "Proper nouns name specific people, places, or things and are capitalized — 'London' names a specific city."
      },
          {
        q: "What part of speech is the word 'quickly'?",
        options: [
          "Noun",
          "Verb",
          "Adjective",
          "Adverb"
        ],
        correct: 3,
        explanation: "Words ending in -ly that modify verbs, like 'quickly,' are typically adverbs, describing how an action is done."
      }
        ,
          {
    type: "sentence-build",
    prompt: "Arrange the words to form a correct sentence:",
    words: ["quickly", "the", "dog", "ran"],
    correctOrder: ["the", "dog", "ran", "quickly"],
    explanation: "English word order is Subject-Verb-Object/Modifier: 'The dog' (subject) + 'ran' (verb) + 'quickly' (adverb modifying the verb)."
  },
          {
    type: "speak-sentence",
    sentence: "The bright red car drove down the street.",
    explanation: "This sentence has a clear subject (car), adjectives (bright, red), and a verb phrase (drove down) — practice saying it smoothly."
  }]
      }
    ]
  },
  {
    name: "Sentence Basics",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "Which of these is a complete sentence?",
        options: [
          "Running fast.",
          "The dog barked.",
          "Under the table.",
          "Because it rained."
        ],
        correct: 1,
        explanation: "A complete sentence needs a subject and a verb expressing a full thought — 'The dog barked' has both."
      },
          {
        q: "Which sentence uses correct capitalization?",
        options: [
          "my Dog likes to Run.",
          "My dog likes to run.",
          "My Dog Likes To Run.",
          "my dog likes to run."
        ],
        correct: 1,
        explanation: "Only the first word of a sentence and proper nouns need capital letters — 'My dog likes to run.' follows this rule correctly."
      },
          {
        q: "Which sentence uses correct subject-verb agreement?",
        options: [
          "The dogs barks loudly.",
          "The dog bark loudly.",
          "The dogs bark loudly.",
          "The dog barking loudly."
        ],
        correct: 2,
        explanation: "The plural subject 'dogs' takes the plural verb form 'bark' (without -s), matching in number."
      }
        ,
          {
    type: "sentence-build",
    prompt: "Arrange the words to form a complete sentence:",
    words: ["is", "sky", "the", "blue"],
    correctOrder: ["the", "sky", "is", "blue"],
    explanation: "A complete sentence needs a subject ('the sky') and a predicate ('is blue')."
  },
          {
    type: "speak-sentence",
    sentence: "She walked to the store to buy milk.",
    explanation: "This is a simple sentence with one subject (she) and one main verb phrase (walked) — a good one to practice saying clearly."
  }]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "Which sentence contains a dangling modifier?",
        options: [
          "Walking down the street, the trees looked beautiful.",
          "She walked down the street and admired the trees.",
          "The trees were beautiful as she walked down the street.",
          "While walking, she admired the trees."
        ],
        correct: 0,
        explanation: "The first sentence incorrectly implies the trees were walking, since the modifying phrase isn't clearly attached to the person doing the walking."
      },
          {
        q: "Which of these is a compound-complex sentence?",
        options: [
          "She ran.",
          "She ran because she was late.",
          "She ran, and he walked.",
          "She ran because she was late, and he walked slowly."
        ],
        correct: 3,
        explanation: "A compound-complex sentence contains at least two independent clauses ('she ran...' and 'he walked slowly') plus at least one dependent clause ('because she was late')."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "Which of these is a complete sentence?",
        options: [
          "Running fast.",
          "The dog barked.",
          "Under the table.",
          "Because it rained."
        ],
        correct: 1,
        explanation: "A complete sentence needs a subject and a verb expressing a full thought — 'The dog barked' has both."
      },
          {
        q: "Which sentence uses correct capitalization?",
        options: [
          "my Dog likes to Run.",
          "My dog likes to run.",
          "My Dog Likes To Run.",
          "my dog likes to run."
        ],
        correct: 1,
        explanation: "Only the first word of a sentence and proper nouns need capital letters — 'My dog likes to run.' follows this rule correctly."
      },
          {
        q: "Which sentence uses correct subject-verb agreement?",
        options: [
          "The dogs barks loudly.",
          "The dog bark loudly.",
          "The dogs bark loudly.",
          "The dog barking loudly."
        ],
        correct: 2,
        explanation: "The plural subject 'dogs' takes the plural verb form 'bark' (without -s), matching in number."
      },
          {
        q: "Which sentence contains a dangling modifier?",
        options: [
          "Walking down the street, the trees looked beautiful.",
          "She walked down the street and admired the trees.",
          "The trees were beautiful as she walked down the street.",
          "While walking, she admired the trees."
        ],
        correct: 0,
        explanation: "The first sentence incorrectly implies the trees were walking, since the modifying phrase isn't clearly attached to the person doing the walking."
      },
          {
        q: "Which of these is a compound-complex sentence?",
        options: [
          "She ran.",
          "She ran because she was late.",
          "She ran, and he walked.",
          "She ran because she was late, and he walked slowly."
        ],
        correct: 3,
        explanation: "A compound-complex sentence contains at least two independent clauses ('she ran...' and 'he walked slowly') plus at least one dependent clause ('because she was late')."
      }
        ,
          {
    type: "sentence-build",
    prompt: "Arrange the words to form a complete sentence:",
    words: ["is", "sky", "the", "blue"],
    correctOrder: ["the", "sky", "is", "blue"],
    explanation: "A complete sentence needs a subject ('the sky') and a predicate ('is blue')."
  },
          {
    type: "speak-sentence",
    sentence: "She walked to the store to buy milk.",
    explanation: "This is a simple sentence with one subject (she) and one main verb phrase (walked) — a good one to practice saying clearly."
  }]
      }
    ]
  },
  {
    name: "Vocabulary Building",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "Which word is a synonym for 'happy'?",
        options: [
          "Joyful",
          "Sad",
          "Angry",
          "Tired"
        ],
        correct: 0,
        explanation: "A synonym is a word with a similar meaning — 'joyful' means feeling or expressing happiness, just like 'happy.'"
      },
          {
        q: "Which word means the opposite of 'big'?",
        options: [
          "Large",
          "Small",
          "Tall",
          "Wide"
        ],
        correct: 1,
        explanation: "'Small' is an antonym (opposite) of 'big,' both describing size."
      },
          {
        q: "What is a synonym for 'quick'?",
        options: [
          "Slow",
          "Fast",
          "Heavy",
          "Quiet"
        ],
        correct: 1,
        explanation: "'Fast' means moving with speed, matching the meaning of 'quick.'"
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is a synonym for 'enormous'?",
        options: [
          "Tiny",
          "Huge",
          "Quiet",
          "Fast"
        ],
        correct: 1,
        explanation: "'Huge' means very large, matching the meaning of 'enormous.'"
      },
          {
        q: "What is a 'compound word'?",
        options: [
          "A word with a prefix",
          "Two words joined to form a new word",
          "A word with multiple syllables",
          "A word borrowed from another language"
        ],
        correct: 1,
        explanation: "A compound word is formed by joining two smaller words together, like 'sunflower' (sun + flower)."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "Which word is a synonym for 'happy'?",
        options: [
          "Joyful",
          "Sad",
          "Angry",
          "Tired"
        ],
        correct: 0,
        explanation: "A synonym is a word with a similar meaning — 'joyful' means feeling or expressing happiness, just like 'happy.'"
      },
          {
        q: "Which word means the opposite of 'big'?",
        options: [
          "Large",
          "Small",
          "Tall",
          "Wide"
        ],
        correct: 1,
        explanation: "'Small' is an antonym (opposite) of 'big,' both describing size."
      },
          {
        q: "What is a synonym for 'quick'?",
        options: [
          "Slow",
          "Fast",
          "Heavy",
          "Quiet"
        ],
        correct: 1,
        explanation: "'Fast' means moving with speed, matching the meaning of 'quick.'"
      },
          {
        q: "What is a synonym for 'enormous'?",
        options: [
          "Tiny",
          "Huge",
          "Quiet",
          "Fast"
        ],
        correct: 1,
        explanation: "'Huge' means very large, matching the meaning of 'enormous.'"
      },
          {
        q: "What is a 'compound word'?",
        options: [
          "A word with a prefix",
          "Two words joined to form a new word",
          "A word with multiple syllables",
          "A word borrowed from another language"
        ],
        correct: 1,
        explanation: "A compound word is formed by joining two smaller words together, like 'sunflower' (sun + flower)."
      }
        ]
      }
    ]
  },
  {
    name: "Verb Forms & Spelling",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is the past tense of 'go'?",
        options: [
          "Goed",
          "Went",
          "Gone",
          "Going"
        ],
        correct: 1,
        explanation: "'Go' is an irregular verb — its simple past tense is 'went.' 'Gone' is the past participle, used with helping verbs like 'have.'"
      },
          {
        q: "What is the plural of 'cat'?",
        options: [
          "Cat",
          "Cats",
          "Cates",
          "Caties"
        ],
        correct: 1,
        explanation: "Most English nouns form their plural by simply adding -s, as in 'cat' becoming 'cats.'"
      },
          {
        q: "What is the plural of 'child'?",
        options: [
          "Childs",
          "Childes",
          "Children",
          "Childrens"
        ],
        correct: 2,
        explanation: "'Child' has an irregular plural form, 'children,' rather than adding -s or -es."
      }
        ,
          {
    type: "sentence-build",
    prompt: "Arrange the words to form a sentence with correct verb agreement:",
    words: ["homework", "her", "finished", "she"],
    correctOrder: ["she", "finished", "her", "homework"],
    explanation: "'She' (singular subject) pairs with 'finished' (past tense, no extra -s needed) — subject-verb agreement matters even in past tense."
  },
          {
    type: "speak-sentence",
    sentence: "They have been studying all afternoon.",
    explanation: "This uses the present perfect continuous tense (have been + verb-ing) — practice saying the full verb phrase together."
  }]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is the correct past participle of 'to write'?",
        options: [
          "Writed",
          "Wrote",
          "Written",
          "Writing"
        ],
        correct: 2,
        explanation: "'Write' is irregular: present 'write,' simple past 'wrote,' past participle 'written' (used with has/have/had)."
      },
          {
        q: "Which is the correct spelling?",
        options: [
          "Recieve",
          "Receive",
          "Both are correct",
          "Neither is correct"
        ],
        correct: 1,
        explanation: "The rule 'i before e except after c' applies here — since it follows 'c,' it's spelled 'receive.'"
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is the past tense of 'go'?",
        options: [
          "Goed",
          "Went",
          "Gone",
          "Going"
        ],
        correct: 1,
        explanation: "'Go' is an irregular verb — its simple past tense is 'went.' 'Gone' is the past participle, used with helping verbs like 'have.'"
      },
          {
        q: "What is the plural of 'cat'?",
        options: [
          "Cat",
          "Cats",
          "Cates",
          "Caties"
        ],
        correct: 1,
        explanation: "Most English nouns form their plural by simply adding -s, as in 'cat' becoming 'cats.'"
      },
          {
        q: "What is the plural of 'child'?",
        options: [
          "Childs",
          "Childes",
          "Children",
          "Childrens"
        ],
        correct: 2,
        explanation: "'Child' has an irregular plural form, 'children,' rather than adding -s or -es."
      },
          {
        q: "What is the correct past participle of 'to write'?",
        options: [
          "Writed",
          "Wrote",
          "Written",
          "Writing"
        ],
        correct: 2,
        explanation: "'Write' is irregular: present 'write,' simple past 'wrote,' past participle 'written' (used with has/have/had)."
      },
          {
        q: "Which is the correct spelling?",
        options: [
          "Recieve",
          "Receive",
          "Both are correct",
          "Neither is correct"
        ],
        correct: 1,
        explanation: "The rule 'i before e except after c' applies here — since it follows 'c,' it's spelled 'receive.'"
      }
        ,
          {
    type: "sentence-build",
    prompt: "Arrange the words to form a sentence with correct verb agreement:",
    words: ["homework", "her", "finished", "she"],
    correctOrder: ["she", "finished", "her", "homework"],
    explanation: "'She' (singular subject) pairs with 'finished' (past tense, no extra -s needed) — subject-verb agreement matters even in past tense."
  },
          {
    type: "speak-sentence",
    sentence: "They have been studying all afternoon.",
    explanation: "This uses the present perfect continuous tense (have been + verb-ing) — practice saying the full verb phrase together."
  }]
      }
    ]
  },
  {
    name: "Punctuation & Word Parts",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What punctuation mark ends a question?",
        options: [
          "Period",
          "Comma",
          "Question mark",
          "Exclamation mark"
        ],
        correct: 2,
        explanation: "A question mark (?) is used at the end of a sentence that asks something."
      },
          {
        q: "What does the suffix '-ful' typically mean when added to a word?",
        options: [
          "Without",
          "Full of or characterized by",
          "Before",
          "Again"
        ],
        correct: 1,
        explanation: "The suffix '-ful' means 'full of' or 'characterized by,' as in 'joyful' (full of joy)."
      },
          {
        q: "What does the prefix 'un-' typically mean?",
        options: [
          "Again",
          "Not or opposite of",
          "Before",
          "After"
        ],
        correct: 1,
        explanation: "The prefix 'un-' generally reverses or negates the root word's meaning, as in 'unhappy' (not happy)."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is the term for a word that sounds like another but differs in spelling and meaning?",
        options: [
          "Synonym",
          "Antonym",
          "Homophone",
          "Acronym"
        ],
        correct: 2,
        explanation: "Homophones sound alike but differ in spelling and meaning, like 'their' and 'there.'"
      },
          {
        q: "Which sentence is in the passive voice?",
        options: [
          "The chef cooked the meal.",
          "The meal was cooked by the chef.",
          "The chef is cooking the meal.",
          "The chef will cook the meal."
        ],
        correct: 1,
        explanation: "In passive voice, the subject receives the action rather than performing it — here 'the meal' receives the action of being cooked."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What punctuation mark ends a question?",
        options: [
          "Period",
          "Comma",
          "Question mark",
          "Exclamation mark"
        ],
        correct: 2,
        explanation: "A question mark (?) is used at the end of a sentence that asks something."
      },
          {
        q: "What does the suffix '-ful' typically mean when added to a word?",
        options: [
          "Without",
          "Full of or characterized by",
          "Before",
          "Again"
        ],
        correct: 1,
        explanation: "The suffix '-ful' means 'full of' or 'characterized by,' as in 'joyful' (full of joy)."
      },
          {
        q: "What does the prefix 'un-' typically mean?",
        options: [
          "Again",
          "Not or opposite of",
          "Before",
          "After"
        ],
        correct: 1,
        explanation: "The prefix 'un-' generally reverses or negates the root word's meaning, as in 'unhappy' (not happy)."
      },
          {
        q: "What is the term for a word that sounds like another but differs in spelling and meaning?",
        options: [
          "Synonym",
          "Antonym",
          "Homophone",
          "Acronym"
        ],
        correct: 2,
        explanation: "Homophones sound alike but differ in spelling and meaning, like 'their' and 'there.'"
      },
          {
        q: "Which sentence is in the passive voice?",
        options: [
          "The chef cooked the meal.",
          "The meal was cooked by the chef.",
          "The chef is cooking the meal.",
          "The chef will cook the meal."
        ],
        correct: 1,
        explanation: "In passive voice, the subject receives the action rather than performing it — here 'the meal' receives the action of being cooked."
      }
        ]
      }
    ]
  },
  {
    name: "Figures of Speech",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is a metaphor?",
        options: [
          "A comparison using 'like' or 'as'",
          "A direct comparison without using 'like' or 'as'",
          "A word that imitates a sound",
          "A repeated sound at the start of words"
        ],
        correct: 1,
        explanation: "A metaphor directly states that one thing IS another, without using 'like' or 'as' — that's what separates it from a simile."
      },
          {
        q: "Which sentence uses a simile?",
        options: [
          "He is as brave as a lion.",
          "He is a lion.",
          "The lion roared loudly.",
          "Lions live in prides."
        ],
        correct: 0,
        explanation: "A simile compares two things using 'like' or 'as' — here comparing bravery to a lion using 'as...as.'"
      },
          {
        q: "What literary device is used in 'The wind whispered through the trees'?",
        options: [
          "Simile",
          "Personification",
          "Alliteration",
          "Hyperbole"
        ],
        correct: 1,
        explanation: "Personification gives human qualities — like whispering — to non-human things, here the wind."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "Which of these is an example of hyperbole?",
        options: [
          "I'm so hungry I could eat a horse.",
          "The sky is blue.",
          "She walked to school.",
          "It rained yesterday."
        ],
        correct: 0,
        explanation: "Hyperbole is deliberate exaggeration for effect — no one can literally eat a horse, but it emphasizes how hungry the speaker is."
      },
          {
        q: "Which of these is an example of alliteration?",
        options: [
          "The big striped balloon floated away.",
          "The cat sat on the mat.",
          "She sells seashells.",
          "Time flies when you're having fun."
        ],
        correct: 2,
        explanation: "Alliteration is the repetition of initial consonant sounds in nearby words, as in 'she sells seashells' repeating the 's' sound."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is a metaphor?",
        options: [
          "A comparison using 'like' or 'as'",
          "A direct comparison without using 'like' or 'as'",
          "A word that imitates a sound",
          "A repeated sound at the start of words"
        ],
        correct: 1,
        explanation: "A metaphor directly states that one thing IS another, without using 'like' or 'as' — that's what separates it from a simile."
      },
          {
        q: "Which sentence uses a simile?",
        options: [
          "He is as brave as a lion.",
          "He is a lion.",
          "The lion roared loudly.",
          "Lions live in prides."
        ],
        correct: 0,
        explanation: "A simile compares two things using 'like' or 'as' — here comparing bravery to a lion using 'as...as.'"
      },
          {
        q: "What literary device is used in 'The wind whispered through the trees'?",
        options: [
          "Simile",
          "Personification",
          "Alliteration",
          "Hyperbole"
        ],
        correct: 1,
        explanation: "Personification gives human qualities — like whispering — to non-human things, here the wind."
      },
          {
        q: "Which of these is an example of hyperbole?",
        options: [
          "I'm so hungry I could eat a horse.",
          "The sky is blue.",
          "She walked to school.",
          "It rained yesterday."
        ],
        correct: 0,
        explanation: "Hyperbole is deliberate exaggeration for effect — no one can literally eat a horse, but it emphasizes how hungry the speaker is."
      },
          {
        q: "Which of these is an example of alliteration?",
        options: [
          "The big striped balloon floated away.",
          "The cat sat on the mat.",
          "She sells seashells.",
          "Time flies when you're having fun."
        ],
        correct: 2,
        explanation: "Alliteration is the repetition of initial consonant sounds in nearby words, as in 'she sells seashells' repeating the 's' sound."
      }
        ]
      }
    ]
  },
  {
    name: "Advanced Literary Devices",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is an oxymoron, as in the example 'jumbo shrimp'?",
        options: [
          "A word with two meanings",
          "A combination of contradictory terms",
          "A very long word",
          "A word borrowed from another language"
        ],
        correct: 1,
        explanation: "An oxymoron combines two contradictory or opposite terms for effect, like 'jumbo shrimp' or 'deafening silence.'"
      },
          {
        q: "What is 'juxtaposition' in writing?",
        options: [
          "Repeating a word for emphasis",
          "Placing two contrasting things close together for effect",
          "A type of rhyme scheme",
          "Exaggeration for effect"
        ],
        correct: 1,
        explanation: "Juxtaposition places two contrasting elements side by side to highlight their differences."
      },
          {
        q: "What does 'onomatopoeia' refer to?",
        options: [
          "Words that imitate sounds",
          "Repeated consonant sounds",
          "A comparison using 'like' or 'as'",
          "A word with multiple meanings"
        ],
        correct: 0,
        explanation: "Onomatopoeia describes words that phonetically imitate the sound they describe, like 'buzz' or 'clang.'"
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "Which of these is an example of (situational) irony?",
        options: [
          "A fire station burns down.",
          "A dog barks at night.",
          "Rain falls during a storm.",
          "A student studies for a test."
        ],
        correct: 0,
        explanation: "It's ironic because a fire station, meant to prevent fires, burning down directly contradicts what you'd expect."
      },
          {
        q: "What is the term for the perspective from which a story is told?",
        options: [
          "Tone",
          "Point of view",
          "Setting",
          "Theme"
        ],
        correct: 1,
        explanation: "Point of view refers to who is telling the story — first person, third person, and so on."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is an oxymoron, as in the example 'jumbo shrimp'?",
        options: [
          "A word with two meanings",
          "A combination of contradictory terms",
          "A very long word",
          "A word borrowed from another language"
        ],
        correct: 1,
        explanation: "An oxymoron combines two contradictory or opposite terms for effect, like 'jumbo shrimp' or 'deafening silence.'"
      },
          {
        q: "What is 'juxtaposition' in writing?",
        options: [
          "Repeating a word for emphasis",
          "Placing two contrasting things close together for effect",
          "A type of rhyme scheme",
          "Exaggeration for effect"
        ],
        correct: 1,
        explanation: "Juxtaposition places two contrasting elements side by side to highlight their differences."
      },
          {
        q: "What does 'onomatopoeia' refer to?",
        options: [
          "Words that imitate sounds",
          "Repeated consonant sounds",
          "A comparison using 'like' or 'as'",
          "A word with multiple meanings"
        ],
        correct: 0,
        explanation: "Onomatopoeia describes words that phonetically imitate the sound they describe, like 'buzz' or 'clang.'"
      },
          {
        q: "Which of these is an example of (situational) irony?",
        options: [
          "A fire station burns down.",
          "A dog barks at night.",
          "Rain falls during a storm.",
          "A student studies for a test."
        ],
        correct: 0,
        explanation: "It's ironic because a fire station, meant to prevent fires, burning down directly contradicts what you'd expect."
      },
          {
        q: "What is the term for the perspective from which a story is told?",
        options: [
          "Tone",
          "Point of view",
          "Setting",
          "Theme"
        ],
        correct: 1,
        explanation: "Point of view refers to who is telling the story — first person, third person, and so on."
      }
        ]
      }
    ]
  },
  {
    name: "Narrative & Character Analysis",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is a 'foil' character in literature?",
        options: [
          "The main character",
          "A character who contrasts with another to highlight their traits",
          "A narrator",
          "A minor character with no purpose"
        ],
        correct: 1,
        explanation: "A foil is a character whose traits contrast with another character, usually the protagonist, to highlight particular qualities by comparison."
      },
          {
        q: "What literary structure tells a story out of chronological order?",
        options: [
          "Flashback",
          "Foreshadowing",
          "Non-linear narrative",
          "Denouement"
        ],
        correct: 2,
        explanation: "A non-linear narrative tells events out of chronological order; a flashback is one specific technique often used within such a structure."
      },
          {
        q: "Which best defines an 'unreliable narrator'?",
        options: [
          "A narrator who speaks in first person",
          "A narrator whose credibility is compromised, making their account questionable",
          "A narrator who is a minor character",
          "A narrator who never speaks"
        ],
        correct: 1,
        explanation: "An unreliable narrator's credibility is compromised — through bias, limited knowledge, or dishonesty — requiring readers to question their account."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "Identify the adverb in this sentence: 'She sang beautifully.'",
        options: [
          "She",
          "sang",
          "beautifully",
          "There is no adverb"
        ],
        correct: 2,
        explanation: "'Beautifully' modifies the verb 'sang,' describing how she sang — that's the role of an adverb."
      },
          {
        q: "Who wrote 'Romeo and Juliet'?",
        options: [
          "Charles Dickens",
          "William Shakespeare",
          "Mark Twain",
          "Jane Austen"
        ],
        correct: 1,
        explanation: "William Shakespeare wrote this tragedy around 1594–96; it remains one of his most performed plays."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is a 'foil' character in literature?",
        options: [
          "The main character",
          "A character who contrasts with another to highlight their traits",
          "A narrator",
          "A minor character with no purpose"
        ],
        correct: 1,
        explanation: "A foil is a character whose traits contrast with another character, usually the protagonist, to highlight particular qualities by comparison."
      },
          {
        q: "What literary structure tells a story out of chronological order?",
        options: [
          "Flashback",
          "Foreshadowing",
          "Non-linear narrative",
          "Denouement"
        ],
        correct: 2,
        explanation: "A non-linear narrative tells events out of chronological order; a flashback is one specific technique often used within such a structure."
      },
          {
        q: "Which best defines an 'unreliable narrator'?",
        options: [
          "A narrator who speaks in first person",
          "A narrator whose credibility is compromised, making their account questionable",
          "A narrator who is a minor character",
          "A narrator who never speaks"
        ],
        correct: 1,
        explanation: "An unreliable narrator's credibility is compromised — through bias, limited knowledge, or dishonesty — requiring readers to question their account."
      },
          {
        q: "Identify the adverb in this sentence: 'She sang beautifully.'",
        options: [
          "She",
          "sang",
          "beautifully",
          "There is no adverb"
        ],
        correct: 2,
        explanation: "'Beautifully' modifies the verb 'sang,' describing how she sang — that's the role of an adverb."
      },
          {
        q: "Who wrote 'Romeo and Juliet'?",
        options: [
          "Charles Dickens",
          "William Shakespeare",
          "Mark Twain",
          "Jane Austen"
        ],
        correct: 1,
        explanation: "William Shakespeare wrote this tragedy around 1594–96; it remains one of his most performed plays."
      }
        ]
      }
    ]
  },
  {
    name: "Reading Comprehension Skills",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is the 'main idea' of a passage?",
        options: [
          "A minor detail",
          "The central point the author is making",
          "The first sentence only",
          "A direct quote"
        ],
        correct: 1,
        explanation: "The main idea is the central point or message an author is trying to convey in a passage."
      },
          {
        q: "What is an 'inference' in reading?",
        options: [
          "A fact stated directly in the text",
          "A conclusion drawn from clues in the text, not stated directly",
          "A summary of the text",
          "The title of the text"
        ],
        correct: 1,
        explanation: "An inference is a logical conclusion drawn from evidence and reasoning in the text, even when it isn't stated directly."
      },
          {
        q: "What is a 'thesis statement'?",
        options: [
          "A summary of a book",
          "The main argument or claim of an essay",
          "A type of poem",
          "A footnote"
        ],
        correct: 1,
        explanation: "A thesis statement presents the main argument or claim that an essay will support."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What does it mean to 'paraphrase' a text?",
        options: [
          "Copy it word for word",
          "Restate it in your own words",
          "Translate it into another language",
          "Summarize only the ending"
        ],
        correct: 1,
        explanation: "Paraphrasing means restating someone else's ideas in your own words while keeping the original meaning."
      },
          {
        q: "What is 'context' used for when reading an unfamiliar word?",
        options: [
          "Ignoring the word",
          "Using surrounding words and sentences to guess its meaning",
          "Looking only at the first letter",
          "Skipping to the dictionary immediately"
        ],
        correct: 1,
        explanation: "Context clues are the surrounding words and sentences that help a reader figure out the meaning of an unfamiliar word."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is the 'main idea' of a passage?",
        options: [
          "A minor detail",
          "The central point the author is making",
          "The first sentence only",
          "A direct quote"
        ],
        correct: 1,
        explanation: "The main idea is the central point or message an author is trying to convey in a passage."
      },
          {
        q: "What is an 'inference' in reading?",
        options: [
          "A fact stated directly in the text",
          "A conclusion drawn from clues in the text, not stated directly",
          "A summary of the text",
          "The title of the text"
        ],
        correct: 1,
        explanation: "An inference is a logical conclusion drawn from evidence and reasoning in the text, even when it isn't stated directly."
      },
          {
        q: "What is a 'thesis statement'?",
        options: [
          "A summary of a book",
          "The main argument or claim of an essay",
          "A type of poem",
          "A footnote"
        ],
        correct: 1,
        explanation: "A thesis statement presents the main argument or claim that an essay will support."
      },
          {
        q: "What does it mean to 'paraphrase' a text?",
        options: [
          "Copy it word for word",
          "Restate it in your own words",
          "Translate it into another language",
          "Summarize only the ending"
        ],
        correct: 1,
        explanation: "Paraphrasing means restating someone else's ideas in your own words while keeping the original meaning."
      },
          {
        q: "What is 'context' used for when reading an unfamiliar word?",
        options: [
          "Ignoring the word",
          "Using surrounding words and sentences to guess its meaning",
          "Looking only at the first letter",
          "Skipping to the dictionary immediately"
        ],
        correct: 1,
        explanation: "Context clues are the surrounding words and sentences that help a reader figure out the meaning of an unfamiliar word."
      }
        ]
      }
    ]
  },
  {
    name: "Writing Skills",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is the purpose of a topic sentence in a paragraph?",
        options: [
          "To end the paragraph",
          "To introduce the paragraph's main idea",
          "To provide a citation",
          "To ask a question"
        ],
        correct: 1,
        explanation: "A topic sentence introduces the main idea of a paragraph, usually appearing at or near the beginning."
      },
          {
        q: "What is 'active voice' in writing?",
        options: [
          "The subject performs the action",
          "The subject receives the action",
          "A sentence with no verb",
          "A question format"
        ],
        correct: 0,
        explanation: "In active voice, the subject of the sentence performs the action, as opposed to passive voice."
      },
          {
        q: "What is the purpose of an outline before writing an essay?",
        options: [
          "To make the essay longer",
          "To organize ideas and structure before drafting",
          "To replace the need for editing",
          "To count words"
        ],
        correct: 1,
        explanation: "An outline helps organize ideas and plan the structure of an essay before writing the full draft."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is a 'run-on sentence'?",
        options: [
          "A very short sentence",
          "Two or more independent clauses improperly joined without correct punctuation",
          "A sentence with no verb",
          "A sentence that asks a question"
        ],
        correct: 1,
        explanation: "A run-on sentence occurs when two or more independent clauses are joined without proper punctuation or conjunctions."
      },
          {
        q: "What does 'revising' a piece of writing mean?",
        options: [
          "Only fixing spelling errors",
          "Making bigger changes to content, organization, and clarity",
          "Printing the final copy",
          "Reading it out loud once"
        ],
        correct: 1,
        explanation: "Revising involves making substantive changes to content, organization, and clarity, beyond just fixing small errors."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is the purpose of a topic sentence in a paragraph?",
        options: [
          "To end the paragraph",
          "To introduce the paragraph's main idea",
          "To provide a citation",
          "To ask a question"
        ],
        correct: 1,
        explanation: "A topic sentence introduces the main idea of a paragraph, usually appearing at or near the beginning."
      },
          {
        q: "What is 'active voice' in writing?",
        options: [
          "The subject performs the action",
          "The subject receives the action",
          "A sentence with no verb",
          "A question format"
        ],
        correct: 0,
        explanation: "In active voice, the subject of the sentence performs the action, as opposed to passive voice."
      },
          {
        q: "What is the purpose of an outline before writing an essay?",
        options: [
          "To make the essay longer",
          "To organize ideas and structure before drafting",
          "To replace the need for editing",
          "To count words"
        ],
        correct: 1,
        explanation: "An outline helps organize ideas and plan the structure of an essay before writing the full draft."
      },
          {
        q: "What is a 'run-on sentence'?",
        options: [
          "A very short sentence",
          "Two or more independent clauses improperly joined without correct punctuation",
          "A sentence with no verb",
          "A sentence that asks a question"
        ],
        correct: 1,
        explanation: "A run-on sentence occurs when two or more independent clauses are joined without proper punctuation or conjunctions."
      },
          {
        q: "What does 'revising' a piece of writing mean?",
        options: [
          "Only fixing spelling errors",
          "Making bigger changes to content, organization, and clarity",
          "Printing the final copy",
          "Reading it out loud once"
        ],
        correct: 1,
        explanation: "Revising involves making substantive changes to content, organization, and clarity, beyond just fixing small errors."
      }
        ]
      }
    ]
  }

],
  "computer-science": [
  {
    name: "Computer Hardware & Basics",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What does CPU stand for?",
        options: [
          "Central Process Unit",
          "Central Processing Unit",
          "Computer Personal Unit",
          "Central Processor Utility"
        ],
        correct: 1,
        explanation: "The CPU is often called the computer's 'brain' — it carries out instructions from programs through calculations and logic operations."
      },
          {
        q: "Which of these is an example of computer hardware?",
        options: [
          "Operating system",
          "Keyboard",
          "Web browser",
          "Antivirus software"
        ],
        correct: 1,
        explanation: "Hardware refers to physical components of a computer, like a keyboard, monitor, or hard drive — unlike software, which is code."
      },
          {
        q: "What does 'GUI' stand for?",
        options: [
          "General User Input",
          "Graphical User Interface",
          "Global Utility Index",
          "Guided User Instructions"
        ],
        correct: 1,
        explanation: "A GUI (Graphical User Interface) lets users interact with a computer through visual elements like windows, icons, and buttons, instead of text commands."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is the term for unwanted software designed to harm a computer?",
        options: [
          "Firmware",
          "Malware",
          "Freeware",
          "Shareware"
        ],
        correct: 1,
        explanation: "Malware is malicious software designed to damage, disrupt, or gain unauthorized access to computer systems."
      },
          {
        q: "What does 'USB' commonly refer to?",
        options: [
          "A type of software",
          "A universal connector standard for devices",
          "A programming language",
          "A type of virus"
        ],
        correct: 1,
        explanation: "USB (Universal Serial Bus) is a common standard for connecting devices like keyboards, drives, and phones to a computer."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What does CPU stand for?",
        options: [
          "Central Process Unit",
          "Central Processing Unit",
          "Computer Personal Unit",
          "Central Processor Utility"
        ],
        correct: 1,
        explanation: "The CPU is often called the computer's 'brain' — it carries out instructions from programs through calculations and logic operations."
      },
          {
        q: "Which of these is an example of computer hardware?",
        options: [
          "Operating system",
          "Keyboard",
          "Web browser",
          "Antivirus software"
        ],
        correct: 1,
        explanation: "Hardware refers to physical components of a computer, like a keyboard, monitor, or hard drive — unlike software, which is code."
      },
          {
        q: "What does 'GUI' stand for?",
        options: [
          "General User Input",
          "Graphical User Interface",
          "Global Utility Index",
          "Guided User Instructions"
        ],
        correct: 1,
        explanation: "A GUI (Graphical User Interface) lets users interact with a computer through visual elements like windows, icons, and buttons, instead of text commands."
      },
          {
        q: "What is the term for unwanted software designed to harm a computer?",
        options: [
          "Firmware",
          "Malware",
          "Freeware",
          "Shareware"
        ],
        correct: 1,
        explanation: "Malware is malicious software designed to damage, disrupt, or gain unauthorized access to computer systems."
      },
          {
        q: "What does 'USB' commonly refer to?",
        options: [
          "A type of software",
          "A universal connector standard for devices",
          "A programming language",
          "A type of virus"
        ],
        correct: 1,
        explanation: "USB (Universal Serial Bus) is a common standard for connecting devices like keyboards, drives, and phones to a computer."
      }
        ]
      }
    ]
  },
  {
    name: "Internet & the Web",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What does 'www' stand for?",
        options: [
          "World Wide Web",
          "World Wide Wire",
          "Web Wide World",
          "Wide World Web"
        ],
        correct: 0,
        explanation: "The World Wide Web, invented by Tim Berners-Lee in 1989, is the system of linked pages accessed over the internet."
      },
          {
        q: "What does Wi-Fi allow devices to do?",
        options: [
          "Charge wirelessly",
          "Connect to a network without cables",
          "Print documents",
          "Store extra files"
        ],
        correct: 1,
        explanation: "Wi-Fi is a wireless networking technology that lets devices connect to the internet or a local network without physical cables."
      },
          {
        q: "What does 'HTML' stand for?",
        options: [
          "HyperText Markup Language",
          "High Tech Modern Language",
          "Hyperlink and Text Markup Language",
          "Home Tool Markup Language"
        ],
        correct: 0,
        explanation: "HTML (HyperText Markup Language) is the standard language used to structure content on web pages."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What does 'CSS' control on a webpage?",
        options: [
          "The page's logic and behavior",
          "The page's visual styling and layout",
          "The page's database",
          "The page's server location"
        ],
        correct: 1,
        explanation: "CSS (Cascading Style Sheets) controls how a webpage looks — colors, fonts, layout — separate from its content (HTML) or behavior (JavaScript)."
      },
          {
        q: "What does 'API' stand for?",
        options: [
          "Application Programming Interface",
          "Automated Program Instruction",
          "Applied Programming Index",
          "Active Protocol Interface"
        ],
        correct: 0,
        explanation: "An API (Application Programming Interface) defines how different software components communicate with each other."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What does 'www' stand for?",
        options: [
          "World Wide Web",
          "World Wide Wire",
          "Web Wide World",
          "Wide World Web"
        ],
        correct: 0,
        explanation: "The World Wide Web, invented by Tim Berners-Lee in 1989, is the system of linked pages accessed over the internet."
      },
          {
        q: "What does Wi-Fi allow devices to do?",
        options: [
          "Charge wirelessly",
          "Connect to a network without cables",
          "Print documents",
          "Store extra files"
        ],
        correct: 1,
        explanation: "Wi-Fi is a wireless networking technology that lets devices connect to the internet or a local network without physical cables."
      },
          {
        q: "What does 'HTML' stand for?",
        options: [
          "HyperText Markup Language",
          "High Tech Modern Language",
          "Hyperlink and Text Markup Language",
          "Home Tool Markup Language"
        ],
        correct: 0,
        explanation: "HTML (HyperText Markup Language) is the standard language used to structure content on web pages."
      },
          {
        q: "What does 'CSS' control on a webpage?",
        options: [
          "The page's logic and behavior",
          "The page's visual styling and layout",
          "The page's database",
          "The page's server location"
        ],
        correct: 1,
        explanation: "CSS (Cascading Style Sheets) controls how a webpage looks — colors, fonts, layout — separate from its content (HTML) or behavior (JavaScript)."
      },
          {
        q: "What does 'API' stand for?",
        options: [
          "Application Programming Interface",
          "Automated Program Instruction",
          "Applied Programming Index",
          "Active Protocol Interface"
        ],
        correct: 0,
        explanation: "An API (Application Programming Interface) defines how different software components communicate with each other."
      }
        ]
      }
    ]
  },
  {
    name: "Files, Software & Debugging Basics",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is the difference between a file and a folder?",
        options: [
          "There is no difference",
          "A file stores data; a folder organizes files",
          "A folder is smaller than a file",
          "A file can only hold text"
        ],
        correct: 1,
        explanation: "A file stores actual data (like a document or photo), while a folder is a container used to organize files."
      },
          {
        q: "What does 'save' typically do in most software?",
        options: [
          "Deletes a file",
          "Stores your current work to a file",
          "Prints a document",
          "Closes the program"
        ],
        correct: 1,
        explanation: "Saving writes your current work to storage (like a hard drive) so it isn't lost when the program closes."
      },
          {
        q: "What is a 'password manager' used for?",
        options: [
          "Deleting old passwords",
          "Securely storing and generating passwords",
          "Sharing passwords publicly",
          "Resetting a computer"
        ],
        correct: 1,
        explanation: "A password manager securely stores your passwords and can generate strong, unique ones for each account."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What does 'bug' mean in coding?",
        options: [
          "A useful feature",
          "An error in code",
          "A type of variable",
          "A security certificate"
        ],
        correct: 1,
        explanation: "The term dates back to early computing — a literal moth caused a malfunction in an early computer in 1947, and the name stuck."
      },
          {
        q: "What does 'debugging' mean?",
        options: [
          "Writing new code",
          "Finding and fixing errors in code",
          "Deleting a program",
          "Compiling code"
        ],
        correct: 1,
        explanation: "Debugging is the process of finding and correcting errors ('bugs') in a program's code."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is the difference between a file and a folder?",
        options: [
          "There is no difference",
          "A file stores data; a folder organizes files",
          "A folder is smaller than a file",
          "A file can only hold text"
        ],
        correct: 1,
        explanation: "A file stores actual data (like a document or photo), while a folder is a container used to organize files."
      },
          {
        q: "What does 'save' typically do in most software?",
        options: [
          "Deletes a file",
          "Stores your current work to a file",
          "Prints a document",
          "Closes the program"
        ],
        correct: 1,
        explanation: "Saving writes your current work to storage (like a hard drive) so it isn't lost when the program closes."
      },
          {
        q: "What is a 'password manager' used for?",
        options: [
          "Deleting old passwords",
          "Securely storing and generating passwords",
          "Sharing passwords publicly",
          "Resetting a computer"
        ],
        correct: 1,
        explanation: "A password manager securely stores your passwords and can generate strong, unique ones for each account."
      },
          {
        q: "What does 'bug' mean in coding?",
        options: [
          "A useful feature",
          "An error in code",
          "A type of variable",
          "A security certificate"
        ],
        correct: 1,
        explanation: "The term dates back to early computing — a literal moth caused a malfunction in an early computer in 1947, and the name stuck."
      },
          {
        q: "What does 'debugging' mean?",
        options: [
          "Writing new code",
          "Finding and fixing errors in code",
          "Deleting a program",
          "Compiling code"
        ],
        correct: 1,
        explanation: "Debugging is the process of finding and correcting errors ('bugs') in a program's code."
      }
        ]
      }
    ]
  },
  {
    name: "Programming Fundamentals",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "Which of these is a programming language?",
        options: [
          "HTML",
          "Python",
          "HTTP",
          "USB"
        ],
        correct: 1,
        explanation: "Python is a general-purpose programming language. HTML is a markup language, and HTTP/USB are protocols and standards, not languages."
      },
          {
        q: "What is a 'variable' in programming?",
        options: [
          "A fixed value that never changes",
          "A named storage location for data that can change",
          "A type of loop",
          "A programming language"
        ],
        correct: 1,
        explanation: "A variable is a named container used to store data that can be changed while a program runs."
      },
          {
        q: "What is a 'boolean' data type?",
        options: [
          "A type that stores only text",
          "A type that stores only true or false",
          "A type that stores decimals",
          "A type that stores lists"
        ],
        correct: 1,
        explanation: "A boolean is a data type that holds one of exactly two values: true or false."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is the purpose of a 'for loop' in programming?",
        options: [
          "To store data",
          "To repeat a block of code a set number of times",
          "To define a function",
          "To connect to the internet"
        ],
        correct: 1,
        explanation: "A for loop lets a program repeat a set of instructions a specific number of times without rewriting the code."
      },
          {
        q: "What is the purpose of a 'function' in programming?",
        options: [
          "To store a single value",
          "To group reusable code that performs a task",
          "To connect to the internet",
          "To style a webpage"
        ],
        correct: 1,
        explanation: "A function groups a block of reusable code that performs a specific task, which can be called whenever that task is needed."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "Which of these is a programming language?",
        options: [
          "HTML",
          "Python",
          "HTTP",
          "USB"
        ],
        correct: 1,
        explanation: "Python is a general-purpose programming language. HTML is a markup language, and HTTP/USB are protocols and standards, not languages."
      },
          {
        q: "What is a 'variable' in programming?",
        options: [
          "A fixed value that never changes",
          "A named storage location for data that can change",
          "A type of loop",
          "A programming language"
        ],
        correct: 1,
        explanation: "A variable is a named container used to store data that can be changed while a program runs."
      },
          {
        q: "What is a 'boolean' data type?",
        options: [
          "A type that stores only text",
          "A type that stores only true or false",
          "A type that stores decimals",
          "A type that stores lists"
        ],
        correct: 1,
        explanation: "A boolean is a data type that holds one of exactly two values: true or false."
      },
          {
        q: "What is the purpose of a 'for loop' in programming?",
        options: [
          "To store data",
          "To repeat a block of code a set number of times",
          "To define a function",
          "To connect to the internet"
        ],
        correct: 1,
        explanation: "A for loop lets a program repeat a set of instructions a specific number of times without rewriting the code."
      },
          {
        q: "What is the purpose of a 'function' in programming?",
        options: [
          "To store a single value",
          "To group reusable code that performs a task",
          "To connect to the internet",
          "To style a webpage"
        ],
        correct: 1,
        explanation: "A function groups a block of reusable code that performs a specific task, which can be called whenever that task is needed."
      }
        ]
      }
    ]
  },
  {
    name: "Code Syntax & Development Tools",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What symbol commonly starts a comment in Python?",
        options: [
          "//",
          "#",
          "<!--",
          "/*"
        ],
        correct: 1,
        explanation: "In Python, the '#' symbol marks the rest of a line as a comment, which is ignored when the code runs."
      },
          {
        q: "What does 'IDE' stand for in programming?",
        options: [
          "Integrated Development Environment",
          "Internal Data Exchange",
          "Interface Design Element",
          "Instructional Data Engine"
        ],
        correct: 0,
        explanation: "An IDE is software that bundles tools like a code editor, debugger, and compiler to make programming easier."
      },
          {
        q: "What does 'debugging with print statements' typically involve?",
        options: [
          "Printing a document",
          "Adding temporary output to see a program's values while it runs",
          "Deleting broken code",
          "Compiling faster"
        ],
        correct: 1,
        explanation: "Adding print statements at key points lets a programmer see the values of variables while the program runs, helping track down bugs."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What two digits does binary code use?",
        options: [
          "0 and 1",
          "A and B",
          "1 and 2",
          "X and Y"
        ],
        correct: 0,
        explanation: "Computers store and process information using binary — just two digits, 0 and 1, representing off/on electrical states."
      },
          {
        q: "What does RAM stand for?",
        options: [
          "Random Access Memory",
          "Read Access Memory",
          "Rapid Access Memory",
          "Random Allocation Memory"
        ],
        correct: 0,
        explanation: "RAM (Random Access Memory) is temporary memory a computer uses to store data it's actively working with."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What symbol commonly starts a comment in Python?",
        options: [
          "//",
          "#",
          "<!--",
          "/*"
        ],
        correct: 1,
        explanation: "In Python, the '#' symbol marks the rest of a line as a comment, which is ignored when the code runs."
      },
          {
        q: "What does 'IDE' stand for in programming?",
        options: [
          "Integrated Development Environment",
          "Internal Data Exchange",
          "Interface Design Element",
          "Instructional Data Engine"
        ],
        correct: 0,
        explanation: "An IDE is software that bundles tools like a code editor, debugger, and compiler to make programming easier."
      },
          {
        q: "What does 'debugging with print statements' typically involve?",
        options: [
          "Printing a document",
          "Adding temporary output to see a program's values while it runs",
          "Deleting broken code",
          "Compiling faster"
        ],
        correct: 1,
        explanation: "Adding print statements at key points lets a programmer see the values of variables while the program runs, helping track down bugs."
      },
          {
        q: "What two digits does binary code use?",
        options: [
          "0 and 1",
          "A and B",
          "1 and 2",
          "X and Y"
        ],
        correct: 0,
        explanation: "Computers store and process information using binary — just two digits, 0 and 1, representing off/on electrical states."
      },
          {
        q: "What does RAM stand for?",
        options: [
          "Random Access Memory",
          "Read Access Memory",
          "Rapid Access Memory",
          "Random Allocation Memory"
        ],
        correct: 0,
        explanation: "RAM (Random Access Memory) is temporary memory a computer uses to store data it's actively working with."
      }
        ]
      }
    ]
  },
  {
    name: "Data Structures",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What data structure works on a 'First In, First Out' basis?",
        options: [
          "Stack",
          "Queue",
          "Array",
          "Tree"
        ],
        correct: 1,
        explanation: "A queue processes items in the order they arrive — first in, first out — like a line of people waiting."
      },
          {
        q: "What is the main difference between a stack and a queue?",
        options: [
          "Stacks are FIFO, queues are LIFO",
          "Stacks are LIFO, queues are FIFO",
          "They are the same thing",
          "Stacks only store numbers"
        ],
        correct: 1,
        explanation: "A stack is Last In, First Out (like a stack of plates), while a queue is First In, First Out (like a line)."
      },
          {
        q: "What is the main advantage of a 'linked list' over an array?",
        options: [
          "Faster random access",
          "Easier resizing and insertion/removal",
          "Always uses less memory",
          "Can only store numbers"
        ],
        correct: 1,
        explanation: "Linked lists can grow or shrink easily and allow efficient insertion/removal at any point, unlike arrays, which have fixed sizes and costly middle insertions."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is a 'hash table' primarily used for?",
        options: [
          "Storing images",
          "Fast data lookup using key-value pairs",
          "Rendering graphics",
          "Managing network connections"
        ],
        correct: 1,
        explanation: "A hash table stores data as key-value pairs and uses a hash function to enable very fast lookups, insertions, and deletions."
      },
          {
        q: "What does 'normalization' mean in database design?",
        options: [
          "Making all data uppercase",
          "Organizing data to reduce redundancy and improve integrity",
          "Encrypting sensitive data",
          "Compressing a database file"
        ],
        correct: 1,
        explanation: "Normalization organizes database tables to reduce data redundancy and improve data integrity, typically by splitting data into related tables."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What data structure works on a 'First In, First Out' basis?",
        options: [
          "Stack",
          "Queue",
          "Array",
          "Tree"
        ],
        correct: 1,
        explanation: "A queue processes items in the order they arrive — first in, first out — like a line of people waiting."
      },
          {
        q: "What is the main difference between a stack and a queue?",
        options: [
          "Stacks are FIFO, queues are LIFO",
          "Stacks are LIFO, queues are FIFO",
          "They are the same thing",
          "Stacks only store numbers"
        ],
        correct: 1,
        explanation: "A stack is Last In, First Out (like a stack of plates), while a queue is First In, First Out (like a line)."
      },
          {
        q: "What is the main advantage of a 'linked list' over an array?",
        options: [
          "Faster random access",
          "Easier resizing and insertion/removal",
          "Always uses less memory",
          "Can only store numbers"
        ],
        correct: 1,
        explanation: "Linked lists can grow or shrink easily and allow efficient insertion/removal at any point, unlike arrays, which have fixed sizes and costly middle insertions."
      },
          {
        q: "What is a 'hash table' primarily used for?",
        options: [
          "Storing images",
          "Fast data lookup using key-value pairs",
          "Rendering graphics",
          "Managing network connections"
        ],
        correct: 1,
        explanation: "A hash table stores data as key-value pairs and uses a hash function to enable very fast lookups, insertions, and deletions."
      },
          {
        q: "What does 'normalization' mean in database design?",
        options: [
          "Making all data uppercase",
          "Organizing data to reduce redundancy and improve integrity",
          "Encrypting sensitive data",
          "Compressing a database file"
        ],
        correct: 1,
        explanation: "Normalization organizes database tables to reduce data redundancy and improve data integrity, typically by splitting data into related tables."
      }
        ]
      }
    ]
  },
  {
    name: "Algorithms & Efficiency",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is an algorithm?",
        options: [
          "A type of computer",
          "A set of steps to solve a problem",
          "A programming language",
          "A type of virus"
        ],
        correct: 1,
        explanation: "An algorithm is a precise, step-by-step procedure or set of rules designed to solve a problem or complete a task."
      },
          {
        q: "What is the time complexity of binary search on a sorted array?",
        options: [
          "O(1)",
          "O(n)",
          "O(log n)",
          "O(n²)"
        ],
        correct: 2,
        explanation: "Binary search repeatedly halves the search space, giving it logarithmic time complexity, O(log n)."
      },
          {
        q: "What is 'Big O notation' used to describe?",
        options: [
          "The size of a hard drive",
          "How an algorithm's runtime or space grows with input size",
          "The number of bugs in a program",
          "The version of a programming language"
        ],
        correct: 1,
        explanation: "Big O notation describes how an algorithm's time or space requirements scale as the input size grows, used to compare efficiency."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What does O(n log n) typically describe?",
        options: [
          "A very slow algorithm",
          "An efficient sorting algorithm's typical performance",
          "A constant-time operation",
          "An algorithm that never finishes"
        ],
        correct: 1,
        explanation: "O(n log n) describes the time complexity of efficient sorting algorithms like merge sort and quicksort — much faster than O(n²) for large inputs."
      },
          {
        q: "What does 'recursion' mean in programming?",
        options: [
          "A loop that never ends",
          "A function that calls itself",
          "A type of variable",
          "A way to sort data"
        ],
        correct: 1,
        explanation: "Recursion is when a function calls itself to solve smaller instances of the same problem, typically with a base case to stop."
      },
          {
        type: "grid-logic",
        q: "Which lights are ON?",
        clues: [
          "In each row, yellow and purple lights don't match.",
          "Exactly six lights are on."
        ],
        rows: ["A", "B", "C"],
        columns: [
          { name: "Red", color: "#E8534A" },
          { name: "Yellow", color: "#E8B923" },
          { name: "Purple", color: "#8B5CF6" }
        ],
        correctGrid: [
          [true, false, true],
          [true, true, false],
          [true, false, true]
        ],
        explanation: "Logic puzzles like this are exactly the kind of step-by-step deduction an algorithm automates — the same 'if this, then that' rules programmers write into code. Working through the clues by hand first makes it much easier to see why an algorithm can solve it too."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is an algorithm?",
        options: [
          "A type of computer",
          "A set of steps to solve a problem",
          "A programming language",
          "A type of virus"
        ],
        correct: 1,
        explanation: "An algorithm is a precise, step-by-step procedure or set of rules designed to solve a problem or complete a task."
      },
          {
        q: "What is the time complexity of binary search on a sorted array?",
        options: [
          "O(1)",
          "O(n)",
          "O(log n)",
          "O(n²)"
        ],
        correct: 2,
        explanation: "Binary search repeatedly halves the search space, giving it logarithmic time complexity, O(log n)."
      },
          {
        q: "What is 'Big O notation' used to describe?",
        options: [
          "The size of a hard drive",
          "How an algorithm's runtime or space grows with input size",
          "The number of bugs in a program",
          "The version of a programming language"
        ],
        correct: 1,
        explanation: "Big O notation describes how an algorithm's time or space requirements scale as the input size grows, used to compare efficiency."
      },
          {
        q: "What does O(n log n) typically describe?",
        options: [
          "A very slow algorithm",
          "An efficient sorting algorithm's typical performance",
          "A constant-time operation",
          "An algorithm that never finishes"
        ],
        correct: 1,
        explanation: "O(n log n) describes the time complexity of efficient sorting algorithms like merge sort and quicksort — much faster than O(n²) for large inputs."
      },
          {
        q: "What does 'recursion' mean in programming?",
        options: [
          "A loop that never ends",
          "A function that calls itself",
          "A type of variable",
          "A way to sort data"
        ],
        correct: 1,
        explanation: "Recursion is when a function calls itself to solve smaller instances of the same problem, typically with a base case to stop."
      },
          {
        type: "grid-logic",
        q: "Which lights are ON?",
        clues: [
          "In each row, yellow and purple lights don't match.",
          "Exactly six lights are on."
        ],
        rows: ["A", "B", "C"],
        columns: [
          { name: "Red", color: "#E8534A" },
          { name: "Yellow", color: "#E8B923" },
          { name: "Purple", color: "#8B5CF6" }
        ],
        correctGrid: [
          [true, false, true],
          [true, true, false],
          [true, false, true]
        ],
        explanation: "Logic puzzles like this are exactly the kind of step-by-step deduction an algorithm automates — the same 'if this, then that' rules programmers write into code. Working through the clues by hand first makes it much easier to see why an algorithm can solve it too."
      }
        ]
      }
    ]
  },
  {
    name: "Advanced Computing Concepts",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What does SQL primarily do?",
        options: [
          "Manage and query relational databases",
          "Test software quality",
          "Store and sort arrays",
          "Handle network protocols"
        ],
        correct: 0,
        explanation: "SQL (Structured Query Language) is used to create, read, update, and manage data in relational databases."
      },
          {
        q: "What does 'object-oriented programming' organize code around?",
        options: [
          "Functions only",
          "Objects that combine data and behavior",
          "Random values",
          "Hardware instructions"
        ],
        correct: 1,
        explanation: "Object-oriented programming (OOP) structures code around 'objects' that bundle related data (properties) and behavior (methods) together."
      },
          {
        q: "What does 'encryption' do to data?",
        options: [
          "Deletes it permanently",
          "Converts it into a coded form to protect it",
          "Compresses it to save space",
          "Duplicates it for backup"
        ],
        correct: 1,
        explanation: "Encryption transforms readable data into a coded format that can only be read again with the correct decryption key, protecting it from unauthorized access."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is a 'race condition' in programming?",
        options: [
          "A performance benchmark",
          "An error caused by unpredictable timing between concurrent processes",
          "A type of infinite loop",
          "A syntax error"
        ],
        correct: 1,
        explanation: "A race condition occurs when a program's outcome depends on the unpredictable timing of concurrent operations, often causing bugs that are hard to reproduce."
      },
          {
        q: "What is the purpose of a 'cache' in computing?",
        options: [
          "Permanent long-term storage",
          "Temporary fast-access storage for frequently used data",
          "A backup system",
          "A type of firewall"
        ],
        correct: 1,
        explanation: "A cache stores frequently accessed data in fast-access memory to reduce the time needed to fetch it repeatedly from slower storage."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What does SQL primarily do?",
        options: [
          "Manage and query relational databases",
          "Test software quality",
          "Store and sort arrays",
          "Handle network protocols"
        ],
        correct: 0,
        explanation: "SQL (Structured Query Language) is used to create, read, update, and manage data in relational databases."
      },
          {
        q: "What does 'object-oriented programming' organize code around?",
        options: [
          "Functions only",
          "Objects that combine data and behavior",
          "Random values",
          "Hardware instructions"
        ],
        correct: 1,
        explanation: "Object-oriented programming (OOP) structures code around 'objects' that bundle related data (properties) and behavior (methods) together."
      },
          {
        q: "What does 'encryption' do to data?",
        options: [
          "Deletes it permanently",
          "Converts it into a coded form to protect it",
          "Compresses it to save space",
          "Duplicates it for backup"
        ],
        correct: 1,
        explanation: "Encryption transforms readable data into a coded format that can only be read again with the correct decryption key, protecting it from unauthorized access."
      },
          {
        q: "What is a 'race condition' in programming?",
        options: [
          "A performance benchmark",
          "An error caused by unpredictable timing between concurrent processes",
          "A type of infinite loop",
          "A syntax error"
        ],
        correct: 1,
        explanation: "A race condition occurs when a program's outcome depends on the unpredictable timing of concurrent operations, often causing bugs that are hard to reproduce."
      },
          {
        q: "What is the purpose of a 'cache' in computing?",
        options: [
          "Permanent long-term storage",
          "Temporary fast-access storage for frequently used data",
          "A backup system",
          "A type of firewall"
        ],
        correct: 1,
        explanation: "A cache stores frequently accessed data in fast-access memory to reduce the time needed to fetch it repeatedly from slower storage."
      }
        ]
      }
    ]
  },
  {
    name: "Internet Safety & Digital Citizenship",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is 'phishing'?",
        options: [
          "A type of computer virus",
          "A scam that tricks people into revealing personal information",
          "A method of encrypting data",
          "A programming technique"
        ],
        correct: 1,
        explanation: "Phishing is a scam where attackers impersonate legitimate sources to trick people into revealing sensitive information like passwords."
      },
          {
        q: "What does 'https' at the start of a web address indicate?",
        options: [
          "The site is hosted in the US",
          "The connection to the site is encrypted and more secure",
          "The site is free to use",
          "The site was recently updated"
        ],
        correct: 1,
        explanation: "The 's' in HTTPS stands for 'secure,' meaning data sent between your browser and the site is encrypted."
      },
          {
        q: "What is a 'firewall' used for in computing?",
        options: [
          "Cooling down a computer",
          "Monitoring and controlling network traffic for security",
          "Speeding up internet connection",
          "Storing backup files"
        ],
        correct: 1,
        explanation: "A firewall monitors and filters incoming and outgoing network traffic to protect a system from unauthorized access."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "Why is it recommended to use different passwords for different accounts?",
        options: [
          "It's required by law",
          "So a breach of one account doesn't compromise all your accounts",
          "It makes passwords easier to remember",
          "It's not actually recommended"
        ],
        correct: 1,
        explanation: "Using unique passwords limits the damage if one account is compromised, since attackers can't reuse it elsewhere."
      },
          {
        q: "What is 'two-factor authentication'?",
        options: [
          "Using two different browsers",
          "Requiring a second form of verification beyond just a password",
          "Having two email accounts",
          "A type of encryption algorithm"
        ],
        correct: 1,
        explanation: "Two-factor authentication requires a second verification step (like a code sent to your phone) in addition to your password."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is 'phishing'?",
        options: [
          "A type of computer virus",
          "A scam that tricks people into revealing personal information",
          "A method of encrypting data",
          "A programming technique"
        ],
        correct: 1,
        explanation: "Phishing is a scam where attackers impersonate legitimate sources to trick people into revealing sensitive information like passwords."
      },
          {
        q: "What does 'https' at the start of a web address indicate?",
        options: [
          "The site is hosted in the US",
          "The connection to the site is encrypted and more secure",
          "The site is free to use",
          "The site was recently updated"
        ],
        correct: 1,
        explanation: "The 's' in HTTPS stands for 'secure,' meaning data sent between your browser and the site is encrypted."
      },
          {
        q: "What is a 'firewall' used for in computing?",
        options: [
          "Cooling down a computer",
          "Monitoring and controlling network traffic for security",
          "Speeding up internet connection",
          "Storing backup files"
        ],
        correct: 1,
        explanation: "A firewall monitors and filters incoming and outgoing network traffic to protect a system from unauthorized access."
      },
          {
        q: "Why is it recommended to use different passwords for different accounts?",
        options: [
          "It's required by law",
          "So a breach of one account doesn't compromise all your accounts",
          "It makes passwords easier to remember",
          "It's not actually recommended"
        ],
        correct: 1,
        explanation: "Using unique passwords limits the damage if one account is compromised, since attackers can't reuse it elsewhere."
      },
          {
        q: "What is 'two-factor authentication'?",
        options: [
          "Using two different browsers",
          "Requiring a second form of verification beyond just a password",
          "Having two email accounts",
          "A type of encryption algorithm"
        ],
        correct: 1,
        explanation: "Two-factor authentication requires a second verification step (like a code sent to your phone) in addition to your password."
      }
        ]
      }
    ]
  },
  {
    name: "How the Internet Works",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is an 'IP address'?",
        options: [
          "A type of file extension",
          "A unique numerical identifier for a device on a network",
          "A programming language",
          "A type of malware"
        ],
        correct: 1,
        explanation: "An IP address is a unique numerical label assigned to each device on a network, used to identify and locate it."
      },
          {
        q: "What does 'DNS' do?",
        options: [
          "Encrypts internet traffic",
          "Translates domain names into IP addresses",
          "Compresses web pages",
          "Blocks pop-up ads"
        ],
        correct: 1,
        explanation: "DNS (Domain Name System) translates human-readable domain names into the numerical IP addresses computers use."
      },
          {
        q: "What is 'bandwidth' in networking?",
        options: [
          "The physical width of a cable",
          "The maximum amount of data that can be transferred over a connection in a given time",
          "A type of virus",
          "The number of devices on a network"
        ],
        correct: 1,
        explanation: "Bandwidth measures the maximum rate of data transfer across a network connection."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is 'cloud storage'?",
        options: [
          "Storing data on your local hard drive only",
          "Storing data on remote servers accessed via the internet",
          "A type of computer virus",
          "A programming framework"
        ],
        correct: 1,
        explanation: "Cloud storage saves data on remote servers accessible over the internet, rather than only on a local device."
      },
          {
        q: "What is a 'server' in computing?",
        options: [
          "A type of keyboard",
          "A computer or system that provides resources or services to other computers",
          "A programming language",
          "A type of virus"
        ],
        correct: 1,
        explanation: "A server is a computer or system that provides data, resources, or services to other computers (clients) over a network."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is an 'IP address'?",
        options: [
          "A type of file extension",
          "A unique numerical identifier for a device on a network",
          "A programming language",
          "A type of malware"
        ],
        correct: 1,
        explanation: "An IP address is a unique numerical label assigned to each device on a network, used to identify and locate it."
      },
          {
        q: "What does 'DNS' do?",
        options: [
          "Encrypts internet traffic",
          "Translates domain names into IP addresses",
          "Compresses web pages",
          "Blocks pop-up ads"
        ],
        correct: 1,
        explanation: "DNS (Domain Name System) translates human-readable domain names into the numerical IP addresses computers use."
      },
          {
        q: "What is 'bandwidth' in networking?",
        options: [
          "The physical width of a cable",
          "The maximum amount of data that can be transferred over a connection in a given time",
          "A type of virus",
          "The number of devices on a network"
        ],
        correct: 1,
        explanation: "Bandwidth measures the maximum rate of data transfer across a network connection."
      },
          {
        q: "What is 'cloud storage'?",
        options: [
          "Storing data on your local hard drive only",
          "Storing data on remote servers accessed via the internet",
          "A type of computer virus",
          "A programming framework"
        ],
        correct: 1,
        explanation: "Cloud storage saves data on remote servers accessible over the internet, rather than only on a local device."
      },
          {
        q: "What is a 'server' in computing?",
        options: [
          "A type of keyboard",
          "A computer or system that provides resources or services to other computers",
          "A programming language",
          "A type of virus"
        ],
        correct: 1,
        explanation: "A server is a computer or system that provides data, resources, or services to other computers (clients) over a network."
      }
        ]
      }
    ]
  }

],
  economics: [
  {
    name: "Fundamentals of Economics",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What does 'supply and demand' describe?",
        options: [
          "Government spending",
          "The relationship between price and availability of goods",
          "Bank interest rates",
          "Stock market trends"
        ],
        correct: 1,
        explanation: "Supply and demand describes how the availability of a good and how much people want it interact to determine its market price."
      },
          {
        q: "What is opportunity cost?",
        options: [
          "The cost of borrowing money",
          "The value of the next best alternative given up",
          "The tax on goods",
          "The interest earned on savings"
        ],
        correct: 1,
        explanation: "Opportunity cost is the value of the best alternative you give up when you make a choice — a core idea behind every trade-off."
      },
          {
        q: "What does 'scarcity' mean in economics?",
        options: [
          "Unlimited resources",
          "Limited resources relative to unlimited wants",
          "A type of currency",
          "A government policy"
        ],
        correct: 1,
        explanation: "Scarcity is the basic economic problem: resources are limited while human wants are essentially unlimited, forcing choices about allocation."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is a 'market economy'?",
        options: [
          "Government controls all production",
          "Prices are set by supply and demand",
          "No trade is allowed",
          "Prices are fixed by law"
        ],
        correct: 1,
        explanation: "In a market economy, prices aren't set by the government — they emerge from the interaction of buyers and sellers."
      },
          {
        q: "What is money primarily used for in an economy?",
        options: [
          "Only for saving",
          "A medium of exchange for goods and services",
          "Only for taxes",
          "A type of resource"
        ],
        correct: 1,
        explanation: "Money serves as a medium of exchange, making it easier to trade goods and services compared to bartering."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What does 'supply and demand' describe?",
        options: [
          "Government spending",
          "The relationship between price and availability of goods",
          "Bank interest rates",
          "Stock market trends"
        ],
        correct: 1,
        explanation: "Supply and demand describes how the availability of a good and how much people want it interact to determine its market price."
      },
          {
        q: "What is opportunity cost?",
        options: [
          "The cost of borrowing money",
          "The value of the next best alternative given up",
          "The tax on goods",
          "The interest earned on savings"
        ],
        correct: 1,
        explanation: "Opportunity cost is the value of the best alternative you give up when you make a choice — a core idea behind every trade-off."
      },
          {
        q: "What does 'scarcity' mean in economics?",
        options: [
          "Unlimited resources",
          "Limited resources relative to unlimited wants",
          "A type of currency",
          "A government policy"
        ],
        correct: 1,
        explanation: "Scarcity is the basic economic problem: resources are limited while human wants are essentially unlimited, forcing choices about allocation."
      },
          {
        q: "What is a 'market economy'?",
        options: [
          "Government controls all production",
          "Prices are set by supply and demand",
          "No trade is allowed",
          "Prices are fixed by law"
        ],
        correct: 1,
        explanation: "In a market economy, prices aren't set by the government — they emerge from the interaction of buyers and sellers."
      },
          {
        q: "What is money primarily used for in an economy?",
        options: [
          "Only for saving",
          "A medium of exchange for goods and services",
          "Only for taxes",
          "A type of resource"
        ],
        correct: 1,
        explanation: "Money serves as a medium of exchange, making it easier to trade goods and services compared to bartering."
      }
        ]
      }
    ]
  },
  {
    name: "Personal & Business Economics",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is a 'budget'?",
        options: [
          "A type of tax",
          "A plan for how to spend and save money",
          "A bank account",
          "A type of loan"
        ],
        correct: 1,
        explanation: "A budget is a plan that outlines expected income and expenses over a period of time."
      },
          {
        q: "What does 'interest rate' refer to when borrowing money?",
        options: [
          "The total amount borrowed",
          "The cost of borrowing money, expressed as a percentage",
          "A type of tax on income",
          "The value of a currency"
        ],
        correct: 1,
        explanation: "An interest rate is the percentage charged by a lender for the use of borrowed money, on top of the amount borrowed."
      },
          {
        q: "What does 'profit' mean in business?",
        options: [
          "Total sales revenue",
          "The money left after subtracting costs from revenue",
          "The cost of raw materials",
          "A type of tax"
        ],
        correct: 1,
        explanation: "Profit is what remains after a business subtracts its costs (expenses) from its total revenue (sales)."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is 'barter'?",
        options: [
          "Trading goods or services directly without money",
          "A type of currency",
          "A government subsidy",
          "A stock market transaction"
        ],
        correct: 0,
        explanation: "Barter is the direct exchange of goods or services between parties without using money."
      },
          {
        q: "What does 'export' mean in trade?",
        options: [
          "Buying goods from another country",
          "Selling goods to another country",
          "Storing goods domestically",
          "Destroying unsold goods"
        ],
        correct: 1,
        explanation: "Exporting means selling goods or services produced in one country to buyers in another country."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is a 'budget'?",
        options: [
          "A type of tax",
          "A plan for how to spend and save money",
          "A bank account",
          "A type of loan"
        ],
        correct: 1,
        explanation: "A budget is a plan that outlines expected income and expenses over a period of time."
      },
          {
        q: "What does 'interest rate' refer to when borrowing money?",
        options: [
          "The total amount borrowed",
          "The cost of borrowing money, expressed as a percentage",
          "A type of tax on income",
          "The value of a currency"
        ],
        correct: 1,
        explanation: "An interest rate is the percentage charged by a lender for the use of borrowed money, on top of the amount borrowed."
      },
          {
        q: "What does 'profit' mean in business?",
        options: [
          "Total sales revenue",
          "The money left after subtracting costs from revenue",
          "The cost of raw materials",
          "A type of tax"
        ],
        correct: 1,
        explanation: "Profit is what remains after a business subtracts its costs (expenses) from its total revenue (sales)."
      },
          {
        q: "What is 'barter'?",
        options: [
          "Trading goods or services directly without money",
          "A type of currency",
          "A government subsidy",
          "A stock market transaction"
        ],
        correct: 0,
        explanation: "Barter is the direct exchange of goods or services between parties without using money."
      },
          {
        q: "What does 'export' mean in trade?",
        options: [
          "Buying goods from another country",
          "Selling goods to another country",
          "Storing goods domestically",
          "Destroying unsold goods"
        ],
        correct: 1,
        explanation: "Exporting means selling goods or services produced in one country to buyers in another country."
      }
        ]
      }
    ]
  },
  {
    name: "Market Participants",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is a 'consumer'?",
        options: [
          "A person who produces goods",
          "A person or business that buys goods and services",
          "A government agency",
          "A bank"
        ],
        correct: 1,
        explanation: "A consumer is an individual or entity that purchases goods and services for personal use."
      },
          {
        q: "What is a 'producer' in economics?",
        options: [
          "A person who only buys goods",
          "An individual or business that creates goods or services",
          "A government tax collector",
          "A bank"
        ],
        correct: 1,
        explanation: "A producer is an individual or business that creates goods or provides services for consumers to buy."
      },
          {
        q: "What is a 'monopoly'?",
        options: [
          "Many companies competing freely",
          "A single seller dominating a market",
          "A government-owned bank",
          "A type of currency"
        ],
        correct: 1,
        explanation: "A monopoly exists when a single company or seller dominates a market with no significant competition."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is 'competition' in a market economy?",
        options: [
          "When one company controls everything",
          "Multiple sellers vying for customers, often improving quality and lowering prices",
          "A government-set rule",
          "A type of tax"
        ],
        correct: 1,
        explanation: "Competition occurs when multiple businesses compete for customers, which can drive innovation, better quality, and lower prices."
      },
          {
        q: "What does a 'demand curve' typically show?",
        options: [
          "The relationship between price and quantity demanded",
          "The total cost of production",
          "Government spending over time",
          "The population of a country"
        ],
        correct: 0,
        explanation: "A demand curve graphs how the quantity of a good demanded changes as its price changes, usually showing an inverse relationship."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is a 'consumer'?",
        options: [
          "A person who produces goods",
          "A person or business that buys goods and services",
          "A government agency",
          "A bank"
        ],
        correct: 1,
        explanation: "A consumer is an individual or entity that purchases goods and services for personal use."
      },
          {
        q: "What is a 'producer' in economics?",
        options: [
          "A person who only buys goods",
          "An individual or business that creates goods or services",
          "A government tax collector",
          "A bank"
        ],
        correct: 1,
        explanation: "A producer is an individual or business that creates goods or provides services for consumers to buy."
      },
          {
        q: "What is a 'monopoly'?",
        options: [
          "Many companies competing freely",
          "A single seller dominating a market",
          "A government-owned bank",
          "A type of currency"
        ],
        correct: 1,
        explanation: "A monopoly exists when a single company or seller dominates a market with no significant competition."
      },
          {
        q: "What is 'competition' in a market economy?",
        options: [
          "When one company controls everything",
          "Multiple sellers vying for customers, often improving quality and lowering prices",
          "A government-set rule",
          "A type of tax"
        ],
        correct: 1,
        explanation: "Competition occurs when multiple businesses compete for customers, which can drive innovation, better quality, and lower prices."
      },
          {
        q: "What does a 'demand curve' typically show?",
        options: [
          "The relationship between price and quantity demanded",
          "The total cost of production",
          "Government spending over time",
          "The population of a country"
        ],
        correct: 0,
        explanation: "A demand curve graphs how the quantity of a good demanded changes as its price changes, usually showing an inverse relationship."
      }
        ]
      }
    ]
  },
  {
    name: "Macroeconomic Indicators",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is inflation?",
        options: [
          "A rise in the general price level over time",
          "A decrease in prices",
          "A type of tax",
          "A trade agreement"
        ],
        correct: 0,
        explanation: "Inflation is measured as the percentage increase in the general price level of goods and services over time, which reduces purchasing power."
      },
          {
        q: "What does GDP stand for?",
        options: [
          "Gross Domestic Product",
          "General Domestic Price",
          "Global Development Plan",
          "Gross Development Percentage"
        ],
        correct: 0,
        explanation: "GDP measures the total monetary value of all goods and services produced within a country over a given period."
      },
          {
        q: "What does the 'unemployment rate' measure?",
        options: [
          "Total population without jobs",
          "The share of the labor force actively seeking but not finding work",
          "Total number of retired people",
          "Average income per person"
        ],
        correct: 1,
        explanation: "The unemployment rate specifically measures the share of people in the labor force who are jobless and actively seeking work — not the whole population."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What does 'GDP per capita' measure?",
        options: [
          "Total national debt",
          "Average economic output per person in a country",
          "Total government spending",
          "Total exports minus imports"
        ],
        correct: 1,
        explanation: "GDP per capita divides a country's total GDP by its population, giving a rough measure of average economic output or living standards per person."
      },
          {
        q: "What is a 'recession'?",
        options: [
          "A period of significant economic growth",
          "A significant decline in economic activity lasting more than a few months",
          "A type of tax cut",
          "A stock market holiday"
        ],
        correct: 1,
        explanation: "A recession is a period of significant, widespread decline in economic activity, typically measured by falling GDP over two consecutive quarters."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is inflation?",
        options: [
          "A rise in the general price level over time",
          "A decrease in prices",
          "A type of tax",
          "A trade agreement"
        ],
        correct: 0,
        explanation: "Inflation is measured as the percentage increase in the general price level of goods and services over time, which reduces purchasing power."
      },
          {
        q: "What does GDP stand for?",
        options: [
          "Gross Domestic Product",
          "General Domestic Price",
          "Global Development Plan",
          "Gross Development Percentage"
        ],
        correct: 0,
        explanation: "GDP measures the total monetary value of all goods and services produced within a country over a given period."
      },
          {
        q: "What does the 'unemployment rate' measure?",
        options: [
          "Total population without jobs",
          "The share of the labor force actively seeking but not finding work",
          "Total number of retired people",
          "Average income per person"
        ],
        correct: 1,
        explanation: "The unemployment rate specifically measures the share of people in the labor force who are jobless and actively seeking work — not the whole population."
      },
          {
        q: "What does 'GDP per capita' measure?",
        options: [
          "Total national debt",
          "Average economic output per person in a country",
          "Total government spending",
          "Total exports minus imports"
        ],
        correct: 1,
        explanation: "GDP per capita divides a country's total GDP by its population, giving a rough measure of average economic output or living standards per person."
      },
          {
        q: "What is a 'recession'?",
        options: [
          "A period of significant economic growth",
          "A significant decline in economic activity lasting more than a few months",
          "A type of tax cut",
          "A stock market holiday"
        ],
        correct: 1,
        explanation: "A recession is a period of significant, widespread decline in economic activity, typically measured by falling GDP over two consecutive quarters."
      }
        ]
      }
    ]
  },
  {
    name: "Government & Fiscal Policy",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What does 'fiscal policy' refer to?",
        options: [
          "A central bank's control of interest rates",
          "Government use of spending and taxation to influence the economy",
          "Company hiring practices",
          "International trade agreements"
        ],
        correct: 1,
        explanation: "Fiscal policy is how governments use spending and taxation to influence economic conditions — distinct from monetary policy."
      },
          {
        q: "What is a 'subsidy'?",
        options: [
          "A tax on imports",
          "Financial assistance from the government to support a business or activity",
          "A type of bank loan",
          "A fee charged by a company"
        ],
        correct: 1,
        explanation: "A subsidy is financial support given by a government to encourage or support a particular industry, activity, or group."
      },
          {
        q: "What is a 'progressive tax system'?",
        options: [
          "Everyone pays the same tax rate",
          "Tax rates increase as income increases",
          "Only businesses pay taxes",
          "Tax rates decrease as income increases"
        ],
        correct: 1,
        explanation: "In a progressive tax system, people with higher incomes pay a higher percentage of their income in taxes than those with lower incomes."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is a 'trade deficit'?",
        options: [
          "Exporting more than importing",
          "Importing more than exporting",
          "Having no international trade",
          "Equal imports and exports"
        ],
        correct: 1,
        explanation: "A trade deficit occurs when a country imports more goods and services than it exports."
      },
          {
        q: "What is a 'tariff'?",
        options: [
          "A tax on imported goods",
          "A type of subsidy",
          "A currency exchange rate",
          "A government bond"
        ],
        correct: 0,
        explanation: "A tariff is a tax imposed on imported goods, often used to protect domestic industries or raise government revenue."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What does 'fiscal policy' refer to?",
        options: [
          "A central bank's control of interest rates",
          "Government use of spending and taxation to influence the economy",
          "Company hiring practices",
          "International trade agreements"
        ],
        correct: 1,
        explanation: "Fiscal policy is how governments use spending and taxation to influence economic conditions — distinct from monetary policy."
      },
          {
        q: "What is a 'subsidy'?",
        options: [
          "A tax on imports",
          "Financial assistance from the government to support a business or activity",
          "A type of bank loan",
          "A fee charged by a company"
        ],
        correct: 1,
        explanation: "A subsidy is financial support given by a government to encourage or support a particular industry, activity, or group."
      },
          {
        q: "What is a 'progressive tax system'?",
        options: [
          "Everyone pays the same tax rate",
          "Tax rates increase as income increases",
          "Only businesses pay taxes",
          "Tax rates decrease as income increases"
        ],
        correct: 1,
        explanation: "In a progressive tax system, people with higher incomes pay a higher percentage of their income in taxes than those with lower incomes."
      },
          {
        q: "What is a 'trade deficit'?",
        options: [
          "Exporting more than importing",
          "Importing more than exporting",
          "Having no international trade",
          "Equal imports and exports"
        ],
        correct: 1,
        explanation: "A trade deficit occurs when a country imports more goods and services than it exports."
      },
          {
        q: "What is a 'tariff'?",
        options: [
          "A tax on imported goods",
          "A type of subsidy",
          "A currency exchange rate",
          "A government bond"
        ],
        correct: 0,
        explanation: "A tariff is a tax imposed on imported goods, often used to protect domestic industries or raise government revenue."
      }
        ]
      }
    ]
  },
  {
    name: "Money & Monetary Policy",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is 'monetary policy' typically controlled by?",
        options: [
          "The elected government directly",
          "A country's central bank",
          "Private corporations",
          "Labor unions"
        ],
        correct: 1,
        explanation: "Monetary policy — controlling interest rates and money supply — is typically managed by a country's central bank."
      },
          {
        q: "What does a country's central bank primarily do?",
        options: [
          "Collect income tax",
          "Manage the money supply and set interest rates",
          "Regulate private hiring",
          "Run the stock exchange"
        ],
        correct: 1,
        explanation: "A central bank manages a country's money supply and key interest rates, aiming for stable prices and steady growth."
      },
          {
        q: "What does 'quantitative easing' involve?",
        options: [
          "A central bank cutting government spending",
          "A central bank buying assets to increase money supply and stimulate the economy",
          "Raising interest rates sharply",
          "Reducing taxes for businesses only"
        ],
        correct: 1,
        explanation: "Quantitative easing is when a central bank buys financial assets to inject money into the economy and encourage lending and spending, often used when interest rates are already very low."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What does 'fiat currency' mean?",
        options: [
          "Currency backed by gold",
          "Currency with value derived from government decree, not a physical commodity",
          "A cryptocurrency",
          "Currency used only in France"
        ],
        correct: 1,
        explanation: "Fiat currency has value because a government declares it legal tender, rather than being backed by a physical commodity like gold."
      },
          {
        q: "What does it mean when a currency 'depreciates'?",
        options: [
          "It becomes worth more relative to other currencies",
          "It becomes worth less relative to other currencies",
          "It is taken out of circulation",
          "It is replaced by a new currency"
        ],
        correct: 1,
        explanation: "Currency depreciation means a currency loses value relative to other currencies, making imports more expensive and exports cheaper."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is 'monetary policy' typically controlled by?",
        options: [
          "The elected government directly",
          "A country's central bank",
          "Private corporations",
          "Labor unions"
        ],
        correct: 1,
        explanation: "Monetary policy — controlling interest rates and money supply — is typically managed by a country's central bank."
      },
          {
        q: "What does a country's central bank primarily do?",
        options: [
          "Collect income tax",
          "Manage the money supply and set interest rates",
          "Regulate private hiring",
          "Run the stock exchange"
        ],
        correct: 1,
        explanation: "A central bank manages a country's money supply and key interest rates, aiming for stable prices and steady growth."
      },
          {
        q: "What does 'quantitative easing' involve?",
        options: [
          "A central bank cutting government spending",
          "A central bank buying assets to increase money supply and stimulate the economy",
          "Raising interest rates sharply",
          "Reducing taxes for businesses only"
        ],
        correct: 1,
        explanation: "Quantitative easing is when a central bank buys financial assets to inject money into the economy and encourage lending and spending, often used when interest rates are already very low."
      },
          {
        q: "What does 'fiat currency' mean?",
        options: [
          "Currency backed by gold",
          "Currency with value derived from government decree, not a physical commodity",
          "A cryptocurrency",
          "Currency used only in France"
        ],
        correct: 1,
        explanation: "Fiat currency has value because a government declares it legal tender, rather than being backed by a physical commodity like gold."
      },
          {
        q: "What does it mean when a currency 'depreciates'?",
        options: [
          "It becomes worth more relative to other currencies",
          "It becomes worth less relative to other currencies",
          "It is taken out of circulation",
          "It is replaced by a new currency"
        ],
        correct: 1,
        explanation: "Currency depreciation means a currency loses value relative to other currencies, making imports more expensive and exports cheaper."
      }
        ]
      }
    ]
  },
  {
    name: "Advanced Economic Concepts",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What does 'comparative advantage' explain in trade?",
        options: [
          "Why countries should be self-sufficient",
          "Why countries benefit from specializing in what they produce relatively efficiently",
          "Why tariffs are always beneficial",
          "Why exchange rates never change"
        ],
        correct: 1,
        explanation: "Comparative advantage explains why countries gain from trade by specializing in goods they can produce relatively more efficiently, even if another country could produce everything more efficiently overall."
      },
          {
        q: "What is 'stagflation'?",
        options: [
          "High growth and low inflation",
          "Stagnant growth combined with high inflation",
          "Falling prices during a recession",
          "Rapid growth with no inflation"
        ],
        correct: 1,
        explanation: "Stagflation is the unusual and difficult combination of slow economic growth, high unemployment, and high inflation happening at once."
      },
          {
        q: "What is the 'law of diminishing returns'?",
        options: [
          "Producing more always increases profit",
          "Adding more of one input eventually yields smaller output gains",
          "Prices always fall over time",
          "Supply always equals demand"
        ],
        correct: 1,
        explanation: "The law of diminishing returns states that adding more units of one input, while others stay fixed, eventually produces smaller and smaller additional output."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What does 'elasticity of demand' measure?",
        options: [
          "How much a product weighs",
          "How responsive quantity demanded is to a change in price",
          "The total supply of a good",
          "The interest rate on loans"
        ],
        correct: 1,
        explanation: "Elasticity of demand measures how much the quantity demanded of a good changes in response to a change in its price."
      },
          {
        q: "What is the difference between microeconomics and macroeconomics?",
        options: [
          "There is no difference",
          "Microeconomics studies individual markets and decisions; macroeconomics studies the economy as a whole",
          "Macroeconomics only studies small businesses",
          "Microeconomics only studies government policy"
        ],
        correct: 1,
        explanation: "Microeconomics focuses on individual consumers, firms, and markets, while macroeconomics studies economy-wide phenomena like inflation, unemployment, and overall growth."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What does 'comparative advantage' explain in trade?",
        options: [
          "Why countries should be self-sufficient",
          "Why countries benefit from specializing in what they produce relatively efficiently",
          "Why tariffs are always beneficial",
          "Why exchange rates never change"
        ],
        correct: 1,
        explanation: "Comparative advantage explains why countries gain from trade by specializing in goods they can produce relatively more efficiently, even if another country could produce everything more efficiently overall."
      },
          {
        q: "What is 'stagflation'?",
        options: [
          "High growth and low inflation",
          "Stagnant growth combined with high inflation",
          "Falling prices during a recession",
          "Rapid growth with no inflation"
        ],
        correct: 1,
        explanation: "Stagflation is the unusual and difficult combination of slow economic growth, high unemployment, and high inflation happening at once."
      },
          {
        q: "What is the 'law of diminishing returns'?",
        options: [
          "Producing more always increases profit",
          "Adding more of one input eventually yields smaller output gains",
          "Prices always fall over time",
          "Supply always equals demand"
        ],
        correct: 1,
        explanation: "The law of diminishing returns states that adding more units of one input, while others stay fixed, eventually produces smaller and smaller additional output."
      },
          {
        q: "What does 'elasticity of demand' measure?",
        options: [
          "How much a product weighs",
          "How responsive quantity demanded is to a change in price",
          "The total supply of a good",
          "The interest rate on loans"
        ],
        correct: 1,
        explanation: "Elasticity of demand measures how much the quantity demanded of a good changes in response to a change in its price."
      },
          {
        q: "What is the difference between microeconomics and macroeconomics?",
        options: [
          "There is no difference",
          "Microeconomics studies individual markets and decisions; macroeconomics studies the economy as a whole",
          "Macroeconomics only studies small businesses",
          "Microeconomics only studies government policy"
        ],
        correct: 1,
        explanation: "Microeconomics focuses on individual consumers, firms, and markets, while macroeconomics studies economy-wide phenomena like inflation, unemployment, and overall growth."
      }
        ]
      }
    ]
  },
  {
    name: "Economic Inequality & Behavior",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What does the 'Gini coefficient' measure?",
        options: [
          "Inflation rate",
          "Income inequality within a population",
          "GDP growth rate",
          "Unemployment rate"
        ],
        correct: 1,
        explanation: "The Gini coefficient measures income or wealth inequality within a population, ranging from 0 (perfect equality) to 1 (perfect inequality)."
      },
          {
        q: "What is 'moral hazard' in economics?",
        options: [
          "When people take more risks because they're insulated from consequences",
          "A type of unethical business practice",
          "A government policy failure",
          "A form of tax evasion"
        ],
        correct: 0,
        explanation: "Moral hazard occurs when a party takes on more risk because they don't bear the full consequences — for example, insurance sometimes encouraging riskier behavior."
      },
          {
        q: "What is 'creative destruction' in economics?",
        options: [
          "Government destroying excess currency",
          "The process by which new innovations replace outdated industries and jobs",
          "A type of stock market crash",
          "Planned obsolescence in manufacturing"
        ],
        correct: 1,
        explanation: "Coined by economist Joseph Schumpeter, creative destruction describes how innovation continuously replaces outdated industries, products, and jobs with new ones."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What does 'purchasing power' refer to?",
        options: [
          "The amount of money a country prints",
          "The quantity of goods and services money can buy",
          "A type of stock",
          "A bank's total assets"
        ],
        correct: 1,
        explanation: "Purchasing power describes how much a given amount of money can actually buy, which decreases as prices rise (inflation)."
      },
          {
        q: "What does 'GDP' stand for and measure?",
        options: [
          "Gross Domestic Product — total value of goods and services produced in a country",
          "Government Debt Percentage — a country's debt level",
          "General Development Plan — an economic policy",
          "Gross Deposit Price — bank interest rates"
        ],
        correct: 0,
        explanation: "GDP (Gross Domestic Product) measures the total monetary value of all goods and services produced within a country over a given period."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What does the 'Gini coefficient' measure?",
        options: [
          "Inflation rate",
          "Income inequality within a population",
          "GDP growth rate",
          "Unemployment rate"
        ],
        correct: 1,
        explanation: "The Gini coefficient measures income or wealth inequality within a population, ranging from 0 (perfect equality) to 1 (perfect inequality)."
      },
          {
        q: "What is 'moral hazard' in economics?",
        options: [
          "When people take more risks because they're insulated from consequences",
          "A type of unethical business practice",
          "A government policy failure",
          "A form of tax evasion"
        ],
        correct: 0,
        explanation: "Moral hazard occurs when a party takes on more risk because they don't bear the full consequences — for example, insurance sometimes encouraging riskier behavior."
      },
          {
        q: "What is 'creative destruction' in economics?",
        options: [
          "Government destroying excess currency",
          "The process by which new innovations replace outdated industries and jobs",
          "A type of stock market crash",
          "Planned obsolescence in manufacturing"
        ],
        correct: 1,
        explanation: "Coined by economist Joseph Schumpeter, creative destruction describes how innovation continuously replaces outdated industries, products, and jobs with new ones."
      },
          {
        q: "What does 'purchasing power' refer to?",
        options: [
          "The amount of money a country prints",
          "The quantity of goods and services money can buy",
          "A type of stock",
          "A bank's total assets"
        ],
        correct: 1,
        explanation: "Purchasing power describes how much a given amount of money can actually buy, which decreases as prices rise (inflation)."
      },
          {
        q: "What does 'GDP' stand for and measure?",
        options: [
          "Gross Domestic Product — total value of goods and services produced in a country",
          "Government Debt Percentage — a country's debt level",
          "General Development Plan — an economic policy",
          "Gross Deposit Price — bank interest rates"
        ],
        correct: 0,
        explanation: "GDP (Gross Domestic Product) measures the total monetary value of all goods and services produced within a country over a given period."
      }
        ]
      }
    ]
  },
  {
    name: "International Trade & Globalization",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is 'globalization'?",
        options: [
          "The process of countries becoming more isolated",
          "The increasing interconnection of world economies and cultures",
          "A type of currency exchange",
          "A government policy limiting trade"
        ],
        correct: 1,
        explanation: "Globalization refers to the growing interconnectedness of the world's economies, cultures, and populations through trade and communication."
      },
          {
        q: "What is an 'exchange rate'?",
        options: [
          "The interest rate on a loan",
          "The value of one currency in terms of another",
          "A country's tax rate",
          "The price of imported goods only"
        ],
        correct: 1,
        explanation: "An exchange rate is the value of one country's currency compared to another's."
      },
          {
        q: "What is a 'trade surplus'?",
        options: [
          "Exporting more than importing",
          "Importing more than exporting",
          "Having no trade at all",
          "A type of tax"
        ],
        correct: 0,
        explanation: "A trade surplus occurs when a country exports more goods and services than it imports."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is the purpose of the World Trade Organization (WTO)?",
        options: [
          "To set global tax rates",
          "To regulate and facilitate international trade between countries",
          "To print international currency",
          "To control global interest rates"
        ],
        correct: 1,
        explanation: "The WTO is an international organization that helps regulate and facilitate trade agreements and disputes between countries."
      },
          {
        q: "What is 'protectionism' in trade policy?",
        options: [
          "Encouraging free trade with no restrictions",
          "Using tariffs and quotas to protect domestic industries from foreign competition",
          "A type of currency policy",
          "An environmental regulation"
        ],
        correct: 1,
        explanation: "Protectionism refers to government policies, like tariffs and quotas, designed to protect domestic industries from foreign competition."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is 'globalization'?",
        options: [
          "The process of countries becoming more isolated",
          "The increasing interconnection of world economies and cultures",
          "A type of currency exchange",
          "A government policy limiting trade"
        ],
        correct: 1,
        explanation: "Globalization refers to the growing interconnectedness of the world's economies, cultures, and populations through trade and communication."
      },
          {
        q: "What is an 'exchange rate'?",
        options: [
          "The interest rate on a loan",
          "The value of one currency in terms of another",
          "A country's tax rate",
          "The price of imported goods only"
        ],
        correct: 1,
        explanation: "An exchange rate is the value of one country's currency compared to another's."
      },
          {
        q: "What is a 'trade surplus'?",
        options: [
          "Exporting more than importing",
          "Importing more than exporting",
          "Having no trade at all",
          "A type of tax"
        ],
        correct: 0,
        explanation: "A trade surplus occurs when a country exports more goods and services than it imports."
      },
          {
        q: "What is the purpose of the World Trade Organization (WTO)?",
        options: [
          "To set global tax rates",
          "To regulate and facilitate international trade between countries",
          "To print international currency",
          "To control global interest rates"
        ],
        correct: 1,
        explanation: "The WTO is an international organization that helps regulate and facilitate trade agreements and disputes between countries."
      },
          {
        q: "What is 'protectionism' in trade policy?",
        options: [
          "Encouraging free trade with no restrictions",
          "Using tariffs and quotas to protect domestic industries from foreign competition",
          "A type of currency policy",
          "An environmental regulation"
        ],
        correct: 1,
        explanation: "Protectionism refers to government policies, like tariffs and quotas, designed to protect domestic industries from foreign competition."
      }
        ]
      }
    ]
  },
  {
    name: "Personal Finance & Investing",
    lessons: [
      {
        name: "Part 1",
        questions: [
          {
        q: "What is 'compound interest'?",
        options: [
          "Interest calculated only on the original amount",
          "Interest calculated on both the principal and previously earned interest",
          "A type of loan",
          "A government tax on savings"
        ],
        correct: 1,
        explanation: "Compound interest is calculated on both the initial principal and accumulated interest, causing savings to grow faster over time."
      },
          {
        q: "What is a 'stock' in investing?",
        options: [
          "A loan given to a company",
          "A share of ownership in a company",
          "A type of government bond",
          "A type of insurance"
        ],
        correct: 1,
        explanation: "A stock represents a share of ownership in a company, giving the holder a claim on part of its assets and profits."
      },
          {
        q: "What is 'diversification' in investing?",
        options: [
          "Putting all your money into one investment",
          "Spreading investments across different assets to reduce risk",
          "Only investing in government bonds",
          "A type of tax deduction"
        ],
        correct: 1,
        explanation: "Diversification means spreading investments across different assets to reduce the risk of any single investment's poor performance."
      }
        ]
      },
      {
        name: "Part 2",
        questions: [
          {
        q: "What is a 'credit score' used for?",
        options: [
          "Determining voting eligibility",
          "Assessing a person's creditworthiness for loans",
          "Calculating income tax",
          "Determining insurance premiums only"
        ],
        correct: 1,
        explanation: "A credit score reflects a person's creditworthiness, used by lenders to assess the risk of lending them money."
      },
          {
        q: "What is the key difference between 'saving' and 'investing'?",
        options: [
          "They are exactly the same thing",
          "Saving typically involves low-risk storage of money; investing involves risk for potential higher returns",
          "Investing is always safer than saving",
          "Saving always earns more than investing"
        ],
        correct: 1,
        explanation: "Saving generally means setting aside money safely with little risk, while investing involves risk for potentially higher returns."
      }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          {
        q: "What is 'compound interest'?",
        options: [
          "Interest calculated only on the original amount",
          "Interest calculated on both the principal and previously earned interest",
          "A type of loan",
          "A government tax on savings"
        ],
        correct: 1,
        explanation: "Compound interest is calculated on both the initial principal and accumulated interest, causing savings to grow faster over time."
      },
          {
        q: "What is a 'stock' in investing?",
        options: [
          "A loan given to a company",
          "A share of ownership in a company",
          "A type of government bond",
          "A type of insurance"
        ],
        correct: 1,
        explanation: "A stock represents a share of ownership in a company, giving the holder a claim on part of its assets and profits."
      },
          {
        q: "What is 'diversification' in investing?",
        options: [
          "Putting all your money into one investment",
          "Spreading investments across different assets to reduce risk",
          "Only investing in government bonds",
          "A type of tax deduction"
        ],
        correct: 1,
        explanation: "Diversification means spreading investments across different assets to reduce the risk of any single investment's poor performance."
      },
          {
        q: "What is a 'credit score' used for?",
        options: [
          "Determining voting eligibility",
          "Assessing a person's creditworthiness for loans",
          "Calculating income tax",
          "Determining insurance premiums only"
        ],
        correct: 1,
        explanation: "A credit score reflects a person's creditworthiness, used by lenders to assess the risk of lending them money."
      },
          {
        q: "What is the key difference between 'saving' and 'investing'?",
        options: [
          "They are exactly the same thing",
          "Saving typically involves low-risk storage of money; investing involves risk for potential higher returns",
          "Investing is always safer than saving",
          "Saving always earns more than investing"
        ],
        correct: 1,
        explanation: "Saving generally means setting aside money safely with little risk, while investing involves risk for potentially higher returns."
      }
        ]
      }
    ]
  }


  ],
  "probability": [
  {
    name: "Basic Probability",
    lessons: [
      {
        name: "Part 1",
        questions: [
          { q: "If you flip a fair coin, what is the probability of getting heads?",
        options: ["1/4", "1/2", "1/3", "1"], correct: 1,
        explanation: "A fair coin has exactly 2 equally likely outcomes (heads or tails), so the probability of heads is 1 out of 2, or 1/2." },
          { q: "A standard die has 6 sides. What is the probability of rolling a 4?",
        options: ["1/6", "1/4", "1/2", "4/6"], correct: 0,
        explanation: "There is exactly 1 way to roll a 4 out of 6 equally likely outcomes, so the probability is 1/6." },
          { q: "What does a probability of 0 mean?",
        options: ["The event is certain", "The event is impossible", "The event happens half the time", "The event happened once"], correct: 1,
        explanation: "A probability of 0 means the event cannot happen at all — it's impossible." }
        ]
      },
      {
        name: "Part 2",
        questions: [
          { q: "What does a probability of 1 mean?",
        options: ["The event is impossible", "The event is certain to happen", "The event happens rarely", "There's a 1% chance"], correct: 1,
        explanation: "A probability of 1 (or 100%) means the event is guaranteed to happen." },
          { q: "A bag has 3 red marbles and 2 blue marbles. What is the probability of picking a red marble?",
        options: ["2/5", "3/5", "1/2", "3/2"], correct: 1,
        explanation: "There are 3 red marbles out of 5 total marbles, so the probability is 3/5." }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "If you flip a fair coin, what is the probability of getting heads?",
        options: ["1/4", "1/2", "1/3", "1"], correct: 1,
        explanation: "A fair coin has exactly 2 equally likely outcomes (heads or tails), so the probability of heads is 1 out of 2, or 1/2." },
          { q: "A standard die has 6 sides. What is the probability of rolling a 4?",
        options: ["1/6", "1/4", "1/2", "4/6"], correct: 0,
        explanation: "There is exactly 1 way to roll a 4 out of 6 equally likely outcomes, so the probability is 1/6." },
          { q: "What does a probability of 0 mean?",
        options: ["The event is certain", "The event is impossible", "The event happens half the time", "The event happened once"], correct: 1,
        explanation: "A probability of 0 means the event cannot happen at all — it's impossible." },
          { q: "What does a probability of 1 mean?",
        options: ["The event is impossible", "The event is certain to happen", "The event happens rarely", "There's a 1% chance"], correct: 1,
        explanation: "A probability of 1 (or 100%) means the event is guaranteed to happen." },
          { q: "A bag has 3 red marbles and 2 blue marbles. What is the probability of picking a red marble?",
        options: ["2/5", "3/5", "1/2", "3/2"], correct: 1,
        explanation: "There are 3 red marbles out of 5 total marbles, so the probability is 3/5." }
        ]
      }
    ]
  },
  {
    name: "Combined Events",
    lessons: [
      {
        name: "Part 1",
        questions: [
          { q: "If two events are independent, what does that mean?",
        options: ["One event affects the other", "The outcome of one doesn't affect the other", "They can never both happen", "They always happen together"], correct: 1,
        explanation: "Independent events don't influence each other — the outcome of one has no effect on the probability of the other." },
          { q: "What is the probability of rolling a 6 on a die AND flipping heads on a coin?",
        options: ["1/6 + 1/2", "1/6 × 1/2", "1/6 - 1/2", "1"], correct: 1,
        explanation: "For independent events, you multiply the individual probabilities: 1/6 × 1/2 = 1/12." },
          { q: "What is the probability of rolling either a 1 OR a 2 on a single die?",
        options: ["1/6", "2/6", "1/3", "1/12"], correct: 1,
        explanation: "For 'or' with events that can't both happen, you add the probabilities: 1/6 + 1/6 = 2/6 (which simplifies to 1/3)." }
        ]
      },
      {
        name: "Part 2",
        questions: [
          { q: "You flip a coin twice. What is the probability of getting heads both times?",
        options: ["1/2", "1/4", "1/3", "2/2"], correct: 1,
        explanation: "Each flip is independent with probability 1/2. Multiplying: 1/2 × 1/2 = 1/4." },
          { q: "Two events cannot happen at the same time. What are they called?",
        options: ["Independent", "Dependent", "Mutually exclusive", "Certain"], correct: 2,
        explanation: "Events that cannot occur simultaneously (like rolling a 1 and a 2 on the same single roll) are called mutually exclusive." }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "If two events are independent, what does that mean?",
        options: ["One event affects the other", "The outcome of one doesn't affect the other", "They can never both happen", "They always happen together"], correct: 1,
        explanation: "Independent events don't influence each other — the outcome of one has no effect on the probability of the other." },
          { q: "What is the probability of rolling a 6 on a die AND flipping heads on a coin?",
        options: ["1/6 + 1/2", "1/6 × 1/2", "1/6 - 1/2", "1"], correct: 1,
        explanation: "For independent events, you multiply the individual probabilities: 1/6 × 1/2 = 1/12." },
          { q: "What is the probability of rolling either a 1 OR a 2 on a single die?",
        options: ["1/6", "2/6", "1/3", "1/12"], correct: 1,
        explanation: "For 'or' with events that can't both happen, you add the probabilities: 1/6 + 1/6 = 2/6 (which simplifies to 1/3)." },
          { q: "You flip a coin twice. What is the probability of getting heads both times?",
        options: ["1/2", "1/4", "1/3", "2/2"], correct: 1,
        explanation: "Each flip is independent with probability 1/2. Multiplying: 1/2 × 1/2 = 1/4." },
          { q: "Two events cannot happen at the same time. What are they called?",
        options: ["Independent", "Dependent", "Mutually exclusive", "Certain"], correct: 2,
        explanation: "Events that cannot occur simultaneously (like rolling a 1 and a 2 on the same single roll) are called mutually exclusive." }
        ]
      }
    ]
  },
  {
    name: "Counting: Permutations & Combinations",
    lessons: [
      {
        name: "Part 1",
        questions: [
          { q: "In how many different orders can 3 people line up?",
        options: ["3", "6", "9", "27"], correct: 1,
        explanation: "This is 3! (3 factorial) = 3 × 2 × 1 = 6 different orderings." },
          { q: "When order matters (like arranging books on a shelf), what is this called?",
        options: ["A combination", "A permutation", "An event", "A ratio"], correct: 1,
        explanation: "A permutation is an arrangement where the order matters. A combination is when order does NOT matter." },
          { q: "When choosing a 3-person committee from a group (where order doesn't matter), what is this called?",
        options: ["A permutation", "A combination", "A factorial", "A sample space"], correct: 1,
        explanation: "A combination is a selection where order doesn't matter — picking Alice, Bob, and Carol is the same committee no matter the order named." }
        ]
      },
      {
        name: "Part 2",
        questions: [
          { q: "What is 4! (4 factorial)?",
        options: ["4", "16", "24", "10"], correct: 2,
        explanation: "4! = 4 × 3 × 2 × 1 = 24." },
          { q: "How many ways can you arrange the letters A, B, and C?",
        options: ["3", "6", "9", "1"], correct: 1,
        explanation: "With 3 distinct letters, there are 3! = 6 possible arrangements: ABC, ACB, BAC, BCA, CAB, CBA." }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "In how many different orders can 3 people line up?",
        options: ["3", "6", "9", "27"], correct: 1,
        explanation: "This is 3! (3 factorial) = 3 × 2 × 1 = 6 different orderings." },
          { q: "When order matters (like arranging books on a shelf), what is this called?",
        options: ["A combination", "A permutation", "An event", "A ratio"], correct: 1,
        explanation: "A permutation is an arrangement where the order matters. A combination is when order does NOT matter." },
          { q: "When choosing a 3-person committee from a group (where order doesn't matter), what is this called?",
        options: ["A permutation", "A combination", "A factorial", "A sample space"], correct: 1,
        explanation: "A combination is a selection where order doesn't matter — picking Alice, Bob, and Carol is the same committee no matter the order named." },
          { q: "What is 4! (4 factorial)?",
        options: ["4", "16", "24", "10"], correct: 2,
        explanation: "4! = 4 × 3 × 2 × 1 = 24." },
          { q: "How many ways can you arrange the letters A, B, and C?",
        options: ["3", "6", "9", "1"], correct: 1,
        explanation: "With 3 distinct letters, there are 3! = 6 possible arrangements: ABC, ACB, BAC, BCA, CAB, CBA." }
        ]
      }
    ]
  },
  {
    name: "Expected Value",
    lessons: [
      {
        name: "Part 1",
        questions: [
          { q: "What does 'expected value' represent?",
        options: ["The most likely single outcome", "The average outcome if you repeated something many times", "The maximum possible outcome", "The probability of winning"], correct: 1,
        explanation: "Expected value is the long-run average result you'd expect if you repeated the experiment many, many times." },
          { q: "A game pays $10 if you win (50% chance) and $0 if you lose (50% chance). What is the expected value?",
        options: ["$10", "$5", "$0", "$20"], correct: 1,
        explanation: "Expected value = (0.5 × $10) + (0.5 × $0) = $5." },
          { q: "If a raffle ticket costs $2 and has a 1-in-100 chance of winning $150, is buying a ticket a good deal on average?",
        options: ["Yes, because the expected value is $1.50, less than the cost", "Yes, because you might win $150", "No, because the expected value is $1.50, less than the $2 cost", "It's impossible to say"], correct: 2,
        explanation: "Expected value = (1/100) × $150 = $1.50, which is less than the $2 ticket cost — so on average, this is a losing bet." }
        ]
      },
      {
        name: "Part 2",
        questions: [
          { q: "You roll a die. If you roll a 6, you win $12. Otherwise you win $0. What's the expected value?",
        options: ["$12", "$6", "$2", "$1"], correct: 2,
        explanation: "Expected value = (1/6) × $12 = $2." },
          { q: "Why do casinos almost always make money in the long run?",
        options: ["They cheat", "Games are designed so the expected value favors the casino", "Players always lose immediately", "Luck always runs out"], correct: 1,
        explanation: "Casino games are mathematically designed so the expected value slightly favors the house — over many plays, this adds up to consistent profit." }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What does 'expected value' represent?",
        options: ["The most likely single outcome", "The average outcome if you repeated something many times", "The maximum possible outcome", "The probability of winning"], correct: 1,
        explanation: "Expected value is the long-run average result you'd expect if you repeated the experiment many, many times." },
          { q: "A game pays $10 if you win (50% chance) and $0 if you lose (50% chance). What is the expected value?",
        options: ["$10", "$5", "$0", "$20"], correct: 1,
        explanation: "Expected value = (0.5 × $10) + (0.5 × $0) = $5." },
          { q: "If a raffle ticket costs $2 and has a 1-in-100 chance of winning $150, is buying a ticket a good deal on average?",
        options: ["Yes, because the expected value is $1.50, less than the cost", "Yes, because you might win $150", "No, because the expected value is $1.50, less than the $2 cost", "It's impossible to say"], correct: 2,
        explanation: "Expected value = (1/100) × $150 = $1.50, which is less than the $2 ticket cost — so on average, this is a losing bet." },
          { q: "You roll a die. If you roll a 6, you win $12. Otherwise you win $0. What's the expected value?",
        options: ["$12", "$6", "$2", "$1"], correct: 2,
        explanation: "Expected value = (1/6) × $12 = $2." },
          { q: "Why do casinos almost always make money in the long run?",
        options: ["They cheat", "Games are designed so the expected value favors the casino", "Players always lose immediately", "Luck always runs out"], correct: 1,
        explanation: "Casino games are mathematically designed so the expected value slightly favors the house — over many plays, this adds up to consistent profit." }
        ]
      }
    ]
  },
  {
    name: "Probability in the Real World",
    lessons: [
      {
        name: "Part 1",
        questions: [
          { q: "A weather forecast says there's a 30% chance of rain. What does this mean?",
        options: ["It will definitely rain for 30% of the day", "Under similar conditions, it has historically rained about 30% of the time", "It rained 30 days this month", "There's a 70% chance it's wrong"], correct: 1,
        explanation: "A 30% chance of rain means that, based on historical data under similar atmospheric conditions, it rained about 30% of the time." },
          { q: "What is 'conditional probability'?",
        options: ["The probability an event happens no matter what", "The probability of an event GIVEN that another event already happened", "A guess with no math behind it", "The opposite of independence"], correct: 1,
        explanation: "Conditional probability is the probability of an event happening given that we know another event has already occurred." },
          { q: "A medical test is 95% accurate. If you test positive, does that mean you have a 95% chance of having the condition?",
        options: ["Yes, always", "Not necessarily — it depends on how rare the condition is overall", "No, it means a 5% chance", "The accuracy doesn't matter"], correct: 1,
        explanation: "This is a common misconception. If the condition is rare, even a 95%-accurate test can have many false positives relative to true cases — the actual chance depends on the condition's overall rarity too." }
        ]
      },
      {
        name: "Part 2",
        questions: [
          { q: "Which of these is an example of using probability in everyday life?",
        options: ["Deciding whether to bring an umbrella based on the rain forecast", "Memorizing multiplication tables", "Reading a novel", "Drawing a picture"], correct: 0,
        explanation: "Weighing the forecasted probability of rain to decide whether to bring an umbrella is a real, everyday application of probability." },
          { q: "Why is understanding probability useful when reading news about risk (like health studies)?",
        options: ["It isn't useful", "It helps you judge whether a reported risk increase is actually significant", "It guarantees the study is correct", "It replaces the need for science"], correct: 1,
        explanation: "Understanding probability helps you critically evaluate reported risks — for example, telling the difference between a genuinely large risk increase and a small one that sounds dramatic in a headline." }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "A weather forecast says there's a 30% chance of rain. What does this mean?",
        options: ["It will definitely rain for 30% of the day", "Under similar conditions, it has historically rained about 30% of the time", "It rained 30 days this month", "There's a 70% chance it's wrong"], correct: 1,
        explanation: "A 30% chance of rain means that, based on historical data under similar atmospheric conditions, it rained about 30% of the time." },
          { q: "What is 'conditional probability'?",
        options: ["The probability an event happens no matter what", "The probability of an event GIVEN that another event already happened", "A guess with no math behind it", "The opposite of independence"], correct: 1,
        explanation: "Conditional probability is the probability of an event happening given that we know another event has already occurred." },
          { q: "A medical test is 95% accurate. If you test positive, does that mean you have a 95% chance of having the condition?",
        options: ["Yes, always", "Not necessarily — it depends on how rare the condition is overall", "No, it means a 5% chance", "The accuracy doesn't matter"], correct: 1,
        explanation: "This is a common misconception. If the condition is rare, even a 95%-accurate test can have many false positives relative to true cases — the actual chance depends on the condition's overall rarity too." },
          { q: "Which of these is an example of using probability in everyday life?",
        options: ["Deciding whether to bring an umbrella based on the rain forecast", "Memorizing multiplication tables", "Reading a novel", "Drawing a picture"], correct: 0,
        explanation: "Weighing the forecasted probability of rain to decide whether to bring an umbrella is a real, everyday application of probability." },
          { q: "Why is understanding probability useful when reading news about risk (like health studies)?",
        options: ["It isn't useful", "It helps you judge whether a reported risk increase is actually significant", "It guarantees the study is correct", "It replaces the need for science"], correct: 1,
        explanation: "Understanding probability helps you critically evaluate reported risks — for example, telling the difference between a genuinely large risk increase and a small one that sounds dramatic in a headline." }
        ]
      }
    ]
  }


  ],
  "technology": [
  {
    name: "How Everyday Tech Works",
    lessons: [
      {
        name: "Part 1",
        questions: [
          { q: "What does 'hardware' refer to in computing?",
        options: ["The programs and apps you use", "The physical parts of a device you can touch", "The internet connection", "A type of software bug"], correct: 1,
        explanation: "Hardware is the physical components of a device — the screen, chips, battery, and so on — as opposed to software, which is the programs that run on it." },
          { q: "What is the main job of a device's battery?",
        options: ["Store and provide electrical power", "Connect to the internet", "Display images", "Store files permanently"], correct: 0,
        explanation: "A battery stores electrical energy and supplies power to the device when it's not plugged in." },
          { q: "What does 'smart' typically mean when describing a device (like a smart thermostat)?",
        options: ["It can only be used by smart people", "It can connect to the internet and often be controlled remotely", "It never breaks", "It's more expensive"], correct: 1,
        explanation: "'Smart' devices typically connect to the internet or a network, allowing remote control, automation, and data collection." }
        ]
      },
      {
        name: "Part 2",
        questions: [
          { q: "What is a sensor, in the context of everyday technology?",
        options: ["A component that detects things like light, motion, or temperature", "A type of app", "A password", "A charging cable"], correct: 0,
        explanation: "Sensors detect real-world conditions (light, motion, temperature, etc.) and convert them into data a device can use." },
          { q: "Why do phones and laptops need to be updated regularly?",
        options: ["To make them run out of storage", "To fix bugs, patch security issues, and add features", "It's not actually necessary", "To make the battery drain faster on purpose"], correct: 1,
        explanation: "Software updates fix bugs, close security vulnerabilities, and sometimes add new features — skipping them can leave a device less secure." }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What does 'hardware' refer to in computing?",
        options: ["The programs and apps you use", "The physical parts of a device you can touch", "The internet connection", "A type of software bug"], correct: 1,
        explanation: "Hardware is the physical components of a device — the screen, chips, battery, and so on — as opposed to software, which is the programs that run on it." },
          { q: "What is the main job of a device's battery?",
        options: ["Store and provide electrical power", "Connect to the internet", "Display images", "Store files permanently"], correct: 0,
        explanation: "A battery stores electrical energy and supplies power to the device when it's not plugged in." },
          { q: "What does 'smart' typically mean when describing a device (like a smart thermostat)?",
        options: ["It can only be used by smart people", "It can connect to the internet and often be controlled remotely", "It never breaks", "It's more expensive"], correct: 1,
        explanation: "'Smart' devices typically connect to the internet or a network, allowing remote control, automation, and data collection." },
          { q: "What is a sensor, in the context of everyday technology?",
        options: ["A component that detects things like light, motion, or temperature", "A type of app", "A password", "A charging cable"], correct: 0,
        explanation: "Sensors detect real-world conditions (light, motion, temperature, etc.) and convert them into data a device can use." },
          { q: "Why do phones and laptops need to be updated regularly?",
        options: ["To make them run out of storage", "To fix bugs, patch security issues, and add features", "It's not actually necessary", "To make the battery drain faster on purpose"], correct: 1,
        explanation: "Software updates fix bugs, close security vulnerabilities, and sometimes add new features — skipping them can leave a device less secure." }
        ]
      }
    ]
  },
  {
    name: "The Internet & Networks",
    lessons: [
      {
        name: "Part 1",
        questions: [
          { q: "What does Wi-Fi allow a device to do?",
        options: ["Charge wirelessly", "Connect to a network without a cable", "Print documents", "Take photos"], correct: 1,
        explanation: "Wi-Fi is a wireless technology that lets devices connect to a network (and through it, the internet) without a physical cable." },
          { q: "What is a router's main job in a home network?",
        options: ["Store photos", "Direct data between your devices and the internet", "Generate electricity", "Play music"], correct: 1,
        explanation: "A router directs data traffic between devices on your local network and the wider internet." },
          { q: "What does 'the cloud' mean in everyday tech language?",
        options: ["Actual clouds in the sky", "Storing and accessing data over the internet instead of only on your device", "A type of virus", "A weather app"], correct: 1,
        explanation: "'The cloud' refers to storing data and running services on remote servers accessed via the internet, rather than only on your local device." }
        ]
      },
      {
        name: "Part 2",
        questions: [
          { q: "What is bandwidth, in the context of internet connections?",
        options: ["How much data can be transferred in a given time", "The physical width of a cable", "A type of Wi-Fi password", "The brand of your router"], correct: 0,
        explanation: "Bandwidth measures how much data can move through a connection per second — higher bandwidth generally means faster loading and streaming." },
          { q: "Why might a video call lag or freeze?",
        options: ["The camera is too old", "Limited bandwidth or an unstable connection struggling to send/receive data fast enough", "The microphone is broken", "It's always the app's fault"], correct: 1,
        explanation: "Video calls need a steady stream of data — if your connection's bandwidth is limited or unstable, the call can lag, freeze, or drop." }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What does Wi-Fi allow a device to do?",
        options: ["Charge wirelessly", "Connect to a network without a cable", "Print documents", "Take photos"], correct: 1,
        explanation: "Wi-Fi is a wireless technology that lets devices connect to a network (and through it, the internet) without a physical cable." },
          { q: "What is a router's main job in a home network?",
        options: ["Store photos", "Direct data between your devices and the internet", "Generate electricity", "Play music"], correct: 1,
        explanation: "A router directs data traffic between devices on your local network and the wider internet." },
          { q: "What does 'the cloud' mean in everyday tech language?",
        options: ["Actual clouds in the sky", "Storing and accessing data over the internet instead of only on your device", "A type of virus", "A weather app"], correct: 1,
        explanation: "'The cloud' refers to storing data and running services on remote servers accessed via the internet, rather than only on your local device." },
          { q: "What is bandwidth, in the context of internet connections?",
        options: ["How much data can be transferred in a given time", "The physical width of a cable", "A type of Wi-Fi password", "The brand of your router"], correct: 0,
        explanation: "Bandwidth measures how much data can move through a connection per second — higher bandwidth generally means faster loading and streaming." },
          { q: "Why might a video call lag or freeze?",
        options: ["The camera is too old", "Limited bandwidth or an unstable connection struggling to send/receive data fast enough", "The microphone is broken", "It's always the app's fault"], correct: 1,
        explanation: "Video calls need a steady stream of data — if your connection's bandwidth is limited or unstable, the call can lag, freeze, or drop." }
        ]
      }
    ]
  },
  {
    name: "Digital Safety & Privacy",
    lessons: [
      {
        name: "Part 1",
        questions: [
          { q: "What makes a password strong?",
        options: ["Using your name and birthday", "Length, and a mix of letters, numbers, and symbols", "Using the same password everywhere for consistency", "Keeping it short so you remember it"], correct: 1,
        explanation: "Strong passwords are long and combine different character types, making them much harder to guess or crack." },
          { q: "What is 'phishing'?",
        options: ["A type of computer virus that damages hardware", "A trick where someone impersonates a trusted source to steal your information", "A way to speed up your internet", "A type of software update"], correct: 1,
        explanation: "Phishing is a scam where an attacker pretends to be someone trustworthy (like a bank or company) to trick you into giving up personal information." },
          { q: "What does two-factor authentication (2FA) add to a login?",
        options: ["Nothing extra, it's just a longer password", "A second verification step, like a code sent to your phone", "A requirement to change your password daily", "A CAPTCHA only"], correct: 1,
        explanation: "2FA requires a second piece of proof (like a code texted to your phone) in addition to your password, making accounts much harder to break into." }
        ]
      },
      {
        name: "Part 2",
        questions: [
          { q: "Why should you be cautious about public Wi-Fi (like at a coffee shop)?",
        options: ["It's always slower", "Data sent over unsecured public networks can potentially be intercepted", "It costs extra money", "It doesn't actually exist"], correct: 1,
        explanation: "Public Wi-Fi networks are often less secure, meaning data you send could potentially be intercepted by someone else on the same network." },
          { q: "What's a reasonable habit for protecting your privacy online?",
        options: ["Sharing your full address publicly for convenience", "Reviewing privacy settings on apps and limiting what you share publicly", "Using the same password everywhere", "Clicking every link in emails"], correct: 1,
        explanation: "Regularly reviewing what you share and adjusting privacy settings is one of the simplest ways to reduce your exposure to privacy risks." }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What makes a password strong?",
        options: ["Using your name and birthday", "Length, and a mix of letters, numbers, and symbols", "Using the same password everywhere for consistency", "Keeping it short so you remember it"], correct: 1,
        explanation: "Strong passwords are long and combine different character types, making them much harder to guess or crack." },
          { q: "What is 'phishing'?",
        options: ["A type of computer virus that damages hardware", "A trick where someone impersonates a trusted source to steal your information", "A way to speed up your internet", "A type of software update"], correct: 1,
        explanation: "Phishing is a scam where an attacker pretends to be someone trustworthy (like a bank or company) to trick you into giving up personal information." },
          { q: "What does two-factor authentication (2FA) add to a login?",
        options: ["Nothing extra, it's just a longer password", "A second verification step, like a code sent to your phone", "A requirement to change your password daily", "A CAPTCHA only"], correct: 1,
        explanation: "2FA requires a second piece of proof (like a code texted to your phone) in addition to your password, making accounts much harder to break into." },
          { q: "Why should you be cautious about public Wi-Fi (like at a coffee shop)?",
        options: ["It's always slower", "Data sent over unsecured public networks can potentially be intercepted", "It costs extra money", "It doesn't actually exist"], correct: 1,
        explanation: "Public Wi-Fi networks are often less secure, meaning data you send could potentially be intercepted by someone else on the same network." },
          { q: "What's a reasonable habit for protecting your privacy online?",
        options: ["Sharing your full address publicly for convenience", "Reviewing privacy settings on apps and limiting what you share publicly", "Using the same password everywhere", "Clicking every link in emails"], correct: 1,
        explanation: "Regularly reviewing what you share and adjusting privacy settings is one of the simplest ways to reduce your exposure to privacy risks." }
        ]
      }
    ]
  },
  {
    name: "Emerging Technology",
    lessons: [
      {
        name: "Part 1",
        questions: [
          { q: "What does AI (Artificial Intelligence) generally refer to?",
        options: ["Robots that look like humans", "Computer systems designed to perform tasks that typically require human intelligence", "A type of computer virus", "Only chatbots"], correct: 1,
        explanation: "AI refers broadly to computer systems designed to perform tasks — like recognizing images, understanding language, or making predictions — that typically require human-like intelligence." },
          { q: "What's the difference between Virtual Reality (VR) and Augmented Reality (AR)?",
        options: ["They are the same thing", "VR replaces your view with a fully digital world; AR overlays digital elements onto the real world", "AR is only for games; VR is only for work", "VR doesn't need a headset"], correct: 1,
        explanation: "VR immerses you in a completely simulated environment, while AR adds digital elements on top of what you actually see in the real world." },
          { q: "What is an example of automation in everyday life?",
        options: ["Manually writing a letter", "A robot vacuum that cleans floors on a schedule without being told each time", "Reading a physical book", "Turning a light switch on by hand"], correct: 1,
        explanation: "Automation means a task happens on its own, without a person actively doing it each time — like a robot vacuum running on a set schedule." }
        ]
      },
      {
        name: "Part 2",
        questions: [
          { q: "What is the 'Internet of Things' (IoT)?",
        options: ["A single giant computer", "A network of everyday physical devices connected to the internet, like smart fridges or thermostats", "A social media platform", "An outdated technology no longer used"], correct: 1,
        explanation: "IoT refers to the growing network of everyday physical objects — appliances, thermostats, wearables — that connect to the internet and can communicate data." },
          { q: "Why is it important to think critically about new technology, not just adopt it blindly?",
        options: ["New technology is always bad", "New tools can bring real benefits but also new risks (privacy, security, dependency) worth weighing", "Old technology is always better", "Critical thinking isn't relevant to technology"], correct: 1,
        explanation: "New technology often brings real benefits, but also new trade-offs — like privacy concerns or new security risks — that are worth thinking through rather than ignoring." }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What does AI (Artificial Intelligence) generally refer to?",
        options: ["Robots that look like humans", "Computer systems designed to perform tasks that typically require human intelligence", "A type of computer virus", "Only chatbots"], correct: 1,
        explanation: "AI refers broadly to computer systems designed to perform tasks — like recognizing images, understanding language, or making predictions — that typically require human-like intelligence." },
          { q: "What's the difference between Virtual Reality (VR) and Augmented Reality (AR)?",
        options: ["They are the same thing", "VR replaces your view with a fully digital world; AR overlays digital elements onto the real world", "AR is only for games; VR is only for work", "VR doesn't need a headset"], correct: 1,
        explanation: "VR immerses you in a completely simulated environment, while AR adds digital elements on top of what you actually see in the real world." },
          { q: "What is an example of automation in everyday life?",
        options: ["Manually writing a letter", "A robot vacuum that cleans floors on a schedule without being told each time", "Reading a physical book", "Turning a light switch on by hand"], correct: 1,
        explanation: "Automation means a task happens on its own, without a person actively doing it each time — like a robot vacuum running on a set schedule." },
          { q: "What is the 'Internet of Things' (IoT)?",
        options: ["A single giant computer", "A network of everyday physical devices connected to the internet, like smart fridges or thermostats", "A social media platform", "An outdated technology no longer used"], correct: 1,
        explanation: "IoT refers to the growing network of everyday physical objects — appliances, thermostats, wearables — that connect to the internet and can communicate data." },
          { q: "Why is it important to think critically about new technology, not just adopt it blindly?",
        options: ["New technology is always bad", "New tools can bring real benefits but also new risks (privacy, security, dependency) worth weighing", "Old technology is always better", "Critical thinking isn't relevant to technology"], correct: 1,
        explanation: "New technology often brings real benefits, but also new trade-offs — like privacy concerns or new security risks — that are worth thinking through rather than ignoring." }
        ]
      }
    ]
  },
  {
    name: "Technology and Society",
    lessons: [
      {
        name: "Part 1",
        questions: [
          { q: "What is the 'digital divide'?",
        options: ["A disagreement between programmers", "The gap between people who have reliable access to technology/internet and those who don't", "A type of computer error", "The difference between Mac and Windows"], correct: 1,
        explanation: "The digital divide refers to the gap between people with good access to technology and reliable internet, and those without — which can affect education, jobs, and more." },
          { q: "How has technology changed how many people work?",
        options: ["It has had no effect on work at all", "It enables remote work, instant communication, and new types of jobs that didn't exist before", "It has eliminated the need to work altogether", "It only affects office jobs"], correct: 1,
        explanation: "Technology enables remote work, instant global communication, and has created entirely new categories of jobs that didn't exist a generation ago." },
          { q: "What is a potential downside of heavy social media use that researchers study?",
        options: ["It has no downsides at all", "Effects on attention, sleep, and mental well-being are actively studied areas of concern", "It always improves mental health", "It's only a concern for older adults"], correct: 1,
        explanation: "Researchers actively study how heavy social media use may affect attention span, sleep patterns, and mental well-being, among other areas." }
        ]
      },
      {
        name: "Part 2",
        questions: [
          { q: "Why might a company need to think about ethics when building new technology?",
        options: ["Ethics don't apply to technology", "New tech (like AI or data collection tools) can affect privacy, fairness, and safety at a large scale", "Only governments need to think about ethics", "It doesn't matter unless something breaks"], correct: 1,
        explanation: "Because new technologies can affect huge numbers of people at once, thinking through fairness, privacy, and safety during development matters a lot." },
          { q: "What's one way technology has changed access to education?",
        options: ["It has made education less accessible everywhere", "Online courses and resources let many more people learn topics remotely, sometimes for free", "It has replaced all teachers", "It only helps people who already have degrees"], correct: 1,
        explanation: "Online courses, videos, and resources have made it possible for many more people to access learning materials remotely, often at low or no cost." }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What is the 'digital divide'?",
        options: ["A disagreement between programmers", "The gap between people who have reliable access to technology/internet and those who don't", "A type of computer error", "The difference between Mac and Windows"], correct: 1,
        explanation: "The digital divide refers to the gap between people with good access to technology and reliable internet, and those without — which can affect education, jobs, and more." },
          { q: "How has technology changed how many people work?",
        options: ["It has had no effect on work at all", "It enables remote work, instant communication, and new types of jobs that didn't exist before", "It has eliminated the need to work altogether", "It only affects office jobs"], correct: 1,
        explanation: "Technology enables remote work, instant global communication, and has created entirely new categories of jobs that didn't exist a generation ago." },
          { q: "What is a potential downside of heavy social media use that researchers study?",
        options: ["It has no downsides at all", "Effects on attention, sleep, and mental well-being are actively studied areas of concern", "It always improves mental health", "It's only a concern for older adults"], correct: 1,
        explanation: "Researchers actively study how heavy social media use may affect attention span, sleep patterns, and mental well-being, among other areas." },
          { q: "Why might a company need to think about ethics when building new technology?",
        options: ["Ethics don't apply to technology", "New tech (like AI or data collection tools) can affect privacy, fairness, and safety at a large scale", "Only governments need to think about ethics", "It doesn't matter unless something breaks"], correct: 1,
        explanation: "Because new technologies can affect huge numbers of people at once, thinking through fairness, privacy, and safety during development matters a lot." },
          { q: "What's one way technology has changed access to education?",
        options: ["It has made education less accessible everywhere", "Online courses and resources let many more people learn topics remotely, sometimes for free", "It has replaced all teachers", "It only helps people who already have degrees"], correct: 1,
        explanation: "Online courses, videos, and resources have made it possible for many more people to access learning materials remotely, often at low or no cost." }
        ]
      }
    ]
  }


  ],
  "coding": [
  {
    name: "Thinking Like a Programmer",
    lessons: [
      {
        name: "Part 1",
        questions: [
          { q: "What is 'decomposition' in programming?",
        options: ["Deleting old code", "Breaking a big problem into smaller, manageable pieces", "A type of computer virus", "Compressing a file"], correct: 1,
        explanation: "Decomposition means breaking a complex problem down into smaller, easier-to-solve pieces — a core programming skill." },
          { q: "What is 'pseudocode'?",
        options: ["Code written in a fake programming language that doesn't run", "A plain-language outline of a program's logic, before writing real code", "Broken code", "A type of error message"], correct: 1,
        explanation: "Pseudocode is a way of planning out a program's logic in plain, informal language before translating it into actual code." },
          { q: "Why do programmers plan out steps before writing code?",
        options: ["It's not actually helpful", "Planning helps catch logic problems early, before they're harder to fix in code", "It's required by law", "Only beginners need to plan"], correct: 1,
        explanation: "Planning out the logic first helps catch mistakes and gaps in thinking before they're buried inside actual code, where they're often harder to spot." }
        ]
      },
      {
        name: "Part 2",
        questions: [
          { q: "What does it mean to 'debug' a program?",
        options: ["Writing new features", "Finding and fixing errors in code", "Deleting the whole program", "Making the code run slower"], correct: 1,
        explanation: "Debugging means finding and fixing errors ('bugs') in a program so it behaves the way it's supposed to." },
          { q: "If a recipe told you to 'add sugar until it tastes sweet enough,' what programming concept does this resemble?",
        options: ["A variable", "A loop that repeats until a condition is met", "A syntax error", "A file"], correct: 1,
        explanation: "This resembles a loop that keeps repeating an action ('add sugar') until a condition ('sweet enough') is satisfied — a core programming pattern." }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What is 'decomposition' in programming?",
        options: ["Deleting old code", "Breaking a big problem into smaller, manageable pieces", "A type of computer virus", "Compressing a file"], correct: 1,
        explanation: "Decomposition means breaking a complex problem down into smaller, easier-to-solve pieces — a core programming skill." },
          { q: "What is 'pseudocode'?",
        options: ["Code written in a fake programming language that doesn't run", "A plain-language outline of a program's logic, before writing real code", "Broken code", "A type of error message"], correct: 1,
        explanation: "Pseudocode is a way of planning out a program's logic in plain, informal language before translating it into actual code." },
          { q: "Why do programmers plan out steps before writing code?",
        options: ["It's not actually helpful", "Planning helps catch logic problems early, before they're harder to fix in code", "It's required by law", "Only beginners need to plan"], correct: 1,
        explanation: "Planning out the logic first helps catch mistakes and gaps in thinking before they're buried inside actual code, where they're often harder to spot." },
          { q: "What does it mean to 'debug' a program?",
        options: ["Writing new features", "Finding and fixing errors in code", "Deleting the whole program", "Making the code run slower"], correct: 1,
        explanation: "Debugging means finding and fixing errors ('bugs') in a program so it behaves the way it's supposed to." },
          { q: "If a recipe told you to 'add sugar until it tastes sweet enough,' what programming concept does this resemble?",
        options: ["A variable", "A loop that repeats until a condition is met", "A syntax error", "A file"], correct: 1,
        explanation: "This resembles a loop that keeps repeating an action ('add sugar') until a condition ('sweet enough') is satisfied — a core programming pattern." }
        ]
      }
    ]
  },
  {
    name: "Variables & Data",
    lessons: [
      {
        name: "Part 1",
        questions: [
          { q: "What is a variable in programming?",
        options: ["A fixed number that never changes", "A named container that stores a value which can change", "A type of error", "A programming language"], correct: 1,
        explanation: "A variable is a named container for storing data — its value can be set and changed as the program runs." },
          { q: "Which of these is most likely a 'string' data type?",
        options: ["42", "\"Hello, world!\"", "true", "3.14"], correct: 1,
        explanation: "A string is text data, typically written inside quotes, like \"Hello, world!\"." },
          { q: "Which of these is most likely a 'boolean' data type?",
        options: ["\"cat\"", "17", "true", "3.5"], correct: 2,
        explanation: "A boolean holds one of exactly two values: true or false." }
        ]
      },
      {
        name: "Part 2",
        questions: [
          { q: "What data type would best store the number of items in a shopping cart?",
        options: ["String", "Boolean", "Integer (a whole number)", "None of these"], correct: 2,
        explanation: "A count of items is a whole number, so an integer is the natural data type to use." },
          { q: "If a variable named `score` currently holds 10, what happens after the code `score = score + 5`?",
        options: ["score becomes 5", "score becomes 15", "score stays 10", "This causes an error"], correct: 1,
        explanation: "The code takes the current value of score (10), adds 5, and stores the new result (15) back into score." }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What is a variable in programming?",
        options: ["A fixed number that never changes", "A named container that stores a value which can change", "A type of error", "A programming language"], correct: 1,
        explanation: "A variable is a named container for storing data — its value can be set and changed as the program runs." },
          { q: "Which of these is most likely a 'string' data type?",
        options: ["42", "\"Hello, world!\"", "true", "3.14"], correct: 1,
        explanation: "A string is text data, typically written inside quotes, like \"Hello, world!\"." },
          { q: "Which of these is most likely a 'boolean' data type?",
        options: ["\"cat\"", "17", "true", "3.5"], correct: 2,
        explanation: "A boolean holds one of exactly two values: true or false." },
          { q: "What data type would best store the number of items in a shopping cart?",
        options: ["String", "Boolean", "Integer (a whole number)", "None of these"], correct: 2,
        explanation: "A count of items is a whole number, so an integer is the natural data type to use." },
          { q: "If a variable named `score` currently holds 10, what happens after the code `score = score + 5`?",
        options: ["score becomes 5", "score becomes 15", "score stays 10", "This causes an error"], correct: 1,
        explanation: "The code takes the current value of score (10), adds 5, and stores the new result (15) back into score." }
        ]
      }
    ]
  },
  {
    name: "Conditionals & Logic",
    lessons: [
      {
        name: "Part 1",
        questions: [
          { q: "What does an 'if' statement do in code?",
        options: ["Repeats a block of code forever", "Runs a block of code only when a condition is true", "Stores a value", "Deletes a variable"], correct: 1,
        explanation: "An 'if' statement checks a condition and only runs its block of code when that condition is true." },
          { q: "What is the purpose of an 'else' branch?",
        options: ["It runs when the 'if' condition is false", "It always runs no matter what", "It stops the program", "It only works with loops"], correct: 0,
        explanation: "The 'else' branch provides an alternative block of code to run specifically when the 'if' condition turns out to be false." },
          { q: "What does the logical operator AND require to be true?",
        options: ["At least one condition is true", "All combined conditions must be true", "No conditions can be true", "Exactly one condition is true"], correct: 1,
        explanation: "AND requires every condition being combined to be true for the whole expression to be true." }
        ]
      },
      {
        name: "Part 2",
        questions: [
          { q: "What does the logical operator OR require to be true?",
        options: ["All conditions must be true", "At least one of the conditions must be true", "None of the conditions can be true", "Exactly two conditions"], correct: 1,
        explanation: "OR is true as long as at least one of the combined conditions is true." },
          { q: "If `age >= 18` is the condition, what does this check?",
        options: ["Whether age is exactly 18", "Whether age is 18 or greater", "Whether age is less than 18", "Whether age is a string"], correct: 1,
        explanation: ">= means 'greater than or equal to,' so this checks whether age is 18 or any number above it." }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What does an 'if' statement do in code?",
        options: ["Repeats a block of code forever", "Runs a block of code only when a condition is true", "Stores a value", "Deletes a variable"], correct: 1,
        explanation: "An 'if' statement checks a condition and only runs its block of code when that condition is true." },
          { q: "What is the purpose of an 'else' branch?",
        options: ["It runs when the 'if' condition is false", "It always runs no matter what", "It stops the program", "It only works with loops"], correct: 0,
        explanation: "The 'else' branch provides an alternative block of code to run specifically when the 'if' condition turns out to be false." },
          { q: "What does the logical operator AND require to be true?",
        options: ["At least one condition is true", "All combined conditions must be true", "No conditions can be true", "Exactly one condition is true"], correct: 1,
        explanation: "AND requires every condition being combined to be true for the whole expression to be true." },
          { q: "What does the logical operator OR require to be true?",
        options: ["All conditions must be true", "At least one of the conditions must be true", "None of the conditions can be true", "Exactly two conditions"], correct: 1,
        explanation: "OR is true as long as at least one of the combined conditions is true." },
          { q: "If `age >= 18` is the condition, what does this check?",
        options: ["Whether age is exactly 18", "Whether age is 18 or greater", "Whether age is less than 18", "Whether age is a string"], correct: 1,
        explanation: ">= means 'greater than or equal to,' so this checks whether age is 18 or any number above it." }
        ]
      }
    ]
  },
  {
    name: "Loops in Practice",
    lessons: [
      {
        name: "Part 1",
        questions: [
          { q: "What is a loop used for in programming?",
        options: ["Storing a single value", "Repeating a block of code multiple times", "Deleting code", "Connecting to the internet"], correct: 1,
        explanation: "Loops let you repeat a block of code multiple times without writing it out over and over by hand." },
          { q: "A 'for' loop that runs 'for each number from 1 to 5' will run how many times?",
        options: ["4", "5", "6", "It runs forever"], correct: 1,
        explanation: "Counting 1, 2, 3, 4, 5 gives exactly 5 iterations." },
          { q: "What is a 'while' loop's defining feature?",
        options: ["It always runs exactly once", "It keeps repeating as long as a condition stays true", "It never checks any condition", "It only works with numbers"], correct: 1,
        explanation: "A while loop keeps repeating its block of code as long as its condition remains true, checking the condition before each repeat." }
        ]
      },
      {
        name: "Part 2",
        questions: [
          { q: "What is an 'infinite loop'?",
        options: ["A loop that runs exactly 100 times", "A loop whose condition never becomes false, so it never stops", "A type of syntax error", "A loop with no code inside it"], correct: 1,
        explanation: "An infinite loop happens when the stopping condition never becomes false, causing the loop to run forever (usually a bug, unless intentional)." },
          { q: "If you wanted to print \"Hi\" exactly 3 times, which approach makes sense?",
        options: ["Write the print statement 3 separate times", "Use a loop that repeats 3 times", "Both of these would work, but a loop scales better if the number changes", "Neither would work"], correct: 2,
        explanation: "Both approaches technically work for exactly 3 times, but a loop is far more practical if that number might change or grow much larger." }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What is a loop used for in programming?",
        options: ["Storing a single value", "Repeating a block of code multiple times", "Deleting code", "Connecting to the internet"], correct: 1,
        explanation: "Loops let you repeat a block of code multiple times without writing it out over and over by hand." },
          { q: "A 'for' loop that runs 'for each number from 1 to 5' will run how many times?",
        options: ["4", "5", "6", "It runs forever"], correct: 1,
        explanation: "Counting 1, 2, 3, 4, 5 gives exactly 5 iterations." },
          { q: "What is a 'while' loop's defining feature?",
        options: ["It always runs exactly once", "It keeps repeating as long as a condition stays true", "It never checks any condition", "It only works with numbers"], correct: 1,
        explanation: "A while loop keeps repeating its block of code as long as its condition remains true, checking the condition before each repeat." },
          { q: "What is an 'infinite loop'?",
        options: ["A loop that runs exactly 100 times", "A loop whose condition never becomes false, so it never stops", "A type of syntax error", "A loop with no code inside it"], correct: 1,
        explanation: "An infinite loop happens when the stopping condition never becomes false, causing the loop to run forever (usually a bug, unless intentional)." },
          { q: "If you wanted to print \"Hi\" exactly 3 times, which approach makes sense?",
        options: ["Write the print statement 3 separate times", "Use a loop that repeats 3 times", "Both of these would work, but a loop scales better if the number changes", "Neither would work"], correct: 2,
        explanation: "Both approaches technically work for exactly 3 times, but a loop is far more practical if that number might change or grow much larger." }
        ]
      }
    ]
  },
  {
    name: "Functions & Reusability",
    lessons: [
      {
        name: "Part 1",
        questions: [
          { q: "What is a function in programming?",
        options: ["A single fixed number", "A named, reusable block of code that performs a specific task", "A type of data storage only", "An error message"], correct: 1,
        explanation: "A function is a reusable, named block of code designed to perform a specific task — you can call it whenever you need that task done." },
          { q: "Why are functions useful for avoiding repeated code?",
        options: ["They aren't useful for this", "You can write the logic once and call the function wherever it's needed", "Functions make code run slower on purpose", "They only work one time each"], correct: 1,
        explanation: "Writing logic once inside a function, then calling it wherever needed, avoids copy-pasting the same code repeatedly throughout a program." },
          { q: "What are 'parameters' in a function?",
        options: ["Random numbers a function generates", "Inputs a function accepts to customize what it does", "Errors the function might throw", "Comments inside the code"], correct: 1,
        explanation: "Parameters are the inputs a function accepts, letting the same function behave differently based on what's passed in." }
        ]
      },
      {
        name: "Part 2",
        questions: [
          { q: "What does it mean for a function to 'return' a value?",
        options: ["It deletes the value", "It sends a result back to whoever called the function", "It prints the value to the screen only", "It stores the value forever"], correct: 1,
        explanation: "Returning a value means the function sends a result back to the code that called it, so that result can be used elsewhere." },
          { q: "If you have a function `double(x)` that returns x multiplied by 2, what does `double(7)` return?",
        options: ["7", "9", "14", "49"], correct: 2,
        explanation: "double(7) multiplies 7 by 2, returning 14." }
        ]
      },
      {
        name: "Chapter Challenge",
        isChallenge: true,
        questions: [
          { q: "What is a function in programming?",
        options: ["A single fixed number", "A named, reusable block of code that performs a specific task", "A type of data storage only", "An error message"], correct: 1,
        explanation: "A function is a reusable, named block of code designed to perform a specific task — you can call it whenever you need that task done." },
          { q: "Why are functions useful for avoiding repeated code?",
        options: ["They aren't useful for this", "You can write the logic once and call the function wherever it's needed", "Functions make code run slower on purpose", "They only work one time each"], correct: 1,
        explanation: "Writing logic once inside a function, then calling it wherever needed, avoids copy-pasting the same code repeatedly throughout a program." },
          { q: "What are 'parameters' in a function?",
        options: ["Random numbers a function generates", "Inputs a function accepts to customize what it does", "Errors the function might throw", "Comments inside the code"], correct: 1,
        explanation: "Parameters are the inputs a function accepts, letting the same function behave differently based on what's passed in." },
          { q: "What does it mean for a function to 'return' a value?",
        options: ["It deletes the value", "It sends a result back to whoever called the function", "It prints the value to the screen only", "It stores the value forever"], correct: 1,
        explanation: "Returning a value means the function sends a result back to the code that called it, so that result can be used elsewhere." },
          { q: "If you have a function `double(x)` that returns x multiplied by 2, what does `double(7)` return?",
        options: ["7", "9", "14", "49"], correct: 2,
        explanation: "double(7) multiplies 7 by 2, returning 14." }
        ]
      }
    ]
  }


  ],
};

const QUESTION_BANK = {
  math: [
    [
      { q: "What is 7 × 8?", options: ["54", "56", "64", "48"], correct: 1,
        explanation: "7 × 8 means adding 7 eight times: 7+7+7+7+7+7+7+7 = 56." },
      { q: "What is the square root of 144?", options: ["11", "12", "13", "14"], correct: 1,
        explanation: "12 × 12 = 144, so the square root of 144 is 12." },
      { q: "What is 15% of 200?", options: ["20", "25", "30", "35"], correct: 2,
        explanation: "15% means 15 out of 100. Multiply: 200 × 0.15 = 30." },
      { q: "What is 9² (9 squared)?", options: ["18", "72", "81", "99"], correct: 2,
        explanation: "A number squared means multiplying it by itself: 9 × 9 = 81." },
      { q: "What is the area of a rectangle 4cm by 9cm?", options: ["13 cm²", "26 cm²", "36 cm²", "40 cm²"], correct: 2,
        explanation: "Area of a rectangle = length × width = 4 × 9 = 36 cm²." },
      { q: "What is 12 + 15?", options: ["25", "26", "27", "28"], correct: 2,
        explanation: "12 + 15 = 27, adding the two numbers directly." },
      { q: "What is 100 ÷ 4?", options: ["20", "25", "30", "40"], correct: 1,
        explanation: "100 divided by 4 equals 25, since 4 × 25 = 100." },
      { q: "What is 3 × 3 × 3?", options: ["9", "18", "27", "36"], correct: 2,
        explanation: "3 × 3 = 9, then 9 × 3 = 27." },
      { q: "Which of these numbers is a prime number?", options: ["4", "6", "7", "9"], correct: 2,
        explanation: "A prime number has exactly two factors, 1 and itself. 7 is only divisible by 1 and 7." },
      { q: "What is 1/2 + 1/4?", options: ["1/6", "2/6", "3/4", "1/8"], correct: 2,
        explanation: "Convert 1/2 to 2/4, then 2/4 + 1/4 = 3/4." },
      { q: "What is 6 × 9?", options: ["45", "52", "54", "56"], correct: 2,
        explanation: "6 × 9 = 54, since 6 groups of 9 add up to 54." },
      { q: "What is 81 ÷ 9?", options: ["7", "8", "9", "11"], correct: 2,
        explanation: "9 × 9 = 81, so 81 ÷ 9 = 9." },
      { q: "What is 25% of 80?", options: ["15", "20", "25", "30"], correct: 1,
        explanation: "25% is the same as 1/4, and 80 ÷ 4 = 20." },
      { type: "balance", q: "Balance the scale: x + 4 = 10. Which weight for x makes it balance?",
        leftLabel: "x + 4", rightValue: 10, correct: 6, weights: [4, 5, 6, 7, 8],
        explanation: "To balance x + 4 = 10, subtract 4 from both sides: x = 10 − 4 = 6." }
    ],
    [
      { q: "Solve for x: 2x + 5 = 17", options: ["5", "6", "7", "8"], correct: 1,
        explanation: "Subtract 5 from both sides: 2x = 12. Then divide both sides by 2: x = 6." },
      { q: "What is the perimeter of a square with side length 6cm?", options: ["12", "18", "24", "36"], correct: 2,
        explanation: "Perimeter of a square = 4 × side = 4 × 6 = 24 cm." },
      { q: "Simplify: 3(x + 4)", options: ["3x + 4", "3x + 12", "x + 12", "3x + 7"], correct: 1,
        explanation: "Distribute the 3 across (x + 4): 3 × x = 3x, and 3 × 4 = 12, giving 3x + 12." },
      { q: "What is the value of 5! (5 factorial)?", options: ["20", "60", "120", "150"], correct: 2,
        explanation: "5! means 5 × 4 × 3 × 2 × 1 = 120." },
      { q: "If a triangle has angles 50° and 60°, what is the third angle?", options: ["60°", "70°", "80°", "90°"], correct: 1,
        explanation: "The angles in a triangle always sum to 180°. 180 − 50 − 60 = 70°." },
      { q: "What is 20% of 150?", options: ["20", "25", "30", "35"], correct: 2,
        explanation: "20% of 150 = 150 × 0.20 = 30." },
      { q: "Solve for y: y/3 = 9", options: ["3", "12", "27", "36"], correct: 2,
        explanation: "Multiply both sides by 3: y = 9 × 3 = 27." },
      { q: "What is the circumference of a circle with radius 5? (use π ≈ 3.14)", options: ["15.7", "31.4", "62.8", "78.5"], correct: 1,
        explanation: "Circumference = 2πr = 2 × 3.14 × 5 = 31.4." },
      { q: "Simplify: 4x − 2x + 6", options: ["2x + 6", "6x + 6", "2x − 6", "4x + 6"], correct: 0,
        explanation: "Combine like terms: 4x − 2x = 2x, so the result is 2x + 6." },
      { q: "What is the median of the numbers 3, 7, 9, 12, 15?", options: ["7", "9", "10", "12"], correct: 1,
        explanation: "The median is the middle value when numbers are ordered. Here, 9 sits exactly in the middle of the 5 values." },
      { q: "Solve for x: 5x − 3 = 22", options: ["4", "5", "6", "7"], correct: 1,
        explanation: "Add 3 to both sides: 5x = 25. Divide both sides by 5: x = 5." },
      { q: "What is the least common multiple (LCM) of 4 and 6?", options: ["8", "10", "12", "24"], correct: 2,
        explanation: "12 is the smallest number that both 4 and 6 divide into evenly (4×3=12, 6×2=12)." },
      { q: "A rectangle has an area of 48 cm² and a width of 6 cm. What is its length?", options: ["6 cm", "7 cm", "8 cm", "9 cm"], correct: 2,
        explanation: "Area = length × width, so length = area ÷ width = 48 ÷ 6 = 8 cm." },
      { type: "balance", q: "Balance the scale: 2x = 14. Which weight for x makes it balance?",
        leftLabel: "2x", rightValue: 14, correct: 7, weights: [5, 6, 7, 8, 9],
        explanation: "To balance 2x = 14, divide both sides by 2: x = 14 ÷ 2 = 7." }
    ],
    [
      { q: "Solve: x² = 49. What are the possible values of x?", options: ["7 only", "-7 only", "7 and -7", "49"], correct: 2,
        explanation: "Both 7 × 7 = 49 and (-7) × (-7) = 49, so x can be either 7 or -7." },
      { q: "What is the slope of the line through points (2,3) and (4,7)?", options: ["1", "2", "3", "4"], correct: 1,
        explanation: "Slope = (y₂ − y₁) / (x₂ − x₁) = (7 − 3) / (4 − 2) = 4 / 2 = 2." },
      { q: "Simplify: (2x²)(3x³)", options: ["5x⁵", "6x⁵", "6x⁶", "5x⁶"], correct: 1,
        explanation: "Multiply the coefficients (2 × 3 = 6) and add the exponents (2 + 3 = 5), giving 6x⁵." },
      { q: "What is the sum of the interior angles of a hexagon?", options: ["360°", "540°", "720°", "900°"], correct: 2,
        explanation: "Sum of interior angles = (n − 2) × 180°. For a hexagon, n = 6: (6 − 2) × 180° = 720°." },
      { q: "Solve for x: log₂(x) = 5", options: ["10", "16", "25", "32"], correct: 3,
        explanation: "log₂(x) = 5 means 2⁵ = x, and 2⁵ = 32." },
      { q: "What is the derivative of x² with respect to x?", options: ["x", "2x", "x²", "2"], correct: 1,
        explanation: "Using the power rule, the derivative of xⁿ is n·x^(n-1); for x², that's 2x¹ = 2x." },
      { q: "What is the value of sin(90°)?", options: ["0", "0.5", "1", "Undefined"], correct: 2,
        explanation: "sin(90°) equals 1, the maximum value of the sine function." },
      { q: "Solve the system: x + y = 10, x − y = 2. What is x?", options: ["4", "5", "6", "8"], correct: 2,
        explanation: "Adding both equations: 2x = 12, so x = 6 (and y = 4)." },
      { q: "What is the probability of rolling a sum of 7 with two six-sided dice?", options: ["1/6", "1/12", "5/36", "1/36"], correct: 0,
        explanation: "6 combinations sum to 7 (1+6, 2+5, 3+4, 4+3, 5+2, 6+1) out of 36 total outcomes: 6/36 = 1/6." },
      { q: "What is the quadratic formula used to solve ax² + bx + c = 0?", options: ["x = (−b ± √(b²−4ac)) / 2a", "x = −b / 2a", "x = b² − 4ac", "x = (−b + c) / a"], correct: 0,
        explanation: "The quadratic formula, x = (−b ± √(b²−4ac)) / 2a, gives the solutions to any quadratic equation in standard form." },
      { type: "slope-drag", q: "Drag the point so the line through the origin has a slope of 2.",
        fixedPoint: { x: 0, y: 0 }, targetSlope: 2,
        explanation: "Slope = rise/run. A slope of 2 means for every 1 unit you move right, the line rises 2 units — for example, passing through (1,2) or (2,4)." },
      { q: "What is the value of cos(60°)?", options: ["0", "0.5", "1", "√3/2"], correct: 1,
        explanation: "cos(60°) = 0.5 is a standard unit circle value worth memorizing." },
      { q: "Solve for x: 3ˣ = 81", options: ["3", "4", "5", "6"], correct: 1,
        explanation: "3⁴ = 81 (3×3×3×3), so x = 4." },
      { q: "What is the limit of (x² − 1) / (x − 1) as x approaches 1?", options: ["0", "1", "2", "Undefined"], correct: 2,
        explanation: "Factor the numerator as (x−1)(x+1). The (x−1) terms cancel, leaving x+1, which equals 2 when x approaches 1." },
      { q: "What is the integral of 2x dx?", options: ["x² + C", "2x² + C", "x + C", "2 + C"], correct: 0,
        explanation: "Integration reverses the power rule: the integral of 2x is x² + C, since the derivative of x² is 2x." }
    ]
  ],
  science: [
    [
      { q: "What planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1,
        explanation: "Mars appears reddish because its surface is covered in iron oxide, better known as rust." },
      { q: "What gas do plants absorb from the atmosphere for photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], correct: 2,
        explanation: "Plants take in carbon dioxide through tiny pores called stomata, using it with sunlight and water to produce glucose and oxygen." },
      { q: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correct: 2,
        explanation: "'Au' comes from 'aurum,' the Latin word for gold." },
      { q: "How many bones are in the adult human body?", options: ["186", "206", "226", "246"], correct: 1,
        explanation: "Babies are born with around 300 bones, many of which fuse together as they grow, leaving adults with 206." },
      { q: "What force pulls objects toward the Earth?", options: ["Magnetism", "Friction", "Gravity", "Tension"], correct: 2,
        explanation: "Gravity is the force of attraction between objects with mass — Earth's gravity pulls objects toward its center." },
      { q: "What is the closest star to Earth?", options: ["Proxima Centauri", "The Sun", "Sirius", "Alpha Centauri"], correct: 1,
        explanation: "The Sun is by far the closest star to Earth, about 150 million km away." },
      { q: "Which sense organ is used for hearing?", options: ["Eyes", "Ears", "Nose", "Skin"], correct: 1,
        explanation: "Ears detect sound waves and convert them into signals the brain interprets as hearing." },
      { q: "What do we call animals that only eat plants?", options: ["Carnivores", "Herbivores", "Omnivores", "Insectivores"], correct: 1,
        explanation: "Herbivores are animals whose diet consists mainly or entirely of plant material." },
      { q: "What is the freezing point of water in Celsius?", options: ["-10°", "0°", "10°", "32°"], correct: 1,
        explanation: "Water freezes at 0°C (32°F) at standard atmospheric pressure." },
      { q: "Which gas do humans need to breathe in to survive?", options: ["Carbon dioxide", "Nitrogen", "Oxygen", "Helium"], correct: 2,
        explanation: "Humans need oxygen for cellular respiration, which produces the energy our bodies use." },
      { q: "What is the largest organ in the human body?", options: ["Heart", "Liver", "Skin", "Brain"], correct: 2,
        explanation: "The skin is the body's largest organ, covering and protecting everything underneath it." },
      { q: "What do plants need, besides water and sunlight, to grow well?", options: ["Nutrients from soil", "Salt", "Sugar", "Only darkness"], correct: 0,
        explanation: "Plants absorb nutrients like nitrogen and phosphorus from the soil through their roots to support healthy growth." },
      { q: "What is the main function of the lungs?", options: ["Pumping blood", "Digesting food", "Exchanging oxygen and carbon dioxide", "Filtering waste"], correct: 2,
        explanation: "The lungs take in oxygen from the air and release carbon dioxide, a process called gas exchange." }
    ],
    [
      { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], correct: 2,
        explanation: "Mitochondria convert nutrients into ATP, the energy cells run on — hence the nickname." },
      { q: "What state of matter has a fixed volume but no fixed shape?", options: ["Solid", "Liquid", "Gas", "Plasma"], correct: 1,
        explanation: "Liquids keep a constant volume but take the shape of their container, unlike gases, which expand to fill any space." },
      { q: "What is the boiling point of water at sea level, in Celsius?", options: ["90°", "100°", "110°", "120°"], correct: 1,
        explanation: "At standard atmospheric pressure, water boils at 100°C (212°F)." },
      { q: "Which organ pumps blood through the body?", options: ["Liver", "Lungs", "Heart", "Kidney"], correct: 2,
        explanation: "The heart is a muscular organ that pumps blood through the circulatory system." },
      { q: "What type of energy is stored in a stretched rubber band?", options: ["Kinetic", "Potential", "Thermal", "Chemical"], correct: 1,
        explanation: "Stretched or compressed objects store elastic potential energy, released when they return to their original shape." },
      { q: "What is the main function of red blood cells?", options: ["Fight infection", "Carry oxygen", "Clot blood", "Digest food"], correct: 1,
        explanation: "Red blood cells contain hemoglobin, which binds to oxygen and carries it throughout the body." },
      { q: "What is the chemical formula for water?", options: ["CO2", "H2O", "O2", "NaCl"], correct: 1,
        explanation: "Water is made of two hydrogen atoms and one oxygen atom, giving the formula H2O." },
      { q: "What type of rock is formed from cooled lava or magma?", options: ["Sedimentary", "Metamorphic", "Igneous", "Fossil"], correct: 2,
        explanation: "Igneous rocks form when molten rock (lava or magma) cools and solidifies." },
      { q: "Which planet is known for its prominent rings?", options: ["Mars", "Saturn", "Mercury", "Venus"], correct: 1,
        explanation: "Saturn is famous for its extensive, visible ring system made mostly of ice and rock particles." },
      { q: "What is the process by which water changes from liquid to gas called?", options: ["Condensation", "Evaporation", "Precipitation", "Sublimation"], correct: 1,
        explanation: "Evaporation is when liquid water absorbs enough heat energy to turn into water vapor (gas)." },
      { q: "What is the function of white blood cells?", options: ["Carry oxygen", "Fight infection", "Clot wounds", "Digest nutrients"], correct: 1,
        explanation: "White blood cells are part of the immune system and help the body fight off infections and disease." },
      { q: "What gas makes up about 78% of Earth's atmosphere?", options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Hydrogen"], correct: 2,
        explanation: "Nitrogen makes up about 78% of Earth's atmosphere, with oxygen at about 21%." },
      { q: "What is the term for an animal that eats both plants and meat?", options: ["Herbivore", "Carnivore", "Omnivore", "Decomposer"], correct: 2,
        explanation: "Omnivores eat both plant and animal matter — humans, bears, and pigs are common examples." },
      { type: "sequence", q: "Put these steps of the water cycle in the correct order.",
        items: ["Evaporation from oceans and lakes", "Water vapor rises and cools", "Condensation forms clouds", "Precipitation falls as rain or snow"],
        explanation: "The water cycle begins with evaporation from bodies of water; the vapor rises and cools, condenses into clouds, and eventually falls back to Earth as precipitation." }
    ],
    [
      { q: "What is Newton's second law of motion?", options: ["F = ma", "E = mc²", "P = IV", "V = IR"], correct: 0,
        explanation: "Newton's second law states that force equals mass times acceleration (F = ma)." },
      { q: "What particle has a negative charge?", options: ["Proton", "Neutron", "Electron", "Photon"], correct: 2,
        explanation: "Electrons carry a negative electric charge and orbit the nucleus of an atom." },
      { q: "What process do cells use to divide and produce identical copies?", options: ["Meiosis", "Mitosis", "Osmosis", "Diffusion"], correct: 1,
        explanation: "Mitosis is the process where a cell divides to produce two genetically identical daughter cells." },
      { q: "What is the pH of a neutral solution?", options: ["0", "7", "10", "14"], correct: 1,
        explanation: "pH 7 is neutral; below 7 is acidic, and above 7 is basic (alkaline)." },
      { q: "What law states that energy cannot be created or destroyed, only transformed?", options: ["Law of Gravity", "Law of Conservation of Energy", "Newton's Third Law", "Law of Inertia"], correct: 1,
        explanation: "The Law of Conservation of Energy states energy can change form, but the total amount stays constant in an isolated system." },
      { q: "What is the speed of light in a vacuum (approximately)?", options: ["3×10⁵ km/s", "3×10⁸ m/s", "3×10³ m/s", "3×10⁸ km/s"], correct: 1,
        explanation: "Light travels at approximately 299,792,458 meters per second in a vacuum, commonly rounded to 3×10⁸ m/s." },
      { q: "What is the atomic number of an element determined by?", options: ["Number of neutrons", "Number of protons", "Number of electrons only", "Atomic mass"], correct: 1,
        explanation: "The atomic number is defined as the number of protons in an atom's nucleus, which determines the element." },
      { q: "What type of bond involves atoms sharing electrons?", options: ["Ionic bond", "Covalent bond", "Metallic bond", "Hydrogen bond"], correct: 1,
        explanation: "Covalent bonds form when atoms share pairs of electrons, common in molecules like water and methane." },
      { q: "What does Charles's Law describe?", options: ["The relationship between pressure and volume", "The relationship between a gas's volume and temperature", "The speed of chemical reactions", "The behavior of light"], correct: 1,
        explanation: "Charles's Law states that at constant pressure, a gas's volume is directly proportional to its temperature." },
      { q: "Which part of the brain is responsible for balance and coordination?", options: ["Cerebrum", "Cerebellum", "Medulla oblongata", "Hypothalamus"], correct: 1,
        explanation: "The cerebellum coordinates voluntary movements, posture, and balance." },
      { q: "What is the equation for kinetic energy?", options: ["KE = mv", "KE = ½mv²", "KE = mgh", "KE = Fd"], correct: 1,
        explanation: "Kinetic energy equals one-half times mass times velocity squared (KE = ½mv²)." },
      { q: "What is Avogadro's number, approximately?", options: ["6.02 × 10²³", "3.14 × 10⁸", "9.8 × 10¹⁰", "1.6 × 10⁻¹⁹"], correct: 0,
        explanation: "Avogadro's number, 6.02 × 10²³, is the number of particles in one mole of a substance." },
      { q: "What type of radioactive decay releases a helium nucleus?", options: ["Alpha decay", "Beta decay", "Gamma decay", "Neutron decay"], correct: 0,
        explanation: "Alpha decay releases an alpha particle, which is identical to a helium nucleus (2 protons, 2 neutrons)." },
      { q: "What is the process by which cells produce energy using oxygen called?", options: ["Fermentation", "Cellular respiration", "Photosynthesis", "Osmosis"], correct: 1,
        explanation: "Cellular respiration converts glucose and oxygen into usable energy (ATP), releasing carbon dioxide and water as byproducts." }
    ]
  ],
  history: [
    [
      { q: "In what year did World War II end?", options: ["1943", "1945", "1947", "1950"], correct: 1,
        explanation: "Germany surrendered in May 1945, and Japan surrendered in September 1945, ending the war." },
      { q: "Who was the first President of the United States?", options: ["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"], correct: 2,
        explanation: "George Washington served as the first U.S. President from 1789 to 1797, setting many precedents still followed today." },
      { q: "The ancient pyramids of Giza are located in which country?", options: ["Mexico", "Egypt", "Peru", "Sudan"], correct: 1,
        explanation: "The Giza pyramid complex was built as royal tombs for Egyptian pharaohs around 2500 BCE." },
      { q: "Which empire built the Colosseum?", options: ["Greek", "Roman", "Ottoman", "Persian"], correct: 1,
        explanation: "The Colosseum was completed around 80 CE under the Roman Empire and used for gladiator contests and public spectacles." },
      { q: "What wall divided a European city during the Cold War?", options: ["Vienna Wall", "Berlin Wall", "Warsaw Wall", "Prague Wall"], correct: 1,
        explanation: "The Berlin Wall divided East and West Berlin from 1961 to 1989, symbolizing the divide between communist and democratic Europe." },
      { q: "Which ancient civilization built the Great Wall?", options: ["Roman", "Chinese", "Egyptian", "Greek"], correct: 1,
        explanation: "The Great Wall of China was built over centuries by various Chinese dynasties to protect against invasions." },
      { q: "What year did Christopher Columbus first reach the Americas?", options: ["1392", "1492", "1592", "1692"], correct: 1,
        explanation: "Columbus's first voyage across the Atlantic reached the Americas in 1492." },
      { q: "Which country gifted the Statue of Liberty to the United States?", options: ["England", "France", "Spain", "Italy"], correct: 1,
        explanation: "France gave the Statue of Liberty to the U.S. in 1886 as a gift symbolizing friendship and liberty." },
      { q: "What was the name of the ship the Pilgrims sailed to America on?", options: ["Mayflower", "Santa Maria", "Endeavour", "Beagle"], correct: 0,
        explanation: "The Mayflower carried English Pilgrims to what is now Massachusetts in 1620." },
      { q: "Who was known as the 'Father of the Nation' in India?", options: ["Jawaharlal Nehru", "Mahatma Gandhi", "Indira Gandhi", "Subhas Chandra Bose"], correct: 1,
        explanation: "Mahatma Gandhi led India's independence movement through nonviolent resistance and is honored with that title." },
      { q: "What ancient wonder of the world stood in Egypt?", options: ["The Colosseum", "The Great Pyramid of Giza", "The Parthenon", "Stonehenge"], correct: 1,
        explanation: "The Great Pyramid of Giza is the only one of the original Seven Wonders of the Ancient World still standing." },
      { q: "Which country was the Roman Empire centered in?", options: ["Greece", "Italy", "Spain", "Turkey"], correct: 1,
        explanation: "The Roman Empire was centered in Italy, with Rome as its capital, before expanding across Europe, North Africa, and the Middle East." },
      { q: "What was the name of the ancient trade route connecting China and Europe?", options: ["The Silk Road", "The Amber Road", "The Spice Route", "The Royal Road"], correct: 0,
        explanation: "The Silk Road was a network of trade routes connecting China to the Mediterranean, used for trading silk, spices, and ideas." }
    ],
    [
      { q: "Who wrote the Declaration of Independence?", options: ["Thomas Jefferson", "Abraham Lincoln", "James Madison", "Alexander Hamilton"], correct: 0,
        explanation: "Thomas Jefferson drafted the Declaration in 1776, though the Continental Congress reviewed and edited it." },
      { q: "In what year did the Titanic sink?", options: ["1905", "1912", "1918", "1923"], correct: 1,
        explanation: "The RMS Titanic sank on April 15, 1912, after hitting an iceberg on its maiden voyage." },
      { q: "Which country was first to send a human into space?", options: ["USA", "Soviet Union", "China", "France"], correct: 1,
        explanation: "The Soviet Union sent Yuri Gagarin into orbit in 1961 — the first human in space." },
      { q: "The French Revolution began in what year?", options: ["1776", "1789", "1804", "1815"], correct: 1,
        explanation: "The French Revolution began in 1789, leading to the end of the monarchy and major political change in France." },
      { q: "Who was the leader of Nazi Germany during WWII?", options: ["Joseph Stalin", "Winston Churchill", "Adolf Hitler", "Benito Mussolini"], correct: 2,
        explanation: "Adolf Hitler led Nazi Germany from 1933 until his death in 1945." },
      { q: "What event triggered the start of World War I?", options: ["Assassination of Archduke Franz Ferdinand", "Attack on Pearl Harbor", "Sinking of the Lusitania", "The Treaty of Versailles"], correct: 0,
        explanation: "The 1914 assassination of Archduke Franz Ferdinand of Austria-Hungary set off the chain of events leading to WWI." },
      { q: "Which U.S. president issued the Emancipation Proclamation?", options: ["George Washington", "Abraham Lincoln", "Thomas Jefferson", "Andrew Jackson"], correct: 1,
        explanation: "Lincoln issued the Emancipation Proclamation in 1863, declaring enslaved people in Confederate states to be free." },
      { q: "What was the name of the period of economic hardship in the 1930s?", options: ["The Gilded Age", "The Great Depression", "The Industrial Revolution", "The Progressive Era"], correct: 1,
        explanation: "The Great Depression was a severe worldwide economic downturn beginning in 1929 and lasting through much of the 1930s." },
      { q: "Which explorer led the first expedition to circumnavigate the globe?", options: ["Vasco da Gama", "Ferdinand Magellan", "Christopher Columbus", "James Cook"], correct: 1,
        explanation: "Magellan's expedition (1519–1522), though he died partway through, was the first to circumnavigate the Earth." },
      { q: "What was the Berlin Airlift a response to?", options: ["A famine in Germany", "A Soviet blockade of West Berlin", "A civil war in Germany", "An earthquake"], correct: 1,
        explanation: "In 1948–49, the Allies airlifted supplies into West Berlin after the Soviet Union blockaded ground access to the city." },
      { q: "Which country was the first to grant women the right to vote nationally?", options: ["United States", "United Kingdom", "New Zealand", "France"], correct: 2,
        explanation: "New Zealand became the first self-governing country to grant women the right to vote, in 1893." },
      { q: "What was the main cause of the American Revolutionary War?", options: ["Religious persecution", "Taxation without representation", "A border dispute", "A trade agreement"], correct: 1,
        explanation: "American colonists rebelled largely over being taxed by the British Parliament without having elected representation in it." },
      { q: "Who was the first person to circumnavigate the globe (though he died partway through the voyage)?", options: ["Christopher Columbus", "Vasco da Gama", "Ferdinand Magellan", "James Cook"], correct: 2,
        explanation: "Ferdinand Magellan led the expedition that first circumnavigated the globe, though he was killed in the Philippines before it was completed." },
      { type: "sequence", q: "Put these World War II events in chronological order (earliest to latest).",
        items: ["Germany invades Poland (1939)", "Pearl Harbor attacked (1941)", "D-Day landings (1944)", "Japan surrenders (1945)"],
        explanation: "World War II began with Germany's invasion of Poland in 1939, expanded globally after the attack on Pearl Harbor in 1941, saw a major turning point with the D-Day landings in 1944, and ended with Japan's surrender in 1945." }
    ],
    [
      { q: "The Magna Carta, signed in 1215, primarily limited the power of whom?", options: ["The Pope", "The English king", "The French king", "Roman senators"], correct: 1,
        explanation: "The Magna Carta limited King John of England's power, establishing that even the king was subject to the law." },
      { q: "Which treaty formally ended World War I?", options: ["Treaty of Paris", "Treaty of Versailles", "Treaty of Rome", "Treaty of Vienna"], correct: 1,
        explanation: "The Treaty of Versailles, signed in 1919, formally ended World War I and imposed heavy penalties on Germany." },
      { q: "The Cold War was primarily a rivalry between which two powers?", options: ["USA and China", "USA and Soviet Union", "UK and Germany", "France and USSR"], correct: 1,
        explanation: "The Cold War (roughly 1947–1991) was a geopolitical rivalry between the United States and the Soviet Union." },
      { q: "What ancient civilization built Machu Picchu?", options: ["Aztec", "Maya", "Inca", "Olmec"], correct: 2,
        explanation: "Machu Picchu was built by the Inca civilization in the 15th century, in present-day Peru." },
      { q: "The Renaissance began in which country?", options: ["France", "England", "Italy", "Spain"], correct: 2,
        explanation: "The Renaissance began in Italy in the 14th century before spreading across Europe." },
      { q: "Which empire was ruled by Genghis Khan?", options: ["Ottoman Empire", "Mongol Empire", "Persian Empire", "Byzantine Empire"], correct: 1,
        explanation: "Genghis Khan founded and led the Mongol Empire, which became the largest contiguous land empire in history." },
      { q: "The Treaty of Tordesillas divided newly claimed lands between which two countries?", options: ["England and France", "Spain and Portugal", "Netherlands and England", "France and Portugal"], correct: 1,
        explanation: "The 1494 Treaty of Tordesillas divided lands outside Europe between Spain and Portugal along a meridian line." },
      { q: "What is generally considered the primary cause of the fall of the Western Roman Empire?", options: ["A single major battle", "A combination of invasions, economic troubles, and political instability", "A volcanic eruption", "A plague alone"], correct: 1,
        explanation: "Historians generally attribute Rome's fall to a combination of factors — barbarian invasions, economic decline, and political corruption — rather than one single cause." },
      { q: "The Opium Wars were fought between China and which country?", options: ["France", "Britain", "Russia", "Japan"], correct: 1,
        explanation: "The Opium Wars (1839–1860) were fought between Qing China and Britain over trade, including the opium trade." },
      { q: "Who was the first Emperor of unified China?", options: ["Confucius", "Qin Shi Huang", "Sun Tzu", "Kublai Khan"], correct: 1,
        explanation: "Qin Shi Huang unified China's warring states in 221 BCE and became its first emperor." },
      { q: "What did the Marshall Plan primarily provide after World War II?", options: ["US financial aid to rebuild Western Europe", "Soviet reparations from Germany", "A global gold standard", "Nationalization of European industries"], correct: 0,
        explanation: "The Marshall Plan (1948) was a US program providing financial aid to rebuild Western European economies, partly to counter Soviet influence." },
      { q: "The Peace of Westphalia (1648) is often credited with establishing what concept in international relations?", options: ["Free trade", "The nation-state and sovereignty", "The United Nations", "Colonialism"], correct: 1,
        explanation: "The Peace of Westphalia is widely considered the origin of the modern concept of state sovereignty in international relations." },
      { q: "What was the primary ideological conflict driving the Chinese Civil War?", options: ["Monarchy vs. republic", "Nationalism vs. communism", "Capitalism vs. feudalism", "Religious vs. secular rule"], correct: 1,
        explanation: "The Chinese Civil War (1927–1949) was fought primarily between the Nationalist Kuomintang and the Communist Party, ending in Communist victory." },
      { q: "The Sykes-Picot Agreement (1916) was a secret plan between which two countries to divide territory?", options: ["USA and USSR", "Britain and France", "Germany and Italy", "Spain and Portugal"], correct: 1,
        explanation: "Britain and France secretly agreed to divide the Ottoman Empire's Middle Eastern territories after WWI, an agreement with lasting geopolitical consequences." }
    ]
  ],
  geography: [
    [
      { q: "What is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1,
        explanation: "The Nile flows about 6,650 km through northeastern Africa, generally considered the longest river in the world." },
      { q: "Which country currently has the largest population?", options: ["USA", "India", "China", "Indonesia"], correct: 1,
        explanation: "India surpassed China to become the world's most populous country in 2023, according to United Nations estimates." },
      { q: "What is the smallest country in the world?", options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"], correct: 2,
        explanation: "Vatican City, an independent city-state in Rome, covers just about 0.44 square kilometers." },
      { q: "Which continent is the Sahara Desert located on?", options: ["Asia", "Africa", "South America", "Australia"], correct: 1,
        explanation: "The Sahara spans much of North Africa, covering roughly 9 million square kilometers." },
      { q: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Ottawa", "Montreal"], correct: 2,
        explanation: "Ottawa, located in Ontario, has been Canada's capital since 1857, chosen partly for its position between English and French Canada." },
      { q: "Which country is known as the 'Land of the Rising Sun'?", options: ["China", "Japan", "Thailand", "South Korea"], correct: 1,
        explanation: "Japan is nicknamed the 'Land of the Rising Sun' because, from East Asia, the sun appears to rise from its direction." },
      { q: "What is the capital city of France?", options: ["Marseille", "Lyon", "Paris", "Nice"], correct: 2,
        explanation: "Paris has been the capital of France since the late 10th century." },
      { q: "Which continent is the largest by land area?", options: ["Africa", "Asia", "North America", "Europe"], correct: 1,
        explanation: "Asia is the largest continent, covering about 30% of Earth's total land area." },
      { q: "What ocean lies between Africa and Australia?", options: ["Atlantic", "Pacific", "Indian", "Arctic"], correct: 2,
        explanation: "The Indian Ocean lies between Africa, Asia, and Australia." },
      { q: "Which U.S. state is the largest by area?", options: ["Texas", "California", "Alaska", "Montana"], correct: 2,
        explanation: "Alaska is by far the largest U.S. state by land area, more than twice the size of Texas." },
      { q: "What is the largest desert in the world by area (including cold deserts)?", options: ["Sahara Desert", "Antarctic Desert", "Arabian Desert", "Gobi Desert"], correct: 1,
        explanation: "The Antarctic Desert is technically the largest desert in the world by area, since a desert is defined by low precipitation, not heat." },
      { q: "Which country has the most natural lakes?", options: ["USA", "Canada", "Russia", "Finland"], correct: 1,
        explanation: "Canada has more lakes than the rest of the world's countries combined, thanks to its glacially formed landscape." },
      { q: "What is the name of the mountain range running through South America?", options: ["Rockies", "Alps", "Andes", "Atlas"], correct: 2,
        explanation: "The Andes is the longest mountain range in the world, running along the western edge of South America." }
    ],
    [
      { q: "Which mountain range separates Europe from Asia?", options: ["Alps", "Andes", "Ural Mountains", "Himalayas"], correct: 2,
        explanation: "The Ural Mountains run north-south through Russia and are traditionally treated as the boundary between Europe and Asia." },
      { q: "What is the largest ocean on Earth?", options: ["Atlantic", "Indian", "Arctic", "Pacific"], correct: 3,
        explanation: "The Pacific Ocean is the largest and deepest ocean, covering about a third of Earth's surface." },
      { q: "Which desert is the largest hot desert in the world?", options: ["Gobi", "Sahara", "Kalahari", "Mojave"], correct: 1,
        explanation: "The Sahara is the largest hot desert in the world, covering much of North Africa." },
      { q: "What is the tallest mountain in the world (above sea level)?", options: ["K2", "Mount Kilimanjaro", "Mount Everest", "Denali"], correct: 2,
        explanation: "Mount Everest, in the Himalayas, stands at about 8,849 meters — the tallest mountain above sea level." },
      { q: "Which of these countries is transcontinental, spanning both Europe and Asia?", options: ["Egypt", "Turkey", "Brazil", "Japan"], correct: 1,
        explanation: "Turkey spans two continents — a small part (Eastern Thrace) lies in Europe, while the majority (Anatolia) lies in Asia." },
      { q: "Which river flows through Egypt and empties into the Mediterranean Sea?", options: ["Amazon", "Nile", "Congo", "Niger"], correct: 1,
        explanation: "The Nile flows north through Egypt and empties into the Mediterranean Sea." },
      { q: "What is the name of the imaginary line at 0° longitude?", options: ["Equator", "Prime Meridian", "Tropic of Cancer", "International Date Line"], correct: 1,
        explanation: "The Prime Meridian, passing through Greenwich, England, marks 0° longitude and divides the Eastern and Western Hemispheres." },
      { q: "Which country is home to most of the Amazon Rainforest?", options: ["Peru", "Colombia", "Brazil", "Venezuela"], correct: 2,
        explanation: "While the Amazon Rainforest spans several countries, the majority of it lies within Brazil." },
      { q: "What term describes a large, flat, treeless Arctic region?", options: ["Savanna", "Tundra", "Steppe", "Prairie"], correct: 1,
        explanation: "Tundra describes cold, treeless regions with permanently frozen subsoil, found in Arctic and high-altitude areas." },
      { q: "Which country consists of over 17,000 islands?", options: ["Philippines", "Indonesia", "Japan", "New Zealand"], correct: 1,
        explanation: "Indonesia is the world's largest archipelago, made up of more than 17,000 islands." },
      { q: "What is the longest river in South America?", options: ["Nile", "Amazon", "Mississippi", "Yangtze"], correct: 1,
        explanation: "The Amazon River is the longest river in South America and carries more water than any other river in the world." },
      { q: "What term describes a narrow strip of land connecting two larger landmasses?", options: ["Peninsula", "Isthmus", "Archipelago", "Plateau"], correct: 1,
        explanation: "An isthmus is a narrow strip of land connecting two larger landmasses, like the Isthmus of Panama connecting North and South America." },
      { q: "Which country is both an island and a continent?", options: ["Greenland", "Iceland", "Australia", "Madagascar"], correct: 2,
        explanation: "Australia is unique in being classified as both an island and its own continent." },
      { q: "What is the name for a large, flat, elevated area of land?", options: ["Valley", "Plateau", "Basin", "Delta"], correct: 1,
        explanation: "A plateau is a large area of relatively flat land that is elevated significantly above the surrounding terrain." }
    ],
    [
      { q: "Which country has the most time zones?", options: ["Russia", "USA", "France", "China"], correct: 2,
        explanation: "Thanks to its overseas territories, France spans 12 time zones — more than any other country." },
      { q: "What is the driest place on Earth (excluding polar regions)?", options: ["Sahara Desert", "Atacama Desert", "Death Valley", "Gobi Desert"], correct: 1,
        explanation: "The Atacama Desert in Chile is considered the driest non-polar desert on Earth, with some areas receiving almost no rainfall." },
      { q: "Which strait separates Europe and Africa at its narrowest point?", options: ["Strait of Hormuz", "Strait of Gibraltar", "Bering Strait", "Strait of Malacca"], correct: 1,
        explanation: "The Strait of Gibraltar separates Spain (Europe) from Morocco (Africa) at its narrowest point, about 13 km wide." },
      { q: "What is the capital of Australia?", options: ["Sydney", "Melbourne", "Canberra", "Perth"], correct: 2,
        explanation: "Canberra — not Sydney or Melbourne — is Australia's capital, purpose-built as a compromise between the two rival cities." },
      { q: "Which landlocked country is entirely surrounded by South Africa?", options: ["Botswana", "Eswatini", "Lesotho", "Zimbabwe"], correct: 2,
        explanation: "Lesotho is a small landlocked country completely surrounded by South Africa — one of only three such 'enclave countries' in the world." },
      { q: "What is the world's largest coral reef system?", options: ["Belize Barrier Reef", "Great Barrier Reef", "Red Sea Coral Reef", "Florida Reef"], correct: 1,
        explanation: "The Great Barrier Reef, off the coast of Australia, is the world's largest coral reef system." },
      { q: "Which country is often considered the largest transcontinental country, spanning Europe and Asia?", options: ["Egypt", "Russia", "Kazakhstan", "Turkey"], correct: 1,
        explanation: "Russia spans both Europe and Asia and is by far the largest country in the world by land area." },
      { q: "What is the name of the supercontinent that existed roughly 300 million years ago?", options: ["Gondwana", "Laurasia", "Pangaea", "Rodinia"], correct: 2,
        explanation: "Pangaea was the supercontinent that existed roughly 335 to 175 million years ago before splitting into today's continents." },
      { q: "Which African country was never colonized by a European power?", options: ["Kenya", "Ethiopia", "Nigeria", "Ghana"], correct: 1,
        explanation: "Ethiopia successfully resisted European colonization, notably defeating Italy at the Battle of Adwa in 1896." },
      { q: "What is the term for a city that serves as the seat of a country's government?", options: ["Metropolis", "Capital", "Province", "Territory"], correct: 1,
        explanation: "A capital is the city designated as the seat of a country's government." },
      { q: "What causes the Coriolis effect?", options: ["Earth's magnetic field", "Earth's rotation", "Ocean currents", "Solar radiation"], correct: 1,
        explanation: "The Coriolis effect is caused by Earth's rotation, deflecting moving air and water — to the right in the Northern Hemisphere and left in the Southern Hemisphere." },
      { q: "Which line of latitude receives the most consistent, direct sunlight year-round?", options: ["Arctic Circle", "Tropic of Cancer", "Equator", "Tropic of Capricorn"], correct: 2,
        explanation: "The Equator receives the most consistent, direct sunlight throughout the year since it's equidistant from both poles." },
      { q: "What geological process primarily explains the formation of the Himalayas?", options: ["Volcanic eruption", "Tectonic plate collision", "Glacial erosion", "Meteor impact"], correct: 1,
        explanation: "The Himalayas formed from the collision of the Indian and Eurasian tectonic plates, a process that is still slowly continuing today." },
      { q: "What is a 'rain shadow'?", options: ["A cloud formation", "A dry area on the leeward side of a mountain range", "A type of monsoon", "An ocean current pattern"], correct: 1,
        explanation: "A rain shadow is a dry region on the side of a mountain range facing away from prevailing winds, since moisture falls as precipitation on the windward side." }
    ]
  ],
  english: [
    [
      { q: "Which word is a synonym for 'happy'?", options: ["Joyful", "Sad", "Angry", "Tired"], correct: 0,
        explanation: "A synonym is a word with a similar meaning — 'joyful' means feeling or expressing happiness, just like 'happy.'" },
      { q: "What is the past tense of 'go'?", options: ["Goed", "Went", "Gone", "Going"], correct: 1,
        explanation: "'Go' is an irregular verb — its simple past tense is 'went.' 'Gone' is the past participle, used with helping verbs like 'have.'" },
      { q: "Which of these is a proper noun?", options: ["dog", "London", "quickly", "happiness"], correct: 1,
        explanation: "Proper nouns name specific people, places, or things and are capitalized — 'London' names a specific city." },
      { q: "What type of word describes a noun?", options: ["Verb", "Adjective", "Adverb", "Pronoun"], correct: 1,
        explanation: "Adjectives describe or modify nouns, telling us more about qualities like size, color, or feeling." },
      { q: "Who wrote 'Romeo and Juliet'?", options: ["Charles Dickens", "William Shakespeare", "Mark Twain", "Jane Austen"], correct: 1,
        explanation: "William Shakespeare wrote this tragedy around 1594–96; it remains one of his most performed plays." },
      { q: "Which word means the opposite of 'big'?", options: ["Large", "Small", "Tall", "Wide"], correct: 1,
        explanation: "'Small' is an antonym (opposite) of 'big,' both describing size." },
      { q: "What punctuation mark ends a question?", options: ["Period", "Comma", "Question mark", "Exclamation mark"], correct: 2,
        explanation: "A question mark (?) is used at the end of a sentence that asks something." },
      { q: "Which word is a pronoun?", options: ["Run", "She", "Quickly", "Happy"], correct: 1,
        explanation: "Pronouns replace nouns in a sentence — 'she' stands in for a person's name." },
      { q: "What is the plural of 'cat'?", options: ["Cat", "Cats", "Cates", "Caties"], correct: 1,
        explanation: "Most English nouns form their plural by simply adding -s, as in 'cat' becoming 'cats.'" },
      { q: "Which of these is a complete sentence?", options: ["Running fast.", "The dog barked.", "Under the table.", "Because it rained."], correct: 1,
        explanation: "A complete sentence needs a subject and a verb expressing a full thought — 'The dog barked' has both." },
      { q: "Which word is a verb?", options: ["Blue", "Jump", "Table", "Slowly"], correct: 1,
        explanation: "A verb describes an action or state of being — 'jump' describes an action." },
      { q: "What is a synonym for 'quick'?", options: ["Slow", "Fast", "Heavy", "Quiet"], correct: 1,
        explanation: "'Fast' means moving with speed, matching the meaning of 'quick.'" },
      { q: "Which sentence uses correct capitalization?", options: ["my Dog likes to Run.", "My dog likes to run.", "My Dog Likes To Run.", "my dog likes to run."], correct: 1,
        explanation: "Only the first word of a sentence and proper nouns need capital letters — 'My dog likes to run.' follows this rule correctly." }
    ],
    [
      { q: "What is a metaphor?", options: ["A comparison using 'like' or 'as'", "A direct comparison without using 'like' or 'as'", "A word that imitates a sound", "A repeated sound at the start of words"], correct: 1,
        explanation: "A metaphor directly states that one thing IS another, without using 'like' or 'as' — that's what separates it from a simile." },
      { q: "What is the plural of 'child'?", options: ["Childs", "Childes", "Children", "Childrens"], correct: 2,
        explanation: "'Child' has an irregular plural form, 'children,' rather than adding -s or -es." },
      { q: "Which sentence uses correct subject-verb agreement?", options: ["The dogs barks loudly.", "The dog bark loudly.", "The dogs bark loudly.", "The dog barking loudly."], correct: 2,
        explanation: "The plural subject 'dogs' takes the plural verb form 'bark' (without -s), matching in number." },
      { q: "What is a synonym for 'enormous'?", options: ["Tiny", "Huge", "Quiet", "Fast"], correct: 1,
        explanation: "'Huge' means very large, matching the meaning of 'enormous.'" },
      { q: "Identify the adverb in this sentence: 'She sang beautifully.'", options: ["She", "sang", "beautifully", "There is no adverb"], correct: 2,
        explanation: "'Beautifully' modifies the verb 'sang,' describing how she sang — that's the role of an adverb." },
      { q: "What is the term for a word that sounds like another but differs in spelling and meaning?", options: ["Synonym", "Antonym", "Homophone", "Acronym"], correct: 2,
        explanation: "Homophones sound alike but differ in spelling and meaning, like 'their' and 'there.'" },
      { q: "Which sentence uses a simile?", options: ["He is as brave as a lion.", "He is a lion.", "The lion roared loudly.", "Lions live in prides."], correct: 0,
        explanation: "A simile compares two things using 'like' or 'as' — here comparing bravery to a lion using 'as...as.'" },
      { q: "Which is the correct spelling?", options: ["Recieve", "Receive", "Both are correct", "Neither is correct"], correct: 1,
        explanation: "The rule 'i before e except after c' applies here — since it follows 'c,' it's spelled 'receive.'" },
      { q: "What part of speech is the word 'quickly'?", options: ["Noun", "Verb", "Adjective", "Adverb"], correct: 3,
        explanation: "Words ending in -ly that modify verbs, like 'quickly,' are typically adverbs, describing how an action is done." },
      { q: "Which of these is an example of alliteration?", options: ["The big striped balloon floated away.", "The cat sat on the mat.", "She sells seashells.", "Time flies when you're having fun."], correct: 2,
        explanation: "Alliteration is the repetition of initial consonant sounds in nearby words, as in 'she sells seashells' repeating the 's' sound." },
      { q: "What is a 'compound word'?", options: ["A word with a prefix", "Two words joined to form a new word", "A word with multiple syllables", "A word borrowed from another language"], correct: 1,
        explanation: "A compound word is formed by joining two smaller words together, like 'sunflower' (sun + flower)." },
      { q: "Which of these is an example of hyperbole?", options: ["I'm so hungry I could eat a horse.", "The sky is blue.", "She walked to school.", "It rained yesterday."], correct: 0,
        explanation: "Hyperbole is deliberate exaggeration for effect — no one can literally eat a horse, but it emphasizes how hungry the speaker is." },
      { q: "What does the suffix '-ful' typically mean when added to a word?", options: ["Without", "Full of or characterized by", "Before", "Again"], correct: 1,
        explanation: "The suffix '-ful' means 'full of' or 'characterized by,' as in 'joyful' (full of joy)." }
    ],
    [
      { q: "What literary device is used in 'The wind whispered through the trees'?", options: ["Simile", "Personification", "Alliteration", "Hyperbole"], correct: 1,
        explanation: "Personification gives human qualities — like whispering — to non-human things, here the wind." },
      { q: "Which of these is an example of (situational) irony?", options: ["A fire station burns down.", "A dog barks at night.", "Rain falls during a storm.", "A student studies for a test."], correct: 0,
        explanation: "It's ironic because a fire station, meant to prevent fires, burning down directly contradicts what you'd expect." },
      { q: "What is the correct past participle of 'to write'?", options: ["Writed", "Wrote", "Written", "Writing"], correct: 2,
        explanation: "'Write' is irregular: present 'write,' simple past 'wrote,' past participle 'written' (used with has/have/had)." },
      { q: "Which sentence is in the passive voice?", options: ["The chef cooked the meal.", "The meal was cooked by the chef.", "The chef is cooking the meal.", "The chef will cook the meal."], correct: 1,
        explanation: "In passive voice, the subject receives the action rather than performing it — here 'the meal' receives the action of being cooked." },
      { q: "What does the prefix 'un-' typically mean?", options: ["Again", "Not or opposite of", "Before", "After"], correct: 1,
        explanation: "The prefix 'un-' generally reverses or negates the root word's meaning, as in 'unhappy' (not happy)." },
      { q: "What is an oxymoron, as in the example 'jumbo shrimp'?", options: ["A word with two meanings", "A combination of contradictory terms", "A very long word", "A word borrowed from another language"], correct: 1,
        explanation: "An oxymoron combines two contradictory or opposite terms for effect, like 'jumbo shrimp' or 'deafening silence.'" },
      { q: "Which sentence contains a dangling modifier?", options: ["Walking down the street, the trees looked beautiful.", "She walked down the street and admired the trees.", "The trees were beautiful as she walked down the street.", "While walking, she admired the trees."], correct: 0,
        explanation: "The first sentence incorrectly implies the trees were walking, since the modifying phrase isn't clearly attached to the person doing the walking." },
      { q: "What is the term for the perspective from which a story is told?", options: ["Tone", "Point of view", "Setting", "Theme"], correct: 1,
        explanation: "Point of view refers to who is telling the story — first person, third person, and so on." },
      { q: "Which of these is a compound-complex sentence?", options: ["She ran.", "She ran because she was late.", "She ran, and he walked.", "She ran because she was late, and he walked slowly."], correct: 3,
        explanation: "A compound-complex sentence contains at least two independent clauses ('she ran...' and 'he walked slowly') plus at least one dependent clause ('because she was late')." },
      { q: "What does 'onomatopoeia' refer to?", options: ["Words that imitate sounds", "Repeated consonant sounds", "A comparison using 'like' or 'as'", "A word with multiple meanings"], correct: 0,
        explanation: "Onomatopoeia describes words that phonetically imitate the sound they describe, like 'buzz' or 'clang.'" },
      { q: "What is a 'foil' character in literature?", options: ["The main character", "A character who contrasts with another to highlight their traits", "A narrator", "A minor character with no purpose"], correct: 1,
        explanation: "A foil is a character whose traits contrast with another character, usually the protagonist, to highlight particular qualities by comparison." },
      { q: "What literary structure tells a story out of chronological order?", options: ["Flashback", "Foreshadowing", "Non-linear narrative", "Denouement"], correct: 2,
        explanation: "A non-linear narrative tells events out of chronological order; a flashback is one specific technique often used within such a structure." },
      { q: "What is 'juxtaposition' in writing?", options: ["Repeating a word for emphasis", "Placing two contrasting things close together for effect", "A type of rhyme scheme", "Exaggeration for effect"], correct: 1,
        explanation: "Juxtaposition places two contrasting elements side by side to highlight their differences." },
      { q: "Which best defines an 'unreliable narrator'?", options: ["A narrator who speaks in first person", "A narrator whose credibility is compromised, making their account questionable", "A narrator who is a minor character", "A narrator who never speaks"], correct: 1,
        explanation: "An unreliable narrator's credibility is compromised — through bias, limited knowledge, or dishonesty — requiring readers to question their account." }
    ]
  ],
  "computer-science": [
    [
      { q: "What does CPU stand for?", options: ["Central Process Unit", "Central Processing Unit", "Computer Personal Unit", "Central Processor Utility"], correct: 1,
        explanation: "The CPU is often called the computer's 'brain' — it carries out instructions from programs through calculations and logic operations." },
      { q: "Which of these is a programming language?", options: ["HTML", "Python", "HTTP", "USB"], correct: 1,
        explanation: "Python is a general-purpose programming language. HTML is a markup language, and HTTP/USB are protocols and standards, not languages." },
      { q: "What does 'bug' mean in coding?", options: ["A useful feature", "An error in code", "A type of variable", "A security certificate"], correct: 1,
        explanation: "The term dates back to early computing — a literal moth caused a malfunction in an early computer in 1947, and the name stuck." },
      { q: "What two digits does binary code use?", options: ["0 and 1", "A and B", "1 and 2", "X and Y"], correct: 0,
        explanation: "Computers store and process information using binary — just two digits, 0 and 1, representing off/on electrical states." },
      { q: "What does 'www' stand for?", options: ["World Wide Web", "World Wide Wire", "Web Wide World", "Wide World Web"], correct: 0,
        explanation: "The World Wide Web, invented by Tim Berners-Lee in 1989, is the system of linked pages accessed over the internet." },
      { q: "What does 'GUI' stand for?", options: ["General User Input", "Graphical User Interface", "Global Utility Index", "Guided User Instructions"], correct: 1,
        explanation: "A GUI (Graphical User Interface) lets users interact with a computer through visual elements like windows, icons, and buttons, instead of text commands." },
      { q: "Which of these is an example of computer hardware?", options: ["Operating system", "Keyboard", "Web browser", "Antivirus software"], correct: 1,
        explanation: "Hardware refers to physical components of a computer, like a keyboard, monitor, or hard drive — unlike software, which is code." },
      { q: "What does 'save' typically do in most software?", options: ["Deletes a file", "Stores your current work to a file", "Prints a document", "Closes the program"], correct: 1,
        explanation: "Saving writes your current work to storage (like a hard drive) so it isn't lost when the program closes." },
      { q: "What is the term for unwanted software designed to harm a computer?", options: ["Firmware", "Malware", "Freeware", "Shareware"], correct: 1,
        explanation: "Malware is malicious software designed to damage, disrupt, or gain unauthorized access to computer systems." },
      { q: "What does Wi-Fi allow devices to do?", options: ["Charge wirelessly", "Connect to a network without cables", "Print documents", "Store extra files"], correct: 1,
        explanation: "Wi-Fi is a wireless networking technology that lets devices connect to the internet or a local network without physical cables." },
      { q: "What is the difference between a file and a folder?", options: ["There is no difference", "A file stores data; a folder organizes files", "A folder is smaller than a file", "A file can only hold text"], correct: 1,
        explanation: "A file stores actual data (like a document or photo), while a folder is a container used to organize files." },
      { q: "What does 'USB' commonly refer to?", options: ["A type of software", "A universal connector standard for devices", "A programming language", "A type of virus"], correct: 1,
        explanation: "USB (Universal Serial Bus) is a common standard for connecting devices like keyboards, drives, and phones to a computer." },
      { q: "What is a 'password manager' used for?", options: ["Deleting old passwords", "Securely storing and generating passwords", "Sharing passwords publicly", "Resetting a computer"], correct: 1,
        explanation: "A password manager securely stores your passwords and can generate strong, unique ones for each account." }
    ],
    [
      { q: "What is an algorithm?", options: ["A type of computer", "A set of steps to solve a problem", "A programming language", "A type of virus"], correct: 1,
        explanation: "An algorithm is a precise, step-by-step procedure or set of rules designed to solve a problem or complete a task." },
      { q: "What does RAM stand for?", options: ["Random Access Memory", "Read Access Memory", "Rapid Access Memory", "Random Allocation Memory"], correct: 0,
        explanation: "RAM (Random Access Memory) is temporary memory a computer uses to store data it's actively working with." },
      { q: "What symbol commonly starts a comment in Python?", options: ["//", "#", "<!--", "/*"], correct: 1,
        explanation: "In Python, the '#' symbol marks the rest of a line as a comment, which is ignored when the code runs." },
      { q: "What does 'IDE' stand for in programming?", options: ["Integrated Development Environment", "Internal Data Exchange", "Interface Design Element", "Instructional Data Engine"], correct: 0,
        explanation: "An IDE is software that bundles tools like a code editor, debugger, and compiler to make programming easier." },
      { q: "What data structure works on a 'First In, First Out' basis?", options: ["Stack", "Queue", "Array", "Tree"], correct: 1,
        explanation: "A queue processes items in the order they arrive — first in, first out — like a line of people waiting." },
      { q: "What does 'debugging' mean?", options: ["Writing new code", "Finding and fixing errors in code", "Deleting a program", "Compiling code"], correct: 1,
        explanation: "Debugging is the process of finding and correcting errors ('bugs') in a program's code." },
      { q: "What is a 'variable' in programming?", options: ["A fixed value that never changes", "A named storage location for data that can change", "A type of loop", "A programming language"], correct: 1,
        explanation: "A variable is a named container used to store data that can be changed while a program runs." },
      { q: "What does 'HTML' stand for?", options: ["HyperText Markup Language", "High Tech Modern Language", "Hyperlink and Text Markup Language", "Home Tool Markup Language"], correct: 0,
        explanation: "HTML (HyperText Markup Language) is the standard language used to structure content on web pages." },
      { q: "What is the purpose of a 'for loop' in programming?", options: ["To store data", "To repeat a block of code a set number of times", "To define a function", "To connect to the internet"], correct: 1,
        explanation: "A for loop lets a program repeat a set of instructions a specific number of times without rewriting the code." },
      { q: "What does 'CSS' control on a webpage?", options: ["The page's logic and behavior", "The page's visual styling and layout", "The page's database", "The page's server location"], correct: 1,
        explanation: "CSS (Cascading Style Sheets) controls how a webpage looks — colors, fonts, layout — separate from its content (HTML) or behavior (JavaScript)." },
      { q: "What is a 'boolean' data type?", options: ["A type that stores only text", "A type that stores only true or false", "A type that stores decimals", "A type that stores lists"], correct: 1,
        explanation: "A boolean is a data type that holds one of exactly two values: true or false." },
      { q: "What is the purpose of a 'function' in programming?", options: ["To store a single value", "To group reusable code that performs a task", "To connect to the internet", "To style a webpage"], correct: 1,
        explanation: "A function groups a block of reusable code that performs a specific task, which can be called whenever that task is needed." },
      { q: "What does 'debugging with print statements' typically involve?", options: ["Printing a document", "Adding temporary output to see a program's values while it runs", "Deleting broken code", "Compiling faster"], correct: 1,
        explanation: "Adding print statements at key points lets a programmer see the values of variables while the program runs, helping track down bugs." }
    ],
    [
      { q: "What is the time complexity of binary search on a sorted array?", options: ["O(1)", "O(n)", "O(log n)", "O(n²)"], correct: 2,
        explanation: "Binary search repeatedly halves the search space, giving it logarithmic time complexity, O(log n)." },
      { q: "What does 'recursion' mean in programming?", options: ["A loop that never ends", "A function that calls itself", "A type of variable", "A way to sort data"], correct: 1,
        explanation: "Recursion is when a function calls itself to solve smaller instances of the same problem, typically with a base case to stop." },
      { q: "What does SQL primarily do?", options: ["Manage and query relational databases", "Test software quality", "Store and sort arrays", "Handle network protocols"], correct: 0,
        explanation: "SQL (Structured Query Language) is used to create, read, update, and manage data in relational databases." },
      { q: "What is the main difference between a stack and a queue?", options: ["Stacks are FIFO, queues are LIFO", "Stacks are LIFO, queues are FIFO", "They are the same thing", "Stacks only store numbers"], correct: 1,
        explanation: "A stack is Last In, First Out (like a stack of plates), while a queue is First In, First Out (like a line)." },
      { q: "What does 'API' stand for?", options: ["Application Programming Interface", "Automated Program Instruction", "Applied Programming Index", "Active Protocol Interface"], correct: 0,
        explanation: "An API (Application Programming Interface) defines how different software components communicate with each other." },
      { q: "What is 'Big O notation' used to describe?", options: ["The size of a hard drive", "How an algorithm's runtime or space grows with input size", "The number of bugs in a program", "The version of a programming language"], correct: 1,
        explanation: "Big O notation describes how an algorithm's time or space requirements scale as the input size grows, used to compare efficiency." },
      { q: "What does 'object-oriented programming' organize code around?", options: ["Functions only", "Objects that combine data and behavior", "Random values", "Hardware instructions"], correct: 1,
        explanation: "Object-oriented programming (OOP) structures code around 'objects' that bundle related data (properties) and behavior (methods) together." },
      { q: "What is a 'hash table' primarily used for?", options: ["Storing images", "Fast data lookup using key-value pairs", "Rendering graphics", "Managing network connections"], correct: 1,
        explanation: "A hash table stores data as key-value pairs and uses a hash function to enable very fast lookups, insertions, and deletions." },
      { q: "What does 'encryption' do to data?", options: ["Deletes it permanently", "Converts it into a coded form to protect it", "Compresses it to save space", "Duplicates it for backup"], correct: 1,
        explanation: "Encryption transforms readable data into a coded format that can only be read again with the correct decryption key, protecting it from unauthorized access." },
      { q: "What is the main advantage of a 'linked list' over an array?", options: ["Faster random access", "Easier resizing and insertion/removal", "Always uses less memory", "Can only store numbers"], correct: 1,
        explanation: "Linked lists can grow or shrink easily and allow efficient insertion/removal at any point, unlike arrays, which have fixed sizes and costly middle insertions." },
      { q: "What does O(n log n) typically describe?", options: ["A very slow algorithm", "An efficient sorting algorithm's typical performance", "A constant-time operation", "An algorithm that never finishes"], correct: 1,
        explanation: "O(n log n) describes the time complexity of efficient sorting algorithms like merge sort and quicksort — much faster than O(n²) for large inputs." },
      { q: "What is a 'race condition' in programming?", options: ["A performance benchmark", "An error caused by unpredictable timing between concurrent processes", "A type of infinite loop", "A syntax error"], correct: 1,
        explanation: "A race condition occurs when a program's outcome depends on the unpredictable timing of concurrent operations, often causing bugs that are hard to reproduce." },
      { q: "What does 'normalization' mean in database design?", options: ["Making all data uppercase", "Organizing data to reduce redundancy and improve integrity", "Encrypting sensitive data", "Compressing a database file"], correct: 1,
        explanation: "Normalization organizes database tables to reduce data redundancy and improve data integrity, typically by splitting data into related tables." },
      { q: "What is the purpose of a 'cache' in computing?", options: ["Permanent long-term storage", "Temporary fast-access storage for frequently used data", "A backup system", "A type of firewall"], correct: 1,
        explanation: "A cache stores frequently accessed data in fast-access memory to reduce the time needed to fetch it repeatedly from slower storage." }
    ]
  ],
  economics: [
    [
      { q: "What does 'supply and demand' describe?", options: ["Government spending", "The relationship between price and availability of goods", "Bank interest rates", "Stock market trends"], correct: 1,
        explanation: "Supply and demand describes how the availability of a good and how much people want it interact to determine its market price." },
      { q: "What is inflation?", options: ["A rise in the general price level over time", "A decrease in prices", "A type of tax", "A trade agreement"], correct: 0,
        explanation: "Inflation is measured as the percentage increase in the general price level of goods and services over time, which reduces purchasing power." },
      { q: "What does GDP stand for?", options: ["Gross Domestic Product", "General Domestic Price", "Global Development Plan", "Gross Development Percentage"], correct: 0,
        explanation: "GDP measures the total monetary value of all goods and services produced within a country over a given period." },
      { q: "What is a 'market economy'?", options: ["Government controls all production", "Prices are set by supply and demand", "No trade is allowed", "Prices are fixed by law"], correct: 1,
        explanation: "In a market economy, prices aren't set by the government — they emerge from the interaction of buyers and sellers." },
      { q: "What is opportunity cost?", options: ["The cost of borrowing money", "The value of the next best alternative given up", "The tax on goods", "The interest earned on savings"], correct: 1,
        explanation: "Opportunity cost is the value of the best alternative you give up when you make a choice — a core idea behind every trade-off." },
      { q: "What is money primarily used for in an economy?", options: ["Only for saving", "A medium of exchange for goods and services", "Only for taxes", "A type of resource"], correct: 1,
        explanation: "Money serves as a medium of exchange, making it easier to trade goods and services compared to bartering." },
      { q: "What does 'export' mean in trade?", options: ["Buying goods from another country", "Selling goods to another country", "Storing goods domestically", "Destroying unsold goods"], correct: 1,
        explanation: "Exporting means selling goods or services produced in one country to buyers in another country." },
      { q: "What is a 'budget'?", options: ["A type of tax", "A plan for how to spend and save money", "A bank account", "A type of loan"], correct: 1,
        explanation: "A budget is a plan that outlines expected income and expenses over a period of time." },
      { q: "What does 'interest rate' refer to when borrowing money?", options: ["The total amount borrowed", "The cost of borrowing money, expressed as a percentage", "A type of tax on income", "The value of a currency"], correct: 1,
        explanation: "An interest rate is the percentage charged by a lender for the use of borrowed money, on top of the amount borrowed." },
      { q: "What is a 'consumer'?", options: ["A person who produces goods", "A person or business that buys goods and services", "A government agency", "A bank"], correct: 1,
        explanation: "A consumer is an individual or entity that purchases goods and services for personal use." },
      { q: "What is a 'producer' in economics?", options: ["A person who only buys goods", "An individual or business that creates goods or services", "A government tax collector", "A bank"], correct: 1,
        explanation: "A producer is an individual or business that creates goods or provides services for consumers to buy." },
      { q: "What does 'profit' mean in business?", options: ["Total sales revenue", "The money left after subtracting costs from revenue", "The cost of raw materials", "A type of tax"], correct: 1,
        explanation: "Profit is what remains after a business subtracts its costs (expenses) from its total revenue (sales)." },
      { q: "What is 'barter'?", options: ["Trading goods or services directly without money", "A type of currency", "A government subsidy", "A stock market transaction"], correct: 0,
        explanation: "Barter is the direct exchange of goods or services between parties without using money." }
    ],
    [
      { q: "What does 'scarcity' mean in economics?", options: ["Unlimited resources", "Limited resources relative to unlimited wants", "A type of currency", "A government policy"], correct: 1,
        explanation: "Scarcity is the basic economic problem: resources are limited while human wants are essentially unlimited, forcing choices about allocation." },
      { q: "What is a 'monopoly'?", options: ["Many companies competing freely", "A single seller dominating a market", "A government-owned bank", "A type of currency"], correct: 1,
        explanation: "A monopoly exists when a single company or seller dominates a market with no significant competition." },
      { q: "What does 'fiscal policy' refer to?", options: ["A central bank's control of interest rates", "Government use of spending and taxation to influence the economy", "Company hiring practices", "International trade agreements"], correct: 1,
        explanation: "Fiscal policy is how governments use spending and taxation to influence economic conditions — distinct from monetary policy." },
      { q: "What is a 'trade deficit'?", options: ["Exporting more than importing", "Importing more than exporting", "Having no international trade", "Equal imports and exports"], correct: 1,
        explanation: "A trade deficit occurs when a country imports more goods and services than it exports." },
      { q: "What does the 'unemployment rate' measure?", options: ["Total population without jobs", "The share of the labor force actively seeking but not finding work", "Total number of retired people", "Average income per person"], correct: 1,
        explanation: "The unemployment rate specifically measures the share of people in the labor force who are jobless and actively seeking work — not the whole population." },
      { q: "What is 'competition' in a market economy?", options: ["When one company controls everything", "Multiple sellers vying for customers, often improving quality and lowering prices", "A government-set rule", "A type of tax"], correct: 1,
        explanation: "Competition occurs when multiple businesses compete for customers, which can drive innovation, better quality, and lower prices." },
      { q: "What does a 'demand curve' typically show?", options: ["The relationship between price and quantity demanded", "The total cost of production", "Government spending over time", "The population of a country"], correct: 0,
        explanation: "A demand curve graphs how the quantity of a good demanded changes as its price changes, usually showing an inverse relationship." },
      { q: "What is a 'subsidy'?", options: ["A tax on imports", "Financial assistance from the government to support a business or activity", "A type of bank loan", "A fee charged by a company"], correct: 1,
        explanation: "A subsidy is financial support given by a government to encourage or support a particular industry, activity, or group." },
      { q: "What does 'purchasing power' refer to?", options: ["The amount of money a country prints", "The quantity of goods and services money can buy", "A type of stock", "A bank's total assets"], correct: 1,
        explanation: "Purchasing power describes how much a given amount of money can actually buy, which decreases as prices rise (inflation)." },
      { q: "What is a 'recession'?", options: ["A period of significant economic growth", "A significant decline in economic activity lasting more than a few months", "A type of tax cut", "A stock market holiday"], correct: 1,
        explanation: "A recession is a period of significant, widespread decline in economic activity, typically measured by falling GDP over two consecutive quarters." }
    ],
    [
      { q: "What is 'monetary policy' typically controlled by?", options: ["The elected government directly", "A country's central bank", "Private corporations", "Labor unions"], correct: 1,
        explanation: "Monetary policy — controlling interest rates and money supply — is typically managed by a country's central bank." },
      { q: "What does 'GDP' stand for and measure?", options: ["Gross Domestic Product — total value of goods and services produced in a country", "Government Debt Percentage — a country's debt level", "General Development Plan — an economic policy", "Gross Deposit Price — bank interest rates"], correct: 0,
        explanation: "GDP (Gross Domestic Product) measures the total monetary value of all goods and services produced within a country over a given period." },
      { q: "What is a 'tariff'?", options: ["A tax on imported goods", "A type of subsidy", "A currency exchange rate", "A government bond"], correct: 0,
        explanation: "A tariff is a tax imposed on imported goods, often used to protect domestic industries or raise government revenue." },
      { q: "What does it mean when a currency 'depreciates'?", options: ["It becomes worth more relative to other currencies", "It becomes worth less relative to other currencies", "It is taken out of circulation", "It is replaced by a new currency"], correct: 1,
        explanation: "Currency depreciation means a currency loses value relative to other currencies, making imports more expensive and exports cheaper." },
      { q: "What does 'comparative advantage' explain in trade?", options: ["Why countries should be self-sufficient", "Why countries benefit from specializing in what they produce relatively efficiently", "Why tariffs are always beneficial", "Why exchange rates never change"], correct: 1,
        explanation: "Comparative advantage explains why countries gain from trade by specializing in goods they can produce relatively more efficiently, even if another country could produce everything more efficiently overall." },
      { q: "What is 'stagflation'?", options: ["High growth and low inflation", "Stagnant growth combined with high inflation", "Falling prices during a recession", "Rapid growth with no inflation"], correct: 1,
        explanation: "Stagflation is the unusual and difficult combination of slow economic growth, high unemployment, and high inflation happening at once." },
      { q: "What does a country's central bank primarily do?", options: ["Collect income tax", "Manage the money supply and set interest rates", "Regulate private hiring", "Run the stock exchange"], correct: 1,
        explanation: "A central bank manages a country's money supply and key interest rates, aiming for stable prices and steady growth." },
      { q: "What is the 'law of diminishing returns'?", options: ["Producing more always increases profit", "Adding more of one input eventually yields smaller output gains", "Prices always fall over time", "Supply always equals demand"], correct: 1,
        explanation: "The law of diminishing returns states that adding more units of one input, while others stay fixed, eventually produces smaller and smaller additional output." },
      { q: "What does 'elasticity of demand' measure?", options: ["How much a product weighs", "How responsive quantity demanded is to a change in price", "The total supply of a good", "The interest rate on loans"], correct: 1,
        explanation: "Elasticity of demand measures how much the quantity demanded of a good changes in response to a change in its price." },
      { q: "What is a 'progressive tax system'?", options: ["Everyone pays the same tax rate", "Tax rates increase as income increases", "Only businesses pay taxes", "Tax rates decrease as income increases"], correct: 1,
        explanation: "In a progressive tax system, people with higher incomes pay a higher percentage of their income in taxes than those with lower incomes." },
      { q: "What does 'quantitative easing' involve?", options: ["A central bank cutting government spending", "A central bank buying assets to increase money supply and stimulate the economy", "Raising interest rates sharply", "Reducing taxes for businesses only"], correct: 1,
        explanation: "Quantitative easing is when a central bank buys financial assets to inject money into the economy and encourage lending and spending, often used when interest rates are already very low." },
      { q: "What does 'GDP per capita' measure?", options: ["Total national debt", "Average economic output per person in a country", "Total government spending", "Total exports minus imports"], correct: 1,
        explanation: "GDP per capita divides a country's total GDP by its population, giving a rough measure of average economic output or living standards per person." },
      { q: "What is the difference between microeconomics and macroeconomics?", options: ["There is no difference", "Microeconomics studies individual markets and decisions; macroeconomics studies the economy as a whole", "Macroeconomics only studies small businesses", "Microeconomics only studies government policy"], correct: 1,
        explanation: "Microeconomics focuses on individual consumers, firms, and markets, while macroeconomics studies economy-wide phenomena like inflation, unemployment, and overall growth." },
      { q: "What does the 'Gini coefficient' measure?", options: ["Inflation rate", "Income inequality within a population", "GDP growth rate", "Unemployment rate"], correct: 1,
        explanation: "The Gini coefficient measures income or wealth inequality within a population, ranging from 0 (perfect equality) to 1 (perfect inequality)." },
      { q: "What is 'moral hazard' in economics?", options: ["When people take more risks because they're insulated from consequences", "A type of unethical business practice", "A government policy failure", "A form of tax evasion"], correct: 0,
        explanation: "Moral hazard occurs when a party takes on more risk because they don't bear the full consequences — for example, insurance sometimes encouraging riskier behavior." },
      { q: "What does 'fiat currency' mean?", options: ["Currency backed by gold", "Currency with value derived from government decree, not a physical commodity", "A cryptocurrency", "Currency used only in France"], correct: 1,
        explanation: "Fiat currency has value because a government declares it legal tender, rather than being backed by a physical commodity like gold." },
      { q: "What is 'creative destruction' in economics?", options: ["Government destroying excess currency", "The process by which new innovations replace outdated industries and jobs", "A type of stock market crash", "Planned obsolescence in manufacturing"], correct: 1,
        explanation: "Coined by economist Joseph Schumpeter, creative destruction describes how innovation continuously replaces outdated industries, products, and jobs with new ones." }
    ]
  ],
  "probability": [
    [
      { q: "What is the probability of flipping tails on a fair coin?", options: ["1/2", "1/4", "1", "0"], correct: 0,
        explanation: "A fair coin has 2 equally likely outcomes, so tails has a 1/2 probability." },
      { q: "What is the probability of rolling an even number on a standard 6-sided die?", options: ["1/6", "1/3", "1/2", "2/3"], correct: 2,
        explanation: "There are 3 even numbers (2, 4, 6) out of 6 total, giving 3/6 = 1/2." },
      { q: "A probability is always between which two numbers?", options: ["-1 and 1", "0 and 1", "0 and 100", "1 and 10"], correct: 1,
        explanation: "Probabilities are always expressed as a value between 0 (impossible) and 1 (certain)." },
      { q: "If there's a 25% chance of rain, what is that as a fraction?", options: ["1/4", "1/2", "1/25", "1/100"], correct: 0,
        explanation: "25% equals 25/100, which simplifies to 1/4." },
      { q: "A bag has 10 marbles, 4 of which are green. What's the probability of picking green?", options: ["4/10", "6/10", "10/4", "1/4"], correct: 0,
        explanation: "4 out of 10 marbles are green, giving a probability of 4/10 (or 2/5)." },
      { q: "What word describes an event that is guaranteed to happen?", options: ["Impossible", "Unlikely", "Certain", "Random"], correct: 2,
        explanation: "An event that will definitely happen is called 'certain,' with a probability of 1." },
      { q: "How many total outcomes are there when rolling a standard die once?", options: ["4", "6", "8", "12"], correct: 1,
        explanation: "A standard die has 6 faces, so there are 6 possible outcomes." },
      { q: "What is the probability of picking a spade from a standard 52-card deck?", options: ["1/4", "1/13", "1/2", "13/52"], correct: 0,
        explanation: "There are 13 spades out of 52 cards, and 13/52 simplifies to 1/4." }
    ],
    [
      { q: "Two coins are flipped. What is the probability both land on heads?", options: ["1/2", "1/4", "1/3", "3/4"], correct: 1,
        explanation: "Each flip is independent with probability 1/2; multiplying gives 1/2 × 1/2 = 1/4." },
      { q: "What is the probability of NOT rolling a 6 on a die?", options: ["1/6", "5/6", "1/2", "6/6"], correct: 1,
        explanation: "Since rolling a 6 has probability 1/6, not rolling a 6 has probability 1 - 1/6 = 5/6." },
      { q: "Rolling a 1 and rolling a 2 on the same single die roll are what kind of events?", options: ["Independent", "Mutually exclusive", "Dependent", "Certain"], correct: 1,
        explanation: "You can't roll both a 1 and a 2 on the same single roll, making these mutually exclusive events." },
      { q: "In how many ways can 4 different books be arranged on a shelf?", options: ["4", "16", "24", "8"], correct: 2,
        explanation: "This is 4! = 4 × 3 × 2 × 1 = 24 arrangements." },
      { q: "What is the probability of drawing a red card from a standard deck?", options: ["1/2", "1/4", "1/13", "1/26"], correct: 0,
        explanation: "Half the deck (26 of 52 cards) is red, giving a probability of 1/2." },
      { q: "If you draw a card, replace it, then draw again, are the two draws independent?", options: ["Yes", "No", "Only if it's the same card", "Cannot be determined"], correct: 0,
        explanation: "Replacing the card resets the deck to its original state, so the second draw doesn't depend on the first — they're independent." },
      { q: "What is 5 choose 2 (selecting 2 items from 5, order doesn't matter) equal to?", options: ["10", "20", "5", "25"], correct: 0,
        explanation: "5 choose 2 = 5!/(2!×3!) = 10." },
      { q: "A spinner has 4 equal sections: red, blue, green, yellow. What's the probability of landing on blue or green?", options: ["1/4", "1/2", "3/4", "1"], correct: 1,
        explanation: "Blue and green together make up 2 of the 4 sections, giving 2/4 = 1/2." }
    ],
    [
      { q: "A test correctly identifies a rare disease 90% of the time, but the disease only affects 1 in 1000 people. Why can a positive result still likely be a false positive?", options: ["It can't be — 90% accuracy always means 90% certainty", "Because the disease is so rare, false positives from the healthy majority can outnumber true positives", "The test is always wrong", "Rarity doesn't affect this"], correct: 1,
        explanation: "This is the base rate fallacy: because true cases are so rare, even a small false-positive rate among the much larger healthy population can produce more false positives than true positives." },
      { q: "What is the expected value of rolling a standard die (average result over many rolls)?", options: ["3", "3.5", "4", "6"], correct: 1,
        explanation: "Expected value = (1+2+3+4+5+6)/6 = 21/6 = 3.5." },
      { q: "If event A's probability is P(A) and event B's is P(B), and they're independent, what is P(A and B)?", options: ["P(A) + P(B)", "P(A) × P(B)", "P(A) - P(B)", "P(A) / P(B)"], correct: 1,
        explanation: "For independent events, the probability of both happening is the product of their individual probabilities." },
      { q: "What does the Law of Large Numbers describe?", options: ["Large numbers are always even", "As you repeat an experiment more times, the average result gets closer to the expected value", "Bigger dice have different odds", "Probability only works with large groups"], correct: 1,
        explanation: "The Law of Large Numbers says that as the number of trials increases, the observed average tends to converge toward the theoretical expected value." },
      { q: "In a lottery with 1,000,000 tickets and 1 winner, what is the probability of winning with one ticket?", options: ["1/1,000,000", "1/1,000", "1%", "0"], correct: 0,
        explanation: "With one winning ticket out of a million, the probability is 1 in 1,000,000." },
      { q: "What is a 'sample space' in probability?", options: ["A physical location", "The set of all possible outcomes of an experiment", "The most likely outcome", "A type of graph"], correct: 1,
        explanation: "The sample space is the complete set of all possible outcomes for a given random experiment." },
      { q: "If P(rain) = 0.3, what is P(no rain)?", options: ["0.3", "0.7", "1.3", "0"], correct: 1,
        explanation: "Since total probability must equal 1, P(no rain) = 1 - 0.3 = 0.7." },
      { q: "Why might correlation between two things NOT imply causation?", options: ["Correlation always implies causation", "A third factor might cause both, or the relationship could be coincidental", "Correlation is the same as causation by definition", "This only applies to probability, not statistics"], correct: 1,
        explanation: "Two things can be correlated without one causing the other — a hidden third factor might cause both, or the pattern could simply be coincidental." }
    ]
  ],
  "technology": [
    [
      { q: "What does 'CPU' stand for?", options: ["Central Processing Unit", "Computer Power Unit", "Central Program Utility", "Core Processing Unifier"], correct: 0,
        explanation: "CPU stands for Central Processing Unit — often called the 'brain' of a computer." },
      { q: "What is the main purpose of RAM in a device?", options: ["Permanently store files", "Temporarily hold data the device is actively using", "Connect to Wi-Fi", "Display graphics only"], correct: 1,
        explanation: "RAM (Random Access Memory) temporarily holds data that's actively being used, allowing quick access while the device is running." },
      { q: "What does Wi-Fi let a device do?", options: ["Charge without a cable", "Connect wirelessly to a network", "Print documents", "Make phone calls only"], correct: 1,
        explanation: "Wi-Fi allows devices to connect to a network wirelessly, without needing a physical cable." },
      { q: "What is a common sign that you should update your device's software?", options: ["It never needs updates", "You're notified of a security patch or new feature update", "Only when it breaks completely", "Updates are always optional and unimportant"], correct: 1,
        explanation: "Notifications about security patches or new features are a normal, common reason to update software." },
      { q: "What does 'the cloud' refer to?", options: ["Weather patterns", "Storing and accessing data over the internet instead of only locally", "A type of virus", "A physical storage device"], correct: 1,
        explanation: "'The cloud' means storing and accessing data via remote servers over the internet, rather than only on a local device." },
      { q: "What is a password manager used for?", options: ["Deleting old passwords", "Securely storing and generating strong passwords", "Sharing passwords publicly", "Speeding up your internet"], correct: 1,
        explanation: "A password manager securely stores your passwords and can generate strong, unique ones for each account." },
      { q: "What does a router do in a home network?", options: ["Generates electricity", "Directs data between your devices and the internet", "Stores photos", "Charges your phone"], correct: 1,
        explanation: "A router directs data traffic between the devices in your home and the wider internet." },
      { q: "What is 'phishing'?", options: ["A type of hardware", "A scam that tricks you into giving up personal information", "A way to speed up downloads", "A type of software update"], correct: 1,
        explanation: "Phishing is a scam where an attacker impersonates a trusted source to trick you into revealing personal information." }
    ],
    [
      { q: "What is the Internet of Things (IoT)?", options: ["A single supercomputer", "A network of everyday physical devices connected to the internet", "An outdated technology", "A social media app"], correct: 1,
        explanation: "IoT refers to the growing network of everyday objects — thermostats, appliances, wearables — connected to the internet." },
      { q: "What does two-factor authentication add to account security?", options: ["Nothing extra", "A second verification step beyond just a password", "A requirement to change your username", "Slower load times only"], correct: 1,
        explanation: "Two-factor authentication requires a second proof of identity (like a code sent to your phone) in addition to your password." },
      { q: "What's a key difference between VR and AR?", options: ["They are identical", "VR replaces your entire view with a digital world; AR overlays digital elements onto reality", "AR requires a headset; VR doesn't", "VR is only for phones"], correct: 1,
        explanation: "VR immerses you fully in a simulated environment, while AR adds digital elements on top of the real world you can still see." },
      { q: "What does 'bandwidth' measure?", options: ["Screen size", "How much data can move through a connection in a given time", "Battery life", "Number of apps installed"], correct: 1,
        explanation: "Bandwidth measures the data-carrying capacity of a connection — higher bandwidth generally means faster transfers." },
      { q: "Why is public Wi-Fi generally less secure than a private home network?", options: ["It's always slower, that's the only issue", "Data sent over unsecured public networks can potentially be intercepted by others", "Public Wi-Fi doesn't actually connect to the internet", "There's no real difference"], correct: 1,
        explanation: "Public networks are often less secure, meaning data you send could potentially be intercepted by someone else using the same network." },
      { q: "What is 'automation' in everyday technology?", options: ["Manually doing a task each time", "A task that happens on its own, without a person actively repeating it", "A type of computer virus", "A backup copy of a file"], correct: 1,
        explanation: "Automation means a task runs on its own, without a person manually repeating it each time — like a scheduled robot vacuum." },
      { q: "What is the 'digital divide'?", options: ["A disagreement between two programmers", "The gap between people with reliable tech/internet access and those without", "A type of software bug", "The line between hardware and software"], correct: 1,
        explanation: "The digital divide is the gap between people who have reliable access to technology and the internet, and those who don't." },
      { q: "Why might a company think carefully about ethics when building AI tools?", options: ["Ethics don't apply to technology", "AI can affect fairness, privacy, and safety at a very large scale", "Only governments need to consider this", "It's only relevant after something goes wrong"], correct: 1,
        explanation: "Because AI systems can affect huge numbers of people very quickly, thinking through fairness, privacy, and safety during development is important." }
    ],
    [
      { q: "What does end-to-end encryption ensure in a messaging app?", options: ["Messages load faster", "Only the sender and intended recipient can read the message content", "Messages are stored publicly", "Messages are automatically translated"], correct: 1,
        explanation: "End-to-end encryption scrambles message content so that only the sender and the intended recipient can decode and read it — not even the app provider." },
      { q: "What is a potential concern with algorithms that personalize the content you see online?", options: ["They have no real effect on what people see", "They can create 'filter bubbles,' narrowing the range of viewpoints someone encounters", "They always show completely random content", "Personalization is purely a technical detail with no social impact"], correct: 1,
        explanation: "Personalization algorithms can create filter bubbles, where users are mostly shown content that matches their existing views, narrowing their exposure to other perspectives." },
      { q: "What does 'net neutrality' refer to?", options: ["A type of antivirus software", "The principle that internet providers should treat all data equally, without favoring certain sites", "A backup power system", "A type of encryption"], correct: 1,
        explanation: "Net neutrality is the principle that internet service providers should treat all internet traffic equally, without blocking, slowing, or prioritizing specific sites or services." },
      { q: "Why can facial recognition technology raise privacy concerns?", options: ["It never works accurately", "It can enable identifying and tracking individuals, often without their explicit consent", "It only works on photographs, never in public", "It has no real-world applications"], correct: 1,
        explanation: "Facial recognition can be used to identify and track individuals in public or private spaces, often without their knowledge or explicit consent, raising real privacy questions." },
      { q: "What is a 'zero-day' vulnerability in cybersecurity?", options: ["A bug that's been known and patched for years", "A previously unknown security flaw that attackers can exploit before it's fixed", "A type of antivirus feature", "A scheduled maintenance day"], correct: 1,
        explanation: "A zero-day vulnerability is a newly discovered security flaw that hasn't been patched yet, meaning attackers may exploit it before a fix is available." },
      { q: "How can machine learning models inherit bias?", options: ["They cannot, math is always neutral", "If trained on biased historical data, they can learn and repeat those same biases", "Bias only comes from the programmer's mood", "Only humans can be biased, not algorithms"], correct: 1,
        explanation: "Machine learning models learn patterns from their training data — if that data reflects historical biases, the model can learn and perpetuate those same biases." },
      { q: "What is a practical reason some countries have passed data privacy laws (like GDPR)?", options: ["To slow down the internet on purpose", "To give individuals more control and transparency over how their personal data is collected and used", "Because data privacy wasn't a real issue before", "To ban all data collection completely"], correct: 1,
        explanation: "Data privacy laws like GDPR aim to give individuals clearer rights and more control over how companies collect, use, and share their personal data." },
      { q: "Why is 'planned obsolescence' a debated topic in consumer technology?", options: ["It isn't debated at all", "Some argue manufacturers intentionally limit product lifespans to drive repeat purchases, raising cost and environmental concerns", "It only refers to old technology no longer in use", "It has nothing to do with environmental impact"], correct: 1,
        explanation: "Planned obsolescence is debated because critics argue some products are intentionally designed with limited lifespans to encourage more frequent purchases, which raises both cost and environmental concerns." }
    ]
  ],
  "coding": [
    [
      { q: "What is a variable used for in programming?", options: ["Storing a value that can change", "Printing text only", "Connecting to the internet", "Deleting files"], correct: 0,
        explanation: "A variable is a named container used to store a value that can be read or changed as the program runs." },
      { q: "What does an 'if' statement do?", options: ["Repeats code forever", "Runs code only when a condition is true", "Deletes a variable", "Always runs no matter what"], correct: 1,
        explanation: "An 'if' statement runs its block of code only when the specified condition evaluates to true." },
      { q: "What is a loop used for?", options: ["Storing a single value", "Repeating a block of code multiple times", "Connecting to a database", "Printing an error"], correct: 1,
        explanation: "Loops let you repeat a block of code multiple times without writing it out repeatedly by hand." },
      { q: "What does 'debugging' mean?", options: ["Adding new features", "Finding and fixing errors in code", "Deleting a whole program", "Making a program run in a different language"], correct: 1,
        explanation: "Debugging is the process of finding and fixing errors ('bugs') in a program." },
      { q: "Which of these is most likely a boolean value?", options: ["\"hello\"", "42", "true", "3.14"], correct: 2,
        explanation: "A boolean holds one of exactly two values: true or false." },
      { q: "What is a function in programming?", options: ["A type of error", "A reusable, named block of code that performs a task", "A single fixed number", "A type of variable that never changes"], correct: 1,
        explanation: "A function is a reusable block of code designed to perform a specific task, which you can call whenever needed." },
      { q: "What does 'pseudocode' mean?", options: ["Broken code that won't run", "A plain-language outline of a program's logic before writing real code", "Code written only in binary", "A type of computer virus"], correct: 1,
        explanation: "Pseudocode is an informal, plain-language way of planning a program's logic before translating it into actual code." },
      { q: "What does the comparison operator == typically check?", options: ["Assigns a value", "Whether two values are equal", "Whether one value is greater", "Divides two numbers"], correct: 1,
        explanation: "== is a comparison operator that checks whether two values are equal (as opposed to = which assigns a value)." }
    ],
    [
      { q: "What does an 'else' branch do?", options: ["Runs when the 'if' condition is false", "Always runs regardless of any condition", "Only works inside loops", "Stops the entire program"], correct: 0,
        explanation: "The 'else' branch provides an alternate block of code that runs specifically when the associated 'if' condition is false." },
      { q: "What is the difference between a 'for' loop and a 'while' loop?", options: ["They are identical in every way", "A 'for' loop is typically used for a known number of repetitions; a 'while' loop repeats based on a condition", "'While' loops can never be infinite", "'For' loops don't use conditions at all"], correct: 1,
        explanation: "'For' loops are commonly used when you know how many times to repeat; 'while' loops repeat as long as a condition remains true, which may be a less predictable number of times." },
      { q: "What are 'parameters' in a function?", options: ["Random numbers a function generates", "Inputs a function accepts to customize its behavior", "Comments inside the code", "Errors the function might produce"], correct: 1,
        explanation: "Parameters are the inputs a function accepts, allowing the same function to behave differently based on what values are passed in." },
      { q: "What does it mean for a function to 'return' a value?", options: ["It deletes the value permanently", "It sends a result back to the code that called the function", "It only prints the value to the screen", "It creates an infinite loop"], correct: 1,
        explanation: "Returning a value means the function sends a result back to whatever code called it, so that result can be used elsewhere in the program." },
      { q: "What does an array (or list) store?", options: ["Only a single value", "An ordered collection of multiple values", "Only boolean values", "A type of function"], correct: 1,
        explanation: "An array (or list) is a data structure that stores an ordered collection of multiple values together." },
      { q: "What does the logical operator AND require for a combined condition to be true?", options: ["At least one part must be true", "Every part must be true", "No part can be true", "It always returns true"], correct: 1,
        explanation: "AND requires all the combined conditions to be true for the overall expression to evaluate as true." },
      { q: "What is 'syntax' in programming?", options: ["The meaning behind a program's logic", "The specific rules for how code must be written in a given language", "A type of variable", "A network protocol"], correct: 1,
        explanation: "Syntax refers to the strict rules governing how code must be structured and written correctly in a particular programming language." },
      { q: "If `count = 0` and then the code runs `count = count + 1` three times in a loop, what is `count` afterward?", options: ["0", "1", "3", "4"], correct: 2,
        explanation: "Starting at 0 and adding 1 three times results in count equal to 3." }
    ],
    [
      { q: "What is 'recursion'?", options: ["A loop that never ends by design", "A function that calls itself to solve smaller instances of a problem", "A type of syntax error", "A way to store multiple variables"], correct: 1,
        explanation: "Recursion is a technique where a function calls itself, typically to break a problem into smaller versions of the same problem, with a base case to eventually stop." },
      { q: "What is the time complexity of a simple loop that checks every item in a list of size n once?", options: ["O(1)", "O(n)", "O(n²)", "O(log n)"], correct: 1,
        explanation: "Checking every item in a list of size n exactly once takes time proportional to n, described as O(n)." },
      { q: "What is an 'API' in software development?", options: ["A type of computer virus", "A defined way for different software components to communicate with each other", "A programming language", "A type of variable"], correct: 1,
        explanation: "An API (Application Programming Interface) defines a structured way for different pieces of software to communicate and exchange data." },
      { q: "What does 'object-oriented programming' organize code around?", options: ["Random numbers", "Objects that bundle related data and behavior together", "Only single, standalone functions", "Only mathematical formulas"], correct: 1,
        explanation: "Object-oriented programming organizes code around 'objects' that bundle related data (properties) and behavior (methods) together." },
      { q: "What is version control (like Git) used for?", options: ["Speeding up code execution", "Tracking changes to code over time and enabling collaboration", "Compiling code into an app", "Designing user interfaces"], correct: 1,
        explanation: "Version control systems like Git track changes to code over time, letting multiple people collaborate and revert to earlier versions if needed." },
      { q: "What is a 'null' or 'undefined' value generally used to represent?", options: ["The number zero", "The intentional absence of a value", "A boolean true", "An error that crashes the program"], correct: 1,
        explanation: "Null (or undefined, depending on the language) typically represents the intentional absence of a meaningful value, distinct from zero or an empty string." },
      { q: "Why might a programmer choose a more efficient algorithm even if a simpler one 'works'?", options: ["Efficiency never actually matters", "A more efficient algorithm can handle much larger inputs without becoming impractically slow", "Simpler algorithms are always faster in every case", "There's no real difference between algorithms"], correct: 1,
        explanation: "As input size grows, a less efficient algorithm can become impractically slow, while a more efficient one continues to perform well — this difference matters a lot at scale." },
      { q: "What is 'refactoring' code?", options: ["Deleting all the code and starting over", "Restructuring existing code to improve its structure without changing its behavior", "Adding new features only", "Translating code into a different language"], correct: 1,
        explanation: "Refactoring means restructuring and cleaning up existing code to improve readability or structure, without changing what the code actually does." }
    ]
  ]
};


// Returns 5 shuffled questions. Pass a chapterIndex (0, 1, or 2) to
// get that chapter specifically (used by Quests). Omit it to get a
// mixed pool across all chapters for that subject (used by Boss
// Fight, Duels, and the AI Tutor, where difficulty tiers don't apply).
// Removes interactive question types (balance, slope-drag, sequence)
// from a pool if the user has turned them off in Settings — checked
// wherever a question set gets assembled, not just one place, so the
// toggle applies consistently everywhere (Quests, Boss, Duel, Trivia,
// AI Tutor).
function applyInteractiveSetting(questions) {
  if (typeof isInteractiveDisabled === "function" && isInteractiveDisabled()) {
    return questions.filter(q => !q.type);
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
