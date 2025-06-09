import React from 'react';
import { useAuth } from '../contexts/AuthContext'; // Corrected path

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
    <div className="relative w-screen h-screen overflow-hidden">
      <img src="/favicon.png" alt="Logo" className="absolute top-4 left-4 h-8 w-auto sm:h-12 md:h-16 z-20" />
      <div
        className="absolute top-0 left-0 w-1/2 h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/background-image.png)' }}
      />
      <div
        className="absolute top-0 right-0 w-1/2 h-full bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: 'url(/background-image.png)' }}
      />
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-white shadow-xl rounded-lg flex overflow-hidden w-[95%] max-w-4xl border-2 border-white">
          <div className="w-full md:w-1/2 p-6 sm:p-8 md:p-12 flex flex-col justify-between">
            <div className="flex-1 flex flex-col justify-center items-center">
              <div className="w-[400px] text-center">
                <div className="mt-16">
                  <p className="text-gray-600 text-base mb-3">Sign in to your F2CS Planner using Google</p>
                  <button 
                    type="button" 
                    onClick={handleGoogleLogin} 
                    disabled={loading}
                    className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-lg transition duration-150 ease-in-out flex items-center justify-center shadow-md disabled:opacity-50 text-base"
                  >
                    <svg className="w-6 h-6 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48px" height="48px">
                      <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"/>
                      <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"/>
                      <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"/>
                      <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C39.712,36.404,44,30.798,44,24C44,22.659,43.862,21.35,43.611,20.083z"/>
                    </svg>
                    {loading ? 'Signing In...' : 'Sign in with Google'}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-sm sm:text-base text-gray-600 text-center font-medium mt-8">
              By clicking continue, you agree to upgrade your planner and a better mental health.
            </p>
          </div>
          <div className="hidden md:flex md:w-1/2 items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
            <img src="/logo.png" alt="FFCS Planner Illustration" className="max-w-full h-auto" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; 
