import { useParams, Link } from "react-router-dom";
import { nameOf, basePriceOf, baseChangeOf } from "../data/stocks.js";
import StockChart from "../components/StockChart.jsx";
import "../styles/dashboardpage.css";
import "../styles/extra.css";

export default function StockDetail() {
  const params = useParams();
  let sym = params.symbol.toUpperCase();

  let price = basePriceOf(sym);
  let change = baseChangeOf(sym);

  let changeClass = "chart-change is-up";
  let sign = "+";
  if (change < 0) {
    changeClass = "chart-change is-down";
    sign = "";
  }

  return (
    <div className="app-shell dash-page">
      <header className="app-header header-blur">
        <div className="header-container">
          <Link to="/" className="brand">
            <img src="/assets/image.png" alt="logo" />
            <span className="brand-title">RISE</span>
          </Link>
          <Link to="/dashboard" className="header-back"><i className="bi bi-arrow-left"></i> Back to Dashboard</Link>
        </div>
      </header>

      <main className="detail-main">
        <section className="surface detail-panel">
          <div className="chart-head">
            <div className="chart-title">
              <h2>{sym}</h2>
              <span className="chart-name">{nameOf(sym)}</span>
            </div>
            <div className="chart-quote">
              <span className="chart-price">${price.toFixed(2)}</span>
              <span className={changeClass}>{sign}{change.toFixed(2)}%</span>
            </div>
            <Link to="/dashboard" className="button button-light">Trade this stock</Link>
          </div>
          <div className="detail-chart">
            <StockChart symbol={sym} />
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <span>Educational demo trading only — no real money involved. Developed By Team CodeGeass&reg;</span>
      </footer>
    </div>
  );
}
