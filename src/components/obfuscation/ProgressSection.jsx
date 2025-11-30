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
      "[SCAN] Binary analysis complete"
    ]
  },
  {
    label: "Code Obfuscation",
    p: 45,
    logs: [
      "[OBFUSCATE] Applying control flow flattening",
      "[OBFUSCATE] Inserting opaque predicates",
      "[OBFUSCATE] Transforming function calls",
      "[OBFUSCATE] Code obfuscation complete"
    ]
  },
  {
    label: "String Encryption",
    p: 65,
    logs: [
      "[ENCRYPT] Identifying string literals",
      "[ENCRYPT] Applying AES-256 encryption",
      "[ENCRYPT] String encryption complete"
    ]
  },
  {
    label: "Quality Testing",
    p: 85,
    logs: [
      "[TEST] Running integrity checks",
      "[TEST] Validating obfuscated code",
      "[TEST] All tests passed successfully"
    ]
  },
  {
    label: "Finalizing",
    p: 100,
    logs: [
      "[REPORT] Generating analysis report",
      "[REPORT] Compiling statistics",
      "[SUCCESS] Obfuscation completed successfully!"
    ]
  }
];

const ProgressSection = ({ progress: externalProgress, currentStage: externalStage, logs: externalLogs }) => {
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
      // Use refs to track progress within the interval closure
      let stepIdx = 0;
      let logIdx = 0;

      // Initial log
      setInternalLogs(["[INFO] Initializing obfuscation environment..."]);

      simulationRef.current = setInterval(() => {
        if (stepIdx >= steps.length) {
          clearInterval(simulationRef.current);
          simulationRef.current = null;
          return;
        }

        const currentStep = steps[stepIdx];

        // If we still have logs to show for this step
        if (logIdx < currentStep.logs.length) {
          setInternalLogs(prev => [...prev, currentStep.logs[logIdx]]);
          logIdx++;
        }

        // If we finished all logs for this step, move to next step (or finish)
        if (logIdx >= currentStep.logs.length) {
          setInternalProgress(currentStep.p);
          setInternalStage(currentStep.label);
          stepIdx++;
          logIdx = 0;
        }
      }, 600); // Slightly faster for better UX
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
      <div className="border-b border-gray-200 px-6 py-3 bg-white">
        <nav className="flex" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <div className="flex items-center">
                <Home className="h-4 w-4 text-gray-400" />
                <span
                  className="ml-1 text-gray-500 hover:text-gray-700 cursor-pointer"
                  onClick={() => navigate('/')}
                >
                  Home
                </span>
              </div>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            </li>
            <li>
              <span
                className="text-gray-500 hover:text-gray-700 cursor-pointer font-medium"
                onClick={() => navigate('/obfuscation/upload')}
              >
                Upload Files
              </span>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            </li>
            <li>
              <span
                className="text-gray-500 hover:text-gray-700 cursor-pointer font-medium"
                onClick={() => navigate('/obfuscation/configuration')}
              >
                Configuration
              </span>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
            </li>
            <li>
              <span className="text-gray-900 font-medium">Obfuscation Progress</span>
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <UploadSidebar isOpen={sidebarOpen} onToggle={handleSidebarToggle} />

        <div className="flex-1 overflow-auto">
          <div className="max-w-6xl mx-auto p-6">

            {/* Progress Card */}
            <div className="mb-6">
              <label className="text-lg font-medium text-gray-700 mb-3 block">
                Current Progress
              </label>

              <div className="bg-white rounded-md border border-gray-300 shadow-sm p-6">

                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-sm font-medium text-gray-800">{currentStage}</span>
                  <span className="text-sm font-semibold text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                    {Math.round(progress)}%
                  </span>
                </div>

                <div className="w-full h-2.5 bg-gray-200 rounded-md overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-md transition-all duration-700 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                  </div>
                </div>

                {/* Stage Dots */}
                <div className="grid grid-cols-5 gap-3 mt-5 pt-4 border-t border-gray-200">
                  {steps.map((s, i) => {
                    const active = progress >= s.p;
                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        <div
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${active
                            ? "bg-gray-900 ring-4 ring-gray-200 shadow-lg"
                            : "bg-gray-300"
                            }`}
                        ></div>
                        <span
                          className={`text-[10px] text-center ${active ? "text-gray-900 font-semibold" : "text-gray-500"
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
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-3 block">
                Process Logs
              </label>

              <div
                id="log-box"
               className="h-40 bg-gray-900 text-gray-200 text-xs  p-4 rounded-md overflow-y-auto border border-gray-300"

              >
                {logs.length === 0 ? (
                  <p className="text-gray-400 text-xs italic">Waiting for process to begin…</p>
                ) : (
                  <div className="space-y-1">
                    {logs.map((log, i) => (
                      <div key={i} className="text-gray-200 leading-relaxed">
                        <span className="text-gray-500">[{String(i + 1).padStart(2, "0")}]</span> {log}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressSection;
