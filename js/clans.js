// ------------------------------------------------------------------
// version5 — Clans.
//
// Membership actions (create/join/leave) all route through the
// Worker backend, same reasoning as friends and gifting: they write
// to a shared document (the clan) that the requester doesn't own.
// ------------------------------------------------------------------

async function renderClansScreen() {
  document.getElementById("clans-status").textContent = "";
  _clanLeaderboardCache = null; // fresh data each time the screen is visited, not just once per page load
  const hasClan = !!currentUserData.clanId;
  document.getElementById("clan-my-clan").classList.toggle("hidden", !hasClan);
  document.getElementById("clan-no-clan").classList.toggle("hidden", hasClan);

  if (hasClan) {
    await renderMyClan();
  } else {
    await renderClanBrowseList();
  }

  await renderClanLeaderboard("xp");
}

async function renderMyClan() {
  const statusEl = document.getElementById("clans-status");
  try {
    const doc = await db.collection("clans").doc(currentUserData.clanId).get();
    if (!doc.exists) {
      // Our own record points at a clan that's gone (e.g. it got
      // deleted after the last member left) — clear the stale
      // reference rather than show a broken screen.
      currentUserData.clanId = null;
      currentUserData.clanName = null;
      if (currentUser) await db.collection("users").doc(currentUser.uid).update({ clanId: null, clanName: null });
      renderClansScreen();
      return;
    }
    const clan = doc.data();
    document.getElementById("my-clan-name").textContent = clan.name;
    document.getElementById("my-clan-owner").textContent = `Led by ${clan.ownerName}`;
    document.getElementById("my-clan-members").innerHTML = (clan.members || []).map(m => `
      <div class="friend-row"><span class="friend-name">${escapeHtml(m.name)}${m.uid === clan.ownerUid ? " 👑" : ""}</span></div>
    `).join("");
  } catch (err) {
    statusEl.textContent = err.message || "Couldn't load your clan.";
  }
}

async function renderClanBrowseList() {
  const container = document.getElementById("clan-browse-list");
  container.innerHTML = `<p class="friends-empty">Loading clans...</p>`;
  try {
    const result = await callWorkerFunction("listClans", {});
    const clans = result.clans || [];
    if (clans.length === 0) {
      container.innerHTML = `<p class="friends-empty">No clans yet — be the first to create one!</p>`;
      return;
    }
    container.innerHTML = clans.map(c => `
      <div class="friend-row">
        <span class="friend-name">${escapeHtml(c.name)} <span class="friends-empty">(${c.memberCount} member${c.memberCount === 1 ? "" : "s"})</span></span>
        <button class="btn btn-ghost clan-join-btn" data-clan-id="${c.id}">Join</button>
      </div>
    `).join("");
    container.querySelectorAll(".clan-join-btn").forEach(btn => {
      btn.addEventListener("click", () => joinClan(btn.dataset.clanId));
    });
  } catch (err) {
    container.innerHTML = `<p class="friends-empty">Couldn't load clans right now.</p>`;
  }
}

document.getElementById("create-clan-btn").addEventListener("click", async () => {
  const name = document.getElementById("clan-name-input").value.trim();
  const statusEl = document.getElementById("clans-status");
  const btn = document.getElementById("create-clan-btn");
  statusEl.textContent = "";

  if (!name) {
    statusEl.textContent = "Give your clan a name first.";
    return;
  }
  if ((currentUserData.coins || 0) < 10000) {
    statusEl.textContent = "Creating a clan costs 10,000 coins — you don't have enough yet.";
    return;
  }

  btn.disabled = true;
  try {
    const result = await callWorkerFunction("createClan", { name });
    currentUserData.coins -= 10000;
    currentUserData.lifetimeCoinsSpent = (currentUserData.lifetimeCoinsSpent || 0) + 10000;
    currentUserData.clanId = result.clanId;
    currentUserData.clanName = name;
    updateCoinHud();
    statusEl.textContent = result.message || "Clan created!";
    renderClansScreen();
  } catch (err) {
    statusEl.textContent = err.message || "Couldn't create that clan.";
  } finally {
    btn.disabled = false;
  }
});

async function joinClan(clanId) {
  const statusEl = document.getElementById("clans-status");
  statusEl.textContent = "";
  try {
    const result = await callWorkerFunction("joinClan", { clanId });
    currentUserData.clanId = clanId;
    statusEl.textContent = result.message || "Joined!";
    renderClansScreen();
  } catch (err) {
    statusEl.textContent = err.message || "Couldn't join that clan.";
  }
}

document.getElementById("leave-clan-btn").addEventListener("click", async () => {
  const statusEl = document.getElementById("clans-status");
  if (!confirm(`Leave "${currentUserData.clanName}"?`)) return;
  statusEl.textContent = "";
  try {
    const result = await callWorkerFunction("leaveClan", {});
    currentUserData.clanId = null;
    currentUserData.clanName = null;
    statusEl.textContent = result.message || "Left the clan.";
    renderClansScreen();
  } catch (err) {
    statusEl.textContent = err.message || "Couldn't leave the clan.";
  }
});

let _clanLeaderboardCache = null;

async function renderClanLeaderboard(metric) {
  const listEl = document.getElementById("clan-leaderboard-list");
  listEl.innerHTML = `<p class="leaderboard-loading">Loading clan leaderboard…</p>`;
  try {
    if (!_clanLeaderboardCache) {
      _clanLeaderboardCache = await callWorkerFunction("getClanLeaderboard", {});
    }
    const rows = metric === "lessons" ? _clanLeaderboardCache.byLessons : _clanLeaderboardCache.byXp;
    if (!rows || rows.length === 0) {
      listEl.innerHTML = `<p class="leaderboard-loading">No clans yet — create one to get on the board!</p>`;
      return;
    }
    listEl.innerHTML = rows.map((c, i) => `
      <div class="leaderboard-row ${currentUserData.clanId === c.id ? "leaderboard-row-me" : ""}">
        <span class="leaderboard-rank">#${i + 1}</span>
        <span class="leaderboard-name">${escapeHtml(c.name)} <span class="friends-empty">(${c.memberCount} members)</span></span>
        <span class="leaderboard-xp">${metric === "lessons" ? c.totalLessons + " lessons" : c.totalXp + " XP"}</span>
      </div>
    `).join("");
  } catch (err) {
    listEl.innerHTML = `<p class="leaderboard-loading">Couldn't load the clan leaderboard right now.</p>`;
  }
}

document.querySelectorAll('[data-clan-tab]').forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll('[data-clan-tab]').forEach(b => b.classList.toggle("leaderboard-tab-active", b === btn));
    renderClanLeaderboard(btn.dataset.clanTab);
  });
});
