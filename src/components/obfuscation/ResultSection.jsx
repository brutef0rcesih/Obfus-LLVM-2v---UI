import { Download, RotateCcw, Trash2, FileText, Lock, Clock, BarChart3, CheckCircle, Code, Hash, Shield, Activity, Target, Cpu, HardDrive, AlertTriangle, Info, ChevronRight, Home } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const ResultSection = ({ result, onReObfuscate, onReset, jobId }) => {
  const navigate = useNavigate()
  const API_BASE_URL = 'http://localhost:5000/api'
  const [detailedResults, setDetailedResults] = useState(null)
  const [detailedAnalysis, setDetailedAnalysis] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  
  useEffect(() => {
    // If we have all_results from backend, use that for detailed analysis
    if (result?.all_results) {
      setDetailedResults(result.all_results)
    }
    
    // Fetch detailed analysis from backend
    if (jobId && result) {
      fetchDetailedAnalysis()
    }
  }, [result, jobId])

  const fetchDetailedAnalysis = async () => {
    if (!jobId) return
    
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/job/${jobId}/analysis`)
      if (response.ok) {
        const analysis = await response.json()
        setDetailedAnalysis(analysis)
      }
    } catch (error) {
      console.error('Failed to fetch detailed analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num) => {
    return num?.toLocaleString() || '0'
  }

  const formatBytes = (bytes) => {
    if (!bytes) return '0 bytes'
    if (bytes < 1024) return `${bytes} bytes`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatPercent = (val) => {
    const sign = val >= 0 ? '+' : ''
    return `${sign}${val.toFixed(1)}%`
  }

  const calculateChange = (before, after) => {
    if (!before || before === 0) return 0
    return ((after - before) / before) * 100
  }

  const getChangeColor = (change) => {
    if (change > 0) return 'text-red-600'
    if (change < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  // Calculate comprehensive obfuscation score
  const calculateObfuscationScore = () => {
    // Use backend analysis if available
    if (detailedAnalysis?.security_score) {
      return detailedAnalysis.security_score
    }
    
    let score = 0
    let maxScore = 0
    const techniques = result?.successful_techniques || []
    
    if (!detailedResults) {
      // Fallback to basic scoring
      const stringsEncrypted = result?.primary?.obfuscation?.strings_encrypted || 0
      return Math.min(100, Math.max(0, stringsEncrypted * 15))
    }

    // Score based on successful techniques and their metrics
    Object.entries(detailedResults).forEach(([technique, data]) => {
      if (data.status === 'completed') {
        const techResult = data.result
        maxScore += 20 // Each technique worth 20 points max
        
        switch (technique) {
          case 'stringEncryption':
            const strings = techResult?.obfuscation?.strings_encrypted || 0
            score += Math.min(20, strings * 5)
            break
          case 'controlFlow':
            const functions = techResult?.obfuscation?.functions_obfuscated || 0
            score += Math.min(20, functions * 10)
            break
          case 'bogus':
            const instructions = techResult?.obfuscation?.bogus_instructions || 0
            score += Math.min(20, instructions / 10)
            break
          case 'keyFunctionVirtualization':
            score += 20 // VM obfuscation is inherently high value
            break
          case 'opaque':
            const predicates = techResult?.obfuscation?.opaque_predicates || 0
            score += Math.min(20, predicates * 4)
            break
          case 'preprocessorTrickery':
            const macros = techResult?.obfuscation?.macro_count || 0
            score += Math.min(20, macros * 2)
            break
          default:
            score += 10
        }
      }
    })

    if (maxScore === 0) return 50 // Default if no data
    return Math.min(100, (score / maxScore) * 100)
  }

  const obfuscationScore = calculateObfuscationScore()
  
  const getEffectivenessLevel = (score) => {
    if (score >= 80) return { text: 'EXCELLENT', color: 'text-.-900', bg: 'bg-green-400' }
    if (score >= 60) return { text: 'GOOD', color: 'text-blue-900', bg: 'bg-blue-400' }
    if (score >= 40) return { text: 'MODERATE', color: 'text-yellow-900', bg: 'bg-yellow-400' }
    return { text: 'LOW', color: 'text-red-900', bg: 'bg-red-400' }
  }

  const effectiveness = getEffectivenessLevel(obfuscationScore)

  // Use primary result or fallback
  const primaryResult = result?.primary || result || {}
  const reportData = {
    originalSource: primaryResult?.original_file || 'input.c',
    obfuscatedBinary: primaryResult?.obfuscated_file || 'output.bin',
    analysisTime: primaryResult?.timestamp || new Date().toISOString(),
    fileSize: { 
      before: primaryResult?.file_size?.before || 0, 
      after: primaryResult?.file_size?.after || 0 
    },
    obfuscationTechniques: result?.successful_techniques || [],
    failedTechniques: result?.failed_techniques || [],
    totalTechniques: (result?.successful_techniques?.length || 0) + (result?.failed_techniques?.length || 0)
  }

  const sizeChange = calculateChange(reportData.fileSize.before, reportData.fileSize.after)

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

  const handleDownloadReport = () => {
    // Generate comprehensive report data
    const report = {
      metadata: {
        title: 'LLVM Obfuscation Analysis Report',
        generatedAt: new Date().toISOString(),
        analysisDate: reportData.analysisTime,
        version: '1.0.0'
      },
      fileInfo: {
        originalSource: reportData.originalSource,
        obfuscatedBinary: reportData.obfuscatedBinary,
        processingTime: reportData.analysisTime,
        fileSize: {
          before: reportData.fileSize.before,
          after: reportData.fileSize.after,
          change: sizeChange,
          changeFormatted: formatPercent(sizeChange)
        }
      },
      obfuscationResults: {
        effectivenessScore: obfuscationScore,
        effectivenessLevel: effectiveness.text,
        successfulTechniques: reportData.obfuscationTechniques,
        failedTechniques: reportData.failedTechniques,
        totalTechniques: reportData.totalTechniques,
        successRate: reportData.totalTechniques > 0 
          ? ((reportData.obfuscationTechniques.length / reportData.totalTechniques) * 100).toFixed(1)
          : 0
      },
      techniqueDetails: detailedResults || {},
      securityAnalysis: detailedAnalysis || {
        securityScore: obfuscationScore,
        complexityScore: 'N/A',
        protectionLevel: effectiveness.text,
        reverseEngineeringDifficulty: 'Intermediate'
      },
      performanceImpact: detailedAnalysis?.performance_impact || null,
      recommendations: [
        'Consider enabling additional obfuscation techniques for enhanced security',
        'Monitor performance impact in production environments',
        'Regularly update obfuscation parameters to counter emerging threats',
        'Test thoroughly to ensure functionality is preserved'
      ]
    }

    // Create and download JSON report
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `obfuscation-report-${reportData.originalSource.split('.')[0]}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  // Technique details component
  const TechniqueDetails = ({ technique, data }) => {
    if (!data || data.status !== 'completed') return null
    
    const techResult = data.result
    const features = techResult?.obfuscation?.features || []
    const method = techResult?.obfuscation?.method || 'Unknown'
    
    return (
      <div className="bg-gray-50 border border-gray-300 p-3 mb-2 ">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-bold text-gray-900 capitalize">{technique.replace(/([A-Z])/g, ' $1')}</h4>
          <span className="text-xs bg-green-200 text-green-800 px-2 py-1 border border-green-400">
            ✓ SUCCESS
          </span>
        </div>
        <div className="space-y-1 text-xs">
          <div><span className="font-medium">Method:</span> {method}</div>
          {features.length > 0 && (
            <div><span className="font-medium">Features:</span> {features.join(', ')}</div>
          )}
          <div><span className="font-medium">File Size:</span> {formatBytes(techResult?.file_size?.after || 0)}</div>
          {techResult?.obfuscation?.strings_encrypted && (
            <div><span className="font-medium">Strings Encrypted:</span> {techResult.obfuscation.strings_encrypted}</div>
          )}
        </div>
      </div>
    )
  }

  const handleHomeClick = () => {
    navigate('/')
  }

  const handleObfuscationClick = () => {
    navigate('/obfuscation')
  }

  const handleUploadClick = () => {
    navigate('/obfuscation/upload')
  }

  const handleConfigurationClick = () => {
    navigate('/obfuscation/configuration')
  }

  return (
    <div className=" bg-gray-50 flex flex-col">
   
      {/* Main Content */}
      <div className="flex-1">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header */}
   <div className="mb-6 flex justify-between items-center w-full">
  
  {/* Left Section */}
  <div>
    <h2 className="text-3xl font-semibold text-gray-900">Obfuscation Results</h2>
    <p className="text-gray-600 mt-2">Analysis results for {reportData.originalSource}</p>
  </div>

  {/* Right Section: Buttons */}
  <div className="flex flex-nowrap items-center gap-3">
    
    <button
      onClick={handleDownload}
      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-md shadow-md transition flex items-center space-x-2"
    >
      <Download className="w-4 h-4" />
      <span>Download Binary</span>
    </button>

    <button
      onClick={handleDownloadReport}
      className="px-4 py-2 bg-gray-200 hover:bg-gray-300 border-2 border-gray-500 text-gray-700 text-sm font-semibold rounded-md shadow-md transition flex items-center space-x-2"
    >
      <FileText className="w-4 h-4" />
      <span>Download Report</span>
    </button>

  </div>
</div>




          {/* Results Header Card */}
          {/* <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Analysis Report</h3>
              <p className="text-sm text-gray-600 mt-1">Comprehensive obfuscation analysis and statistics</p>
            </div>
        <div className="p-5">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-md shadow-md transition flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Binary</span>
            </button>
            
            <button
              onClick={handleDownloadReport}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray border-2 border-gray-500 text-gray-6Security Score00 text-sm font-semibold rounded-md shadow-md transition flex items-center space-x-2"
            >
              <FileText className="w-4 h-4" />
              <span>Download Report</span>
            </button>
            
  
            
      
          </div>
        </div>
      </div> */}

          {/* Tab Navigation */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
            <div className="flex border-b border-gray-200">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'techniques', label: 'Techniques', icon: Code },
                { id: 'metrics', label: 'Metrics', icon: Activity }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id 
                      ? 'bg-gray-100 text-gray-900 border-b-2 border-gray-600' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="p-6 space-y-6">
                {/* File Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">File Information</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                  <div className="flex-1 pr-4">
                    <h5 className="text-sm font-semibold text-gray-900">Original Source</h5>
                    <p className="text-sm text-gray-500 mt-1 font-mono">{reportData.originalSource}</p>
                  </div>
                  <FileText className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                  <div className="flex-1 pr-4">
                    <h5 className="text-sm font-semibold text-gray-900">Obfuscated Binary</h5>
                    <p className="text-sm text-gray-500 mt-1 font-mono">{reportData.obfuscatedBinary}</p>
                  </div>
                  <Lock className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                  <div className="flex-1 pr-4">
                    <h5 className="text-sm font-semibold text-gray-900">Processing Time</h5>
                    <p className="text-sm text-gray-500 mt-1">{new Date(reportData.analysisTime).toLocaleString()}</p>
                  </div>
                  <Clock className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                  <div className="flex-1 pr-4">
                    <h5 className="text-sm font-semibold text-gray-900">Success Rate</h5>
                    <p className="text-sm text-gray-500 mt-1">{reportData.obfuscationTechniques.length} / {reportData.totalTechniques} techniques applied</p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </div>

            {/* File Size Analysis */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">File Size Analysis</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                  <div className="flex-1 pr-4">
                    <h5 className="text-sm font-semibold text-gray-900">Original Size</h5>
                    <p className="text-sm text-gray-500 mt-1 font-mono">{formatBytes(reportData.fileSize.before)}</p>
                  </div>
                  <HardDrive className="h-5 w-5 text-gray-600" />
                </div>
                <div className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                  <div className="flex-1 pr-4">
                    <h5 className="text-sm font-semibold text-gray-900">Obfuscated Size</h5>
                    <p className="text-sm text-gray-500 mt-1 font-mono">{formatBytes(reportData.fileSize.after)}</p>
                  </div>
                  <HardDrive className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                  <div className="flex-1 pr-4">
                    <h5 className="text-sm font-semibold text-gray-900">Size Change</h5>
                    <p className={`text-sm mt-1 font-mono font-semibold ${getChangeColor(sizeChange)}`}>
                      {formatPercent(sizeChange)}
                    </p>
                  </div>
                  <BarChart3 className={`h-5 w-5 ${getChangeColor(sizeChange)}`} />
                </div>
              </div>
            </div>

            {/* Obfuscation Effectiveness */}
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Obfuscation Effectiveness</h4>
              <div className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                <div className="flex-1 pr-4">
                  <h5 className="text-sm font-semibold text-gray-900">Security Score</h5>
                  <p className="text-sm text-gray-500 mt-1">{obfuscationScore.toFixed(1)}/100 - {effectiveness.text}</p>
                  <div className="mt-2">
                    <div className="bg-white border border-slate-200 h-3 relative overflow-hidden rounded-full">
                      <div 
                        className={`h-full ${effectiveness.bg} transition-all duration-500 rounded-full`}
                        style={{ width: `${obfuscationScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className={`px-3 py-1 text-xs font-semibold rounded-full ${effectiveness.bg} ${effectiveness.color} border border-slate-200`}>
                  {effectiveness.text}
                </div>
              </div>
            </div>
          </div>
        )}

            {activeTab === 'techniques' && (
              <div className="p-6 space-y-6">
                {/* Successful Techniques */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">
                    Applied Techniques ({reportData.obfuscationTechniques.length})
                  </h4>
              <div className="space-y-3">
                {reportData.obfuscationTechniques.map(technique => {
                  const techniqueData = detailedResults?.[technique]
                  return (
                    <div key={technique} className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                      <div className="flex-1 pr-4">
                        <h5 className="text-sm font-semibold text-gray-900 capitalize">
                          {technique.replace(/([A-Z])/g, ' $1')}
                        </h5>
                        <p className="text-sm text-gray-500 mt-1">
                          {techniqueData?.result?.obfuscation?.method || 'Successfully applied'}
                        </p>
                        {techniqueData?.result?.obfuscation?.features && (
                          <p className="text-xs text-gray-400 mt-1">
                            Features: {techniqueData.result.obfuscation.features.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full border border-green-200 font-semibold">
                          ✓ SUCCESS
                        </span>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Failed Techniques */}
            {reportData.failedTechniques.length > 0 && (
              <div className="space-y-4">
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Failed Techniques ({reportData.failedTechniques.length})
                </h4>
                <div className="space-y-3">
                  {reportData.failedTechniques.map(technique => (
                    <div key={technique} className="flex items-center justify-between rounded-md border border-red-300 p-4 bg-red-50">
                      <div className="flex-1 pr-4">
                        <h5 className="text-sm font-semibold text-red-900 capitalize">
                          {technique.replace(/([A-Z])/g, ' $1')}
                        </h5>
                        <p className="text-sm text-red-600 mt-1">
                          {detailedResults?.[technique]?.error?.substring(0, 100) || 'Failed to apply technique'}
                          {detailedResults?.[technique]?.error?.length > 100 && '...'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full border border-red-200 font-semibold">
                          ✗ FAILED
                        </span>
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

            {activeTab === 'metrics' && (
              <div className="p-6 space-y-6">
                {loading && (
                  <div className="flex items-center justify-between rounded-lg border border-gray-300 p-4 bg-gray-50">
                    <div className="flex-1 pr-4">
                      <h5 className="text-sm font-medium text-gray-900">Loading Analysis</h5>
                      <p className="text-sm text-gray-600 mt-1">Fetching detailed metrics...</p>
                    </div>
                    <Activity className="h-5 w-5 text-gray-600 animate-spin" />
                  </div>
                )}
                
                {/* Security Metrics */}
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-900">Security Analysis</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                  <div className="flex-1 pr-4">
                    <h5 className="text-sm font-semibold text-gray-900">Security Score</h5>
                    <p className="text-sm text-gray-500 mt-1">{detailedAnalysis?.security_score?.toFixed(1) || obfuscationScore.toFixed(1)}/100</p>
                  </div>
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                  <div className="flex-1 pr-4">
                    <h5 className="text-sm font-semibold text-gray-900">Complexity Score</h5>
                    <p className="text-sm text-gray-500 mt-1">{detailedAnalysis?.complexity_score?.toFixed(1) || 'N/A'}</p>
                  </div>
                  <Hash className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                  <div className="flex-1 pr-4">
                    <h5 className="text-sm font-semibold text-gray-900">Protection Level</h5>
                    <p className={`text-sm mt-1 font-semibold ${effectiveness.color}`}>
                      {detailedAnalysis?.overall_assessment?.protection_level || effectiveness.text}
                    </p>
                  </div>
                  <Target className={`h-5 w-5 ${effectiveness.color}`} />
                </div>
                <div className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                  <div className="flex-1 pr-4">
                    <h5 className="text-sm font-semibold text-gray-900">RE Difficulty</h5>
                    <p className="text-sm text-gray-500 mt-1">
                      {detailedAnalysis?.overall_assessment?.reverse_engineering_difficulty || 'Intermediate'}
                    </p>
                  </div>
                  <Activity className="h-5 w-5 text-gray-600" />
                </div>
              </div>
            </div>

            {/* Performance Impact */}
            {detailedAnalysis?.performance_impact && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Performance Impact</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                    <div className="flex-1 pr-4">
                      <h5 className="text-sm font-semibold text-gray-900">Runtime Slowdown</h5>
                      <p className="text-sm text-gray-700 mt-1 font-mono">
                        +{detailedAnalysis.performance_impact.estimated_slowdown_percent}%
                      </p>
                    </div>
                    <Cpu className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                    <div className="flex-1 pr-4">
                      <h5 className="text-sm font-semibold text-gray-900">Memory Overhead</h5>
                      <p className="text-sm text-gray-700 mt-1 font-mono">
                        +{detailedAnalysis.performance_impact.memory_overhead_percent}%
                      </p>
                    </div>
                    <HardDrive className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="flex items-center justify-between rounded-md border border-gray-400 p-4 bg-gray-100">
                    <div className="flex-1 pr-4">
                      <h5 className="text-sm font-semibold text-gray-900">Startup Delay</h5>
                      <p className="text-sm text-gray-700 mt-1 font-mono">
                        +{detailedAnalysis.performance_impact.startup_delay_ms}ms
                      </p>
                    </div>
                    <Clock className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
      
      </div>
    </div>
  </div>
  </div>
  )
}

export default ResultSection