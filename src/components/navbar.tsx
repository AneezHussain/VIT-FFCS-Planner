import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineUpload, AiOutlineUser, AiOutlineCreditCard, AiOutlineSetting, AiOutlineFileText, AiOutlineLogout, AiOutlineRight, AiOutlineMenu, AiOutlineShareAlt } from 'react-icons/ai';
import { useAuth } from '../contexts/AuthContext';
import { User } from 'firebase/auth';

interface NavbarProps {
  hideNavbar: boolean;
  currentPage: string;
  importButtonRef: React.RefObject<HTMLButtonElement>;
  exportButtonRef: React.RefObject<HTMLButtonElement>;
  setIsImportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setIsExportModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isImportModalOpen: boolean;
  isExportModalOpen: boolean;
  user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({
  hideNavbar,
  currentPage,
  importButtonRef,
  exportButtonRef,
  setIsImportModalOpen,
  setIsExportModalOpen,
  isImportModalOpen,
  isExportModalOpen,
  user
}) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const { logout } = useAuth();

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

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  const displayName = user?.displayName || 'User';
  const email = user?.email || 'No email provided';

  return (
    <nav className={`bg-white fixed w-full z-50 ${hideNavbar ? 'hidden' : ''}`}>
      <div className="h-16 sm:h-20 w-full flex items-center border-b border-gray-200">
        <div className="w-full px-3 sm:px-6 md:px-8 lg:px-20 flex items-center justify-between transition-all duration-300">
          {/* Left side - Logo and Dashboard text */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <img src="/favicon.png" alt="FFCS Logo" className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12" />
            <span className="text-base sm:text-lg lg:text-xl font-semibold text-gray-800">Dashboard</span>
          </div>

          {/* Right side - Import and Profile */}
          <div className="flex items-center">
            <div className="flex items-center space-x-0.5">
              <button
                ref={importButtonRef}
                onClick={() => {
                  setIsImportModalOpen(prev => !prev)
                  setIsExportModalOpen(false)
                }}
                className={`transition-colors p-2 ${isImportModalOpen ? 'text-black' : 'text-gray-700 hover:text-gray-900'}`}
                title="Import data from CSV"
              >
                <AiOutlineUpload className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
              </button>

              <button
                ref={exportButtonRef}
                onClick={() => {
                  setIsExportModalOpen(prev => !prev)
                  setIsImportModalOpen(false)
                }}
                className={`transition-colors p-2 ${isExportModalOpen ? 'text-black' : 'text-gray-700 hover:text-gray-900'}`}
                title="Share or export data"
              >
                <AiOutlineShareAlt className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7" />
              </button>
            </div>

            {/* Add minimal spacing between share and profile */}
            <div className="w-1"></div>

            {user && (
            <div className="relative ml-2 sm:ml-3" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 transition-colors
                  ${isProfileOpen ? 'ring-2 ring-offset-2 ring-gray-700' : 'hover:ring-2 hover:ring-offset-2 hover:ring-gray-700'}`}
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt="User Avatar" className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover" />
                ) : (
                  <AiOutlineUser className="h-6 w-6 sm:h-7 sm:w-7" />
                )}
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-[280px] sm:w-96 bg-white rounded-xl shadow-xl z-20 border border-gray-300 p-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <div className="bg-white rounded-lg">
                    <div className="px-4 sm:px-6 py-6 sm:py-8 border-b border-gray-200">
                      <div className="flex items-center">
                        {user.photoURL ? (
                          <img src={user.photoURL} alt="User Avatar" className="h-24 w-24 sm:h-36 sm:w-36 rounded-full mr-6 sm:mr-8 shrink-0 object-cover" />
                        ) : (
                          <div className="h-24 w-24 sm:h-36 sm:w-36 rounded-full mr-6 sm:mr-8 shrink-0 bg-gray-200 flex items-center justify-center">
                            <AiOutlineUser className="h-12 w-12 sm:h-20 sm:w-20 text-gray-400" />
                          </div>
                        )}
                        <div>
                          <p className="text-base sm:text-lg font-semibold text-gray-800">{displayName}</p>
                          <p className="text-xs text-gray-500 break-all">{email}</p>
                        </div>
                      </div>
                    </div>
                    <ul>
                      <li 
                        className="flex items-center justify-center px-4 sm:px-6 py-3 hover:bg-gray-100 cursor-pointer text-red-600"
                        onClick={handleLogout}
                      >
                        <AiOutlineLogout className="h-5 w-5 mr-3" />
                        <span className="text-sm font-medium">Logout</span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 
