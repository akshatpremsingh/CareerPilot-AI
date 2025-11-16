// Global Chatbot Navigation and Functionality
// This file provides consistent chatbot access across all pages

// Global chatbot navigation function
function openChatbot() {
    // Check if user is logged in
    const currentUser = getCurrentUser();
    
    if (currentUser) {
        // User is logged in, go directly to chatbot
        window.location.href = 'chatbot.html';
    } else {
        // User is not logged in, show a prompt or redirect to login
        const shouldLogin = confirm('To access the AI Career Counselor, you need to be logged in. Would you like to go to the login page?');
        if (shouldLogin) {
            window.location.href = 'login.html';
        }
    }
}

// Get current user from localStorage
function getCurrentUser() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
}

// Initialize chatbot buttons on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeChatbotButtons();
});

// Initialize all chatbot buttons with proper event listeners
function initializeChatbotButtons() {
    // Add click event listeners to all chatbot buttons
    const chatbotButtons = document.querySelectorAll('.chatbot-btn, .nav-chatbot-btn, .footer-chatbot-btn, .chatbot-fab');
    
    chatbotButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            openChatbot();
        });
    });
    
    // Add keyboard shortcut (Ctrl/Cmd + K) to open chatbot
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            openChatbot();
        }
    });
}

// Show chatbot notification (optional)
function showChatbotNotification() {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'chatbot-notification';
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-robot"></i>
            <span>Need career advice? Chat with our AI Counselor!</span>
            <button onclick="openChatbot()" class="notification-btn">Chat Now</button>
            <button onclick="dismissNotification()" class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Dismiss notification
function dismissNotification() {
    const notification = document.querySelector('.chatbot-notification');
    if (notification) {
        notification.remove();
    }
}

// Check if user should see chatbot notification
function checkChatbotNotification() {
    const currentUser = getCurrentUser();
    const lastNotification = localStorage.getItem('lastChatbotNotification');
    const now = Date.now();
    
    // Show notification if:
    // 1. User is logged in
    // 2. Haven't shown notification in last 24 hours
    // 3. Random chance (20%)
    if (currentUser && 
        (!lastNotification || (now - parseInt(lastNotification)) > 24 * 60 * 60 * 1000) &&
        Math.random() < 0.2) {
        
        setTimeout(() => {
            showChatbotNotification();
            localStorage.setItem('lastChatbotNotification', now.toString());
        }, 3000);
    }
}

// Initialize notification check on page load
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(checkChatbotNotification, 2000);
});

// Export functions for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        openChatbot,
        getCurrentUser,
        initializeChatbotButtons,
        showChatbotNotification
    };
}
