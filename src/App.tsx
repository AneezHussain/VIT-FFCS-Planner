import React, { useState, useRef } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navbar from './components/navbar';

const AppContent: React.FC = () => {
  const { currentUser, loading, logout } = useAuth();
  
  // State for Navbar props (example values, adjust as needed for actual app logic)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const importButtonRef = useRef<HTMLButtonElement>(null);
  const [currentPage, setCurrentPage] = useState('dashboard'); // Example: set current page
  const [hideNavbar, setHideNavbar] = useState(false); // Example: control navbar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div>Loading...</div> {/* Or a proper spinner component */}
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
          setIsImportModalOpen={setIsImportModalOpen}
          user={currentUser}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
        />
        <Dashboard 
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        /> 
      </>
    );
  }

  // Login component no longer needs onGoogleLogin if it uses useAuth directly
  return <Login />;
};

function App() {
  return (
    <AuthProvider>
      {/* 
        You might want to manage parts of the state like currentPage, 
        hideNavbar, isImportModalOpen at a higher level if other 
        components outside of AppContent need to interact with them, 
        or through a different context.
      */}
      <AppContent />
    </AuthProvider>
  );
}

export default App; 
