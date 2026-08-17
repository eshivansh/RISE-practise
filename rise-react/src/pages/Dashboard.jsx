import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CONFIG } from "../config.js";
import { nameOf, basePriceOf, baseChangeOf } from "../data/stocks.js";
import StockChart from "../components/StockChart.jsx";
import PortfolioTable from "../components/PortfolioTable.jsx";
import { fetchStockPrice, searchStocks, askAiCoach } from "../logic/dashboardApi.js";
import "../styles/dashboardpage.css";

const WATCHLIST = ["AAPL", "GOOGL", "NVDA", "TSLA", "MSFT", "BA"];

function readJSON(key, fallback) {
  const text = localStorage.getItem(key);
  return text ? JSON.parse(text) : fallback;
}

export default function Dashboard() {
  const [picked, setPicked] = useState("AAPL");
  const [prices, setPrices] = useState({});
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("Pick a stock and place an order.");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [chatText, setChatText] = useState("");
  const [chatList, setChatList] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [cash, setCash] = useState(function () { return readJSON("rise_cash", 100000); });
  const [holdings, setHoldings] = useState(function () { return readJSON("rise_holdings", {}); });

  useEffect(function () { localStorage.setItem("rise_cash", JSON.stringify(cash)); }, [cash]);
  useEffect(function () { localStorage.setItem("rise_holdings", JSON.stringify(holdings)); }, [holdings]);
  function getPrice(sym) { return prices[sym] ? prices[sym].price : basePriceOf(sym); }
  function getChange(sym) { return prices[sym] ? prices[sym].change : baseChangeOf(sym); }

  async function loadPrice(sym) {
    try {
      const live = await fetchStockPrice(sym);
      if (live) setPrices(function (old) { return { ...old, [sym]: live }; });
    } catch (error) { /* use demo price */ }
  }

  useEffect(function () {
    WATCHLIST.forEach(loadPrice);
    const timer = setInterval(function () { WATCHLIST.forEach(loadPrice); }, CONFIG.autoRefreshSeconds * 1000);
    return function () { clearInterval(timer); };
  }, []);

  useEffect(function () {
    if (search.trim() === "") { setShowSearch(false); return; }
    const timer = setTimeout(async function () {
      setShowSearch(true);
      try { setResults(await searchStocks(search.trim())); }
      catch (error) { setResults([]); }
    }, 500);
    return function () { clearTimeout(timer); };
  }, [search]);

  function buyStock() {
    const price = getPrice(picked);
    const cost = price * qty;
    if (qty < 1 || cost > cash) { setNote("Cannot buy."); return; }
    setCash(cash - cost);
    const copy = { ...holdings };
    if (copy[picked]) {
      const old = copy[picked];
      const total = old.qty + qty;
      copy[picked] = { qty: total, avg: (old.avg * old.qty + price * qty) / total };
    } else copy[picked] = { qty, avg: price };
    setHoldings(copy);
    setNote("Bought " + qty + " " + picked);
  }

  function sellStock() {
    const price = getPrice(picked);
    if (!holdings[picked] || holdings[picked].qty < qty) { setNote("Not enough shares."); return; }
    setCash(cash + price * qty);
    const copy = { ...holdings };
    const left = copy[picked].qty - qty;
    if (left === 0) delete copy[picked]; else copy[picked] = { qty: left, avg: copy[picked].avg };
    setHoldings(copy);
    setNote("Sold " + qty + " " + picked);
  }

  async function sendChat() {
    if (chatText.trim() === "") return;
    const msg = chatText.trim();
    setChatText("");
    setChatList(function (old) { return [...old, { role: "user", text: msg }]; });
    setAiLoading(true);
    try {
      const reply = await askAiCoach(picked, msg);
      setChatList(function (old) { return [...old, { role: "assistant", text: reply }]; });
    } catch (error) {
      setChatList(function (old) { return [...old, { role: "assistant", text: "Network error." }]; });
    }
    setAiLoading(false);
  }

  let equity = cash;
  Object.keys(holdings).forEach(function (sym) {
    equity += holdings[sym].qty * getPrice(sym);
  });

  return (
    <div className="dash-page">
      <header className="dash-header">
        <div className="dash-header-inner">
          <Link to="/" className="brand"><img src="/assets/image.png" alt="RISE logo" /><span>RISE</span></Link>
          <div className="dash-search-box">
            <input type="search" placeholder="Search stock..." value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search stocks" />
            <div className={"search-dropdown" + (showSearch ? " is-open" : "")}>
              {results.map(function (item) {
                return (
                  <button type="button" key={item.symbol} className="search-item" onClick={() => { setPicked(item.symbol); setSearch(""); setShowSearch(false); loadPrice(item.symbol); }}>
                    {item.symbol} — {item.name}
                  </button>
                );
              })}
            </div>
          </div>
          <Link to="/welcome">Home</Link>
        </div>
      </header>

      <main className="dash-main">
        <nav className="steps-bar" aria-label="Steps">
          <div className="step-pill">1. Pick</div><div className="step-pill">2. Chart</div>
          <div className="step-pill">3. Trade</div><div className="step-pill">4. Track</div>
        </nav>

        <div className="dash-grid dash-grid-top">
          <article className="card-panel">
            <div className="card-head"><h2>Watchlist</h2></div>
            <div className="card-body">
              {WATCHLIST.map(function (sym) {
                const ch = getChange(sym);
                return (
                  <button type="button" key={sym} className={"stock-row" + (sym === picked ? " is-picked" : "")} onClick={() => { setPicked(sym); loadPrice(sym); }}>
                    <span><strong>{sym}</strong><small>{nameOf(sym)}</small></span>
                    <span className={ch >= 0 ? "up" : "dn"}>${getPrice(sym).toFixed(2)}</span>
                  </button>
                );
              })}
            </div>
          </article>

          <article className="card-panel">
            <div className="card-head"><h2>{picked}</h2><span>${getPrice(picked).toFixed(2)}</span></div>
            <div className="card-body"><StockChart symbol={picked} /></div>
          </article>

          <article className="card-panel">
            <div className="card-head"><h2>Order</h2></div>
            <form className="order-form card-body" onSubmit={(e) => { e.preventDefault(); buyStock(); }}>
              <label htmlFor="qty">Quantity<input id="qty" type="number" min="1" value={qty} onChange={(e) => setQty(Number(e.target.value))} /></label>
              <div className="row-between"><span>Cash</span><strong>${cash.toFixed(2)}</strong></div>
              <div className="btn-row">
                <button type="submit" className="btn-buy">Buy</button>
                <button type="button" className="btn-sell" onClick={sellStock}>Sell</button>
              </div>
              <p className="note-text">{note}</p>
            </form>
          </article>
        </div>

        <div className="dash-grid dash-grid-bottom">
          <article className="card-panel">
            <div className="card-head">
              <h2>Portfolio</h2>
              <button type="button" className="reset-btn" onClick={() => { setCash(100000); setHoldings({}); }}>Reset</button>
            </div>
            <div className="card-body">
              <div className="row-between"><span>Equity</span><strong>${equity.toFixed(2)}</strong></div>
              <PortfolioTable holdings={holdings} getPrice={getPrice} />
            </div>
          </article>

          <article className="card-panel">
            <div className="card-head"><h2>AI Coach</h2></div>
            <div className="card-body">
              <div className="chat-box">
                {chatList.map(function (msg, i) {
                  return <div key={i} className={"chat-msg " + msg.role}>{msg.text}</div>;
                })}
                {aiLoading && <div className="chat-msg">Thinking...</div>}
              </div>
              <div className="chat-input-row">
                <input type="text" value={chatText} onChange={(e) => setChatText(e.target.value)} placeholder="Ask AI..." />
                <button type="button" onClick={sendChat}>Send</button>
              </div>
            </div>
          </article>
        </div>
      </main>

      <footer className="dash-footer"><small>Demo only — no real money</small></footer>
    </div>
  );
}
