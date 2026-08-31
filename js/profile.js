// ------------------------------------------------------------------
// Brain Quest — Profile screen: shows username/email, and lets the
// user change their password (with re-authentication, as Firebase
// requires for security-sensitive account changes).
// ------------------------------------------------------------------

function renderProfileScreen() {
  document.getElementById("profile-username").textContent = (currentUserData && currentUserData.name) || "—";
  document.getElementById("profile-email").textContent = (currentUser && currentUser.email) || "—";
  document.getElementById("password-change-status").textContent = "";
  document.getElementById("change-password-form").reset();
}

document.getElementById("change-password-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-new-password").value;
  const statusEl = document.getElementById("password-change-status");
  statusEl.textContent = "";
  statusEl.classList.remove("form-success");

  if (newPassword !== confirmPassword) {
    statusEl.textContent = "New passwords don't match.";
    return;
  }
  if (!currentUser || !currentUser.email) {
    statusEl.textContent = "You need to be signed in to change your password.";
    return;
  }

  try {
    const credential = firebase.auth.EmailAuthProvider.credential(currentUser.email, currentPassword);
    await currentUser.reauthenticateWithCredential(credential);
    await currentUser.updatePassword(newPassword);
    statusEl.textContent = "Password updated successfully.";
    statusEl.classList.add("form-success");
    document.getElementById("change-password-form").reset();
  } catch (err) {
    const map = {
      "auth/wrong-password": "Your current password is incorrect.",
      "auth/weak-password": "New password should be at least 6 characters.",
      "auth/too-many-requests": "Too many attempts — please try again later."
    };
    statusEl.textContent = map[err.code] || "Couldn't update your password. Please try again.";
  }
});
