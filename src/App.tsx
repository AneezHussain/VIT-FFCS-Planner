import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  const handleLogin = (email: string, password: string) => {
    // For test credentials
    if (email === 'mohammedaneez.r2022@vitstudent.ac.in' && password === 'Password') {
      setIsAuthenticated(true);
    } else {
      // In a real app, you would handle authentication errors here
      alert('Invalid credentials. Please use the test credentials provided.');
    }
  };

  const handleSignup = (email: string, password: string) => {
    // In a real app, you would handle user registration here
    setIsAuthenticated(true);
  };

  if (isAuthenticated) {
    return (
      <div>
        <Dashboard />
      </div>
    );
  }

  return (
    <div>
      {showSignup ? (
        <Signup onSignup={handleSignup} onSwitchToLogin={() => setShowSignup(false)} />
      ) : (
        <Login onLogin={handleLogin} onSwitchToSignup={() => setShowSignup(true)} />
      )}
    </div>
  );
}

export default App; 