/**
 * Placement Preparation Portal - Core API & Auth Client
 */
const API_BASE_URL = "http://localhost:8080/api";

const Auth = {
    getToken() {
        return localStorage.getItem("token");
    },
    setToken(token) {
        localStorage.setItem("token", token);
    },
    getUser() {
        try {
            return JSON.parse(localStorage.getItem("user") || "null");
        } catch (e) {
            return null;
        }
    },
    setUser(user) {
        localStorage.setItem("user", JSON.stringify(user));
    },
    isLoggedIn() {
        return !!localStorage.getItem("token");
    },
    hasRole(role) {
        const user = this.getUser();
        return !!(user && user.role === role);
    },
    logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        showToast("Logged out successfully", "info");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 500);
    }
};

// Authentication Guards
function requireAuth() {
    if (!Auth.isLoggedIn()) {
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function requireAdmin() {
    if (!Auth.isLoggedIn()) {
        window.location.href = "login.html";
        return false;
    }
    if (!Auth.hasRole("ADMIN")) {
        showToast("Access Denied: Administrator role required", "error");
        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);
        return false;
    }
    return true;
}

// Universal Fetch Wrapper
async function apiFetch(endpoint, options = {}) {
    const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
    const token = Auth.getToken();

    const headers = {
        "Content-Type": "application/json",
        ...(options.headers || {})
    };

    if (token) {
        headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers
    };

    if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(url, config);

        if (response.status === 401) {
            Auth.logout();
            throw new Error("Your session has expired. Please log in again.");
        }

        const contentType = response.headers.get("content-type");
        let data = null;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else if (response.status !== 204) {
            data = await response.text();
        }

        if (!response.ok) {
            const message = (data && data.message) ? data.message : `Request failed (status ${response.status})`;
            throw new Error(message);
        }

        return data;
    } catch (err) {
        console.error("API error at " + endpoint + ":", err);
        throw err;
    }
}

// Navbar User Profile Initializer
function initNavUser(containerId = "navUser") {
    const container = document.getElementById(containerId);
    if (!container) return;

    const user = Auth.getUser();
    if (!user) {
        container.innerHTML = `
            <a href="login.html" class="btn btn-outline btn-sm">Login</a>
            <a href="register.html" class="btn btn-primary btn-sm">Register</a>
        `;
        return;
    }

    const roleBadge = user.role === "ADMIN" 
        ? '<span class="badge badge-danger" style="font-size:0.65rem; margin-left:6px;">ADMIN</span>'
        : '<span class="badge badge-primary" style="font-size:0.65rem; margin-left:6px;">STUDENT</span>';

    container.innerHTML = `
        <div style="display:flex; align-items:center; gap:12px;">
            <div style="display:flex; flex-direction:column; align-items:flex-end; line-height:1.2;">
                <span style="font-weight:600; font-size:0.85rem; color:#fff;">
                    ${esc(user.name || "Student")} ${roleBadge}
                </span>
                <span style="font-size:0.75rem; color:var(--text-muted);">${esc(user.email || "")}</span>
            </div>
            <a href="profile.html" class="avatar-link" title="My Profile" style="display:flex; align-items:center; justify-content:center; width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, var(--primary), var(--secondary)); color:#fff; font-weight:700; font-size:0.85rem; text-decoration:none;">
                ${(user.name ? user.name.charAt(0).toUpperCase() : "S")}
            </a>
            <button onclick="Auth.logout()" class="btn btn-outline btn-sm" style="padding:6px 12px; font-size:0.8rem;" title="Logout">
                🚪 Logout
            </button>
        </div>
    `;
}

// Modern Toast Notification
function showToast(message, type = "success") {
    let container = document.getElementById("toast-container");
    if (!container) {
        container = document.createElement("div");
        container.id = "toast-container";
        container.style.cssText = "position:fixed; bottom:24px; right:24px; z-index:999999; display:flex; flex-direction:column; gap:10px; pointer-events:none;";
        document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.style.cssText = `
        pointer-events:auto;
        padding:12px 20px;
        border-radius:10px;
        color:#fff;
        font-family:'Poppins', sans-serif;
        font-size:0.88rem;
        box-shadow:0 10px 25px rgba(0,0,0,0.4);
        display:flex;
        align-items:center;
        gap:10px;
        animation:slideInRight 0.3s ease;
        transition:all 0.3s ease;
    `;

    const bgMap = {
        success: "linear-gradient(135deg, #059669, #10b981)",
        error: "linear-gradient(135deg, #dc2626, #ef4444)",
        warning: "linear-gradient(135deg, #d97706, #f59e0b)",
        info: "linear-gradient(135deg, #2563eb, #3b82f6)"
    };

    const iconMap = {
        success: "✅",
        error: "❌",
        warning: "⚠️",
        info: "ℹ️"
    };

    toast.style.background = bgMap[type] || bgMap.info;
    toast.innerHTML = `<span>${iconMap[type] || "ℹ️"}</span><span>${esc(message)}</span>`;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(20px)";
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

// XSS Prevention Utility
function esc(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Seconds formatter (e.g. 180s -> 3m 00s)
function formatTime(seconds) {
    if (!seconds || seconds <= 0) return "0m 00s";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${String(secs).padStart(2, "0")}s`;
}

// Category and Difficulty color mappings
const CategoryColors = {
    APTITUDE: "badge-primary",
    LOGICAL_REASONING: "badge-warning",
    VERBAL_ABILITY: "badge-success",
    TECHNICAL: "badge-info",
    CODING: "badge-danger"
};

const DifficultyColors = {
    EASY: "badge-success",
    MEDIUM: "badge-warning",
    HARD: "badge-danger"
};
