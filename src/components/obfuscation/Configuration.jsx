import React, { useState, useEffect } from 'react'
import { Settings, ChevronRight, Home, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import UploadSidebar from '../Navbar/UploadSidebar'

const ParametersStep = () => {
  const [selectedConfig, setSelectedConfig] = useState('')
  const [templateType, setTemplateType] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTooltip, setActiveTooltip] = useState(null)
  const navigate = useNavigate()

  // Custom configuration state
  const [customConfig, setCustomConfig] = useState({
    obfuscationCycles: 1,
    preprocessorEnabled: true,
    stringEncryptionEnabled: true,
    stringEncryptionStrength: 5,
    stringEncryptionMethod: 'xor',
    virtualizationEnabled: true,
    virtualizationStrength: 5,
    virtualizationMode: 'light',
    bogusCodeEnabled: true,
    bogusCodeLevel: 7,
    opaquePredicatesEnabled: true,
    controlFlowEnabled: true,
    controlFlowStrength: 6,
    addressObfuscationEnabled: true,
    symbolRenamingEnabled: true,
    symbolRenamingStrength: 5,
    symbolRenamingScope: 'all',
    antiDebugEnabled: true,
    upxEnabled: false
  })

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleHomeClick = () => {
    navigate('/')
  }

  const handleUploadClick = () => {
    navigate('/obfuscation/upload')
  }

  const PRESETS = {
    basic: {
      label: "Basic Protection",
      description: "Essential protection with minimal performance impact.",
      methods: [
        { name: "Anti-Debug", enabled: false },
        { name: "UPX Compression", enabled: false },
        { name: "Function Virtualization", enabled: false },
        { name: "Preprocessor Tricks", enabled: true },
        { name: "String Encryption", enabled: true, strength: 10 },
        { name: "Bogus Control Flow", enabled: false },
        { name: "Opaque Predicates", enabled: false },
        { name: "Control Flow Flattening", enabled: false },
        { name: "Address Obfuscation", enabled: false },
        { name: "Symbol Renaming", enabled: true },
        { name: "Obfuscation Cycles", enabled: true, value: 1 }
      ]
    },
    balanced: {
      label: "Balanced Protection",
      description: "Good balance between security and performance.",
      methods: [
        { name: "Anti-Debug", enabled: true },
        { name: "UPX Compression", enabled: false },
        { name: "Function Virtualization", enabled: false },
        { name: "Preprocessor Tricks", enabled: true },
        { name: "String Encryption", enabled: true },
        { name: "Bogus Control Flow", enabled: true },
        { name: "Opaque Predicates", enabled: true },
        { name: "Control Flow Flattening", enabled: false },
        { name: "Address Obfuscation", enabled: false },
        { name: "Symbol Renaming", enabled: true },
        { name: "Obfuscation Cycles", enabled: true, value: 1 }
      ]
    },
    medium: {
      label: "Medium Security",
      description: "Stronger protection for sensitive applications.",
      methods: [
        { name: "Anti-Debug", enabled: true },
        { name: "UPX Compression", enabled: false },
        { name: "Function Virtualization", enabled: false },
        { name: "Preprocessor Tricks", enabled: true },
        { name: "String Encryption", enabled: true },
        { name: "Bogus Control Flow", enabled: true, strength: 5 },
        { name: "Opaque Predicates", enabled: true },
        { name: "Control Flow Flattening", enabled: true, strength: 5 },
        { name: "Address Obfuscation", enabled: true },
        { name: "Symbol Renaming", enabled: true },
        { name: "Obfuscation Cycles", enabled: true, value: 1 }
      ]
    },
    ultra: {
      label: "Ultra Security",
      description: "Maximum security with multiple passes and virtualization.",
      methods: [
        { name: "Anti-Debug", enabled: true },
        { name: "UPX Compression", enabled: true },
        { name: "Function Virtualization", enabled: true, strength: 10 },
        { name: "Preprocessor Tricks", enabled: true },
        { name: "String Encryption", enabled: true, strength: 10 },
        { name: "Bogus Control Flow", enabled: true, strength: 10 },
        { name: "Opaque Predicates", enabled: true },
        { name: "Control Flow Flattening", enabled: true, strength: 10 },
        { name: "Address Obfuscation", enabled: true },
        { name: "Symbol Renaming", enabled: true, strength: 10 },
        { name: "Obfuscation Cycles", enabled: true, value: 2 }
      ]
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Main Layout - Sidebar and Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <UploadSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} activeItem="configuration" />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto py-3 px-6">
            {/* Header */}
            <h2 className="text-lg font-normal text-gray-900 mb-2">Select Configuration</h2>

            {/* Template Selection */}
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4">
                <label className="text-md font-medium text-gray-700 whitespace-nowrap">
                  Select Template Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={templateType}
                  onChange={(e) => {
                    setTemplateType(e.target.value);
                    setSelectedConfig(e.target.value);
                  }}
                  className="flex-1 px-3 py-2 w-28 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors bg-white"
                >
                  <option value="">Choose a template type...</option>
                  <option value="basic">Basic Protection</option>
                  <option value="balanced">Balanced Protection</option>
                  <option value="medium">Medium Security</option>
                  <option value="ultra">Ultra Security</option>
                  <option value="custom">Custom Configuration</option>
                </select>
              </div>
            </div>

            {/* Configuration Display */}
            <div className="max-w-4xl mx-auto mb-6">
              {templateType !== 'custom' && (
                <>
                  <div className="mb-4">
                    <h3 className="text-md font-medium text-gray-900">Configure Selected</h3>
                  </div>

                  <div className="border border-gray-200 rounded-lg shadow-sm bg-white w-full overflow-hidden">
                    <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-200 py-3 px-4">
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Settings</div>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {(templateType && PRESETS[templateType] ? PRESETS[templateType].methods : PRESETS.ultra.methods).map((method, index) => (
                        <div key={index} className="grid grid-cols-3 py-3 px-4 items-center hover:bg-gray-50 transition-colors">
                          <div className="text-sm text-gray-900 font-medium">{method.name}</div>
                          <div className="text-center">
                            {templateType ? (
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${method.enabled
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-600'
                                }`}>
                                {method.enabled ? 'Enabled' : 'Disabled'}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </div>
                          <div className="text-right">
                            {templateType && (method.strength !== undefined || method.value !== undefined) && method.enabled ? (
                              <span className="text-sm text-gray-600">
                                {method.strength !== undefined ? `Strength: ${method.strength}` : `Value: ${method.value}`}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {templateType === 'custom' && (
                <div className="bg-white max-w-2xl border border-gray-200 rounded-lg p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Obfuscation Techniques</h3>
                  <div className="space-y-6">
                    {/* Obfuscation Cycles */}
                    <div className="mb-6 pb-6 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <label className="text-sm font-medium text-gray-900">Obfuscation Cycles</label>
                          <div className="group relative flex items-center">
                            <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-72 p-3 bg-gray-800 text-white text-sm rounded shadow-lg z-20 pointer-events-none">
                              <strong>Obfuscation Cycles</strong><br />
                              What it does: Repeats the obfuscation process multiple times.<br />
                              Effect: Increases complexity exponentially.<br />
                              <span className="text-yellow-300">⚠ Performance impact: High. Increases build time and file size.</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={customConfig.obfuscationCycles || 1}
                            onChange={(e) => setCustomConfig({ ...customConfig, obfuscationCycles: parseInt(e.target.value) })}
                            className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                          />
                          <span className="text-sm font-medium text-gray-900 w-6 text-right">
                            {customConfig.obfuscationCycles || 1}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* 1. Preprocessor Tricks */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.preprocessorEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, preprocessorEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Preprocessor Tricks</label>
                      </div>
                    </div>

                    {/* 2. String Encryption */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.stringEncryptionEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, stringEncryptionEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">String Encryption</label>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Strength: {customConfig.stringEncryptionStrength}</span>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={customConfig.stringEncryptionStrength}
                            onChange={(e) => setCustomConfig({ ...customConfig, stringEncryptionStrength: parseInt(e.target.value) })}
                            disabled={!customConfig.stringEncryptionEnabled}
                            className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                          />
                        </div>
                        <select
                          value={customConfig.stringEncryptionMethod}
                          onChange={(e) => setCustomConfig({ ...customConfig, stringEncryptionMethod: e.target.value })}
                          disabled={!customConfig.stringEncryptionEnabled}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md bg-white focus:ring-gray-500 focus:border-gray-500"
                        >
                          <option value="xor">XOR</option>
                          <option value="aes">AES</option>
                          <option value="rc4">RC4</option>
                        </select>
                      </div>
                    </div>

                    {/* 3. Function Virtualization */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.virtualizationEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, virtualizationEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Function Virtualization</label>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Strength: {customConfig.virtualizationStrength}</span>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={customConfig.virtualizationStrength}
                            onChange={(e) => setCustomConfig({ ...customConfig, virtualizationStrength: parseInt(e.target.value) })}
                            disabled={!customConfig.virtualizationEnabled}
                            className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                          />
                        </div>
                        <select
                          value={customConfig.virtualizationMode}
                          onChange={(e) => setCustomConfig({ ...customConfig, virtualizationMode: e.target.value })}
                          disabled={!customConfig.virtualizationEnabled}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md bg-white focus:ring-gray-500 focus:border-gray-500"
                        >
                          <option value="light">Light</option>
                          <option value="medium">Medium</option>
                          <option value="heavy">Heavy</option>
                        </select>
                      </div>
                    </div>

                    {/* 4. Bogus Control Flow */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.bogusCodeEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, bogusCodeEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Bogus Control Flow</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Strength: {customConfig.bogusCodeLevel}</span>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={customConfig.bogusCodeLevel}
                          onChange={(e) => setCustomConfig({ ...customConfig, bogusCodeLevel: parseInt(e.target.value) })}
                          disabled={!customConfig.bogusCodeEnabled}
                          className="w-28 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                        />
                      </div>
                    </div>

                    {/* 5. Opaque Predicates */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.opaquePredicatesEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, opaquePredicatesEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Opaque Predicates</label>
                      </div>
                    </div>

                    {/* 6. Control Flow Flattening */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.controlFlowEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, controlFlowEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Control Flow Flattening</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Strength: {customConfig.controlFlowStrength}</span>
                        <input
                          type="range"
                          min="0"
                          max="10"
                          value={customConfig.controlFlowStrength}
                          onChange={(e) => setCustomConfig({ ...customConfig, controlFlowStrength: parseInt(e.target.value) })}
                          disabled={!customConfig.controlFlowEnabled}
                          className="w-28 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                        />
                      </div>
                    </div>

                    {/* 7. Address Obfuscation */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.addressObfuscationEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, addressObfuscationEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Address Obfuscation</label>
                      </div>
                    </div>

                    {/* 8. Symbol Renaming */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.symbolRenamingEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, symbolRenamingEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Symbol Renaming</label>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">Strength: {customConfig.symbolRenamingStrength}</span>
                          <input
                            type="range"
                            min="0"
                            max="10"
                            value={customConfig.symbolRenamingStrength}
                            onChange={(e) => setCustomConfig({ ...customConfig, symbolRenamingStrength: parseInt(e.target.value) })}
                            disabled={!customConfig.symbolRenamingEnabled}
                            className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                          />
                        </div>
                        <select
                          value={customConfig.symbolRenamingScope}
                          onChange={(e) => setCustomConfig({ ...customConfig, symbolRenamingScope: e.target.value })}
                          disabled={!customConfig.symbolRenamingEnabled}
                          className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md bg-white focus:ring-gray-500 focus:border-gray-500"
                        >
                          <option value="all">All</option>
                          <option value="public">Public</option>
                          <option value="internal">Internal</option>
                        </select>
                      </div>
                    </div>

                    {/* 9. Anti-Debug */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.antiDebugEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, antiDebugEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Anti-Debug Protection</label>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200 mt-6">
              <div className="text-sm text-gray-500">
                {templateType && (
                  <span>Template: {templateType.charAt(0).toUpperCase() + templateType.slice(1)}</span>
                )}
                {!templateType && (
                  <span className="text-orange-600">
                    Please select a template type to continue
                  </span>
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
                      const config = {
                        templateType,
                        customConfig: templateType === 'custom' ? customConfig : null
                      }
                      navigate('/obfuscation/progress')
                    }
                  }}
                  disabled={!templateType}
                  className={`px-6 py-2 text-sm font-medium rounded-md transition-colors ${templateType
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
