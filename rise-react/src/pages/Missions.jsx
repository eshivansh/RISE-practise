import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MissionHeader } from "../components/Layout.jsx";
import useLocalStorage from "../hooks/useLocalStorage.js";
import "../styles/missions.css";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

const taskList = [
  { id: "visit", title: "Open your Missions board", desc: "Show up. That is half of trading discipline.", xp: 10 },
  { id: "chart", title: "Study a stock chart", desc: "Pick any stock on the Trade page and open it.", xp: 20 },
  { id: "trade", title: "Make one demo trade", desc: "Buy or sell any stock with your practice money.", xp: 30 },
  { id: "ai", title: "Ask the AI coach a question", desc: "Use the coach panel on the Trade page.", xp: 20 },
];

const MISSION_LINKS = [
  { to: "/welcome", label: "Home" },
  { to: "/dashboard", label: "Trade" },
  { to: "/ai-trader", label: "AI Trader" },
];

export default function Missions() {
  const goTo = useNavigate();
  const [streak, setStreak] = useLocalStorage("rise_streak", { count: 0, lastDay: "" });
  const [xp, setXp] = useLocalStorage("rise_xp", 0);
  const [, setRefresh] = useState(0);

  useEffect(function () {
    const today = todayStr();

    if (streak.lastDay !== today) {
      if (streak.lastDay === yesterdayStr()) {
        setStreak({ count: streak.count + 1, lastDay: today });
      } else {
        setStreak({ count: 1, lastDay: today });
      }
    }

    localStorage.setItem(`rise_task_visit_${today}`, "1");

    let earned = 0;
    taskList.forEach(function (t) {
      const done = localStorage.getItem(`rise_task_${t.id}_${today}`);
      const paid = localStorage.getItem(`rise_xp_given_${t.id}_${today}`);
      if (done && !paid) {
        earned += t.xp;
        localStorage.setItem(`rise_xp_given_${t.id}_${today}`, "1");
      }
    });
    if (earned > 0) {
      setXp(xp + earned);
    }
    setRefresh(function (n) {
      return n + 1;
    });
  }, []);

  const today = todayStr();
  const level = Math.floor(xp / 100) + 1;
  const intoLevel = xp - (level - 1) * 100;

  const doneCount = taskList.filter(function (t) {
    return localStorage.getItem(`rise_task_${t.id}_${today}`);
  }).length;

  return (
    <div className="missions-page">
      <MissionHeader badge={`Level ${level}`} links={MISSION_LINKS} />

      <main className="missions-main">
        <h1 className="missions-title">Daily Missions</h1>
        <p className="missions-sub">Build a trading habit. Complete tasks, keep your streak alive, earn XP.</p>

        <div className="missions-stats">
          <div className="m-stat">
            <div className="m-stat-big">🔥 {streak.count}</div>
            <div className="m-stat-label">Day streak</div>
            <div className="streak-track">
              {[6, 5, 4, 3, 2, 1, 0].map(function (i) {
                return (
                  <div className={i < streak.count ? "streak-day lit" : "streak-day"} key={i}></div>
                );
              })}
            </div>
          </div>
          <div className="m-stat">
            <div className="m-stat-big">{xp} XP</div>
            <div className="m-stat-label">Level {level} — {intoLevel}/100 to next</div>
            <div className="xp-bar"><div className="xp-fill" style={{ width: `${intoLevel}%` }}></div></div>
          </div>
          <div className="m-stat">
            <div className="m-stat-big">{doneCount}/{taskList.length}</div>
            <div className="m-stat-label">Tasks done today</div>
          </div>
        </div>

        <div className="task-panel">
          <div className="task-panel-head">
            <h2>Today's Tasks</h2>
            <button className="task-go" type="button" onClick={() => goTo("/dashboard")}>Go Trade</button>
          </div>
          {taskList.map(function (t) {
            const done = localStorage.getItem(`rise_task_${t.id}_${today}`);
            return (
              <div className="task-row" key={t.id}>
                <div className={done ? "task-check done" : "task-check"}>{done ? "✓" : ""}</div>
                <div className="task-info">
                  <div className="task-title">{t.title}</div>
                  <div className="task-desc">{t.desc}</div>
                </div>
                <div className="task-xp">+{t.xp} XP</div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
