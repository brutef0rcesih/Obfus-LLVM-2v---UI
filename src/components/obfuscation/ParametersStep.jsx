import React, { useState } from 'react'
import { Settings, ChevronRight, Home } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import UploadSidebar from '../Navbar/UploadSidebar'

const ParametersStep = ({ uploadedFiles = [] }) => {
  const [selectedConfig, setSelectedConfig] = useState('')
  const [templateType, setTemplateType] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const navigate = useNavigate()

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
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

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Top Breadcrumbs - Full Width */}
      <div className="border-b border-gray-200 px-6 py-3">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <div className="flex items-center">
                <Home className="h-4 w-4 text-gray-400" />
                <span 
                  onClick={handleHomeClick}
                  className="ml-1 text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                >
                  Home
                </span>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                <span 
                  onClick={handleObfuscationClick}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                >
                  Obfuscation
                </span>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                <span 
                  onClick={handleUploadClick}
                  className="text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
                >
                  Upload File
                </span>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
                <span className="text-gray-900 font-medium">Configuration</span>
              </div>
            </li>
          </ol>
        </nav>
      </div>

      {/* Main Layout - Sidebar and Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <UploadSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} activeItem="configuration" />
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6">
            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-semibold text-gray-900">Configuration Selection</h2>
              <p className="text-gray-600 mt-2">Choose your obfuscation configuration</p>
            </div>
            
            {/* Template Selection */}
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Template Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={templateType}
                  onChange={(e) => {
                    setTemplateType(e.target.value)
                    setSelectedConfig(e.target.value) // Auto-select the same config as template type
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                >
                  <option value="">Choose a template type...</option>
                  <option value="basic">Basic Protection</option>
                  <option value="balanced">Balanced Protection</option>
                  <option value="maximum">Maximum Security</option>
                  <option value="moderate">Moderate Security</option>
                </select>
               
              </div>
            </div>

            {/* Configuration Template - Always show card */}
            <div className="max-w-4xl mx-auto">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">Configure Selected</h3>
                <p className="text-sm text-gray-600">
                  {templateType ? 
                    `Review and confirm the ${templateType.charAt(0).toUpperCase() + templateType.slice(1)} template settings` : 
                    'Select a template type above to view configuration details'
                  }
                </p>
              </div>
              
              {/* Permanent Configuration Card */}
              <div className="border border-gray-200 rounded-lg p-6 shadow-sm bg-white min-h-[200px]">
                {!templateType && (
                  <div>
                    <span className="text-sm font-semibold text-gray-400">Select Template Type</span>
                    <p className="text-sm text-gray-400 mb-3">Choose a template type to configure obfuscation settings</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 text-sm">Obfuscation Level:</span>
                        <span className="font-medium text-gray-300 text-sm">-</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 text-sm">UPX Compression:</span>
                        <span className="font-medium text-gray-300 text-sm">-</span>
                      </div>
                      <div className="pt-1 border-t border-gray-100">
                        <div className="text-xs text-gray-400 mb-1">All Techniques Enabled:</div>
                        <div className="text-xs text-gray-300 flex flex-wrap gap-x-3 gap-y-1">
                          <span className="text-xs">- Select template to view techniques</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Render Selected Template Content Only */}
                {templateType === 'maximum' && (
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Maximum Security</span>
                        <p className="text-sm text-gray-600 mb-3">Extreme obfuscation with all available techniques</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 text-sm">Obfuscation Level:</span>
                            <span className="font-medium text-gray-700 text-sm">Maximum</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 text-sm">UPX Compression:</span>
                            <span className="font-medium text-gray-700 text-sm">Maximum</span>
                          </div>
                          <div className="pt-1 border-t border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">All Techniques Enabled:</div>
                            <div className="text-xs text-green-600 flex flex-wrap gap-x-3 gap-y-1">
                              <span className="text-xs">✓ String Encryption</span>
                              <span className="text-xs">✓ Control Flow</span>
                              <span className="text-xs">✓ Bogus Code</span>
                              <span className="text-xs">✓ Virtualization</span>
                              <span className="text-xs">✓ Opaque Predicates</span>
                              <span className="text-xs">✓ Preprocessor</span>
                              <span className="text-xs">✓ Address Obfuscation</span>
                            </div>
                          </div>
                        </div>
                  </div>
                )}

                {templateType === 'balanced' && (
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Balanced Protection</span>
                        <p className="text-sm text-gray-600 mb-3">Good security with reasonable performance impact</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 text-sm">Obfuscation Level:</span>
                            <span className="font-medium text-gray-700 text-sm">Medium</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 text-sm">UPX Compression:</span>
                            <span className="font-medium text-gray-700 text-sm">Medium</span>
                          </div>
                          <div className="pt-1 border-t border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">Selected Techniques:</div>
                            <div className="text-xs text-green-600 flex flex-wrap gap-x-3 gap-y-1">
                              <span className="text-xs">✓ String Encryption</span>
                              <span className="text-xs">✓ Control Flow</span>
                              <span className="text-xs">✓ Bogus Code</span>
                            </div>
                          </div>
                        </div>
                  </div>
                )}

                {templateType === 'basic' && (
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Basic Protection</span>
                        <p className="text-sm text-gray-600 mb-3">Lightweight obfuscation with minimal performance impact</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 text-sm">Obfuscation Level:</span>
                            <span className="font-medium text-gray-700 text-sm">Low</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 text-sm">UPX Compression:</span>
                            <span className="font-medium text-gray-700 text-sm">Low</span>
                          </div>
                          <div className="pt-1 border-t border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">Basic Techniques:</div>
                            <div className="text-xs text-green-600 flex flex-wrap gap-x-3 gap-y-1">
                              <span className="text-xs">✓ String Encryption</span>
                              <span className="text-xs">✓ Control Flow</span>
                            </div>
                          </div>
                        </div>
                  </div>
                )}

                {templateType === 'moderate' && (
                  <div>
                    <span className="text-sm font-semibold text-gray-700">Moderate Security</span>
                        <p className="text-sm text-gray-600 mb-3">Moderate obfuscation with balanced security and performance</p>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 text-sm">Obfuscation Level:</span>
                            <span className="font-medium text-gray-700 text-sm">Medium-High</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-500 text-sm">UPX Compression:</span>
                            <span className="font-medium text-gray-700 text-sm">Medium-High</span>
                          </div>
                          <div className="pt-1 border-t border-gray-100">
                            <div className="text-xs text-gray-500 mb-1">Moderate Techniques:</div>
                            <div className="text-xs text-green-600 flex flex-wrap gap-x-3 gap-y-1">
                              <span className="text-xs">✓ String Encryption</span>
                              <span className="text-xs">✓ Control Flow</span>
                              <span className="text-xs">✓ Bogus Code</span>
                              <span className="text-xs">✓ Opaque Predicates</span>
                            </div>
                          </div>
                        </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 mt-8">
              <div className="text-sm text-gray-500">
                {templateType && (
                  <span>Template: {templateType.charAt(0).toUpperCase() + templateType.slice(1)} selected</span>
                )}
                {!templateType && (
                  <span className="text-orange-600">Please select a template type to continue</span>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => window.history.back()}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => {
                    if (templateType) {
                      navigate('/obfuscation/progress')
                    }
                  }}
                  disabled={!templateType}
                  className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${
                    templateType
                      ? 'bg-gray-600 text-white hover:bg-gray-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Start Obfuscation
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
                  
    


  )
}

export default ParametersStep

