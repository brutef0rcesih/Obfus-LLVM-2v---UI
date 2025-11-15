import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <aside className="w-56 bg-gray-300 flex-shrink-0 border-r-2 border-gray-600">
      <div className="flex flex-col h-full">
        
        <nav className="flex-1 px-1.5 py-2 space-y-1 bg-gray-300">
          <NavLink
            to="/obfuscation"
            className={({ isActive }) => 
              `w-full flex items-center px-2 py-1 text-xs font-medium border-2 ${
                isActive 
                  ? "bg-gray-400 border-gray-600 text-gray-900" 
                  : "bg-gray-200 border-gray-500 text-gray-800 hover:bg-gray-300 active:bg-gray-400"
              }`
            }
          >
            <span className="mr-1.5">[</span>
            <span className="flex-1 text-left">Obfuscation</span>
            <span>]</span>
          </NavLink>
          
          <NavLink
            to="/history"
            className={({ isActive }) => 
              `w-full flex items-center px-2 py-1 text-xs font-medium border-2 ${
                isActive 
                  ? "bg-gray-400 border-gray-600 text-gray-900" 
                  : "bg-gray-200 border-gray-500 text-gray-800 hover:bg-gray-300 active:bg-gray-400"
              }`
            }
          >
            <span className="mr-1.5">[</span>
            <span className="flex-1 text-left">History</span>
            <span>]</span>
          </NavLink>
          
          <NavLink
            to="/settings"
            className={({ isActive }) => 
              `w-full flex items-center px-2 py-1 text-xs font-medium border-2 ${
                isActive 
                  ? "bg-gray-400 border-gray-600 text-gray-900" 
                  : "bg-gray-200 border-gray-500 text-gray-800 hover:bg-gray-300 active:bg-gray-400"
              }`
            }
          >
            <span className="mr-1.5">[</span>
            <span className="flex-1 text-left">Settings</span>
            <span>]</span>
          </NavLink>
        </nav>
        
        <div className="px-2 py-1.5 border-t-2 border-gray-600 bg-gray-400">
          <p className="text-sm text-gray-700">Version 1.0</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;

