import React from 'react';
import { AiOutlineHome, AiOutlineQuestionCircle } from 'react-icons/ai';

interface SidebarProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

// Sidebar Item Component
const SidebarItem: React.FC<{ 
  icon: React.ReactNode; 
  text: string; 
  onClick?: () => void;
  active?: boolean;
  onClose?: () => void;
}> = ({ icon, text, onClick, active, onClose }) => {
  const handleClick = () => {
    if (onClick) onClick();
    if (onClose) onClose();
  };

  return (
    <button 
      onClick={handleClick}
      className={`w-full flex items-center justify-center p-3 rounded-md hover:bg-gray-100 text-gray-700 transition-all duration-200 ${
        active ? 'bg-gray-100' : ''
      }`}
      title={text}
    >
      <span className="text-2xl">{icon}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setCurrentPage,
  isSidebarOpen,
  setIsSidebarOpen
}) => {
  const handleCloseSidebar = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white shadow-lg transition-all duration-300 ease-in-out z-40 w-20
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full flex flex-col">
          <div className="my-auto p-2" style={{ transform: 'translateY(-2rem)' }}>
            <div className="space-y-4">
              <SidebarItem 
                icon={<AiOutlineHome />} 
                text="Dashboard" 
                onClick={() => setCurrentPage('dashboard')}
                active={currentPage === 'dashboard'}
                onClose={handleCloseSidebar}
              />
              <SidebarItem 
                icon={<AiOutlineQuestionCircle />} 
                text="Help" 
                onClick={() => setCurrentPage('help')}
                active={currentPage === 'help'}
                onClose={handleCloseSidebar}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 