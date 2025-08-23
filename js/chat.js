let nickname = localStorage.getItem("nickname") || "";
let color = localStorage.getItem("color") || "#00ffff";
let theme = localStorage.getItem("theme") || "default";
let hasJoined = false;

const GIPHY_API_KEY = "mXzkENvCtDRjUVUZBxa4RZGNIb1GOyr8";
const bannedWords = ["nigger", "nigga", "faggot", "bitch", "cunt", "balls", "dick", "dildo", "butt", "ass"];
const socket = new WebSocket("wss://s14579.nyc1.piesocket.com/v3/1?api_key=LWRrgWpIRs39rZWrJKC2qCj74ZYCcGdFgGQQhtJR&notify_self=1");

document.getElementById("themeSelect").addEventListener("change", function() {
  const theme = this.value;
  document.body.setAttribute("data-theme", theme);
});


const chatBox = document.getElementById("chatPopup");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("send-chat-btn");
const gifBtn = document.getElementById("gif-btn");
const themeSelect = document.getElementById("themeSelect");
const nicknameModal = document.getElementById("nicknameModal");
const openBtn = document.getElementById("open-chat-btn");
const chatHeader = document.getElementById("chatHeader");

function applyTheme(name) {
  const themes = ["default", "light", "dark", "blue", "green", "purple", "red"];
  document.body.classList.remove(...themes.map(t => `theme-${t}`));
  chatBox.classList.remove(...themes.map(t => `theme-${t}`));

  document.body.classList.add(`theme-${name}`);
  chatBox.classList.add(`theme-${name}`);

  const themedColor = getComputedStyle(document.body).getPropertyValue("--border").trim();
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

openBtn.addEventListener("click", () => {
  if (!nickname) {
    nicknameModal.style.display = "flex";
    return;
  }
  if (!hasJoined) {
    socket.send(JSON.stringify({ type: "join", nickname }));
    socket.send(JSON.stringify({ type: "system", text: `${nickname} joined the chat.` }));
    socket.send(JSON.stringify({ type: "private", from: nickname, to: nickname, text: `${nickname} joined the chat. Type /help for commands`, color }));
    hasJoined = true;
  }
  chatBox.style.display = "flex";
  chatBox.classList.add("visible", "fade-in");
  chatInput.focus();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeChat();
});

function closeChat() {
  chatBox.classList.remove("fade-in");
  chatBox.classList.add("fade-out");

  setTimeout(() => {
    chatBox.style.display = "none";
    chatBox.classList.remove("fade-out");
  }, 300); 
}

document.getElementById("closeChatBtn").addEventListener("click", closeChat);

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
    hasJoined = true;
  }

  chatInput.focus();
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
      socket.send(JSON.stringify({
        type: "chat",
        name: nickname,
        text: `<img src="${gifUrl}" style="max-width:200px;">`,
        color
      }));
    } else {
      alert("GIF not found.");
    }
  }
});

async function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";

  if (text === "/help") {
    const helpText = "Commands: /gif [term] | /msg [user] [message]";
    const div = document.createElement("div");
    div.style.color = "cyan";
    div.textContent = helpText;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return;
  }

  if (text.startsWith("/msg ")) {
    const parts = text.split(" ");
    const target = parts[1];
    const privateMsg = parts.slice(2).join(" ");
    socket.send(JSON.stringify({ type: "private", from: nickname, to: target, text: privateMsg, color }));
    return;
  }

  if (text.startsWith("/gif ")) {
    const query = text.slice(5).toLowerCase();
    if (bannedWords.some(word => query.includes(word))) {
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
  div.style.fontSize = "14px";

  if (msg.type === "chat") {
    div.innerHTML = `<strong style="color:${msg.color}">${msg.name}</strong>: ${msg.text}`;
  } else if (msg.type === "system") {
    div.style.color = "gray";
    div.textContent = msg.text;
  } else if (msg.type === "private") {
    if (msg.to === nickname || msg.from === nickname) {
      div.innerHTML = `<em style="color:yellow;">(Private) <strong style="color:${msg.color}">${msg.from}</strong>: ${msg.text}</em>`;
    } else {
      return;
    }
  }

  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

async function fetchGif(query) {
  const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=1`);
  const data = await res.json();
  return data.data[0]?.images.fixed_height.url || null;
}

(function makeChatDraggable() {
  let isDragging = false, offsetX = 0, offsetY = 0;
  chatHeader.style.cursor = "move";
  chatHeader.addEventListener("mousedown", function (e) {
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
    }
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
  });
})();
