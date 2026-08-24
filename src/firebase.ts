import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCbz-NfFeR1rka_ypv9El7y0LmUt084S34",
  authDomain: "unversty.firebaseapp.com",
  projectId: "unversty",
  storageBucket: "unversty.firebasestorage.app",
  messagingSenderId: "1015724611433",
  appId: "1:1015724611433:web:197f8475abecc3e511cff8",
  measurementId: "G-6MEFMQ2MGV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

