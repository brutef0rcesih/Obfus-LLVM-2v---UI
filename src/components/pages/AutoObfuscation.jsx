import React, { useState } from 'react';
import { ChevronRight, Home, Play, Settings, FolderOpen, FileText, Zap, Shield, Clock, CheckCircle2, XCircle, Info, Plus, Download, MoreHorizontal, BarChart3, FolderOutput } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AutoObfuscation() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('logs');
  const [isRunning, setIsRunning] = useState(false);
  const [serviceStatus, setServiceStatus] = useState('stopped');
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const [config, setConfig] = useState({
    watchDir: 'C:\\Projects\\src',
    watchRecursive: true,
    outputDir: 'C:\\Obfuscated',
    outputPattern: '{filename}_obfuscated',
    includePatterns: '.c,.cpp,.h,.hpp',
    excludePatterns: '_test.c,/test/,/build/*',
    triggerMode: 'watch',
    scheduleStartTime: '09:00',
    scheduleStopTime: '18:00',
    strength: 'balanced',
    antiDebug: false,
    generateReports: true,
    workerThreads: 2,
  });

  const [processedFiles, setProcessedFiles] = useState([
    {
      id: 1,
      fileName: "main.cpp",
      status: "Complete",
      time: "10:30:15",
      date: "2025-11-28",
      size: "1.2 MB",
      protection: "Balanced",
      score: 92
    },
    {
      id: 2,
      fileName: "utils.h",
      status: "Complete",
      time: "10:30:18",
      date: "2025-11-28",
      size: "45 KB",
      protection: "Balanced",
      score: 88
    },
    {
      id: 3,
      fileName: "network.cpp",
      status: "In Progress",
      time: "10:31:00",
      date: "2025-11-28",
      size: "2.5 MB",
      protection: "High",
      score: 0
    }
  ]);

  const handleStartService = () => {
    setIsRunning(true);
    setServiceStatus('running');
  };

  const handleStopService = () => {
    setIsRunning(false);
    setServiceStatus('stopped');
  };

  const handleSaveConfig = () => {
    setActiveTab('logs');
  };

  const toggleDropdown = (id) => {
    setDropdownOpen(dropdownOpen === id ? null : id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Complete': return 'bg-green-100 text-green-700 border-green-200';
      case 'In Progress': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Failed': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
          <button
            onClick={() => navigate('/obfuscation')}
            className="hover:text-gray-900 transition-colors"
          >
            <Home className="h-4 w-4" />
          </button>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">Auto Obfuscation</span>
        </nav>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Auto Obfuscation Service</h1>
              <p className="text-gray-600 mt-1">Automated file monitoring and protection service</p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                serviceStatus === 'running' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                <div className={`w-2 h-2 rounded-full mr-2 ${
                  serviceStatus === 'running' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                {serviceStatus === 'running' ? 'Service Running' : 'Service Stopped'}
              </div>
              {serviceStatus === 'running' ? (
                <button
                  onClick={handleStopService}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Stop Service
                </button>
              ) : (
                <button
                  onClick={handleStartService}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Start Service
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1 border-b border-gray-200 pt-4">
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'logs'
                  ? 'border-gray-700 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Processed Files
            </button>
            <button
              onClick={() => setActiveTab('configure')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'configure'
                  ? 'border-gray-700 text-gray-900'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Configuration
            </button>
          </div>
        </div>

        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search processed files..."
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  Filter
                </button>
                <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                  Export Log
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">File Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Protection</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Size</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processedFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <FileText className="h-4 w-4 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">{file.fileName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded border ${getStatusColor(file.status)}`}>
                          {file.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-700">{file.protection}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{file.date}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{file.time}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-600">{file.size}</span>
                      </td>
                      <td className="px-4 py-3">
                        {file.score > 0 ? (
                          <span className="text-sm font-medium text-gray-900">{file.score}/100</span>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 relative">
                        <button
                          onClick={() => toggleDropdown(file.id)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-500" />
                        </button>
                        {dropdownOpen === file.id && (
                          <div className="absolute right-8 top-8 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[160px]">
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                              <Download className="w-4 h-4 mr-2 text-gray-500" />
                              Download Report
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                              <FolderOutput className="w-4 h-4 mr-2 text-gray-500" />
                              Open Location
                            </button>
                            <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center">
                              <BarChart3 className="w-4 h-4 mr-2 text-gray-500" />
                              View Analysis
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'configure' && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 flex items-center">
                  <FolderOpen className="h-4 w-4 mr-2 text-gray-700" />
                  Watch Directory
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Directory Path
                    </label>
                    <input
                      type="text"
                      value={config.watchDir}
                      onChange={(e) => setConfig({ ...config, watchDir: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm"
                      placeholder="C:\Projects\src"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="recursive"
                      checked={config.watchRecursive}
                      onChange={(e) => setConfig({ ...config, watchRecursive: e.target.checked })}
                      className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-700"
                    />
                    <label htmlFor="recursive" className="ml-2 text-sm text-gray-700">
                      Watch subdirectories recursively
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 flex items-center">
                  <FolderOutput className="h-4 w-4 mr-2 text-gray-700" />
                  Output Configuration
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Output Directory
                    </label>
                    <input
                      type="text"
                      value={config.outputDir}
                      onChange={(e) => setConfig({ ...config, outputDir: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm"
                      placeholder="C:\Obfuscated"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Filename Pattern
                    </label>
                    <input
                      type="text"
                      value={config.outputPattern}
                      onChange={(e) => setConfig({ ...config, outputPattern: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm"
                      placeholder="{filename}_obfuscated"
                    />
                    <p className="text-xs text-gray-500 mt-1">Use {'{filename}'} as placeholder</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 flex items-center">
                  <Zap className="h-4 w-4 mr-2 text-gray-700" />
                  File Filters
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Include Patterns
                    </label>
                    <input
                      type="text"
                      value={config.includePatterns}
                      onChange={(e) => setConfig({ ...config, includePatterns: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm"
                      placeholder=".c,.cpp,.h,.hpp"
                    />
                    <p className="text-xs text-gray-500 mt-1">Comma-separated file extensions</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Exclude Patterns
                    </label>
                    <input
                      type="text"
                      value={config.excludePatterns}
                      onChange={(e) => setConfig({ ...config, excludePatterns: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm"
                      placeholder="_test.c,/test/,/build/*"
                    />
                    <p className="text-xs text-gray-500 mt-1">Patterns to exclude from processing</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200"></div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-gray-700" />
                  Trigger Mode
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setConfig({ ...config, triggerMode: 'watch' })}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      config.triggerMode === 'watch'
                        ? 'border-gray-700 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm">Watch</div>
                    <div className="text-xs text-gray-600 mt-0.5">Immediate processing</div>
                  </button>
                  <button
                    onClick={() => setConfig({ ...config, triggerMode: 'schedule' })}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      config.triggerMode === 'schedule'
                        ? 'border-gray-700 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm">Schedule</div>
                    <div className="text-xs text-gray-600 mt-0.5">Scheduled times</div>
                  </button>
                </div>

                {config.triggerMode === 'watch' && (
                  <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Watch Path
                    </label>
                    <input
                      type="text"
                      value={config.watchDir}
                      onChange={(e) => setConfig({ ...config, watchDir: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm"
                      placeholder="C:\Projects\src"
                    />
                    <p className="text-xs text-gray-500 mt-1">Directory to monitor for file changes</p>
                  </div>
                )}

                {config.triggerMode === 'schedule' && (
                  <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={config.scheduleStartTime}
                        onChange={(e) => setConfig({ ...config, scheduleStartTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Service starts monitoring</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Stop Time
                      </label>
                      <input
                        type="time"
                        value={config.scheduleStopTime}
                        onChange={(e) => setConfig({ ...config, scheduleStopTime: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">Service stops monitoring</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200"></div>

              <div className="space-y-3">
                <h3 className="text-base font-semibold text-gray-900 flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-gray-700" />
                  Obfuscation Settings
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Protection Strength
                    </label>
                    <select
                      value={config.strength}
                      onChange={(e) => setConfig({ ...config, strength: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm"
                    >
                      <option value="fast">Fast - String + Symbol obfuscation</option>
                      <option value="balanced">Balanced - + Control flow (recommended)</option>
                      <option value="medium">Medium - + Flattening</option>
                      <option value="ultra">Ultra - Maximum protection</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Worker Threads
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="8"
                      value={config.workerThreads}
                      onChange={(e) => setConfig({ ...config, workerThreads: parseInt(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="antiDebug"
                        checked={config.antiDebug}
                        onChange={(e) => setConfig({ ...config, antiDebug: e.target.checked })}
                        className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-700"
                      />
                      <label htmlFor="antiDebug" className="ml-2 text-sm text-gray-700">
                        Enable anti-debug protection
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="reports"
                        checked={config.generateReports}
                        onChange={(e) => setConfig({ ...config, generateReports: e.target.checked })}
                        className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-700"
                      />
                      <label htmlFor="reports" className="ml-2 text-sm text-gray-700">
                        Generate obfuscation reports
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleSaveConfig}
                  className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AutoObfuscation;