import { useState } from "react";

function Settings() {
  const [settings, setSettings] = useState({
    cryptoReports: true,
    buildLogs: true,
    verbose: false,
    theme: "dark"
  });

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      <div className="bg-white border-2 border-gray-400">
        <div className="px-3 py-2 bg-gray-200 border-b-2 border-gray-400">
          <h3 className="text-xs font-bold text-gray-900 uppercase">System Configuration</h3>
          <p className="text-xs text-gray-700 mt-0.5">Manage application preferences</p>
        </div>
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-gray-400">
            <div className="flex-1">
              <h4 className="text-xs font-bold text-gray-900">Enable Cryptographic Reports</h4>
              <p className="text-xs text-gray-700 mt-0.5">Generate RSA-signed audit trails for tamper detection</p>
            </div>
            <div className="ml-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.cryptoReports}
                  onChange={(e) => setSettings({...settings, cryptoReports: e.target.checked})}
                  className="w-4 h-4 border-2 border-gray-600"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-400">
            <div className="flex-1">
              <h4 className="text-xs font-bold text-gray-900">Save Build Logs</h4>
              <p className="text-xs text-gray-700 mt-0.5">Preserve detailed transformation logs for debugging</p>
            </div>
            <div className="ml-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.buildLogs}
                  onChange={(e) => setSettings({...settings, buildLogs: e.target.checked})}
                  className="w-4 h-4 border-2 border-gray-600"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-gray-400">
            <div className="flex-1">
              <h4 className="text-xs font-bold text-gray-900">Verbose Output</h4>
              <p className="text-xs text-gray-700 mt-0.5">Display detailed progress during obfuscation</p>
            </div>
            <div className="ml-3">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.verbose}
                  onChange={(e) => setSettings({...settings, verbose: e.target.checked})}
                  className="w-4 h-4 border-2 border-gray-600"
                />
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex-1">
              <h4 className="text-xs font-bold text-gray-900">Theme</h4>
              <p className="text-xs text-gray-700 mt-0.5">Select interface color scheme</p>
            </div>
            <div className="ml-3">
              <select
                value={settings.theme}
                onChange={(e) => setSettings({...settings, theme: e.target.value})}
                className="px-2 py-1 text-xs border-2 border-gray-400 bg-white"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-400">
        <div className="px-3 py-2 bg-gray-200 border-b-2 border-gray-400">
          <h3 className="text-xs font-bold text-gray-900 uppercase">Advanced Options</h3>
        </div>
        <div className="p-3 space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Output Directory</label>
            <input type="text" defaultValue="./build/obfuscated_output/" className="w-full px-2 py-1 text-xs border-2 border-gray-400 bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">LLVM Path</label>
            <input type="text" defaultValue="/usr/lib/llvm-15" className="w-full px-2 py-1 text-xs border-2 border-gray-400 bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Random Seed (for reproducible builds)</label>
            <input type="number" defaultValue="31415926" className="w-full px-2 py-1 text-xs border-2 border-gray-400 bg-white" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button className="px-4 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium border-2 border-gray-600">
          SAVE SETTINGS
        </button>
      </div>
    </div>
  );
}

export default Settings;

