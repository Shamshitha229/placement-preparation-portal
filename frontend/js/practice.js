/**
 * Practice Page — Placement Preparation Portal
 */

let questions          = [];
let currentQuestionIndex = 0;
let selectedAnswer     = null;
let answeredQuestions  = {};  // track which have been answered
let score              = 0;
let currentCategory    = "";

// =======================================================
// PAGE LOAD
// =======================================================

document.addEventListener("DOMContentLoaded", () => {

    // Auth guard
    if (!isLoggedIn()) {
        if (typeof showToast === "function") {
            showToast("Please login first.", "warning");
        }
        setTimeout(() => { window.location.href = "login.html"; }, 600);
        return;
    }

    // Init navbar user
    if (typeof initNavUser === "function") {
        initNavUser("navUser");
    }

    // 🔑 FIX: Read ?category= URL parameter and auto-select dropdown
    const params = new URLSearchParams(window.location.search);
    const presetCategory = params.get("category");
    if (presetCategory) {
        const sel = document.getElementById("categorySelect");
        if (sel) {
            sel.value = presetCategory;
            // Auto-start if a category is preset from the URL
            startPractice();
        }
    }
});

// =======================================================
// START PRACTICE
// =======================================================

async function startPractice() {
    const sel = document.getElementById("categorySelect");
    currentCategory = sel ? sel.value : "";

    if (!currentCategory) {
        if (typeof showToast === "function") {
            showToast("Please select a category first.", "warning");
        } else {
            alert("Please select a category.");
        }
        return;
    }

    const btn = document.getElementById("startPracticeBtn");
    if (btn) { btn.disabled = true; btn.textContent = "Loading…"; }

    await loadQuestions(currentCategory);

    if (btn) { btn.disabled = false; btn.textContent = "🚀 Start Practice"; }
}

// =======================================================
// LOAD QUESTIONS FROM BACKEND
// =======================================================

async function loadQuestions(category) {
    try {
        const token = localStorage.getItem("token");
        const response = await fetch(
            `${API_BASE_URL}/questions?category=${encodeURIComponent(category)}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + token
                }
            }
        );

        if (!response.ok) throw new Error("Unable to load questions");

        questions = await response.json();

        if (!questions || questions.length === 0) {
            if (typeof showToast === "function") {
                showToast("No questions found for this category.", "warning");
            } else {
                alert("No questions found.");
            }
            return;
        }

        currentQuestionIndex = 0;
        score                = 0;
        selectedAnswer       = null;
        answeredQuestions    = {};

        // Hide practice-selection card, show question card
        const practiceCard = document.querySelector(".practice-card");
        if (practiceCard) practiceCard.style.display = "none";

        const qCard = document.getElementById("questionCard");
        if (qCard) qCard.style.display = "block";

        const rCard = document.getElementById("resultCard");
        if (rCard) rCard.style.display = "none";

        displayQuestion();

    } catch (error) {
        console.error("Load questions error:", error);
        if (typeof showToast === "function") {
            showToast("Unable to connect to server. Make sure the backend is running.", "error");
        } else {
            alert("Unable to connect to server.");
        }
    }
}

// =======================================================
// DISPLAY QUESTION
// =======================================================

function displayQuestion() {
    const question = questions[currentQuestionIndex];
    if (!question) return;

    const numEl = document.getElementById("questionNumber");
    if (numEl) numEl.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;

    const textEl = document.getElementById("questionText");
    if (textEl) textEl.textContent = question.questionText;

    // Set option text safely (textContent prevents XSS)
    ["A","B","C","D"].forEach(letter => {
        const el = document.getElementById("option" + letter);
        if (el) el.textContent = question["option" + letter] || "";
    });

    selectedAnswer = answeredQuestions[question.id] || null;

    clearSelection();
    if (selectedAnswer) {
        const optEl = document.getElementById("option-" + selectedAnswer);
        if (optEl) optEl.classList.add("selected");
    }

    // Hide explanation when loading a new question
    const expEl = document.getElementById("explanation");
    if (expEl) expEl.style.display = "none";
}

// =======================================================
// OPTION SELECTION
// =======================================================

function selectOption(option) {
    selectedAnswer = option;
    clearSelection();
    const el = document.getElementById("option-" + option);
    if (el) el.classList.add("selected");
}

function clearSelection() {
    ["A","B","C","D"].forEach(letter => {
        const el = document.getElementById("option-" + letter);
        if (el) el.classList.remove("selected", "correct", "wrong");
    });
}

// =======================================================
// SUBMIT ANSWER
// =======================================================

async function submitAnswer() {
    if (!selectedAnswer) {
        if (typeof showToast === "function") {
            showToast("Please select an option first.", "warning");
        } else {
            alert("Please select an option.");
        }
        return;
    }

    const question  = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === question.correctOption;

    // Track answered so re-visiting shows correct state
    answeredQuestions[question.id] = selectedAnswer;

    if (isCorrect) score++;

    // Save progress to backend (fire and forget)
    try {
        const token = localStorage.getItem("token");
        fetch(`${API_BASE_URL}/progress`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({
                questionId:     question.id,
                selectedOption: selectedAnswer
            })
        });
    } catch (e) {
        console.log("Progress save failed (non-critical):", e);
    }

    showExplanation(isCorrect, question.correctOption, question.explanation);
}

// =======================================================
// SHOW EXPLANATION
// =======================================================

function showExplanation(correct, correctAnswer, explanation) {
    const box = document.getElementById("explanation");
    if (!box) return;

    // Highlight correct/wrong options
    ["A","B","C","D"].forEach(letter => {
        const el = document.getElementById("option-" + letter);
        if (!el) return;
        if (letter === correctAnswer) {
            el.classList.add("correct");
        } else if (letter === selectedAnswer && !correct) {
            el.classList.add("wrong");
        }
    });

    const resultIcon = correct ? "✅" : "❌";
    const resultText = correct ? "Correct!" : "Incorrect";
    const resultColor = correct ? "var(--success)" : "var(--danger)";

    // Use textContent to build the explanation safely
    box.style.display  = "block";
    box.style.padding  = "1rem 1.25rem";
    box.style.borderLeft = `4px solid ${resultColor}`;
    box.style.background = correct ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)";
    box.style.borderRadius = "var(--radius-sm)";

    let html = `<p style="font-weight:700; color:${resultColor}; margin-bottom:0.5rem;">${resultIcon} ${resultText} — Correct answer: <strong>${correctAnswer}</strong></p>`;
    if (explanation && explanation.trim()) {
        // Use esc() for XSS-safe rendering
        html += `<p style="font-size:0.875rem; color:var(--text-muted);">💡 ${esc(explanation)}</p>`;
    }
    box.innerHTML = html;
}

// =======================================================
// NEXT QUESTION (does NOT require answer — allows skipping)
// =======================================================

function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex >= questions.length) {
        finishPractice();
        return;
    }

    displayQuestion();
}

// =======================================================
// BOOKMARK QUESTION
// =======================================================

async function bookmarkQuestion() {
    const question = questions[currentQuestionIndex];
    if (!question) return;

    try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${API_BASE_URL}/bookmarks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            },
            body: JSON.stringify({ questionId: question.id })
        });

        if (response.ok) {
            if (typeof showToast === "function") {
                showToast("Question bookmarked! 🔖", "success");
            } else {
                alert("Question bookmarked.");
            }
        } else {
            const data = await response.json().catch(() => ({}));
            const msg = (data && data.message) ? data.message : "Already bookmarked or bookmark failed.";
            if (typeof showToast === "function") {
                showToast(msg, "warning");
            } else {
                alert(msg);
            }
        }
    } catch (error) {
        console.log("Bookmark error:", error);
        if (typeof showToast === "function") {
            showToast("Unable to bookmark. Check connection.", "error");
        } else {
            alert("Unable to bookmark.");
        }
    }
}

// =======================================================
// FINISH PRACTICE
// =======================================================

function finishPractice() {
    const qCard = document.getElementById("questionCard");
    if (qCard) qCard.style.display = "none";

    const rCard = document.getElementById("resultCard");
    if (rCard) rCard.style.display = "block";

    const total      = questions.length;
    const answered   = Object.keys(answeredQuestions).length;
    const percentage = answered > 0 ? ((score / answered) * 100).toFixed(1) : 0;

    let performance = "";
    if (percentage >= 90)      performance = "🌟 Excellent!";
    else if (percentage >= 75) performance = "👍 Very Good!";
    else if (percentage >= 60) performance = "🙂 Good";
    else                       performance = "📚 Keep Practicing";

    const finalEl = document.getElementById("finalScore");
    if (finalEl) {
        finalEl.innerHTML = `
            <div style="margin-bottom:1rem;">
                <div style="font-size:3rem; font-weight:800; color:var(--primary-light);">${percentage}%</div>
                <div style="font-size:1.2rem; margin-top:0.5rem;">${performance}</div>
            </div>
            <div style="display:flex; gap:2rem; justify-content:center; flex-wrap:wrap; margin-top:1rem;">
                <div style="text-align:center;">
                    <div style="font-size:1.5rem; font-weight:700; color:var(--success);">${score}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">Correct</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:1.5rem; font-weight:700; color:var(--danger);">${answered - score}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">Wrong</div>
                </div>
                <div style="text-align:center;">
                    <div style="font-size:1.5rem; font-weight:700; color:var(--text-muted);">${total - answered}</div>
                    <div style="font-size:0.8rem; color:var(--text-muted);">Skipped</div>
                </div>
            </div>
            <p style="margin-top:1.25rem; color:var(--text-muted); font-size:0.875rem;">
                Category: <strong style="color:var(--text);">${currentCategory.replace(/_/g," ")}</strong>
            </p>
        `;
    }
}

// =======================================================
// RESTART
// =======================================================

function restartPractice() {
    currentQuestionIndex = 0;
    score                = 0;
    selectedAnswer       = null;
    answeredQuestions    = {};

    const rCard = document.getElementById("resultCard");
    if (rCard) rCard.style.display = "none";

    const practiceCard = document.querySelector(".practice-card");
    if (practiceCard) practiceCard.style.display = "";

    const qCard = document.getElementById("questionCard");
    if (qCard) qCard.style.display = "none";
}

// =======================================================
// LOGOUT (fallback if api.js not loaded)
// =======================================================

function logout() {
    if (typeof Auth !== "undefined" && typeof Auth.logout === "function") {
        Auth.logout();
    } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    }
}