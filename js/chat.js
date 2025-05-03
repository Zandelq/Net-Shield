let nickname = "";
let color = "#00ffff";
const bannedWords = ["nigger", "nigga", "faggot", "bitch", "cunt"];
const socket = new WebSocket("wss://s14579.nyc1.piesocket.com/v3/1?api_key=LWRrgWpIRs39rZWrJKC2qCj74ZYCcGdFgGQQhtJR&notify_self=1");

const chatBox = document.getElementById("chatPopup");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const userCount = document.getElementById("user-count");

let onlineUsers = new Set();
let agreedToRules = false;
let mediaRecorder;
let recording = false;
let audioChunks = [];

document.getElementById("open-chat-btn").addEventListener("click", () => {
  if (!agreedToRules) {
    document.getElementById("rulesModal").style.display = "flex";
  } else {
    document.getElementById("nicknameModal").style.display = "flex";
  }
});

document.getElementById("agreeBtn").addEventListener("click", () => {
  agreedToRules = true;
  document.getElementById("rulesModal").style.display = "none";
  document.getElementById("nicknameModal").style.display = "flex";
});

function closeChat() {
  chatBox.style.display = "none";
}

function submitNickname() {
  const input = document.getElementById("nicknameInput").value.trim();
  color = document.getElementById("colorInput").value;
  if (!input || bannedWords.some(w => input.toLowerCase().includes(w))) {
    alert("Invalid nickname.");
    return;
  }
  nickname = input;
  document.getElementById("nicknameModal").style.display = "none";
  chatBox.style.display = "block";
  socket.send(JSON.stringify({ type: "join", nickname }));
}

chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const text = chatInput.value.trim();
    if (text) {
      socket.send(JSON.stringify({ type: "chat", name: nickname, text, color }));
      chatInput.value = "";
    }
  }
});

document.getElementById("voice-btn").addEventListener("click", async () => {
  if (recording) {
    mediaRecorder.stop();
    recording = false;
    return;
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);
  audioChunks = [];
  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(audioChunks, { type: "audio/webm" });
    const reader = new FileReader();
    reader.onloadend = () => {
      socket.send(JSON.stringify({ type: "voice", name: nickname, audio: reader.result, color }));
    };
    reader.readAsDataURL(blob);
  };
  mediaRecorder.start();
  recording = true;
});

document.getElementById("gif-btn").addEventListener("click", () => {
  const url = prompt("Paste GIF URL:");
  if (url) {
    socket.send(JSON.stringify({ type: "chat", name: nickname, text: `<img src='${url}' width='100'>`, color }));
  }
});

document.getElementById("emoji-btn").addEventListener("click", () => {
  const emoji = prompt("Enter emoji:");
  if (emoji) chatInput.value += emoji;
});

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  if (msg.type === "join" && !onlineUsers.has(msg.nickname)) {
    onlineUsers.add(msg.nickname);
    const div = document.createElement("div");
    div.style.color = "gray";
    div.textContent = `${msg.nickname} joined the chat.`;
    chatMessages.appendChild(div);
  } else if (msg.type === "leave") {
    onlineUsers.delete(msg.nickname);
    const div = document.createElement("div");
    div.style.color = "gray";
    div.textContent = `${msg.nickname} left the chat.`;
    chatMessages.appendChild(div);
  } else if (msg.type === "chat") {
    const div = document.createElement("div");
    div.innerHTML = `<strong style="color:${msg.color}">${msg.name}</strong>: ${msg.text}`;
    chatMessages.appendChild(div);
  } else if (msg.type === "voice") {
    const div = document.createElement("div");
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.src = msg.audio;
    div.innerHTML = `<strong style="color:${msg.color}">${msg.name}</strong>: `;
    div.appendChild(audio);
    chatMessages.appendChild(div);
  }
  userCount.textContent = onlineUsers.size;
  chatMessages.scrollTop = chatMessages.scrollHeight;
};