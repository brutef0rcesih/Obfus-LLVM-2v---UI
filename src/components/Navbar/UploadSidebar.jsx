import { Settings, Upload, ChevronRight, ChevronLeft } from 'lucide-react'
import { useState } from 'react'

function UploadSidebar({ isOpen, onToggle, activeItem = 'upload' }) {
  const [internalActiveItem, setInternalActiveItem] = useState('upload')
  
  // Use external activeItem prop if provided, otherwise use internal state
  const currentActiveItem = activeItem || internalActiveItem

  const sidebarItems = [
    {
      id: 'upload',
      label: 'Select Applications',
      icon: Upload
    },
    {
      id: 'configuration',
      label: 'Configuration',
      icon: Settings
    }
  ]

  const handleItemClick = (itemId) => {
    setInternalActiveItem(itemId)
  }

  return (
    <div className="relative">
      {/* Sidebar */}
      <div className={`bg-gray-150 border-r border-gray-300 h-full flex flex-col transition-all duration-300 ease-in-out ${
        isOpen ? 'w-44' : 'w-16'
      }`}>
        <div className={`p-6 ${!isOpen ? 'px-2' : ''}`}>
          <div className="space-y-8">
            {sidebarItems.map((item, index) => {
              const IconComponent = item.icon
              const isActive = currentActiveItem === item.id
              
              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className="flex flex-col items-center cursor-pointer transition-all duration-200 group"
                >
                  <div className={`${isOpen ? 'p-5' : 'p-3'} rounded-lg mb-3 ${
                    isActive ? 'bg-gray-300' : 'bg-gray-100 hover:bg-gray-200'
                  } border border-gray-300 shadow-sm transition-all duration-200`}>
                    <IconComponent 
                      className={`${isOpen ? 'w-8 h-8' : 'w-6 h-6'} ${
                        isActive ? 'text-gray-700' : 'text-gray-500 group-hover:text-gray-600'
                      } transition-all duration-200`} 
                    />
                  </div>
                  {isOpen && (
                    <p className={`text-xs text-center font-medium leading-tight max-w-[120px] ${
                      isActive ? 'text-gray-800' : 'text-gray-600 group-hover:text-gray-700'
                    }`}>
                      {item.label}
                    </p>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Center Toggle Arrow Button */}
      <div className={`absolute top-1/2 transform -translate-y-1/2 transition-all duration-300 ease-in-out ${
        isOpen ? 'left-40 z-10' : 'left-12 z-10'
      }`}>
        <button 
          onClick={onToggle}
          className="bg-white border border-gray-300 rounded-full p-2 shadow-md hover:bg-gray-50 hover:shadow-lg transition-all duration-200"
        >
          {isOpen ? (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          )}
        </button>
      </div>
    </div>
  )
}

export default UploadSidebar