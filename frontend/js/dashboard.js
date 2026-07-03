
/* ---------------- LOAD DASHBOARD ---------------- */

document.addEventListener("DOMContentLoaded", () => {
    if (typeof checkAuthentication === "function") {
        checkAuthentication();
    }

    loadDashboard();
    loadProfileInfo();
});

/* ---------------- AUTH HEADER ---------------- */

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
    };
}

/* ---------------- DASHBOARD DATA ---------------- */

async function loadDashboard() {

    try {

        const response = await fetch(
            `${API_BASE_URL}/dashboard`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load dashboard");
        }

        const data = await response.json();

        updateDashboardCards(data);

    } catch (error) {

        console.error(error);

        loadDummyDashboard();

    }
}

/* ---------------- UPDATE UI ---------------- */

function updateDashboardCards(data) {

    setElementText("totalAttempted", data.totalAttempted || 0);
    setElementText("correctAnswers", data.correctAnswers || 0);
    setElementText("accuracy", `${data.accuracy || 0}%`);
    setElementText("bookmarked", data.bookmarkedQuestions || 0);
    setElementText("mockTests", data.mockTestsCompleted || 0);
}

/* ---------------- FALLBACK DATA ---------------- */

function loadDummyDashboard() {

    setElementText("totalQuestions", 120);
    setElementText("correctAnswers", 92);
    setElementText("accuracy", "77%");
    setElementText("bookmarks", 18);
    setElementText("mockTests", 6);
}

/* ---------------- PROFILE INFO ---------------- */

function loadProfileInfo() {

    const user = JSON.parse(
        localStorage.getItem("user") || "{}"
    );

    if (user.name) {
        setElementText("userName", user.name);
    }

    if (user.email) {
        setElementText("studentEmail", user.email);
    }
}

/* ---------------- HELPERS ---------------- */

function setElementText(id, value) {

    const element = document.getElementById(id);

    if (element) {
        element.innerText = value;
    }
}

/* ---------------- QUICK ACTIONS ---------------- */

function goToPractice() {
    window.location.href = "practice.html";
}

function goToBookmarks() {
    window.location.href = "bookmarks.html";
}

function goToAnalytics() {
    window.location.href = "analytics.html";
}

function goToMockTest() {
    window.location.href = "mocktest.html";
}