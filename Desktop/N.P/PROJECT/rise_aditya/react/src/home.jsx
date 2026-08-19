import { useEffect } from "react";
import { Link } from "react-router-dom";
import TradingViewWidget from "../components/TradingViewWidget.jsx";
import "../styles/homepage.css";

const tickers = [
  { sym: "AAPL", price: "189.42", chg: "+1.24%", up: true },
  { sym: "GOOGL", price: "174.15", chg: "+0.87%", up: true },
  { sym: "NVDA", price: "924.73", chg: "+3.12%", up: true },
  { sym: "TSLA", price: "177.58", chg: "-1.45%", up: false },
  { sym: "MSFT", price: "415.32", chg: "+0.56%", up: true },
  { sym: "META", price: "502.77", chg: "+2.01%", up: true },
  { sym: "AMZN", price: "186.13", chg: "+0.15%", up: true },
  { sym: "AMD", price: "160.20", chg: "-2.40%", up: false },
  { sym: "BTC", price: "64,250", chg: "+1.50%", up: true },
  { sym: "ETH", price: "3,450", chg: "+2.10%", up: true },
  { sym: "NFLX", price: "610.50", chg: "-0.80%", up: false },
  { sym: "COIN", price: "225.30", chg: "+4.20%", up: true },
];

const boxes = [
  { icon: "bi-graph-up-arrow", title: "Grow Your Wealth", text: "Invest in high-growth markets with smart strategies designed to maximize your long-term returns." },
  { icon: "bi-lightbulb", title: "AI Smart Advisor", text: "Get AI driven insights and expert guidance to make confident financial suggestions." },
  { icon: "bi-shield-check", title: "Secure Platform", text: "Advanced encryption and multi-layer protection keep your investments completely safe." },
  { icon: "bi-credit-card", title: "Instant Payments", text: "Deposit and invest instantly with seamless and secure payment integrations." },
  { icon: "bi-wallet2", title: "Fast Withdrawals", text: "Access your funds anytime with quick and hassle-free withdrawal processes." },
  { icon: "bi-headset", title: "24/7 Support", text: "Our support team is always available to help you whenever you need assistance." },
];

const reviews = [
  { img: "harshad.jpeg", name: "Harshad Mehta", text: '"Harshad Mehta\'s stock market wisdom: blend astute analysis with calculated risk, navigating the market\'s ebbs and flows."' },
  { img: "bill.jpeg", name: "Warren Buffet", text: '"In the stock market maze, wisdom, patience, and knowledge guide decisions toward artful investment."' },
  { img: "rakesh.jpeg", name: "Rakesh Jhunjhunwala", text: '"In the realm of stocks, Rakesh Jhunjhunwala crafts wealth through insight, courage, and strategic vision."' },
  { img: "DP.png", name: "Mr Yogendra", text: '"The Product is Fantastic and 24/7 Support is Impeccable."' },
  { img: "harshad.jpeg", name: "Harshad Mehta", text: '"Harshad Mehta\'s stock market wisdom: blend astute analysis with calculated risk, navigating the market\'s ebbs and flows."' },
  { img: "bill.jpeg", name: "Warren Buffet", text: '"In the stock market maze, wisdom, patience, and knowledge guide decisions toward artful investment."' },
];

const charts = [
  { name: "Apple", label: "NASDAQ: AAPL", symbol: "NASDAQ:AAPL" },
  { name: "Microsoft", label: "NASDAQ: MSFT", symbol: "NASDAQ:MSFT" },
  { name: "Google", label: "NASDAQ: GOOGL", symbol: "NASDAQ:GOOGL" },
  { name: "Meta", label: "NASDAQ: META", symbol: "NASDAQ:META" },
  { name: "Tesla", label: "NASDAQ: TSLA", symbol: "NASDAQ:TSLA" },
  { name: "Amazon", label: "NASDAQ: AMZN", symbol: "NASDAQ:AMZN" },
];

export default function Home() {
  useEffect(function () {
    const items = document.querySelectorAll(".reveal");
    const watcher = new IntersectionObserver(function (entries) {
      for (let i = 0; i < entries.length; i++) {
        if (entries[i].isIntersecting) {
          entries[i].target.classList.add("visible");
        }
      }
    }, { threshold: 0.1 });

    for (let i = 0; i < items.length; i++) {
      watcher.observe(items[i]);
    }
    return function () {
      watcher.disconnect();
    };
  }, []);

  let tickerRows = [];
  let twice = tickers.concat(tickers);
  for (let i = 0; i < twice.length; i++) {
    let t = twice[i];
    let color = "dn";
    if (t.up) {
      color = "up";
    }
    tickerRows.push(
      <div className="ticker-item" key={i}>
        <span className="ticker-sym">{t.sym}</span>
        <span className="ticker-price">${t.price}</span>
        <span className={"ticker-chg " + color}>{t.chg}</span>
      </div>
    );
  }

  let boxRows = [];
  for (let i = 0; i < boxes.length; i++) {
    let b = boxes[i];
    boxRows.push(
      <div className="box" key={b.title}>
        <i className={"bi " + b.icon}></i>
        <h3>{b.title}</h3>
        <p>{b.text}</p>
      </div>
    );
  }

  let reviewRows = [];
  for (let i = 0; i < reviews.length; i++) {
    let r = reviews[i];
    reviewRows.push(
      <div className="review-card" key={i}>
        <div className="review-user">
          <img src={"/assets/" + r.img} alt={r.name} />
          <div><h4>{r.name}</h4></div>
        </div>
        <hr className="review-divider" />
        <p className="review-text">{r.text}</p>
      </div>
    );
  }

  let chartRows = [];
  for (let i = 0; i < charts.length; i++) {
    let c = charts[i];
    chartRows.push(
      <div className="card" key={c.symbol}>
        <div className="card-top">{c.name} <span>{c.label}</span></div>
        <TradingViewWidget symbol={c.symbol} />
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="header-blur">
        <section className="flex">
          <Link to="/" className="brand">
            <img src="/assets/image.png" alt="logo" />
            <span className="brand-title">RISE</span>
          </Link>
          <nav className="nav">
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#reviews">Reviews</a>
            <a href="#graphs">Markets</a>
          </nav>
          <Link to="/login" className="btn-cta">Get started</Link>
        </section>
      </header>

      <div className="home" id="home">
        <video id="bg-video" autoPlay loop muted playsInline>
          <source src="/assets/Video2.mp4" type="video/mp4" />
        </video>

        <div className="hero-new reveal">
          <h1 className="hero-title-new">TRADE THE <br /><span className="accent">FUTURE</span></h1>
          <p className="hero-sub-new">Master the markets with institutional-grade AI, real-time execution, and a global community of elite traders.</p>
          <div className="hero-btns">
            <Link to="/login" className="cta-primary">Launch Terminal</Link>
          </div>
        </div>

        <div className="ticker-wrap">
          <div className="ticker-track" id="ticker">{tickerRows}</div>
        </div>
      </div>

      <section className="services reveal">
        <p className="section-label">Platform Features</p>
        <h2 className="section-heading">Everything you need to <em>grow</em></h2>
        <div className="box-container">{boxRows}</div>
      </section>

      <div className="about-new" id="about">
        <div className="container">
          <p className="section-label reveal">Our Mission</p>
          <div className="about-grid">
            <div className="about-text reveal">
              <h2 className="section-heading">Built by traders, <br /><em>for traders</em></h2>
              <p>RISE was built from the ground up with one belief: that sophisticated market tools shouldn't be reserved for Wall Street. We've democratized access to institutional-grade intelligence.</p>
              <p>From AI-driven trade coaching to real-time market feeds, every feature is engineered to give you an edge — whether you're making your first trade or your ten-thousandth.</p>
              <p>Our platform adapts to you. The more you use RISE, the smarter it gets at anticipating your needs, flagging your opportunities, and protecting your positions.</p>
              <Link to="/login" className="btn-cta" style={{ display: "inline-block", marginTop: "24px" }}>Join RISE Today</Link>
            </div>
            <div className="about-visual reveal">
              <img src="/assets/image2.jpeg" alt="Trading platform" />
            </div>
          </div>
        </div>
      </div>

      <section className="reviews reveal" id="reviews">
        <p className="section-label">Testimonials</p>
        <h2 className="section-heading">Loved by <em>traders</em> worldwide</h2>
        <div className="reviews-slider">
          <div className="reviews-track">{reviewRows}</div>
        </div>
      </section>

      <div className="numbers-section reveal">
        <div className="numbers-inner">
          <div className="num-box"><div className="num-val">500K+</div><div className="num-label">Active Traders</div></div>
          <div className="num-box"><div className="num-val">$2.4B</div><div className="num-label">Volume Traded</div></div>
          <div className="num-box"><div className="num-val">99.9%</div><div className="num-label">Uptime</div></div>
        </div>
      </div>

      <div className="stocks" id="graphs">
        <div className="container">
          <p className="section-label reveal">Live Markets</p>
          <h2 className="section-heading reveal">Today's <em>top movers</em></h2>
          <div className="grid">{chartRows}</div>
        </div>
      </div>

      <div className="cta-banner">
        <div className="cta-banner-inner reveal">
          <h2 className="cta-banner-title">READY TO <span>RISE?</span></h2>
          <p>Join thousands of traders who have already upgraded their intelligence. No credit card required to start your journey.</p>
          <Link to="/login" className="cta-primary">Create Free Account</Link>
        </div>
      </div>

      <footer className="footer-new">
        <div className="footer-grid">
          <div>
            <Link to="/" className="footer-brand">
              <img src="/assets/image.png" alt="logo" />
              <span>RISE</span>
            </Link>
            <p className="footer-desc">The next-generation trading platform built on AI, speed, and unwavering security. Your wealth starts here.</p>
          </div>
          <div>
            <div className="footer-heading">Navigate</div>
            <div className="footer-links">
              <a href="#home">Home</a>
              <a href="#about">About</a>
              <a href="#reviews">Reviews</a>
              <a href="#graphs">Markets</a>
            </div>
          </div>
          <div>
            <div className="footer-heading">Account</div>
            <div className="footer-links">
              <Link to="/login">Sign In</Link>
              <Link to="/login">Register</Link>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms</a>
            </div>
          </div>
          <div>
            <div className="footer-heading">Contact</div>
            <div className="footer-links">
              <a href="mailto:info@rise.com">info@rise.com</a>
              <a href="tel:+91 9XXXX XXXXX">+91 9XXXX XXXXX</a>
              <a href="#">GitHub</a>
              <a href="#">Instagram</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>Developed by Team CodeGeass&reg; | All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}