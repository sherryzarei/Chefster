// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getAuth, GoogleAuthProvider} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore'
import { getStorage } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDIy3L9cnWYX2UC2ovV8TV9wIBtpOwNxcQ",
  authDomain: "chefster-e2086.firebaseapp.com",
  projectId: "chefster-e2086",
  storageBucket: "chefster-e2086.firebasestorage.app",
  messagingSenderId: "835478004807",
  appId: "1:835478004807:web:1ed11613391bb17d4cfd62",
  measurementId: "G-HXN4WJ8V0Z"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
const analytics = getAnalytics(app);
export const db = getFirestore(app)
export const storage = getStorage(app); // Initialize Firebase Storage
