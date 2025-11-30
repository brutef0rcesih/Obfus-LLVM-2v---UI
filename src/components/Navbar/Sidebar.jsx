import { NavLink } from "react-router-dom";
import { FolderOutput, Sliders, Plus } from "lucide-react";

function Sidebar() {
  const navBase =
    "w-full flex items-center gap-3 px-3 py-3 text-sm font-medium transition-all duration-200 relative rounded-lg group";

  return (
    <aside className="w-64 bg-white flex-shrink-0 border-r border-gray-200 flex flex-col h-full shadow-sm">
      <div className="flex-1 px-3 py-6">
        {/* App Title */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 px-3">LLVM Obfuscator</h2>
          <p className="text-sm text-gray-500 px-3">Code Protection Suite</p>
        </div>

        <nav className="flex flex-col space-y-3">
          <NavLink
            to="/obfuscation"
            end
            className={({ isActive }) =>
              `${navBase} ${isActive
                ? "bg-gray-100 text-gray-900 border-r-2 border-gray-600"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <div className="p-2 rounded-lg transition-colors bg-gray-50 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700">
              <Plus className="w-4 h-4" />
            </div>
            <span className="font-medium">New Obfuscation</span>
          </NavLink>

          <NavLink
            to="/configuration"
            end
            className={({ isActive }) =>
              `${navBase} ${isActive
                ? "bg-gray-100 text-gray-900 border-r-2 border-gray-600"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <div className="p-2 rounded-lg transition-colors bg-gray-50 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700">
              <Sliders className="w-4 h-4" />
            </div>
            <span className="font-medium">Configuration</span>
          </NavLink>

          {/* Separator */}
          <div className="my-4 border-t border-gray-200"></div>

          <NavLink
            to="/obfuscation/output-directory"
            end
            className={({ isActive }) =>
              `${navBase} ${isActive
                ? "bg-gray-100 text-gray-900 border-r-2 border-gray-600"
                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              }`
            }
          >
            <div className="p-2 rounded-lg transition-colors bg-gray-50 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700">
              <FolderOutput className="w-4 h-4" />
            </div>
            <span className="font-medium">Output Directory</span>
          </NavLink>
        </nav>
      </div>
    </aside>
  );
}

export default Sidebar;
