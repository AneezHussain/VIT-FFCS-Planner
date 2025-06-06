import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';


const firebaseConfig = {
    apiKey: "AIzaSyAszymDW_XyTpQUHDtoZRJwrkboDsP0quA",
    authDomain: "mdan-ffcs-5a5dc.firebaseapp.com",
    projectId: "mdan-ffcs-5a5dc",
    storageBucket: "mdan-ffcs-5a5dc.firebasestorage.app",
    messagingSenderId: "569156191318",
    appId: "1:569156191318:web:ebe7e30bed99453aa4a7f7",
    measurementId: "G-RV0WF6H4PW"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth= getAuth(app);
export const googleProvider = new GoogleAuthProvider(app);