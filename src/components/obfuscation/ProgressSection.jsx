import { CheckCircle, Activity, BarChart3, Terminal, Clock } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const ProgressSection = ({ progress: externalProgress, currentStage: externalStage, logs: externalLogs }) => {
  const navigate = useNavigate()
  const [internalProgress, setInternalProgress] = useState(0)
  const [internalStage, setInternalStage] = useState('Initializing...')
  const [internalLogs, setInternalLogs] = useState([])
  const simulationRef = useRef(null)

  // Use internal state if external props are not provided or are at default values
  const progress = externalProgress || internalProgress
  const currentStage = externalStage || internalStage
  const logs = externalLogs?.length > 0 ? externalLogs : internalLogs

  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    const logContainer = document.getElementById('log-container')
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight
    }
  }, [logs])

  useEffect(() => {
    // Start progress simulation if no external progress is provided
    if (!externalProgress && !simulationRef.current) {
      const timeline = [
        {
          stage: 'Analyzing binary structure',
          log: '[Scanner] Detecting file format and entry points',
          progress: 15
        },
        {
          stage: 'Applying code obfuscation',
          log: '[Obfuscator] Transforming control flow structures',
          progress: 35
        },
        {
          stage: 'Encrypting string literals',
          log: '[Encryptor] Processing string constants and literals',
          progress: 55
        },
        {
          stage: 'Running quality tests',
          log: '[Validator] Verifying obfuscated code integrity',
          progress: 75
        },
        {
          stage: 'Generating final report',
          log: '[Reporter] Compiling analysis and statistics',
          progress: 90
        }
      ]

      let step = 0
      simulationRef.current = setInterval(() => {
        if (step < timeline.length) {
          const current = timeline[step]
          setInternalStage(current.stage)
          setInternalProgress(current.progress)
          setInternalLogs(prev => [...prev, current.log])
          step += 1
        } else {
          clearInterval(simulationRef.current)
          simulationRef.current = null
          setTimeout(() => {
            setInternalProgress(100)
            setInternalStage('Process Complete')
            setInternalLogs(prev => [...prev, 'Obfuscation completed successfully'])
          }, 1000)
        }
      }, 2000)
    }

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current)
        simulationRef.current = null
      }
    }
  }, [externalProgress])

  useEffect(() => {
    // Redirect to result page 3 seconds after completion
    if (progress >= 100) {
      console.log('Progress reached 100%, setting redirect timer...')
      const timer = setTimeout(() => {
        console.log('Redirecting to result page...')
        navigate('/obfuscation/result')
      }, 3000)

      return () => {
        clearTimeout(timer)
      }
    }
  }, [progress, navigate])

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-900">Obfuscation Progress</h3>
          <p className="text-gray-600 mt-1">Processing your file with advanced obfuscation techniques</p>
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center relative">
                
                {progress === 100 ? (
                  <CheckCircle className="w-8 h-8 text-gray-700" />
                ) : (
                  <Activity className="w-8 h-8 text-gray-600" />
                )}
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-semibold text-gray-900">{currentStage}</h4>
              <p className="text-sm text-gray-600 mt-1">
                {progress === 100 ? 'Obfuscation completed successfully!' : 'Please wait while we process your file...'}
              </p>
              <div className="mt-3 flex items-center space-x-4">
                <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-md border border-gray-300">
                  {Math.round(progress)}% Complete
                </span>
                <div className="flex-1 bg-gray-200 h-2 rounded-md overflow-hidden">
                  <div 
                    className="bg-gray-600 h-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Processing Log and Stages - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Processing Log Section - Left Side */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center">
                <Terminal className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">Processing Log</h3>
                <p className="text-xs text-gray-600">Real-time process output</p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div id="log-container" className="bg-gray-800 border border-gray-300 rounded-md p-3 h-56 overflow-y-auto">
              <div className="space-y-1">
                {logs.length === 0 ? (
                  <div className="text-xs font-mono text-gray-400 flex items-center space-x-2">
                    <Clock className="w-3 h-3 animate-pulse" />
                    <span>Waiting for process to start...</span>
                  </div>
                ) : (
                  logs.map((log, index) => (
                    <div 
                      key={index} 
                      className={`text-xs font-mono leading-relaxed ${
                        log.includes('SUCCESS') || log.includes('complete') ? 'text-gray-100' : 
                        log.includes('ERROR') || log.includes('FAILED') ? 'text-gray-300' : 
                        log.includes('[') ? 'text-gray-200' :
                        'text-gray-400'
                      }`}
                    >
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Processing Stages Section - Right Side */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-100 border border-gray-300 rounded-md flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-gray-600" />
              </div>
              <div>
                <h3 className="text-base font-medium text-gray-900">Processing Stages</h3>
                <p className="text-xs text-gray-600">Pipeline status</p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            <div className="space-y-3">
              {[
                { name: 'Binary Analysis', completed: progress > 0, threshold: 0 },
                { name: 'Code Obfuscation', completed: progress > 25, threshold: 25 },
                { name: 'Quality Testing', completed: progress > 50, threshold: 50 },
                { name: 'Report Generation', completed: progress > 75, threshold: 75 },
                { name: 'Process Complete', completed: progress === 100, threshold: 100 }
              ].map((stage, index) => (
                <div key={index} className={`flex items-center justify-between rounded-lg border p-3 transition-all duration-300 ${
                  stage.completed 
                    ? 'bg-gray-100 border-gray-400' 
                    : progress > stage.threshold 
                      ? 'bg-gray-50 border-gray-300' 
                      : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center space-x-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      stage.completed 
                        ? 'bg-gray-600 border-gray-600' 
                        : progress > stage.threshold 
                          ? 'bg-gray-400 border-gray-400' 
                          : 'bg-white border-gray-300'
                    }`}>
                      {stage.completed && <CheckCircle className="w-3 h-3 text-white" />}
                    </div>
                    <span className={`text-sm font-medium ${
                      stage.completed 
                        ? 'text-gray-800' 
                        : progress > stage.threshold 
                          ? 'text-gray-700' 
                          : 'text-gray-500'
                    }`}>
                      {stage.name}
                    </span>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-md font-medium border ${
                    stage.completed 
                      ? 'bg-gray-200 text-gray-700 border-gray-300' 
                      : progress > stage.threshold 
                        ? 'bg-gray-100 text-gray-600 border-gray-300' 
                        : 'bg-white text-gray-500 border-gray-200'
                  }`}>
                    {stage.completed ? 'DONE' : progress > stage.threshold ? 'ACTIVE' : 'PENDING'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProgressSection

