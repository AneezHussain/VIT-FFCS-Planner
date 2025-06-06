import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';


const firebaseConfig = {
  apiKey: "AIzaSyDVK9Yxix9MViN2wFZnLbRhikXxJowA65w",
  authDomain: "mdan-vit-ffcs.firebaseapp.com",
  projectId: "mdan-vit-ffcs",
  storageBucket: "mdan-vit-ffcs.firebasestorage.app",
  messagingSenderId: "322996159777",
  appId: "1:322996159777:web:b8dddb6a26e401cc852a60",
  measurementId: "G-0KRTJZXZ0M"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth= getAuth(app);
export const googleProvider = new GoogleAuthProvider(app);