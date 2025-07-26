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
const userCount = document.getElementById("user-count");
const sendBtn = document.getElementById("send-chat-btn");
const gifBtn = document.getElementById("gif-btn");
const themeSelect = document.getElementById("themeSelect");
const nicknameModal = document.getElementById("nicknameModal");
const openBtn = document.getElementById("open-chat-btn");
const chatHeader = document.getElementById("chatHeader");

function applyTheme(name) {
  document.body.className = "";
  chatBox.classList.remove("theme-default", "theme-light", "theme-dark", "theme-blue", "theme-green", "theme-purple", "theme-red");
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
    sendSystemMessage(`${nickname} joined the chat.`);
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
  chatBox.style.display = "flex";

  if (!hasJoined) {
    socket.send(JSON.stringify({ type: "join", nickname }));
    sendSystemMessage(`${nickname} joined the chat.`);
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
