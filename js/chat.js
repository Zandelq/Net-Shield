let nickname = localStorage.getItem("nickname") || "";
let color = localStorage.getItem("color") || "#00ffff";
let theme = localStorage.getItem("theme") || "default";
let hasJoined = false;
const GIPHY_API_KEY = "mXzkENvCtDRjUVUZBxa4RZGNIb1GOyr8";
const bannedWords = ["nigger","nigga","faggot","bitch","cunt","balls","dick","dildo","butt","ass"];
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
const nickSubmit = document.getElementById("nick-submit");

function applyTheme(name) {
  document.body.className = "";
  chatBox.className = chatBox.className.split(" ").filter(c => !c.startsWith("theme-")).join(" ");
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
  if (!nickname) nickPrompt();
  else joinChat();
});

nickSubmit.addEventListener("click", () => {
  const input = document.getElementById("nicknameInput").value.trim();
  if (!input || bannedWords.some(w => input.toLowerCase().includes(w))) return alert("Invalid nickname.");
  nickname = input;
  color = document.getElementById("colorInput").value;
  localStorage.setItem("nickname", nickname);
  localStorage.setItem("color", color);
  nickPrompt(false);
  joinChat();
});

function nickPrompt(show = true) {
  if (show) nicknameModal.style.display = "flex";
  chatBox.style.display = "none";
}

function joinChat() {
  if (!hasJoined) {
    socket.send(JSON.stringify({ type:"join", nickname }));
    addSystemMessage(`Welcome, ${nickname}! Type /help for commands.`, true);
    hasJoined = true;
  }
  chatBox.style.display = "flex";
  chatInput.focus();
}

function addSystemMessage(text, isHelp=false) {
  const div = document.createElement("div");
  div.style.color = "cyan";
  div.textContent = text;
  if (isHelp) div.style.fontSize = "1.1em";
  chatMessages.appendChild(div);
}

sendBtn.addEventListener("click", handleSend);
chatInput.addEventListener("keypress", e => { if (e.key === "Enter") handleSend(); });

gifBtn.addEventListener("click", handleSendGif);

async function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  if (text.startsWith("/msg ")) {
    const parts = text.split(" ");
    const target = parts[1];
    const msg = parts.slice(2).join(" ");
    socket.send(JSON.stringify({ type:"whisper", target, name: nickname, text: msg, color }));
    return;
  }
  if (text === "/help") {
    addSystemMessage("Available commands: /msg [user] [message], /help", true);
    return;
  }
  socket.send(JSON.stringify({ type:"chat", name: nickname, text, color }));
}

async function handleSendGif() {
  const query = prompt("Enter GIF search:");
  if (query && !bannedWords.some(w => query.toLowerCase().includes(w))) {
    const gifUrl = await fetchGif(query);
    if (gifUrl) {
      socket.send(JSON.stringify({ type:"chat", name: nickname, text:`<img src="${gifUrl}" style="max-width:200px;">`, color }));
    }
  }
}

async function fetchGif(query) {
  const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=1`);
  const data = await res.json();
  return data.data[0]?.images.fixed_height.url || null;
}

socket.onmessage = event => {
  const msg = JSON.parse(event.data);
  const div = document.createElement("div");
  if (msg.type === "chat") {
    let content = `${msg.name}: ${msg.text}`;
    if (msg.text.includes(`@${nickname}`)) {
      content = content.replace(`@${nickname}`, `<span class="mention">@${nickname}</span>`);
    }
    div.innerHTML = `<strong style="color:${msg.color}">${msg.name}</strong>: ${content}`;
  }
  else if (msg.type === "system") {
    div.style.color = "gray"; div.textContent = msg.text;
  }
  else if (msg.type === "whisper") {
    div.style.fontStyle = "italic";
    div.innerHTML = `<strong style="color:${msg.color}">${msg.name}</strong> (whisper): ${msg.text}`;
  }
  else if (msg.type === "count") { userCount.textContent = msg.count; return; }
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

(function draggableResizeAllSides() {
  chatHeader.addEventListener("mousedown", e => {
    const rect = chatBox.getBoundingClientRect();
    const startX = e.clientX, startY = e.clientY;
    const startW = rect.width, startH = rect.height;
    function move(e) {
      chatBox.style.width = startW + (e.clientX - startX) + "px";
      chatBox.style.height = startH + (e.clientY - startY) + "px";
    }
    function up() { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up); }
    document.addEventListener("mousemove", move);
    document.addEventListener("mouseup", up);
  });
})();
