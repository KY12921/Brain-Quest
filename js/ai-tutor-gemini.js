// ------------------------------------------------------------------
// Brain Quest — client side of the real AI Tutor.
//
// This calls the Cloud Function in functions/index.js, which is the
// only thing that actually talks to Gemini (see that file for why).
// If the function isn't deployed yet, or the call fails for any
// reason (network, quota, not set up), this fails gracefully and the
// caller falls back to the existing template-based explanation —
// the app never breaks because of this.
// ------------------------------------------------------------------

async function fetchGeminiExplanation({ question, options, correctAnswerText, selectedAnswerText, subject, gradeLevel }) {
  try {
    const callable = functions.httpsCallable("generateTutorExplanation");
    const result = await callable({
      question, options, correctAnswerText, selectedAnswerText, subject, gradeLevel
    });
    return result.data && result.data.explanation ? result.data.explanation : null;
  } catch (err) {
    console.warn("Gemini explanation unavailable, falling back to template:", err.message || err);
    return null;
  }
}

async function fetchTutorChatReply({ history, gradeLevel, weakestSubject }) {
  try {
    const callable = functions.httpsCallable("chatWithTutor");
    const result = await callable({ history, gradeLevel, weakestSubject });
    return result.data && result.data.reply ? result.data.reply : null;
  } catch (err) {
    console.warn("Tutor chat unavailable:", err.message || err);
    return null;
  }
}

async function fetchGeneratedPracticeQuestion({ conversationContext, gradeLevel }) {
  try {
    const callable = functions.httpsCallable("generatePracticeQuestion");
    const result = await callable({ conversationContext, gradeLevel });
    return result.data && result.data.question ? result.data.question : null;
  } catch (err) {
    console.warn("Practice question generation unavailable:", err.message || err);
    return null;
  }
}
