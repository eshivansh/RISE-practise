import { useEffect, useRef, useState } from "react";
import { CONFIG } from "../config.js";
import { stocks, basePriceOf, baseChangeOf } from "../data/stocks.js";
import useLocalStorage from "./useLocalStorage.js";

const CHIPS = [
  { label: "Explain stock", prompt: "Explain this stock in simple terms." },
  { label: "Is it a buy?", prompt: "Is this a good beginner buy?" },
  { label: "Risk check", prompt: "What risks should I watch?" },
];

function markTask(id) {
  const d = new Date();
  localStorage.setItem("rise_task_" + id + "_" + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate(), "1");
}

export default function useDashboard() {
  const [list, setList] = useState(["AAPL", "GOOGL", "NVDA", "TSLA", "MSFT", "BA"]);
  const [picked, setPicked] = useState("AAPL");
  const [prices, setPrices] = useState({});
  const [cash, setCash] = useLocalStorage("rise_cash", 100000);
  const [holdings, setHoldings] = useLocalStorage("rise_holdings", {});
  const [qty, setQty] = useState(1);
  const [note, setNote] = useState("Pick a stock, set quantity, then Buy or Sell.");
  const [risk, setRisk] = useState("Conservative");
  const [horizon, setHorizon] = useState("Intraday");
  const [style, setStyle] = useState("Trend following");
  const [trigger, setTrigger] = useState("Wait for a clean setup");
  const [stop, setStop] = useState("Exit if idea fails");
  const [chatList, setChatList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [wait, setWait] = useState(false);
  const searchRef = useRef(null);
  const logRef = useRef(null);

  function priceOf(sym) { return prices[sym] ? prices[sym].price : basePriceOf(sym); }
  function changeOf(sym) { return prices[sym] ? prices[sym].change : baseChangeOf(sym); }

  function getPrice(sym) {
    fetch("https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + sym + "&apikey=" + CONFIG.marketApiKey)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        const q = data["Global Quote"];
        if (q && q["05. price"]) {
          setPrices(function (old) {
            const copy = { ...old };
            copy[sym] = { price: parseFloat(q["05. price"]), change: parseFloat(q["10. change percent"].replace("%", "")) };
            return copy;
          });
        }
      }).catch(function () {});
  }

  useEffect(function () {
    function refresh() {
      const all = list.indexOf(picked) === -1 ? list.concat(picked) : list;
      for (let i = 0; i < all.length; i++) getPrice(all[i]);
    }
    refresh();
    const t = setInterval(refresh, CONFIG.autoRefreshSeconds * 1000);
    return function () { clearInterval(t); };
  }, [list, picked]);

  useEffect(function () {
    if (!search.trim()) { setShowResults(false); return; }
    setWait(true);
    setShowResults(true);
    const t = setTimeout(function () {
      fetch("https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" + search.trim() + "&apikey=" + CONFIG.marketApiKey)
        .then(function (r) { return r.json(); })
        .then(function (data) {
          setWait(false);
          setResults((data.bestMatches || []).map(function (m) {
            return { symbol: m["1. symbol"], name: m["2. name"] };
          }));
        }).catch(function () { setWait(false); });
    }, 500);
    return function () { clearTimeout(t); };
  }, [search]);

  useEffect(function () {
    function onClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowResults(false);
    }
    document.addEventListener("click", onClick);
    return function () { document.removeEventListener("click", onClick); };
  }, []);

  useEffect(function () {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [chatList, loading]);

  function buy() {
    const p = priceOf(picked);
    if (qty <= 0 || p * qty > cash) { setNote("Invalid buy."); return; }
    setCash(cash - p * qty);
    const copy = { ...holdings };
    if (copy[picked]) {
      const old = copy[picked];
      const total = old.qty + qty;
      copy[picked] = { qty: total, avg: (old.avg * old.qty + p * qty) / total };
    } else copy[picked] = { qty, avg: p };
    setHoldings(copy);
    setNote("Bought " + qty + " " + picked);
    markTask("trade");
  }

  function sell() {
    const p = priceOf(picked);
    if (!holdings[picked] || holdings[picked].qty < qty) { setNote("Not enough shares."); return; }
    setCash(cash + p * qty);
    const copy = { ...holdings };
    const left = copy[picked].qty - qty;
    if (left === 0) delete copy[picked];
    else copy[picked] = { qty: left, avg: copy[picked].avg };
    setHoldings(copy);
    setNote("Sold " + qty + " " + picked);
    markTask("trade");
  }

  function askAI(msg) {
    markTask("ai");
    setChatList(function (old) { return old.concat({ text: msg, role: "user" }); });
    setLoading(true);
    fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=" + CONFIG.geminiApiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: "You are a concise trading coach." }] },
        contents: [{ parts: [{ text: "Stock " + picked + ". User: " + msg }] }],
      }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        setLoading(false);
        let reply = "AI unavailable.";
        try { reply = data.candidates[0].content.parts[0].text; } catch (e) {}
        setChatList(function (old) { return old.concat({ text: reply, role: "assistant" }); });
      })
      .catch(function () {
        setLoading(false);
        setChatList(function (old) { return old.concat({ text: "Connection failed.", role: "assistant" }); });
      });
  }

  function pickStock(sym) {
    markTask("chart");
    setPicked(sym);
    getPrice(sym);
  }

  function addStock(sym, name) {
    if (!stocks[sym]) stocks[sym] = { name, price: 100, change: 0 };
    setSearch("");
    setShowResults(false);
    setPicked(sym);
    if (list.indexOf(sym) === -1) setList([sym].concat(list).slice(0, 8));
    getPrice(sym);
  }

  let equity = cash;
  const symbolsHeld = Object.keys(holdings);
  for (let i = 0; i < symbolsHeld.length; i++) {
    equity += holdings[symbolsHeld[i]].qty * priceOf(symbolsHeld[i]);
  }

  return {
    CHIPS, list, setList, picked, cash, holdings, qty, setQty, note, risk, setRisk,
    horizon, setHorizon, style, setStyle, trigger, setTrigger, stop, setStop,
    chatList, loading, text, setText, search, setSearch, results, showResults, wait,
    searchRef, logRef, priceOf, changeOf, buy, sell, askAI, pickStock, addStock,
    selectedPrice: priceOf(picked), selectedChange: changeOf(picked),
    cost: priceOf(picked) * qty, equity, profit: equity - 100000, symbolsHeld,
    reset: function () { setCash(100000); setHoldings({}); setNote("Account reset."); },
  };
}
