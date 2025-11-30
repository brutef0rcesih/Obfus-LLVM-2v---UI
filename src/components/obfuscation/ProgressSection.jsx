import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import UploadSidebar from "../Navbar/UploadSidebar";

const steps = [
  {
    label: "Binary Analysis",
    p: 20,
    logs: [
      "[INFO] Starting obfuscation process...",
      "[SCAN] Analyzing binary structure and entry points",
      "[SCAN] Detecting file format: ELF64",
      "[SCAN] Binary analysis complete",
    ],
  },
  {
    label: "Code Obfuscation",
    p: 45,
    logs: [
      "[OBFUSCATE] Applying control flow flattening",
      "[OBFUSCATE] Inserting opaque predicates",
      "[OBFUSCATE] Transforming function calls",
      "[OBFUSCATE] Code obfuscation complete",
    ],
  },
  {
    label: "String Encryption",
    p: 65,
    logs: [
      "[ENCRYPT] Identifying string literals",
      "[ENCRYPT] Applying AES-256 encryption",
      "[ENCRYPT] String encryption complete",
    ],
  },
  {
    label: "Quality Testing",
    p: 85,
    logs: [
      "[TEST] Running integrity checks",
      "[TEST] Validating obfuscated code",
      "[TEST] All tests passed successfully",
    ],
  },
  {
    label: "Finalizing",
    p: 100,
    logs: [
      "[REPORT] Generating analysis report",
      "[REPORT] Compiling statistics",
      "[SUCCESS] Obfuscation completed successfully!",
    ],
  },
];

const ProgressSection = ({
  progress: externalProgress,
  currentStage: externalStage,
  logs: externalLogs,
}) => {
  const navigate = useNavigate();
  const [internalProgress, setInternalProgress] = useState(0);
  const [internalStage, setInternalStage] = useState("Initializing…");
  const [internalLogs, setInternalLogs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const simulationRef = useRef(null);

  const progress = externalProgress || internalProgress;
  const currentStage = externalStage || internalStage;
  const logs = externalLogs?.length > 0 ? externalLogs : internalLogs;

  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  // Auto scroll logs
  useEffect(() => {
    const box = document.getElementById("log-box");
    if (box) box.scrollTop = box.scrollHeight;
  }, [logs]);

  // Simulation handler
  useEffect(() => {
    if (!externalProgress && !simulationRef.current) {
      let stepIdx = 0;
      let logIdx = 0;

      setInternalLogs(["[INFO] Initializing obfuscation environment..."]);

      simulationRef.current = setInterval(() => {
        if (stepIdx >= steps.length) {
          clearInterval(simulationRef.current);
          simulationRef.current = null;
          return;
        }

        const currentStep = steps[stepIdx];

        if (logIdx < currentStep.logs.length) {
          setInternalLogs((prev) => [...prev, currentStep.logs[logIdx]]);
          logIdx++;
        }

        if (logIdx >= currentStep.logs.length) {
          setInternalProgress(currentStep.p);
          setInternalStage(currentStep.label);
          stepIdx++;
          logIdx = 0;
        }
      }, 600);
    }

    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
      }
    };
  }, [externalProgress]);

  // Redirect when finished
  useEffect(() => {
    if (progress >= 100) {
      const t = setTimeout(() => {
        navigate("/obfuscation/result");
      }, 2000);

      return () => clearTimeout(t);
    }
  }, [progress, navigate]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Breadcrumb */}
      <div className="border-b border-gray-200 px-4 py-2.5 bg-white">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <div className="flex items-center">
                <Home className="h-4 w-4 text-gray-400" />
                <span
                  className="ml-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={() => navigate("/")}
                >
                  Home
                </span>
              </div>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
            </li>
            <li>
              <span
                className="text-gray-500 hover:text-gray-700 cursor-pointer font-medium"
                onClick={() => navigate("/obfuscation/upload")}
              >
                Upload Files
              </span>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
            </li>
            <li>
              <span
                className="text-gray-500 hover:text-gray-700 cursor-pointer font-medium"
                onClick={() => navigate("/obfuscation/configuration")}
              >
                Configuration
              </span>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />
            </li>
            <li>
              <span className="text-gray-900 font-semibold">
                Obfuscation Progress
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <UploadSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />

        <div className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 py-6 sm:px-6">
            {/* Progress Card */}
            <div className="mb-6">
              <label className="text-base font-semibold text-gray-800 mb-3 block">
                Current Progress
              </label>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-gray-700">
                    {currentStage}
                  </span>
                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                    {Math.round(progress)}%
                  </span>
                </div>

                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gray-900 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Stage Dots */}
                <div className="grid grid-cols-5 gap-3 mt-4 pt-3 border-t border-gray-100">
                  {steps.map((s, i) => {
                    const active = progress >= s.p;
                    return (
                      <div
                        key={i}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <div
                          className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${active ? "bg-gray-900" : "bg-gray-300"
                            }`}
                        ></div>
                        <span
                          className={`text-[10px] text-center ${active
                            ? "text-gray-900 font-medium"
                            : "text-gray-500"
                            }`}
                        >
                          {s.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Logs */}
            <div className="h-40 bg-gray-950 text-gray-100 text-[10px] p-3 rounded-lg overflow-y-auto border border-gray-800 font-mono" id="log-box">
              {logs.length === 0 ? (
                <div className="flex items-center gap-2 text-gray-500 italic">
                  <span>Waiting for process to begin</span>
                  <span className="animate-pulse">...</span>
                </div>
              ) : (
                <div className="space-y-1">
                  {logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2 animate-in fade-in slide-in-from-left-1 duration-300">
                      <span className="text-gray-500 text-[9px] whitespace-nowrap mt-0.5">
                        [{String(i + 1).padStart(2, "0")}]
                      </span>
                      <span className="text-gray-300 leading-snug break-all font-mono">
                        {log}
                      </span>
                    </div>
                  ))}

                  {/* Active Processing Indicator */}
                  {progress < 100 && (
                    <div className="flex items-center gap-2 mt-2 text-blue-400/80">
                      <span className="text-[9px]">[..]</span>
                      <span className="text-[10px] animate-pulse">Processing</span>
                      <span className="w-1.5 h-3 bg-blue-500/50 animate-pulse ml-1"></span>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSection;
