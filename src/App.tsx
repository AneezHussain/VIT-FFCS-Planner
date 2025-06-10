import React, { useState, useRef, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/navbar';

const AppContent: React.FC = () => {
  const { currentUser, loading, logout } = useAuth();
  
  // State for Navbar props
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const importButtonRef = useRef<HTMLButtonElement>(null);
  const exportButtonRef = useRef<HTMLButtonElement>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [hideNavbar, setHideNavbar] = useState(false);

  useEffect(() => {
    if (currentUser) {
      (document.documentElement.style as any).zoom = '80%';
    } else {
      (document.documentElement.style as any).zoom = '100%';
    }
    // Cleanup the style when the component unmounts
    return () => {
      (document.documentElement.style as any).zoom = '100%';
    };
  }, [currentUser]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (currentUser) {
    return (
      <>
        <Navbar 
          hideNavbar={hideNavbar} 
          currentPage={currentPage} 
          importButtonRef={importButtonRef}
          exportButtonRef={exportButtonRef}
          setIsImportModalOpen={setIsImportModalOpen}
          setIsExportModalOpen={setIsExportModalOpen}
          isImportModalOpen={isImportModalOpen}
          isExportModalOpen={isExportModalOpen}
          user={currentUser}
        />
        <Dashboard 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isImportModalOpen={isImportModalOpen}
          setIsImportModalOpen={setIsImportModalOpen}
          isExportModalOpen={isExportModalOpen}
          setIsExportModalOpen={setIsExportModalOpen}
          importButtonRef={importButtonRef}
          exportButtonRef={exportButtonRef}
        /> 
      </>
    );
  }

  return <Login />;
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App; 
