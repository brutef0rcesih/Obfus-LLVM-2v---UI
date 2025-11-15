import { Download, RotateCcw, Trash2, FileText, Lock, Clock, BarChart3, CheckCircle, Code, Hash, Shield, Activity, Target, Cpu, HardDrive, AlertTriangle, Info } from 'lucide-react'
import { useState, useEffect } from 'react'

const ResultSection = ({ result, onReObfuscate, onReset, jobId }) => {
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
            score += 10 // Basic score for unknown techniques
        }
      }
    })

    if (maxScore === 0) return 50 // Default if no data
    return Math.min(100, (score / maxScore) * 100)
  }

  const obfuscationScore = calculateObfuscationScore()
  
  const getEffectivenessLevel = (score) => {
    if (score >= 80) return { text: 'EXCELLENT', color: 'text-green-900', bg: 'bg-green-400' }
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

  // Technique details component
  const TechniqueDetails = ({ technique, data }) => {
    if (!data || data.status !== 'completed') return null
    
    const techResult = data.result
    const features = techResult?.obfuscation?.features || []
    const method = techResult?.obfuscation?.method || 'Unknown'
    
    return (
      <div className="bg-gray-50 border border-gray-300 p-3 mb-2">
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-white border-2 border-gray-400 p-4">
        {/* Header */}
        <div className="mb-4 border-b-2 border-gray-600 pb-3">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <BarChart3 className="h-5 w-5 text-gray-900" />
            <h2 className="text-lg font-bold text-gray-900 uppercase">Obfuscation Analysis Report</h2>
          </div>
          <p className="text-sm text-gray-600 text-center">Comprehensive analysis of binary transformation</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex mb-4 border-b border-gray-300">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'techniques', label: 'Techniques', icon: Code },
            { id: 'metrics', label: 'Metrics', icon: Activity }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium border-b-2 ${
                activeTab === tab.id 
                  ? 'border-gray-900 text-gray-900' 
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* File Info */}
            <div className="bg-gray-100 border-2 border-gray-400 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                File Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <span className="text-sm font-medium text-gray-700">Original Source:</span>
                  <div className="text-sm text-gray-900 font-mono bg-white p-2 border border-gray-300 mt-1">
                    {reportData.originalSource}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Obfuscated Binary:</span>
                  <div className="text-sm text-gray-900 font-mono bg-white p-2 border border-gray-300 mt-1">
                    {reportData.obfuscatedBinary}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Processing Time:</span>
                  <div className="text-sm text-gray-900 font-mono bg-white p-2 border border-gray-300 mt-1">
                    {new Date(reportData.analysisTime).toLocaleString()}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-700">Techniques Applied:</span>
                  <div className="text-sm text-gray-900 font-mono bg-white p-2 border border-gray-300 mt-1">
                    {reportData.obfuscationTechniques.length} / {reportData.totalTechniques} successful
                  </div>
                </div>
              </div>
            </div>

            {/* Size Comparison */}
            <div className="bg-gray-100 border-2 border-gray-400 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                <HardDrive className="h-4 w-4 mr-2" />
                File Size Analysis
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-xs text-gray-600 uppercase mb-1">Original</div>
                  <div className="text-lg font-bold text-gray-900">{formatBytes(reportData.fileSize.before)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 uppercase mb-1">Obfuscated</div>
                  <div className="text-lg font-bold text-gray-900">{formatBytes(reportData.fileSize.after)}</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-gray-600 uppercase mb-1">Change</div>
                  <div className={`text-lg font-bold ${getChangeColor(sizeChange)}`}>
                    {formatPercent(sizeChange)}
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="bg-white border border-gray-300 h-6 relative overflow-hidden">
                  <div className="absolute left-0 top-0 h-full bg-gray-300 border-r border-gray-600" 
                       style={{ width: `${Math.min(50, (reportData.fileSize.before / Math.max(reportData.fileSize.before, reportData.fileSize.after)) * 100)}%` }}>
                  </div>
                  <div className="absolute left-0 top-0 h-full bg-gray-600" 
                       style={{ width: `${Math.min(50, (reportData.fileSize.after / Math.max(reportData.fileSize.before, reportData.fileSize.after)) * 100)}%` }}>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-900">Size Comparison</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Effectiveness Score */}
            <div className="bg-gray-100 border-2 border-gray-400 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                <Target className="h-4 w-4 mr-2" />
                Obfuscation Effectiveness
              </h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Score:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-gray-900">{obfuscationScore.toFixed(1)}/100</span>
                  <span className={`px-3 py-1 text-sm font-bold border-2 border-gray-600 ${effectiveness.bg} ${effectiveness.color}`}>
                    {effectiveness.text}
                  </span>
                </div>
              </div>
              <div className="bg-white border-2 border-gray-600 h-8 relative overflow-hidden">
                <div 
                  className={`h-full ${effectiveness.bg} border-r-2 border-gray-600 transition-all duration-500`}
                  style={{ width: `${obfuscationScore}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">{obfuscationScore.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'techniques' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Successful Techniques */}
              <div>
                <h3 className="text-sm font-bold text-green-900 mb-3 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Successful Techniques ({reportData.obfuscationTechniques.length})
                </h3>
                <div className="space-y-2">
                  {reportData.obfuscationTechniques.map(technique => (
                    detailedResults?.[technique] ? (
                      <TechniqueDetails 
                        key={technique} 
                        technique={technique} 
                        data={detailedResults[technique]} 
                      />
                    ) : (
                      <div key={technique} className="bg-green-50 border border-green-300 p-3">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-green-900 capitalize">
                            {technique.replace(/([A-Z])/g, ' $1')}
                          </h4>
                          <span className="text-xs bg-green-200 text-green-800 px-2 py-1">✓ SUCCESS</span>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Failed Techniques */}
              {reportData.failedTechniques.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-red-900 mb-3 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Failed Techniques ({reportData.failedTechniques.length})
                  </h3>
                  <div className="space-y-2">
                    {reportData.failedTechniques.map(technique => (
                      <div key={technique} className="bg-red-50 border border-red-300 p-3">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold text-red-900 capitalize">
                            {technique.replace(/([A-Z])/g, ' $1')}
                          </h4>
                          <span className="text-xs bg-red-200 text-red-800 px-2 py-1">✗ FAILED</span>
                        </div>
                        {detailedResults?.[technique]?.error && (
                          <div className="text-xs text-red-700 mt-1">
                            {detailedResults[technique].error.substring(0, 100)}...
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'metrics' && (
          <div className="space-y-4">
            {loading && (
              <div className="bg-blue-50 border border-blue-300 p-4 text-center">
                <div className="text-sm text-blue-700">Loading detailed analysis...</div>
              </div>
            )}
            
            <div className="bg-gray-100 border-2 border-gray-400 p-4">
              <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Detailed Metrics & Analysis
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {/* File Statistics */}
                <div className="bg-white border border-gray-300 p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <HardDrive className="h-3 w-3 mr-1" />
                    File Statistics
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Original Size:</span>
                      <span className="font-mono">{formatBytes(detailedAnalysis?.file_metrics?.size_before || reportData.fileSize.before)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Final Size:</span>
                      <span className="font-mono">{formatBytes(detailedAnalysis?.file_metrics?.size_after || reportData.fileSize.after)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Size Change:</span>
                      <span className={`font-mono ${getChangeColor(detailedAnalysis?.file_metrics?.size_change_percent || sizeChange)}`}>
                        {formatPercent(detailedAnalysis?.file_metrics?.size_change_percent || sizeChange)}
                      </span>
                    </div>
                    {detailedAnalysis?.file_metrics?.compression_ratio && (
                      <div className="flex justify-between">
                        <span>Compression Ratio:</span>
                        <span className="font-mono">{detailedAnalysis.file_metrics.compression_ratio.toFixed(2)}:1</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Security Analysis */}
                <div className="bg-white border border-gray-300 p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Shield className="h-3 w-3 mr-1" />
                    Security Analysis
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Security Score:</span>
                      <span className="font-mono font-bold">{detailedAnalysis?.security_score?.toFixed(1) || obfuscationScore.toFixed(1)}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Complexity Score:</span>
                      <span className="font-mono">{detailedAnalysis?.complexity_score?.toFixed(1) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Protection Level:</span>
                      <span className={`font-mono text-xs ${effectiveness.color}`}>
                        {detailedAnalysis?.overall_assessment?.protection_level || effectiveness.text}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>RE Difficulty:</span>
                      <span className="font-mono text-xs">
                        {detailedAnalysis?.overall_assessment?.reverse_engineering_difficulty || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Obfuscation Coverage */}
                <div className="bg-white border border-gray-300 p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Target className="h-3 w-3 mr-1" />
                    Coverage Analysis
                  </h4>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span>Techniques Used:</span>
                      <span className="font-mono">
                        {detailedAnalysis?.obfuscation_density?.techniques_used || reportData.obfuscationTechniques.length}
                        /{detailedAnalysis?.obfuscation_density?.techniques_available || reportData.totalTechniques}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Coverage:</span>
                      <span className="font-mono">
                        {detailedAnalysis?.obfuscation_density?.coverage_percent?.toFixed(1) || 
                         (reportData.totalTechniques > 0 
                          ? ((reportData.obfuscationTechniques.length / reportData.totalTechniques) * 100).toFixed(1)
                          : 0)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Success Rate:</span>
                      <span className="font-mono text-green-600">
                        {reportData.totalTechniques > 0 
                          ? ((reportData.obfuscationTechniques.length / reportData.totalTechniques) * 100).toFixed(1)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Redundancy:</span>
                      <span className="font-mono text-xs">
                        {detailedAnalysis?.obfuscation_density?.redundancy_level || 'Unknown'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Impact */}
              {detailedAnalysis?.performance_impact && (
                <div className="bg-white border border-gray-300 p-3 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                    <Cpu className="h-3 w-3 mr-1" />
                    Estimated Performance Impact
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-xs text-gray-600 uppercase mb-1">Runtime Slowdown</div>
                      <div className="text-sm font-bold text-orange-600">
                        +{detailedAnalysis.performance_impact.estimated_slowdown_percent}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 uppercase mb-1">Memory Overhead</div>
                      <div className="text-sm font-bold text-blue-600">
                        +{detailedAnalysis.performance_impact.memory_overhead_percent}%
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-600 uppercase mb-1">Startup Delay</div>
                      <div className="text-sm font-bold text-red-600">
                        +{detailedAnalysis.performance_impact.startup_delay_ms}ms
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Technique Contributions */}
              {detailedAnalysis?.technique_scores && (
                <div className="bg-white border border-gray-300 p-3 mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Technique Contributions</h4>
                  <div className="space-y-2">
                    {Object.entries(detailedAnalysis.technique_scores).map(([technique, scores]) => (
                      <div key={technique} className="flex items-center justify-between p-2 bg-gray-50 border border-gray-200">
                        <div className="flex-1">
                          <div className="text-sm font-medium capitalize">
                            {technique.replace(/([A-Z])/g, ' $1')}
                          </div>
                          <div className="text-xs text-gray-600">
                            Method: {scores.method}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-green-600">
                            +{scores.security_contribution} pts
                          </div>
                          <div className="text-xs text-blue-600">
                            Complexity: +{scores.complexity_contribution}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

             
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between mt-6 pt-4 border-t-2 border-gray-400">
          <button
            onClick={onReset}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-2 px-4 border-2 border-gray-600 flex items-center space-x-2 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>New Analysis</span>
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={onReObfuscate}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium py-2 px-4 border-2 border-gray-600 flex items-center space-x-2 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              <span>Re-Obfuscate</span>
            </button>
            
            <button
              onClick={handleDownload}
              className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-2 px-4 border-2 border-gray-600 flex items-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Download Binary</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultSection
