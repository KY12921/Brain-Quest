// ------------------------------------------------------------------
// QUESTION BANK — v1 placeholder for the AI question generator.
//
// In a later version, replace getQuestions(subjectId) with a call to
// your own backend (e.g. a Firebase Cloud Function) that asks an AI
// model for 5 fresh questions on the chosen subject. Keeping that
// call server-side is what protects your API key — never call an AI
// API with a secret key directly from this front-end code.
//
// Each subject needs at least 5 questions for a clean v1 experience.
// Add more per subject any time — getQuestions() will randomly pick 5.
// ------------------------------------------------------------------

const SUBJECTS = [
  { id: "math", name: "Math", icon: "🧮" },
  { id: "science", name: "Science", icon: "🔬" },
  { id: "history", name: "History", icon: "📜" },
  { id: "geography", name: "Geography", icon: "🌍" }
];

const QUESTION_BANK = {
  math: [
    { q: "What is 7 × 8?", options: ["54", "56", "64", "48"], correct: 1 },
    { q: "What is the square root of 144?", options: ["11", "12", "13", "14"], correct: 1 },
    { q: "Solve for x: 2x + 5 = 17", options: ["5", "6", "7", "8"], correct: 1 },
    { q: "What is 15% of 200?", options: ["20", "25", "30", "35"], correct: 2 },
    { q: "What is the value of π (pi) to two decimal places?", options: ["3.12", "3.14", "3.16", "3.18"], correct: 1 },
    { q: "What is the area of a rectangle 4cm by 9cm?", options: ["13 cm²", "26 cm²", "36 cm²", "40 cm²"], correct: 2 },
    { q: "What is 9² (9 squared)?", options: ["18", "72", "81", "99"], correct: 2 }
  ],
  science: [
    { q: "What planet is known as the Red Planet?", options: ["Venus", "Mars", "Jupiter", "Saturn"], correct: 1 },
    { q: "What gas do plants absorb from the atmosphere for photosynthesis?", options: ["Oxygen", "Nitrogen", "Carbon dioxide", "Hydrogen"], correct: 2 },
    { q: "What is the chemical symbol for gold?", options: ["Go", "Gd", "Au", "Ag"], correct: 2 },
    { q: "How many bones are in the adult human body?", options: ["186", "206", "226", "246"], correct: 1 },
    { q: "What force pulls objects toward the Earth?", options: ["Magnetism", "Friction", "Gravity", "Tension"], correct: 2 },
    { q: "What is the powerhouse of the cell?", options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi body"], correct: 2 },
    { q: "What state of matter has a fixed volume but no fixed shape?", options: ["Solid", "Liquid", "Gas", "Plasma"], correct: 1 }
  ],
  history: [
    { q: "In what year did World War II end?", options: ["1943", "1945", "1947", "1950"], correct: 1 },
    { q: "Who was the first President of the United States?", options: ["Thomas Jefferson", "John Adams", "George Washington", "Benjamin Franklin"], correct: 2 },
    { q: "The ancient pyramids of Giza are located in which country?", options: ["Mexico", "Egypt", "Peru", "Sudan"], correct: 1 },
    { q: "Which empire built the Colosseum?", options: ["Greek", "Roman", "Ottoman", "Persian"], correct: 1 },
    { q: "What wall divided a European city during the Cold War?", options: ["Vienna Wall", "Berlin Wall", "Warsaw Wall", "Prague Wall"], correct: 1 },
    { q: "Who wrote the Declaration of Independence?", options: ["Thomas Jefferson", "Abraham Lincoln", "James Madison", "Alexander Hamilton"], correct: 0 }
  ],
  geography: [
    { q: "What is the longest river in the world?", options: ["Amazon", "Nile", "Yangtze", "Mississippi"], correct: 1 },
    { q: "Which country has the largest population?", options: ["USA", "India", "China", "Indonesia"], correct: 2 },
    { q: "What is the smallest country in the world?", options: ["Monaco", "San Marino", "Vatican City", "Liechtenstein"], correct: 2 },
    { q: "Which continent is the Sahara Desert located on?", options: ["Asia", "Africa", "South America", "Australia"], correct: 1 },
    { q: "What is the capital of Canada?", options: ["Toronto", "Vancouver", "Ottawa", "Montreal"], correct: 2 },
    { q: "Which mountain range separates Europe from Asia?", options: ["Alps", "Andes", "Ural Mountains", "Himalayas"], correct: 2 }
  ]
};

// Returns 5 random questions for a given subject id.
function getQuestions(subjectId) {
  const pool = QUESTION_BANK[subjectId] || [];
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 5);
}
