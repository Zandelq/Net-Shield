// Toggle mouse trail functionality
let isMouseTrailActive = true;

function toggleMouseTrail() {
    isMouseTrailActive = !isMouseTrailActive;
    const button = document.getElementById('trail-toggle');
    button.innerText = isMouseTrailActive ? 'Disable Mouse Trail' : 'Enable Mouse Trail';
}

// Handle mouse trail effect
document.addEventListener('mousemove', (event) => {
    if (!isMouseTrailActive) return;

    const trail = document.createElement('div');
    trail.className = 'mouse-trail';
    trail.style.left = `${event.pageX}px`;
    trail.style.top = `${event.pageY}px`;
    document.body.appendChild(trail);

    setTimeout(() => trail.remove(), 2000); // Remove trail after 2 seconds
});

// Mouse trail CSS (add to styles.css or dynamically set)
const style = document.createElement('style');
style.innerHTML = `
    .mouse-trail {
        position: absolute;
        width: 10px;
        height: 10px;
        background-color: red;
        border-radius: 50%;
        pointer-events: none;
        opacity: 0.8;
        transition: opacity 0.5s ease;
    }
`;
document.head.appendChild(style);