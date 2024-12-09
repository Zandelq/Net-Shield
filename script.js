let isMouseTrailActive = JSON.parse(localStorage.getItem('mouseTrailActive')) ?? true;
let trailElements = [];
const MAX_TRAIL_COUNT = 20;
const FADE_DURATION = 2000;
const rainbowColors = ['red', 'yellow', 'blue', 'green', 'purple', 'orange'];
let currentColorIndex = 0;
let trailIndex = 0;
const CURSOR_SIZE = 24;
const OFFSET_X = 10;

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

    trail.style.left = `${event.pageX + OFFSET_X - CURSOR_SIZE / 2}px`; // Adjust position
    trail.style.top = `${event.pageY - CURSOR_SIZE / 2}px`;

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