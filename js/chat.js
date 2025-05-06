// File: js/chat.js

let nickname = localStorage.getItem("nickname") || "";
let color = localStorage.getItem("chatColor") || "#00ffff";
const bannedWords = ["nigger", "nigga", "faggot", "bitch", "cunt"];

const socket = new WebSocket("wss://s14579.nyc1.piesocket.com/v3/1?api_key=LWRrgWpIRs39rZWrJKC2qCj74ZYCcGdFgGQQhtJR&notify_self=1");

const chatBox = document.getElementById("chatPopup");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const userCount = document.getElementById("user-count");
const sendBtn = document.getElementById("send-chat-btn");

const colorSelect = document.getElementById("colorSelect");
if (colorSelect) colorSelect.value = color;

if (!nickname) {
  document.getElementById("open-chat-btn").addEventListener("click", function () {
    const confirmTerms = confirm("By clicking OK, you agree not to say slurs or inappropriate words in the chatroom.");
    if (confirmTerms) {
      document.getElementById("nicknameModal").style.display = "flex";
    }
  });
} else {
  document.getElementById("nicknameModal").style.display = "none";
  chatBox.style.display = "block";
  socket.send(JSON.stringify({ type: "join", nickname: nickname }));
  sendSystemMessage(nickname + " joined the chat.");
}

function closeChat() {
  chatBox.style.display = "none";
}

function submitNickname() {
  const input = document.getElementById("nicknameInput").value.trim();
  color = document.getElementById("colorSelect").value;

  if (!input || bannedWords.some(w => input.toLowerCase().includes(w))) {
    alert("Invalid nickname.");
    return;
  }

  nickname = input;
  localStorage.setItem("nickname", nickname);
  localStorage.setItem("chatColor", color);

  document.getElementById("nicknameModal").style.display = "none";
  chatBox.style.display = "block";
  socket.send(JSON.stringify({ type: "join", nickname: nickname }));
  sendSystemMessage(nickname + " joined the chat.");
}

function sendMessage() {
  const text = chatInput.value.trim();
  if (!text) return;

  socket.send(JSON.stringify({ type: "chat", name: nickname, text: text, color: color }));
  chatInput.value = "";
}

sendBtn.addEventListener("click", sendMessage);
chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendBtn.click();
});

socket.onmessage = function (event) {
  const msg = JSON.parse(event.data);

  if (msg.type === "chat") {
    const div = document.createElement("div");
    div.innerHTML = `<strong style='color:${msg.color}'>${msg.name}</strong>: ${msg.text}`;
    chatMessages.appendChild(div);
  } else if (msg.type === "system") {
    const div = document.createElement("div");
    div.style.color = "gray";
    div.textContent = msg.text;
    chatMessages.appendChild(div);
  } else if (msg.type === "count") {
    userCount.textContent = msg.count;
  }

  chatMessages.scrollTop = chatMessages.scrollHeight;
};

function sendSystemMessage(text) {
  socket.send(JSON.stringify({ type: "system", text: text }));
}

document.getElementById("gif-btn").addEventListener("click", () => {
  const query = prompt("Enter a GIF search term:");
  if (query) fetchGif(query);
});

function fetchGif(query) {
  const apiKey = "0Uw0pKxAGcGdfCL4Iaq9deHTJToZh1YH";
  fetch(`https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(query)}&limit=1&api_key=${apiKey}`)
    .then(res => res.json())
    .then(data => {
      if (data.data && data.data.length > 0) {
        const gifUrl = data.data[0].images.fixed_height.url;
        socket.send(JSON.stringify({
          type: "chat",
          name: nickname,
          text: `<img src='${gifUrl}' height='100'>`,
          color: color
        }));
      } else {
        alert("No GIF found.");
      }
    });
}