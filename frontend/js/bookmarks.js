/**
 * Bookmarks Page — Placement Preparation Portal
 */

document.addEventListener("DOMContentLoaded", () => {
    // Use api.js Auth if available, else fallback
    if (typeof checkAuthentication === "function") {
        checkAuthentication();
    } else if (typeof requireAuth === "function") {
        requireAuth();
    }

    if (typeof initNavUser === "function") {
        initNavUser("navUser");
    }

    loadBookmarks();
});

async function loadBookmarks() {
    const container = document.getElementById("bookmarkList");
    if (!container) return;

    container.innerHTML = '<div class="spinner"></div>';

    try {
        const bookmarks = await apiFetch("/bookmarks");

        if (!bookmarks || bookmarks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="icon">🔖</div>
                    <h3>No Bookmarks Yet</h3>
                    <p>Start practicing and bookmark difficult questions for later revision.</p>
                    <a href="practice.html" class="btn btn-primary mt-2">
                        Start Practicing
                    </a>
                </div>
            `;
            return;
        }

        let html = '<div class="bookmark-grid">';

        bookmarks.forEach(q => {
            const catClass = (typeof CategoryColors !== "undefined" && CategoryColors[q.category]) || "badge-primary";
            const diffClass = (typeof DifficultyColors !== "undefined" && DifficultyColors[q.difficulty]) || "badge-secondary";
            const catLabel = q.category ? q.category.replace(/_/g, " ") : "";
            const diffLabel = q.difficulty || "";

            html += `
            <div class="bookmark-card" id="bm-${q.id}">

                <div class="bm-header">
                    <div style="display:flex; gap:0.5rem; flex-wrap:wrap; align-items:center;">
                        ${catLabel ? `<span class="badge ${catClass}">${esc(catLabel)}</span>` : ""}
                        ${diffLabel ? `<span class="badge ${diffClass}">${esc(diffLabel)}</span>` : ""}
                        ${q.company ? `<span class="badge badge-secondary" style="font-size:0.7rem;">${esc(q.company)}</span>` : ""}
                    </div>
                    <button class="remove-btn" onclick="removeBookmark(${q.id})" title="Remove Bookmark">✕</button>
                </div>

                <p class="bm-text"><strong>${esc(q.questionText)}</strong></p>

                <div class="bm-options">
                    <div class="${q.correctOption === 'A' ? 'correct-opt' : ''}">A. ${esc(q.optionA)}</div>
                    <div class="${q.correctOption === 'B' ? 'correct-opt' : ''}">B. ${esc(q.optionB)}</div>
                    <div class="${q.correctOption === 'C' ? 'correct-opt' : ''}">C. ${esc(q.optionC)}</div>
                    <div class="${q.correctOption === 'D' ? 'correct-opt' : ''}">D. ${esc(q.optionD)}</div>
                </div>

                <div style="margin-top:0.75rem; display:flex; align-items:center; gap:0.5rem;">
                    <span class="badge badge-success" style="font-size:0.8rem;">✅ Correct: ${esc(q.correctOption)}</span>
                </div>

                ${q.explanation ? `
                <div style="margin-top:0.75rem; padding:0.75rem; background:rgba(99,102,241,0.08); border-left:3px solid var(--primary); border-radius:8px; font-size:0.85rem; color:var(--text-muted);">
                    💡 <strong>Explanation:</strong> ${esc(q.explanation)}
                </div>` : ""}

            </div>
            `;
        });

        html += "</div>";
        container.innerHTML = html;

    } catch (e) {
        console.error(e);
        container.innerHTML = `
            <div class="empty-state">
                <div class="icon">⚠️</div>
                <p>Unable to load bookmarks. Please try again.</p>
                <button class="btn btn-outline mt-2" onclick="loadBookmarks()">Retry</button>
            </div>
        `;
    }
}

async function removeBookmark(questionId) {
    try {
        // Backend uses a toggle: POST /bookmarks with questionId removes it if already bookmarked
        await apiFetch("/bookmarks", {
            method: "POST",
            body: JSON.stringify({ questionId: questionId })
        });

        if (typeof showToast === "function") {
            showToast("Bookmark removed", "info");
        }

        // Animate out and reload
        const card = document.getElementById("bm-" + questionId);
        if (card) {
            card.style.transition = "all 0.3s ease";
            card.style.opacity = "0";
            card.style.transform = "translateX(20px)";
            setTimeout(() => loadBookmarks(), 350);
        } else {
            loadBookmarks();
        }
    } catch (e) {
        console.error(e);
        if (typeof showToast === "function") {
            showToast("Unable to remove bookmark. Please try again.", "error");
        } else {
            alert("Unable to remove bookmark.");
        }
    }
}