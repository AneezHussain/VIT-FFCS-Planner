import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Analytics can be added later if needed

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyB-6RKDBNWbXrM-_BMcy6aeGjBJAEZdMq4",
  authDomain: "mdan-vit-f2csp.firebaseapp.com",
  projectId: "mdan-vit-f2csp",
  storageBucket: "mdan-vit-f2csp.firebasestorage.app",
  messagingSenderId: "907706961976",
  appId: "1:907706961976:web:58ef56c2f7b5079fb896cd",
  measurementId: "G-MPXHHVDQ6C"
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Analytics can be added later if needed
const auth: Auth = getAuth(app);

export { app, auth }; 