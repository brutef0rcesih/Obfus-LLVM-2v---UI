import { Plus, Download, FileText, Home, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown, FileCode } from 'lucide-react'
import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

function NewObfuscation() {
  const navigate = useNavigate()
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [recentProjects] = useState([
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
  ])

  const handleNewObfuscation = () => {
    navigate('/obfuscation/upload')
  }

  const handleDownloadJSONReport = (project) => {
    console.log('Download JSON Report:', project.obsName)
  }

  const handleDownloadPDFReport = (project) => {
    console.log('Download PDF Report:', project.obsName)
  }

  const handleDownloadBinary = (project) => {
    console.log('Download Binary:', project.fileName)
  }

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedProjects = useMemo(() => {
    if (!sortConfig.key) return recentProjects

    const sorted = [...recentProjects].sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (sortConfig.key === 'score') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue
      }

      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc'
          ? new Date(aValue) - new Date(bValue)
          : new Date(bValue) - new Date(aValue)
      }

      if (typeof aValue === 'string') {
        return sortConfig.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return 0
    })

    return sorted
  }, [recentProjects, sortConfig])

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="h-3 w-3 text-gray-400" />
    }
    return sortConfig.direction =
      'asc'
        ? <ArrowUp className="h-3 w-3 text-gray-600" />
        : <ArrowDown className="h-3 w-3 text-gray-600" />
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
          <span className="text-gray-900 font-medium text-sm">New Obfuscation</span>
        </nav>

        {/* Header Section */}
        <div className="space-y-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Obfuscation Projects</h1>
            <p className="text-gray-600 mt-1">Manage and monitor your code obfuscation projects</p>
          </div>

          {/* Search and Controls Bar */}
          <div className="flex items-center justify-start gap-4 pb-4">
            <div className="flex items-center gap-4 flex-1">
              <button
                onClick={handleNewObfuscation}
                className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Obfuscation
              </button>
              <div className="relative flex-1 max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Recent Projects Table */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto border border-gray-300 rounded-lg">
          <table className="min-w-full bg-white shadow-sm">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                <th
                  onClick={() => handleSort('obsName')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 tracking-wide cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <span>Obfuscation name</span>
                    {getSortIcon('obsName')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('fileName')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 tracking-wide cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <span>File name</span>
                    {getSortIcon('fileName')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('encLevel')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 tracking-wide cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <span>Configuration name</span>
                    {getSortIcon('encLevel')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('date')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 tracking-wide cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <span>Date</span>
                    {getSortIcon('date')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('time')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 tracking-wide cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <span>Time</span>
                    {getSortIcon('time')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('size')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 tracking-wide cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <span>Size</span>
                    {getSortIcon('size')}
                  </div>
                </th>
                <th
                  onClick={() => handleSort('score')}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 tracking-wide cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                >
                  <div className="flex items-center gap-2">
                    <span>Score</span>
                    {getSortIcon('score')}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 tracking-wide whitespace-nowrap">
                  Download Report
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 tracking-wide whitespace-nowrap">
                  Download PDF
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 tracking-wide whitespace-nowrap">
                  Download Binary
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-700">{project.obsName}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-700 font-mono">{project.fileName}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-gray-700 text-sm font-medium rounded-md">
                      {project.encLevel}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{project.date}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{project.time}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm text-gray-700">{project.size}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{project.score}/100</span>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleDownloadJSONReport(project)}
                      className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                      title="Download JSON Report"
                    >
                      <FileText className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleDownloadPDFReport(project)}
                      className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                      title="Download PDF Report"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button
                      onClick={() => handleDownloadBinary(project)}
                      className="inline-flex items-center justify-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                      title="Download Binary"
                    >
                      <FileCode className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default NewObfuscation