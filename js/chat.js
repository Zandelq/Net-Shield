document.addEventListener("DOMContentLoaded", () => {
  let nickname = "";
  let color = "#00ffff";
  const bannedWords = ["nigger", "nigga", "faggot", "bitch", "cunt"];
  const socket = new WebSocket("wss://s14579.nyc1.piesocket.com/v3/1?api_key=LWRrgWpIRs39rZWrJKC2qCj74ZYCcGdFgGQQhtJR&notify_self=1");

  const chatBox = document.getElementById("chatPopup");
  const chatMessages = document.getElementById("chatMessages");
  const chatInput = document.getElementById("chatInput");
  const userCount = document.getElementById("user-count");
  const gifPanel = document.getElementById("gifPanel");

  let onlineUsers = new Set();
  let hasJoined = false;

  document.getElementById("open-chat-btn").addEventListener("click", () => {
    document.getElementById("nicknameModal").style.display = "flex";
  });

  document.getElementById("submitNicknameBtn").addEventListener("click", submitNickname);

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

    // Only send join once
    if (!hasJoined) {
      socket.send(JSON.stringify({ type: "join", nickname }));
      hasJoined = true;
    }
  }

  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      const text = chatInput.value.trim();
      if (text) {
        const isGif = text.endsWith(".gif") || text.includes("giphy.com/media");
        socket.send(JSON.stringify({
          type: "chat",
          name: nickname,
          color,
          ...(isGif ? { gif: text } : { text })
        }));
        chatInput.value = "";
      }
    }
  });

  gifPanel.addEventListener("click", (e) => {
    if (e.target.tagName === "IMG") {
      const gifUrl = e.target.src;
      socket.send(JSON.stringify({ type: "chat", name: nickname, color, gif: gifUrl }));
    }
  });

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);

    if (msg.type === "join") {
      if (!onlineUsers.has(msg.nickname)) {
        onlineUsers.add(msg.nickname);
        if (msg.nickname !== nickname) {
          addSystemMessage(`${msg.nickname} joined the chat.`);
        }
      }
    }

    if (msg.type === "leave") {
      if (onlineUsers.has(msg.nickname)) {
        onlineUsers.delete(msg.nickname);
        addSystemMessage(`${msg.nickname} left the chat.`);
      }
    }

    if (msg.type === "chat") {
      const div = document.createElement("div");
      if (msg.gif) {
        div.innerHTML = `<strong style="color:${msg.color}">${msg.name}</strong>:<br><img src="${msg.gif}" width="120">`;
      } else {
        div.innerHTML = `<strong style="color:${msg.color}">${msg.name}</strong>: ${msg.text}`;
      }
      chatMessages.appendChild(div);
    }

    if (msg.type === "system") {
      addSystemMessage(msg.text);
    }

    userCount.textContent = onlineUsers.size;
    chatMessages.scrollTop = chatMessages.scrollHeight;
  };

  function addSystemMessage(text) {
    const div = document.createElement("div");
    div.style.color = "gray";
    div.textContent = text;
    chatMessages.appendChild(div);
  }

  window.addEventListener("beforeunload", () => {
    if (hasJoined) {
      socket.send(JSON.stringify({ type: "leave", nickname }));
    }
  });
});