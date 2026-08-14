import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CONFIG } from "../config.js";
import { stocks, nameOf, basePriceOf } from "../data/stocks.js";
import useLocalStorage from "../hooks/useLocalStorage.js";
import "../styles/aitrader.css";

const symbols = Object.keys(stocks);

function fakeCloses(sym) {
  let base = basePriceOf(sym);
  let closes = [];
  let price = base;
  for (let i = 0; i < 10; i++) {
    price = price + Math.sin(sym.length + i) * base * 0.01;
    closes.push(Number(price.toFixed(2)));
  }
  return closes;
}

function simpleRulePrediction(closes) {
  let oldSum = 0;
  let newSum = 0;
  for (let i = 4; i < 7; i++) {
    oldSum = oldSum + closes[i];
  }
  for (let i = 7; i < 10; i++) {
    newSum = newSum + closes[i];
  }
  let oldAvg = oldSum / 3;
  let newAvg = newSum / 3;

  if (newAvg > oldAvg) {
    return { direction: "UP", confidence: 60, reason: "The average of the last 3 days is higher than the 3 days before.", engine: "Simple rule" };
  }
  return { direction: "DOWN", confidence: 60, reason: "The average of the last 3 days is lower than the 3 days before.", engine: "Simple rule" };
}

export default function AiTrader() {
  const [sym, setSym] = useState("AAPL");
  const [prediction, setPrediction] = useState(null);
  const [thinking, setThinking] = useState(false);

  const [botOn, setBotOn] = useState(false);
  const [minConf, setMinConf] = useState(65);
  const [botLog, setBotLog] = useState([]);
  const [botCash, setBotCash] = useLocalStorage("rise_bot_cash", 10000);
  const [botHoldings, setBotHoldings] = useLocalStorage("rise_bot_holdings", {});
  const botIndex = useRef(0);
  const confRef = useRef(65);

  function onConfChange(e) {
    let value = Number(e.target.value);
    setMinConf(value);
    confRef.current = value;
  }

  function addLog(text) {
    let time = new Date().toLocaleTimeString();
    setBotLog(function (old) {
      let next = [{ time: time, text: text }].concat(old);
      if (next.length > 40) {
        next = next.slice(0, 40);
      }
      return next;
    });
  }

  function getCloses(symbol) {
    return fetch("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + symbol + "&apikey=" + CONFIG.marketApiKey)
      .then((res) => res.json())
      .then(function (data) {
        let series = data["Time Series (Daily)"];
        if (!series) {
          return fakeCloses(symbol);
        }
        let days = Object.keys(series).slice(0, 10).reverse();
        let closes = [];
        for (let i = 0; i < days.length; i++) {
          closes.push(parseFloat(series[days[i]]["4. close"]));
        }
        return closes;
      })
      .catch(function () {
        return fakeCloses(symbol);
      });
  }

  function askGemini(symbol, closes) {
    let question =
      "Last 10 daily closing prices of " + symbol + ": " + closes.join(", ") +
      ". Predict tomorrow. Reply in EXACTLY this format with no extra words: UP|65|short reason  (direction UP or DOWN, confidence 50-90).";

    return fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=" + CONFIG.geminiApiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: question }] }] }),
    })
      .then((res) => res.json())
      .then(function (data) {
        let text = data.candidates[0].content.parts[0].text.trim();
        let parts = text.split("|");
        let direction = "UP";
        if (parts[0].toUpperCase().indexOf("DOWN") !== -1) {
          direction = "DOWN";
        }
        let confidence = parseInt(parts[1]);
        if (!confidence) {
          confidence = 60;
        }
        let reason = parts[2] || "AI did not give a reason.";
        return { direction: direction, confidence: confidence, reason: reason, engine: "Gemini AI" };
      });
  }

  function predict(symbol) {
    return getCloses(symbol).then(function (closes) {
      if (CONFIG.geminiApiKey === "") {
        return { closes: closes, result: simpleRulePrediction(closes) };
      }
      return askGemini(symbol, closes)
        .then(function (result) {
          return { closes: closes, result: result };
        })
        .catch(function () {
          return { closes: closes, result: simpleRulePrediction(closes) };
        });
    });
  }

  function onPredictClick() {
    setThinking(true);
    setPrediction(null);
    predict(sym).then(function (out) {
      setThinking(false);
      setPrediction({ sym: sym, price: out.closes[out.closes.length - 1], ...out.result });
    });
  }

  function botTradeOnce() {
    let symbol = symbols[botIndex.current];
    botIndex.current = (botIndex.current + 1) % symbols.length;

    addLog("Checking " + symbol + "...");
    predict(symbol).then(function (out) {
      let price = out.closes[out.closes.length - 1];
      let result = out.result;
      addLog(symbol + " → " + result.direction + " (" + result.confidence + "%, " + result.engine + ")");

      let need = confRef.current;
      if (result.confidence < need) {
        addLog("Skipped: " + result.confidence + "% is below the " + need + "% minimum.");
        return;
      }

      let cashNow = JSON.parse(localStorage.getItem("rise_bot_cash"));
      let heldNow = JSON.parse(localStorage.getItem("rise_bot_holdings"));
      if (cashNow === null) {
        cashNow = 10000;
      }
      if (heldNow === null) {
        heldNow = {};
      }

      if (result.direction === "UP") {
        if (cashNow >= price) {
          setBotCash(cashNow - price);
          let copy = { ...heldNow };
          if (copy[symbol]) {
            copy[symbol] = copy[symbol] + 1;
          } else {
            copy[symbol] = 1;
          }
          setBotHoldings(copy);
          addLog("BOT BOUGHT 1 " + symbol + " at $" + price.toFixed(2));
        } else {
          addLog("Wanted to buy " + symbol + " but not enough cash.");
        }
      } else {
        if (heldNow[symbol]) {
          setBotCash(cashNow + price);
          let copy = { ...heldNow };
          copy[symbol] = copy[symbol] - 1;
          if (copy[symbol] === 0) {
            delete copy[symbol];
          }
          setBotHoldings(copy);
          addLog("BOT SOLD 1 " + symbol + " at $" + price.toFixed(2));
        } else {
          addLog("Prediction is DOWN but bot holds no " + symbol + ". Skipped.");
        }
      }
    });
  }

  useEffect(function () {
    if (!botOn) {
      return;
    }
    addLog("Bot started. It checks one stock every 15 seconds, and only trades above " + confRef.current + "% confidence.");
    botTradeOnce();
    let timer = setInterval(botTradeOnce, 15000);
    return function () {
      clearInterval(timer);
      addLog("Bot stopped.");
    };
  }, [botOn]);

  function resetBot() {
    setBotOn(false);
    setBotCash(10000);
    setBotHoldings({});
    setBotLog([]);
  }

  let held = Object.keys(botHoldings);
  let holdingsValue = 0;
  let holdingRows = [];
  for (let i = 0; i < held.length; i++) {
    let s = held[i];
    let price = basePriceOf(s);
    holdingsValue = holdingsValue + botHoldings[s] * price;
    holdingRows.push(
      <tr key={s}>
        <td>{s}</td>
        <td>{botHoldings[s]}</td>
        <td>${price.toFixed(2)}</td>
        <td>${(botHoldings[s] * price).toFixed(2)}</td>
      </tr>
    );
  }
  if (holdingRows.length === 0) {
    holdingRows.push(<tr key="none"><td colSpan={4} className="bot-empty">Bot holds nothing yet.</td></tr>);
  }

  let botTotal = botCash + holdingsValue;
  let botProfit = botTotal - 10000;
  let profitClass = "up";
  let profitSign = "+";
  if (botProfit < 0) {
    profitClass = "dn";
    profitSign = "-";
  }

  let symOptions = [];
  for (let i = 0; i < symbols.length; i++) {
    symOptions.push(<option value={symbols[i]} key={symbols[i]}>{symbols[i]} — {nameOf(symbols[i])}</option>);
  }

  let logRows = [];
  for (let i = 0; i < botLog.length; i++) {
    logRows.push(
      <div className="log-line" key={i}>
        <span className="log-time">{botLog[i].time}</span> {botLog[i].text}
      </div>
    );
  }

  return (
    <div className="ai-page">
      <header className="header-blur mission-header">
        <Link to="/" className="brand">
          <img src="/assets/image.png" alt="logo" />
          <span className="brand-title">RISE</span>
        </Link>
        <nav className="mission-nav">
          <Link to="/welcome">Home</Link>
          <Link to="/dashboard">Trade</Link>
          <Link to="/missions">Missions</Link>
        </nav>
        <span className="mission-level">AI Lab</span>
      </header>

      <main className="ai-main">
        <h1 className="ai-title">AI Trader</h1>
        <p className="ai-sub">Ask the AI where a stock goes next — or let the bot trade a fake $10,000 wallet on its own.</p>

        <div className="ai-columns">
          <div className="ai-panel">
            <div className="ai-panel-head"><h2>Ask for a Prediction</h2></div>
            <div className="ai-panel-body">
              <label className="ai-field">
                <span>Stock</span>
                <select value={sym} onChange={(e) => setSym(e.target.value)}>{symOptions}</select>
              </label>
              <button className="ai-predict-btn" onClick={onPredictClick} disabled={thinking}>
                {thinking ? "Thinking..." : "Get AI Prediction"}
              </button>

              {prediction && (
                <div className="predict-card">
                  <div className={"predict-dir " + (prediction.direction === "UP" ? "up" : "dn")}>
                    {prediction.direction === "UP" ? "▲ UP" : "▼ DOWN"}
                  </div>
                  <div className="predict-conf">{prediction.confidence}% confident — {prediction.engine}</div>
                  <div className="predict-price">Last price: ${prediction.price.toFixed(2)}</div>
                  <div className="predict-reason">{prediction.reason}</div>
                  <div className="predict-note">Educational demo only. Not financial advice.</div>
                </div>
              )}
            </div>
          </div>

          <div className="ai-panel">
            <div className="ai-panel-head">
              <h2>Auto-Trading Bot</h2>
              <div className="bot-buttons">
                <button className={botOn ? "bot-toggle stop" : "bot-toggle"} onClick={() => setBotOn(!botOn)}>
                  {botOn ? "Stop Bot" : "Start Bot"}
                </button>
                <button className="bot-reset" onClick={resetBot}>Reset</button>
              </div>
            </div>
            <div className="conf-row">
              <div className="conf-label">
                <span>Only trade when the AI is at least</span>
                <strong>{minConf}%</strong>
                <span>sure</span>
              </div>
              <input type="range" min="50" max="90" step="5" value={minConf} onChange={onConfChange} />
            </div>
            <div className="bot-stats">
              <div><span>Cash</span><strong>${botCash.toFixed(2)}</strong></div>
              <div><span>Total value</span><strong>${botTotal.toFixed(2)}</strong></div>
              <div><span>Profit</span><strong className={profitClass}>{profitSign}${Math.abs(botProfit).toFixed(2)}</strong></div>
            </div>
            <table className="bot-table">
              <thead><tr><th>Stock</th><th>Qty</th><th>Price</th><th>Value</th></tr></thead>
              <tbody>{holdingRows}</tbody>
            </table>
            <div className="bot-log">{logRows}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
