import { Link, useParams } from "react-router-dom";
import { nameOf, basePriceOf, baseChangeOf } from "../data/stocks.js";
import StockChart from "../components/StockChart.jsx";
import { Brand } from "../components/Layout.jsx";
import "../styles/dashboardpage.css";

export default function StockDetail() {
  const { symbol } = useParams();
  const sym = symbol.toUpperCase();
  const price = basePriceOf(sym);
  const change = baseChangeOf(sym);

  return (
    <div className="app-shell dash-page">
      <header className="app-header header-blur">
        <div className="header-container">
          <Brand />
          <Link to="/dashboard" className="header-back"><i className="bi bi-arrow-left"></i> Back</Link>
        </div>
      </header>

      <main className="detail-main">
        <section className="surface detail-panel">
          <div className="chart-head">
            <div className="chart-title"><h2>{sym}</h2><span className="chart-name">{nameOf(sym)}</span></div>
            <div className="chart-quote">
              <span className="chart-price">${price.toFixed(2)}</span>
              <span className={"chart-change " + (change >= 0 ? "is-up" : "is-down")}>{change >= 0 ? "+" : ""}{change.toFixed(2)}%</span>
            </div>
            <Link to="/dashboard" className="button button-light">Trade this stock</Link>
          </div>
          <div className="detail-chart"><StockChart symbol={sym} /></div>
        </section>
      </main>

      <footer className="app-footer">
        <span>Educational demo only. Developed By Team CodeGeass&reg;</span>
      </footer>
    </div>
  );
}
