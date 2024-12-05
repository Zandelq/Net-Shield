// File path: /script.js

let isMouseTrailActive = JSON.parse(localStorage.getItem('mouseTrailActive')) ?? true;
let trailElements = []; // Reusable elements for the trail
const MAX_TRAIL_COUNT = 20; // Limit number of trail elements
const AUDIO_URL = 'https://freesound.org/data/previews/523/523012_8385276-lq.mp3'; // Sound effect URL

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

    // Change button color based on the state of the trail
    if (isMouseTrailActive) {
        button.classList.add('active'); // Add active class for green color
    } else {
        button.classList.remove('active');
    }

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
    
    // Position the trail just below the cursor
    trail.style.left = `${event.pageX - trail.offsetWidth / 2}px`; // Center the trail under the mouse
    trail.style.top = `${event.pageY + 10}px`; // Position it below the mouse cursor by 10px (adjust as needed)

    trail.style.opacity = '1'; // Keep the trail visible

    // Move to the next trail element
    trailIndex = (trailIndex + 1) % MAX_TRAIL_COUNT;
});

// Initialize the button and trail on page load
window.onload = function () {
    initializeTrailElements();
    const button = document.getElementById('trail-toggle');
    button.innerText = isMouseTrailActive ? 'Disable Mouse Trail' : 'Enable Mouse Trail';
    
    // Change the trail color to green when enabled
    if (isMouseTrailActive) {
        trailElements.forEach(trail => {
            trail.style.backgroundColor = 'green'; // Set the trail to green when active
        });
    }
};
