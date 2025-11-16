// Dashboard Script

// Check authentication and redirect if not logged in
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return null;
    }
    
    // Check if profile is completed for students and mentors
    if (currentUser.role !== 'admin' && !currentUser.profileCompleted) {
        window.location.href = 'onboarding.html';
        return null;
    }
    
    return currentUser;
}

// Initialize dashboard
function initDashboard() {
    const currentUser = checkAuth();
    if (!currentUser) return;
    
    // Update user information (only for student and mentor dashboards)
    if (currentUser.role !== 'admin') {
        const userNameElements = document.querySelectorAll('#userName, #welcomeName');
        userNameElements.forEach(element => {
            element.textContent = currentUser.fullName;
        });
        
        // Display profile information
        displayProfileInfo(currentUser);
    }
    
    // Add role-specific styling
    document.body.classList.add(`role-${currentUser.role}`);
    
    // Initialize role-specific features
    switch (currentUser.role) {
        case 'student':
            initStudentDashboard();
            break;
        case 'mentor':
            initMentorDashboard();
            break;
        case 'admin':
            initAdminDashboard();
            break;
    }
}

// Display profile information
function displayProfileInfo(user) {
    // Education Level
    const educationElement = document.getElementById('educationLevel');
    if (educationElement) {
        educationElement.textContent = user.educationLevel || 'Not specified';
    }
    
    // Skills
    const skillsElement = document.getElementById('skillsList');
    if (skillsElement) {
        if (user.skills) {
            const skillsList = user.skills.split(',').map(skill => skill.trim());
            skillsElement.innerHTML = skillsList.map(skill => 
                `<span class="skill-tag">${skill}</span>`
            ).join('');
        } else {
            skillsElement.textContent = 'No skills specified';
        }
    }
    
    // Career Goal
    const careerGoalElement = document.getElementById('careerGoal');
    if (careerGoalElement) {
        careerGoalElement.textContent = user.careerGoal || 'No career goal specified';
    }
}

// Edit Profile function
function editProfile() {
    window.location.href = 'onboarding.html';
}

// Student Dashboard Features
function initStudentDashboard() {
    // Add student-specific functionality
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.querySelector('span').textContent;
            handleStudentAction(action);
        });
    });
}

function handleStudentAction(action) {
    switch (action) {
        case 'Start Learning':
            showNotification('Opening course catalog...', 'info');
            break;
        case 'Find Mentor':
            showNotification('Searching for available mentors...', 'info');
            break;
        case 'Update Resume':
            showNotification('Opening resume builder...', 'info');
            break;
        case 'AI Chat':
            showNotification('Connecting to AI assistant...', 'info');
            break;
    }
}

// Mentor Dashboard Features
function initMentorDashboard() {
    // Add mentor-specific functionality
    const sessionButtons = document.querySelectorAll('.btn-small');
    sessionButtons.forEach(button => {
        button.addEventListener('click', function() {
            showNotification('Joining session...', 'info');
        });
    });
    
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.querySelector('span').textContent;
            handleMentorAction(action);
        });
    });
}

function handleMentorAction(action) {
    switch (action) {
        case 'Schedule Session':
            showNotification('Opening calendar...', 'info');
            break;
        case 'Message Students':
            showNotification('Opening messaging...', 'info');
            break;
        case 'View Analytics':
            showNotification('Loading analytics...', 'info');
            break;
        case 'Settings':
            showNotification('Opening settings...', 'info');
            break;
    }
}

// Admin Dashboard Features
function initAdminDashboard() {
    // Add admin-specific functionality
    const userButtons = document.querySelectorAll('.btn-small');
    userButtons.forEach(button => {
        button.addEventListener('click', function() {
            showNotification('Loading user details...', 'info');
        });
    });
    
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.querySelector('span').textContent;
            handleAdminAction(action);
        });
    });
}

function handleAdminAction(action) {
    switch (action) {
        case 'Add User':
            showNotification('Opening user management...', 'info');
            break;
        case 'Backup Data':
            showNotification('Starting backup process...', 'info');
            break;
        case 'View Reports':
            showNotification('Loading reports...', 'info');
            break;
        case 'System Settings':
            showNotification('Opening system settings...', 'info');
            break;
    }
}

// Logout function
function logout() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        if (currentUser.role === 'admin') {
            showNotification('Goodbye, Admin!', 'success');
        } else {
            showNotification(`Goodbye, ${currentUser.fullName}!`, 'success');
        }
    }
    
    // Clear session
    localStorage.removeItem('currentUser');
    
    // Redirect to login
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1500);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `dashboard-notification dashboard-notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // If this is Home, allow normal navigation
            if (!this.classList.contains('home-link')) {
                e.preventDefault(); // only block dashboard section links

                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));

                // Add active class to clicked link
                this.classList.add('active');

                // Handle navigation for sections
                const section = this.getAttribute('href').substring(1);
                showNotification(`Loading ${section}...`, 'info');
            }
        });
    });
}


// Progress bar animations
function animateProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill, .metric-fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0%';
        
        setTimeout(() => {
            bar.style.width = width;
        }, 500);
    });
}

// Stats counter animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-content h4');
    counters.forEach(counter => {
        const target = parseInt(counter.textContent.replace(/[^\d]/g, ''));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            // Preserve non-numeric characters
            const originalText = counter.textContent;
            const numericPart = originalText.match(/\d+/);
            if (numericPart) {
                counter.textContent = originalText.replace(/\d+/, Math.floor(current));
            }
        }, 16);
    });
}

// Interactive card hover effects
function initCardInteractions() {
    const cards = document.querySelectorAll('.dashboard-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

// Real-time updates simulation
function initRealTimeUpdates() {
    // Simulate real-time data updates
    setInterval(() => {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        if (!currentUser) return;
        
        // Update random stats
        const statItems = document.querySelectorAll('.stat-content h4');
        if (statItems.length > 0) {
            const randomStat = statItems[Math.floor(Math.random() * statItems.length)];
            const currentValue = parseInt(randomStat.textContent.replace(/[^\d]/g, ''));
            const newValue = currentValue + Math.floor(Math.random() * 3);
            randomStat.textContent = randomStat.textContent.replace(/\d+/, newValue);
        }
    }, 10000); // Update every 10 seconds
}

// Add CSS for dashboard notifications
const dashboardStyles = `
    .dashboard-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.9);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        padding: 1rem;
        z-index: 10001;
        min-width: 300px;
        backdrop-filter: blur(10px);
        animation: slideInRight 0.3s ease-out;
    }
    
    .dashboard-notification-success {
        border-left: 4px solid #00FF00;
    }
    
    .dashboard-notification-error {
        border-left: 4px solid #FF4444;
    }
    
    .dashboard-notification-info {
        border-left: 4px solid #00FFFF;
    }
    
    .notification-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .notification-message {
        color: #FFFFFF;
        font-size: 0.9rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: #FFFFFF;
        cursor: pointer;
        font-size: 1.2rem;
        margin-left: 1rem;
    }
    
    .role-student .dashboard-card {
        border-left: 3px solid #00FFFF;
    }
    
    .role-mentor .dashboard-card {
        border-left: 3px solid #FF00FF;
    }
    
    .role-admin .dashboard-card {
        border-left: 3px solid #FFA500;
    }
    
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(50px);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    .dashboard-card {
        transition: all 0.3s ease;
    }
    
    .progress-fill, .metric-fill {
        transition: width 1s ease-out;
    }
`;

// Inject dashboard styles
const styleSheet = document.createElement('style');
styleSheet.textContent = dashboardStyles;
document.head.appendChild(styleSheet);

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    initNavigation();
    
    // Animate elements after a short delay
    setTimeout(() => {
        animateProgressBars();
        animateCounters();
    }, 500);
    
    initCardInteractions();
    initRealTimeUpdates();
    
    // Make functions globally available
    window.logout = logout;
    window.editProfile = editProfile;
});

// Handle page visibility changes
document.addEventListener('visibilitychange', function() {
    if (document.visibilityState === 'visible') {
        // Refresh data when page becomes visible
        const currentUser = checkAuth();
        if (currentUser) {
            showNotification('Welcome back!', 'info');
        }
    }
});

// Handle beforeunload event
window.addEventListener('beforeunload', function() {
    // Optionally save any unsaved data
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser) {
        // Save session data if needed
        localStorage.setItem('lastActivity', new Date().toISOString());
    }
});
