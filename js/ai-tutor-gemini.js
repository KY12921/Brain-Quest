// ------------------------------------------------------------------
// Brain Quest — client side of the real AI Tutor.
//
// This calls the Cloudflare Worker in cloudflare-worker/src/index.js
// (via the callWorkerFunction() helper in js/worker-api.js), which is
// the only thing that actually talks to Gemini — never the browser
// directly, so the API key stays private. If the Worker isn't
// deployed yet, or the call fails for any reason (network, quota, not
// set up), this fails gracefully and the caller falls back to the
// existing template-based explanation — the app never breaks because
// of this.
// ------------------------------------------------------------------

async function fetchGeminiExplanation({ question, options, correctAnswerText, selectedAnswerText, subject, gradeLevel }) {
  try {
    const result = await callWorkerFunction("generateTutorExplanation", {
      question, options, correctAnswerText, selectedAnswerText, subject, gradeLevel
    });
    return result.explanation || null;
  } catch (err) {
    console.warn("Gemini explanation unavailable, falling back to template:", err.message || err);
    return null;
  }
}

async function fetchTutorChatReply({ history, gradeLevel, weakestSubject }) {
  try {
    const result = await callWorkerFunction("chatWithTutor", { history, gradeLevel, weakestSubject });
    return result.reply || null;
  } catch (err) {
    console.warn("Tutor chat unavailable:", err.message || err);
    return null;
  }
}

async function fetchGeneratedPracticeQuestion({ conversationContext, gradeLevel }) {
  try {
    const result = await callWorkerFunction("generatePracticeQuestion", { conversationContext, gradeLevel });
    return result.question || null;
  } catch (err) {
    console.warn("Practice question generation unavailable:", err.message || err);
    return null;
  }
}
