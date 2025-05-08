let nickname = localStorage.getItem("nickname") || "";
let color = localStorage.getItem("color") || "#00ffff";
let theme = localStorage.getItem("theme") || "default";

const GIPHY_API_KEY = "mXzkENvCtDRjUVUZBxa4RZGNIb1GOyr8";
const bannedWords = ["nigger", "nigga", "faggot", "bitch", "cunt"];

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
const nicknameInput = document.getElementById("nicknameInput");
const colorInput = document.getElementById("colorInput");

const openSound = new Audio("/sounds/chat-open.mp3"); // Make sure this file exists

document.body.classList.add(`theme-${theme}`);

// Fade-in effect
function fadeIn(el) {
  el.style.opacity = 0;
  el.style.display = "flex";
  let op = 0;
  const tick = () => {
    op += 0.05;
    el.style.opacity = op;
    if (op < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Chat open
openChatBtn.addEventListener("click", () => {
  if (!nickname) {
    nicknameModal.style.display = "flex";
  } else {
    fadeIn(chatBox);
    openSound.play();
    socket.send(JSON.stringify({ type: "join", nickname }));
    sendSystemMessage(`${nickname} joined the chat.`);
  }
});

function closeChat() {
  chatBox.style.display = "none";
}

function submitNickname() {
  const input = nicknameInput.value.trim();
  color = colorInput.value;
  theme = themeSelect.value;

  if (!input || bannedWords.some(w => input.toLowerCase().includes(w))) {
    alert("Invalid nickname.");
    return;
  }

  nickname = input;
  localStorage.setItem("nickname", nickname);
  localStorage.setItem("color", color);
  localStorage.setItem("theme", theme);

  document.body.className = "";
  document.body.classList.add(`theme-${theme}`);

  nicknameModal.style.display = "none";
  fadeIn(chatBox);
  openSound.play();
  socket.send(JSON.stringify({ type: "join", nickname }));
  sendSystemMessage(`${nickname} joined the chat.`);
}

// Theme change
themeSelect.addEventListener("change", () => {
  const selectedTheme = themeSelect.value;
  chatBox.classList.remove("theme-light", "theme-dark", "theme-blue", "theme-green");
  if (selectedTheme !== "default") {
    chatBox.classList.add(`theme-${selectedTheme}`);
  }
  localStorage.setItem("theme", selectedTheme);
});

function sendSystemMessage(text) {
  socket.send(JSON.stringify({ type: "system", text }));
}

sendBtn.addEventListener("click", async () => {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";

  if (text.startsWith("/gif ")) {
    const query = text.replace("/gif ", "");
    const gifUrl = await fetchGif(query);
    if (gifUrl) {
      socket.send(JSON.stringify({ type: "chat", name: nickname, text: `<img src="${gifUrl}" style="max-width:200px;">`, color }));
    } else {
      alert("GIF not found.");
    }
  } else {
    socket.send(JSON.stringify({ type: "chat", name: nickname, text, color }));
  }
});

gifBtn.addEventListener("click", async () => {
  const query = prompt("Enter GIF search:");
  if (query) {
    const gifUrl = await fetchGif(query);
    if (gifUrl) {
      socket.send(JSON.stringify({ type: "chat", name: nickname, text: `<img src="${gifUrl}" style="max-width:200px;">`, color }));
    } else {
      alert("GIF not found.");
    }
  }
});

chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

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
function makeDraggable(elmnt, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  handle.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDrag;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Attach it after DOM is ready
makeDraggable(chatBox, document.getElementById("chatHeader"));
function makeDraggable(elmnt, handle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

  handle.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDrag;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
  }

  function closeDrag() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// Attach it after DOM is ready
makeDraggable(chatBox, document.getElementById("chatHeader"));