// ------------------------------------------------------------------
// Study Boss — Leaderboard.
//
// Reads the top 20 users by XP directly from Firestore. This is a
// simple sorted query (not real-time sync), so it refreshes each time
// the Leaderboard tab is opened rather than updating live — that
// keeps it cheap and avoids needing a Firestore index for anything
// beyond a single-field sort.
// ------------------------------------------------------------------

async function renderLeaderboard() {
  const listEl = document.getElementById("leaderboard-list");
  listEl.innerHTML = `<p class="leaderboard-loading">Loading leaderboard…</p>`;

  try {
    const snapshot = await db.collection("users")
      .orderBy("xp", "desc")
      .limit(20)
      .get();

    if (snapshot.empty) {
      listEl.innerHTML = `<p class="leaderboard-loading">No students on the leaderboard yet.</p>`;
      return;
    }

    listEl.innerHTML = "";
    let rank = 0;
    snapshot.forEach(doc => {
      rank++;
      const data = doc.data();
      const isMe = currentUser && doc.id === currentUser.uid;
      const row = document.createElement("div");
      row.className = "leaderboard-row" + (isMe ? " leaderboard-row-me" : "");
      row.innerHTML = `
        <span class="leaderboard-rank">#${rank}</span>
        <span class="leaderboard-name">${escapeHtml(data.name || "Student")}${isMe ? " (you)" : ""}</span>
        <span class="leaderboard-xp">${data.xp || 0} XP</span>
      `;
      listEl.appendChild(row);
    });
  } catch (err) {
    listEl.innerHTML = `<p class="leaderboard-loading">Couldn't load the leaderboard right now.</p>`;
  }
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}
