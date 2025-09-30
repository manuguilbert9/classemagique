

// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, isSupported } from "firebase/messaging";

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "classemagique2",
  "appId": "1:461454261743:web:81c2fe779d83fb487fca1a",
  "storageBucket": "classemagique2.firebasestorage.app",
  "apiKey": "AIzaSyCWxtFBSdvAGiJN06WxRLFtFZ0xGPe9E9Q",
  "authDomain": "classemagique2.firebaseapp.com",
  "messagingSenderId": "461454261743"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Firebase Cloud Messaging and get a reference to the service
const getFirebaseMessaging = async () => {
    if (typeof window !== 'undefined' && await isSupported()) {
        return getMessaging(app);
    }
    return null;
}

export { app, db, storage, getFirebaseMessaging };
