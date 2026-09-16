/**
 * Placement Preparation Portal - Authentication Module
 */
/* ---------------- LOGIN ---------------- */
async function loginUser(event) {
    if (event) event.preventDefault();

    const emailEl = document.getElementById("email");
    const passEl = document.getElementById("password");
    const submitBtn = event?.target?.querySelector('button[type="submit"]');

    const email = emailEl ? emailEl.value.trim() : "";
    const password = passEl ? passEl.value.trim() : "";

    if (!email || !password) {
        if (typeof showToast === "function") {
            showToast("Please enter both email and password", "warning");
        } else {
            alert("Please enter both email and password");
        }
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Logging in...";
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data));

            if (typeof showToast === "function") {
                showToast("Welcome back, " + (data.name || "Student") + "!", "success");
            }

            setTimeout(() => {
                if (data.role === "ADMIN") {
                    window.location.href = "admin-dashboard.html";
                } else {
                    window.location.href = "dashboard.html";
                }
            }, 600);
        } else {
            const errorMsg = data.message || "Invalid credentials. Please verify your email and password.";
            if (typeof showToast === "function") {
                showToast(errorMsg, "error");
            } else {
                alert(errorMsg);
            }
        }
    } catch (error) {
        console.error("Login error:", error);
        const err = "Unable to connect to backend server. Please verify the Spring Boot service is running.";
        if (typeof showToast === "function") {
            showToast(err, "error");
        } else {
            alert(err);
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Login";
        }
    }
}

/* ---------------- REGISTER ---------------- */
async function registerUser(event) {
    if (event) event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const usn = document.getElementById("usn").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();
    const submitBtn = event?.target?.querySelector('button[type="submit"]');

    if (password !== confirmPassword) {
        if (typeof showToast === "function") {
            showToast("Passwords do not match", "warning");
        } else {
            alert("Passwords do not match");
        }
        return;
    }

    if (password.length < 6) {
        if (typeof showToast === "function") {
            showToast("Password must be at least 6 characters", "warning");
        } else {
            alert("Password must be at least 6 characters");
        }
        return;
    }

    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerText = "Creating account...";
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                name,
                email,
                usn: usn.toUpperCase(),
                password,
                confirmPassword
            })
        });

        const data = await response.json();

        if (response.ok) {
            if (typeof showToast === "function") {
                showToast("Account created successfully! Please log in.", "success");
            } else {
                alert("Account created successfully! Please log in.");
            }
            setTimeout(() => {
                window.location.href = "login.html";
            }, 800);
        } else {
            const errorMsg = data.message || "Registration failed. Email or USN may already be registered.";
            if (typeof showToast === "function") {
                showToast(errorMsg, "error");
            } else {
                alert(errorMsg);
            }
        }
    } catch (error) {
        console.error("Registration error:", error);
        const err = "Unable to connect to server. Please try again.";
        if (typeof showToast === "function") {
            showToast(err, "error");
        } else {
            alert(err);
        }
    } finally {
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerText = "Register";
        }
    }
}

/* ---------------- HELPERS & GUARDS ---------------- */
function getToken() {
    return localStorage.getItem("token");
}

function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch (e) {
        return null;
    }
}

function isLoggedIn() {
    return !!localStorage.getItem("token");
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    if (typeof showToast === "function") {
        showToast("Logged out successfully", "info");
    }
    setTimeout(() => {
        window.location.href = "login.html";
    }, 400);
}

function checkAuthentication() {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
    }
}

// Global Auth namespace fallback if api.js not yet loaded
if (typeof Auth === "undefined") {
    var Auth = {
        getToken: getToken,
        getUser: getCurrentUser,
        isLoggedIn: isLoggedIn,
        logout: logout
    };
}