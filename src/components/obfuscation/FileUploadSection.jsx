import { useState, useRef } from 'react'
import { Upload, FileCode, X, ChevronRight, Home, Search, ArrowUpDown } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import UploadSidebar from '../Navbar/UploadSidebar'

const FileUploadSection = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [internalFiles, setInternalFiles] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [sortOrder, setSortOrder] = useState('asc')
  const [previewContent, setPreviewContent] = useState("")
  const [previewFileName, setPreviewFileName] = useState("")
  const [showPreview, setShowPreview] = useState(false)

  const files = internalFiles

  const sortedFiles = [...files].sort((a, b) =>
    sortOrder === 'asc'
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
  )

  const filteredFiles = sortedFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen)

  const handleFileSelect = (event) => {
    const selectedFiles = Array.from(event.target.files)
    if (selectedFiles.length > 0) {
      setInternalFiles(prev => {
        // Avoid duplicates
        const existingNames = new Set(prev.map(f => f.name))
        const uniqueNewFiles = selectedFiles.filter(f => !existingNames.has(f.name))
        return [...prev, ...uniqueNewFiles]
      })
    }
    // Reset input to allow selecting same files again
    event.target.value = ''
  }

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleFilePreview = (file) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewContent(e.target.result)
      setPreviewFileName(file.name)
      setShowPreview(true)
    }
    reader.onerror = () => {
      setPreviewContent("Error reading file content.")
      setPreviewFileName(file.name)
      setShowPreview(true)
    }
    reader.readAsText(file)
  }

  const handleContinueToPolicy = () => {
    if (files.length > 0) navigate('/obfuscation/configuration')
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="border-b border-gray-200 px-6 py-3">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <div className="flex items-center">
                <Home className="h-4 w-4 text-gray-400" />
                <span className="ml-1 text-gray-500 hover:text-gray-700 cursor-pointer" onClick={() => navigate('/')}>
                  Home
                </span>
              </div>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            </li>
            <li>
              <span className="text-gray-900 font-medium">Upload File</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <UploadSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />

        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6">

            <div className="mb-6">
              <label className="text-lg font-medium text-gray-700 flex items-center space-x-2 mb-3">
                <FileCode className="h-4 w-4" />
                <span>Source File</span>
              </label>

              <div onClick={handleUploadClick}
                className="border-2 w-full h-32 border-dashed border-gray-300 rounded-md p-4 cursor-pointer flex items-center justify-center hover:border-gray-400">
                <div className="flex items-center space-x-3">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Click to browse files</p>
                    <p className="text-sm text-gray-500">Supports .c, .cpp, .bc, .o, .obj • Multiple files</p>
                  </div>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-700">Uploaded Files ({files.length})</h3>
                    <button
                      onClick={() => setInternalFiles([])}
                      className="text-xs text-red-600 hover:text-red-800"
                    >
                      Clear All
                    </button>
                  </div>

                  {files.length > 1 && (
                    <div className="flex items-center gap-3 w-full">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search files..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-[260px] pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-gray-500"
                        />
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm("")}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                        className="border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-100"
                      >
                        <ArrowUpDown className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                  <div className="max-h-72 overflow-y-auto flex flex-wrap gap-2 mt-2">
                    {filteredFiles.map((file, index) => (
                      <div
                        key={index}
                        className="border border-gray-300 rounded-md px-3 py-2 bg-white shadow-sm flex items-center gap-2 w-auto"
                      >
                        <p
                          onClick={() => handleFilePreview(file)}
                          className="text-xs font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 hover:underline"
                        >
                          {file.name}
                        </p>

                        <span className="text-[10px] text-gray-500 whitespace-nowrap">
                          | {formatFileSize(file.size)}
                        </span>

                        <button
                          onClick={() => setInternalFiles(prev => prev.filter((_, i) => i !== index))}
                          className="text-gray-400 hover:text-red-500 p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".c,.cpp,.bc,.o,.obj"
                onChange={handleFileSelect}
                className="hidden"
                multiple
              />

              {showPreview && (
                <div className="fixed inset-0 bg-gray-200/60 backdrop-blur-sm flex items-center justify-center z-50 transition-all">
                  <div className="bg-white rounded-xl shadow-2xl w-[700px] max-h-[80vh] overflow-hidden border border-gray-300">

                    {/* Header */}
                    <div className="px-5 py-3 bg-gray-100/80 flex justify-between items-center border-b border-gray-300">
                      <h3 className="text-sm font-semibold text-gray-800">
                        Preview: {previewFileName}
                      </h3>
                      <button
                        onClick={() => setShowPreview(false)}
                        className="hover:bg-gray-200 rounded-md p-1 transition"
                      >
                        <X className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>

                    {/* File Code */}
                    <pre className="p-5 overflow-auto text-xs bg-gray-50 text-gray-800 whitespace-pre-wrap max-h-[60vh] border-b border-gray-200 rounded-b-lg">
                      {previewContent}
                    </pre>

                    {/* Footer Button */}
                    <div className="p-3 flex justify-end bg-white">
                      <button
                        onClick={() => setShowPreview(false)}
                        className="px-5 py-2 text-sm font-medium bg-gray-700 text-white rounded-md hover:bg-gray-800 transition"
                      >
                        Done
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end border-t border-gray-200 pt-4">
              <div className="text-sm text-gray-500 mr-5">
                {files.length > 0 && `${files.length} file(s) selected`}
              </div>
              <button
                onClick={handleUploadClick}
                className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md hover:bg-gray-50 mr-3"
              >
                {files.length > 0 ? "Add More" : "Browse Files"}
              </button>
              <button
                disabled={files.length === 0}
                onClick={handleContinueToPolicy}
                className={`px-6 py-2 text-base rounded-md ${files.length > 0 ? 'bg-gray-600 text-white hover:bg-gray-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
              >
                Select Configuration
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default FileUploadSection
