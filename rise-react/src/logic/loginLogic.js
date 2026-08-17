// Login helpers — keeps Login.jsx easy to read

export function ensureDemoUser() {
  if (!localStorage.getItem("rise_user")) {
    localStorage.setItem("rise_user", JSON.stringify({
      name: "Demo Trader", email: "demo@rise.com", pass: "demo1234",
    }));
  }
}

export function tryLogin(email, pass) {
  email = email.trim();
  pass = pass.trim();
  if (!email) return { ok: false, email: "Email is required" };
  if (!pass) return { ok: false, pass: "Password is required" };

  const saved = JSON.parse(localStorage.getItem("rise_user"));
  if (!saved || saved.email !== email || saved.pass !== pass) {
    return { ok: false, pass: "Invalid email or password" };
  }
  localStorage.setItem("rise_loggedIn", "true");
  return { ok: true };
}

export function trySignup(name, email, pass, confirm) {
  name = name.trim();
  email = email.trim();
  if (!name) return { ok: false, name: "Full name is required" };
  if (!email) return { ok: false, email: "Email is required" };
  if (!pass) return { ok: false, pass: "Password is required" };
  if (pass.length < 8) return { ok: false, pass: "At least 8 characters" };
  if (pass !== confirm) return { ok: false, confirm: "Passwords do not match" };

  localStorage.setItem("rise_user", JSON.stringify({ name, email, pass }));
  localStorage.setItem("rise_loggedIn", "true");
  return { ok: true };
}

export function demoLogin() {
  localStorage.setItem("rise_user", JSON.stringify({
    name: "Demo Trader", email: "demo@rise.com", pass: "demo1234",
  }));
  localStorage.setItem("rise_loggedIn", "true");
}
