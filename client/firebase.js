import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIy3L9cnWYX2UC2ovV8TV9wIBtpOwNxcQ",
  authDomain: "chefster-e2086.firebaseapp.com",
  projectId: "chefster-e2086",
  storageBucket: "chefster-e2086.appspot.com",
  messagingSenderId: "835478004807",
  appId: "1:835478004807:web:1ed11613391bb17d4cfd62",
  measurementId: "G-HXN4WJ8V0Z"
};

// Initialize Firebase app
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth with AsyncStorage
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});

// Initialize Analytics (wrap in a check for environment support)
let analytics;
isAnalyticsSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

// Initialize Firestore and Storage
const db = getFirestore(app);
const storage = getStorage(app);

// Export Firebase services
export { auth, analytics, db, storage };
