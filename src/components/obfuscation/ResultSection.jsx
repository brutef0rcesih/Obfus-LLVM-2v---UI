import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Shield, CheckCircle, FileCode, Gauge, FileText, FileJson, Home, ChevronRight } from "lucide-react";
import UploadSidebar from "../Navbar/UploadSidebar";

const ResultSection = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  return (
    <div className="h-screen bg-gray-50 flex flex-col">

      <div className="flex flex-1 overflow-hidden">
        <UploadSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} activeItem="report" />

        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6">
            {/* Title & Download Buttons */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-lg font-semibold text-gray-800">
                Obfuscation Result
              </h1>
            </div>
           <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4 mb-6">
  <div className="flex items-center gap-60">

    {/* Light Grey Button */}
    <button
      onClick={handleDownloadPdf}
      className="bg-gray-100 border border-gray-300 text-gray-700 px-6 py-3 rounded-md font-medium
      flex items-center gap-2 hover:bg-gray-200 transition shadow-sm text-sm"
    >
      <FileText className="h-4 w-4" />
      PDF Report
    </button>

    {/* Medium Grey Button */}
    <button
      onClick={handleDownloadJson}
      className="bg-gray-200 border border-gray-400 text-gray-800 px-6 py-3    rounded-md font-medium
      flex items-center gap-2 hover:bg-gray-300 transition shadow-sm text-sm"
    >
      <FileJson className="h-4 w-4" />
      JSON Report
    </button>

    {/* Black Button */}
    <button
      onClick={handleDownload}
      className="bg-gray-900 text-white px-6 py-3 rounded-md font-medium
      flex items-center gap-2 hover:bg-gray-700 transition shadow text-sm"
    >
      <Download className="h-4 w-4" />
      Download Binary
    </button>

  </div>
</div>

            {/* CONTAINER CARD */}
            <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 space-y-3">

              {/* ================= OVERVIEW SECTION ================= */}
              {/* ================= OVERVIEW + METRICS (Side by Side) ================= */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">


                {/* ========== OVERVIEW LEFT ========== */}
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-gray-700" /> Overview
                  </h2>

                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="text-sm font-semibold">File:</span> input_binary.bin</p>
                    <p><span className="text-sm font-semibold">Output:</span> obfuscated_output.bin</p>
                    <p><span className="text-sm font-semibold">Security Level:</span> Maximum</p>
                    <p><span className="text-sm font-semibold">Techniques Applied:</span> 7</p>
                    <p>
                      <span className="text-sm font-semibold">Status:</span>{" "}
                      <span className="text-gray-900 font-semibold text-sm">
                        Completed Successfully ✓
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 p-5 flex flex-col rounded-lg border border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-gray-700" /> Performance Metrics
                  </h2>

                  <div className="space-y-2">
                    <div className="bg-white p-2 rounded-md border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-500">Execution Time</p>
                      <p className="text-sm font-semibold text-gray-800">+8 ms</p>
                    </div>

                    <div className="bg-white p-2 rounded-md border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-500">Binary Size Change</p>
                      <p className="text-sm font-semibold text-gray-800">+12%</p>
                    </div>

                    <div className="bg-white p-2 rounded-md border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-500">Performance Impact</p>
                      <p className="text-sm font-semibold text-gray-800">Low</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Divider */}
              <div className="border-t border-gray-200" />

              {/* ================= TECHNIQUES SECTION ================= */}
              <div>
                <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-gray-700" /> Techniques Applied
                </h2>

                <ul className="grid sm:grid-cols-3 gap-2 text-sm text-gray-700">
                  {[
                    "Control Flow Flattening",
                    "Opaque Predicate Insertion",
                    "Instruction Substitution",
                    "String Encryption (AES-256)",
                    "Function Call Obfuscation",
                    "Anti-Debug Checks",
                    "Metadata Scrambling",
                  ].map((tech, index) => (
                    <li
                      key={index}
                      className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-2 rounded-md border border-gray-200"
                    >
                      <CheckCircle className="h-4 w-4 text-gray-700" /> {tech}
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultSection;
