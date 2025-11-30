import React, { useState, useEffect } from 'react'
import { X, Check, HelpCircle } from 'lucide-react'
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
    <div className="h-screen bg-gray-50 flex flex-col ">
      {/* Main Layout - Sidebar and Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <UploadSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} activeItem="configuration" />

        {/* Main Content */}
        <div className="flex-1 ">
          <div className="max-w-6xl mx-auto py-3 px-6 ">
            {/* Header */}
            <h2 className="text-md font-normal text-gray-900 mb-2">Select Configuration</h2>

            {/* Template Selection */}
         <div className="max-w-7xl mx-auto mb-3">
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
      className="px-3 py-2 border border-gray-300 rounded-lg 
                 focus:ring-2 focus:ring-gray-500 focus:border-gray-500 
                 transition-colors bg-white"
      style={{ width: "220px" }}   // <-- FIXED WIDTH HERE
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
            <div className="max-w-7xl mx-auto mb-6">
              {templateType !== 'custom' && (
                <>
                  <div className="mb-2">
                    <h3 className="text-md font-medium text-gray-900">Configure Selected:</h3>
                  </div>

                  <div className="border border-gray-300 rounded-lg shadow-sm bg-white w-full overflow-hidden">
                    {/* Header */}
                    <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-300">
                      <div className="text-xs font-semibold text-gray-700 tracking-wider  text-center px-4 py-3 border-r border-gray-300">
                        Method
                      </div>
                      <div className="text-xs font-semibold text-gray-700 tracking-wider text-center px-4 py-3 border-r border-gray-300">
                        Status
                      </div>
                      <div className="text-xs font-semibold text-gray-700 tracking-wider text-center px-4 py-3">
                        Extent
                      </div>
                    </div>

                    {/* Body */}
                    <div >
                      {(templateType && PRESETS[templateType] ? PRESETS[templateType].methods : PRESETS.ultra.methods).map((method, index) => (
                        <div
                          key={index}
                          className="grid grid-cols-3 items-center hover:bg-gray-50 transition-colors border-b border-gray-300"
                        >
                          {/* Method Name */}
                          <div className="text-sm text-gray-900   font-medium px-4 py-3 border-r border-gray-300">
                            {method.name}
                          </div>
                          {/* Status */}
                          <div className="text-center px-4 py-3 border-r border-gray-300">
                            {templateType ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium ${method.enabled
                                  ? " text-black"
                                  : " text-black"
                                  }`}
                              >
                                {method.enabled ? (
                                  <>

                                    Enabled <Check className="w-3 h-3 text-green-600" />
                                  </>
                                ) : (
                                  <>

                                    Disabled <X className="w-3 h-3 text-red-600" />
                                  </>
                                )}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">-</span>
                            )}
                          </div>


                          {/* Extent / Strength */}
                          <div className="text-center px-4 py-3">
                            {templateType &&
                              (method.strength !== undefined || method.value !== undefined) &&
                              method.enabled ? (
                              <span className="text-sm text-black ">
                                {method.strength !== undefined
                                  ? `Strength: ${method.strength}`
                                  : `Value: ${method.value}`}
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
                <div className="bg-white max-w-7xl  border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Obfuscation Settings</h3>

                    {/* Obfuscation Cycles */}
                    <div className="flex items-center gap-4">
                      <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        Number of Obfuscation Cycles
                        <div className="group relative flex items-center">
                          <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-72 p-3 bg-gray-800 text-white text-sm rounded shadow-lg z-20 pointer-events-none">
                            <strong>Obfuscation Cycles</strong><br />
                            What it does: Repeats the obfuscation process multiple times.<br />
                            Effect: Increases complexity exponentially.<br />
                            <span className="text-yellow-300">⚠ Performance impact: High. Increases build time and file size.</span>
                          </div>
                        </div>
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={customConfig.obfuscationCycles || 1}
                        onChange={(e) => setCustomConfig({ ...customConfig, obfuscationCycles: parseInt(e.target.value) })}
                        className="w-16 px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  </div>

                  <div className="divide-y divide-gray-200">
                    {[
                      { key: "preprocessorEnabled", label: "1. Preprocessor Tricks", help: "Enable preprocessor-based obfuscation techniques." },
                      {
                        key: "stringEncryptionEnabled", label: "2. String Encryption",
                        help: (
                          <>
                            <strong className="text-xs">String Encryption</strong><br />
                            What it does: Encrypts string literals and decrypts them at runtime.<br />
                            Use for: API keys, messages, constants, embedded scripts.<br />
                            <span className="text-yellow-300 text-xs">⚠ Performance impact: Minimal.</span>
                          </>
                        ),
                        hasStrength: true, strengthKey: "stringEncryptionStrength",
                        hasDropdown: true, dropdownKey: "stringEncryptionMethod", dropdownLabel: "Method:", options: ["xor", "aes", "rc4"]
                      },
                      {
                        key: "virtualizationEnabled", label: "3. Function Virtualization",
                        help: (
                          <>
                            <strong>Function Virtualization</strong><br />
                            What it does: Converts selected functions into custom bytecode executed by a virtual machine.<br />
                            Effect: Extremely strong protection.<br />
                            Use for: Core logic, licensing routines, cryptographic code.<br />
                            <span className="text-yellow-300 text-xs" >⚠ Performance impact: Medium–high depending on mode.</span>
                          </>
                        ),
                        hasStrength: true, strengthKey: "virtualizationStrength",
                        hasDropdown: true, dropdownKey: "virtualizationMode", dropdownLabel: "Mode:", options: ["light", "medium", "heavy"]
                      },
                      {
                        key: "bogusCodeEnabled", label: "4. Bogus Control Flow",
                        help: (
                          <>
                            <strong>Bogus Code Insertion</strong><br />
                            What it does: Injects fake logic, dead branches, and unreachable blocks.<br />
                            Effect: Makes static analysis significantly harder.<br />
                            Recommended: Levels 5–8 for important functions.<br />
                            <span className="text-yellow-300 text-xs">⚠ Performance impact: Low.</span>
                          </>
                        ),
                        hasStrength: true, strengthKey: "bogusCodeLevel"
                      },
                      { key: "opaquePredicatesEnabled", label: "5. Opaque Predicates", help: "Add opaque predicates that are always true or false." },
                      {
                        key: "controlFlowEnabled", label: "6. Control Flow Flattening",
                        help: (
                          <>
                            <strong>Control-Flow Flattening</strong><br />
                            What it does: Converts structured logic (if/else/loops) into a single flat dispatcher.<br />
                            Effect: Makes decompiled output look like spaghetti logic.<br />
                            When to use: High-security builds.<br />
                            Recommended: 5–8 for critical components.<br />
                            <span className="text-yellow-300 text-xs">⚠ Performance impact: Can slow execution by 2–5×.</span>
                          </>
                        ),
                        hasStrength: true, strengthKey: "controlFlowStrength"
                      },
                      { key: "addressObfuscationEnabled", label: "7. Address Obfuscation", help: "Obfuscate memory addresses." },
                      {
                        key: "symbolRenamingEnabled", label: "8. Symbol Renaming",
                        help: (
                          <>
                            <strong>Symbol Renaming</strong><br />
                            What it does: Replaces function/variable/class names with generated meaningless identifiers.<br />
                            Effect: Prevents understanding of logic structure and intent.<br />
                            Warning: May affect debugging if overused.
                          </>
                        ),
                        hasStrength: true, strengthKey: "symbolRenamingStrength",
                        hasDropdown: true, dropdownKey: "symbolRenamingScope", dropdownLabel: "Scope:", options: ["all", "public", "internal"]
                      },
                      { key: "antiDebugEnabled", label: "9. Anti-Debug Protection", help: "Add anti-debugging checks." },
                    ].map((option) => (
                      <div key={option.key} className="flex items-center gap-6 py-3 px-6 bg-white hover:bg-gray-50 transition-colors">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={customConfig[option.key] || false}
                          onChange={(e) =>
                            setCustomConfig({
                              ...customConfig,
                              [option.key]: e.target.checked,
                            })
                          }
                          className="w-4 h-4 accent-gray-700 cursor-pointer"
                        />

                        {/* Title & Tooltip */}
                        <div className="flex items-center gap-2 w-64">
                          <span className="text-sm font-semibold text-gray-900">{option.label}</span>
                          <div className="group relative flex items-center">
                            <HelpCircle className="w-3.5 h-3.5 text-gray-400 cursor-help" />
                            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-72 p-3 bg-gray-100 text-gray-900 border border-gray-200 text-[10px] rounded shadow-lg z-20 pointer-events-none">
                              {option.help}
                            </div>
                          </div>
                        </div>

                        {/* Controls */}
                        {customConfig[option.key] && (
                          <div className="flex items-center gap-6 flex-1">
                            {option.hasStrength && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Strength:</span>
                                <input
                                  type="range"
                                  min="0"
                                  max="10"
                                  value={customConfig[option.strengthKey] || 0}
                                  onChange={(e) =>
                                    setCustomConfig({
                                      ...customConfig,
                                      [option.strengthKey]: parseInt(e.target.value),
                                    })
                                  }
                                  className="w-32 accent-gray-700 cursor-pointer"
                                />
                                <span className="text-sm text-gray-500 w-4">{customConfig[option.strengthKey]}</span>
                              </div>
                            )}

                            {option.hasDropdown && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">{option.dropdownLabel}</span>
                                <select
                                  value={customConfig[option.dropdownKey]}
                                  onChange={(e) =>
                                    setCustomConfig({
                                      ...customConfig,
                                      [option.dropdownKey]: e.target.value,
                                    })
                                  }
                                  className="px-2 py-1 text-sm border border-gray-300 rounded bg-white cursor-pointer focus:ring-gray-500 focus:border-gray-500"
                                >
                                  {option.options.map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
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
