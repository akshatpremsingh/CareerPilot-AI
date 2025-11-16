// User Onboarding System

// Check authentication and redirect if not logged in
function checkAuth() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return null;
    }
    return currentUser;
}

// Form Validation Functions
function validateFullName(name) {
    return name.trim().length >= 2;
}

function validateEducationLevel(level) {
    return ['High School', 'Undergraduate', 'Graduate', 'Other'].includes(level);
}

function validateSkills(skills) {
    return skills.trim().length >= 3;
}

function validateCareerGoal(goal) {
    return goal.trim().length >= 10;
}

// Clear Error Messages
function clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.textContent = '';
        element.style.display = 'none';
    });
}

// Show Error Message
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        errorElement.style.color = '#FF4444';
    }
}

// Show Success Message
function showSuccess(message) {
    const notification = document.createElement('div');
    notification.className = 'auth-notification auth-notification-success';
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// Loading State
function setLoadingState(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = `
            <i class="fas fa-spinner fa-spin"></i>
            <span>Saving Profile...</span>
        `;
    } else {
        button.disabled = false;
        button.innerHTML = `
            <span>Complete Profile</span>
            <i class="fas fa-arrow-right"></i>
        `;
    }
}

// Save onboarding data
function saveOnboardingData(onboardingData) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return false;
    
    // Update current user with onboarding data
    const updatedUser = {
        ...currentUser,
        ...onboardingData,
        profileCompleted: true,
        profileCompletedAt: new Date().toISOString()
    };
    
    // Update current user in localStorage
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Update user in users array
    let users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(user => user.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    return true;
}

// Get existing onboarding data
function getExistingOnboardingData() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) return null;
    
    return {
        fullName: currentUser.fullName || '',
        educationLevel: currentUser.educationLevel || '',
        skills: currentUser.skills || '',
        careerGoal: currentUser.careerGoal || ''
    };
}

// Pre-fill form with existing data
function prefillForm() {
    const existingData = getExistingOnboardingData();
    if (!existingData) return;
    
    document.getElementById('fullName').value = existingData.fullName;
    document.getElementById('educationLevel').value = existingData.educationLevel;
    document.getElementById('skills').value = existingData.skills;
    document.getElementById('careerGoal').value = existingData.careerGoal;
}

// Redirect to appropriate dashboard
function redirectToDashboard() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    switch (currentUser.role) {
        case 'student':
            window.location.href = 'student-dashboard.html';
            break;
        case 'mentor':
            window.location.href = 'mentor-dashboard.html';
            break;
        case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
        default:
            window.location.href = 'login.html';
    }
}

// Onboarding Form Handler
if (document.getElementById('onboardingForm')) {
    document.getElementById('onboardingForm').addEventListener('submit', function(e) {
        e.preventDefault();
        clearErrors();
        
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            educationLevel: document.getElementById('educationLevel').value,
            skills: document.getElementById('skills').value.trim(),
            careerGoal: document.getElementById('careerGoal').value.trim()
        };
        
        // Validation
        let isValid = true;
        
        if (!validateFullName(formData.fullName)) {
            showError('fullNameError', 'Full name must be at least 2 characters');
            isValid = false;
        }
        
        if (!validateEducationLevel(formData.educationLevel)) {
            showError('educationLevelError', 'Please select an education level');
            isValid = false;
        }
        
        if (!validateSkills(formData.skills)) {
            showError('skillsError', 'Please enter at least 3 characters for skills');
            isValid = false;
        }
        
        if (!validateCareerGoal(formData.careerGoal)) {
            showError('careerGoalError', 'Career goal must be at least 10 characters');
            isValid = false;
        }
        
        if (!isValid) {
            return;
        }
        
        const submitBtn = this.querySelector('.auth-btn');
        setLoadingState(submitBtn, true);
        
        // Simulate saving process
        setTimeout(() => {
            const success = saveOnboardingData(formData);
            
            if (success) {
                showSuccess('Profile completed successfully! Redirecting to dashboard...');
                setTimeout(() => {
                    redirectToDashboard();
                }, 2000);
            } else {
                showError('Failed to save profile. Please try again.');
                setLoadingState(submitBtn, false);
            }
        }, 1500);
    });
}

// Input Focus Effects
document.querySelectorAll('.input-icon input, .input-icon select, .input-icon textarea').forEach(input => {
    input.addEventListener('focus', function() {
        this.parentElement.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
        this.parentElement.style.transform = 'scale(1)';
    });
});

// Skills input enhancement
if (document.getElementById('skills')) {
    document.getElementById('skills').addEventListener('input', function() {
        const skills = this.value;
        const skillsList = skills.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
        
        // Show skills count
        const skillsCount = skillsList.length;
        let existingIndicator = this.parentElement.querySelector('.skills-indicator');
        
        if (!existingIndicator) {
            existingIndicator = document.createElement('div');
            existingIndicator.className = 'skills-indicator';
            this.parentElement.appendChild(existingIndicator);
        }
        
        if (skills.length > 0) {
            existingIndicator.innerHTML = `
                <div class="skills-preview">
                    <span class="skills-count">${skillsCount} skill${skillsCount !== 1 ? 's' : ''}</span>
                    <div class="skills-tags">
                        ${skillsList.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
                    </div>
                </div>
            `;
        } else {
            existingIndicator.innerHTML = '';
        }
    });
}

// Add CSS for additional styles
const additionalStyles = `
    .auth-notification {
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
    
    .auth-notification-success {
        border-left: 4px solid #00FF00;
    }
    
    .auth-notification-error {
        border-left: 4px solid #FF4444;
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
    
    .error-message {
        color: #FF4444;
        font-size: 0.8rem;
        margin-top: 0.5rem;
        display: none;
    }
    
    .skills-indicator {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.8);
        border-radius: 8px;
        padding: 0.5rem;
        margin-top: 0.5rem;
        z-index: 10;
        backdrop-filter: blur(10px);
    }
    
    .skills-preview {
        color: #FFFFFF;
        font-size: 0.8rem;
    }
    
    .skills-count {
        color: #00FFFF;
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: block;
    }
    
    .skills-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 0.3rem;
    }
    
    .skill-tag {
        background: rgba(0, 255, 255, 0.2);
        color: #00FFFF;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.7rem;
        border: 1px solid rgba(0, 255, 255, 0.3);
    }
    
    .input-icon textarea {
        resize: vertical;
        min-height: 100px;
        font-family: inherit;
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
    
    .input-icon {
        transition: transform 0.3s ease;
    }
    
    .auth-btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
    }
    
    .auth-btn:disabled:hover {
        transform: none;
        box-shadow: none;
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialize onboarding page
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    const currentUser = checkAuth();
    if (!currentUser) return;
    
    // Pre-fill form if user has existing data
    prefillForm();
    
    // Animate form elements on load
    const formElements = document.querySelectorAll('.form-group');
    formElements.forEach((element, index) => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, index * 100);
    });
    
    // Animate AI assistant features
    const aiFeatures = document.querySelectorAll('.ai-feature, .benefit-item');
    aiFeatures.forEach((feature, index) => {
        feature.style.opacity = '0';
        feature.style.transform = 'translateX(20px)';
        
        setTimeout(() => {
            feature.style.transition = 'all 0.6s ease-out';
            feature.style.opacity = '1';
            feature.style.transform = 'translateX(0)';
        }, 500 + index * 100);
    });
});
