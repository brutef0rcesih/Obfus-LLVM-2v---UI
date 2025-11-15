import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Obfuscation from "./components/Obfuscation";
import History from "./components/History";
import Settings from "./components/Settings";

function App() {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Navbar - Full Width */}
      <Navbar />

      {/* Sidebar and Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />

        {/* Main Content */}
        <main className="flex-1 overflow-hidden bg-gray-50 p-4">
          <Routes>
            <Route path="/" element={<Navigate to="/obfuscation" replace />} />
            <Route path="/obfuscation" element={<Obfuscation />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default App;
