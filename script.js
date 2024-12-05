// File path: /script.js

let isMouseTrailActive = JSON.parse(localStorage.getItem('mouseTrailActive')) ?? true;
let trailElements = []; // Reusable elements for the trail
const MAX_TRAIL_COUNT = 20; // Limit number of trail elements
const AUDIO_URL = 'https://freesound.org/data/previews/523/523012_8385276-lq.mp3'; // Sound effect URL

// Array of rainbow colors for the trail
const rainbowColors = [
    'red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'
];

let currentColorIndex = 0; // Index to track the current color

// Initialize reusable trail elements
function initializeTrailElements() {
    for (let i = 0; i < MAX_TRAIL_COUNT; i++) {
        const trail = document.createElement('div');
        trail.className = 'mouse-trail';
        document.body.appendChild(trail);
        trailElements.push(trail);
    }
}

// Change color every 1 second
function changeTrailColor() {
    currentColorIndex = (currentColorIndex + 1) % rainbowColors.length;
    const color = rainbowColors[currentColorIndex];
    trailElements.forEach(trail => {
        trail.style.backgroundColor = color;
    });
}

// Play a sound effect
function playSoundEffect() {
    const audio = new Audio(AUDIO_URL);
    audio.volume = 0.5; // Adjust volume as needed
    audio.play();
}

// Toggle mouse trail functionality
function toggleMouseTrail() {
    isMouseTrailActive = !isMouseTrailActive;
    localStorage.setItem('mouseTrailActive', JSON.stringify(isMouseTrailActive)); // Save state
    const button = document.getElementById('trail-toggle');
    button.innerText = isMouseTrailActive ? 'Disable Mouse Trail' : 'Enable Mouse Trail';

    // Add a click animation class
    button.classList.add('clicked');
    setTimeout(() => button.classList.remove('clicked'), 150);

    // Play toggle sound
    playSoundEffect();
}

// Handle mouse movement for the trail effect
let trailIndex = 0; // Track the current trail element to reuse
document.addEventListener('mousemove', (event) => {
    if (!isMouseTrailActive) return;

    const trail = trailElements[trailIndex];
    trail.style.left = `${event.pageX - trail.offsetWidth / 2}px`; // Center the trail under the mouse
    trail.style.top = `${event.pageY - trail.offsetHeight - 10}px`; // Position it slightly above the mouse cursor (adjusted to be higher)
    trail.style.opacity = '1'; // Fade in the trail segment
    trail.style.transform = 'scale(1)';

    // Trigger fade-out animation
    setTimeout(() => {
        trail.style.opacity = '0'; // Fade out after a short delay
        trail.style.transform = 'scale(0.5)'; // Shrink the trail segment
    }, 1000);

    // Move to the next trail element
    trailIndex = (trailIndex + 1) % MAX_TRAIL_COUNT;
});

// Initialize the button and trail on page load
window.onload = function () {
    initializeTrailElements();
    const button = document.getElementById('trail-toggle');
    button.innerText = isMouseTrailActive ? 'Disable Mouse Trail' : 'Enable Mouse Trail';
    
    // Change the trail color every 1 second
    setInterval(changeTrailColor, 1000);
};
