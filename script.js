// File path: /scripts/delayedLinks.js

window.addEventListener('scroll', function () {
    const linksContainer = document.getElementById('links-container');
    const scrollPosition = window.scrollY;

    // Only show the links after 2 seconds of scrolling down (or 500px)
    if (scrollPosition > 500) {
        setTimeout(() => {
            if (!linksContainer.innerHTML) {
                // Create and show the links after the delay
                for (let i = 1; i <= 10; i++) {
                    const link = document.createElement('a');
                    link.href = 'data:text/html,'; // Loads an empty page without a visible URL
                    link.target = '_blank'; // Open link in a new tab
                    link.innerText = `Link ${i}`;
                    linksContainer.appendChild(link);
                }
                linksContainer.style.display = 'block'; // Show the links
            }
        }, 2000); // 2 seconds delay
    }
});
