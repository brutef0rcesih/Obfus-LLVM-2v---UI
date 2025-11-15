import { useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const currentPage = location.pathname.split('/')[1] || 'obfuscation';

  const getPageTitle = () => {
    switch (currentPage) {
      case "obfuscation":
        return "Obfuscation Panel";
      case "history":
        return "History";
      case "settings":
        return "Settings";
      default:
        return "Obfuscation Panel";
    }
  };

  return (
    <header className="w-full bg-gray-300 border-b-2 border-gray-600">
      <div className="px-3 py-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
              {getPageTitle()}
            </h2>
            <p className="text-sm text-gray-700 mt-0.5">LLVM-based code protection system</p>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-right border-2 border-gray-600 bg-white px-2 py-1">
              <p className="text-xs text-gray-700">System Status</p>
              <p className="text-xs font-bold text-gray-700">● OPERATIONAL</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;

