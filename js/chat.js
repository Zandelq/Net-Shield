// js/chat.js

let nickname = localStorage.getItem("nickname") || "";
let color = localStorage.getItem("color") || "#00ffff";
let theme = localStorage.getItem("theme") || "default";
let joinedOnce = false;

const GIPHY_API_KEY = "mXzkENvCtDRjUVUZBxa4RZGNIb1GOyr8";
const bannedWords = ["nigger", "nigga", "faggot", "bitch", "cunt"];
const bannedGifWords = ["balls", "dick", "dildo", "butt", "ass"];

const socket = new WebSocket("wss://s14579.nyc1.piesocket.com/v3/1?api_key=LWRrgWpIRs39rZWrJKC2qCj74ZYCcGdFgGQQhtJR&notify_self=1");

const chatBox = document.getElementById("chatPopup");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const userCount = document.getElementById("user-count");
const sendBtn = document.getElementById("send-chat-btn");
const gifBtn = document.getElementById("gif-btn");
const themeSelect = document.getElementById("themeSelect");
const openChatBtn = document.getElementById("open-chat-btn");
const nicknameModal = document.getElementById("nicknameModal");

applyTheme(theme);

openChatBtn.addEventListener("click", () => {
  if (chatBox.style.display === "block") return;
  if (!nickname) {
    nicknameModal.style.display = "flex";
  } else {
    chatBox.style.display = "block";
    chatBox.classList.add("fade-in");
    if (!joinedOnce) {
      socket.send(JSON.stringify({ type: "join", nickname }));
      sendSystemMessage(`${nickname} joined the chat.`);
      joinedOnce = true;
    }
  }
});

themeSelect.addEventListener("change", () => {
  theme = themeSelect.value;
  localStorage.setItem("theme", theme);
  applyTheme(theme);
});

function applyTheme(themeName) {
  document.body.className = "";
  document.body.classList.add(`theme-${themeName}`);
}

function closeChat() {
  chatBox.style.display = "none";
}

function submitNickname() {
  const input = document.getElementById("nicknameInput").value.trim();
  color = document.getElementById("colorInput").value;
  theme = themeSelect.value;

  if (!input || bannedWords.some(w => input.toLowerCase().includes(w))) {
    alert("Invalid nickname.");
    return;
  }

  nickname = input;
  localStorage.setItem("nickname", nickname);
  localStorage.setItem("color", color);
  localStorage.setItem("theme", theme);
  applyTheme(theme);
  nicknameModal.style.display = "none";
  chatBox.style.display = "block";
  chatBox.classList.add("fade-in");

  if (!joinedOnce) {
    socket.send(JSON.stringify({ type: "join", nickname }));
    sendSystemMessage(`${nickname} joined the chat.`);
    joinedOnce = true;
  }
}

function sendSystemMessage(text) {
  socket.send(JSON.stringify({ type: "system", text }));
}

sendBtn.addEventListener("click", async () => {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";

  if (text.startsWith("/gif ")) {
    const query = text.replace("/gif ", "");
    if (bannedGifWords.some(w => query.toLowerCase().includes(w))) return alert("GIF query blocked.");
    const gifUrl = await fetchGif(query);
    if (gifUrl) {
      socket.send(JSON.stringify({ type: "chat", name: nickname, text: `<img src=\"${gifUrl}\" style=\"max-width:200px;\">`, color }));
    } else {
      alert("GIF not found.");
    }
  } else {
    socket.send(JSON.stringify({ type: "chat", name: nickname, text, color }));
  }
});

gifBtn.addEventListener("click", async () => {
  const query = prompt("Enter GIF search:");
  if (bannedGifWords.some(w => query.toLowerCase().includes(w))) return alert("GIF query blocked.");
  const gifUrl = await fetchGif(query);
  if (gifUrl) {
    socket.send(JSON.stringify({ type: "chat", name: nickname, text: `<img src=\"${gifUrl}\" style=\"max-width:200px;\">`, color }));
  } else {
    alert("GIF not found.");
  }
});

chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  const div = document.createElement("div");

  if (msg.type === "chat") {
    div.innerHTML = `<strong style=\"color:${msg.color}\">${msg.name}</strong>: ${msg.text}`;
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