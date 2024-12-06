let isMouseTrailActive = JSON.parse(localStorage.getItem('mouseTrailActive')) ?? true;
let trailElements = [];
const MAX_TRAIL_COUNT = 20;
const rainbowColors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet'];
let currentColorIndex = 0;
let trailIndex = 0;

function initializeTrailElements() {
    for (let i = 0; i < MAX_TRAIL_COUNT; i++) {
        const trail = document.createElement('div');
        trail.className = 'mouse-trail';
        document.body.appendChild(trail);
        trailElements.push(trail);
    }
}

function changeTrailColor() {
    currentColorIndex = (currentColorIndex + 1) % rainbowColors.length;
    const color = rainbowColors[currentColorIndex];
    trailElements.forEach(trail => {
        trail.style.backgroundColor = color;
    });
}

function toggleMouseTrail() {
    isMouseTrailActive = !isMouseTrailActive;
    localStorage.setItem('mouseTrailActive', JSON.stringify(isMouseTrailActive));
    const button = document.getElementById('trail-toggle');
    button.innerText = isMouseTrailActive ? 'Disable Mouse Trail' : 'Enable Mouse Trail';
}

document.addEventListener('mousemove', (event) => {
    if (!isMouseTrailActive) return;

    const trail = trailElements[trailIndex];
    trail.style.left = `${event.pageX}px`;
    trail.style.top = `${event.pageY}px`;
    trail.style.opacity = '1';

    setTimeout(() => {
        trail.style.opacity = '0';
    }, 1000);

    trailIndex = (trailIndex + 1) % MAX_TRAIL_COUNT;
});

window.onload = function () {
    initializeTrailElements();
    const button = document.getElementById('trail-toggle');
    button.innerText = isMouseTrailActive ? 'Disable Mouse Trail' : 'Enable Mouse Trail';
    setInterval(changeTrailColor, 1000);
};