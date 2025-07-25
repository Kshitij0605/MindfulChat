function sendMessage() {
    let userInputField = document.getElementById("userInput");
    let userInput = userInputField.value.trim();
    let chatbox = document.getElementById("chatbox");
    const sendButton = document.querySelector(".chat-footer button");

    if (userInput === "") return;

    chatbox.innerHTML += `<p class="user-text"><strong>You:</strong> ${escapeHtml(userInput)}</p>`;
    userInputField.value = "";

    sendButton.disabled = true;
    sendButton.textContent = "⏳";

    fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userInput })
    })
    .then(response => response.json())
    .then(data => {
        const rawMarkdown = data.response || "No response.";
        const htmlResponse = marked.parse(rawMarkdown);
        chatbox.innerHTML += `<div class="bot-text"><strong>Bot:</strong> ${htmlResponse}</div>`;
        chatbox.scrollTop = chatbox.scrollHeight;
    })
    .catch(error => {
        chatbox.innerHTML += `<p class="bot-text"><strong>Bot:</strong> Error occurred.</p>`;
        console.error("Error:", error);
    })
    .finally(() => {
        sendButton.disabled = false;
        sendButton.textContent = "➤";
        userInputField.focus();
    });
}

// Escape HTML
function escapeHtml(text) {
    return text.replace(/[&<>"']/g, match => ({
        '&': "&amp;", '<': "&lt;", '>': "&gt;", '"': "&quot;", "'": "&#039;"
    }[match]));
}

// Send message on Enter key
document.getElementById("userInput").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});

// File upload logic
document.getElementById("fileInput").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const chatbox = document.getElementById("chatbox");
    const fileInput = document.getElementById("fileInput");
    const sendButton = document.querySelector(".chat-footer button");

    fileInput.disabled = true;
    sendButton.disabled = true;
    sendButton.textContent = "⏳";

    fetch("/upload", {
        method: "POST",
        body: formData,
    })
    .then(res => res.json())
    .then(data => {
        chatbox.innerHTML += `<p class="user-text"><strong>You uploaded:</strong> ${escapeHtml(file.name)}</p>`;
        chatbox.innerHTML += `<p class="bot-text"><strong>Bot:</strong> ${escapeHtml(data.message)}</p>`;
        chatbox.scrollTop = chatbox.scrollHeight;
        fileInput.value = "";
    })
    .catch(err => {
        chatbox.innerHTML += `<p class="bot-text"><strong>Bot:</strong> File upload failed.</p>`;
        console.error("Upload failed:", err);
    })
    .finally(() => {
        fileInput.disabled = false;
        sendButton.disabled = false;
        sendButton.textContent = "➤";
        document.getElementById("userInput").focus();
    });
});
