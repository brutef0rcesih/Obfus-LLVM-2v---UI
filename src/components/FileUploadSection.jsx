import { useRef } from 'react'
import { Upload, FileText, X, RotateCcw, CheckCircle, FileCode, Settings, Shield } from 'lucide-react'

const FileUploadSection = ({ uploadedFile, onFileUpload, onFileRemove, onNext }) => {
  const fileInputRef = useRef(null)

  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      onFileUpload(file)
    }
  }

  const handleContinueToPolicy = () => {
    if (uploadedFile && onNext) {
      onNext()
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase()
    if (['c', 'cpp'].includes(ext)) return 'source'
    if (['bc'].includes(ext)) return 'bitcode'
    if (['o', 'obj'].includes(ext)) return 'object'
    return 'unknown'
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileTypeBadgeColor = (type) => {
    switch (type) {
      case 'source': return 'bg-gray-300 text-gray-900'
      case 'bitcode': return 'bg-gray-300 text-gray-900'
      case 'object': return 'bg-gray-300 text-gray-900'
      default: return 'bg-gray-200 text-gray-900'
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white border-2 border-gray-400 p-4">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-gray-300 border-2 border-gray-400 flex items-center justify-center mx-auto mb-2">
            <Upload className="w-6 h-6 text-gray-900" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Upload Object File</h2>
          <p className="text-xs text-gray-600">Select your object file to begin the obfuscation process</p>
        </div>
      
      {!uploadedFile ? (
        <div className="text-center">
          <div className="border-2 border-gray-400 p-4 bg-gray-50">
            <div className="text-gray-600 mb-2">
              <Upload className="mx-auto h-8 w-8" />
            </div>
            <p className="text-sm font-medium text-gray-800 mb-1">Upload Object File(s)</p>
            <p className="text-xs text-gray-600 mb-3">Supports .c, .cpp, .bc, .o, .obj files</p>
            <button
              onClick={handleUploadClick}
              className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium py-1.5 px-4 border-2 border-gray-600"
            >
              Choose File
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-2 bg-gray-100 border-2 border-gray-400">
            <div className="flex items-center space-x-2">
              <div className="text-gray-700">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-medium text-black">{uploadedFile.name}</p>
                <p className="text-xs text-gray-600">{formatFileSize(uploadedFile.size)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-1.5 py-0.5 text-xs font-medium border border-gray-400 ${getFileTypeBadgeColor(getFileType(uploadedFile.name))}`}>
                {getFileType(uploadedFile.name)}
              </span>
              <button
                onClick={onFileRemove}
                className="text-red-600 hover:text-red-800 p-1 border border-gray-400"
                title="Remove file"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-xs text-gray-700 flex items-center justify-center space-x-1">
              <CheckCircle className="h-3 w-3" />
              <span>File uploaded successfully!</span>
            </p>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                onClick={handleContinueToPolicy}
                className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium py-1.5 px-4 border-2 border-gray-600 flex items-center justify-center space-x-1"
              >
                <CheckCircle className="h-3 w-3" />
                <span>Continue to Parameters</span>
              </button>
              
              <button
                onClick={handleUploadClick}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium py-1.5 px-4 border-2 border-gray-600 flex items-center justify-center space-x-1"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Replace File</span>
              </button>
            </div>
          </div>
        </div>
      )}
      
        <input
          ref={fileInputRef}
          type="file"
          accept=".c,.cpp,.bc,.o,.obj"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* How it Works Card */}
      <div className="mt-6 bg-white border-2 border-gray-400">
        <div className="px-4 py-3 bg-gray-200 border-b-2 border-gray-400">
          <h3 className="text-sm font-bold text-gray-900 uppercase">How It Works</h3>
        </div>
        <div className="p-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-300 border-2 border-gray-400 flex items-center justify-center rounded">
                <span className="text-xs font-bold text-gray-900">1</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <FileCode className="h-4 w-4 text-gray-700" />
                  <h4 className="text-xs font-bold text-gray-900">Upload Your File</h4>
                </div>
                <p className="text-xs text-gray-600">Select your source code, bitcode, or object file (.c, .cpp, .bc, .o, .obj)</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-300 border-2 border-gray-400 flex items-center justify-center rounded">
                <span className="text-xs font-bold text-gray-900">2</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Settings className="h-4 w-4 text-gray-700" />
                  <h4 className="text-xs font-bold text-gray-900">Configure Parameters</h4>
                </div>
                <p className="text-xs text-gray-600">Set obfuscation profiles (Fast, Balanced, Maximum) and customize transformation options</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-300 border-2 border-gray-400 flex items-center justify-center rounded">
                <span className="text-xs font-bold text-gray-900">3</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Shield className="h-4 w-4 text-gray-700" />
                  <h4 className="text-xs font-bold text-gray-900">Process & Protect</h4>
                </div>
                <p className="text-xs text-gray-600">LLVM-based transformations apply code obfuscation techniques to protect your intellectual property</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-8 h-8 bg-gray-400 border-2 border-gray-400 flex items-center justify-center rounded">
                <CheckCircle className="h-4 w-4 text-gray-900" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <FileText className="h-4 w-4 text-gray-700" />
                  <h4 className="text-xs font-bold text-gray-900">Download Result</h4>
                </div>
                <p className="text-xs text-gray-600">Receive your obfuscated file with cryptographic reports and build logs</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FileUploadSection

