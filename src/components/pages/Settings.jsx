import { useState } from "react";
import { Home, ChevronRight, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    cryptoReports: true,
    buildLogs: true,
    verbose: false,
    theme: "dark"
  });

  const toggleSetting = (key) => (event) => {
    setSettings({ ...settings, [key]: event.target.checked ?? event.target.value });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button 
            onClick={() => navigate('/obfuscation')}
            className="hover:text-gray-900 transition-colors"
          >
            <Home className="h-4 w-4" />
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">Settings</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Manage application preferences and configuration</p>
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">System Configuration</h3>
            <p className="text-sm text-gray-600 mt-1">Configure general application behavior</p>
          </div>
          <div className="p-6 space-y-4">
          {[
            {
              key: "cryptoReports",
              title: "Enable Cryptographic Reports",
              description: "Generate RSA-signed audit trails for tamper detection"
            },
            {
              key: "buildLogs",
              title: "Save Build Logs",
              description: "Preserve detailed transformation logs for debugging"
            },
            {
              key: "verbose",
              title: "Verbose Output",
              description: "Display detailed progress during obfuscation"
            }
          ].map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between rounded-lg border border-gray-300 p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex-1 pr-4">
                <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[item.key]}
                  onChange={toggleSetting(item.key)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:bg-gray-600 transition-colors"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow peer-checked:translate-x-5 transition-transform"></div>
              </label>
            </div>
          ))}

          </div>
        </div>

        {/* Advanced Options */}
        <div className="bg-white border border-gray-300 rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Advanced Options</h3>
            <p className="text-sm text-gray-600 mt-1">Configure paths and build settings</p>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Output Directory</label>
              <input 
                type="text" 
                defaultValue="./build/obfuscated_output/" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">LLVM Path</label>
              <input 
                type="text" 
                defaultValue="/usr/lib/llvm-15" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500" 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Random Seed (for reproducible builds)</label>
              <input 
                type="number" 
                defaultValue="31415926" 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500" 
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end mt-6">
          <button className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2">
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;

