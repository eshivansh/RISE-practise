import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Welcome from "./pages/Welcome.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import StockDetail from "./pages/StockDetail.jsx";
import Missions from "./pages/Missions.jsx";
import AiTrader from "./pages/AiTrader.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/welcome" element={<Welcome />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/stock/:symbol" element={<StockDetail />} />
      <Route path="/missions" element={<Missions />} />
      <Route path="/ai-trader" element={<AiTrader />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
