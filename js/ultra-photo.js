// ------------------------------------------------------------------
// Brain Quest — Ultra: Photo Help.
//
// Ultra members can upload a photo of their work; it's sent to
// functions/index.js's analyzeHomeworkPhoto (which uses Gemini's
// vision input) and the response — what's right, what's wrong, how
// to fix it — is shown back in this screen.
//
// The Ultra gate is enforced server-side (the Cloud Function checks
// isUltra itself via the Admin SDK). The client-side check here is
// just for a clean "you need Ultra" message instead of a confusing
// error — it is not the actual security boundary.
// ------------------------------------------------------------------

let _selectedPhotoFile = null;

function renderPhotoHelpScreen() {
  const isUltra = currentUserData && currentUserData.isUltra;
  document.getElementById("photo-help-locked").classList.toggle("hidden", isUltra);
  document.getElementById("photo-help-unlocked").classList.toggle("hidden", !isUltra);

  if (isUltra) {
    const subjectSelect = document.getElementById("photo-help-subject");
    if (subjectSelect.options.length <= 1) {
      SUBJECTS.forEach(s => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = s.name;
        subjectSelect.appendChild(opt);
      });
    }
    document.getElementById("photo-help-result").classList.add("hidden");
    document.getElementById("photo-help-preview").classList.add("hidden");
    document.getElementById("photo-help-submit-btn").disabled = true;
    _selectedPhotoFile = null;
  }
}

document.getElementById("photo-help-upgrade-btn").addEventListener("click", () => navigateTo("pro-section"));

document.getElementById("photo-help-input").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  _selectedPhotoFile = file;

  const preview = document.getElementById("photo-help-preview");
  const reader = new FileReader();
  reader.onload = (ev) => {
    preview.src = ev.target.result;
    preview.classList.remove("hidden");
  };
  reader.readAsDataURL(file);

  document.getElementById("photo-help-submit-btn").disabled = false;
});

document.getElementById("photo-help-submit-btn").addEventListener("click", async () => {
  if (!_selectedPhotoFile) return;
  const btn = document.getElementById("photo-help-submit-btn");
  const resultEl = document.getElementById("photo-help-result");
  const subject = document.getElementById("photo-help-subject").value;

  btn.disabled = true;
  resultEl.classList.remove("hidden");
  resultEl.textContent = "Analyzing your photo...";

  try {
    const base64 = await fileToBase64(_selectedPhotoFile);
    const result = await callWorkerFunction("analyzeHomeworkPhoto", {
      imageBase64: base64,
      mimeType: _selectedPhotoFile.type || "image/jpeg",
      subject: subject || undefined,
      gradeLevel: currentUserData.gradeLevel
    });
    resultEl.textContent = result.analysis;
  } catch (err) {
    resultEl.textContent = "Couldn't analyze that photo right now — Ultra's photo analysis may not be deployed yet on this site. See the README.";
  } finally {
    btn.disabled = false;
  }
});

// Strips the "data:image/jpeg;base64," prefix — the Cloud Function
// wants just the raw base64 payload, matching Gemini's expected format.
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
