

/* ---------------- LOGIN ---------------- */
const API_BASE_URL = "http://localhost:8080/api";
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                password
            })
        });

        const data = await response.json();

        if (response.ok) {

            localStorage.setItem("token", data.token);
            localStorage.setItem("user", JSON.stringify(data));

            alert("Login Successful");

            if (data.role === "ADMIN") {
                window.location.href = "admin-dashboard.html";
            } else {
                window.location.href = "dashboard.html";
            }

        } else {
            alert(data.message || "Invalid Credentials");
        }

    } catch (error) {
        console.error(error);
        alert("Server Error");
    }
}

/* ---------------- REGISTER ---------------- */

async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const usn = document.getElementById("usn").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
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
    usn,
    password,
    confirmPassword
})
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registration Successful");
            window.location.href = "login.html";
        } else {
            alert(data.message || "Registration Failed");
        }

    } catch (error) {
        console.error(error);
        alert("Server Error");
    }
}

/* ---------------- AUTH HELPERS ---------------- */

function getToken() {
    return localStorage.getItem("token");
}

function getCurrentUser() {
    const user = localStorage.getItem("user");

    if (!user) return null;

    return JSON.parse(user);
}

function isLoggedIn() {
    return !!localStorage.getItem("token");
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";
}

/* ---------------- PAGE GUARD ---------------- */

function checkAuthentication() {

    const token = localStorage.getItem("token");

    if (!token) {
        window.location.href = "login.html";
    }
}