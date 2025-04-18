fetch("https://raw.githubusercontent.com/Zandelq/Working-Links/main/updates.json")
    .then(response => response.json())
    .then(data => {
        const latest = data[0];
        const updatesList = document.getElementById("updates-list");
        updatesList.innerHTML = `
            <li><strong>${latest.date}</strong>: <u>${latest.title}</u> — ${latest.description}</li>
        `;
    });
