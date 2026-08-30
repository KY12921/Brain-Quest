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
  { id: "economics", name: "Economics", icon: "💰", color: "#B06A35", colorSoft: "rgba(176,106,53,0.18)" }
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
  economics: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 17 9 11 13 15 21 6"/><polyline points="14 6 21 6 21 13"/></svg>'
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
    questions: [
      {
        q: "What is 7 × 8?",
        options: [
          "54",
          "56",
          "64",
          "48"
        ],
        correct: 1,
        explanation: "7 × 8 means adding 7 eight times: 7+7+7+7+7+7+7+7 = 56."
      },
      {
        q: "What is 12 + 15?",
        options: [
          "25",
          "26",
          "27",
          "28"
        ],
        correct: 2,
        explanation: "12 + 15 = 27, adding the two numbers directly."
      },
      {
        q: "What is 100 ÷ 4?",
        options: [
          "20",
          "25",
          "30",
          "40"
        ],
        correct: 1,
        explanation: "100 divided by 4 equals 25, since 4 × 25 = 100."
      },
      {
        q: "What is 3 × 3 × 3?",
        options: [
          "9",
          "18",
          "27",
          "36"
        ],
        correct: 2,
        explanation: "3 × 3 = 9, then 9 × 3 = 27."
      },
      {
        q: "What is 6 × 9?",
        options: [
          "45",
          "52",
          "54",
          "56"
        ],
        correct: 2,
        explanation: "6 × 9 = 54, since 6 groups of 9 add up to 54."
      }
    ]
  },
  {
    name: "Fractions & Percentages",
    questions: [
      {
        q: "What is 15% of 200?",
        options: [
          "20",
          "25",
          "30",
          "35"
        ],
        correct: 2,
        explanation: "15% means 15 out of 100. Multiply: 200 × 0.15 = 30."
      },
      {
        q: "What is 1/2 + 1/4?",
        options: [
          "1/6",
          "2/6",
          "3/4",
          "1/8"
        ],
        correct: 2,
        explanation: "Convert 1/2 to 2/4, then 2/4 + 1/4 = 3/4."
      },
      {
        q: "What is 25% of 80?",
        options: [
          "15",
          "20",
          "25",
          "30"
        ],
        correct: 1,
        explanation: "25% is the same as 1/4, and 80 ÷ 4 = 20."
      },
      {
        q: "What is 20% of 150?",
        options: [
          "20",
          "25",
          "30",
          "35"
        ],
        correct: 2,
        explanation: "20% of 150 = 150 × 0.20 = 30."
      },
      {
        q: "What is 3/4 minus 1/4?",
        options: [
          "1/4",
          "1/2",
          "2/4",
          "3/4"
        ],
        correct: 1,
        explanation: "Since the denominators already match, subtract the numerators: 3/4 − 1/4 = 2/4, which simplifies to 1/2."
      }
    ]
  },
  {
    name: "Number Theory",
    questions: [
      {
        q: "Which of these numbers is a prime number?",
        options: [
          "4",
          "6",
          "7",
          "9"
        ],
        correct: 2,
        explanation: "A prime number has exactly two factors, 1 and itself. 7 is only divisible by 1 and 7."
      },
      {
        q: "What is the least common multiple (LCM) of 4 and 6?",
        options: [
          "8",
          "10",
          "12",
          "24"
        ],
        correct: 2,
        explanation: "12 is the smallest number that both 4 and 6 divide into evenly (4×3=12, 6×2=12)."
      },
      {
        q: "What is the greatest common factor (GCF) of 12 and 18?",
        options: [
          "3",
          "6",
          "9",
          "12"
        ],
        correct: 1,
        explanation: "6 is the largest number that divides both 12 and 18 evenly."
      },
      {
        q: "Which of these numbers is NOT a prime number?",
        options: [
          "2",
          "9",
          "11",
          "13"
        ],
        correct: 1,
        explanation: "9 = 3 × 3, so it has more than two factors, unlike a prime number."
      },
      {
        q: "What is 15 written as a product of its prime factors?",
        options: [
          "3 × 5",
          "5 × 5",
          "3 × 3 × 3",
          "2 × 7"
        ],
        correct: 0,
        explanation: "15 = 3 × 5, and both 3 and 5 are prime numbers."
      }
    ]
  },
  {
    name: "Introduction to Algebra",
    questions: [
      {
        q: "Solve for x: 2x + 5 = 17",
        options: [
          "5",
          "6",
          "7",
          "8"
        ],
        correct: 1,
        explanation: "Subtract 5 from both sides: 2x = 12. Then divide both sides by 2: x = 6."
      },
      {
        q: "Solve for y: y/3 = 9",
        options: [
          "3",
          "12",
          "27",
          "36"
        ],
        correct: 2,
        explanation: "Multiply both sides by 3: y = 9 × 3 = 27."
      },
      {
        q: "Solve for x: 5x − 3 = 22",
        options: [
          "4",
          "5",
          "6",
          "7"
        ],
        correct: 1,
        explanation: "Add 3 to both sides: 5x = 25. Divide both sides by 5: x = 5."
      },
      {
        type: "balance",
        q: "Balance the scale: x + 4 = 10. Which weight for x makes it balance?",
        leftLabel: "x + 4",
        rightValue: 10,
        correct: 6,
        weights: [
          4,
          5,
          6,
          7,
          8
        ],
        explanation: "To balance x + 4 = 10, subtract 4 from both sides: x = 10 − 4 = 6."
      },
      {
        type: "balance",
        q: "Balance the scale: 2x = 14. Which weight for x makes it balance?",
        leftLabel: "2x",
        rightValue: 14,
        correct: 7,
        weights: [
          5,
          6,
          7,
          8,
          9
        ],
        explanation: "To balance 2x = 14, divide both sides by 2: x = 14 ÷ 2 = 7."
      }
    ]
  },
  {
    name: "Geometry Basics",
    questions: [
      {
        q: "What is the area of a rectangle 4cm by 9cm?",
        options: [
          "13 cm²",
          "26 cm²",
          "36 cm²",
          "40 cm²"
        ],
        correct: 2,
        explanation: "Area of a rectangle = length × width = 4 × 9 = 36 cm²."
      },
      {
        q: "What is the perimeter of a square with side length 6cm?",
        options: [
          "12",
          "18",
          "24",
          "36"
        ],
        correct: 2,
        explanation: "Perimeter of a square = 4 × side = 4 × 6 = 24 cm."
      },
      {
        q: "If a triangle has angles 50° and 60°, what is the third angle?",
        options: [
          "60°",
          "70°",
          "80°",
          "90°"
        ],
        correct: 1,
        explanation: "The angles in a triangle always sum to 180°. 180 − 50 − 60 = 70°."
      },
      {
        q: "What is the circumference of a circle with radius 5? (use π ≈ 3.14)",
        options: [
          "15.7",
          "31.4",
          "62.8",
          "78.5"
        ],
        correct: 1,
        explanation: "Circumference = 2πr = 2 × 3.14 × 5 = 31.4."
      },
      {
        q: "What is the sum of the interior angles of a hexagon?",
        options: [
          "360°",
          "540°",
          "720°",
          "900°"
        ],
        correct: 2,
        explanation: "Sum of interior angles = (n − 2) × 180°. For a hexagon, n = 6: (6 − 2) × 180° = 720°."
      }
    ]
  },
  {
    name: "Exponents & Roots",
    questions: [
      {
        q: "What is the square root of 144?",
        options: [
          "11",
          "12",
          "13",
          "14"
        ],
        correct: 1,
        explanation: "12 × 12 = 144, so the square root of 144 is 12."
      },
      {
        q: "What is 9² (9 squared)?",
        options: [
          "18",
          "72",
          "81",
          "99"
        ],
        correct: 2,
        explanation: "A number squared means multiplying it by itself: 9 × 9 = 81."
      },
      {
        q: "Solve: x² = 49. What are the possible values of x?",
        options: [
          "7 only",
          "-7 only",
          "7 and -7",
          "49"
        ],
        correct: 2,
        explanation: "Both 7 × 7 = 49 and (-7) × (-7) = 49, so x can be either 7 or -7."
      },
      {
        q: "Solve for x: 3ˣ = 81",
        options: [
          "3",
          "4",
          "5",
          "6"
        ],
        correct: 1,
        explanation: "3⁴ = 81 (3×3×3×3), so x = 4."
      },
      {
        q: "Solve for x: log₂(x) = 5",
        options: [
          "10",
          "16",
          "25",
          "32"
        ],
        correct: 3,
        explanation: "log₂(x) = 5 means 2⁵ = x, and 2⁵ = 32."
      }
    ]
  },
  {
    name: "Intermediate Algebra",
    questions: [
      {
        q: "Simplify: (2x²)(3x³)",
        options: [
          "5x⁵",
          "6x⁵",
          "6x⁶",
          "5x⁶"
        ],
        correct: 1,
        explanation: "Multiply the coefficients (2 × 3 = 6) and add the exponents (2 + 3 = 5), giving 6x⁵."
      },
      {
        q: "Solve the system: x + y = 10, x − y = 2. What is x?",
        options: [
          "4",
          "5",
          "6",
          "8"
        ],
        correct: 2,
        explanation: "Adding both equations: 2x = 12, so x = 6 (and y = 4)."
      },
      {
        q: "What is the quadratic formula used to solve ax² + bx + c = 0?",
        options: [
          "x = (−b ± √(b²−4ac)) / 2a",
          "x = −b / 2a",
          "x = b² − 4ac",
          "x = (−b + c) / a"
        ],
        correct: 0,
        explanation: "The quadratic formula, x = (−b ± √(b²−4ac)) / 2a, gives the solutions to any quadratic equation in standard form."
      },
      {
        q: "Simplify: 3(x + 4)",
        options: [
          "3x + 4",
          "3x + 12",
          "x + 12",
          "3x + 7"
        ],
        correct: 1,
        explanation: "Distribute the 3 across (x + 4): 3 × x = 3x, and 3 × 4 = 12, giving 3x + 12."
      },
      {
        q: "Simplify: 4x − 2x + 6",
        options: [
          "2x + 6",
          "6x + 6",
          "2x − 6",
          "4x + 6"
        ],
        correct: 0,
        explanation: "Combine like terms: 4x − 2x = 2x, so the result is 2x + 6."
      }
    ]
  },
  {
    name: "Coordinate Geometry & Slope",
    questions: [
      {
        q: "What is the slope of the line through points (2,3) and (4,7)?",
        options: [
          "1",
          "2",
          "3",
          "4"
        ],
        correct: 1,
        explanation: "Slope = (y₂ − y₁) / (x₂ − x₁) = (7 − 3) / (4 − 2) = 4 / 2 = 2."
      },
      {
        type: "slope-drag",
        q: "Drag the point so the line through the origin has a slope of 2.",
        fixedPoint: {
          x: 0,
          y: 0
        },
        targetSlope: 2,
        explanation: "Slope = rise/run. A slope of 2 means for every 1 unit you move right, the line rises 2 units — for example, passing through (1,2) or (2,4)."
      },
      {
        q: "What is the equation of a line with slope 3 passing through (0, 2)?",
        options: [
          "y = 3x + 2",
          "y = 2x + 3",
          "y = 3x − 2",
          "y = x + 2"
        ],
        correct: 0,
        explanation: "In slope-intercept form y = mx + b, m is the slope (3) and b is the y-intercept (2), giving y = 3x + 2."
      },
      {
        q: "What is the y-intercept of the line y = 4x − 7?",
        options: [
          "4",
          "−7",
          "7",
          "−4"
        ],
        correct: 1,
        explanation: "In y = mx + b form, b is the y-intercept — here b = −7."
      },
      {
        q: "Two lines are parallel if they have the same what?",
        options: [
          "Y-intercept",
          "Slope",
          "Length",
          "X-intercept"
        ],
        correct: 1,
        explanation: "Parallel lines never intersect because they have identical slopes, just different y-intercepts."
      }
    ]
  },
  {
    name: "Probability & Statistics",
    questions: [
      {
        q: "What is the median of the numbers 3, 7, 9, 12, 15?",
        options: [
          "7",
          "9",
          "10",
          "12"
        ],
        correct: 1,
        explanation: "The median is the middle value when numbers are ordered. Here, 9 sits exactly in the middle of the 5 values."
      },
      {
        q: "What is the probability of rolling a sum of 7 with two six-sided dice?",
        options: [
          "1/6",
          "1/12",
          "5/36",
          "1/36"
        ],
        correct: 0,
        explanation: "6 combinations sum to 7 (1+6, 2+5, 3+4, 4+3, 5+2, 6+1) out of 36 total outcomes: 6/36 = 1/6."
      },
      {
        q: "What is the mode of the numbers 4, 4, 6, 7, 9?",
        options: [
          "4",
          "6",
          "7",
          "9"
        ],
        correct: 0,
        explanation: "The mode is the number that appears most often — 4 appears twice, more than any other number."
      },
      {
        q: "What is the mean (average) of 2, 4, 6, 8?",
        options: [
          "4",
          "5",
          "6",
          "7"
        ],
        correct: 1,
        explanation: "Mean = sum ÷ count = (2+4+6+8) / 4 = 20 / 4 = 5."
      },
      {
        q: "If you flip a fair coin twice, what is the probability of getting two heads?",
        options: [
          "1/2",
          "1/3",
          "1/4",
          "1/8"
        ],
        correct: 2,
        explanation: "Each flip has a 1/2 chance of heads. Two independent flips: 1/2 × 1/2 = 1/4."
      }
    ]
  },
  {
    name: "Calculus & Trigonometry Basics",
    questions: [
      {
        q: "What is the derivative of x² with respect to x?",
        options: [
          "x",
          "2x",
          "x²",
          "2"
        ],
        correct: 1,
        explanation: "Using the power rule, the derivative of xⁿ is n·x^(n-1); for x², that's 2x¹ = 2x."
      },
      {
        q: "What is the limit of (x² − 1) / (x − 1) as x approaches 1?",
        options: [
          "0",
          "1",
          "2",
          "Undefined"
        ],
        correct: 2,
        explanation: "Factor the numerator as (x−1)(x+1). The (x−1) terms cancel, leaving x+1, which equals 2 when x approaches 1."
      },
      {
        q: "What is the integral of 2x dx?",
        options: [
          "x² + C",
          "2x² + C",
          "x + C",
          "2 + C"
        ],
        correct: 0,
        explanation: "Integration reverses the power rule: the integral of 2x is x² + C, since the derivative of x² is 2x."
      },
      {
        q: "What is the value of sin(90°)?",
        options: [
          "0",
          "0.5",
          "1",
          "Undefined"
        ],
        correct: 2,
        explanation: "sin(90°) equals 1, the maximum value of the sine function."
      },
      {
        q: "What is the value of cos(60°)?",
        options: [
          "0",
          "0.5",
          "1",
          "√3/2"
        ],
        correct: 1,
        explanation: "cos(60°) = 0.5 is a standard unit circle value worth memorizing."
      }
    ]
  }
],
  science: [
  {
    name: "Astronomy Basics",
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
  },
  {
    name: "Human Body Systems",
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
  },
  {
    name: "Plants & Ecosystems",
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
  },
  {
    name: "States of Matter & Energy",
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
  },
  {
    name: "Chemistry Basics",
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
  },
  {
    name: "Cells & Microbiology",
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
  },
  {
    name: "Physics Laws",
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
  },
  {
    name: "Atomic & Chemical Structure",
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
  },
  {
    name: "Earth Systems & Water Cycle",
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
  },
  {
    name: "Advanced Biology & Chemistry",
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
  ]
};

// Returns 5 shuffled questions. Pass a chapterIndex (0, 1, or 2) to
// get that chapter specifically (used by Quests). Omit it to get a
// mixed pool across all chapters for that subject (used by Boss
// Fight, Duels, and the AI Tutor, where difficulty tiers don't apply).
function getQuestions(subjectId, chapterIndex) {
  const chapters = QUESTION_BANK[subjectId] || [];
  const pool = (typeof chapterIndex === "number")
    ? (chapters[chapterIndex] || [])
    : chapters.flat();
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}
