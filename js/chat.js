let nickname = localStorage.getItem("nickname") || "";
let color = localStorage.getItem("color") || "#00ffff";
let theme = localStorage.getItem("theme") || "default";
let hasJoined = false;

const GIPHY_API_KEY = "mXzkENvCtDRjUVUZBxa4RZGNIb1GOyr8";
const bannedWords = ["nigger", "nigga", "faggot", "bitch", "cunt", "balls", "dick", "dildo", "butt", "ass"];
const socket = new WebSocket("wss://s14579.nyc1.piesocket.com/v3/1?api_key=LWRrgWpIRs39rZWrJKC2qCj74ZYCcGdFgGQQhtJR&notify_self=1");

const chatBox = document.getElementById("chatPopup");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("send-chat-btn");
const gifBtn = document.getElementById("gif-btn");
const themeSelect = document.getElementById("themeSelect");
const nicknameModal = document.getElementById("nicknameModal");
const openBtn = document.getElementById("open-chat-btn");
const chatHeader = document.getElementById("chatHeader");

let users = [];
let typingUsers = new Set();
let typingTimeouts = {};
let isTyping = false;
let typingSendTimer = null;
let replyTarget = null;
let autocompleteBox = null;
let autocompleteIndex = -1;
let autocompleteMatches = [];

/* theme and animated backgrounds injection */
function injectThemeAnimations() {
  if (document.getElementById("ns-theme-animations")) return;
  const s = document.createElement("style");
  s.id = "ns-theme-animations";
  s.textContent = `
  .theme-blue { background: radial-gradient(ellipse at center, #00121f 0%, #001F3F 60%); }
  .theme-blue.animated { animation: ns-blue-bg 18s linear infinite; }
  @keyframes ns-blue-bg { 0% {background-position:0% 0%} 50% {background-position:100% 100%} 100% {background-position:0% 0%} }

  .theme-red.animated { background: radial-gradient(circle at 10% 20%, rgba(255,40,40,0.06), transparent 10%), radial-gradient(circle at 80% 80%, rgba(255,10,10,0.04), transparent 15%); animation: ns-red-embers 6s linear infinite; }
  @keyframes ns-red-embers { 0% {filter: hue-rotate(0deg)} 50% {filter: hue-rotate(8deg)} 100% {filter: hue-rotate(0deg)} }

  .theme-purple.animated { background: linear-gradient(120deg, rgba(30,0,40,0.95), rgba(10,0,20,0.95)); animation: ns-purple 12s ease-in-out infinite; }
  @keyframes ns-purple { 0% {opacity:0.95} 50% {opacity:1} 100% {opacity:0.95} }

  .ns-typing-indicator { font-size: 12px; color: #9fefff; margin: 4px 10px; opacity: .95; }
  .ns-user-list { position: absolute; right: 12px; top: 44px; background: rgba(0,0,0,0.6); color: white; padding: 6px; border-radius:6px; font-size:13px; max-height:210px; overflow:auto; width:120px; box-shadow:0 4px 14px rgba(0,0,0,0.6); }
  .ns-user-list .ns-user { padding:4px 6px; cursor:pointer; border-radius:4px; color: #bfe; }
  .ns-user-list .ns-user:hover { background: rgba(255,255,255,0.04); color: white; }
  .ns-reply-badge { display:inline-block; background: rgba(0,255,200,0.08); color:#00ffd5; padding:2px 6px; border-radius:6px; font-size:12px; margin-right:6px; }
  .ns-mention { background: yellow; color: black; padding:0 4px; border-radius:3px; }
  .ns-autocomplete { position: absolute; left: 8px; bottom: 56px; background: #111; color: #9fefff; border:1px solid rgba(0,255,255,0.12); padding:6px; border-radius:6px; box-shadow:0 6px 20px rgba(0,0,0,0.6); z-index:20000; max-height:160px; overflow:auto; min-width:160px; }
  .ns-autocomplete .item { padding:4px 8px; cursor:pointer; color:#9fefff; }
  .ns-autocomplete .item.active { background: #00ffff22; color: white; }
  `;
  document.head.appendChild(s);
}
injectThemeAnimations();

function applyTheme(name) {
  const themes = ["default", "light", "dark", "blue", "green", "purple", "red"];
  document.body.classList.remove(...themes.map(t => `theme-${t}`));
  document.body.classList.add(`theme-${name}`);
  chatBox.classList.remove(...themes.map(t => `theme-${t}`));
  chatBox.classList.add(`theme-${name}`);
  if (name === "blue" || name === "red" || name === "purple") {
    document.body.classList.add("animated");
    chatBox.classList.add("animated");
  } else {
    document.body.classList.remove("animated");
    chatBox.classList.remove("animated");
  }
  const themedColor = getComputedStyle(document.body).getPropertyValue("--border").trim() || "#00ffff";
  sendBtn.style.backgroundColor = themedColor;
  gifBtn.style.backgroundColor = themedColor;
}

applyTheme(theme);
if (themeSelect) themeSelect.value = theme;
if (themeSelect) {
  themeSelect.addEventListener("change", () => {
    theme = themeSelect.value;
    localStorage.setItem("theme", theme);
    applyTheme(theme);
  });
}

/* user list UI */
function ensureUserList() {
  let el = document.querySelector(".ns-user-list");
  if (!el) {
    el = document.createElement("div");
    el.className = "ns-user-list";
    el.style.display = "none";
    chatBox.appendChild(el);
  }
  return el;
}
const userListEl = ensureUserList();

function renderUserList() {
  userListEl.innerHTML = "";
  users.forEach(u => {
    const d = document.createElement("div");
    d.className = "ns-user";
    d.textContent = u;
    d.addEventListener("click", () => {
      chatInput.value = `/msg ${u} `;
      chatInput.focus();
      hideAutocomplete();
    });
    userListEl.appendChild(d);
  });
}

/* typing indicator UI */
function ensureTypingIndicator() {
  let el = chatBox.querySelector(".ns-typing-indicator");
  if (!el) {
    el = document.createElement("div");
    el.className = "ns-typing-indicator";
    el.style.display = "none";
    chatBox.appendChild(el);
  }
  return el;
}
const typingIndicatorEl = ensureTypingIndicator();
function updateTypingIndicator() {
  const arr = Array.from(typingUsers).filter(n => n !== nickname);
  if (arr.length === 0) {
    typingIndicatorEl.style.display = "none";
    typingIndicatorEl.textContent = "";
  } else if (arr.length === 1) {
    typingIndicatorEl.style.display = "";
    typingIndicatorEl.textContent = `${arr[0]} is typing...`;
  } else {
    typingIndicatorEl.style.display = "";
    typingIndicatorEl.textContent = `${arr.slice(0,3).join(", ")} are typing...`;
  }
}

/* manage users set */
function addUserIfMissing(name) {
  if (!name) return;
  if (!users.includes(name)) {
    users.push(name);
    renderUserList();
  }
}

/* autocomplete UI */
function showAutocomplete(matches, rect) {
  hideAutocomplete();
  autocompleteBox = document.createElement("div");
  autocompleteBox.className = "ns-autocomplete";
  autocompleteMatches = matches;
  autocompleteIndex = -1;
  matches.forEach((m, i) => {
    const it = document.createElement("div");
    it.className = "item";
    it.textContent = m;
    it.addEventListener("click", () => {
      chooseAutocomplete(i);
    });
    autocompleteBox.appendChild(it);
  });
  document.body.appendChild(autocompleteBox);
  positionAutocomplete(rect);
}

function positionAutocomplete(rect) {
  if (!autocompleteBox) return;
  const left = rect.left + window.scrollX;
  const bottom = window.innerHeight - rect.top + 6;
  autocompleteBox.style.left = `${left}px`;
  autocompleteBox.style.bottom = `${bottom}px`;
}

function hideAutocomplete() {
  if (autocompleteBox && autocompleteBox.parentNode) autocompleteBox.parentNode.removeChild(autocompleteBox);
  autocompleteBox = null;
  autocompleteMatches = [];
  autocompleteIndex = -1;
}

function highlightAutocomplete(index) {
  if (!autocompleteBox) return;
  const items = autocompleteBox.querySelectorAll(".item");
  items.forEach(it => it.classList.remove("active"));
  if (index >= 0 && items[index]) items[index].classList.add("active");
}

function chooseAutocomplete(index) {
  if (!autocompleteMatches[index]) return;
  const name = autocompleteMatches[index];
  const cur = chatInput.value;
  const base = cur.slice(0, chatInput.selectionStart);
  const prefix = base.replace(/\/msg\s+([^\s]*)$/i, "");
  chatInput.value = `${prefix}/msg ${name} `;
  chatInput.focus();
  hideAutocomplete();
}

/* reply badge UI */
function showReplyBadge() {
  let badge = chatBox.querySelector(".ns-current-reply");
  if (!badge) {
    badge = document.createElement("div");
    badge.className = "ns-current-reply";
    badge.style.padding = "6px 10px";
    badge.style.color = "#9fefff";
    badge.style.fontSize = "13px";
    badge.style.display = "flex";
    badge.style.alignItems = "center";
    badge.style.gap = "8px";
    chatBox.insertBefore(badge, chatMessages);
  }
  if (replyTarget) {
    badge.innerHTML = `<span class="ns-reply-badge">Replying</span> ${replyTarget.name}: "${String(replyTarget.text).slice(0,80)}" <button id="ns-clear-reply" style="margin-left:auto;background:#222;border:1px solid #00ffff;color:#00ffff;padding:4px;border-radius:6px;cursor:pointer;">Cancel</button>`;
    badge.style.display = "";
    document.getElementById("ns-clear-reply").addEventListener("click", () => {
      replyTarget = null;
      badge.style.display = "none";
    });
  } else {
    badge.style.display = "none";
  }
}

/* utility: parse plain join messages to update users list */
function handlePossibleJoinText(text) {
  if (typeof text !== "string") return;
  const m = text.match(/^(.+?) joined the chat\./i);
  if (m) {
    addUserIfMissing(m[1]);
  }
}

/* send typing events to server, throttled */
function sendTypingStart() {
  if (!isTyping) {
    isTyping = true;
    socket.send(JSON.stringify({ type: "typing", from: nickname, typing: true }));
  }
  if (typingSendTimer) clearTimeout(typingSendTimer);
  typingSendTimer = setTimeout(() => {
    isTyping = false;
    socket.send(JSON.stringify({ type: "typing", from: nickname, typing: false }));
  }, 1600);
}

/* attach message click to enable reply */
function attachMessageClick(div, msgObj) {
  div.addEventListener("click", (e) => {
    replyTarget = { name: msgObj.name || msgObj.from || "unknown", text: msgObj.text || "" };
    showReplyBadge();
  });
}

/* mention highlight and notification */
function handleMentions(div, text, from, msgColor) {
  if (!text || !nickname) return false;
  const lowered = String(text).toLowerCase();
  const at = `@${nickname.toLowerCase()}`;
  if (lowered.includes(at)) {
    div.style.background = "linear-gradient(90deg, rgba(255,255,0,0.08), rgba(255,255,0,0.02))";
    const a = new Audio("https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg");
    a.volume = 0.25;
    a.play().catch(() => {});
    return true;
  }
  return false;
}

/* receive messages from socket */
socket.onmessage = (event) => {
  try {
    const msg = JSON.parse(event.data);
    if (!msg) return;
    if (msg.type === "chat") {
      addUserIfMissing(msg.name);
      const div = document.createElement("div");
      div.style.fontSize = "14px";
      div.style.padding = "6px 8px";
      div.style.marginBottom = "6px";
      div.style.borderRadius = "6px";
      div.innerHTML = `<strong style="color:${msg.color || '#00ffff'}">${msg.name}</strong>: ${msg.text || ""}`;
      if (msg.replyTo) {
        const q = document.createElement("div");
        q.style.fontSize = "12px";
        q.style.opacity = "0.85";
        q.style.marginBottom = "4px";
        q.style.padding = "4px 6px";
        q.style.borderLeft = "2px solid rgba(0,255,255,0.12)";
        q.textContent = `reply to ${msg.replyTo.name}: ${String(msg.replyTo.text).slice(0,80)}`;
        div.insertBefore(q, div.firstChild);
      }
      attachMessageClick(div, msg);
      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      handleMentions(div, msg.text, msg.name, msg.color);
      return;
    }
    if (msg.type === "system") {
      handlePossibleJoinText(msg.text);
      const div = document.createElement("div");
      div.style.color = "gray";
      div.style.fontSize = "13px";
      div.style.margin = "6px 0";
      div.textContent = msg.text;
      chatMessages.appendChild(div);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return;
    }
    if (msg.type === "private") {
      addUserIfMissing(msg.from);
      addUserIfMissing(msg.to);
      if (msg.to === nickname || msg.from === nickname) {
        const div = document.createElement("div");
        div.style.fontSize = "14px";
        div.style.padding = "6px 8px";
        div.style.marginBottom = "6px";
        div.style.borderRadius = "6px";
        div.innerHTML = `<em style="color:yellow">(Private) <strong style="color:${msg.color || '#00ffff'}">${msg.from}</strong>: ${msg.text}</em>`;
        attachMessageClick(div, msg);
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
      return;
    }
    if (msg.type === "count") {
      return;
    }
    if (msg.type === "users") {
      if (Array.isArray(msg.list)) {
        users = Array.from(new Set(msg.list));
        renderUserList();
      }
      return;
    }
    if (msg.type === "typing") {
      const who = msg.from;
      if (!who || who === nickname) return;
      if (msg.typing) {
        typingUsers.add(who);
        if (typingTimeouts[who]) clearTimeout(typingTimeouts[who]);
        typingTimeouts[who] = setTimeout(() => {
          typingUsers.delete(who);
          updateTypingIndicator();
        }, 2200);
      } else {
        typingUsers.delete(who);
      }
      updateTypingIndicator();
      return;
    }
  } catch (e) {
    console.error("socket parse", e);
  }
};

/* send functions */
sendBtn.addEventListener("click", handleSend);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSend();
});

chatInput.addEventListener("input", () => {
  sendTypingStart();
  const val = chatInput.value;
  const msgMatch = val.match(/\/msg\s+([^\s]*)$/i);
  if (msgMatch) {
    const partial = msgMatch[1].toLowerCase();
    const matches = users.filter(u => u.toLowerCase().includes(partial) && u.toLowerCase() !== nickname.toLowerCase());
    if (matches.length > 0) {
      const rect = chatInput.getBoundingClientRect();
      showAutocomplete(matches.slice(0, 10), rect);
    } else {
      hideAutocomplete();
    }
  } else {
    hideAutocomplete();
  }
});

chatInput.addEventListener("keydown", (e) => {
  if (!autocompleteBox) return;
  if (e.key === "ArrowDown") {
    e.preventDefault();
    autocompleteIndex = Math.min(autocompleteIndex + 1, autocompleteMatches.length - 1);
    highlightAutocomplete(autocompleteIndex);
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    autocompleteIndex = Math.max(0, autocompleteIndex - 1);
    highlightAutocomplete(autocompleteIndex);
  }
  if (e.key === "Enter" && autocompleteBox) {
    if (autocompleteIndex >= 0) {
      e.preventDefault();
      chooseAutocomplete(autocompleteIndex);
    }
  }
  if (e.key === "Escape") {
    hideAutocomplete();
  }
});

async function handleSend() {
  const textRaw = chatInput.value.trim();
  if (!textRaw) return;
  chatInput.value = "";
  hideAutocomplete();
  if (textRaw === "/help") {
    const helpText = "Commands: /gif [term] | /msg [user] [message] | Click a message to reply";
    const div = document.createElement("div");
    div.style.color = "cyan";
    div.textContent = helpText;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return;
  }
  if (textRaw.startsWith("/msg ")) {
    const parts = textRaw.split(" ");
    const target = parts[1];
    const privateMsg = parts.slice(2).join(" ");
    socket.send(JSON.stringify({ type: "private", from: nickname, to: target, text: privateMsg, color }));
    addUserIfMissing(target);
    return;
  }
  if (textRaw.startsWith("/gif ")) {
    const query = textRaw.slice(5).toLowerCase();
    if (bannedWords.some(word => query.includes(word))) {
      alert("Inappropriate GIF request.");
      return;
    }
    const gifUrl = await fetchGif(query);
    if (gifUrl) {
      socket.send(JSON.stringify({ type: "chat", name: nickname, text: `<img src="${gifUrl}" style="max-width:200px;">`, color, replyTo: replyTarget }));
      replyTarget = null;
      showReplyBadge();
    } else {
      alert("GIF not found.");
    }
    return;
  }
  const payload = { type: "chat", name: nickname, text: textRaw, color };
  if (replyTarget) payload.replyTo = replyTarget;
  socket.send(JSON.stringify(payload));
  replyTarget = null;
  showReplyBadge();
}

/* gif fetcher */
async function fetchGif(query) {
  const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=1`);
  const data = await res.json();
  return data.data[0]?.images.fixed_height.url || null;
}

/* open/close chat and join handling */
openBtn.addEventListener("click", () => {
  if (!nickname) {
    nicknameModal.style.display = "flex";
    return;
  }
  if (!hasJoined) {
    socket.send(JSON.stringify({ type: "join", nickname }));
    socket.send(JSON.stringify({ type: "system", text: `${nickname} joined the chat.` }));
    socket.send(JSON.stringify({ type: "private", from: nickname, to: nickname, text: `${nickname} joined the chat. Type /help for commands`, color }));
    addUserIfMissing(nickname);
    hasJoined = true;
  }
  chatBox.style.display = "flex";
  chatBox.classList.add("visible", "fade-in");
  chatInput.focus();
});

function closeChat() {
  chatBox.classList.remove("fade-in");
  chatBox.classList.add("fade-out");
  setTimeout(() => {
    chatBox.style.display = "none";
    chatBox.classList.remove("fade-out");
  }, 300);
}
const closeBtn = document.getElementById("closeChatBtn");
if (closeBtn) closeBtn.addEventListener("click", closeChat);

function submitNickname() {
  const input = document.getElementById("nicknameInput").value.trim();
  if (!input || bannedWords.some(w => input.toLowerCase().includes(w))) {
    alert("Invalid nickname.");
    return;
  }
  nickname = input;
  color = document.getElementById("colorInput").value;
  theme = themeSelect.value;
  localStorage.setItem("nickname", nickname);
  localStorage.setItem("color", color);
  localStorage.setItem("theme", theme);
  applyTheme(theme);
  nicknameModal.style.display = "none";
  chatBox.style.display = "flex";
  chatBox.classList.add("visible", "fade-in");
  if (!hasJoined) {
    socket.send(JSON.stringify({ type: "join", nickname }));
    socket.send(JSON.stringify({ type: "system", text: `${nickname} joined the chat.` }));
    socket.send(JSON.stringify({ type: "private", from: nickname, to: nickname, text: `${nickname} joined the chat. Type /help for commands`, color }));
    addUserIfMissing(nickname);
    hasJoined = true;
  }
  chatInput.focus();
}

/* draggable header handle */
(function makeChatDraggable() {
  let isDragging = false, offsetX = 0, offsetY = 0;
  if (chatHeader) chatHeader.style.cursor = "move";
  if (chatHeader) chatHeader.addEventListener("mousedown", function (e) {
    isDragging = true;
    const rect = chatBox.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    e.preventDefault();
  });
  document.addEventListener("mousemove", function (e) {
    if (isDragging) {
      let left = e.clientX - offsetX;
      let top = e.clientY - offsetY;
      const maxLeft = window.innerWidth - chatBox.offsetWidth;
      const maxTop = window.innerHeight - chatBox.offsetHeight;
      left = Math.max(0, Math.min(left, maxLeft));
      top = Math.max(0, Math.min(top, maxTop));
      chatBox.style.left = `${left}px`;
      chatBox.style.top = `${top}px`;
      chatBox.style.right = "auto";
      chatBox.style.bottom = "auto";
    }
  });
  document.addEventListener("mouseup", function () {
    isDragging = false;
  });
})();

/* initialize UI pieces */
renderUserList();
updateTypingIndicator();
showReplyBadge();