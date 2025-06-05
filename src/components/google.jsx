import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';


const firebaseConfig = {
    apiKey: "AIzaSyAy92VPpzF3vKFtw7gnvkZ38gT7lWYjXpI",
    authDomain: "mdan-ffcs.firebaseapp.com",
    projectId: "mdan-ffcs",
    storageBucket: "mdan-ffcs.firebasestorage.app",
    messagingSenderId: "530861578521",
    appId: "1:530861578521:web:2899ac8445b53484c58d88",
    measurementId: "G-BQRV6N0TJ5"
  };
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth= getAuth(app);
export const googleProvider = new GoogleAuthProvider(app);