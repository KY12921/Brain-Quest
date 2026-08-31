// Same Gemini calling logic as the original Firebase Functions
// version — fetch() is native in both environments, so this ports
// over unchanged.

const GEMINI_MODEL = "gemini-2.5-flash";

export async function callGemini(apiKey, contents, generationConfig) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
    body: JSON.stringify({ contents, generationConfig })
  });
  if (!response.ok) {
    const errText = await response.text().catch(() => "");
    console.error("Gemini API error:", response.status, errText);
    const err = new Error("Gemini API error " + response.status);
    err.status = response.status;
    throw err;
  }
  const data = await response.json();
  const text = data && data.candidates && data.candidates[0] && data.candidates[0].content
    && data.candidates[0].content.parts && data.candidates[0].content.parts[0]
    && data.candidates[0].content.parts[0].text;
  if (!text) throw new Error("No text in Gemini response");
  return text;
}

export const GRADE_WORDS = { elementary: "an elementary school", middle: "a middle school", high: "a high school" };
