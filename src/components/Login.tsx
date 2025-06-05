import React from 'react';

interface LoginProps {
  onGoogleLogin: () => void;
}

const Login: React.FC<LoginProps> = ({ onGoogleLogin }) => {
  const handleGoogleLogin = () => {
    onGoogleLogin();
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-content">
          <div className="login-form">
            <h1>Sign In</h1>
            <p className="subtitle">Sign in to your Acme Inc account using Google</p>

            <button type="button" onClick={handleGoogleLogin} className="login-button">
              Sign in with Google
            </button>

            <p className="terms">
              By clicking continue, you agree to our <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a>
            </p>
          </div>
        </div>
        <div className="login-image">
          <img src="/login-illustration.svg" alt="Login illustration" />
        </div>
      </div>
    </div>
  );
};

export default Login; 