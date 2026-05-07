

function switchTab(tab) {
    const loginTab = document.getElementById("tab-login");
    const registerTab = document.getElementById("tab-register");
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");

    if (tab === "login") {
        loginTab.classList.add("active");
        registerTab.classList.remove("active");
        loginForm.style.display = "block";
        registerForm.style.display = "none";
    } else {
        registerTab.classList.add("active");
        loginTab.classList.remove("active");
        registerForm.style.display = "block";
        loginForm.style.display = "none";
    }
}

function togglePass(inputId, iconId) {
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);

    if (input.type === "password") {
        input.type = "text";
        icon.className = "bi bi-eye-slash field-icon-right";
    } else {
        input.type = "password";
        icon.className = "bi bi-eye field-icon-right";
    }
}

function submitLogin() {
    const emailInput = document.getElementById("l-email");
    const passInput = document.getElementById("l-pass");
    const emailErr = document.getElementById("l-email-err");
    const passErr = document.getElementById("l-pass-err");

    emailErr.classList.remove("visible");
    passErr.classList.remove("visible");

    const email = emailInput.value.trim();
    const pass = passInput.value.trim();

    if (!email) {
        emailErr.querySelector("span").textContent = "Email is required";
        emailErr.classList.add("visible");
        return;
    }

    if (!pass) {
        passErr.querySelector("span").textContent = "Password is required";
        passErr.classList.add("visible");
        return;
    }

    const storedUser = JSON.parse(localStorage.getItem("rise_user"));
    if (!storedUser || storedUser.email !== email || storedUser.pass !== pass) {
        passErr.querySelector("span").textContent = "Invalid email or password";
        passErr.classList.add("visible");
        return;
    }

    localStorage.setItem("rise_loggedIn", "true");
    window.location.href = "welcome.html";
}

function submitRegister() {
    const nameInput = document.getElementById("r-name");
    const emailInput = document.getElementById("r-email");
    const passInput = document.getElementById("r-pass");
    const confirmInput = document.getElementById("r-confirm");

    const nameErr = document.getElementById("r-name-err");
    const emailErr = document.getElementById("r-email-err");
    const passErr = document.getElementById("r-pass-err");
    const confirmErr = document.getElementById("r-confirm-err");

    [nameErr, emailErr, passErr, confirmErr].forEach(el => el.classList.remove("visible"));

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const pass = passInput.value;
    const confirm = confirmInput.value;

    if (!name) {
        nameErr.querySelector("span").textContent = "Full name is required";
        nameErr.classList.add("visible");
        return;
    }

    if (!email) {
        emailErr.querySelector("span").textContent = "Email is required";
        emailErr.classList.add("visible");
        return;
    }

    if (!pass) {
        passErr.querySelector("span").textContent = "Password is required";
        passErr.classList.add("visible");
        return;
    }

    if (pass.length < 8) {
        passErr.querySelector("span").textContent = "At least 8 characters";
        passErr.classList.add("visible");
        return;
    }

    if (pass !== confirm) {
        confirmErr.querySelector("span").textContent = "Passwords do not match";
        confirmErr.classList.add("visible");
        return;
    }

    const newUser = { name, email, pass };
    localStorage.setItem("rise_user", JSON.stringify(newUser));
    localStorage.setItem("rise_loggedIn", "true");
    window.location.href = "welcome.html";
}

document.addEventListener("DOMContentLoaded", () => {
    const handleEnter = (e, callback) => {
        if (e.key === "Enter") callback();
    };

    ["l-email", "l-pass"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("keydown", e => handleEnter(e, submitLogin));
    });

    ["r-name", "r-email", "r-pass", "r-confirm"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener("keydown", e => handleEnter(e, submitRegister));
    });
});
