import logoImage from "../../assets/logo.png";

function TopNavbar() {
  return (
    <header className="bg-gray-800 text-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-4">

        {/* Left section - Logo + Title */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center">
            <img
              src={logoImage}
              alt="LLVM Obfuscator Logo"
              className="w-8 h-8 rounded-lg"
            />
            <h1 className="text-lg font-medium pl-2">OBFUS-LLVM</h1>
          </div>
        </div>

        {/* Right section - Version */}
        <div>
          <span className="px-3 py-2 text-md font-medium text-gray-200 rounded-full border border-gray-600 tracking-wide">
            VERSION 2.0v
          </span>
        </div>

      </div>
    </header>
  );
}

export default TopNavbar;
