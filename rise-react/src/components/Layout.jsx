import { Link, useNavigate } from "react-router-dom";

export function Brand() {
  return (
    <Link to="/" className="brand">
      <img src="/assets/image.png" alt="logo" />
      <span className="brand-title">RISE</span>
    </Link>
  );
}

export function HomeHeader() {
  return (
    <header className="header-blur">
      <section className="flex">
        <Brand />
        <nav className="nav">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#reviews">Reviews</a>
          <a href="#graphs">Markets</a>
        </nav>
        <Link to="/login" className="btn-cta">Get started</Link>
      </section>
    </header>
  );
}

export function MissionHeader({ badge, links }) {
  return (
    <header className="header-blur mission-header">
      <Brand />
      <nav className="mission-nav">
        {links.map(function (l) {
          return <Link key={l.to} to={l.to}>{l.label}</Link>;
        })}
      </nav>
      <span className="mission-badge">{badge}</span>
    </header>
  );
}

const NAV = [
  { id: "home", label: "Home", icon: "bi-house", path: "/welcome" },
  { id: "trade", label: "Trade", icon: "bi-graph-up", path: "/dashboard" },
  { id: "missions", label: "Missions", icon: "bi-fire", path: "/missions" },
  { id: "ai", label: "AI Trader", icon: "bi-robot", path: "/ai-trader" },
  { id: "exit", label: "Exit to Home", icon: "bi-arrow-left", path: "/" },
];

export function Sidebar({ active, user, onLogout }) {
  const goTo = useNavigate();
  const initials = user.name.split(" ").map(function (p) { return p[0]; }).join("").slice(0, 2).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-top">
        <div className="sidebar-brand">
          <img src="/assets/image.png" alt="RISE" />
          <span>RISE</span>
        </div>
      </div>
      <div className="sidebar-user">
        <div className="user-avatar">{initials}</div>
        <div className="user-info">
          <div className="user-name">{user.name}</div>
          <div className="user-status"><span className="status-dot"></span> Active session</div>
        </div>
      </div>
      <nav className="sidebar-nav">
        {NAV.map(function (item) {
          return (
            <div key={item.id} className={item.id === active ? "nav-item active" : "nav-item"} onClick={() => goTo(item.path)}>
              <i className={"bi " + item.icon}></i> {item.label}
            </div>
          );
        })}
      </nav>
      <div className="btn-logout" onClick={onLogout}>
        <i className="bi bi-box-arrow-left"></i> Sign Out
      </div>
    </aside>
  );
}
