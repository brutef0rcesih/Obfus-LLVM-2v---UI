import React, { useState } from 'react'
import { Save, Plus, Edit3, Trash2, Settings, Shield, Zap, Lock, Home, ChevronRight, Sliders, ArrowLeft, Check, X, HelpCircle, MoreVertical, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const ConfigurationPage = () => {
    const navigate = useNavigate();
    const [activeDropdown, setActiveDropdown] = useState(null);

    React.useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeDropdown && !event.target.closest('.actions-dropdown')) {
                setActiveDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeDropdown]);

    const [templates, setTemplates] = useState([
        {
            id: 1,
            name: 'Basic Protection',
            type: 'basic',
            icon: Shield,
            settings: {
                obfuscationLevel: 'low',
                stringEncryption: true,
                controlFlow: true,
                bogus: false,
                keyFunctionVirtualization: false,
                opaque: false,
                preprocessorTrickery: false,
                addressObfuscation: false,
                symbolRenaming: false,
                antiDebug: false,
                enableAllTechniques: false,
                upxLevel: 'low'
            }
        },
        {
            id: 2,
            name: 'Balanced Protection',
            type: 'balanced',
            icon: Settings,
            settings: {
                obfuscationLevel: 'medium',
                stringEncryption: true,
                controlFlow: true,
                bogus: true,
                keyFunctionVirtualization: false,
                opaque: false,
                preprocessorTrickery: false,
                addressObfuscation: false,
                symbolRenaming: false,
                antiDebug: false,
                enableAllTechniques: false,
                upxLevel: 'medium'
            }
        },
        {
            id: 3,
            name: 'Medium Security',
            type: 'medium',
            icon: Lock,
            settings: {
                obfuscationLevel: 'high',
                stringEncryption: true,
                controlFlow: true,
                bogus: true,
                keyFunctionVirtualization: true,
                opaque: true,
                preprocessorTrickery: true,
                addressObfuscation: true,
                symbolRenaming: true,
                antiDebug: true,
                enableAllTechniques: true,
                upxLevel: 'high'
            }
        },
        {
            id: 4,
            name: 'Maximum Security',
            type: 'maximum',
            icon: Zap,
            settings: {
                obfuscationLevel: 'medium',
                stringEncryption: true,
                controlFlow: true,
                bogus: true,
                keyFunctionVirtualization: false,
                opaque: true,
                preprocessorTrickery: false,
                addressObfuscation: false,
                symbolRenaming: false,
                antiDebug: false,
                enableAllTechniques: false,
                upxLevel: 'medium'
            }
        },
        {
            id: 5,
            name: 'Custom Configuration',
            type: 'custom',
            icon: Sliders,
            settings: {
                obfuscationLevel: 'medium',
                stringEncryption: true,
                controlFlow: false,
                bogus: false,
                keyFunctionVirtualization: false,
                opaque: false,
                preprocessorTrickery: false,
                addressObfuscation: false,
                symbolRenaming: false,
                antiDebug: false,
                enableAllTechniques: false,
                upxLevel: 'medium'
            }
        }
    ])

    const [showCreateForm, setShowCreateForm] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState(null)
    const [newTemplate, setNewTemplate] = useState({
        name: '',
        type: 'custom',
        icon: Shield,
        settings: {
            obfuscationLevel: 'medium',
            stringEncryption: true,
            stringEncryptionStrength: 5,
            stringEncryptionMethod: 'xor',
            controlFlow: false,
            controlFlowStrength: 5,
            bogus: false,
            bogusStrength: 5,
            keyFunctionVirtualization: false,
            virtualizationStrength: 5,
            virtualizationMode: 'light',
            opaque: false,
            preprocessorTrickery: false,
            addressObfuscation: false,
            symbolRenaming: false,
            symbolRenamingStrength: 5,
            symbolRenamingScope: 'all',
            antiDebug: false,
            enableAllTechniques: false,
            upxLevel: 'medium'
        }
    })

    const handleCreateTemplate = () => {
        if (newTemplate.name) {
            const template = {
                ...newTemplate,
                id: Date.now()
            }
            setTemplates([...templates, template])
            setNewTemplate({
                name: '',
                type: 'custom',
                icon: Shield,
                settings: {
                    obfuscationLevel: 'medium',
                    stringEncryption: true,
                    stringEncryptionStrength: 5,
                    stringEncryptionMethod: 'xor',
                    controlFlow: false,
                    controlFlowStrength: 5,
                    bogus: false,
                    bogusStrength: 5,
                    keyFunctionVirtualization: false,
                    virtualizationStrength: 5,
                    virtualizationMode: 'light',
                    opaque: false,
                    preprocessorTrickery: false,
                    addressObfuscation: false,
                    symbolRenaming: false,
                    symbolRenamingStrength: 5,
                    symbolRenamingScope: 'all',
                    antiDebug: false,
                    enableAllTechniques: false,
                    upxLevel: 'medium'
                }
            })
            setShowCreateForm(false)
        }
    }

    const handleEditTemplate = (template) => {
        setEditingTemplate(template)
        setNewTemplate(template)
        setShowCreateForm(true)
    }

    const handleUpdateTemplate = () => {
        if (editingTemplate && newTemplate.name) {
            setTemplates(templates.map(t =>
                t.id === editingTemplate.id ? { ...newTemplate, id: editingTemplate.id } : t
            ))
            setNewTemplate({
                name: '',
                type: 'custom',

                settings: {
                    obfuscationLevel: 'medium',
                    stringEncryption: true,
                    controlFlow: false,
                    bogus: false,
                    keyFunctionVirtualization: false,
                    opaque: false,
                    preprocessorTrickery: false,
                    addressObfuscation: false,
                    symbolRenaming: false,
                    antiDebug: false,
                    enableAllTechniques: false,
                    upxLevel: 'medium'
                }
            })
            setShowCreateForm(false)
            setEditingTemplate(null)
        }
    }

    const handleDeleteTemplate = (id) => {
        setTemplates(templates.filter(t => t.id !== id))
    }

    const handleCloseForm = () => {
        setShowCreateForm(false)
        setEditingTemplate(null)
        setNewTemplate({
            name: '',
            type: 'custom',
            icon: Shield,
            settings: {
                obfuscationLevel: 'medium',
                stringEncryption: true,
                stringEncryptionStrength: 5,
                stringEncryptionMethod: 'xor',
                controlFlow: false,
                controlFlowStrength: 5,
                bogus: false,
                bogusStrength: 5,
                keyFunctionVirtualization: false,
                virtualizationStrength: 5,
                virtualizationMode: 'light',
                opaque: false,
                preprocessorTrickery: false,
                addressObfuscation: false,
                symbolRenaming: false,
                symbolRenamingStrength: 5,
                symbolRenamingScope: 'all',
                antiDebug: false,
                enableAllTechniques: false,
                upxLevel: 'medium'
            }
        })
    }

    const renderCheck = (value) => {
        return value ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-black  rounded-full">

                Enabled
                <Check className="w-3 h-3 text-green-600" />
            </span>
        ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-black  rounded-full">

                Disabled
                <X className="w-3 h-3 text-red-600" />
            </span>
        );
    };
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-[95%] mx-auto px-6 py-6">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                    <button
                        onClick={() => navigate('/obfuscation')}
                        className="hover:text-gray-900 transition-colors"
                    >
                        <Home className="h-4 w-4" />
                    </button>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-gray-900 font-medium">Configuration</span>
                </nav>

                {!showCreateForm ? (
                    <>
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-lg font-medium text-gray-900"> Configuration Profiles </h1>
                            </div>
                            <button
                                onClick={() => setShowCreateForm(true)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span>Create Profile</span>
                            </button>
                        </div>

                        {/* Templates Table */}
                        <div className="overflow-auto max-h-[70vh] border border-gray-300 rounded-lg">
                            <table className="min-w-full bg-white border border-gray-300">
                                <thead className="bg-gray-50 border-b border-gray-300 sticky top-0 z-30">
                                    <tr>
                                        <th className="px-4 py-3 border border-gray-300 text-left text-xs font-semibold text-gray-700 whitespace-nowrap  ">
                                            Profile Name
                                        </th>
                                        <th className="px-4 py-3 border border-gray-300 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                                            Preprocessor Tricks
                                        </th>
                                        <th className="px-4 py-3 border border-gray-300 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                                            String Encryption
                                        </th>
                                        <th className="px-4 py-3 border border-gray-300 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                                            Function Virtualization
                                        </th>
                                        <th className="px-4 py-3 border border-gray-300 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                                            Bogus Control Flow
                                        </th>
                                        <th className="px-4 py-3 border border-gray-300 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                                            Opaque Predicates
                                        </th>
                                        <th className="px-4 py-3 border border-gray-300 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                                            Control Flow Flattening
                                        </th>
                                        <th className="px-4 py-3 border border-gray-300 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                                            Address Obfuscation
                                        </th>
                                        <th className="px-4 py-3 border border-gray-300 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                                            Symbol Renaming
                                        </th>
                                        <th className="px-4 py-3 border border-gray-300 text-center text-xs font-semibold text-gray-700 whitespace-nowrap">
                                            Anti-Debug Protection
                                        </th>
                                        <th className="px-4 py-3 border border-gray-300 text-center text-xs font-semibold text-gray-700 whitespace-nowrap ">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {templates.map((template) => (
                                        <tr key={template.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 border border-gray-300 whitespace-nowrap ">
                                                <span className="text-sm font-medium text-gray-700">{template.name}</span>
                                            </td>

                                            <td className="px-4 py-3 border border-gray-300 whitespace-nowrap text-center">
                                                {renderCheck(template.settings.preprocessorTrickery)}
                                            </td>

                                            <td className="px-4 py-3 border border-gray-300 whitespace-nowrap text-center">
                                                {renderCheck(template.settings.stringEncryption)}
                                            </td>

                                            <td className="px-4 py-3 border border-gray-300 whitespace-nowrap text-center">
                                                {renderCheck(template.settings.keyFunctionVirtualization)}
                                            </td>

                                            <td className="px-4 py-3 border border-gray-300 whitespace-nowrap text-center">
                                                {renderCheck(template.settings.bogus)}
                                            </td>

                                            <td className="px-4 py-3 border border-gray-300 whitespace-nowrap text-center">
                                                {renderCheck(template.settings.opaque)}
                                            </td>

                                            <td className="px-4 py-3 border border-gray-300 whitespace-nowrap text-center">
                                                {renderCheck(template.settings.controlFlow)}
                                            </td>

                                            <td className="px-4 py-3 border border-gray-300 whitespace-nowrap text-center">
                                                {renderCheck(template.settings.addressObfuscation)}
                                            </td>

                                            <td className="px-4 py-3 border border-gray-300 whitespace-nowrap text-center">
                                                {renderCheck(template.settings.symbolRenaming)}
                                            </td>

                                            <td className="px-4 py-3 border border-gray-300 whitespace-nowrap text-center">
                                                {renderCheck(template.settings.antiDebug)}
                                            </td>

                                            {/* Actions column */}
                                            <td className="px-4 py-3 border border-gray-300 text-center whitespace-nowrap">
                                                <div className="relative actions-dropdown flex justify-center">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setActiveDropdown(activeDropdown === template.id ? null : template.id);
                                                        }}
                                                        className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {activeDropdown === template.id && (
                                                        <div className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditTemplate(template);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Eye className="w-3.5 h-3.5" />
                                                                View
                                                            </button>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEditTemplate(template);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                <Edit3 className="w-3.5 h-3.5" />
                                                                Modify
                                                            </button>

                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDeleteTemplate(template.id);
                                                                    setActiveDropdown(null);
                                                                }}
                                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                <Trash2 className="w-3.5 h-3.5" />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>


                    </>
                ) : (
                    <>
                        {/* Form Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleCloseForm}
                                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                                >
                                    <ArrowLeft className="h-5 w-5 text-gray-600" />
                                </button>
                                <div>
                                    <h1 className="text-md font-semibold text-gray-900">
                                        {editingTemplate ? 'Edit Template' : 'Create New Template'}
                                    </h1>

                                </div>
                            </div>
                        </div>

                        {/* Form Content */}
                        <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
                            <div className="p-6 space-y-6">
                                {/* Template Name */}
                                <div>
                                    <label className="text-sm  mr-4 font-medium text-gray-900 mb-2">Template Name</label>
                                    <input
                                        type="text"
                                        value={newTemplate.name}
                                        onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                                        className="w-48 px-2 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                                        placeholder="Enter template name"
                                    />
                                </div>

                                {/* Obfuscation Settings */}
                                <div>
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Obfuscation Settings</h4>


                                    {/* Obfuscation Methods */}
                                    {/* Obfuscation Methods List */}
                                    {/* Obfuscation Cycles */}
                                    <div className="mb-6 pb-6 border-b border-gray-300">
                                        <div className="flex items-center ">

                                            {/* Label + Tooltip */}
                                            <div className="flex items-center gap-2">
                                                <label className="text-sm font-medium text-gray-900">Number of Obfuscation Cycles</label>
                                                <div className="group relative flex items-center">
                                                    <HelpCircle className="w-3 h-3 text-gray-400 cursor-help mr-3" />
                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-72 p-3 bg-gray-100 text-gray-900 border border-gray-200 text-sm rounded shadow-lg z-20 pointer-events-none">
                                                        <strong>Obfuscation Cycles</strong><br />
                                                        What it does: Repeats the obfuscation process multiple times.<br />
                                                        Effect: Increases complexity exponentially.<br />
                                                        <span className="text-yellow-300 text-xs">⚠ Performance impact: High. Increases build time and file size.</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Slider + Input */}
                                            <div className="flex items-center gap-4">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="10"
                                                    value={newTemplate.settings.obfuscationCycles || 1}
                                                    onChange={(e) =>
                                                        setNewTemplate({
                                                            ...newTemplate,
                                                            settings: {
                                                                ...newTemplate.settings,
                                                                obfuscationCycles: parseInt(e.target.value),
                                                            },
                                                        })
                                                    }
                                                    className="w-14 px-2 py-1 border border-gray-300 rounded-md text-sm text-gray-900 focus:ring-gray-400 focus:border-gray-400"
                                                />
                                            </div>

                                        </div>
                                    </div>


                                    <div className="relative grid grid-cols-2 gap-x-12 gap-y-4">
                                        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-300 -translate-x-1/2"></div>
                                        {[
                                            { key: "preprocessorTrickery", label: "1. Preprocessor Tricks", help: "Enable preprocessor-based obfuscation techniques." },
                                            {
                                                key: "stringEncryption", label: "2. String Encryption",
                                                help: (
                                                    <>
                                                        <strong className="text-xs">String Encryption</strong><br />
                                                        What it does: Encrypts string literals and decrypts them at runtime.<br />
                                                        Use for: API keys, messages, constants, embedded scripts.<br />
                                                        <span className="text-yellow-300 text-xs">⚠ Performance impact: Minimal.</span>
                                                    </>
                                                ),
                                                hasStrength: true, strengthKey: "stringEncryptionStrength",
                                                hasDropdown: true, dropdownKey: "stringEncryptionMethod", options: ["xor", "aes", "rc4"]
                                            },
                                            {
                                                key: "keyFunctionVirtualization", label: "3. Function Virtualization",
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
                                                hasDropdown: true, dropdownKey: "virtualizationMode", options: ["light", "medium", "heavy"]
                                            },
                                            {
                                                key: "bogus", label: "4. Bogus Control Flow",
                                                help: (
                                                    <>
                                                        <strong>Bogus Code Insertion</strong><br />
                                                        What it does: Injects fake logic, dead branches, and unreachable blocks.<br />
                                                        Effect: Makes static analysis significantly harder.<br />
                                                        Recommended: Levels 5–8 for important functions.<br />
                                                        <span className="text-yellow-300 text-xs">⚠ Performance impact: Low.</span>
                                                    </>
                                                ),
                                                hasStrength: true, strengthKey: "bogusStrength"
                                            },
                                            { key: "opaque", label: "5. Opaque Predicates", help: "Add opaque predicates that are always true or false." },
                                            {
                                                key: "controlFlow", label: "6. Control Flow Flattening",
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
                                            { key: "addressObfuscation", label: "7. Address Obfuscation", help: "Obfuscate memory addresses." },
                                            {
                                                key: "symbolRenaming", label: "8. Symbol Renaming",
                                                help: (
                                                    <>
                                                        <strong>Symbol Renaming</strong><br />
                                                        What it does: Replaces function/variable/class names with generated meaningless identifiers.<br />
                                                        Effect: Prevents understanding of logic structure and intent.<br />
                                                        Warning: May affect debugging if overused.
                                                    </>
                                                ),
                                                hasStrength: true, strengthKey: "symbolRenamingStrength",
                                                hasDropdown: true, dropdownKey: "symbolRenamingScope", options: ["all", "public", "internal"]
                                            },
                                            { key: "antiDebug", label: "9. Anti-Debug Protection", help: "Add anti-debugging checks." },
                                        ].map((option, index) => (
                                            <div key={option.key} className="flex items-center justify-between py-2 border-b border-gray-300">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={newTemplate.settings[option.key] || false}
                                                        onChange={(e) =>
                                                            setNewTemplate({
                                                                ...newTemplate,
                                                                settings: {
                                                                    ...newTemplate.settings,
                                                                    [option.key]: e.target.checked,
                                                                },
                                                            })
                                                        }
                                                        className="w-4 h-4 rounded border-gray-600 text-gray-600 focus:ring-gray-500 accent-gray-600"
                                                    />
                                                    <label className="text-sm font-medium text-gray-900">{option.label}</label>
                                                    <div className="group relative flex items-center">
                                                        <HelpCircle className="w-3 h-3 text-gray-400 cursor-help" />
                                                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-72 p-3 bg-gray-100 text-gray-900 border border-gray-200 text-[10px] rounded shadow-lg z-20 pointer-events-none">
                                                            {option.help}
                                                        </div>
                                                    </div>
                                                </div>

                                                {newTemplate.settings[option.key] && (
                                                    <div className="flex items-center gap-4">
                                                        {option.hasStrength && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm text-gray-600">Strength: {newTemplate.settings[option.strengthKey]}</span>
                                                                <input
                                                                    type="range"
                                                                    min="0"
                                                                    max="10"
                                                                    value={newTemplate.settings[option.strengthKey] || 0}
                                                                    onChange={(e) =>
                                                                        setNewTemplate({
                                                                            ...newTemplate,
                                                                            settings: {
                                                                                ...newTemplate.settings,
                                                                                [option.strengthKey]: parseInt(e.target.value),
                                                                            },
                                                                        })
                                                                    }
                                                                    className="w-24 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-gray-600"
                                                                />
                                                            </div>
                                                        )}

                                                        {option.hasDropdown && (
                                                            <select
                                                                value={newTemplate.settings[option.dropdownKey]}
                                                                onChange={(e) =>
                                                                    setNewTemplate({
                                                                        ...newTemplate,
                                                                        settings: {
                                                                            ...newTemplate.settings,
                                                                            [option.dropdownKey]: e.target.value,
                                                                        },
                                                                    })
                                                                }
                                                                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded-md bg-white focus:ring-gray-500 focus:border-gray-500"
                                                            >
                                                                {option.options.map(opt => (
                                                                    <option key={opt} value={opt}>{opt}</option>
                                                                ))}
                                                            </select>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>

                            {/* Form Actions */}
                            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 justify-end bg-gray-50">
                                <button
                                    onClick={handleCloseForm}
                                    className="px-4 py-2 bg-white hover:bg-gray-100 text-gray-700 font-medium border border-gray-300 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
                                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <Save className="w-4 h-4" />
                                    <span>{editingTemplate ? 'Update Template' : 'Create Template'}</span>
                                </button>
                            </div>
                        </div>
                    </>
                )
                }
            </div>
        </div>
    )
}

export default ConfigurationPage
