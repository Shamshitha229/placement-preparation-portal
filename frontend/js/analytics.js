
document.addEventListener("DOMContentLoaded", () => {

    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    loadAnalytics();

});

function getAuthHeaders() {

    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
    };

}

async function loadAnalytics() {

    try {

        const response = await fetch(
            API_BASE_URL + "/dashboard",
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error("Unable to load analytics");
        }

        const data = await response.json();

        document.getElementById("totalAttempted").innerText = data.totalAttempted;
        document.getElementById("correctAnswers").innerText = data.correctAnswers;
        document.getElementById("wrongAnswers").innerText = data.wrongAnswers;
        document.getElementById("accuracy").innerText = data.accuracy + "%";
        document.getElementById("bookmarks").innerText = data.bookmarkedQuestions;
        document.getElementById("mockTests").innerText = data.mockTestsCompleted;

        loadCategoryTable(data.categoryStats);

    } catch (error) {

        console.error(error);
        alert("Unable to load analytics.");

    }

}

function loadCategoryTable(categoryStats) {

    const tbody = document.getElementById("categoryTable");

    tbody.innerHTML = "";

    if (!categoryStats || Object.keys(categoryStats).length === 0) {

        tbody.innerHTML = `
            <tr>
                <td colspan="4">No Practice Data Available</td>
            </tr>
        `;

        return;

    }

    Object.keys(categoryStats).forEach(category => {

        const stat = categoryStats[category];

        tbody.innerHTML += `
            <tr>
                <td>${category.replaceAll("_", " ")}</td>
                <td>${stat.total}</td>
                <td>${stat.correct}</td>
                <td>${stat.accuracy}%</td>
            </tr>
        `;

    });

}

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.location.href = "login.html";

}