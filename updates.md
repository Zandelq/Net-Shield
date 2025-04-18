fetch("https://raw.githubusercontent.com/Zandelq/Working-Links/main/updates.md")
    .then(response => response.text())
    .then(markdown => {
        document.getElementById("updates-list").innerHTML = markdown
            .replace(/\n/g, "<br>");
    });
