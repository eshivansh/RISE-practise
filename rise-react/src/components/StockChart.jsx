import { useEffect, useRef } from "react";
import { tvSymbol } from "../data/stocks.js";

export default function StockChart({ symbol }) {
  const box = useRef(null);

  useEffect(function () {
    box.current.innerHTML = "";

    const holder = document.createElement("div");
    holder.className = "tradingview-widget-container__widget";
    holder.style.height = "100%";
    holder.style.width = "100%";
    box.current.appendChild(holder);

    const s = document.createElement("script");
    s.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    s.async = true;
    s.innerHTML = JSON.stringify({
      symbol: tvSymbol(symbol),
      interval: "D",
      timezone: "Etc/UTC",
      theme: "dark",
      style: "1",
      locale: "en",
      allow_symbol_change: false,
      hide_side_toolbar: true,
      backgroundColor: "rgba(5, 10, 15, 1)",
      gridColor: "rgba(30, 48, 69, 0.4)",
      width: "100%",
      height: "100%",
    });
    box.current.appendChild(s);
  }, [symbol]);

  return <div className="tradingview-widget-container stock-chart" ref={box} />;
}
