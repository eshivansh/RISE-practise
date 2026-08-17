import { CONFIG } from "../config.js";

// fetch API + async/await helpers for Dashboard

export async function fetchStockPrice(symbol) {
  const url = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=" + symbol + "&apikey=" + CONFIG.marketApiKey;
  const response = await fetch(url);
  const data = await response.json();
  const quote = data["Global Quote"];

  if (!quote || !quote["05. price"]) return null;

  return {
    price: parseFloat(quote["05. price"]),
    change: parseFloat(quote["10. change percent"].replace("%", "")),
  };
}

export async function searchStocks(keyword) {
  const url = "https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=" + keyword + "&apikey=" + CONFIG.marketApiKey;
  const response = await fetch(url);
  const data = await response.json();
  const list = data.bestMatches || [];
  const results = [];

  for (let i = 0; i < list.length; i++) {
    results.push({ symbol: list[i]["1. symbol"], name: list[i]["2. name"] });
  }

  return results;
}

export async function askAiCoach(stock, message) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=" + CONFIG.geminiApiKey;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Stock " + stock + ". User asks: " + message }] }],
    }),
  });
  const data = await response.json();
  if (data.candidates) return data.candidates[0].content.parts[0].text;
  return "AI is unavailable right now.";
}
