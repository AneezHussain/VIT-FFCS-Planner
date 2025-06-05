import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleGoogleLogin = () => {
    // In a real app, you would integrate Google Sign-In here
    // For now, we'll just simulate a successful login
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (isAuthenticated) {
    return (
      <div>
        <Dashboard onLogout={handleLogout} />
      </div>
    );
  }

  return (
    <div>
      <Login onGoogleLogin={handleGoogleLogin} />
    </div>
  );
}

export default App; 