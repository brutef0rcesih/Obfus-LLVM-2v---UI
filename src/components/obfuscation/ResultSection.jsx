import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Download,
  Shield,
  CheckCircle,
  FileCode,
  Gauge,
  FileText,
  FileJson,
  Clock,
  Cpu,
  Layers,
  Zap,
} from "lucide-react";

import UploadSidebar from "../Navbar/UploadSidebar";
import reportData from "../../data/obfuscation_report.json";

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

  const startTime = new Date(reportData.report_metadata.obfuscation_time);
  const endTime = new Date(reportData.report_metadata.report_generation_time);
  const executionTimeMs = endTime - startTime;
  const executionTimeSec = (executionTimeMs / 1000).toFixed(2);

  const avgSizeChange = Math.round(
    reportData.files.reduce((acc, f) => acc + f.size_change_percent, 0) /
    reportData.files.length
  );

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <UploadSidebar
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
          activeItem="report"
        />

        <div className="flex-1 overflow-auto">
          <div className="max-w-7xl mx-auto p-6">

            {/* HEADER */}
            <div className="flex justify-between items-center mb-2">
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

            <div className="bg-gray-200 border border-gray-300 rounded-xl p-4 shadow-sm mb-2">

              <div className="flex justify-between gap-3 ">
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

              {/* ----- OVERVIEW CARD ----- */}
              {/* ----- TOP ROW (Overview Left + Metrics Right) ----- */}
              <div className="w-full flex flex-col lg:flex-row gap-2">

                {/* ----- OVERVIEW CARD (LEFT) ----- */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 w-full lg:w-2/3">
                  <h2 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="h-5 w-5 text-gray-700" />
                    Overview
                  </h2>

                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
  {[
    { label: "Status", value: reportData.report_metadata.status_of_obfuscation },
    { label: "Profile", value: reportData.report_metadata.configuration_name.replace(/_/g, " ") },
    { label: "Platform", value: reportData.report_metadata.target_platform },
    { label: "Files", value: reportData.report_metadata.number_of_files },
    { label: "Type", value: reportData.report_metadata.type_of_obfuscation },
    { label: "Bogus Code", value: reportData.report_metadata.bogus_code_percent },
    { label: "Cycles", value: reportData.report_metadata.number_of_cycles },
    { 
      label: "Techniques", 
      value: `${reportData.configurations.filter(c => c.enabled === "Yes").length} Active` 
    },
  ].map((info, idx) => (
    <div
      key={idx}
      className=" flex flex-col "
    >
      <span className="text-gray-500 text-sm font-medium">{info.label}</span>
      <span className="text-gray-900 text font-semibold mt-1">{info.value}</span>
    </div>
  ))}
</div>

                  <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-700">
                    <span className="font-semibold">Reason: </span>
                    {reportData.report_metadata.status_reason}
                  </div>
                </div>

                {/* ----- METRICS CARD (RIGHT) ----- */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 w-full lg:w-1/3">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Gauge className="h-5 w-5 text-gray-700" />
                    Performance Metrics
                  </h2>

                  <div className="space-y-4">
                    <Metric
                      icon={<Clock className="h-5 w-5 text-gray-700" />}
                      label="Execution Time"
                      value={`${executionTimeSec}s`}
                    />
                    <Metric
                      icon={<Layers className="h-5 w-5 text-gray-700" />}
                      label="Avg Size Change"
                      value={`+${avgSizeChange}%`}
                    />
                    <Metric
                      icon={<Zap className="h-5 w-5 text-gray-700" />}
                      label="Perf. Impact"
                      value={reportData.report_metadata.number_of_cycles > 2 ? "Low" : "Medium"}
                    />
                  </div>
                </div>

              </div>


              {/* ----- TECHNIQUES ----- */}
              <div className="bg-white p-6 rounded-xl border border-gray-200">
                <h2 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <FileCode className="h-5 w-5 text-gray-700" />
                  Applied Techniques
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reportData.configurations
                    .filter((cfg) => cfg.enabled === "Yes")
                    .map((cfg, index) => (
                      <div
                        key={index}
                        className="p-2 rounded-lg border border-gray-200 bg-gray-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-sm text-gray-900 ">
                            {cfg.method_name}
                          </h3>
                          <CheckCircle className="h-4 w-4 text-gray-600" />
                        </div>

                        <div className="text-sm text-gray-600 font-mono break-all">
                          {cfg.parameters
                            .split(";")
                            .map((param, i) => (
                              <span key={i} className="text-sm block mb-1">
                                • {param.trim()}
                              </span>
                            ))}
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* ----- FILE TABLE ----- */}
<div className="bg-white p-6 rounded-xl border border-gray-200 shadow-md">
  <h2 className="text-md font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <Cpu className="h-5 w-5  text-gray-700" />
    File Processing Details
  </h2>

  <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-inner">
    <table className="min-w-full text-sm border-collapse table-fixed">
      <thead className="bg-gray-100 text-gray-700  text-xs font-semibold sticky top-0 z-10 border-b border-gray-300">
        <tr>
          <th className="px-4 py-3 text-sm border border-gray-300">File</th>
          <th className="px-4 py-3 text-sm border border-gray-300">Type</th>
          <th className="px-4 py-3 text-sm border border-gray-300">Size Change</th>
          <th className="px-4 py-3 text-sm border border-gray-300">Memory</th>
          <th className="px-4 py-3 text-sm border border-gray-300">String Obfuscation</th>
          <th className="px-4 py-3 text-sm border border-gray-300">Fake Loops</th>
        </tr>
      </thead>

      <tbody>
        {reportData.files.map((f, idx) => (
          <tr
            key={f.s_no}
            className={`transition-colors ${
              idx % 2 === 0 ? "bg-white" : "bg-gray-50"
            } hover:bg-gray-200`}
          >
            <td className="px-2 py-1 text-sm border border-gray-300 font-medium text-gray-900">
              {f.input_file_name}
              <spam className="text-xs text-gray-500 pl-3">→ {f.output_file_name}</spam>
            </td>
            <td className="px-2 py-1 text-sm border text-center border-gray-300 text-gray-700">{f.input_file_type}</td>
            <td className="px-2 py-1 text-sm border text-center border-gray-300 text-gray-700">+{f.size_change_percent}%</td>
            <td className="px-2 py-1 text-sm border text-center border-gray-300 text-gray-700">{f.memory_usage_mb} MB</td>
            <td className="px-2 py-1 text-sm border text-center border-gray-300 text-gray-700">{f.num_string_obfuscations}</td>
            <td className="px-4 py-3 text-sm border text-center border-gray-300 text-gray-700">{f.num_fake_look_inserted}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>

              {/* ----- PATHS ----- */}
              <div className="bg-gray-100 p-4 rounded-lg border border-gray-300 text-xs text-gray-700 flex flex-col sm:flex-row justify-between gap-2">
                <div>
                  <span className="font-semibold">Input Root:</span>{" "}
                  {reportData.paths.input_root_path}
                </div>
                <div>
                  <span className="font-semibold">Output Root:</span>{" "}
                  {reportData.paths.output_root_path}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* Small helper components */
const Info = ({ label, value }) => (
  <div>
    <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">{label}</p>
    <p className="text-gray-900 font-semibold mt-1">{value}</p>
  </div>
);

const Metric = ({ icon, label, value }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-gray-200 text-gray-700">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-lg font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

export default ResultSection;
