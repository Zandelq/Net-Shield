// File path: /script.js

let isMouseTrailActive = JSON.parse(localStorage.getItem('mouseTrailActive')) ?? true;
let trailElements = []; // Reusable elements for the trail
const MAX_TRAIL_COUNT = 20; // Limit number of trail elements
const AUDIO_URL_TOGGLE = 'https://freesound.org/data/previews/523/523012_8385276-lq.mp3'; // Toggle sound effect URL
const AUDIO_URL_SCROLL = 'https://freesound.org/data/previews/133/133768_2383585-lq.mp3'; // Scroll sound effect URL

// Initialize reusable trail elements
function initializeTrailElements() {
    for (let i = 0; i < MAX_TRAIL_COUNT; i++) {
        const trail = document.createElement('div');
        trail.className = 'mouse-trail';
        document.body.appendChild(trail);
        trailElements.push(trail);
    }
}

// Play a sound effect
function playSoundEffect(url) {
    const audio = new Audio(url);
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
    playSoundEffect(AUDIO_URL_TOGGLE);
}

// Handle mouse movement for the trail effect
let trailIndex = 0; // Track the current trail element to reuse
let currentColor = getRandomColor(); // Initial random color for the trail

document.addEventListener('mousemove', (event) => {
    if (!isMouseTrailActive) return;

    const trail = trailElements[trailIndex];
    trail.style.left = `${event.pageX}px`;
    trail.style.top = `${event.pageY}px`;
    trail.style.opacity = '0.8';
    trail.style.transform = 'scale(1)';
    trail.style.backgroundColor = currentColor; // Apply the dynamic color

    // Trigger fade-out animation
    setTimeout(() => {
        trail.style.opacity = '0';
        trail.style.transform = 'scale(0.5)';
    }, 0);

    // Move to the next trail element
    trailIndex = (trailIndex + 1) % MAX_TRAIL_COUNT;
});

// Generate a random color
function getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Handle scroll event for sound effect
document.addEventListener('wheel', () => {
    playSoundEffect(AUDIO_URL_SCROLL); // Play scroll sound
});

// Initialize the button and trail on page load
window.onload = function () {
    initializeTrailElements();
    const button = document.getElementById('trail-toggle');
    button.innerText = isMouseTrailActive ? 'Disable Mouse Trail' : 'Enable Mouse Trail';
};
