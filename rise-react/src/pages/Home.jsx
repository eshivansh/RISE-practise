import { useEffect } from "react";
import { Link } from "react-router-dom";
import TradingViewWidget from "../components/TradingViewWidget.jsx";
import { HomeHeader } from "../components/Layout.jsx";
import { tickers, boxes, reviews, charts } from "../data/homeContent.js";
import "../styles/homepage.css";

export default function Home() {
  // Simple scroll animation — runs once on page load
  useEffect(function () {
    const items = document.querySelectorAll(".reveal");
    const watcher = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.classList.add("visible");
      });
    }, { threshold: 0.1 });
    items.forEach(function (el) { watcher.observe(el); });
    return function () { watcher.disconnect(); };
  }, []);

  const tickerItems = tickers.concat(tickers);

  return (
    <div className="home-page">
      <HomeHeader />

      <div className="home" id="home">
        <video id="bg-video" autoPlay loop muted playsInline>
          <source src="/assets/Video2.mp4" type="video/mp4" />
        </video>

        <div className="hero-new reveal">
          <h1 className="hero-title-new">TRADE THE <br /><span className="accent">FUTURE</span></h1>
          <p className="hero-sub-new">AI-powered trading tools for everyone.</p>
          <Link to="/login" className="cta-primary">Launch Terminal</Link>
        </div>

        <div className="ticker-wrap">
          <div className="ticker-track">
            {tickerItems.map(function (t, i) {
              return (
                <div className="ticker-item" key={i}>
                  <span className="ticker-sym">{t.sym}</span>
                  <span className="ticker-price">${t.price}</span>
                  <span className={"ticker-chg " + (t.up ? "up" : "dn")}>{t.chg}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <section className="services reveal">
        <p className="section-label">Features</p>
        <h2 className="section-heading">Everything to <em>grow</em></h2>
        <div className="box-container">
          {boxes.map(function (b) {
            return (
              <div className="box" key={b.title}>
                <i className={"bi " + b.icon}></i>
                <h3>{b.title}</h3>
                <p>{b.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="about-new" id="about">
        <div className="container">
          <div className="about-grid">
            <div className="about-text reveal">
              <p className="section-label">Our Mission</p>
              <h2 className="section-heading">Built for <em>traders</em></h2>
              <p>RISE gives you market tools that used to be only for professionals.</p>
              <p>Practice with demo money before risking real cash.</p>
              <Link to="/login" className="btn-cta about-cta">Join RISE</Link>
            </div>
            <div className="about-visual reveal">
              <img src="/assets/image2.jpeg" alt="Platform" />
            </div>
          </div>
        </div>
      </div>

      <section className="reviews reveal" id="reviews">
        <p className="section-label">Reviews</p>
        <h2 className="section-heading">Loved by <em>traders</em></h2>
        <div className="reviews-slider">
          <div className="reviews-track">
            {reviews.concat(reviews).map(function (r, i) {
              return (
                <div className="review-card" key={i}>
                  <div className="review-user">
                    <img src={"/assets/" + r.img} alt={r.name} />
                    <h4>{r.name}</h4>
                  </div>
                  <hr className="review-divider" />
                  <p className="review-text">{r.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="numbers-section reveal">
        <div className="numbers-inner">
          <div><div className="num-val">500K+</div><div className="num-label">Traders</div></div>
          <div><div className="num-val">$2.4B</div><div className="num-label">Volume</div></div>
          <div><div className="num-val">99.9%</div><div className="num-label">Uptime</div></div>
        </div>
      </div>

      <div className="stocks" id="graphs">
        <div className="container">
          <h2 className="section-heading reveal">Live <em>Markets</em></h2>
          <div className="grid">
            {charts.map(function (c) {
              return (
                <div className="card" key={c.symbol}>
                  <div className="card-top">{c.name} <span>{c.label}</span></div>
                  <TradingViewWidget symbol={c.symbol} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="cta-banner">
        <div className="cta-banner-inner reveal">
          <h2 className="cta-banner-title">READY TO <span>RISE?</span></h2>
          <p>Start free. No credit card needed.</p>
          <Link to="/login" className="cta-primary">Create Account</Link>
        </div>
      </div>

      <footer className="footer-new">
        <div className="footer-grid">
          <div>
            <Link to="/" className="footer-brand"><img src="/assets/image.png" alt="" /><span>RISE</span></Link>
            <p className="footer-desc">AI trading platform for beginners.</p>
          </div>
          <div>
            <div className="footer-heading">Links</div>
            <div className="footer-links">
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <Link to="/login">Login</Link>
            </div>
          </div>
        </div>
        <div className="footer-bottom">Team CodeGeass&reg; | All rights reserved.</div>
      </footer>
    </div>
  );
}
