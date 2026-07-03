// =======================================================
// PRACTICE.JS - PART 1
// =======================================================

let questions = [];
let currentQuestionIndex = 0;
let selectedAnswer = null;
let score = 0;
let currentCategory = "";

// =======================================================
// PAGE LOAD
// =======================================================

document.addEventListener("DOMContentLoaded", () => {

    if (!isLoggedIn()) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

});

// =======================================================
// AUTH HEADER
// =======================================================

function getAuthHeaders() {

    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("token")
    };

}

// =======================================================
// START PRACTICE
// =======================================================

async function startPractice() {

    currentCategory =
        document.getElementById("categorySelect").value;

    if (currentCategory === "") {

        alert("Please select a category.");

        return;
    }

    await loadQuestions(currentCategory);

}

// =======================================================
// LOAD QUESTIONS FROM SPRING BOOT
// =======================================================

async function loadQuestions(category) {

    try {

        const response = await fetch(

            `${API_BASE_URL}/questions?category=${category}`,

            {
                method: "GET",
                headers: getAuthHeaders()
            }

        );

        if (!response.ok) {

            throw new Error("Unable to load questions");

        }

        questions = await response.json();

        if (questions.length === 0) {

            alert("No questions found.");

            return;
        }

        currentQuestionIndex = 0;
        score = 0;
        selectedAnswer = null;

        document.getElementById("questionCard").style.display =
            "block";

        document.getElementById("resultCard").style.display =
            "none";

        displayQuestion();

    }

    catch (error) {

        console.error(error);

        alert("Unable to connect to server.");

    }

}

// =======================================================
// DISPLAY QUESTION
// =======================================================

function displayQuestion() {

    const question =
        questions[currentQuestionIndex];

    if (!question) return;

    document.getElementById("questionNumber").innerText =
        "Question " +
        (currentQuestionIndex + 1) +
        " of " +
        questions.length;

    document.getElementById("questionText").innerText =
        question.questionText;

    document.getElementById("optionA").innerText =
        question.optionA;

    document.getElementById("optionB").innerText =
        question.optionB;

    document.getElementById("optionC").innerText =
        question.optionC;

    document.getElementById("optionD").innerText =
        question.optionD;

    selectedAnswer = null;

    clearSelection();

    document.getElementById("explanation").style.display =
        "none";

}

// =======================================================
// OPTION SELECTION
// =======================================================

function selectOption(option) {

    selectedAnswer = option;

    clearSelection();

    document
        .getElementById("option-" + option)
        .classList.add("selected");

}

function clearSelection() {

    ["A","B","C","D"].forEach(letter => {

        document
            .getElementById("option-" + letter)
            .classList.remove("selected");

    });

}
// =======================================================
// SUBMIT ANSWER
// =======================================================

async function submitAnswer() {

    if (selectedAnswer == null) {

        alert("Please select an option.");

        return;

    }

    const question = questions[currentQuestionIndex];

    const isCorrect =
        selectedAnswer === question.correctOption;

    if (isCorrect) {
        score++;
    }

    try {

        await fetch(

            `${API_BASE_URL}/progress`,

            {
                method: "POST",

                headers: getAuthHeaders(),

                body: JSON.stringify({

                    questionId: question.id,

                    selectedOption: selectedAnswer

                })

            }

        );

    }

    catch (error) {

        console.log("Progress not saved.");

    }

    showExplanation(
        isCorrect,
        question.correctOption,
        question.explanation
    );

}

// =======================================================
// SHOW EXPLANATION
// =======================================================

function showExplanation(

    correct,

    correctAnswer,

    explanation

) {

    const box =
        document.getElementById("explanation");

    box.style.display = "block";

    box.innerHTML = `

        <h3>

            ${correct ? "✅ Correct Answer" : "❌ Wrong Answer"}

        </h3>

        <br>

        <p>

            <strong>Correct Option :</strong>

            ${correctAnswer}

        </p>

        <br>

        <p>

            ${explanation}

        </p>

    `;

}

// =======================================================
// BOOKMARK QUESTION
// =======================================================

async function bookmarkQuestion() {

    const question =
        questions[currentQuestionIndex];

    try {

        const response = await fetch(

            `${API_BASE_URL}/bookmarks`,

            {

                method: "POST",

                headers: getAuthHeaders(),

                body: JSON.stringify({

                    questionId: question.id

                })

            }

        );

        if (response.ok) {

            alert("Question bookmarked.");

        }

        else {

            alert("Bookmark failed.");

        }

    }

    catch (error) {

        console.log(error);

        alert("Unable to bookmark.");

    }

}
// =======================================================
// NEXT QUESTION
// =======================================================

function nextQuestion() {

    if (selectedAnswer == null) {

        alert("Please submit your answer first.");

        return;

    }

    currentQuestionIndex++;

    if (currentQuestionIndex >= questions.length) {

        finishPractice();

        return;
    }

    displayQuestion();

}

// =======================================================
// PREVIOUS QUESTION (OPTIONAL)
// =======================================================

function previousQuestion() {

    if (currentQuestionIndex === 0)
        return;

    currentQuestionIndex--;

    displayQuestion();

}

// =======================================================
// FINISH PRACTICE
// =======================================================

function finishPractice() {

    document.getElementById("questionCard").style.display =
        "none";

    document.getElementById("resultCard").style.display =
        "block";

    const total = questions.length;

    const percentage =
        ((score / total) * 100).toFixed(2);

    let performance = "";

    if (percentage >= 90) {

        performance = "🌟 Excellent";

    }
    else if (percentage >= 75) {

        performance = "👍 Very Good";

    }
    else if (percentage >= 60) {

        performance = "🙂 Good";

    }
    else {

        performance = "📚 Needs Improvement";

    }

    document.getElementById("finalScore").innerHTML =

        `
        <h2>${performance}</h2>

        <br>

        <h3>
            Score : ${score} / ${total}
        </h3>

        <h3>
            Accuracy : ${percentage}%
        </h3>

        <br>

        <p>
            Category :
            <strong>${currentCategory.replaceAll("_"," ")}</strong>
        </p>

        <br>

        <button onclick="restartPractice()">
            Practice Again
        </button>

        <button onclick="window.location='dashboard.html'">
            Dashboard
        </button>
        `;

}

// =======================================================
// RESTART
// =======================================================

function restartPractice() {

    currentQuestionIndex = 0;

    score = 0;

    selectedAnswer = null;

    document.getElementById("resultCard").style.display =
        "none";

    document.getElementById("questionCard").style.display =
        "none";

}

// =======================================================
// LOGOUT
// =======================================================

function logout() {

    localStorage.removeItem("token");

    localStorage.removeItem("user");

    window.location.href = "login.html";

}