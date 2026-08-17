import { useEffect, useRef, useState } from "react";
import { stocks, nameOf, basePriceOf } from "../data/stocks.js";
import useLocalStorage from "../hooks/useLocalStorage.js";
import { predict } from "../logic/aiTraderLogic.js";

const SYMBOLS = Object.keys(stocks);

export default function useAiTrader() {
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

  function addLog(text) {
    const time = new Date().toLocaleTimeString();
    setBotLog(function (old) {
      return [{ time, text }].concat(old).slice(0, 40);
    });
  }

  function onPredict() {
    setThinking(true);
    setPrediction(null);
    predict(sym).then(function (out) {
      setThinking(false);
      setPrediction({ sym, price: out.closes[out.closes.length - 1], ...out.result });
    });
  }

  function botStep() {
    const symbol = SYMBOLS[botIndex.current];
    botIndex.current = (botIndex.current + 1) % SYMBOLS.length;
    addLog("Checking " + symbol + "...");
    predict(symbol).then(function (out) {
      const price = out.closes[out.closes.length - 1];
      const r = out.result;
      addLog(symbol + " → " + r.direction + " (" + r.confidence + "%)");
      if (r.confidence < confRef.current) return;

      const cash = JSON.parse(localStorage.getItem("rise_bot_cash")) || 10000;
      const held = JSON.parse(localStorage.getItem("rise_bot_holdings")) || {};

      if (r.direction === "UP" && cash >= price) {
        setBotCash(cash - price);
        const copy = { ...held };
        copy[symbol] = (copy[symbol] || 0) + 1;
        setBotHoldings(copy);
        addLog("BOT BOUGHT 1 " + symbol);
      } else if (r.direction === "DOWN" && held[symbol]) {
        setBotCash(cash + price);
        const copy = { ...held };
        copy[symbol] -= 1;
        if (copy[symbol] === 0) delete copy[symbol];
        setBotHoldings(copy);
        addLog("BOT SOLD 1 " + symbol);
      }
    });
  }

  useEffect(function () {
    if (!botOn) return;
    addLog("Bot started.");
    botStep();
    const t = setInterval(botStep, 15000);
    return function () { clearInterval(t); addLog("Bot stopped."); };
  }, [botOn]);

  let holdingsValue = 0;
  const held = Object.keys(botHoldings);
  for (let i = 0; i < held.length; i++) {
    holdingsValue += botHoldings[held[i]] * basePriceOf(held[i]);
  }
  const botTotal = botCash + holdingsValue;
  const botProfit = botTotal - 10000;

  return {
    sym, setSym, prediction, thinking, onPredict, botOn, setBotOn, minConf,
    setMinConf: function (v) { setMinConf(v); confRef.current = v; },
    botLog, botCash, botHoldings, held, botTotal, botProfit, SYMBOLS, nameOf,
    resetBot: function () { setBotOn(false); setBotCash(10000); setBotHoldings({}); setBotLog([]); },
  };
}
