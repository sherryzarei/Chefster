// // // Import the functions you need from the SDKs you need
// // import { initializeApp, getApps, getApp } from "firebase/app";
// // import { getAuth } from "firebase/auth";
// // import { getAnalytics } from "firebase/analytics";
// // import { getFirestore } from "firebase/firestore";

// // // Your web app's Firebase configuration
// // const firebaseConfig = {
// //   apiKey: "AIzaSyDIy3L9cnWYX2UC2ovV8TV9wIBtpOwNxcQ",
// //   authDomain: "chefster-e2086.firebaseapp.com",
// //   projectId: "chefster-e2086",
// //   storageBucket: "chefster-e2086.firebasestorage.app",
// //   messagingSenderId: "835478004807",
// //   appId: "1:835478004807:web:1ed11613391bb17d4cfd62",
// //   measurementId: "G-HXN4WJ8V0Z"
// // };

// // // Initialize Firebase app
// // const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// // // Initialize Firebase services
// // const auth = getAuth(app);
// // const analytics = getAnalytics(app);
// // const db = getFirestore(app); // Firestore initialization

// // // Export the services
// // export { auth, analytics, db };

// // //IOS:  835478004807-721p58jl7pt5ns2jm28186glg366j2q6.apps.googleusercontent.com

// // //Android: 835478004807-i4fjsns58860oe4hdm7rnnsk2cpc30pk.apps.googleusercontent.com


// // // Import required Firebase SDKs
// // import { initializeApp, getApps, getApp } from "firebase/app";
// // import { getAuth } from "firebase/auth";
// // import { getAnalytics } from "firebase/analytics";
// // import { getFirestore } from "firebase/firestore";
// // import { getStorage } from "firebase/storage"; // Import Firebase Storage

// // // Firebase configuration
// // const firebaseConfig = {
// //   apiKey: "AIzaSyDIy3L9cnWYX2UC2ovV8TV9wIBtpOwNxcQ",
// //   authDomain: "chefster-e2086.firebaseapp.com",
// //   projectId: "chefster-e2086",
// //   storageBucket: "chefster-e2086.appspot.com", // Corrected Storage URL
// //   messagingSenderId: "835478004807",
// //   appId: "1:835478004807:web:1ed11613391bb17d4cfd62",
// //   measurementId: "G-HXN4WJ8V0Z"
// // };

// // // Initialize Firebase app
// // const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// // // Initialize Firebase services
// // const auth = getAuth(app);
// // const analytics = getAnalytics(app);
// // const db = getFirestore(app);
// // const storage = getStorage(app); // Initialize Firebase Storage

// // // Export Firebase services
// // export { auth, analytics, db, storage };


// import { initializeApp, getApps, getApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage"; 

// // 🔹 Your Firebase Config
// const firebaseConfig = {
//   apiKey: "AIzaSyDIy3L9cnWYX2UC2ovV8TV9wIBtpOwNxcQ",
//   authDomain: "chefster-e2086.firebaseapp.com",
//   projectId: "chefster-e2086",
//   storageBucket: "chefster-e2086.firebasestorage.app",
//   messagingSenderId: "835478004807",
//   appId: "1:835478004807:web:1ed11613391bb17d4cfd62",
//   measurementId: "G-HXN4WJ8V0Z"
// };

// // ✅ Ensure Firebase is initialized only once
// const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
// const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app); // ✅ Correctly initialize Firebase Storage

// export { auth, db, storage, app };


import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth"; // Updated import
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage"; // Import AsyncStorage

// Your Firebase Config
const firebaseConfig = {
  apiKey: "AIzaSyDIy3L9cnWYX2UC2ovV8TV9wIBtpOwNxcQ",
  authDomain: "chefster-e2086.firebaseapp.com",
  projectId: "chefster-e2086",
  storageBucket: "chefster-e2086.firebasestorage.app",
  messagingSenderId: "835478004807",
  appId: "1:835478004807:web:1ed11613391bb17d4cfd62",
  measurementId: "G-HXN4WJ8V0Z",
};

// Ensure Firebase is initialized only once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize other Firebase services
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, app };