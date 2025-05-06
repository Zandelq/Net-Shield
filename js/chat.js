let nickname = localStorage.getItem("nickname") || "";
let userColor = localStorage.getItem("userColor") || "#00ffff";
let theme = localStorage.getItem("theme") || "theme-light";
let messages = JSON.parse(localStorage.getItem("chatHistory") || "[]");

const nicknameModal = document.getElementById("nicknameModal");
const nicknameInput = document.getElementById("nicknameInput");
const colorInput = document.getElementById("colorInput");
const themeSelect = document.getElementById("themeSelect");
const chatPopup = document.getElementById("chatPopup");
const chatWrapper = document.getElementById("chatWrapper");
const chatMessages = document.getElementById("chatMessages");
const chatInput = document.getElementById("chatInput");
const sendBtn = document.getElementById("send-chat-btn");
const gifBtn = document.getElementById("gif-btn");
const emojiBtn = document.getElementById("emoji-btn");
const imageUpload = document.getElementById("imageUpload");
const voiceBtn = document.getElementById("voice-btn");
const voicePlayer = document.getElementById("voice-player");

chatWrapper.className = theme;
themeSelect.value = theme;

themeSelect.addEventListener("change", () => {
  chatWrapper.className = themeSelect.value;
  localStorage.setItem("theme", themeSelect.value);
});

document.getElementById("open-chat-btn").onclick = () => {
  nicknameModal.style.display = "flex";
};

// Restore chat history
window.onload = () => {
  messages.forEach(({ name, msg, color }) => addChatMessage(name, msg, color));
};

window.submitNickname = () => {
  nickname = nicknameInput.value || "Anonymous";
  userColor = colorInput.value || "#00ffff";
  localStorage.setItem("nickname", nickname);
  localStorage.setItem("userColor", userColor);
  nicknameModal.style.display = "none";
  chatPopup.style.display = "block";
};

sendBtn.addEventListener("click", () => {
  const text = chatInput.value.trim();
  if (!text) return;
  if (text.startsWith("/gif ")) {
    const query = text.slice(5);
    fetchGif(query);
  } else {
    saveAndAddMessage(nickname, text, userColor);
  }
  chatInput.value = "";
});

chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendBtn.click();
});

emojiBtn.addEventListener("click", () => {
  const emoji = prompt("Enter Emoji:");
  if (emoji) chatInput.value += emoji;
});

imageUpload.addEventListener("change", () => {
  const file = imageUpload.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = e => {
      saveAndAddMessage(nickname, `<img src="${e.target.result}" style="max-width:100%;">`, userColor);
    };
    reader.readAsDataURL(file);
  }
});

function saveAndAddMessage(name, msg, color) {
  const entry = { name, msg, color };
  messages.push(entry);
  localStorage.setItem("chatHistory", JSON.stringify(messages));
  addChatMessage(name, msg, color);
}

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
        saveAndAddMessage(nickname, `<img src="${gifUrl}" style="max-width:100%;">`, userColor);
      } else {
        addChatMessage("System", "No GIF found for query: " + query, "gray");
      }
    })
    .catch(err => {
      addChatMessage("System", "Error fetching GIF.", "red");
      console.error(err);
    });
}

// Voice recording
let mediaRecorder;
let audioChunks = [];

voiceBtn.addEventListener("click", async () => {
  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
    voiceBtn.textContent = "Record Voice";
    return;
  }

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
  mediaRecorder.onstop = () => {
    const blob = new Blob(audioChunks, { type: "audio/webm" });
    audioChunks = [];
    const url = URL.createObjectURL(blob);
    saveAndAddMessage(nickname, `<audio controls src="${url}"></audio>`, userColor);
    voicePlayer.src = url;
    voicePlayer.style.display = "block";
  };

  mediaRecorder.start();
  voiceBtn.textContent = "Stop Recording";
});

window.closeChat = () => {
  chatPopup.style.display = "none";
};