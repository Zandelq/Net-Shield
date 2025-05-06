const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const nicknameModal = document.getElementById("nicknameModal");
const nicknameInput = document.getElementById("nicknameInput");
const colorInput = document.getElementById("colorInput");
const sendBtn = document.createElement("button");
sendBtn.id = "send-chat-btn";
sendBtn.innerText = "Send";

chatInput.after(sendBtn);

let nickname = "";
let color = "#00ffff";

function loadUserData() {
  const storedName = localStorage.getItem("nickname");
  const storedColor = localStorage.getItem("color");
  if (storedName && storedColor) {
    nickname = storedName;
    color = storedColor;
    nicknameModal.style.display = "none";
  } else {
    nicknameModal.style.display = "flex";
  }
}

function submitNickname() {
  nickname = nicknameInput.value.trim() || "Anonymous";
  color = colorInput.value;
  localStorage.setItem("nickname", nickname);
  localStorage.setItem("color", color);
  nicknameModal.style.display = "none";
}

function closeChat() {
  document.getElementById("chatPopup").style.display = "none";
}

function openChat() {
  const chatPopup = document.getElementById("chatPopup");
  chatPopup.style.display = "block";
  chatInput.focus();
}

function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;

  const msgEl = document.createElement("div");
  msgEl.innerHTML = `<strong style="color: ${color}">${nickname}:</strong> ${msg}`;
  chatMessages.appendChild(msgEl);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  chatInput.value = "";
}

function sendGIF() {
  fetch(`https://api.giphy.com/v1/gifs/search?api_key=mXzkENvCtDRjUVUZBxa4RZGNlb1GOyr8&q=funny&limit=1`)
    .then(res => res.json())
    .then(data => {
      const gifUrl = data.data[0]?.images?.downsized_medium?.url;
      if (gifUrl) {
        const msgEl = document.createElement("div");
        msgEl.innerHTML = `<strong style="color: ${color}">${nickname}:</strong><br><img src="${gifUrl}" width="100%">`;
        chatMessages.appendChild(msgEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    });
}

document.getElementById("open-chat-btn").onclick = openChat;
sendBtn.onclick = sendMessage;
chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendBtn.click();
});
document.addEventListener("DOMContentLoaded", loadUserData);
window.submitNickname = submitNickname;
window.closeChat = closeChat;
window.sendGIF = sendGIF;;