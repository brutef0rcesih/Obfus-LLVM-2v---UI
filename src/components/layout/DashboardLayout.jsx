import { useState } from "react";
import UploadSidebar from "../Navbar/UploadSidebar";

const DashboardLayout = ({ children, activeItem = "upload" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="h-screen bg-white flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <UploadSidebar
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
          activeItem={activeItem}
        />
        
        <div className="flex-1 overflow-auto bg-gray-50">
          {children}
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
