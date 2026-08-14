import React from 'react';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Welcome from './pages/Welcome.jsx';

export default function App() {
  return (
    <div className="app-container">
      <Home />
      <Login />
      <Welcome />
    </div>
  );
}
