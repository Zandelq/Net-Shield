fetch("https://raw.githubusercontent.com/YOUR_USERNAME/YOUR_REPO/main/updates.md")
    .then(response => response.text())
    .then(markdown => {
        document.getElementById("updates-list").innerHTML = markdown
            .replace(/\n/g, "<br>");
    });
