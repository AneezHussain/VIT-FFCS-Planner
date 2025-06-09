import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Analytics can be added later if needed

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnpWujNm_iwsULIEB_rmn4B63m5EbUBKE",
  authDomain: "mdan-vit-f2cs.firebaseapp.com",
  projectId: "mdan-vit-f2cs",
  storageBucket: "mdan-vit-f2cs.firebasestorage.app",
  messagingSenderId: "566398783399",
  appId: "1:566398783399:web:8046e6280260a499d17082",
  measurementId: "G-1LQS7LZRXC"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Analytics can be added later if needed
const auth: Auth = getAuth(app);

export { app, auth }; 