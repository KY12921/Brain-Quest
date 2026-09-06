// ------------------------------------------------------------------
// version5 — Friends.
//
// Adding/removing a friend or blocking someone means writing to
// ANOTHER user's document — a client's own Firebase auth token can't
// do that under normal Firestore rules, so every action here goes
// through the Worker backend, which uses privileged access. Same
// pattern as gifting elsewhere in this app.
// ------------------------------------------------------------------

function renderFriendsScreen() {
  document.getElementById("friends-status").textContent = "";
  document.getElementById("friend-add-email").value = "";
  renderFriendsList();
  renderBlockedList();
}

function renderFriendsList() {
  const container = document.getElementById("friends-list");
  const friends = currentUserData.friends || [];
  if (friends.length === 0) {
    container.innerHTML = `<p class="friends-empty">No friends added yet.</p>`;
    return;
  }
  container.innerHTML = friends.map(f => `
    <div class="friend-row">
      <span class="friend-name">${escapeHtml(f.name || "Student")}</span>
      <div class="friend-row-actions">
        <button class="btn btn-ghost friend-remove-btn" data-uid="${f.uid}">Remove</button>
        <button class="btn btn-ghost friend-block-btn" data-uid="${f.uid}" data-name="${escapeHtml(f.name || "Student")}">Block</button>
      </div>
    </div>
  `).join("");

  container.querySelectorAll(".friend-remove-btn").forEach(btn => {
    btn.addEventListener("click", () => removeFriend(btn.dataset.uid));
  });
  container.querySelectorAll(".friend-block-btn").forEach(btn => {
    btn.addEventListener("click", () => blockFriendByUidName(btn.dataset.uid, btn.dataset.name));
  });
}

function renderBlockedList() {
  const container = document.getElementById("blocked-list");
  const blocked = currentUserData.blockedUsers || [];
  if (blocked.length === 0) {
    container.innerHTML = `<p class="friends-empty">Nobody blocked.</p>`;
    return;
  }
  container.innerHTML = blocked.map(b => `
    <div class="friend-row">
      <span class="friend-name">${escapeHtml(b.name || "Student")}</span>
      <button class="btn btn-ghost friend-unblock-btn" data-uid="${b.uid}">Unblock</button>
    </div>
  `).join("");

  container.querySelectorAll(".friend-unblock-btn").forEach(btn => {
    btn.addEventListener("click", () => unblockUser(btn.dataset.uid));
  });
}

document.getElementById("friend-add-btn").addEventListener("click", async () => {
  const email = document.getElementById("friend-add-email").value.trim();
  const statusEl = document.getElementById("friends-status");
  const btn = document.getElementById("friend-add-btn");
  statusEl.textContent = "";

  if (!email) {
    statusEl.textContent = "Enter your friend's email address.";
    return;
  }

  btn.disabled = true;
  try {
    const result = await callWorkerFunction("addFriend", { targetEmail: email });
    statusEl.textContent = result.message || "Added!";
    document.getElementById("friend-add-email").value = "";
    // Reflect the new friend locally without waiting for a full reload.
    if (!currentUserData.friends) currentUserData.friends = [];
    currentUserData.friends.push({ uid: "pending", name: email }); // placeholder until next login refresh
    renderFriendsList();
  } catch (err) {
    statusEl.textContent = err.message || "Couldn't add that friend.";
  } finally {
    btn.disabled = false;
  }
});

async function removeFriend(targetUid) {
  const statusEl = document.getElementById("friends-status");
  statusEl.textContent = "";
  try {
    await callWorkerFunction("removeFriend", { targetUid });
    currentUserData.friends = (currentUserData.friends || []).filter(f => f.uid !== targetUid);
    renderFriendsList();
  } catch (err) {
    statusEl.textContent = err.message || "Couldn't remove that friend.";
  }
}

async function blockFriendByUidName(targetUid, targetName) {
  const statusEl = document.getElementById("friends-status");
  statusEl.textContent = "";
  if (!confirm(`Block ${targetName}? They'll be removed from your friends list.`)) return;

  try {
    const result = await callWorkerFunction("blockUser", { targetUid });
    if (!currentUserData.blockedUsers) currentUserData.blockedUsers = [];
    currentUserData.blockedUsers.push({ uid: targetUid, name: targetName });
    currentUserData.friends = (currentUserData.friends || []).filter(f => f.uid !== targetUid);
    renderFriendsList();
    renderBlockedList();
    statusEl.textContent = result.message || "Blocked.";
  } catch (err) {
    statusEl.textContent = err.message || "Couldn't block that user.";
  }
}

async function unblockUser(targetUid) {
  const statusEl = document.getElementById("friends-status");
  statusEl.textContent = "";
  try {
    await callWorkerFunction("unblockUser", { targetUid });
    currentUserData.blockedUsers = (currentUserData.blockedUsers || []).filter(b => b.uid !== targetUid);
    renderBlockedList();
  } catch (err) {
    statusEl.textContent = err.message || "Couldn't unblock that user.";
  }
}
