import { MissionHeader } from "../components/Layout.jsx";
import useAiTrader from "../hooks/useAiTrader.js";
import { basePriceOf } from "../data/stocks.js";
import "../styles/aitrader.css";

const LINKS = [
  { to: "/welcome", label: "Home" },
  { to: "/dashboard", label: "Trade" },
  { to: "/missions", label: "Missions" },
];

export default function AiTrader() {
  const ai = useAiTrader();

  return (
    <div className="ai-page">
      <MissionHeader badge="AI Lab" links={LINKS} />

      <main className="ai-main">
        <h1 className="ai-title">AI Trader</h1>
        <p className="ai-sub">Get predictions or run the auto-trading bot with fake money.</p>

        <div className="ai-columns">
          {/* Prediction panel */}
          <div className="ai-panel">
            <div className="ai-panel-head"><h2>Prediction</h2></div>
            <div className="ai-panel-body">
              <label className="ai-field">
                <span>Stock</span>
                <select value={ai.sym} onChange={(e) => ai.setSym(e.target.value)}>
                  {ai.SYMBOLS.map(function (s) {
                    return <option key={s} value={s}>{s} — {ai.nameOf(s)}</option>;
                  })}
                </select>
              </label>
              <button className="ai-predict-btn" onClick={ai.onPredict} disabled={ai.thinking}>
                {ai.thinking ? "Thinking..." : "Get Prediction"}
              </button>

              {ai.prediction && (
                <div className="predict-card">
                  <div className={"predict-dir " + (ai.prediction.direction === "UP" ? "up" : "dn")}>
                    {ai.prediction.direction === "UP" ? "▲ UP" : "▼ DOWN"}
                  </div>
                  <div className="predict-conf">{ai.prediction.confidence}% — {ai.prediction.engine}</div>
                  <div className="predict-price">${ai.prediction.price.toFixed(2)}</div>
                  <div className="predict-reason">{ai.prediction.reason}</div>
                </div>
              )}
            </div>
          </div>

          {/* Bot panel */}
          <div className="ai-panel">
            <div className="ai-panel-head">
              <h2>Auto Bot</h2>
              <div className="bot-buttons">
                <button className={ai.botOn ? "bot-toggle stop" : "bot-toggle"} onClick={() => ai.setBotOn(!ai.botOn)}>
                  {ai.botOn ? "Stop" : "Start"}
                </button>
                <button className="bot-reset" onClick={ai.resetBot}>Reset</button>
              </div>
            </div>

            <div className="conf-row">
              <span>Min confidence: <strong>{ai.minConf}%</strong></span>
              <input type="range" min="50" max="90" step="5" value={ai.minConf} onChange={(e) => ai.setMinConf(Number(e.target.value))} />
            </div>

            <div className="bot-stats">
              <div><span>Cash</span><strong>${ai.botCash.toFixed(2)}</strong></div>
              <div><span>Value</span><strong>${ai.botTotal.toFixed(2)}</strong></div>
              <div><span>Profit</span><strong className={ai.botProfit >= 0 ? "up" : "dn"}>${ai.botProfit.toFixed(2)}</strong></div>
            </div>

            <table className="bot-table">
              <thead><tr><th>Stock</th><th>Qty</th><th>Price</th><th>Value</th></tr></thead>
              <tbody>
                {ai.held.length === 0 ? (
                  <tr><td colSpan={4} className="bot-empty">No holdings</td></tr>
                ) : ai.held.map(function (s) {
                  const price = basePriceOf(s);
                  return (
                    <tr key={s}>
                      <td>{s}</td>
                      <td>{ai.botHoldings[s]}</td>
                      <td>${price.toFixed(2)}</td>
                      <td>${(ai.botHoldings[s] * price).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="bot-log">
              {ai.botLog.map(function (line, i) {
                return <div className="log-line" key={i}><span className="log-time">{line.time}</span> {line.text}</div>;
              })}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
