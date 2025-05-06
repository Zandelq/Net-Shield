// js/chat.js

let nickname = "";
let userColor = "#00ffff";

// Elements
const nicknameModal = document.getElementById("nicknameModal");
const nicknameInput = document.getElementById("nicknameInput");
const colorInput = document.getElementById("colorInput");
const chatPopup = document.getElementById("chatPopup");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("send-chat-btn");
const gifBtn = document.getElementById("gif-btn");

// Display nickname modal on load
window.onload = () => {
  nicknameModal.style.display = "flex";
};

// Set nickname and color
window.submitNickname = () => {
  nickname = nicknameInput.value || "Anonymous";
  userColor = colorInput.value || "#00ffff";
  nicknameModal.style.display = "none";
  chatPopup.style.display = "block";
};

// Send text message
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

// Add message to chat box
function addChatMessage(name, message, color) {
  const msg = document.createElement("div");
  msg.innerHTML = `<strong style="color: ${color};">${name}:</strong> ${message}`;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Fetch GIF from GIPHY API
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
        addChatMessage("System", "No GIF found for query: " + query, "gray");
      }
    })
    .catch(err => {
      addChatMessage("System", "Error fetching GIF.", "red");
      console.error(err);
    });
}

// Open chat
document.getElementById("open-chat-btn").onclick = () => {
  chatPopup.style.display = "block";
};

// Close chat
window.closeChat = () => {
  chatPopup.style.display = "none";
};

// Open gif input
gifBtn.addEventListener("click", () => {
  const query = prompt("Enter a GIF search term:");
  if (query) fetchGif(query);
});