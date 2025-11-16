// ======================
// Auth Script (Backend Integrated)
// ======================

// Utility functions
function showError(input, message) {
    const formControl = input.parentElement;
    const small = formControl.querySelector("small");
    if (small) {
        small.innerText = message;
        small.style.visibility = "visible";
    }
    input.classList.add("error");
}

function clearErrors() {
    document.querySelectorAll("small").forEach(s => s.style.visibility = "hidden");
    document.querySelectorAll("input").forEach(input => input.classList.remove("error"));
}

function showErrorNotification(message) {
    alert(message);
}

function showSuccess(message) {
    alert(message);
}

function setLoadingState(button, isLoading) {
    if (!button) return;
    button.disabled = isLoading;
    button.innerText = isLoading ? "Loading..." : button.getAttribute("data-original-text") || button.innerText;
}

// Save token & user info
function saveAuthData(token, user) {
    localStorage.setItem("authToken", token);
    localStorage.setItem("currentUser", JSON.stringify(user));
}

function getAuthToken() {
    return localStorage.getItem("authToken");
}

function getCurrentUser() {
    return JSON.parse(localStorage.getItem("currentUser"));
}

// ======================
// Signup Form
// ======================
if (document.getElementById("signupForm")) {
    document.getElementById("signupForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        clearErrors();

        const formData = {
            name: document.getElementById("fullName").value.trim(),
            email: document.getElementById("email").value.trim(),
            role: document.getElementById("role").value,
            password: document.getElementById("password").value,
        };

        const submitBtn = this.querySelector(".auth-btn");
        submitBtn.setAttribute("data-original-text", submitBtn.innerText);
        setLoadingState(submitBtn, true);

        try {
            const res = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok) {
                showSuccess("Account created! Redirecting...");
                setTimeout(() => (window.location.href = "login.html"), 2000);
            } else {
                showErrorNotification(data.msg || "Signup failed");
                setLoadingState(submitBtn, false);
            }
        } catch (err) {
            console.error(err);
            showErrorNotification("Server error. Try again.");
            setLoadingState(submitBtn, false);
        }
    });
}

// ======================
// Login Form
// ======================
if (document.getElementById("loginForm")) {
    document.getElementById("loginForm").addEventListener("submit", async function (e) {
        e.preventDefault();
        clearErrors();

        const formData = {
            email: document.getElementById("email").value.trim(),      // fixed
            password: document.getElementById("password").value,      // fixed
        };

        const submitBtn = this.querySelector(".auth-btn");
        submitBtn.setAttribute("data-original-text", submitBtn.innerText);
        setLoadingState(submitBtn, true);

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (res.ok && data.token) {
                saveAuthData(data.token, data.user);
                showSuccess("Login successful! Redirecting...");
                setTimeout(() => (window.location.href = "student-dashboard.html"), 2000);
            } else {
                showErrorNotification(data.msg || "Invalid credentials");
                setLoadingState(submitBtn, false);
            }
        } catch (err) {
            console.error(err);
            showErrorNotification("Server error. Try again.");
            setLoadingState(submitBtn, false);
        }
    });
}


// ======================
// Logout Function
// ======================
function logout() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}
