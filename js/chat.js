let nickname = localStorage.getItem("nickname") || "";
let userColor = localStorage.getItem("userColor") || "#00ffff";
let themeColor = localStorage.getItem("themeColor") || "#00ffff";

const nicknameModal = document.getElementById("nicknameModal");
const nicknameInput = document.getElementById("nicknameInput");
const colorInput = document.getElementById("colorInput");
const themeSelect = document.getElementById("themeSelect");
const chatPopup = document.getElementById("chatPopup");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("send-chat-btn");
const gifBtn = document.getElementById("gif-btn");

window.onload = () => {
  if (!nickname) {
    nicknameModal.style.display = "flex";
  } else {
    applyTheme(themeColor);
    chatPopup.style.display = "block";
  }
};

window.submitNickname = () => {
  nickname = nicknameInput.value || "Anonymous";
  userColor = colorInput.value || "#00ffff";
  themeColor = themeSelect.value || "#00ffff";

  localStorage.setItem("nickname", nickname);
  localStorage.setItem("userColor", userColor);
  localStorage.setItem("themeColor", themeColor);

  nicknameModal.style.display = "none";
  chatPopup.style.display = "block";

  applyTheme(themeColor);
};

sendBtn.addEventListener("click", () => {
  const text = chatInput.value.trim();
  if (!text) return;
  if (text.startsWith("/gif ")) {
    const query = text.slice(5);
    fetchGif(query);
  } else {
    addChatMessage(nickname, text, userColor);
  }
  chatInput.value = "";
});

function addChatMessage(name, message, color) {
  const msg = document.createElement("div");
  msg.innerHTML = `<strong style="color: ${color};">${name}:</strong> ${message}`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function fetchGif(query) {
  const apiKey = "mXzkENvCtDRjUVUZBxa4RZGNIb1GOyr8";
  const url = `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=1&offset=0`;

  fetch(url)
    .then(res => res.json())
    .then(data => {
      const gifUrl = data.data[0]?.images?.downsized_medium?.url;
      if (gifUrl) {
        addChatMessage(nickname, `<img src="${gifUrl}" style="max-width:100%;">`, userColor);
      } else {
        addChatMessage("System", "No GIF found for: " + query, "gray");
      }
    })
    .catch(() => {
      addChatMessage("System", "Error fetching GIF.", "red");
    });
}

document.getElementById("open-chat-btn").onclick = () => {
  chatPopup.style.display = "block";
};

window.closeChat = () => {
  chatPopup.style.display = "none";
};

gifBtn.addEventListener("click", () => {
  const query = prompt("Enter a GIF search term:");
  if (query) fetchGif(query);
});

chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendBtn.click();
});

function applyTheme(color) {
  chatPopup.style.border = `2px solid ${color}`;
  chatPopup.style.boxShadow = `0 0 10px ${color}`;
}