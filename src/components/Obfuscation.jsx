import { useState, useEffect } from 'react'
import FileUploadSection from './FileUploadSection'
import ParametersStep from './ParametersStep'
import ProgressSection from './ProgressSection'
import ResultSection from './ResultSection'

const API_BASE_URL = 'http://localhost:5000/api'

function Obfuscation() {
  const [currentStep, setCurrentStep] = useState('upload') // upload, parameters, progress, result
  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadedFileName, setUploadedFileName] = useState(null)
  const [parameters, setParameters] = useState(null)
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState('Initializing...')
  const [result, setResult] = useState(null)
  const [jobId, setJobId] = useState(null)
  const [logs, setLogs] = useState([])

  // Handle file upload
  const handleFileUpload = async (file) => {
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      const data = await response.json()
      console.log('Upload response:', data)
      
      // Use the sanitized filename from backend
      const sanitizedFilename = data.filename || file.name
      setUploadedFile(file)
      setUploadedFileName(sanitizedFilename)
      
      console.log('File uploaded:', sanitizedFilename)
    } catch (error) {
      console.error('Upload error:', error)
      alert('Failed to upload file. Make sure the backend server is running.')
      setUploadedFile(null)
      setUploadedFileName(null)
    }
  }

  const handleFileRemove = () => {
    setUploadedFile(null)
    setUploadedFileName(null)
  }

  // Handle step navigation
  const handleNextStep = async (data) => {
    if (data?.startObfuscation) {
      setParameters(data.parameters)
      setCurrentStep('progress')
      await startObfuscation(data.parameters)
    } else {
      setCurrentStep('parameters')
    }
  }

  const handleBackStep = () => {
    if (currentStep === 'parameters') {
      setCurrentStep('upload')
    } else if (currentStep === 'result') {
      setCurrentStep('upload')
      resetAll()
    }
  }

  // Start obfuscation with backend
  const startObfuscation = async (params) => {
    setProgress(0)
    setCurrentStage('Initializing...')
    setLogs([])
    
    try {
      // Check if string encryption is enabled
      if (!params.stringEncryption) {
        alert('String Encryption must be enabled to use this backend obfuscation.')
        setCurrentStep('parameters')
        return
      }
      
      // Verify we have a filename
      if (!uploadedFileName) {
        alert('No file uploaded. Please upload a file first.')
        setCurrentStep('upload')
        return
      }
      
      console.log('Starting obfuscation with file:', uploadedFileName)
      
      // Start obfuscation job
      const response = await fetch(`${API_BASE_URL}/obfuscate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          filename: uploadedFileName,
          parameters: params
        })
      })
      
      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (e) {
          errorData = { 
            error: `Server error (${response.status})`,
            details: await response.text().catch(() => 'Could not read error details')
          }
        }
        console.error('Backend error:', errorData)
        const errorMessage = errorData.error || `Failed to start obfuscation (${response.status})`
        const errorDetails = errorData.details || ''
        const suggestion = errorData.suggestion || ''
        
        // Build a comprehensive error message
        let fullError = errorMessage
        if (errorDetails) {
          fullError += `\n\n${errorDetails}`
        }
        if (suggestion) {
          fullError += `\n\n${suggestion}`
        }
        
        throw new Error(fullError)
      }
      
      const data = await response.json()
      setJobId(data.job_id)
      
      // Poll for job status
      pollJobStatus(data.job_id)
    } catch (error) {
      console.error('Obfuscation error:', error)
      const errorMsg = error.message || error.toString() || 'Failed to start obfuscation. Make sure the backend server is running.'
      
      // Show error in a more user-friendly way
      alert(errorMsg)
      setCurrentStep('parameters')
    }
  }

  // Poll job status
  const pollJobStatus = (id) => {
    const interval = setInterval(async () => {
      try {
        const [statusResponse, logsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/job/${id}`),
          fetch(`${API_BASE_URL}/job/${id}/logs`)
        ])
        
        if (statusResponse.ok) {
          const statusData = await statusResponse.json()
          setProgress(statusData.progress || 0)
          setCurrentStage(statusData.stage || 'Processing...')
          
          if (statusData.status === 'completed') {
            clearInterval(interval)
            setResult(statusData.result)
            setCurrentStep('result')
          } else if (statusData.status === 'error') {
            clearInterval(interval)
            alert(`Obfuscation failed: ${statusData.error}`)
            setCurrentStep('parameters')
          }
        }
        
        if (logsResponse.ok) {
          const logsData = await logsResponse.json()
          setLogs(logsData.logs || [])
        }
      } catch (error) {
        console.error('Polling error:', error)
      }
    }, 1000) // Poll every second
  }

  // Reset everything
  const resetAll = () => {
    setUploadedFile(null)
    setUploadedFileName(null)
    setParameters(null)
    setProgress(0)
    setCurrentStage('Initializing...')
    setResult(null)
    setJobId(null)
    setLogs([])
  }

  // Handle re-obfuscation
  const handleReObfuscate = () => {
    setCurrentStep('progress')
    setProgress(0)
    startObfuscation(parameters)
  }

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
      
      case 'parameters':
        return (
          <ParametersStep
            uploadedFile={uploadedFile}
            onNext={handleNextStep}
            onBack={handleBackStep}
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
            jobId={jobId}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div className="w-full h-full overflow-hidden">
      <div className="h-full overflow-y-auto">
        {renderCurrentStep()}
      </div>
    </div>
  )
}

export default Obfuscation
