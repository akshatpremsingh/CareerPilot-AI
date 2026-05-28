// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Smooth Scrolling for Navigation Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Dropdown toggle
document.querySelectorAll(".dropdown-toggle").forEach(drop => {
    drop.addEventListener("click", function (e) {
        e.preventDefault();
        this.parentElement.classList.toggle("open");
    });
});

// Close dropdown when clicking outside
document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dropdown')) {
        document.querySelectorAll('.nav-dropdown').forEach(dropdown => {
            dropdown.classList.remove('open');
        });
    }
});


// Hero Section Functions
function getStarted() {
    // Simulate starting the AI assessment
    showNotification('Starting AI Career Assessment...', 'info');
    setTimeout(() => {
        window.location.href = '#ai-tools';
    }, 1000);
}

function learnMore() {
    // Scroll to services section
    document.querySelector('#services').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Service Functions
function startAssessment() {
    showNotification('Launching Career Assessment...', 'info');
    setTimeout(() => {
        showAssessmentModal();
    }, 500);
}

function analyzeSkills() {
    showNotification('Analyzing your skills...', 'info');
    setTimeout(() => {
        showSkillsModal();
    }, 500);
}

function researchMarket() {
    showNotification('Researching job market trends...', 'info');
    setTimeout(() => {
        showMarketModal();
    }, 500);
}

function createRoadmap() {
    showNotification('Creating your career roadmap...', 'info');
    setTimeout(() => {
        showRoadmapModal();
    }, 500);
}

// Chat Interface
function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const message = chatInput.value.trim();

    if (message) {
        // Add user message
        const userMessage = document.createElement('div');
        userMessage.className = 'message user-message';
        userMessage.innerHTML = `
            <div class="message-content">
                ${message}
            </div>
        `;
        chatMessages.appendChild(userMessage);

        // Clear input
        chatInput.value = '';

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Simulate AI response
        setTimeout(() => {
            const aiResponse = generateAIResponse(message);
            const aiMessage = document.createElement('div');
            aiMessage.className = 'message ai-message';
            aiMessage.innerHTML = `
                <div class="message-content">
                    ${aiResponse}
                </div>
            `;
            chatMessages.appendChild(aiMessage);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }, 1000);
    }
}

// Enter key to send message
document.getElementById('chatInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// AI Response Generator
function generateAIResponse(userMessage) {
    const responses = {
        'career': 'I can help you explore various career paths! What industry interests you most? Technology, healthcare, finance, or something else?',
        'skill': 'Great question! I can analyze your current skills and identify gaps for your target career. What skills do you think you excel at?',
        'salary': 'I have access to real-time salary data. What role or industry are you interested in? I can provide detailed compensation insights.',
        'interview': 'Interview preparation is crucial! I can help you with common questions, behavioral scenarios, and industry-specific tips.',
        'resume': 'I can help you create a compelling resume that highlights your achievements and matches your target role.',
        'job market': 'The job market is constantly evolving. I can provide insights on trending roles, in-demand skills, and market opportunities.',
        'education': 'Education and certifications can significantly impact your career trajectory. What field are you considering for further education?',
        'network': 'Networking is essential for career growth. I can suggest strategies for building professional relationships in your industry.'
    };

    const lowerMessage = userMessage.toLowerCase();

    for (const [keyword, response] of Object.entries(responses)) {
        if (lowerMessage.includes(keyword)) {
            return response;
        }
    }

    return "I'm here to help with your career journey! I can assist with career exploration, skill analysis, market research, interview preparation, and more. What specific aspect would you like to discuss?";
}

// Modal Functions
function showAssessmentModal() {
    const modal = createModal('AI Career Assessment', `
        <div class="assessment-content">
            <h3>Let's discover your perfect career path!</h3>
            <p>This AI-powered assessment will analyze your:</p>
            <ul>
                <li>Personality traits and work preferences</li>
                <li>Technical and soft skills</li>
                <li>Interests and values</li>
                <li>Career goals and aspirations</li>
            </ul>
            <div class="assessment-questions">
                <div class="question">
                    <label>What type of work environment do you prefer?</label>
                    <select>
                        <option>Select an option</option>
                        <option>Fast-paced and dynamic</option>
                        <option>Structured and organized</option>
                        <option>Creative and flexible</option>
                        <option>Collaborative and team-oriented</option>
                    </select>
                </div>
                <div class="question">
                    <label>What are your strongest skills?</label>
                    <input type="text" placeholder="e.g., problem-solving, communication, technical skills">
                </div>
            </div>
            <button class="btn btn-primary" onclick="startAssessmentProcess()">Start Assessment</button>
        </div>
    `);
    document.body.appendChild(modal);
}

function showSkillsModal() {
    const modal = createModal('Skill Gap Analysis', `
        <div class="skills-content">
            <h3>Let's analyze your skill profile</h3>
            <p>I'll help you identify skills you need to develop for your target career.</p>
            <div class="skill-categories">
                <div class="skill-category">
                    <h4>Technical Skills</h4>
                    <div class="skill-item">
                        <span>Programming</span>
                        <div class="skill-level">
                            <div class="skill-bar" style="width: 60%"></div>
                        </div>
                    </div>
                    <div class="skill-item">
                        <span>Data Analysis</span>
                        <div class="skill-level">
                            <div class="skill-bar" style="width: 40%"></div>
                        </div>
                    </div>
                </div>
                <div class="skill-category">
                    <h4>Soft Skills</h4>
                    <div class="skill-item">
                        <span>Leadership</span>
                        <div class="skill-level">
                            <div class="skill-bar" style="width: 75%"></div>
                        </div>
                    </div>
                    <div class="skill-item">
                        <span>Communication</span>
                        <div class="skill-level">
                            <div class="skill-bar" style="width: 80%"></div>
                        </div>
                    </div>
                </div>
            </div>
            <button class="btn btn-primary" onclick="generateSkillRecommendations()">Get Recommendations</button>
        </div>
    `);
    document.body.appendChild(modal);
}

function showMarketModal() {
    const modal = createModal('Job Market Research', `
        <div class="market-content">
            <h3>Current Job Market Insights</h3>
            <div class="market-stats">
                <div class="market-stat">
                    <h4>Technology</h4>
                    <p class="stat-number">+15%</p>
                    <p class="stat-label">Growth Rate</p>
                </div>
                <div class="market-stat">
                    <h4>Healthcare</h4>
                    <p class="stat-number">+12%</p>
                    <p class="stat-label">Growth Rate</p>
                </div>
                <div class="market-stat">
                    <h4>Finance</h4>
                    <p class="stat-number">+8%</p>
                    <p class="stat-label">Growth Rate</p>
                </div>
            </div>
            <div class="trending-roles">
                <h4>Trending Roles</h4>
                <ul>
                    <li>AI/ML Engineer</li>
                    <li>Data Scientist</li>
                    <li>Cybersecurity Analyst</li>
                    <li>Product Manager</li>
                    <li>UX Designer</li>
                </ul>
            </div>
            <button class="btn btn-primary" onclick="getDetailedMarketReport()">Get Detailed Report</button>
        </div>
    `);
    document.body.appendChild(modal);
}

function showRoadmapModal() {
    const modal = createModal('Career Roadmap', `
        <div class="roadmap-content">
            <h3>Your Personalized Career Roadmap</h3>
            <div class="roadmap-timeline">
                <div class="timeline-item">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <h4>Phase 1: Foundation (0-6 months)</h4>
                        <ul>
                            <li>Complete relevant certifications</li>
                            <li>Build core technical skills</li>
                            <li>Create professional online presence</li>
                        </ul>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <h4>Phase 2: Experience (6-18 months)</h4>
                        <ul>
                            <li>Gain hands-on project experience</li>
                            <li>Network with industry professionals</li>
                            <li>Apply for entry-level positions</li>
                        </ul>
                    </div>
                </div>
                <div class="timeline-item">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <h4>Phase 3: Growth (18+ months)</h4>
                        <ul>
                            <li>Take on leadership responsibilities</li>
                            <li>Specialize in advanced areas</li>
                            <li>Pursue advanced certifications</li>
                        </ul>
                    </div>
                </div>
            </div>
            <button class="btn btn-primary" onclick="downloadRoadmap()">Download Roadmap</button>
        </div>
    `);
    document.body.appendChild(modal);
}

// Modal Helper Functions
function createModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                ${content}
            </div>
        </div>
    `;

    // Close modal when clicking overlay
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
        closeModal(modal.querySelector('.modal-close'));
    });

    return modal;
}

function closeModal(closeButton) {
    const modal = closeButton.closest('.modal');
    modal.remove();
}

// Process Functions
function startAssessmentProcess() {
    showNotification('Assessment started! Analyzing your responses...', 'success');
    closeModal(document.querySelector('.modal-close'));
    setTimeout(() => {
        showNotification('Assessment complete! Check your personalized results.', 'success');
    }, 3000);
}

function generateSkillRecommendations() {
    showNotification('Generating personalized skill recommendations...', 'info');
    closeModal(document.querySelector('.modal-close'));
    setTimeout(() => {
        showNotification('Skill recommendations ready! Check your dashboard.', 'success');
    }, 2000);
}

function getDetailedMarketReport() {
    showNotification('Generating detailed market report...', 'info');
    closeModal(document.querySelector('.modal-close'));
    setTimeout(() => {
        showNotification('Market report downloaded successfully!', 'success');
    }, 2000);
}

function downloadRoadmap() {
    showNotification('Downloading your career roadmap...', 'info');
    closeModal(document.querySelector('.modal-close'));
    setTimeout(() => {
        showNotification('Roadmap downloaded successfully!', 'success');
    }, 1500);
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
        </div>
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}
// Contact Form Handler - Safe Version
const contactForm = document.getElementById('contactForm');
let isSubmitting = false;

contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    if (isSubmitting) return; // prevent multiple submits
    isSubmitting = true;

    const btn = contactForm.querySelector('button[type="submit"]');
    btn.disabled = true; // disable button while submitting

    const name = this.name.value.trim();
    const email = this.email.value.trim();
    const message = this.message.value.trim();

    try {
        const res = await fetch('/api/contact', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, message })
        });

        const data = await res.json();
        if (data.success) {
            showNotification('Message sent successfully!', 'success');
            this.reset();
        } else {
            showNotification('Failed to send message. Please try again.', 'error');
        }
    } catch (err) {
        console.error(err);
        showNotification('Error sending message.', 'error');
    } finally {
        isSubmitting = false;
        btn.disabled = false;
    }
});


// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.service-card, .feature, .stat, .contact-item');
    animateElements.forEach(el => observer.observe(el));

    // Add staggered animations to service cards
    const serviceCards = document.querySelectorAll('.service-card');
    serviceCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.2}s`;
        card.classList.add('animate-on-scroll');
    });

    // Add bounce animation to buttons on hover
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.animation = 'bounce 0.6s ease-in-out';
        });
        button.addEventListener('animationend', () => {
            button.style.animation = '';
        });
    });

    // Add wave effect to gradient text
    const gradientText = document.querySelector('.gradient-text');
    if (gradientText) {
        setInterval(() => {
            gradientText.style.animation = 'wave 2s ease-in-out';
            setTimeout(() => {
                gradientText.style.animation = '';
            }, 2000);
        }, 4000);
    }
});

// Add CSS for animations and modals
const additionalStyles = `
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    
    .modal-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(5px);
    }
    
    .modal-content {
        background: rgba(0, 0, 0, 0.95);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 20px;
        max-width: 600px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        z-index: 1;
    }
    
    .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .modal-header h3 {
        margin: 0;
        color: #FFFFFF;
    }
    
    .modal-close {
        background: none;
        border: none;
        color: #FFFFFF;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .modal-close:hover {
        background: rgba(255, 255, 255, 0.1);
    }
    
    .modal-body {
        padding: 1.5rem;
    }
    
    .notification {
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
    }
    
    .notification-success {
        border-left: 4px solid #00FF00;
    }
    
    .notification-info {
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
    
    .user-message .message-content {
        background: linear-gradient(135deg, #007BFF, #00FFFF);
        color: #FFFFFF;
        margin-left: 2rem;
    }
    
    .ai-message .message-content {
        background: rgba(255, 255, 255, 0.1);
        color: #FFFFFF;
        margin-right: 2rem;
    }
    
    .animate-in {
        animation: slideInUp 0.6s ease-out;
    }
    
    @keyframes slideInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .assessment-content,
    .skills-content,
    .market-content,
    .roadmap-content {
        color: #FFFFFF;
    }
    
    .assessment-content h3,
    .skills-content h3,
    .market-content h3,
    .roadmap-content h3 {
        margin-bottom: 1rem;
        color: #00FFFF;
    }
    
    .assessment-content ul,
    .roadmap-content ul {
        margin: 1rem 0;
        padding-left: 1.5rem;
    }
    
    .assessment-content li,
    .roadmap-content li {
        margin-bottom: 0.5rem;
        color: #CCCCCC;
    }
    
    .question {
        margin: 1rem 0;
    }
    
    .question label {
        display: block;
        margin-bottom: 0.5rem;
        color: #FFFFFF;
        font-weight: 500;
    }
    
    .question select,
    .question input {
        width: 100%;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        padding: 0.75rem;
        color: #FFFFFF;
        outline: none;
    }
    
    .skill-categories {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
        margin: 1rem 0;
    }
    
    .skill-category h4 {
        color: #00FFFF;
        margin-bottom: 1rem;
    }
    
    .skill-item {
        margin-bottom: 1rem;
    }
    
    .skill-item span {
        display: block;
        margin-bottom: 0.5rem;
        color: #FFFFFF;
    }
    
    .skill-level {
        width: 100%;
        height: 8px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        overflow: hidden;
    }
    
    .skill-bar {
        height: 100%;
        background: linear-gradient(135deg, #007BFF, #00FFFF);
        border-radius: 4px;
        transition: width 0.3s ease;
    }
    
    .market-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 1rem;
        margin: 1rem 0;
    }
    
    .market-stat {
        text-align: center;
        padding: 1rem;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .market-stat h4 {
        color: #00FFFF;
        margin-bottom: 0.5rem;
    }
    
    .stat-number {
        font-size: 1.5rem;
        font-weight: 700;
        color: #00FFFF;
        margin-bottom: 0.25rem;
    }
    
    .stat-label {
        color: #CCCCCC;
        font-size: 0.8rem;
    }
    
    .trending-roles {
        margin: 1rem 0;
    }
    
    .trending-roles h4 {
        color: #00FFFF;
        margin-bottom: 1rem;
    }
    
    .trending-roles ul {
        list-style: none;
        padding: 0;
    }
    
    .trending-roles li {
        padding: 0.5rem 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        color: #CCCCCC;
    }
    
    .roadmap-timeline {
        margin: 1rem 0;
    }
    
    .timeline-item {
        display: flex;
        margin-bottom: 2rem;
        position: relative;
    }
    
    .timeline-marker {
        width: 20px;
        height: 20px;
        background: #00FFFF;
        border-radius: 50%;
        margin-right: 1rem;
        margin-top: 0.5rem;
        flex-shrink: 0;
        box-shadow: 0 0 10px #00FFFF;
    }
    
    .timeline-content h4 {
        color: #00FFFF;
        margin-bottom: 0.5rem;
    }
    
    .timeline-content ul {
        margin: 0;
        padding-left: 1rem;
    }
    
    .timeline-content li {
        color: #CCCCCC;
        margin-bottom: 0.25rem;
    }
    
    @media (max-width: 768px) {
        .skill-categories {
            grid-template-columns: 1fr;
        }
        
        .market-stats {
            grid-template-columns: 1fr;
        }
        
        .modal-content {
            width: 95%;
            margin: 1rem;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
