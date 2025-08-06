// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore  } from "firebase/firestore";
import { getStorage, ref, uploadBytes } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAbB1NOV4xkqUGesv2pXdhCJsNvIryw2rg",
  authDomain: "aj-snookers.firebaseapp.com",
  projectId: "aj-snookers",
  storageBucket: "aj-snookers.firebasestorage.app",
  messagingSenderId: "109436764568",
  appId: "1:109436764568:web:d336141a91978773ab2bed",
  measurementId: "G-EMX1Y5S16J"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
export { app, db, auth };