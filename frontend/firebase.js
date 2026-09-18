import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "cipherai-f676f.firebaseapp.com",
  projectId: "cipherai-f676f",
  storageBucket: "cipherai-f676f.firebasestorage.app",
  messagingSenderId: "63214658173",
  appId: "1:63214658173:web:ecdb4454c9659a8e838714"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()