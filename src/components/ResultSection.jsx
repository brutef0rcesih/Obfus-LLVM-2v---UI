import { Download, RotateCcw, Trash2, FileText, Lock, Clock, BarChart3, CheckCircle, Code, Hash, Shield } from 'lucide-react'

const ResultSection = ({ result, onReObfuscate, onReset, jobId }) => {
  const API_BASE_URL = 'http://localhost:5000/api'
  
  const formatNumber = (num) => {
    return num.toLocaleString()
  }

  const formatBytes = (bytes) => {
    return bytes.toLocaleString() + ' bytes'
  }

  const formatPercent = (val) => {
    const sign = val >= 0 ? '+' : ''
    return `${sign}${val.toFixed(1)}%`
  }

  // Calculate effectiveness score based on strings encrypted
  const stringsEncrypted = result?.obfuscation?.strings_encrypted || 0
  const effectivenessScore = Math.min(100, Math.max(0, stringsEncrypted * 10))
  
  const getEffectivenessLevel = (score) => {
    if (score >= 80) return { text: 'HIGH', color: 'text-gray-900', bg: 'bg-gray-400' }
    if (score >= 50) return { text: 'MODERATE', color: 'text-gray-800', bg: 'bg-gray-300' }
    return { text: 'LOW', color: 'text-gray-700', bg: 'bg-gray-200' }
  }

  const effectiveness = getEffectivenessLevel(effectivenessScore)
  const barWidth = Math.min(effectivenessScore, 100)

  // Use backend result data
  const reportData = {
    originalSource: result?.original_file || 'sam.c',
    obfuscatedBinary: result?.obfuscated_file || 'output.bin',
    analysisTime: result?.timestamp || new Date().toISOString(),
    fileSize: { 
      before: result?.file_size?.before || 0, 
      after: result?.file_size?.after || 0 
    },
    stringsEncrypted: result?.obfuscation?.strings_encrypted || 0,
    encryptionMethod: result?.obfuscation?.method || 'AES-256-CBC',
    encryptionKey: result?.obfuscation?.encryption_key || 'N/A'
  }

  const calculateChange = (before, after) => {
    if (!before || before === 0) return 0
    return ((after - before) / before) * 100
  }

  const handleDownload = async () => {
    if (!jobId) {
      alert('No file available for download')
      return
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/job/${jobId}/download`)
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = reportData.obfuscatedBinary
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file')
    }
  }

  // Simple bar chart component
  const BarChart = ({ label, before, after, maxValue, formatFn = (v) => v }) => {
    const beforePercent = (before / maxValue) * 100
    const afterPercent = (after / maxValue) * 100
    
    return (
      <div className="mb-2">
        <div className="text-xs text-gray-700 mb-1">{label}</div>
        <div className="flex items-center space-x-2">
          <div className="flex-1 bg-white border-2 border-gray-400 h-4 relative">
            <div className="absolute left-0 top-0 h-full bg-gray-300 border-r border-gray-600" style={{ width: `${beforePercent}%` }}></div>
            <div className="absolute left-0 top-0 h-full bg-gray-500" style={{ width: `${afterPercent}%` }}></div>
          </div>
          <div className="text-xs text-gray-900 w-20 text-right font-mono">
            {formatFn(before)} → {formatFn(after)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white border-2 border-gray-400 p-4">
        {/* Header */}
        <div className="mb-4 border-b-2 border-gray-600 pb-3">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <BarChart3 className="h-5 w-5 text-gray-900" />
            <h2 className="text-base font-bold text-gray-900 uppercase">Binary Comparison Report</h2>
          </div>
          <p className="text-xs text-gray-600 text-center">Detailed analysis of obfuscation transformation</p>
        </div>

        {/* File Info */}
        <div className="mb-4 bg-gray-100 border-2 border-gray-400 p-3 space-y-2">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4 text-gray-700 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-xs font-medium text-gray-700">Original Source:</span>
              <span className="text-xs text-gray-900 ml-2 font-mono">{reportData.originalSource}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Lock className="h-4 w-4 text-gray-700 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-xs font-medium text-gray-700">Obfuscated Binary:</span>
              <span className="text-xs text-gray-900 ml-2 font-mono">{reportData.obfuscatedBinary}</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-700 flex-shrink-0" />
            <div className="flex-1">
              <span className="text-xs font-medium text-gray-700">Analysis Time:</span>
              <span className="text-xs text-gray-900 ml-2 font-mono">{new Date(reportData.analysisTime).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Binary Metrics */}
        <div className="mb-4">
          <div className="bg-gray-200 border-b-2 border-gray-400 px-3 py-2 mb-3">
            <div className="flex items-center space-x-2">
              <Code className="h-4 w-4 text-gray-900" />
              <h3 className="text-sm font-bold text-gray-900 uppercase">Binary Metrics Comparison</h3>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 border-2 border-gray-300 hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <FileText className="h-3 w-3 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">File Size</span>
              </div>
              <span className="text-xs text-gray-900 font-mono">
                {formatBytes(reportData.fileSize.before)} → {formatBytes(reportData.fileSize.after)} 
                <span className="text-gray-600 ml-1">({formatPercent(calculateChange(reportData.fileSize.before, reportData.fileSize.after))})</span>
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 border-2 border-gray-300 hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <Shield className="h-3 w-3 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Strings Encrypted</span>
              </div>
              <span className="text-xs text-gray-900 font-mono">
                {formatNumber(reportData.stringsEncrypted)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 border-2 border-gray-300 hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <Lock className="h-3 w-3 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Encryption Method</span>
              </div>
              <span className="text-xs text-gray-900 font-mono">
                {reportData.encryptionMethod}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-2 border-2 border-gray-300 hover:bg-gray-50">
              <div className="flex items-center space-x-2">
                <Hash className="h-3 w-3 text-gray-600" />
                <span className="text-xs font-medium text-gray-700">Encryption Key</span>
              </div>
              <span className="text-xs text-gray-600 font-mono">
                {reportData.encryptionKey.substring(0, 16)}...
              </span>
            </div>
          </div>
        </div>

    

        {/* Obfuscation Effectiveness */}
        <div className="mb-4">
          <div className="bg-gray-200 border-b-2 border-gray-400 px-3 py-2 mb-3">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-gray-900" />
              <h3 className="text-sm font-bold text-gray-900 uppercase">Obfuscation Effectiveness</h3>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-gray-700" />
                <span className="text-xs font-medium text-gray-700">Overall Effectiveness Score:</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-gray-900">{effectivenessScore.toFixed(1)}/100</span>
                <span className={`px-2 py-0.5 text-xs font-bold border-2 border-gray-600 ${effectiveness.bg} ${effectiveness.color}`}>
                  {effectiveness.text}
                </span>
              </div>
            </div>
            
            <div className="bg-white border-2 border-gray-600 h-6 relative">
              <div 
                className={`h-full ${effectiveness.bg} border-r-2 border-gray-600 transition-all duration-300`}
                style={{ width: `${barWidth}%` }}
              ></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-gray-900">{barWidth.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between mt-4 pt-3 border-t-2 border-gray-400">
          <button
            onClick={onReset}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium py-1.5 px-3 border-2 border-gray-600 flex items-center space-x-1"
          >
            <Trash2 className="h-3 w-3" />
            <span>Reset</span>
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={onReObfuscate}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium py-1.5 px-3 border-2 border-gray-600 flex items-center space-x-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Re-Obfuscate</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium py-1.5 px-3 border-2 border-gray-600 flex items-center space-x-1"
            >
              <Download className="h-3 w-3" />
              <span>Download ZIP</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultSection
