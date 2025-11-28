import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Navbar/Sidebar";
import TopNavbar from "./components/Navbar/TopNavbar";
import Obfuscation from "./components/Obfuscation";
import NewObfuscation from "./components/NewObfuscation";
import AutoObfuscation from "./components/pages/AutoObfuscation";

import History from "./components/pages/History";
import Settings from "./components/pages/Settings";
import Configuration from "./components/pages/Configuration";
import ClientConfiguration from "./components/pages/ClientConfiguration";
import ParametersStep from "./components/obfuscation/ParametersStep";

function App() {
  return (
    <div className="flex flex-col h-screen  bg-gray-50 ">
      <TopNavbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto ">
          <div className="py-2">
            <Routes>
              <Route path="/" element={<Navigate to="/obfuscation" replace />} />
              <Route path="/obfuscation" element={<NewObfuscation />} />
              <Route path="/obfuscation/upload" element={<Obfuscation step="upload" />} />
              <Route path="/obfuscation/progress" element={<Obfuscation step="progress" />} />
              <Route path="/obfuscation/result" element={<Obfuscation step="result" />} />
              <Route path="/auto-obfuscation" element={<AutoObfuscation />} />
              <Route path="/configuration" element={<Configuration />} />
              <Route path="/obfuscation/configuration" element={<Configuration />} />
              <Route path="/history" element={<History />} />
              <Route path="/client-configuration" element={<ClientConfiguration />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
      <div className="border-t border-gray-300 bg-gray-800 px-6 py-3">
        <div className="text-xs text-gray-200 text-center">
          <p className="font-medium text-sm">Version 1.0.0</p>
          <p className="mt-1 text-xs">© 2025 Obfus-LLVM</p>
        </div>
      </div>
    </div>
  );
}

export default App;
