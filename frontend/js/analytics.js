/**
 * Analytics Page — Placement Preparation Portal
 */

document.addEventListener("DOMContentLoaded", () => {

    // Auth guard
    if (typeof requireAuth === "function") {
        if (!requireAuth()) return;
    } else if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    if (typeof initNavUser === "function") {
        initNavUser("navUser");
    }

    loadAnalytics();
});

const CAT_META = {
    APTITUDE:          { label: "🧮 Aptitude",          color: "#6366F1" },
    LOGICAL_REASONING: { label: "🧩 Logical Reasoning",  color: "#F59E0B" },
    VERBAL_ABILITY:    { label: "📝 Verbal Ability",     color: "#22C55E" },
    TECHNICAL:         { label: "💻 Technical",          color: "#06B6D4" },
    CODING:            { label: "⌨️ Coding",             color: "#EF4444" }
};

async function loadAnalytics() {
    try {
        // Use apiFetch from api.js (no need for duplicate getAuthHeaders)
        const data = await apiFetch("/dashboard");

        // --- Summary table ---
        setEl("totalAttempted", data.totalAttempted    || 0);
        setEl("correctAnswers", data.correctAnswers     || 0);
        setEl("wrongAnswers",   data.wrongAnswers       || 0);
        setEl("accuracy",       (data.accuracy || 0) + "%");
        setEl("bookmarks",      data.bookmarkedQuestions || 0);
        setEl("mockTests",      data.mockTestsCompleted  || 0);

        // --- Category breakdown ---
        renderCategoryBars(data.categoryStats);

        // --- Performance tips ---
        renderTips(data);

    } catch (error) {
        console.error("Analytics load error:", error);
        if (typeof showToast === "function") {
            showToast("Unable to load analytics. Please try again.", "error");
        }
    }
}

/* ---- Category Progress Bars ---- */
/* ---- Category Performance Cards ---- */
function renderCategoryBars(categoryStats) {
    const container = document.getElementById("categoryBars");
    if (!container) return;

    if (!categoryStats || Object.keys(categoryStats).length === 0) {
        container.innerHTML = `
            <div class="analytics-empty-state">
                <div class="empty-icon">📚</div>
                <h3>No practice data yet</h3>
                <p>Start practicing to see your category-wise performance.</p>
                <a href="practice.html">Start Practicing →</a>
            </div>
        `;
        return;
    }

    let html = "";

    Object.entries(CAT_META).forEach(([cat, meta]) => {

        const stat = categoryStats[cat] || {
            total: 0,
            correct: 0,
            accuracy: 0
        };

        const total = stat.total || 0;
        const correct = stat.correct || 0;
        const wrong = Math.max(total - correct, 0);

        const pct = stat.accuracy !== undefined
            ? Number(stat.accuracy)
            : (total > 0
                ? Math.round((correct / total) * 100)
                : 0);

        let status = "Not Attempted";
        let statusClass = "not-attempted";

        if (total > 0) {
            if (pct >= 70) {
                status = "Strong";
                statusClass = "strong";
            } else if (pct >= 40) {
                status = "Needs Improvement";
                statusClass = "average";
            } else {
                status = "Needs Practice";
                statusClass = "weak";
            }
        }

        html += `
            <div class="category-performance-card">

                <div class="category-card-top">
                    <div class="category-name">
                        ${meta.label}
                    </div>

                    <span class="category-status ${statusClass}">
                        ${status}
                    </span>
                </div>

                <div class="category-accuracy">
                    <span>${pct}%</span>
                    <small>Accuracy</small>
                </div>

                <div class="category-progress">
                    <div class="category-progress-fill"
                         style="width:${pct}%; background:${meta.color};">
                    </div>
                </div>

                <div class="category-stats">
                    <div>
                        <strong>${total}</strong>
                        <span>Attempted</span>
                    </div>

                    <div>
                        <strong>${correct}</strong>
                        <span>Correct</span>
                    </div>

                    <div>
                        <strong>${wrong}</strong>
                        <span>Wrong</span>
                    </div>
                </div>

            </div>
        `;
    });

    container.innerHTML = html;
}

/* ---- Dynamic Performance Tips ---- */
function renderTips(data) {
    const container = document.getElementById("performanceTips");
    if (!container) return;

    const tips = [];

    if (!data || data.totalAttempted === 0) {
        tips.push("🚀 Start practicing today — every question brings you closer to your dream job.");
        tips.push("📚 Try different categories to find where you need the most improvement.");
    } else {
        if ((data.accuracy || 0) < 50) {
            tips.push("⚠️ Your accuracy is below 50%. Focus on understanding concepts, not just memorizing answers.");
        } else if ((data.accuracy || 0) >= 80) {
            tips.push("🌟 Great accuracy! Try harder difficulty questions to push your limits.");
        }

        if (data.mockTestsCompleted === 0) {
            tips.push("⏱️ You haven't taken a mock test yet. Mock tests simulate real placement conditions — try one!");
        } else if (data.mockTestsCompleted > 0) {
            tips.push(`✅ You've completed ${data.mockTestsCompleted} mock test${data.mockTestsCompleted > 1 ? "s" : ""}. Keep up the consistent practice!`);
        }

        if (data.bookmarkedQuestions > 0) {
            tips.push(`🔖 You have ${data.bookmarkedQuestions} bookmarked questions — revisit them regularly to reinforce weak areas.`);
        }

        // Category-specific tips
        if (data.categoryStats) {
            const weak = Object.entries(data.categoryStats)
                .filter(([, s]) => s.total > 0 && (s.accuracy || 0) < 50)
                .map(([cat]) => cat.replace(/_/g, " "));

            if (weak.length > 0) {
                tips.push(`📉 Focus more on: <strong>${weak.join(", ")}</strong> — your accuracy is low there.`);
            }
        }
    }

    // Always add general tips
    tips.push("🗓️ Consistent daily practice of 20-30 questions is more effective than cramming.");
    tips.push("💡 After answering wrong, read the explanation carefully — that's where real learning happens.");

    container.innerHTML = tips.map(t => `
        <div style="display:flex; align-items:flex-start; gap:0.75rem; padding:0.75rem; background:var(--dark-3); border-radius:var(--radius-sm); font-size:0.875rem;">
            <span>${t}</span>
        </div>
    `).join("");
}

/* ---- Utility ---- */
function setEl(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// Logout fallback
function logout() {
    if (typeof Auth !== "undefined" && Auth.logout) {
        Auth.logout();
    } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    }
}