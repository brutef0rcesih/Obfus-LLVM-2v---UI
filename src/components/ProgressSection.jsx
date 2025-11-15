import { CheckCircle } from 'lucide-react'
import { useEffect } from 'react'

const ProgressSection = ({ progress, currentStage, logs }) => {
  useEffect(() => {
    // Auto-scroll to bottom when new logs arrive
    const logContainer = document.getElementById('log-container')
    if (logContainer) {
      logContainer.scrollTop = logContainer.scrollHeight
    }
  }, [logs])

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white border-2 border-gray-400 p-4">
        <div className="text-center mb-4">
          {/* Retro Loading Animation */}
          <div className="w-12 h-12 bg-white border-2 border-gray-600 flex items-center justify-center mx-auto mb-2 relative">
            {progress < 100 && (
              <div className="absolute inset-0 border-2 border-t-gray-400 border-r-gray-400 border-b-gray-600 border-l-gray-600" style={{ animation: 'spin 1s linear infinite' }}></div>
            )}
            {progress === 100 && (
              <CheckCircle className="w-6 h-6 text-gray-900" />
            )}
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-1">Processing</h2>
          <p className="text-xs text-gray-600">Please wait while we obfuscate your object file</p>
        </div>
      
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-700">Progress</span>
            <span className="text-xs font-medium text-gray-900">{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white border-2 border-gray-600 h-3">
            <div 
              className="bg-gray-400 h-full transition-all duration-300 border-r-2 border-gray-600"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Current Stage */}
        <div className="mb-4">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              {progress === 100 ? (
                <div className="w-4 h-4 bg-gray-400 border-2 border-gray-600 flex items-center justify-center">
                  <CheckCircle className="w-2.5 h-2.5 text-gray-900" />
                </div>
              ) : (
                <div className="w-4 h-4 bg-white border-2 border-gray-600 flex items-center justify-center">
                  <div className="w-2 h-2 bg-gray-400"></div>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs font-medium text-gray-900">{currentStage}</p>
              <p className="text-xs text-gray-600">
                {progress === 100 ? 'Obfuscation completed successfully!' : 'Please wait while we process your file...'}
              </p>
            </div>
          </div>
        </div>

        {/* Processing Stages */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-gray-700 mb-2">Processing Stages</h3>
          <div className="space-y-1">
            {[
              { name: 'Analysis', completed: progress > 0 },
              { name: 'Obfuscation', completed: progress > 25 },
              { name: 'Testing', completed: progress > 50 },
              { name: 'Report Generation', completed: progress > 75 },
              { name: 'Completed', completed: progress === 100 }
            ].map((stage, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className={`w-3 h-3 border-2 border-gray-600 flex items-center justify-center ${
                  stage.completed 
                    ? 'bg-gray-400' 
                    : progress > (index * 20) 
                      ? 'bg-gray-400' 
                      : 'bg-white'
                }`}>
                  {stage.completed ? (
                    <div className="w-1.5 h-1.5 bg-gray-900"></div>
                  ) : progress > (index * 20) ? (
                    <div className="w-1.5 h-1.5 bg-gray-700"></div>
                  ) : (
                    <div className="w-1.5 h-1.5 bg-gray-300"></div>
                  )}
                </div>
                <span className={`text-xs ${
                  stage.completed 
                    ? 'text-gray-900 font-medium' 
                    : progress > (index * 20) 
                      ? 'text-gray-700 font-medium' 
                      : 'text-gray-500'
                }`}>
                  {stage.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Logs */}
        <div>
          <h3 className="text-xs font-bold text-gray-700 mb-2">Processing Log</h3>
          <div id="log-container" className="bg-gray-900 border-2 border-gray-400 p-2 h-32 overflow-y-auto">
            <div className="space-y-0.5">
              {logs.length === 0 ? (
                <div className="text-xs font-mono text-gray-500">Waiting for logs...</div>
              ) : (
                logs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`text-xs font-mono ${
                      log.includes('✓') || log.includes('SUCCESS') ? 'text-gray-300' : 
                      log.includes('ERROR') || log.includes('FAILED') ? 'text-red-400' : 
                      'text-white'
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
    </div>
  )
}

export default ProgressSection

