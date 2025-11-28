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
    bogusCodeLevel: 7,
    bogusCodeEnabled: true,
    virtualizationMode: 'Light',
    virtualizationEnabled: true,
    controlFlowStrength: 6,
    controlFlowEnabled: true,
    symbolRenamingScope: 'All',
    symbolRenamingEnabled: true,
    stringEncryptionMethod: 'XOR',
    stringEncryptionEnabled: true,
    preprocessorEnabled: true,
    opaquePredicatesLevel: 5,
    opaquePredicatesEnabled: true,
    addressObfuscationEnabled: true,
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
      <div className="flex flex-1 ">
        {/* Sidebar */}
        <UploadSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} activeItem="configuration" />

        {/* Main Content */}
        <div className="flex-1   overflow-auto">
          <div className="max-w-6xl mx-auto py-2 px-6">
            {/* Header */}
            <h2 className="text-lg font-normal text-gray-900">Select Configuration </h2>

      {/* Template Selection */}
<div className="max-w-4xl mx-auto mb-2 mt-2">
  <div className="flex items-center gap-4">
    
    <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
      Select Template Type <span className="text-red-500">*</span>
    </label>

    <select
      value={templateType}
      onChange={(e) => {
        setTemplateType(e.target.value)
        setSelectedConfig(e.target.value)
      }}
      className="flex-1 px-3 py-2 w-fit border border-gray-300 rounded-lg 
                 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 
                 transition-colors bg-white"
    >
      <option value="">Choose a template type...</option>
      <option value="basic">Basic Protection</option>
      <option value="balanced">Balanced Protection</option>
      <option value="maximum">Maximum Security</option>
      <option value="moderate">Moderate Security</option>
      <option value="custom">Custom Configuration</option>
    </select>

  </div>
</div>


            {/* Configuration Display */}
            <div className="max-w-4xl mx-auto overflow-auto">
              {templateType !== 'custom' && (
                <>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mt-2">Configure Selected</h3>
                    <p className="text-sm text-gray-600">
                      {templateType ?
                        `Review and confirm the ${templateType.charAt(0).toUpperCase() + templateType.slice(1)} template settings` :
                        'Select a template type above to view configuration details'
                      }
                    </p>
                  </div>

                  <div className="border border-gray-200 rounded-lg shadow-sm bg-white w-full overflow-hidden">
                    {/* Header Row */}
                    <div className="grid grid-cols-3 divide-x divide-gray-200 bg-gray-50 border-b border-gray-200">
                      <div className="p-4">
                        <h4 className="text-sm font-semibold text-gray-700">Obfuscation Level</h4>
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-semibold text-gray-700">UPX Compression</h4>
                      </div>
                      <div className="p-4">
                        <h4 className="text-sm font-semibold text-gray-700">Obfuscation Methods</h4>
                      </div>
                    </div>

                    {/* Data Row */}
                    <div className="grid grid-cols-3 divide-x divide-gray-200">
                      <div className="p-4">
                        <p className="text-sm text-gray-900">
                          {templateType === 'maximum' && 'Maximum'}
                          {templateType === 'moderate' && 'Medium-High'}
                          {templateType === 'balanced' && 'Medium'}
                          {templateType === 'basic' && 'Low'}
                          {!templateType && '-'}
                        </p>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-gray-900">
                          {templateType === 'maximum' && 'High'}
                          {templateType === 'moderate' && 'Medium-High'}
                          {templateType === 'balanced' && 'Medium'}
                          {templateType === 'basic' && 'Low'}
                          {!templateType && '-'}
                        </p>
                      </div>
                      <div className="p-4">
                        {templateType === 'maximum' && (
                          <ul className="text-sm text-gray-900 space-y-1">
                            <li>• String Encryption</li>
                            <li>• Control Flow</li>
                            <li>• Bogus Code</li>
                            <li>• Virtualization</li>
                            <li>• Opaque Predicates</li>
                            <li>• Preprocessor</li>
                            <li>• Address Obfuscation</li>
                            <li>• Anti-Debug</li>
                          </ul>
                        )}
                        {templateType === 'moderate' && (
                          <ul className="text-sm text-gray-900 space-y-1">
                            <li>• String Encryption</li>
                            <li>• Control Flow</li>
                            <li>• Bogus Code</li>
                            <li>• Opaque Predicates</li>
                          </ul>
                        )}
                        {templateType === 'balanced' && (
                          <ul className="text-sm text-gray-900 space-y-1">
                            <li>• String Encryption</li>
                            <li>• Control Flow</li>
                            <li>• Bogus Code</li>
                          </ul>
                        )}
                        {templateType === 'basic' && (
                          <ul className="text-sm text-gray-900 space-y-1">
                            <li>• String Encryption</li>
                            <li>• Control Flow</li>
                          </ul>
                        )}
                        {!templateType && <p className="text-sm text-gray-900">-</p>}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Custom Configuration UI */}
              {templateType === 'custom' && (
                <div className="bg-white  max-w-2xl border border-gray-200 rounded-lg p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">Obfuscation Techniques</h3>

                  <div className="space-y-6">
                    {/* Bogus Code Insertion */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.bogusCodeEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, bogusCodeEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Bogus Code Insertion</label>
                        <div
                          className="relative"
                          onMouseEnter={() => setActiveTooltip('bogus')}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                          {activeTooltip === 'bogus' && (
                            <div className="absolute left-0 top-6 z-50 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-xl">
                              <p className="font-semibold text-gray-900 mb-1.5 text-xs">Bogus Code Insertion</p>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">What it does:</span> Injects fake logic, dead branches, and unreachable blocks.</p>
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">Effect:</span> Makes static analysis significantly harder.</p>
                                <p className="text-orange-600 font-medium pt-0.5 text-xs">⚠ Performance impact: Low</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Level: {customConfig.bogusCodeLevel}</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={customConfig.bogusCodeLevel}
                          onChange={(e) => setCustomConfig({ ...customConfig, bogusCodeLevel: parseInt(e.target.value) })}
                          disabled={!customConfig.bogusCodeEnabled}
                          className="w-28 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                        />
                      </div>
                    </div>

                    {/* Function Virtualization */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.virtualizationEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, virtualizationEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Function Virtualization</label>
                        <div
                          className="relative"
                          onMouseEnter={() => setActiveTooltip('virtualization')}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                          {activeTooltip === 'virtualization' && (
                            <div className="absolute left-0 top-6 z-50 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-xl">
                              <p className="font-semibold text-gray-900 mb-1.5 text-sm">Function Virtualization</p>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">What it does:</span> Converts functions into custom bytecode.</p>
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">Effect:</span> Extremely strong protection.</p>
                                <p className="text-orange-600 font-medium pt-0.5 text-xs">⚠ Performance impact: Medium–high</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">VM Mode:</span>
                        <select
                          value={customConfig.virtualizationMode}
                          onChange={(e) => setCustomConfig({ ...customConfig, virtualizationMode: e.target.value })}
                          disabled={!customConfig.virtualizationEnabled}
                          className="w-28 px-2 py-1 text-sm border border-gray-300 rounded-md bg-white focus:ring-gray-500 focus:border-gray-500"
                        >
                          <option value="Light">Light</option>
                          <option value="Medium">Medium</option>
                          <option value="Heavy">Heavy</option>
                        </select>
                      </div>
                    </div>

                    {/* Control-Flow Flattening */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.controlFlowEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, controlFlowEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Control-Flow Flattening</label>
                        <div
                          className="relative"
                          onMouseEnter={() => setActiveTooltip('controlFlow')}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                          {activeTooltip === 'controlFlow' && (
                            <div className="absolute left-0 top-6 z-50 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-xl">
                              <p className="font-semibold text-gray-900 mb-1.5 text-xs">Control-Flow Flattening</p>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">What it does:</span> Converts structured logic into a flat dispatcher.</p>
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">Effect:</span> Makes decompiled output look like spaghetti logic.</p>
                                <p className="text-orange-600 font-medium pt-0.5 text-xs">⚠ Performance impact: Can slow execution by 2–5×</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Strength: {customConfig.controlFlowStrength}</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={customConfig.controlFlowStrength}
                          onChange={(e) => setCustomConfig({ ...customConfig, controlFlowStrength: parseInt(e.target.value) })}
                          disabled={!customConfig.controlFlowEnabled}
                          className="w-28 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                        />
                      </div>
                    </div>

                    {/* Symbol Renaming */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.symbolRenamingEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, symbolRenamingEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Symbol Renaming</label>
                        <div
                          className="relative"
                          onMouseEnter={() => setActiveTooltip('symbolRenaming')}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                          {activeTooltip === 'symbolRenaming' && (
                            <div className="absolute left-0 bottom-6 z-50 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-xl">
                              <p className="font-semibold text-gray-900 mb-1.5 text-xs">Symbol Renaming</p>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">What it does:</span> Replaces names with meaningless identifiers.</p>
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">Effect:</span> Prevents understanding of logic structure.</p>
                                <p className="text-orange-600 font-medium pt-0.5 text-xs">⚠ Warning: May affect debugging</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Scope:</span>
                        <select
                          value={customConfig.symbolRenamingScope}
                          onChange={(e) => setCustomConfig({ ...customConfig, symbolRenamingScope: e.target.value })}
                          disabled={!customConfig.symbolRenamingEnabled}
                          className="w-28 px-2 py-1 text-sm border border-gray-300 rounded-md bg-white focus:ring-gray-500 focus:border-gray-500"
                        >
                          <option value="All">All</option>
                          <option value="Functions">Functions Only</option>
                          <option value="Variables">Variables Only</option>
                        </select>
                      </div>
                    </div>

                    {/* String Encryption */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.stringEncryptionEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, stringEncryptionEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">String Encryption</label>
                        <div
                          className="relative"
                          onMouseEnter={() => setActiveTooltip('stringEncryption')}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                          {activeTooltip === 'stringEncryption' && (
                            <div className="absolute left-0 bottom-6 z-50 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-xl">
                              <p className="font-semibold text-gray-900 mb-1.5 text-xs">String Encryption</p>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">What it does:</span> Encrypts string literals at runtime.</p>
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">Use for:</span> API keys, messages, constants.</p>
                                <p className="text-orange-600 font-medium pt-0.5 text-xs">⚠ Performance impact: Minimal</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Method:</span>
                        <select
                          value={customConfig.stringEncryptionMethod}
                          onChange={(e) => setCustomConfig({ ...customConfig, stringEncryptionMethod: e.target.value })}
                          disabled={!customConfig.stringEncryptionEnabled}
                          className="w-28 px-2 py-1 text-sm border border-gray-300 rounded-md bg-white focus:ring-gray-500 focus:border-gray-500"
                        >
                          <option value="XOR">XOR</option>
                          <option value="AES">AES</option>
                          <option value="Base64">Base64</option>
                        </select>
                      </div>
                    </div>

                    {/* Preprocessor Tricks */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.preprocessorEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, preprocessorEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Preprocessor Tricks</label>
                        <div
                          className="relative"
                          onMouseEnter={() => setActiveTooltip('preprocessor')}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                          {activeTooltip === 'preprocessor' && (
                            <div className="absolute left-0 bottom-6 z-50 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-xl">
                              <p className="font-semibold text-gray-900 mb-1.5 text-xs">Preprocessor Tricks</p>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">What it does:</span> Uses preprocessor directives to obfuscate code.</p>
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">Effect:</span> Makes code harder to analyze.</p>
                                <p className="text-orange-600 font-medium pt-0.5 text-xs">⚠ Performance impact: Minimal</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Opaque Predicates */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.opaquePredicatesEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, opaquePredicatesEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Opaque Predicates</label>
                        <div
                          className="relative"
                          onMouseEnter={() => setActiveTooltip('opaquePredicates')}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                          {activeTooltip === 'opaquePredicates' && (
                            <div className="absolute left-0 bottom-6 z-50 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-xl">
                              <p className="font-semibold text-gray-900 mb-1.5 text-xs">Opaque Predicates</p>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">What it does:</span> Inserts conditions that always evaluate the same way.</p>
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">Effect:</span> Confuses static analysis tools.</p>
                                <p className="text-orange-600 font-medium pt-0.5 text-xs">⚠ Performance impact: Low</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Level: {customConfig.opaquePredicatesLevel}</span>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={customConfig.opaquePredicatesLevel}
                          onChange={(e) => setCustomConfig({ ...customConfig, opaquePredicatesLevel: parseInt(e.target.value) })}
                          disabled={!customConfig.opaquePredicatesEnabled}
                          className="w-28 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                        />
                      </div>
                    </div>

                    {/* Address Obfuscation */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.addressObfuscationEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, addressObfuscationEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Address Obfuscation</label>
                        <div
                          className="relative"
                          onMouseEnter={() => setActiveTooltip('addressObf')}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                          {activeTooltip === 'addressObf' && (
                            <div className="absolute left-0 bottom-6 z-50 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-xl">
                              <p className="font-semibold text-gray-900 mb-1.5 text-xs">Address Obfuscation</p>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p className="text-xs"  ><span className="font-medium text-xs text-gray-700">What it does:</span> Obfuscates memory addresses and pointers.</p>
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">Effect:</span> Prevents memory analysis and tampering.</p>
                                <p className="text-orange-600 font-medium pt-0.5 text-xs">⚠ Performance impact: Low-Medium</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Anti-Debug Protection */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.antiDebugEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, antiDebugEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">Anti-Debug Protection</label>
                        <div
                          className="relative"
                          onMouseEnter={() => setActiveTooltip('antiDebug')}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                          {activeTooltip === 'antiDebug' && (
                            <div className="absolute left-0 bottom-6 z-50 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-xl">
                              <p className="font-semibold text-gray-900 mb-1.5 text-xs">Anti-Debug Protection</p>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">What it does:</span> Detects and prevents debugging attempts.</p>
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">Effect:</span> Makes reverse engineering significantly harder.</p>
                                <p className="text-orange-600 font-medium pt-0.5 text-xs">⚠ Performance impact: Minimal</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* UPX Compression */}
                    <div className="flex items-center justify-between py-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={customConfig.upxEnabled}
                          onChange={(e) => setCustomConfig({ ...customConfig, upxEnabled: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-gray-600 focus:ring-gray-500 accent-gray-600"
                        />
                        <label className="text-sm font-medium text-gray-900">UPX Compression</label>
                        <div
                          className="relative"
                          onMouseEnter={() => setActiveTooltip('upx')}
                          onMouseLeave={() => setActiveTooltip(null)}
                        >
                          <HelpCircle className="h-4 w-4 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                          {activeTooltip === 'upx' && (
                            <div className="absolute left-0 bottom-6 z-50 w-72 p-3 bg-white border border-gray-200 rounded-lg shadow-xl">
                              <p className="font-semibold text-gray-900 mb-1.5 text-xs">UPX Compression</p>
                              <div className="space-y-1 text-xs text-gray-600">
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">What it does:</span> Compresses the executable.</p>
                                <p className="text-xs"><span className="font-medium text-xs text-gray-700">Effect:</span> Reduces file size and adds a layer of packing.</p>
                                <p className="text-orange-600 font-medium pt-0.5 text-xs">⚠ Performance impact: Startup time</p>
                              </div>
                            </div>
                          )}
                        </div>
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

