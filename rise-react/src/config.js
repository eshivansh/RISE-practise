export const CONFIG = {
  geminiApiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
  marketApiKey: import.meta.env.VITE_MARKET_API_KEY || "",
  trackedSymbols: ["AAPL", "GOOGL", "NVDA", "TSLA", "MSFT", "BA"],
  defaultSymbol: "AAPL",
  autoRefreshSeconds: 60,
};
