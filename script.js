// File path: /script.js

window.addEventListener('scroll', function () {
    const linksContainer = document.getElementById('links-container');
    const scrollPosition = window.scrollY;

    // Only add links after scrolling down 500px
    if (scrollPosition > 500) {
        setTimeout(() => {
            // Check if links are already added
            if (!linksContainer.innerHTML.trim()) {
                for (let i = 1; i <= 10; i++) {
                    const link = document.createElement('a');
                    link.href = 'data:text/html,'; // Creates a blank page without visible URL
                    link.target = '_blank'; // Opens in a new tab
                    link.innerText = `Link ${i}`;
                    linksContainer.appendChild(link);
                }
                linksContainer.style.display = 'block'; // Show the links container
            }
        }, 2000); // 2 seconds delay
    }
});

// Mouse trail effect
document.addEventListener('mousemove', (event) => {
    const trail = document.createElement('div');
    trail.className = 'mouse-trail';
    trail.style.left = `${event.pageX}px`;
    trail.style.top = `${event.pageY}px`;

    document.body.appendChild(trail);

    // Remove the trail element after a short delay
    setTimeout(() => {
        trail.remove();
    }, 500); // Adjust lifespan of the trail here
});
