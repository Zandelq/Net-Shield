.particlesJS('particles-js',
  
  {
    "particles": {
      "number": {
        "value": 100,
        "density": {
          "enable": true,
          "value_area": 700
        }
      },
      "color": {
        "value": "#ffffff"
      },
      "shape": {
        "type": "circle",
        "stroke": {
          "width": 0,
          "color": "#000000"
        },
        "polygon": {
          "nb_sides": 5
        },
        "image": {
          "src": "img/github.svg",
          "width": 100,
          "height": 100
        }
      },
      "opacity": {
        "value": 0.5,
        "random": false,
        "anim": {
          "enable": false,
          "speed": 1,
          "opacity_min": 0.1,
          "sync": false
        }
      },
      "size": {
        "value": 5,
        "random": true,
        "anim": {
          "enable": false,
          "speed": 40,
          "size_min": 0.1,
          "sync": false
        }
      },
      "line_linked": {
        "enable": true,
        "distance": 150,
        "color": "#ffffff",
        "opacity": 0.4,
        "width": 1
      },
      "move": {
        "enable": true,
        "speed": 6,
        "direction": "none",
        "random": false,
        "straight": false,
        "out_mode": "out",
        "attract": {
          "enable": false,
          "rotateX": 600,
          "rotateY": 1200
        }
      }
    },
    "interactivity": {
      "detect_on": "canvas",
      "events": {
        "onhover": {
          "enable": true,
          "mode": "repulse"
        },
        "onclick": {
          "enable": true,
          "mode": "push"
        },
        "resize": true
      },
      "modes": {
        "grab": {
          "distance": 400,
          "line_linked": {
            "opacity": 1
          }
        },
        "bubble": {
          "distance": 400,
          "size": 40,
          "duration": 2,
          "opacity": 8,
          "speed": 3
        },
        "repulse": {
          "distance": 200
        },
        "push": {
          "particles_nb": 4
        },
        "remove": {
          "particles_nb": 2
        }
      }
    },
    "retina_detect": true,
    "config_demo": {
      "hide_card": false,
      "background_color": "#000000",
      "background_image": "",
      "background_position": "50% 50%",
      "background_repeat": "no-repeat",
      "background_size": "cover"
    }
  }

);


let isMouseTrailActive = JSON.parse(localStorage.getItem('mouseTrailActive')) ?? true;
let trailElements = [];
const MAX_TRAIL_COUNT = 20;
const FADE_DURATION = 2000;
const rainbowColors = ['red', 'yellow', 'blue', 'green', 'purple', 'orange', 'cyan', 'pink', 'teal'];
let currentColorIndex = 0;
let trailIndex = 0;
const CURSOR_SIZE = 24;
const OFFSET_X = 10; // Horizontal offset
const OFFSET_Y = 20; // Vertical offset for positioning trail below the cursor

// Initialize reusable trail elements
function initializeTrailElements() {
    for (let i = 0; i < MAX_TRAIL_COUNT; i++) {
        const trail = document.createElement('div');
        trail.className = 'mouse-trail';
        document.body.appendChild(trail);

        trail.style.position = 'absolute';
        trail.style.width = `${CURSOR_SIZE}px`;
        trail.style.height = `${CURSOR_SIZE}px`;
        trail.style.borderRadius = '50%';
        trail.style.opacity = '0';
        trail.style.pointerEvents = 'none';
        trail.style.transition = `opacity ${FADE_DURATION}ms, background-color 1s`;
        trailElements.push(trail);
    }
}

// Change trail color every second
function changeTrailColor() {
    currentColorIndex = (currentColorIndex + 1) % rainbowColors.length;
    const newColor = rainbowColors[currentColorIndex];

    trailElements.forEach((trail) => {
        trail.style.backgroundColor = newColor;
    });
}

// Toggle mouse trail
function toggleMouseTrail() {
    isMouseTrailActive = !isMouseTrailActive;
    localStorage.setItem('mouseTrailActive', JSON.stringify(isMouseTrailActive));
    const button = document.getElementById('trail-toggle');
    button.innerText = isMouseTrailActive ? 'Disable Mouse Trail' : 'Enable Mouse Trail';

    // Change button state for styling
    button.classList.toggle('inactive', !isMouseTrailActive);

    // Play toggle sound
    playSoundEffect();
}

// Handle mouse movement for the trail effect
document.addEventListener('mousemove', (event) => {
    if (!isMouseTrailActive) return;

    const trail = trailElements[trailIndex];

    // Adjust trail position (with vertical offset)
    trail.style.left = `${event.pageX + OFFSET_X - CURSOR_SIZE / 2}px`;
    trail.style.top = `${event.pageY + OFFSET_Y - CURSOR_SIZE / 2}px`;

    trail.style.opacity = '1'; // Fade in

    // Fade out after a delay
    setTimeout(() => {
        trail.style.opacity = '0'; // Fade out
    }, FADE_DURATION);

    trailIndex = (trailIndex + 1) % MAX_TRAIL_COUNT; // Cycle through elements
});

// Play a sound effect
function playSoundEffect() {
    const AUDIO_URL = 'https://freesound.org/data/previews/523/523012_8385276-lq.mp3'; // Example sound URL
    const audio = new Audio(AUDIO_URL);
    audio.volume = 0.5;
    audio.play();
}

// Initialize the button and trail on page load
window.onload = function () {
    initializeTrailElements();
    const button = document.getElementById('trail-toggle');
    button.innerText = isMouseTrailActive ? 'Disable Mouse Trail' : 'Enable Mouse Trail';

    // Add active class for the button
    if (isMouseTrailActive) {
        button.classList.remove('inactive');
    } else {
        button.classList.add('inactive');
    }

    // Change trail color every second
    setInterval(changeTrailColor, 1000);
    
    // Initialize the modal functions
    const secretIcon = document.getElementById('secret-icon');
    secretIcon.addEventListener('click', openModal);

    const closeBtn = document.querySelector('.close-btn');
    closeBtn.addEventListener('click', closeModal);
};

// Open the modal
function openModal() {
    document.getElementById("modal").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

// Close the modal
function closeModal() {
    document.getElementById("modal").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}








                                      //My Code After this












let lastScrollY = window.scrollY;
const tabBar = document.getElementById("tab-bar");

window.addEventListener("scroll", () => {
    if (window.scrollY > lastScrollY) {
        tabBar.style.top = "-100px"; // Hide when scrolling down
    } else {
        tabBar.style.top = "120px"; // Show when scrolling up
    }
    lastScrollY = window.scrollY;
});
<script>
const ws = new WebSocket("wss://s14579.nyc1.piesocket.com/v3/1?api_key=LWRrgWpIRs39rZWrJKC2qCj74ZYCcGdFgGQQhtJR&notify_self=1");

const chatPopup = document.getElementById("chat-popup");
const openBtn = document.getElementById("open-chat-btn");
const chatInput = document.getElementById("chat-input");
const sendBtn = document.getElementById("send-chat-btn");
const chatMessages = document.getElementById("chat-messages");

openBtn.addEventListener("click", () => {
  chatPopup.style.display = chatPopup.style.display === "flex" ? "none" : "flex";
});

sendBtn.addEventListener("click", () => {
  const message = chatInput.value;
  if (message.trim() !== "") {
    ws.send(message);
    chatInput.value = "";
  }
});

ws.onmessage = (event) => {
  const msg = document.createElement("div");
  msg.textContent = event.data;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
};

ws.onopen = () => console.log("Connected to chat server");
ws.onerror = (e) => console.error("WebSocket error:", e);
</script>