const API_BASE_URL = "http://localhost:8080/api";

/* ---------------- TOKEN ---------------- */

function getToken() {
    return localStorage.getItem("token");
}

function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + getToken()
    };
}

/* ---------------- API CALL ---------------- */

async function apiRequest(
    endpoint,
    method = "GET",
    body = null
) {

    const config = {
        method,
        headers: getAuthHeaders()
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {

        showLoader();

        const response = await fetch(
            `${API_BASE_URL}${endpoint}`,
            config
        );

        const contentType =
            response.headers.get("content-type");

        let data = null;

        if (
            contentType &&
            contentType.includes("application/json")
        ) {
            data = await response.json();
        }

        hideLoader();

        if (!response.ok) {

            if (response.status === 401) {

                logout();

                return null;
            }

            throw new Error(
                data?.message ||
                "Request Failed"
            );
        }

        return data;

    } catch (error) {

        hideLoader();

        console.error(error);

        showToast(
            error.message,
            "error"
        );

        return null;
    }
}

/* ---------------- TOAST ---------------- */

function showToast(
    message,
    type = "success"
) {

    const toast = document.createElement("div");

    toast.className = `toast ${type}`;

    toast.innerHTML = `
        <div>
            ${message}
        </div>
    `;

    document.body.appendChild(toast);

    setTimeout(() => {

        toast.remove();

    }, 3000);
}

/* ---------------- LOADER ---------------- */

function showLoader() {

    let loader =
        document.getElementById("globalLoader");

    if (!loader) {

        loader =
            document.createElement("div");

        loader.id = "globalLoader";

        loader.innerHTML = `
            <div class="loader-spinner"></div>
        `;

        loader.style.position = "fixed";
        loader.style.top = "0";
        loader.style.left = "0";
        loader.style.width = "100%";
        loader.style.height = "100%";
        loader.style.background =
            "rgba(0,0,0,0.5)";
        loader.style.display = "flex";
        loader.style.alignItems =
            "center";
        loader.style.justifyContent =
            "center";
        loader.style.zIndex = "9999";

        document.body.appendChild(loader);
    }

    loader.style.display = "flex";
}

function hideLoader() {

    const loader =
        document.getElementById("globalLoader");

    if (loader) {
        loader.style.display = "none";
    }
}

/* ---------------- USER ---------------- */

function getCurrentUser() {

    const user =
        localStorage.getItem("user");

    if (!user) {
        return null;
    }

    return JSON.parse(user);
}

function loadCurrentUser() {

    const user = getCurrentUser();

    if (!user) return;

    const username =
        document.getElementById("username");

    if (username) {
        username.innerText =
            user.name || "Student";
    }
}

/* ---------------- LOGOUT ---------------- */

function logout() {

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    showToast(
        "Logged Out Successfully"
    );

    setTimeout(() => {

        window.location.href =
            "login.html";

    }, 1000);
}

/* ---------------- PROFILE ---------------- */

async function loadProfile() {

    const data =
        await apiRequest(
            "/users/profile"
        );

    if (!data) return;

    setValue("name", data.name);
    setValue("email", data.email);
    setValue("usn", data.usn);
}

async function updateProfile() {

    const body = {
        name:
            document.getElementById("name")
                ?.value,
        email:
            document.getElementById("email")
                ?.value,
        usn:
            document.getElementById("usn")
                ?.value
    };

    const response =
        await apiRequest(
            "/users/profile",
            "PUT",
            body
        );

    if (response) {

        showToast(
            "Profile Updated"
        );
    }
}

/* ---------------- HELPERS ---------------- */

function setValue(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {
        element.value = value || "";
    }
}

function setText(
    id,
    value
) {

    const element =
        document.getElementById(id);

    if (element) {
        element.innerText = value;
    }
}

/* ---------------- PAGE LOAD ---------------- */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadCurrentUser();
    }
);