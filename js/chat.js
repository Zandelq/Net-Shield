let nickname = localStorage.getItem("nickname") || "";
let color = localStorage.getItem("color") || "#00ffff";
let theme = localStorage.getItem("theme") || "default";
let hasJoined = false;
let activeUsers = [];
let autocompleteIndex = -1;

const socket = new WebSocket("wss://s14579.nyc1.piesocket.com/v3/1?api_key=LWRrgWpIRs39rZWrJKC2qCj74Z…");
const GIPHY_API_KEY = "mXzkENvCtDRjUVUZBxa4RZGNIb1GOyr8";
const bannedWords = ["nigger","nigga","faggot","bitch","cunt","balls","dick","dildo","butt","ass"];

const chatBox = document.getElementById("chatPopup");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("send-chat-btn");
const gifBtn = document.getElementById("gif-btn");
const themeSelect = document.getElementById("themeSelect");
const nicknameModal = document.getElementById("nicknameModal");
const openBtn = document.getElementById("open-chat-btn");
const chatHeader = document.getElementById("chatHeader");

// Apply system theme preference on load:
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
if (!localStorage.getItem("theme")) {
  theme = prefersDark ? "dark" : "default";
}
applyTheme(theme);
themeSelect.value = theme;

themeSelect.addEventListener("change", () => {
  theme = themeSelect.value;
  localStorage.setItem("theme", theme);
  applyTheme(theme);
});

function applyTheme(name) {
  document.body.className = "";
  chatBox.className = chatBox.className.split(" ").filter(c => !c.startsWith("theme-")).join(" ");
  chatBox.classList.add(`theme-${name}`);
  document.body.classList.add(`theme-${name}`);
}

openBtn.addEventListener("click", () => {
  if (!nickname) {
    nicknameModal.style.display = "flex";
    return;
  }
  if (!hasJoined) {
    socket.send(JSON.stringify({ type: "join", name: nickname }));
    hasJoined = true;
  }
  chatBox.style.display = "flex";
  chatInput.focus();
});

sendBtn.addEventListener("click", handleSend);
chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter") handleSend();
  if (chatInput.value.startsWith("/msg ")) handleAutocomplete(e);
});

gifBtn.addEventListener("click", async () => {
  const query = prompt("Enter GIF search:");
  if (query && !bannedWords.some(w => query.toLowerCase().includes(w))) {
    const gifUrl = await fetchGif(query);
    if (gifUrl) {
      socket.send(JSON.stringify({ type: "chat", name: nickname, text: `<img src="${gifUrl}" style="max-width:200px;">`, color }));
    }
  }
});

function handleAutocomplete(e) {
  const prefix = chatInput.value.split(" ")[1] || "";
  const matches = activeUsers.filter(u => u.toLowerCase().startsWith(prefix.toLowerCase()));
  if (!matches.length) return;
  if (e.key === "ArrowDown") {
    autocompleteIndex = (autocompleteIndex + 1) % matches.length;
  } else if (e.key === "ArrowUp") {
    autocompleteIndex = (autocompleteIndex - 1 + matches.length) % matches.length;
  }
  chatInput.value = `/msg ${matches[autocompleteIndex]} `;
  e.preventDefault();
}

async function fetchGif(query) {
  const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=1`);
  const data = await res.json();
  return data.data[0]?.images.fixed_height.url || null;
}

async function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  if (text === "/help") {
    const helpDiv = document.createElement("div");
    helpDiv.style.color = "cyan";
    helpDiv.textContent = "Commands: /gif [term], /msg [user] [message], /users";
    chatMessages.appendChild(helpDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return;
  }
  if (text === "/users") {
    const list = activeUsers.join(", ");
    const div = document.createElement("div");
    div.style.color = "gray";
    div.textContent = `Users online: ${list}`;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return;
  }
  if (text.startsWith("/msg ")) {
    const parts = text.split(" ");
    const to = parts[1];
    const msg = parts.slice(2).join(" ");
    if (!to || !msg) return;
    socket.send(JSON.stringify({ type: "private", name: nickname, to, text: msg, color }));
    return;
  }
  if (text.startsWith("/gif ")) {
    const q = text.slice(5).toLowerCase();
    if (!bannedWords.some(w => q.includes(w))) {
      const gifUrl = await fetchGif(q);
      if (gifUrl) {
        socket.send(JSON.stringify({ type: "chat", name: nickname, text: `<img src="${gifUrl}" style="max-width:200px;">`, color }));
      }
    }
    return;
  }
  socket.send(JSON.stringify({ type: "chat", name: nickname, text, color }));
}

socket.onmessage = event => {
  const msg = JSON.parse(event.data);
  const div = document.createElement("div");
  div.style.fontSize = "14px";
  if (msg.type === "chat") {
    div.innerHTML = `<strong style="color:${msg.color}">${msg.name}</strong>: ${msg.text}`;
  } else if (msg.type === "system") {
    div.style.color = "gray";
    div.textContent = msg.text;
  } else if (msg.type === "private") {
    if (msg.to === nickname || msg.name === nickname) {
      div.innerHTML = `<em style="color:${msg.color}">${msg.name} → ${msg.to}</em>: ${msg.text}`;
      div.style.opacity = "0.8";
    } else return;
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
