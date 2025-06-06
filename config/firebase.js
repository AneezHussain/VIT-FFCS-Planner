// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
