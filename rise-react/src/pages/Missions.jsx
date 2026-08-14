import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useLocalStorage from "../hooks/useLocalStorage.js";
import "../styles/missions.css";

function todayStr() {
  let d = new Date();
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

function yesterdayStr() {
  let d = new Date();
  d.setDate(d.getDate() - 1);
  return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
}

const taskList = [
  { id: "visit", title: "Open your Missions board", desc: "Show up. That is half of trading discipline.", xp: 10 },
  { id: "chart", title: "Study a stock chart", desc: "Pick any stock on the Trade page and open it.", xp: 20 },
  { id: "trade", title: "Make one demo trade", desc: "Buy or sell any stock with your practice money.", xp: 30 },
  { id: "ai", title: "Ask the AI coach a question", desc: "Use the coach panel on the Trade page.", xp: 20 },
];

export default function Missions() {
  const goTo = useNavigate();
  const [streak, setStreak] = useLocalStorage("rise_streak", { count: 0, lastDay: "" });
  const [xp, setXp] = useLocalStorage("rise_xp", 0);
  const [refresh, setRefresh] = useState(0);

  useEffect(function () {
    let today = todayStr();

    if (streak.lastDay !== today) {
      if (streak.lastDay === yesterdayStr()) {
        setStreak({ count: streak.count + 1, lastDay: today });
      } else {
        setStreak({ count: 1, lastDay: today });
      }
    }

    localStorage.setItem("rise_task_visit_" + today, "1");

    let earned = 0;
    for (let i = 0; i < taskList.length; i++) {
      let t = taskList[i];
      let done = localStorage.getItem("rise_task_" + t.id + "_" + today);
      let paid = localStorage.getItem("rise_xp_given_" + t.id + "_" + today);
      if (done && !paid) {
        earned = earned + t.xp;
        localStorage.setItem("rise_xp_given_" + t.id + "_" + today, "1");
      }
    }
    if (earned > 0) {
      setXp(xp + earned);
    }
    setRefresh(refresh + 1);
  }, []);

  let today = todayStr();
  let level = Math.floor(xp / 100) + 1;
  let intoLevel = xp - (level - 1) * 100;

  let doneCount = 0;
  let taskRows = [];
  for (let i = 0; i < taskList.length; i++) {
    let t = taskList[i];
    let done = localStorage.getItem("rise_task_" + t.id + "_" + today);
    if (done) {
      doneCount = doneCount + 1;
    }

    let boxClass = "task-check";
    if (done) {
      boxClass = "task-check done";
    }

    taskRows.push(
      <div className="task-row" key={t.id}>
        <div className={boxClass}>{done ? "✓" : ""}</div>
        <div className="task-info">
          <div className="task-title">{t.title}</div>
          <div className="task-desc">{t.desc}</div>
        </div>
        <div className="task-xp">+{t.xp} XP</div>
      </div>
    );
  }

  let streakDays = [];
  for (let i = 6; i >= 0; i--) {
    let filled = i < streak.count;
    let cls = "streak-day";
    if (filled) {
      cls = "streak-day lit";
    }
    streakDays.push(<div className={cls} key={i}></div>);
  }

  return (
    <div className="missions-page">
      <header className="header-blur mission-header">
        <Link to="/" className="brand">
          <img src="/assets/image.png" alt="logo" />
          <span className="brand-title">RISE</span>
        </Link>
        <nav className="mission-nav">
          <Link to="/welcome">Home</Link>
          <Link to="/dashboard">Trade</Link>
          <Link to="/ai-trader">AI Trader</Link>
        </nav>
        <span className="mission-level">Level {level}</span>
      </header>

      <main className="missions-main">
        <h1 className="missions-title">Daily Missions</h1>
        <p className="missions-sub">Build a trading habit. Complete tasks, keep your streak alive, earn XP.</p>

        <div className="missions-stats">
          <div className="m-stat">
            <div className="m-stat-big">🔥 {streak.count}</div>
            <div className="m-stat-label">Day streak</div>
            <div className="streak-track">{streakDays}</div>
          </div>
          <div className="m-stat">
            <div className="m-stat-big">{xp} XP</div>
            <div className="m-stat-label">Level {level} — {intoLevel}/100 to next</div>
            <div className="xp-bar"><div className="xp-fill" style={{ width: intoLevel + "%" }}></div></div>
          </div>
          <div className="m-stat">
            <div className="m-stat-big">{doneCount}/{taskList.length}</div>
            <div className="m-stat-label">Tasks done today</div>
          </div>
        </div>

        <div className="task-panel">
          <div className="task-panel-head">
            <h2>Today's Tasks</h2>
            <button className="task-go" onClick={() => goTo("/dashboard")}>Go Trade</button>
          </div>
          {taskRows}
        </div>
      </main>
    </div>
  );
}
