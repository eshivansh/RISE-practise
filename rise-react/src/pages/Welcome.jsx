import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { stocks, nameOf, basePriceOf, baseChangeOf } from "../data/stocks.js";
import useLocalStorage from "../hooks/useLocalStorage.js";
import { Sidebar } from "../components/Layout.jsx";
import "../styles/welcomepage.css";

const tips = [
  { icon: "💡", strong: "Start with focus.", text: " Pick one stock and open its chart before you trade." },
  { icon: "⚠️", strong: "Risk first.", text: " Never buy more shares than your cash allows." },
  { icon: "✅", strong: "Demo mode.", text: " You have a virtual $100,000 to practice with." },
];

export default function Welcome() {
  const goTo = useNavigate();
  const [user, setUser] = useState(null);
  const [cash] = useLocalStorage("rise_cash", 100000);
  const [holdings] = useLocalStorage("rise_holdings", {});

  useEffect(function () {
    const saved = JSON.parse(localStorage.getItem("rise_user"));
    if (!saved) goTo("/login");
    else setUser(saved);
  }, [goTo]);

  if (!user) return null;

  let equity = cash;
  const held = Object.keys(holdings);
  for (let i = 0; i < held.length; i++) {
    equity += holdings[held[i]].qty * basePriceOf(held[i]);
  }

  function logout() {
    localStorage.removeItem("rise_loggedIn");
    goTo("/login");
  }

  return (
    <>
      <Sidebar active="home" user={user} onLogout={logout} />
      <main className="main-content">
        <div className="welcome-hero">
          <h1>Welcome back, <span>{user.name.split(" ")[0]}</span>! 👋</h1>
          <p className="welcome-sub">Here is your demo trading account at a glance.</p>
        </div>

        <div className="wl-stats">
          <div className="wl-stat"><div className="wl-stat-label">Total Equity</div><div className="wl-stat-value">${equity.toFixed(2)}</div></div>
          <div className="wl-stat"><div className="wl-stat-label">Cash Available</div><div className="wl-stat-value">${cash.toFixed(2)}</div></div>
          <div className="wl-stat"><div className="wl-stat-label">Open Positions</div><div className="wl-stat-value">{held.length}</div></div>
        </div>

        <div className="wl-columns">
          <div className="wl-panel">
            <div className="wl-panel-head">
              <h2>Market Movers</h2>
              <button className="wl-open-btn" type="button" onClick={() => goTo("/dashboard")}>Open Trading</button>
            </div>
            <div className="mover-list">
              {Object.keys(stocks).map(function (sym) {
                const ch = baseChangeOf(sym);
                return (
                  <div className="mover" key={sym} onClick={() => goTo("/stock/" + sym)}>
                    <div className="mover-left">
                      <span className="mover-sym">{sym}</span>
                      <span className="mover-name">{nameOf(sym)}</span>
                    </div>
                    <div className="mover-right">
                      <span className="mover-price">${basePriceOf(sym).toFixed(2)}</span>
                      <span className={"mover-chg " + (ch >= 0 ? "up" : "dn")}>{ch >= 0 ? "+" : ""}{ch.toFixed(2)}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="wl-panel wl-tips">
            <div className="wl-panel-head"><h2>Daily Trading Tips</h2></div>
            <div className="tip-list">
              {tips.map(function (t) {
                return (
                  <div className="tip-item" key={t.strong}>
                    <span className="tip-icon">{t.icon}</span>
                    <div className="tip-text"><strong>{t.strong}</strong>{t.text}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
