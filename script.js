let isMouseTrailEnabled = true; // Default state for the mouse trail

// Function to toggle the mouse trail
function toggleMouseTrail() {
    isMouseTrailEnabled = !isMouseTrailEnabled;
    document.getElementById("trail-toggle").innerText = isMouseTrailEnabled
        ? "Disable Mouse Trail"
        : "Enable Mouse Trail";
}

// Create the trail container
const trailContainer = document.createElement("div");
trailContainer.id = "mouse-trail-container";
document.body.appendChild(trailContainer);

// CSS for the trail (append dynamically)
const style = document.createElement("style");
style.innerHTML = `
    #mouse-trail-container {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: none;
        overflow: visible;
        z-index: 9999;
    }
    .mouse-trail {
        position: absolute;
        width: 16px; /* Approximate width of mouse pointer */
        height: 24px; /* Approximate height of mouse pointer */
        border-radius: 0; /* No rounding, keep it rectangle */
        pointer-events: none;
        animation: fade-out 2s forwards, color-fade 1s infinite;
        will-change: transform, opacity, background-color;
    }
    @keyframes fade-out {
        0% {
            opacity: 1;
            transform: scale(1);
        }
        100% {
            opacity: 0;
            transform: scale(0.5);
        }
    }
    @keyframes color-fade {
        from {
            background-color: currentColor;
        }
        to {
            background-color: transparent;
        }
    }
`;
document.head.appendChild(style);

// Helper function to generate random colors
function getRandomColor() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

// Mouse move event to create the trail
document.addEventListener("mousemove", (event) => {
    if (!isMouseTrailEnabled) return;

    // Create a trail element
    const trail = document.createElement("div");
    trail.className = "mouse-trail";
    trail.style.left = `${event.pageX}px`;
    trail.style.top = `${event.pageY}px`;
    trail.style.backgroundColor = getRandomColor(); // Assign a random color

    // Append the trail to the container
    trailContainer.appendChild(trail);

    // Remove the trail after the animation ends
    setTimeout(() => {
        trail.remove();
    }, 2000); // Matches the fade-out duration
});
