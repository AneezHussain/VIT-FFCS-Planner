import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Analytics can be added later if needed

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const app: FirebaseApp = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app); // Analytics can be added later if needed
const auth: Auth = getAuth(app);

export { app, auth }; 