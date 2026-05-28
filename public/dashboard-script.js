// ======================
// Dashboard Script
// ======================

// Check authentication
function checkAuth() {

    const currentUser =
        JSON.parse(localStorage.getItem('currentUser'));

    if (!currentUser) {

        window.location.href = 'login.html';
        return null;

    }

    if (
        currentUser.role !== 'admin' &&
        !currentUser.profileCompleted
    ) {

        window.location.href = 'onboarding.html';
        return null;

    }

    return currentUser;

}

// ======================
// FETCH USER PROFILE FROM MONGODB
// ======================

async function fetchUserProfile() {

    try {

        const token =
            localStorage.getItem('authToken');

        const res = await fetch('/api/auth/me', {

            method: 'GET',

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        if (!res.ok) {

            throw new Error('Failed to fetch profile');

        }

        const user = await res.json();

        // Update localStorage
        localStorage.setItem(
            'currentUser',
            JSON.stringify(user)
        );

        return user;

    } catch (err) {

        console.error(err);
        return null;

    }

}

// ======================
// DISPLAY PROFILE INFO
// ======================

function displayProfileInfo(user) {

    // Education
    const educationElement =
        document.getElementById('educationLevel');

    if (educationElement) {

        educationElement.textContent =
            user.educationLevel || 'Not specified';

    }

    // Skills
    const skillsElement =
        document.getElementById('skillsList');

    if (skillsElement) {

        if (
            user.skills &&
            user.skills.length > 0
        ) {

            skillsElement.innerHTML =
                user.skills.map(skill => `
                    <span class="skill-tag">
                        ${skill}
                    </span>
                `).join('');

        } else {

            skillsElement.textContent =
                'No skills specified';

        }

    }

    // Career Goal
    const careerGoalElement =
        document.getElementById('careerGoal');

    if (careerGoalElement) {

        careerGoalElement.textContent =
            user.careerGoal ||
            'No career goal specified';

    }

}

// ======================
// INITIALIZE DASHBOARD
// ======================

async function initDashboard() {

    let currentUser = checkAuth();

    if (!currentUser) return;

    // Fetch latest MongoDB data
    const freshUser =
        await fetchUserProfile();

    if (freshUser) {

        currentUser = freshUser;

    }

    // Update names
    if (currentUser.role !== 'admin') {

        const userNameElements =
            document.querySelectorAll(
                '#userName, #welcomeName'
            );

        userNameElements.forEach(element => {

            element.textContent =
                currentUser.fullName ||
                currentUser.name;

        });

        // Display profile info
        displayProfileInfo(currentUser);

    }

    // Add role class
    document.body.classList.add(
        `role-${currentUser.role}`
    );

    // Initialize role features
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

// ======================
// EDIT PROFILE
// ======================

function editProfile() {

    window.location.href =
        'onboarding.html';

}

// ======================
// STUDENT DASHBOARD
// ======================

function initStudentDashboard() {

    const actionButtons =
        document.querySelectorAll('.action-btn');

    actionButtons.forEach(button => {

        button.addEventListener(
            'click',
            function () {

                const action =
                    this.querySelector('span')
                    .textContent;

                handleStudentAction(action);

            }
        );

    });

}

function handleStudentAction(action) {

    switch (action) {

        case 'Start Learning':

            showNotification(
                'Opening course catalog...',
                'info'
            );

            break;

        case 'Find Mentor':

            showNotification(
                'Searching for mentors...',
                'info'
            );

            break;

        case 'Update Resume':

            showNotification(
                'Opening resume builder...',
                'info'
            );

            break;

        case 'AI Chat':

            showNotification(
                'Connecting to AI assistant...',
                'info'
            );

            break;

    }

}

// ======================
// MENTOR DASHBOARD
// ======================

function initMentorDashboard() {

    const actionButtons =
        document.querySelectorAll('.action-btn');

    actionButtons.forEach(button => {

        button.addEventListener(
            'click',
            function () {

                const action =
                    this.querySelector('span')
                    .textContent;

                handleMentorAction(action);

            }
        );

    });

}

function handleMentorAction(action) {

    switch (action) {

        case 'Schedule Session':

            showNotification(
                'Opening calendar...',
                'info'
            );

            break;

        case 'Message Students':

            showNotification(
                'Opening messaging...',
                'info'
            );

            break;

        case 'View Analytics':

            showNotification(
                'Loading analytics...',
                'info'
            );

            break;

    }

}

// ======================
// ADMIN DASHBOARD
// ======================

function initAdminDashboard() {

    const actionButtons =
        document.querySelectorAll('.action-btn');

    actionButtons.forEach(button => {

        button.addEventListener(
            'click',
            function () {

                const action =
                    this.querySelector('span')
                    .textContent;

                handleAdminAction(action);

            }
        );

    });

}

function handleAdminAction(action) {

    switch (action) {

        case 'Add User':

            showNotification(
                'Opening user management...',
                'info'
            );

            break;

        case 'Backup Data':

            showNotification(
                'Starting backup...',
                'info'
            );

            break;

        case 'View Reports':

            showNotification(
                'Loading reports...',
                'info'
            );

            break;

    }

}

// ======================
// LOGOUT
// ======================

function logout() {

    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');

    showNotification(
        'Logged out successfully',
        'success'
    );

    setTimeout(() => {

        window.location.href =
            'login.html';

    }, 1000);

}

// ======================
// NOTIFICATIONS
// ======================

function showNotification(
    message,
    type = 'info'
) {

    const notification =
        document.createElement('div');

    notification.className =
        `dashboard-notification dashboard-notification-${type}`;

    notification.innerHTML = `

        <div class="notification-content">

            <span class="notification-message">
                ${message}
            </span>

            <button
                class="notification-close"
                onclick="this.parentElement.parentElement.remove()"
            >
                &times;
            </button>

        </div>

    `;

    document.body.appendChild(notification);

    setTimeout(() => {

        notification.remove();

    }, 3000);

}

// ======================
// NAVIGATION
// ======================

function initNavigation() {

    const navLinks =
        document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {

        link.addEventListener(
            'click',
            function (e) {

                if (
                    !this.classList.contains(
                        'home-link'
                    )
                ) {

                    e.preventDefault();

                    navLinks.forEach(l =>
                        l.classList.remove('active')
                    );

                    this.classList.add('active');

                }

            }
        );

    });

}

// ======================
// INIT
// ======================

document.addEventListener(
    'DOMContentLoaded',
    function () {

        initDashboard();
        initNavigation();

        window.logout = logout;
        window.editProfile = editProfile;

    }
);