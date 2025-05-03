let nickname = "";
let color = "#00ffff";
let duration = 10;

const bannedWords = ["nigger", "nigga", "faggot", "bitch", "cunt"];
const socket = new WebSocket("wss://s14579.nyc1.piesocket.com/v3/1?api_key=LWRrgWpIRs39rZWrJKC2qCj74ZYCcGdFgGQQhtJR&notify_self=1");

const chatBox = document.getElementById("chatPopup");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const userCount = document.getElementById("user-count");

document.getElementById("open-chat-btn").addEventListener("click", () => {
  document.getElementById("nicknameModal").style.display = "flex";
});

function closeChat() {
  chatBox.style.display = "none";
}

function submitNickname() {
  const input = document.getElementById("nicknameInput").value.trim();
  color = document.getElementById("colorInput").value;
  duration = parseInt(document.getElementById("durationInput").value, 10);

  if (!input || bannedWords.some(w => input.toLowerCase().includes(w))) {
    alert("Invalid nickname.");
    return;
  }

  nickname = input;
  document.getElementById("nicknameModal").style.display = "none";
  chatBox.style.display = "block";
  socket.send(JSON.stringify({ type: "join", nickname }));
  sendSystemMessage(`${nickname} joined the chat.`);
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

  if (msg.type === "chat") {
    const div = document.createElement("div");
    div.innerHTML = `<strong style="color:${msg.color}">${msg.name}</strong>: ${msg.text}`;
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
  socket.send(JSON.stringify({ type: "system", text }));
}
