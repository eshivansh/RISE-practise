import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/loginpage.css";

export default function Login() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [name, setName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regError, setRegError] = useState("");

  useEffect(function () {
    if (!localStorage.getItem("rise_user")) {
      localStorage.setItem("rise_user", JSON.stringify({ name: "Demo Trader", email: "demo@rise.com", pass: "demo1234" }));
    }
  }, []);

  function handleLogin(event) {
    event.preventDefault();
    if (!email.trim()) { setLoginError("Email is required"); return; }
    if (!password.trim()) { setLoginError("Password is required"); return; }
    const user = JSON.parse(localStorage.getItem("rise_user"));
    if (user.email !== email.trim() || user.pass !== password.trim()) { setLoginError("Wrong email or password"); return; }
    localStorage.setItem("rise_loggedIn", "true");
    navigate("/welcome");
  }

  function handleRegister(event) {
    event.preventDefault();
    if (!name.trim()) { setRegError("Name is required"); return; }
    if (!regEmail.trim()) { setRegError("Email is required"); return; }
    if (regPass.length < 8) { setRegError("Password needs 8+ characters"); return; }
    localStorage.setItem("rise_user", JSON.stringify({ name: name.trim(), email: regEmail.trim(), pass: regPass }));
    localStorage.setItem("rise_loggedIn", "true");
    navigate("/welcome");
  }

  function useDemoAccount() {
    localStorage.setItem("rise_user", JSON.stringify({ name: "Demo Trader", email: "demo@rise.com", pass: "demo1234" }));
    localStorage.setItem("rise_loggedIn", "true");
    navigate("/welcome");
  }

  return (
    <div className="login-page">
      <header>
        <Link to="/" className="logo brand"><img src="/assets/image.png" alt="RISE logo" /><span>RISE</span></Link>
        <Link to="/" className="back-link">← Back to Home</Link>
      </header>

      <main>
        <section className="info-panel" aria-label="About RISE">
          <p className="eyebrow">Smart Trading</p>
          <h1>Your wealth <span>starts here</span></h1>
          <p>Practice with demo money. Learn charts, orders, and AI tips.</p>
          <ul className="feature-list">
            <li><strong>Live Charts</strong>See price moves in real time</li>
            <li><strong>Demo Cash</strong>Start with $100,000 practice money</li>
            <li><strong>AI Coach</strong>Ask questions while you learn</li>
          </ul>
        </section>

        <section className="form-panel" aria-label="Account access">
          <div className="tab-row" role="tablist">
            <button type="button" className={"tab-btn" + (tab === "login" ? " is-active" : "")} onClick={() => setTab("login")}>Sign In</button>
            <button type="button" className={"tab-btn" + (tab === "register" ? " is-active" : "")} onClick={() => setTab("register")}>Register</button>
          </div>

          {tab === "login" && (
            <form className="auth-form" onSubmit={handleLogin}>
              <h2>Welcome back</h2>
              <p className="hint">Demo: demo@rise.com / demo1234</p>
              <div className="form-field">
                <label htmlFor="login-email">Email</label>
                <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" />
              </div>
              <div className="form-field">
                <label htmlFor="login-pass">Password</label>
                <input id="login-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" />
              </div>
              {loginError && <p className="form-error" role="alert">{loginError}</p>}
              <button type="submit" className="submit-btn">Login</button>
              <button type="button" className="demo-btn" onClick={useDemoAccount}>Use Demo Account</button>
            </form>
          )}

          {tab === "register" && (
            <form className="auth-form" onSubmit={handleRegister}>
              <h2>Create account</h2>
              <p className="hint">All fields are required.</p>
              <div className="form-field">
                <label htmlFor="reg-name">Full name</label>
                <input id="reg-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="reg-email">Email</label>
                <input id="reg-email" type="email" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} />
              </div>
              <div className="form-field">
                <label htmlFor="reg-pass">Password</label>
                <input id="reg-pass" type="password" value={regPass} onChange={(e) => setRegPass(e.target.value)} />
              </div>
              {regError && <p className="form-error" role="alert">{regError}</p>}
              <button type="submit" className="submit-btn">Create Account</button>
            </form>
          )}
        </section>
      </main>

      <footer><small>Team CodeGeass® | © 2026 RISE — Educational demo only</small></footer>
    </div>
  );
}