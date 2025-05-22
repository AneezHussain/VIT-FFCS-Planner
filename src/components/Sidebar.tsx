import React from 'react';
import { AiOutlineHome, AiOutlineTeam, AiOutlineSetting, AiOutlineQuestionCircle, AiOutlineMenu } from 'react-icons/ai';
import { BiConversation } from 'react-icons/bi';

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
}> = ({ icon, text, onClick, active }) => {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-center space-x-3 p-3 rounded-md hover:bg-gray-100 text-gray-700 transition-all duration-200 ${
        active ? 'bg-gray-100' : ''
      }`}
      title={text}
    >
      <span className="text-xl">{icon}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  setCurrentPage,
  isSidebarOpen,
  setIsSidebarOpen
}) => {
  return (
    <>
      {/* Toggle Button - Only visible on small screens */}
      <button
        className="fixed top-4 left-4 z-30 md:hidden bg-white p-2 rounded-md shadow-md"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <AiOutlineMenu size={24} />
      </button>

      {/* Overlay - Only visible on small screens when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-16 h-full bg-white shadow-md transition-transform duration-300 ease-in-out z-20 w-16
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          <div className="my-auto p-2" style={{ transform: 'translateY(-2rem)' }}>
            <div className="space-y-4">
              <SidebarItem 
                icon={<AiOutlineHome />} 
                text="Dashboard" 
                onClick={() => setCurrentPage('dashboard')}
                active={currentPage === 'dashboard'}
              />
              <SidebarItem 
                icon={<AiOutlineTeam />} 
                text="Faculty List" 
                onClick={() => setCurrentPage('faculty-list')}
                active={currentPage === 'faculty-list'}
              />
              <SidebarItem 
                icon={<BiConversation />} 
                text="Communities" 
                onClick={() => setCurrentPage('communities')}
                active={currentPage === 'communities'}
              />
              <SidebarItem 
                icon={<AiOutlineQuestionCircle />} 
                text="Help" 
                onClick={() => setCurrentPage('help')}
              />
              <SidebarItem 
                icon={<AiOutlineSetting />} 
                text="Settings" 
                onClick={() => setCurrentPage('settings')} 
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 