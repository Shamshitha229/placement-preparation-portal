
document.addEventListener("DOMContentLoaded", () => {

    if (typeof checkAuthentication === "function") {
        checkAuthentication();
    }

    loadBookmarks();

});

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
    };
}

async function loadBookmarks() {

    const container = document.getElementById("bookmarkList");

    try {

        const response = await fetch(
            `${API_BASE_URL}/bookmarks`,
            {
                method: "GET",
                headers: getAuthHeaders()
            }
        );

        if (!response.ok) {
            throw new Error("Failed to load bookmarks");
        }

        const bookmarks = await response.json();

        if (bookmarks.length === 0) {

            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🔖</div>
                    <p>No bookmarked questions yet.</p>
                    <a href="practice.html" class="btn btn-primary mt-2">
                        Start Practicing
                    </a>
                </div>
            `;

            return;
        }

        let html = '<div class="bookmark-grid">';

        bookmarks.forEach(q => {

            html += `
            <div class="bookmark-card">

                <div class="bm-header">

                    <strong>${q.questionText}</strong>

                    <button class="remove-btn"
                            onclick="removeBookmark(${q.id})">
                        ✕
                    </button>

                </div>

                <div class="bm-options">

                    <div>A. ${q.optionA}</div>
                    <div>B. ${q.optionB}</div>
                    <div>C. ${q.optionC}</div>
                    <div>D. ${q.optionD}</div>

                </div>

                <br>

                <span class="badge badge-success">
                    Correct Answer : ${q.correctOption}
                </span>

            </div>
            `;

        });

        html += "</div>";

        container.innerHTML = html;

    }

    catch (e) {

        console.error(e);

        container.innerHTML =
            "<h3>Unable to load bookmarks.</h3>";

    }

}

async function removeBookmark(questionId) {

    try {

        const response = await fetch(
            `${API_BASE_URL}/bookmarks`,
            {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    questionId: questionId
                })
            }
        );

        if (!response.ok) {
            throw new Error();
        }

        loadBookmarks();

    }

    catch (e) {

        alert("Unable to remove bookmark");

    }

}