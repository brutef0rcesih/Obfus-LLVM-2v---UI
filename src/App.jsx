import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "./App.css";
import Sidebar from "./components/Navbar/Sidebar";
import TopNavbar from "./components/Navbar/TopNavbar";
import UploadSidebar from "./components/Navbar/UploadSidebar";
import Obfuscation from "./components/Obfuscation";
import FileUploadSection from "./components/obfuscation/FileUploadSection";
import Configuration from "./components/obfuscation/Configuration";
import ConfigurationPage from "./components/pages/ConfigurationPage";
import ProgressSection from "./components/obfuscation/ProgressSection";
import OutputDirectory from "./components/pages/OutputDirectory";

function App() {
  const location = useLocation();
  const [uploadSidebarOpen, setUploadSidebarOpen] = useState(true);

  // Routes that should show UploadSidebar instead of regular Sidebar
  const obfuscationRoutes = [
    '/obfuscation',
    '/obfuscation/upload',
    '/obfuscation/configuration',
    '/obfuscation/progress',
    '/obfuscation/result'
  ];

  const showUploadSidebar = obfuscationRoutes.includes(location.pathname);

  const getActiveItem = () => {
    if (location.pathname === '/obfuscation' || location.pathname === '/obfuscation/upload') return 'upload';
    if (location.pathname === '/obfuscation/configuration') return 'configuration';
    if (location.pathname === '/obfuscation/progress') return 'progress';
    if (location.pathname === '/obfuscation/result') return 'report';
    if (location.pathname === '/obfuscation/output-directory') return 'output';
    return 'upload';
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Top Navbar */}
      <TopNavbar />

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {showUploadSidebar && (
          <UploadSidebar 
            isOpen={uploadSidebarOpen} 
            onToggle={() => setUploadSidebarOpen(!uploadSidebarOpen)}
            activeItem={getActiveItem()}
          />
        )}

        <main className="flex-1 overflow-auto">
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

      {/* Footer */}
      <footer className="border-t border-gray-300 bg-gray-800 px-6 py-3">
        <div className="text-xs text-gray-200 text-center">
          <p className="font-medium text-sm">Version 2.0.0v</p>
          <p className="mt-1 text-xs">© 2025 Obfus-LLVM</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
