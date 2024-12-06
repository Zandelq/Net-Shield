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
        width: 10px;
        height: 10px;
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
        pointer-events: none;
        animation: fade-out 1s forwards;
    }
    @keyframes fade-out {
        from {
            opacity: 1;
            transform: scale(1);
        }
        to {
            opacity: 0;
            transform: scale(0.5);
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
    }, 1000); // Matches the animation duration
});
