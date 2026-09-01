// ------------------------------------------------------------------
// Brain Quest — Global Chat.
//
// SAFETY DESIGN, READ THIS FIRST: this app is used by students,
// including an Elementary grade option, meaning children may be using
// it. This chat is deliberately built as PUBLIC GROUP CHAT ONLY —
// there is no private 1-on-1 messaging between individual users, and
// none should be added without real moderation infrastructure behind
// it (see the honest note below).
//
// What this DOES include: a basic profanity filter (client-side
// blocklist — easy to work around, not a substitute for real
// moderation), a report button per message (flags it to a Firestore
// collection for manual review — nothing is auto-removed), and basic
// rate limiting to reduce spam.
//
// What this DOES NOT include, and what a real app serving children
// would need before this chat should be considered production-ready:
// human moderators actually reviewing reports, a way to block/mute
// other users, terms of service and a real code of conduct, and
// likely age-appropriate access controls (e.g., chat disabled or
// heavily restricted for accounts marked as Elementary grade level).
// None of that exists yet — this is infrastructure, not a finished
// trust & safety system.
// ------------------------------------------------------------------

const CHAT_MAX_LENGTH = 200;
const CHAT_RATE_LIMIT_MS = 2000;
let _lastChatSendTime = 0;
let _globalChatListener = null;

// Deliberately basic — a real deployment should use a proper
// moderation service, but this catches the most obvious cases.
const CHAT_BLOCKED_WORDS = ["fuck", "shit", "bitch", "asshole", "cunt", "nigger", "faggot", "retard"];

function containsBlockedWord(text) {
  const lower = text.toLowerCase();
  return CHAT_BLOCKED_WORDS.some(word => lower.includes(word));
}

function initGlobalChat() {
  const toggle = document.getElementById("global-chat-toggle");
  const panel = document.getElementById("global-chat-panel");
  const collapseBtn = document.getElementById("global-chat-collapse-btn");

  toggle.addEventListener("click", () => {
    panel.classList.toggle("hidden");
    if (!panel.classList.contains("hidden")) startGlobalChatListener();
  });
  collapseBtn.addEventListener("click", () => panel.classList.add("hidden"));

  document.getElementById("global-chat-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    await sendGlobalChatMessage();
  });
}

function startGlobalChatListener() {
  if (_globalChatListener) return; // already listening
  _globalChatListener = db.collection("globalChat")
    .orderBy("timestamp", "desc")
    .limit(50)
    .onSnapshot(snapshot => {
      const messages = [];
      snapshot.forEach(doc => messages.push({ id: doc.id, ...doc.data() }));
      messages.reverse();
      renderGlobalChatMessages(messages);
    }, err => {
      console.warn("Global chat listener error:", err.message);
    });
}

function renderGlobalChatMessages(messages) {
  const container = document.getElementById("global-chat-messages");
  const wasScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 40;

  container.innerHTML = messages.map(m => `
    <div class="global-chat-msg${currentUser && m.uid === currentUser.uid ? " global-chat-msg-mine" : ""}">
      <span class="global-chat-msg-name">${escapeHtml(m.name || "Student")}</span>
      <span class="global-chat-msg-text">${escapeHtml(m.text || "")}</span>
      <button class="global-chat-report-btn" data-msg-id="${m.id}" title="Report this message">⚑</button>
    </div>
  `).join("") || `<p class="global-chat-empty">No messages yet — say hi!</p>`;

  container.querySelectorAll(".global-chat-report-btn").forEach(btn => {
    btn.addEventListener("click", () => reportChatMessage(btn.dataset.msgId, "global"));
  });

  if (wasScrolledToBottom) container.scrollTop = container.scrollHeight;
}

async function sendGlobalChatMessage() {
  const input = document.getElementById("global-chat-input");
  const errorEl = document.getElementById("global-chat-error");
  errorEl.textContent = "";

  const text = input.value.trim();
  if (!text) return;

  if (Date.now() - _lastChatSendTime < CHAT_RATE_LIMIT_MS) {
    errorEl.textContent = "You're sending messages too fast — slow down a little.";
    return;
  }
  if (text.length > CHAT_MAX_LENGTH) {
    errorEl.textContent = `Messages are limited to ${CHAT_MAX_LENGTH} characters.`;
    return;
  }
  if (containsBlockedWord(text)) {
    errorEl.textContent = "That message contains language that isn't allowed here.";
    return;
  }

  _lastChatSendTime = Date.now();
  input.value = "";

  try {
    await db.collection("globalChat").add({
      uid: currentUser.uid,
      name: currentUserData.name || "Student",
      text: text,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
  } catch (err) {
    errorEl.textContent = "Couldn't send that message. Please try again.";
  }
}

// Flags a message for manual review — nothing is auto-removed. Scope
// is "global" or a specific duelId for battle chat (see duels.js).
async function reportChatMessage(messageId, scope) {
  try {
    await db.collection("reportedMessages").add({
      messageId: messageId,
      scope: scope,
      reportedBy: currentUser ? currentUser.uid : null,
      reportedAt: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("Thanks — this message has been reported for review.");
  } catch (err) {
    alert("Couldn't submit the report right now.");
  }
}

initGlobalChat();
