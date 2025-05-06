const chatInput = document.getElementById("chatInput");
const chatMessages = document.getElementById("chatMessages");
const nicknameModal = document.getElementById("nicknameModal");
const nicknameInput = document.getElementById("nicknameInput");
const colorInput = document.getElementById("colorInput");
const sendBtn = document.getElementById("send-chat-btn");
const gifBtn = document.getElementById("gif-btn");

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

function saveToHistory(html) {
  const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  history.push(html);
  if (history.length > 20) history.shift();
  localStorage.setItem("chatHistory", JSON.stringify(history));
}

function showHistory() {
  const history = JSON.parse(localStorage.getItem("chatHistory") || "[]");
  history.forEach(html => {
    const div = document.createElement("div");
    div.innerHTML = html;
    div.style.opacity = 0;
    chatMessages.appendChild(div);
    setTimeout(() => div.style.opacity = 1, 100);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
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
  chatMessages.innerHTML = "";
  showHistory();
}

function sendMessage() {
  const msg = chatInput.value.trim();
  if (!msg) return;

  const html = `<strong style="color: ${color}">${nickname}:</strong> ${msg}`;
  const div = document.createElement("div");
  div.innerHTML = html;
  div.style.opacity = 0;
  chatMessages.appendChild(div);
  setTimeout(() => div.style.opacity = 1, 100);
  chatMessages.scrollTop = chatMessages.scrollHeight;
  chatInput.value = "";

  saveToHistory(html);
}

function sendGIF() {
  fetch(`https://api.giphy.com/v1/gifs/random?api_key=mXzkENvCtDRjUVUZBxa4RZGNlb1GOyr8&tag=&rating=pg`)
    .then(res => res.json())
    .then(data => {
      const gifUrl = data.data?.images?.downsized_medium?.url;
      if (!gifUrl) return;
      const html = `<strong style="color: ${color}">${nickname}:</strong><br><img src="${gifUrl}" width="100%">`;
      const div = document.createElement("div");
      div.innerHTML = html;
      div.style.opacity = 0;
      chatMessages.appendChild(div);
      setTimeout(() => div.style.opacity = 1, 100);
      chatMessages.scrollTop = chatMessages.scrollHeight;
      saveToHistory(html);
    });
}

document.getElementById("open-chat-btn").onclick = openChat;
sendBtn.onclick = sendMessage;
gifBtn.onclick = sendGIF;
chatInput.addEventListener("keydown", e => {
  if (e.key === "Enter") sendMessage();
});
document.addEventListener("DOMContentLoaded", loadUserData);
window.submitNickname = submitNickname;
window.closeChat = closeChat;