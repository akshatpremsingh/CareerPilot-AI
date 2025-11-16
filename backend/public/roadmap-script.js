// Global Variables
let selectedFormat = null;
let currentUser = null;

// DOM Elements
const roadmapForm = document.getElementById('roadmapForm');
const roleInput = document.getElementById('roleInput');
const formatCards = document.querySelectorAll('.format-card');
const enhanceCheckbox = document.getElementById('enhancedRoadmap');
const generateBtn = document.getElementById('generateBtn');

// Initialize Roadmap Form
document.addEventListener('DOMContentLoaded', function() {
    initializeRoadmapForm();
    loadUserInfo();
});

// Initialize Roadmap Form Function
function initializeRoadmapForm() {
    // Get current user
    currentUser = getCurrentUser();
    
    // Add event listeners
    formatCards.forEach(card => {
        card.addEventListener('click', () => selectFormat(card));
    });
    
    roadmapForm.addEventListener('submit', handleFormSubmit);
    roleInput.addEventListener('input', validateForm);
    
    // Load saved data if exists
    loadSavedRoadmapData();
}

// Get Current User Function
function getCurrentUser() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
}

// Load User Info Function
function loadUserInfo() {
    // This function can be used to display user info if needed
    if (currentUser) {
        console.log('Current user:', currentUser.name);
    }
}

// Select Format Function
function selectFormat(selectedCard) {
    // Remove selected class from all cards
    formatCards.forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selected class to clicked card
    selectedCard.classList.add('selected');
    selectedFormat = selectedCard.dataset.format;
    
    // Add animation effect
    addSelectionAnimation(selectedCard);
    
    // Validate form
    validateForm();
}

// Add Selection Animation Function
function addSelectionAnimation(card) {
    card.style.transform = 'scale(1.05)';
    card.style.boxShadow = '0 0 30px rgba(0, 255, 255, 0.3)';
    
    setTimeout(() => {
        card.style.transform = '';
        card.style.boxShadow = '';
    }, 300);
}

// Validate Form Function
function validateForm() {
    const roleValue = roleInput.value.trim();
    const isFormValid = roleValue.length > 0 && selectedFormat !== null;
    
    // Update button state
    generateBtn.disabled = !isFormValid;
    
    // Add visual feedback
    if (isFormValid) {
        generateBtn.classList.add('ready');
    } else {
        generateBtn.classList.remove('ready');
    }
}

// Handle Form Submit Function
function handleFormSubmit(event) {
    event.preventDefault();
    
    const roleValue = roleInput.value.trim();
    const enhanced = enhanceCheckbox.checked;
    
    if (!roleValue || !selectedFormat) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Save roadmap data to localStorage
    const roadmapData = {
        role: roleValue,
        format: selectedFormat,
        enhanced: enhanced,
        timestamp: new Date().toISOString(),
        user: currentUser ? currentUser.id : null
    };
    
    localStorage.setItem('roadmapData', JSON.stringify(roadmapData));
    
    // Show success message
    showNotification('Roadmap data saved! Redirecting...', 'success');
    
    // Redirect to roadmap display page (you can create a separate page for this)
    setTimeout(() => {
        // For now, we'll just show a success message
        // In a real app, you might redirect to a different page
        showGeneratedRoadmap(roadmapData);
    }, 1500);
}

// Show Generated Roadmap Function
function showGeneratedRoadmap(data) {
    // Create a modal or replace the form with the roadmap display
    const mainContainer = document.querySelector('.main-container');
    
    mainContainer.innerHTML = `
        <div class="roadmap-card">
            <div class="card-header">
                <h1 class="card-title">Your ${data.format.charAt(0).toUpperCase() + data.format.slice(1)} for ${data.role}</h1>
                <p class="card-subtitle">Personalized learning path generated successfully</p>
            </div>
            
            <div class="roadmap-preview">
                <div class="preview-item">
                    <i class="fas fa-user-tie"></i>
                    <span><strong>Role:</strong> ${data.role}</span>
                </div>
                <div class="preview-item">
                    <i class="fas fa-route"></i>
                    <span><strong>Format:</strong> ${data.format.charAt(0).toUpperCase() + data.format.slice(1)}</span>
                </div>
                <div class="preview-item">
                    <i class="fas fa-cog"></i>
                    <span><strong>Enhanced:</strong> ${data.enhanced ? 'Yes' : 'No'}</span>
                </div>
            </div>
            
            <div class="action-buttons">
                <button class="btn btn-secondary" onclick="resetForm()">
                    <i class="fas fa-arrow-left"></i>
                    Create New Roadmap
                </button>
                <button class="btn btn-primary" onclick="exportRoadmap()">
                    <i class="fas fa-download"></i>
                    Export Roadmap
                </button>
            </div>
        </div>
    `;
}

// Reset Form Function
function resetForm() {
    // Reload the page to reset the form
    window.location.reload();
}

// Export Roadmap Function
function exportRoadmap() {
    const roadmapData = localStorage.getItem('roadmapData');
    if (!roadmapData) {
        showNotification('No roadmap data to export', 'error');
        return;
    }
    
    const data = JSON.parse(roadmapData);
    const exportData = {
        ...data,
        exportDate: new Date().toISOString(),
        generatedBy: 'CareerPilot AI'
    };
    
    // Create and download JSON file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `roadmap-${data.role.replace(/\s+/g, '-').toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showNotification('Roadmap exported successfully!', 'success');
}

// Load Saved Roadmap Data Function
function loadSavedRoadmapData() {
    const savedData = localStorage.getItem('roadmapData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Pre-fill the form with saved data
        roleInput.value = data.role || '';
        enhanceCheckbox.checked = data.enhanced || false;
        
        // Select the saved format
        if (data.format) {
            const formatCard = document.querySelector(`[data-format="${data.format}"]`);
            if (formatCard) {
                selectFormat(formatCard);
            }
        }
        
        // Validate form
        validateForm();
    }
}

// Show Notification Function
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? 'rgba(76, 175, 80, 0.9)' : type === 'error' ? 'rgba(244, 67, 54, 0.9)' : 'rgba(0, 255, 255, 0.9)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        backdrop-filter: blur(10px);
        max-width: 300px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    `;
    
    // Add animation styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Add CSS for roadmap preview
const previewStyles = `
    .roadmap-preview {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        margin: 2rem 0;
        padding: 1.5rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .preview-item {
        display: flex;
        align-items: center;
        gap: 1rem;
        padding: 0.75rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
    }
    
    .preview-item i {
        color: #00FFFF;
        font-size: 1.2rem;
        width: 20px;
        text-align: center;
    }
    
    .preview-item span {
        color: rgba(255, 255, 255, 0.9);
        font-size: 0.95rem;
    }
    
    .action-buttons {
        display: flex;
        gap: 1rem;
        margin-top: 2rem;
    }
    
    .action-buttons .btn {
        flex: 1;
        justify-content: center;
    }
    
    .generate-btn.ready {
        background: linear-gradient(135deg, #00FFFF, #007BFF);
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0%, 100% { box-shadow: 0 0 0 0 rgba(0, 255, 255, 0.4); }
        50% { box-shadow: 0 0 0 10px rgba(0, 255, 255, 0); }
    }
`;

// Add styles to document
if (!document.querySelector('#preview-styles')) {
    const style = document.createElement('style');
    style.id = 'preview-styles';
    style.textContent = previewStyles;
    document.head.appendChild(style);
}
