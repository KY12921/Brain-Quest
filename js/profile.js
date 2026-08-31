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
  renderCustomizeSection();
}

// One equip picker per cosmetic category — each always includes a
// free "None"/"Default" option alongside whatever's been purchased.
const EQUIP_CATEGORIES = [
  { key: "avatarIcon", ownedKey: "avatarIcons", label: "Avatar Icon", defaultId: "default", defaultLabel: "Default", names: { phoenix: "Phoenix", dragon: "Dragon" } },
  { key: "frame", ownedKey: "frames", label: "Avatar Frame", defaultId: "none", defaultLabel: "None", names: { gold: "Gold Ring", fire: "Fire" } },
  { key: "decoration", ownedKey: "decorations", label: "Avatar Decoration", defaultId: "none", defaultLabel: "None", names: { crown: "Crown Badge", sparkle: "Sparkle Badge" } },
  { key: "nameplate", ownedKey: "nameplates", label: "Nameplate Style", defaultId: "default", defaultLabel: "Default", names: { gold: "Golden", neon: "Neon" } }
];

function renderCustomizeSection() {
  const container = document.getElementById("profile-customize");
  if (!container) return;

  const owned = currentUserData.ownedCosmetics || {};
  const equipped = currentUserData.equipped || {};

  container.innerHTML = `
    <div class="profile-avatar-preview">
      ${renderAvatarCosmetic(currentUserData, "avatar-lg")}
      <span class="${nameplateClass(currentUserData)}">${currentUserData.name || ""}</span>
    </div>
    ${EQUIP_CATEGORIES.map(cat => {
      const ownedIds = owned[cat.ownedKey] || [];
      const options = [{ id: cat.defaultId, label: cat.defaultLabel }, ...ownedIds.map(id => ({ id, label: cat.names[id] || id }))];
      return `
        <div class="equip-row">
          <label>${cat.label}</label>
          <select class="equip-select" data-equip-key="${cat.key}">
            ${options.map(o => `<option value="${o.id}" ${equipped[cat.key] === o.id ? "selected" : ""}>${o.label}</option>`).join("")}
          </select>
        </div>
      `;
    }).join("")}
  `;

  container.querySelectorAll(".equip-select").forEach(select => {
    select.addEventListener("change", () => equipCosmetic(select.dataset.equipKey, select.value));
  });
}

async function equipCosmetic(key, value) {
  if (!currentUserData.equipped) currentUserData.equipped = {};
  currentUserData.equipped[key] = value;
  if (currentUser) {
    await db.collection("users").doc(currentUser.uid).update({ [`equipped.${key}`]: value });
  }
  renderCustomizeSection();
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
