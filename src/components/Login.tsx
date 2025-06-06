import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // Corrected path
import logo from '../media/Black White Bold Modern Clothing Brand Logo.png';
import backgroundImage from '../media/background-image.png';

// The onGoogleLogin prop might be redundant if Login component directly uses useAuth for the action.
// However, to maintain a similar structure to App.tsx's expectation or for flexibility:
interface LoginProps {
  onGoogleLogin?: () => void; // Made optional as the component can fetch it itself
}

const Login: React.FC<LoginProps> = ({ onGoogleLogin }) => {
  const { signInWithGoogle, loading } = useAuth();

  const handleGoogleLogin = async () => {
    if (onGoogleLogin) {
      onGoogleLogin(); // Call prop if provided (e.g., for logging or additional parent logic)
    } else {
      await signInWithGoogle();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          backgroundImage: `url(${backgroundImage})`,
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      />
      <div className="login-container flex items-center justify-center min-h-screen" style={{ position: 'relative', zIndex: 1 }}>
        <div className="login-box bg-white shadow-xl rounded-lg flex overflow-hidden max-w-4xl w-full">
          <div className="login-content p-8 md:p-12 w-full md:w-1/2 flex flex-col justify-center">
            <div className="login-form text-center">
              <h1 className="text-3xl font-bold mb-4 text-gray-800">Sign In</h1>
              <p className="subtitle mb-8 text-gray-600">Sign in to your FFCS Planner account using Google</p>

              <button 
                type="button" 
                onClick={handleGoogleLogin} 
                disabled={loading}
                className="login-button w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-150 ease-in-out flex items-center justify-center shadow-md disabled:opacity-50"
              >
                {/* You can add a Google icon here */}
                <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px"><path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C39.712,36.404,44,30.798,44,24C44,22.659,43.862,21.35,43.611,20.083z"/></svg>
                {loading ? 'Signing In...' : 'Sign in with Google'}
              </button>

              <p className="terms mt-8 text-xs text-gray-500">
                By clicking continue, you agree to our <a href="#" className="underline hover:text-blue-600">Terms of Service</a> and <a href="#" className="underline hover:text-blue-600">Privacy Policy</a>
              </p>
            </div>
          </div>
          <div className="login-image hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
            {/* You can use a relevant illustration for FFCS Planner */}
            <img src={logo} alt="FFCS Planner Illustration" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 
