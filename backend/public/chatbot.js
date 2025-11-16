// ====================== 
// Chatbot Script (Backend Integrated & Formatted Responses)
// ======================

class Chatbot {
    constructor() {
        this.chatContainer = document.querySelector("#chatMessages");
        this.inputField = document.querySelector("#chatInput");
        this.sendBtn = document.querySelector("#sendButton");
        this.bindEvents();
    }

    bindEvents() {
        if (this.sendBtn) {
            this.sendBtn.addEventListener("click", () => this.handleSendMessage());
        }
        if (this.inputField) {
            this.inputField.addEventListener("keypress", (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    this.handleSendMessage();
                }
            });
        }
    }

    getAuthToken() {
        return localStorage.getItem("authToken");
    }

    getCurrentUser() {
        return JSON.parse(localStorage.getItem("currentUser"));
    }

    formatAIResponse(text) {
        // Convert newlines to <br>
        let formatted = text.replace(/\n/g, "<br>");

        // Convert lines starting with * into <li> items
        const lines = formatted.split("<br>");
        const listItems = lines
            .filter(line => line.trim().startsWith("*"))
            .map(line => "<li>" + line.replace(/^\*\s*/, "") + "</li>");

        if (listItems.length > 0) {
            formatted = "<ul>" + listItems.join("") + "</ul>";
        }

        return formatted;
    }

    appendMessage(sender, text) {
        const msgEl = document.createElement("div");
        msgEl.className = sender === "user" ? "message user-message" : "message ai-message";

        const messageContent = sender === "ai" ? this.formatAIResponse(text) : text;

        msgEl.innerHTML = `
            <div class="message-avatar"><i class="fas ${sender === "user" ? "fa-user" : "fa-robot"}"></i></div>
            <div class="message-content">
                <div class="message-text">${messageContent}</div>
                <div class="message-time">Just now</div>
            </div>
        `;
        this.chatContainer.appendChild(msgEl);
        this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }

    async handleSendMessage() {
        const message = this.inputField.value.trim();
        if (!message) return;

        this.appendMessage("user", message);
        this.inputField.value = "";

        try {
            // Show loading if desired (optional)
            const aiResponse = await this.sendMessageToBackend(message);
            this.appendMessage("ai", aiResponse);
        } catch (err) {
            console.error(err);
            this.appendMessage("ai", "⚠️ Server error. Please try again.");
        }
    }

    async sendMessageToBackend(message) {
        const token = this.getAuthToken();
        if (!token) {
            throw new Error("No auth token. Please login first.");
        }

        const res = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify({ message }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || "Failed to get response");

        return data.reply || "No reply from server.";
    }
}

// Initialize chatbot
document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("#chatMessages")) {
        new Chatbot();
    }
});
