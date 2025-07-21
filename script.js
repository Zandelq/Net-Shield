// === particles.js ===
particlesJS('particles-js', {
  particles: {
    number: { value: 100, density: { enable: true, value_area: 700 } },
    color: { value: '#ffffff' },
    shape: { type: 'circle', stroke: { width: 0 }, polygon: { nb_sides: 5 } },
    opacity: { value: 0.5 },
    size: { value: 5, random: true },
    line_linked: { enable: true, distance: 150, color: '#ffffff', opacity: 0.4, width: 1 },
    move: { enable: true, speed: 6, direction: 'none', out_mode: 'out' }
  },
  interactivity: {
    detect_on: 'canvas',
    events: { onhover: { enable: true, mode: 'repulse' }, onclick: { enable: true, mode: 'push' }, resize: true },
    modes: { repulse: { distance: 200 }, push: { particles_nb: 4 } }
  },
  retina_detect: true
});

// === mouse trail ===
let isMouseTrailActive = JSON.parse(localStorage.getItem('mouseTrailActive')) ?? true;
const trailElements = [], MAX_TRAIL_COUNT = 20, FADE_DURATION = 2000;
const rainbowColors = ['red', 'yellow', 'blue', 'green', 'purple', 'orange', 'cyan', 'pink', 'teal'];
let currentColorIndex = 0, trailIndex = 0, CURSOR_SIZE = 24, OFFSET_X = 10, OFFSET_Y = 20;

function initializeTrailElements() {
  for (let i = 0; i < MAX_TRAIL_COUNT; i++) {
    const trail = document.createElement('div');
    trail.className = 'mouse-trail';
    trail.style.cssText = `
      position:absolute;width:${CURSOR_SIZE}px;height:${CURSOR_SIZE}px;border-radius:50%;
      opacity:0;pointer-events:none;transition:opacity ${FADE_DURATION}ms, background-color 1s;
    `;
    document.body.appendChild(trail);
    trailElements.push(trail);
  }
}

document.addEventListener('mousemove', e => {
  if (!isMouseTrailActive) return;
  const trail = trailElements[trailIndex];
  trail.style.left = `${e.pageX + OFFSET_X - CURSOR_SIZE / 2}px`;
  trail.style.top = `${e.pageY + OFFSET_Y - CURSOR_SIZE / 2}px`;
  trail.style.opacity = '1';
  setTimeout(() => { trail.style.opacity = '0'; }, FADE_DURATION);
  trailIndex = (trailIndex + 1) % MAX_TRAIL_COUNT;
});

function changeTrailColor() {
  currentColorIndex = (currentColorIndex + 1) % rainbowColors.length;
  trailElements.forEach(trail => { trail.style.backgroundColor = rainbowColors[currentColorIndex]; });
}

window.onload = () => {
  initializeTrailElements();
  setInterval(changeTrailColor, 1000);
};

// === tab-bar scroll ===
let lastScrollY = window.scrollY;
const tabBar = document.getElementById("tab-bar");
window.addEventListener("scroll", () => {
  tabBar.style.top = (window.scrollY > lastScrollY) ? "-100px" : "120px";
  lastScrollY = window.scrollY;
});

// === your chat.js logic ===
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

function applyTheme(name) {
  document.body.className = "";
  chatBox.classList.remove("theme-default","theme-light","theme-dark","theme-blue","theme-green","theme-purple","theme-red");
  chatBox.classList.add(`theme-${name}`);
  document.body.classList.add(`theme-${name}`);
}
applyTheme(theme);
themeSelect.value = theme;
themeSelect.addEventListener("change", () => { theme = themeSelect.value; localStorage.setItem("theme", theme); applyTheme(theme); });

openBtn.addEventListener("click", () => {
  if (!nickname) { nicknameModal.style.display = "flex"; return; }
  if (!hasJoined) { socket.send(JSON.stringify({ type: "join", nickname })); sendSystemMessage(`${nickname} joined the chat.`); hasJoined = true; }
  chatBox.style.display = "block";
  chatBox.classList.add("visible","fade-in");
  chatInput.focus();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeChat(); });

function closeChat() { chatBox.style.display = "none"; chatBox.classList.remove("visible","fade-in"); }

function submitNickname() {
  const input = document.getElementById("nicknameInput").value.trim();
  color = document.getElementById("colorInput").value; theme = themeSelect.value;
  if (!input || bannedWords.some(w => input.toLowerCase().includes(w))) { alert("Invalid nickname."); return; }
  nickname = input;
  localStorage.setItem("nickname", nickname);
  localStorage.setItem("color", color);
  localStorage.setItem("theme", theme);
  applyTheme(theme);
  nicknameModal.style.display = "none"; chatBox.style.display = "block"; chatBox.classList.add("visible","fade-in");
  if (!hasJoined) { socket.send(JSON.stringify({ type: "join", nickname })); sendSystemMessage(`${nickname} joined the chat.`); hasJoined = true; }
  chatInput.focus();
}

function sendSystemMessage(text) { socket.send(JSON.stringify({ type: "system", text })); }

sendBtn.addEventListener("click", handleSend);
chatInput.addEventListener("keypress", e => { if (e.key === "Enter") handleSend(); });

gifBtn.addEventListener("click", async () => {
  const query = prompt("Enter GIF search:");
  if (query && !bannedWords.some(w => query.toLowerCase().includes(w))) {
    const gifUrl = await fetchGif(query);
    if (gifUrl) { socket.send(JSON.stringify({ type: "chat", name: nickname, text: `<img src="${gifUrl}" style="max-width:200px;">`, color })); }
    else { alert("GIF not found."); }
  }
});

async function handleSend() {
  const text = chatInput.value.trim();
  if (!text) return;
  chatInput.value = "";
  if (text.startsWith("/gif ")) {
    const query = text.slice(5).toLowerCase();
    if (bannedWords.some(w => query.includes(w))) { alert("Inappropriate GIF request."); return; }
    const gifUrl = await fetchGif(query);
    if (gifUrl) { socket.send(JSON.stringify({ type: "chat", name: nickname, text: `<img src="${gifUrl}" style="max-width:200px;">`, color })); }
    else { alert("GIF not found."); }
  } else {
    socket.send(JSON.stringify({ type: "chat", name: nickname, text, color }));
  }
}

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data); const div = document.createElement("div");
  if (msg.type === "chat") { div.innerHTML = `<strong style="color:${msg.color}">${msg.name}</strong>: ${msg.text}`; }
  else if (msg.type === "system") { div.style.color = "gray"; div.textContent = msg.text; }
  else if (msg.type === "count") { userCount.textContent = msg.count; return; }
  chatMessages.appendChild(div);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

async function fetchGif(query) {
  const res = await fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=1`);
  const data = await res.json();
  return data.data[0]?.images.fixed_height.url || null;
}

// Draggable chat box
(function makeChatDraggable() {
  let isDragging = false, offsetX = 0, offsetY = 0;
  chatHeader.style.cursor = "move";
  chatHeader.addEventListener("mousedown", e => {
    isDragging = true;
    const rect = chatBox.getBoundingClientRect();
    offsetX = e.clientX - rect.left; offsetY = e.clientY - rect.top; e.preventDefault();
  });
  document.addEventListener("mousemove", e => {
    if (isDragging) {
      let left = e.clientX - offsetX; let top = e.clientY - offsetY;
      const maxLeft = window.innerWidth - chatBox.offsetWidth;
      const maxTop = window.innerHeight - chatBox.offsetHeight;
      left = Math.max(0, Math.min(left, maxLeft)); top = Math.max(0, Math.min(top, maxTop));
      chatBox.style.left = `${left}px`; chatBox.style.top = `${top}px`;
    }
  });
  document.addEventListener("mouseup", () => { isDragging = false; });
})();
