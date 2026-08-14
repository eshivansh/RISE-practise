export const stocks = {
  AAPL: { name: "Apple Inc.", price: 189.42, change: 1.24, exchange: "NASDAQ" },
  GOOGL: { name: "Alphabet Inc.", price: 174.15, change: 0.87, exchange: "NASDAQ" },
  NVDA: { name: "NVIDIA Corp.", price: 924.73, change: 3.12, exchange: "NASDAQ" },
  TSLA: { name: "Tesla, Inc.", price: 177.58, change: -1.45, exchange: "NASDAQ" },
  MSFT: { name: "Microsoft Corp.", price: 415.32, change: 0.56, exchange: "NASDAQ" },
  BA: { name: "Boeing Co.", price: 210.4, change: -0.8, exchange: "NYSE" },
};

export function nameOf(sym) {
  if (stocks[sym]) {
    return stocks[sym].name;
  }
  return sym;
}

export function basePriceOf(sym) {
  if (stocks[sym]) {
    return stocks[sym].price;
  }
  return 100;
}

export function baseChangeOf(sym) {
  if (stocks[sym]) {
    return stocks[sym].change;
  }
  return 0;
}

export function tvSymbol(sym) {
  if (stocks[sym] && stocks[sym].exchange) {
    return stocks[sym].exchange + ":" + sym;
  }
  return sym;
}
