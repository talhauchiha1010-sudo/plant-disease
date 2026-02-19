// firebase-config.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
  getAuth, 
  setPersistence, 
  browserLocalPersistence 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCKSnkrRT5xC-WxbWUmm7WMyxWIBlEi4xI",
  authDomain: "plantdiseasedetection-be600.firebaseapp.com",
  projectId: "plantdiseasedetection-be600",
  storageBucket: "plantdiseasedetection-be600.firebasestorage.app",
  messagingSenderId: "985279294430",
  appId: "1:985279294430:web:d5e37008c0289f574a0b4f",
  measurementId: "G-NK1W2HCJ9Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const auth = getAuth(app);
const db = getFirestore(app);
const analytics = getAnalytics(app);

// 🔥 IMPORTANT: Ensure login persists across refresh
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Auth persistence set to LOCAL");
  })
  .catch((error) => {
    console.error("Persistence error:", error);
  });

export { auth, app, analytics, db };
