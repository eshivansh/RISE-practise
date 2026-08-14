import { useEffect, useRef } from "react";

export default function TradingViewWidget({ symbol }) {
  const box = useRef(null);

  useEffect(function () {
    box.current.innerHTML = "";

    const s = document.createElement("script");
    s.src = "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    s.async = true;
    s.innerHTML = JSON.stringify({
      symbol: symbol,
      width: "100%",
      height: "100%",
      colorTheme: "dark",
      isTransparent: true,
      dateRange: "1M",
    });
    box.current.appendChild(s);
  }, [symbol]);

  return <div className="tradingview-widget-container" style={{ height: "200px" }} ref={box} />;
}
