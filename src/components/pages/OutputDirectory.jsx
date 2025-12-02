import React, { useState } from 'react';
import { FolderOutput, FolderOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const OutputDirectory = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [outputPath, setOutputPath] = useState('C:\\Users\\Asus\\Documents\\Obfus-LLVM\\Output'); // Default path example
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);

    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleSavePath = () => {
        if (!outputPath || outputPath.trim() === '') {
            alert('Please select or enter an output directory');
            return;
        }
        
        // Save the path (you can add backend save logic here)
        console.log('Saved output path:', outputPath);
        
        // Show success popup
        setShowSuccessPopup(true);
        
        // Auto-hide popup after 3 seconds
        setTimeout(() => {
            setShowSuccessPopup(false);
        }, 3000);
    };

    const handleBrowseClick = async () => {
        try {
            // For Tauri v2 - use plugin-dialog
            const { open } = await import('@tauri-apps/plugin-dialog');
            const selected = await open({
                directory: true,
                multiple: false,
                title: 'Select Output Directory',
                defaultPath: outputPath
            });
            
            if (selected && typeof selected === 'string') {
                setOutputPath(selected);
            }
        } catch (error) {
            console.error('Error opening directory dialog:', error);
            alert('Unable to open folder selector. Please enter the output path manually.');
        }
    };

    return (
        <div className="h-screen bg-gray-50 flex flex-col">
            <div className="flex flex-1 overflow-hidden">
               
                <div className="flex-1 overflow-auto">
                    <div className="max-w-6xl mx-auto py-8 px-8">

                        {/* Header */}
                        <div className="mb-8">
                            <h2 className="text-md font-semibold text-gray-900 flex items-center gap-3">
                                <FolderOutput className="w-4 h-4 text-gray-700" />
                                Output Directory
                            </h2>
                           
                        </div>

                        {/* Configuration Card */}
                        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden max-w-3xl">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h3 className="text-base font-medium text-gray-900">Destination Settings</h3>
                            </div>

                            <div className="p-8 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Output Path
                                    </label>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                value={outputPath}
                                                onChange={(e) => setOutputPath(e.target.value)}
                                                className="block w-full pl-4 pr-10 py-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                                                placeholder="Select output directory..."
                                            />
                                        </div>
                                        <button
                                            onClick={handleBrowseClick}
                                            className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors flex items-center gap-2"
                                        >
                                            <FolderOpen className="w-4 h-4" />
                                            Select Folder
                                        </button>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        All obfuscated artifacts will be generated in this folder.
                                    </p>
                                </div>
                            </div>

                            <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                                <button
                                    onClick={handleSavePath}
                                    className="px-6 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors flex items-center gap-2"
                                >
                                    Save Path
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Success Popup */}
            {showSuccessPopup && (
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-30 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 animate-bounce-in">
                        <div className="flex flex-col items-center text-center">
                            {/* Success Icon */}
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            
                            {/* Success Message */}
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                Success! 🎉
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Output path has been successfully saved!
                            </p>
                            <p className="text-sm text-gray-500 bg-gray-50 px-4 py-2 rounded-lg font-mono break-all">
                                {outputPath}
                            </p>
                            
                            {/* Close Button */}
                            <button
                                onClick={() => setShowSuccessPopup(false)}
                                className="mt-6 px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors font-medium"
                            >
                                Got it!
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OutputDirectory;
