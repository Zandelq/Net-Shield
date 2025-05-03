// File: js/chat.js

let nickname = "";
let color = "#00ffff";

const bannedWords = ["nigger", "nigga", "faggot", "bitch", "cunt"];
const socket = new WebSocket("wss://s14579.nyc1.piesocket.com/v3/1?api_key=LWRrgWpIRs39rZWrJKC2qCj74ZYCcGdFgGQQhtJR&notify_self=1");

const chatBox = document.getElementById("chatPopup");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const userCount = document.getElementById("user-count");

let onlineUsers = new Set();
let userJoined = false;

document.getElementById("open-chat-btn").addEventListener("click", () => {
  const confirmTerms = confirm("By clicking OK, you agree not to say slurs or inappropriate words in the chatroom.");
  if (confirmTerms) {
    document.getElementById("nicknameModal").style.display = "flex";
  }
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

  if (!userJoined) {
    socket.send(JSON.stringify({ type: "join", nickname }));
    userJoined = true;
  }
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

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);

  if (msg.type === "join" && !onlineUsers.has(msg.nickname)) {
    onlineUsers.add(msg.nickname);
    if (msg.nickname !== nickname) {
      displaySystemMessage(`${msg.nickname} joined the chat.`);
    }
  } else if (msg.type === "leave") {
    onlineUsers.delete(msg.nickname);
    displaySystemMessage(`${msg.nickname} left the chat.`);
  } else if (msg.type === "chat") {
    displayChatMessage(msg.name, msg.text, msg.color);
    speakText(`${msg.name} says: ${msg.text}`);
  } else if (msg.type === "system") {
    displaySystemMessage(msg.text);
  }

  userCount.textContent = onlineUsers.size;
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

function displayChatMessage(name, text, color) {
  const div = document.createElement("div");
  div.innerHTML = `<strong style="color:${color}">${name}</strong>: ${text}`;
  chatMessages.appendChild(div);
}

function displaySystemMessage(text) {
  const div = document.createElement("div");
  div.style.color = "gray";
  div.textContent = text;
  chatMessages.appendChild(div);
}

function speakText(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  speechSynthesis.speak(utterance);
}

// Handle GIFs
document.querySelectorAll("#gifPanel img").forEach(img => {
  img.addEventListener("click", () => {
    const url = img.src;
    socket.send(JSON.stringify({ type: "chat", name: nickname, text: `<img src="${url}" width="80">`, color }));
  });
});