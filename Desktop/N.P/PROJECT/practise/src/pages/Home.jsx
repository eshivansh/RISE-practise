import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Welcome to RISE Practise 🚀</h1>
      <p>This is the home page of your app.</p>
      <nav>
        <ul>
          <li><Link to="/login">Login</Link></li>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/missions">Missions</Link></li>
        </ul>
      </nav>
    </div>
  );
}
