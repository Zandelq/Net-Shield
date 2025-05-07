let nickname = localStorage.getItem("nickname") || "";
let color = localStorage.getItem("color") || "#00ffff";
const theme = localStorage.getItem("theme") || "default";

const bannedWords = ["nigger", "nigga", "faggot", "bitch", "cunt"];
const GIPHY_API_KEY = "mXzkENvCtDRjUVUZBxa4RZGNIb1GOyr8";

const socket = new WebSocket("wss://s14579.nyc1.piesocket.com/v3/1?api_key=LWRrgWpIRs39rZWrJKC2qCj74ZYCcGdFgGQQhtJR&notify_self=1");

const chatBox = document.getElementById("chatPopup");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const userCount = document.getElementById("user-count");

const themeSelect = document.getElementById("themeSelect");

function applyTheme(themeName) {
  chatBox.classList.remove("theme-dark", "theme-light", "theme-blue", "theme-green");
  if (themeName !== "default") {
    chatBox.classList.add(`theme-${themeName}`);
  }
  localStorage.setItem("theme", themeName);
}

applyTheme(theme);
if (themeSelect) themeSelect.value = theme;

if (themeSelect) {
  themeSelect.addEventListener("change", () => {
    applyTheme(themeSelect.value);
  });
}

document.getElementById("open-chat-btn").addEventListener("click", () => {
  const confirmTerms = confirm("By clicking OK, you agree not to say slurs or inappropriate words in the chatroom.");
  if (confirmTerms) {
    if (nickname) {
      chatBox.style.display = "block";
    } else {
      document.getElementById("nicknameModal").style.display = "flex";
    }
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
  localStorage.setItem("nickname", nickname);
  localStorage.setItem("color", color);
  document.getElementById("nicknameModal").style.display = "none";
  chatBox.style.display = "block";
  socket.send(JSON.stringify({ type: "join", nickname }));
  sendSystemMessage(`${nickname} joined the chat.`);
}

chatInput.addEventListener("keypress", async (e) => {
  if (e.key === "Enter") {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = "";

    if (text.startsWith("/gif ")) {
      const query = text.replace("/gif ", "");
      const gifUrl = await fetchGif(query);
      if (gifUrl) {
        socket.send(JSON.stringify({ type: "chat", name: nickname, text: `<img src=\"${gifUrl}\" style=\"max-width:200px;\">`, color }));
      } else {
        alert("GIF not found.");
      }
    } else {
      socket.send(JSON.stringify({ type: "chat", name: nickname, text, color }));
    }
  }
});

socket.onmessage = (event) => {
  const msg = JSON.parse(event.data);
  const div = document.createElement("div");

  if (msg.type === "chat") {
    div.innerHTML = `<strong style=\"color:${msg.color}\">${msg.name}</strong>: ${msg.text}`;
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

function sendSystemMessage(text) {
  socket.send(JSON.stringify({ type: "system", text }));
}

async function fetchGif(query) {
  const res = await fetch(`https://api.giphy.com/v1/gifs/search?q=${encodeURIComponent(query)}&api_key=${GIPHY_API_KEY}&limit=1`);
  const data = await res.json();
  return data.data[0]?.images.fixed_height.url || null;
}