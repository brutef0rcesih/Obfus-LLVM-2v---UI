import { Plus, Download, Clock, Shield, FileText, MoreVertical, Trash2, RotateCcw, Home, ChevronRight, MoreHorizontal, BarChart3, FolderOutput } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

function History() {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(null);
  const [recentProjects, setRecentProjects] = useState([
    {
      id: 1,
      obsName: "Mobile App Core",
      fileName: "app_core.o",
      date: "2025-11-19",
      time: "10:30",
      encLevel: "Maximum Security",
      size: "4.2 MB",
      score: 89.5
    },
    {
      id: 2,
      obsName: "Web Server Module",
      fileName: "server_module.exe",
      date: "2025-11-18",
      time: "16:45",
      encLevel: "Balanced",
      size: "6.8 MB",
      score: 72.3
    },
    {
      id: 3,
      obsName: "Database Library",
      fileName: "db_connector.dll",
      date: "2025-11-17",
      time: "14:20",
      encLevel: "Fast",
      size: "2.1 MB",
      score: 56.8
    },
    {
      id: 4,
      obsName: "Crypto Engine",
      fileName: "crypto_engine.bc",
      date: "2025-11-16",
      time: "09:15",
      encLevel: "Maximum Security",
      size: "3.5 MB",
      score: 95.2
    }
  ]);

  const handleNewObfuscation = () => {
    navigate('/obfuscation')
  }

  const handleDownload = (item) => {
    console.log('Download:', item.file)
  }

  const handleReObfuscate = (item) => {
    console.log('Re-obfuscate:', item.file)
  }

  const handleDelete = (item) => {
    console.log('Delete:', item.file)
  }

  const handleDownloadReport = (project) => {
    console.log('Download Report:', project.obsName)
    setDropdownOpen(null)
  }

  const handleDownloadFile = (project) => {
    console.log('Download File:', project.fileName)
    setDropdownOpen(null)
  }

  const handleAnalysis = (project) => {
    console.log('Analysis:', project.obsName)
    setDropdownOpen(null)
  }

  const toggleDropdown = (projectId) => {
    setDropdownOpen(dropdownOpen === projectId ? null : projectId)
  }

  const getEncLevelColor = (encLevel) => {
    switch (encLevel) {
      case 'Fast': return 'bg-gray-100 text-gray-600 border-gray-300'
      case 'Balanced': return 'bg-gray-200 text-gray-700 border-gray-400'
      case 'Maximum Security': return 'bg-gray-300 text-gray-800 border-gray-500'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

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
          <span className="text-gray-900 font-medium">History</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Obfuscation History</h1>
            <p className="text-gray-600 mt-1">View and manage past obfuscation operations</p>
          </div>
          <button
            onClick={handleNewObfuscation}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Obfuscation</span>
          </button>
        </div>

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Obs Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">File Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Enc Level</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Size</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Options</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-gray-900">{project.obsName}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700 font-mono">{project.fileName}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-md border ${getEncLevelColor(project.encLevel)}`}>
                      {project.encLevel}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{project.date}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{project.time}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm text-gray-700">{project.size}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-medium text-gray-900">{project.score}/100</span>
                  </td>
                  <td className="px-4 py-4 relative">
                    <div className="flex items-center justify-center">
                      <button
                        onClick={() => toggleDropdown(project.id)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        title="Options"
                      >
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                      </button>
                      
                      {dropdownOpen === project.id && (
                        <div className="absolute right-0 top-12 z-10 bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[220px]">
                          <button
                            onClick={() => handleDownloadReport(project)}
                            className="w-full px-4 py-2 border-b border-gray-200 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <Download className="w-4 h-4 text-gray-500" />
                            <span>Download Report</span>
                          </button>
                          <button
                            onClick={() => handleDownloadFile(project)}
                            className="w-full px-4 py-2 text-left border-b border-gray-200 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <FileText className="w-4 h-4 text-gray-500" />
                            <span>Download File</span>
                          </button>
                          <button
                            onClick={() => handleAnalysis(project)}
                            className="w-full px-4 py-2 text-left text-sm border-b border-gray-200 text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <BarChart3 className="w-4 h-4 text-gray-500" />
                            <span>Analysis</span>
                          </button>
                          <button
                            onClick={() => handleAnalysis(project)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                          >
                            <FolderOutput className="w-4 h-4 text-gray-500" />
                            <span>Open File location</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default History;

