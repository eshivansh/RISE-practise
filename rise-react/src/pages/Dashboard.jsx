import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { CONFIG } from "../config.js";
import { stocks, nameOf, basePriceOf, baseChangeOf } from "../data/stocks.js";
import useLocalStorage from "../hooks/useLocalStorage.js";
import StockChart from "../components/StockChart.jsx";
import "../styles/dashboardpage.css";

const chips = [
  { label: "Explain stock", prompt: "Explain this stock in simple terms." },
  { label: "Is it a buy?", prompt: "Based on the recent move, is this a good beginner buy?" },
  { label: "Risk check", prompt: "What risks should I watch before buying this stock?" },
];

function markTask(id) {
  let d = new Date();
  let today = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  localStorage.setItem("rise_task_" + id + "_" + today, "1");
}

export default function Dashboard() {
  const [list, setList] = useState(["AAPL", "GOOGL", "NVDA", "TSLA", "MSFT", "BA"]);
  const [picked, setPicked] = useState("AAPL");
  const [prices, setPrices] = useState({});

  const [cash, setCash] = useLocalStorage("rise_cash", 100000);
  const [holdings, setHoldings] = useLocalStorage("rise_holdings", {});
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("Pick a stock, set a quantity, then Buy or Sell.");

  const [risk, setRisk] = useState("Conservative");
  const [horizon, setHorizon] = useState("Intraday");
  const [style, setStyle] = useState("Trend following");
  const [trigger, setTrigger] = useState("Wait for a clean setup before entering");
  const [stop, setStop] = useState("Step out if the idea is invalidated");

  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");

  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [wait, setWait] = useState(false);

  const searchRef = useRef(null);
  const logRef = useRef(null);

  function priceOf(sym) {
    if (prices[sym]) {
      return prices[sym].price;
    }
    return basePriceOf(sym);
  }

  function changeOf(sym) {
    if (prices[sym]) {
      return prices[sym].change;
    }
    return baseChangeOf(sym);
  }

  function getPrice(sym) {
    fetch("https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + sym + "&apikey=" + CONFIG.marketApiKey)
      .then((res) => res.json())
      .then(function (data) {
        let q = data["Global Quote"];
        if (q && q["05. price"]) {
          let one = {
            price: parseFloat(q["05. price"]),
            change: parseFloat(q["10. change percent"].replace("%", "")),
          };
          setPrices(function (old) {
            let copy = { ...old };
            copy[sym] = one;
            return copy;
          });
        }
      })
      .catch(function () {});
  }

  useEffect(function () {
    function refresh() {
      let all = list.slice();
      if (all.indexOf(picked) === -1) {
        all.push(picked);
      }
      for (let i = 0; i < all.length; i++) {
        getPrice(all[i]);
      }
    }
    refresh();
    let timer = setInterval(refresh, CONFIG.autoRefreshSeconds * 1000);
    return function () {
      clearInterval(timer);
    };
  }, [list, picked]);

  useEffect(function () {
    let q = search.trim();
    if (q === "") {
      setShowResults(false);
      return;
    }
    setWait(true);
    setShowResults(true);
    let timer = setTimeout(function () {
      fetch("https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" + q + "&apikey=" + CONFIG.marketApiKey)
        .then((res) => res.json())
        .then(function (data) {
          setWait(false);
          let matches = data.bestMatches || [];
          let clean = [];
          for (let i = 0; i < matches.length; i++) {
            clean.push({ symbol: matches[i]["1. symbol"], name: matches[i]["2. name"] });
          }
          setResults(clean);
        })
        .catch(function () {
          setWait(false);
        });
    }, 500);
    return function () {
      clearTimeout(timer);
    };
  }, [search]);

  useEffect(function () {
    function onClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowResults(false);
      }
    }
    document.addEventListener("click", onClick);
    return function () {
      document.removeEventListener("click", onClick);
    };
  }, []);

  useEffect(function () {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [chatList, loading]);

  function buy() {
    let p = priceOf(picked);
    if (qty <= 0) {
      setNote("Quantity must be at least 1.");
      return;
    }
    let cost = p * qty;
    if (cost > cash) {
      setNote("Not enough cash for this buy.");
      return;
    }
    setCash(cash - cost);

    let copy = { ...holdings };
    if (copy[picked]) {
      let old = copy[picked];
      let totalQty = old.qty + qty;
      let newAvg = (old.avg * old.qty + p * qty) / totalQty;
      copy[picked] = { qty: totalQty, avg: newAvg };
    } else {
      copy[picked] = { qty: qty, avg: p };
    }
    setHoldings(copy);
    setNote("Bought " + qty + " " + picked + " at $" + p.toFixed(2));
    markTask("trade");
  }

  function sell() {
    let p = priceOf(picked);
    if (qty <= 0) {
      setNote("Quantity must be at least 1.");
      return;
    }
    let copy = { ...holdings };
    if (!copy[picked] || copy[picked].qty < qty) {
      setNote("You do not have enough shares to sell.");
      return;
    }
    setCash(cash + p * qty);

    let left = copy[picked].qty - qty;
    if (left === 0) {
      delete copy[picked];
    } else {
      copy[picked] = { qty: left, avg: copy[picked].avg };
    }
    setHoldings(copy);
    setNote("Sold " + qty + " " + picked + " at $" + p.toFixed(2));
    markTask("trade");
  }

  function resetAccount() {
    setCash(100000);
    setHoldings({});
    setNote("Demo account reset to $100,000.");
  }

  function askAI(msg) {
    markTask("ai");
    setChatList(function (old) {
      return old.concat({ text: msg, role: "user" });
    });
    setLoading(true);

    let extra = " (Price: $" + priceOf(picked).toFixed(2) + ", Change: " + changeOf(picked).toFixed(2) + "%)";
    let system = "You are a concise stock trading coach for beginners.";
    let question = "Stock: " + picked + extra + ". Strategy: " + risk + " / " + horizon + " / " + style + ". User says: " + msg;

    fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=" + CONFIG.geminiApiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: system }] },
        contents: [{ parts: [{ text: question }] }],
      }),
    })
      .then((res) => res.json())
      .then(function (data) {
        setLoading(false);
        let reply = "Error: AI response unavailable.";
        try {
          reply = data.candidates[0].content.parts[0].text;
        } catch (e) {
          reply = "Error: AI response unavailable.";
        }
        setChatList(function (old) {
          return old.concat({ text: reply, role: "assistant" });
        });
      })
      .catch(function () {
        setLoading(false);
        setChatList(function (old) {
          return old.concat({ text: "Error: Connection to AI coach failed.", role: "assistant" });
        });
      });
  }

  function sendChat(e) {
    e.preventDefault();
    let msg = text.trim();
    if (msg !== "") {
      setText("");
      askAI(msg);
    }
  }

  function pick(sym) {
    markTask("chart");
    setPicked(sym);
    getPrice(sym);
  }

  function removeStock(e, sym) {
    e.stopPropagation();
    let newList = [];
    for (let i = 0; i < list.length; i++) {
      if (list[i] !== sym) {
        newList.push(list[i]);
      }
    }
    setList(newList);
  }

  function add(sym, name) {
    if (!stocks[sym]) {
      stocks[sym] = { name: name, price: 100, change: 0 };
    }
    setSearch("");
    setShowResults(false);
    setPicked(sym);
    if (list.indexOf(sym) === -1) {
      let newList = [sym].concat(list);
      if (newList.length > 8) {
        newList = newList.slice(0, 8);
      }
      setList(newList);
    }
    getPrice(sym);
  }

  let selectedPrice = priceOf(picked);
  let selectedChange = changeOf(picked);
  let cost = selectedPrice * qty;

  let symbolsHeld = Object.keys(holdings);
  let holdingsValue = 0;
  for (let i = 0; i < symbolsHeld.length; i++) {
    let sym = symbolsHeld[i];
    holdingsValue = holdingsValue + holdings[sym].qty * priceOf(sym);
  }
  let equity = cash + holdingsValue;
  let profit = equity - 100000;

  let watchRows = [];
  for (let i = 0; i < list.length; i++) {
    let sym = list[i];
    let ch = changeOf(sym);

    let rowClass = "watch-row";
    if (sym === picked) {
      rowClass = "watch-row is-active";
    }

    let changeClass = "watch-change is-up";
    let sign = "+";
    if (ch < 0) {
      changeClass = "watch-change is-down";
      sign = "";
    }

    watchRows.push(
      <button className={rowClass} key={sym} onClick={() => pick(sym)}>
        <span>
          <span className="watch-symbol">{sym}</span>
          <span className="watch-name">{nameOf(sym)}</span>
        </span>
        <span className="watch-quote">
          <strong>${priceOf(sym).toFixed(2)}</strong>
          <span className={changeClass}>{sign}{ch.toFixed(2)}%</span>
        </span>
        <span className="watch-remove-btn" onClick={(e) => removeStock(e, sym)}>×</span>
      </button>
    );
  }

  let resultRows = [];
  if (wait) {
    resultRows.push(<div className="search-result" key="wait">Searching...</div>);
  } else if (results.length === 0) {
    resultRows.push(<div className="search-result" key="none">No results found</div>);
  } else {
    for (let i = 0; i < results.length; i++) {
      let r = results[i];
      resultRows.push(
        <button className="search-result" type="button" key={r.symbol} onClick={() => add(r.symbol, r.name)}>
          <strong>{r.symbol}</strong>
          <span>{r.name}</span>
        </button>
      );
    }
  }

  let holdingRows = [];
  for (let i = 0; i < symbolsHeld.length; i++) {
    let sym = symbolsHeld[i];
    let h = holdings[sym];
    let cur = priceOf(sym);
    let pl = (cur - h.avg) * h.qty;

    let plClass = "pl-up";
    let plSign = "+";
    if (pl < 0) {
      plClass = "pl-down";
      plSign = "-";
    }

    holdingRows.push(
      <tr key={sym}>
        <td>{sym}</td>
        <td>{h.qty}</td>
        <td>${h.avg.toFixed(2)}</td>
        <td>${cur.toFixed(2)}</td>
        <td className={plClass}>{plSign}${Math.abs(pl).toFixed(2)}</td>
      </tr>
    );
  }
  if (holdingRows.length === 0) {
    holdingRows.push(
      <tr className="empty-row" key="empty"><td colSpan={5}>No positions yet. Buy a stock to start trading.</td></tr>
    );
  }

  let chipRows = [];
  for (let i = 0; i < chips.length; i++) {
    let c = chips[i];
    chipRows.push(
      <button type="button" key={c.label} onClick={() => askAI(c.prompt)}>{c.label}</button>
    );
  }

  let chatRows = [];
  for (let i = 0; i < chatList.length; i++) {
    chatRows.push(<div className={"chat-message " + chatList[i].role} key={i}>{chatList[i].text}</div>);
  }

  let typingClass = "ai-typing";
  if (loading) {
    typingClass = "ai-typing active";
  }

  let resultsClass = "search-results";
  if (showResults) {
    resultsClass = "search-results is-open";
  }

  let bigChangeClass = "chart-change is-up";
  let bigSign = "+";
  if (selectedChange < 0) {
    bigChangeClass = "chart-change is-down";
    bigSign = "";
  }

  return (
    <div className="app-shell dash-page">
      <header className="app-header header-blur">
        <div className="header-container">
          <Link to="/" className="brand">
            <img src="/assets/image.png" alt="logo" />
            <span className="brand-title">RISE</span>
          </Link>

          <div className="header-center" ref={searchRef}>
            <label className="search-wrap" htmlFor="symbol-search">
              <i className="bi bi-search"></i>
              <input
                id="symbol-search"
                type="search"
                placeholder="Search a stock: Apple, Tesla, Microsoft..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <div className={resultsClass}>{resultRows}</div>
          </div>

          <Link to="/welcome" className="header-back"><i className="bi bi-grid-1x2"></i> Home</Link>
        </div>
      </header>

      <main className="trade-main">
        <div className="guide-bar">
          <div className="guide-step"><span className="step-num">1</span> Pick a stock from the watchlist</div>
          <div className="guide-step"><span className="step-num">2</span> Read its chart</div>
          <div className="guide-step"><span className="step-num">3</span> Place a Buy or Sell order</div>
          <div className="guide-step"><span className="step-num">4</span> Track your profit below</div>
        </div>

        <section className="trade-top">
          <section className="surface watchlist-panel">
            <div className="section-title">
              <div><h2>Watchlist</h2></div>
            </div>
            <div className="watchlist">{watchRows}</div>
          </section>

          <section className="surface chart-panel">
            <div className="chart-head">
              <div className="chart-title">
                <h2>{picked}</h2>
                <span className="chart-name">{nameOf(picked)}</span>
              </div>
              <div className="chart-quote">
                <span className="chart-price">${selectedPrice.toFixed(2)}</span>
                <span className={bigChangeClass}>{bigSign}{selectedChange.toFixed(2)}%</span>
              </div>
              <Link to={"/stock/" + picked} className="button button-light">View details</Link>
            </div>
            <StockChart symbol={picked} />
          </section>

          <section className="surface order-panel">
            <div className="section-title">
              <div><h2>Place Order</h2></div>
            </div>
            <div className="order-body">
              <div className="order-row"><span>Stock</span><strong>{picked}</strong></div>
              <div className="order-row"><span>Price</span><strong>${selectedPrice.toFixed(2)}</strong></div>

              <label className="field">
                <span>Quantity</span>
                <input type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
              </label>

              <div className="order-row"><span>Estimated cost</span><strong>${cost.toFixed(2)}</strong></div>
              <div className="order-row"><span>Cash left</span><strong>${cash.toFixed(2)}</strong></div>

              <div className="buy-sell">
                <button className="btn-buy" onClick={buy}>Buy</button>
                <button className="btn-sell" onClick={sell}>Sell</button>
              </div>

              <div className="order-note">{note}</div>
            </div>
          </section>
        </section>

        <section className="trade-mid">
          <section className="surface portfolio-panel">
            <div className="section-title">
              <div><h2>Demo Portfolio</h2></div>
              <button className="button button-light" type="button" onClick={resetAccount}>Reset</button>
            </div>
            <div className="stats-row">
              <div><span>Cash</span><strong>${cash.toFixed(2)}</strong></div>
              <div><span>Equity</span><strong>${equity.toFixed(2)}</strong></div>
              <div><span>Profit/Loss</span><strong className={profit >= 0 ? "pl-up" : "pl-down"}>{profit >= 0 ? "+" : "-"}${Math.abs(profit).toFixed(2)}</strong></div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Symbol</th><th>Qty</th><th>Avg</th><th>Price</th><th>P/L</th></tr>
                </thead>
                <tbody>{holdingRows}</tbody>
              </table>
            </div>
          </section>
        </section>

        <section className="trade-bottom">
          <section className="surface strategy-builder">
            <div className="section-title">
              <div><h2>Learning Plan</h2></div>
              <button className="button button-light" type="button" onClick={() => askAI("Review my strategy plan.")}>Ask AI</button>
            </div>
            <label className="field">
              <span>Risk profile</span>
              <select value={risk} onChange={(e) => setRisk(e.target.value)}>
                <option value="Conservative">Conservative</option>
                <option value="Balanced">Balanced</option>
                <option value="Aggressive">Aggressive</option>
              </select>
            </label>
            <label className="field">
              <span>Time horizon</span>
              <select value={horizon} onChange={(e) => setHorizon(e.target.value)}>
                <option value="Intraday">Intraday</option>
                <option value="Swing">Swing</option>
                <option value="Position">Position</option>
              </select>
            </label>
            <label className="field">
              <span>Style</span>
              <select value={style} onChange={(e) => setStyle(e.target.value)}>
                <option value="Trend following">Trend following</option>
                <option value="Pullback continuation">Pullback continuation</option>
                <option value="Breakout confirmation">Breakout confirmation</option>
                <option value="Mean reversion">Mean reversion</option>
              </select>
            </label>
            <label className="field">
              <span>Entry trigger</span>
              <input type="text" value={trigger} onChange={(e) => setTrigger(e.target.value)} />
            </label>
            <label className="field">
              <span>Stop rule</span>
              <input type="text" value={stop} onChange={(e) => setStop(e.target.value)} />
            </label>
          </section>

          <section className="surface coach-panel">
            <div className="section-title">
              <div><h2>AI Trading Coach</h2></div>
              <span className="ai-state">Ready</span>
            </div>
            <div className="prompt-chips">{chipRows}</div>
            <div className="chat-log" ref={logRef}>{chatRows}</div>
            <div className={typingClass}>
              <div className="dot-flashing"></div>
              <span>AI Coach is thinking...</span>
            </div>
            <form className="chat-form" onSubmit={sendChat}>
              <input
                type="text"
                placeholder="Ask about this stock, risk, or strategy..."
                autoComplete="off"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button className="button button-dark" type="submit">Send</button>
            </form>
          </section>
        </section>
      </main>

      <footer className="app-footer">
        <span>Educational demo trading only — no real money involved. Developed By Team CodeGeass&reg;</span>
      </footer>
    </div>
  );
}
