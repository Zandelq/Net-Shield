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
        width: 16px; /* Approximate size of mouse pointer */
        height: 16px;
        border-radius: 50%;
        pointer-events: none;
        animation: fade-out 2s forwards, color-change 1s infinite;
        will-change: transform, opacity;
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
    @keyframes color-change {
        0% {
            background-color: red;
        }
        25% {
            background-color: blue;
        }
        50% {
            background-color: green;
        }
        75% {
            background-color: yellow;
        }
        100% {
            background-color: red;
        }
    }
`;
document.head.appendChild(style);

// Mouse move event to create the trail
document.addEventListener("mousemove", (event) => {
    if (!isMouseTrailEnabled) return;

    // Create a trail element
    const trail = document.createElement("div");
    trail.className = "mouse-trail";
    trail.style.left = `${event.pageX}px`;
    trail.style.top = `${event.pageY}px`;

    // Append the trail to the container
    trailContainer.appendChild(trail);

    // Remove the trail after the animation ends
    setTimeout(() => {
        trail.remove();
    }, 2000); // Matches the fade-out duration
});
