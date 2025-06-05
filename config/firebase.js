// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);