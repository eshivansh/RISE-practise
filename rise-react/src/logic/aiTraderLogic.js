import { CONFIG } from "../config.js";
import { basePriceOf } from "../data/stocks.js";

export function fakeCloses(sym) {
  let price = basePriceOf(sym);
  const closes = [];
  for (let i = 0; i < 10; i++) {
    price += Math.sin(sym.length + i) * basePriceOf(sym) * 0.01;
    closes.push(Number(price.toFixed(2)));
  }
  return closes;
}

export function simplePredict(closes) {
  const oldAvg = (closes[4] + closes[5] + closes[6]) / 3;
  const newAvg = (closes[7] + closes[8] + closes[9]) / 3;
  if (newAvg > oldAvg) {
    return { direction: "UP", confidence: 60, reason: "Recent average is rising.", engine: "Simple rule" };
  }
  return { direction: "DOWN", confidence: 60, reason: "Recent average is falling.", engine: "Simple rule" };
}

export function getCloses(symbol) {
  return fetch("https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=" + symbol + "&apikey=" + CONFIG.marketApiKey)
    .then(function (r) { return r.json(); })
    .then(function (data) {
      const series = data["Time Series (Daily)"];
      if (!series) return fakeCloses(symbol);
      const days = Object.keys(series).slice(0, 10).reverse();
      return days.map(function (d) { return parseFloat(series[d]["4. close"]); });
    })
    .catch(function () { return fakeCloses(symbol); });
}

export function predict(symbol) {
  return getCloses(symbol).then(function (closes) {
    if (!CONFIG.geminiApiKey) return { closes, result: simplePredict(closes) };
    const q = "Prices " + closes.join(", ") + ". Reply: UP|65|reason or DOWN|65|reason";
    return fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=" + CONFIG.geminiApiKey, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: q }] }] }),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        const parts = data.candidates[0].content.parts[0].text.trim().split("|");
        return {
          closes,
          result: {
            direction: parts[0].includes("DOWN") ? "DOWN" : "UP",
            confidence: parseInt(parts[1]) || 60,
            reason: parts[2] || "No reason given.",
            engine: "Gemini AI",
          },
        };
      })
      .catch(function () { return { closes, result: simplePredict(closes) }; });
  });
}
