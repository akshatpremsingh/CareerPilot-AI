// Assessment Questions Data
const assessmentQuestions = [
    {
        id: 1,
        category: "Aptitude",
        question: "When faced with a complex problem, I prefer to:",
        options: [
            { text: "Break it down into smaller, manageable parts", score: 10 },
            { text: "Look for patterns and similarities to previous problems", score: 8 },
            { text: "Seek input from others to get different perspectives", score: 6 },
            { text: "Trust my intuition and go with the first solution that comes to mind", score: 4 }
        ]
    },
    {
        id: 2,
        category: "Personality",
        question: "In a team environment, I typically:",
        options: [
            { text: "Take charge and coordinate team efforts", score: 10 },
            { text: "Focus on completing my assigned tasks efficiently", score: 8 },
            { text: "Encourage collaboration and build relationships", score: 6 },
            { text: "Prefer to work independently and avoid conflicts", score: 4 }
        ]
    },
    {
        id: 3,
        category: "Technical Skills",
        question: "How comfortable are you with learning new technologies?",
        options: [
            { text: "Very comfortable - I actively seek out new technologies to learn", score: 10 },
            { text: "Comfortable - I can learn new tools when required for my work", score: 8 },
            { text: "Somewhat comfortable - I can learn with proper training and support", score: 6 },
            { text: "Not very comfortable - I prefer to stick with familiar technologies", score: 4 }
        ]
    },
    {
        id: 4,
        category: "Communication",
        question: "When presenting ideas to others, I:",
        options: [
            { text: "Use data and evidence to support my arguments", score: 10 },
            { text: "Tell compelling stories that connect with the audience", score: 8 },
            { text: "Focus on practical benefits and real-world applications", score: 6 },
            { text: "Keep it simple and avoid overwhelming details", score: 4 }
        ]
    },
    {
        id: 5,
        category: "Problem Solving",
        question: "When analyzing data, I tend to:",
        options: [
            { text: "Look for trends and patterns that reveal insights", score: 10 },
            { text: "Focus on accuracy and verify all calculations", score: 8 },
            { text: "Consider multiple interpretations and perspectives", score: 6 },
            { text: "Focus on the most important numbers and key takeaways", score: 4 }
        ]
    },
    {
        id: 6,
        category: "Leadership",
        question: "In challenging situations, I:",
        options: [
            { text: "Stay calm and help others focus on solutions", score: 10 },
            { text: "Take immediate action to address the problem", score: 8 },
            { text: "Gather information before making decisions", score: 6 },
            { text: "Seek guidance from more experienced colleagues", score: 4 }
        ]
    },
    {
        id: 7,
        category: "Creativity",
        question: "When brainstorming solutions, I:",
        options: [
            { text: "Generate many diverse ideas without judgment", score: 10 },
            { text: "Combine existing ideas in new and innovative ways", score: 8 },
            { text: "Focus on practical and feasible solutions", score: 6 },
            { text: "Prefer proven methods that have worked before", score: 4 }
        ]
    },
    {
        id: 8,
        category: "Adaptability",
        question: "When priorities change suddenly, I:",
        options: [
            { text: "Quickly adjust my plans and help others adapt", score: 10 },
            { text: "Reorganize my work to accommodate new requirements", score: 8 },
            { text: "Need some time to process before making changes", score: 6 },
            { text: "Find it challenging to shift focus quickly", score: 4 }
        ]
    },
    {
        id: 9,
        category: "Analytical Thinking",
        question: "When evaluating a business proposal, I focus on:",
        options: [
            { text: "Financial metrics and return on investment", score: 10 },
            { text: "Strategic alignment and long-term impact", score: 8 },
            { text: "Operational feasibility and implementation challenges", score: 6 },
            { text: "Risk factors and potential problems", score: 4 }
        ]
    },
    {
        id: 10,
        category: "Interpersonal Skills",
        question: "When working with difficult colleagues, I:",
        options: [
            { text: "Try to understand their perspective and find common ground", score: 10 },
            { text: "Maintain professionalism and focus on work objectives", score: 8 },
            { text: "Address conflicts directly to resolve issues", score: 6 },
            { text: "Minimize interaction to avoid conflicts", score: 4 }
        ]
    }
];

// Global Variables
let currentQuestionIndex = 0;
let userAnswers = {};
let totalScore = 0;

// DOM Elements
const questionContainer = document.getElementById('questionContainer');
const currentQuestionSpan = document.getElementById('currentQuestion');
const progressPercentage = document.getElementById('progressPercentage');
const progressFill = document.getElementById('progressFill');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const submitBtn = document.getElementById('submitBtn');
const resultsModal = document.getElementById('resultsModal');

// Initialize Assessment
document.addEventListener('DOMContentLoaded', function() {
    loadQuestion(currentQuestionIndex);
    updateProgress();
    updateNavigationButtons();
});

// Load Question Function
function loadQuestion(index) {
    const question = assessmentQuestions[index];
    
    const questionHTML = `
        <div class="question-header">
            <div class="question-number">Question ${question.id}</div>
            <div class="question-text">${question.question}</div>
            <div class="question-category">${question.category}</div>
        </div>
        <div class="options-container">
            ${question.options.map((option, optionIndex) => `
                <div class="option">
                    <input type="radio" id="option${optionIndex}" name="question${question.id}" value="${optionIndex}" 
                           ${userAnswers[question.id] === optionIndex ? 'checked' : ''}>
                    <label for="option${optionIndex}" class="option-label">
                        <div class="option-radio"></div>
                        <div class="option-text">${option.text}</div>
                    </label>
                </div>
            `).join('')}
        </div>
    `;
    
    questionContainer.innerHTML = questionHTML;
    
    // Add event listeners to radio buttons
    question.options.forEach((option, optionIndex) => {
        const radio = document.getElementById(`option${optionIndex}`);
        radio.addEventListener('change', function() {
            userAnswers[question.id] = optionIndex;
            updateNavigationButtons();
        });
    });
}

// Update Progress Function
function updateProgress() {
    const answeredQuestions = Object.keys(userAnswers).length;
    const progress = (answeredQuestions / assessmentQuestions.length) * 100;
    
    currentQuestionSpan.textContent = currentQuestionIndex + 1;
    progressPercentage.textContent = `${Math.round(progress)}%`;
    progressFill.style.width = `${progress}%`;
}

// Update Navigation Buttons
function updateNavigationButtons() {
    const currentQuestion = assessmentQuestions[currentQuestionIndex];
    const hasAnswered = userAnswers.hasOwnProperty(currentQuestion.id);
    
    // Previous button
    prevBtn.style.display = currentQuestionIndex === 0 ? 'none' : 'inline-flex';
    
    // Next/Submit button
    if (currentQuestionIndex === assessmentQuestions.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = hasAnswered ? 'inline-flex' : 'none';
    } else {
        nextBtn.style.display = hasAnswered ? 'inline-flex' : 'none';
        submitBtn.style.display = 'none';
    }
    
    // Disable next button if current question not answered
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
        nextBtn.disabled = !hasAnswered;
    }
}

// Navigation Functions
function nextQuestion() {
    if (currentQuestionIndex < assessmentQuestions.length - 1) {
        currentQuestionIndex++;
        loadQuestion(currentQuestionIndex);
        updateProgress();
        updateNavigationButtons();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        loadQuestion(currentQuestionIndex);
        updateProgress();
        updateNavigationButtons();
    }
}

// Submit Assessment Function
function submitAssessment() {
    // Calculate total score
    totalScore = 0;
    assessmentQuestions.forEach(question => {
        if (userAnswers.hasOwnProperty(question.id)) {
            const selectedOptionIndex = userAnswers[question.id];
            totalScore += question.options[selectedOptionIndex].score;
        }
    });
    
    // Save results to localStorage
    saveResults();
    
    // Show results modal
    showResults();
}

// Save Results Function
function saveResults() {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const assessmentResults = {
            userId: currentUser.id,
            timestamp: new Date().toISOString(),
            answers: userAnswers,
            totalScore: totalScore,
            skillLevel: getSkillLevel(totalScore),
            questions: assessmentQuestions
        };
        
        // Get existing results or create new array
        const existingResults = JSON.parse(localStorage.getItem('assessmentResults') || '[]');
        existingResults.push(assessmentResults);
        localStorage.setItem('assessmentResults', JSON.stringify(existingResults));
    }
}

// Get Current User Function
function getCurrentUser() {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
}

// Get Skill Level Function
function getSkillLevel(score) {
    if (score >= 80) {
        return {
            level: "High",
            description: "Excellent! You demonstrate strong skills across multiple areas. You're well-positioned for leadership roles and complex challenges."
        };
    } else if (score >= 60) {
        return {
            level: "Medium",
            description: "Good foundation! You have solid skills with room for growth. Focus on developing your weaker areas to reach the next level."
        };
    } else {
        return {
            level: "Low",
            description: "Developing! You have potential but need to build your skills. Consider targeted training and mentorship to accelerate your growth."
        };
    }
}

// Show Results Function
function showResults() {
    const skillLevel = getSkillLevel(totalScore);
    
    // Update modal content
    document.getElementById('totalScore').textContent = totalScore;
    document.getElementById('skillLevel').textContent = skillLevel.level + " Skill Level";
    document.getElementById('skillDescription').textContent = skillLevel.description;
    
    // Populate answers summary
    const answersList = document.getElementById('answersList');
    answersList.innerHTML = '';
    
    assessmentQuestions.forEach(question => {
        if (userAnswers.hasOwnProperty(question.id)) {
            const selectedOptionIndex = userAnswers[question.id];
            const selectedOption = question.options[selectedOptionIndex];
            
            const answerItem = document.createElement('div');
            answerItem.className = 'answer-item';
            answerItem.innerHTML = `
                <div class="answer-question">${question.question}</div>
                <div class="answer-selected">Selected: ${selectedOption.text}</div>
            `;
            answersList.appendChild(answerItem);
        }
    });
    
    // Show modal
    resultsModal.style.display = 'block';
}

// Close Results Function
function closeResults() {
    resultsModal.style.display = 'none';
}

// Navigation Functions
function goToDashboard() {
    window.location.href = 'index.html';
}

function retakeAssessment() {
    // Reset assessment
    currentQuestionIndex = 0;
    userAnswers = {};
    totalScore = 0;
    
    // Reload first question
    loadQuestion(currentQuestionIndex);
    updateProgress();
    updateNavigationButtons();
    
    // Close modal
    closeResults();
}

// Close modal when clicking outside
window.addEventListener('click', function(event) {
    if (event.target === resultsModal) {
        closeResults();
    }
});

// Keyboard navigation
document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowRight' || event.key === ' ') {
        event.preventDefault();
        if (currentQuestionIndex < assessmentQuestions.length - 1) {
            const currentQuestion = assessmentQuestions[currentQuestionIndex];
            if (userAnswers.hasOwnProperty(currentQuestion.id)) {
                nextQuestion();
            }
        }
    } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        if (currentQuestionIndex > 0) {
            previousQuestion();
        }
    } else if (event.key === 'Enter') {
        event.preventDefault();
        if (currentQuestionIndex === assessmentQuestions.length - 1) {
            const currentQuestion = assessmentQuestions[currentQuestionIndex];
            if (userAnswers.hasOwnProperty(currentQuestion.id)) {
                submitAssessment();
            }
        }
    }
});

// Add smooth scrolling for better UX
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
