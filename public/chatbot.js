// ======================
// Chatbot Script
// ======================

class Chatbot {

    constructor() {

        this.chatContainer = document.querySelector("#chatMessages");
        this.inputField = document.querySelector("#chatInput");
        this.sendBtn = document.querySelector("#sendButton");

        this.bindEvents();

    }

    // ======================
    // Event Binding
    // ======================

    bindEvents() {

        if (this.sendBtn) {

            this.sendBtn.addEventListener("click", () => {
                this.handleSendMessage();
            });

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

    // ======================
    // Auth Helpers
    // ======================

    getAuthToken() {

        return localStorage.getItem("authToken");

    }

    getCurrentUser() {

        return JSON.parse(localStorage.getItem("currentUser"));

    }

    // ======================
    // Append Message
    // ======================

    appendMessage(sender, text) {

        const msgEl = document.createElement("div");

        msgEl.className =
            sender === "user"
                ? "message user-message"
                : "message ai-message";

        // Fix line breaks
        const messageContent = text.replace(/\n/g, "<br>");

        msgEl.innerHTML = `

            <div class="message-avatar">

                <i class="fas ${
                    sender === "user"
                        ? "fa-user"
                        : "fa-robot"
                }"></i>

            </div>

            <div class="message-content">

                <div class="message-text">
                    ${messageContent}
                </div>

                <div class="message-time">
                    Just now
                </div>

            </div>

        `;

        this.chatContainer.appendChild(msgEl);

        // Auto scroll
        this.chatContainer.scrollTop =
            this.chatContainer.scrollHeight;

    }

    // ======================
    // Send Message
    // ======================

    async handleSendMessage() {

        const message =
            this.inputField.value.trim();

        if (!message) return;

        // Add user message
        this.appendMessage("user", message);

        // Clear input
        this.inputField.value = "";

        // Typing indicator
        const typingEl = document.createElement("div");

        typingEl.className =
            "message ai-message typing-message";

        typingEl.innerHTML = `

            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>

            <div class="message-content">

                <div class="message-text typing-bubble">
                    AI is typing...
                </div>

            </div>

        `;

        this.chatContainer.appendChild(typingEl);

        this.chatContainer.scrollTop =
            this.chatContainer.scrollHeight;

        try {

            const aiResponse =
                await this.sendMessageToBackend(message);

            // Remove typing indicator
            typingEl.remove();

            // Add AI response
            this.appendMessage("ai", aiResponse);

        } catch (err) {

            console.error(err);

            typingEl.remove();

            this.appendMessage(
                "ai",
                "⚠️ Server error. Please try again."
            );

        }

    }

    // ======================
    // Backend API Call
    // ======================

    async sendMessageToBackend(message) {

        const token = this.getAuthToken();

        if (!token) {

            throw new Error(
                "No auth token. Please login first."
            );

        }

        const res = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },

            body: JSON.stringify({
                message: message
            }),

        });

        const data = await res.json();

        if (!res.ok) {

            throw new Error(
                data.msg || "Failed to get response"
            );

        }

        return data.reply || "No reply from server.";

    }

}

// ======================
// Clear Chat
// ======================

function clearConversation() {

    const chatMessages =
        document.getElementById("chatMessages");

    chatMessages.innerHTML = `

        <div class="message ai-message">

            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>

            <div class="message-content">

                <div class="message-text">
                    Conversation cleared.
                </div>

                <div class="message-time">
                    Just now
                </div>

            </div>

        </div>

    `;

}

// ======================
// New Chat
// ======================

function startNewChat() {

    const chatMessages =
        document.getElementById("chatMessages");

    chatMessages.innerHTML = `

        <div class="message ai-message">

            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>

            <div class="message-content">

                <div class="message-text">

                    Hello! I'm your AI Career Counselor.<br><br>
                    What would you like help with today?

                </div>

                <div class="message-time">
                    Just now
                </div>

            </div>

        </div>

    `;

}

// ======================
// Chat History
// ======================

function loadChat(chatId) {

    console.log("Loading chat:", chatId);

}

// ======================
// Initialize
// ======================

document.addEventListener("DOMContentLoaded", () => {

    // Set username
    const currentUser =
        JSON.parse(localStorage.getItem("currentUser"));

    const userNameEl =
        document.getElementById("userName");

    if (userNameEl && currentUser) {

        userNameEl.textContent =
            currentUser.fullName ||
            currentUser.name ||
            "User";

    }

    // Start chatbot
    if (document.querySelector("#chatMessages")) {

        new Chatbot();

    }

});