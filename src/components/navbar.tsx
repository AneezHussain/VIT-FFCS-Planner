import React, { useState, useRef, useEffect } from 'react';
import { AiOutlineUpload, AiOutlineUser, AiOutlineCreditCard, AiOutlineSetting, AiOutlineFileText, AiOutlineLogout, AiOutlineRight } from 'react-icons/ai';
import { useAuth } from '../contexts/AuthContext';
import { User } from 'firebase/auth';

interface NavbarProps {
  hideNavbar: boolean;
  currentPage: string;
  importButtonRef: React.RefObject<HTMLButtonElement>;
  setIsImportModalOpen: (isOpen: boolean) => void;
  user: User | null;
}

const Navbar: React.FC<NavbarProps> = ({
  hideNavbar,
  currentPage,
  importButtonRef,
  setIsImportModalOpen,
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
    <nav className={`bg-white fixed w-full z-10 ${hideNavbar ? 'hidden' : ''}`}>
      <div className="h-20 w-full px-20 flex items-center justify-between">
        <div className="flex items-center">
          <div className="text-base text-gray-600">
            <span>FFCS-Planner {'>'} </span>
            <span className="font-medium text-gray-800">
              {currentPage.charAt(0).toUpperCase() + currentPage.slice(1)}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            ref={importButtonRef}
            onClick={() => setIsImportModalOpen(true)}
            className="p-3 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
            title="Import data from CSV"
          >
            <AiOutlineUpload className="h-6 w-6" />
          </button>

          {user && (
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 transition-colors
                ${isProfileOpen ? 'ring-2 ring-offset-2 ring-black' : 'hover:ring-2 hover:ring-offset-2 hover:ring-black'}`}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="User Avatar" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <AiOutlineUser className="h-8 w-8" />
              )}
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-xl z-20 border border-gray-300 p-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="bg-white rounded-lg">
                  <div className="px-6 py-8 border-b border-gray-200">
                    <div className="flex items-center">
                      {user.photoURL ? (
                        <img src={user.photoURL} alt="User Avatar" className="h-32 w-32 rounded-full mr-8 shrink-0 object-cover" />
                      ) : (
                        <div className="h-32 w-32 rounded-full mr-8 shrink-0 bg-gray-200 flex items-center justify-center">
                          <AiOutlineUser className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                      <div>
                          <p className="text-lg font-semibold text-gray-800">{displayName}</p>
                          <p className="text-xs text-gray-500 break-all">{email}</p>
                      </div>
                    </div>
                  </div>
                  <ul>
                    <li 
                      className="flex items-center justify-center px-6 py-3 hover:bg-gray-100 cursor-pointer text-red-600"
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
    </nav>
  );
};

export default Navbar; 
