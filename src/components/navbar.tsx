import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineUpload, AiOutlineUser, AiOutlineCreditCard, AiOutlineSetting, AiOutlineFileText, AiOutlineLogout, AiOutlineRight } from 'react-icons/ai';
import clownAvatar from '../media/clown.png';

interface NavbarProps {
  hideNavbar: boolean;
  currentPage: string;
  importButtonRef: React.RefObject<HTMLButtonElement>;
  setIsImportModalOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({
  hideNavbar,
  currentPage,
  importButtonRef,
  setIsImportModalOpen,
  onLogout,
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className={`bg-white fixed w-full z-10 ${hideNavbar ? 'hidden' : ''}`}>
      <div className="h-20 w-full px-20 flex items-center justify-between"> {/* Changed pl-20 pr-8 to px-20 */}
        <div className="flex items-center">
          {/* Breadcrumbs */}
          <div className="text-base text-gray-600"> {/* Reduced font size from text-lg */}
            <span>FFCS-Planner {'>'} </span>
            <span className="font-medium text-gray-800"> {/* Font size will be base due to parent */}
              {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
            </span>
          </div>
        </div>

        {/* Profile Section with Import/Export/Google Drive Buttons */}
        <div className="flex items-center space-x-4"> {/* Increased spacing */}
          {/* Import Button */}
          <button
            ref={importButtonRef}
            onClick={() => setIsImportModalOpen(true)}
            className="p-3 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors" // Increased padding
            title="Import data from CSV"
          >
            <AiOutlineUpload className="h-6 w-6" /> {/* Increased icon size */}
          </button>

          {/* Profile Section - New */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => setIsProfileOpen(!isProfileOpen)} className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors">
              <img src={clownAvatar} alt="User Avatar" className="h-10 w-10 rounded-full object-cover transform scale-150" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl z-20 border border-gray-300 p-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="bg-white rounded-lg">
                  <div className="px-6 py-8 border-b border-gray-200">
                    <div className="flex items-center">
                      <img src={clownAvatar} alt="User Avatar" className="h-28 w-28 rounded-full mr-8 shrink-0 object-cover transform scale-150" />
                      <div>
                        <p className="text-lg font-semibold text-gray-800">VIT Clown</p>
                        <p className="text-xs text-gray-500 break-all">mohammedaneez.r2022@vitstudent.ac.in</p>
                      </div>
                    </div>
                  </div>
                  <ul>
                    <li 
                      className="flex items-center justify-center px-6 py-3 hover:bg-gray-100 cursor-pointer text-red-600"
                      onClick={onLogout}
                    >
                      <AiOutlineLogout className="h-5 w-5 mr-3" />
                      <span className="text-sm font-medium">Logout</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
          {/* End Profile Section - New */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 