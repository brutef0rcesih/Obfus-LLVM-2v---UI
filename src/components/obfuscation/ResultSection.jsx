import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
 
  FileText,
  FileJson,
 
} from "lucide-react";
import UploadSidebar from "../Navbar/UploadSidebar";


const ResultSection = ({ reportData }) => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(!reportData);
  const [error, setError] = useState(null);

  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/output/obfuscated_binary.bin";
    link.download = "obfuscated_output.bin";
    link.click();
  };

  const handleDownloadPdf = () => {
    const link = document.createElement("a");
    link.href = "/output/report.pdf";
    link.download = "obfuscation_report.pdf";
    link.click();
  };

  const handleDownloadJson = () => {
    const link = document.createElement("a");
    link.href = "/output/report.json";
    link.download = "obfuscation_report.json";
    link.click();
  };

  // If no data provided, show loading or error state
  if (!reportData) {
    return (
      <div className="bg-gray-50 min-h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading report data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-full">
      <div className="max-w-7xl mx-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Obfuscation Report</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Generated on{" "}
                  {new Date(
                    reportData.report_metadata.report_generation_time
                  ).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-gray-200 border border-gray-300 rounded-xl p-4 shadow-sm mb-6">
              <div className="flex justify-between gap-3">
                {/* PDF Button */}
                <button
                  onClick={handleDownloadPdf}
                  className="bg-white border border-gray-300 text-gray-800 font-semibold px-4 py-3 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 transition"
                >
                  <FileText className="h-4 w-4" /> PDF Report
                </button>

                {/* JSON Button */}
                <button
                  onClick={handleDownloadJson}
                  className="bg-white border border-gray-300 text-gray-800 font-semibold px-4 py-3 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-100 transition"
                >
                  <FileJson className="h-4 w-4" /> JSON Report
                </button>

                {/* HTML Button */}
                <button
                  onClick={handleDownload}
                  className="bg-gray-800 text-white px-4 py-3 rounded-lg text-sm flex items-center gap-2 hover:bg-black transition"
                >
                  <Download className="h-4 w-4" /> HTML Report
                </button>
              </div>

            </div>  

            <div className="space-y-6">

              {/* SUMMARY SECTION */}
              <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300 px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-900">Summary</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <SummaryItem label="Obfuscation time" value={`DATE: ${new Date(reportData.report_metadata.obfuscation_time).toLocaleDateString()} | TIME: ${new Date(reportData.report_metadata.obfuscation_time).toLocaleTimeString()}`} />
                      <SummaryItem label="Type of Obfuscation" value={reportData.report_metadata.type_of_obfuscation} />
                      <SummaryItem label="Configuration Name" value={reportData.report_metadata.configuration_name.replace(/_/g, " ")} labelColor="text-gray-700" />
                      <SummaryItem label="Number of Cycles" value={`Cycle: ${reportData.report_metadata.number_of_cycles}`} labelColor="text-gray-700" />
                      <SummaryItem label="Target Platform" value={reportData.report_metadata.target_platform} labelColor="text-gray-700" />
                    </div>
                    <div className="space-y-3">
                      <SummaryItem label="Report generated time" value={`DATE: ${new Date(reportData.report_metadata.report_generation_time).toLocaleDateString()} | TIME: ${new Date(reportData.report_metadata.report_generation_time).toLocaleTimeString()}`} />
                      <SummaryItem label="Number of files" value={reportData.report_metadata.number_of_files} />
                      <SummaryItem label="Status of Obfuscation" value={reportData.report_metadata.status_of_obfuscation} labelColor="text-gray-700" />
                      <SummaryItem label="Reason" value={reportData.report_metadata.status_reason} labelColor="text-gray-700" />
                    </div>
                  </div>
                </div>
              </div>

              {/* OUTPUT PATHS */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-sm">
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="font-bold text-gray-700">Output file path:</span>
                    <span className="text-gray-700">{reportData.paths.output_root_path}</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-gray-700">Input Root:</span>
                    <span className="text-gray-700">{reportData.paths.input_root_path}</span>
                  </div>
                </div>
              </div>


              {/* OBFUSCATION SUMMARY TABLE */}
              <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300 px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-900">Obfuscation Summary</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b-2 border-gray-300">
                      <tr>
                        <th className="px-6 py-3 text-left font-bold text-gray-700 border-r border-gray-300">Obfuscation Methods (Name)</th>
                        <th className="px-6 py-3 text-center font-bold text-gray-700 border-r border-gray-300">Enabled</th>
                        <th className="px-6 py-3 text-center font-bold text-gray-700 border-r border-gray-300">Disabled</th>
                        <th className="px-6 py-3 text-left font-bold text-gray-700">Parameters (parameters used)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.configurations.map((cfg, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-3 border-r border-gray-200 font-medium text-gray-900">{cfg.method_name}</td>
                          <td className="px-6 py-3 text-center border-r border-gray-200">
                            {cfg.enabled === "Yes" && <span className="text-green-600 text-xl">✓</span>}
                          </td>
                          <td className="px-6 py-3 text-center border-r border-gray-200">
                            {cfg.enabled !== "Yes" && <span className="text-red-600 text-xl">✗</span>}
                          </td>
                          <td className="px-6 py-3 text-gray-700">{cfg.parameters}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PER-FILE DETAILS */}
              <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300 px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-900">Per-file Details</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b-2 border-gray-300">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 border-r border-gray-300">Input File name</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 border-r border-gray-300">Output file name</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-700 border-r border-gray-300">Type of file</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-700 border-r border-gray-300">File Size</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-700 border-r border-gray-300">Number of String Obfuscations applied</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-700">Number of fake look inserted</th>
                      </tr>
                      <tr className="bg-gray-50 border-b border-gray-300 text-xs">
                        <th className="px-4 py-2 text-left font-semibold text-gray-600 border-r border-gray-300"></th>
                        <th className="px-4 py-2 text-left font-semibold text-gray-600 border-r border-gray-300"></th>
                        <th className="px-4 py-2 text-center font-semibold text-gray-600 border-r border-gray-300"></th>
                        <th className="px-4 py-2 text-center font-semibold text-gray-600 border-r border-gray-300">
                          <div className="flex justify-around">
                            <span>Input</span>
                            <span>Output</span>
                          </div>
                        </th>
                        <th className="px-4 py-2 text-center font-semibold text-gray-600 border-r border-gray-300"></th>
                        <th className="px-4 py-2 text-center font-semibold text-gray-600"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.files.map((file, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 border-r border-gray-200 text-gray-700 font-medium">{file.input_file_name}</td>
                          <td className="px-4 py-3 border-r border-gray-200 text-gray-700 font-medium">{file.output_file_name}</td>
                          <td className="px-4 py-3 text-center border-r border-gray-200">{file.input_file_type}</td>
                          <td className="px-4 py-3 text-center border-r border-gray-200">
                            <div className="flex justify-around">
                              <span>{Math.round(file.memory_usage_mb * 1024 / (1 + file.size_change_percent/100))}</span>
                              <span>{Math.round(file.memory_usage_mb * 1024)}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center border-r border-gray-200">{file.num_string_obfuscations}</td>
                          <td className="px-4 py-3 text-center">{file.num_fake_look_inserted}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* PERFORMANCE METRICS */}
              <div className="bg-white border-2 border-gray-300 rounded-lg shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300 px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-900">Performance Metrics</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b-2 border-gray-300">
                      <tr>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 border-r border-gray-300">Input File</th>
                        <th className="px-4 py-3 text-left font-bold text-gray-700 border-r border-gray-300">Output File</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-700 border-r border-gray-300">File Size (Bytes)</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-700 border-r border-gray-300">Size change (%)</th>
                        <th className="px-4 py-3 text-center font-bold text-gray-700">Size differs (Bytes)</th>
                      </tr>
                      <tr className="bg-gray-50 border-b border-gray-300 text-xs">
                        <th className="px-4 py-2 border-r border-gray-300"></th>
                        <th className="px-4 py-2 border-r border-gray-300"></th>
                        <th className="px-4 py-2 text-center border-r border-gray-300">
                          <div className="flex justify-around">
                            <span>Input</span>
                            <span>Output</span>
                          </div>
                        </th>
                        <th className="px-4 py-2 border-r border-gray-300"></th>
                        <th className="px-4 py-2"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {reportData.files.map((file, index) => {
                        const inputSize = Math.round(file.memory_usage_mb * 1024 / (1 + file.size_change_percent/100));
                        const outputSize = Math.round(file.memory_usage_mb * 1024);
                        return (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 border-r border-gray-200 text-gray-700 font-medium">{file.input_file_name}</td>
                            <td className="px-4 py-3 border-r border-gray-200 text-gray-700 font-medium">{file.output_file_name}</td>
                            <td className="px-4 py-3 text-center border-r border-gray-200">
                              <div className="flex justify-around">
                                <span>{inputSize}</span>
                                <span>{outputSize}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center border-r border-gray-200">{file.size_change_percent}% increases</td>
                            <td className="px-4 py-3 text-center">{outputSize - inputSize}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
    </div>
  );
};

/* Helper Components */
const SummaryItem = ({ label, value, labelColor = "text-gray-700" }) => (
  <div className="flex gap-2 text-sm">
    <span className={`font-bold ${labelColor}`}>{label}:</span>
    <span className="text-gray-900">{value}</span>
  </div>
);

export default ResultSection;
