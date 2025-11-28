import logoImage from "../../assets/logo.png";

function TopNavbar() {
  return (
    <header className="bg-gray-800 text-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-4">
        {/* Left section - Logo and main navigation */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center ">
            <img 
              src={logoImage} 
              alt="LLVM Obfuscator Logo" 
              className="w-8 h- rounded-lg"
            />
            <h1 className="text-lg font-medium  pl-2">OBFUS-LLVM</h1>
          </div>
       
        </div>

     
      </div>
    </header>
  );
}

export default TopNavbar;