// File: js/chat.js

let nickname = localStorage.getItem("nickname") || "";
let color = localStorage.getItem("color") || "#00ffff";
let theme = localStorage.getItem("theme") || "default";
let hasJoined = false;
let activeUsers = [];
let autocompleteIndex = 0;

const GIPHY_API_KEY = "mXzkENvCtDRjUVUZBxa4RZGNIb1GOyr8";
const bannedWords = ["nigger", "nigga", "faggot", "bitch", "cunt", "balls", "dick", "dildo", "butt", "ass"];

const socket = new WebSocket("wss://s14579.nyc1.piesocket.com/v3/1?api_key=LWRrgWpIRs39rZWrJKC2qCj74ZYCcGdFgGQQhtJR&notify_self=1");

const chatBox = document.getElementById("chatPopup");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const userCount = document.getElementById("user-count");
const sendBtn = document.getElementById("send-chat-btn");
const gifBtn = document.getElementById("gif-btn");
const themeSelect = document.getElementById("themeSelect");
const nicknameModal = document.getElementById("nicknameModal");
const openBtn = document.getElementById("open-chat-btn");
const chatHeader = document.getElementById("chatHeader");

function applyTheme(name) {
  document.body.className = "";
  chatBox.classList.remove(...Array.from(chatBox.classList).filter(c => c.startsWith("theme-")));
  chatBox.classList.add(`theme-${name}`);
  document.body.classList.add(`theme-${name}`);
}

applyTheme(theme);
themeSelect.value = theme;

themeSelect.addEventListener("change", () => {
  theme = themeSelect.value;
  localStorage.setItem("theme", theme);
  applyTheme(theme);
});

openBtn.addEventListener("click", () => {
  if (!nickname) {
    nicknameModal.style.display = "flex";
    return;
  }
  if (!hasJoined) {
    socket.send(JSON.stringify({ type: "join", nickname }));
    hasJoined = true;
  }
  chatBox.style.display = "flex";
  chatInput.focus();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeChat();
});

function closeChat() {
  chatBox.style.display = "none";
}

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
  chatInput.focus();

  if (!hasJoined) {
    socket.send(JSON.stringify({ type: "join", nickname }));
    sendSystemMessage(`Welcome ${nickname}! Type /help for commands.`);
    hasJoined = true;
  }
}

function sendSystemMessage(text) {
  socket.send(JSON.stringify({ type: "system", text }));
}

sendBtn.addEventListener("click", handleSend);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSend();
  if (chatInput.value.startsWith("/msg ")) autocompleteUsernames(e);
});

async function fetchGif(query) {
  const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=1`);
  const data = await res.json();
  return data.data[0]?.images.fixed_height.url || null;
}

async function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";

  if (text.startsWith("/gif ")) {
    const query = text.slice(5).toLowerCase();
    if (bannedWords.some(w => query.includes(w))) {
      alert("Inappropriate GIF request.");
      return;
    }
    const gifUrl = await fetchGif(query);
    if (gifUrl) {
      socket.send(JSON.stringify({
        type: "chat",
        name: nickname,
        text: `<img src="${gifUrl}" style="max-width:200px;">`,
        color
      }));
    }
    return;
  }

  if (text.startsWith("/msg ")) {
    const parts = text.split(" ");
    const toUser = parts[1];
    const msg = parts.slice(2).join(" ");
    socket.send(JSON.stringify({
      type: "private",
      name: nickname,
      to: toUser,
      text: msg,
      color
    }));
    return;
  }

  if (text === "/help") {
    sendSystemMessage("/gif <term>, /msg <user> <message>");
    return;
  }

  socket.send(JSON.stringify({ type: "chat", name: nickname, text, color }));
}

function autocompleteUsernames(e) {
  const parts = chatInput.value.split(" ");
  const typed = parts[1] || "";
  const matches = activeUsers.filter(name => name.toLowerCase().startsWith(typed.toLowerCase()));

  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    if (matches.length === 0) return;
    autocompleteIndex = (e.key === "ArrowDown")
      ? (autocompleteIndex + 1) % matches.length
      : (autocompleteIndex - 1 + matches.length) % matches.length;
    chatInput.value = `/msg ${matches[autocompleteIndex]} `;
  }
}

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  const div = document.createElement("div");

  if (msg.type === "chat") {
    div.innerHTML = `<strong style="color:${msg.color}">${msg.name}</strong>: ${msg.text}`;
  } else if (msg.type === "system") {
    div.style.color = "gray";
    div.textContent = msg.text;
  } else if (msg.type === "private") {
    if (msg.to === nickname || msg.name === nickname) {
      div.innerHTML = `<em style="color:${msg.color}">${msg.name} → ${msg.to}</em>: ${msg.text}`;
    } else {
      return;
    }
  } else if (msg.type === "join") {
    if (!activeUsers.includes(msg.name)) activeUsers.push(msg.name);
    if (msg.name !== nickname) {
      div.textContent = `${msg.name} joined`;
      div.style.color = "gray";
    }
  }

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

document.addEventListener("DOMContentLoaded", () => {
  chatMessages.style.overflowY = "auto";
  chatMessages.style.maxHeight = "300px";
});
