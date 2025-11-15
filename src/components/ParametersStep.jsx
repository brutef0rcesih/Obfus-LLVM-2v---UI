import React, { useState } from 'react'
import { CheckCircle, Play, RotateCcw } from 'lucide-react'

const ParametersStep = ({ uploadedFile, onNext, onBack }) => {
  const [parameters, setParameters] = useState({
    // Basic Settings
    targetPlatform: 'x86_64',
    protectionLevel: 'standard',
    performanceTolerance: 25,
    
    // LLVM Obfuscation
    controlFlow: true,
    instructionSubstitution: true,
    stringEncryption: true,
    bogus: false,
    keyFunctionVirtualization: false,
    opaque: false,
    preprocessorTrickery: false,
    
 
    
    // AI-Adversarial Protection
    targetModels: ['chatgpt-4', 'claude-3', 'github-copilot'],
    resistanceLevel: 'advanced',
    
    // Critical Infrastructure
    complianceFramework: 'ntro',
    classificationLevel: 'secret'
  })

  const handleParameterChange = (key, value) => {
    setParameters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleModelToggle = (model) => {
    setParameters(prev => ({
      ...prev,
      targetModels: prev.targetModels.includes(model)
        ? prev.targetModels.filter(m => m !== model)
        : [...prev.targetModels, model]
    }))
  }

  const handleNext = () => {
    onNext({ startObfuscation: true, parameters })
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white border-2 border-gray-400 p-4">
        <div className="text-center mb-4">
          <div className="w-10 h-10 bg-gray-300 border-2 border-gray-400 flex items-center justify-center mx-auto mb-2">
            <CheckCircle className="w-5 h-5 text-gray-900" />
          </div>
          <h2 className="text-base font-bold text-gray-900 mb-1">Obfuscation Parameters</h2>
          <p className="text-xs text-gray-600">Configure advanced obfuscation settings for your object file</p>
        </div>

        {/* Uploaded File Info */}
        {uploadedFile && (
          <div className="bg-gray-200 border-2 border-gray-400 p-2 mb-3">
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-gray-700" />
              <span className="text-gray-800 text-xs font-medium">File Ready:</span>
              <span className="text-gray-700 text-xs">{uploadedFile.name}</span>
              <span className="text-gray-600 text-xs">({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Basic Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b-2 border-gray-400 pb-1">Basic Settings</h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Platform</label>
              <select
                value={parameters.targetPlatform}
                onChange={(e) => handleParameterChange('targetPlatform', e.target.value)}
                className="w-full px-2 py-1 text-xs border-2 border-gray-400 bg-white"
              >
                <option value="x86_64">x86_64</option>
                <option value="arm64">ARM64</option>
                <option value="risc-v">RISC-V</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Protection Level</label>
              <select
                value={parameters.protectionLevel}
                onChange={(e) => handleParameterChange('protectionLevel', e.target.value)}
                className="w-full px-2 py-1 text-xs border-2 border-gray-400 bg-white"
              >
                <option value="minimal">Minimal (15%)</option>
                <option value="standard">Standard (45%)</option>
                <option value="high">High (75%)</option>
                <option value="maximum">Maximum (95%)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Performance Tolerance: {parameters.performanceTolerance}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={parameters.performanceTolerance}
                onChange={(e) => handleParameterChange('performanceTolerance', parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-300 appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* LLVM Obfuscation */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b-2 border-gray-400 pb-1">LLVM Obfuscation</h3>
            
            <div className="space-y-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={parameters.controlFlow}
                  onChange={(e) => handleParameterChange('controlFlow', e.target.checked)}
                  className="w-3 h-3 border-2 border-gray-400"
                />
                <span className="text-xs font-medium text-gray-700">Control Flow Obfuscation</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={parameters.instructionSubstitution}
                  onChange={(e) => handleParameterChange('instructionSubstitution', e.target.checked)}
                  className="w-3 h-3 border-2 border-gray-400"
                />
                <span className="text-xs font-medium text-gray-700">Instruction Substitution</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={parameters.stringEncryption}
                  onChange={(e) => handleParameterChange('stringEncryption', e.target.checked)}
                  className="w-3 h-3 border-2 border-gray-400"
                />
                <span className="text-xs font-medium text-gray-700">String Encryption</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={parameters.bogus}
                  onChange={(e) => handleParameterChange('bogus', e.target.checked)}
                  className="w-3 h-3 border-2 border-gray-400"
                />
                <span className="text-xs font-medium text-gray-700">Bogus Control Flow</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={parameters.keyFunctionVirtualization}
                  onChange={(e) => handleParameterChange('keyFunctionVirtualization', e.target.checked)}
                  className="w-3 h-3 border-2 border-gray-400"
                />
                <span className="text-xs font-medium text-gray-700">Key Function Virtualization</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={parameters.opaque}
                  onChange={(e) => handleParameterChange('opaque', e.target.checked)}
                  className="w-3 h-3 border-2 border-gray-400"
                />
                <span className="text-xs font-medium text-gray-700">Opaque Predicates</span>
              </label>

              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={parameters.preprocessorTrickery}
                  onChange={(e) => handleParameterChange('preprocessorTrickery', e.target.checked)}
                  className="w-3 h-3 border-2 border-gray-400"
                />
                <span className="text-xs font-medium text-gray-700">PreProcessor Trickery</span>
              </label>
            </div>
          </div>

          
        

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Security Category</label>
              <select
                value={parameters.securityCategory}
                onChange={(e) => handleParameterChange('securityCategory', e.target.value)}
                className="w-full px-2 py-1 text-xs border-2 border-gray-400 bg-white"
              >
                <option value="cat-1">Category 1 (AES-128)</option>
                <option value="cat-3">Category 3 (AES-192)</option>
                <option value="cat-5">Category 5 (AES-256)</option>
              </select>
            </div>
          

   

          {/* Critical Infrastructure */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-900 border-b-2 border-gray-400 pb-1">Critical Infrastructure</h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Compliance Framework</label>
              <select
                value={parameters.complianceFramework}
                onChange={(e) => handleParameterChange('complianceFramework', e.target.value)}
                className="w-full px-2 py-1 text-xs border-2 border-gray-400 bg-white"
              >
                <option value="ntro">NTRO</option>
                <option value="nciipc">NCIIPC</option>
                <option value="nist">NIST</option>
                <option value="iso27001">ISO 27001</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Classification Level</label>
              <select
                value={parameters.classificationLevel}
                onChange={(e) => handleParameterChange('classificationLevel', e.target.value)}
                className="w-full px-2 py-1 text-xs border-2 border-gray-400 bg-white"
              >
                <option value="confidential">Confidential</option>
                <option value="secret">Secret</option>
                <option value="top-secret">Top Secret</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-between mt-4">
          <button
            onClick={onBack}
            className="px-4 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-medium border-2 border-gray-600 flex items-center space-x-1"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Upload</span>
          </button>
          
          <button
            onClick={handleNext}
            className="px-4 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-medium border-2 border-gray-600 flex items-center space-x-1"
          >
            <Play className="h-3 w-3" />
            <span>Start Obfuscation</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ParametersStep

