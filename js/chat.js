// js/chat.js
let nickname = localStorage.getItem("nickname") || "";
let color = localStorage.getItem("color") || "#00ffff";
let theme = localStorage.getItem("theme") || "default";
let hasJoined = false;

const GIPHY_API_KEY = "mXzkENvCtDRjUVUZBxa4RZGNIb1GOyr8";
const bannedWords = [
  "nigger", "nigga", "faggot", "bitch", "cunt", 
  "balls", "dick", "dildo", "butt", "ass"
];

const socket = new WebSocket("wss://s14579.nyc1.piesocket.com/v3/1?api_key=LWRrgWpIRs39rZWrJKC2qCj74ZYCcGdFgGQQhtJR&notify_self=1");

const chatBox = document.getElementById("chatPopup");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const userCount = document.getElementById("user-count");
const sendBtn = document.getElementById("send-chat-btn");
const gifBtn = document.getElementById("gif-btn");
const themeSelect = document.getElementById("themeSelect");

document.body.classList.add(`theme-${theme}`);
applyTheme(theme);
themeSelect.value = theme;

function applyTheme(name) {
  const themes = {
    default: { background: "#111", textColor: "white", borderColor: "#00ffff" },
    light:   { background: "#ffffff", textColor: "#000000", borderColor: "#dddddd" },
    dark:    { background: "#000000", textColor: "#ffffff", borderColor: "#222222" },
    blue:    { background: "#003366", textColor: "white", borderColor: "#0055aa" },
    green:   { background: "#002d00", textColor: "#afffaf", borderColor: "#00ff00" },
    purple:  { background: "#2c003e", textColor: "#e0ccff", borderColor: "#8a2be2" },
    red:     { background: "#330000", textColor: "#ffcccc", borderColor: "#ff0000" }
  };

  const th = themes[name] || themes.default;
  chatBox.style.backgroundColor = th.background;
  chatBox.style.color = th.textColor;
  chatBox.style.border = `2px solid ${th.borderColor}`;
  chatBox.style.boxShadow = `0 0 10px ${th.borderColor}`;
  const header = chatBox.querySelector(".chat-header");
  if (header) {
    header.style.backgroundColor = th.borderColor;
    header.style.color = th.textColor;
  }
}

document.getElementById("open-chat-btn").addEventListener("click", () => {
  if (!nickname) {
    document.getElementById("nicknameModal").style.display = "flex";
  } else {
    if (!hasJoined) {
      socket.send(JSON.stringify({ type: "join", nickname }));
      sendSystemMessage(`${nickname} joined the chat.`);
      hasJoined = true;
    }
    chatBox.style.display = "flex";
    chatBox.classList.add("fade-in");
  }
});

function closeChat() {
  chatBox.style.display = "none";
}

function submitNickname() {
  const input = document.getElementById("nicknameInput").value.trim();
  color = document.getElementById("colorInput").value;
  theme = document.getElementById("themeSelect").value;

  if (!input || bannedWords.some(w => input.toLowerCase().includes(w))) {
    alert("Invalid nickname.");
    return;
  }

  nickname = input;
  localStorage.setItem("nickname", nickname);
  localStorage.setItem("color", color);
  localStorage.setItem("theme", theme);

  applyTheme(theme);
  document.getElementById("nicknameModal").style.display = "none";
  chatBox.style.display = "flex";
  chatBox.classList.add("fade-in");

  if (!hasJoined) {
    socket.send(JSON.stringify({ type: "join", nickname }));
    sendSystemMessage(`${nickname} joined the chat.`);
    hasJoined = true;
  }
}

function sendSystemMessage(text) {
  socket.send(JSON.stringify({ type: "system", text }));
}

sendBtn.addEventListener("click", handleSend);
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") handleSend();
});
gifBtn.addEventListener("click", async () => {
  const query = prompt("Enter GIF search:");
  if (query && !bannedWords.some(w => query.toLowerCase().includes(w))) {
    const gifUrl = await fetchGif(query);
    if (gifUrl) {
      socket.send(JSON.stringify({ type: "chat", name: nickname, text: `<img src="${gifUrl}" style="max-width:200px;">`, color }));
    } else {
      alert("GIF not found.");
    }
  }
});

async function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";

  if (text.startsWith("/gif ")) {
    const query = text.slice(5).toLowerCase();
    if (bannedWords.some(word => query.includes(word))) {
      alert("Inappropriate GIF request.");
      return;
    }
    const gifUrl = await fetchGif(query);
    if (gifUrl) {
      socket.send(JSON.stringify({ type: "chat", name: nickname, text: `<img src="${gifUrl}" style="max-width:200px;">`, color }));
    } else {
      alert("GIF not found.");
    }
  } else {
    socket.send(JSON.stringify({ type: "chat", name: nickname, text, color }));
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
  } else if (msg.type === "count") {
    userCount.textContent = msg.count;
    return;
  }

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

async function fetchGif(query) {
  const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=1`);
  const data = await res.json();
  return data.data[0]?.images.fixed_height.url || null;
}