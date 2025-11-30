import React, { useState, useRef } from 'react';
import { FolderOutput, FolderOpen, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


const OutputDirectory = () => {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [outputPath, setOutputPath] = useState('C:\\Users\\Asus\\Documents\\Obfus-LLVM\\Output'); // Default path example
    const fileInputRef = useRef(null);

    const handleSidebarToggle = () => {
        setSidebarOpen(!sidebarOpen);
    };

    const handleBrowseClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleDirectorySelect = (event) => {
        const files = event.target.files;
        if (files && files.length > 0) {
            // In a real web environment, we can't easily get the full path of a directory due to security.
            // However, for this UI demo, we can simulate it or use the webkitRelativePath if available,
            // or just show the name of the selected folder.
            // Since the user asked for "add location to add user using btowese", we'll simulate capturing the path.
            // For a Tauri app, we would use the Tauri dialog API. Assuming web for now as per instructions.

            // If this was Tauri:
            // const selected = await open({ directory: true });

            // For web input webkitdirectory:
            const file = files[0];
            // We'll just mock a path update for the UI visualization
            setOutputPath(`C:\\Users\\Asus\\Documents\\Obfus-LLVM\\${file.webkitRelativePath.split('/')[0] || 'Selected_Folder'}`);
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
                                            Browse
                                        </button>
                                        {/* Hidden input for directory selection */}
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            onChange={handleDirectorySelect}
                                            className="hidden"
                                            webkitdirectory=""
                                            directory=""
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        All obfuscated artifacts will be generated in this folder.
                                    </p>
                                </div>
                            </div>

                            <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex justify-end">
                                <button
                                    onClick={() => navigate('/obfuscation/result')} // Example navigation
                                    className="px-6 py-2 text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-700 transition-colors flex items-center gap-2"
                                >
                                    Save & Continue
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default OutputDirectory;
