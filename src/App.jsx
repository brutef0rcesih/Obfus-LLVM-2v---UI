import { Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Sidebar from "./components/Navbar/Sidebar";
import TopNavbar from "./components/Navbar/TopNavbar";
import Obfuscation from "./components/Obfuscation";
import FileUploadSection from "./components/obfuscation/FileUploadSection";
import Configuration from "./components/obfuscation/Configuration";
import ConfigurationPage from "./components/pages/ConfigurationPage";
import ProgressSection from "./components/obfuscation/ProgressSection";
import OutputDirectory from "./components/pages/OutputDirectory";


function App() {
  return (
    <div className="flex flex-col h-screen  bg-gray-50 ">
      <TopNavbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1  overflow-auto">
          <div className="py-2">
            <Routes>
              <Route path="/" element={<Navigate to="/obfuscation" replace />} />
              <Route path="/obfuscation" element={<FileUploadSection />} />
              <Route path="/obfuscation/upload" element={<Obfuscation step="upload" />} />
              <Route path="/obfuscation/progress" element={<ProgressSection />} />
              <Route path="/obfuscation/result" element={<Obfuscation step="result" />} />
              <Route path="/obfuscation/configuration" element={<Configuration />} />
              <Route path="/obfuscation/output-directory" element={<OutputDirectory />} />
              <Route path="/configuration" element={<ConfigurationPage />} />
            </Routes>
          </div>
        </main>
      </div>
      <div className="border-t border-gray-300 bg-gray-800 px-6 py-3">
        <div className="text-xs text-gray-200 text-center">
          <p className="font-medium text-sm">Version 2.0.0v</p>
          <p className="mt-1 text-xs">© 2025 Obfus-LLVM</p>
        </div>
      </div>
    </div>
  );
}

export default App;
