/**
 * Placement Preparation Portal — Dashboard Module
 */

document.addEventListener("DOMContentLoaded", () => {
    if (typeof checkAuthentication === "function") {
        checkAuthentication();
    } else if (typeof requireAuth === "function") {
        requireAuth();
    }

    if (typeof initNavUser === "function") {
        initNavUser("navUser");
    }

    loadProfileInfo();
    loadDashboard();
});

/* ---------------- PROFILE INFO ---------------- */

function loadProfileInfo() {
    try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        if (user && user.name) {
            const el = document.getElementById("userName");
            if (el) el.textContent = user.name;
        }
    } catch (e) {
        console.error("Profile info error:", e);
    }
}

/* ---------------- DASHBOARD DATA ---------------- */

async function loadDashboard() {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/dashboard`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        if (!response.ok) {
            throw new Error("Failed to load dashboard");
        }

        const data = await response.json();
        updateDashboardCards(data);
        renderCategoryProgress(data.categoryStats);
        renderRecentActivity(data);

    } catch (error) {
        console.error("Dashboard load error:", error);
        // Fallback to zeros gracefully
        updateDashboardCards({ totalAttempted: 0, correctAnswers: 0, accuracy: 0, bookmarkedQuestions: 0, mockTestsCompleted: 0 });
        renderCategoryProgress(null);
        renderRecentActivity(null);
    }
}

/* ---------------- UPDATE STAT CARDS ---------------- */

function updateDashboardCards(data) {
    setEl("totalAttempted",  data.totalAttempted     || 0);
    setEl("correctAnswers",  data.correctAnswers      || 0);
    setEl("accuracy",        (data.accuracy           || 0) + "%");
    setEl("bookmarked",      data.bookmarkedQuestions || 0);
    setEl("mockTests",       data.mockTestsCompleted  || 0);
}

/* ---------------- CATEGORY PROGRESS BARS ---------------- */

const CAT_LABELS = {
    APTITUDE:         { label: "🧮 Aptitude",         color: "var(--primary)" },
    LOGICAL_REASONING:{ label: "🧩 Logical Reasoning", color: "var(--warning)" },
    VERBAL_ABILITY:   { label: "📝 Verbal Ability",    color: "var(--success)" },
    TECHNICAL:        { label: "💻 Technical",         color: "#06b6d4" },
    CODING:           { label: "⌨️ Coding",            color: "var(--danger)"  }
};

function renderCategoryProgress(categoryStats) {
    const container = document.getElementById("categoryProgress");
    if (!container) return;

    if (!categoryStats || Object.keys(categoryStats).length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted" style="padding:1rem; font-size:0.875rem;">
                No practice data yet. <a href="practice.html" style="color:var(--primary-light)">Start practicing →</a>
            </div>`;
        return;
    }

    let html = "";
    Object.entries(categoryStats).forEach(([cat, stat]) => {
        const info  = CAT_LABELS[cat] || { label: cat.replace(/_/g," "), color: "var(--primary)" };
        const pct   = stat.accuracy !== undefined ? stat.accuracy : (stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0);
        const color = pct >= 70 ? "var(--success)" : pct >= 40 ? "var(--warning)" : "var(--danger)";
        html += `
        <div class="cat-row">
            <div class="cat-row-header">
                <span>${info.label}</span>
                <span>${stat.correct || 0} / ${stat.total || 0} &nbsp;|&nbsp; <strong style="color:${color}">${pct}%</strong></span>
            </div>
            <div style="background:var(--dark-3); border-radius:999px; height:8px; overflow:hidden;">
                <div style="height:100%; border-radius:999px; background:${info.color};
                            width:${pct}%; transition:width 0.8s ease;"></div>
            </div>
        </div>`;
    });

    container.innerHTML = html;
}

/* ---------------- RECENT ACTIVITY ---------------- */

function renderRecentActivity(data) {
    const container = document.getElementById("recentActivity");
    if (!container) return;

    // Build activity from available data
    const items = [];

    if (data && data.totalAttempted > 0) {
        items.push({
            dot: "var(--primary)",
            text: `Practiced ${data.totalAttempted} question${data.totalAttempted !== 1 ? "s" : ""} total`
        });
    }
    if (data && data.mockTestsCompleted > 0) {
        items.push({
            dot: "var(--secondary)",
            text: `Completed ${data.mockTestsCompleted} mock test${data.mockTestsCompleted !== 1 ? "s" : ""}`
        });
    }
    if (data && data.bookmarkedQuestions > 0) {
        items.push({
            dot: "var(--warning)",
            text: `${data.bookmarkedQuestions} question${data.bookmarkedQuestions !== 1 ? "s" : ""} bookmarked for review`
        });
    }
    if (data && data.correctAnswers > 0) {
        items.push({
            dot: "var(--success)",
            text: `${data.correctAnswers} correct answer${data.correctAnswers !== 1 ? "s" : ""} (${data.accuracy || 0}% accuracy)`
        });
    }

    if (items.length === 0) {
        container.innerHTML = `
            <div class="text-center text-muted" style="padding:1rem; font-size:0.875rem;">
                No activity yet. <a href="practice.html" style="color:var(--primary-light)">Start practicing →</a>
            </div>`;
        return;
    }

    container.innerHTML = items.map(item => `
        <div class="activity-item">
            <div class="activity-dot" style="background:${item.dot}"></div>
            <span>${item.text}</span>
        </div>
    `).join("");
}

/* ---------------- HELPERS ---------------- */

function setEl(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

/* ---------------- QUICK NAVIGATION (used by onclick in HTML) ---------------- */

function goToPractice()  { window.location.href = "practice.html";  }
function goToBookmarks() { window.location.href = "bookmarks.html"; }
function goToAnalytics() { window.location.href = "analytics.html"; }
function goToMockTest()  { window.location.href = "mocktest.html";  }