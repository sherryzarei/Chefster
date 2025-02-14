// Import required Firebase SDKs
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIy3L9cnWYX2UC2ovV8TV9wIBtpOwNxcQ",
  authDomain: "chefster-e2086.firebaseapp.com",
  projectId: "chefster-e2086",
  storageBucket: "chefster-e2086.appspot.com", // Corrected Storage URL
  messagingSenderId: "835478004807",
  appId: "1:835478004807:web:1ed11613391bb17d4cfd62",
  measurementId: "G-HXN4WJ8V0Z"
};

// Initialize Firebase app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase services
const auth = getAuth(app);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Firebase Storage

// Export Firebase services
export { auth, analytics, db, storage };