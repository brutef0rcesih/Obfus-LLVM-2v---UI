import React, { useState } from 'react';
import { ChevronRight, Home, FileJson, Package, Download, Upload, CheckCircle, AlertCircle, Info, Shield, Zap, Gauge } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ClientConfiguration() {
    const navigate = useNavigate();
    const [profileName, setProfileName] = useState('my_profile.json');
    const [selectedPresetFile, setSelectedPresetFile] = useState(null);
    const [outputBinaryName, setOutputBinaryName] = useState('obfuscator_custom');
    const [outputFolderPath, setOutputFolderPath] = useState('C:\\Obfus-LLVM\\binaries');
    const [buildStatus, setBuildStatus] = useState(null);
    const [buildMessage, setBuildMessage] = useState('');
    const [outputPath, setOutputPath] = useState('');
    const [profileCreated, setProfileCreated] = useState(false);

    // Global Settings
    const [globalStrength, setGlobalStrength] = useState('balanced');
    const [cycles, setCycles] = useState(1);
    const [seed, setSeed] = useState('');

    // Per-Technique Settings
    const [bogusEnabled, setBogusEnabled] = useState(false);
    const [bogusStrength, setBogusStrength] = useState(5);

    const [vmEnabled, setVmEnabled] = useState(false);
    const [vmStrength, setVmStrength] = useState(5);
    const [vmMode, setVmMode] = useState('medium');

    const [cffEnabled, setCffEnabled] = useState(false);
    const [cffStrength, setCffStrength] = useState(5);

    const [symbolEnabled, setSymbolEnabled] = useState(false);
    const [symbolStrength, setSymbolStrength] = useState(5);
    const [symbolScope, setSymbolScope] = useState('all');

    const [stringEnabled, setStringEnabled] = useState(false);
    const [stringStrength, setStringStrength] = useState(5);
    const [stringMethod, setStringMethod] = useState('xor');

    const [upxEnabled, setUpxEnabled] = useState(false);

    const presets = [
        {
            id: 'ultra',
            name: 'Ultra Protection',
            description: 'Maximum security with all obfuscation passes enabled',
            icon: Shield,
            color: 'text-red-600'
        },
        {
            id: 'balanced',
            name: 'Balanced',
            description: 'Recommended settings for production use',
            icon: Gauge,
            color: 'text-gray-700'
        },
        {
            id: 'minimal',
            name: 'String-Only Minimal',
            description: 'Lightweight obfuscation for quick builds',
            icon: Zap,
            color: 'text-yellow-600'
        }
    ];

    const handleCreateProfile = () => {
        const profile = {
            profileName: profileName,
            globalSettings: {
                strength: globalStrength,
                cycles: globalStrength === 'custom' ? cycles : undefined,
                seed: globalStrength === 'custom' && seed ? seed : undefined
            },
            techniques: {
                bogus: bogusEnabled ? { enabled: true, strength: bogusStrength } : { enabled: false },
                vm: vmEnabled ? { enabled: true, strength: vmStrength, mode: vmMode } : { enabled: false },
                cff: cffEnabled ? { enabled: true, strength: cffStrength } : { enabled: false },
                symbol: symbolEnabled ? { enabled: true, strength: symbolStrength, scope: symbolScope } : { enabled: false },
                string: stringEnabled ? { enabled: true, strength: stringStrength, method: stringMethod } : { enabled: false }
            },
            packing: {
                upx: upxEnabled
            }
        };

        console.log('Profile created:', profile);
        setBuildStatus('success');
        setBuildMessage('Profile created successfully');
        setOutputPath(`C:\\Obfus-LLVM\\profiles\\${profileName}`);
        setProfileCreated(true);
        setSelectedPresetFile(profileName);
        setTimeout(() => setBuildStatus(null), 5000);
    };

    const handleBuildObfuscator = () => {
        if (!selectedPresetFile) {
            setBuildStatus('error');
            setBuildMessage('Please select a preset JSON file');
            return;
        }
        setBuildStatus('success');
        setBuildMessage('Pre-configured obfuscator built successfully');
        setOutputPath(`${outputFolderPath}\\${outputBinaryName}.exe`);
        setTimeout(() => setBuildStatus(null), 5000);
    };

    const handleUsePreset = (presetId) => {
        if (presetId === 'ultra') {
            setGlobalStrength('ultra');
            setBogusEnabled(true);
            setBogusStrength(10);
            setVmEnabled(true);
            setVmStrength(10);
            setVmMode('heavy');
            setCffEnabled(true);
            setCffStrength(10);
            setSymbolEnabled(true);
            setSymbolStrength(10);
            setSymbolScope('all');
            setStringEnabled(true);
            setStringStrength(10);
            setStringMethod('aes');
            setUpxEnabled(true);
        } else if (presetId === 'balanced') {
            setGlobalStrength('balanced');
            setBogusEnabled(true);
            setBogusStrength(5);
            setVmEnabled(false);
            setCffEnabled(true);
            setCffStrength(5);
            setSymbolEnabled(true);
            setSymbolStrength(5);
            setSymbolScope('public');
            setStringEnabled(true);
            setStringStrength(5);
            setStringMethod('xor');
            setUpxEnabled(false);
        } else if (presetId === 'minimal') {
            setGlobalStrength('fast');
            setBogusEnabled(false);
            setVmEnabled(false);
            setCffEnabled(false);
            setSymbolEnabled(true);
            setSymbolStrength(3);
            setSymbolScope('public');
            setStringEnabled(true);
            setStringStrength(3);
            setStringMethod('xor');
            setUpxEnabled(false);
        }

        setBuildStatus('success');
        setBuildMessage(`${presetId.charAt(0).toUpperCase() + presetId.slice(1)} preset loaded`);
        setTimeout(() => setBuildStatus(null), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* Breadcrumb */}
                <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
                    <button
                        onClick={() => navigate('/obfuscation')}
                        className="hover:text-gray-900 transition-colors"
                    >
                        <Home className="h-4 w-4" />
                    </button>
                    <ChevronRight className="h-4 w-4" />
                    <span className="text-gray-900 font-medium">Client Configuration</span>
                </nav>

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-gray-900">Obfus-LLVM Profile Builder</h1>
                    <p className="text-sm text-gray-600 mt-1">Create and export JSON configuration profiles for obfuscation</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left Column - Main Configuration */}
                    <div className="lg:col-span-2 space-y-4">
                        {/* Profile Output */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5">
                            <div className="flex items-center mb-3">
                                <FileJson className="h-4 w-4 text-gray-700 mr-2" />
                                <h2 className="text-base font-semibold text-gray-900">Profile Output</h2>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Profile File Name
                                    </label>
                                    <input
                                        type="text"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm"
                                        placeholder="my_profile.json"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Exports your selected obfuscation options into a JSON profile compatible with obfus-llvm</p>
                                </div>
                            </div>
                        </div>

                        {/* Global Obfuscation Mode */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5">
                            <h2 className="text-base font-semibold text-gray-900 mb-3">Global Obfuscation Mode</h2>

                            <div className="space-y-3">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                        Global Strength
                                    </label>
                                    <select
                                        value={globalStrength}
                                        onChange={(e) => setGlobalStrength(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm"
                                    >
                                        <option value="fast">Fast</option>
                                        <option value="balanced">Balanced</option>
                                        <option value="medium">Medium</option>
                                        <option value="ultra">Ultra</option>
                                        <option value="custom">Custom</option>
                                    </select>
                                </div>


                            </div>
                        </div>

                        {/* Per-Technique Controls - Only show when Custom is selected */}
                        {globalStrength === 'custom' && (
                            <div className="bg-white rounded-lg border border-gray-200 p-5">
                                <h2 className="text-base font-semibold text-gray-900 mb-4">Per-Technique Controls</h2>

                                <div className="space-y-4">
                                    {/* Bogus Code Insertion */}
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="bogus"
                                                    checked={bogusEnabled}
                                                    onChange={(e) => setBogusEnabled(e.target.checked)}
                                                    className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-700"
                                                />
                                                <label htmlFor="bogus" className="ml-2 text-sm font-medium text-gray-900">
                                                    Bogus Code Insertion
                                                </label>
                                            </div>
                                        </div>
                                        {bogusEnabled && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                                    Strength (0-10)
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    value={bogusStrength}
                                                    onChange={(e) => setBogusStrength(parseInt(e.target.value))}
                                                    className="w-full"
                                                />
                                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                    <span>0</span>
                                                    <span className="font-medium text-gray-700">{bogusStrength}</span>
                                                    <span>10</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Virtual Machine Obfuscation */}
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="vm"
                                                    checked={vmEnabled}
                                                    onChange={(e) => setVmEnabled(e.target.checked)}
                                                    className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-700"
                                                />
                                                <label htmlFor="vm" className="ml-2 text-sm font-medium text-gray-900">
                                                    Virtual Machine Obfuscation
                                                </label>
                                            </div>
                                        </div>
                                        {vmEnabled && (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                                        Strength (0-10)
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="10"
                                                        value={vmStrength}
                                                        onChange={(e) => setVmStrength(parseInt(e.target.value))}
                                                        className="w-full"
                                                    />
                                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                        <span>0</span>
                                                        <span className="font-medium text-gray-700">{vmStrength}</span>
                                                        <span>10</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                                        VM Mode
                                                    </label>
                                                    <select
                                                        value={vmMode}
                                                        onChange={(e) => setVmMode(e.target.value)}
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-700"
                                                    >
                                                        <option value="light">Light</option>
                                                        <option value="medium">Medium</option>
                                                        <option value="heavy">Heavy</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Control Flow Flattening */}
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="cff"
                                                    checked={cffEnabled}
                                                    onChange={(e) => setCffEnabled(e.target.checked)}
                                                    className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-700"
                                                />
                                                <label htmlFor="cff" className="ml-2 text-sm font-medium text-gray-900">
                                                    Control Flow Flattening
                                                </label>
                                            </div>
                                        </div>
                                        {cffEnabled && (
                                            <div>
                                                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                                    Strength (0-10)
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="10"
                                                    value={cffStrength}
                                                    onChange={(e) => setCffStrength(parseInt(e.target.value))}
                                                    className="w-full"
                                                />
                                                <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                    <span>0</span>
                                                    <span className="font-medium text-gray-700">{cffStrength}</span>
                                                    <span>10</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Symbol Renaming */}
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="symbol"
                                                    checked={symbolEnabled}
                                                    onChange={(e) => setSymbolEnabled(e.target.checked)}
                                                    className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-700"
                                                />
                                                <label htmlFor="symbol" className="ml-2 text-sm font-medium text-gray-900">
                                                    Symbol Renaming
                                                </label>
                                            </div>
                                        </div>
                                        {symbolEnabled && (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                                        Strength (0-10)
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="10"
                                                        value={symbolStrength}
                                                        onChange={(e) => setSymbolStrength(parseInt(e.target.value))}
                                                        className="w-full"
                                                    />
                                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                        <span>0</span>
                                                        <span className="font-medium text-gray-700">{symbolStrength}</span>
                                                        <span>10</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                                        Scope
                                                    </label>
                                                    <select
                                                        value={symbolScope}
                                                        onChange={(e) => setSymbolScope(e.target.value)}
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-700"
                                                    >
                                                        <option value="all">All</option>
                                                        <option value="public">Public</option>
                                                        <option value="internal">Internal</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* String Encryption */}
                                    <div className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    id="string"
                                                    checked={stringEnabled}
                                                    onChange={(e) => setStringEnabled(e.target.checked)}
                                                    className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-700"
                                                />
                                                <label htmlFor="string" className="ml-2 text-sm font-medium text-gray-900">
                                                    String Encryption
                                                </label>
                                            </div>
                                        </div>
                                        {stringEnabled && (
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                                        Strength (0-10)
                                                    </label>
                                                    <input
                                                        type="range"
                                                        min="0"
                                                        max="10"
                                                        value={stringStrength}
                                                        onChange={(e) => setStringStrength(parseInt(e.target.value))}
                                                        className="w-full"
                                                    />
                                                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                        <span>0</span>
                                                        <span className="font-medium text-gray-700">{stringStrength}</span>
                                                        <span>10</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                                                        Method
                                                    </label>
                                                    <select
                                                        value={stringMethod}
                                                        onChange={(e) => setStringMethod(e.target.value)}
                                                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-gray-700"
                                                    >
                                                        <option value="xor">XOR</option>
                                                        <option value="aes">AES</option>
                                                        <option value="rc4">RC4</option>
                                                    </select>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Optional Binary Packing */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5">
                            <h2 className="text-base font-semibold text-gray-900 mb-3">Optional Binary Packing</h2>
                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    id="upx"
                                    checked={upxEnabled}
                                    onChange={(e) => setUpxEnabled(e.target.checked)}
                                    className="w-4 h-4 text-gray-700 border-gray-300 rounded focus:ring-gray-700"
                                />
                                <label htmlFor="upx" className="ml-2 text-sm text-gray-700">
                                    Enable UPX Compression
                                </label>
                            </div>
                        </div>

                        {/* Create Profile Button */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5">
                            <button
                                onClick={handleCreateProfile}
                                className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm flex items-center justify-center"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Create Profile
                            </button>
                        </div>

                        {/* Build Standalone Obfuscator - Shows after profile creation */}
                        {profileCreated && (
                            <div className="bg-white rounded-lg border border-gray-200 p-5">
                                <div className="flex items-center mb-3">
                                    <Package className="h-4 w-4 text-gray-700 mr-2" />
                                    <h2 className="text-base font-semibold text-gray-900">Build Standalone Obfuscator</h2>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">Generate a fixed-config obfuscator binary from the created preset</p>

                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Selected Preset JSON
                                        </label>
                                        <input
                                            type="text"
                                            value={selectedPresetFile || ''}
                                            readOnly
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm text-gray-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Output Binary Name
                                        </label>
                                        <input
                                            type="text"
                                            value={outputBinaryName}
                                            onChange={(e) => setOutputBinaryName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm"
                                            placeholder="obfuscator_custom"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                            Output Folder Path
                                        </label>
                                        <input
                                            type="text"
                                            value={outputFolderPath}
                                            onChange={(e) => setOutputFolderPath(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-gray-700 focus:border-gray-700 text-sm"
                                            placeholder="C:\Obfus-LLVM\binaries"
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Directory where the obfuscator binary will be saved</p>
                                    </div>

                                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                        <p className="text-xs text-gray-600">
                                            <Info className="h-3 w-3 inline mr-1" />
                                            Output will accept only <code className="bg-gray-200 px-1 rounded">-i</code> and <code className="bg-gray-200 px-1 rounded">-o</code>. All settings are locked.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleBuildObfuscator}
                                        className="w-full px-4 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm flex items-center justify-center"
                                    >
                                        <Package className="h-4 w-4 mr-2" />
                                        Build Pre-Configured Obfuscator
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Presets & Status */}
                    <div className="space-y-4">
                        {/* Available Presets */}
                        <div className="bg-white rounded-lg border border-gray-200 p-5">
                            <h2 className="text-base font-semibold text-gray-900 mb-3">Quick Presets</h2>
                            <p className="text-xs text-gray-600 mb-4">Load recommended configurations</p>

                            <div className="space-y-3">
                                {presets.map((preset) => {
                                    const Icon = preset.icon;
                                    return (
                                        <div
                                            key={preset.id}
                                            className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors"
                                        >
                                            <div className="flex items-center mb-2">
                                                <Icon className={`h-4 w-4 ${preset.color} mr-2`} />
                                                <h3 className="text-sm font-semibold text-gray-900">{preset.name}</h3>
                                            </div>
                                            <p className="text-xs text-gray-600 mb-3">{preset.description}</p>
                                            <button
                                                onClick={() => handleUsePreset(preset.id)}
                                                className="w-full px-3 py-1.5 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors text-xs font-medium"
                                            >
                                                Use This Preset
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Info / Notes */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <Info className="h-4 w-4 text-gray-600 mr-2 mt-0.5 flex-shrink-0" />
                                <div className="text-sm text-gray-700 space-y-1">
                                    <p className="font-medium text-xs">Important Notes:</p>
                                    <ul className="list-disc list-inside space-y-0.5 text-xs text-gray-600">
                                        <li>Profiles are compatible with CLI format</li>
                                        <li>Custom settings override global strength</li>
                                        <li>Exported profiles can be version controlled</li>
                                        <li>Generated binaries hide all advanced options</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Log/Status */}
                        {buildStatus && (
                            <div className={`rounded-lg border p-4 ${buildStatus === 'success'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                                }`}>
                                <div className="flex items-start">
                                    {buildStatus === 'success' ? (
                                        <CheckCircle className="h-5 w-5 text-green-600 mr-2 flex-shrink-0" />
                                    ) : (
                                        <AlertCircle className="h-5 w-5 text-red-600 mr-2 flex-shrink-0" />
                                    )}
                                    <div className="flex-1">
                                        <p className={`text-sm font-medium ${buildStatus === 'success' ? 'text-green-900' : 'text-red-900'
                                            }`}>
                                            {buildMessage}
                                        </p>
                                        {outputPath && buildStatus === 'success' && (
                                            <p className="text-xs text-green-700 mt-1 break-all">
                                                Output: <code className="bg-green-100 px-1 rounded">{outputPath}</code>
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClientConfiguration;
