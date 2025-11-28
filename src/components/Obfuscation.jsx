import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import FileUploadSection from './obfuscation/FileUploadSection'
import ProgressSection from './obfuscation/ProgressSection'
import ResultSection from './obfuscation/ResultSection'

function Obfuscation({ step = 'upload' }) {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(step) // upload, progress, result
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedFileName, setUploadedFileName] = useState(null)
  const [parameters, setParameters] = useState(null)
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState('Initializing...')
  const [result, setResult] = useState(null)
  const [logs, setLogs] = useState([])
  const simulationRef = useRef(null)

  // Handle file upload
  const handleFileUpload = (file) => {
    setUploadedFile(file)
    setUploadedFileName(file.name.replace(/\s+/g, '_'))
  }

  const handleFileRemove = () => {
    setUploadedFile(null)
    setUploadedFileName(null)
  }

  // Handle step navigation
  const handleNextStep = async (data) => {
    // Default parameters for obfuscation
    const defaultParameters = {
      targetPlatform: 'x86_64',
      protectionLevel: 'standard',
      performanceTolerance: 25,
      stringEncryption: true,
      bogus: false,
      controlFlow: true,
      keyFunctionVirtualization: false,
      opaque: false,
      preprocessorTrickery: false,
      addressObfuscation: false,
      enableAllTechniques: false,
      obfuscationLevel: 'medium',
      upxLevel: 'medium',
      instructionSubstitution: true
    }
    
    setParameters(defaultParameters)
    navigate('/obfuscation/progress')
    setCurrentStep('progress')
    startObfuscation(defaultParameters)
  }

  const handleBackStep = () => {
    if (currentStep === 'result') {
      navigate('/obfuscation/upload')
      setCurrentStep('upload')
      resetAll()
    }
  }

  // Start obfuscation (simulated)
  const startObfuscation = (params) => {
    setProgress(0)
    setCurrentStage('Initializing...')
    setLogs([])
    setResult(null)
    
    if (!uploadedFile || !uploadedFileName) {
      alert('No file uploaded. Please upload a file first.')
      setCurrentStep('upload')
      return
    }

    if (simulationRef.current) {
      clearInterval(simulationRef.current)
    }

    setLogs([`> Preparing ${uploadedFileName} for obfuscation...`])

    const timeline = [
      {
        stage: 'Analyzing binary structure',
        log: '[Analyzer] Completed control-flow scan & entropy checks',
        progress: 20
      },
      {
        stage: 'Applying transformations',
        log: '[Transforms] Injected opaque predicates & substituted instructions',
        progress: 45
      },
      {
        stage: 'Encrypting assets',
        log: '[Strings] Protected literals and embedded resources',
        progress: 65
      },
      {
        stage: 'Hardening entry points',
        log: '[Guards] Added anti-debug stubs & virtualization shims',
        progress: 85
      }
    ]

    let step = 0
    simulationRef.current = setInterval(() => {
      const current = timeline[step]
      setCurrentStage(current.stage)
      setProgress(current.progress)
      setLogs(prev => [...prev, current.log])
      step += 1

      if (step === timeline.length) {
        clearInterval(simulationRef.current)
        simulationRef.current = null
        setTimeout(() => {
          setProgress(100)
          setCurrentStage('Completed')
          setLogs(prev => [...prev, '✓ Obfuscation complete'])
          setResult(createMockResult(params))
          setCurrentStep('result')
          navigate('/obfuscation/result')
        }, 800)
      }
    }, 1200)
  }

  const createMockResult = (params = {}) => {
    const enabledTechniques = []
    if (params.controlFlow) enabledTechniques.push('controlFlow')
    if (params.instructionSubstitution) enabledTechniques.push('instructionSubstitution')
    if (params.stringEncryption) enabledTechniques.push('stringEncryption')
    if (params.keyFunctionVirtualization) enabledTechniques.push('keyFunctionVirtualization')
    if (params.opaque) enabledTechniques.push('opaque')
    if (params.preprocessorTrickery) enabledTechniques.push('preprocessorTrickery')
    if (params.bogus) enabledTechniques.push('bogus')

    const beforeSize = uploadedFile?.size || 120 * 1024
    const overheadMap = {
      minimal: 0.08,
      standard: 0.18,
      high: 0.28,
      maximum: 0.4
    }
    const multiplier = overheadMap[params.protectionLevel] ?? 0.18
    const afterSize = Math.round(beforeSize * (1 + multiplier))

    const allResults = {}
    enabledTechniques.forEach((tech, index) => {
      allResults[tech] = {
        status: 'completed',
        result: {
          file_size: { before: beforeSize, after: afterSize },
          obfuscation: {
            strings_encrypted: params.stringEncryption ? 42 : 14,
            functions_obfuscated: params.controlFlow ? 18 : 7,
            bogus_instructions: params.bogus ? 320 : 120,
            opaque_predicates: params.opaque ? 24 : 8,
            macro_count: params.preprocessorTrickery ? 15 : 5,
            method: tech
          },
          obfuscation_density: { coverage: 0.6 + index * 0.05 }
        }
      }
    })

    const securityScore = Math.min(95, 65 + enabledTechniques.length * 5)
    const analysis = {
      file_metrics: {
        size_before: beforeSize,
        size_after: afterSize,
        size_change_percent: ((afterSize - beforeSize) / beforeSize) * 100,
        compression_ratio: afterSize / beforeSize
      },
      security_score: securityScore,
      complexity_score: 40 + enabledTechniques.length * 4,
      overall_assessment: {
        protection_level: securityScore > 80 ? 'HIGH' : 'MODERATE',
        reverse_engineering_difficulty: securityScore > 80 ? 'Advanced' : 'Intermediate'
      },
      obfuscation_density: {
        techniques_used: enabledTechniques.length,
        techniques_available: 7,
        coverage_percent: (enabledTechniques.length / 7) * 100,
        redundancy_level: enabledTechniques.length > 4 ? 'High' : 'Balanced'
      },
      performance_impact: {
        estimated_slowdown_percent: Math.round(5 + multiplier * 80),
        memory_overhead_percent: Math.round(8 + multiplier * 70),
        startup_delay_ms: Math.round(40 + multiplier * 200)
      },
      technique_scores: enabledTechniques.reduce((acc, tech) => {
        acc[tech] = {
          method: 'Simulated transform',
          security_contribution: 5 + tech.length,
          complexity_contribution: 3 + enabledTechniques.length
        }
        return acc
      }, {})
    }

    return {
      primary: {
        original_file: uploadedFileName || 'input.bin',
        obfuscated_file: `${(uploadedFileName || 'output').replace(/\.[^/.]+$/, '')}.secured`,
        timestamp: new Date().toISOString(),
        file_size: { before: beforeSize, after: afterSize },
        obfuscation: {
          strings_encrypted: params.stringEncryption ? 42 : 0,
          functions_obfuscated: params.controlFlow ? 18 : 6
        }
      },
      successful_techniques: enabledTechniques,
      failed_techniques: enabledTechniques.length < 5 ? ['antiDebug'] : [],
      all_results: allResults,
      analysis
    }
  }

  // Reset everything
  const resetAll = () => {
    if (simulationRef.current) {
      clearInterval(simulationRef.current)
      simulationRef.current = null
    }
    setUploadedFile(null)
    setUploadedFileName(null)
    setParameters(null)
    setProgress(0)
    setCurrentStage('Initializing...')
    setResult(null)
    setLogs([])
    setCurrentStep('upload')
    navigate('/obfuscation/upload')
  }

  // Handle re-obfuscation
  const handleReObfuscate = () => {
    if (!parameters) return
    setCurrentStep('progress')
    navigate('/obfuscation/progress')
    startObfuscation(parameters)
  }

  // Sync currentStep with route
  useEffect(() => {
    setCurrentStep(step)
  }, [step])

  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current)
      }
    }
  }, [])

  // Render current step
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'upload':
        return (
          <FileUploadSection
            uploadedFile={uploadedFile}
            onFileUpload={handleFileUpload}
            onFileRemove={handleFileRemove}
            onNext={handleNextStep}
          />
        )
      
      case 'progress':
        return (
          <ProgressSection
            progress={progress}
            currentStage={currentStage}
            logs={logs}
          />
        )
      
      case 'result':
        return (
          <ResultSection
            result={result}
            onReObfuscate={handleReObfuscate}
            onReset={resetAll}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="w-full h-full overflow-hidden bg-slate-50">
      <div className="h-full overflow-y-auto">
        {renderCurrentStep()}
      </div>
    </div>
  )
}

export default Obfuscation
